/* Búsqueda global de contenido público.
   Indexa Formación, Oraciones, Rosario/Coronillas, Novenas, Planes, Blog y
   Actividades. Nunca indexa recursos, avisos, perfiles ni inscripciones. */
const LumenSearch = {
    _index: null,
    _results: [],
    _loading: null,
    _ready: false,

    _norm: function(value) {
        return String(value == null ? '' : value)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9ñ]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    },

    _entry: function(type, id, title, sub, body, parts, query, icon) {
        return {
            type: type, id: id, title: title || '', sub: sub || '', body: body || '',
            parts: parts || [], query: query || null, icon: icon || 'search',
            text: this._norm([title, sub, body].join(' '))
        };
    },

    _build: function() {
        const entries = [];
        // Formación
        if (typeof FORMACION_DATA !== 'undefined' && FORMACION_DATA.modules) {
            FORMACION_DATA.modules.forEach(function(mod) {
                entries.push(this._entry('formacion', mod.id, mod.title, mod.description || '', mod.description || '', ['formacion', mod.id], null, 'book'));
                (mod.units || []).forEach(function(unit) {
                    const unitParts = ['formacion', mod.id, unit.id];
                    entries.push(this._entry('formacion', mod.id + '/' + unit.id, unit.title, mod.title, unit.title || '', unitParts, null, 'book'));
                    (unit.subsections || unit.topics || []).forEach(function(sub) {
                        const title = sub.title || sub.question || '';
                        const body = [sub.content, sub.text, sub.summary, sub.question].filter(Boolean).join(' ');
                        entries.push(this._entry('formacion', mod.id + '/' + unit.id + '/' + sub.id, title, mod.title + ' · ' + unit.title, body, unitParts.concat(sub.id), null, 'book'));
                    }, this);
                }, this);
            }, this);
        }
        // Oraciones
        if (typeof ORACIONES_DATA !== 'undefined' && ORACIONES_DATA.categorias) {
            ORACIONES_DATA.categorias.forEach(function(cat) {
                entries.push(this._entry('oracion', cat.id, cat.title, cat.description || '', cat.description || '', ['oraciones', cat.id], null, 'oraciones'));
                (cat.oraciones || []).forEach(function(o) {
                    entries.push(this._entry('oracion', o.id, o.title, cat.title, (o.content || '') + ' ' + (o.prayer || ''), ['oraciones', cat.id], 'p=' + encodeURIComponent(o.id), 'oraciones'));
                }, this);
            }, this);
        }
        // Rosario convencional y eucarístico
        if (typeof ROSARIO_DATA !== 'undefined' && ROSARIO_DATA.sets) {
            const setLabel = { gozosos: 'Misterios gozosos', dolorosos: 'Misterios dolorosos', gloriosos: 'Misterios gloriosos', luminosos: 'Misterios luminosos' };
            Object.keys(ROSARIO_DATA.sets).forEach(function(set) {
                const list = ROSARIO_DATA.sets[set] || [];
                entries.push(this._entry('rosario', set, setLabel[set] || ('Misterios ' + set), 'Rosario convencional', list.map(function(m) { return (m.title || '') + ' ' + (m.biblicalText || ''); }).join(' '), ['rosario', set], null, 'rosario'));
                list.forEach(function(m) {
                    entries.push(this._entry('rosario', set + '/' + m.title, m.title, setLabel[set] || set, (m.biblicalText || '') + ' ' + (m.reference || ''), ['rosario', set], null, 'rosario'));
                }, this);
            }, this);
        }
        if (typeof ROSARIO_DATA !== 'undefined' && ROSARIO_DATA.eucaristico) {
            const e = ROSARIO_DATA.eucaristico;
            entries.push(this._entry('rosario', 'eucaristico', e.title, e.subtitle || '', (e.description || '') + ' ' + (e.mysteries || []).map(function(m) { return (m.title || '') + ' ' + (m.biblicalText || ''); }).join(' '), ['rosario', 'eucaristico'], null, 'heart'));
            (e.mysteries || []).forEach(function(m) {
                entries.push(this._entry('rosario', 'eucaristico/' + m.title, m.title, e.title, (m.biblicalText || '') + ' ' + (m.reference || ''), ['rosario', 'eucaristico'], null, 'heart'));
            }, this);
        }
        // Coronillas
        if (typeof CORONILLAS_DATA !== 'undefined') {
            Object.keys(CORONILLAS_DATA).forEach(function(id) {
                const c = CORONILLAS_DATA[id];
                const body = [c.description, c.subtitle].concat((c.sections || []).map(function(s) { return s.title; })).join(' ');
                entries.push(this._entry('rosario', id, c.title, c.subtitle || '', body, ['rosario', id], null, c.icon || 'rosario'));
            }, this);
        }
        // Novenas
        if (typeof NOVENAS_DATA !== 'undefined') {
            NOVENAS_DATA.forEach(function(n) {
                entries.push(this._entry('novena', n.id, n.title, n.description || '', (n.introduction || '') + ' ' + (n.days || []).map(function(d) { return (d.title || '') + ' ' + (d.meditation || ''); }).join(' '), ['novenas', n.id], null, 'novenas'));
            }, this);
        }
        // Planes
        if (typeof PLANES_DATA !== 'undefined' && PLANES_DATA.planes) {
            PLANES_DATA.planes.forEach(function(p) {
                entries.push(this._entry('plan', p.id, p.title, p.shortTitle || '', (p.description || '') + ' ' + (p.steps || []).map(function(s) { return (s.title || '') + ' ' + (s.reflection || ''); }).join(' '), ['planes', p.id], null, 'compass'));
            }, this);
        }
        // Actividades
        if (typeof LumenData !== 'undefined' && LumenData.eventos) {
            LumenData.eventos.forEach(function(ev) {
                entries.push(this._entry('actividad', ev.id, ev.titulo, ev.tipo === 'recurrente' ? 'Actividad semanal' : 'Actividad', [ev.descripcion, ev.ubicacion, ev.dia, ev.hora].filter(Boolean).join(' '), ['detalle', ev.id], null, 'calendar'));
            }, this);
        }
        // Blog
        if (typeof LumenData !== 'undefined' && LumenData.blogArticles) {
            LumenData.blogArticles.forEach(function(a) {
                entries.push(this._entry('blog', a.id, a.titulo || 'Artículo', a.autor || 'Blog LUMEN', [a.descripcion, a.contenido, a.texto].filter(Boolean).join(' '), ['blog'], null, 'book'));
            }, this);
        }
        this._index = entries;
        return entries;
    },

    ensureData: function() {
        if (this._ready) return Promise.resolve();
        if (this._loading) return this._loading;
        const jobs = [];
        if (typeof LumenAssets !== 'undefined') {
            ['formacion', 'oraciones', 'rosario', 'novenas', 'planes'].forEach(function(view) {
                jobs.push(LumenAssets.ensure(view));
            });
        }
        if (typeof LumenData !== 'undefined' && LumenData.loadEventos) {
            jobs.push(LumenData.loadEventos().catch(function() {}));
        }
        if (typeof LumenData !== 'undefined' && LumenData.loadBlog) {
            jobs.push(LumenData.loadBlog().catch(function() {}));
        }
        this._loading = Promise.allSettled(jobs).then(() => {
            this._build();
            this._ready = true;
            this._loading = null;
        }).catch((err) => {
            this._ready = false;
            this._loading = null;
            throw err;
        });
        return this._loading;
    },

    open: function() {
        if (typeof LumenUI === 'undefined') return;
        LumenUI.openModal('search-modal');
        const input = document.getElementById('global-search-input');
        if (input) {
            input.value = '';
            setTimeout(function() { try { input.focus(); } catch (e) {} }, 60);
        }
        const box = document.getElementById('global-search-results');
        if (box) box.innerHTML = '<p class="search-hint">Cargando el índice de contenido…</p>';
        this.ensureData().then(() => {
            this._build();
            this.run();
        }).catch(() => {
            if (box) box.innerHTML = '<p class="search-hint">No se pudo cargar el índice. Revisa tu conexión.</p>';
        });
    },

    close: function() {
        if (typeof LumenUI !== 'undefined') LumenUI.closeModal('search-modal');
    },

    run: function() {
        const input = document.getElementById('global-search-input');
        const box = document.getElementById('global-search-results');
        if (!input || !box) return;
        const q = input.value.trim();
        if (!q) {
            box.innerHTML = `<div class="search-quick">
                <span class="search-hint">Busca en toda la app: formación, oraciones, rosario, novenas, planes, blog y actividades.</span>
                <div class="search-quick-links">
                    <button type="button" onclick="LumenSearch.fill('rosario')">Rosario</button>
                    <button type="button" onclick="LumenSearch.fill('adviento')">Adviento</button>
                    <button type="button" onclick="LumenSearch.fill('misericordia')">Misericordia</button>
                    <button type="button" onclick="LumenSearch.fill('oración')">Oración</button>
                </div>
            </div>`;
            this._results = [];
            return;
        }
        const tokens = this._norm(q).split(' ').filter(Boolean);
        if (!this._index) this._build();
        const scored = [];
        (this._index || []).forEach(function(e) {
            const title = this._norm(e.title);
            let score = 0;
            let all = true;
            tokens.forEach(function(t) {
                if (title.indexOf(t) === 0) score += 12;
                else if (title.indexOf(t) > -1) score += 7;
                else if (e.text.indexOf(t) > -1) score += 2;
                else all = false;
            });
            if (all && score > 0) scored.push({ e: e, score: score });
        }, this);
        scored.sort(function(a, b) { return b.score - a.score || a.e.title.localeCompare(b.e.title); });
        this._results = scored.slice(0, 20).map(function(x) { return x.e; });
        if (!this._results.length) {
            box.innerHTML = `<p class="search-hint">No encontramos resultados para “${LumenUI.escapeHTML(q)}”. Prueba con otra palabra.</p>`;
            return;
        }
        const typeLabel = { formacion: 'Formación', oracion: 'Oración', rosario: 'Rosario', novena: 'Novena', plan: 'Plan', actividad: 'Actividad', blog: 'Blog' };
        box.innerHTML = `<p class="search-count">${this._results.length} resultado${this._results.length === 1 ? '' : 's'}</p>` +
            this._results.map(function(e, i) {
                const icon = (typeof LumenIcons !== 'undefined' && LumenIcons[e.icon]) ? LumenIcons[e.icon] : LumenIcons.search;
                return `<button type="button" class="search-result" data-search-index="${i}">
                    <span class="search-result-icon">${icon}</span>
                    <span class="search-result-copy"><strong>${LumenUI.escapeHTML(e.title)}</strong><small>${LumenUI.escapeHTML(e.sub || typeLabel[e.type] || '')}</small></span>
                    <span class="search-result-type">${typeLabel[e.type] || ''}</span>
                </button>`;
            }).join('');
    },

    fill: function(value) {
        const input = document.getElementById('global-search-input');
        if (!input) return;
        input.value = value;
        this.run();
        try { input.focus(); } catch (e) {}
    },

    openResult: function(index) {
        const e = this._results[index];
        if (!e) return;
        this.close();
        try {
            if (e.type === 'oracion' && typeof OracionesView !== 'undefined') return OracionesView.openPrayer(e.id);
            if (e.type === 'formacion' && typeof FormacionView !== 'undefined') return FormacionView.go(e.parts[1], e.parts[2], e.parts[3]);
            if (e.type === 'rosario' && typeof RosarioView !== 'undefined') {
                const raw = String(e.id || '');
                const slash = raw.indexOf('/');
                const set = slash > -1 ? raw.slice(0, slash) : raw;
                const title = slash > -1 ? raw.slice(slash + 1) : '';
                if (set === 'eucaristico') {
                    return (title && RosarioView.openEucharisticMystery)
                        ? RosarioView.openEucharisticMystery(title)
                        : RosarioView.openEucharistic();
                }
                if (typeof CORONILLAS_DATA !== 'undefined' && CORONILLAS_DATA[e.id]) return RosarioView.openCoronilla(e.id);
                if (typeof ROSARIO_DATA !== 'undefined' && ROSARIO_DATA.sets[set]) {
                    return (title && RosarioView.openMystery)
                        ? RosarioView.openMystery(set, title)
                        : RosarioView.pick(set);
                }
                return RosarioView.openConventional();
            }
            if (e.type === 'novena' && typeof NovenasView !== 'undefined') return NovenasView.open(e.id);
            if (e.type === 'plan' && typeof PlanesView !== 'undefined') return PlanesView.open(e.id);
            if (e.type === 'actividad' && typeof LumenData !== 'undefined') {
                LumenData.selectedEventId = e.id;
                return LumenRouter.navigateTo('detalle');
            }
            if (e.type === 'blog' && typeof BlogView !== 'undefined') {
                LumenRouter.navigateTo('blog');
                if (typeof BlogView.viewArticle === 'function') BlogView.viewArticle(e.id);
                return;
            }
            if (e.type === 'blog') return LumenRouter.navigateTo('blog');
        } catch (err) {
            console.error('[LumenSearch] openResult', err);
        }
        location.href = (typeof LumenRouter !== 'undefined') ? LumenRouter.hrefFor(e.parts, e.query) : ('/' + (e.parts || []).join('/'));
    }
};

document.addEventListener('input', function(event) {
    if (event.target && event.target.id === 'global-search-input') LumenSearch.run();
});

document.addEventListener('click', function(event) {
    const result = event.target && event.target.closest ? event.target.closest('[data-search-index]') : null;
    if (result) {
        event.preventDefault();
        LumenSearch.openResult(Number(result.getAttribute('data-search-index')));
        return;
    }
    const opener = event.target && event.target.closest ? event.target.closest('[data-search-open]') : null;
    if (opener) {
        event.preventDefault();
        LumenSearch.open();
    }
});

document.addEventListener('keydown', function(event) {
    const tag = (event.target && event.target.tagName) || '';
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (event.target && event.target.isContentEditable);
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        LumenSearch.open();
        return;
    }
    if (event.key === '/' && !typing) {
        event.preventDefault();
        LumenSearch.open();
    }
});
