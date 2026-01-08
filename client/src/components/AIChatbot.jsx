/**
 * @file AIChatbot.jsx
 * @description AI Shopping Assistant.
 * 
 * A floating chatbot that helps users find products, track orders, and navigate the site.
 * Uses a rule-based system to interpret user intent and provide instant responses.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import aiAvatar from '../assets/ai-avatar.png';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hi! I am your AI Shopping Assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [products, setProducts] = useState([]);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const suggestedQuestions = [
        "Track my order",
        "Contact Support",
        "Return Policy",
        "Payment Options"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
                const response = await fetch(`${apiUrl}/api/products?limit=100`);
                const data = await response.json();
                if (data.message === 'success') {
                    setProducts(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch products for AI context", error);
            }
        };

        fetchProducts();
    }, []);

    // Hide on login page (Placed here to avoid Hook Rule Violation)
    if (location.pathname === '/login') return null;

    const processMessage = (userMsg) => {
        setIsTyping(true);

        setTimeout(() => {
            let botResponse = "I'm not sure about that, but I can help you find products!";
            const lowerMsg = userMsg.toLowerCase();
            let action = null;

            // Search product in finding context
            const foundProduct = products.find(p =>
                lowerMsg.includes(p.title.toLowerCase()) ||
                p.title.toLowerCase().includes(lowerMsg)
            );

            if (foundProduct) {
                botResponse = `Yes! We have the ${foundProduct.title} for $${foundProduct.price}. Would you like to check it out now?`;
                action = () => navigate(`/?search=${encodeURIComponent(foundProduct.title)}`);
            }
            // Intent: Navigation - Cart/Checkout
            else if (lowerMsg.includes('cart') || lowerMsg.includes('basket') || lowerMsg.includes('checkout')) {
                botResponse = "Taking you to your cart. Do you have any coupons to apply?";
                action = () => navigate('/cart');
            }
            // Intent: Navigation - Profile/Account
            else if (lowerMsg.includes('profile') || lowerMsg.includes('account') || lowerMsg.includes('login')) {
                botResponse = "Heading to your profile settings. Need help with updating details?";
                action = () => navigate('/profile');
            }
            // Intent: Navigation - Orders
            else if (lowerMsg.includes('order') || lowerMsg.includes('track') || lowerMsg.includes('shipment')) {
                botResponse = "You can track your shipments here. Is there a specific order you're worried about?";
                action = () => navigate('/orders');
            }
            // Intent: Product Search - Laptops
            else if (lowerMsg.includes('laptop') || lowerMsg.includes('computer') || lowerMsg.includes('pc')) {
                botResponse = "Showing top-rated laptops for you. Are you looking for gaming or office use?";
                action = () => navigate('/?category=laptops');
            }
            // Intent: Product Search - Phones
            else if (lowerMsg.includes('phone') || lowerMsg.includes('mobile') || lowerMsg.includes('iphone')) {
                botResponse = "Latest smartphones coming right up! Interested in Apple or Android?";
                action = () => navigate('/?category=smartphones');
            }
            // Intent: Product Search - Audio
            else if (lowerMsg.includes('headphone') || lowerMsg.includes('speaker') || lowerMsg.includes('audio')) {
                botResponse = "Immerse yourself in sound. Checking Audio gear... Looking for wireless?";
                action = () => navigate('/?category=audio');
            }
            // Intent: Support
            else if (lowerMsg.includes('support') || lowerMsg.includes('contact') || lowerMsg.includes('help')) {
                botResponse = "📞 Support: +91 1234 567 890\n📧 Email: support@techorbit.com\n⏰ Mon-Sat, 9 AM - 6 PM\n\nIs there anything urgent I can help with?";
            }
            // Intent: Return Policy
            else if (lowerMsg.includes('return') || lowerMsg.includes('refund') || lowerMsg.includes('exchange')) {
                botResponse = "🔄 Returns: You can return any product within 7 days. Go to 'My Orders' to initiate. Do you have the Order ID handy?";
                action = () => navigate('/orders');
            }
            // Intent: Payment Methods
            else if (lowerMsg.includes('payment') || lowerMsg.includes('pay') || lowerMsg.includes('upi')) {
                botResponse = "💳 We accept Visa/Mastercard, UPI (GPay/PhonePe), and COD. \n\nWould you like to try a test transaction?";
            }
            // Intent: General Greeting
            else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
                botResponse = "Hello! 👋 I can help you with Orders, Returns, or finding products. What's on your mind today?";
            }

            setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
            setIsTyping(false);

            if (action) {
                setTimeout(action, 1000);
            }
        }, 1200);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        processMessage(userMsg);
    };

    const handleSuggestionClick = (question) => {
        setMessages(prev => [...prev, { role: 'user', text: question }]);
        processMessage(question);
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: '160px', // Tighter spacing related to InstallPrompt
                        right: '25px',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'var(--primary-gradient)',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)',
                        color: 'white',
                        fontSize: '30px',
                        cursor: 'pointer',
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}
                >
                    <img src={aiAvatar} alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </motion.button>
            )}

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        style={{
                            position: 'fixed',
                            bottom: '190px', // Adjusted to sit above button
                            right: '25px',
                            width: '350px',
                            height: '550px',
                            background: 'var(--surface)',
                            borderRadius: '20px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                            zIndex: 2000,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            border: '1px solid var(--border)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', padding: '15px 20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface)', padding: '2px', overflow: 'hidden' }}>
                                    <img src={aiAvatar} alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>AI Assistant</h3>
                                    <span style={{ fontSize: '12px', opacity: 0.9 }}>Always here to help</span>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.2s' }} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.8}>&times;</button>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: 'var(--background)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {messages.map((msg, idx) => (
                                <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                    <div style={{
                                        padding: '12px 16px',
                                        borderRadius: '18px',
                                        background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface-hover)',
                                        color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                                        borderBottomRightRadius: msg.role === 'user' ? '4px' : '18px',
                                        borderBottomLeftRadius: msg.role === 'bot' ? '4px' : '18px',
                                        boxShadow: msg.role === 'bot' ? '0 2px 8px rgba(0,0,0,0.05)' : '0 2px 8px rgba(37, 99, 235, 0.2)',
                                        fontSize: '14px',
                                        lineHeight: '1.5'
                                    }}>
                                        {msg.text}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', textAlign: msg.role === 'user' ? 'right' : 'left', marginLeft: msg.role === 'bot' ? '4px' : 0, marginRight: msg.role === 'user' ? '4px' : 0 }}>
                                        {msg.role === 'bot' ? 'AI' : 'You'}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div style={{ alignSelf: 'flex-start', background: 'var(--surface)', padding: '12px 16px', borderRadius: '18px', borderBottomLeftRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <span style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'typing 1s infinite 0ms' }}></span>
                                        <span style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'typing 1s infinite 333ms' }}></span>
                                        <span style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'typing 1s infinite 666ms' }}></span>
                                    </div>
                                </div>
                            )}

                            {/* Suggested Questions (only if messages len is small) */}
                            {messages.length < 3 && !isTyping && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                                    {suggestedQuestions.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSuggestionClick(q)}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '20px',
                                                border: '1px solid var(--accent)',
                                                background: 'transparent',
                                                color: 'var(--text-main)',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={e => { e.target.style.background = 'var(--accent)'; e.target.style.color = 'white'; }}
                                            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-main)'; }}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} style={{ padding: '15px', background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                                id="chat-input"
                                name="message"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Ask something..."
                                style={{ flex: 1, borderRadius: '24px', border: '1px solid var(--border)', padding: '12px 20px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', background: 'var(--surface)', color: 'var(--text-main)' }}
                                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '50%',
                                    background: input.trim() ? 'var(--primary)' : '#cbd5e1',
                                    color: 'white',
                                    border: 'none',
                                    cursor: input.trim() ? 'pointer' : 'default',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'background 0.2s'
                                }}
                            >
                                ➤
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes typing {
                    0%, 100% { transform: translateY(0); opacity: 0.5; }
                    50% { transform: translateY(-4px); opacity: 1; }
                }
            `}</style>
        </>
    );
};

export default AIChatbot;

