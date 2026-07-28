<?php
/**
 * Forgot Password API
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/UserController.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// decode json data
$data = json_decode(file_get_contents("php://input"), true);

// create controller and handle request
$controller = new UserController($db);
$controller->handleRequest($method, 'forgot_password', $data);
