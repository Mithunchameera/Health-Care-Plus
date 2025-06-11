<?php
/**
 * Authentication Handler (Static Demo Mode)
 * Handles login, registration, and authentication for demo purposes
 */

require_once 'config.php';

setCORSHeaders();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

class AuthHandler {
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        if ($method === 'POST') {
            $this->handlePostRequest();
        } else {
            sendResponse(['error' => 'Method not allowed'], 405);
        }
    }
    
    private function handlePostRequest() {
        $action = $_POST['action'] ?? '';
        
        switch ($action) {
            case 'login':
                $this->login();
                break;
            case 'register':
                $this->register();
                break;
            case 'logout':
                $this->logout();
                break;
            default:
                sendResponse(['error' => 'Invalid action'], 400);
        }
    }
    
    private function login() {
        try {
            $email = sanitizeInput($_POST['email'] ?? '');
            $password = $_POST['password'] ?? '';
            
            if (empty($email) || empty($password)) {
                sendResponse(['error' => 'Email and password are required'], 400);
            }
            
            if (!validateEmail($email)) {
                sendResponse(['error' => 'Invalid email format'], 400);
            }
            
            // For demo purposes, accept any valid email/password combination
            if (strlen($password) >= 6) {
                // Create a demo session
                $sessionId = bin2hex(random_bytes(32));
                
                // Set session cookie
                setcookie('session_id', $sessionId, [
                    'expires' => time() + 3600,
                    'path' => '/',
                    'secure' => false,
                    'httponly' => true,
                    'samesite' => 'Lax'
                ]);
                
                sendResponse([
                    'success' => true,
                    'message' => 'Login successful',
                    'user' => [
                        'id' => 1,
                        'firstName' => 'Demo',
                        'lastName' => 'User',
                        'email' => $email
                    ]
                ]);
            } else {
                sendResponse(['error' => 'Password must be at least 6 characters'], 400);
            }
            
        } catch (Exception $e) {
            logError("Login error: " . $e->getMessage());
            sendResponse(['error' => 'Login failed'], 500);
        }
    }
    
    private function register() {
        try {
            $firstName = sanitizeInput($_POST['first_name'] ?? '');
            $lastName = sanitizeInput($_POST['last_name'] ?? '');
            $email = sanitizeInput($_POST['email'] ?? '');
            $phone = sanitizeInput($_POST['phone'] ?? '');
            $dateOfBirth = $_POST['date_of_birth'] ?? '';
            $gender = sanitizeInput($_POST['gender'] ?? '');
            $password = $_POST['password'] ?? '';
            $confirmPassword = $_POST['confirm_password'] ?? '';
            
            // Validate required fields
            $errors = [];
            
            if (empty($firstName)) {
                $errors[] = 'First name is required';
            }
            
            if (empty($lastName)) {
                $errors[] = 'Last name is required';
            }
            
            if (!validateEmail($email)) {
                $errors[] = 'Valid email address is required';
            }
            
            if (!validatePhone($phone)) {
                $errors[] = 'Valid phone number is required';
            }
            
            if (empty($dateOfBirth) || !strtotime($dateOfBirth)) {
                $errors[] = 'Valid date of birth is required';
            }
            
            if (!in_array($gender, ['male', 'female', 'other'])) {
                $errors[] = 'Valid gender is required';
            }
            
            if (strlen($password) < PASSWORD_MIN_LENGTH) {
                $errors[] = 'Password must be at least ' . PASSWORD_MIN_LENGTH . ' characters long';
            }
            
            if ($password !== $confirmPassword) {
                $errors[] = 'Passwords do not match';
            }
            
            if (!empty($errors)) {
                sendResponse(['error' => 'Validation failed', 'details' => $errors], 400);
            }
            
            // For demo purposes, always return success
            sendResponse([
                'success' => true,
                'message' => 'Registration successful! You can now login.',
                'user' => [
                    'firstName' => $firstName,
                    'lastName' => $lastName,
                    'email' => $email
                ]
            ]);
            
        } catch (Exception $e) {
            logError("Registration error: " . $e->getMessage());
            sendResponse(['error' => 'Registration failed'], 500);
        }
    }
    
    private function logout() {
        try {
            // Clear session cookie
            setcookie('session_id', '', [
                'expires' => time() - 3600,
                'path' => '/',
                'secure' => false,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
            
            sendResponse([
                'success' => true,
                'message' => 'Logout successful'
            ]);
            
        } catch (Exception $e) {
            logError("Logout error: " . $e->getMessage());
            sendResponse(['error' => 'Logout failed'], 500);
        }
    }
}

// Handle the request
$authHandler = new AuthHandler();
$authHandler->handleRequest();
?>