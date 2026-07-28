<?php
/**
 * Admin Verify API
 * GET  /api/admin_verify.php - Fetch pending pharmacy, company, and agent users with details
 * POST /api/admin_verify.php - Approve or reject a user (JSON: { "user_id": 1, "action": "approve"|"reject" })
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../controllers/AdminController.php';

$method = $_SERVER['REQUEST_METHOD'];
$controller = new AdminController();

if ($method === 'GET') {
    $controller->getPendingUsers();
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $controller->verifyUser($data);
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Use GET or POST."]);
}
?>
