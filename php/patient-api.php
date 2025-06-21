<?php
/**
 * Patient API Endpoints
 * Handles patient-specific data operations
 */

require_once 'config.php';
require_once 'database.php';

// Set CORS headers
setCORSHeaders();

// Initialize session
initializeSessionConfig();
session_start();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'get_dashboard_stats':
        getDashboardStats();
        break;
    case 'get_upcoming_appointments':
        getUpcomingAppointments();
        break;
    case 'get_all_appointments':
        getAllAppointments();
        break;
    case 'get_medical_records':
        getMedicalRecords();
        break;
    case 'cancel_appointment':
        cancelAppointment();
        break;
    case 'update_profile':
        updateProfile();
        break;
    case 'get_doctors':
        getDoctors();
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        break;
}

function getDashboardStats() {
    try {
        // Use mock data for demo environment
        $stats = [
            'total_appointments' => 12,
            'upcoming_appointments' => 2,
            'completed_appointments' => 8,
            'cancelled_appointments' => 2
        ];
        
        header('Content-Type: application/json');
        echo json_encode($stats);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to load dashboard stats']);
    }
}

function getUpcomingAppointments() {
    try {
        // Use mock data for demo environment
        $appointments = [
            [
                'id' => 1,
                'doctor_name' => 'Dr. Sarah Johnson',
                'specialty' => 'Cardiology',
                'appointment_date' => '2025-06-25',
                'appointment_time' => '10:00',
                'status' => 'confirmed',
                'booking_reference' => 'HCP20250625001'
            ],
            [
                'id' => 2,
                'doctor_name' => 'Dr. Michael Chen',
                'specialty' => 'Neurology',
                'appointment_date' => '2025-06-28',
                'appointment_time' => '14:30',
                'status' => 'scheduled',
                'booking_reference' => 'HCP20250628002'
            ]
        ];
        
        header('Content-Type: application/json');
        echo json_encode($appointments);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to load upcoming appointments']);
    }
}

function getAllAppointments() {
    try {
        // Use mock data for demo environment
        $appointments = [
            [
                'id' => 1,
                'doctor_name' => 'Dr. Sarah Johnson',
                'specialty' => 'Cardiology',
                'appointment_date' => '2025-06-25',
                'appointment_time' => '10:00',
                'status' => 'confirmed',
                'booking_reference' => 'HCP20250625001',
                'consultation_fee' => 250.00
            ],
            [
                'id' => 2,
                'doctor_name' => 'Dr. Michael Chen',
                'specialty' => 'Neurology',
                'appointment_date' => '2025-06-28',
                'appointment_time' => '14:30',
                'status' => 'scheduled',
                'booking_reference' => 'HCP20250628002',
                'consultation_fee' => 300.00
            ],
            [
                'id' => 3,
                'doctor_name' => 'Dr. Emily Rodriguez',
                'specialty' => 'Pediatrics',
                'appointment_date' => '2025-06-15',
                'appointment_time' => '09:00',
                'status' => 'completed',
                'booking_reference' => 'HCP20250615003',
                'consultation_fee' => 180.00
            ],
            [
                'id' => 4,
                'doctor_name' => 'Dr. David Thompson',
                'specialty' => 'Orthopedics',
                'appointment_date' => '2025-06-10',
                'appointment_time' => '15:30',
                'status' => 'cancelled',
                'booking_reference' => 'HCP20250610004',
                'consultation_fee' => 275.00
            ]
        ];
        
        header('Content-Type: application/json');
        echo json_encode($appointments);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to load appointments']);
    }
}

function getMedicalRecords() {
    try {
        // Use mock data for demo environment
        $records = [
            [
                'id' => 1,
                'doctor_name' => 'Dr. Sarah Johnson',
                'diagnosis' => 'Hypertension',
                'treatment' => 'Lifestyle modifications and medication management',
                'medications' => 'Lisinopril 10mg daily, Hydrochlorothiazide 25mg daily',
                'record_date' => '2025-06-15',
                'follow_up_date' => '2025-07-15'
            ],
            [
                'id' => 2,
                'doctor_name' => 'Dr. Emily Rodriguez',
                'diagnosis' => 'Annual Physical Examination',
                'treatment' => 'Routine examination - all parameters within normal limits',
                'medications' => 'Multivitamin daily (recommended)',
                'record_date' => '2025-05-20',
                'follow_up_date' => '2026-05-20'
            ],
            [
                'id' => 3,
                'doctor_name' => 'Dr. Michael Chen',
                'diagnosis' => 'Migraine headaches',
                'treatment' => 'Trigger identification and avoidance, prophylactic medication',
                'medications' => 'Sumatriptan 50mg as needed, Propranolol 40mg daily',
                'record_date' => '2025-05-05',
                'follow_up_date' => '2025-08-05'
            ]
        ];
        
        header('Content-Type: application/json');
        echo json_encode($records);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to load medical records']);
    }
}

function cancelAppointment() {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $appointmentId = $input['appointment_id'] ?? '';
        
        if (empty($appointmentId)) {
            http_response_code(400);
            echo json_encode(['error' => 'Appointment ID required']);
            return;
        }
        
        // In a real implementation, update the database
        // For demo, just return success
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => 'Appointment cancelled successfully'
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to cancel appointment']);
    }
}

function updateProfile() {
    try {
        // In a real implementation, validate and update user profile
        // For demo, just return success
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => 'Profile updated successfully'
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update profile']);
    }
}

function getDoctors() {
    try {
        // Use mock data for demo environment - complete doctor list from config
        $mockStorage = MockDataStorage::getInstance();
        $doctors = $mockStorage->getDoctors();
        
        header('Content-Type: application/json');
        echo json_encode($doctors);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to load doctors']);
    }
}
?>