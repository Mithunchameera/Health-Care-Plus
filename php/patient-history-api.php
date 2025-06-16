<?php
/**
 * Patient History API
 * Handles patient medical history and records viewing
 */

require_once 'config.php';

setCORSHeaders();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Check authentication for doctors and authorized staff
$currentUser = checkUserAuth(['doctor', 'admin', 'staff']);
if (!$currentUser) {
    sendResponse(['error' => 'Authentication required'], 401);
}

class PatientHistoryAPI {
    private $mockStorage;
    private $currentUser;
    
    public function __construct($user) {
        $this->mockStorage = MockDataStorage::getInstance();
        $this->currentUser = $user;
    }
    
    public function handleRequest() {
        $action = $_GET['action'] ?? $_POST['action'] ?? '';
        
        switch ($action) {
            case 'get_patient_history':
                $this->getPatientHistory();
                break;
            case 'get_patient_appointments':
                $this->getPatientAppointments();
                break;
            case 'get_patient_records':
                $this->getPatientMedicalRecords();
                break;
            case 'add_medical_record':
                $this->addMedicalRecord();
                break;
            case 'get_patient_prescriptions':
                $this->getPatientPrescriptions();
                break;
            case 'search_patients':
                $this->searchPatients();
                break;
            default:
                sendResponse(['error' => 'Invalid action'], 400);
        }
    }
    
