import React, { createContext, useContext, useState, useEffect } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove
        setTimeout(() => {
            removeToast(id);
        }, 3000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {toasts.map(toast => (
                    <div key={toast.id} style={{
                        background: toast.type === 'error' ? '#ff6161' : '#333',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '4px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        minWidth: '250px',
                        animation: 'slideIn 0.3s ease-out'
                    }}>
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

