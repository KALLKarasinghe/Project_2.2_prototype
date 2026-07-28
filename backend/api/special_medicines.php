<?php
/**
 * Special Medicines API
 * GET    /api/special_medicines.php       - Get all special medicines
 * POST   /api/special_medicines.php       - Add new special medicine
 * DELETE /api/special_medicines.php?id=1  - Delete special medicine
 */
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../controllers/SpecialMedicineController.php';

$controller = new SpecialMedicineController();
$controller->handleRequest();
