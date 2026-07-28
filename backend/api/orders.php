<?php
/**
 * Orders API
 * Adapted for flat orders table: id, product_id, pharmacy_id, quantity, status
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/OrderController.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

$controller = new OrderController($db);
$controller->handleRequest($method);
