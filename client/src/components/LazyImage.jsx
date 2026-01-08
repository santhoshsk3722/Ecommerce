import React, { useState } from 'react';
import { motion } from 'framer-motion';
import defaultProductImg from '../assets/default-product.png';

const LazyImage = ({ src, alt, style, className }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div style={{ position: 'relative', overflow: 'hidden', ...style }} className={className}>
            {/* Placeholder / Blur Effect */}
            {!isLoaded && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'var(--surface-hover)', // Skeleton color
                        zIndex: 1
                    }}
                />
            )}

            <motion.img
                src={src || defaultProductImg}
                alt={alt}
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                onLoad={() => setIsLoaded(true)}
                onError={(e) => {
                    if (e.target.src !== defaultProductImg) {
                        e.target.src = defaultProductImg;
                    }
                }}
                loading="lazy"
                decoding="async"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block'
                }}
            />
        </div>
    );
};

export default LazyImage;

