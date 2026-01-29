import { useEffect, useRef, useState } from 'react';

class Particle {
    pos = { x: 0, y: 0 };
    vel = { x: 0, y: 0 };
    acc = { x: 0, y: 0 };
    target = { x: 0, y: 0 };

    closeEnoughTarget = 100;
    maxSpeed = 1.0;
    maxForce = 0.1;
    particleSize = 8;
    isKilled = false;

    startColor = { r: 0, g: 0, b: 0 };
    targetColor = { r: 0, g: 0, b: 0 };
    colorWeight = 0;
    colorBlendRate = 0.01;

    move() {
        let proximityMult = 1;
        const distance = Math.sqrt(
            Math.pow(this.pos.x - this.target.x, 2) + Math.pow(this.pos.y - this.target.y, 2)
        );

        if (distance < this.closeEnoughTarget) {
            proximityMult = distance / this.closeEnoughTarget;
        }

        const towardsTarget = {
            x: this.target.x - this.pos.x,
            y: this.target.y - this.pos.y,
        };

        const magnitude = Math.sqrt(towardsTarget.x * towardsTarget.x + towardsTarget.y * towardsTarget.y);
        if (magnitude > 0) {
            towardsTarget.x = (towardsTarget.x / magnitude) * this.maxSpeed * proximityMult;
            towardsTarget.y = (towardsTarget.y / magnitude) * this.maxSpeed * proximityMult;
        }

        const steer = {
            x: towardsTarget.x - this.vel.x,
            y: towardsTarget.y - this.vel.y,
        };

        const steerMagnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
        if (steerMagnitude > 0) {
            steer.x = (steer.x / steerMagnitude) * this.maxForce;
            steer.y = (steer.y / steerMagnitude) * this.maxForce;
        }

        this.acc.x += steer.x;
        this.acc.y += steer.y;

        this.vel.x += this.acc.x;
        this.vel.y += this.acc.y;
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        this.acc.x = 0;
        this.acc.y = 0;
    }

    draw(ctx, drawAsPoints) {
        if (this.colorWeight < 1.0) {
            this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0);
        }

        const currentColor = {
            r: Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight),
            g: Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight),
            b: Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight),
        };

        if (drawAsPoints) {
            ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
            ctx.fillRect(this.pos.x, this.pos.y, 2, 2);
        } else {
            ctx.fillStyle = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.particleSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    kill(width, height) {
        if (!this.isKilled) {
            const randomPos = this.generateRandomPos(width / 2, height / 2, (width + height) / 2);
            this.target.x = randomPos.x;
            this.target.y = randomPos.y;

            this.startColor = {
                r: this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight,
                g: this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight,
                b: this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight,
            };
            this.targetColor = { r: 0, g: 0, b: 0 };
            this.colorWeight = 0;

            this.isKilled = true;
        }
    }

    generateRandomPos(x, y, mag) {
        const randomX = Math.random() * 1000;
        const randomY = Math.random() * 500;

        const direction = {
            x: randomX - x,
            y: randomY - y,
        };

        const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        if (magnitude > 0) {
            direction.x = (direction.x / magnitude) * mag;
            direction.y = (direction.y / magnitude) * mag;
        }

        return {
            x: x + direction.x,
            y: y + direction.y,
        };
    }
}

const DEFAULT_WORDS = ['LearNex', 'Smart ERP', 'Student Portal', 'Faculty Portal'];

