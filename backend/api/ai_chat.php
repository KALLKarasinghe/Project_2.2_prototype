<?php
// Disable HTML error output to prevent breaking JSON responses
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

require_once '../config/cors.php';

// Set up a custom error handler
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "PHP Error: $errstr in $errfile on line $errline"
    ]);
    exit;
});

set_exception_handler(function($e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Uncaught Exception",
        "details" => $e->getMessage()
    ]);
    exit;
});

require_once '../controllers/AIController.php';

// Safely get and decode POST data
$rawData = file_get_contents("php://input");
$inputData = json_decode($rawData);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Invalid JSON payload received",
        "details" => json_last_error_msg()
    ]);
    exit;
}

$controller = new AIController();
$controller->handleChat($inputData);
?>
