<?php
/**
 * Admin Logs API
 * GET /api/admin_logs.php - Get recent orders for admin dashboard
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../controllers/AdminController.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $controller = new AdminController();
    $controller->getLogs();
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Use GET."]);
}
?>
