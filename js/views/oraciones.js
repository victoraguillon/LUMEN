const OracionesView = {
    _cat: null,
    _sel: null,

    route: function() {
        return { parts: this._cat ? [this._cat] : [], query: this._sel ? 'p=' + encodeURIComponent(this._sel) : null };
    },
    applyRoute: function(params, query) {
        this._cat = null;
        this._sel = null;
        if (params[0] && ORACIONES_DATA.categorias.some(function(c) { return c.id === params[0]; })) {
            this._cat = params[0];
        }
        const match = /(?:^|&)p=([^&]+)/.exec(query || '');
        if (match) {
            const id = decodeURIComponent(match[1]);
            const found = this._findPrayer(id);
            if (found) {
                this._cat = found.cat.id;
                this._sel = found.o.id;
            }
        }
    },

    openCat: function(id) { this._cat = id; this._sel = null; LumenRouter.navigateTo('oraciones', true); },
    back: function() { this._cat = null; this._sel = null; LumenRouter.navigateTo('oraciones', true); },

    _findPrayer: function(id) {
        for (let c = 0; c < ORACIONES_DATA.categorias.length; c++) {
            const cat = ORACIONES_DATA.categorias[c];
            const o = (cat.oraciones || []).find(function(x) { return x.id === id; });
            if (o) return { cat: cat, o: o };
        }
        return null;
    },

    openPrayer: function(id) {
        const found = this._findPrayer(id);
        if (!found) {
            const cat = ORACIONES_DATA.categorias.find(function(c) { return c.id === id; });
            if (cat) return this.openCat(id);
            return;
        }
        this._cat = found.cat.id;
        this._sel = id;
        LumenUI.setRecent('oraciones', id, found.o.title, ['oraciones', found.cat.id], 'p=' + encodeURIComponent(id));
        LumenRouter.navigateTo('oraciones', true);
    },

    togglePrayer: function(id) {
        this._sel = (this._sel === id) ? null : id;
        const items = document.querySelectorAll('.prayer-item');
        items.forEach(function(el) { el.classList.toggle('open', el.dataset.id === this._sel); }, this);
        const head = document.querySelector('.prayer-item[data-id="' + id + '"] .prayer-chevron');
        if (head) head.textContent = (this._sel === id) ? '−' : '+';
        if (this._sel) {
            const found = this._findPrayer(this._sel);
            if (found) LumenUI.setRecent('oraciones', this._sel, found.o.title, ['oraciones', this._cat], 'p=' + encodeURIComponent(this._sel));
        }
        if (typeof LumenRouter !== 'undefined' && LumenRouter._syncUrl) {
            try { LumenRouter._syncUrl({ replace: true }); } catch (e) {}
        }
    },

    copyPrayer: function(id) {
        const found = this._findPrayer(id);
        const text = found ? (found.o.prayer || '') : '';
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(function() { LumenUI.showToast('Oración copiada', 'success'); });
        } else {
            LumenUI.showToast('No se pudo copiar', 'error');
        }
    },

    render: function() {
        if (!this._cat) {
            const imgMap = {
                'fundamental-prayers': 'assets/oracion.jpg',
                'marian-prayers': 'assets/oracionesmariana.jpg',
                'devotional-prayers': 'assets/devocion.jpg',
                'liturgical-special': 'assets/oracionesliturgicas.jpg',
            };
            const cats = ORACIONES_DATA.categorias.map(function(c) {
                const img = imgMap[c.id];
                const iconHtml = img
                    ? `<img src="${img}" alt="${c.title}" class="v-media">`
                    : LumenIcons.oraciones;
                return `<button class="formacion-card reveal" onclick="OracionesView.openCat('${c.id}')">
                    <span class="fc-icon">${iconHtml}</span>
                    <span class="fc-body">
                        <span class="fc-title">${c.title}</span>
                        <span class="fc-desc">${c.description}</span>
                        <span class="fc-meta">${c.oraciones.length} oraciones</span>
                    </span>
                </button>`;
            }).join('');
            return `
            <div class="view">
                <div class="v-header reveal">
                    <span class="v-eyebrow">${LumenUI.liturgicalBadgeHTML()} Oración</span>
                    <h1 class="v-title">Oraciones para <em>cada momento</em></h1>
                    <p class="v-sub">Fundamentales, marianas, devocionales y litúrgicas.</p>
                    <div class="hero-actions v-jcc v-mt20" >${LumenUI.streakChipHTML()}</div>
                </div>
                <div class="v-section" style="padding-top:0;">
                    <div class="formacion-grid v-stagger">${cats}</div>
                </div>
            </div>`;
        }

        const cat = ORACIONES_DATA.categorias.find(function(c) { return c.id === this._cat; }, this);
        if (!cat) return this.render();

        const items = cat.oraciones.map(function(o) {
            const isSel = this._sel === o.id;
            return `<div class="prayer-item${isSel ? ' open' : ''}" data-id="${o.id}">
                <button class="prayer-item-head" onclick="OracionesView.togglePrayer('${o.id}')" aria-expanded="${isSel}">
                    <div>
                        <h3>${o.title}</h3>
                        ${o.when_to_pray ? `<p class="prayer-when">${LumenIcons.clock} ${o.when_to_pray}</p>` : ''}
                    </div>
                    <span class="prayer-chevron">${isSel ? '−' : '+'}</span>
                </button>
                <div class="prayer-item-body">
                    ${o.content ? `<p class="prayer-intro">${o.content}</p>` : ''}
                    <div class="reading-surface prayer-big">${String(o.prayer || '').replace(/\n/g, '<br>')}</div>
                    ${o.latin ? `<details class="si-details"><summary>En latín</summary><div class="reading-surface prayer-latin">${String(o.latin).replace(/\n/g, '<br>')}</div></details>` : ''}
                    ${o.significance ? `<p class="prayer-significance">${LumenIcons.sparkles} ${o.significance}</p>` : ''}
                    <div class="prayer-actions">
                        ${this.favHeart('oraciones', o.id, o.title, cat.title)}
                        ${(typeof LumenAudio !== 'undefined' && LumenAudio.supported && LumenAudio.supported() && o.prayer) ? LumenAudio.buttonHTML(o.prayer, 'Escuchar oración') : ''}
                        <button class="btn btn-sm" onclick="OracionesView.copyPrayer('${o.id}')">Copiar</button>
                    </div>
                </div>
            </div>`;
        }, this).join('');

        return `
        <div class="view">
            <h1 class="sr-only">${cat.title}</h1>
            <header class="formacion-mhead reveal">
                <button class="btn btn-icon" onclick="OracionesView.back()" aria-label="Volver a categorías">←</button>
                <div class="fm-title"><span class="fm-mod">${LumenIcons.oraciones}${cat.title}</span></div>
                <div class="fm-actions">${LumenUI.readerToolbarHTML()}<button class="btn btn-icon" type="button" onclick="LumenUI.togglePrayerFocus(this)" aria-label="Activar modo oración" aria-pressed="false">${LumenIcons.sparkles}</button></div>
            </header>
            <div class="oraciones-list">${items}</div>
            <button class="focus-exit" type="button" onclick="LumenUI.togglePrayerFocus()">Salir del modo oración</button>
        </div>`;
    },

    favHeart: function(kind, id, title, sub) {
        const on = LumenUI.isFavorite(kind, id) ? ' on' : '';
        const t = LumenUI._escJson(title), s = LumenUI._escJson(sub);
        return `<button class="fav-btn${on}" onclick="LumenUI.toggleFavorite('${kind}','${id}',${t},${s});this.classList.toggle('on')" aria-label="Favorito">♥</button>`;
    },

    openFav: function(id) {
        const cat = ORACIONES_DATA.categorias.find(function(c) { return c.oraciones.some(function(o) { return o.id === id; }); });
        if (cat) { this._cat = cat.id; LumenRouter.navigateTo('oraciones', true); }
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