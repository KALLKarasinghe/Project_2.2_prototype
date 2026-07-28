<?php
/**
 * Cart API — Database-backed persistent cart
 * GET    /api/cart.php?user_id=5          - Fetch all cart items for a user
 * POST   /api/cart.php                    - Add or update a cart item (JSON: { user_id, medicine_id, quantity })
 * PUT    /api/cart.php                    - Set exact quantity
 * DELETE /api/cart.php?user_id=5&medicine_id=3   - Remove a specific item
 * DELETE /api/cart.php?user_id=5&clear_all=true  - Clear entire cart for user
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/CartController.php';

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

$controller = new CartController($db);
$controller->handleRequest($method);
