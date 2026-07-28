<?php
/**
 * Notifications API
 * GET  /api/notifications.php?user_id=1 - Get notifications for user
 * POST /api/notifications.php           - Mark as read or Create notification
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/NotificationController.php';

$db = (new Database())->getConnection();
$controller = new NotificationController($db);
$controller->handleRequest();
