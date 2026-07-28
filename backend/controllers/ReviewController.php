<?php
require_once __DIR__ . '/../models/Review.php';

class ReviewController {
    private $reviewModel;

    public function __construct($db) {
        $this->reviewModel = new Review($db);
    }

    // handle API request
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'POST') {
            $this->createReview();
        } elseif ($method === 'GET') {
            $this->getReviews();
        } else {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
        }
    }

    // create a new review
    private function createReview() {
        $data = json_decode(file_get_contents("php://input"), true);
        $reviewer_id = $data['reviewer_id'] ?? null;
        $target_id = $data['target_id'] ?? null;
        $rating = $data['rating'] ?? 0;
        $comment = $data['comment'] ?? '';

        // validate rating data
        if (!$reviewer_id || !$target_id || $rating < 1 || $rating > 5) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid rating data."]);
            exit;
        }

        try {
            // fetch user name for reviewer field
            $reviewer_name = $this->reviewModel->getUserName($reviewer_id);

            // save the review
            $this->reviewModel->createReview($target_id, $reviewer_name, $rating, $comment);
            
            echo json_encode(["success" => true, "message" => "Review submitted successfully!"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database Error: " . $e->getMessage()]);
        }
    }

    // get reviews for a product
    private function getReviews() {
        $target_id = $_GET['target_id'] ?? null;
        
        // validate target_id
        if (!$target_id) {
            http_response_code(400);
            echo json_encode(["error" => "target_id is required."]);
            exit;
        }
        
        try {
            $reviews = $this->reviewModel->getReviewsByTarget($target_id);
            echo json_encode(["success" => true, "data" => $reviews]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database Error: " . $e->getMessage()]);
        }
    }
}
