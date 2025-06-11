<?php
/**
 * Authentication Handler
 * Handles user registration, login, logout, and session management
 */

require_once 'config.php';
require_once 'session-handler.php';

setCORSHeaders();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

class AuthHandler {
    private $db;
    private $sessionHandler;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->sessionHandler = new SessionHandler();
    }
    
    public function handleRequest() {
        $action = $_POST['action'] ?? $_GET['action'] ?? '';
        
        switch ($action) {
            case 'register':
                $this->register();
                break;
            case 'login':
                $this->login();
                break;
            case 'logout':
                $this->logout();
                break;
            case 'verify-email':
                $this->verifyEmail();
                break;
            case 'reset-password':
                $this->resetPassword();
                break;
            default:
                sendResponse(['error' => 'Invalid action'], 400);
        }
    }
    
    private function register() {
        try {
            // Validate input
            $requiredFields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender', 'password'];
            $data = [];
            
            foreach ($requiredFields as $field) {
                if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
                    sendResponse(['error' => "Field '{$field}' is required"], 400);
                }
                $data[$field] = sanitizeInput($_POST[$field]);
            }
            
            // Validate email
            if (!validateEmail($data['email'])) {
                sendResponse(['error' => 'Invalid email address'], 400);
            }
            
            // Validate phone
            if (!validatePhone($data['phone'])) {
                sendResponse(['error' => 'Invalid phone number'], 400);
            }
            
            // Validate password
            if (strlen($data['password']) < PASSWORD_MIN_LENGTH) {
                sendResponse(['error' => 'Password must be at least ' . PASSWORD_MIN_LENGTH . ' characters long'], 400);
            }
            
            // Validate date of birth
            $dateOfBirth = DateTime::createFromFormat('Y-m-d', $data['dateOfBirth']);
            if (!$dateOfBirth) {
                sendResponse(['error' => 'Invalid date of birth'], 400);
            }
            
            // Check age (must be at least 13 years old)
            $today = new DateTime();
            $age = $today->diff($dateOfBirth)->y;
            if ($age < 13) {
                sendResponse(['error' => 'You must be at least 13 years old to register'], 400);
            }
            
            // Check if email already exists
            $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$data['email']]);
            if ($stmt->rowCount() > 0) {
                sendResponse(['error' => 'Email address is already registered'], 409);
            }
            
            // Hash password
            $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);
            
            // Insert user
            $stmt = $this->db->prepare("
                INSERT INTO users (first_name, last_name, email, phone, date_of_birth, gender, password_hash) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $data['firstName'],
                $data['lastName'],
                $data['email'],
                $data['phone'],
                $data['dateOfBirth'],
                $data['gender'],
                $passwordHash
            ]);
            
            $userId = $this->db->lastInsertId();
            
            // Create session
            $sessionData = [
                'id' => $userId,
                'firstName' => $data['firstName'],
                'lastName' => $data['lastName'],
                'email' => $data['email']
            ];
            
            $sessionId = $this->sessionHandler->createSession($userId, $sessionData);
            
            sendResponse([
                'success' => true,
                'message' => 'Registration successful',
                'user' => $sessionData,
                'sessionId' => $sessionId
            ]);
            
        } catch (PDOException $e) {
            logError("Registration error: " . $e->getMessage());
            sendResponse(['error' => 'Registration failed. Please try again.'], 500);
        }
    }
    
    private function login() {
        try {
            $email = sanitizeInput($_POST['email'] ?? '');
            $password = $_POST['password'] ?? '';
            $remember = isset($_POST['remember']);
            
            if (empty($email) || empty($password)) {
                sendResponse(['error' => 'Email and password are required'], 400);
            }
            
            if (!validateEmail($email)) {
                sendResponse(['error' => 'Invalid email address'], 400);
            }
            
            // Get user from database
            $stmt = $this->db->prepare("
                SELECT id, first_name, last_name, email, password_hash, is_active, 
                       login_attempts, last_login_attempt, locked_until 
                FROM users WHERE email = ?
            ");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            
            if (!$user) {
                sendResponse(['error' => 'Invalid email or password'], 401);
            }
            
            // Check if account is active
            if (!$user['is_active']) {
                sendResponse(['error' => 'Account is deactivated. Please contact support.'], 403);
            }
            
            // Check if account is locked
            if ($user['locked_until'] && new DateTime() < new DateTime($user['locked_until'])) {
                $lockedUntil = new DateTime($user['locked_until']);
                $remainingTime = $lockedUntil->diff(new DateTime())->format('%i minutes');
                sendResponse(['error' => "Account is locked. Try again in {$remainingTime}."], 423);
            }
            
            // Check login attempts
            if ($user['login_attempts'] >= MAX_LOGIN_ATTEMPTS) {
                $lastAttempt = new DateTime($user['last_login_attempt']);
                $now = new DateTime();
                $timeDiff = $now->getTimestamp() - $lastAttempt->getTimestamp();
                
                if ($timeDiff < LOCKOUT_TIME) {
                    $lockoutExpiry = clone $lastAttempt;
                    $lockoutExpiry->add(new DateInterval('PT' . LOCKOUT_TIME . 'S'));
                    
                    $updateStmt = $this->db->prepare("UPDATE users SET locked_until = ? WHERE id = ?");
                    $updateStmt->execute([$lockoutExpiry->format('Y-m-d H:i:s'), $user['id']]);
                    
                    sendResponse(['error' => 'Too many failed login attempts. Account locked for 15 minutes.'], 423);
                }
            }
            
            // Verify password
            if (!password_verify($password, $user['password_hash'])) {
                // Increment login attempts
                $newAttempts = $user['login_attempts'] + 1;
                $stmt = $this->db->prepare("
                    UPDATE users SET login_attempts = ?, last_login_attempt = NOW() WHERE id = ?
                ");
                $stmt->execute([$newAttempts, $user['id']]);
                
                sendResponse(['error' => 'Invalid email or password'], 401);
            }
            
            // Reset login attempts on successful login
            $stmt = $this->db->prepare("
                UPDATE users SET login_attempts = 0, last_login_attempt = NULL, locked_until = NULL 
                WHERE id = ?
            ");
            $stmt->execute([$user['id']]);
            
            // Create session
            $sessionData = [
                'id' => $user['id'],
                'firstName' => $user['first_name'],
                'lastName' => $user['last_name'],
                'email' => $user['email']
            ];
            
            $sessionLifetime = $remember ? SESSION_LIFETIME * 24 : SESSION_LIFETIME; // 24 hours if remember me
            $sessionId = $this->sessionHandler->createSession($user['id'], $sessionData, $sessionLifetime);
            
            sendResponse([
                'success' => true,
                'message' => 'Login successful',
                'user' => $sessionData,
                'sessionId' => $sessionId
            ]);
            
        } catch (PDOException $e) {
            logError("Login error: " . $e->getMessage());
            sendResponse(['error' => 'Login failed. Please try again.'], 500);
        }
    }
    
    private function logout() {
        try {
            $sessionId = $_COOKIE['session_id'] ?? $_POST['sessionId'] ?? '';
            
            if ($sessionId) {
                $this->sessionHandler->destroySession($sessionId);
            }
            
            // Clear session cookie
            setcookie('session_id', '', time() - 3600, '/', '', false, true);
            
            sendResponse([
                'success' => true,
                'message' => 'Logged out successfully'
            ]);
            
        } catch (Exception $e) {
            logError("Logout error: " . $e->getMessage());
            sendResponse(['error' => 'Logout failed'], 500);
        }
    }
    
    private function verifyEmail() {
        // Email verification functionality (placeholder)
        sendResponse(['error' => 'Email verification not implemented yet'], 501);
    }
    
    private function resetPassword() {
        try {
            $email = sanitizeInput($_POST['email'] ?? '');
            
            if (empty($email) || !validateEmail($email)) {
                sendResponse(['error' => 'Valid email address is required'], 400);
            }
            
            // Check if user exists
            $stmt = $this->db->prepare("SELECT id, first_name FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            
            if (!$user) {
                // Don't reveal whether email exists or not
                sendResponse([
                    'success' => true,
                    'message' => 'If an account with that email exists, a password reset link has been sent.'
                ]);
                return;
            }
            
            // Generate reset token
            $resetToken = bin2hex(random_bytes(32));
            $expiryTime = new DateTime('+1 hour');
            
            // Store reset token (you'd need to create a password_resets table)
            // For now, just return success message
            
            sendResponse([
                'success' => true,
                'message' => 'If an account with that email exists, a password reset link has been sent.'
            ]);
            
        } catch (Exception $e) {
            logError("Password reset error: " . $e->getMessage());
            sendResponse(['error' => 'Password reset failed. Please try again.'], 500);
        }
    }
    
    public function getCurrentUser() {
        $sessionId = $_COOKIE['session_id'] ?? '';
        
        if (!$sessionId) {
            return null;
        }
        
        return $this->sessionHandler->getSession($sessionId);
    }
    
    public function requireAuth() {
        $user = $this->getCurrentUser();
        
        if (!$user) {
            sendResponse(['error' => 'Authentication required'], 401);
        }
        
        return $user;
    }
}

// Handle the request
if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'GET') {
    $authHandler = new AuthHandler();
    $authHandler->handleRequest();
} else {
    sendResponse(['error' => 'Method not allowed'], 405);
}
?>
