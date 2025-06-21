<?php
/**
 * Temporary Doctors Data for Development
 * Enhanced doctor profiles for Find Doctors and Booking functionality
 */

function getTempDoctorsData() {
    return [
        [
            'id' => 1,
            'name' => 'Dr. Sarah Johnson',
            'specialty' => 'Cardiology',
            'subspecialty' => 'Interventional Cardiology',
            'experience' => 15,
            'rating' => 4.9,
            'reviews' => 234,
            'consultation_fee' => 250.00,
            'education' => 'MD - Harvard Medical School',
            'hospital' => 'City General Hospital',
            'location' => 'Downtown Medical District',
            'phone' => '+1 (555) 123-4567',
            'email' => 'dr.johnson@cityhospital.com',
            'languages' => ['English', 'Spanish'],
            'bio' => 'Dr. Johnson is a board-certified cardiologist with over 15 years of experience in treating complex heart conditions. She specializes in interventional procedures and has performed over 2,000 cardiac catheterizations.',
            'conditions' => ['Heart Disease', 'Hypertension', 'Arrhythmia', 'Heart Failure', 'Coronary Artery Disease', 'Chest Pain'],
            'nextAvailable' => 'Today 2:00 PM',
            'consultationType' => ['In-person', 'Video Call'],
            'available' => true,
            'patients_treated' => 2500,
            'certifications' => ['Board Certified Cardiologist', 'Advanced Cardiac Life Support'],
            'image' => 'doctor1.jpg'
        ],
        [
            'id' => 2,
            'name' => 'Dr. Michael Chen',
            'specialty' => 'Orthopedic Surgery',
            'subspecialty' => 'Sports Medicine',
            'experience' => 12,
            'rating' => 4.8,
            'reviews' => 189,
            'consultation_fee' => 280.00,
            'education' => 'MD - Johns Hopkins University',
            'hospital' => 'Sports Medicine Center',
            'location' => 'Uptown Athletic Complex',
            'phone' => '+1 (555) 234-5678',
            'email' => 'm.chen@sportsmedicine.com',
            'languages' => ['English', 'Mandarin'],
            'bio' => 'Dr. Chen is a renowned orthopedic surgeon specializing in sports-related injuries. He has worked with professional athletes and is known for his minimally invasive surgical techniques.',
            'conditions' => ['Sports Injuries', 'Joint Pain', 'Fractures', 'Arthritis', 'ACL Reconstruction', 'Knee Surgery'],
            'nextAvailable' => 'Tomorrow 9:00 AM',
            'consultationType' => ['In-person'],
            'available' => true,
            'patients_treated' => 1800,
            'certifications' => ['Board Certified Orthopedic Surgeon', 'Sports Medicine Specialist'],
            'image' => 'doctor2.jpg'
        ],
        [
            'id' => 3,
            'name' => 'Dr. Emily Rodriguez',
            'specialty' => 'Pediatrics',
            'subspecialty' => 'Developmental Pediatrics',
            'experience' => 8,
            'rating' => 4.7,
            'reviews' => 156,
            'consultation_fee' => 180.00,
            'education' => 'MD - Stanford Medical School',
            'hospital' => 'Children\'s Medical Center',
            'location' => 'Westside Pediatric Campus',
            'phone' => '+1 (555) 345-6789',
            'email' => 'e.rodriguez@childrenscenter.com',
            'languages' => ['English', 'Spanish', 'Portuguese'],
            'bio' => 'Dr. Rodriguez is passionate about child development and provides comprehensive pediatric care. She has special expertise in developmental delays and behavioral issues in children.',
            'conditions' => ['Child Development', 'Vaccines', 'Common Childhood Illnesses', 'Growth Disorders', 'ADHD', 'Autism Spectrum'],
            'nextAvailable' => 'Today 4:00 PM',
            'consultationType' => ['In-person', 'Video Call'],
            'available' => true,
            'patients_treated' => 1200,
            'certifications' => ['Board Certified Pediatrician', 'Developmental Behavioral Pediatrics'],
            'image' => 'doctor3.jpg'
        ],
        [
            'id' => 4,
            'name' => 'Dr. David Wilson',
            'specialty' => 'Dermatology',
            'subspecialty' => 'Cosmetic Dermatology',
            'experience' => 10,
            'rating' => 4.6,
            'reviews' => 142,
            'consultation_fee' => 220.00,
            'education' => 'MD - UCLA Medical School',
            'hospital' => 'Skin Care Institute',
            'location' => 'Downtown Aesthetic Center',
            'phone' => '+1 (555) 456-7890',
            'email' => 'd.wilson@skincare.com',
            'languages' => ['English'],
            'bio' => 'Dr. Wilson combines medical and cosmetic dermatology to provide comprehensive skin care. He is known for his expertise in skin cancer detection and advanced cosmetic procedures.',
            'conditions' => ['Acne', 'Skin Cancer', 'Eczema', 'Cosmetic Procedures', 'Psoriasis', 'Moles and Lesions'],
            'nextAvailable' => 'Monday 10:00 AM',
            'consultationType' => ['In-person', 'Video Call'],
            'available' => true,
            'patients_treated' => 950,
            'certifications' => ['Board Certified Dermatologist', 'Cosmetic Surgery Certified'],
            'image' => 'doctor4.jpg'
        ],
        [
            'id' => 5,
            'name' => 'Dr. Lisa Anderson',
            'specialty' => 'Neurology',
            'subspecialty' => 'Movement Disorders',
            'experience' => 14,
            'rating' => 4.9,
            'reviews' => 198,
            'consultation_fee' => 320.00,
            'education' => 'MD - Mayo Clinic Medical School',
            'hospital' => 'Neurological Institute',
            'location' => 'Eastside Neuro Center',
            'phone' => '+1 (555) 567-8901',
            'email' => 'l.anderson@neuroinstitute.com',
            'languages' => ['English', 'French'],
            'bio' => 'Dr. Anderson is a leading neurologist specializing in movement disorders. She has extensive research experience and is involved in clinical trials for new neurological treatments.',
            'conditions' => ['Parkinson\'s Disease', 'Epilepsy', 'Migraines', 'Multiple Sclerosis', 'Stroke', 'Tremors'],
            'nextAvailable' => 'Today 1:00 PM',
            'consultationType' => ['In-person', 'Video Call'],
            'available' => true,
            'patients_treated' => 1600,
            'certifications' => ['Board Certified Neurologist', 'Movement Disorders Specialist'],
            'image' => 'doctor5.jpg'
        ],
        [
            'id' => 6,
            'name' => 'Dr. James Thompson',
            'specialty' => 'General Surgery',
            'subspecialty' => 'Minimally Invasive Surgery',
            'experience' => 18,
            'rating' => 4.8,
            'reviews' => 267,
            'consultation_fee' => 350.00,
            'education' => 'MD - Cleveland Clinic Medical School',
            'hospital' => 'Metropolitan Surgical Center',
            'location' => 'Downtown Surgical Complex',
            'phone' => '+1 (555) 678-9012',
            'email' => 'j.thompson@metrosurgical.com',
            'languages' => ['English'],
            'bio' => 'Dr. Thompson is an experienced general surgeon with expertise in minimally invasive techniques. He has pioneered several laparoscopic procedures and has a excellent track record in complex surgeries.',
            'conditions' => ['Gallbladder Surgery', 'Hernia Repair', 'Appendectomy', 'Colon Surgery', 'Laparoscopic Surgery', 'Emergency Surgery'],
            'nextAvailable' => 'Tuesday 8:00 AM',
            'consultationType' => ['In-person'],
            'available' => true,
            'patients_treated' => 3200,
            'certifications' => ['Board Certified General Surgeon', 'Laparoscopic Surgery Specialist'],
            'image' => 'doctor6.jpg'
        ],
        [
            'id' => 7,
            'name' => 'Dr. Maria Garcia',
            'specialty' => 'Obstetrics & Gynecology',
            'subspecialty' => 'Maternal-Fetal Medicine',
            'experience' => 11,
            'rating' => 4.7,
            'reviews' => 178,
            'consultation_fee' => 260.00,
            'education' => 'MD - University of California San Francisco',
            'hospital' => 'Women\'s Health Center',
            'location' => 'Uptown Women\'s Campus',
            'phone' => '+1 (555) 789-0123',
            'email' => 'm.garcia@womenshealth.com',
            'languages' => ['English', 'Spanish'],
            'bio' => 'Dr. Garcia provides comprehensive women\'s healthcare with special focus on high-risk pregnancies. She is known for her compassionate care and expertise in maternal-fetal medicine.',
            'conditions' => ['Reproductive Health', 'Pregnancy Care', 'Menopause', 'PCOS', 'Gynecological Surgery', 'High-Risk Pregnancy'],
            'nextAvailable' => 'Today 3:00 PM',
            'consultationType' => ['In-person', 'Video Call'],
            'available' => true,
            'patients_treated' => 2200,
            'certifications' => ['Board Certified OB/GYN', 'Maternal-Fetal Medicine'],
            'image' => 'doctor7.jpg'
        ],
        [
            'id' => 8,
            'name' => 'Dr. Robert Kim',
            'specialty' => 'Psychiatry',
            'subspecialty' => 'Adult Psychiatry',
            'experience' => 9,
            'rating' => 4.6,
            'reviews' => 134,
            'consultation_fee' => 300.00,
            'education' => 'MD - Yale Medical School',
            'hospital' => 'Mental Health Institute',
            'location' => 'Westside Mental Health Center',
            'phone' => '+1 (555) 890-1234',
            'email' => 'r.kim@mentalhealth.com',
            'languages' => ['English', 'Korean'],
            'bio' => 'Dr. Kim specializes in adult mental health with expertise in anxiety and mood disorders. He combines medication management with therapeutic approaches for comprehensive mental health care.',
            'conditions' => ['Depression', 'Anxiety', 'ADHD', 'Bipolar Disorder', 'PTSD', 'Sleep Disorders'],
            'nextAvailable' => 'Tomorrow 11:00 AM',
            'consultationType' => ['In-person', 'Video Call'],
            'available' => true,
            'patients_treated' => 1450,
            'certifications' => ['Board Certified Psychiatrist', 'Adult Psychiatry Specialist'],
            'image' => 'doctor8.jpg'
        ],
        [
            'id' => 9,
            'name' => 'Dr. Helen Chang',
            'specialty' => 'Ophthalmology',
            'subspecialty' => 'Retinal Disorders',
            'experience' => 16,
            'rating' => 4.6,
            'reviews' => 198,
            'consultation_fee' => 290.00,
            'education' => 'MD - University of California San Francisco',
            'hospital' => 'Eye Care Center',
            'location' => 'Westside Vision Campus',
            'phone' => '+1 (555) 901-2345',
            'email' => 'h.chang@eyecare.com',
            'languages' => ['English', 'Mandarin'],
            'bio' => 'Dr. Chang is an experienced ophthalmologist specializing in retinal disorders and comprehensive eye care. She has performed over 3,000 eye surgeries and is known for her expertise in complex retinal cases.',
            'conditions' => ['Cataracts', 'Glaucoma', 'Macular Degeneration', 'Diabetic Retinopathy', 'Eye Exams', 'LASIK Surgery'],
            'nextAvailable' => 'Wednesday 11:00 AM',
            'consultationType' => ['In-person'],
            'available' => true,
            'patients_treated' => 2800,
            'certifications' => ['Board Certified Ophthalmologist', 'Retina Specialist'],
            'image' => 'doctor9.jpg'
        ],
        [
            'id' => 10,
            'name' => 'Dr. Thomas Anderson',
            'specialty' => 'Gastroenterology',
            'subspecialty' => 'Inflammatory Bowel Disease',
            'experience' => 13,
            'rating' => 4.7,
            'reviews' => 134,
            'consultation_fee' => 310.00,
            'education' => 'MD - Northwestern University Medical School',
            'hospital' => 'Digestive Health Center',
            'location' => 'Central Medical Plaza',
            'phone' => '+1 (555) 012-3456',
            'email' => 't.anderson@digestive.com',
            'languages' => ['English'],
            'bio' => 'Dr. Anderson specializes in digestive health and liver diseases with advanced endoscopic procedures. He is recognized for his expertise in inflammatory bowel disease and has published numerous research papers.',
            'conditions' => ['Colonoscopy', 'Endoscopy', 'IBD', 'Crohns Disease', 'Ulcerative Colitis', 'Liver Disease'],
            'nextAvailable' => 'Thursday 2:00 PM',
            'consultationType' => ['In-person'],
            'available' => true,
            'patients_treated' => 1900,
            'certifications' => ['Board Certified Gastroenterologist', 'Advanced Endoscopy'],
            'image' => 'doctor10.jpg'
        ],
        [
            'id' => 11,
            'name' => 'Dr. Maria Gonzalez',
            'specialty' => 'Endocrinology',
            'subspecialty' => 'Diabetes Management',
            'experience' => 9,
            'rating' => 4.8,
            'reviews' => 112,
            'consultation_fee' => 270.00,
            'education' => 'MD - Baylor College of Medicine',
            'hospital' => 'Hormone Health Clinic',
            'location' => 'Southside Endocrine Center',
            'phone' => '+1 (555) 123-4567',
            'email' => 'm.gonzalez@hormone.com',
            'languages' => ['English', 'Spanish'],
            'bio' => 'Dr. Gonzalez specializes in endocrine disorders and hormone-related conditions. She has extensive experience in diabetes management and thyroid disorders, helping patients achieve optimal metabolic health.',
            'conditions' => ['Diabetes', 'Thyroid Disorders', 'Hormone Imbalance', 'Metabolic Syndrome', 'PCOS', 'Osteoporosis'],
            'nextAvailable' => 'Friday 9:30 AM',
            'consultationType' => ['In-person', 'Video Call'],
            'available' => true,
            'patients_treated' => 1300,
            'certifications' => ['Board Certified Endocrinologist', 'Diabetes Specialist'],
            'image' => 'doctor11.jpg'
        ],
        [
            'id' => 12,
            'name' => 'Dr. Kevin Lee',
            'specialty' => 'Urology',
            'subspecialty' => 'Minimally Invasive Surgery',
            'experience' => 17,
            'rating' => 4.5,
            'reviews' => 167,
            'consultation_fee' => 330.00,
            'education' => 'MD - Washington University Medical School',
            'hospital' => 'Urology Associates',
            'location' => 'Eastside Surgical Center',
            'phone' => '+1 (555) 234-5678',
            'email' => 'k.lee@urology.com',
            'languages' => ['English', 'Korean'],
            'bio' => 'Dr. Lee provides comprehensive urological care with expertise in minimally invasive surgical techniques. He specializes in kidney stones, prostate health, and urological cancers with excellent patient outcomes.',
            'conditions' => ['Kidney Stones', 'Prostate Health', 'Bladder Issues', 'Urological Cancer', 'Male Fertility', 'Incontinence'],
            'nextAvailable' => 'Monday 8:00 AM',
            'consultationType' => ['In-person'],
            'available' => true,
            'patients_treated' => 2400,
            'certifications' => ['Board Certified Urologist', 'Robotic Surgery Specialist'],
            'image' => 'doctor12.jpg'
        ]
    ];
}

