/**
 * @file LoyaltyContext.jsx
 * @description Loyalty Points System.
 * 
 * Tracks user points and tier status (Bronze, Silver, Gold).
 * Provides functions to earn points and check rewards eligibility.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const LoyaltyContext = createContext();

export const useLoyalty = () => useContext(LoyaltyContext);

export const LoyaltyProvider = ({ children }) => {
    const { user } = useAuth();
    const [points, setPoints] = useState(0);
    const [badges, setBadges] = useState([]);
    const [history, setHistory] = useState([]); // Points history

    // Mock initial data load
    useEffect(() => {
        if (user) {
            // In restart, check localStorage or default to mock
            const savedPoints = localStorage.getItem(`loyalty_points_${user.id}`);
            if (savedPoints) {
                setPoints(parseInt(savedPoints));
                setBadges(JSON.parse(localStorage.getItem(`loyalty_badges_${user.id}`) || '[]'));
            } else {
                // Default welcome bonus
                setPoints(150);
                setBadges(['Early Adopter']);
            }
        }
    }, [user]);

    // Persist changes
    useEffect(() => {
        if (user) {
            localStorage.setItem(`loyalty_points_${user.id}`, points);
            localStorage.setItem(`loyalty_badges_${user.id}`, JSON.stringify(badges));
        }
    }, [points, badges, user]);

    const addPoints = (amount, reason) => {
        setPoints(prev => prev + amount);
        setHistory(prev => [{ date: new Date().toISOString(), amount, reason }, ...prev]);

        // Simple Gamification: Badge Logic on certain thresholds
        if (points + amount > 500 && !badges.includes('Tech Whale')) {
            addBadge('Tech Whale');
        }
    };

    const spendPoints = (amount) => {
        if (points >= amount) {
            setPoints(prev => prev - amount);
            setHistory(prev => [{ date: new Date().toISOString(), amount: -amount, reason: 'Redeemed' }, ...prev]);
            return true;
        }
        return false;
    };

    const addBadge = (badgeName) => {
        if (!badges.includes(badgeName)) {
            setBadges(prev => [...prev, badgeName]);
            // Could trigger a toast here if ToastContext was available
        }
    };

    return (
        <LoyaltyContext.Provider value={{ points, badges, history, addPoints, spendPoints }}>
            {children}
        </LoyaltyContext.Provider>
    );
};

