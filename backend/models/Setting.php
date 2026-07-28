<?php
class Setting {
    private $conn;
    private $table_name = "settings";

    public function __construct($db) {
        $this->conn = $db;
    }

    // get commission rate from settings
    public function getCommissionRate() {
        $query = "SELECT setting_value FROM " . $this->table_name . " WHERE setting_key = 'commission_rate'";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            return (float)$result['setting_value'];
        }
        return 1.0;
    }

    // update the commission rate
    public function updateCommissionRate($rate) {
        $query = "UPDATE " . $this->table_name . " SET setting_value = :val WHERE setting_key = 'commission_rate'";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([':val' => (string)$rate]);
    }

    // get suppliers and companies to notify
    public function getSuppliersToNotify() {
        $query = "SELECT id FROM users WHERE role = 'Company' OR role = 'Supplier'";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
