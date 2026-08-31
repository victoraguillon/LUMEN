/* Novenas — Fase 2: 9 días con check, avance y celebración */
const NovenasView = {
    _nov: null,

    _progKey: 'lumen-novenas-progress',
    _read: function() { try { return JSON.parse(localStorage.getItem(this._progKey)) || {}; } catch (e) { return {}; } },
    _save: function(p) { localStorage.setItem(this._progKey, JSON.stringify(p)); },
    _novPct: function(id) {
        const nov = NOVENAS_DATA.find(function(n) { return n.id === id; });
        if (!nov || !nov.days.length) return 0;
        const done = (this._read()[id] || []).length;
        return Math.round((done / nov.days.length) * 100);
    },

    open: function(id) { this._nov = id; LumenRouter.navigateTo('novenas', true); },
    back: function() { this._nov = null; LumenRouter.navigateTo('novenas', true); },

    toggleDay: function(novId, dayIdx) {
        const p = this._read();
        const arr = (p[novId] || []).slice();
        const i = arr.indexOf(dayIdx);
        if (i > -1) arr.splice(i, 1); else arr.push(dayIdx);
        arr.sort(function(a, b) { return a - b; });
        p[novId] = arr;
        this._save(p);
        const nov = NOVENAS_DATA.find(function(n) { return n.id === novId; });
        if (nov && arr.length === nov.days.length) {
            LumenUI.celebrate('¡Novena completada!', 'Has rezado los ' + nov.days.length + ' días de la ' + nov.title + '.');

            const btn = document.getElementById('novena-day-btn-' + dayIdx);
            if (btn) { btn.classList.add('done'); btn.querySelector('.novena-check').textContent = '✓'; }
            return;
        }
        this._refreshDay(novId, dayIdx);
    },

    _refreshDay: function(novId, dayIdx) {
        const arr = (this._read()[novId] || []);
        const btn = document.getElementById('novena-day-btn-' + dayIdx);
        if (btn) {
            const done = arr.indexOf(dayIdx) > -1;
            btn.classList.toggle('done', done);
            const c = btn.querySelector('.novena-check');
            if (c) c.textContent = done ? '✓' : dayIdx + 1;
        }
        const bar = document.getElementById('novena-bar');
        const pct = this._novPct(novId);
        if (bar) bar.style.width = pct + '%';
    },

    render: function() {
        if (!this._nov) {
            const imgMap = {
                'virgen-desatanudos': 'assets/desatanudos.jpg',
                'san-jose': 'assets/sanjose.webp',
                'sagrado-corazon': 'assets/sagradocorazon.jpg',
                'espiritu-santo': 'assets/espiritusanto.jpg',
                'san-charbel': 'assets/sancharbel.jpg',
                'padre-pio': 'assets/padrepio.jpg',
                'san-miguel': 'assets/sanmiguelarcangel.jpg',
            };
            const cards = NOVENAS_DATA.map(function(n) {
                const pct = this._novPct(n.id);
                const img = imgMap[n.id];
                const iconHtml = img
                    ? `<img src="${img}" alt="${n.title}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`
                    : LumenIcons.novenas;
                return `<button class="formacion-card reveal" onclick="NovenasView.open('${n.id}')">
                    <span class="fc-icon">${iconHtml}</span>
                    <span class="fc-body">
                        <span class="fc-title">${n.title}</span>
                        <span class="fc-desc">${n.description}</span>
                        <span class="fc-progress"><i style="width:${pct}%"></i></span>
                        <span class="fc-meta">${n.days.length} días${pct ? ' · ' + pct + '%' : ''}</span>
                    </span>
                </button>`;
            }, this).join('');
            return `
            <div class="view">
                <section class="formacion-hero reveal">
                    <div class="hero-label">Nueve días de oración y espera ${LumenUI.liturgicalBadgeHTML()}</div>
                    <h1 class="grad-title">Novenas</h1>
                    <p>Reza durante nueve días pidiendo la intercesión de la Virgen, los santos y las devociones. Marca cada día al completarlo.</p>
                    <div class="hero-actions" style="justify-content:flex-start;">${LumenUI.streakChipHTML()}</div>
                </section>
                <div class="formacion-grid">${cards}</div>
            </div>`;
        }

        const nov = NOVENAS_DATA.find(function(n) { return n.id === this._nov; }, this);
        if (!nov) return this.render();
        const done = (this._read()[nov.id] || []);
        const pct = this._novPct(nov.id);

        const days = nov.days.map(function(d, idx) {
            const on = done.indexOf(d.day) > -1;
            const prayers = (d.prayers || []).map(function(p) { return `<p class="novena-prayer">${String(p).replace(/\n/g, '<br>')}</p>`; }).join('');
            return `<div class="novena-day reveal">
                <button id="novena-day-btn-${d.day}" class="novena-day-btn${on ? ' done' : ''}" onclick="NovenasView.toggleDay('${nov.id}', ${d.day})" aria-pressed="${on}">
                    <span class="novena-check">${on ? '✓' : d.day}</span>
                    <span class="novena-day-title">${on ? 'Completado · ' + d.title : d.title}</span>
                </button>
                <details class="si-details">
                    <summary>Meditación del día</summary>
                    <div class="reading-surface novena-meditation">${String(d.meditation || '').replace(/\n/g, '<br>')}</div>
                    ${prayers ? `<div class="novena-prayers">${prayers}</div>` : ''}
                </details>
            </div>`;
        }).join('');

        const common = (nov.commonPrayers || []).map(function(p) {
            return `<details class="si-details"><summary>${p.title}</summary><div class="reading-surface glos-def">${String(p.text || '').replace(/\n/g, '<br>')}</div></details>`;
        }).join('');

        const finals = (nov.finalPrayers || []).map(function(p) {
            return `<details class="si-details"><summary>${p.title}</summary><div class="reading-surface glos-def">${String(p.text || '').replace(/\n/g, '<br>')}</div></details>`;
        }).join('');

        return `
        <div class="view">
            <header class="formacion-mhead reveal">
                <button class="btn btn-icon" onclick="NovenasView.back()" aria-label="Volver a novenas">←</button>
                <div class="fm-title"><span class="fm-mod">${LumenIcons.novenas}${nov.title}</span>
                    <span class="fm-progress"><i id="novena-bar" style="width:${pct}%"></i></span>
                </div>
                <div class="fm-actions">${this.favHeart('novenas', nov.id, nov.title, 'Novenas')}</div>
            </header>
            <section class="formacion-hero compact reveal">
                <p class="novena-intro">${nov.introduction}</p>
            </section>
            ${common ? `<section class="novena-block reveal"><h3>Oraciones iniciales</h3>${common}</section>` : ''}
            <section class="novena-block reveal">
                <h3>Los ${nov.days.length} días</h3>
                <div class="novena-days">${days}</div>
            </section>
            ${finals ? `<section class="novena-block reveal"><h3>Oraciones finales</h3>${finals}</section>` : ''}
            ${(nov.sources && nov.sources.length) ? `<p class="novena-sources">Fuentes: ${nov.sources.join(' · ')}</p>` : ''}
        </div>`;
    },

    favHeart: function(kind, id, title, sub) {
        const on = LumenUI.isFavorite(kind, id) ? ' on' : '';
        const t = LumenUI._escJson(title), s = LumenUI._escJson(sub);
        return `<button class="fav-btn${on}" onclick="LumenUI.toggleFavorite('${kind}','${id}',${t},${s});this.classList.toggle('on')" aria-label="Favorito">♥</button>`;
    },

    init: function() {
        LumenRouter.initScrollReveal();
        LumenUI.applyReaderPrefs();
    }
};