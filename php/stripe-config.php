<?php
/**
 * Stripe Payment Configuration
 * Pure PHP implementation for payment processing
 */

// Handle direct requests to this file
if (isset($_GET['action'])) {
    StripeConfig::handleRequest();
}

class StripeConfig {
    // Use environment variables for API keys
    private static $publishable_key = null;
    private static $secret_key = null;
    
    public static function getPublishableKey() {
        if (self::$publishable_key === null) {
            self::$publishable_key = $_ENV['STRIPE_PUBLISHABLE_KEY'] ?? '';
        }
        return self::$publishable_key;
    }
    
    public static function getSecretKey() {
        if (self::$secret_key === null) {
            self::$secret_key = $_ENV['STRIPE_SECRET_KEY'] ?? '';
        }
        return self::$secret_key;
    }
    
    public static function handleRequest() {
        if ($_GET['action'] === 'get_publishable_key') {
            header('Content-Type: application/json');
            echo json_encode(['publishable_key' => self::getPublishableKey()]);
            exit;
        }
    }
    
    public static function createPaymentIntent($amount, $currency = 'usd') {
        $secret_key = self::getSecretKey();
        
        if (empty($secret_key)) {
            throw new Exception('Stripe secret key not configured');
        }
        
        $data = array(
            'amount' => $amount * 100, // Convert to cents
            'currency' => $currency,
            'automatic_payment_methods' => array('enabled' => true)
        );
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.stripe.com/v1/payment_intents');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Authorization: Bearer ' . $secret_key,
            'Content-Type: application/x-www-form-urlencoded'
        ));
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($http_code !== 200) {
            throw new Exception('Stripe API error: ' . $response);
        }
        
        return json_decode($response, true);
    }
}