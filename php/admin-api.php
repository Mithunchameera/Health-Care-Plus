<?php
/**
 * Admin API Endpoints
 * Handles admin-specific API requests
 */

require_once 'config.php';
require_once 'database.php';

setCORSHeaders();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$currentUser = checkUserAuth(['admin', 'staff']);
if (!$currentUser) {
    sendResponse(['error' => 'Authentication required'], 401);
}

class AdminAPI {
    private $mockStorage;
    private $db;
    private $currentUser;
    
    public function __construct($user) {
        $this->mockStorage = MockDataStorage::getInstance();
        $this->db = Database::getInstance();
        $this->currentUser = $user;
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = $_GET['action'] ?? $_POST['action'] ?? '';
        
        switch ($action) {
            case 'get_stats':
                $this->getSystemStats();
                break;
            case 'get_recent_activity':
                $this->getRecentActivity();
                break;
            case 'get_doctors':
                $this->getDoctors();
                break;
            case 'get_appointments':
                $this->getAppointments();
                break;
            case 'get_patients':
                $this->getPatients();
                break;
            case 'get_staff':
                $this->getStaff();
                break;
            case 'get_staff_by_id':
                $this->getStaffById();
                break; 
            case 'add_staff':
                $this->addStaff();
                break;
            case 'update_staff':
                $this->updateStaff();
                break;
            case 'toggle_staff_status':
                $this->toggleStaffStatus();
                break;
            case 'add_doctor':
                $this->addDoctor();
                break;
            case 'update_settings':
                $this->updateSettings();
                break;
            case 'toggle_doctor_status':
                $this->toggleDoctorStatus();
                break;
            default:
                sendResponse(['error' => 'Invalid action'], 400);
        }
    }
    
