<?php
/**
 * Custom Session Handler
 * Manages user sessions with database storage for enhanced security and control
 */

require_once 'config.php';

class CustomSessionHandler {
    private $db;
    private $sessionLifetime;
    
    public function __construct($sessionLifetime = SESSION_LIFETIME) {
        $this->db = Database::getInstance()->getConnection();
        $this->sessionLifetime = $sessionLifetime;
        
        // Clean up expired sessions periodically
        $this->cleanupExpiredSessions();
    }
    
    /**
     * Create a new session
     */
    public function createSession($userId, $sessionData = [], $customLifetime = null) {
        try {
            $sessionId = $this->generateSessionId();
            $lifetime = $customLifetime ?? $this->sessionLifetime;
            $expiresAt = new DateTime();
            $expiresAt->add(new DateInterval('PT' . $lifetime . 'S'));
            
            // Store additional session metadata
            $sessionInfo = [
                'user_id' => $userId,
                'ip_address' => $this->getClientIP(),
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
                'created_at' => date('Y-m-d H:i:s'),
                'last_activity' => date('Y-m-d H:i:s'),
                'data' => $sessionData
            ];
            
            $stmt = $this->db->prepare("
                INSERT INTO sessions (id, user_id, data, created_at, expires_at) 
                VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)
            ");
            
            $stmt->execute([
                $sessionId,
                $userId,
                json_encode($sessionInfo),
                $expiresAt->format('Y-m-d H:i:s')
            ]);
            
            // Set secure session cookie
            $this->setSessionCookie($sessionId, $lifetime);
            
            logError("Session created", [
                'sessionId' => substr($sessionId, 0, 8) . '...',
                'userId' => $userId,
                'expiresAt' => $expiresAt->format('Y-m-d H:i:s')
            ]);
            
            return $sessionId;
            
        } catch (PDOException $e) {
            logError("Session creation failed: " . $e->getMessage());
            throw new Exception("Failed to create session");
        }
    }
    
