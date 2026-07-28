<?php
/**
 * Medicines API
 * GET  /api/medicines.php?role=Supplier&company_id=5 - Get medicines for a specific company
 * GET  /api/medicines.php?role=Pharmacy             - Get all available medicines (stock > 0)
 * GET  /api/medicines.php?role=Customer             - Get all available medicines (stock > 0)
 * POST /api/medicines.php                           - Add new medicine (supplier only)
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../controllers/MedicineController.php';

$controller = new MedicineController();
$controller->handleRequest();
