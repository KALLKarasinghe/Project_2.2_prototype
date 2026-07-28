<?php
require_once __DIR__ . '/../models/Order.php';

class OrderController {
    private $db;
    private $orderModel;

    public function __construct($db) {
        $this->db = $db;
        $this->orderModel = new Order($db);
    }

    public function handleRequest($method) {
        switch ($method) {
            case 'GET':
                $this->getOrders();
                break;
            case 'POST':
                $this->placeOrder();
                break;
            case 'PUT':
            case 'PATCH':
                $this->updateOrder();
                break;
            case 'DELETE':
                http_response_code(405);
                echo json_encode(["error" => "Deleting orders is not allowed. Please cancel instead."]);
                break;
            default:
                http_response_code(405);
                echo json_encode(["error" => "Method not allowed."]);
        }
    }

    private function getOrders() {
        $role = strtolower($_GET['role'] ?? '');
        $user_id = $_GET['user_id'] ?? null;

        if (!$role || !$user_id) {
            http_response_code(400);
            echo json_encode(["error" => "role and user_id are required."]);
            return;
        }

        try {
            $orders = [];
            if ($role === 'pharmacy') {
                $orders = $this->orderModel->getPharmacyOrders($user_id);
            } else if ($role === 'supplier') {
                $orders = $this->orderModel->getSupplierOrders($user_id);
            } else {
                http_response_code(400);
                echo json_encode(["error" => "Invalid role. Must be 'pharmacy' or 'supplier'."]);
                return;
            }

            // Format to match frontend nested expectations
            $formatted_orders = [];
            foreach ($orders as $order) {
                $qty = (int) $order['quantity'];
                $price = isset($order['price']) ? (float) $order['price'] : 0;
                $total_amount = $qty * $price;

                $formatted_orders[] = [
                    "id" => $order['id'],
                    "pharmacy_id" => $order['pharmacy_id'],
                    "supplier_id" => $order['company_id'] ?? null,
                    "medicine_id" => $order['medicine_id'],
                    "status" => $order['status'],
                    "created_at" => $order['created_at'],
                    "transaction_id" => isset($order['transaction_id']) ? $order['transaction_id'] : null,
                    "company_name" => isset($order['company_name']) ? $order['company_name'] : (isset($order['pharmacy_name']) ? $order['pharmacy_name'] : 'Unknown'),
                    "total_amount" => $total_amount,
                    "payment_status" => $order['payment_status'] ?? 'N/A',
                    "payment_method" => $order['payment_method'] ?? 'N/A',
                    "items" => [
                        [
                            "generic_name" => $order['medicine_name'],
                            "brand_name" => $order['brand'],
                            "quantity" => $qty,
                            "price_per_unit" => $price
                        ]
                    ]
                ];
            }

            echo json_encode(["success" => true, "data" => $formatted_orders]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }

    private function placeOrder() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $role = strtolower($data['role'] ?? '');
        if ($role !== 'pharmacy') {
            http_response_code(403);
            echo json_encode(['error' => 'Only registered pharmacies can place direct orders from companies']);
            return;
        }

        $pharmacy_id = $data['pharmacy_id'] ?? null;
        $cart_items = $data['cart_items'] ?? [];

        if (!$pharmacy_id || empty($cart_items)) {
            http_response_code(400);
            echo json_encode(["error" => "pharmacy_id and cart_items are required."]);
            return;
        }

        try {
            $order_ids = $this->orderModel->placeOrders($pharmacy_id, $cart_items);
            echo json_encode(["success" => true, "order_ids" => $order_ids, "message" => "Order placed successfully."]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    private function updateOrder() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $order_id = $data['order_id'] ?? null;
        $status = $data['status'] ?? null;
        $role = strtolower($data['role'] ?? ''); 

        if (!$order_id || !$status || !$role) {
            http_response_code(400);
            echo json_encode(["error" => "order_id, status, and role are required."]);
            return;
        }

        $statusMap = [
            'pending' => 'Pending',
            'confirmed' => 'Approved',
            'approved' => 'Approved',
            'shipped' => 'Delivered',
            'delivered' => 'Delivered',
            'cancelled' => 'Rejected',
            'rejected' => 'Rejected'
        ];
        $dbStatus = $statusMap[strtolower($status)] ?? ucfirst($status);

        try {
            $order = $this->orderModel->getOrderById($order_id);

            if (!$order) {
                http_response_code(404);
                echo json_encode(["error" => "Order not found."]);
                return;
            }

            // Role-based validation
            if ($role === 'pharmacy') {
                if (strtolower($status) !== 'cancelled' && strtolower($status) !== 'rejected') {
                    http_response_code(403);
                    echo json_encode(["error" => "Pharmacy can only cancel orders."]);
                    return;
                }
                if ($order['status'] !== 'Pending') {
                    http_response_code(400);
                    echo json_encode(["error" => "Pharmacy can only cancel 'Pending' orders."]);
                    return;
                }
            }

            $this->orderModel->updateOrderStatus($order_id, $dbStatus, $order);
            echo json_encode(["success" => true, "message" => "Order status updated to $dbStatus."]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }
}
