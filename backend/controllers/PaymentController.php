<?php
require_once __DIR__ . '/../models/Payment.php';

class PaymentController {
    private $paymentModel;

    public function __construct() {
        $this->paymentModel = new Payment();
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'GET') {
            $this->getPayments();
        } elseif ($method === 'POST') {
            $this->updatePayment();
        } else {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
        }
    }

    private function getPayments() {
        $order_id = $_GET['order_id'] ?? null;
        try {
            $payments = $this->paymentModel->getPayments($order_id);
            echo json_encode(["success" => true, "data" => $payments]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }

    private function updatePayment() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $payment_id = $data['payment_id'] ?? null;
        $status = $data['status'] ?? null;
        $receipt = $data['receipt_image'] ?? null;

        if (!$payment_id) {
            http_response_code(400);
            echo json_encode(["error" => "payment_id is required."]);
            exit;
        }

        try {
            if ($status) {
                $this->paymentModel->updatePaymentStatus($payment_id, $status);
            }
            if ($receipt) {
                $this->paymentModel->updatePaymentReceipt($payment_id, $receipt);
            }
            
            echo json_encode(["success" => true, "message" => "Payment updated successfully."]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }
}
