<?php
require_once __DIR__ . '/../config/database.php';

class Subscription {
    private $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    public function activateSubscription($user_id, $plan_type) {
        $interval = '';
        if ($plan_type === 'Weekly') $interval = 'INTERVAL 1 WEEK';
        elseif ($plan_type === 'Monthly') $interval = 'INTERVAL 1 MONTH';
        elseif ($plan_type === 'Yearly') $interval = 'INTERVAL 1 YEAR';

        try {
            $this->db->beginTransaction();
            
            $stmt = $this->db->prepare("UPDATE subscriptions SET status = 'Expired' WHERE user_id = ?");
            $stmt->execute([$user_id]);

            $stmt = $this->db->prepare("INSERT INTO subscriptions (user_id, plan_type, expires_at) VALUES (?, ?, DATE_ADD(NOW(), $interval))");
            $stmt->execute([$user_id, $plan_type]);
            
            $this->db->commit();
            return true;
        } catch (PDOException $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function getLatestSubscription($user_id) {
        $stmt = $this->db->prepare("SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1");
        $stmt->execute([$user_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
