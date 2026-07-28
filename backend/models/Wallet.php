<?php
require_once __DIR__ . '/../config/database.php';

class Wallet {
    private $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    public function getDeliveredOrdersBySupplier($supplier_id) {
        $stmt = $this->db->prepare("
            SELECT o.id as order_id, o.quantity, i.price, o.created_at
            FROM orders o
            JOIN products pr ON o.product_id = pr.id
            JOIN inventory i ON pr.id = i.product_id
            WHERE pr.supplier_id = :supplier_id AND o.status = 'Delivered'
            ORDER BY o.created_at DESC
        ");
        $stmt->execute([':supplier_id' => $supplier_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getWithdrawalsBySupplier($supplier_id) {
        $stmt = $this->db->prepare("
            SELECT id, amount, status, created_at, bank_details
            FROM withdrawals
            WHERE supplier_id = :supplier_id
            ORDER BY created_at DESC
        ");
        $stmt->execute([':supplier_id' => $supplier_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createWithdrawal($supplier_id, $amount, $bank_details) {
        $stmt = $this->db->prepare("INSERT INTO withdrawals (supplier_id, amount, bank_details) VALUES (:supplier_id, :amount, :bank_details)");
        return $stmt->execute([
            ':supplier_id' => $supplier_id,
            ':amount' => $amount,
            ':bank_details' => $bank_details
        ]);
    }
}
