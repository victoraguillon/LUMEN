const LumenRouter = {
    currentView: 'landing',
    _activeView: null,
    navigateTo: function(viewName, skipTransition) {
        this.currentView = viewName;
        const container = document.getElementById('app-container');
        let viewObj;
        let title = "LUMEN";

        // Cerrar menú lateral móvil si está abierto
        const drawer = document.getElementById('side-drawer');
        const drawerOverlay = document.getElementById('drawer-overlay');
        if (drawer && drawer.classList.contains('active')) {
            drawer.classList.remove('active');
            if (drawerOverlay) drawerOverlay.classList.remove('active');
        }

        switch(viewName) {
            case 'landing': viewObj = typeof LandingView !== 'undefined' ? LandingView : null; title = "Inicio"; break;
            case 'inicio': viewObj = typeof InicioView !== 'undefined' ? InicioView : null; title = "Dashboard"; break;
            case 'nosotros': viewObj = typeof NosotrosView !== 'undefined' ? NosotrosView : null; title = "Nosotros"; break;
            case 'actividades': viewObj = typeof ActividadesView !== 'undefined' ? ActividadesView : null; title = "Actividades"; break;
            case 'detalle': viewObj = typeof DetalleView !== 'undefined' ? DetalleView : null; title = "Detalle"; break;
            case 'recursos': viewObj = typeof RecursosView !== 'undefined' ? RecursosView : null; title = "Recursos"; break;
            case 'notificaciones': viewObj = typeof NotificacionesView !== 'undefined' ? NotificacionesView : null; title = "Avisos"; break;
            case 'intenciones': viewObj = typeof IntencionesView !== 'undefined' ? IntencionesView : null; title = "Intenciones"; break;
            case 'encuestas': viewObj = typeof EncuestasView !== 'undefined' ? EncuestasView : null; title = "Encuestas"; break; 
            case 'perfil': viewObj = typeof PerfilView !== 'undefined' ? PerfilView : null; title = "Mi Perfil"; break;
            case 'gestion': viewObj = typeof GestionView !== 'undefined' ? GestionView : null; title = "Gestión"; break;
            case 'contacto': viewObj = typeof ContactoView !== 'undefined' ? ContactoView : null; title = "Contacto"; break;
            case 'blog': viewObj = typeof BlogView !== 'undefined' ? BlogView : null; title = "Blog"; break;
            case 'devocional': viewObj = typeof DevocionalView !== 'undefined' ? DevocionalView : null; title = "Devocional"; break;
            default: viewObj = typeof LandingView !== 'undefined' ? LandingView : null;
        }

        document.title = `LUMEN | ${title}`;

        if (!viewObj || !viewObj.render) {
            container.innerHTML = `<div class="state-container"><h3>Error de carga</h3><p>La vista no se encontró.</p></div>`;
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

// Bootstrap determinista del Service Worker (v4):
// 1) Des-registra SOLO SW legacy que quede en /js/ (js/sw.js o js/service-worker.js).
//    NUNCA toca el SW actual (raíz /sw.js): des-registrarlo en cada carga impedía
//    que tomase control y provocaba el timeout de serviceWorker.ready.
// 2) Registra el SW único /sw.js con scope '/' y updateViaCache:'none' (idempotente).
// 3) iOS requiere página CONTROLADA por el SW para push: si aún no lo está, recarga
//    una sola vez (guardia). El SW usa skipWaiting + clients.claim.
// 4) Cualquier fallo de register() se reporta en la tostada con su motivo real.
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
        if (typeof LumenPush !== 'undefined' && LumenPush.escribirDiag && LumenAuth && LumenAuth.currentUser) {
            LumenPush.escribirDiag({
                t: Date.now(), paso: 'sw-bootstrap',
                control: !!navigator.serviceWorker.controller,
                url: (reg.active && reg.active.scriptURL) || null,
                activo: !!reg.active, instalando: !!reg.installing, esperando: !!reg.waiting
            });
        }
        if (!navigator.serviceWorker.controller && sessionStorage.getItem('lumen_sw_reload') !== '1') {
            sessionStorage.setItem('lumen_sw_reload', '1');
            location.reload();
            return;
        }
    } catch (error) {
        console.error('[initServiceWorker]', error);
        const msg = (error && error.name ? error.name + ': ' + (error.message || '') : String(error));
        if (typeof LumenUI !== 'undefined' && LumenUI.showToast) {
            LumenUI.showToast('Fallo al registrar el Service Worker: ' + msg, 'error');
        }
        if (typeof LumenPush !== 'undefined' && LumenPush.escribirDiag && LumenAuth && LumenAuth.currentUser) {
            LumenPush.escribirDiag({ t: Date.now(), paso: 'sw-registro-error', name: error && error.name, msg: error && error.message });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { const preloader = document.getElementById('preloader'); if (preloader) preloader.classList.add('hidden'); }, 1500);

    if (typeof LumenUI !== 'undefined' && LumenUI.initDarkMode) LumenUI.initDarkMode();
    if (typeof LumenUI !== 'undefined' && LumenUI.initDrawerGestures) LumenUI.initDrawerGestures();

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

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    let deferredPrompt = null;
    let androidPromptSeen = false;

    const showPwaBanner = () => {
        const banner = document.getElementById('pwa-install-banner');
        if (banner && !isStandalone && localStorage.getItem('lumen_pwa_dismissed') !== '1') banner.style.display = 'flex';
    };
    const showPwaHelp = (platform) => {
        const helpModal = document.getElementById('pwa-help-modal');
        const ios = document.getElementById('pwa-help-ios');
        const android = document.getElementById('pwa-help-android');
        if (helpModal) LumenUI.openModal('pwa-help-modal');
        if (ios) ios.style.display = platform === 'ios' ? 'block' : 'none';
        if (android) android.style.display = platform === 'android' ? 'block' : 'none';
    };

    // Botón "Instalar": en Android dispara el prompt nativo; en iOS (sin prompt
    // nativo) y en cualquier caso sin prompt → abre los pasos para instalar.
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
        installBtn.textContent = isIOS ? 'Cómo instalar' : 'Instalar';
        installBtn.onclick = async () => {
            if (deferredPrompt && !isIOS) {
                deferredPrompt.prompt();
                try { await deferredPrompt.userChoice; } finally {
                    document.getElementById('pwa-install-banner').style.display = 'none';
                    deferredPrompt = null;
                }
            } else {
                showPwaHelp(isIOS ? 'ios' : 'android');
            }
        };
    }
    const helpBtn = document.getElementById('pwa-help-btn');
    if (helpBtn) {
        // En iOS el único botón es "Cómo instalar" (abre los pasos); el botón
        // "Cómo" sería redundante, así que se oculta.
        if (isIOS) helpBtn.style.display = 'none';
        helpBtn.onclick = () => showPwaHelp(isIOS ? 'ios' : 'android');
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        androidPromptSeen = true;
        showPwaBanner();
    });

    window.addEventListener('appinstalled', () => {
        const banner = document.getElementById('pwa-install-banner');
        if (banner) banner.style.display = 'none';
        deferredPrompt = null;
    });

    // Banner proactivo: iOS no dispara beforeinstallprompt ni has iOS y no instalado
    if (isIOS && !isStandalone) {
        setTimeout(showPwaBanner, 4000);
    } else if (!isStandalone) {
        setTimeout(() => { if (!androidPromptSeen) showPwaBanner(); }, 4000);
    }

    initServiceWorker();

    LumenRouter.navigateTo('landing');
});