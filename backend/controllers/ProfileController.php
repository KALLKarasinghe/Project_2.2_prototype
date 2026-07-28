<?php
/**
 * ProfileController
 */
require_once __DIR__ . '/../models/User.php';

class ProfileController {
    private $userModel;

    public function __construct($db) {
        $this->userModel = new User($db);
    }

    // handle requests
    public function handleRequest($method, $data, $files) {
        if ($method === 'GET') {
            return $this->getProfile($data);
        } elseif ($method === 'POST') {
            return $this->updateProfile($data, $files);
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
    }

    // get user profile
    private function getProfile($data) {
        $user_id = $data['user_id'] ?? null;
        
        if (!$user_id) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID is required']);
            return;
        }

        try {
            $user = $this->userModel->getUserById($user_id);
            
            if ($user) {
                echo json_encode(['success' => true, 'user' => $user]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    // update user profile
    private function updateProfile($data, $files) {
        $user_id = $data['user_id'] ?? null;
        
        if (!$user_id) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID is required']);
            return;
        }

        // handle profile picture upload
        if (isset($files['profile_pic']) && $files['profile_pic']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../../uploads/profiles/';
            // wait, the path should be relative to controller, let's fix the path
            $uploadDir = __DIR__ . '/../uploads/profiles/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $fileTmpPath = $files['profile_pic']['tmp_name'];
            $fileName = $files['profile_pic']['name'];
            $fileNameCmps = explode(".", $fileName);
            $fileExtension = strtolower(end($fileNameCmps));
            
            $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
            $dest_path = $uploadDir . $newFileName;
            
            if (move_uploaded_file($fileTmpPath, $dest_path)) {
                // save relative path for frontend access
                $profile_pic_path = '/pharma_backend/uploads/profiles/' . $newFileName;
                $data['profile_pic'] = $profile_pic_path;
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Error moving the uploaded file']);
                return;
            }
        }

        try {
            // update user fields in database
            $this->userModel->updateUser($user_id, $data);
            
            // fetch updated user to return
            $updatedUser = $this->userModel->getUserById($user_id);
            
            echo json_encode(['success' => true, 'user' => $updatedUser]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
