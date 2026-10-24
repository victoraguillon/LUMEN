// Carga perezosa de los datasets grandes (devocional, formación, oraciones…).
// Antes se descargaban 1,5 MB de JS en la portada aunque no se abriera la vista.
const LumenAssets = {
    _promises: {},
    _viewScripts: {
        inicio: ['js/frases_santos.js'],
        devocional: ['js/santoral.js', 'js/devocional_data.js'],
        formacion: ['js/formacion_data.js'],
        oraciones: ['js/oraciones_data.js'],
        rosario: ['js/rosario_data.js', 'js/coronillas_data.js'],
        novenas: ['js/novenas_data.js'],
        examen: ['js/examen_data.js'],
        planes: ['js/planes_data.js']
    },
    ensure: function(viewName) {
        const scripts = this._viewScripts[viewName] || [];
        return Promise.all(scripts.map((src) => this._load(src)));
    },
    _load: function(src) {
        if (this._promises[src]) return this._promises[src];
        this._promises[src] = new Promise((resolve, reject) => {
            if (document.querySelector('script[src="' + src + '"]')) return resolve();
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => { delete this._promises[src]; reject(new Error('No se pudo cargar ' + src)); };
            document.head.appendChild(script);
        });
        return this._promises[src];
    }
};

const LumenRouter = {
    currentView: 'landing',
    _activeView: null,
    _pendingHash: null,
    _mode: 'path',
    _fromPop: false,
    _navSeq: 0,
    _hasRendered: false,
    _revealObserver: null,
    _meta: {
        landing: { title: 'Inicio · Comunidad juvenil católica en Maracaibo', desc: 'LUMEN reúne a Juvemar y El Llamado de Samuel en la Parroquia Nuestra Señora de Lourdes, Maracaibo: formación, oración, actividades y comunidad.' },
        inicio: { title: 'Inicio', desc: 'Tu espacio personal en LUMEN: avisos, actividades y acompañamiento de la comunidad.' },
        nosotros: { title: 'Nosotros', desc: 'Conoce Juvemar, El Llamado de Samuel y la historia de la comunidad juvenil LUMEN.' },
        actividades: { title: 'Actividades', desc: 'Próximos retiros, misiones, reuniones y encuentros de la comunidad LUMEN.' },
        calendario: { title: 'Calendario', desc: 'Agenda de actividades, celebraciones y encuentros de LUMEN.' },
        detalle: { title: 'Detalle de la actividad', desc: 'Información, requisitos e inscripción a una actividad de LUMEN.' },
        recursos: { title: 'Recursos', desc: 'Materiales de formación y oración para los miembros de Juvemar.' },
        formacion: { title: 'Formación', desc: 'Formación católica paso a paso: catecismo, moral, apologética y vida cristiana.' },
        oraciones: { title: 'Oraciones', desc: 'Oraciones católicas para cada momento de la vida y del año litúrgico.' },
        rosario: { title: 'Rosario', desc: 'Reza el Rosario convencional, el eucarístico y las coronillas de la Divina Misericordia, San Miguel, el Espíritu Santo y San José.' },
        planes: { title: 'Planes estacionales', desc: 'Cuatro caminos generales para vivir Adviento, Navidad, Cuaresma y Pascua con la Palabra, la oración y gestos concretos.' },
        offline: { title: 'Descargas', desc: 'Descarga contenido de LUMEN para rezarlo y consultarlo sin conexión.' },
        novenas: { title: 'Novenas', desc: 'Novenas católicas para preparar celebraciones y confiar tus intenciones a Dios.' },
        examen: { title: 'Examen de conciencia', desc: 'Una guía breve para examinar la conciencia y prepararte para la confesión.' },
        favoritos: { title: 'Mis favoritos', desc: 'Tus oraciones y contenidos guardados en LUMEN.' },
        notificaciones: { title: 'Avisos', desc: 'Avisos y recordatorios de la comunidad LUMEN.' },
        intenciones: { title: 'Intenciones', desc: 'Comparte y acompaña las intenciones de oración de la comunidad.' },
        encuestas: { title: 'Encuestas', desc: 'Participa en las consultas de la comunidad LUMEN.' },
        perfil: { title: 'Mi perfil', desc: 'Gestiona tus datos y tu participación en LUMEN.' },
        gestion: { title: 'Gestión', desc: 'Panel de coordinación de LUMEN.' },
        contacto: { title: 'Contacto', desc: 'Escríbenos y sigue a LUMEN, Juvemar y El Llamado de Samuel en Instagram.' },
        blog: { title: 'Blog', desc: 'Reflexiones, testimonios y vida de comunidad escritos por nuestros hermanos.' },
        devocional: { title: 'Devocional', desc: 'Pasaje, santo del día y reflexión para caminar con Dios.' },
        evangelio: { title: 'Evangelio del día', desc: 'Lecturas y Evangelio del día con reflexión.' }
    },
    _roles: {
        gestion: 'admin',
        notificaciones: 'member',
        recursos: 'member',
        perfil: 'user'
    },

    _switchView: function(viewName) {
        switch(viewName) {
            case 'landing': return { obj: typeof LandingView !== 'undefined' ? LandingView : null, title: "Inicio" };
            case 'inicio': return { obj: typeof InicioView !== 'undefined' ? InicioView : null, title: "Dashboard" };
            case 'nosotros': return { obj: typeof NosotrosView !== 'undefined' ? NosotrosView : null, title: "Nosotros" };
            case 'actividades': return { obj: typeof ActividadesView !== 'undefined' ? ActividadesView : null, title: "Actividades" };
            case 'calendario': return { obj: typeof CalendarioView !== 'undefined' ? CalendarioView : null, title: "Calendario" };
            case 'detalle': return { obj: typeof DetalleView !== 'undefined' ? DetalleView : null, title: "Detalle" };
            case 'recursos': return { obj: typeof RecursosView !== 'undefined' ? RecursosView : null, title: "Recursos" };
            case 'formacion': return { obj: typeof FormacionView !== 'undefined' ? FormacionView : null, title: "Formación" };
            case 'oraciones': return { obj: typeof OracionesView !== 'undefined' ? OracionesView : null, title: "Oraciones" };
            case 'rosario': return { obj: typeof RosarioView !== 'undefined' ? RosarioView : null, title: "Rosario" };
            case 'planes': return { obj: typeof PlanesView !== 'undefined' ? PlanesView : null, title: "Planes estacionales" };
            case 'offline': return { obj: typeof OfflineView !== 'undefined' ? OfflineView : null, title: "Descargas" };
            case 'novenas': return { obj: typeof NovenasView !== 'undefined' ? NovenasView : null, title: "Novenas" };
            case 'examen': return { obj: typeof ExamenView !== 'undefined' ? ExamenView : null, title: "Examen de Conciencia" };
            case 'favoritos': return { obj: typeof FavoritosView !== 'undefined' ? FavoritosView : null, title: "Favoritos" };
            case 'notificaciones': return { obj: typeof NotificacionesView !== 'undefined' ? NotificacionesView : null, title: "Avisos" };
            case 'intenciones': return { obj: typeof IntencionesView !== 'undefined' ? IntencionesView : null, title: "Intenciones" };
            case 'encuestas': return { obj: typeof EncuestasView !== 'undefined' ? EncuestasView : null, title: "Encuestas" };
            case 'perfil': return { obj: typeof PerfilView !== 'undefined' ? PerfilView : null, title: "Mi Perfil" };
            case 'gestion': return { obj: typeof GestionView !== 'undefined' ? GestionView : null, title: "Gestión" };
            case 'contacto': return { obj: typeof ContactoView !== 'undefined' ? ContactoView : null, title: "Contacto" };
            case 'blog': return { obj: typeof BlogView !== 'undefined' ? BlogView : null, title: "Blog" };
            case 'devocional': return { obj: typeof DevocionalView !== 'undefined' ? DevocionalView : null, title: "Devocional" };
            case 'evangelio': return { obj: typeof EvangelioView !== 'undefined' ? EvangelioView : null, title: "Evangelio del día" };
            default: return null;
        }
    },

    viewFor: function(viewName) {
        const m = this._switchView(viewName);
        return m && m.obj && m.obj.render ? m.obj : null;
    },

    // Las rutas limpias (/actividades, /formacion/...) son las canónicas.
    // Los enlaces antiguos con hash (#/actividades) siguen funcionando: al
    // entrar por hash conservamos ese modo para no romper marcadores ni tests.
    _routeFromLocation: function() {
        let raw = '';
        if (this._mode === 'hash') {
            raw = String(location.hash || '').replace(/^#\/?/, '');
        } else {
            raw = String(location.pathname || '/').replace(/^\/+|\/+$/g, '');
            if (raw === 'index.html') raw = '';
            raw += location.search || '';
        }
        const qi = raw.indexOf('?');
        let path = raw, query = null;
        if (qi > -1) { query = raw.slice(qi + 1); path = raw.slice(0, qi); }
        let parts = [];
        try {
            parts = path.split('/').filter(Boolean).map(function(p) { return decodeURIComponent(p); });
        } catch (e) { parts = []; }
        return { parts: parts, query: query };
    },

    hrefFor: function(parts, query) {
        const clean = (parts || []).filter(Boolean).map(function(p) { return encodeURIComponent(p); }).join('/');
        const suffix = query ? '?' + query : '';
        if (this._mode === 'hash') return '#/' + clean + suffix;
        return '/' + clean + suffix;
    },

    _routeParts: function() {
        const viewObj = this._activeView;
        if (!viewObj) return { parts: [], query: null };
        if (typeof viewObj.route === 'function') {
            const route = viewObj.route() || {};
            return { parts: route.parts || [], query: route.query || null };
        }
        return { parts: [], query: null };
    },

    // Refleja el estado de la vista activa en la URL (la URL es un espejo).
    _syncUrl: function(opts) {
        if (opts && opts.fromPop) return;
        if (!this._activeView) return;
        const route = this._routeParts();
        const root = this.currentView === 'landing' ? '' : this.currentView;
        const all = [root].concat(route.parts).filter(Boolean);
        const url = this.hrefFor(all, route.query);
        if (this._mode === 'hash') {
            if ((location.hash || '#/') === url) return;
        } else {
            if ((location.pathname + location.search) === url) return;
        }
        try {
            if (opts && opts.replace) history.replaceState({ lumen: true }, '', url);
            else history.pushState({ lumen: true }, '', url);
        } catch (e) {}
    },

    _canonicalUrl: function() {
        const route = this._routeParts();
        const root = this.currentView === 'landing' ? '' : this.currentView;
        const clean = [root].concat(route.parts).filter(Boolean)
            .map(function(p) { return encodeURIComponent(p); }).join('/');
        return 'https://lumenve.vercel.app/' + clean;
    },

    _setMeta: function(viewName) {
        const info = this._meta[viewName] || this._meta.landing;
        let title = info.title;
        if (viewName === 'detalle') {
            const selected = LumenData.eventos.find((ev) => ev.id === LumenData.selectedEventId);
            if (selected && selected.titulo) title = selected.titulo;
        }
        const fullTitle = 'LUMEN | ' + title;
        const desc = info.desc;
        document.title = fullTitle;
        const set = function(selector, attr, value) {
            const el = document.querySelector(selector);
            if (el) el.setAttribute(attr, value);
        };
        const canonical = this._canonicalUrl();
        set('meta[name="description"]', 'content', desc);
        set('meta[property="og:title"]', 'content', fullTitle);
        set('meta[property="og:description"]', 'content', desc);
        set('meta[property="og:url"]', 'content', canonical);
        set('meta[name="twitter:title"]', 'content', fullTitle);
        set('meta[name="twitter:description"]', 'content', desc);
        const canonicalEl = document.getElementById('canonical-link');
        if (canonicalEl) canonicalEl.setAttribute('href', canonical);
    },

    _applyRoute: function(fromPop) {
        const parsed = this._routeFromLocation();
        const viewName = parsed.parts[0] || 'landing';
        const params = parsed.parts.slice(1);
        const viewObj = this.viewFor(viewName);
        if (!viewObj) {
            this.navigateTo('landing', false, { replace: true });
            return;
        }
        const seq = ++this._navSeq;
        this.currentView = viewName;
        this._awaitingAssets = viewName;
        LumenAssets.ensure(viewName).then(() => {
            if (seq !== this._navSeq) return;
            this._awaitingAssets = null;
            try {
                if (typeof viewObj.applyRoute === 'function') viewObj.applyRoute(params, parsed.query);
            } catch (e) { console.error('[LumenRouter] applyRoute', viewName, e); }
            this.navigateTo(viewName, viewName === this.currentView, { fromPop: !!fromPop });
        }).catch((err) => {
            if (seq !== this._navSeq) return;
            this._awaitingAssets = null;
            console.error('[LumenRouter] assets', viewName, err);
            if (typeof LumenUI !== 'undefined' && LumenUI.showToast) {
                LumenUI.showToast('No se pudo cargar esta sección. Revisa tu conexión.', 'error');
            }
            this.navigateTo('landing', false, { replace: true });
        });
    },

    boot: function() {
        const hashPath = String(location.hash || '').replace(/^#\/?/, '').split(/[/?]/)[0];
        if (hashPath && this.viewFor(hashPath)) this._mode = 'hash';
        window.addEventListener('popstate', () => this._applyRoute(true));
        window.addEventListener('hashchange', () => {
            if (this._mode === 'hash') {
                this._applyRoute(true);
                return;
            }
            const next = String(location.hash || '').replace(/^#\/?/, '').split(/[/?]/)[0];
            if (next && this.viewFor(next)) { this._mode = 'hash'; this._applyRoute(true); }
        });
        this._applyRoute(false);
    },

    _assetsReady: {},

    // Punto de entrada de navegación. Garantiza que el dataset de la vista
    // esté cargado antes de renderizar (portada, rosario, formación…).
    navigateTo: function(viewName, skipTransition, opts) {
        opts = opts || {};
        if (this._awaitingAssets && viewName === this._awaitingAssets) return;
        const seq = ++this._navSeq;
        if (this._assetsReady[viewName] || typeof LumenAssets === 'undefined') {
            return this._navigateToNow(viewName, skipTransition, opts);
        }
        this._awaitingAssets = viewName;
        LumenAssets.ensure(viewName).then(() => {
            if (seq !== this._navSeq) return;
            this._awaitingAssets = null;
            this._assetsReady[viewName] = true;
            this._navigateToNow(viewName, skipTransition, opts);
        }).catch((err) => {
            if (seq !== this._navSeq) return;
            this._awaitingAssets = null;
            console.error('[LumenRouter] assets', viewName, err);
            if (typeof LumenUI !== 'undefined' && LumenUI.showToast) {
                LumenUI.showToast('No se pudo cargar esta sección. Revisa tu conexión.', 'error');
            }
        });
    },

    _navigateToNow: function(viewName, skipTransition, opts) {
        opts = opts || {};
        const seq = this._navSeq;
        this.currentView = viewName;
        const container = document.getElementById('app-container');
        const meta = this._switchView(viewName) || null;
        const viewObj = meta ? meta.obj : null;

        if (typeof LumenUI !== 'undefined' && LumenUI.closeDrawer) LumenUI.closeDrawer(false);
        if (typeof LumenUI !== 'undefined' && LumenUI.closeDropdowns) LumenUI.closeDropdowns();

        if (!viewObj || !viewObj.render) {
            document.title = 'LUMEN | Página no encontrada';
            container.innerHTML = `<div class="state-container"><h1 class="v-title">404 · Página no encontrada</h1><p>La vista no existe o se movió.</p><button class="btn btn-primary" onclick="LumenRouter.navigateTo('landing')">Volver al inicio</button></div>`;
            this._activeView = null;
            return;
        }

        const renderView = () => {
            if (this._activeView && typeof this._activeView.destroy === 'function') this._activeView.destroy();
            this._activeView = viewObj;
            container.innerHTML = viewObj.render();
            if (viewObj.init) viewObj.init();
            const preloader = document.getElementById('preloader');
            if (preloader) preloader.classList.add('hidden');
            this._setMeta(viewName);
            if (this._hasRendered) container.focus({ preventScroll: true });
            this._hasRendered = true;
            document.querySelectorAll('.nav-link, .drawer-link').forEach(link => {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            });
            const activeLinks = document.querySelectorAll(`.nav-link[data-view="${viewName}"], .drawer-link[data-view="${viewName}"]`);
            activeLinks.forEach(link => {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            });
            this.initScrollReveal();
            if (typeof LumenUI !== 'undefined' && LumenUI.updateNotifBadge) LumenUI.updateNotifBadge();
            // Las actividades necesitan las imágenes, que viven en la misma fila
            // pero no se piden en el resumen inicial de la portada.
            if ((viewName === 'actividades' || viewName === 'detalle') && typeof LumenData !== 'undefined' && LumenData.ensureEventosFull) {
                LumenData.ensureEventosFull().catch(() => {});
            }
            this._syncUrl(opts);
        };

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (skipTransition || reducedMotion || !container.innerHTML.trim() || container.querySelector('.seo-fallback')) {
            renderView();
        } else {
            container.style.opacity = '0';
            container.style.transform = 'translateY(8px)';
            container.style.transition = 'opacity 230ms cubic-bezier(0.23, 1, 0.32, 1), transform 230ms cubic-bezier(0.23, 1, 0.32, 1)';
            setTimeout(() => {
                if (seq !== this._navSeq) return;
                window.scrollTo(0, 0);
                renderView();
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            }, 150);
        }
    },
    initScrollReveal: function() {
        if (this._revealObserver) this._revealObserver.disconnect();
        const reveals = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 });
        reveals.forEach(el => observer.observe(el));
        this._revealObserver = observer;
    }
};

// Instalador PWA: beforeinstallprompt se captura AL INICIO del script (sin esperar
// DOMContentLoaded) para no perder el evento. El botón del banner usa el prompt
// guardado (instalación real); si el navegador aún no habilitó la instalación,
// abre la guía paso a paso del navegador actual.
const LumenInstall = {
    deferredPrompt: null,
    captured: false,

    initEvents: function() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.captured = true;
            this.mostrarBanner();
        });
        window.addEventListener('appinstalled', () => {
            const banner = document.getElementById('pwa-install-banner');
            if (banner) banner.style.display = 'none';
            this.deferredPrompt = null;
            if (typeof LumenUI !== 'undefined' && LumenUI.showToast) {
                LumenUI.showToast('LUMEN se instaló en este dispositivo.', 'success');
            }
            if (typeof LumenPush !== 'undefined' && LumenPush.aplicarEstadoUI) {
                LumenPush.aplicarEstadoUI();
            }
        });
    },

    esStandalone: function() {
        return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    },

    esIOS: function() {
        return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    },

    mostrarBanner: function() {
        const banner = document.getElementById('pwa-install-banner');
        const cookie = document.getElementById('cookie-consent-banner');
        if (cookie && cookie.style.display !== 'none') return;
        let dismissed = null;
        try { dismissed = localStorage.getItem('lumen_pwa_dismissed'); } catch (e) {}
        if (banner && !this.esStandalone() && dismissed !== '1') banner.style.display = 'flex';
    },

    mostrarGuia: function() {
        const modal = document.getElementById('pwa-help-modal');
        const ios = document.getElementById('pwa-help-ios');
        const android = document.getElementById('pwa-help-android');
        if (modal && typeof LumenUI !== 'undefined' && LumenUI.openModal) LumenUI.openModal('pwa-help-modal');
        if (ios) ios.style.display = this.esIOS() ? 'block' : 'none';
        if (android) android.style.display = this.esIOS() ? 'none' : 'block';
    },

    install: async function() {
        const btn = document.getElementById('pwa-install-btn');
        if (btn) btn.disabled = true;
        try {
            if (this.deferredPrompt && !this.esIOS()) {
                this.deferredPrompt.prompt();
                const choice = await this.deferredPrompt.userChoice;
                this.deferredPrompt = null;
                const banner = document.getElementById('pwa-install-banner');
                if (banner) banner.style.display = 'none';
                if (!choice || choice.outcome !== 'accepted') this.mostrarGuia();
            } else {
                this.mostrarGuia();
            }
        } catch (e) {
            this.mostrarGuia();
        } finally {
            if (btn) btn.disabled = false;
        }
    }
};

