<?php
/**
 * Notifications API
 * GET  /api/notifications.php?user_id=1 - Get notifications for user
 * POST /api/notifications.php           - Mark as read or Create notification
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $user_id = $_GET['user_id'] ?? null;
    if (!$user_id) {
        http_response_code(400);
        echo json_encode(["error" => "user_id is required"]);
        exit;
    }

    try {
        $stmt = $db->prepare("SELECT * FROM notifications WHERE user_id = :uid ORDER BY created_at DESC LIMIT 50");
        $stmt->execute([':uid' => $user_id]);
        $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $notifications]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $action = $data['action'] ?? '';

    try {
        if ($action === 'mark_read') {
            $notification_id = $data['notification_id'] ?? null;
            if (!$notification_id) {
                http_response_code(400);
                echo json_encode(["error" => "notification_id is required"]);
                exit;
            }
            $stmt = $db->prepare("UPDATE notifications SET is_read = 1 WHERE id = :id");
            $stmt->execute([':id' => $notification_id]);
            echo json_encode(["success" => true]);
        } elseif ($action === 'create') {
            // Internal or system creating notification
            $user_id = $data['user_id'] ?? null;
            $title = $data['title'] ?? '';
            $message = $data['message'] ?? '';
            
            if (!$user_id || !$title || !$message) {
                http_response_code(400);
                echo json_encode(["error" => "user_id, title, message are required"]);
                exit;
            }
            $stmt = $db->prepare("INSERT INTO notifications (user_id, title, message) VALUES (:uid, :title, :msg)");
            $stmt->execute([':uid' => $user_id, ':title' => $title, ':msg' => $message]);
            echo json_encode(["success" => true]);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Invalid action"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
