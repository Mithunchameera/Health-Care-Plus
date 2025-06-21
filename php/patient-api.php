<?php
/**
 * Patient API Endpoints
 * Handles patient-specific data operations
 */

require_once 'config.php';

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
    case 'get_doctor_details':
        getDoctorDetails();
        break;
    case 'get_available_slots':
        getAvailableSlots();
        break;
    case 'book_appointment':
        bookAppointment();
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
        // Comprehensive doctor data for booking system
        $doctors = [
            [
                'id' => 1,
                'name' => 'Dr. Sarah Johnson',
                'specialty' => 'Cardiology',
                'qualification' => 'MBBS, MD Cardiology',
                'experience' => '8 years',
                'rating' => 4.8,
                'reviews' => 127,
                'photo' => '',
                'available_days' => 'Mon, Wed, Fri',
                'consultation_fee' => 2500,
                'location' => 'Colombo General Hospital',
                'next_available' => '2025-06-25',
                'bio' => 'Specialist in cardiovascular diseases with expertise in interventional cardiology.',
                'languages' => ['English', 'Sinhala'],
                'phone' => '+94 77 123 4567',
                'email' => 'sarah.johnson@healthcareplus.lk'
            ],
            [
                'id' => 2,
                'name' => 'Dr. Michael Chen',
                'specialty' => 'Neurology',
                'qualification' => 'MBBS, MS Neurology',
                'experience' => '10 years',
                'rating' => 4.9,
                'reviews' => 89,
                'photo' => '',
                'available_days' => 'Tue, Thu, Sat',
                'consultation_fee' => 3000,
                'location' => 'National Hospital',
                'next_available' => '2025-06-26',
                'bio' => 'Neurologist specializing in stroke care and epilepsy management.',
                'languages' => ['English', 'Tamil'],
                'phone' => '+94 77 234 5678',
                'email' => 'michael.chen@healthcareplus.lk'
            ],
            [
                'id' => 3,
                'name' => 'Dr. Priya Sharma',
                'specialty' => 'Dermatology',
                'qualification' => 'MBBS, MD Dermatology',
                'experience' => '6 years',
                'rating' => 4.7,
                'reviews' => 156,
                'photo' => '',
                'available_days' => 'Mon, Tue, Thu',
                'consultation_fee' => 2200,
                'location' => 'Lanka Hospital',
                'next_available' => '2025-06-24',
                'bio' => 'Dermatologist with expertise in cosmetic and medical dermatology.',
                'languages' => ['English', 'Hindi', 'Sinhala'],
                'phone' => '+94 77 345 6789',
                'email' => 'priya.sharma@healthcareplus.lk'
            ],
            [
                'id' => 4,
                'name' => 'Dr. Rajesh Kumar',
                'specialty' => 'Orthopedics',
                'qualification' => 'MBBS, MS Orthopedics',
                'experience' => '12 years',
                'rating' => 4.9,
                'reviews' => 203,
                'photo' => '',
                'available_days' => 'Wed, Fri, Sat',
                'consultation_fee' => 3500,
                'location' => 'Apollo Hospital',
                'next_available' => '2025-06-27',
                'bio' => 'Orthopedic surgeon specializing in joint replacement and sports medicine.',
                'languages' => ['English', 'Tamil', 'Hindi'],
                'phone' => '+94 77 456 7890',
                'email' => 'rajesh.kumar@healthcareplus.lk'
            ],
            [
                'id' => 5,
                'name' => 'Dr. Emily Rodriguez',
                'specialty' => 'Pediatrics',
                'qualification' => 'MBBS, MD Pediatrics',
                'experience' => '9 years',
                'rating' => 4.8,
                'reviews' => 174,
                'photo' => '',
                'available_days' => 'Mon, Wed, Fri, Sat',
                'consultation_fee' => 2800,
                'location' => 'Lady Ridgeway Hospital',
                'next_available' => '2025-06-25',
                'bio' => 'Pediatrician with special interest in child development and immunizations.',
                'languages' => ['English', 'Spanish', 'Sinhala'],
                'phone' => '+94 77 567 8901',
                'email' => 'emily.rodriguez@healthcareplus.lk'
            ],
            [
                'id' => 6,
                'name' => 'Dr. James Wilson',
                'specialty' => 'General Medicine',
                'qualification' => 'MBBS, MD Internal Medicine',
                'experience' => '15 years',
                'rating' => 4.6,
                'reviews' => 298,
                'photo' => '',
                'available_days' => 'All days',
                'consultation_fee' => 2000,
                'location' => 'Nawaloka Hospital',
                'next_available' => '2025-06-24',
                'bio' => 'General physician with comprehensive expertise in internal medicine.',
                'languages' => ['English', 'Sinhala'],
                'phone' => '+94 77 678 9012',
                'email' => 'james.wilson@healthcareplus.lk'
            ]
        ];
        
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'doctors' => $doctors]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to load doctors']);
    }
}

