<?php
require_once __DIR__ . '/../config/database.php';

class Payment {
    private $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    public function getPayments($order_id = null) {
        $sql = "SELECT p.*, o.pharmacy_id, u.name as pharmacy_name 
                FROM payments p
                JOIN orders o ON p.order_id = o.id
                JOIN users u ON o.pharmacy_id = u.id";
        
        if ($order_id) {
            $sql .= " WHERE p.order_id = :oid";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':oid' => $order_id]);
        } else {
            $sql .= " ORDER BY p.created_at DESC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
        }
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updatePaymentStatus($payment_id, $status) {
        $stmt = $this->db->prepare("UPDATE payments SET status = :status WHERE id = :pid");
        return $stmt->execute([':status' => $status, ':pid' => $payment_id]);
    }

    public function updatePaymentReceipt($payment_id, $receipt) {
        $stmt = $this->db->prepare("UPDATE payments SET receipt_image = :receipt WHERE id = :pid");
        return $stmt->execute([':receipt' => $receipt, ':pid' => $payment_id]);
    }
}
