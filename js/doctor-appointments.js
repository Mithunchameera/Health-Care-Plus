/**
 * Doctor Appointment Management System
 * Handles appointment scheduling, viewing, and management for doctors
 */

class DoctorAppointmentManager {
    constructor() {
        this.appointments = [];
        this.patients = [];
        this.currentView = 'calendar';
        this.currentDate = new Date();
        this.displayedMonth = new Date();
        this.selectedAppointment = null;
        this.filteredAppointments = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.renderCalendar();
        this.updateStatistics();
        
        // Initialize theme manager
        if (window.HealthCare && window.HealthCare.initializeBackToTop) {
            window.HealthCare.initializeBackToTop();
        }
    }
    
    setupEventListeners() {
        // View switching
        document.getElementById('calendar-view-btn')?.addEventListener('click', () => this.switchView('calendar'));
        document.getElementById('list-view-btn')?.addEventListener('click', () => this.switchView('list'));
        
        // Calendar navigation
        document.getElementById('prev-month')?.addEventListener('click', () => this.navigateMonth(-1));
        document.getElementById('next-month')?.addEventListener('click', () => this.navigateMonth(1));
        
        // Modal controls
        document.getElementById('add-appointment-btn')?.addEventListener('click', () => this.openAppointmentModal());
        document.getElementById('close-modal')?.addEventListener('click', () => this.closeModal());
        document.getElementById('close-details-modal')?.addEventListener('click', () => this.closeDetailsModal());
        document.getElementById('cancel-appointment')?.addEventListener('click', () => this.closeModal());
        
        // Form submission
        document.getElementById('appointment-form')?.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Search and filters
        document.getElementById('appointment-search')?.addEventListener('input', () => this.filterAppointments());
        document.getElementById('status-filter')?.addEventListener('change', () => this.filterAppointments());
        document.getElementById('date-filter')?.addEventListener('change', () => this.filterAppointments());
        document.getElementById('custom-date-filter')?.addEventListener('change', () => this.filterAppointments());
        document.getElementById('clear-filters-btn')?.addEventListener('click', () => this.clearFilters());
        
        // Other actions
        document.getElementById('refresh-schedule-btn')?.addEventListener('click', () => this.refreshData());
        document.getElementById('export-schedule-btn')?.addEventListener('click', () => this.exportSchedule());
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
                this.closeDetailsModal();
            }
        });
    }
    
    async loadInitialData() {
        try {
            await Promise.all([
                this.loadAppointments(),
                this.loadPatients()
            ]);
            this.filterAppointments();
            this.updateDisplay();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showNotification('Failed to load appointment data', 'error');
        }
    }
    
    async loadAppointments() {
        try {
            const response = await fetch('php/doctor-appointments-api.php?action=get_appointments');
            const data = await response.json();
            
            if (data.success) {
                this.appointments = data.appointments;
                this.filteredAppointments = [...this.appointments];
            } else {
                throw new Error(data.error || 'Failed to load appointments');
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            // Fallback to mock data for development
            this.appointments = this.generateMockAppointments();
            this.filteredAppointments = [...this.appointments];
        }
    }
    
    async loadPatients() {
        try {
            const response = await fetch('php/doctor-appointments-api.php?action=get_patients');
            const data = await response.json();
            
            if (data.success) {
                this.patients = data.patients;
                this.populatePatientSelect();
            } else {
                throw new Error(data.error || 'Failed to load patients');
            }
        } catch (error) {
            console.error('Error loading patients:', error);
            // Fallback to mock data for development
            this.patients = this.generateMockPatients();
            this.populatePatientSelect();
        }
    }
    
    generateMockAppointments() {
        const today = new Date();
        const appointments = [];
        
        for (let i = 0; i < 20; i++) {
            const appointmentDate = new Date(today);
            appointmentDate.setDate(today.getDate() + Math.floor(Math.random() * 30) - 15);
            
            const hour = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
            const minute = Math.random() < 0.5 ? 0 : 30;
            appointmentDate.setHours(hour, minute, 0, 0);
            
            const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled'];
            const types = ['consultation', 'follow-up', 'check-up', 'procedure'];
            const durations = [30, 45, 60, 90];
            
            appointments.push({
                id: i + 1,
                patient_id: Math.floor(Math.random() * 10) + 1,
                patient_name: `Patient ${Math.floor(Math.random() * 100) + 1}`,
                date: appointmentDate.toISOString().split('T')[0],
                time: appointmentDate.toTimeString().slice(0, 5),
                datetime: appointmentDate.toISOString(),
                type: types[Math.floor(Math.random() * types.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                duration: durations[Math.floor(Math.random() * durations.length)],
                notes: `Sample appointment notes for appointment ${i + 1}`,
                phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`
            });
        }
        
        return appointments.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    }
    
    generateMockPatients() {
        const patients = [];
        const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Maria'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
        
        for (let i = 0; i < 50; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            
            patients.push({
                id: i + 1,
                name: `${firstName} ${lastName}`,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
                phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`
            });
        }
        
        return patients;
    }
    
    populatePatientSelect() {
        const select = document.getElementById('patient-select');
        if (!select) return;
        
        select.innerHTML = '<option value="">Select Patient</option>';
        
        this.patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.name} - ${patient.phone}`;
            select.appendChild(option);
        });
    }
    
    switchView(view) {
        this.currentView = view;
        
        const calendarView = document.getElementById('calendar-view');
        const listView = document.getElementById('list-view');
        const calendarBtn = document.getElementById('calendar-view-btn');
        const listBtn = document.getElementById('list-view-btn');
        
        if (view === 'calendar') {
            calendarView.style.display = 'block';
            listView.style.display = 'none';
            calendarBtn.classList.add('active');
            listBtn.classList.remove('active');
            this.renderCalendar();
        } else {
            calendarView.style.display = 'none';
            listView.style.display = 'block';
            listBtn.classList.add('active');
            calendarBtn.classList.remove('active');
            this.renderAppointmentList();
        }
    }
    
    navigateMonth(direction) {
        this.displayedMonth.setMonth(this.displayedMonth.getMonth() + direction);
        this.renderCalendar();
    }
    
    renderCalendar() {
        const calendar = document.getElementById('appointment-calendar');
        const monthYear = document.getElementById('current-month-year');
        
        if (!calendar || !monthYear) return;
        
        const year = this.displayedMonth.getFullYear();
        const month = this.displayedMonth.getMonth();
        
        monthYear.textContent = new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric'
        }).format(this.displayedMonth);
        
        calendar.innerHTML = '';
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-cell empty';
            calendar.appendChild(emptyCell);
        }
        
        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const cellDate = new Date(year, month, day);
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            cell.appendChild(dayNumber);
            
            // Get appointments for this day
            const dayAppointments = this.filteredAppointments.filter(apt => 
                apt.date === cellDate.toISOString().split('T')[0]
            );
            
            if (dayAppointments.length > 0) {
                cell.classList.add('has-appointments');
                
                const appointmentsContainer = document.createElement('div');
                appointmentsContainer.className = 'day-appointments';
                
                dayAppointments.slice(0, 3).forEach(apt => {
                    const aptElement = document.createElement('div');
                    aptElement.className = `appointment-item ${apt.status}`;
                    aptElement.textContent = `${apt.time} - ${apt.patient_name}`;
                    aptElement.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.showAppointmentDetails(apt);
                    });
                    appointmentsContainer.appendChild(aptElement);
                });
                
                if (dayAppointments.length > 3) {
                    const moreElement = document.createElement('div');
                    moreElement.className = 'more-appointments';
                    moreElement.textContent = `+${dayAppointments.length - 3} more`;
                    appointmentsContainer.appendChild(moreElement);
                }
                
                cell.appendChild(appointmentsContainer);
            }
            
            // Highlight today
            const today = new Date();
            if (cellDate.toDateString() === today.toDateString()) {
                cell.classList.add('today');
            }
            
            cell.addEventListener('click', () => {
                this.selectDate(cellDate);
            });
            
            calendar.appendChild(cell);
        }
    }
    
    renderAppointmentList() {
        const tbody = document.getElementById('appointments-table-body');
        const count = document.getElementById('appointments-count');
        
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (count) {
            count.textContent = `${this.filteredAppointments.length} appointments found`;
        }
        
        this.filteredAppointments.forEach(appointment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="patient-info">
                        <div class="patient-name">${appointment.patient_name}</div>
                        <div class="patient-contact">${appointment.phone}</div>
                    </div>
                </td>
                <td>
                    <div class="datetime-info">
                        <div class="date">${this.formatDate(appointment.date)}</div>
                        <div class="time">${appointment.time}</div>
                    </div>
                </td>
                <td>
                    <span class="appointment-type">${appointment.type}</span>
                </td>
                <td>
                    <span class="status-badge ${appointment.status}">${appointment.status}</span>
                </td>
                <td>${appointment.duration} min</td>
                <td>
                    <div class="notes-preview">${appointment.notes?.substring(0, 50)}${appointment.notes?.length > 50 ? '...' : ''}</div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" onclick="doctorAppointmentManager.showAppointmentDetails(${JSON.stringify(appointment).replace(/"/g, '&quot;')})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="doctorAppointmentManager.editAppointment(${appointment.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="doctorAppointmentManager.cancelAppointment(${appointment.id})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    filterAppointments() {
        const searchTerm = document.getElementById('appointment-search')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('status-filter')?.value || '';
        const dateFilter = document.getElementById('date-filter')?.value || '';
        const customDate = document.getElementById('custom-date-filter')?.value || '';
        
        this.filteredAppointments = this.appointments.filter(appointment => {
            // Search filter
            const matchesSearch = appointment.patient_name.toLowerCase().includes(searchTerm) ||
                                appointment.phone.includes(searchTerm) ||
                                appointment.id.toString().includes(searchTerm);
            
            // Status filter
            const matchesStatus = !statusFilter || appointment.status === statusFilter;
            
            // Date filter
            let matchesDate = true;
            const appointmentDate = new Date(appointment.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (customDate) {
                matchesDate = appointment.date === customDate;
            } else if (dateFilter) {
                switch (dateFilter) {
                    case 'today':
                        matchesDate = appointmentDate.toDateString() === today.toDateString();
                        break;
                    case 'tomorrow':
                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        matchesDate = appointmentDate.toDateString() === tomorrow.toDateString();
                        break;
                    case 'this-week':
                        const weekStart = new Date(today);
                        weekStart.setDate(today.getDate() - today.getDay());
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekStart.getDate() + 6);
                        matchesDate = appointmentDate >= weekStart && appointmentDate <= weekEnd;
                        break;
                    case 'next-week':
                        const nextWeekStart = new Date(today);
                        nextWeekStart.setDate(today.getDate() - today.getDay() + 7);
                        const nextWeekEnd = new Date(nextWeekStart);
                        nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
                        matchesDate = appointmentDate >= nextWeekStart && appointmentDate <= nextWeekEnd;
                        break;
                    case 'this-month':
                        matchesDate = appointmentDate.getMonth() === today.getMonth() &&
                                   appointmentDate.getFullYear() === today.getFullYear();
                        break;
                }
            }
            
            return matchesSearch && matchesStatus && matchesDate;
        });
        
        this.updateDisplay();
        this.updateStatistics();
    }
    
    clearFilters() {
        document.getElementById('appointment-search').value = '';
        document.getElementById('status-filter').value = '';
        document.getElementById('date-filter').value = '';
        document.getElementById('custom-date-filter').value = '';
        
        this.filteredAppointments = [...this.appointments];
        this.updateDisplay();
        this.updateStatistics();
    }
    
    updateDisplay() {
        if (this.currentView === 'calendar') {
            this.renderCalendar();
        } else {
            this.renderAppointmentList();
        }
        this.renderTodayTimeline();
    }
    
    renderTodayTimeline() {
        const timeline = document.getElementById('today-timeline');
        if (!timeline) return;
        
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = this.filteredAppointments.filter(apt => apt.date === today);
        
        if (todayAppointments.length === 0) {
            timeline.innerHTML = `
                <div class="empty-timeline">
                    <i class="fas fa-calendar-day"></i>
                    <p>No appointments scheduled for today</p>
                </div>
            `;
            return;
        }
        
        timeline.innerHTML = todayAppointments.map(apt => `
            <div class="timeline-item ${apt.status}" onclick="doctorAppointmentManager.showAppointmentDetails(${JSON.stringify(apt).replace(/"/g, '&quot;')})">
                <div class="timeline-time">${apt.time}</div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <h4>${apt.patient_name}</h4>
                        <span class="status-badge ${apt.status}">${apt.status}</span>
                    </div>
                    <div class="timeline-details">
                        <span class="appointment-type">${apt.type}</span>
                        <span class="appointment-duration">${apt.duration} min</span>
                    </div>
                    <div class="timeline-actions">
                        <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); doctorAppointmentManager.markAsCompleted(${apt.id})">
                            <i class="fas fa-check"></i> Complete
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); doctorAppointmentManager.editAppointment(${apt.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    updateStatistics() {
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = this.appointments.filter(apt => apt.date === today);
        const pendingAppointments = this.appointments.filter(apt => 
            apt.status === 'scheduled' || apt.status === 'confirmed'
        );
        const completedToday = todayAppointments.filter(apt => apt.status === 'completed');
        
        // This week appointments
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const weekAppointments = this.appointments.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate >= weekStart && aptDate <= weekEnd;
        });
        
        document.getElementById('today-appointments').textContent = todayAppointments.length;
        document.getElementById('pending-appointments').textContent = pendingAppointments.length;
        document.getElementById('completed-appointments').textContent = completedToday.length;
        document.getElementById('week-appointments').textContent = weekAppointments.length;
    }
    
    openAppointmentModal(appointment = null) {
        const modal = document.getElementById('appointment-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('appointment-form');
        
        if (!modal || !form) return;
        
        if (appointment) {
            title.innerHTML = '<i class="fas fa-edit"></i> Edit Appointment';
            this.selectedAppointment = appointment;
            this.populateForm(appointment);
        } else {
            title.innerHTML = '<i class="fas fa-calendar-plus"></i> Add New Appointment';
            this.selectedAppointment = null;
            form.reset();
        }
        
        modal.style.display = 'block';
    }
    
    populateForm(appointment) {
        document.getElementById('patient-select').value = appointment.patient_id;
        document.getElementById('appointment-date').value = appointment.date;
        document.getElementById('appointment-time').value = appointment.time;
        document.getElementById('appointment-duration').value = appointment.duration;
        document.getElementById('appointment-type').value = appointment.type;
        document.getElementById('appointment-status').value = appointment.status;
        document.getElementById('appointment-notes').value = appointment.notes || '';
    }
    
    closeModal() {
        const modal = document.getElementById('appointment-modal');
        if (modal) {
            modal.style.display = 'none';
            this.selectedAppointment = null;
        }
    }
    
    closeDetailsModal() {
        const modal = document.getElementById('appointment-details-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const appointmentData = {
            patient_id: document.getElementById('patient-select').value,
            date: document.getElementById('appointment-date').value,
            time: document.getElementById('appointment-time').value,
            duration: document.getElementById('appointment-duration').value,
            type: document.getElementById('appointment-type').value,
            status: document.getElementById('appointment-status').value,
            notes: document.getElementById('appointment-notes').value
        };
        
        try {
            const url = this.selectedAppointment 
                ? 'php/doctor-api.php?action=update_appointment'
                : 'php/doctor-api.php?action=create_appointment';
            
            if (this.selectedAppointment) {
                appointmentData.id = this.selectedAppointment.id;
            }
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(appointmentData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(
                    this.selectedAppointment ? 'Appointment updated successfully' : 'Appointment created successfully',
                    'success'
                );
                this.closeModal();
                await this.loadAppointments();
                this.filterAppointments();
            } else {
                throw new Error(result.error || 'Failed to save appointment');
            }
        } catch (error) {
            console.error('Error saving appointment:', error);
            this.showNotification('Failed to save appointment', 'error');
        }
    }
    
    showAppointmentDetails(appointment) {
        const modal = document.getElementById('appointment-details-modal');
        const content = document.getElementById('appointment-details-content');
        
        if (!modal || !content) return;
        
        const patient = this.patients.find(p => p.id == appointment.patient_id) || {};
        
        content.innerHTML = `
            <div class="appointment-details">
                <div class="detail-section">
                    <h4><i class="fas fa-user"></i> Patient Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Name:</label>
                            <span>${appointment.patient_name}</span>
                        </div>
                        <div class="detail-item">
                            <label>Phone:</label>
                            <span>${appointment.phone}</span>
                        </div>
                        <div class="detail-item">
                            <label>Email:</label>
                            <span>${patient.email || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-calendar"></i> Appointment Details</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Date:</label>
                            <span>${this.formatDate(appointment.date)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Time:</label>
                            <span>${appointment.time}</span>
                        </div>
                        <div class="detail-item">
                            <label>Duration:</label>
                            <span>${appointment.duration} minutes</span>
                        </div>
                        <div class="detail-item">
                            <label>Type:</label>
                            <span>${appointment.type}</span>
                        </div>
                        <div class="detail-item">
                            <label>Status:</label>
                            <span class="status-badge ${appointment.status}">${appointment.status}</span>
                        </div>
                    </div>
                </div>
                
                ${appointment.notes ? `
                <div class="detail-section">
                    <h4><i class="fas fa-sticky-note"></i> Notes</h4>
                    <p>${appointment.notes}</p>
                </div>
                ` : ''}
                
                <div class="detail-actions">
                    <button class="btn btn-primary" onclick="doctorAppointmentManager.editAppointment(${appointment.id})">
                        <i class="fas fa-edit"></i> Edit Appointment
                    </button>
                    <button class="btn btn-success" onclick="doctorAppointmentManager.markAsCompleted(${appointment.id})">
                        <i class="fas fa-check"></i> Mark as Completed
                    </button>
                    <button class="btn btn-danger" onclick="doctorAppointmentManager.cancelAppointment(${appointment.id})">
                        <i class="fas fa-times"></i> Cancel Appointment
                    </button>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    }
    
    editAppointment(appointmentId) {
        const appointment = this.appointments.find(apt => apt.id === appointmentId);
        if (appointment) {
            this.closeDetailsModal();
            this.openAppointmentModal(appointment);
        }
    }
    
    async markAsCompleted(appointmentId) {
        try {
            const response = await fetch('php/doctor-api.php?action=update_appointment_status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: appointmentId,
                    status: 'completed'
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Appointment marked as completed', 'success');
                await this.loadAppointments();
                this.filterAppointments();
                this.closeDetailsModal();
            } else {
                throw new Error(result.error || 'Failed to update appointment');
            }
        } catch (error) {
            console.error('Error updating appointment:', error);
            this.showNotification('Failed to update appointment status', 'error');
        }
    }
    
    async cancelAppointment(appointmentId) {
        if (!confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }
        
        try {
            const response = await fetch('php/doctor-api.php?action=update_appointment_status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: appointmentId,
                    status: 'cancelled'
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Appointment cancelled successfully', 'success');
                await this.loadAppointments();
                this.filterAppointments();
                this.closeDetailsModal();
            } else {
                throw new Error(result.error || 'Failed to cancel appointment');
            }
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            this.showNotification('Failed to cancel appointment', 'error');
        }
    }
    
    selectDate(date) {
        const dateStr = date.toISOString().split('T')[0];
        document.getElementById('custom-date-filter').value = dateStr;
        this.filterAppointments();
    }
    
    async refreshData() {
        try {
            await this.loadInitialData();
            this.showNotification('Data refreshed successfully', 'success');
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.showNotification('Failed to refresh data', 'error');
        }
    }
    
    exportSchedule() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `appointments_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        this.showNotification('Schedule exported successfully', 'success');
    }
    
    generateCSV() {
        const headers = ['Date', 'Time', 'Patient', 'Phone', 'Type', 'Status', 'Duration', 'Notes'];
        const rows = this.filteredAppointments.map(apt => [
            apt.date,
            apt.time,
            apt.patient_name,
            apt.phone,
            apt.type,
            apt.status,
            apt.duration,
            apt.notes || ''
        ]);
        
        return [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
    }
    
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.doctorAppointmentManager = new DoctorAppointmentManager();
});

// Global functions for external access
function openAppointmentModal(appointment = null) {
    if (window.doctorAppointmentManager) {
        window.doctorAppointmentManager.openAppointmentModal(appointment);
    }
}

function editAppointment(appointmentId) {
    if (window.doctorAppointmentManager) {
        window.doctorAppointmentManager.editAppointment(appointmentId);
    }
}

function cancelAppointment(appointmentId) {
    if (window.doctorAppointmentManager) {
        window.doctorAppointmentManager.cancelAppointment(appointmentId);
    }
}

function markAsCompleted(appointmentId) {
    if (window.doctorAppointmentManager) {
        window.doctorAppointmentManager.markAsCompleted(appointmentId);
    }
}