function getDoctorDetails() {
    try {
        $doctorId = $_GET['id'] ?? $_GET['doctor_id'] ?? 0;
        
        if (!$doctorId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Doctor ID required']);
            return;
        }
        
        // Mock doctor details based on ID
        $doctorDetails = [
            1 => [
                'id' => 1,
                'name' => 'Dr. Sarah Johnson',
                'specialty' => 'Cardiology',
                'qualification' => 'MBBS, MD Cardiology',
                'experience' => '15+ years',
                'rating' => 4.8,
                'reviews' => 245,
                'consultation_fee' => '5,000',
                'location' => 'Colombo General Hospital',
                'available_days' => 'Mon, Wed, Fri',
                'next_available' => '2025-06-25',
                'phone' => '+94 77 123 4567',
                'email' => 'sarah.johnson@healthcareplus.lk',
                'languages' => ['English', 'Sinhala'],
                'bio' => 'Dr. Sarah Johnson is a highly experienced cardiologist with over 15 years of expertise in interventional cardiology. She specializes in advanced cardiac procedures and has published numerous research papers in international cardiology journals.',
                'specializations' => ['Interventional Cardiology', 'Cardiac Catheterization', 'Angioplasty', 'Heart Disease Prevention'],
                'education' => ['MBBS - University of Colombo (2008)', 'MD Cardiology - Postgraduate Institute of Medicine (2012)', 'Fellowship in Interventional Cardiology - Singapore General Hospital (2014)'],
                'working_hours' => '9:00 AM - 5:00 PM',
                'hospital' => 'Colombo General Hospital',
                'address' => 'Regent Street, Colombo 08'
            ],
            2 => [
                'id' => 2,
                'name' => 'Dr. Michael Chen',
                'specialty' => 'Orthopedics',
                'qualification' => 'MBBS, MS Orthopedics',
                'experience' => '12+ years',
                'rating' => 4.7,
                'reviews' => 189,
                'consultation_fee' => '4,500',
                'location' => 'National Hospital',
                'available_days' => 'Tue, Thu, Sat',
                'next_available' => '2025-06-24',
                'phone' => '+94 77 234 5678',
                'email' => 'michael.chen@healthcareplus.lk',
                'languages' => ['English', 'Tamil'],
                'bio' => 'Dr. Michael Chen is a renowned orthopedic surgeon specializing in joint replacement and sports medicine. He has performed over 2000 successful surgeries and is known for his innovative surgical techniques.',
                'specializations' => ['Joint Replacement', 'Sports Medicine', 'Arthroscopy', 'Trauma Surgery'],
                'education' => ['MBBS - University of Peradeniya (2010)', 'MS Orthopedics - Postgraduate Institute of Medicine (2015)', 'Fellowship in Joint Replacement - Johns Hopkins Hospital (2017)'],
                'working_hours' => '8:00 AM - 4:00 PM',
                'hospital' => 'National Hospital of Sri Lanka',
                'address' => 'Regent Street, Colombo 10'
            ],
            3 => [
                'id' => 3,
                'name' => 'Dr. Priya Patel',
                'specialty' => 'Pediatrics',
                'qualification' => 'MBBS, MD Pediatrics',
                'experience' => '10+ years',
                'rating' => 4.9,
                'reviews' => 312,
                'consultation_fee' => '3,500',
                'location' => 'Lady Ridgeway Hospital',
                'available_days' => 'Mon, Tue, Thu, Fri',
                'next_available' => '2025-06-23',
                'phone' => '+94 77 345 6789',
                'email' => 'priya.patel@healthcareplus.lk',
                'languages' => ['English', 'Hindi', 'Sinhala'],
                'bio' => 'Dr. Priya Patel is a dedicated pediatrician with extensive experience in child healthcare. She specializes in developmental pediatrics and has been instrumental in implementing child-friendly healthcare practices.',
                'specializations' => ['Developmental Pediatrics', 'Neonatal Care', 'Child Nutrition', 'Vaccination Programs'],
                'education' => ['MBBS - University of Sri Jayewardenepura (2012)', 'MD Pediatrics - Postgraduate Institute of Medicine (2017)', 'Diploma in Child Health - Royal College of Pediatrics (2018)'],
                'working_hours' => '9:00 AM - 6:00 PM',
                'hospital' => 'Lady Ridgeway Hospital for Children',
                'address' => 'Borella, Colombo 08'
            ],
            4 => [
                'id' => 4,
                'name' => 'Dr. James Wilson',
                'specialty' => 'Neurology',
                'qualification' => 'MBBS, MD Neurology',
                'experience' => '18+ years',
                'rating' => 4.6,
                'reviews' => 156,
                'consultation_fee' => '6,000',
                'location' => 'Colombo South Teaching Hospital',
                'available_days' => 'Wed, Fri, Sat',
                'next_available' => '2025-06-26',
                'phone' => '+94 77 456 7890',
                'email' => 'james.wilson@healthcareplus.lk',
                'languages' => ['English'],
                'bio' => 'Dr. James Wilson is a leading neurologist with expertise in treating complex neurological disorders. He has pioneered several treatment protocols and is actively involved in neurological research.',
                'specializations' => ['Stroke Management', 'Epilepsy Treatment', 'Movement Disorders', 'Headache Medicine'],
                'education' => ['MBBS - University of Colombo (2005)', 'MD Neurology - Postgraduate Institute of Medicine (2010)', 'Fellowship in Stroke Medicine - Mayo Clinic (2012)'],
                'working_hours' => '10:00 AM - 6:00 PM',
                'hospital' => 'Colombo South Teaching Hospital',
                'address' => 'Kalubowila, Dehiwala'
            ],
            5 => [
                'id' => 5,
                'name' => 'Dr. Emily Rodriguez',
                'specialty' => 'Dermatology',
                'qualification' => 'MBBS, MD Dermatology',
                'experience' => '8+ years',
                'rating' => 4.7,
                'reviews' => 198,
                'consultation_fee' => '4,000',
                'location' => 'Skin & Beauty Clinic',
                'available_days' => 'Mon, Wed, Thu, Sat',
                'next_available' => '2025-06-24',
                'phone' => '+94 77 567 8901',
                'email' => 'emily.rodriguez@healthcareplus.lk',
                'languages' => ['English', 'Spanish', 'Sinhala'],
                'bio' => 'Dr. Emily Rodriguez is a skilled dermatologist specializing in both medical and cosmetic dermatology. She stays updated with the latest treatments and technologies in skin care.',
                'specializations' => ['Medical Dermatology', 'Cosmetic Dermatology', 'Laser Treatments', 'Skin Cancer Screening'],
                'education' => ['MBBS - University of Kelaniya (2014)', 'MD Dermatology - Postgraduate Institute of Medicine (2019)', 'Diploma in Aesthetic Medicine - American Academy of Aesthetic Medicine (2020)'],
                'working_hours' => '9:00 AM - 5:00 PM',
                'hospital' => 'Skin & Beauty Clinic',
                'address' => 'Bambalapitiya, Colombo 04'
            ],
            6 => [
                'id' => 6,
                'name' => 'Dr. David Kim',
                'specialty' => 'General Surgery',
                'qualification' => 'MBBS, MS General Surgery',
                'experience' => '20+ years',
                'rating' => 4.8,
                'reviews' => 267,
                'consultation_fee' => '5,500',
                'location' => 'Asiri Central Hospital',
                'available_days' => 'Tue, Wed, Fri, Sat',
                'next_available' => '2025-06-25',
                'phone' => '+94 77 678 9012',
                'email' => 'david.kim@healthcareplus.lk',
                'languages' => ['English', 'Korean'],
                'bio' => 'Dr. David Kim is a veteran general surgeon with two decades of experience in complex surgical procedures. He is known for his precision and has mentored many young surgeons.',
                'specializations' => ['Laparoscopic Surgery', 'Hepatobiliary Surgery', 'Colorectal Surgery', 'Trauma Surgery'],
                'education' => ['MBBS - University of Colombo (2003)', 'MS General Surgery - Postgraduate Institute of Medicine (2008)', 'Fellowship in Laparoscopic Surgery - Seoul National University (2010)'],
                'working_hours' => '8:00 AM - 4:00 PM',
                'hospital' => 'Asiri Central Hospital',
                'address' => 'Colombo 10'
            ]
        ];
        
        $doctor = $doctorDetails[$doctorId] ?? null;
        
        if (!$doctor) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Doctor not found']);
            return;
        }
        
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'doctor' => $doctor]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to load doctor details']);
    }
}

