import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const UPIPayment = ({ amount, onSuccess, onClose }) => {
    const [step, setStep] = useState('input'); // input, processing, success
    const [vpa, setVpa] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVerify = () => {
        if (!vpa.includes('@')) {
            setError('Invalid UPI ID (must contain @)');
            return;
        }
        setLoading(true);
        setError('');

        // Simulate verification
        setTimeout(() => {
            setLoading(false);
            setStep('processing');
        }, 1500);
    };

    // Simulate "Check Mobile" flow
    useEffect(() => {
        if (step === 'processing') {
            const timer = setTimeout(() => {
                onSuccess();
            }, 4000); // 4 seconds to "approve" on phone
            return () => clearTimeout(timer);
        }
    }, [step, onSuccess]);

    return (
        <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {step === 'input' && (
                <div style={{ textAlign: 'center' }}>
                    <h4 style={{ marginBottom: '20px' }}>Enter UPI ID / VPA</h4>
                    <input
                        type="text"
                        placeholder="example@okhdfcbank"
                        value={vpa}
                        onChange={(e) => setVpa(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: 'var(--surface)',
                            color: 'var(--text-main)',
                            marginBottom: '10px',
                            fontSize: '16px'
                        }}
                    />
                    {error && <div style={{ color: 'var(--error)', fontSize: '12px', marginBottom: '10px' }}>{error}</div>}

                    <button
                        onClick={handleVerify}
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '10px' }}
                    >
                        {loading ? 'Verifying...' : `Pay $${amount.toFixed(2)}`}
                    </button>

                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', opacity: 0.6 }}>
                        <span>Google Pay</span> • <span>PhonePe</span> • <span>Paytm</span>
                    </div>
                </div>
            )}

            {step === 'processing' && (
                <div style={{ textAlign: 'center' }}>
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{ fontSize: '40px', marginBottom: '20px' }}
                    >
                        📱
                    </motion.div>
                    <h4 style={{ marginBottom: '10px' }}>Request Sent to {vpa}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Please open your UPI App on your phone and approve the payment of <b>${amount.toFixed(2)}</b>.
                    </p>

                    <div style={{ marginTop: '30px', width: '100%', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 4 }}
                            style={{ height: '100%', background: 'var(--success)' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default UPIPayment;

