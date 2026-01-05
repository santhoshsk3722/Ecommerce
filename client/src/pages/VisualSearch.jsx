import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const VisualSearch = () => {
    const navigate = useNavigate();
    const [isDragging, setIsDragging] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [preview, setPreview] = useState(null);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            processImage(file);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) processImage(file);
    };

    const processImage = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
        setScanning(true);

        // Simulate AI Analysis
        setTimeout(() => {
            // Mock result: Randomly choose a category or keyword
            const keywords = ['shoes', 'watch', 'camera', 'laptop'];
            const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
            navigate(`/?search=${randomKeyword}`);
        }, 3000);
    };

    return (
        <div className="container" style={{ padding: '60px 20px', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '40px' }}
            >
                <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '10px' }}>Visual Search</h1>
                <p style={{ color: '#64748b', fontSize: '18px' }}>Search for products by uploading an image.</p>
            </motion.div>

            <motion.div
                className="card"
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                style={{
                    width: '100%',
                    maxWidth: '600px',
                    height: '400px',
                    border: '3px dashed',
                    borderColor: isDragging ? 'var(--accent)' : scanning ? 'var(--success)' : '#cbd5e1',
                    borderRadius: '20px',
                    background: isDragging ? '#f0f9ff' : 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s'
                }}
            >
                {!preview ? (
                    <>
                        <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.5 }}>📸</div>
                        <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Drag & Drop an image here</h3>
                        <p style={{ color: '#94a3b8', marginBottom: '30px' }}>or click to upload</p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                        />
                    </>
                ) : (
                    <>
                        <img src={preview} alt="Upload Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '20px' }} />
                        {scanning && (
                            <motion.div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '5px',
                                    background: 'var(--accent)',
                                    boxShadow: '0 0 15px var(--accent)'
                                }}
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                        )}
                    </>
                )}
            </motion.div>

            {scanning && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ marginTop: '30px', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                    <span className="spinner" style={{ width: '20px', height: '20px', border: '2px solid #ddd', borderTopColor: 'var(--accent)', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
                    Analyzing image features...
                </motion.div>
            )}

            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default VisualSearch;
