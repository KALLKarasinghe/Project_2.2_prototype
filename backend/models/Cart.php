<?php
class Cart {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // get all cart items for a user
    public function getCartItems($user_id) {
        $sql = "SELECT 
                    uc.id as cart_id,
                    uc.user_id,
                    uc.medicine_id,
                    uc.quantity,
                    pr.name,
                    pr.brand,
                    i.price,
                    i.stock,
                    i.expire_date as expireDate,
                    pr.description,
                    pr.supplier_id as company_id,
                    u.name as company_name
                FROM user_cart uc
                JOIN products pr ON uc.medicine_id = pr.id
                JOIN inventory i ON pr.id = i.product_id
                LEFT JOIN users u ON pr.supplier_id = u.id
                WHERE uc.user_id = :uid
                ORDER BY uc.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':uid' => $user_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // check if item already exists
    public function getExistingItem($user_id, $medicine_id) {
        $check = $this->db->prepare("SELECT id, quantity FROM user_cart WHERE user_id = :uid AND medicine_id = :mid");
        $check->execute([':uid' => $user_id, ':mid' => $medicine_id]);
        return $check->fetch(PDO::FETCH_ASSOC);
    }

    // update quantity
    public function updateQuantity($cart_id, $newQty) {
        $upd = $this->db->prepare("UPDATE user_cart SET quantity = :qty WHERE id = :id");
        return $upd->execute([':qty' => $newQty, ':id' => $cart_id]);
    }

    // update exact quantity
    public function setExactQuantity($user_id, $medicine_id, $quantity) {
        $upd = $this->db->prepare("UPDATE user_cart SET quantity = :qty WHERE user_id = :uid AND medicine_id = :mid");
        return $upd->execute([':qty' => $quantity, ':uid' => $user_id, ':mid' => $medicine_id]);
    }

    // insert new item
    public function addItem($user_id, $medicine_id, $quantity) {
        $ins = $this->db->prepare("INSERT INTO user_cart (user_id, medicine_id, quantity) VALUES (:uid, :mid, :qty)");
        $ins->execute([':uid' => $user_id, ':mid' => $medicine_id, ':qty' => $quantity]);
        return $this->db->lastInsertId();
    }

    // remove specific item
    public function removeItem($user_id, $medicine_id) {
        $stmt = $this->db->prepare("DELETE FROM user_cart WHERE user_id = :uid AND medicine_id = :mid");
        $stmt->execute([':uid' => $user_id, ':mid' => $medicine_id]);
        return $stmt->rowCount();
    }

    // clear cart
    public function clearCart($user_id) {
        $stmt = $this->db->prepare("DELETE FROM user_cart WHERE user_id = :uid");
        $stmt->execute([':uid' => $user_id]);
        return $stmt->rowCount();
    }
}