LumenInstall.initEvents();

// Bootstrap determinista del Service Worker (v4):
// 1) Des-registra SOLO SW legacy que quede en /js/ (js/sw.js o js/service-worker.js).
//    NUNCA toca el SW actual (raíz /sw.js): des-registrarlo en cada carga impedía
//    que tomase control y provocaba el timeout de serviceWorker.ready.
// 2) Registra el SW único /sw.js con scope '/' y updateViaCache:'none' (idempotente).
// 3) iOS requiere página CONTROLADA por el SW para push: si aún no lo está, recarga
//    una sola vez (guardia). El SW usa skipWaiting + clients.claim.
// 4) Cualquier fallo de register() se reporta en la tostada con mensaje genérico
//    (el motivo real solo queda en la consola).
const initServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) return;
    try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of (registrations || [])) {
            const url = (reg.active && reg.active.scriptURL) || (reg.installing && reg.installing.scriptURL) || (reg.waiting && reg.waiting.scriptURL) || '';
            const path = url.replace(location.origin, '');
            if (path === '/js/sw.js' || path === '/js/service-worker.js') {
                try { await reg.unregister(); } catch (e) {}
            }
        }
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });

        // ---- Aviso de nueva actualización (PWA) ----
        // El SW navega con skipWaiting() + clients.claim(), de modo que cuando
        // hay un nuevo deploy el SW nuevo toma control de la página abierta y
        // dispara 'controllerchange'. Ese es el momento exacto para avisar.
        // Guardia "wasControlled": en la PRIMERA instalación no hay SW previo,
        // así que controllerchange también se dispara al tomar control; con ese
        // flag distinguimos "inicio" (no avisar) de "actualización real" (avisar).
        // El pendiente se guarda en localStorage (lumen_update_pending) para que,
        // si el usuario cierra el aviso sin recargar, vuelva a aparecer en la
        // próxima sesión hasta que recargue.
        let wasControlled = !!navigator.serviceWorker.controller;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!wasControlled) { wasControlled = true; return; }
            try { localStorage.setItem('lumen_update_pending', '1'); } catch (e) {}
            if (typeof LumenUI !== 'undefined' && LumenUI.mostrarBannerActualizacion) LumenUI.mostrarBannerActualizacion();
        });

        if (!navigator.serviceWorker.controller && sessionStorage.getItem('lumen_sw_reload') !== '1') {
            sessionStorage.setItem('lumen_sw_reload', '1');
            location.reload();
            return;
        }
    } catch (error) {
        console.error('[initServiceWorker]', error);
        if (typeof LumenUI !== 'undefined' && LumenUI.showToast) {
            LumenUI.showToast('No se pudo activar la sincronización. Recarga e inténtalo.', 'error');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { const preloader = document.getElementById('preloader'); if (preloader) preloader.classList.add('hidden'); }, 300);

    // Nueva actualización pendiente de una sesión anterior: si el usuario cerró el
    // aviso sin recargar (lumen_update_pending sigue guardado en localStorage), el
    // banner vuelve a aparecer al abrir LUMEN. Cumple "reaparecer en cada sesión"
    // hasta que presione "Recargar ahora". El guard _bannerActMostrado evita que
    // se duplique si además llega un controllerchange en esta misma carga.
    if (typeof LumenUI !== 'undefined' && LumenUI.mostrarBannerActualizacion) {
        try {
            if (localStorage.getItem('lumen_update_pending') === '1') LumenUI.mostrarBannerActualizacion();
        } catch (e) {}
    }

    if (typeof LumenUI !== 'undefined' && LumenUI.initDarkMode) LumenUI.initDarkMode();

    // Reaparece en cada sesión: si en una sesión anterior el usuario cerró el aviso
    // de actualización sin recargar, dejó lumen_update_pending en localStorage y aquí
    // volvemos a mostrarlo. (El controllerchange solo ocurre en el momento del
    // deploy; en un arranque nuevo ya no se dispara, por eso se chequea explícito).
    const updatePendiente = (() => { try { return localStorage.getItem('lumen_update_pending') === '1'; } catch (e) { return false; } })();
    if (updatePendiente && typeof LumenUI !== 'undefined' && LumenUI.mostrarBannerActualizacion) {
        LumenUI.mostrarBannerActualizacion();
    }


    // Push: se habilita SOLO cuando el usuario lo pide desde la tarjeta "Activa Notificaciones"
    // (Ya no se pide permiso automáticamente al abrir la app).

    if (typeof supabase === 'undefined') {
        console.error("Supabase no está cargando.");
        LumenRouter.boot();
    } else {
        try { LumenData.init(); } catch (error) { console.error("Error al inicializar datos:", error); }
        // Arranca el router antes de auth: fija el modo (hash/ruta limpia) y la
        // vista pendiente antes de que el callback INITIAL_SESSION navegue.
        LumenRouter.boot();
        try { LumenAuth.init(); } catch (error) { console.error("Error al inicializar auth:", error); }
        if (typeof LumenPush !== 'undefined' && LumenPush.init) { try { LumenPush.init(); } catch (error) { console.error("Error al inicializar push:", error); } }
    }

    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-view]');
        if (!link || link.tagName !== 'A') return;
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const viewName = link.getAttribute('data-view');
        if (!viewName) return;
        e.preventDefault();
        LumenRouter.navigateTo(viewName);
    });

    const scrollTopBtn = document.getElementById('scroll-top-btn');
    if(scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) scrollTopBtn.style.display = 'flex';
            else scrollTopBtn.style.display = 'none';
        });
    }

    const isStandalone = LumenInstall.esStandalone();
    const isIOS = LumenInstall.esIOS();
    const showPwaBanner = () => LumenInstall.mostrarBanner();

    // Botón "Instalar": si el navegador capturó beforeinstallprompt, instala de
    // verdad (Chrome/Android). Sin prompt → abre la guía del navegador actual.
    // En iOS el único botón es "Cómo instalar" (no existe prompt nativo), con
    // estilo secundario y sin duplicar el botón "¿Cómo?".
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
        const guideOnly = isIOS;
        installBtn.textContent = guideOnly ? 'Cómo instalar' : 'Instalar';
        if (guideOnly) {
            installBtn.classList.add('is-guide');
        }
        installBtn.onclick = () => LumenInstall.install();
    }
    const helpBtn = document.getElementById('pwa-help-btn');
    if (helpBtn) {
        if (isIOS) helpBtn.style.display = 'none';
        helpBtn.onclick = () => LumenInstall.mostrarGuia();
    }

    // Banner proactivo: iOS no dispara beforeinstallprompt; en otros navegadores
    // aparece solo si el evento no se capturó aún (sin duplicar el del evento).
    if (isIOS && !isStandalone) {
        setTimeout(showPwaBanner, 4000);
    } else if (!isStandalone) {
        setTimeout(() => { if (!LumenInstall.captured) showPwaBanner(); }, 4000);
    }

    initServiceWorker();
});