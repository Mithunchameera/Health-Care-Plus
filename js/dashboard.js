// Dashboard JavaScript for eChannelling

class DashboardManager {
    constructor() {
        this.currentSection = 'overview';
        this.notifications = [];
        this.initializeDashboard();
    }

    initializeDashboard() {
        this.setupNavigation();
        this.setupNotifications();
        this.setupSearchAndFilters();
        this.loadDashboardData();
        this.setupTableActions();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link[data-section]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
                
                // Update active navigation
                document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                link.closest('.nav-item').classList.add('active');
            });
        });
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            
            // Load section-specific data
            this.loadSectionData(sectionId);
        }
    }

    loadSectionData(sectionId) {
        switch (sectionId) {
            case 'appointments':
                this.loadAppointments();
                break;
            case 'patients':
                this.loadPatients();
                break;
            case 'doctors':
                this.loadDoctors();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            default:
                break;
        }
    }

    setupNotifications() {
        // Mock notifications
        this.notifications = [
            {
                id: 1,
                title: 'New Appointment',
                message: 'John Fernando booked an appointment',
                time: '5 minutes ago',
                type: 'appointment',
                unread: true
            },
            {
                id: 2,
                title: 'Payment Received',
                message: 'Payment processed successfully',
                time: '15 minutes ago',
                type: 'payment',
                unread: true
            },
            {
                id: 3,
                title: 'Doctor Registration',
                message: 'New doctor pending approval',
                time: '1 hour ago',
                type: 'registration',
                unread: true
            }
        ];

        // Update notification badge
        this.updateNotificationBadge();
    }

    updateNotificationBadge() {
        const badge = document.querySelector('.notification-badge');
        const unreadCount = this.notifications.filter(n => n.unread).length;
        
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    }

    setupSearchAndFilters() {
        // Search functionality
        const searchInputs = document.querySelectorAll('.search-input, .search-input-large');
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        });

        // Filter tabs
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Update active tab
                tab.parentElement.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Apply filter
                this.handleFilter(tab.getAttribute('data-filter'));
            });
        });

        // Filter dropdowns
        const filterSelects = document.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                this.handleFilterChange(e.target);
            });
        });
    }

    handleSearch(query) {
        console.log('Searching for:', query);
        // Implement search logic based on current section
        switch (this.currentSection) {
            case 'appointments':
                this.searchAppointments(query);
                break;
            case 'patients':
                this.searchPatients(query);
                break;
            case 'doctors':
                this.searchDoctors(query);
                break;
        }
    }

    handleFilter(filterType) {
        console.log('Filtering by:', filterType);
        // Implement filter logic
        this.applyFilter(filterType);
    }

    handleFilterChange(selectElement) {
        const filterType = selectElement.className;
        const filterValue = selectElement.value;
        console.log('Filter changed:', filterType, filterValue);
        // Implement filter change logic
    }

    loadDashboardData() {
        // Load initial dashboard data
        this.loadStats();
        this.loadRecentActivity();
        this.loadTodaysSchedule();
    }

    loadStats() {
        // Mock stats data - in real implementation, this would come from API
        const stats = {
            todaysAppointments: 12,
            totalPatients: 1247,
            averageRating: 4.8,
            monthlyRevenue: 485600
        };

        // Update stat cards if they exist
        this.updateStatCards(stats);
    }

    updateStatCards(stats) {
        const statCards = document.querySelectorAll('.stat-card');
        // This would update the stat cards with real data
        console.log('Stats updated:', stats);
    }

    loadRecentActivity() {
        // Mock recent activity
        const activities = [
            {
                icon: '👨‍⚕️',
                message: 'Dr. Michael Johnson joined the platform',
                time: '10 minutes ago'
            },
            {
                icon: '💰',
                message: 'Payment processed for John Fernando',
                time: '25 minutes ago'
            },
            {
                icon: '🏥',
                message: 'Lanka Hospital updated their services',
                time: '1 hour ago'
            }
        ];

        console.log('Recent activity loaded:', activities);
    }

    loadTodaysSchedule() {
        // Mock today's schedule
        const schedule = [
            {
                time: '09:00 AM',
                patient: 'John Fernando',
                type: 'Cardiology Consultation',
                status: 'confirmed'
            },
            {
                time: '10:30 AM',
                patient: 'Maria Silva',
                type: 'Follow-up Checkup',
                status: 'confirmed'
            },
            {
                time: '02:00 PM',
                patient: 'David Perera',
                type: 'ECG Test Review',
                status: 'pending'
            }
        ];

        console.log('Today\'s schedule loaded:', schedule);
    }

    loadAppointments() {
        // Mock appointments data
        const appointments = [
            {
                id: 1,
                date: 'June 22, 2025',
                time: '09:00 AM',
                patient: 'John Fernando',
                type: 'Cardiology Consultation',
                status: 'confirmed'
            },
            {
                id: 2,
                date: 'June 22, 2025',
                time: '10:30 AM',
                patient: 'Maria Silva',
                type: 'Follow-up Checkup',
                status: 'confirmed'
            }
        ];

        console.log('Appointments loaded:', appointments);
    }

    loadPatients() {
        // Mock patients data
        const patients = [
            {
                id: 1,
                name: 'John Fernando',
                email: 'john.fernando@email.com',
                phone: '+94 77 123 4567',
                age: 45,
                appointments: 12,
                lastVisit: 'Jun 20'
            },
            {
                id: 2,
                name: 'Maria Silva',
                email: 'maria.silva@email.com',
                phone: '+94 77 987 6543',
                age: 32,
                appointments: 8,
                lastVisit: 'Jun 15'
            }
        ];

        console.log('Patients loaded:', patients);
    }

    loadDoctors() {
        // Mock doctors data
        const doctors = [
            {
                id: 1,
                name: 'Dr. Kasun Perera',
                email: 'kasun.perera@apollo.lk',
                speciality: 'Cardiology',
                hospital: 'Apollo Hospital',
                patients: 245,
                rating: 4.8,
                status: 'active'
            },
            {
                id: 2,
                name: 'Dr. Sarah Wilson',
                email: 'sarah.wilson@asiri.lk',
                speciality: 'Dermatology',
                hospital: 'Asiri Hospital',
                patients: 189,
                rating: 4.9,
                status: 'active'
            }
        ];

        console.log('Doctors loaded:', doctors);
    }

    loadAnalytics() {
        // Mock analytics data
        const analytics = {
            appointmentTrends: [],
            revenueGrowth: [],
            doctorPerformance: [],
            patientSatisfaction: []
        };

        console.log('Analytics loaded:', analytics);
    }

    setupTableActions() {
        // Setup action buttons in tables
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-action')) {
                const action = e.target.getAttribute('title').toLowerCase();
                const row = e.target.closest('tr');
                const id = row.dataset.id || Math.floor(Math.random() * 1000);
                
                this.handleTableAction(action, id, row);
            }
        });
    }

    handleTableAction(action, id, row) {
        switch (action) {
            case 'view details':
            case 'view profile':
                this.viewDetails(id, row);
                break;
            case 'edit':
                this.editRecord(id, row);
                break;
            case 'cancel':
            case 'suspend':
            case 'block':
                this.confirmAction(action, id, row);
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    viewDetails(id, row) {
        // Implement view details modal
        this.showNotification(`Viewing details for record ${id}`, 'info');
    }

    editRecord(id, row) {
        // Implement edit functionality
        this.showNotification(`Editing record ${id}`, 'info');
    }

    confirmAction(action, id, row) {
        // Show confirmation dialog
        if (confirm(`Are you sure you want to ${action} this record?`)) {
            this.performAction(action, id, row);
        }
    }

    performAction(action, id, row) {
        // Perform the actual action
        console.log(`Performing ${action} on record ${id}`);
        this.showNotification(`${action.charAt(0).toUpperCase() + action.slice(1)} completed successfully`, 'success');
        
        // Update UI
        if (action === 'cancel' || action === 'suspend' || action === 'block') {
            const statusBadge = row.querySelector('.status-badge');
            if (statusBadge) {
                statusBadge.textContent = action === 'cancel' ? 'Cancelled' : 'Inactive';
                statusBadge.className = 'status-badge cancelled';
            }
        }
    }

    searchAppointments(query) {
        // Implement appointment search
        console.log('Searching appointments:', query);
    }

    searchPatients(query) {
        // Implement patient search
        console.log('Searching patients:', query);
    }

    searchDoctors(query) {
        // Implement doctor search
        console.log('Searching doctors:', query);
    }

    applyFilter(filterType) {
        // Implement filter application
        console.log('Applying filter:', filterType);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '9999',
            minWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        // Set background color based on type
        const colors = {
            success: '#0CC029',
            error: '#ef4444',
            warning: '#FFD21D',
            info: '#0057a4'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Export functionality
    exportData(type) {
        this.showNotification(`Exporting ${type} data...`, 'info');
        
        // Simulate export process
        setTimeout(() => {
            this.showNotification(`${type} data exported successfully`, 'success');
        }, 2000);
    }

    // Add record functionality
    addRecord(type) {
        this.showNotification(`Add ${type} form will open here`, 'info');
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new DashboardManager();
    
    // Global functions for button actions
    window.exportData = (type) => dashboard.exportData(type);
    window.addRecord = (type) => dashboard.addRecord(type);
});

// CSS for dashboard-specific animations
const dashboardStyles = `
.dashboard-section {
    animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.stat-card:hover .stat-icon {
    transform: scale(1.1);
}

.widget:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.nav-link {
    position: relative;
    overflow: hidden;
}

.nav-link::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
}

.nav-link:hover::before {
    left: 100%;
}
`;

// Inject dashboard-specific styles
const dashboardStyleSheet = document.createElement('style');
dashboardStyleSheet.textContent = dashboardStyles;
document.head.appendChild(dashboardStyleSheet);