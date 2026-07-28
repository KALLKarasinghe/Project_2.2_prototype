<?php
/**
 * Auth Controller
 */

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Registry.php';

class AuthController {
    private $db;
    private $userModel;
    private $registryModel;

    public function __construct($dbConnection) {
        $this->db = $dbConnection;
        $this->userModel = new User($this->db);
        $this->registryModel = new Registry($this->db);
    }

    public function handleRequest($method, $action, $data, $files) {
        if ($method !== 'POST') {
            $this->sendResponse(405, ["error" => "Method not allowed. Use POST."]);
        }

        if (empty($data)) {
            $this->sendResponse(400, ["error" => "No data provided."]);
        }

        if ($action === 'register') {
            $this->register($data, $files);
        } else {
            $this->login($data);
        }
    }

    private function register($data, $files) {
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $role = $data['role'] ?? '';

        if (!$email || !$password || !$role) {
            $this->sendResponse(400, ["error" => "Email, password, and role are required."]);
        }

        if ($this->userModel->findByEmail($email)) {
            $this->sendResponse(409, ["error" => "Email already registered."]);
        }

        $uploaded_file_path = $this->handleFileUpload($role, $files);
        
        $statusInfo = $this->determineStatus($role, $data);
        if (isset($statusInfo['error'])) {
            $this->sendResponse(400, ["error" => $statusInfo['error']]);
        }

        $hashed_password = password_hash($password, PASSWORD_ARGON2ID);

        try {
            $this->db->beginTransaction();
            
            $userData = [
                'name' => $data['name'] ?? '',
                'email' => $email,
                'password' => $hashed_password,
                'role' => $role,
                'status' => $statusInfo['status'],
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'license_document' => $uploaded_file_path,
                'admin_approved' => $statusInfo['admin_approved']
            ];
            
            $this->userModel->createUser($userData);
            
            $this->db->commit();
            $this->sendResponse(200, ["success" => true, "message" => "Registration successful.", "status" => $statusInfo['status']]);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            $this->sendResponse(500, ["error" => "Registration failed: " . $e->getMessage()]);
        }
    }

    private function login($data) {
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (!$email || !$password) {
            $this->sendResponse(400, ["error" => "Email and password are required."]);
        }

        $user = $this->userModel->findByEmailOrName($email);

        if (!$user) {
            $this->sendResponse(401, ["error" => "Invalid email or password."]);
        }

        if (password_verify($password, $user['password']) || $password === $user['password']) {
            if ($user['role'] !== 'admin' && in_array(strtolower($user['status']), ['pending', 'rejected'])) {
                $msg = strtolower($user['status']) === 'pending' ? 'Account pending verification' : 'Account has been rejected';
                $this->sendResponse(403, ["error" => $msg]);
            }

            unset($user['password']);
            $this->sendResponse(200, ["success" => true, "user" => $user]);
        } else {
            $this->sendResponse(401, ["error" => "Invalid email or password."]);
        }
    }

    private function handleFileUpload($role, $files) {
        if (in_array($role, ['pharmacy', 'company', 'agent']) && isset($files['license_file']) && $files['license_file']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../../uploads/licenses/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $fileExtension = strtolower(pathinfo($files['license_file']['name'], PATHINFO_EXTENSION));
            $fileName = uniqid('license_') . '_' . time() . '.' . $fileExtension;
            $targetFilePath = $uploadDir . $fileName;

            if (move_uploaded_file($files['license_file']['tmp_name'], $targetFilePath)) {
                return 'licenses/' . $fileName;
            } else {
                $this->sendResponse(500, ["error" => "Failed to move uploaded file."]);
            }
        }
        return null;
    }

    private function determineStatus($role, $data) {
        $status = 'pending';
        $admin_approved = 0;

        if ($role === 'customer') {
            $status = 'approved';
            $admin_approved = 1;
        } else if ($role === 'pharmacy') {
            $verified = $this->registryModel->verifyPharmacy(
                $data['name'] ?? '', 
                $data['address'] ?? '', 
                $data['license_no'] ?? ''
            );
            if ($verified) {
                $status = 'Active';
                $admin_approved = 1;
            } else {
                return ['error' => "Registration Failed: Pharmacy details do not match the NMRA registry."];
            }
        } else if ($role === 'supplier') {
            $verified = $this->registryModel->verifySupplier(
                $data['name'] ?? '', 
                $data['registration_no'] ?? ''
            );
            if ($verified) {
                $status = 'Active';
                $admin_approved = 0;
            } else {
                return ['error' => "Registration Failed: Supplier details do not match the Company registry."];
            }
        } else if ($role === 'agent' || $role === 'medical agent') {
            $verified = $this->registryModel->verifyAgent(
                $data['name'] ?? '', 
                $data['registration_no'] ?? ''
            );
            if ($verified) {
                $status = 'Active';
                $admin_approved = 0;
            } else {
                return ['error' => "Registration Failed: Agent details do not match the SLMC registry."];
            }
        }

        return ['status' => $status, 'admin_approved' => $admin_approved];
    }

    private function sendResponse($code, $data) {
        http_response_code($code);
        echo json_encode($data);
        exit;
    }
}
