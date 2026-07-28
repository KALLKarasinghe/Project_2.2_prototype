<?php
require_once __DIR__ . '/../models/Product.php';

class ProductController {
    private $model;

    public function __construct() {
        $this->model = new Product();
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'GET') {
            $this->getProducts();
        } elseif ($method === 'POST') {
            $this->addProduct();
        } else {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed. Use GET or POST."]);
        }
    }

    // handle GET request
    private function getProducts() {
        try {
            $role = $_GET['role'] ?? '';
            $company_id = $_GET['company_id'] ?? null;
            $search = $_GET['search'] ?? '';

            if (strtolower($role) === 'supplier' && !$company_id) {
                http_response_code(400);
                echo json_encode(["error" => "company_id is required for supplier role."]);
                return;
            }

            $products = $this->model->getProducts($role, $company_id, $search);
            $commissionRate = $this->model->getCommissionRate();
            $multiplier = 1 + ($commissionRate / 100);

            // update prices based on role
            foreach ($products as &$prod) {
                $basePrice = (float) $prod['price'];
                if (strtolower($role) === 'pharmacy' || strtolower($role) === 'customer') {
                    $prod['price'] = round($basePrice * $multiplier, 2);
                } else {
                    $prod['price'] = $basePrice;
                }
                $prod['stock'] = (int) $prod['stock'];
            }
            unset($prod);

            echo json_encode(["success" => true, "data" => $products]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }

    // handle POST request
    private function addProduct() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $role = $data['role'] ?? '';
        if (strtolower($role) !== 'supplier' && strtolower($role) !== 'company') {
            http_response_code(403);
            echo json_encode(["error" => "Only registered suppliers can add products."]);
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
            $commissionRate = $this->model->getCommissionRate();
            $finalPrice = round($price * (1 + ($commissionRate / 100)), 2);

            if ($finalPrice > $mrp) {
                http_response_code(400);
                echo json_encode(["error" => "The final platform price (Rs. {$finalPrice}) exceeds your MRP (Rs. {$mrp}). Please adjust the base price or MRP."]);
                return;
            }

            $productId = $this->model->addProduct($supplier_id, $name, $brand, $description, $price, $mrp, $stock, $expire_date);
            echo json_encode(["success" => true, "id" => $productId, "message" => "Product added successfully."]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }
}