function getAvailableTimeSlots($doctorId, $date) {
    // Generate realistic time slots based on doctor and date
    $morningSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
    $afternoonSlots = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
    $eveningSlots = ['17:00', '17:30', '18:00', '18:30'];
    
    // Simulate some slots being booked
    $bookedSlots = ['10:00', '15:00', '17:30'];
    
    return [
        'morning' => array_diff($morningSlots, $bookedSlots),
        'afternoon' => array_diff($afternoonSlots, $bookedSlots),
        'evening' => array_diff($eveningSlots, $bookedSlots)
    ];
}

function searchDoctors($query = '', $specialty = '', $location = '') {
    $doctors = getTempDoctorsData();
    
    if (empty($query) && empty($specialty) && empty($location)) {
        return $doctors;
    }
    
    return array_filter($doctors, function($doctor) use ($query, $specialty, $location) {
        $matchesQuery = empty($query) || 
            stripos($doctor['name'], $query) !== false ||
            stripos($doctor['specialty'], $query) !== false ||
            stripos($doctor['subspecialty'], $query) !== false ||
            array_reduce($doctor['conditions'], function($carry, $condition) use ($query) {
                return $carry || stripos($condition, $query) !== false;
            }, false);
            
        $matchesSpecialty = empty($specialty) || $doctor['specialty'] === $specialty;
        $matchesLocation = empty($location) || stripos($doctor['location'], $location) !== false;
        
        return $matchesQuery && $matchesSpecialty && $matchesLocation;
    });
}
?>