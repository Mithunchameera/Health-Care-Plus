<?php
// Disable error display and use JSON responses only
ini_set('display_errors', 0);
error_reporting(E_ALL);

session_start();
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Initialize database connection
try {
    $pdo = new PDO($dsn, $username, $password, $options);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'confirm_appointment':
            confirmAppointment();
            break;
        case 'get_patient_appointments':
            getPatientAppointments();
            break;
        case 'cancel_appointment':
            cancelAppointment();
            break;
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}

function confirmAppointment() {
    global $pdo;
    
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON input');
        }
        
        $patientId = $_SESSION['user_id'] ?? 1; // Default to patient ID 1 for demo
        $doctorId = $input['doctor_id'] ?? 0;
        $appointmentDate = $input['appointment_date'] ?? '';
        $appointmentTime = $input['appointment_time'] ?? '';
        $appointmentType = $input['appointment_type'] ?? 'Consultation';
        $notes = $input['notes'] ?? '';
        
        if (empty($doctorId) || empty($appointmentDate) || empty($appointmentTime)) {
            throw new Exception('Missing required appointment details');
        }
    } catch (Exception $e) {
        throw new Exception('Error processing request: ' . $e->getMessage());
    }
    
    // Check if doctor exists
    $doctorStmt = $pdo->prepare("SELECT id, full_name, specialty FROM doctors WHERE id = ?");
    $doctorStmt->execute([$doctorId]);
    $doctor = $doctorStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$doctor) {
        throw new Exception('Doctor not found');
    }
    
    // Check if time slot is available
    $conflictStmt = $pdo->prepare("
        SELECT id FROM appointments 
        WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'
    ");
    $conflictStmt->execute([$doctorId, $appointmentDate, $appointmentTime]);
    
    if ($conflictStmt->fetch()) {
        throw new Exception('This time slot is no longer available');
    }
    
    // Insert the appointment
    try {
        $stmt = $pdo->prepare("
            INSERT INTO appointments (
                patient_id, doctor_id, appointment_date, appointment_time, 
                appointment_type, status, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, 'confirmed', ?, NOW(), NOW())
        ");
        
        $success = $stmt->execute([
            $patientId, $doctorId, $appointmentDate, $appointmentTime, 
            $appointmentType, $notes
        ]);
    } catch (PDOException $e) {
        throw new Exception('Database error: ' . $e->getMessage());
    }
    
    if ($success) {
        $appointmentId = $pdo->lastInsertId();
        
        // Get the complete appointment details
        $detailStmt = $pdo->prepare("
            SELECT 
                a.id,
                a.appointment_date,
                a.appointment_time,
                a.appointment_type,
                a.status,
                a.notes,
                d.full_name as doctor_name,
                d.specialty as doctor_specialty,
                p.full_name as patient_name,
                p.email as patient_email
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            JOIN patients p ON a.patient_id = p.id
            WHERE a.id = ?
        ");
        $detailStmt->execute([$appointmentId]);
        $appointmentDetails = $detailStmt->fetch(PDO::FETCH_ASSOC);
        
        // Generate booking reference
        $bookingReference = 'HC' . str_pad($appointmentId, 6, '0', STR_PAD_LEFT);
        
        echo json_encode([
            'success' => true,
            'appointment_id' => $appointmentId,
            'booking_reference' => $bookingReference,
            'appointment' => $appointmentDetails,
            'message' => 'Appointment confirmed successfully'
        ]);
    } else {
        throw new Exception('Failed to confirm appointment');
    }
}

function getPatientAppointments() {
    global $pdo;
    
    $patientId = $_SESSION['user_id'] ?? 1;
    $patientEmail = $_GET['patient_email'] ?? '';
    
    // If email is provided, get patient ID
    if ($patientEmail && !$patientId) {
        $patientStmt = $pdo->prepare("SELECT id FROM patients WHERE email = ?");
        $patientStmt->execute([$patientEmail]);
        $patient = $patientStmt->fetch(PDO::FETCH_ASSOC);
        $patientId = $patient['id'] ?? 0;
    }
    
    if (!$patientId) {
        throw new Exception('Patient not found');
    }
    
    $stmt = $pdo->prepare("
        SELECT 
            a.id,
            a.appointment_date,
            a.appointment_time,
            a.appointment_type,
            a.status,
            a.notes,
            a.created_at,
            d.full_name as doctor_name,
            d.specialty as doctor_specialty,
            d.phone as doctor_phone,
            d.email as doctor_email
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        WHERE a.patient_id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
    ");
    
    $stmt->execute([$patientId]);
    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($appointments);
}

function cancelAppointment() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    $appointmentId = $input['appointment_id'] ?? 0;
    $patientId = $_SESSION['user_id'] ?? 1;
    
    if (!$appointmentId) {
        throw new Exception('Appointment ID required');
    }
    
    // Verify the appointment belongs to the patient
    $verifyStmt = $pdo->prepare("
        SELECT id FROM appointments 
        WHERE id = ? AND patient_id = ? AND status != 'cancelled'
    ");
    $verifyStmt->execute([$appointmentId, $patientId]);
    
    if (!$verifyStmt->fetch()) {
        throw new Exception('Appointment not found or already cancelled');
    }
    
    // Update appointment status
    $stmt = $pdo->prepare("
        UPDATE appointments 
        SET status = 'cancelled', updated_at = NOW() 
        WHERE id = ?
    ");
    
    $success = $stmt->execute([$appointmentId]);
    
    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Appointment cancelled successfully'
        ]);
    } else {
        throw new Exception('Failed to cancel appointment');
    }
}
?>