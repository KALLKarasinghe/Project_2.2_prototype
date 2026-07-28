<?php
class Notification {
    private $conn;
    private $table_name = "notifications";

    public function __construct($db) {
        $this->conn = $db;
    }

    // get notifications for a specific user
    public function getUserNotifications($user_id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE user_id = :uid ORDER BY created_at DESC LIMIT 50";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([':uid' => $user_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // mark a notification as read
    public function markAsRead($notification_id) {
        $query = "UPDATE " . $this->table_name . " SET is_read = 1 WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([':id' => $notification_id]);
    }

    // create a new notification
    public function createNotification($user_id, $title, $message) {
        $query = "INSERT INTO " . $this->table_name . " (user_id, title, message) VALUES (:uid, :title, :msg)";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            ':uid' => $user_id,
            ':title' => $title,
            ':msg' => $message
        ]);
    }
}
