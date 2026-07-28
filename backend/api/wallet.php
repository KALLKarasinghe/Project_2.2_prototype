<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../controllers/WalletController.php';

$controller = new WalletController();
$controller->handleRequest();
