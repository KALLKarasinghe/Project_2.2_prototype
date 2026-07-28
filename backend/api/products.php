<?php
/**
 * Products API
 * GET  /api/products.php?role=Supplier&company_id=5 - Get products for a specific company
 * GET  /api/products.php?role=Pharmacy             - Get all available products (stock > 0)
 * GET  /api/products.php?role=Customer             - Get all available products (stock > 0)
 * POST /api/products.php                           - Add new product (supplier only)
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../controllers/ProductController.php';

$controller = new ProductController();
$controller->handleRequest();
