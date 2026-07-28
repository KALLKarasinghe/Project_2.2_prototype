<?php
/**
 * Auth API - Login & Registration (OOP Refactored)
 * POST /api/auth.php?action=login
 * POST /api/auth.php?action=register
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/AuthController.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'login';

$contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
if (strpos($contentType, 'application/json') !== false) {
    $data = json_decode(file_get_contents("php://input"), true);
} else {
    $data = $_POST;
}
$files = $_FILES ?? [];

$controller = new AuthController($db);
$controller->handleRequest($method, $action, $data, $files);
