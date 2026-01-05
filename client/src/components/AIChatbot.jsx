import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hi! I am your AI Shopping Assistant. Ask me about products or your orders!' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsTyping(true);

        // Simulate AI Processing delay
        setTimeout(() => {
            let botResponse = "I'm not sure about that, but I can help you find products!";
            const lowerMsg = userMsg.toLowerCase();
            let action = null;

            // Intent: Navigation - Cart/Checkout
            if (lowerMsg.includes('cart') || lowerMsg.includes('basket') || lowerMsg.includes('checkout')) {
                botResponse = "Taking you to your cart. Don't forget to use your coupons!";
                action = () => navigate('/cart');
            }
            // Intent: Navigation - Profile/Account
            else if (lowerMsg.includes('profile') || lowerMsg.includes('account') || lowerMsg.includes('login')) {
                botResponse = "Heading to your profile settings.";
                action = () => navigate('/profile');
            }
            // Intent: Navigation - Orders
            else if (lowerMsg.includes('order') || lowerMsg.includes('track') || lowerMsg.includes('shipment')) {
                botResponse = "You can track your shipments here.";
                action = () => navigate('/orders');
            }
            // Intent: Product Search - Laptops
            else if (lowerMsg.includes('laptop') || lowerMsg.includes('computer') || lowerMsg.includes('pc')) {
                botResponse = "Showing top-rated laptops for you.";
                action = () => navigate('/?category=laptops');
            }
            // Intent: Product Search - Phones
            else if (lowerMsg.includes('phone') || lowerMsg.includes('mobile') || lowerMsg.includes('iphone')) {
                botResponse = "Latest smartphones coming right up!";
                action = () => navigate('/?category=smartphones');
            }
            // Intent: Product Search - Audio
            else if (lowerMsg.includes('headphone') || lowerMsg.includes('speaker') || lowerMsg.includes('audio')) {
                botResponse = "Immerse yourself in sound. Checking Audio gear...";
                action = () => navigate('/?category=audio');
            }
            // Intent: General Greeting
            else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
                botResponse = "Hello! 👋 I can help you navigate. Try saying 'Go to Cart' or 'Show computers'.";
            }

            setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
            setIsTyping(false);

            // Execute navigation after short delay for effect
            if (action) {
                setTimeout(action, 1000);
            }
        }, 1200);
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
                        bottom: '30px',
                        right: '30px',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'var(--primary-gradient)',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)',
                        color: 'white',
                        fontSize: '24px',
                        cursor: 'pointer',
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    🤖
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
                            bottom: '100px',
                            right: '30px',
                            width: '350px',
                            height: '500px',
                            background: 'white',
                            borderRadius: '20px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                            zIndex: 2000,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.5)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ background: 'var(--primary-gradient)', padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '16px' }}>AI Assistant</h3>
                                <span style={{ fontSize: '12px', opacity: 0.8 }}>Online • Replies instantly</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {messages.map((msg, idx) => (
                                <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                    <div style={{
                                        padding: '12px 16px',
                                        borderRadius: '16px',
                                        background: msg.role === 'user' ? 'var(--primary)' : 'white',
                                        color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                                        borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                                        borderBottomLeftRadius: msg.role === 'bot' ? '4px' : '16px',
                                        boxShadow: msg.role === 'bot' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                                        fontSize: '14px',
                                        lineHeight: '1.5'
                                    }}>
                                        {msg.text}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '5px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                                        {msg.role === 'bot' ? 'AI Assistant' : 'You'}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div style={{ alignSelf: 'flex-start', background: 'white', padding: '10px 16px', borderRadius: '16px', borderBottomLeftRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <span style={{ width: '6px', height: '6px', background: '#ccc', borderRadius: '50%', animation: 'typing 1s infinite 0ms' }}></span>
                                        <span style={{ width: '6px', height: '6px', background: '#ccc', borderRadius: '50%', animation: 'typing 1s infinite 333ms' }}></span>
                                        <span style={{ width: '6px', height: '6px', background: '#ccc', borderRadius: '50%', animation: 'typing 1s infinite 666ms' }}></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} style={{ padding: '15px', background: 'white', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Ask something..."
                                style={{ flex: 1, borderRadius: '24px', border: '1px solid #e2e8f0', padding: '10px 20px', fontSize: '14px' }}
                            />
                            <button type="submit" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                ➤
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes typing {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
            `}</style>
        </>
    );
};

export default AIChatbot;
