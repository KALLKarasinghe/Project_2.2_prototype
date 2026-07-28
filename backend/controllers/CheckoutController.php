<?php
require_once __DIR__ . '/../models/Order.php';

class CheckoutController {
    private $db;
    private $orderModel;

    public function __construct($db) {
        $this->db = $db;
        $this->orderModel = new Order($db);
    }

    public function handleRequest($method) {
        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed. Use POST."]);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $user_id = $data['user_id'] ?? null;
        $transaction_id = $data['transaction_id'] ?? null;
        $payment_method = $data['payment_method'] ?? 'PayHere';
        $receipt_image = $data['receipt_image'] ?? null;

        if (!$user_id) {
            http_response_code(400);
            echo json_encode(["error" => "user_id is required."]);
            return;
        }

        try {
            $success = $this->orderModel->processCheckout($user_id, $payment_method, $receipt_image);

            if ($success) {
                echo json_encode([
                    "success" => true,
                    "message" => "Order placed successfully!"
                ]);
            } else {
                echo json_encode(["error" => "Cart is empty."]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }
}
