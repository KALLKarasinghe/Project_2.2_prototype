<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/SettingsController.php';

$db = (new Database())->getConnection();
$controller = new SettingsController($db);
$controller->handleRequest();
