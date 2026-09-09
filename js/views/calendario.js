// CalendarioView · Vista de calendario mensual (Fase D).
// Consume LumenData.eventos (únicos + recurrentes) y reusa el patrón de vistas LUMEN.

const CalendarioView = {
    _year: null,
    _month: null,
    _selected: null,

    WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],

    _norm: function(s) {
        return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    },

    _dayKey: function(d) {
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    },

    _monthPresentOrFuture: function() {
        const hoy = new Date();
        return this._year > hoy.getFullYear() ||
            (this._year === hoy.getFullYear() && this._month >= hoy.getMonth());
    },

    _eventosPorDia: function() {
        const map = {};
        (LumenData.eventos || []).forEach(ev => {
            if (ev.tipo === 'recurrente' && ev.dia && this._monthPresentOrFuture()) {
                const idx = this.WEEKDAYS.findIndex(w => this._norm(w) === this._norm(ev.dia));
                if (idx >= 0) {
                    const dim = new Date(this._year, this._month + 1, 0).getDate();
                    for (let day = 1; day <= dim; day++) {
                        if (new Date(this._year, this._month, day).getDay() === idx) {
                            const k = this._dayKey(new Date(this._year, this._month, day));
                            (map[k] = map[k] || []).push(ev);
                        }
                    }
                }
                return;
            }
            if (ev.tipo === 'unico' && ev.fecha_inicio) {
                const d = new Date(ev.fecha_inicio);
                if (isNaN(d)) return;
                if (d.getFullYear() === this._year && d.getMonth() === this._month) {
                    const k = this._dayKey(d);
                    (map[k] = map[k] || []).push(ev);
                }
            }
        });
        return map;
    },

    render: function() {
        const hoy = new Date();
        if (this._year === null) {
            this._year = hoy.getFullYear();
            this._month = hoy.getMonth();
            this._selected = this._dayKey(hoy);
        }

        const map = this._eventosPorDia();
        const first = new Date(this._year, this._month, 1);
        const monthTitle = first.toLocaleDateString('es-VE', { month: 'long', year: 'numeric' });
        const startOffset = first.getDay();
        const daysInMonth = new Date(this._year, this._month + 1, 0).getDate();
        const hoyKey = this._dayKey(hoy);

        let head = '';
        ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].forEach(n => { head += `<div class="cal-dhead">${n}</div>`; });

        const slots = [];
        for (let i = 0; i < startOffset; i++) slots.push(null);
        for (let d = 1; d <= daysInMonth; d++) slots.push(this._dayKey(new Date(this._year, this._month, d)));
        while (slots.length % 7 !== 0) slots.push(null);

        let cells = '';
        slots.forEach(k => {
            if (!k) { cells += '<div class="cal-day cal-empty" aria-hidden="true"></div>'; return; }
            const dayNum = Number(k.slice(-2));
            const evs = map[k] || [];
            const dObj = new Date(this._year, this._month, dayNum);
            const label = dObj.toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' });
            let ariaLabel = label;
            if (evs.length) ariaLabel += ', ' + evs.map(e => e.titulo).join(', ');
            const dots = evs.map(ev => {
                const cls = ev.tipo === 'recurrente' ? 'cal-dot is-recurring' : 'cal-dot';
                return `<span class="${cls}" title="${LumenUI.escapeHTML(ev.titulo)}"></span>`;
            }).join('');
            cells += `
                <button type="button" class="cal-day${k === hoyKey ? ' is-today' : ''}${k === this._selected ? ' is-selected' : ''}${evs.length ? ' has-events' : ''}"
                    data-date="${k}" aria-label="${LumenUI.escapeHTML(ariaLabel)}"
                    aria-pressed="${k === this._selected}" onclick="CalendarioView.seleccionarDia('${k}', this)">
                    <span class="cal-num">${dayNum}</span>${dots}
                </button>`;
        });

        const selEvs = (map[this._selected] || []).slice();
        selEvs.sort((a, b) => {
            const ta = a.tipo === 'unico' ? (a.fecha_inicio || '') : (a.hora || '');
            const tb = b.tipo === 'unico' ? (b.fecha_inicio || '') : (b.hora || '');
            return ta.localeCompare(tb);
        });

        let selHTML = '';
        if (this._selected) {
            const selDate = new Date(this._selected + 'T00:00:00');
            const fechaLabel = Number.isNaN(selDate.getTime())
                ? 'Este día'
                : selDate.toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' });
            if (selEvs.length) {
                selHTML = `
                    <h3 class="cal-panel-title">${LumenUI.escapeHTML(fechaLabel)}</h3>
                    <div class="cal-selected-list">
                        ${selEvs.map(ev => {
                            const hora = ev.tipo === 'recurrente'
                                ? `Todos los ${LumenUI.escapeHTML(ev.dia)} · ${LumenUI.escapeHTML(ev.hora || '')}`
                                : LumenUI.escapeHTML(new Date(ev.fecha_inicio).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }));
                            return `
                            <div class="cal-selected-item">
                                <span class="v-chip ${ev.tipo === 'recurrente' ? '' : 'is-dorado'}">${ev.tipo === 'recurrente' ? 'Semanal' : 'Único'}</span>
                                <button type="button" class="cal-selected-link" onclick="LumenData.selectedEventId='${ev.id}'; LumenRouter.navigateTo('detalle')">
                                    <strong>${LumenUI.escapeHTML(ev.titulo)}</strong>
                                    <span class="cal-selected-meta">${hora}</span>
                                </button>
                            </div>`;
                        }).join('')}
                    </div>`;
            } else {
                selHTML = `
                    <h3 class="cal-panel-title">${LumenUI.escapeHTML(fechaLabel)}</h3>
                    <div class="state-container cal-empty-day">${Icons.empty_box}<p>No hay actividades para este día.</p></div>`;
            }
        } else {
            selHTML = `<div class="state-container cal-empty-day">${Icons.empty_box}<p>Selecciona un día para ver sus actividades.</p></div>`;
        }

        let upHTML = '';
        const upcoming = typeof LumenData.upcomingEventos === 'function' ? LumenData.upcomingEventos() : [];
        if (upcoming.length) {
            upHTML = `
                <div class="cal-upcoming reveal">
                    <h3 class="v-section-title is-center">Próximamente</h3>
                    <div class="v-grid">
                        ${upcoming.slice(0, 3).map(ev => `
                            <button type="button" class="v-card" style="text-align:left; cursor:pointer;" onclick="LumenData.selectedEventId='${ev.id}'; LumenRouter.navigateTo('detalle')">
                                <div class="v-card-meta">${Icons.calendar} ${ev.tipo === 'recurrente' ? 'Todos los ' + LumenUI.escapeHTML(ev.dia) + ' · ' + LumenUI.escapeHTML(ev.hora) : LumenUI.escapeHTML(new Date(ev.fecha_inicio).toLocaleDateString('es-VE'))}</div>
                                <h3>${LumenUI.escapeHTML(ev.titulo)}</h3>
                                <span class="v-chip ${ev.tipo === 'recurrente' ? '' : 'is-dorado'}">${ev.tipo === 'recurrente' ? 'Semanal' : 'Único'}</span>
                            </button>`).join('')}
                    </div>
                </div>`;
        }

        return `
        <div class="view">
            <div class="v-header reveal align-left">
                <span class="v-eyebrow">${Icons.calendar} Calendario</span>
                <h2 class="v-title">Agenda de <em>comunidad</em></h2>
                <p class="v-sub">Mes a mes, los encuentros, retiros y actividades de Juvemar.</p>
            </div>
            <div class="v-section" style="padding-top:0;">
                <div class="cal-card reveal">
                    <div class="cal-controls">
                        <button type="button" class="btn btn-outline cal-nav cal-prev" aria-label="Mes anterior" onclick="CalendarioView.cambiarMes(-1)">${LumenIcons.chevron_right}</button>
                        <h3 class="cal-title">${LumenUI.escapeHTML(monthTitle)}</h3>
                        <button type="button" class="btn btn-outline cal-nav cal-next" aria-label="Mes siguiente" onclick="CalendarioView.cambiarMes(1)">${LumenIcons.chevron_right}</button>
                        <button type="button" class="btn btn-outline cal-today" onclick="CalendarioView.irHoy()">Hoy</button>
                    </div>
                    <div class="cal-grid" role="grid" aria-label="Calendario de ${LumenUI.escapeHTML(monthTitle)}">
                        ${head}
                        ${cells}
                    </div>
                    <div class="cal-legend">
                        <span><i class="cal-dot"></i> Única</span>
                        <span><i class="cal-dot is-recurring"></i> Recurrente (semanal)</span>
                    </div>
                </div>
                <div class="cal-panel reveal">${selHTML}</div>
                ${upHTML}
            </div>
        </div>`;
    },

    cambiarMes: function(delta) {
        this._month += delta;
        if (this._month < 0) { this._month = 11; this._year--; }
        if (this._month > 11) { this._month = 0; this._year++; }
        this._selected = null;
        LumenRouter.navigateTo('calendario');
    },

    irHoy: function() {
        const hoy = new Date();
        this._year = hoy.getFullYear();
        this._month = hoy.getMonth();
        this._selected = this._dayKey(hoy);
        LumenRouter.navigateTo('calendario');
    },

    seleccionarDia: function(key, btn) {
        if (key === this._selected) return;
        this._selected = key;
        LumenRouter.navigateTo('calendario');
        setTimeout(() => {
            const el = document.querySelector('.cal-day[data-date="' + key + '"]');
            if (el) el.focus();
        }, 180);
    },

    init: function() {
        LumenRouter.initScrollReveal();
    },

    destroy: function() {
        // Conserva la navegación de mes/día entre visitas.
    }
};