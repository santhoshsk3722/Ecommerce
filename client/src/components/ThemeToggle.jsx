import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div
            onClick={toggleTheme}
            style={{
                width: '60px',
                height: '30px',
                background: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                borderRadius: '50px',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
                cursor: 'pointer',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'}`,
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                position: 'relative'
            }}
        >
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                style={{
                    width: '24px',
                    height: '24px',
                    background: isDark ? '#1a1a1a' : '#ffffff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    marginLeft: isDark ? '30px' : '0px'
                }}
            >
                {isDark ? (
                    <span style={{ fontSize: '14px' }}>🌙</span>
                ) : (
                    <span style={{ fontSize: '14px' }}>☀️</span>
                )}
            </motion.div>
        </div>
    );
};

export default ThemeToggle;

