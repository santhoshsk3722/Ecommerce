import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
            const res = await fetch(`${apiUrl}/api/notifications/${user.id}`);
            const data = await res.json();
            if (data.message === 'success') {
                setNotifications(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
            await fetch(`${apiUrl}/api/notifications/read/${id}`, { method: 'PATCH' });
            // Update local state
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        } catch (err) {
            console.error("Failed to mark read", err);
        }
    };

    const handleNotificationClick = (notif) => {
        if (!notif.is_read) markAsRead(notif.id);

        // Basic routing logic based on message content (heuristic)
        if (notif.message.includes('Order')) navigate('/orders');
        else if (notif.message.includes('Welcome')) navigate('/profile');

        setIsOpen(false);
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '20px',
                    padding: '8px',
                    position: 'relative',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                🔔
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            background: '#ef4444',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid var(--background)'
                        }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: '-50px', // Center align specifically for navbar
                            width: '320px',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                            zIndex: 1000,
                            overflow: 'hidden',
                            maxHeight: '400px',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <div style={{ padding: '15px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-hover)' }}>
                            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => notifications.forEach(n => !n.is_read && markAsRead(n.id))}
                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                    No notifications yet.
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        style={{
                                            padding: '15px',
                                            borderBottom: '1px solid var(--border)',
                                            background: notif.is_read ? 'transparent' : 'rgba(37, 99, 235, 0.05)',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                            display: 'flex',
                                            gap: '10px'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.background = notif.is_read ? 'transparent' : 'rgba(37, 99, 235, 0.05)'}
                                    >
                                        <div style={{ fontSize: '16px' }}>
                                            {notif.message.includes('Order') ? '📦' : notif.message.includes('Welcome') ? '👋' : '📢'}
                                        </div>
                                        <div>
                                            <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.4' }}>{notif.message}</p>
                                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                                {new Date(notif.date || notif.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {!notif.is_read && (
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: '5px' }} />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;

