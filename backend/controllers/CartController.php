<?php
require_once __DIR__ . '/../models/Cart.php';

class CartController {
    private $db;
    private $cartModel;

    public function __construct($db) {
        $this->db = $db;
        $this->cartModel = new Cart($db);
    }

    public function handleRequest($method) {
        switch ($method) {
            case 'GET':
                $this->getCart();
                break;
            case 'POST':
                $this->addOrUpdateItem();
                break;
            case 'PUT':
                $this->setExactQuantity();
                break;
            case 'DELETE':
                $this->deleteItemOrClear();
                break;
            default:
                http_response_code(405);
                echo json_encode(["error" => "Method not allowed."]);
        }
    }

    private function getCart() {
        $user_id = $_GET['user_id'] ?? null;

        if (!$user_id) {
            http_response_code(400);
            echo json_encode(["error" => "user_id is required."]);
            return;
        }

        try {
            $items = $this->cartModel->getCartItems($user_id);

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
    }

    private function addOrUpdateItem() {
        $raw = file_get_contents("php://input");
        $data = json_decode($raw, true);

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
            return;
        }

        try {
            $existing = $this->cartModel->getExistingItem($user_id, $medicine_id);

            if ($existing) {
                // Update quantity (add to existing)
                $newQty = (int) $existing['quantity'] + (int) $quantity;
                $this->cartModel->updateQuantity($existing['id'], $newQty);
                echo json_encode(["success" => true, "action" => "updated", "new_quantity" => $newQty, "message" => "Cart item quantity updated."]);
            } else {
                // Insert new cart row
                $newId = $this->cartModel->addItem($user_id, $medicine_id, $quantity);
                echo json_encode(["success" => true, "action" => "added", "cart_id" => $newId, "message" => "Item added to cart."]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }

    private function setExactQuantity() {
        $data = json_decode(file_get_contents("php://input"), true);

        $user_id     = $data['user_id'] ?? null;
        $medicine_id = $data['medicine_id'] ?? null;
        $quantity    = $data['quantity'] ?? null;

        if (!$user_id || !$medicine_id || $quantity === null) {
            http_response_code(400);
            echo json_encode(["error" => "user_id, medicine_id, and quantity are required."]);
            return;
        }

        try {
            if ((int) $quantity <= 0) {
                // Remove item if quantity is 0 or less
                $this->cartModel->removeItem($user_id, $medicine_id);
                echo json_encode(["success" => true, "action" => "removed", "message" => "Item removed from cart."]);
            } else {
                $this->cartModel->setExactQuantity($user_id, $medicine_id, $quantity);
                echo json_encode(["success" => true, "action" => "updated", "message" => "Cart quantity set to $quantity."]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }

    private function deleteItemOrClear() {
        $user_id     = $_GET['user_id'] ?? null;
        $medicine_id = $_GET['medicine_id'] ?? null;
        $clear_all   = $_GET['clear_all'] ?? 'false';

        if (!$user_id) {
            http_response_code(400);
            echo json_encode(["error" => "user_id is required."]);
            return;
        }

        try {
            if ($clear_all === 'true') {
                $removed = $this->cartModel->clearCart($user_id);
                echo json_encode(["success" => true, "message" => "Cart cleared successfully.", "removed" => $removed]);
            } else if ($medicine_id) {
                $removed = $this->cartModel->removeItem($user_id, $medicine_id);
                if ($removed > 0) {
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
    }
}
