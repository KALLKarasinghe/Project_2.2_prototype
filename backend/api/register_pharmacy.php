<?php
/**
 * API Endpoint: register_pharmacy.php
 * Handles automated pharmacy registration and verification against mock_nmra_database.
 */

require_once '../config/cors.php';
require_once '../config/database.php';

// Get JSON POST data
$data = json_decode(file_get_contents("php://input"));

// Check if all required fields are provided
if (
    empty($data->name) || 
    empty($data->email) || 
    empty($data->password) || 
    empty($data->slmc_number)
) {
    http_response_code(400);
    echo json_encode(["message" => "All fields (name, email, password, slmc_number) are required."]);
    exit;
}

$name = htmlspecialchars(strip_tags($data->name));
$email = htmlspecialchars(strip_tags($data->email));
$password = $data->password; // Will be hashed
$slmc_number = htmlspecialchars(strip_tags($data->slmc_number));

// Connect to database
$database = new Database();
$db = $database->getConnection();

try {
    // 1. Check if SLMC Number exists in mock_nmra_database
    $query = "SELECT * FROM mock_nmra_database WHERE slmc_number = :slmc_number LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":slmc_number", $slmc_number);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        // SLMC Number EXISTS -> Verification successful
        
        // Hash the password
        $password_hash = password_hash($password, PASSWORD_BCRYPT);
        
        // Insert into main users table
        // Note: Using 'Active' for status as per the users table schema for verified users
        $insert_query = "INSERT INTO users (name, email, password, role, status) VALUES (:name, :email, :password, 'Pharmacy', 'Active')";
        $insert_stmt = $db->prepare($insert_query);
        
        $insert_stmt->bindParam(":name", $name);
        $insert_stmt->bindParam(":email", $email);
        $insert_stmt->bindParam(":password", $password_hash);
        
        if ($insert_stmt->execute()) {
            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Registration and automated verification successful!"
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Failed to create user account. Please try again."
            ]);
        }
    } else {
        // SLMC Number DOES NOT EXIST -> Verification failed
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Invalid SLMC Number. Automatic verification failed."
        ]);
    }
} catch (PDOException $e) {
    // Handle potential duplicate email errors or other DB errors
    if ($e->getCode() == 23000) { // Integrity constraint violation (e.g., duplicate email)
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Email address is already registered."
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Database error: " . $e->getMessage()
        ]);
    }
}
?>
