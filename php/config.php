<?php
/**
 * Database and Application Configuration
 * HealthCare+ E-Channelling System
 */

// Error reporting for development (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'healthcare_plus');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Application Configuration
define('APP_NAME', 'HealthCare+');
define('APP_VERSION', '1.0.0');
define('APP_URL', 'http://localhost:5000');

// Security Configuration
define('SESSION_LIFETIME', 3600); // 1 hour
define('PASSWORD_MIN_LENGTH', 8);
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOCKOUT_TIME', 900); // 15 minutes

// Email Configuration (for notifications)
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', '');
define('SMTP_PASSWORD', '');
define('FROM_EMAIL', 'noreply@healthcareplus.com');
define('FROM_NAME', 'HealthCare+');

// File Upload Configuration
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('UPLOAD_DIR', 'uploads/');

// Timezone Configuration
date_default_timezone_set('America/New_York');

// CORS Headers for API requests
function setCORSHeaders() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Content-Type: application/json");
}

// Database Connection Class
class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        try {
            $this->connection = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            die(json_encode(['error' => 'Database connection failed']));
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    // Initialize database tables
    public function initializeTables() {
        $sql = "
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(50) NOT NULL,
            last_name VARCHAR(50) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            phone VARCHAR(20) NOT NULL,
            date_of_birth DATE NOT NULL,
            gender ENUM('male', 'female', 'other') NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT TRUE,
            login_attempts INT DEFAULT 0,
            last_login_attempt TIMESTAMP NULL,
            locked_until TIMESTAMP NULL
        );
        
        CREATE TABLE IF NOT EXISTS doctors (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            specialty VARCHAR(100) NOT NULL,
            subspecialties JSON,
            education VARCHAR(200) NOT NULL,
            experience INT NOT NULL,
            location VARCHAR(200) NOT NULL,
            phone VARCHAR(20),
            email VARCHAR(100),
            fee DECIMAL(10,2) NOT NULL,
            rating DECIMAL(3,2) DEFAULT 0.00,
            reviews INT DEFAULT 0,
            about TEXT,
            services JSON,
            certifications JSON,
            languages JSON,
            working_hours JSON,
            available BOOLEAN DEFAULT TRUE,
            patients_treated INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS appointments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            booking_id VARCHAR(50) UNIQUE NOT NULL,
            user_id INT,
            doctor_id INT NOT NULL,
            appointment_date DATE NOT NULL,
            appointment_time TIME NOT NULL,
            patient_name VARCHAR(100) NOT NULL,
            patient_age INT NOT NULL,
            patient_gender ENUM('male', 'female', 'other') NOT NULL,
            patient_phone VARCHAR(20) NOT NULL,
            patient_email VARCHAR(100) NOT NULL,
            symptoms TEXT,
            medical_history TEXT,
            status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
            FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
            INDEX idx_appointment_date (appointment_date),
            INDEX idx_doctor_date (doctor_id, appointment_date)
        );
        
        CREATE TABLE IF NOT EXISTS time_slots (
            id INT AUTO_INCREMENT PRIMARY KEY,
            doctor_id INT NOT NULL,
            date DATE NOT NULL,
            time TIME NOT NULL,
            is_available BOOLEAN DEFAULT TRUE,
            appointment_id INT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
            FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
            UNIQUE KEY unique_slot (doctor_id, date, time)
        );
        
        CREATE TABLE IF NOT EXISTS sessions (
            id VARCHAR(128) PRIMARY KEY,
            user_id INT NOT NULL,
            data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_expires (expires_at)
        );
        ";
        
