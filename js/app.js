const LumenRouter = {
    currentView: 'landing',
    _activeView: null,
    _pendingHash: null,
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

    // Lee location.hash como ruta canónica: '#/vista/param1/param2?clave=valor'
    _parseHash: function() {
        const raw = String(location.hash || '').replace(/^#\/?/, '');
        const qi = raw.indexOf('?');
        let path = raw, query = null;
        if (qi > -1) { query = raw.slice(qi + 1); path = raw.slice(0, qi); }
        const parts = path.split('/').filter(Boolean).map(function(p) { return decodeURIComponent(p); });
        return { parts: parts, query: query };
    },

    // Refleja el estado de la vista activa en la URL (la URL es un espejo, no la fuente).
    _syncHash: function() {
        const viewObj = this._activeView;
        if (!viewObj) return;
        let parts = [], query = null;
        if (typeof viewObj.route === 'function') {
            const r = viewObj.route() || {};
            parts = r.parts || [];
            query = r.query || null;
        }
        const root = this.currentView === 'landing' ? '' : this.currentView;
        let h = '#/' + root;
        if (parts.length) h += '/' + parts.map(encodeURIComponent).join('/');
        if (query) h += '?' + query;
        if (location.hash === h) return;
        this._pendingHash = h;
        try { location.hash = h; } catch (e) {}
    },

    _onHashChange: function() {
        if (this._pendingHash) {
            if (this._pendingHash === location.hash) { this._pendingHash = null; return; }
            this._pendingHash = null;
        }
        this._applyHashRoute();
    },

    _applyHashRoute: function() {
        let parsed;
        try { parsed = this._parseHash(); } catch (e) { this.navigateTo('landing'); return; }
        const viewName = parsed.parts[0] || 'landing';
        const params = parsed.parts.slice(1);
        const viewObj = this.viewFor(viewName);
        if (!viewObj) { this.navigateTo('landing'); return; }
        try {
            if (typeof viewObj.applyRoute === 'function') viewObj.applyRoute(params, parsed.query);
        } catch (e) { console.error('[LumenRouter] applyRoute', viewName, e); }
        this.navigateTo(viewName, viewName === this.currentView);
    },

    boot: function() {
        window.addEventListener('hashchange', () => this._onHashChange());
        const h = String(location.hash || '');
        if (h.replace(/^#\/?/, '').length) this._applyHashRoute();
        else this.navigateTo('landing');
    },

    navigateTo: function(viewName, skipTransition) {
        const req = this._roles[viewName];
        if (req && LumenAuth.ready) {
            const ok = req === 'admin' ? LumenAuth.isAdmin
                : req === 'member' ? LumenAuth.isMember
                : !!LumenAuth.currentUser;
            if (!ok) {
                const msg = req === 'admin' ? 'Acceso restringido a coordinadores.'
                    : req === 'member' ? 'Debes ser miembro de Juvemar.'
                    : 'Debes iniciar sesión.';
                if (typeof LumenUI !== 'undefined' && LumenUI.showToast) LumenUI.showToast(msg, 'error');
                viewName = 'landing';
                skipTransition = false;
            }
        }
        this.currentView = viewName;
        const container = document.getElementById('app-container');
        const meta = this._switchView(viewName) || null;
        const viewObj = meta ? meta.obj : null;
        const title = meta ? meta.title : "Página no encontrada";

        // Cerrar menú lateral móvil si está abierto
        const drawer = document.getElementById('side-drawer');
        const drawerOverlay = document.getElementById('drawer-overlay');
        if (drawer && drawer.classList.contains('active')) {
            drawer.classList.remove('active');
            if (drawerOverlay) drawerOverlay.classList.remove('active');
        }

        document.title = `LUMEN | ${title}`;

        if (!viewObj || !viewObj.render) {
            container.innerHTML = `<div class="state-container"><h3>404 · Página no encontrada</h3><p>La vista no existe o se movió.</p><button class="btn btn-primary" onclick="LumenRouter.navigateTo('landing')">Volver al inicio</button></div>`;
            return;
        }

        const renderView = () => {
            if (this._activeView && typeof this._activeView.destroy === 'function') this._activeView.destroy();
            this._activeView = viewObj;
            container.innerHTML = viewObj.render();
            if (viewObj.init) viewObj.init();
            document.querySelectorAll('.nav-link, .drawer-link').forEach(link => link.classList.remove('active'));
            const activeLinks = document.querySelectorAll(`.nav-link[data-view="${viewName}"], .drawer-link[data-view="${viewName}"]`);
            activeLinks.forEach(link => link.classList.add('active'));
            this.initScrollReveal();
            LumenUI.updateNotifBadge();
            this._syncHash();
        };

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (skipTransition || reducedMotion || !container.innerHTML.trim()) {
            renderView();
        } else {
            container.style.opacity = '0';
            container.style.transform = 'translateY(8px)';
            container.style.transition = 'opacity 150ms ease, transform 150ms ease';
            setTimeout(() => {
                window.scrollTo(0, 0);
                renderView();
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            }, 150);
        }
    },
    initScrollReveal: function() {
        const reveals = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 });
        reveals.forEach(el => observer.observe(el));
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
        if (banner && !this.esStandalone() && localStorage.getItem('lumen_pwa_dismissed') !== '1') banner.style.display = 'flex';
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
    setTimeout(() => { const preloader = document.getElementById('preloader'); if (preloader) preloader.classList.add('hidden'); }, 1500);

    if (typeof LumenUI !== 'undefined' && LumenUI.initDarkMode) LumenUI.initDarkMode();

    // Push: se habilita SOLO cuando el usuario lo pide desde la tarjeta "Activa Notificaciones"
    // (Ya no se pide permiso automáticamente al abrir la app).

    if (typeof supabase === 'undefined') {
        console.error("Supabase no está cargando.");
    } else {
        try { LumenData.init(); } catch (error) { console.error("Error al inicializar datos:", error); }
        try { LumenAuth.init(); } catch (error) { console.error("Error al inicializar auth:", error); }
        if (typeof LumenPush !== 'undefined' && LumenPush.init) { try { LumenPush.init(); } catch (error) { console.error("Error al inicializar push:", error); } }
    }

    document.querySelectorAll('.nav-link, .drawer-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = link.getAttribute('data-view');
            LumenRouter.navigateTo(viewName);
        });
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

    LumenRouter.boot();
});