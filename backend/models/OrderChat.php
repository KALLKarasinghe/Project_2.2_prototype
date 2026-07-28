<?php
class OrderChat {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // get messages for an order
    public function getMessages($order_id) {
        $stmt = $this->db->prepare("
            SELECT c.*, u.name as sender_name, u.role as sender_role 
            FROM order_chats c 
            JOIN users u ON c.sender_id = u.id 
            WHERE c.order_id = :order_id 
            ORDER BY c.created_at ASC
        ");
        $stmt->execute([':order_id' => $order_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // add a new message
    public function addMessage($order_id, $sender_id, $message) {
        $stmt = $this->db->prepare("INSERT INTO order_chats (order_id, sender_id, message) VALUES (:order_id, :sender_id, :message)");
        $success = $stmt->execute([
            ':order_id' => $order_id,
            ':sender_id' => $sender_id,
            ':message' => trim($message)
        ]);

        if ($success) {
            $newId = $this->db->lastInsertId();
            $fetchStmt = $this->db->prepare("
                SELECT c.*, u.name as sender_name, u.role as sender_role 
                FROM order_chats c 
                JOIN users u ON c.sender_id = u.id 
                WHERE c.id = :id
            ");
            $fetchStmt->execute([':id' => $newId]);
            return $fetchStmt->fetch(PDO::FETCH_ASSOC);
        }
        return false;
    }
}
