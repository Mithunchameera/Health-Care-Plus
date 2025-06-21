/**
 * Payment Page JavaScript
 * Handles payment processing and booking confirmation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load booking data from session storage (for new bookings)
    let pendingBooking = sessionStorage.getItem('pendingBooking');
    // Load payment data from session storage (for existing appointments)
    let pendingPayment = sessionStorage.getItem('pendingPayment');
    
    if (!pendingBooking && !pendingPayment) {
        // Redirect to dashboard if no booking or payment data
        window.location.href = 'dashboard-patient.html';
        return;
    }
    
    let booking;
    if (pendingPayment) {
        // Convert payment data to booking format
        const paymentData = JSON.parse(pendingPayment);
        booking = {
            bookingId: paymentData.bookingId,
            doctorName: paymentData.doctorName,
            specialty: paymentData.specialty,
            date: paymentData.date,
            time: paymentData.time,
            fee: paymentData.fee,
            patientName: paymentData.patientName,
            appointmentId: paymentData.appointmentId
        };
    } else {
        booking = JSON.parse(pendingBooking);
    }
    
    // Populate appointment details
    populateAppointmentDetails(booking);
    
    // Setup payment form
    setupPaymentForm(booking);
});

function populateAppointmentDetails(booking) {
    // Update doctor information
    document.getElementById('payment-doctor-name').textContent = booking.doctor.name;
    document.getElementById('payment-specialty').textContent = booking.doctor.specialty;
    document.getElementById('payment-location').textContent = booking.doctor.location;
    
    // Update appointment details
    document.getElementById('payment-date').textContent = formatDate(booking.date);
    document.getElementById('payment-time').textContent = formatTime(booking.time);
    document.getElementById('payment-reason').textContent = booking.reason || 'General Consultation';
    
    // Update fee information
    document.getElementById('consultation-fee').textContent = `$${booking.fee}`;
    document.getElementById('service-fee').textContent = '$5.00';
    document.getElementById('total-amount').textContent = `$${(parseFloat(booking.fee) + 5).toFixed(2)}`;
}

function setupPaymentForm(booking) {
    const paymentForm = document.getElementById('payment-form');
    const proceedBtn = document.getElementById('proceed-payment');
    
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validatePaymentTerms()) {
                processPayment(booking);
            }
        });
    }
    
    if (proceedBtn) {
        proceedBtn.addEventListener('click', function() {
            if (validatePaymentTerms()) {
                processPayment(booking);
            }
        });
    }
    
    // Setup payment method selection
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            updatePaymentMethod(this.value);
        });
    });
    
    // Setup terms validation
    setupPaymentTermsValidation();
}

function setupPaymentTermsValidation() {
    const termsCheckbox = document.getElementById('payment-terms-agreement');
    const privacyCheckbox = document.getElementById('payment-privacy-agreement');
    const proceedBtn = document.getElementById('proceed-payment');
    
    function validateTerms() {
        const termsChecked = termsCheckbox && termsCheckbox.checked;
        const privacyChecked = privacyCheckbox && privacyCheckbox.checked;
        const allChecked = termsChecked && privacyChecked;
        
        if (proceedBtn) {
            proceedBtn.disabled = !allChecked;
            proceedBtn.style.opacity = allChecked ? '1' : '0.6';
        }
        
        return allChecked;
    }
    
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', validateTerms);
    }
    
    if (privacyCheckbox) {
        privacyCheckbox.addEventListener('change', validateTerms);
    }
    
    // Initial validation
    validateTerms();
}

function validatePaymentTerms() {
    const termsCheckbox = document.getElementById('payment-terms-agreement');
    const privacyCheckbox = document.getElementById('payment-privacy-agreement');
    
    if (!termsCheckbox || !termsCheckbox.checked) {
        showNotification('Please agree to the Terms and Conditions', 'error');
        termsCheckbox?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
    }
    
    if (!privacyCheckbox || !privacyCheckbox.checked) {
        showNotification('Please authorize payment processing', 'error');
        privacyCheckbox?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
    }
    
    return true;
}

function updatePaymentMethod(method) {
    const cardDetails = document.getElementById('card-details');
    const insuranceDetails = document.getElementById('insurance-details');
    
    if (cardDetails) cardDetails.style.display = method === 'card' ? 'block' : 'none';
    if (insuranceDetails) insuranceDetails.style.display = method === 'insurance' ? 'block' : 'none';
}

async function processPayment(booking) {
    const proceedBtn = document.getElementById('proceed-payment');
    const selectedMethod = document.querySelector('input[name="payment-method"]:checked');
    
    if (!selectedMethod) {
        showNotification('Please select a payment method', 'error');
        return;
    }
    
    // Show loading state
    if (proceedBtn) {
        proceedBtn.disabled = true;
        proceedBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }
    
    try {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Clear pending booking and payment data
        sessionStorage.removeItem('pendingBooking');
        sessionStorage.removeItem('pendingPayment');
        
        // Redirect to success page
        window.location.href = 'payment-success.html?booking_id=' + booking.bookingId;
        
    } catch (error) {
        console.error('Payment processing error:', error);
        showNotification('Payment failed. Please try again.', 'error');
        
        // Reset button
        if (proceedBtn) {
            proceedBtn.disabled = false;
            proceedBtn.innerHTML = 'Complete Payment <i class="fas fa-credit-card"></i>';
        }
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}