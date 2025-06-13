-- Healthcare+ Database Schema
-- Patient and Doctor Management System

-- Users table (for all user types)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin', 'staff')),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    address TEXT,
    city VARCHAR(50),
    country VARCHAR(50),
    profile_picture TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors table (extends users for doctor-specific info)
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    specialty VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE,
    experience_years INTEGER,
    education TEXT,
    consultation_fee DECIMAL(10,2),
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    bio TEXT,
    languages TEXT[], -- Array of languages spoken
    certifications TEXT[],
    hospital_affiliations TEXT[],
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients table (extends users for patient-specific info)
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    medical_history TEXT,
    allergies TEXT,
    blood_type VARCHAR(5),
    insurance_provider VARCHAR(100),
    insurance_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    reason_for_visit TEXT,
    notes TEXT,
    consultation_fee DECIMAL(10,2),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    booking_reference VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctor availability table
CREATE TABLE doctor_availability (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointment slots table (for specific time slots)
CREATE TABLE appointment_slots (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    slot_time TIME NOT NULL,
    is_booked BOOLEAN DEFAULT false,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medical records table
CREATE TABLE medical_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    diagnosis TEXT,
    treatment TEXT,
    medications TEXT,
    follow_up_date DATE,
    record_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_doctor_availability_doctor_id ON doctor_availability(doctor_id);
CREATE INDEX idx_appointment_slots_doctor_date ON appointment_slots(doctor_id, slot_date);

-- Insert sample data
-- Sample users
INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone, date_of_birth, gender) VALUES
('patient_demo', 'patient@demo.com', '$2y$10$demo_hash', 'patient', 'John', 'Doe', '+1234567890', '1990-05-15', 'male'),
('doctor_smith', 'dr.smith@demo.com', '$2y$10$demo_hash', 'doctor', 'Sarah', 'Smith', '+1234567891', '1980-03-22', 'female'),
('doctor_johnson', 'dr.johnson@demo.com', '$2y$10$demo_hash', 'doctor', 'Michael', 'Johnson', '+1234567892', '1975-11-08', 'male'),
('admin_user', 'admin@demo.com', '$2y$10$demo_hash', 'admin', 'Admin', 'User', '+1234567893', '1985-07-30', 'other');

-- Sample doctors
INSERT INTO doctors (user_id, specialty, license_number, experience_years, consultation_fee, rating, total_reviews, bio) VALUES
(2, 'Cardiology', 'MD12345', 15, 150.00, 4.8, 127, 'Experienced cardiologist specializing in heart disease prevention and treatment.'),
(3, 'Dermatology', 'MD12346', 10, 120.00, 4.6, 89, 'Board-certified dermatologist with expertise in skin conditions and cosmetic procedures.');

-- Sample patients
INSERT INTO patients (user_id, emergency_contact_name, emergency_contact_phone, blood_type) VALUES
(1, 'Jane Doe', '+1234567894', 'O+');

-- Sample doctor availability
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time) VALUES
(1, 1, '09:00', '17:00'), -- Monday
(1, 2, '09:00', '17:00'), -- Tuesday
(1, 3, '09:00', '17:00'), -- Wednesday
(1, 4, '09:00', '17:00'), -- Thursday
(1, 5, '09:00', '15:00'), -- Friday
(2, 1, '10:00', '18:00'), -- Monday
(2, 2, '10:00', '18:00'), -- Tuesday
(2, 3, '10:00', '18:00'), -- Wednesday
(2, 4, '10:00', '18:00'), -- Thursday
(2, 5, '10:00', '16:00'); -- Friday