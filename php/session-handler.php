<?php
/**
 * Session Handler (Static Demo Mode)
 * Manages session functionality with mock data storage
 */

require_once 'config.php';

// Initialize session configuration using the secure function
initializeSessionConfig();

setCORSHeaders();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Check session authentication
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
?>