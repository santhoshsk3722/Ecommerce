import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        background: 'var(--surface)',
                        padding: '15px 20px',
                        borderRadius: '12px',
                        boxShadow: 'var(--shadow-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        border: '1px solid var(--primary)',
                        maxWidth: '90%',
                        width: '400px'
                    }}
                >
                    <div style={{ fontSize: '24px' }}>📲</div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>Install App</h4>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Add E-Shop to your home screen for faster access.</p>
                    </div>
                    <button
                        onClick={handleInstallClick}
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}
                    >
                        Install
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '18px'
                        }}
                    >
                        &times;
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InstallPrompt;

