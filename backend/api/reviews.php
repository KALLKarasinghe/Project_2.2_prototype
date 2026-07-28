<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/ReviewController.php';

$db = (new Database())->getConnection();
$controller = new ReviewController($db);
$controller->handleRequest();
