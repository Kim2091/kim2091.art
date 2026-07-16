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

// Fetch GitHub star counts dynamically
async function updateGitHubStars() {
    const repoElements = document.querySelectorAll('[data-repo]');

    for (const element of repoElements) {
        const repo = element.getAttribute('data-repo');
        try {
            const response = await fetch(`https://api.github.com/repos/${repo}`);
            if (response.ok) {
                const data = await response.json();
                element.textContent = data.stargazers_count.toLocaleString();
            }
        } catch (error) {
            console.log(`Could not fetch stars for ${repo}:`, error);
            // Keep the fallback hardcoded value
        }
    }
}

// Fetch Discord member counts dynamically
async function updateDiscordMembers() {
    const discordElements = document.querySelectorAll('[data-discord-invite]');

    for (const element of discordElements) {
        const inviteCode = element.getAttribute('data-discord-invite');
        try {
            const response = await fetch(`https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`);
            if (response.ok) {
                const data = await response.json();
                const count = data.approximate_member_count;
                let formatted;
                if (count >= 1000) {
                    formatted = (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
                } else {
                    formatted = count.toString();
                }
                element.textContent = formatted + ' members';
            }
        } catch (error) {
            console.log(`Could not fetch Discord members for ${inviteCode}:`, error);
            // Keep the fallback hardcoded value
        }
    }
}

// Mobile menu
function initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('hidden') === false;
        toggle.setAttribute('aria-expanded', String(open));
    });

    // Close after choosing a section
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.add('hidden');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// Lightbox
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');
    const backdrop = document.getElementById('lightbox-backdrop');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    let group = [];
    let index = 0;

    function show(i) {
        index = (i + group.length) % group.length;
        const item = group[index];
        img.src = item.getAttribute('data-full');
        img.alt = item.getAttribute('data-caption') || '';
        caption.textContent = item.getAttribute('data-caption') || '';
        const single = group.length <= 1;
        prevBtn.style.display = single ? 'none' : '';
        nextBtn.style.display = single ? 'none' : '';
    }

    function open(item) {
        const galleryName = item.getAttribute('data-gallery');
        group = Array.from(document.querySelectorAll(`.gallery-item[data-gallery="${galleryName}"][data-full]`));
        show(group.indexOf(item));
        lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    }

    function close() {
        lightbox.classList.add('hidden');
        img.src = '';
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.gallery-item[data-full]').forEach(item => {
        item.addEventListener('click', () => open(item));
    });

    backdrop.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', () => show(index - 1));
    nextBtn.addEventListener('click', () => show(index + 1));

    document.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('hidden')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') show(index - 1);
        if (e.key === 'ArrowRight') show(index + 1);
    });
}

// Scroll reveal
function initScrollReveal() {
    const sections = document.querySelectorAll('.reveal');
    if (!sections.length) return;

    if (!('IntersectionObserver' in window)) {
        sections.forEach(s => s.classList.add('revealed'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(s => observer.observe(s));
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('neuralCanvas');
    if (canvas) {
        new NeuralNetwork(canvas);
    }

    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    initMobileMenu();
    initLightbox();
    initScrollReveal();
    updateGitHubStars();
    updateDiscordMembers();
});
