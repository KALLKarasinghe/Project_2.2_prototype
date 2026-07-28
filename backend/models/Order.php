<?php
class Order {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // get pharmacy orders
    public function getPharmacyOrders($pharmacy_id) {
        $sql = "SELECT o.id, o.product_id as medicine_id, o.pharmacy_id, o.quantity, o.status, o.created_at,
                       pr.name as medicine_name, pr.brand, i.price,
                       pr.supplier_id as company_id,
                       u.name as company_name,
                       pm.status as payment_status, pm.payment_method
                FROM orders o
                JOIN products pr ON o.product_id = pr.id
                JOIN inventory i ON pr.id = i.product_id
                LEFT JOIN users u ON pr.supplier_id = u.id
                LEFT JOIN payments pm ON o.id = pm.order_id
                WHERE o.pharmacy_id = :uid 
                ORDER BY o.id DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':uid' => $pharmacy_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // get supplier orders
    public function getSupplierOrders($supplier_id) {
        $sql = "SELECT o.id, o.product_id as medicine_id, o.pharmacy_id, o.quantity, o.status, o.created_at,
                       pr.name as medicine_name, pr.brand, i.price,
                       ph.name as pharmacy_name,
                       pm.status as payment_status, pm.payment_method
                FROM orders o
                JOIN products pr ON o.product_id = pr.id
                JOIN inventory i ON pr.id = i.product_id
                JOIN users ph ON o.pharmacy_id = ph.id
                LEFT JOIN payments pm ON o.id = pm.order_id
                WHERE pr.supplier_id = :uid 
                ORDER BY o.id DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':uid' => $supplier_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // place order from simple cart
    public function placeOrders($pharmacy_id, $cart_items) {
        $this->db->beginTransaction();

        try {
            $stmt = $this->db->prepare("INSERT INTO orders (product_id, pharmacy_id, quantity, status) 
                                      VALUES (:mid, :pid, :qty, 'Pending')");
            $stockStmt = $this->db->prepare("UPDATE inventory SET stock = GREATEST(0, stock - :qty) WHERE product_id = :mid");

            $order_ids = [];
            foreach ($cart_items as $item) {
                $med_id = $item['medicine_id'] ?? $item['id'] ?? null; 
                $qty = $item['quantity'] ?? 0;

                if (!$med_id || !$qty) {
                    throw new Exception("Invalid cart item data.");
                }

                $stmt->execute([
                    ':mid' => $med_id,
                    ':pid' => $pharmacy_id,
                    ':qty' => $qty
                ]);
                $order_ids[] = $this->db->lastInsertId();

                $stockStmt->execute([
                    ':qty' => $qty,
                    ':mid' => $med_id
                ]);
            }

            $this->db->commit();
            return $order_ids;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    // get single order by id
    public function getOrderById($order_id) {
        $stmt = $this->db->prepare("SELECT status, product_id, quantity, pharmacy_id FROM orders WHERE id = :oid");
        $stmt->execute([':oid' => $order_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // update order status
    public function updateOrderStatus($order_id, $dbStatus, $order) {
        $this->db->beginTransaction();

        try {
            $upd = $this->db->prepare("UPDATE orders SET status = :status WHERE id = :oid");
            $upd->execute([
                ':status' => $dbStatus,
                ':oid' => $order_id
            ]);

            // If cancelling/rejecting, restore the stock
            if (in_array($dbStatus, ['Rejected']) && $order['status'] !== 'Rejected') {
                $restStmt = $this->db->prepare("UPDATE inventory SET stock = stock + :qty WHERE product_id = :mid");
                $restStmt->execute([
                    ':qty' => $order['quantity'],
                    ':mid' => $order['product_id']
                ]);
            }

            // Notify pharmacy
            if ($order['pharmacy_id']) {
                $notif = $this->db->prepare("INSERT INTO notifications (user_id, title, message) VALUES (:uid, :title, :msg)");
                $notif->execute([
                    ':uid' => $order['pharmacy_id'],
                    ':title' => 'Order Status Updated',
                    ':msg' => "Your order #{$order_id} is now {$dbStatus}."
                ]);
            }

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    // handle full checkout (converts cart to order)
    public function processCheckout($user_id, $payment_method, $receipt_image) {
        $this->db->beginTransaction();

        try {
            // 1. Fetch cart items
            $stmt = $this->db->prepare("
                SELECT uc.medicine_id as product_id, uc.quantity, i.price 
                FROM user_cart uc 
                JOIN inventory i ON uc.medicine_id = i.product_id 
                WHERE uc.user_id = :uid
            ");
            $stmt->execute([':uid' => $user_id]);
            $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (count($cartItems) === 0) {
                $this->db->rollBack();
                return false;
            }

            $orderStatus = ($payment_method === 'Bank Transfer') ? 'Pending' : 'Approved';
            $paymentStatus = ($payment_method === 'Bank Transfer') ? 'Pending' : 'Paid';

            $insertOrder = $this->db->prepare("INSERT INTO orders (product_id, pharmacy_id, quantity, status) VALUES (:mid, :uid, :qty, :status)");
            $updateStock = $this->db->prepare("UPDATE inventory SET stock = stock - :qty1 WHERE product_id = :mid AND stock >= :qty2");
            $insertPayment = $this->db->prepare("INSERT INTO payments (order_id, amount, payment_method, status, receipt_image) VALUES (:oid, :amt, :method, :status, :receipt)");
            $getMedInfo = $this->db->prepare("SELECT name, supplier_id FROM products WHERE id = :mid");
            $insertNotif = $this->db->prepare("INSERT INTO notifications (user_id, title, message) VALUES (:uid, :title, :msg)");

            foreach ($cartItems as $item) {
                // Insert order
                $insertOrder->execute([
                    ':mid' => $item['product_id'],
                    ':uid' => $user_id,
                    ':qty' => $item['quantity'],
                    ':status' => $orderStatus
                ]);
                
                $orderId = $this->db->lastInsertId();
                
                $amount = (float)$item['price'] * (int)$item['quantity'];

                $insertPayment->execute([
                    ':oid' => $orderId,
                    ':amt' => $amount,
                    ':method' => $payment_method,
                    ':status' => $paymentStatus,
                    ':receipt' => $receipt_image
                ]);

                // Deduct stock
                $updateStock->execute([
                    ':qty1' => $item['quantity'],
                    ':qty2' => $item['quantity'],
                    ':mid' => $item['product_id']
                ]);

                // notify supplier
                $getMedInfo->execute([':mid' => $item['product_id']]);
                $medInfo = $getMedInfo->fetch(PDO::FETCH_ASSOC);

                if ($medInfo && $medInfo['supplier_id']) {
                    $insertNotif->execute([
                        ':uid' => $medInfo['supplier_id'],
                        ':title' => 'New Order Received',
                        ':msg' => "You have received a new order for {$item['quantity']} units of {$medInfo['name']}."
                    ]);
                }
            }

            // Clear the cart
            $clearCart = $this->db->prepare("DELETE FROM user_cart WHERE user_id = :uid");
            $clearCart->execute([':uid' => $user_id]);

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}
