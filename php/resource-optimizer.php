<?php
/**
 * Resource Optimizer - Handles CSS/JS minification and concatenation
 */

class ResourceOptimizer {
    private static $cache_dir = 'cache/';
    private static $cache_enabled = true;
    
    public static function init() {
        if (!is_dir(self::$cache_dir)) {
            mkdir(self::$cache_dir, 0755, true);
        }
    }
    
    public static function optimizeCSS($files) {
        $cache_key = 'css_' . md5(implode('|', $files));
        $cache_file = self::$cache_dir . $cache_key . '.css';
        
        if (self::$cache_enabled && file_exists($cache_file)) {
            return $cache_file;
        }
        
        $combined_css = '';
        foreach ($files as $file) {
            if (file_exists($file)) {
                $css = file_get_contents($file);
                $combined_css .= self::minifyCSS($css) . "\n";
            }
        }
        
        if (self::$cache_enabled) {
            file_put_contents($cache_file, $combined_css);
        }
        
        return $cache_file;
    }
    
    public static function optimizeJS($files) {
        $cache_key = 'js_' . md5(implode('|', $files));
        $cache_file = self::$cache_dir . $cache_key . '.js';
        
        if (self::$cache_enabled && file_exists($cache_file)) {
            return $cache_file;
        }
        
        $combined_js = '';
        foreach ($files as $file) {
            if (file_exists($file)) {
                $js = file_get_contents($file);
                $combined_js .= self::minifyJS($js) . ";\n";
            }
        }
        
        if (self::$cache_enabled) {
            file_put_contents($cache_file, $combined_js);
        }
        
        return $cache_file;
    }
    
    private static function minifyCSS($css) {
        // Remove comments
        $css = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $css);
        // Remove unnecessary whitespace
        $css = str_replace(["\r\n", "\r", "\n", "\t", '  ', '    ', '    '], '', $css);
        // Remove trailing semicolons before closing braces
        $css = str_replace(';}', '}', $css);
        return trim($css);
    }
    
    private static function minifyJS($js) {
        // Basic JS minification - remove comments and extra whitespace
        $js = preg_replace('!/\*.*?\*/!s', '', $js);
        $js = preg_replace('/\/\/.*$/m', '', $js);
        $js = preg_replace('/\s+/', ' ', $js);
        return trim($js);
    }
    
    public static function clearCache() {
        $files = glob(self::$cache_dir . '*');
        foreach ($files as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }
    }
}

// Auto-clear cache daily
if (isset($_GET['clear_cache']) || (rand(1, 1000) === 1)) {
    ResourceOptimizer::clearCache();
}

ResourceOptimizer::init();