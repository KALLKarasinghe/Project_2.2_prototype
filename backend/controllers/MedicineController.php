<?php
require_once __DIR__ . '/../models/Medicine.php';

class MedicineController {
    private $model;

    public function __construct() {
        $this->model = new Medicine();
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'GET') {
            $this->getMedicines();
        } elseif ($method === 'POST') {
            $this->addMedicine();
        } else {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed. Use GET or POST."]);
        }
    }

    // handle GET request
    private function getMedicines() {
        try {
            $role = $_GET['role'] ?? '';
            $company_id = $_GET['company_id'] ?? null;

            if (strtolower($role) === 'supplier' && !$company_id) {
                http_response_code(400);
                echo json_encode(["error" => "company_id is required for supplier role."]);
                return;
            }

            $medicines = $this->model->getMedicines($role, $company_id);
            $commissionRate = $this->model->getCommissionRate();
            $multiplier = 1 + ($commissionRate / 100);

            // update prices based on role
            foreach ($medicines as &$med) {
                $basePrice = (float) $med['price'];
                if (strtolower($role) === 'pharmacy' || strtolower($role) === 'customer') {
                    $med['price'] = round($basePrice * $multiplier, 2);
                } else {
                    $med['price'] = $basePrice;
                }
                $med['stock'] = (int) $med['stock'];
            }
            unset($med);

            echo json_encode(["success" => true, "data" => $medicines]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }

    // handle POST request
    private function addMedicine() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $role = $data['role'] ?? '';
        if (strtolower($role) !== 'supplier' && strtolower($role) !== 'company') {
            http_response_code(403);
            echo json_encode(["error" => "Only registered suppliers can add medicines."]);
            return;
        }

        $supplier_id  = $data['company_id'] ?? null;
        $name         = $data['name'] ?? '';
        $brand        = $data['brand'] ?? '';
        $price        = $data['price'] ?? 0;
        $mrp          = $data['mrp'] ?? 0;
        $stock        = $data['stock'] ?? 0;
        $expire_date  = $data['expireDate'] ?? null;
        $description  = $data['description'] ?? '';

        if (!$supplier_id || !$name || !$brand || !$price || !$mrp) {
            http_response_code(400);
            echo json_encode(["error" => "Supplier ID, name, brand, base price, and MRP are required."]);
            return;
        }

        try {
            // check admin approval
            if (!$this->model->isSupplierApproved($supplier_id)) {
                http_response_code(403);
                echo json_encode(["error" => "Your account must be approved by an Admin before you can add medicines."]);
                return;
            }
            
            $commissionRate = $this->model->getCommissionRate();
            $finalPrice = round($price * (1 + ($commissionRate / 100)), 2);

            if ($finalPrice > $mrp) {
                http_response_code(400);
                echo json_encode(["error" => "The final platform price (Rs. {$finalPrice}) exceeds your MRP (Rs. {$mrp}). Please adjust the base price or MRP."]);
                return;
            }

            $productId = $this->model->addMedicine($supplier_id, $name, $brand, $description, $price, $mrp, $stock, $expire_date);
            echo json_encode(["success" => true, "id" => $productId, "message" => "Medicine added successfully."]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }
}
