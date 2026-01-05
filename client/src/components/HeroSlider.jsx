import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80",
        title: "Next Gen Gaming",
        subtitle: "Experience the future of play.",
        cta: "Shop Consoles"
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80",
        title: "Audiophile Quality",
        subtitle: "Immerse yourself in pure sound.",
        cta: "Explore Audio"
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1600&q=80",
        title: "Wearable Tech",
        subtitle: "Stay connected, stay active.",
        cta: "View Smartwatches"
    }
];

const HeroSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{ position: 'relative', height: '400px', overflow: 'hidden', borderRadius: '12px', marginBottom: '32px' }}>
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${slides[currentIndex].image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '60px',
                        color: 'white'
                    }}
                >
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{ fontSize: '3rem', marginBottom: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                    >
                        {slides[currentIndex].title}
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{ fontSize: '1.5rem', marginBottom: '30px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                    >
                        {slides[currentIndex].subtitle}
                    </motion.p>
                    <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ delay: 0.6 }}
                        className="btn btn-primary"
                        style={{ width: 'fit-content', padding: '15px 30px', fontSize: '1.1rem' }}
                    >
                        {slides[currentIndex].cta}
                    </motion.button>
                </motion.div>
            </AnimatePresence>

            <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px' }}>
                {slides.map((_, index) => (
                    <div
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer',
                            transition: 'background 0.3s'
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;
