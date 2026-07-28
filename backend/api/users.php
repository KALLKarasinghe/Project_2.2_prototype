<?php
/**
 * Users API
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/UserController.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// get data based on request method
$data = [];
if ($method === 'GET' || $method === 'DELETE') {
    $data = $_GET;
} else {
    $data = json_decode(file_get_contents("php://input"), true);
}

// create controller and handle request
$controller = new UserController($db);
$controller->handleRequest($method, 'users', $data);