export function ParticleTextEffect({ words = DEFAULT_WORDS, className = '' }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const animationRef = useRef(undefined);
    const particlesRef = useRef([]);
    const frameCountRef = useRef(0);
    const wordIndexRef = useRef(0);
    const mouseRef = useRef({ x: 0, y: 0, isPressed: false, isRightClick: false });
    const [dimensions, setDimensions] = useState({ width: 1000, height: 300, fontSize: 80 });

    const pixelSteps = 6;
    const drawAsPoints = true;

    const resizeCanvas = () => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        const containerWidth = container.clientWidth;
        let newWidth = 1000;
        let newHeight = 300;
        let newFontSize = 80;

        if (containerWidth < 600) {
            newWidth = containerWidth;
            newHeight = Math.min(containerWidth * 0.4, 200);
            newFontSize = Math.max(30, containerWidth / 10);
        } else if (containerWidth < 1000) {
            newWidth = containerWidth;
            newHeight = Math.min(containerWidth * 0.3, 300);
            newFontSize = Math.max(50, containerWidth / 12);
        } else {
            newWidth = 1000;
            newHeight = 300;
            newFontSize = 80;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;
        setDimensions({ width: newWidth, height: newHeight, fontSize: newFontSize });

        if (words.length > 0) {
            nextWord(words[wordIndexRef.current], canvas, newFontSize);
        }
    };

    const generateRandomPos = (x, y, mag) => {
        const randomX = Math.random() * dimensions.width;
        const randomY = Math.random() * dimensions.height;

        const direction = {
            x: randomX - x,
            y: randomY - y,
        };

        const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        if (magnitude > 0) {
            direction.x = (direction.x / magnitude) * mag;
            direction.y = (direction.y / magnitude) * mag;
        }

        return {
            x: x + direction.x,
            y: y + direction.y,
        };
    };

    const nextWord = (word, canvas, fontSize) => {
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = canvas.width;
        offscreenCanvas.height = canvas.height;
        const offscreenCtx = offscreenCanvas.getContext('2d');

        offscreenCtx.fillStyle = 'black';
        offscreenCtx.font = `bold ${fontSize}px Arial`;
        offscreenCtx.textAlign = 'center';
        offscreenCtx.textBaseline = 'middle';
        offscreenCtx.fillText(word, canvas.width / 2, canvas.height / 2);

        const imageData = offscreenCtx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // Generate vibrant colors instead of gray
        const hue = Math.random() * 360;
        const saturation = 70 + Math.random() * 30; // 70-100%
        const lightness = 40 + Math.random() * 20; // 40-60%

        // Convert HSL to RGB
        const hslToRgb = (h, s, l) => {
            s /= 100;
            l /= 100;
            const k = n => (n + h / 30) % 12;
            const a = s * Math.min(l, 1 - l);
            const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
            return {
                r: Math.round(255 * f(0)),
                g: Math.round(255 * f(8)),
                b: Math.round(255 * f(4))
            };
        };

        const newColor = hslToRgb(hue, saturation, lightness);

        const particles = particlesRef.current;
        let particleIndex = 0;

        const coordsIndexes = [];
        for (let i = 0; i < pixels.length; i += pixelSteps * 4) {
            coordsIndexes.push(i);
        }

        for (let i = coordsIndexes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [coordsIndexes[i], coordsIndexes[j]] = [coordsIndexes[j], coordsIndexes[i]];
        }

        for (const coordIndex of coordsIndexes) {
            const pixelIndex = coordIndex;
            const alpha = pixels[pixelIndex + 3];

            if (alpha > 0) {
                const x = (pixelIndex / 4) % canvas.width;
                const y = Math.floor(pixelIndex / 4 / canvas.width);

                let particle;

                if (particleIndex < particles.length) {
                    particle = particles[particleIndex];
                    particle.isKilled = false;
                    particleIndex++;
                } else {
                    particle = new Particle();

                    const randomPos = generateRandomPos(canvas.width / 2, canvas.height / 2, (canvas.width + canvas.height) / 2);
                    particle.pos.x = randomPos.x;
                    particle.pos.y = randomPos.y;

                    particle.maxSpeed = Math.random() * 6 + 4;
                    particle.maxForce = particle.maxSpeed * 0.05;
                    particle.particleSize = Math.random() * 6 + 6;
                    particle.colorBlendRate = Math.random() * 0.0275 + 0.0025;

                    particles.push(particle);
                }

                particle.startColor = {
                    r: particle.startColor.r + (particle.targetColor.r - particle.startColor.r) * particle.colorWeight,
                    g: particle.startColor.g + (particle.targetColor.g - particle.startColor.g) * particle.colorWeight,
                    b: particle.startColor.b + (particle.targetColor.b - particle.startColor.b) * particle.colorWeight,
                };
                particle.targetColor = newColor;
                particle.colorWeight = 0;

                particle.target.x = x;
                particle.target.y = y;
            }
        }

        for (let i = particleIndex; i < particles.length; i++) {
            particles[i].kill(canvas.width, canvas.height);
        }
    };

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const particles = particlesRef.current;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            particle.move();
            particle.draw(ctx, drawAsPoints);

            if (particle.isKilled) {
                if (
                    particle.pos.x < 0 ||
                    particle.pos.x > canvas.width ||
                    particle.pos.y < 0 ||
                    particle.pos.y > canvas.height
                ) {
                    particles.splice(i, 1);
                }
            }
        }

        if (mouseRef.current.isPressed && mouseRef.current.isRightClick) {
            particles.forEach((particle) => {
                const distance = Math.sqrt(
                    Math.pow(particle.pos.x - mouseRef.current.x, 2) + Math.pow(particle.pos.y - mouseRef.current.y, 2)
                );
                if (distance < 50) {
                    particle.kill(canvas.width, canvas.height);
                }
            });
        }

        frameCountRef.current++;
        if (frameCountRef.current % 240 === 0) {
            wordIndexRef.current = (wordIndexRef.current + 1) % words.length;
            nextWord(words[wordIndexRef.current], canvas, dimensions.fontSize);
        }

        animationRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        resizeCanvas();
        animate();

        window.addEventListener('resize', resizeCanvas);

        const handleMouseDown = (e) => {
            mouseRef.current.isPressed = true;
            mouseRef.current.isRightClick = e.button === 2;
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = e.clientX - rect.left;
            mouseRef.current.y = e.clientY - rect.top;
        };

        const handleMouseUp = () => {
            mouseRef.current.isPressed = false;
            mouseRef.current.isRightClick = false;
        };

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = e.clientX - rect.left;
            mouseRef.current.y = e.clientY - rect.top;
        };

        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('contextmenu', handleContextMenu);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            window.removeEventListener('resize', resizeCanvas);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [words, dimensions.fontSize]);

    return (
        <div ref={containerRef} className={className}>
            <canvas ref={canvasRef} className="w-full h-auto" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
    );
}
