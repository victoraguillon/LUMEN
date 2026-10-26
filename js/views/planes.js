/* Planes litúrgicos: Adviento, Navidad, Cuaresma y Pascua.
   Son recorridos generales, reutilizables cada año, sin fechas concretas. */
const PlanesView = {
    _id: null,
    _pos: 0,
    _storeKey: 'lumen-planes-progress',

    _plan: function(id) {
        if (typeof PLANES_DATA === 'undefined' || !PLANES_DATA.planes) return null;
        return PLANES_DATA.planes.find(function(p) { return p.id === id; }) || null;
    },
    _read: function() {
        try { return JSON.parse(localStorage.getItem(this._storeKey)) || {}; } catch (e) { return {}; }
    },
    _save: function() {
        if (!this._id) return;
        const store = this._read();
        store[this._id] = this._pos;
        localStorage.setItem(this._storeKey, JSON.stringify(store));
    },
    _saved: function(id) {
        return this._read()[id] || 0;
    },
    _pct: function(pos, total) {
        if (!total) return 0;
        return Math.min(100, Math.round((pos / total) * 100));
    },
    _season: function() {
        return (typeof LumenUI !== 'undefined' && LumenUI.liturgicalInfo) ? LumenUI.liturgicalInfo().seasonId : 'ordinario';
    },
    _currentPlan: function() {
        const season = this._season();
        if (season === 'adviento' || season === 'navidad' || season === 'cuaresma' || season === 'pascua') return this._plan(season);
        return null;
    },

    route: function() {
        return { parts: this._id ? [this._id] : [], query: null };
    },

    applyRoute: function(params) {
        const id = params && params[0];
        if (id && this._plan(id)) {
            this._id = id;
            this._pos = this._saved(id);
            this._remember();
        } else {
            this._id = null;
            this._pos = 0;
        }
    },

    _remember: function() {
        const plan = this._plan(this._id);
        if (!plan || typeof LumenUI === 'undefined' || !LumenUI.setRecent) return;
        LumenUI.setRecent('planes', plan.id, plan.title, ['planes', plan.id]);
    },

    open: function(id) {
        this._id = id;
        this._pos = this._saved(id);
        this._remember();
        LumenRouter.navigateTo('planes', true);
    },
    back: function() {
        this._id = null;
        this._pos = 0;
        LumenRouter.navigateTo('planes', true);
    },
    next: function() {
        const plan = this._plan(this._id);
        if (!plan) return;
        const total = plan.steps.length;
        if (this._pos < total - 1) {
            this._pos++;
            this._save();
            this._rerender();
            return;
        }
        this._pos = total;
        this._save();
        const streak = (typeof LumenUI !== 'undefined' && LumenUI.recordStreak) ? LumenUI.recordStreak() : null;
        const streakMsg = streak && streak.days ? ' Racha: ' + streak.days + (streak.days === 1 ? ' día.' : ' días.') : '';
        if (typeof LumenUI !== 'undefined' && LumenUI.celebrate) {
            LumenUI.celebrate('¡Plan completado!', 'Has recorrido ' + total + ' pasos de ' + plan.shortTitle + '. La gracia no termina aquí: vuelve cuando lo necesites.' + streakMsg);
        }
        LumenRouter.navigateTo('planes', true);
    },
    prev: function() {
        if (this._pos > 0) {
            this._pos--;
            this._save();
            this._rerender();
        }
    },
    restart: function() {
        this._pos = 0;
        this._save();
        LumenRouter.navigateTo('planes', true);
    },

    _rerender: function() {
        if (typeof LumenAudio !== 'undefined' && LumenAudio.stop) LumenAudio.stop();
        const box = document.getElementById('plan-step');
        const plan = this._plan(this._id);
        if (!box || !plan) return;
        const step = plan.steps[this._pos];
        const pct = this._pct(this._pos, plan.steps.length);
        const bar = document.getElementById('plan-bar');
        if (bar) bar.style.width = pct + '%';
        const counter = document.getElementById('plan-counter');
        if (counter) counter.textContent = (this._pos + 1) + ' / ' + plan.steps.length;
        const prev = document.getElementById('plan-prev-btn');
        if (prev) prev.disabled = this._pos === 0;
        const next = document.getElementById('plan-next-btn');
        if (next) next.textContent = this._pos >= plan.steps.length - 1 ? 'Terminar el plan' : 'Siguiente paso →';
        box.innerHTML = this._stepHTML(plan, step, pct);
    },

    _audioText: function(step) {
        return [step.title, step.gospelRef, step.reflection, step.prayer, step.action]
            .filter(Boolean)
            .join('. ')
            .replace(/\.\s*\./g, '.');
    },

    _stepHTML: function(plan, step, pct) {
        const audio = (typeof LumenAudio !== 'undefined' && LumenAudio.supported && LumenAudio.supported())
            ? LumenAudio.buttonHTML(this._audioText(step), 'Escuchar el paso')
            : '';
        return `<div class="plan-step-content">
            <div class="plan-step-meta">
                <span class="plan-week">Semana ${step.week}</span>
                <span class="plan-day">Día ${step.day}</span>
            </div>
            <h2>${LumenUI.escapeHTML(step.title)}</h2>
            ${step.gospelRef ? `<p class="mystery-ref">${LumenUI.escapeHTML(step.gospelRef)}</p>` : ''}
            <div class="reading-surface plan-reflection">${String(step.reflection || '').replace(/\n/g, '<br>')}</div>
            ${step.prayer ? `<div class="plan-prayer"><span class="plan-label">Oración</span><p>${LumenUI.escapeHTML(step.prayer)}</p></div>` : ''}
            ${step.action ? `<div class="plan-action"><span class="plan-label">Paso concreto</span><p>${LumenUI.escapeHTML(step.action)}</p></div>` : ''}
            <div class="plan-audio">${audio}</div>
            <div class="rosario-progress"><i id="plan-bar" style="width:${pct}%"></i></div>
        </div>`;
    },

    _card: function(plan, current) {
        const total = plan.steps.length;
        const pos = this._saved(plan.id);
        const pct = this._pct(pos, total);
        const done = pos >= total;
        return `<button class="formacion-card plan-card reveal${current ? ' today' : ''}" onclick="PlanesView.open('${plan.id}')">
            <span class="fc-icon">${this._icon(plan.season)}</span>
            <span class="fc-body">
                <span class="fc-title">${LumenUI.escapeHTML(plan.title)}</span>
                <span class="fc-desc">${LumenUI.escapeHTML(plan.description || '')}</span>
                <span class="fc-progress"><i style="width:${pct}%"></i></span>
                <span class="fc-meta">${total} pasos${current ? ' · Ahora' : ''}${done ? ' · Completado' : (pct ? ' · ' + pct + '%' : '')}</span>
            </span>
        </button>`;
    },

    _icon: function(season) {
        const map = { adviento: 'sparkles', navidad: 'star', cuaresma: 'cross', pascua: 'star' };
        return (typeof LumenIcons !== 'undefined' && LumenIcons[map[season]]) ? LumenIcons[map[season]] : LumenIcons.rosario;
    },

    _renderHub: function() {
        const current = this._currentPlan();
        const plans = (typeof PLANES_DATA !== 'undefined' && PLANES_DATA.planes) ? PLANES_DATA.planes : [];
        const cards = plans.map(function(plan) {
            return this._card(plan, current && current.id === plan.id);
        }, this).join('');
        return `<div class="view">
            <div class="v-header reveal">
                <span class="v-eyebrow">${LumenIcons.book} Caminos de fe ${LumenUI.liturgicalBadgeHTML()}</span>
                <h1 class="v-title">Planes <em>litúrgicos</em></h1>
                <p class="v-sub">Cuatro recorridos generales para vivir Adviento, Navidad, Cuaresma y Pascua. Sin fechas fijas: empieza cuando lo necesites y retoma donde lo dejaste.</p>
                <div class="hero-actions v-jcc v-mt20">${LumenUI.streakChipHTML()}</div>
            </div>
            <div class="v-section">
                <div class="section-heading">
                    <span class="section-kicker">Elige un camino</span>
                    <h2 class="section-title">Un paso cada día</h2>
                </div>
                <div class="formacion-grid v-stagger">${cards}</div>
                <p class="plan-note">Los planes no sustituyen la liturgia de la Iglesia. Son una ayuda para la oración personal y comunitaria; las lecturas son orientativas y pueden acompañarse con el Evangelio del día.</p>
            </div>
        </div>`;
    },

    _renderStep: function() {
        const plan = this._plan(this._id);
        if (!plan) return this._renderHub();
        const total = plan.steps.length;
        if (this._pos >= total) {
            return `<div class="view">
                <header class="formacion-mhead reveal">
                    <button class="btn btn-icon" onclick="PlanesView.back()" aria-label="Volver a planes">←</button>
                    <div class="fm-title"><span class="fm-mod">${this._icon(plan.season)}${LumenUI.escapeHTML(plan.shortTitle)}</span></div>
                    <div class="fm-actions"></div>
                </header>
                <div class="v-header reveal" style="padding-top:0;">
                    <h1 class="v-title">Plan <em>completado</em></h1>
                    <p class="v-sub">Has recorrido los ${total} pasos de ${LumenUI.escapeHTML(plan.title)}. Puedes volver a empezar cuando quieras.</p>
                </div>
                <div class="hero-actions v-jcc v-mt20">
                    <button class="btn btn-primary" onclick="PlanesView.restart()">Volver a empezar</button>
                    <button class="btn btn-outline" onclick="PlanesView.back()">Ver otros planes</button>
                </div>
            </div>`;
        }
        const step = plan.steps[this._pos];
        const pct = this._pct(this._pos, total);
        return `<div class="view">
            <h1 class="sr-only">${LumenUI.escapeHTML(plan.title)}, paso ${this._pos + 1}</h1>
            <header class="formacion-mhead reveal">
                <button class="btn btn-icon" onclick="PlanesView.back()" aria-label="Volver a planes">←</button>
                <div class="fm-title"><span class="fm-mod">${this._icon(plan.season)}${LumenUI.escapeHTML(plan.shortTitle)}</span><span id="plan-counter" class="fm-count">${this._pos + 1} / ${total}</span></div>
                <div class="fm-actions">
                    <button class="btn btn-icon" type="button" id="plan-focus-btn" onclick="LumenUI.togglePrayerFocus(this)" aria-label="Activar modo oración" aria-pressed="false">${LumenIcons.sparkles}</button>
                </div>
            </header>
            <div class="rosario-stage reveal">
                <div id="plan-step" class="plan-step">${this._stepHTML(plan, step, pct)}</div>
                <nav class="flat-nav" aria-label="Avanza por el plan">
                    <button id="plan-prev-btn" class="btn btn-outline" ${this._pos === 0 ? 'disabled' : ''} onclick="PlanesView.prev()">← Anterior</button>
                    <button id="plan-next-btn" class="btn btn-primary" onclick="PlanesView.next()">${this._pos >= total - 1 ? 'Terminar el plan' : 'Siguiente paso →'}</button>
                </nav>
                <button class="focus-exit" type="button" onclick="LumenUI.togglePrayerFocus()">Salir del modo oración</button>
            </div>
        </div>`;
    },

    render: function() {
        if (!this._id) return this._renderHub();
        return this._renderStep();
    },

    init: function() {
        LumenRouter.initScrollReveal();
        LumenUI.applyReaderPrefs();
    },

    destroy: function() {
        if (typeof LumenAudio !== 'undefined' && LumenAudio.stop) LumenAudio.stop();
        document.body.classList.remove('prayer-focus');
    }
};
