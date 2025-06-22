// Stripe Integration - Pure JavaScript
class StripePaymentHandler {
    constructor() {
        this.stripe = null;
        this.elements = null;
        this.card = null;
        this.initializeStripe();
    }

    async initializeStripe() {
        try {
            // Load Stripe.js dynamically
            if (!window.Stripe) {
                await this.loadStripeJS();
            }
            
            // Get publishable key from server
            const response = await fetch('/php/stripe-config.php?action=get_publishable_key');
            const data = await response.json();
            
            if (data.publishable_key) {
                this.stripe = Stripe(data.publishable_key);
                this.setupPaymentForm();
            }
        } catch (error) {
            console.error('Stripe initialization failed:', error);
        }
    }

    loadStripeJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    setupPaymentForm() {
        const paymentForm = document.getElementById('payment-form');
        if (!paymentForm) return;

        this.elements = this.stripe.elements();
        this.card = this.elements.create('card');
        this.card.mount('#card-element');

        this.card.on('change', (event) => {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        });

        paymentForm.addEventListener('submit', (event) => {
            event.preventDefault();
            this.handlePayment();
        });
    }

    async handlePayment() {
        const { error, paymentMethod } = await this.stripe.createPaymentMethod({
            type: 'card',
            card: this.card,
        });

        if (error) {
            console.error('Payment method creation failed:', error);
            return;
        }

        // Send payment method to server
        const response = await fetch('/php/process-payment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                payment_method_id: paymentMethod.id,
                amount: document.getElementById('payment-amount').value
            })
        });

        const result = await response.json();
        
        if (result.success) {
            window.location.href = '/payment-success.html';
        } else {
            console.error('Payment failed:', result.error);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new StripePaymentHandler();
});