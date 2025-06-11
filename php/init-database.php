<?php
/**
 * Database Initialization Script
 * Sets up the database tables and sample data
 */

require_once 'config.php';

try {
    $db = Database::getInstance();
    
    echo "Initializing database...\n";
    
    // Initialize tables
    if ($db->initializeTables()) {
        echo "✓ Database tables created successfully\n";
    } else {
        echo "✗ Failed to create database tables\n";
        exit(1);
    }
    
    // Insert sample doctors
    $db->insertSampleDoctors();
    echo "✓ Sample doctors data inserted\n";
    
    // Generate time slots
    $db->generateTimeSlots();
    echo "✓ Time slots generated for doctors\n";
    
    echo "Database initialization completed successfully!\n";
    
} catch (Exception $e) {
    echo "✗ Database initialization failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>