<?php
/**
 * Simple Session Handler (Static Demo Mode)
 * Manages basic session functionality without database storage
 */

require_once 'config.php';

setCORSHeaders();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Simple session check endpoint
$sessionId = $_COOKIE['session_id'] ?? '';

if (empty($sessionId)) {
    sendResponse([
        'authenticated' => false,
        'user' => null
    ]);
} else {
    // For demo purposes, return a mock authenticated user
    sendResponse([
        'authenticated' => true,
        'user' => [
            'id' => 1,
            'firstName' => 'Demo',
            'lastName' => 'User',
            'email' => 'demo@healthcareplus.com'
        ]
    ]);
}
?>