<?php
require_once __DIR__ . '/../models/Setting.php';
require_once __DIR__ . '/../models/Notification.php';

class SettingsController {
    private $settingModel;
    private $notificationModel;

    public function __construct($db) {
        $this->settingModel = new Setting($db);
        $this->notificationModel = new Notification($db);
    }

    // handle API request
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'GET') {
            $this->getSettings();
        } elseif ($method === 'POST') {
            $this->updateSettings();
        } else {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed."]);
        }
    }

    // get current settings
    private function getSettings() {
        try {
            $rate = $this->settingModel->getCommissionRate();
            echo json_encode(["success" => true, "commission_rate" => $rate]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }

    // update settings and notify suppliers
    private function updateSettings() {
        $data = json_decode(file_get_contents("php://input"), true);
        $rate = $data['commission_rate'] ?? null;

        // validate commission rate
        if ($rate === null || !is_numeric($rate)) {
            http_response_code(400);
            echo json_encode(["error" => "Valid commission rate is required."]);
            exit;
        }

        try {
            $this->settingModel->updateCommissionRate($rate);
            
            // notify all suppliers about the change
            $suppliers = $this->settingModel->getSuppliersToNotify();
            $title = 'Platform Notice';
            $msg = "The platform sales commission rate has been updated to {$rate}%.";

            foreach ($suppliers as $sup) {
                $this->notificationModel->createNotification($sup['id'], $title, $msg);
            }

            echo json_encode(["success" => true, "message" => "Commission rate updated."]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }
}
