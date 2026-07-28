<?php
/**
 * Registry Model for Mock Databases (NMRA, Company, SLMC)
 */

class Registry {
    private $db;

    public function __construct($dbConnection) {
        $this->db = $dbConnection;
    }

    public function verifyPharmacy($name, $address, $license_no) {
        $stmt = $this->db->prepare("SELECT id FROM mock_nmra_database WHERE 
            LOWER(TRIM(pharmacy_name)) = LOWER(TRIM(:name)) AND 
            LOWER(TRIM(pharmacy_address)) = LOWER(TRIM(:address)) AND 
            TRIM(slmc_number) = TRIM(:license_no)");
        
        $stmt->execute([
            ':name' => $name,
            ':address' => $address,
            ':license_no' => $license_no
        ]);
        return $stmt->fetch();
    }

    public function verifySupplier($name, $reg_no) {
        $stmt = $this->db->prepare("SELECT id FROM mock_company_registry WHERE 
            LOWER(TRIM(company_name)) = LOWER(TRIM(:name)) AND 
            TRIM(br_number) = TRIM(:reg_no)");
        $stmt->execute([
            ':name' => $name,
            ':reg_no' => $reg_no
        ]);
        return $stmt->fetch();
    }

    public function verifyAgent($name, $reg_no) {
        $stmt = $this->db->prepare("SELECT id FROM mock_slmc_database WHERE 
            LOWER(TRIM(agent_name)) = LOWER(TRIM(:name)) AND 
            TRIM(slmc_number) = TRIM(:reg_no)");
        $stmt->execute([
            ':name' => $name,
            ':reg_no' => $reg_no
        ]);
        return $stmt->fetch();
    }
}
