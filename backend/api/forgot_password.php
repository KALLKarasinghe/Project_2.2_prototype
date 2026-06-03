<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Use POST."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';
$new_password = $data['new_password'] ?? '';

if (!$email || !$new_password) {
    http_response_code(400);
    echo json_encode(["error" => "Email and new password are required."]);
    exit;
}

try {
    $db = (new Database())->getConnection();
    
    // Check if email exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(["error" => "Email not found in our system."]);
        exit;
    }

    // Update password
    $hash = password_hash($new_password, PASSWORD_ARGON2ID);
    $upd = $db->prepare("UPDATE users SET password = :hash WHERE email = :email");
    $upd->execute([':hash' => $hash, ':email' => $email]);

    echo json_encode(["success" => true, "message" => "Password reset successfully!"]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
