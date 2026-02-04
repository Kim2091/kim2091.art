// Neural Network Background Animation
class NeuralNetwork {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.connections = [];
        this.mouse = { x: null, y: null };
        this.animationId = null;
        
        this.resize();
        this.init();
        this.bindEvents();
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }
    
    init() {
        const particleCount = Math.min(Math.floor(window.innerWidth / 30), 100);
        this.particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                color: Math.random() > 0.5 ? '#10b981' : '#3b82f6'
            });
        }
    }
    
    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.init();
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }
    
    animate() {
        this.ctx.fillStyle = 'rgba(17, 24, 39, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach((particle, i) => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Boundary check
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            // Mouse interaction
            if (this.mouse.x !== null) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    particle.vx += dx * 0.0001;
                    particle.vy += dy * 0.0001;
                }
            }
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
            
            // Draw connections
            this.particles.slice(i + 1).forEach(other => {
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 150) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(other.x, other.y);
                    const alpha = (1 - dist / 150) * 0.3;
                    this.ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            });
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Initialize neural network
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('neuralCanvas');
    if (canvas) {
        new NeuralNetwork(canvas);
    }
    
    // Initialize feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
});

// Slider Management
const sliders = {
    ultrasharp: { current: 0, total: 4 },
    animesharp: { current: 0, total: 4 },
    dreamforge: { current: 0, total: 4 }
};

function updateSlider(model) {
    const slider = document.getElementById(`slider-${model}`);
    const slides = slider.querySelectorAll('.slider-slide');
    const dots = document.getElementById(`dots-${model}`).querySelectorAll('.slider-dot');
    const { current, total } = sliders[model];
    
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === current);
    });
    
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
        dot.style.opacity = i ===