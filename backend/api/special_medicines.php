<?php
/**
 * Special Medicines API
 * GET    /api/special_medicines.php       - Get all special medicines
 * POST   /api/special_medicines.php       - Add new special medicine
 * DELETE /api/special_medicines.php?id=1  - Delete special medicine
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // ─── GET ──────────────────────────────────────────────
    case 'GET':
        try {
            $stmt = $db->query("SELECT id, legacy_id, name, used_for AS usedFor, agent_name AS agentName, agent_phone AS agentPhone FROM special_medicines ORDER BY id ASC");
            $medicines = $stmt->fetchAll();
            echo json_encode($medicines);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    // ─── POST ─────────────────────────────────────────────
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['name']) || empty($data['usedFor']) || empty($data['agentName'])) {
            http_response_code(400);
            echo json_encode(["error" => "name, usedFor, and agentName are required."]);
            exit;
        }

        try {
            $stmt = $db->prepare("INSERT INTO special_medicines (name, used_for, agent_name, agent_phone) 
                                  VALUES (:name, :usedFor, :agentName, :agentPhone)");
            $stmt->execute([
                ':name'       => $data['name'],
                ':usedFor'    => $data['usedFor'],
                ':agentName'  => $data['agentName'],
                ':agentPhone' => $data['agentPhone'] ?? '',
            ]);

            $newId = $db->lastInsertId();
            echo json_encode(["success" => true, "id" => $newId, "message" => "Special medicine added."]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    // ─── DELETE ───────────────────────────────────────────
    case 'DELETE':
        if (empty($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Special medicine id is required."]);
            exit;
        }

        try {
            $stmt = $db->prepare("DELETE FROM special_medicines WHERE id = :id");
            $stmt->execute([':id' => $_GET['id']]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(["success" => true, "message" => "Special medicine deleted."]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Special medicine not found."]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed."]);
}
