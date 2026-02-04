import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const ModernBackground = () => {
    const canvasRef = useRef(null);
    const starsRef = useRef(null);
    const { scrollY } = useScroll();
    const opacity = useTransform(scrollY, [0, 500], [1, 0.3]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const starsCanvas = starsRef.current;
        const ctx = canvas.getContext('2d');
        const starsCtx = starsCanvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            starsCanvas.width = window.innerWidth;
            starsCanvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        // Starfield
        class Star {
            constructor() {
                this.x = Math.random() * starsCanvas.width;
                this.y = Math.random() * starsCanvas.height;
                this.size = Math.random() * 2;
                this.speed = Math.random() * 0.5 + 0.1;
                this.opacity = Math.random();
                this.twinkleSpeed = Math.random() * 0.02 + 0.01;
            }

            update() {
                this.opacity += this.twinkleSpeed;
                if (this.opacity > 1 || this.opacity < 0) {
                    this.twinkleSpeed *= -1;
                }
            }

            draw() {
                starsCtx.globalAlpha = this.opacity * 0.8;
                starsCtx.fillStyle = '#ffffff';
                starsCtx.beginPath();
                starsCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                starsCtx.fill();

                // Add glow for larger stars
                if (this.size > 1) {
                    const gradient = starsCtx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
                    gradient.addColorStop(0, 'rgba(168, 85, 247, 0.3)');
                    gradient.addColorStop(1, 'transparent');
                    starsCtx.fillStyle = gradient;
                    starsCtx.beginPath();
                    starsCtx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                    starsCtx.fill();
                }
            }
        }

        const stars = Array.from({ length: 200 }, () => new Star());

        class Orb {
            constructor(x, y, radius, color) {
                this.x = x;
                this.y = y;
                this.radius = radius;
                this.color = color;
                this.vx = (Math.random() - 0.5) * 0.8;
                this.vy = (Math.random() - 0.5) * 0.8;
                this.originalX = x;
                this.originalY = y;
                this.pulsePhase = Math.random() * Math.PI * 2;
            }

            update(mouse) {
                this.x += this.vx;
                this.y += this.vy;

                // Smooth organic movement
                this.pulsePhase += 0.02;
                this.x += Math.sin(this.pulsePhase) * 0.5;
                this.y += Math.cos(this.pulsePhase * 0.7) * 0.5;

                // Enhanced mouse interaction
                if (mouse.x && mouse.y) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 600) {
                        const force = (600 - dist) / 600;
                        this.x += dx * 0.005 * force;
                        this.y += dy * 0.005 * force;
                    }
                }

                if (this.x < -this.radius || this.x > canvas.width + this.radius) this.vx *= -1;
                if (this.y < -this.radius || this.y > canvas.height + this.radius) this.vy *= -1;
            }

            draw() {
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
                gradient.addColorStop(0, this.color);
                gradient.addColorStop(0.5, this.color.replace(')', ', 0.5)').replace('rgb', 'rgba'));
                gradient.addColorStop(1, 'transparent');

                ctx.globalAlpha = 0.5;
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const orbs = [
            new Orb(window.innerWidth * 0.2, window.innerHeight * 0.3, 450, 'rgb(96, 165, 250)'), // Primary Blue
            new Orb(window.innerWidth * 0.8, window.innerHeight * 0.4, 550, 'rgb(129, 140, 248)'), // Indigo
            new Orb(window.innerWidth * 0.5, window.innerHeight * 0.7, 500, 'rgb(34, 211, 238)'), // Cyan
            new Orb(window.innerWidth * 0.1, window.innerHeight * 0.8, 350, 'rgb(167, 139, 250)'), // Violet
            new Orb(window.innerWidth * 0.9, window.innerHeight * 0.2, 400, 'rgb(59, 130, 246)'), // Blue
        ];

        let mouse = { x: null, y: null };
        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        window.addEventListener('mousemove', handleMouseMove);

        const render = () => {
            // Clear canvases
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);

            // Render stars
            stars.forEach(star => {
                star.update();
                star.draw();
            });

            // Render orbs
            orbs.forEach(orb => {
                orb.update(mouse);
                orb.draw();
            });

            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <motion.div
            style={{
                opacity,
                background: 'linear-gradient(to bottom, #0F1419 0%, #1A1F2E 50%, #0F1419 100%)'
            }}
            className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
        >
            {/* Starfield layer */}
            <canvas ref={starsRef} className="absolute inset-0 w-full h-full" />

            {/* Orbs layer */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full filter blur-[140px] opacity-40" />

            {/* Overlay layers */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />

            {/* Noise texture */}
            <div className="absolute inset-0 opacity-[0.015]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat'
                }}
            />

            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTSA2MCAwIEwgMCA2MCBNIDMwIDAgTCAwIDMwIE0gNjAgMzAgTCAzMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] opacity-30" />
        </motion.div>
    );
};
