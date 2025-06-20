<?php
/**
 * Session Authentication Handler
 * Manages user authentication and session validation
 */

require_once 'config.php';
require_once 'database.php';

// Set CORS headers
setCORSHeaders();

// Initialize session
initializeSessionConfig();
session_start();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = $_GET['check_auth'] ?? $_POST['action'] ?? '';

if ($action === '1' || $action === 'check_auth') {
    checkAuthentication();
} else {
    handleAuthRequest();
}

function checkAuthentication() {
    header('Content-Type: application/json');
    
    // For demo environment, provide mock authentication
    if (isset($_SESSION['user_id'])) {
        $user = $_SESSION['user'];
    } else {
        // Create mock user session for demo
        $user = [
            'id' => 1,
            'username' => 'demo_user',
            'email' => 'demo@healthcareplus.com',
            'role' => 'patient',
            'first_name' => 'Demo',
            'last_name' => 'User'
        ];
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user'] = $user;
    }
    
    echo json_encode([
        'authenticated' => true,
        'user' => $user
    ]);
}

function handleAuthRequest() {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'login':
            handleLogin($input);
            break;
        case 'logout':
            handleLogout();
            break;
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
            break;
    }
}

function handleLogin($input) {
    header('Content-Type: application/json');
    
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $role = $input['role'] ?? 'patient';
    
    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password required']);
        return;
    }
    
    // For demo, accept any valid email format
    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $user = [
            'id' => 1,
            'username' => explode('@', $email)[0],
            'email' => $email,
            'role' => $role,
            'first_name' => 'Demo',
            'last_name' => 'User'
        ];
        
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user'] = $user;
        
        echo json_encode([
            'success' => true,
            'user' => $user,
            'redirect' => getDashboardUrl($role)
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
}

function handleLogout() {
    header('Content-Type: application/json');
    
    // Clear session
    session_destroy();
    
    echo json_encode(['success' => true]);
}

function getDashboardUrl($role) {
    switch ($role) {
        case 'admin':
            return 'dashboard-admin.html';
        case 'doctor':
            return 'dashboard-doctor.html';
        case 'patient':
        default:
            return 'dashboard-patient.html';
    }
}
?>