<?php
/**
 * Admin Statistics API
 * GET /api/admin_stats.php - Get counts for active users, orders, and medicines
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../controllers/AdminController.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $controller = new AdminController();
    $controller->getStats();
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Use GET."]);
}
?>
