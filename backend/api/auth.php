<?php
/**
 * Auth API - Login & Registration
 * POST /api/auth.php?action=login
 * POST /api/auth.php?action=register
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Use POST."]);
    exit;
}

$action = $_GET['action'] ?? 'login'; // Default to login if action is not provided

// Support both JSON and multipart/form-data
$contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
if (strpos($contentType, 'application/json') !== false) {
    $data = json_decode(file_get_contents("php://input"), true);
} else {
    $data = $_POST;
}

if (empty($data)) {
    http_response_code(400);
    echo json_encode(["error" => "No data provided."]);
    exit;
}

try {
    if ($action === 'register') {
        // --- Registration Logic ---
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $role = $data['role'] ?? '';

        if (!$email || !$password || !$role) {
            http_response_code(400);
            echo json_encode(["error" => "Email, password, and role are required."]);
            exit;
        }

        // Check if email already exists
        $stmt = $db->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->execute([':email' => $email]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(["error" => "Email already registered."]);
            exit;
        }

        // Handle File Upload for specific roles
        $uploaded_file_path = null;
        if (in_array($role, ['pharmacy', 'company', 'agent']) && isset($_FILES['license_file']) && $_FILES['license_file']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../uploads/licenses/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $fileExtension = strtolower(pathinfo($_FILES['license_file']['name'], PATHINFO_EXTENSION));
            $fileName = uniqid('license_') . '_' . time() . '.' . $fileExtension;
            $targetFilePath = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES['license_file']['tmp_name'], $targetFilePath)) {
                $uploaded_file_path = 'licenses/' . $fileName; // stored as licenses/filename.ext or uploads/licenses/...
                // The AdminDashboard expects "uploads/..." or just the path inside uploads. 
                // Wait, AdminDashboard links to: `uploads/${user.license_file_path}`
                // So if we save 'licenses/filename.ext', the link will be 'uploads/licenses/filename.ext'. This is perfect.
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Failed to move uploaded file."]);
                exit;
            }
        }

        // Default status: customers are automatically approved, others are pending
        $status = ($role === 'customer') ? 'approved' : 'pending';

        // Hash the password securely using Argon2id
        $hashed_password = password_hash($password, PASSWORD_ARGON2ID);

        // Start transaction to ensure both user and details are inserted together
        $db->beginTransaction();

        // 1. Insert into main users table
        $stmt = $db->prepare("INSERT INTO users (name, email, password, role, status, phone, address, license_document) VALUES (:name, :email, :password, :role, :status, :phone, :address, :license_document)");
        $stmt->execute([
            ':name' => $data['name'] ?? '',
            ':email' => $email,
            ':password' => $hashed_password,
            ':role' => $role,
            ':status' => $status,
            ':phone' => $data['phone'] ?? null,
            ':address' => $data['address'] ?? null,
            ':license_document' => $uploaded_file_path
        ]);
        
        $db->commit();
        echo json_encode(["success" => true, "message" => "Registration successful.", "status" => $status]);

    } else {
        // --- Login Logic ---
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (!$email || !$password) {
            http_response_code(400);
            echo json_encode(["error" => "Email and password are required."]);
            exit;
        }

        // Verify the email or name against the users table
        $stmt = $db->prepare("SELECT id, name, email, password, role, status FROM users WHERE email = :email OR name = :name LIMIT 1");
        $stmt->execute([':email' => $email, ':name' => $email]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(401);
            echo json_encode(["error" => "Invalid email or password."]);
            exit;
        }

        // Verify password (supports both new password_hash and legacy plain text)
        if (password_verify($password, $user['password']) || $password === $user['password']) {
            
            // Restrict login access based on status, unless admin
            if ($user['role'] !== 'admin' && in_array(strtolower($user['status']), ['pending', 'rejected'])) {
                http_response_code(403);
                $msg = strtolower($user['status']) === 'pending' ? 'Account pending verification' : 'Account has been rejected';
                echo json_encode(["error" => $msg]);
                exit;
            }

            unset($user['password']); // Do not send password back
            echo json_encode(["success" => true, "user" => $user]);

        } else {
            http_response_code(401);
            echo json_encode(["error" => "Invalid email or password."]);
            exit;
        }
    }

} catch (PDOException $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(["error" => "Server error: " . $e->getMessage()]);
}