    private function getPatientHistory() {
        try {
            $patientId = $_GET['patient_id'] ?? 0;
            
            if (!$patientId) {
                sendResponse(['error' => 'Patient ID is required'], 400);
                return;
            }
            
            // Get patient basic info
            $patient = $this->mockStorage->getPatientById($patientId);
            if (!$patient) {
                sendResponse(['error' => 'Patient not found'], 404);
                return;
            }
            
            // Get comprehensive patient history
            $appointments = $this->mockStorage->getAppointmentsByPatient($patientId);
            $medicalRecords = $this->generateMedicalRecords($patientId);
            $prescriptions = $this->generatePrescriptions($patientId);
            $vitals = $this->generateVitalSigns($patientId);
            
            // Process appointments with doctor details
            foreach ($appointments as &$appointment) {
                $doctor = $this->mockStorage->getDoctorById($appointment['doctor_id']);
                $appointment['doctor_name'] = $doctor ? $doctor['name'] : 'Unknown Doctor';
                $appointment['specialty'] = $doctor ? $doctor['specialty'] : 'Unknown';
            }
            
            // Sort appointments by date (newest first)
            usort($appointments, function($a, $b) {
                return strtotime($b['date']) - strtotime($a['date']);
            });
            
            $history = [
                'patient' => $patient,
                'appointments' => $appointments,
                'medical_records' => $medicalRecords,
                'prescriptions' => $prescriptions,
                'vital_signs' => $vitals,
                'statistics' => [
                    'total_appointments' => count($appointments),
                    'total_records' => count($medicalRecords),
                    'active_prescriptions' => count(array_filter($prescriptions, function($p) { return $p['status'] === 'active'; })),
                    'last_visit' => !empty($appointments) ? $appointments[0]['date'] : null
                ]
            ];
            
            sendResponse([
                'success' => true,
                'history' => $history
            ]);
            
        } catch (Exception $e) {
            logError("Get patient history error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load patient history'], 500);
        }
    }
    
    private function getPatientAppointments() {
        try {
            $patientId = $_GET['patient_id'] ?? 0;
            $limit = $_GET['limit'] ?? 20;
            
            if (!$patientId) {
                sendResponse(['error' => 'Patient ID is required'], 400);
                return;
            }
            
            $appointments = $this->mockStorage->getAppointmentsByPatient($patientId);
            
            // Add doctor details and additional info
            foreach ($appointments as &$appointment) {
                $doctor = $this->mockStorage->getDoctorById($appointment['doctor_id']);
                $appointment['doctor_name'] = $doctor ? $doctor['name'] : 'Unknown Doctor';
                $appointment['specialty'] = $doctor ? $doctor['specialty'] : 'Unknown';
                $appointment['location'] = $doctor ? $doctor['location'] : 'Unknown Location';
                $appointment['fee'] = $doctor ? $doctor['fee'] : 0;
                
                // Add appointment outcome if completed
                if ($appointment['status'] === 'completed') {
                    $appointment['outcome'] = $this->generateAppointmentOutcome();
                }
            }
            
            // Sort and limit
            usort($appointments, function($a, $b) {
                return strtotime($b['date']) - strtotime($a['date']);
            });
            
            $appointments = array_slice($appointments, 0, $limit);
            
            sendResponse([
                'success' => true,
                'appointments' => $appointments
            ]);
            
        } catch (Exception $e) {
            logError("Get patient appointments error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load patient appointments'], 500);
        }
    }
    
    private function getPatientMedicalRecords() {
        try {
            $patientId = $_GET['patient_id'] ?? 0;
            
            if (!$patientId) {
                sendResponse(['error' => 'Patient ID is required'], 400);
                return;
            }
            
            $records = $this->generateMedicalRecords($patientId);
            
            sendResponse([
                'success' => true,
                'records' => $records
            ]);
            
        } catch (Exception $e) {
            logError("Get patient medical records error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load medical records'], 500);
        }
    }
    
    private function getPatientPrescriptions() {
        try {
            $patientId = $_GET['patient_id'] ?? 0;
            
            if (!$patientId) {
                sendResponse(['error' => 'Patient ID is required'], 400);
                return;
            }
            
            $prescriptions = $this->generatePrescriptions($patientId);
            
            sendResponse([
                'success' => true,
                'prescriptions' => $prescriptions
            ]);
            
        } catch (Exception $e) {
            logError("Get patient prescriptions error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load prescriptions'], 500);
        }
    }
    
    private function searchPatients() {
        try {
            $query = sanitizeInput($_GET['query'] ?? '');
            
            if (strlen($query) < 2) {
                sendResponse(['error' => 'Search query must be at least 2 characters'], 400);
                return;
            }
            
            $patients = $this->mockStorage->getPatients();
            $results = [];
            
            foreach ($patients as $patient) {
                if (stripos($patient['full_name'], $query) !== false || 
                    stripos($patient['email'], $query) !== false ||
                    stripos($patient['phone'], $query) !== false) {
                    $results[] = $patient;
                }
            }
            
            sendResponse([
                'success' => true,
                'patients' => $results
            ]);
            
        } catch (Exception $e) {
            logError("Search patients error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to search patients'], 500);
        }
    }
    
    private function addMedicalRecord() {
        try {
            $patientId = $_POST['patient_id'] ?? 0;
            $diagnosis = sanitizeInput($_POST['diagnosis'] ?? '');
            $treatment = sanitizeInput($_POST['treatment'] ?? '');
            $notes = sanitizeInput($_POST['notes'] ?? '');
            
            if (!$patientId || !$diagnosis) {
                sendResponse(['error' => 'Patient ID and diagnosis are required'], 400);
                return;
            }
            
            // In a real application, this would be saved to database
            $record = [
                'id' => rand(1000, 9999),
                'patient_id' => $patientId,
                'doctor_id' => $this->currentUser['id'],
                'doctor_name' => $this->currentUser['full_name'],
                'date' => date('Y-m-d'),
                'diagnosis' => $diagnosis,
                'treatment' => $treatment,
                'notes' => $notes,
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            sendResponse([
                'success' => true,
                'message' => 'Medical record added successfully',
                'record' => $record
            ]);
            
        } catch (Exception $e) {
            logError("Add medical record error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to add medical record'], 500);
        }
    }
    
    private function generateMedicalRecords($patientId) {
        return [
            [
                'id' => 1,
                'date' => '2025-06-10',
                'doctor_name' => 'Dr. Sarah Johnson',
                'specialty' => 'Cardiology',
                'diagnosis' => 'Hypertension',
                'treatment' => 'Prescribed Lisinopril 10mg daily',
                'notes' => 'Patient responded well to treatment. Blood pressure normalized.',
                'type' => 'consultation',
                'status' => 'completed'
            ],
            [
                'id' => 2,
                'date' => '2025-05-28',
                'doctor_name' => 'Dr. Emily Rodriguez',
                'specialty' => 'General Medicine',
                'diagnosis' => 'Seasonal Allergies',
                'treatment' => 'Antihistamine and nasal spray',
                'notes' => 'Symptoms improved significantly. Continue treatment as needed.',
                'type' => 'follow_up',
                'status' => 'completed'
            ],
            [
                'id' => 3,
                'date' => '2025-05-15',
                'doctor_name' => 'Dr. Michael Chen',
                'specialty' => 'Neurology',
                'diagnosis' => 'Migraine Headaches',
                'treatment' => 'Prescribed Sumatriptan for acute episodes',
                'notes' => 'Patient education provided on triggers. Follow-up in 6 weeks.',
                'type' => 'consultation',
                'status' => 'completed'
            ]
        ];
    }
    
    private function generatePrescriptions($patientId) {
        return [
            [
                'id' => 1,
                'date' => '2025-06-10',
                'doctor_name' => 'Dr. Sarah Johnson',
                'medication' => 'Lisinopril',
                'dosage' => '10mg',
                'frequency' => 'Once daily',
                'duration' => '30 days',
                'instructions' => 'Take with food in the morning',
                'status' => 'active',
                'refills' => 3
            ],
            [
                'id' => 2,
                'date' => '2025-05-28',
                'doctor_name' => 'Dr. Emily Rodriguez',
                'medication' => 'Cetirizine',
                'dosage' => '10mg',
                'frequency' => 'Once daily as needed',
                'duration' => '30 days',
                'instructions' => 'Take for allergy symptoms',
                'status' => 'active',
                'refills' => 2
            ],
            [
                'id' => 3,
                'date' => '2025-05-15',
                'doctor_name' => 'Dr. Michael Chen',
                'medication' => 'Sumatriptan',
                'dosage' => '50mg',
                'frequency' => 'As needed for migraine',
                'duration' => '30 days',
                'instructions' => 'Take at onset of migraine. Max 2 doses in 24 hours.',
                'status' => 'active',
                'refills' => 1
            ]
        ];
    }
    
    private function generateVitalSigns($patientId) {
        return [
            [
                'date' => '2025-06-10',
                'blood_pressure' => '128/82',
                'heart_rate' => '72',
                'temperature' => '98.6°F',
                'weight' => '165 lbs',
                'height' => '5\'8"',
                'bmi' => '25.1',
                'oxygen_saturation' => '98%'
            ],
            [
                'date' => '2025-05-28',
                'blood_pressure' => '135/88',
                'heart_rate' => '78',
                'temperature' => '98.4°F',
                'weight' => '167 lbs',
                'height' => '5\'8"',
                'bmi' => '25.4',
                'oxygen_saturation' => '97%'
            ]
        ];
    }
    
    private function generateAppointmentOutcome() {
        $outcomes = [
            'Patient responded well to treatment',
            'Follow-up appointment scheduled',
            'Prescription updated',
            'Symptoms improved significantly',
            'Further tests recommended',
            'Treatment plan adjusted'
        ];
        
        return $outcomes[array_rand($outcomes)];
    }
}

// Handle the request
$patientHistoryAPI = new PatientHistoryAPI($currentUser);
$patientHistoryAPI->handleRequest();
?>