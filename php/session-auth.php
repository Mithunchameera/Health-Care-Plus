<?php
/**
 * Session Authentication API (Static Demo Mode)
 * Provides authentication checking for dashboard pages
 */

require_once 'config.php';

setCORSHeaders();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Check for authentication request
if (isset($_GET['check_auth'])) {
    $sessionId = $_COOKIE['session_id'] ?? '';
    
    if (empty($sessionId)) {
        sendResponse([
            'authenticated' => false,
            'user' => null
        ]);
    } else {
        $mockStorage = MockDataStorage::getInstance();
        $session = $mockStorage->getSession($sessionId);
        
        if ($session) {
            $user = $mockStorage->getUserById($session['user_id']);
            if ($user) {
                // Remove password from response
                unset($user['password']);
                
                sendResponse([
                    'authenticated' => true,
                    'user' => $user
                ]);
            } else {
                sendResponse([
                    'authenticated' => false,
                    'user' => null
                ]);
            }
        } else {
            sendResponse([
                'authenticated' => false,
                'user' => null
            ]);
        }
    }
} else {
    sendResponse(['error' => 'Invalid request'], 400);
}
?>