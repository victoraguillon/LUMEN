const LandingView = {
    _particles: [],
    _animFrame: null,
    _observer: null,
    _resizeHandler: null,
    _countUpRaf: null,
    _dataTimer: null,

    init: function() {
        this._initHero();
        this._tickCounters();
        this._scheduleDataRefresh();
    },

    _initHero: function() {
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

        // La portada se pinta visible desde el primer frame (mejora LCP).
        hero.classList.add('reveal-visible');
    },

    // Cuenta animada de las cifras (respetando prefers-reduced-motion)
    _tickCounters: function() {
        const els = document.querySelectorAll('.stat[data-count]');
        if (!els.length) return;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const run = () => {
            els.forEach(el => {
                const target = parseFloat(el.dataset.count);
                if (isNaN(target)) { el.firstChild.textContent = '0'; el.classList.add('stat-done'); return; }
                const duration = 1100;
                const start = performance.now();
                const step = (now) => {
                    const p = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - p, 3);
                    el.firstChild.textContent = Math.round(target * eased).toString();
                    if (p < 1) this._countUpRaf = requestAnimationFrame(step);
                    else el.classList.add('stat-done');
                };
                this._countUpRaf = requestAnimationFrame(step);
            });
        };
        if (reduce) {
            els.forEach(el => {
                const target = parseFloat(el.dataset.count);
                el.firstChild.textContent = (isNaN(target) ? 0 : Math.round(target)).toString();
                el.classList.add('stat-done');
            });
            return;
        }
        const band = document.getElementById('stats-band');
        const startWhenVisible = () => {
            const rect = (band || els[0]).getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) { run(); return true; }
            return false;
        };
        if (startWhenVisible()) return;
        let fired = false;
        const obs = new IntersectionObserver((entries) => {
            if (!fired && entries.some(e => e.isIntersecting)) {
                fired = true;
                run();
                obs.disconnect();
            }
        }, { threshold: 0.25 });
        obs.observe(band || els[0]);
        this._counterObserver = obs;
    },

    // Si los datos aún cargan, re-renderiza la vista una vez que lleguen
    _scheduleDataRefresh: function() {
        const tryRefresh = () => {
            const stillLoading = (typeof LumenData !== 'undefined' && LumenData.state && LumenData.state.eventos === 'loading');
            if (stillLoading) {
                if (this._dataTimer) clearTimeout(this._dataTimer);
                this._dataTimer = setTimeout(tryRefresh, 400);
                return;
            }
            if (this._dataTimer) { clearTimeout(this._dataTimer); this._dataTimer = null; }
            if (document.getElementById('landing-dynamic')) {
                document.getElementById('landing-dynamic').innerHTML = this._renderDynamic();
                if (typeof LumenRouter !== 'undefined' && LumenRouter.initScrollReveal) LumenRouter.initScrollReveal();
                this._tickCounters();
            }
        };
        tryRefresh();
    },

    _counts: function() {
        const members = (typeof LumenData !== 'undefined' && LumenData.users)
            ? Object.values(LumenData.users).filter(u => u && (u.role === 'miembro' || u.role === 'admin') && u.status === 'approved').length : 0;
        const activities = (typeof LumenData !== 'undefined' && LumenData.eventos)
            ? (LumenData.eventos || []).length : 0;
        return { members, activities };
    },

    _renderDynamic: function() {
        const c = this._counts();
        // Próximo evento en vivo
        let eventCard = '';
        const upcoming = (typeof LumenData !== 'undefined' && LumenData.eventos)
            ? LumenData.upcomingEventos(3) : [];
        if (upcoming.length) {
            const ev = upcoming[0];
            let dateStr = '';
            if (ev.tipo === 'recurrente') {
                const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
                dateStr = (ev.dia && days[parseInt(ev.dia)]) ? days[parseInt(ev.dia)] : 'Cada semana';
            } else if (ev.fecha_inicio) {
                dateStr = LumenUI.formatDate(ev.fecha_inicio).split(' ')[0];
            } else {
                dateStr = 'Pronto';
            }
            const tipoLabel = (ev.tipo || '').toLowerCase() === 'recurrente' ? 'Reunión semanal' : 'Actividad';
            const total = upcoming.length;
            eventCard = `
                <div class="event-teaser-card reveal">
                    <div class="event-teaser-icon">${typeof LumenIcons !== 'undefined' ? LumenIcons.calendar : ''}</div>
                    <div class="event-teaser-body">
                        <span class="event-teaser-label">${typeof LumenIcons !== 'undefined' ? LumenIcons.sparkles : ''} Próximo encuentro ${total > 1 ? '· ' + total + ' por venir' : ''}</span>
                        <h3 class="event-teaser-title">${LumenUI.escapeHTML(ev.titulo || 'Actividad')}</h3>
                        <p class="event-teaser-date">${LumenUI.escapeHTML(tipoLabel)} · ${LumenUI.escapeHTML(dateStr)}</p>
                        <button class="btn btn-outline btn-sm" onclick="LumenRouter.navigateTo('actividades')">Ver todas las actividades</button>
                    </div>
                </div>`;
        } else {
            eventCard = `
                <div class="event-teaser-card event-teaser-empty reveal">
                    <div class="event-teaser-icon">${typeof LumenIcons !== 'undefined' ? LumenIcons.clock : ''}</div>
                    <div class="event-teaser-body">
                        <span class="event-teaser-label">${typeof LumenIcons !== 'undefined' ? LumenIcons.sparkles : ''} Próximos encuentros</span>
                        <h3 class="event-teaser-title">Aún no hay actividades publicadas</h3>
                        <p class="event-teaser-date">Muy pronto publicaremos reuniones, retiros y misiones. Quédate atento a los avisos.</p>
                    </div>
                </div>`;
        }

        // Banda de cifras (dinámica)
        const missions = (typeof LumenData !== 'undefined' && LumenData.eventos)
            ? (LumenData.eventos || []).filter(ev => /retiro|misi|convivencia|encuentro/i.test((ev.titulo || '') + (ev.categoria || ''))).length : 0;
        const stats = [
            { label: 'Miembros en comunidad', count: c.members, icon: LumenIcons.users || 'usuarios', accent: true },
            { label: 'Actividades publicadas', count: c.activities, icon: LumenIcons.calendar || 'actividades' },
            { label: 'Retiros, misiones y más', count: missions, icon: LumenIcons.flame || 'misiones' },
        ];

        return `

            <section class="event-teaser reveal" id="event-teaser">
                <div class="section-heading">
                    <span class="section-kicker">Vívelo</span>
                    <h2 class="section-title">No te pierdas el próximo encuentro</h2>
                </div>
                ${eventCard}
            </section>
        `;
    },

    _modules: function() {
        const M = (typeof LumenIcons !== 'undefined') ? LumenIcons : {};
        return [
            { icon: M.compass || '', name: 'Devocional', desc: 'Pasaje, santo y reflexión de cada día.', more: 'Un espacio breve para comenzar el día con la Palabra, conocer al santo que la Iglesia celebra y llevarte una idea concreta para vivir.', view: 'devocional' },
            { icon: M.rosario || '', name: 'Rosario', desc: 'Reza el rosario paso a paso guiado.', more: 'Incluye los misterios gozosos, dolorosos, gloriosos y luminosos, el Rosario Eucarístico y cuatro coronillas: Divina Misericordia, San Miguel, Espíritu Santo y San José.', view: 'rosario' },
            { icon: M.novenas || '', name: 'Novenas', desc: 'Novenas de poder y tradición.', more: 'Nueve días de oración para preparar una fiesta, pedir una gracia o confiar una intención. Puedes marcar cada día y retomar donde lo dejaste.', view: 'novenas' },
            { icon: M.examen || '', name: 'Examen de Conciencia', desc: 'Una pausa diaria para mirar el corazón.', more: 'Una guía serena para revisar la jornada, reconocer la acción de Dios y prepararte para la confesión, sin juicios ni prisas.', view: 'examen' },
            { icon: M.book || '', name: 'Formación', desc: 'Catecismo, apologética y crecimiento.', more: 'Módulos con puntos clave, referencias y un lector cómodo para estudiar la fe a tu ritmo. Tu progreso queda guardado en este dispositivo.', view: 'formacion' },
            { icon: M.oraciones || '', name: 'Oraciones', desc: 'La oración de cada momento del año.', more: 'Oraciones tradicionales y marianas, con búsqueda, audio, favoritos y enlaces directos para volver a la que necesitas.', view: 'oraciones' },
            { icon: M.compass || '', name: 'Planes litúrgicos', desc: 'Adviento, Navidad, Cuaresma y Pascua.', more: 'Cuatro recorridos generales, paso a paso, para vivir cada tiempo litúrgico con la Palabra, la oración y un gesto concreto. Sin fechas fijas: empieza cuando lo necesites.', view: 'planes' },
            { icon: M.download || '', name: 'Descargas', desc: 'Lleva LUMEN contigo sin conexión.', more: 'Descarga formación, oración, devocional o planes completos. Las descargas son públicas y puedes quitarlas en cualquier momento.', view: 'offline' },
        ];
    },

    _persona: function() {
        if (typeof LumenAuth !== 'undefined' && LumenAuth.currentUser) {
            return {
                primary: { label: 'Ir a mi Inicio', onclick: "LumenRouter.navigateTo('inicio')", cls: 'btn btn-primary' },
                secondary: { label: 'Ver actividades', onclick: "LumenRouter.navigateTo('actividades')", cls: 'btn btn-outline' },
                logged: true,
            };
        }
        return {
            primary: { label: 'Únete a la Comunidad', onclick: "LumenUI.openModal('register-modal')", cls: 'btn btn-primary' },
            secondary: { label: 'Conócenos', onclick: "LumenRouter.navigateTo('nosotros')", cls: 'btn btn-outline' },
            logged: false,
        };
    },

    render: function() {
        const persona = this._persona();
        const mods = this._modules();
        return `
            <div class="view">
                <div class="hero reveal-visible" id="landing-hero">
                    <canvas id="hero-particles" aria-hidden="true"></canvas>
                    <h1 class="hero-title">LUMEN</h1>
                    <p class="hero-subtitle">Más que una página: una comunidad en salida que cree, vive y anuncia el Evangelio en la Parroquia Nuestra Señora de Lourdes, Maracaibo.</p>
                    <div class="hero-actions">
                        <button class="${persona.primary.cls}" onclick="${persona.primary.onclick}">${persona.primary.label}</button>
                        <button class="${persona.secondary.cls}" onclick="${persona.secondary.onclick}">${persona.secondary.label}</button>
                    </div>
                    <button class="scroll-indicator" aria-label="Desplazar hacia abajo" onclick="window.scrollTo({ top: window.innerHeight - 100, behavior: 'smooth' })">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="30" height="30" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                    </button>
                </div>

                <div class="platform-intro reveal">
                    <img src="assets/grupo_lumen.jpg" width="960" height="621" loading="lazy" decoding="async" alt="Jóvenes de Juvemar reunidos en la Parroquia Nuestra Señora de Lourdes" onerror="this.src='https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80'">
                    <div class="platform-intro-text">
                        <h2>¡Bienvenido querido hermano!</h2>
                        <p>LUMEN nace de una necesidad concreta de nuestra <strong>Parroquia Ntra. Sra. de Lourdes</strong>: <strong>poner la tecnología al servicio del Evangelio</strong>. Aquí encontrarás todo lo que necesitas saber sobre nuestro grupo de apostolado <strong>Juvemar</strong> y nuestra hermandad <strong>"El Llamado de Samuel"</strong>: formación, oración, actividades y una comunidad que camina junta.</p>
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
                        <div class="step-card reveal reveal-delay-3">
                            <div class="step-number">4</div>
                            <h3>Comparte e Invita</h3>
                            <p>Invita a otros jóvenes a unirse, comparte los recursos y haz crecer la comunidad.</p>
                        </div>
                    </div>
                </div>

                <div id="landing-dynamic">
                    ${this._renderDynamic()}
                </div>

                <div class="verse-card reveal">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path></svg>
                    <p>"Somos instrumentos de Jesús y debemos irradiar su luz para llegar a todos."</p>
                    <cite>Papa Francisco</cite>
                </div>

                <div class="how-it-works reveal" style="margin-top: 60px;">
                    <div class="section-heading">
                        <h2 class="section-title">Dentro de LUMEN</h2>
                        <p class="section-sub">Todo lo que necesitas para crecer en la fe, unido en un solo lugar.</p>
                    </div>
                    <div class="modules-grid">
                        ${mods.map((m, i) => `
                            <div class="module-card module-card-expandable reveal ${i > 3 ? 'reveal-delay-1' : ''}">
                                <a href="${LumenRouter.hrefFor([m.view])}" class="module-link" data-view="${m.view}">
                                    <span class="module-icon">${m.icon}</span>
                                    <span class="module-info"><h3>${m.name}</h3></span>
                                    <span class="module-arrow" aria-hidden="true">→</span>
                                </a>
                                <div class="module-expand">${LumenUI.expandableHTML(m.desc, m.more)}</div>
                            </div>`).join('')}
                    </div>
                </div>

                <div class="how-it-works reveal">
                    <div class="section-heading">
                        <span class="section-kicker">Nuestros pilares</span>
                        <h2 class="section-title">Fe · Hermandad · Misión · Servicio</h2>
                    </div>
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
                        <div class="step-card reveal reveal-delay-3">
                            <div class="step-number"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"></path></svg></div>
                            <h3>Servicio</h3>
                            <p>Amar al prójimo con obras concretas: cada entrega es el fruto visible de la fe, la hermandad y la misión.</p>
                        </div>
                    </div>
                </div>

                <section class="pwa-compact reveal" aria-labelledby="pwa-compact-title">
                    <div class="pwa-compact-copy">
                        <span class="section-kicker">En tu bolsillo</span>
                        <h2 id="pwa-compact-title">Lleva LUMEN contigo</h2>
                        <p>Instálala en tu pantalla de inicio para abrirla más rápido y recibir los avisos de la comunidad.</p>
                    </div>
                    <button class="btn btn-outline" type="button" onclick="LumenInstall.mostrarGuia()">Cómo instalar</button>
                </section>

                <section class="landing-cta reveal">
                    ${persona.logged
                        ? `<h2>Tu comunidad te espera</h2>
                           <p>Forma parte de una Iglesia viva, en salida y en misión.</p>
                           <button class="btn btn-outline btn-lg" onclick="LumenRouter.navigateTo('inicio')">Ir a mi Inicio</button>`
                        : `<h2>Sé luz en el mundo</h2>
                           <p>Únete a LUMEN. Tu camino en la fe comienza aquí.</p>
                           <button class="btn btn-outline btn-lg" onclick="LumenUI.openModal('register-modal')">Únete a la Comunidad</button>`}
                </section>
            </div>
        `;
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
        if (this._countUpRaf) { cancelAnimationFrame(this._countUpRaf); this._countUpRaf = null; }
        if (this._dataTimer) { clearTimeout(this._dataTimer); this._dataTimer = null; }
        if (this._counterObserver) { this._counterObserver.disconnect(); this._counterObserver = null; }
        if (this._observer) { this._observer.disconnect(); this._observer = null; }
        if (this._resizeHandler) { window.removeEventListener('resize', this._resizeHandler); this._resizeHandler = null; }
        this._particles = [];
    }
};
