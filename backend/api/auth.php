<?php
/**
 * Auth API - Login
 * POST /api/auth.php  { name, password } or { email, password }
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

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data)) {
    http_response_code(400);
    echo json_encode(["error" => "No data provided."]);
    exit;
}

try {
    // Admin login uses name + password, others use email + password
    if (!empty($data['email'])) {
        $stmt = $db->prepare("SELECT id, legacy_id, name, email, password, role, status, phone, address FROM users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $data['email']]);
    } elseif (!empty($data['name'])) {
        $stmt = $db->prepare("SELECT id, legacy_id, name, email, password, role, status, phone, address FROM users WHERE name = :name LIMIT 1");
        $stmt->execute([':name' => $data['name']]);
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Provide 'email' or 'name' to login."]);
        exit;
    }

    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode(["error" => "User not found."]);
        exit;
    }

    // Plain-text password comparison (matching current frontend behavior)
    if ($data['password'] !== $user['password']) {
        http_response_code(401);
        echo json_encode(["error" => "Invalid password."]);
        exit;
    }

    if ($user['status'] !== 'Active') {
        http_response_code(403);
        echo json_encode(["error" => "Account is not active. Current status: " . $user['status']]);
        exit;
    }

    // Remove password from response
    unset($user['password']);
    echo json_encode(["success" => true, "user" => $user]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Server error: " . $e->getMessage()]);
}