    private function getSystemStats() {
        try {
            $doctors = $this->mockStorage->getDoctors();
            $appointments = $this->mockStorage->getAppointments();
            $users = $this->mockStorage->getUsers();
            
            $patients = array_filter($users, function($user) {
                return $user['role'] === 'patient';
            });
            
            $todayAppointments = 0;
            foreach ($appointments as $appointment) {
                if (date('Y-m-d', strtotime($appointment['date'])) === date('Y-m-d')) {
                    $todayAppointments++;
                }
            }
            
            // Calculate monthly revenue (mock calculation)
            $monthlyRevenue = 0;
            foreach ($appointments as $appointment) {
                if (date('Y-m', strtotime($appointment['date'])) === date('Y-m')) {
                    $doctor = $this->mockStorage->getDoctorById($appointment['doctor_id']);
                    $monthlyRevenue += $doctor ? $doctor['fee'] : 150;
                }
            }
            
            $stats = [
                'total_doctors' => count($doctors),
                'total_patients' => count($patients),
                'today_appointments' => $todayAppointments,
                'monthly_revenue' => $monthlyRevenue
            ];
            
            sendResponse([
                'success' => true,
                'stats' => $stats
            ]);
            
        } catch (Exception $e) {
            logError("Get system stats error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load statistics'], 500);
        }
    }
    
    private function getRecentActivity() {
        try {
            // Mock recent activity data
            $activities = [
                [
                    'time' => '11:30',
                    'description' => 'New appointment booked',
                    'user' => 'John Doe',
                    'status' => 'confirmed'
                ],
                [
                    'time' => '11:15',
                    'description' => 'Doctor schedule updated',
                    'user' => 'Dr. Sarah Johnson',
                    'status' => 'updated'
                ],
                [
                    'time' => '10:45',
                    'description' => 'Payment processed',
                    'user' => 'Maria Garcia',
                    'status' => 'completed'
                ],
                [
                    'time' => '10:30',
                    'description' => 'New patient registered',
                    'user' => 'Admin',
                    'status' => 'active'
                ],
                [
                    'time' => '10:15',
                    'description' => 'Appointment cancelled',
                    'user' => 'Dr. Michael Chen',
                    'status' => 'cancelled'
                ]
            ];
            
            sendResponse([
                'success' => true,
                'activity' => $activities
            ]);
            
        } catch (Exception $e) {
            logError("Get recent activity error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load recent activity'], 500);
        }
    }
    
    private function getDoctors() {
        try {
            $doctors = $this->mockStorage->getDoctors();
            
            sendResponse([
                'success' => true,
                'doctors' => $doctors
            ]);
            
        } catch (Exception $e) {
            logError("Get doctors error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load doctors'], 500);
        }
    }
    
    private function getAppointments() {
        try {
            $appointments = $this->mockStorage->getAppointments();
            
            foreach ($appointments as &$appointment) {
                $doctor = $this->mockStorage->getDoctorById($appointment['doctor_id']);
                $patient = $this->mockStorage->getUserById($appointment['patient_id']);
                
                $appointment['doctor_name'] = $doctor ? $doctor['name'] : 'Unknown Doctor';
                $appointment['patient_name'] = $patient ? $patient['full_name'] : 'Unknown Patient';
                $appointment['fee'] = $doctor ? $doctor['fee'] : 150;
            }
            
            // Sort by date (newest first)
            usort($appointments, function($a, $b) {
                return strtotime($b['date']) - strtotime($a['date']);
            });
            
            sendResponse([
                'success' => true,
                'appointments' => $appointments
            ]);
            
        } catch (Exception $e) {
            logError("Get appointments error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load appointments'], 500);
        }
    }
    
    private function getPatients() {
        try {
            $users = $this->mockStorage->getUsers();
            $appointments = $this->mockStorage->getAppointments();
            
            $patients = array_filter($users, function($user) {
                return $user['role'] === 'patient';
            });
            
            foreach ($patients as &$patient) {
                $patientAppointments = array_filter($appointments, function($apt) use ($patient) {
                    return $apt['patient_id'] == $patient['id'];
                });
                
                $lastVisit = null;
                foreach ($patientAppointments as $apt) {
                    if ($apt['status'] === 'completed' && (!$lastVisit || strtotime($apt['date']) > strtotime($lastVisit))) {
                        $lastVisit = $apt['date'];
                    }
                }
                
                $patient['name'] = $patient['full_name'];
                $patient['last_visit'] = $lastVisit;
                $patient['total_visits'] = count($patientAppointments);
            }
            
            sendResponse([
                'success' => true,
                'patients' => array_values($patients)
            ]);
            
        } catch (Exception $e) {
            logError("Get patients error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load patients'], 500);
        }
    }
    
    private function getStaff() {
        try {
            $sql = "SELECT 
                        u.id, 
                        u.first_name || ' ' || u.last_name as name,
                        u.email, 
                        u.phone, 
                        u.role,
                        s.department,
                        s.hire_date,
                        u.is_active
                    FROM users u 
                    LEFT JOIN staff s ON u.id = s.user_id 
                    WHERE u.role IN ('admin', 'staff')
                    ORDER BY u.first_name, u.last_name";
            
            $staff = $this->db->fetchAll($sql);
            
            sendResponse([
                'success' => true,
                'staff' => $staff
            ]);
            
        } catch (Exception $e) {
            logError("Get staff error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load staff'], 500);
        }
    }
    
    private function addDoctor() {
        try {
            // Admin permission check
            if ($this->currentUser['role'] !== 'admin') {
                sendResponse(['error' => 'Insufficient permissions'], 403);
                return;
            }
            
            $doctorData = [
                'name' => sanitizeInput($_POST['new-doctor-name'] ?? ''),
                'email' => sanitizeInput($_POST['new-doctor-email'] ?? ''),
                'phone' => sanitizeInput($_POST['new-doctor-phone'] ?? ''),
                'specialty' => sanitizeInput($_POST['new-doctor-specialty'] ?? ''),
                'experience' => intval($_POST['new-doctor-experience'] ?? 0),
                'fee' => floatval($_POST['new-doctor-fee'] ?? 0)
            ];
            
            // Validate data
            $errors = [];
            
            if (empty($doctorData['name'])) {
                $errors[] = 'Doctor name is required';
            }
            
            if (!validateEmail($doctorData['email'])) {
                $errors[] = 'Valid email is required';
            }
            
            if (!validatePhone($doctorData['phone'])) {
                $errors[] = 'Valid phone number is required';
            }
            
            if (empty($doctorData['specialty'])) {
                $errors[] = 'Specialty is required';
            }
            
            if ($doctorData['experience'] < 0) {
                $errors[] = 'Experience must be a positive number';
            }
            
            if ($doctorData['fee'] <= 0) {
                $errors[] = 'Consultation fee must be greater than 0';
            }
            
            if (!empty($errors)) {
                sendResponse(['error' => 'Validation failed', 'details' => $errors], 400);
                return;
            }
            
            // In a real application, this would insert into the database
            sendResponse([
                'success' => true,
                'message' => 'Doctor added successfully',
                'doctor' => $doctorData
            ]);
            
        } catch (Exception $e) {
            logError("Add doctor error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to add doctor'], 500);
        }
    }
    
    private function updateSettings() {
        try {
            // Check permissions
            if (!hasPermission($this->currentUser, 'manage_system')) {
                sendResponse(['error' => 'Insufficient permissions'], 403);
                return;
            }
            
            $settings = [
                'hospital_name' => sanitizeInput($_POST['hospital-name'] ?? ''),
                'hospital_address' => sanitizeInput($_POST['hospital-address'] ?? ''),
                'hospital_phone' => sanitizeInput($_POST['hospital-phone'] ?? ''),
                'hospital_email' => sanitizeInput($_POST['hospital-email'] ?? ''),
                'appointment_fee' => floatval($_POST['appointment-fee'] ?? 0),
                'booking_advance' => intval($_POST['booking-advance'] ?? 30)
            ];
            
            // Validate settings
            $errors = [];
            
            if (empty($settings['hospital_name'])) {
                $errors[] = 'Hospital name is required';
            }
            
            if (!validateEmail($settings['hospital_email'])) {
                $errors[] = 'Valid hospital email is required';
            }
            
            if (!validatePhone($settings['hospital_phone'])) {
                $errors[] = 'Valid hospital phone is required';
            }
            
            if ($settings['appointment_fee'] < 0) {
                $errors[] = 'Appointment fee must be non-negative';
            }
            
            if ($settings['booking_advance'] < 1) {
                $errors[] = 'Booking advance days must be at least 1';
            }
            
            if (!empty($errors)) {
                sendResponse(['error' => 'Validation failed', 'details' => $errors], 400);
                return;
            }
            
            // In a real application, this would update the settings in the database
            sendResponse([
                'success' => true,
                'message' => 'Settings updated successfully',
                'settings' => $settings
            ]);
            
        } catch (Exception $e) {
            logError("Update settings error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to update settings'], 500);
        }
    }
    
    private function toggleDoctorStatus() {
        try {
            $doctorId = intval($_POST['doctor_id'] ?? 0);
            $newStatus = filter_var($_POST['status'] ?? false, FILTER_VALIDATE_BOOLEAN);
            
            if ($doctorId <= 0) {
                sendResponse(['error' => 'Invalid doctor ID'], 400);
                return;
            }
            
            // Get doctor information
            $doctor = $this->mockStorage->getDoctorById($doctorId);
            if (!$doctor) {
                sendResponse(['error' => 'Doctor not found'], 404);
                return;
            }
            
            // Update doctor status in mock storage
            $updated = $this->mockStorage->updateDoctorStatus($doctorId, $newStatus);
            
            if ($updated) {
                // Log the activity
                $statusText = $newStatus ? 'activated' : 'deactivated';
                $this->logActivity([
                    'action' => 'doctor_status_change',
                    'description' => "Doctor {$doctor['name']} {$statusText}",
                    'user_id' => $this->currentUser['id'],
                    'target_id' => $doctorId,
                    'status' => $statusText
                ]);
                
                sendResponse([
                    'success' => true,
                    'message' => "Doctor status updated successfully",
                    'doctor_id' => $doctorId,
                    'new_status' => $newStatus,
                    'status_text' => $statusText
                ]);
            } else {
                sendResponse(['error' => 'Failed to update doctor status'], 500);
            }
            
        } catch (Exception $e) {
            logError("Toggle doctor status error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to toggle doctor status'], 500);
        }
    }
    
    private function getStaffById() {
        try {
            $staffId = intval($_GET['id'] ?? 0);
            
            if ($staffId <= 0) {
                sendResponse(['error' => 'Invalid staff ID'], 400);
                return;
            }
            
            $sql = "SELECT 
                        u.id,
                        u.first_name || ' ' || u.last_name as name,
                        u.email,
                        u.phone,
                        u.role,
                        s.department,
                        s.hire_date,
                        u.is_active
                    FROM users u 
                    LEFT JOIN staff s ON u.id = s.user_id 
                    WHERE u.id = ? AND u.role IN ('admin', 'staff')";
            
            $staff = $this->db->fetchOne($sql, [$staffId]);
            
            if (!$staff) {
                sendResponse(['error' => 'Staff member not found'], 404);
                return;
            }
            
            sendResponse([
                'success' => true,
                'staff' => $staff
            ]);
            
        } catch (Exception $e) {
            logError("Get staff by ID error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to load staff member'], 500);
        }
    }
    
    private function addStaff() {
        try {
            // Admin permission check
            if ($this->currentUser['role'] !== 'admin') {
                sendResponse(['error' => 'Insufficient permissions'], 403);
                return;
            }
            
            $staffData = [
                'name' => sanitizeInput($_POST['name'] ?? ''),
                'email' => sanitizeInput($_POST['email'] ?? ''),
                'phone' => sanitizeInput($_POST['phone'] ?? ''),
                'role' => sanitizeInput($_POST['role'] ?? 'staff'),
                'department' => sanitizeInput($_POST['department'] ?? ''),
                'hire_date' => sanitizeInput($_POST['hire_date'] ?? '')
            ];
            
            // Validate data
            $errors = [];
            
            if (empty($staffData['name'])) {
                $errors[] = 'Staff name is required';
            }
            
            if (!validateEmail($staffData['email'])) {
                $errors[] = 'Valid email is required';
            }
            
            if (empty($staffData['phone'])) {
                $errors[] = 'Phone number is required';
            }
            
            if (empty($staffData['role'])) {
                $errors[] = 'Role is required';
            }
            
            if (empty($staffData['department'])) {
                $errors[] = 'Department is required';
            }
            
            if (!empty($errors)) {
                sendResponse(['error' => implode(', ', $errors)], 400);
                return;
            }
            
            // Create user record
            $this->db->beginTransaction();
            
            $userSql = "INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone, is_active) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            
            $nameParts = explode(' ', $staffData['name'], 2);
            $firstName = $nameParts[0];
            $lastName = $nameParts[1] ?? '';
            
            $userId = $this->db->insert($userSql, [
                strtolower(str_replace(' ', '.', $staffData['name'])),
                $staffData['email'],
                password_hash('defaultpassword123', PASSWORD_DEFAULT),
                $staffData['role'],
                $firstName,
                $lastName,
                $staffData['phone'],
                true
            ]);
            
            // Create staff record
            $staffSql = "INSERT INTO staff (user_id, department, hire_date, employee_id) VALUES (?, ?, ?, ?)";
            $this->db->insert($staffSql, [
                $userId,
                $staffData['department'],
                $staffData['hire_date'],
                'EMP' . str_pad($userId, 3, '0', STR_PAD_LEFT)
            ]);
            
            $this->db->commit();
            
            if ($userId) {
                $this->logActivity([
                    'action' => 'staff_added',
                    'description' => "New staff member {$staffData['name']} added",
                    'user_id' => $this->currentUser['id'],
                    'target_id' => $userId
                ]);
                
                sendResponse([
                    'success' => true,
                    'message' => 'Staff member added successfully',
                    'staff_id' => $userId
                ]);
            } else {
                $this->db->rollback();
                sendResponse(['error' => 'Failed to add staff member'], 500);
            }
            
        } catch (Exception $e) {
            logError("Add staff error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to add staff member'], 500);
        }
    }
    
    private function updateStaff() {
        try {
            // Admin permission check
            if ($this->currentUser['role'] !== 'admin') {
                sendResponse(['error' => 'Insufficient permissions'], 403);
                return;
            }
            
            $staffId = intval($_POST['staff_id'] ?? 0);
            
            if ($staffId <= 0) {
                sendResponse(['error' => 'Invalid staff ID'], 400);
                return;
            }
            
            $staffData = [
                'name' => sanitizeInput($_POST['name'] ?? ''),
                'email' => sanitizeInput($_POST['email'] ?? ''),
                'phone' => sanitizeInput($_POST['phone'] ?? ''),
                'role' => sanitizeInput($_POST['role'] ?? ''),
                'department' => sanitizeInput($_POST['department'] ?? ''),
                'hire_date' => sanitizeInput($_POST['hire_date'] ?? ''),
                'is_active' => intval($_POST['is_active'] ?? 1) === 1
            ];
            
            // Validate data
            $errors = [];
            
            if (empty($staffData['name'])) {
                $errors[] = 'Staff name is required';
            }
            
            if (!validateEmail($staffData['email'])) {
                $errors[] = 'Valid email is required';
            }
            
            if (empty($staffData['phone'])) {
                $errors[] = 'Phone number is required';
            }
            
            if (!empty($errors)) {
                sendResponse(['error' => implode(', ', $errors)], 400);
                return;
            }
            
            // Update user and staff records
            $this->db->beginTransaction();
            
            $nameParts = explode(' ', $staffData['name'], 2);
            $firstName = $nameParts[0];
            $lastName = $nameParts[1] ?? '';
            
            // Update user table
            $userSql = "UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, role = ?, is_active = ?, updated_at = NOW() WHERE id = ?";
            $this->db->update($userSql, [
                $firstName,
                $lastName,
                $staffData['email'],
                $staffData['phone'],
                $staffData['role'],
                $staffData['is_active'],
                $staffId
            ]);
            
            // Update staff table
            $staffSql = "UPDATE staff SET department = ?, hire_date = ?, updated_at = NOW() WHERE user_id = ?";
            $updated = $this->db->update($staffSql, [
                $staffData['department'],
                $staffData['hire_date'],
                $staffId
            ]);
            
            $this->db->commit();
            
            if ($updated) {
                $this->logActivity([
                    'action' => 'staff_updated',
                    'description' => "Staff member {$staffData['name']} updated",
                    'user_id' => $this->currentUser['id'],
                    'target_id' => $staffId
                ]);
                
                sendResponse([
                    'success' => true,
                    'message' => 'Staff member updated successfully',
                    'staff_id' => $staffId
                ]);
            } else {
                sendResponse(['error' => 'Failed to update staff member'], 500);
            }
            
        } catch (Exception $e) {
            logError("Update staff error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to update staff member'], 500);
        }
    }
    
    private function toggleStaffStatus() {
        try {
            // Admin permission check
            if ($this->currentUser['role'] !== 'admin') {
                sendResponse(['error' => 'Insufficient permissions'], 403);
                return;
            }
            
            $staffId = intval($_POST['staff_id'] ?? 0);
            
            if ($staffId <= 0) {
                sendResponse(['error' => 'Invalid staff ID'], 400);
                return;
            }
            
            // Get current staff status
            $sql = "SELECT u.*, u.first_name || ' ' || u.last_name as full_name 
                    FROM users u 
                    WHERE u.id = ? AND u.role IN ('admin', 'staff')";
            
            $staff = $this->db->fetchOne($sql, [$staffId]);
            
            if (!$staff) {
                sendResponse(['error' => 'Staff member not found'], 404);
                return;
            }
            
            $newStatus = !($staff['is_active'] ?? true);
            
            // Update staff status
            $updateSql = "UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?";
            $updated = $this->db->update($updateSql, [$newStatus, $staffId]);
            
            if ($updated) {
                $statusText = $newStatus ? 'activated' : 'deactivated';
                $this->logActivity([
                    'action' => 'staff_status_change',
                    'description' => "Staff member {$staff['full_name']} {$statusText}",
                    'user_id' => $this->currentUser['id'],
                    'target_id' => $staffId,
                    'status' => $statusText
                ]);
                
                sendResponse([
                    'success' => true,
                    'message' => "Staff status updated successfully",
                    'staff_id' => $staffId,
                    'new_status' => $newStatus,
                    'status_text' => $statusText
                ]);
            } else {
                sendResponse(['error' => 'Failed to update staff status'], 500);
            }
            
        } catch (Exception $e) {
            logError("Toggle staff status error: " . $e->getMessage());
            sendResponse(['error' => 'Failed to toggle staff status'], 500);
        }
    }
    
    private function logActivity($activity) {
        try {
            // In a real application, this would insert into an activity log table
            // For now, we'll just log it to the error log for demonstration
            $logEntry = [
                'timestamp' => date('Y-m-d H:i:s'),
                'action' => $activity['action'] ?? 'unknown',
                'description' => $activity['description'] ?? '',
                'user_id' => $activity['user_id'] ?? 0,
                'target_id' => $activity['target_id'] ?? null,
                'status' => $activity['status'] ?? 'completed'
            ];
            
            logError("Activity Log: " . json_encode($logEntry));
            
        } catch (Exception $e) {
            logError("Failed to log activity: " . $e->getMessage());
        }
    }
}

// Handle the request
$adminAPI = new AdminAPI($currentUser);
$adminAPI->handleRequest();
?>