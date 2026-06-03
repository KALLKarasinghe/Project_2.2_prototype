<?php
/**
 * Payments API
 * GET  /api/payments.php?order_id=5
 * POST /api/payments.php (For bank transfer receipt upload)
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $order_id = $_GET['order_id'] ?? null;
    try {
        $sql = "SELECT p.*, o.pharmacy_id, u.name as pharmacy_name 
                FROM payments p
                JOIN orders o ON p.order_id = o.id
                JOIN users u ON o.pharmacy_id = u.id";
        
        if ($order_id) {
            $sql .= " WHERE p.order_id = :oid";
            $stmt = $db->prepare($sql);
            $stmt->execute([':oid' => $order_id]);
        } else {
            $sql .= " ORDER BY p.created_at DESC";
            $stmt = $db->prepare($sql);
            $stmt->execute();
        }
        
        echo json_encode(["success" => true, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    // For updating a payment status or adding a receipt
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
            $stmt = $db->prepare("UPDATE payments SET status = :status WHERE id = :pid");
            $stmt->execute([':status' => $status, ':pid' => $payment_id]);
        }
        if ($receipt) {
            $stmt = $db->prepare("UPDATE payments SET receipt_image = :receipt WHERE id = :pid");
            $stmt->execute([':receipt' => $receipt, ':pid' => $payment_id]);
        }
        
        echo json_encode(["success" => true, "message" => "Payment updated successfully."]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
