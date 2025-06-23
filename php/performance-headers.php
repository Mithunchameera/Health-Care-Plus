<?php
/**
 * Performance Headers for eChannelling System
 * Implements server-side optimizations for faster loading
 */

// Enable output compression
if (!ob_get_level()) {
    ob_start('ob_gzhandler');
}

// Set performance headers
function setPerformanceHeaders() {
    // Cache control for static assets
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    
    if (preg_match('/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/i', $request_uri)) {
        // Cache static assets for 1 year
        header('Cache-Control: public, max-age=31536000, immutable');
        header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 31536000) . ' GMT');
    } elseif (preg_match('/\.(html|htm)$/i', $request_uri)) {
        // Cache HTML for 1 hour
        header('Cache-Control: public, max-age=3600');
    } else {
        // Dynamic content - no cache
        header('Cache-Control: no-cache, must-revalidate');
    }
    
    // Security and performance headers
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    
    // Enable HTTP/2 Server Push hints
    if (isset($_SERVER['HTTP2']) || isset($_SERVER['HTTPS'])) {
        header('Link: </css/performance.css>; rel=preload; as=style', false);
        header('Link: </css/echannelling-styles.css>; rel=preload; as=style', false);
        header('Link: </js/performance-optimization.js>; rel=preload; as=script', false);
    }
}

// Database query optimization
function optimizeQuery($query) {
    // Add query optimization logic
    $optimized = trim($query);
    
    // Add LIMIT if not present for SELECT queries
    if (stripos($optimized, 'SELECT') === 0 && stripos($optimized, 'LIMIT') === false) {
        $optimized .= ' LIMIT 100';
    }
    
    return $optimized;
}

// JSON response with compression
function sendOptimizedJSON($data) {
    header('Content-Type: application/json; charset=utf-8');
    
    // Enable compression
    if (function_exists('gzencode') && strpos($_SERVER['HTTP_ACCEPT_ENCODING'], 'gzip') !== false) {
        header('Content-Encoding: gzip');
        echo gzencode(json_encode($data));
    } else {
        echo json_encode($data);
    }
    
    // Add performance timing
    if (isset($GLOBALS['start_time'])) {
        $execution_time = microtime(true) - $GLOBALS['start_time'];
        header('X-Execution-Time: ' . number_format($execution_time * 1000, 2) . 'ms');
    }
}

// Resource optimization
function optimizeResource($content, $type) {
    switch ($type) {
        case 'css':
            // Minify CSS
            $content = preg_replace('/\s+/', ' ', $content);
            $content = str_replace(['; ', ' {', '{ ', ' }', '} ', ': '], [';', '{', '{', '}', '}', ':'], $content);
            break;
        case 'js':
            // Basic JS minification
            $content = preg_replace('/\s+/', ' ', $content);
            $content = str_replace(['; ', ' {', '{ ', ' }', '} '], [';', '{', '{', '}', '}'], $content);
            break;
    }
    return trim($content);
}

// Initialize performance tracking
$GLOBALS['start_time'] = microtime(true);

// Set headers automatically
setPerformanceHeaders();
?>