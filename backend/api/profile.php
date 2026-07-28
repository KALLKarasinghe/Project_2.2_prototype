<?php
/**
 * Profile API
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/ProfileController.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// get data based on request method
if ($method === 'GET') {
    $data = $_GET;
} else {
    $data = $_POST; // form-data for uploads
}
$files = $_FILES ?? [];

// create controller and handle request
$controller = new ProfileController($db);
$controller->handleRequest($method, $data, $files);
