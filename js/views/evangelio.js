// LUMEN · Vista "Evangelio del día" — lecturas litúrgicas vía /api/evangelio.
// Arquitectura offline-first: el Service Worker hace network-first sobre el
// endpoint, así la vista siempre toma el evangelio fresco con conexión y sirve
// la última copia cacheada sin ella.
const EvangelioView = {
    _data: null,
    _loading: false,

    render: function() {
        const todayLabel = new Intl.DateTimeFormat('es-VE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
        return `
            <div class="view">
                <!-- EVANGELIO — HERO -->
                <article class="evangelio-hero reveal reveal-delay-1" aria-label="Evangelio del día">
                    <div class="hero-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><path d="M9 7h7"></path><path d="M9 11h5"></path></svg>
                        Evangelio del día
                    </div>
                    <p class="evangelio-date-text">${todayLabel}</p>
                    <h2 class="evangelio-title">Lecturas de hoy</h2>
                    <p class="evangelio-sub">Palabra del día según el calendario litúrgico vaticano, con la meditación de los Papas.</p>
                    <div class="evangelio-hero-actions">
                        <button class="btn" onclick="EvangelioView.copy()" aria-label="Copiar evangelio del día">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            Copiar
                        </button>
                        <button class="btn" onclick="EvangelioView.share()" aria-label="Compartir evangelio del día">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                            Compartir
                        </button>
                    </div>
                </article>

                <!-- CONTENIDO ASÍNCRONO (skeleton / lecturas / error) -->
                <div id="evangelio-body" aria-live="polite">${this._skeleton()}</div>
            </div>
        `;
    },

    init: function() {
        LumenRouter.initScrollReveal();
        if (this._data) {
            this._renderData(this._data);
        } else if (!this._loading) {
            this.load();
        }
    },

    load: async function() {
        if (this._loading) return;
        this._loading = true;
        const body = document.getElementById('evangelio-body');
        if (body) body.innerHTML = this._skeleton();
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 12000);
            const res = await fetch('/api/evangelio', { signal: controller.signal });
            clearTimeout(timer);
            if (!res.ok) throw new Error('API no disponible (' + res.status + ')');
            const data = await res.json();
            if (!data || typeof data !== 'object' || (!data.readings || !data.readings.length)) {
                throw new Error('Respuesta vacía de la API');
            }
            this._data = data;
            if (this._viewMounted()) this._renderData(data);
        } catch (e) {
            console.error('[evangelio]', e);
            const body = document.getElementById('evangelio-body');
            if (body) body.innerHTML = this._errorHTML();
        } finally {
            this._loading = false;
        }
    },

    retry: function() {
        this.load();
    },

    _viewMounted: function() {
        return !!document.getElementById('evangelio-body');
    },

    _skeleton: function() {
        return `
            <div class="evangelio-skeleton" aria-hidden="true">
                <div class="sk-card"><div class="sk-line" style="width:45%;"></div><div class="sk-line" style="width:70%;"></div><div class="sk-line"></div></div>
                <div class="sk-card sk-card-gospel"><div class="sk-line" style="width:50%;"></div><div class="sk-line" style="width:75%;"></div><div class="sk-line" style="width:60%;"></div></div>
                <div class="sk-card"><div class="sk-line" style="width:40%;"></div><div class="sk-line"></div><div class="sk-line" style="width:65%;"></div></div>
            </div>
        `;
    },

    _errorHTML: function() {
        return `
            <div class="evangelio-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="40" height="40" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <h3>No pudimos cargar el Evangelio de hoy</h3>
                <p>Revisa tu conexión y vuelve a intentarlo.</p>
                <button class="btn btn-primary" onclick="EvangelioView.retry()">Reintentar</button>
            </div>
        `;
    },

    _renderData: function(data) {
        const body = document.getElementById('evangelio-body');
        if (!body) return;

        let medCard = '';
        if (data.reflection && data.reflection.text) {
            medCard = `
                <section class="evangelio-meditacion reveal reveal-delay-3" aria-label="Meditación del día">
                    <h3>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        Meditación
                    </h3>
                    <div class="evangelio-med-text">${this._paragraphs(data.reflection.text)}</div>
                    ${data.reflection.cite ? `<cite class="evangelio-med-cite">${this._escape(data.reflection.cite)}</cite>` : ''}
                </section>
            `;
        }

        const gospel = (data.readings || []).find(r => r.type === 'gospel');
        const others = (data.readings || []).filter(r => r.type !== 'gospel');

        let lectIdx = 0;
        const othersHtml = others.map((r, i) => {
            const label = this._cardLabel(r, r.type === 'lectura' ? ++lectIdx : 0);
            return `
            <section class="evangelio-card reveal reveal-delay-${i === 0 ? 2 : 3}" aria-label="${this._escape(label)}">
                <h3 class="evangelio-card-title">${label}</h3>
                ${r.ref ? `<p class="evangelio-card-ref">${this._escape(r.ref)}</p>` : ''}
                <div class="evangelio-card-text">${this._paragraphs(r.text)}</div>
            </section>
        `;
        }).join('');

        const gospelHtml = gospel ? `
            <section class="evangelio-card evangelio-card-gospel reveal reveal-delay-4" aria-label="Evangelio">
                <h3 class="evangelio-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    Evangelio
                </h3>
                ${gospel.ref ? `<p class="evangelio-card-ref">${this._escape(gospel.ref)}</p>` : ''}
                <div class="evangelio-card-text">${this._paragraphs(gospel.text)}</div>
            </section>
        ` : '';

        const sourceHtml = data.source ? `
            <p class="evangelio-source">
                Fuente: <a href="${LumenUI.sanitizeUrl(data.source) || '#'}" target="_blank" rel="noopener noreferrer">Vatican News · Evangelio de hoy</a>
            </p>
        ` : '';

        body.innerHTML = othersHtml + gospelHtml + medCard + sourceHtml;
        LumenRouter.initScrollReveal();
    },

    _cardLabel: function(r, lectIdx) {
        if (r.type === 'gospel') return 'Evangelio';
        if (r.type === 'salmo') return 'Salmo';
        if (r.type === 'aleluya') return 'Aleluya';
        if (r.type === 'lectura') {
            if (r.label) return r.label;
            return lectIdx === 2 ? 'Segunda lectura' : lectIdx === 3 ? 'Tercera lectura' : (lectIdx > 0 ? 'Primera lectura' : 'Lectura');
        }
        return 'Lectura';
    },

    _paragraphs: function(text) {
        const safe = this._escape(text || '');
        return safe
            .split(/\n{2,}/)
            .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
            .join('');
    },

    _escape: function(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    _shareText: function() {
        const d = this._data;
        if (!d || !d.readings || !d.readings.length) return '';
        const lines = [];
        for (const r of d.readings) {
            lines.push(`${r.heading} (${r.ref || ''})\n${r.text}`);
        }
        if (d.reflection && d.reflection.text) {
            lines.push(`Meditación\n${d.reflection.cite ? d.reflection.cite + ' — ' : ''}${d.reflection.text}`);
        }
        return lines.join('\n\n') + '\n\n(LUMEN · Evangelio del día)';
    },

    copy: function() {
        const text = this._shareText();
        if (!text) {
            LumenUI.showToast('Las lecturas aún se están cargando', 'error');
            return;
        }
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                LumenUI.showToast('Evangelio copiado', 'success');
            });
        } else {
            LumenUI.showToast('No se pudo copiar', 'error');
        }
    },

    share: function() {
        const text = this._shareText();
        if (!text) {
            LumenUI.showToast('Las lecturas aún se están cargando', 'error');
            return;
        }
        if (navigator.share) {
            navigator.share({ title: 'Evangelio del día (LUMEN)', text }).catch(() => {});
        } else {
            this.copy();
        }
    }
};