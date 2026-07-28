<?php
require_once __DIR__ . '/../../config/database.php';

class SpecialMedicine {
    private $db;

    public function __construct() {
        $this->db = (new Database())->getConnection();
    }

    // get all special medicines
    public function getAll() {
        $stmt = $this->db->query("SELECT id, legacy_id, name, used_for AS usedFor, agent_name AS agentName, agent_phone AS agentPhone FROM special_medicines ORDER BY id ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // add a new special medicine
    public function addSpecialMedicine($name, $usedFor, $agentName, $agentPhone) {
        $stmt = $this->db->prepare("INSERT INTO special_medicines (name, used_for, agent_name, agent_phone) 
                                    VALUES (:name, :usedFor, :agentName, :agentPhone)");
        $stmt->execute([
            ':name'       => $name,
            ':usedFor'    => $usedFor,
            ':agentName'  => $agentName,
            ':agentPhone' => $agentPhone,
        ]);
        return $this->db->lastInsertId();
    }

    // delete special medicine
    public function deleteSpecialMedicine($id) {
        $stmt = $this->db->prepare("DELETE FROM special_medicines WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }
}
