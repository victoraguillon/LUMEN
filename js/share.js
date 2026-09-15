// LUMEN · Compartir como imagen (PNG)
// Genera una tarjeta de marca LUMEN, la renderiza con html2canvas (ya cargado por CDN)
// y la comparte como archivo vía la hoja nativa del dispositivo o la descarga.
// Colores en hex fijo a propósito: la tarjeta no debe heredar el tema oscuro de la app.
const LumenShare = {
    _stage: null,
    _fitFloor: null,
    _maxH: 2640,

    // ---- utilidades ----
    _todayLong: function() {
        return new Intl.DateTimeFormat('es-VE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
    },
    _dateSlug: function() {
        const d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    },
    _slug: function(str) {
        return String(str || 'lumen')
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 60) || 'lumen';
    },
    _paras: function(text) {
        return String(text || '')
            .replace(/\r\n/g, '\n')
            .split(/\n\s*\n+/)
            .map(function(s) { return s.trim(); })
            .filter(Boolean);
    },
    _fontsReady: function() {
        if (!document.fonts) return Promise.resolve();
        const loads = [];
        try {
            loads.push(document.fonts.load('700 44px Cinzel'));
            loads.push(document.fonts.load('italic 400 60px "Crimson Text"'));
            loads.push(document.fonts.load('300 30px Poppins'));
            loads.push(document.fonts.load('600 24px Poppins'));
        } catch (e) {}
        return Promise.all(loads).catch(function() {}).then(function() {
            return document.fonts.ready;
        }).catch(function() {});
    },

    // ---- HTML de la tarjeta ----
    buildCard: function(o) {
        const esc = LumenUI.escapeHTML;
        const date = o.date ? '<div class="sc-date">' + esc(o.date) + '</div>' : '';
        const img = o.image ? '<img class="sc-image" alt="" crossorigin="anonymous" src="' + esc(o.image) + '">' : '';
        const kind = o.kind ? '<div class="sc-eyebrow">' + esc(o.kind) + '</div>' : '';
        const title = o.title ? '<h1 class="sc-title">' + esc(o.title) + '</h1>' : '';
        const quote = o.quote ? '<blockquote class="sc-quote">\u201C' + esc(o.quote) + '\u201D</blockquote>' : '';
        const cite = o.cite ? '<div class="sc-cite">' + esc(o.cite) + '</div>' : '';
        const subhead = o.subhead ? '<div class="sc-subhead">' + esc(o.subhead) + '</div>' : '';
        const paras = (o.paragraphs && o.paragraphs.length)
            ? '<div class="sc-body">' + o.paragraphs.map(function(p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>'
            : '';
        const foot = o.footnote ? '<span class="sc-footnote">' + esc(o.footnote) + '</span>' : '';
        return '<div class="share-card' + (o.theme ? ' sc-th-' + o.theme : '') + '">'
            + '<div class="sc-topbar"></div>'
            + '<div class="sc-inner">'
            + '<header class="sc-head"><div class="sc-brand"><span class="sc-mark">' + (typeof LumenIcons !== 'undefined' && LumenIcons.cross ? LumenIcons.cross : '') + '</span>LUMEN</div>' + date + '</header>'
            + img + kind + title + quote + cite + subhead + paras
            + '<footer class="sc-foot"><span class="sc-rule"></span>'
            + '<div class="sc-foot-row"><strong>LUMEN</strong>' + foot + '<span>lumenve.vercel.app</span></div>'
            + '</footer>'
            + '</div></div>';
    },

    buttonHTML: function(fn, label, cls) {
        return '<button class="btn btn-share' + (cls ? ' ' + cls : '') + '" onclick="' + fn + '" aria-label="Compartir como imagen">'
            + (typeof LumenIcons !== 'undefined' && LumenIcons.share ? LumenIcons.share : '')
            + ' <span>' + (label || 'Compartir imagen') + '</span></button>';
    },

    // ---- pipeline de render ----
    _cleanup: function() {
        if (this._stage && this._stage.parentNode) this._stage.parentNode.removeChild(this._stage);
        this._stage = null;
    },
    _prepareImage: function(opts) {
        if (!opts.image) return Promise.resolve(opts);
        return new Promise(function(resolve) {
            const img = new Image();
            if (String(opts.image).indexOf('data:') !== 0) img.crossOrigin = 'anonymous';
            img.onload = function() { resolve(opts); };
            img.onerror = function() {
                const o = Object.assign({}, opts);
                delete o.image;
                resolve(o);
            };
            img.src = opts.image;
        });
    },
    _waitImages: function(stage) {
        const imgs = Array.prototype.slice.call(stage.querySelectorAll('img'));
        if (!imgs.length) return Promise.resolve();
        return Promise.all(imgs.map(function(img) {
            if (img.complete) return Promise.resolve();
            return new Promise(function(res) {
                img.addEventListener('load', res, { once: true });
                img.addEventListener('error', res, { once: true });
                setTimeout(res, 3000);
            });
        }));
    },
    // ---- ajuste de tamaño ----
    // Reúne el texto compartible más largo del programa (formación, santos, devocional,
    // frases y el límite de blog) para usarlo como referencia de tamaño de la tarjeta.
    _probeParaLargo: function() {
        let best = { n: 0, paras: [] };
        const pra = this._paras;
        const consider = function(blob) {
            const n = String(blob || '').length;
            if (n > best.n) best = { n: n, paras: pra(blob) };
        };
        if (typeof FORMACION_DATA !== 'undefined' && FORMACION_DATA.modules) {
            FORMACION_DATA.modules.forEach(function(mod) {
                (mod.units || []).forEach(function(u) {
                    (u.subsections || u.topics || []).forEach(function(it) {
                        if (mod.tipo === 'preguntas') consider(String(it.answer || '') + '\n\n' + String(it.explanation || ''));
                        else consider(it.content);
                    });
                    (u.saints || []).forEach(function(s) { consider(s.life); });
                    (u.terms || []).forEach(function(t) { consider(t.definition); });
                    (u.questions || []).forEach(function(q) { consider(q.answer); });
                });
            });
        }
        if (typeof SANTORAL !== 'undefined') {
            Object.keys(SANTORAL).forEach(function(k) { consider(SANTORAL[k].b); });
        }
        if (typeof DEVOCIONAL_DATA !== 'undefined' && DEVOCIONAL_DATA.pasajes_dia) {
            DEVOCIONAL_DATA.pasajes_dia.forEach(function(p) { consider(p.reflection); });
        }
        if (typeof FRASES_SANTOS !== 'undefined') {
            FRASES_SANTOS.forEach(function(f) { consider(f.frase); });
        }
        // blog: el share limita a 4 párrafos (posición máxima posible)
        consider('x'.repeat(480) + '\n\n' + 'x'.repeat(480) + '\n\n' + 'x'.repeat(480) + '\n\n' + 'x'.repeat(480));
        return best.paras;
    },
    // Calcula una sola vez (por sesión) el "suelo" de escala y el tope de altura de la
    // tarjeta a partir del texto más largo medido en pantalla (con las tipografías cargadas).
    _computeFitFloor: function() {
        if (this._fitFloor) return;
        const self = this;
        const paras = this._probeParaLargo();
        if (!paras.length) { this._fitFloor = 0.55; return; }
        const st = document.createElement('div');
        st.className = 'share-stage';
        document.body.appendChild(st);
        try {
            st.innerHTML = self.buildCard({
                theme: 'formacion',
                kind: 'Formación · Referencia · Título de sección muy largo',
                title: '¿Cuál es la pregunta más extensa que puede publicarse aquí?',
                subhead: 'Fiesta: 15 de septiembre',
                date: self._todayLong(),
                paragraphs: paras
            });
            const natural = st.querySelector('.sc-inner').scrollHeight;
            if (natural > 1920) {
                // Escala "suelo": ajusta el texto más largo dentro de un lienzo de historia alto.
                this._fitFloor = Math.min(0.95, Math.max(0.52, (2640 * 0.9) / natural));
                this._maxH = Math.max(1920, Math.round(natural * this._fitFloor) + 8);
            } else {
                this._fitFloor = 1;
                this._maxH = 1920;
            }
        } finally {
            if (st.parentNode) st.parentNode.removeChild(st);
        }
    },
    // Ajusta la tarjeta al lienzo de historia, tomando el tamaño como referencia del texto más
    // largo: escala --sc hasta un "suelo" de legibilidad y, si el contenido aún no cabe, crece
    // la altura (--sc-h) en vez de recortar. El formato sigue siendo retrato tipo historia.
    _fit: function(stage) {
        const card = stage.querySelector('.share-card');
        const inner = stage.querySelector('.sc-inner');
        if (!card || !inner) return;
        this._computeFitFloor();
        const target = 1920;
        const floor = this._fitFloor || 0.55;
        const natural = inner.scrollHeight;
        card.style.setProperty('--sc', '1');
        if (natural <= target + 2) {
            card.style.setProperty('--sc-h', target + 'px');
            return;
        }
        let s = target / natural;
        let h = natural * s;
        if (h > this._maxH) { s = Math.max(s, (this._maxH * 0.92) / natural); h = natural * s; }
        s = Math.max(s, floor);
        h = natural * s;
        if (h > this._maxH) { s = this._maxH / natural; h = this._maxH; }
        card.style.setProperty('--sc', s.toFixed(4));
        card.style.setProperty('--sc-h', String(Math.max(target, Math.round(h))) + 'px');
    },
    _render: function(opts) {
        const self = this;
        this._cleanup();
        return this._prepareImage(opts).then(function(o) {
            const stage = document.createElement('div');
            stage.className = 'share-stage';
            stage.setAttribute('aria-hidden', 'true');
            stage.innerHTML = self.buildCard(o);
            document.body.appendChild(stage);
            self._stage = stage;
            return self._fontsReady().then(function() {
                return self._waitImages(stage);
            }).then(function() {
                const card = stage.querySelector('.share-card');
                if (!card || typeof html2canvas === 'undefined') throw new Error('html2canvas no disponible');
                self._fit(stage);
                return html2canvas(card, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
            });
        });
    },
    _toCanvas: function(opts) {
        const self = this;
        return this._render(opts).catch(function(err) {
            if (!opts.image) throw err;
            console.warn('[share] render con imagen falló, reintentando sin imagen', err);
            const o = Object.assign({}, opts);
            delete o.image;
            return self._render(o);
        });
    },
    _download: function(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = filename;
        a.href = url;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function() { URL.revokeObjectURL(url); }, 5000);
        LumenUI.showToast('Imagen lista: revisa tus descargas', 'success');
    },
    share: function(opts, filename, shareText) {
        const self = this;
        return this._toCanvas(opts).then(function(canvas) {
            return new Promise(function(resolve) { canvas.toBlob(resolve, 'image/png'); });
        }).then(function(blob) {
            self._cleanup();
            if (!blob) { LumenUI.showToast('No se pudo generar la imagen', 'error'); return; }
            const file = new File([blob], filename, { type: 'image/png' });
            const isTouch = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({ files: [file], title: opts.shareTitle || 'LUMEN', text: shareText || '' })
                    .catch(function(err) {
                        if (err && err.name === 'AbortError') {
                            // En táctil, AbortError = el usuario cerró la hoja nativa: no descargar.
                            if (isTouch) return;
                            // En escritorio muchos navegadores exponen share() pero lo abortan sin hoja nativa.
                            self._download(blob, filename);
                            return;
                        }
                        self._download(blob, filename);
                    });
            } else {
                self._download(blob, filename);
            }
        }).catch(function(err) {
            console.error('[share]', err);
            self._cleanup();
            LumenUI.showToast('No se pudo generar la imagen', 'error');
        });
    },

    // ---- generadores por contenido ----
    friendlyReminder: function() {
        const dayOfMonth = new Date().getDate();
        const list = (typeof FRASES_SANTOS !== 'undefined' && FRASES_SANTOS.length) ? FRASES_SANTOS : [];
        const f = list.length ? list[(dayOfMonth - 1) % list.length] : { frase: 'Dios nos ama y nos acompaña siempre.', autor: 'Lumen' };
        this.share({
            kind: 'Friendly Reminder',
            theme: 'reminder',
            quote: f.frase,
            cite: f.autor,
            date: this._todayLong(),
            shareTitle: 'Friendly Reminder (LUMEN)'
        }, 'friendly-reminder-' + this._dateSlug() + '.png', '\u201C' + f.frase + '\u201D\n(' + f.autor + ')\n\n(lumenve.vercel.app)');
    },

    alimentoDia: function() {
        const list = (typeof DEVOCIONAL_DATA !== 'undefined' && DEVOCIONAL_DATA.pasajes_dia) ? DEVOCIONAL_DATA.pasajes_dia : [];
        if (!list.length) { LumenUI.showToast('No hay pasaje disponible', 'error'); return; }
        const p = list[(new Date().getDate() - 1) % list.length];
        this.share({
            kind: 'Alimento de Hoy',
            theme: 'devocional',
            quote: p.text,
            cite: p.cite,
            subhead: 'Reflexión',
            paragraphs: [p.reflection],
            date: this._todayLong(),
            shareTitle: 'Alimento de Hoy (LUMEN)'
        }, 'alimento-de-hoy-' + this._dateSlug() + '.png',
        '\u201C' + p.text + '\u201D\n(' + p.cite + ')\n\n' + p.reflection + '\n\n(lumenve.vercel.app)');
    },

    santoDia: function() {
        const d = new Date();
        const key = String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        const s = (typeof SANTORAL !== 'undefined' && SANTORAL[key]) ? SANTORAL[key] : null;
        if (!s) { LumenUI.showToast('No hay santo registrado para hoy', 'error'); return; }
        this.share({
            kind: 'Santo del día',
            theme: 'santo',
            title: s.n,
            paragraphs: this._paras(s.b),
            date: this._todayLong(),
            shareTitle: 'Santo del día (LUMEN)'
        }, 'santo-del-dia-' + this._dateSlug() + '.png', s.n + '\n\n' + s.b + '\n\n(lumenve.vercel.app)');
    },

    blogArticle: function(id) {
        const self = this;
        if (typeof supabase === 'undefined' || !id) return;
        supabase.from('articulos').select('*').eq('id', id).single().then(function(res) {
            const a = res && res.data;
            if (!a) { LumenUI.showToast('No se pudo cargar el artículo', 'error'); return; }
            const date = new Date(a.timestamp).toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' });
            const body = self._paras(a.contenido).slice(0, 4).map(function(p) { return p.length > 480 ? p.slice(0, 477) + '…' : p; });
            self.share({
                kind: 'Blog católico',
                theme: 'blog',
                title: a.titulo,
                image: a.image_url ? LumenUI.sanitizeImageUrl(a.image_url) : '',
                paragraphs: body,
                cite: a.author_name,
                date: date,
                shareTitle: a.titulo + ' (LUMEN)'
            }, 'articulo-' + self._slug(a.titulo) + '.png',
            a.titulo + '\n\n' + String(a.contenido || '').slice(0, 300) + '…\n\n(lumenve.vercel.app)');
        }).catch(function(err) {
            console.error('[share] blog', err);
            LumenUI.showToast('No se pudo cargar el artículo', 'error');
        });
    },

    formacionSection: function() {
        const FV = (typeof FormacionView !== 'undefined') ? FormacionView : null;
        if (!FV || !FV._moduleId) { LumenUI.showToast('Abre una sección de formación primero', 'error'); return; }
        const mod = FV._mod(FV._moduleId);
        if (!mod) return;
        const unit = FV._unit(mod, FV._unitId);
        const items = unit ? (unit.subsections || unit.topics || []) : [];
        const item = items.find(function(x) { return x.id === FV._subId; });
        if (!item) { LumenUI.showToast('No se encontró la sección', 'error'); return; }
        const isQ = mod.tipo === 'preguntas';
        const title = isQ ? item.question : item.title;
        let paras = [];
        if (isQ) {
            paras = this._paras(item.answer);
            if (item.explanation) paras = paras.concat(this._paras(item.explanation));
        } else {
            paras = this._paras(item.content);
        }
        this.share({
            kind: mod.title + (unit ? ' · ' + unit.title : ''),
            theme: 'formacion',
            title: title,
            paragraphs: paras,
            date: this._todayLong(),
            shareTitle: title + ' (LUMEN)'
        }, 'formacion-' + this._slug(mod.id) + '-' + this._slug(title) + '.png',
        title + '\n\n' + paras.join('\n\n').slice(0, 400) + '…\n\n(lumenve.vercel.app)');
    },

    formacionSaint: function(id) {
        const FV = (typeof FormacionView !== 'undefined') ? FormacionView : null;
        const mod = FV ? FV._mod('santos') : null;
        if (!mod) return;
        let unit = null, saint = null;
        (mod.units || []).forEach(function(u) {
            (u.saints || []).forEach(function(s) {
                if (s.id === id) { unit = u; saint = s; }
            });
        });
        if (!saint) { LumenUI.showToast('No se encontró el santo', 'error'); return; }
        this.share({
            kind: 'Santos · ' + (unit ? unit.title : mod.title),
            theme: 'santo',
            title: saint.name,
            subhead: saint.feast ? 'Fiesta: ' + saint.feast : '',
            cite: (saint.patronOf && saint.patronOf.length) ? 'Patrono de: ' + saint.patronOf.join(', ') : '',
            paragraphs: this._paras(saint.life),
            date: this._todayLong(),
            shareTitle: saint.name + ' (LUMEN)'
        }, 'santo-' + this._slug(saint.name) + '.png',
        saint.name + '\n\n' + String(saint.life || '').slice(0, 400) + '…\n\n(lumenve.vercel.app)');
    },

    formacionTerm: function(id) {
        const FV = (typeof FormacionView !== 'undefined') ? FormacionView : null;
        const mod = FV ? FV._mod('glosario') : null;
        if (!mod) return;
        let unit = null, term = null;
        (mod.units || []).forEach(function(u) {
            (u.terms || []).forEach(function(t) {
                if (t.id === id) { unit = u; term = t; }
            });
        });
        if (!term) { LumenUI.showToast('No se encontró el término', 'error'); return; }
        this.share({
            kind: 'Glosario · ' + (unit ? unit.title : mod.title),
            theme: 'formacion',
            title: term.term,
            subhead: term.etymology ? 'Etimología: ' + term.etymology : '',
            paragraphs: this._paras(term.definition),
            footnote: term.references ? 'Referencia: ' + term.references : '',
            date: this._todayLong(),
            shareTitle: term.term + ' (LUMEN)'
        }, 'glosario-' + this._slug(term.term) + '.png',
        term.term + '\n\n' + String(term.definition || '').slice(0, 400) + '…\n\n(lumenve.vercel.app)');
    },

    formacionFaq: function(unitId, idx) {
        const FV = (typeof FormacionView !== 'undefined') ? FormacionView : null;
        const mod = FV ? FV._mod('faq') : null;
        if (!mod) return;
        const unit = FV._unit(mod, unitId);
        const q = unit && unit.questions ? unit.questions[idx] : null;
        if (!q) { LumenUI.showToast('No se encontró la pregunta', 'error'); return; }
        this.share({
            kind: 'FAQ · ' + (unit ? unit.title : mod.title),
            theme: 'formacion',
            title: q.question,
            paragraphs: this._paras(q.answer),
            date: this._todayLong(),
            shareTitle: q.question + ' (LUMEN)'
        }, 'faq-' + this._slug(q.question) + '.png',
        q.question + '\n\n' + String(q.answer || '').slice(0, 400) + '…\n\n(lumenve.vercel.app)');
    }
};
