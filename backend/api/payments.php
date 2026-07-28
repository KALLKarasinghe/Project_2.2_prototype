<?php
/**
 * Payments API
 * GET  /api/payments.php?order_id=5
 * POST /api/payments.php (For bank transfer receipt upload)
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../controllers/PaymentController.php';

$controller = new PaymentController();
$controller->handleRequest();
