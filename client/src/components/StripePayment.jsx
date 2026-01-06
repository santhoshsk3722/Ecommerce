import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe outside to avoid recreation
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ amount, onSuccess, onClose }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return to a success page or handle inline?
                // We will handle inline for this SPA
                return_url: window.location.origin,
            },
            redirect: 'if_required', // Important to avoid redirect if not needed
        });

        if (error) {
            setMessage(error.message);
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess();
        } else {
            setMessage("Unexpected state.");
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            {message && <div style={{ color: 'red', marginTop: '10px', fontSize: '14px' }}>{message}</div>}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                    disabled={isProcessing || !stripe || !elements}
                    id="submit"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                >
                    {isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-secondary"
                    disabled={isProcessing}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

const StripePayment = ({ amount, onSuccess, onClose }) => {
    const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        // Create PaymentIntent as soon as the page loads
        if (amount > 0) {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            fetch(`${apiUrl}/api/create-payment-intent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount }),
            })
                .then((res) => res.json())
                .then((data) => setClientSecret(data.clientSecret));
        }
    }, [amount]);

    const options = {
        clientSecret,
        appearance: {
            theme: 'night', // or 'stripe' based on preference, 'night' fits dark mode better or 'auto'
            variables: {
                colorPrimary: '#2563eb',
            },
        },
    };

    return (
        <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {clientSecret ? (
                <Elements options={options} stripe={stripePromise}>
                    <CheckoutForm amount={amount} onSuccess={onSuccess} onClose={onClose} />
                </Elements>
            ) : (
                <div style={{ textAlign: 'center' }}>Loading Secure Payment...</div>
            )}
        </div>
    );
};

export default StripePayment;
