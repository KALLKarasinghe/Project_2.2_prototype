<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/OrderChatController.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

$controller = new OrderChatController($db);
$controller->handleRequest($method);
