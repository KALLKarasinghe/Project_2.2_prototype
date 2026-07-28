<?php
/**
 * UserController
 */
require_once __DIR__ . '/../models/User.php';

class UserController {
    private $userModel;

    public function __construct($db) {
        $this->userModel = new User($db);
    }

    // main handler for the requests
    public function handleRequest($method, $action, $data = []) {
        if ($action === 'forgot_password') {
            return $this->forgotPassword($method, $data);
        }

        switch ($method) {
            case 'GET':
                return $this->getUsers($data);
            case 'POST':
                return $this->registerUser($data);
            case 'PUT':
                return $this->updateUser($data);
            case 'DELETE':
                return $this->deleteUser($data);
            default:
                http_response_code(405);
                echo json_encode(["error" => "Method not allowed."]);
                break;
        }
    }

    // get users
    private function getUsers($data) {
        try {
            $users = $this->userModel->getAllUsers($data);
            echo json_encode($users);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    // register user
    private function registerUser($data) {
        if (empty($data['name']) || empty($data['password']) || empty($data['role'])) {
            http_response_code(400);
            echo json_encode(["error" => "name, password, and role are required."]);
            return;
        }

        try {
            $newId = $this->userModel->registerPendingUser($data);
            echo json_encode(["success" => true, "id" => $newId, "message" => "User registered. Pending admin approval."]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    // update user
    private function updateUser($data) {
        if (empty($data['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "User id is required."]);
            return;
        }

        try {
            $updated = $this->userModel->updateUser($data['id'], $data);
            if ($updated) {
                echo json_encode(["success" => true, "message" => "User updated."]);
            } else {
                http_response_code(400);
                echo json_encode(["error" => "No fields to update."]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    // delete user
    private function deleteUser($data) {
        if (empty($data['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "User id is required as query param."]);
            return;
        }

        try {
            $deleted = $this->userModel->deleteUser($data['id']);
            if ($deleted) {
                echo json_encode(["success" => true, "message" => "User deleted."]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "User not found."]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    // forgot password logic
    private function forgotPassword($method, $data) {
        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed. Use POST."]);
            return;
        }

        $email = $data['email'] ?? '';
        $new_password = $data['new_password'] ?? '';

        if (!$email || !$new_password) {
            http_response_code(400);
            echo json_encode(["error" => "Email and new password are required."]);
            return;
        }

        try {
            // check if email exists
            $user = $this->userModel->findByEmail($email);
            if (!$user) {
                http_response_code(404);
                echo json_encode(["error" => "Email not found in our system."]);
                return;
            }

            // update password
            $this->userModel->updatePasswordByEmail($email, $new_password);
            echo json_encode(["success" => true, "message" => "Password reset successfully!"]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }
}
