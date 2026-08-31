const OracionesView = {
    _cat: null,

    openCat: function(id) { this._cat = id; this._sel = null; LumenRouter.navigateTo('oraciones', true); },
    back: function() { this._cat = null; LumenRouter.navigateTo('oraciones', true); },

    togglePrayer: function(id) {
        this._sel = (this._sel === id) ? null : id;
        const items = document.querySelectorAll('.prayer-item');
        items.forEach(function(el) { el.classList.toggle('open', el.dataset.id === this._sel); }, this);
        const head = document.querySelector('.prayer-item[data-id="' + id + '"] .prayer-chevron');
        if (head) head.textContent = (this._sel === id) ? '−' : '+';
    },

    _findPrayer: function(id) {
        for (let c = 0; c < ORACIONES_DATA.categorias.length; c++) {
            const o = ORACIONES_DATA.categorias[c].oraciones.find(function(x) { return x.id === id; });
            if (o) return o;
        }
        return null;
    },

    copyPrayer: function(id) {
        const o = this._findPrayer(id);
        const text = o ? (o.prayer || '') : '';
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(function() { LumenUI.showToast('Oración copiada', 'success'); });
        } else {
            LumenUI.showToast('No se pudo copiar', 'error');
        }
    },

    render: function() {
        if (!this._cat) {
            const cats = ORACIONES_DATA.categorias.map(function(c) {
                return `<button class="formacion-card reveal" onclick="OracionesView.openCat('${c.id}')">
                    <span class="fc-icon">🙏</span>
                    <span class="fc-body">
                        <span class="fc-title">${c.title}</span>
                        <span class="fc-desc">${c.description}</span>
                        <span class="fc-meta">${c.oraciones.length} oraciones</span>
                    </span>
                </button>`;
            }).join('');
            return `
            <div class="view">
                <section class="formacion-hero reveal">
                    <div class="hero-label">La oración es el corazón ${LumenUI.liturgicalBadgeHTML()}</div>
                    <h1 class="grad-title">Oraciones</h1>
                    <p>Oraciones para cada momento: fundamentales, marianas, devocionales y litúrgicas.</p>
                    <div class="hero-actions" style="justify-content:flex-start;">${LumenUI.streakChipHTML()}</div>
                </section>
                <div class="formacion-grid">${cats}</div>
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
                        ${o.when_to_pray ? `<p class="prayer-when">🕐 ${o.when_to_pray}</p>` : ''}
                    </div>
                    <span class="prayer-chevron">${isSel ? '−' : '+'}</span>
                </button>
                <div class="prayer-item-body">
                    ${o.content ? `<p class="prayer-intro">${o.content}</p>` : ''}
                    <div class="reading-surface prayer-big">${String(o.prayer || '').replace(/\n/g, '<br>')}</div>
                    ${o.latin ? `<details class="si-details"><summary>En latín</summary><div class="reading-surface prayer-latin">${String(o.latin).replace(/\n/g, '<br>')}</div></details>` : ''}
                    ${o.significance ? `<p class="prayer-significance">✨ ${o.significance}</p>` : ''}
                    <div class="prayer-actions">
                        ${this.favHeart('oraciones', o.id, o.title, cat.title)}
                        <button class="btn btn-sm" onclick="OracionesView.copyPrayer('${o.id}')">Copiar</button>
                    </div>
                </div>
            </div>`;
        }, this).join('');

        return `
        <div class="view">
            <header class="formacion-mhead reveal">
                <button class="btn btn-icon" onclick="OracionesView.back()" aria-label="Volver a categorías">←</button>
                <div class="fm-title"><span class="fm-mod">🙏 ${cat.title}</span></div>
                <div class="fm-actions">${LumenUI.readerToolbarHTML()}</div>
            </header>
            <div class="oraciones-list">${items}</div>
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
    }
};