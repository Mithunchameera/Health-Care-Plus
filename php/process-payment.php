<?php
/**
 * Payment Processing Handler
 * Pure PHP Stripe implementation
 */

require_once 'config.php';
require_once 'stripe-config.php';
require_once 'database.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['payment_method_id']) || !isset($input['amount'])) {
        throw new Exception('Missing required payment data');
    }
    
    $payment_method_id = $input['payment_method_id'];
    $amount = floatval($input['amount']);
    
    if ($amount <= 0) {
        throw new Exception('Invalid payment amount');
    }
    
    // Create payment intent
    $payment_intent = StripeConfig::createPaymentIntent($amount);
    
    // Confirm payment with payment method
    $secret_key = StripeConfig::getSecretKey();
    
    $data = array(
        'payment_method' => $payment_method_id,
        'confirmation_method' => 'manual',
        'confirm' => 'true',
        'return_url' => APP_URL . '/payment-success.html'
    );
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.stripe.com/v1/payment_intents/' . $payment_intent['id'] . '/confirm');
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
    
    $payment_result = json_decode($response, true);
    
    if ($http_code === 200 && $payment_result['status'] === 'succeeded') {
        // Save payment record to database
        $db = Database::getInstance();
        $db->query(
            "INSERT INTO payments (transaction_id, amount, payment_method, payment_status, payment_date) VALUES (?, ?, ?, ?, NOW())",
            [$payment_result['id'], $amount, 'stripe', 'completed']
        );
        
        echo json_encode(['success' => true, 'payment_id' => $payment_result['id']]);
    } else {
        throw new Exception('Payment processing failed');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}