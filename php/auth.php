<?php
/**
 * Authentication Handler (Static Demo Mode)
 * Handles login, registration, and authentication for demo purposes
 */

require_once 'config.php';

// Initialize session configuration for better cross-environment compatibility
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 0); // Allow HTTP for local development
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.use_strict_mode', 1);
ini_set('session.cookie_lifetime', SESSION_LIFETIME);
ini_set('session.cookie_domain', '');

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
            $username = sanitizeInput($_POST['username'] ?? '');
            $password = $_POST['password'] ?? '';
            
            if (empty($username) || empty($password)) {
                sendResponse(['error' => 'Username and password are required'], 400);
            }
            
            $mockStorage = MockDataStorage::getInstance();
            $user = $mockStorage->authenticateUser($username, $password);
            
            if (!$user) {
                sendResponse(['error' => 'Invalid username or password'], 401);
            }
            
            // Create session
            $sessionId = $mockStorage->createSession($user['id']);
            
            // Set session cookie with environment-aware configuration
            $cookieOptions = [
                'expires' => time() + SESSION_LIFETIME,
                'path' => '/',
                'secure' => false, // Allow both HTTP and HTTPS
                'httponly' => true,
                'samesite' => 'Lax'
            ];
            
            // Enhanced cookie setting with fallback for older PHP versions
            if (version_compare(PHP_VERSION, '7.3.0', '>=')) {
                setcookie('session_id', $sessionId, $cookieOptions);
            } else {
                // Fallback for older PHP versions
                setcookie('session_id', $sessionId, time() + SESSION_LIFETIME, '/', '', false, true);
            }
            
            // Also set a backup header for debugging
            header('Set-Cookie: session_id=' . $sessionId . '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' . SESSION_LIFETIME);
            
            // Remove password from response
            unset($user['password']);
            
            sendResponse([
                'success' => true,
                'message' => 'Login successful',
                'user' => $user,
                'redirect' => $this->getDashboardUrl($user['role'])
            ]);
            
        } catch (Exception $e) {
            logError("Login error: " . $e->getMessage());
            sendResponse(['error' => 'Login failed'], 500);
        }
    }
    
    private function getDashboardUrl($role) {
        switch ($role) {
            case 'patient':
                return 'dashboard-patient.html';
            case 'doctor':
                return 'dashboard-doctor.html';
            case 'admin':
            case 'staff':
                return 'dashboard-admin.html';
            default:
                return 'index.html';
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