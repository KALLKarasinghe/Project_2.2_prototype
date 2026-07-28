<?php
/**
 * Checkout API
 * POST /api/checkout.php
 * Accepts: { "user_id": 5, "transaction_id": "tx123", "payment_method": "PayHere", "amount": 1200.00, "receipt_image": "base64..." }
 * Action: Converts user_cart items to real orders, saves payment record, and clears the cart.
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/CheckoutController.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

$controller = new CheckoutController($db);
$controller->handleRequest($method);
