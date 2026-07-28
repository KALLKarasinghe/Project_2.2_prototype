<?php
require_once __DIR__ . '/../models/Notification.php';

class NotificationController {
    private $notificationModel;

    public function __construct($db) {
        $this->notificationModel = new Notification($db);
    }

    // handle API request
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'GET') {
            $this->getNotifications();
        } elseif ($method === 'POST') {
            $this->processAction();
        } else {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
        }
    }

    // get notifications for user
    private function getNotifications() {
        $user_id = $_GET['user_id'] ?? null;
        
        // validate user id
        if (!$user_id) {
            http_response_code(400);
            echo json_encode(["error" => "user_id is required"]);
            exit;
        }

        try {
            $notifications = $this->notificationModel->getUserNotifications($user_id);
            echo json_encode(["success" => true, "data" => $notifications]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }

    // process notification actions like mark as read or create
    private function processAction() {
        $data = json_decode(file_get_contents("php://input"), true);
        $action = $data['action'] ?? '';

        try {
            if ($action === 'mark_read') {
                $notification_id = $data['notification_id'] ?? null;
                
                // validate notification id
                if (!$notification_id) {
                    http_response_code(400);
                    echo json_encode(["error" => "notification_id is required"]);
                    exit;
                }
                
                $this->notificationModel->markAsRead($notification_id);
                echo json_encode(["success" => true]);
                
            } elseif ($action === 'create') {
                $user_id = $data['user_id'] ?? null;
                $title = $data['title'] ?? '';
                $message = $data['message'] ?? '';
                
                // validate input
                if (!$user_id || !$title || !$message) {
                    http_response_code(400);
                    echo json_encode(["error" => "user_id, title, message are required"]);
                    exit;
                }
                
                $this->notificationModel->createNotification($user_id, $title, $message);
                echo json_encode(["success" => true]);
                
            } else {
                http_response_code(400);
                echo json_encode(["error" => "Invalid action"]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }
}
