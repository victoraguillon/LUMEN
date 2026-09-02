const DevocionalView = {
    _activeTab: 'historia',
    _bioExpanded: false,
    _calendarMonth: null,
    _calendarYear: null,

    render: function() {
        const todayDate = new Date();
        const dayOfMonth = todayDate.getDate();
        const month = todayDate.getMonth() + 1;
        const year = todayDate.getFullYear();
        this._calendarMonth = todayDate.getMonth();
        this._calendarYear = year;

        const pasaje = DEVOCIONAL_DATA.pasajes_dia[(dayOfMonth - 1) % DEVOCIONAL_DATA.pasajes_dia.length];
        const mesData = DEVOCIONAL_DATA.meses[month];
        const dayKey = `${String(month).padStart(2, '0')}-${String(dayOfMonth).padStart(2, '0')}`;
        const saint = (typeof SANTORAL !== 'undefined' && SANTORAL[dayKey]) ? SANTORAL[dayKey] : { n: "Celebración del día", b: "Hoy la Iglesia nos invita a vivir en santidad y alegría, aunque no haya una festividad específica en nuestro calendario." };
        const saintYT = saint.youtube || 'https://www.youtube.com/results?search_query=santo+' + encodeURIComponent(saint.n);

        const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        const todayFormatted = new Intl.DateTimeFormat('es-VE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(todayDate);

        return `
            <div class="view">
                <!-- PASAJE DEL DÍA — HERO -->
                <article class="devocional-hero reveal reveal-delay-1" aria-label="Alimento de Hoy">
                    <div class="hero-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path></svg>
                        Alimento de Hoy
                    </div>
                    <p class="hero-quote">\u201C${pasaje.text}\u201D</p>
                    <cite class="hero-cite">${pasaje.cite}</cite>
                    <div class="hero-reflexion">
                        <h4>Reflexión</h4>
                        <p class="hero-reflexion-text" id="reflexion-text">${pasaje.reflection}</p>
                    </div>
                    <div class="hero-actions">
                        <button class="btn" onclick="DevocionalView.copyVerse()" aria-label="Copiar pasaje y reflexión">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            Copiar
                        </button>
                        <button class="btn" onclick="DevocionalView.shareVerse()" aria-label="Compartir pasaje y reflexión">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                            Compartir
                        </button>
                    </div>
                </article>

                <!-- 2-COL: SANTO + DEVOCION DEL MES -->
                <div class="devocional-grid">
                    <!-- SANTO DEL DÍA -->
                    <section class="santo-card reveal reveal-delay-2" aria-label="Santo del día">
                        <div class="santo-banner">
                            <img src="assets/santos.jpg" alt="Banner de los santos" class="santo-banner-img" loading="lazy" width="1287" height="816">
                            <div class="santo-banner-overlay">
                                <h3 class="santo-banner-title">${saint.n}</h3>
                                <div class="santo-date">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    ${todayFormatted}
                                </div>
                            </div>
                        </div>
                        <div class="santo-card-body">
                            <p class="santo-bio" id="santo-bio-text">${saint.b}</p>
                            <button class="santo-expand" id="santo-expand-btn" onclick="DevocionalView.toggleBio()" aria-expanded="false">Leer más</button>
                        </div>
                        <div class="santo-card-actions">
                            <a href="${saintYT}" target="_blank" rel="noopener noreferrer" class="btn-yt" aria-label="Ver video de ${saint.n} en YouTube">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                Ver en YouTube
                            </a>
                        </div>
                    </section>

                    <!-- DEVOCION DEL MES — TABS -->
                    <section class="santo-card reveal reveal-delay-3" aria-label="Devoción del mes">
                        <div style="padding: 24px 24px 0;">
                            <h3 style="color: var(--celeste-oscuro); margin-bottom: 4px; font-size: 18px;">${mesData.devocion}</h3>
                            <p style="font-size: 12px; color: var(--texto-gris); margin-bottom: 16px;">${monthNames[month - 1]} ${year}</p>
                        </div>
                        <div class="devocional-tabs" role="tablist">
                            <button class="tab-btn active" role="tab" aria-selected="true" data-tab="historia" onclick="DevocionalView.switchTab('historia')">Historia</button>
                            <button class="tab-btn" role="tab" aria-selected="false" data-tab="oracion" onclick="DevocionalView.switchTab('oracion')">Oración</button>
                            <button class="tab-btn" role="tab" aria-selected="false" data-tab="reto" onclick="DevocionalView.switchTab('reto')">Reto</button>
                        </div>
                        <div class="devocional-tab-content" id="devocional-tab-content" style="padding: 0 24px 24px;">
                            <div data-tab="historia" class="devocional-tab-pane">
                                <p>${mesData.historia}</p>
                            </div>
                            <div data-tab="oracion" class="devocional-tab-pane" style="display:none;">
                                <p class="prayer-text">${mesData.oracion}</p>
                            </div>
                            <div data-tab="reto" class="devocional-tab-pane" style="display:none;">
                                <div class="reto-box">
                                    <h4>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                        Reto de Oración
                                    </h4>
                                    <p>${mesData.reto}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- REZA CON LUMEN — ACCESOS DE ORACIÓN -->
                <section class="ora-section reveal reveal-delay-4" aria-label="Reza con LUMEN">
                    <div class="ora-header">
                        <h3>Reza con LUMEN</h3>
                        <p>Elige cómo orar hoy; cada camino te acerca más a Dios.</p>
                    </div>
                    <div class="ora-grid">
                        <a href="#/oraciones" class="ora-card" style="--tone:#3d8bfd;" onclick="LumenRouter.navigateTo('oraciones')" aria-label="Ir a Oraciones">
                            <span class="ora-icon"><img src="assets/oración.jpg" alt="Oraciones" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;"></span>
                            <span class="ora-info">
                                <strong>Oraciones</strong>
                                <small>con texto, audio y recordatorios</small>
                            </span>
                            <span class="ora-arrow">${Icons.chevron_right || LumenIcons.chevron_right}</span>
                        </a>
                        <a href="#/rosario" class="ora-card" style="--tone:#0e7490;" onclick="LumenRouter.navigateTo('rosario')" aria-label="Ir a Rosario">
                            <span class="ora-icon"><img src="assets/gloriosos.jpg" alt="Rosario" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;"></span>
                            <span class="ora-info">
                                <strong>Rosario</strong>
                                <small>misterios y guía paso a paso</small>
                            </span>
                            <span class="ora-arrow">${Icons.chevron_right || LumenIcons.chevron_right}</span>
                        </a>
                        <a href="#/novenas" class="ora-card" style="--tone:#d97706;" onclick="LumenRouter.navigateTo('novenas')" aria-label="Ir a Novenas">
                            <span class="ora-icon"><img src="assets/divinamisericordia.jpeg" alt="Novenas" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;"></span>
                            <span class="ora-info">
                                <strong>Novenas</strong>
                                <small>nueve días de espera en oración</small>
                            </span>
                            <span class="ora-arrow">${Icons.chevron_right || LumenIcons.chevron_right}</span>
                        </a>
                        <a href="#/examen" class="ora-card" style="--tone:#7c3aed;" onclick="LumenRouter.navigateTo('examen')" aria-label="Ir a Examen de Conciencia">
                            <span class="ora-icon"><img src="assets/devoción.jpg" alt="Examen de Conciencia" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;"></span>
                            <span class="ora-info">
                                <strong>Examen de Conciencia</strong>
                                <small>una pausa para mirar tu día</small>
                            </span>
                            <span class="ora-arrow">${Icons.chevron_right || LumenIcons.chevron_right}</span>
                        </a>
                    </div>
                </section>

                <!-- ORACION COMPACTA -->
                <div class="prayer-compact reveal reveal-delay-5">
                    <div class="prayer-compact-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                    </div>
                    <div class="prayer-compact-text">
                        <h4>Oración del Mes</h4>
                        <p id="prayer-preview-text">${mesData.oracion}</p>
                    </div>
                    <button class="btn-pray" onclick="DevocionalView.openPrayer()" aria-label="Rezar oración del mes">Rezar ahora</button>
                </div>

                <!-- CALENDARIO SANTORIAL -->
                <section class="saint-calendar reveal reveal-delay-6" aria-label="Calendario del santoral">
                    <div class="saint-calendar-header">
                        <h4 id="cal-month-label">${monthNames[this._calendarMonth]} ${this._calendarYear}</h4>
                        <div style="display:flex; gap:6px;">
                            <button class="btn" style="padding:6px 10px; font-size:12px;" onclick="DevocionalView.prevMonth()" aria-label="Mes anterior">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <button class="btn" style="padding:6px 10px; font-size:12px;" onclick="DevocionalView.nextMonth()" aria-label="Mes siguiente">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        </div>
                    </div>
                    <div class="saint-calendar-grid" id="saint-calendar-grid">
                        ${this._renderCalendarGrid(this._calendarMonth, this._calendarYear, todayDate)}
                    </div>
                </section>
            </div>
        `;
    },

    _renderCalendarGrid: function(month, year, today) {
        const dayLabels = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const startOffset = (firstDay + 6) % 7;
        const todayDate = today.getDate();
        const todayMonth = today.getMonth();
        const todayYear = today.getFullYear();

        let html = dayLabels.map(d => `<div class="cal-day-label">${d}</div>`).join('');
        for (let i = 0; i < startOffset; i++) {
            html += '<div class="cal-day empty"></div>';
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const mm = String(month + 1).padStart(2, '0');
            const dd = String(d).padStart(2, '0');
            const key = `${mm}-${dd}`;
            const hasSaint = typeof SANTORAL !== 'undefined' && SANTORAL[key];
            const isToday = d === todayDate && month === todayMonth && year === todayYear;
            const classes = ['cal-day'];
            if (isToday) classes.push('today');
            if (hasSaint) classes.push('has-saint');
            html += `<button class="${classes.join(' ')}" onclick="DevocionalView.viewDaySaint('${key}')" aria-label="Ver santo del ${d} de ${new Date(year, month, d).toLocaleDateString('es-VE', {month:'long'})}">${d}</button>`;
        }
        return html;
    },

    init: function() {
        LumenRouter.initScrollReveal();
    },

    switchTab: function(tab) {
        this._activeTab = tab;
        document.querySelectorAll('.devocional-tabs .tab-btn').forEach(btn => {
            const isActive = btn.dataset.tab === tab;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive);
        });
        document.querySelectorAll('.devocional-tab-pane').forEach(pane => {
            pane.style.display = pane.dataset.tab === tab ? 'block' : 'none';
        });
    },

    toggleBio: function() {
        this._bioExpanded = !this._bioExpanded;
        const bio = document.getElementById('santo-bio-text');
        const btn = document.getElementById('santo-expand-btn');
        if (bio) bio.classList.toggle('expanded', this._bioExpanded);
        if (btn) {
            btn.textContent = this._bioExpanded ? 'Leer menos' : 'Leer más';
            btn.setAttribute('aria-expanded', this._bioExpanded);
        }
    },

    _shareText: function() {
        const pasaje = DEVOCIONAL_DATA.pasajes_dia[(new Date().getDate() - 1) % DEVOCIONAL_DATA.pasajes_dia.length];
        return `\u201C${pasaje.text}\u201D\n(${pasaje.cite})\n\n${pasaje.reflection}\n\n(LUMEN.com)`;
    },

    copyVerse: function() {
        const text = this._shareText();
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                LumenUI.showToast('Pasaje y reflexión copiados', 'success');
            });
        } else {
            LumenUI.showToast('No se pudo copiar', 'error');
        }
    },

    shareVerse: function() {
        const text = this._shareText();
        if (navigator.share) {
            navigator.share({ title: 'Alimento de Hoy (LUMEN)', text: text }).catch(() => {});
        } else {
            this.copyVerse();
        }
    },

    openPrayer: function() {
        const month = new Date().getMonth() + 1;
        const mesData = DEVOCIONAL_DATA.meses[month];
        LumenUI.openModal('confirm-modal');
        const title = document.getElementById('confirm-title');
        const msg = document.getElementById('confirm-message');
        const acceptBtn = document.getElementById('confirm-accept-btn');
        if (title) title.textContent = 'Oración del Mes';
        if (msg) {
            msg.innerHTML = `<div class="prayer-expanded">${mesData.oracion}</div>`;
            msg.style.textAlign = 'center';
        }
        if (acceptBtn) {
            acceptBtn.textContent = 'Cerrar';
            acceptBtn.onclick = () => LumenUI.closeModal('confirm-modal');
        }
    },

    prevMonth: function() {
        this._calendarMonth--;
        if (this._calendarMonth < 0) { this._calendarMonth = 11; this._calendarYear--; }
        this._updateCalendar();
    },

    nextMonth: function() {
        this._calendarMonth++;
        if (this._calendarMonth > 11) { this._calendarMonth = 0; this._calendarYear++; }
        this._updateCalendar();
    },

    _updateCalendar: function() {
        const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        const label = document.getElementById('cal-month-label');
        const grid = document.getElementById('saint-calendar-grid');
        if (label) label.textContent = `${monthNames[this._calendarMonth]} ${this._calendarYear}`;
        if (grid) grid.innerHTML = this._renderCalendarGrid(this._calendarMonth, this._calendarYear, new Date());
    },

    viewDaySaint: function(dayKey) {
        if (typeof SANTORAL === 'undefined' || !SANTORAL[dayKey]) {
            LumenUI.showToast('No hay santo registrado para este día', 'error');
            return;
        }
        const saint = SANTORAL[dayKey];
        LumenUI.openModal('confirm-modal');
        const title = document.getElementById('confirm-title');
        const msg = document.getElementById('confirm-message');
        const acceptBtn = document.getElementById('confirm-accept-btn');
        if (title) title.textContent = saint.n;
        if (msg) {
            msg.innerHTML = `<p class="saint-modal-bio">${saint.b}</p>`;
            msg.style.textAlign = 'left';
        }
        if (acceptBtn) {
            acceptBtn.textContent = 'Cerrar';
            acceptBtn.onclick = () => LumenUI.closeModal('confirm-modal');
        }
    }
};
