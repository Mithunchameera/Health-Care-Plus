import { pgTable, serial, varchar, text, boolean, timestamp, integer, decimal, date, time, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['patient', 'doctor', 'admin', 'staff']);
export const appointmentStatusEnum = pgEnum('appointment_status', ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'refunded', 'completed', 'failed']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: roleEnum('role').notNull(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  dateOfBirth: date('date_of_birth'),
  gender: varchar('gender', { length: 10 }),
  address: text('address'),
  city: varchar('city', { length: 50 }),
  country: varchar('country', { length: 50 }),
  profilePicture: text('profile_picture'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
  roleIdx: index('idx_users_role').on(table.role)
}));

// Doctors table
export const doctors = pgTable('doctors', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  specialty: varchar('specialty', { length: 100 }).notNull(),
  licenseNumber: varchar('license_number', { length: 50 }).unique(),
  experienceYears: integer('experience_years'),
  education: text('education'),
  consultationFee: decimal('consultation_fee', { precision: 10, scale: 2 }),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0.00'),
  totalReviews: integer('total_reviews').default(0),
  bio: text('bio'),
  languages: text('languages').array(),
  certifications: text('certifications').array(),
  hospitalAffiliations: text('hospital_affiliations').array(),
  isAvailable: boolean('is_available').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Patients table
export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  emergencyContactName: varchar('emergency_contact_name', { length: 100 }),
  emergencyContactPhone: varchar('emergency_contact_phone', { length: 20 }),
  medicalHistory: text('medical_history'),
  allergies: text('allergies'),
  bloodType: varchar('blood_type', { length: 5 }),
  insuranceProvider: varchar('insurance_provider', { length: 100 }),
  insuranceNumber: varchar('insurance_number', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow()
});

// Appointments table
export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }),
  doctorId: integer('doctor_id').references(() => doctors.id, { onDelete: 'cascade' }),
  appointmentDate: date('appointment_date').notNull(),
  appointmentTime: time('appointment_time').notNull(),
  durationMinutes: integer('duration_minutes').default(30),
  status: appointmentStatusEnum('status').default('scheduled'),
  reasonForVisit: text('reason_for_visit'),
  notes: text('notes'),
  consultationFee: decimal('consultation_fee', { precision: 10, scale: 2 }),
  paymentStatus: paymentStatusEnum('payment_status').default('pending'),
  bookingReference: varchar('booking_reference', { length: 50 }).unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  patientIdx: index('idx_appointments_patient_id').on(table.patientId),
  doctorIdx: index('idx_appointments_doctor_id').on(table.doctorId),
  dateIdx: index('idx_appointments_date').on(table.appointmentDate),
  statusIdx: index('idx_appointments_status').on(table.status)
}));

// Doctor availability table
export const doctorAvailability = pgTable('doctor_availability', {
  id: serial('id').primaryKey(),
  doctorId: integer('doctor_id').references(() => doctors.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week'), // 0=Sunday, 6=Saturday
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  isAvailable: boolean('is_available').default(true),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  doctorIdx: index('idx_doctor_availability_doctor_id').on(table.doctorId)
}));

// Appointment slots table
export const appointmentSlots = pgTable('appointment_slots', {
  id: serial('id').primaryKey(),
  doctorId: integer('doctor_id').references(() => doctors.id, { onDelete: 'cascade' }),
  slotDate: date('slot_date').notNull(),
  slotTime: time('slot_time').notNull(),
  isBooked: boolean('is_booked').default(false),
  appointmentId: integer('appointment_id').references(() => appointments.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  doctorDateIdx: index('idx_appointment_slots_doctor_date').on(table.doctorId, table.slotDate)
}));

// Medical records table
export const medicalRecords = pgTable('medical_records', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }),
  doctorId: integer('doctor_id').references(() => doctors.id, { onDelete: 'cascade' }),
  appointmentId: integer('appointment_id').references(() => appointments.id, { onDelete: 'cascade' }),
  diagnosis: text('diagnosis'),
  treatment: text('treatment'),
  medications: text('medications'),
  followUpDate: date('follow_up_date'),
  recordDate: timestamp('record_date').defaultNow()
});

// Payments table
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  appointmentId: integer('appointment_id').references(() => appointments.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  transactionId: varchar('transaction_id', { length: 100 }),
  paymentStatus: paymentStatusEnum('payment_status').default('pending'),
  paymentDate: timestamp('payment_date').defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  doctor: one(doctors, {
    fields: [users.id],
    references: [doctors.userId]
  }),
  patient: one(patients, {
    fields: [users.id],
    references: [patients.userId]
  })
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, {
    fields: [doctors.userId],
    references: [users.id]
  }),
  appointments: many(appointments),
  availability: many(doctorAvailability),
  slots: many(appointmentSlots),
  medicalRecords: many(medicalRecords)
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, {
    fields: [patients.userId],
    references: [users.id]
  }),
  appointments: many(appointments),
  medicalRecords: many(medicalRecords)
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id]
  }),
  doctor: one(doctors, {
    fields: [appointments.doctorId],
    references: [doctors.id]
  }),
  payments: many(payments),
  medicalRecords: many(medicalRecords)
}));