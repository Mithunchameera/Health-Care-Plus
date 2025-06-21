<?php
/**
 * Appointments API for booking and retrieving appointments
 */

require_once 'database.php';
require_once 'session-auth.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$db = Database::getInstance();
$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'book_appointment':
            bookAppointment($db);
            break;
        case 'get_patient_appointments':
            getPatientAppointments($db);
            break;
        case 'get_doctor_appointments':
            getDoctorAppointments($db);
            break;
        case 'get_appointment_details':
            getAppointmentDetails($db);
            break;
        case 'cancel_appointment':
            cancelAppointment($db);
            break;
        case 'get_available_slots':
            getAvailableSlots($db);
            break;
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

function bookAppointment($db) {
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required_fields = ['doctor_id', 'appointment_date', 'appointment_time', 'patient_name', 'patient_email', 'patient_phone'];
    foreach ($required_fields as $field) {
        if (empty($input[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }
    
    $db->beginTransaction();
    
    try {
        // Check if patient exists, create if not
        $patient = $db->fetchOne(
            "SELECT p.id, u.id as user_id FROM patients p 
             JOIN users u ON p.user_id = u.id 
             WHERE u.email = ?",
            [$input['patient_email']]
        );
        
        if (!$patient) {
            // Create new user
            $db->query(
                "INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone, created_at) 
                 VALUES (?, ?, ?, 'patient', ?, ?, ?, NOW())",
                [
                    strtolower(str_replace(' ', '', $input['patient_name'])),
                    $input['patient_email'],
                    password_hash('temp_password', PASSWORD_DEFAULT),
                    explode(' ', $input['patient_name'])[0],
                    explode(' ', $input['patient_name'])[1] ?? '',
                    $input['patient_phone']
                ]
            );
            
            $user_id = $db->getConnection()->lastInsertId();
            
            // Create patient record
            $db->query(
                "INSERT INTO patients (user_id, created_at) VALUES (?, NOW())",
                [$user_id]
            );
            
            $patient_id = $db->getConnection()->lastInsertId();
        } else {
            $patient_id = $patient['id'];
        }
        
        // Check if slot is available
        $existing_appointment = $db->fetchOne(
            "SELECT id FROM appointments 
             WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? 
             AND status NOT IN ('cancelled')",
            [$input['doctor_id'], $input['appointment_date'], $input['appointment_time']]
        );
        
        if ($existing_appointment) {
            throw new Exception('This time slot is no longer available');
        }
        
        // Get doctor consultation fee
        $doctor = $db->fetchOne(
            "SELECT consultation_fee FROM doctors WHERE id = ?",
            [$input['doctor_id']]
        );
        
        // Generate booking reference
        $booking_reference = $db->generateBookingReference();
        
        // Create appointment
        $db->query(
            "INSERT INTO appointments (
                patient_id, doctor_id, appointment_date, appointment_time, 
                reason_for_visit, consultation_fee, booking_reference, 
                status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled', NOW())",
            [
                $patient_id,
                $input['doctor_id'],
                $input['appointment_date'],
                $input['appointment_time'],
                $input['reason_for_visit'] ?? 'General consultation',
                $doctor['consultation_fee'] ?? 100.00,
                $booking_reference
            ]
        );
        
        $appointment_id = $db->getConnection()->lastInsertId();
        
        // Mark slot as booked
        $db->query(
            "INSERT INTO appointment_slots (doctor_id, slot_date, slot_time, is_booked, appointment_id, created_at)
             VALUES (?, ?, ?, true, ?, NOW())
             ON CONFLICT (doctor_id, slot_date, slot_time) 
             DO UPDATE SET is_booked = true, appointment_id = ?",
            [
                $input['doctor_id'],
                $input['appointment_date'],
                $input['appointment_time'],
                $appointment_id,
                $appointment_id
            ]
        );
        
        $db->commit();
        
        // Get complete appointment details
        $appointment = getAppointmentById($db, $appointment_id);
        
        echo json_encode([
            'success' => true,
            'appointment' => $appointment,
            'booking_reference' => $booking_reference,
            'message' => 'Appointment booked successfully'
        ]);
        
    } catch (Exception $e) {
        $db->rollback();
        throw $e;
    }
}

function getPatientAppointments($db) {
    
    $patient_email = $_GET['patient_email'] ?? '';
    
    if (empty($patient_email)) {
        throw new Exception('Patient email is required');
    }
    
    $appointments = $db->fetchAll(
        "SELECT 
            a.id,
            a.appointment_date,
            a.appointment_time,
            a.status,
            a.reason_for_visit,
            a.consultation_fee,
            a.booking_reference,
            a.created_at,
            d.specialty,
            u.first_name as doctor_first_name,
            u.last_name as doctor_last_name,
            u.phone as doctor_phone
         FROM appointments a
         JOIN doctors d ON a.doctor_id = d.id
         JOIN users u ON d.user_id = u.id
         JOIN patients p ON a.patient_id = p.id
         JOIN users pu ON p.user_id = pu.id
         WHERE pu.email = ?
         ORDER BY a.appointment_date DESC, a.appointment_time DESC",
        [$patient_email]
    );
    
    echo json_encode([
        'success' => true,
        'appointments' => $appointments
    ]);
}

function getDoctorAppointments($db) {
    
    $doctor_id = $_GET['doctor_id'] ?? '';
    $date = $_GET['date'] ?? date('Y-m-d');
    
    if (empty($doctor_id)) {
        throw new Exception('Doctor ID is required');
    }
    
    $appointments = $db->fetchAll(
        "SELECT 
            a.id,
            a.appointment_date,
            a.appointment_time,
            a.status,
            a.reason_for_visit,
            a.consultation_fee,
            a.booking_reference,
            pu.first_name as patient_first_name,
            pu.last_name as patient_last_name,
            pu.phone as patient_phone,
            pu.email as patient_email
         FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         JOIN users pu ON p.user_id = pu.id
         WHERE a.doctor_id = ? AND a.appointment_date = ?
         ORDER BY a.appointment_time",
        [$doctor_id, $date]
    );
    
    echo json_encode([
        'success' => true,
        'appointments' => $appointments
    ]);
}

function getAppointmentDetails($db) {
    
    $appointment_id = $_GET['appointment_id'] ?? '';
    
    if (empty($appointment_id)) {
        throw new Exception('Appointment ID is required');
    }
    
    $appointment = getAppointmentById($db, $appointment_id);
    
    if (!$appointment) {
        throw new Exception('Appointment not found');
    }
    
    echo json_encode([
        'success' => true,
        'appointment' => $appointment
    ]);
}

function cancelAppointment($db) {
    
    $input = json_decode(file_get_contents('php://input'), true);
    $appointment_id = $input['appointment_id'] ?? '';
    
    if (empty($appointment_id)) {
        throw new Exception('Appointment ID is required');
    }
    
    $db->beginTransaction();
    
    try {
        // Update appointment status
        $updated = $db->update(
            "UPDATE appointments SET status = 'cancelled', updated_at = NOW() WHERE id = ?",
            [$appointment_id]
        );
        
        if ($updated === 0) {
            throw new Exception('Appointment not found');
        }
        
        // Free up the slot
        $db->query(
            "UPDATE appointment_slots SET is_booked = false, appointment_id = NULL 
             WHERE appointment_id = ?",
            [$appointment_id]
        );
        
        $db->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Appointment cancelled successfully'
        ]);
        
    } catch (Exception $e) {
        $db->rollback();
        throw $e;
    }
}

function getAvailableSlots($db) {
    
    $doctor_id = $_GET['doctor_id'] ?? '';
    $date = $_GET['date'] ?? '';
    
    if (empty($doctor_id) || empty($date)) {
        throw new Exception('Doctor ID and date are required');
    }
    
    // Get doctor availability for the day
    $day_of_week = date('w', strtotime($date)); // 0=Sunday, 6=Saturday
    
    $availability = $db->fetchAll(
        "SELECT start_time, end_time FROM doctor_availability 
         WHERE doctor_id = ? AND day_of_week = ? AND is_available = true",
        [$doctor_id, $day_of_week]
    );
    
    if (empty($availability)) {
        echo json_encode([
            'success' => true,
            'slots' => []
        ]);
        return;
    }
    
    // Get booked slots
    $booked_slots = $db->fetchAll(
        "SELECT slot_time FROM appointment_slots 
         WHERE doctor_id = ? AND slot_date = ? AND is_booked = true",
        [$doctor_id, $date]
    );
    
    $booked_times = array_column($booked_slots, 'slot_time');
    
    // Generate available slots (30-minute intervals)
    $available_slots = [];
    foreach ($availability as $period) {
        $start = new DateTime($period['start_time']);
        $end = new DateTime($period['end_time']);
        
        while ($start < $end) {
            $time_slot = $start->format('H:i');
            
            if (!in_array($time_slot, $booked_times)) {
                $available_slots[] = $time_slot;
            }
            
            $start->add(new DateInterval('PT30M')); // Add 30 minutes
        }
    }
    
    echo json_encode([
        'success' => true,
        'slots' => $available_slots
    ]);
}

function getAppointmentById($db, $appointment_id) {
    
    return $db->fetchOne(
        "SELECT 
            a.id,
            a.appointment_date,
            a.appointment_time,
            a.status,
            a.reason_for_visit,
            a.consultation_fee,
            a.booking_reference,
            a.payment_status,
            a.created_at,
            d.id as doctor_id,
            d.specialty,
            du.first_name as doctor_first_name,
            du.last_name as doctor_last_name,
            du.phone as doctor_phone,
            du.email as doctor_email,
            p.id as patient_id,
            pu.first_name as patient_first_name,
            pu.last_name as patient_last_name,
            pu.phone as patient_phone,
            pu.email as patient_email
         FROM appointments a
         JOIN doctors d ON a.doctor_id = d.id
         JOIN users du ON d.user_id = du.id
         JOIN patients p ON a.patient_id = p.id
         JOIN users pu ON p.user_id = pu.id
         WHERE a.id = ?",
        [$appointment_id]
    );
}
?>