/* Módulo Formación — réplica del mecanismo de módulos de católic-app
   Módulos → Unidades → Subsecciones (puntos clave + referencias), con
   lector Aa, favoritos, progreso por dispositivo y celebraciones. */
const FORMACION_ICONS = {
    introduccion: LumenIcons.sprout,
    catecismo: LumenIcons.catecismo,
    liturgia: LumenIcons.liturgia,
    apologetica: LumenIcons.apologetica,
    santos: LumenIcons.santos,
    glosario: LumenIcons.scroll,
    faq: LumenIcons.message
};

const FormacionView = {
    _moduleId: null,
    _unitId: null,
    _subId: null,
    _glosQ: '',

    // ---- helpers ----
    _progKey: 'lumen-formacion-progress',
    _readProg: function() { try { return JSON.parse(localStorage.getItem(this._progKey)) || {}; } catch (e) { return {}; } },
    _saveProg: function(p) { localStorage.setItem(this._progKey, JSON.stringify(p)); },
    _flat: function(mod) {
        const lista = [];
        (mod.units || []).forEach(function(u) {
            const items = u.subsections || u.topics || [];
            items.forEach(function(s) { lista.push({ unitId: u.id, subId: s.id, title: s.title || s.question }); });
        });
        return lista;
    },
    _flatCount: function(mod) {
        return this._flat(mod).length;
    },
    _modProgress: function(modId) {
        const mod = this._mod(modId);
        if (!mod) return 0;
        const flat = this._flat(mod);
        if (!flat.length) return 0;
        const prog = this._readProg();
        const doneMap = prog[modId] || {};
        let done = 0;
        flat.forEach(function(f) { if (doneMap[f.unitId + '|' + f.subId]) done++; });
        return Math.round((done / flat.length) * 100);
    },
    _isDone: function(modId, unitId, subId) {
        const prog = this._readProg();
        return !!(prog[modId] || {})[unitId + '|' + subId];
    },
    _toggleDone: function(modId, unitId, subId) {
        const prog = this._readProg();
        const key = unitId + '|' + subId;
        prog[modId] = prog[modId] || {};
        if (prog[modId][key]) {
            delete prog[modId][key];
            LumenUI.showToast('Marcado como pendiente');
        } else {
            prog[modId][key] = true;
            LumenUI.showToast('¡Sección completada!', 'success');
        }
        this._saveProg(prog);
        const pct = this._modProgress(modId);
        if (pct === 100) LumenUI.celebrate('¡Módulo completado!', 'Has terminado todo el módulo. Sigue creciendo en la fe.');
        this._refresh();
    },
    _mod: function(id) { return (FORMACION_DATA.modules || []).find(function(m) { return m.id === id; }); },
    _unit: function(mod, id) { return (mod.units || []).find(function(u) { return u.id === id; }); },

    // ---- navegación ----
    home: function() {
        this._moduleId = null; this._unitId = null; this._subId = null;
        LumenRouter.navigateTo('formacion', true);
    },
    go: function(moduleId, unitId, subId) {
        this._moduleId = moduleId;
        this._unitId = unitId || null;
        this._subId = subId || null;
        const mod = this._mod(moduleId);
        if (mod && (mod.tipo === 'curso' || mod.tipo === 'preguntas') && unitId && !subId) {
            const flat = this._flat(mod);
            const first = flat.find(function(f) { return f.unitId === unitId; });
            if (first) this._subId = first.subId;
        }
        LumenRouter.navigateTo('formacion', true);
    },
    openFav: function(id) {
        const parts = id.split('|');
        this.go(parts[0] || null, parts[1] || null, parts[2] || null);
    },
    openSaintFav: function(saintId) {
        const mod = this._mod('santos');
        const unit = (mod.units || []).find(function(u) { return u.saints.some(function(s) { return s.id === saintId; }); });
        if (mod && unit) this.go('santos', unit.id);
        else LumenRouter.navigateTo('formacion');
    },
    openGlosFav: function() {
        this.go('glosario');
    },
    _refresh: function() {
        if (typeof LumenRouter !== 'undefined' && this._moduleId) LumenRouter.navigateTo('formacion', true);
    },
    // sintaxis correcta para flatNav (this bind)
    flatPrev: function() { this._navFlat(-1); },
    flatNext: function() { this._navFlat(1); },
    _navFlat: function(step) {
        const mod = this._mod(this._moduleId);
        if (!mod) return;
        const flat = this._flat(mod);
        let cur = -1;
        for (let i = 0; i < flat.length; i++) {
            if (flat[i].unitId === this._unitId && flat[i].subId === this._subId) { cur = i; break; }
        }
        const target = cur + step;
        if (target < 0 || target >= flat.length) return;
        const item = flat[target];
        this.go(mod.id, item.unitId, item.subId);
    },

    glosSearch: function(q) { this._glosQ = q || ''; const grid = document.getElementById('glos-grid'); if (grid) grid.innerHTML = this._renderGlosTerms(); },

    toggleFav: function() {
        const mod = this._mod(this._moduleId);
        if (!mod) return;
        const id = this._moduleId + '|' + (this._unitId || '') + '|' + (this._subId || '');
        const title = this._curTitle();
        LumenUI.toggleFavorite('formacion', id, title, mod.title);
    },
    _curTitle: function() {
        const mod = this._mod(this._moduleId);
        if (!mod) return this._moduleId;
        if (this._subId) {
            const u = this._unit(mod, this._unitId);
            const items = (u && (u.subsections || u.topics)) || [];
            const s = items.find(function(x) { return x.id === this._subId; }, this);
            if (s) return mod.title + ' · ' + (s.title || s.question);
            return u ? mod.title + ' · ' + u.title : mod.title;
        }
        return mod.title;
    },

    favHeart: function(kind, id, title, sub) {
        const on = LumenUI.isFavorite(kind, id) ? ' on' : '';
        const t = LumenUI._escJson(title), s = LumenUI._escJson(sub);
        return `<button class="fav-btn${on}" onclick="LumenUI.toggleFavorite('${kind}','${id}',${t},${s});this.classList.toggle('on')" aria-label="Marcar favorito">♥</button>`;
    },

    // ---- render ----
    render: function() {
        LumenUI.recordStreak();
        if (!this._moduleId) return this.renderHub();
        const mod = this._mod(this._moduleId);
        if (!mod) return this.renderHub();
        if (mod.tipo === 'curso' || mod.tipo === 'preguntas') return this.renderReader(mod);
        if (mod.tipo === 'santos') return this.renderSantos(mod);
        if (mod.tipo === 'glosario') return this.renderGlosario(mod);
        if (mod.tipo === 'faq') return this.renderFaq(mod);
        return this.renderHub();
    },

    renderHub: function() {
        const cards = (FORMACION_DATA.modules || []).map(function(mod) {
            const pct = this._modProgress(mod.id);
            return `<button class="formacion-card reveal" onclick="FormacionView.go('${mod.id}')" aria-label="Abrir módulo ${mod.title}">
                <span class="fc-icon">${FORMACION_ICONS[mod.id] || LumenIcons.catecismo}</span>
                <span class="fc-body">
                    <span class="fc-title">${mod.title}</span>
                    <span class="fc-desc">${mod.description}</span>
                    <span class="fc-progress"><i style="width:${pct}%"></i></span>
                    <span class="fc-meta">${mod.count} ${mod.tipo === 'santos' ? 'santos' : mod.tipo === 'preguntas' ? 'temas' : mod.tipo === 'glosario' ? 'términos' : mod.tipo === 'faq' ? 'preguntas' : 'secciones'}${pct ? ' · ' + pct + '%' : ''}</span>
                </span>
            </button>`;
        }, this).join('');

        return `
        <div class="view">
            <section class="formacion-hero reveal">
                <div class="hero-label">Tu camino de fe paso a paso ${LumenUI.liturgicalBadgeHTML()}</div>
                <h1 class="grad-title">Formación</h1>
                <p>Módulos en unidades con puntos clave y referencias para crecer a tu ritmo. Sin necesidad de cuenta, abierta a todos.</p>
                <div class="hero-actions" style="justify-content:flex-start;">
                    <button class="btn" onclick="LumenRouter.navigateTo('favoritos')" aria-label="Ver favoritos">♥ Mis favoritos (${Object.keys(LumenUI.getFavorites()).length})</button>
                    ${LumenUI.streakChipHTML()}
                </div>
            </section>
            <div class="formacion-grid">
                ${cards}
            </div>
            <section class="formacion-tip reveal">
                <h3>${LumenIcons.lightbulb} ¿Cómo funciona?</h3>
                <p>Cada módulo se divide en unidades y secciones. Léelas en orden o salta libremente: tu avance se guarda en este dispositivo y puedes marcar cada sección como completada.</p>
            </section>
        </div>`;
    },

    renderReader: function(mod) {
        const flat = this._flat(mod);
        const curIndex = flat.findIndex(function(f) { return f.unitId === this._unitId && f.subId === this._subId; }, this);
        const pos = curIndex < 0 ? 0 : curIndex;
        const target = flat[pos] || { unitId: null, subId: null };
        const uid = target.unitId, sid = target.subId;
        const unit = this._unit(mod, uid);
        const items = (unit && (unit.subsections || unit.topics)) || [];
        const item = items.find(function(x) { return x.id === sid; });
        if (!item) return this.renderHub();

        const progMap = this._readProg()[mod.id] || {};
        const done = !!progMap[uid + '|' + sid];
        const pct = this._modProgress(mod.id);
        const compactSide = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 900px)').matches;

        let indexHTML = '';
        (mod.units || []).forEach(function(u) {
            const unitItems = u.subsections || u.topics || [];
            indexHTML += `<div class="fi-unit">
                <p class="fi-unit-title">${u.title}</p>
                ${unitItems.map(function(s) {
                    const active = (u.id === uid && s.id === sid);
                    const d = progMap[u.id + '|' + s.id];
                    return `<button class="fi-item${active ? ' active' : ''}" onclick="FormacionView.go('${mod.id}','${u.id}','${s.id}')">
                        <span class="fi-check">${d ? '✓' : ''}</span>${s.title || s.question}
                    </button>`;
                }).join('')}
            </div>`;
        });

        let contentHTML = '';
        if (mod.tipo === 'curso') {
            const paras = String(item.content || '').split('\n\n').map(function(p) {
                return `<p>${p}</p>`;
            }).join('');
            contentHTML = `
                <div class="reading-surface formacion-body">
                    <h2 class="reading-h">${item.title}</h2>
                    <div class="reading-prose drop-cap">${paras}</div>
                    ${(item.keyPoints && item.keyPoints.length) ? `<div class="keypoints"><h4>Puntos clave</h4><ul>${item.keyPoints.map(function(k) { return `<li>${k}</li>`; }).join('')}</ul></div>` : ''}
                    ${(item.references && item.references.length) ? `<div class="refs"><h4>Referencias</h4><div class="ref-chips">${item.references.map(function(r) { return `<span class="ref-chip">${r}</span>`; }).join('')}</div></div>` : ''}
                </div>`;
        } else {
            contentHTML = `
                <div class="reading-surface formacion-body qa-body">
                    <h2 class="reading-h">${item.question}</h2>
                    <div class="reading-prose">${String(item.answer || '').replace(/\n\n/g, '<br><br>')}</div>
                    ${item.scripture ? `<blockquote class="scripture-quote"><span class="sq-label">${LumenIcons.cross} Escritura</span><p>${item.scripture}</p></blockquote>` : ''}
                    ${item.catechism ? `<blockquote class="catechism-quote"><span class="sq-label">${LumenIcons.compass} Catecismo</span><p>${item.catechism}</p></blockquote>` : ''}
                    ${item.explanation ? `<div class="qa-explanation"><h4>Explicación</h4><p>${item.explanation}</p></div>` : ''}
                </div>`;
        }

        return `
        <div class="view">
            <header class="formacion-mhead reveal">
                <button class="btn btn-icon" onclick="FormacionView.home()" aria-label="Volver a módulos">←</button>
                <div class="fm-title">
                    <span class="fm-mod">${FORMACION_ICONS[mod.id] || LumenIcons.catecismo}${mod.title}</span>
                    <span class="fm-progress"><i style="width:${pct}%"></i></span>
                </div>
                <div class="fm-actions">
                    ${this.favHeart('formacion', mod.id + '|' + uid + '|' + sid, this._curTitle(), mod.title)}
                    <button class="btn-sm" onclick="FormacionView._toggleDone('${mod.id}','${uid}','${sid}')">${done ? '✓ Hecho' : 'Marcar hecho'}</button>
                </div>
            </header>
            <div class="formacion-layout">
                <aside class="formacion-index reveal reveal-delay-1">
                    <details class="fi-details"${compactSide ? '' : ' open'}>
                        <summary class="fi-summary">
                            <span class="fi-summary-label">${LumenIcons.list} Índice</span>
                            <span class="fi-caret">${LumenIcons.chevron_down}</span>
                        </summary>
                        <div class="fi-body">${indexHTML}</div>
                    </details>
                </aside>
                <main class="formacion-main reveal reveal-delay-1">
                    ${LumenUI.readerToolbarHTML()}
                    ${contentHTML}
                    <nav class="flat-nav" aria-label="Secciones anteriores y siguientes">
                        <button class="btn btn-outline" ${pos === 0 ? 'disabled' : ''} onclick="FormacionView.flatPrev()">← Anterior</button>
                        <span>${pos + 1} / ${flat.length}</span>
                        <button class="btn btn-outline" ${pos >= flat.length - 1 ? 'disabled' : ''} onclick="FormacionView.flatNext()">Siguiente →</button>
                    </nav>
                </main>
            </div>
        </div>`;
    },

    renderSantos: function(mod) {
        if (!this._unitId) this._unitId = mod.units[0].id;
        const unit = this._unit(mod, this._unitId);
        const tabs = mod.units.map(function(u) {
            return `<button class="tab-btn${u.id === unit.id ? ' active' : ''}" onclick="FormacionView.go('${mod.id}','${u.id}')">${u.title}</button>`;
        }).join('');

        const cards = (unit.saints || []).map(function(s) {
            const patron = (s.patronOf || []).length ? `<p class="saint-patron">Patrono de: ${s.patronOf.join(', ')}</p>` : '';
            return `<div class="saint-item reveal">
                <div class="si-head">
                    <div>
                        <h3>${s.name}</h3>
                        <p class="si-feast">Fiesta: ${s.feast || '—'}</p>
                        <p class="si-summary">${s.summary || ''}</p>
                    </div>
                    ${this.favHeart('santos', s.id, s.name, unit.title)}
                </div>
                <details class="si-details"><summary>Conocer su vida</summary><div class="reading-surface si-life">${(s.life || '').replace(/\n\n/g, '<br><br>')}</div></details>
                ${patron}
            </div>`;
        }, this).join('');

        return `
        <div class="view">
            <header class="formacion-mhead reveal">
                <button class="btn btn-icon" onclick="FormacionView.home()" aria-label="Volver a módulos">←</button>
                <div class="fm-title"><span class="fm-mod">${LumenIcons.santos}${mod.title}</span></div>
                <div class="fm-actions">${this.favHeart('formacion', mod.id + '||', mod.title)}</div>
            </header>
            <div class="devocional-tabs sainttabs" role="tablist">${tabs}</div>
            <div class="santos-grid">${cards}</div>
        </div>`;
    },

    _renderGlosTerms: function() {
        let all = [];
        const mod = this._mod('glosario');
        (mod.units || []).forEach(function(u) { all = all.concat((u.terms || []).map(function(t) { t._unit = u.title; return t; })); });
        const q = (this._glosQ || '').toLowerCase();
        if (q) all = all.filter(function(t) { return (t.term + ' ' + t.definition).toLowerCase().indexOf(q) > -1; });
        return all.map(function(t) {
            return `<div class="glos-item reveal">
                <details class="si-details"><summary><strong>${t.term}</strong> ${t._unit ? '<span class="glos-tag">' + t._unit + '</span>' : ''}</summary>
                    <div class="glos-def reading-surface">
                        <p>${t.definition}</p>
                        ${t.etymology ? `<p class="glos-ety"><strong>Etimología:</strong> ${t.etymology}</p>` : ''}
                        ${t.references ? `<p class="glos-ref"><strong>Referencia:</strong> ${t.references}</p>` : ''}
                        ${(t.relatedTerms || []).length ? `<p class="glos-rel"><strong>Relacionados:</strong> ${t.relatedTerms.join(', ')}</p>` : ''}
                    </div>
                </details>
                ${this.favHeart('glosario', t.id, t.term, 'Glosario')}
            </div>`;
        }, this).join('') || `<div class="state-container"><h3>Sin resultados</h3><p>Prueba con otro término.</p></div>`;
    },

    renderGlosario: function(mod) {
        let all = [];
        (mod.units || []).forEach(function(u) { all = all.concat((u.terms || [])); });
        return `
        <div class="view">
            <header class="formacion-mhead reveal">
                <button class="btn btn-icon" onclick="FormacionView.home()" aria-label="Volver a módulos">←</button>
                <div class="fm-title"><span class="fm-mod">${LumenIcons.scroll}${mod.title} <span class="fm-count">${all.length} términos</span></span></div>
                <div class="fm-actions">${this.favHeart('formacion', mod.id + '||', mod.title)}</div>
            </header>
            <div class="glos-search reveal">
                <input type="search" id="glos-input" class="style-input" placeholder="Buscar término… (ej. Eucaristía)" value="${this._glosQ}" oninput="FormacionView.glosSearch(this.value)">
            </div>
            <div id="glos-grid" class="glos-grid">${this._renderGlosTerms()}</div>
        </div>`;
    },

    renderFaq: function(mod) {
        const read = this._readProg()[mod.id] || {};
        const sections = (mod.units || []).map(function(u) {
            return `<div class="faq-unit reveal">
                <h3 class="faq-unit-title">${u.title}</h3>
                ${(u.questions || []).map(function(q) {
                    return `<details class="si-details faq-item"><summary>${q.question}</summary><div class="reading-surface glos-def">${q.answer.replace(/\n\n/g, '<br><br>')}</div></details>`;
                }).join('')}
            </div>`;
        }).join('');
        return `
        <div class="view">
            <header class="formacion-mhead reveal">
                <button class="btn btn-icon" onclick="FormacionView.home()" aria-label="Volver a módulos">←</button>
                <div class="fm-title"><span class="fm-mod">${LumenIcons.message}${mod.title}</span></div>
                <div class="fm-actions">${this.favHeart('formacion', mod.id + '||', mod.title)}</div>
            </header>
            <div class="faq-list">${sections}</div>
        </div>`;
    },

    init: function() {
        LumenRouter.initScrollReveal();
        LumenUI.applyReaderPrefs();
        const glos = document.getElementById('glos-input');
        if (glos && this._glosQ) glos.value = this._glosQ;
    }
};