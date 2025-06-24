// Dashboard Fix - Simple working implementation

document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard fix loaded');
    
    // Ensure dashboard sections are visible
    const overviewSection = document.getElementById('overview');
    if (overviewSection && !overviewSection.classList.contains('active')) {
        overviewSection.classList.add('active');
    }
    
    // Fix navigation
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showDashboardSection(sectionId);
            
            // Update active nav
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            this.closest('.nav-item').classList.add('active');
        });
    });
    
    // Global function for showing sections
    window.showSection = function(sectionId) {
        showDashboardSection(sectionId);
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        const navLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (navLink) {
            navLink.closest('.nav-item').classList.add('active');
        }
    };
    
    // Profile dropdown functionality
    window.toggleProfileMenu = function() {
        const profileMenu = document.getElementById('profile-menu');
        if (profileMenu) {
            if (profileMenu.style.display === 'none' || profileMenu.style.display === '') {
                profileMenu.style.display = 'block';
            } else {
                profileMenu.style.display = 'none';
            }
        }
    };
    
    // Add click listener to profile toggle button
    const profileToggle = document.getElementById('profile-toggle');
    if (profileToggle) {
        profileToggle.addEventListener('click', toggleProfileMenu);
    }
    
    // Patient menu functionality
    window.togglePatientMenu = function() {
        const patientMenu = document.getElementById('patient-menu');
        if (patientMenu) {
            if (patientMenu.style.display === 'none' || patientMenu.style.display === '') {
                patientMenu.style.display = 'block';
            } else {
                patientMenu.style.display = 'none';
            }
        }
    };
    
    // Logout functionality
    window.logout = function() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear any stored session data
            localStorage.clear();
            sessionStorage.clear();
            
            // Redirect to home page
            window.location.href = 'index.html';
        }
    };

    // View Records functionality
    window.showPatientRecords = function() {
        // Create and show records modal
        const modal = document.createElement('div');
        modal.className = 'records-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 15px; padding: 30px; max-width: 800px; width: 90%; max-height: 80vh; overflow-y: auto; position: relative;">
                <button onclick="this.closest('.records-modal').remove()" style="position: absolute; top: 15px; right: 20px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">×</button>
                
                <h2 style="color: #3b82f6; margin-bottom: 25px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-file-medical"></i>
                    Medical Records - Maria Silva
                </h2>
                
                <div style="display: grid; gap: 20px;">
                    <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #3b82f6;">
                        <h3 style="color: #1e40af; margin: 0 0 15px 0;">Recent Visit - June 15, 2025</h3>
                        <div style="display: grid; gap: 10px;">
                            <div><strong>Doctor:</strong> Dr. Kasun Perera (Cardiologist)</div>
                            <div><strong>Diagnosis:</strong> Routine Cardiac Check-up</div>
                            <div><strong>Treatment:</strong> Continue current medication, follow-up in 3 months</div>
                            <div><strong>Prescription:</strong> Atenolol 50mg daily, Simvastatin 20mg nightly</div>
                        </div>
                    </div>
                    
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; border-left: 4px solid #22c55e;">
                        <h3 style="color: #166534; margin: 0 0 15px 0;">Lab Results - June 10, 2025</h3>
                        <div style="display: grid; gap: 10px;">
                            <div><strong>Blood Pressure:</strong> 125/80 mmHg (Normal)</div>
                            <div><strong>Cholesterol:</strong> 180 mg/dL (Good)</div>
                            <div><strong>Blood Sugar:</strong> 95 mg/dL (Normal)</div>
                            <div><strong>BMI:</strong> 23.5 (Normal Weight)</div>
                        </div>
                    </div>
                    
                    <div style="background: #fef7f0; padding: 20px; border-radius: 10px; border-left: 4px solid #f59e0b;">
                        <h3 style="color: #92400e; margin: 0 0 15px 0;">Medical History</h3>
                        <div style="display: grid; gap: 10px;">
                            <div><strong>Allergies:</strong> None known</div>
                            <div><strong>Chronic Conditions:</strong> Mild hypertension (controlled)</div>
                            <div><strong>Previous Surgeries:</strong> None</div>
                            <div><strong>Family History:</strong> Heart disease (paternal)</div>
                        </div>
                    </div>
                    
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 10px;">
                        <h3 style="color: #374151; margin: 0 0 15px 0;">Upcoming Tests</h3>
                        <div style="display: grid; gap: 10px;">
                            <div>📋 <strong>ECG Follow-up:</strong> Scheduled for July 20, 2025</div>
                            <div>🩸 <strong>Blood Work:</strong> Due in September 2025</div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 25px; text-align: center;">
                    <button onclick="this.closest('.records-modal').remove()" style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; border: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; cursor: pointer;">Close Records</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    };

    // Show Schedule functionality
    window.showPatientSchedule = function() {
        // Create and show schedule modal
        const modal = document.createElement('div');
        modal.className = 'schedule-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 15px; padding: 30px; max-width: 900px; width: 90%; max-height: 80vh; overflow-y: auto; position: relative;">
                <button onclick="this.closest('.schedule-modal').remove()" style="position: absolute; top: 15px; right: 20px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">×</button>
                
                <h2 style="color: #3b82f6; margin-bottom: 25px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-calendar"></i>
                    My Schedule - Maria Silva
                </h2>
                
                <div style="display: grid; gap: 20px;">
                    <div style="background: #dbeafe; padding: 20px; border-radius: 10px; border-left: 4px solid #3b82f6;">
                        <h3 style="color: #1e40af; margin: 0 0 15px 0;">Upcoming Appointments</h3>
                        
                        <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e5e7eb;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                                <div>
                                    <strong style="color: #1f2937;">June 23, 2025 - 2:00 PM</strong>
                                    <div style="color: #6b7280; font-size: 14px;">Today</div>
                                </div>
                                <span style="background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">CONFIRMED</span>
                            </div>
                            <div><strong>Dr. Kasun Perera</strong> - Cardiologist</div>
                            <div style="color: #6b7280;">Apollo Hospital, Colombo</div>
                            <div style="margin-top: 10px;">
                                <button style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; margin-right: 8px;">View Details</button>
                                <button style="background: #f59e0b; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">Reschedule</button>
                            </div>
                        </div>
                        
                        <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                                <div>
                                    <strong style="color: #1f2937;">June 25, 2025 - 10:00 AM</strong>
                                    <div style="color: #6b7280; font-size: 14px;">In 2 days</div>
                                </div>
                                <span style="background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">CONFIRMED</span>
                            </div>
                            <div><strong>Dr. Sarah Wilson</strong> - Dermatologist</div>
                            <div style="color: #6b7280;">Asiri Hospital, Colombo</div>
                            <div style="margin-top: 10px;">
                                <button style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; margin-right: 8px;">View Details</button>
                                <button style="background: #f59e0b; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">Reschedule</button>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; border-left: 4px solid #22c55e;">
                        <h3 style="color: #166534; margin: 0 0 15px 0;">Recent Appointments</h3>
                        
                        <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e5e7eb;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                                <div>
                                    <strong style="color: #1f2937;">June 15, 2025 - 3:30 PM</strong>
                                    <div style="color: #6b7280; font-size: 14px;">8 days ago</div>
                                </div>
                                <span style="background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">COMPLETED</span>
                            </div>
                            <div><strong>Dr. Kasun Perera</strong> - Cardiologist</div>
                            <div style="color: #6b7280;">Apollo Hospital, Colombo</div>
                            <div style="margin-top: 10px;">
                                <button style="background: #6b7280; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">View Report</button>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: #fef7f0; padding: 20px; border-radius: 10px; border-left: 4px solid #f59e0b;">
                        <h3 style="color: #92400e; margin: 0 0 15px 0;">Quick Actions</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            <button onclick="window.location.href='find-doctors.html'" style="background: white; border: 2px solid #f59e0b; color: #92400e; padding: 15px; border-radius: 8px; cursor: pointer; text-align: center; font-weight: 600;">
                                🔍 Find New Doctor
                            </button>
                            <button onclick="window.location.href='booking-standalone.html'" style="background: white; border: 2px solid #3b82f6; color: #1e40af; padding: 15px; border-radius: 8px; cursor: pointer; text-align: center; font-weight: 600;">
                                📅 Book Appointment
                            </button>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 25px; text-align: center;">
                    <button onclick="this.closest('.schedule-modal').remove()" style="background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; border: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; cursor: pointer;">Close Schedule</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    };
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        // Close profile menu
        const profileDropdown = document.querySelector('.profile-dropdown');
        const profileMenu = document.getElementById('profile-menu');
        if (profileDropdown && profileMenu && !profileDropdown.contains(event.target)) {
            profileMenu.classList.remove('show');
        }
        
        // Close notifications panel
        const notificationsDropdown = document.querySelector('.notifications-dropdown');
        const notificationsPanel = document.getElementById('notifications-panel');
        if (notificationsDropdown && notificationsPanel && !notificationsDropdown.contains(event.target)) {
            notificationsPanel.classList.remove('show');
        }
        
        // Close patient menu
        const patientMenuButton = document.querySelector('.dashboard-nav button');
        const patientMenu = document.getElementById('patient-menu');
        if (patientMenu && patientMenuButton && !patientMenuButton.contains(event.target) && !patientMenu.contains(event.target)) {
            patientMenu.style.display = 'none';
        }
    });
    
    function showDashboardSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            console.log(`Showing section: ${sectionId}`);
        } else {
            console.log(`Section not found: ${sectionId}`);
        }
    }
    
    // Notifications functionality
    window.toggleNotifications = function() {
        const panel = document.getElementById('notifications-panel');
        if (panel) {
            panel.classList.toggle('show');
            
            if (panel.classList.contains('show')) {
                document.addEventListener('click', closeNotificationsOnOutsideClick);
            } else {
                document.removeEventListener('click', closeNotificationsOnOutsideClick);
            }
        }
    };
    
    function closeNotificationsOnOutsideClick(event) {
        const panel = document.getElementById('notifications-panel');
        const button = document.querySelector('.notification-btn');
        
        if (panel && button && !panel.contains(event.target) && !button.contains(event.target)) {
            panel.classList.remove('show');
            document.removeEventListener('click', closeNotificationsOnOutsideClick);
        }
    }
    
    window.markAllAsRead = function() {
        const unreadItems = document.querySelectorAll('.notification-item.unread');
        unreadItems.forEach(item => {
            item.classList.remove('unread');
            item.classList.add('read');
        });
        
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = '0';
            badge.style.display = 'none';
        }
        
        showToast('All notifications marked as read');
    };
    
    window.viewAppointment = function(id) {
        showDashboardSection('appointments');
        toggleNotifications();
        showToast('Viewing appointment details');
    };
    
    window.viewResults = function() {
        showDashboardSection('medical-records');
        toggleNotifications();
        showToast('Viewing test results');
    };
    
    window.viewReceipt = function() {
        showDashboardSection('payments');
        toggleNotifications();
        showToast('Viewing payment receipt');
    };
    
    function showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 9999;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    console.log('Dashboard functionality initialized');
});