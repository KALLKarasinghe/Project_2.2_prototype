<?php
/**
 * Orders API
 * Adapted for flat orders table: id, medicine_id, pharmacy_id, quantity, status
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // ─── GET (View Orders) ──────────────────────────────────
    case 'GET':
        $role = strtolower($_GET['role'] ?? '');
        $user_id = $_GET['user_id'] ?? null;

        if (!$role || !$user_id) {
            http_response_code(400);
            echo json_encode(["error" => "role and user_id are required."]);
            exit;
        }

        try {
            if ($role === 'pharmacy') {
                // Pharmacy sees their own orders, joined with medicine and supplier info
                $sql = "SELECT o.id, o.medicine_id, o.pharmacy_id, o.quantity, o.status, o.created_at, o.transaction_id,
                               m.name as medicine_name, m.brand, m.price,
                               m.supplier_id as company_id,
                               u.name as company_name
                        FROM orders o
                        JOIN medicines m ON o.medicine_id = m.id
                        LEFT JOIN users u ON m.supplier_id = u.id
                        WHERE o.pharmacy_id = :uid 
                        ORDER BY o.id DESC";
            } else if ($role === 'supplier') {
                // Supplier sees orders for their medicines
                $sql = "SELECT o.id, o.medicine_id, o.pharmacy_id, o.quantity, o.status, o.created_at, o.transaction_id,
                               m.name as medicine_name, m.brand, m.price,
                               p.name as pharmacy_name
                        FROM orders o
                        JOIN medicines m ON o.medicine_id = m.id
                        JOIN users p ON o.pharmacy_id = p.id
                        WHERE m.supplier_id = :uid 
                        ORDER BY o.id DESC";
            } else {
                http_response_code(400);
                echo json_encode(["error" => "Invalid role. Must be 'pharmacy' or 'supplier'."]);
                exit;
            }

            $stmt = $db->prepare($sql);
            $stmt->execute([':uid' => $user_id]);
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Format to match frontend nested expectations
            $formatted_orders = [];
            foreach ($orders as $order) {
                $qty = (int) $order['quantity'];
                $price = isset($order['price']) ? (float) $order['price'] : 0;
                $total_amount = $qty * $price;

                $formatted_orders[] = [
                    "id" => $order['id'],
                    "pharmacy_id" => $order['pharmacy_id'],
                    "supplier_id" => $order['company_id'] ?? null,
                    "medicine_id" => $order['medicine_id'],
                    "status" => $order['status'],
                    "created_at" => $order['created_at'],
                    "transaction_id" => isset($order['transaction_id']) ? $order['transaction_id'] : null,
                    "company_name" => isset($order['company_name']) ? $order['company_name'] : (isset($order['pharmacy_name']) ? $order['pharmacy_name'] : 'Unknown'),
                    "total_amount" => $total_amount,
                    "items" => [
                        [
                            "generic_name" => $order['medicine_name'],
                            "brand_name" => $order['brand'],
                            "quantity" => $qty,
                            "price_per_unit" => $price
                        ]
                    ]
                ];
            }

            echo json_encode(["success" => true, "data" => $formatted_orders]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
        break;

    // ─── POST (Place Order) ──────────────────────────────
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        
        $role = strtolower($data['role'] ?? '');
        if ($role !== 'pharmacy') {
            http_response_code(403);
            echo json_encode(['error' => 'Only registered pharmacies can place direct orders from companies']);
            exit;
        }

        $pharmacy_id = $data['pharmacy_id'] ?? null;
        $cart_items = $data['cart_items'] ?? [];

        if (!$pharmacy_id || empty($cart_items)) {
            http_response_code(400);
            echo json_encode(["error" => "pharmacy_id and cart_items are required."]);
            exit;
        }

        try {
            $db->beginTransaction();

            // Insert one order row per cart item (flat table structure)
            $stmt = $db->prepare("INSERT INTO orders (medicine_id, pharmacy_id, quantity, status) 
                                  VALUES (:mid, :pid, :qty, 'Pending')");
            
            $stockStmt = $db->prepare("UPDATE medicines SET stock = GREATEST(0, stock - :qty) WHERE id = :mid");

            $order_ids = [];
            foreach ($cart_items as $item) {
                $med_id = $item['medicine_id'] ?? null;
                $qty = $item['quantity'] ?? 0;

                if (!$med_id || !$qty) {
                    throw new Exception("Invalid cart item data.");
                }

                $stmt->execute([
                    ':mid' => $med_id,
                    ':pid' => $pharmacy_id,
                    ':qty' => $qty
                ]);
                $order_ids[] = $db->lastInsertId();

                $stockStmt->execute([
                    ':qty' => $qty,
                    ':mid' => $med_id
                ]);
            }

            $db->commit();
            echo json_encode(["success" => true, "order_ids" => $order_ids, "message" => "Order placed successfully."]);

        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    // ─── PUT / PATCH (Update Status) ─────────────────────
    case 'PUT':
    case 'PATCH':
        $data = json_decode(file_get_contents("php://input"), true);
        
        $order_id = $data['order_id'] ?? null;
        $status = $data['status'] ?? null;
        $role = strtolower($data['role'] ?? ''); 

        if (!$order_id || !$status || !$role) {
            http_response_code(400);
            echo json_encode(["error" => "order_id, status, and role are required."]);
            exit;
        }

        // Map frontend status strings to DB ENUM values
        $statusMap = [
            'pending' => 'Pending',
            'confirmed' => 'Approved',
            'approved' => 'Approved',
            'shipped' => 'Delivered',
            'delivered' => 'Delivered',
            'cancelled' => 'Rejected',
            'rejected' => 'Rejected'
        ];
        $dbStatus = $statusMap[strtolower($status)] ?? ucfirst($status);

        try {
            // Fetch current order status
            $stmt = $db->prepare("SELECT status, medicine_id, quantity, pharmacy_id FROM orders WHERE id = :oid");
            $stmt->execute([':oid' => $order_id]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$order) {
                http_response_code(404);
                echo json_encode(["error" => "Order not found."]);
                exit;
            }

            // Role-based validation
            if ($role === 'pharmacy') {
                if (strtolower($status) !== 'cancelled' && strtolower($status) !== 'rejected') {
                    http_response_code(403);
                    echo json_encode(["error" => "Pharmacy can only cancel orders."]);
                    exit;
                }
                if ($order['status'] !== 'Pending') {
                    http_response_code(400);
                    echo json_encode(["error" => "Pharmacy can only cancel 'Pending' orders."]);
                    exit;
                }
            }

            $db->beginTransaction();

            // Update status
            $upd = $db->prepare("UPDATE orders SET status = :status WHERE id = :oid");
            $upd->execute([
                ':status' => $dbStatus,
                ':oid' => $order_id
            ]);

            // If cancelling/rejecting, restore the stock
            if (in_array($dbStatus, ['Rejected']) && $order['status'] !== 'Rejected') {
                $restStmt = $db->prepare("UPDATE medicines SET stock = stock + :qty WHERE id = :mid");
                $restStmt->execute([
                    ':qty' => $order['quantity'],
                    ':mid' => $order['medicine_id']
                ]);
            }

            // Notify pharmacy
            if ($order['pharmacy_id']) {
                $notif = $db->prepare("INSERT INTO notifications (user_id, title, message) VALUES (:uid, :title, :msg)");
                $notif->execute([
                    ':uid' => $order['pharmacy_id'],
                    ':title' => 'Order Status Updated',
                    ':msg' => "Your order #{$order_id} is now {$dbStatus}."
                ]);
            }

            $db->commit();
            echo json_encode(["success" => true, "message" => "Order status updated to $dbStatus."]);

        } catch (PDOException $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
        break;

    // ─── DELETE ──────────────────────────────────────────
    case 'DELETE':
        http_response_code(405);
        echo json_encode(["error" => "Deleting orders is not allowed. Please cancel instead."]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed."]);
}