function getAvailableSlots() {
    try {
        $doctorId = $_GET['doctor_id'] ?? 0;
        $date = $_GET['date'] ?? '';
        
        if (!$doctorId || !$date) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Doctor ID and date required']);
            return;
        }
        
        // Generate available time slots for the requested date
        $slots = [
            '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
        ];
        
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'doctor_id' => $doctorId,
            'date' => $date,
            'slots' => $slots
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to load time slots']);
    }
}

function bookAppointment() {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $doctorId = $input['doctor_id'] ?? 0;
        $date = $input['appointment_date'] ?? '';
        $time = $input['appointment_time'] ?? '';
        $patientName = $input['patient_name'] ?? '';
        $patientPhone = $input['patient_phone'] ?? '';
        $patientEmail = $input['patient_email'] ?? '';
        
        if (!$doctorId || !$date || !$time || !$patientName || !$patientPhone) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing required fields']);
            return;
        }
        
        // Generate booking reference
        $bookingReference = 'HCP' . date('Ymd') . sprintf('%03d', rand(1, 999));
        
        // Mock successful booking
        $appointment = [
            'id' => rand(1000, 9999),
            'booking_reference' => $bookingReference,
            'doctor_id' => $doctorId,
            'doctor_name' => 'Dr. ' . ($doctorId == 1 ? 'Sarah Johnson' : 'Michael Chen'),
            'appointment_date' => $date,
            'appointment_time' => $time,
            'patient_name' => $patientName,
            'patient_phone' => $patientPhone,
            'patient_email' => $patientEmail,
            'status' => 'confirmed',
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => 'Appointment booked successfully',
            'appointment' => $appointment
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to book appointment']);
    }
}
?>