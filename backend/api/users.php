<?php
/**
 * Users API
 * GET    /api/users.php              - Get all active users
 * GET    /api/users.php?status=Pending - Get pending users
 * GET    /api/users.php?role=Supplier  - Filter by role
 * GET    /api/users.php?id=5          - Get single user
 * POST   /api/users.php              - Register new user (status = Pending)
 * PUT    /api/users.php              - Update user (approve, edit)
 * DELETE /api/users.php?id=5         - Delete user
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // ─── GET ──────────────────────────────────────────────
    case 'GET':
        try {
            $sql = "SELECT id, legacy_id, name, email, role, status, phone, address, license_document, created_at FROM users WHERE 1=1";
            $params = [];

            if (!empty($_GET['id'])) {
                $sql .= " AND id = :id";
                $params[':id'] = $_GET['id'];
            }
            if (!empty($_GET['status'])) {
                $sql .= " AND status = :status";
                $params[':status'] = $_GET['status'];
            }
            if (!empty($_GET['role'])) {
                $sql .= " AND role = :role";
                $params[':role'] = $_GET['role'];
            }

            $sql .= " ORDER BY id ASC";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $users = $stmt->fetchAll();

            echo json_encode($users);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    // ─── POST (Register) ─────────────────────────────────
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['name']) || empty($data['password']) || empty($data['role'])) {
            http_response_code(400);
            echo json_encode(["error" => "name, password, and role are required."]);
            exit;
        }

        try {
            $stmt = $db->prepare("INSERT INTO users (name, email, password, role, status, phone, address, license_document) 
                                  VALUES (:name, :email, :password, :role, 'Pending', :phone, :address, :license)");
            $stmt->execute([
                ':name'     => $data['name'],
                ':email'    => $data['email'] ?? null,
                ':password' => $data['password'],
                ':role'     => $data['role'],
                ':phone'    => $data['phone'] ?? null,
                ':address'  => $data['address'] ?? null,
                ':license'  => $data['licenseDocument'] ?? null,
            ]);

            $newId = $db->lastInsertId();
            echo json_encode(["success" => true, "id" => $newId, "message" => "User registered. Pending admin approval."]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    // ─── PUT (Approve / Update) ───────────────────────────
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "User id is required."]);
            exit;
        }

        try {
            // Build dynamic update
            $fields = [];
            $params = [':id' => $data['id']];

            if (isset($data['status'])) {
                $fields[] = "status = :status";
                $params[':status'] = $data['status'];
            }
            if (isset($data['name'])) {
                $fields[] = "name = :name";
                $params[':name'] = $data['name'];
            }
            if (isset($data['email'])) {
                $fields[] = "email = :email";
                $params[':email'] = $data['email'];
            }
            if (isset($data['phone'])) {
                $fields[] = "phone = :phone";
                $params[':phone'] = $data['phone'];
            }
            if (isset($data['address'])) {
                $fields[] = "address = :address";
                $params[':address'] = $data['address'];
            }
            if (isset($data['role'])) {
                $fields[] = "role = :role";
                $params[':role'] = $data['role'];
            }

            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(["error" => "No fields to update."]);
                exit;
            }

            $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);

            echo json_encode(["success" => true, "message" => "User updated."]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    // ─── DELETE ───────────────────────────────────────────
    case 'DELETE':
        if (empty($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "User id is required as query param."]);
            exit;
        }

        try {
            $stmt = $db->prepare("DELETE FROM users WHERE id = :id");
            $stmt->execute([':id' => $_GET['id']]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(["success" => true, "message" => "User deleted."]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "User not found."]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed."]);
}