        try {
            $this->connection->exec($sql);
            return true;
        } catch (PDOException $e) {
            error_log("Error creating tables: " . $e->getMessage());
            return false;
        }
    }
    
    // Insert sample doctors data
    public function insertSampleDoctors() {
        $doctors = [
            [
                'name' => 'Sarah Johnson',
                'specialty' => 'Cardiology',
                'subspecialties' => json_encode(['Interventional Cardiology', 'Heart Failure']),
                'education' => 'Harvard Medical School',
                'experience' => 15,
                'location' => 'Medical Center, Downtown',
                'phone' => '+1 (555) 123-4567',
                'email' => 'dr.johnson@healthcareplus.com',
                'fee' => 250.00,
                'rating' => 4.8,
                'reviews' => 156,
                'about' => 'Dr. Johnson is a board-certified cardiologist with extensive experience in treating heart conditions.',
                'services' => json_encode(['Cardiac Consultation', 'ECG', 'Stress Testing', 'Heart Surgery']),
                'certifications' => json_encode(['Board Certified Cardiologist', 'Advanced Cardiac Life Support']),
                'languages' => json_encode(['English', 'Spanish']),
                'available' => true,
                'patients_treated' => 2500
            ],
            [
                'name' => 'Michael Chen',
                'specialty' => 'Neurology',
                'subspecialties' => json_encode(['Stroke Medicine', 'Epilepsy']),
                'education' => 'Johns Hopkins Medical School',
                'experience' => 12,
                'location' => 'Neurological Institute, Uptown',
                'phone' => '+1 (555) 234-5678',
                'email' => 'dr.chen@healthcareplus.com',
                'fee' => 300.00,
                'rating' => 4.9,
                'reviews' => 203,
                'about' => 'Dr. Chen specializes in neurological disorders with a focus on stroke prevention and treatment.',
                'services' => json_encode(['Neurological Consultation', 'EEG', 'Brain Imaging', 'Stroke Treatment']),
                'certifications' => json_encode(['Board Certified Neurologist', 'Stroke Specialist']),
                'languages' => json_encode(['English', 'Mandarin']),
                'available' => true,
                'patients_treated' => 1800
            ],
            [
                'name' => 'Emily Rodriguez',
                'specialty' => 'Pediatrics',
                'subspecialties' => json_encode(['Pediatric Emergency Medicine', 'Child Development']),
                'education' => 'Stanford Medical School',
                'experience' => 8,
                'location' => 'Children\'s Hospital, Westside',
                'phone' => '+1 (555) 345-6789',
                'email' => 'dr.rodriguez@healthcareplus.com',
                'fee' => 180.00,
                'rating' => 4.7,
                'reviews' => 89,
                'about' => 'Dr. Rodriguez is dedicated to providing comprehensive pediatric care for children of all ages.',
                'services' => json_encode(['Child Health Checkups', 'Vaccinations', 'Developmental Assessment']),
                'certifications' => json_encode(['Board Certified Pediatrician', 'Pediatric Advanced Life Support']),
                'languages' => json_encode(['English', 'Spanish']),
                'available' => true,
                'patients_treated' => 1200
            ],
            [
                'name' => 'David Thompson',
                'specialty' => 'Orthopedics',
                'subspecialties' => json_encode(['Sports Medicine', 'Joint Replacement']),
                'education' => 'Mayo Clinic Medical School',
                'experience' => 20,
                'location' => 'Orthopedic Center, Central',
                'phone' => '+1 (555) 456-7890',
                'email' => 'dr.thompson@healthcareplus.com',
                'fee' => 275.00,
                'rating' => 4.6,
                'reviews' => 134,
                'about' => 'Dr. Thompson is an experienced orthopedic surgeon specializing in sports injuries and joint replacement.',
                'services' => json_encode(['Joint Surgery', 'Sports Injury Treatment', 'Physical Therapy']),
                'certifications' => json_encode(['Board Certified Orthopedic Surgeon', 'Sports Medicine Specialist']),
                'languages' => json_encode(['English']),
                'available' => false,
                'patients_treated' => 3200
            ],
            [
                'name' => 'Lisa Park',
                'specialty' => 'Dermatology',
                'subspecialties' => json_encode(['Cosmetic Dermatology', 'Skin Cancer']),
                'education' => 'Yale Medical School',
                'experience' => 10,
                'location' => 'Dermatology Clinic, Eastside',
                'phone' => '+1 (555) 567-8901',
                'email' => 'dr.park@healthcareplus.com',
                'fee' => 220.00,
                'rating' => 4.5,
                'reviews' => 76,
                'about' => 'Dr. Park provides comprehensive dermatological care including cosmetic and medical treatments.',
                'services' => json_encode(['Skin Examination', 'Acne Treatment', 'Cosmetic Procedures']),
                'certifications' => json_encode(['Board Certified Dermatologist', 'Cosmetic Surgery Certified']),
                'languages' => json_encode(['English', 'Korean']),
                'available' => true,
                'patients_treated' => 950
            ]
        ];
        
        $stmt = $this->connection->prepare("
            INSERT INTO doctors (name, specialty, subspecialties, education, experience, location, 
            phone, email, fee, rating, reviews, about, services, certifications, languages, 
            available, patients_treated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($doctors as $doctor) {
            try {
                $stmt->execute([
                    $doctor['name'], $doctor['specialty'], $doctor['subspecialties'],
                    $doctor['education'], $doctor['experience'], $doctor['location'],
                    $doctor['phone'], $doctor['email'], $doctor['fee'], $doctor['rating'],
                    $doctor['reviews'], $doctor['about'], $doctor['services'],
                    $doctor['certifications'], $doctor['languages'], $doctor['available'],
                    $doctor['patients_treated']
                ]);
            } catch (PDOException $e) {
                // Doctor might already exist, continue
                continue;
            }
        }
    }
    
    // Generate time slots for all doctors
    public function generateTimeSlots() {
        $doctors = $this->connection->query("SELECT id FROM doctors")->fetchAll();
        
        foreach ($doctors as $doctor) {
            $this->generateDoctorTimeSlots($doctor['id']);
        }
    }
    
    private function generateDoctorTimeSlots($doctorId) {
        $startDate = new DateTime();
        $endDate = new DateTime('+30 days'); // Generate slots for next 30 days
        
        $workingHours = [
            '09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '11:30:00',
            '14:00:00', '14:30:00', '15:00:00', '15:30:00', '16:00:00', '16:30:00',
            '17:00:00', '17:30:00'
        ];
        
        $stmt = $this->connection->prepare("
            INSERT IGNORE INTO time_slots (doctor_id, date, time, is_available) 
            VALUES (?, ?, ?, TRUE)
        ");
        
        $current = clone $startDate;
        while ($current <= $endDate) {
            // Skip weekends for some doctors (simplified logic)
            if ($current->format('N') < 6) { // Monday to Friday
                foreach ($workingHours as $time) {
                    $stmt->execute([$doctorId, $current->format('Y-m-d'), $time]);
                }
            }
            $current->add(new DateInterval('P1D'));
        }
    }
}

// Utility Functions
function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validatePhone($phone) {
    $phone = preg_replace('/\D/', '', $phone);
    return strlen($phone) >= 10 && strlen($phone) <= 15;
}

function generateBookingId() {
    return 'HC' . date('Ymd') . rand(1000, 9999);
}

function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    setCORSHeaders();
    echo json_encode($data);
    exit;
}

function logError($message, $context = []) {
    $logMessage = date('Y-m-d H:i:s') . " - " . $message;
    if (!empty($context)) {
        $logMessage .= " - Context: " . json_encode($context);
    }
    error_log($logMessage);
}

// Initialize database and create tables if they don't exist
try {
    $db = Database::getInstance();
    $db->initializeTables();
    
    // Insert sample data if tables are empty
    $doctorCount = $db->getConnection()->query("SELECT COUNT(*) FROM doctors")->fetchColumn();
    if ($doctorCount == 0) {
        $db->insertSampleDoctors();
        $db->generateTimeSlots();
    }
} catch (Exception $e) {
    logError("Database initialization failed: " . $e->getMessage());
}
?>
