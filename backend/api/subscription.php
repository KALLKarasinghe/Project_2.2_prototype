<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../controllers/SubscriptionController.php';

$controller = new SubscriptionController();
$controller->handleRequest();
