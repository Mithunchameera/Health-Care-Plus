<?php
/**
 * Performance Optimization Headers
 * Add caching and compression headers
 */

// Enable output compression
if (!ob_get_level()) {
    ob_start('ob_gzhandler');
}

// Set caching headers for static resources
function setStaticResourceHeaders() {
    $request_uri = $_SERVER['REQUEST_URI'];
    
    // Cache static files for 1 week
    if (preg_match('/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/i', $request_uri)) {
        header('Cache-Control: public, max-age=604800'); // 1 week
        header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 604800) . ' GMT');
        header('Pragma: public');
    }
    
    // Cache HTML files for 1 hour
    if (preg_match('/\.html$/i', $request_uri) || $request_uri === '/') {
        header('Cache-Control: public, max-age=3600'); // 1 hour
        header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 3600) . ' GMT');
    }
    
    // No cache for API endpoints
    if (preg_match('/\.php$/i', $request_uri) && strpos($request_uri, '/php/') !== false) {
        header('Cache-Control: no-cache, must-revalidate');
        header('Expires: 0');
    }
}

// Minify HTML output
function minifyHTML($html) {
    // Remove comments (except IE conditionals)
    $html = preg_replace('/<!--(?!\s*(?:\[if [^\]]+]|<!|>))(?:(?!-->).)*-->/s', '', $html);
    
    // Remove extra whitespace
    $html = preg_replace('/\s+/', ' ', $html);
    
    // Remove whitespace around block elements
    $html = preg_replace('/>\s+</', '><', $html);
    
    return trim($html);
}

// Apply optimizations if not an API request
if (!isset($_GET['api']) && !preg_match('/\.php$/i', $_SERVER['REQUEST_URI'])) {
    setStaticResourceHeaders();
    
    // Start output buffering for HTML minification
    if (preg_match('/\.html$/i', $_SERVER['REQUEST_URI']) || $_SERVER['REQUEST_URI'] === '/') {
        ob_start('minifyHTML');
    }
}

// Database query optimization
class QueryOptimizer {
    private static $queryCache = [];
    
    public static function cacheQuery($key, $query, $params = []) {
        $cacheKey = md5($key . serialize($params));
        
        if (isset(self::$queryCache[$cacheKey])) {
            return self::$queryCache[$cacheKey];
        }
        
        // Execute query and cache result
        $db = Database::getInstance();
        $result = $db->fetchAll($query, $params);
        
        // Cache for 5 minutes
        if (count(self::$queryCache) < 100) { // Prevent memory overflow
            self::$queryCache[$cacheKey] = $result;
        }
        
        return $result;
    }
    
    public static function clearCache() {
        self::$queryCache = [];
    }
}

// AJAX response optimization
function optimizeAjaxResponse($data) {
    header('Content-Type: application/json; charset=utf-8');
    
    // Enable compression for JSON
    if (!headers_sent()) {
        header('Content-Encoding: gzip');
    }
    
    // Compact JSON output
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_NUMERIC_CHECK);
    exit;
}