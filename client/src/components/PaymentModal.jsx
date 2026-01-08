import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UPIPayment from './UPIPayment';
import StripePayment from './StripePayment';

const PaymentModal = ({ isOpen, onClose, onConfirm, total, method }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)' }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        style={{ position: 'relative', background: 'var(--surface)', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '450px', zIndex: 1001, boxShadow: 'var(--shadow-lg)', color: 'var(--text-main)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '20px' }}>
                                {method === 'UPI' ? 'Pay via UPI / GPay' : 'Secure Card Payment'}
                            </h3>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-secondary)' }}>&times;</button>
                        </div>

                        {method === 'UPI' ? (
                            <UPIPayment amount={total} onSuccess={onConfirm} onClose={onClose} />
                        ) : (
                            <StripePayment amount={total} onSuccess={onConfirm} onClose={onClose} />
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PaymentModal;

