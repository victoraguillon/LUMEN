const LandingView = {
    _particles: [],
    _animFrame: null,
    _observer: null,
    _resizeHandler: null,
    _typewriterTimeout: null,

    init: function() {
        const canvas = document.getElementById('hero-particles');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const hero = canvas.parentElement;
        let w, h;

        const resize = () => {
            w = canvas.width = hero.offsetWidth;
            h = canvas.height = hero.offsetHeight;
        };
        resize();
        this._resizeHandler = resize;
        window.addEventListener('resize', resize);

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReduced) {
            this._initParticles(ctx, w, h);
        }

        // Typewriter
        const subtitle = hero.querySelector('.hero-subtitle');
        if (subtitle) {
            if (prefersReduced) {
                subtitle.textContent = subtitle.dataset.text;
            } else {
                const text = subtitle.dataset.text;
                subtitle.textContent = '';
                let i = 0;
                const type = () => {
                    if (i < text.length) {
                        subtitle.textContent += text[i++];
                        this._typewriterTimeout = setTimeout(type, 35);
                    }
                };
                this._typewriterTimeout = setTimeout(type, 800);
            }
        }

        // Scroll reveal fade in
        hero.classList.add('reveal-visible');
        if (prefersReduced) {
            hero.style.opacity = '1';
        }
    },

    _initParticles: function(ctx, w, h) {
        const PARTICLE_COUNT = Math.min(Math.floor((w * h) / 18000), 50);
        this._particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            this._particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 1.8 + 0.4,
                dx: (Math.random() - 0.5) * 0.3,
                dy: (Math.random() - 0.5) * 0.15,
                alpha: Math.random() * 0.5 + 0.2
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, w, h);
            this._particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                ctx.fill();
                p.x += p.dx;
                p.y += p.dy;
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;
            });
            // Lines between close particles
            for (let i = 0; i < this._particles.length; i++) {
                for (let j = i + 1; j < this._particles.length; j++) {
                    const dx = this._particles[i].x - this._particles[j].x;
                    const dy = this._particles[i].y - this._particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(this._particles[i].x, this._particles[i].y);
                        ctx.lineTo(this._particles[j].x, this._particles[j].y);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 * (1 - dist / 120)})`;
                        ctx.stroke();
                    }
                }
            }
            this._animFrame = requestAnimationFrame(animate);
        };
        animate();
    },

    destroy: function() {
        if (this._animFrame) { cancelAnimationFrame(this._animFrame); this._animFrame = null; }
        if (this._observer) { this._observer.disconnect(); this._observer = null; }
        if (this._resizeHandler) { window.removeEventListener('resize', this._resizeHandler); this._resizeHandler = null; }
        if (this._typewriterTimeout) { clearTimeout(this._typewriterTimeout); this._typewriterTimeout = null; }
        this._particles = [];
    },

    render: function() {
        return `
            <div class="view">
                <div class="hero">
                    <canvas id="hero-particles"></canvas>
                    <h1 class="hero-title">LUMEN</h1>
                    <p class="hero-subtitle" data-text="Más que una página, una comunidad en salida que cree, vive y anuncia el evangelio."></p>
                    <div class="hero-actions">
                        <button class="btn btn-primary" onclick="LumenUI.openModal('register-modal')">Únete a la Comunidad</button>
                        <button class="btn btn-outline" onclick="LumenRouter.navigateTo('nosotros')">Conócenos</button>
                    </div>
                    <button class="scroll-indicator" aria-label="Desplazar hacia abajo" onclick="window.scrollTo({ top: window.innerHeight - 100, behavior: 'smooth' })">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="30" height="30" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                    </button>
                </div>

                <div class="platform-intro reveal">
                    <img src="assets/grupo_lumen.jpg" alt="Jóvenes católicos" onerror="this.src='https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80'">
                    <div class="platform-intro-text">
                        <h2>Bienvenido a la Pastoral Juvenil Digital</h2>
                        <p>Lumen es una página que responde a una necesidad particular dentro de nuestra Parroquia Ntra. Sra. de Lourdes: <strong>Utilizar la tecnología a beneficio del servicio</strong>. Aquí podrás acceder a todo lo que necesitas saber sobre nuestro amado grupo de apostolado Juvemar y de nuestra querida hermandad de "El Llamado de Samuel". </p>
                    </div>
                </div>
                
                <div class="how-it-works reveal">
                    <h2>Cómo funciona LUMEN</h2>
                    <div class="steps-grid">
                        <div class="step-card reveal">
                            <div class="step-number">1</div>
                            <h3>Regístrate</h3>
                            <p>Crea tu cuenta con tus datos y experiencias. El coordinador aprobará tu ingreso a la pastoral.</p>
                        </div>
                        <div class="step-card reveal reveal-delay-1">
                            <div class="step-number">2</div>
                            <h3>Conéctate</h3>
                            <p>Inscríbete a reuniones, retiros y misiones. Accede a recursos de formación y oración exclusivos.</p>
                        </div>
                        <div class="step-card reveal reveal-delay-2">
                            <div class="step-number">3</div>
                            <h3>Crece y Anuncia</h3>
                            <p>Recibe notificaciones de actividades, lleva control de tu asistencia y sé luz en el mundo.</p>
                        </div>
                    </div>
                </div>

                <div class="verse-card reveal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path></svg>
                    <p>"Somos instrumentos de Jesús y debemos irradiar su luz para llegar a todos."</p>
                    <cite>Papa Francisco</cite>
                </div>

                <div class="how-it-works reveal" style="margin-top: 60px;">
                    <h2>Nuestros Pilares</h2>
                    <div class="steps-grid">
                        <div class="step-card reveal">
                            <div class="step-number"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M12 2v20M2 12h20"></path></svg></div>
                            <h3>Fe</h3>
                            <p>Una convicción arraigada en el encuentro personal con Jesucristo, alimentada por la oración y los sacramentos.</p>
                        </div>
                        <div class="step-card reveal reveal-delay-1">
                            <div class="step-number"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>
                            <h3>Hermandad</h3>
                            <p>La fraternidad como estilo de vida. Acompañados de la Virgen María, caminamos juntos como familia.</p>
                        </div>
                        <div class="step-card reveal reveal-delay-2">
                            <div class="step-number"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg></div>
                            <h3>Misión</h3>
                            <p>Ser luz para el mundo. Llevar la alegría del Evangelio a todos los rincones con nuestras misiones.</p>
                        </div>
                    </div>
                </div>

                <div class="pwa-tutorial reveal">
                    <h2 style="text-align: center; color: var(--texto-oscuro); margin-bottom: 15px; font-family: 'Sora', sans-serif;">Instala LUMEN en tu Celular</h2>
                    <p style="text-align: center; color: var(--texto-gris);">Accede más rápido y recibe notificaciones instalando la app en tu pantalla de inicio.</p>
                    <div class="pwa-steps">
                        <div class="pwa-step">
                            <h4>Para Android (Chrome)</h4>
                            <ol>
                                <li>Abre LUMEN en Google Chrome.</li>
                                <li>Toca el menú de 3 puntos (arriba a la derecha).</li>
                                <li>Selecciona "Agregar a pantalla de inicio".</li>
                                <li>Toca "Instalar" o "Agregar". ¡Listo!</li>
                            </ol>
                        </div>
                        <div class="pwa-step">
                            <h4>Para iPhone (Safari)</h4>
                            <ol>
                                <li>Abre LUMEN en el navegador Safari.</li>
                                <li>Toca el botón "Compartir" (cuadro con flecha hacia arriba).</li>
                                <li>Desplázate y selecciona "Añadir a inicio".</li>
                                <li>Toca "Añadir" en la esquina superior derecha.</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};