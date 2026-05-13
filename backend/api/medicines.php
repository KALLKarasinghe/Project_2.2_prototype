<?php
/**
 * Medicines API
 * GET    /api/medicines.php             - Get all medicines (with supplier name + reviews)
 * GET    /api/medicines.php?id=1        - Get single medicine
 * GET    /api/medicines.php?supplier_id=5 - Filter by supplier
 * POST   /api/medicines.php             - Add new medicine
 * PUT    /api/medicines.php             - Update medicine
 * DELETE /api/medicines.php?id=1        - Delete medicine
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // ─── GET ──────────────────────────────────────────────
    case 'GET':
        try {
            $sql = "SELECT m.id, m.legacy_id, m.name, m.brand, m.price, m.stock, m.expire_date AS expireDate,
                           m.description, m.supplier_id AS supplierId, 
                           u.name AS supplierName, u.legacy_id AS supplierLegacyId
                    FROM medicines m
                    LEFT JOIN users u ON m.supplier_id = u.id
                    WHERE 1=1";
            $params = [];

            if (!empty($_GET['id'])) {
                $sql .= " AND m.id = :id";
                $params[':id'] = $_GET['id'];
            }
            if (!empty($_GET['supplier_id'])) {
                $sql .= " AND m.supplier_id = :sid";
                $params[':sid'] = $_GET['supplier_id'];
            }

            $sql .= " ORDER BY m.id ASC";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $medicines = $stmt->fetchAll();

            // Attach reviews to each medicine
            $reviewStmt = $db->prepare("SELECT reviewer, rating, comment, review_date AS date FROM medicine_reviews WHERE medicine_id = :mid ORDER BY id ASC");

            foreach ($medicines as &$med) {
                $reviewStmt->execute([':mid' => $med['id']]);
                $med['reviews'] = $reviewStmt->fetchAll();
                // Cast numeric types for frontend compatibility
                $med['price'] = (float) $med['price'];
                $med['stock'] = (int) $med['stock'];
            }
            unset($med);

            echo json_encode($medicines);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    // ─── POST ─────────────────────────────────────────────
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['name']) || empty($data['brand'])) {
            http_response_code(400);
            echo json_encode(["error" => "name and brand are required."]);
            exit;
        }

        try {
            $stmt = $db->prepare("INSERT INTO medicines (name, brand, price, stock, expire_date, description, supplier_id) 
                                  VALUES (:name, :brand, :price, :stock, :expire, :desc, :sid)");
            $stmt->execute([
                ':name'   => $data['name'],
                ':brand'  => $data['brand'],
                ':price'  => $data['price'] ?? 0,
                ':stock'  => $data['stock'] ?? 0,
                ':expire' => $data['expireDate'] ?? null,
                ':desc'   => $data['description'] ?? null,
                ':sid'    => $data['supplierId'] ?? null,
            ]);

            $newId = $db->lastInsertId();
            echo json_encode(["success" => true, "id" => $newId, "message" => "Medicine added."]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    // ─── PUT ──────────────────────────────────────────────
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Medicine id is required."]);
            exit;
        }

        try {
            $fields = [];
            $params = [':id' => $data['id']];

            if (isset($data['name']))        { $fields[] = "name = :name";                $params[':name']   = $data['name']; }
            if (isset($data['brand']))       { $fields[] = "brand = :brand";              $params[':brand']  = $data['brand']; }
            if (isset($data['price']))       { $fields[] = "price = :price";              $params[':price']  = $data['price']; }
            if (isset($data['stock']))       { $fields[] = "stock = :stock";              $params[':stock']  = $data['stock']; }
            if (isset($data['expireDate']))  { $fields[] = "expire_date = :expire";       $params[':expire'] = $data['expireDate']; }
            if (isset($data['description'])) { $fields[] = "description = :desc";         $params[':desc']   = $data['description']; }
            if (isset($data['supplierId']))  { $fields[] = "supplier_id = :sid";          $params[':sid']    = $data['supplierId']; }

            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(["error" => "No fields to update."]);
                exit;
            }

            $sql = "UPDATE medicines SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);

            echo json_encode(["success" => true, "message" => "Medicine updated."]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    // ─── DELETE ───────────────────────────────────────────
    case 'DELETE':
        if (empty($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Medicine id is required."]);
            exit;
        }

        try {
            $stmt = $db->prepare("DELETE FROM medicines WHERE id = :id");
            $stmt->execute([':id' => $_GET['id']]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(["success" => true, "message" => "Medicine deleted."]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Medicine not found."]);
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
