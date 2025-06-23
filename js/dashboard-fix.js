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