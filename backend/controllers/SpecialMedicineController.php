<?php
require_once __DIR__ . '/../models/SpecialMedicine.php';

class SpecialMedicineController {
    private $model;

    public function __construct() {
        $this->model = new SpecialMedicine();
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'GET') {
            $this->getSpecialMedicines();
        } elseif ($method === 'POST') {
            $this->addSpecialMedicine();
        } elseif ($method === 'DELETE') {
            $this->deleteSpecialMedicine();
        } else {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed."]);
        }
    }

    // handle GET request
    private function getSpecialMedicines() {
        try {
            $medicines = $this->model->getAll();
            echo json_encode($medicines);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    // handle POST request
    private function addSpecialMedicine() {
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['name']) || empty($data['usedFor']) || empty($data['agentName'])) {
            http_response_code(400);
            echo json_encode(["error" => "name, usedFor, and agentName are required."]);
            return;
        }

        try {
            $agentPhone = $data['agentPhone'] ?? '';
            $newId = $this->model->addSpecialMedicine($data['name'], $data['usedFor'], $data['agentName'], $agentPhone);
            echo json_encode(["success" => true, "id" => $newId, "message" => "Special medicine added."]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }

    // handle DELETE request
    private function deleteSpecialMedicine() {
        if (empty($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Special medicine id is required."]);
            return;
        }

        try {
            $deleted = $this->model->deleteSpecialMedicine($_GET['id']);
            if ($deleted) {
                echo json_encode(["success" => true, "message" => "Special medicine deleted."]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Special medicine not found."]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    }
}
