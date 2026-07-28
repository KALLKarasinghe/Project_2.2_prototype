<?php
/**
 * User Model
 */

class User {
    private $db;

    public function __construct($dbConnection) {
        $this->db = $dbConnection;
    }

    public function findByEmail($email) {
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->execute([':email' => $email]);
        return $stmt->fetch();
    }

    public function findByEmailOrName($identifier) {
        $stmt = $this->db->prepare("SELECT id, name, email, password, role, status, admin_approved FROM users WHERE email = :identifier OR name = :identifier LIMIT 1");
        $stmt->execute([':identifier' => $identifier]);
        return $stmt->fetch();
    }

    public function createUser($data) {
        $stmt = $this->db->prepare("INSERT INTO users (name, email, password, role, status, phone, address, license_document, admin_approved) VALUES (:name, :email, :password, :role, :status, :phone, :address, :license_document, :admin_approved)");
        $stmt->execute([
            ':name' => $data['name'] ?? '',
            ':email' => $data['email'],
            ':password' => $data['password'],
            ':role' => $data['role'],
            ':status' => $data['status'],
            ':phone' => $data['phone'] ?? null,
            ':address' => $data['address'] ?? null,
            ':license_document' => $data['license_document'] ?? null,
            ':admin_approved' => $data['admin_approved']
        ]);
        return $this->db->lastInsertId();
    }

    // get all users with filters
    public function getAllUsers($filters = []) {
        $sql = "SELECT id, legacy_id, name, email, role, status, phone, address, license_document, created_at FROM users WHERE 1=1";
        $params = [];

        if (!empty($filters['id'])) {
            $sql .= " AND id = :id";
            $params[':id'] = $filters['id'];
        }
        if (!empty($filters['status'])) {
            $sql .= " AND status = :status";
            $params[':status'] = $filters['status'];
        }
        if (!empty($filters['role'])) {
            $sql .= " AND role = :role";
            $params[':role'] = $filters['role'];
        }

        $sql .= " ORDER BY id ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // get user by id
    public function getUserById($id) {
        $stmt = $this->db->prepare("SELECT id, name, email, role, status, phone, address, profile_pic, bank_details, created_at FROM users WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // register pending user
    public function registerPendingUser($data) {
        $stmt = $this->db->prepare("INSERT INTO users (name, email, password, role, status, phone, address, license_document) 
                                    VALUES (:name, :email, :password, :role, 'Pending', :phone, :address, :license)");
        $stmt->execute([
            ':name'     => $data['name'],
            ':email'    => $data['email'] ?? null,
            ':password' => password_hash($data['password'], PASSWORD_ARGON2ID),
            ':role'     => $data['role'],
            ':phone'    => $data['phone'] ?? null,
            ':address'  => $data['address'] ?? null,
            ':license'  => $data['licenseDocument'] ?? null,
        ]);
        return $this->db->lastInsertId();
    }

    // update user fields
    public function updateUser($id, $data) {
        $fields = [];
        $params = [':id' => $id];

        $allowedFields = ['status', 'name', 'email', 'phone', 'address', 'role', 'bank_details', 'profile_pic'];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return true;
    }

    // delete user
    public function deleteUser($id) {
        $stmt = $this->db->prepare("DELETE FROM users WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }

    // update password
    public function updatePasswordByEmail($email, $newPassword) {
        $hash = password_hash($newPassword, PASSWORD_ARGON2ID);
        $stmt = $this->db->prepare("UPDATE users SET password = :hash WHERE email = :email");
        $stmt->execute([':hash' => $hash, ':email' => $email]);
    }
}
