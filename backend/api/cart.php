<?php
/**
 * Cart API — Database-backed persistent cart
 * GET    /api/cart.php?user_id=5          - Fetch all cart items for a user
 * POST   /api/cart.php                    - Add or update a cart item (JSON: { user_id, medicine_id, quantity })
 * DELETE /api/cart.php?user_id=5&medicine_id=3   - Remove a specific item
 * DELETE /api/cart.php?user_id=5&clear_all=true  - Clear entire cart for user
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // ─── GET (Fetch Cart) ────────────────────────────────────
    case 'GET':
        $user_id = $_GET['user_id'] ?? null;

        if (!$user_id) {
            http_response_code(400);
            echo json_encode(["error" => "user_id is required."]);
            exit;
        }

        try {
            $sql = "SELECT 
                        uc.id as cart_id,
                        uc.user_id,
                        uc.medicine_id,
                        uc.quantity,
                        m.name,
                        m.brand,
                        m.price,
                        m.stock,
                        m.expire_date as expireDate,
                        m.description,
                        m.supplier_id as company_id,
                        u.name as company_name
                    FROM user_cart uc
                    JOIN medicines m ON uc.medicine_id = m.id
                    LEFT JOIN users u ON m.supplier_id = u.id
                    WHERE uc.user_id = :uid
                    ORDER BY uc.created_at DESC";

            $stmt = $db->prepare($sql);
            $stmt->execute([':uid' => $user_id]);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Cast numeric types for frontend compatibility
            foreach ($items as &$item) {
                $item['quantity'] = (int) $item['quantity'];
                $item['price'] = (float) $item['price'];
                $item['stock'] = (int) $item['stock'];
                $item['medicine_id'] = (int) $item['medicine_id'];
                $item['cart_id'] = (int) $item['cart_id'];
            }
            unset($item);

            echo json_encode(["success" => true, "data" => $items]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
        break;

    // ─── POST (Add / Update Cart Item) ───────────────────────
    case 'POST':
        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);

        // Debug: log what was received
        $user_id     = $data['user_id'] ?? null;
        $medicine_id = $data['medicine_id'] ?? null;
        $quantity    = $data['quantity'] ?? 1;

        if (!$user_id || !$medicine_id) {
            http_response_code(400);
            echo json_encode([
                "error" => "user_id and medicine_id are required.",
                "debug_raw_input" => $raw,
                "debug_parsed" => $data,
                "debug_user_id" => $user_id,
                "debug_medicine_id" => $medicine_id
            ]);
            exit;
        }

        try {
            // Check if the item already exists in the user's cart
            $check = $db->prepare("SELECT id, quantity FROM user_cart WHERE user_id = :uid AND medicine_id = :mid");
            $check->execute([':uid' => $user_id, ':mid' => $medicine_id]);
            $existing = $check->fetch(PDO::FETCH_ASSOC);

            if ($existing) {
                // Update quantity (add to existing)
                $newQty = (int) $existing['quantity'] + (int) $quantity;
                $upd = $db->prepare("UPDATE user_cart SET quantity = :qty WHERE id = :id");
                $upd->execute([':qty' => $newQty, ':id' => $existing['id']]);
                echo json_encode(["success" => true, "action" => "updated", "new_quantity" => $newQty, "message" => "Cart item quantity updated."]);
            } else {
                // Insert new cart row
                $ins = $db->prepare("INSERT INTO user_cart (user_id, medicine_id, quantity) VALUES (:uid, :mid, :qty)");
                $ins->execute([':uid' => $user_id, ':mid' => $medicine_id, ':qty' => $quantity]);
                $newId = $db->lastInsertId();
                echo json_encode(["success" => true, "action" => "added", "cart_id" => $newId, "message" => "Item added to cart."]);
            }

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
        break;

    // ─── PUT (Set exact quantity) ────────────────────────────
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);

        $user_id     = $data['user_id'] ?? null;
        $medicine_id = $data['medicine_id'] ?? null;
        $quantity    = $data['quantity'] ?? null;

        if (!$user_id || !$medicine_id || $quantity === null) {
            http_response_code(400);
            echo json_encode(["error" => "user_id, medicine_id, and quantity are required."]);
            exit;
        }

        try {
            if ((int) $quantity <= 0) {
                // Remove item if quantity is 0 or less
                $del = $db->prepare("DELETE FROM user_cart WHERE user_id = :uid AND medicine_id = :mid");
                $del->execute([':uid' => $user_id, ':mid' => $medicine_id]);
                echo json_encode(["success" => true, "action" => "removed", "message" => "Item removed from cart."]);
            } else {
                $upd = $db->prepare("UPDATE user_cart SET quantity = :qty WHERE user_id = :uid AND medicine_id = :mid");
                $upd->execute([':qty' => $quantity, ':uid' => $user_id, ':mid' => $medicine_id]);
                echo json_encode(["success" => true, "action" => "updated", "message" => "Cart quantity set to $quantity."]);
            }

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
        break;

    // ─── DELETE (Remove Item / Clear Cart) ────────────────────
    case 'DELETE':
        $user_id     = $_GET['user_id'] ?? null;
        $medicine_id = $_GET['medicine_id'] ?? null;
        $clear_all   = $_GET['clear_all'] ?? 'false';

        if (!$user_id) {
            http_response_code(400);
            echo json_encode(["error" => "user_id is required."]);
            exit;
        }

        try {
            if ($clear_all === 'true') {
                // Clear entire cart for this user
                $stmt = $db->prepare("DELETE FROM user_cart WHERE user_id = :uid");
                $stmt->execute([':uid' => $user_id]);
                echo json_encode(["success" => true, "message" => "Cart cleared successfully.", "removed" => $stmt->rowCount()]);
            } else if ($medicine_id) {
                // Remove specific item
                $stmt = $db->prepare("DELETE FROM user_cart WHERE user_id = :uid AND medicine_id = :mid");
                $stmt->execute([':uid' => $user_id, ':mid' => $medicine_id]);

                if ($stmt->rowCount() > 0) {
                    echo json_encode(["success" => true, "message" => "Item removed from cart."]);
                } else {
                    http_response_code(404);
                    echo json_encode(["error" => "Item not found in cart."]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["error" => "Provide medicine_id to remove a specific item, or clear_all=true to empty the cart."]);
            }

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed."]);
}
