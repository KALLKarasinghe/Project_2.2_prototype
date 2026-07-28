<?php
require_once __DIR__ . '/../models/Subscription.php';

class SubscriptionController {
    private $subscriptionModel;

    public function __construct() {
        $this->subscriptionModel = new Subscription();
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'POST') {
            $this->activateSubscription();
        } elseif ($method === 'GET') {
            $this->getSubscription();
        } else {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
        }
    }

    private function activateSubscription() {
        $data = json_decode(file_get_contents("php://input"), true);
        $user_id = $data['user_id'] ?? null;
        $plan_type = $data['plan_type'] ?? null;

        if (!$user_id || !in_array($plan_type, ['Weekly', 'Monthly', 'Yearly'])) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid subscription data."]);
            exit;
        }

        try {
            $this->subscriptionModel->activateSubscription($user_id, $plan_type);
            echo json_encode(["success" => true, "message" => "Subscription activated successfully!"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database Error: " . $e->getMessage()]);
        }
    }

    private function getSubscription() {
        $user_id = $_GET['user_id'] ?? null;
        if (!$user_id) {
            http_response_code(400);
            echo json_encode(["error" => "user_id is required."]);
            exit;
        }
        
        try {
            $sub = $this->subscriptionModel->getLatestSubscription($user_id);
            echo json_encode(["success" => true, "data" => $sub ?: null]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database Error: " . $e->getMessage()]);
        }
    }
}