    /**
     * Get session data
     */
    public function getSession($sessionId) {
        try {
            if (empty($sessionId)) {
                return null;
            }
            
            $stmt = $this->db->prepare("
                SELECT s.*, u.first_name, u.last_name, u.email, u.is_active
                FROM sessions s
                JOIN users u ON s.user_id = u.id
                WHERE s.id = ? AND s.expires_at > NOW() AND u.is_active = TRUE
            ");
            $stmt->execute([$sessionId]);
            $session = $stmt->fetch();
            
            if (!$session) {
                return null;
            }
            
            // Parse session data
            $sessionData = json_decode($session['data'], true);
            
            // Validate session security
            if (!$this->validateSessionSecurity($sessionData)) {
                $this->destroySession($sessionId);
                return null;
            }
            
            // Update last activity
            $this->updateSessionActivity($sessionId);
            
            // Return user data
            return [
                'id' => (int)$session['user_id'],
                'firstName' => $session['first_name'],
                'lastName' => $session['last_name'],
                'email' => $session['email'],
                'sessionId' => $sessionId,
                'sessionData' => $sessionData['data'] ?? []
            ];
            
        } catch (PDOException $e) {
            logError("Session retrieval failed: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Update session data
     */
    public function updateSession($sessionId, $newData) {
        try {
            $currentSession = $this->getSession($sessionId);
            if (!$currentSession) {
                return false;
            }
            
            // Get current session info
            $stmt = $this->db->prepare("SELECT data FROM sessions WHERE id = ?");
            $stmt->execute([$sessionId]);
            $session = $stmt->fetch();
            
            if (!$session) {
                return false;
            }
            
            $sessionInfo = json_decode($session['data'], true);
            $sessionInfo['data'] = array_merge($sessionInfo['data'] ?? [], $newData);
            $sessionInfo['last_activity'] = date('Y-m-d H:i:s');
            
            $stmt = $this->db->prepare("UPDATE sessions SET data = ? WHERE id = ?");
            $stmt->execute([json_encode($sessionInfo), $sessionId]);
            
            return true;
            
        } catch (PDOException $e) {
            logError("Session update failed: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Destroy a session
     */
    public function destroySession($sessionId) {
        try {
            if (empty($sessionId)) {
                return true;
            }
            
            $stmt = $this->db->prepare("DELETE FROM sessions WHERE id = ?");
            $stmt->execute([$sessionId]);
            
            // Clear session cookie
            $this->clearSessionCookie();
            
            logError("Session destroyed", [
                'sessionId' => substr($sessionId, 0, 8) . '...'
            ]);
            
            return true;
            
        } catch (PDOException $e) {
            logError("Session destruction failed: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Destroy all sessions for a user
     */
    public function destroyAllUserSessions($userId) {
        try {
            $stmt = $this->db->prepare("DELETE FROM sessions WHERE user_id = ?");
            $stmt->execute([$userId]);
            
            logError("All user sessions destroyed", ['userId' => $userId]);
            
            return true;
            
        } catch (PDOException $e) {
            logError("User sessions destruction failed: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Extend session lifetime
     */
    public function extendSession($sessionId, $additionalTime = null) {
        try {
            $extension = $additionalTime ?? $this->sessionLifetime;
            $newExpiryTime = new DateTime();
            $newExpiryTime->add(new DateInterval('PT' . $extension . 'S'));
            
            $stmt = $this->db->prepare("
                UPDATE sessions 
                SET expires_at = ? 
                WHERE id = ? AND expires_at > NOW()
            ");
            $stmt->execute([
                $newExpiryTime->format('Y-m-d H:i:s'),
                $sessionId
            ]);
            
            return $stmt->rowCount() > 0;
            
        } catch (PDOException $e) {
            logError("Session extension failed: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get all active sessions for a user
     */
    public function getUserSessions($userId) {
        try {
            $stmt = $this->db->prepare("
                SELECT id, data, created_at, expires_at 
                FROM sessions 
                WHERE user_id = ? AND expires_at > NOW()
                ORDER BY created_at DESC
            ");
            $stmt->execute([$userId]);
            $sessions = $stmt->fetchAll();
            
            return array_map(function($session) {
                $sessionData = json_decode($session['data'], true);
                return [
                    'id' => $session['id'],
                    'created_at' => $session['created_at'],
                    'expires_at' => $session['expires_at'],
                    'ip_address' => $sessionData['ip_address'] ?? 'Unknown',
                    'user_agent' => $this->parseUserAgent($sessionData['user_agent'] ?? ''),
                    'last_activity' => $sessionData['last_activity'] ?? $session['created_at']
                ];
            }, $sessions);
            
        } catch (PDOException $e) {
            logError("Getting user sessions failed: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Validate session security
     */
    private function validateSessionSecurity($sessionData) {
        // Check IP address (optional, can be disabled for mobile users)
        $currentIP = $this->getClientIP();
        $sessionIP = $sessionData['ip_address'] ?? '';
        
        // For now, we'll be lenient with IP checking due to mobile networks
        // In production, you might want to implement more sophisticated IP validation
        
        // Check user agent consistency (basic check)
        $currentUserAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $sessionUserAgent = $sessionData['user_agent'] ?? '';
        
        // Allow some flexibility in user agent checking
        if (!empty($sessionUserAgent) && !empty($currentUserAgent)) {
            $sessionAgentCore = $this->extractUserAgentCore($sessionUserAgent);
            $currentAgentCore = $this->extractUserAgentCore($currentUserAgent);
            
            if ($sessionAgentCore !== $currentAgentCore) {
                logError("Session security validation failed: User agent mismatch", [
                    'sessionAgent' => substr($sessionUserAgent, 0, 50),
                    'currentAgent' => substr($currentUserAgent, 0, 50)
                ]);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Update session activity timestamp
     */
    private function updateSessionActivity($sessionId) {
        try {
            // Only update if last activity was more than 1 minute ago to reduce database writes
            $stmt = $this->db->prepare("
                SELECT data FROM sessions 
                WHERE id = ? AND 
                (JSON_EXTRACT(data, '$.last_activity') IS NULL OR 
                 JSON_EXTRACT(data, '$.last_activity') < DATE_SUB(NOW(), INTERVAL 1 MINUTE))
            ");
            $stmt->execute([$sessionId]);
            
            if ($stmt->rowCount() > 0) {
                $session = $stmt->fetch();
                $sessionData = json_decode($session['data'], true);
                $sessionData['last_activity'] = date('Y-m-d H:i:s');
                
                $updateStmt = $this->db->prepare("UPDATE sessions SET data = ? WHERE id = ?");
                $updateStmt->execute([json_encode($sessionData), $sessionId]);
            }
            
        } catch (PDOException $e) {
            // Non-critical error, just log it
            logError("Session activity update failed: " . $e->getMessage());
        }
    }
    
    /**
     * Clean up expired sessions
     */
    public function cleanupExpiredSessions() {
        try {
            $stmt = $this->db->prepare("DELETE FROM sessions WHERE expires_at <= NOW()");
            $stmt->execute();
            
            $deletedCount = $stmt->rowCount();
            if ($deletedCount > 0) {
                logError("Cleaned up expired sessions", ['count' => $deletedCount]);
            }
            
            return $deletedCount;
            
        } catch (PDOException $e) {
            logError("Session cleanup failed: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Generate secure session ID
     */
    private function generateSessionId() {
        return bin2hex(random_bytes(32));
    }
    
    /**
     * Get client IP address
     */
    private function getClientIP() {
        $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                // Handle comma-separated IPs (from proxies)
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                
                // Validate IP address
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
    
    /**
     * Extract core user agent information for comparison
     */
    private function extractUserAgentCore($userAgent) {
        // Extract browser and major version for comparison
        if (preg_match('/Chrome\/(\d+)/', $userAgent, $matches)) {
            return 'Chrome/' . $matches[1];
        } elseif (preg_match('/Firefox\/(\d+)/', $userAgent, $matches)) {
            return 'Firefox/' . $matches[1];
        } elseif (preg_match('/Safari\/(\d+)/', $userAgent, $matches)) {
            return 'Safari/' . $matches[1];
        } elseif (preg_match('/Edge\/(\d+)/', $userAgent, $matches)) {
            return 'Edge/' . $matches[1];
        }
        
        return substr($userAgent, 0, 20); // Fallback to first 20 characters
    }
    
    /**
     * Parse user agent for display
     */
    private function parseUserAgent($userAgent) {
        if (empty($userAgent)) {
            return 'Unknown Browser';
        }
        
        // Extract browser name and version
        if (preg_match('/Chrome\/([0-9.]+)/', $userAgent, $matches)) {
            return 'Chrome ' . explode('.', $matches[1])[0];
        } elseif (preg_match('/Firefox\/([0-9.]+)/', $userAgent, $matches)) {
            return 'Firefox ' . explode('.', $matches[1])[0];
        } elseif (preg_match('/Safari\/([0-9.]+)/', $userAgent, $matches)) {
            return 'Safari ' . explode('.', $matches[1])[0];
        } elseif (preg_match('/Edge\/([0-9.]+)/', $userAgent, $matches)) {
            return 'Edge ' . explode('.', $matches[1])[0];
        }
        
        return 'Unknown Browser';
    }
    
    /**
     * Set secure session cookie
     */
    private function setSessionCookie($sessionId, $lifetime) {
        $cookieOptions = [
            'expires' => time() + $lifetime,
            'path' => '/',
            'domain' => '',
            'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
            'httponly' => true,
            'samesite' => 'Lax'
        ];
        
        setcookie('session_id', $sessionId, $cookieOptions);
    }
    
    /**
     * Clear session cookie
     */
    private function clearSessionCookie() {
        $cookieOptions = [
            'expires' => time() - 3600,
            'path' => '/',
            'domain' => '',
            'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
            'httponly' => true,
            'samesite' => 'Lax'
        ];
        
        setcookie('session_id', '', $cookieOptions);
    }
    
    /**
     * Check if session exists and is valid
     */
    public function isValidSession($sessionId) {
        if (empty($sessionId)) {
            return false;
        }
        
        $session = $this->getSession($sessionId);
        return $session !== null;
    }
    
    /**
     * Get session statistics
     */
    public function getSessionStats() {
        try {
            $stmt = $this->db->query("
                SELECT 
                    COUNT(*) as total_sessions,
                    COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active_sessions,
                    COUNT(DISTINCT user_id) as unique_users,
                    AVG(TIMESTAMPDIFF(MINUTE, created_at, COALESCE(expires_at, NOW()))) as avg_duration_minutes
                FROM sessions
            ");
            
            return $stmt->fetch();
            
        } catch (PDOException $e) {
            logError("Session stats failed: " . $e->getMessage());
            return [
                'total_sessions' => 0,
                'active_sessions' => 0,
                'unique_users' => 0,
                'avg_duration_minutes' => 0
            ];
        }
    }
}

// Utility function to get current session handler instance
function getCurrentSessionHandler() {
    static $instance = null;
    if ($instance === null) {
        $instance = new SessionHandler();
    }
    return $instance;
}

// Utility function to get current user from session
function getCurrentUser() {
    $sessionHandler = getCurrentSessionHandler();
    $sessionId = $_COOKIE['session_id'] ?? '';
    
    if (!$sessionId) {
        return null;
    }
    
    return $sessionHandler->getSession($sessionId);
}

// Utility function to require authentication
function requireAuth() {
    $user = getCurrentUser();
    if (!$user) {
        setCORSHeaders();
        sendResponse(['error' => 'Authentication required'], 401);
    }
    return $user;
}
?>
