import React, { useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export const MagneticButton = ({ children, onClick, className = '' }) => {
    const buttonRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    const x = useSpring(0, { stiffness: 150, damping: 15 });
    const y = useSpring(0, { stiffness: 150, damping: 15 });

    const handleMouseMove = (e) => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        // Magnetic effect within 150px radius
        if (distance < 150) {
            const strength = Math.max(0, 1 - distance / 150);
            x.set(distanceX * strength * 0.3);
            y.set(distanceY * strength * 0.3);
        } else {
            x.set(0);
            y.set(0);
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={buttonRef}
            style={{ x, y }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            className={`relative ${className}`}
            whileTap={{ scale: 0.95 }}
        >
            {/* Glow effect based on proximity */}
            <motion.div
                className="absolute inset-0 rounded-2xl bg-purple-600/30 blur-xl"
                animate={{
                    scale: isHovered ? 1.2 : 1,
                    opacity: isHovered ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
            />

            {/* Ripple effect */}
            {isHovered && (
                <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-purple-400/50"
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                />
            )}

            {children}
        </motion.button>
    );
};
