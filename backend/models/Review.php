<?php
class Review {
    private $conn;
    private $table_name = "product_reviews";

    public function __construct($db) {
        $this->conn = $db;
    }

    // fetch the user's name from users table
    public function getUserName($user_id) {
        $query = "SELECT name FROM users WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([':id' => $user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            return $user['name'];
        }
        return 'Anonymous User';
    }

    // create a new product review
    public function createReview($target_id, $reviewer_name, $rating, $comment) {
        $query = "INSERT INTO " . $this->table_name . " (product_id, reviewer, rating, comment, review_date) VALUES (:pid, :rname, :rating, :comment, CURDATE())";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            ':pid' => $target_id,
            ':rname' => $reviewer_name,
            ':rating' => $rating,
            ':comment' => $comment
        ]);
    }

    // get reviews for a product target
    public function getReviewsByTarget($target_id) {
        $query = "SELECT id, product_id as target_id, reviewer as reviewer_name, rating, comment, created_at FROM " . $this->table_name . " WHERE product_id = :tid ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([':tid' => $target_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
