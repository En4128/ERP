import React from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    GraduationCap,
    Lightbulb,
    Atom,
    Calculator,
    FlaskConical,
    Pencil,
    Brain,
    Trophy,
    Target,
    Sparkles,
    Microscope
} from 'lucide-react';

export const FloatingShapes = () => {
    const icons = [
        { Icon: BookOpen, size: 50, x: '8%', y: '15%', duration: 22, delay: 0, color: 'text-[#60A5FA]/40', rotation: 15 },
        { Icon: GraduationCap, size: 60, x: '88%', y: '12%', duration: 25, delay: 1, color: 'text-[#A78BFA]/40', rotation: -20 },
        { Icon: Lightbulb, size: 45, x: '15%', y: '65%', duration: 20, delay: 2, color: 'text-[#FBBF24]/40', rotation: 10 },
        { Icon: Atom, size: 55, x: '82%', y: '70%', duration: 28, delay: 3, color: 'text-[#22D3EE]/40', rotation: -15 },
        { Icon: Calculator, size: 48, x: '25%', y: '85%', duration: 24, delay: 1.5, color: 'text-[#818CF8]/40', rotation: 12 },
        { Icon: FlaskConical, size: 52, x: '92%', y: '45%', duration: 26, delay: 2.5, color: 'text-[#34D399]/40', rotation: -18 },
        { Icon: Pencil, size: 42, x: '5%', y: '40%', duration: 21, delay: 0.5, color: 'text-[#FB7185]/40', rotation: 25 },
        { Icon: Brain, size: 58, x: '50%', y: '25%', duration: 30, delay: 4, color: 'text-[#A78BFA]/40', rotation: -10 },
        { Icon: Trophy, size: 46, x: '70%', y: '88%', duration: 23, delay: 3.5, color: 'text-[#FCD34D]/40', rotation: 8 },
        { Icon: Target, size: 50, x: '35%', y: '55%', duration: 27, delay: 1, color: 'text-[#F87171]/40', rotation: -12 },
        { Icon: Sparkles, size: 44, x: '60%', y: '8%', duration: 19, delay: 2, color: 'text-[#60A5FA]/40', rotation: 20 },
        { Icon: Microscope, size: 54, x: '12%', y: '92%', duration: 29, delay: 4.5, color: 'text-[#22D3EE]/40', rotation: -8 },
    ];

    return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
            {icons.map((item, index) => {
                const IconComponent = item.Icon;
                return (
                    <motion.div
                        key={index}
                        className="absolute"
                        style={{
                            left: item.x,
                            top: item.y,
                        }}
                        initial={{
                            rotate: item.rotation,
                            opacity: 0
                        }}
                        animate={{
                            y: [0, -40, 0],
                            x: [0, 20, 0],
                            rotate: [item.rotation, item.rotation + 360, item.rotation],
                            opacity: [0.3, 0.6, 0.3],
                            scale: [1, 1.15, 1],
                        }}
                        transition={{
                            duration: item.duration,
                            delay: item.delay,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <div className="relative">
                            {/* Glow effect */}
                            <div className="absolute inset-0 blur-xl opacity-50">
                                <IconComponent
                                    size={item.size}
                                    className={item.color}
                                    strokeWidth={1.5}
                                />
                            </div>
                            {/* Main icon */}
                            <IconComponent
                                size={item.size}
                                className={`${item.color} drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]`}
                                strokeWidth={1.5}
                            />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};
