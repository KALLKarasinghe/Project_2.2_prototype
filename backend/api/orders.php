<?php
/**
 * Orders API
 * GET    /api/orders.php                 - Get all orders (with medicine name + pharmacy name)
 * GET    /api/orders.php?pharmacy_id=25  - Orders for a specific pharmacy
 * GET    /api/orders.php?status=Pending  - Filter by status
 * POST   /api/orders.php                - Place a new order
 * PUT    /api/orders.php                - Update order (approve / change status + adjust stock)
 * DELETE /api/orders.php?id=1           - Delete order
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // ─── GET ──────────────────────────────────────────────
    case 'GET':
        try {
            $sql = "SELECT o.id, o.legacy_id, o.medicine_id AS medicineId, o.pharmacy_id AS pharmacyId,
                           o.quantity, o.status, o.created_at,
                           m.name AS medicineName, m.legacy_id AS medicineLegacyId,
                           p.name AS pharmacyName, p.legacy_id AS pharmacyLegacyId
                    FROM orders o
                    JOIN medicines m ON o.medicine_id = m.id
                    JOIN users p ON o.pharmacy_id = p.id
                    WHERE 1=1";
            $params = [];

            if (!empty($_GET['id'])) {
                $sql .= " AND o.id = :id";
                $params[':id'] = $_GET['id'];
            }
            if (!empty($_GET['pharmacy_id'])) {
                $sql .= " AND o.pharmacy_id = :pid";
                $params[':pid'] = $_GET['pharmacy_id'];
            }
            if (!empty($_GET['status'])) {
                $sql .= " AND o.status = :status";
                $params[':status'] = $_GET['status'];
            }

            $sql .= " ORDER BY o.id DESC";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $orders = $stmt->fetchAll();

            // Cast types
            foreach ($orders as &$order) {
                $order['quantity'] = (int) $order['quantity'];
            }
            unset($order);

            echo json_encode($orders);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    // ─── POST (Place Order) ──────────────────────────────
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['medicineId']) || empty($data['quantity'])) {
            http_response_code(400);
            echo json_encode(["error" => "medicineId and quantity are required."]);
            exit;
        }

        try {
            $stmt = $db->prepare("INSERT INTO orders (medicine_id, pharmacy_id, quantity, status) 
                                  VALUES (:mid, :pid, :qty, 'Pending')");
            $stmt->execute([
                ':mid' => $data['medicineId'],
                ':pid' => $data['pharmacyId'] ?? null,
                ':qty' => $data['quantity'],
            ]);

            $newId = $db->lastInsertId();
            echo json_encode(["success" => true, "id" => $newId, "message" => "Order placed."]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    // ─── PUT (Approve / Update Status) ───────────────────
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['id']) || empty($data['status'])) {
            http_response_code(400);
            echo json_encode(["error" => "Order id and status are required."]);
            exit;
        }

        try {
            $db->beginTransaction();

            // If approving, deduct stock from the medicine
            if ($data['status'] === 'Approved') {
                // Get the order details
                $orderStmt = $db->prepare("SELECT medicine_id, quantity FROM orders WHERE id = :id");
                $orderStmt->execute([':id' => $data['id']]);
                $order = $orderStmt->fetch();

                if ($order) {
                    $updateStock = $db->prepare("UPDATE medicines SET stock = GREATEST(0, stock - :qty) WHERE id = :mid");
                    $updateStock->execute([
                        ':qty' => $order['quantity'],
                        ':mid' => $order['medicine_id'],
                    ]);
                }
            }

            // Update order status
            $stmt = $db->prepare("UPDATE orders SET status = :status WHERE id = :id");
            $stmt->execute([
                ':status' => $data['status'],
                ':id'     => $data['id'],
            ]);

            $db->commit();
            echo json_encode(["success" => true, "message" => "Order updated to " . $data['status'] . "."]);
        } catch (PDOException $e) {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    // ─── DELETE ───────────────────────────────────────────
    case 'DELETE':
        if (empty($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Order id is required."]);
            exit;
        }

        try {
            $stmt = $db->prepare("DELETE FROM orders WHERE id = :id");
            $stmt->execute([':id' => $_GET['id']]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(["success" => true, "message" => "Order deleted."]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Order not found."]);
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
