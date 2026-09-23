// LUMEN · Compartir como imagen (PNG) — tarjetas en formatos seleccionables:
// historia 9:16 (1080×1920), post vertical 4:5 (1080×1350) y post cuadrado
// 1:1 (1080×1080). El usuario elige el formato ANTES de generar; la última
// elección se recuerda en localStorage. El contenido se distribuye en N páginas
// (1, 2, ...) medidas con las fuentes ya cargadas: nada se recorta, TODO el
// contenido queda visible al 100% y la imagen final es idéntica en cualquier
// dispositivo (captura con escala 2 fija, sin gap de flex ni margin-top:auto,
// para que html2canvas renderice fiel al DOM).
const LumenShare = {
    _stage: null,
    FORMATS: {
        historia: { w: 1080, h: 1920, label: 'Historia', hint: '9:16 · 1080×1920', desc: 'Para Instagram Stories y estados de WhatsApp' },
        post: { w: 1080, h: 1350, label: 'Post vertical', hint: '4:5 · 1080×1350', desc: 'Recomendado para el feed de Instagram' },
        cuadrado: { w: 1080, h: 1080, label: 'Post cuadrado', hint: '1:1 · 1080×1080', desc: 'Clásico para el feed' }
    },
    _fmtKey: 'historia',
    PAGE_W: 1080,
    PAGE_H: 1920,

    // ---- formato de página ----
    setFormat: function(key) {
        const f = this.FORMATS[key] || this.FORMATS.historia;
        this._fmtKey = f === this.FORMATS.historia ? 'historia' : key;
        this.PAGE_W = f.w;
        this.PAGE_H = f.h;
        return f;
    },
    _rememberFmt: function() {
        if (typeof localStorage === 'undefined') return 'historia';
        try {
            const saved = localStorage.getItem('lumen_share_fmt');
            return this.FORMATS[saved] ? saved : 'historia';
        } catch (e) { return 'historia'; }
    },
    _filenameFor: function(fmt, name) {
        if (!fmt || fmt === 'historia') return String(name);
        const base = String(name).replace(/\.png$/i, '');
        return base + '-' + fmt + '.png';
    },
    // Selector de formato previo a la generación. Resuelve la clave elegida o
    // null si se cancela (clic fuera / Escape / botón cerrar).
    chooseFormat: function() {
        const self = this;
        if (typeof document === 'undefined' || !document.body || typeof document.createElement !== 'function') {
            return Promise.resolve(this._rememberFmt() || 'historia');
        }
        const saved = this._rememberFmt();
        return new Promise(function(resolve) {
            let settled = false;
            const settle = function(key) {
                if (settled) return;
                settled = true;
                document.removeEventListener('keydown', onKey, true);
                if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
                if (key && key !== 'historia') {
                    try { localStorage.setItem('lumen_share_fmt', key); } catch (e) {}
                }
                resolve(key);
            };
            const onKey = function(e) { if (e.key === 'Escape') settle(null); };
            document.addEventListener('keydown', onKey, true);

            const overlay = document.createElement('div');
            overlay.className = 'share-fmt-overlay';
            overlay.setAttribute('role', 'presentation');
            const sheet = document.createElement('div');
            sheet.className = 'share-fmt-sheet';
            sheet.setAttribute('role', 'dialog');
            sheet.setAttribute('aria-modal', 'true');
            sheet.setAttribute('aria-label', 'Elige el formato de la imagen');

            const head = document.createElement('div');
            head.className = 'share-fmt-head';
            const title = document.createElement('div');
            title.className = 'share-fmt-title';
            title.textContent = 'Elige el formato';
            const close = document.createElement('button');
            close.type = 'button';
            close.className = 'share-fmt-close';
            close.setAttribute('aria-label', 'Cancelar');
            close.innerHTML = '&times;';
            close.addEventListener('click', function() { settle(null); });
            head.appendChild(title);
            head.appendChild(close);

            const grid = document.createElement('div');
            grid.className = 'share-fmt-grid';
            Object.keys(self.FORMATS).forEach(function(k) {
                const f = self.FORMATS[k];
                const opt = document.createElement('button');
                opt.type = 'button';
                opt.className = 'share-fmt-opt' + (k === saved ? ' is-selected' : '');
                opt.setAttribute('data-fmt', k);
                const ratio = document.createElement('span');
                ratio.className = 'share-fmt-ratio share-fmt-ratio-' + k;
                ratio.setAttribute('aria-hidden', 'true');
                const name = document.createElement('span');
                name.className = 'share-fmt-name';
                name.textContent = f.label;
                const hint = document.createElement('span');
                hint.className = 'share-fmt-hint';
                hint.textContent = f.hint;
                const desc = document.createElement('span');
                desc.className = 'share-fmt-desc';
                desc.textContent = f.desc;
                opt.appendChild(ratio);
                opt.appendChild(name);
                opt.appendChild(hint);
                opt.appendChild(desc);
                opt.addEventListener('click', function() { settle(k); });
                grid.appendChild(opt);
            });

            sheet.appendChild(head);
            sheet.appendChild(grid);
            overlay.appendChild(sheet);
            overlay.addEventListener('click', function(e) { if (e.target === overlay) settle(null); });
            document.body.appendChild(overlay);
        });
    },

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
            loads.push(document.fonts.load('700 54px "Cinzel"'));
            loads.push(document.fonts.load('700 44px "Cinzel"'));
            loads.push(document.fonts.load('italic 400 62px "Crimson Text"'));
            loads.push(document.fonts.load('italic 400 60px "Crimson Text"'));
            loads.push(document.fonts.load('300 30px "Poppins"'));
            loads.push(document.fonts.load('400 22px "Poppins"'));
            loads.push(document.fonts.load('500 22px "Poppins"'));
            loads.push(document.fonts.load('600 23px "Poppins"'));
            loads.push(document.fonts.load('700 22px "Poppins"'));
        } catch (e) {}
        return Promise.all(loads).catch(function() {}).then(function() {
            return document.fonts.ready;
        }).catch(function() {});
    },

    // ---- HTML de la tarjeta ----
    // page: { hero:bool, texts:[string], num:number, total:number }
    buildCard: function(o, page) {
        const esc = LumenUI.escapeHTML;
        const total = (page && page.total) || 1;
        const hero = !page || page.hero !== false;
        const texts = (page && page.texts) || [];
        const date = o.date ? '<div class="sc-date">' + esc(o.date) + '</div>' : '';
        const img = hero && o.image ? '<img class="sc-image" alt="" crossorigin="anonymous" src="' + esc(o.image) + '">' : '';
        const kind = hero && o.kind ? '<div class="sc-eyebrow">' + esc(o.kind) + '</div>' : '';
        const title = hero && o.title ? '<h1 class="sc-title">' + esc(o.title) + '</h1>' : '';
        const quote = hero && o.quote ? '<blockquote class="sc-quote">\u201C' + esc(o.quote) + '\u201D</blockquote>' : '';
        const cite = hero && o.cite ? '<div class="sc-cite">' + esc(o.cite) + '</div>' : '';
        // Devocional: el título «Reflexión» acompaña a los textos de la reflexión
        // (imagen con la reflexión, nunca suelto sobre el alimento). El resto de
        // temas conserva el subhead solo en la página héroe, como siempre.
        const showSub = (o.theme === 'devocional') ? (texts.length > 0) : hero;
        const subhead = showSub && o.subhead ? '<div class="sc-subhead">' + esc(o.subhead) + '</div>' : '';
        const paras = texts.length
            ? '<div class="sc-body">' + texts.map(function(p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>'
            : '';
        const pageLabel = total > 1 ? '<div class="sc-page">' + (page.num || 1) + ' / ' + total + '</div>' : '';
        const foot = o.footnote ? '<span class="sc-footnote">' + esc(o.footnote) + '</span>' : '';
        return '<div class="share-card' + (o.theme ? ' sc-th-' + o.theme : '') + '">'
            + '<div class="sc-topbar"></div>'
            + '<div class="sc-inner">'
            + '<header class="sc-head"><div class="sc-brand"><span class="sc-mark">' + (typeof LumenIcons !== 'undefined' && LumenIcons.cross ? LumenIcons.cross : '') + '</span>LUMEN</div>' + date + '</header>'
            + pageLabel + img + kind + title + quote + cite + subhead + paras
            + '<div class="sc-spacer"></div>'
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
    // Mide el alto real del contenido (incluye paddings y márgenes) sin el
    // clamp de min-height, para saber si cabe en una página de 1920px.
    _measureInnerHeight: function(stage, minH) {
        const card = stage.querySelector('.share-card');
        const inner = stage.querySelector('.sc-inner');
        if (!card || !inner) return Infinity;
        card.style.setProperty('--sc', '1');
        card.style.setProperty('--sc-h', String(minH || 8) + 'px');
        const prev = inner.style.height;
        inner.style.height = 'auto';
        const h = inner.scrollHeight;
        inner.style.height = prev;
        return h;
    },

    // ---- paginación ----
    // Reparte los párrafos en páginas { hero, texts }. La primera página lleva
    // el hero (título/cita/imagen/...) y las siguientes solo texto.
    _splitLong: function(o, stage, para) {
        const self = this;
        // El render añade el indicador "n / N" cuando hay más de una página, así
        // que la medición reserva ese espacio (total 2) para no desbordar.
        const fits = function(texts) {
            stage.innerHTML = self.buildCard(o, { hero: false, texts: texts, num: 1, total: 2 });
            return self._measureInnerHeight(stage, 8) <= self.PAGE_H;
        };
        const units = String(para).split(/(?<=[.!?…])\s+/).filter(Boolean);
        if (!units.length) units.push(String(para));
        const worlds = [];
        let buf = '';
        units.forEach(function(u) {
            const cand = buf ? buf + ' ' + u : u;
            if (fits([cand])) { buf = cand; return; }
            if (buf) worlds.push({ hero: false, texts: [buf] });
            if (fits([u])) { buf = u; return; }
            worlds.push({ hero: false, texts: [u] });
            buf = '';
        });
        if (buf) worlds.push({ hero: false, texts: [buf] });
        return worlds.length ? worlds : [{ hero: false, texts: [String(para)] }];
    },
    _assignPages: function(o, paras) {
        const self = this;
        if (!paras || !paras.length) return [{ hero: true, texts: [] }];
        const pages = [];
        let current = { hero: true, texts: [] };
        const stage = document.createElement('div');
        stage.className = 'share-stage';
        stage.setAttribute('aria-hidden', 'true');
        document.body.appendChild(stage);
        const closeCurrent = function() { pages.push(current); };
        const fits = function(page, texts) {
            stage.innerHTML = self.buildCard(
                o,
                Object.assign({}, page, { texts: texts, num: 1, total: 2 })
            );
            return self._measureInnerHeight(stage, 8) <= self.PAGE_H;
        };
        const addToCurrent = function(texts) {
            current = Object.assign({}, current, { texts: current.texts.concat(texts) });
        };

        paras.forEach(function(para) {
            if (fits(current, current.texts.concat([para]))) { addToCurrent([para]); return; }
            if (current.texts.length) closeCurrent();
            // Alimento de Hoy (devocional): cuando la cita en grande no cabe con
            // la reflexión en la misma página, se elige el diseño por formato.
            if (current.hero && !current.texts.length && o.theme === 'devocional') {
                if (self._fmtKey === 'historia') {
                    // historia: el devocional entero en UNA sola imagen —
                    // versículo en grande con la reflexión debajo. Se fuerza a
                    // que la reflexión vaya aquí y _applyFit la escala hasta
                    // caber: el versículo nunca se pierde.
                    addToCurrent([para]);
                    return;
                }
                // cuadrado/post: exactamente 2 imágenes — el alimento del día
                // (héroe) en su propia imagen y la reflexión forzada a caber
                // (escala) en la segunda. Máximo 2.
                closeCurrent();
                current = { hero: false, texts: [para] };
                return;
            }
            current = { hero: false, texts: [] };
            if (fits(current, [para])) { addToCurrent([para]); return; }
            // Párrafo más alto que una página entera: se parte por frases.
            const worlds = self._splitLong(o, stage, para);
            let first = true;
            worlds.forEach(function(w) {
                if (fits(current, current.texts.concat(w.texts))) { addToCurrent(w.texts); return; }
                if (current.texts.length || !first) closeCurrent();
                current = { hero: false, texts: w.texts.slice() };
                first = false;
            });
        });
        closeCurrent();
        if (stage.parentNode) stage.parentNode.removeChild(stage);
        return pages;
    },

    // ---- ajuste por página: footer anclado abajo + upscale suave sin desborde ----
    _applyFit: function(stage) {
        const card = stage.querySelector('.share-card');
        const inner = stage.querySelector('.sc-inner');
        const spacer = stage.querySelector('.sc-spacer');
        if (!card || !inner || !spacer) return;
        const PAGE_H = this.PAGE_H;
        const measure = function(s) {
            card.style.setProperty('--sc', s.toFixed(3));
            const last = inner.children[inner.children.length - 1];
            return last ? last.offsetTop + last.offsetHeight + 76 * s : 152 * s;
        };
        let s = 1;
        let spill = PAGE_H - measure(1);
        if (spill > 96) {
            const cands = [1.05, 1.1, 1.15];
            let best = 1, bestSpill = spill;
            for (let i = 0; i < cands.length; i++) {
                const sp = PAGE_H - measure(cands[i]);
                if (sp > 16 && sp < bestSpill) { bestSpill = sp; best = cands[i]; }
            }
            s = best;
        } else if (spill < 0) {
            let guard = 0;
            while (spill < 0 && guard < 7) {
                s = Math.max(0.5, s * 0.94);
                spill = PAGE_H - measure(s);
                guard++;
            }
        }
        card.style.setProperty('--sc', s.toFixed(3));
        const finalSpill = PAGE_H - measure(s);
        spacer.style.height = Math.max(0, Math.round(finalSpill)) + 'px';
    },

    _renderOne: function(o, page, num, total) {
        const self = this;
        return new Promise(function(resolve, reject) {
            self._cleanup();
            const stage = document.createElement('div');
            stage.className = 'share-stage';
            stage.setAttribute('aria-hidden', 'true');
            document.body.appendChild(stage);
            stage.innerHTML = self.buildCard(o, { hero: page.hero, texts: page.texts, num: num, total: total });
            self._stage = stage;
            const cardEl = stage.querySelector('.share-card');
            if (cardEl) cardEl.style.setProperty('--sc-h', self.PAGE_H + 'px');
            if (typeof html2canvas === 'undefined') {
                self._cleanup();
                reject(new Error('html2canvas no disponible'));
                return;
            }
            self._waitImages(stage).then(function() {
                self._applyFit(stage);
                const card = stage.querySelector('.share-card');
                return html2canvas(card, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
            }).then(function(canvas) {
                self._cleanup();
                resolve(canvas);
            }).catch(function(err) {
                self._cleanup();
                reject(err);
            });
        });
    },
    _toCanvases: function(opts) {
        const self = this;
        const run = function(o) {
            return self._fontsReady().then(function() {
                const pages = self._assignPages(o, o.paragraphs);
                return pages.reduce(function(chain, page, i) {
                    return chain.then(function(acc) {
                        return self._renderOne(o, page, i + 1, pages.length).then(function(canvas) {
                            acc.push(canvas);
                            return acc;
                        });
                    });
                }, Promise.resolve([]));
            });
        };
        return this._prepareImage(opts).then(run).catch(function(err) {
            if (!opts.image) throw err;
            console.warn('[share] render con imagen falló, reintentando sin imagen', err);
            const o = Object.assign({}, opts);
            delete o.image;
            return run(o);
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
    _pageFilename: function(name, i, total) {
        if (total <= 1) return name;
        const base = String(name).replace(/\.png$/i, '');
        return base + '-pag-' + i + 'de' + total + '.png';
    },
    _isTouch: function() {
        return !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    },
    _publishOne: function(blob, filename, opts, shareText) {
        const self = this;
        const file = new File([blob], filename, { type: 'image/png' });
        const isTouch = this._isTouch();
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], title: opts.shareTitle || 'LUMEN', text: shareText || '' })
                .catch(function(err) {
                    if (err && err.name === 'AbortError') {
                        if (isTouch) return;
                    }
                    self._download(blob, filename);
                });
        } else {
            self._download(blob, filename);
        }
    },
    _publishFiles: function(items, opts, shareText) {
        const self = this;
        const files = items.map(function(it) { return new File([it.blob], it.name, { type: 'image/png' }); });
        const isTouch = this._isTouch();
        if (navigator.canShare && navigator.canShare({ files: files })) {
            navigator.share({ files: files, title: opts.shareTitle || 'LUMEN', text: shareText || '' })
                .catch(function(err) {
                    if (err && err.name === 'AbortError') {
                        if (isTouch) return;
                    }
                    items.forEach(function(it) { self._download(it.blob, it.name); });
                });
        } else {
            items.forEach(function(it) { self._download(it.blob, it.name); });
        }
    },
    share: function(opts, filename, shareText) {
        const self = this;
        return self.chooseFormat().then(function(fmtKey) {
            if (!fmtKey) return;
            self.setFormat(fmtKey);
            return self._run(opts, self._filenameFor(fmtKey, filename), shareText);
        });
    },
    _run: function(opts, filename, shareText) {
        const self = this;
        this._toCanvases(opts).then(function(canvases) {
            return Promise.all(canvases.map(function(canvas) {
                return new Promise(function(resolve) { canvas.toBlob(resolve, 'image/png'); });
            })).then(function(blobs) {
                const valid = (blobs || []).filter(Boolean);
                if (!valid.length) { LumenUI.showToast('No se pudo generar la imagen', 'error'); return; }
                self._cleanup();
                if (valid.length === 1) {
                    self._publishOne(valid[0], filename, opts, shareText);
                    return;
                }
                const items = valid.map(function(b, i) {
                    return { blob: b, name: self._pageFilename(filename, i + 1, valid.length) };
                });
                self._publishFiles(items, opts, shareText);
            });
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
            const body = self._paras(a.contenido);
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