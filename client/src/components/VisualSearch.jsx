import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const VisualSearch = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const wrapperRef = useRef(null);

    // Mock Trending Data
    const trendingSearches = ['Wireless Headphones', 'Gaming Mouse', 'Smart Watch', 'MacBook Pro', 'Mechanical Keyboard'];

    useEffect(() => {
        const stored = localStorage.getItem('recent_searches');
        if (stored) {
            setRecentSearches(JSON.parse(stored));
        }

        // Click outside handler
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (term) => {
        if (!term.trim()) return;

        // Save to recent
        const updated = [term, ...recentSearches.filter(t => t !== term)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recent_searches', JSON.stringify(updated));

        setIsFocused(false);
        setSearchTerm(term);
        navigate(`/?search=${term}`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch(searchTerm);
    };

    const clearRecent = (e) => {
        e.stopPropagation();
        setRecentSearches([]);
        localStorage.removeItem('recent_searches');
    };

    // Voice Search
    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.start();
            recognition.onresult = (event) => {
                let speechToText = event.results[0][0].transcript;
                speechToText = speechToText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
                setSearchTerm(speechToText);
                handleSearch(speechToText);
            };
        } else {
            alert("Voice search not supported in this browser.");
        }
    };

    return (
        <div className="search-form-container" ref={wrapperRef} style={{ position: 'relative' }}>
            <form onSubmit={handleSubmit} className="search-form" style={{ position: 'relative', zIndex: 1002 }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '18px', marginRight: '10px' }}>🔍</span>
                <input
                    type="text"
                    id="search-input"
                    name="search"
                    placeholder="Search Products..."
                    className='search-input'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    style={{ border: 'none', outline: 'none', flex: 1, background: 'transparent', fontSize: '14px', color: 'inherit', minWidth: '100px' }}
                />
                <button
                    type="button"
                    onClick={handleVoiceSearch}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                    title="Voice Search"
                >
                    🎤
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/visual-search')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', marginLeft: '5px' }}
                    title="Visual Search"
                >
                    📸
                </button>
            </form>

            <AnimatePresence>
                {isFocused && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        style={{
                            position: 'absolute',
                            top: '120%',
                            left: 0,
                            right: 0,
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            boxShadow: 'var(--shadow-lg)',
                            padding: '15px',
                            zIndex: 1001
                        }}
                    >
                        {/* Recent Searches */}
                        {recentSearches.length > 0 && (
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Recent</span>
                                    <span onClick={clearRecent} style={{ fontSize: '11px', color: 'var(--error)', cursor: 'pointer' }}>Clear All</span>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {recentSearches.map(term => (
                                        <div
                                            key={term}
                                            onClick={() => handleSearch(term)}
                                            style={{
                                                padding: '6px 12px', background: 'var(--surface-hover)', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-main)'
                                            }}
                                        >
                                            🕑 {term}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Trending */}
                        <div>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px' }}>Trending Now</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                {trendingSearches.map(term => (
                                    <div
                                        key={term}
                                        onClick={() => handleSearch(term)}
                                        style={{
                                            padding: '8px', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', color: 'var(--text-main)',
                                            display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = 'var(--surface-hover)'}
                                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                    >
                                        🔥 {term}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VisualSearch;

