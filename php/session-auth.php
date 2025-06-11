<?php
/**
 * Session Authentication Handler
 * Handles session management and user authentication
 */

require_once 'config.php';

function getCurrentUser() {
    if (!isset($_COOKIE['session_id'])) {
        return null;
    }
    
    $mockStorage = MockDataStorage::getInstance();
    $session = $mockStorage->getSession($_COOKIE['session_id']);
    
    if (!$session) {
        return null;
    }
    
    $user = $mockStorage->getUserById($session['user_id']);
    if ($user) {
        unset($user['password']);
    }
    
    return $user;
}

function requireAuth($allowedRoles = []) {
    $user = getCurrentUser();
    
    if (!$user) {
        header('Location: login.html');
        exit;
    }
    
    if (!empty($allowedRoles) && !in_array($user['role'], $allowedRoles)) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        exit;
    }
    
    return $user;
}

function hasPermission($user, $permission) {
    if ($user['role'] === 'admin') {
        return true;
    }
    
    return isset($user['permissions']) && in_array($permission, $user['permissions']);
}

// API endpoint for checking authentication status
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['check_auth'])) {
    setCORSHeaders();
    
    $user = getCurrentUser();
    if ($user) {
        sendResponse([
            'authenticated' => true,
            'user' => $user
        ]);
    } else {
        sendResponse([
            'authenticated' => false
        ]);
    }
}
?>