import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StripePayment from './StripePayment';

const PaymentModal = ({ isOpen, onClose, onConfirm, total }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}
                    />
                    <motion.div
                        initial={{ y: 200, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 200, opacity: 0 }}
                        style={{ position: 'fixed', top: '50%', left: '50%', x: '-50%', y: '-50%', transform: 'translate(-50%, -50%)', background: 'var(--surface)', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '450px', zIndex: 1001, boxShadow: 'var(--shadow-lg)', color: 'var(--text-main)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '20px' }}>Secure Checkout</h3>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-secondary)' }}>&times;</button>
                        </div>

                        <StripePayment amount={total} onSuccess={onConfirm} onClose={onClose} />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default PaymentModal;
