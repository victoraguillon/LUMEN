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

    document.getElementById('pwa-help-btn').onclick = () => {
        showPwaHelp(isIOS ? 'ios' : 'android');
        if (deferredPrompt) deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        androidPromptSeen = true;
        showPwaBanner();
        const pwaBtn = document.getElementById('pwa-install-btn');
        if (pwaBtn) {
            pwaBtn.onclick = async () => {
                if (!deferredPrompt) { showPwaHelp('android'); return; }
                deferredPrompt.prompt();
                try { await deferredPrompt.userChoice; } finally {
                    document.getElementById('pwa-install-banner').style.display = 'none';
                    deferredPrompt = null;
                }
            };
        }
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

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // 1) Des-registrar el SW LEGACY de la raíz (/sw.js) si sigue activo en el cliente
            navigator.serviceWorker.getRegistrations().then(list => {
                let rootRemoved = false;
                (list || []).forEach(reg => {
                    const script = (reg.active && reg.active.scriptURL) || (reg.installing && reg.installing.scriptURL) || '';
                    const path = script.replace(location.origin, '');
                    if (path === '/sw.js') { rootRemoved = true; reg.unregister(); }
                });
                // 2) Registrar el SW real (js/sw.js), mismo scope. Si quita el root, debe esperar
                if (rootRemoved) {
                    setTimeout(() => navigator.serviceWorker.register('js/sw.js', { scope: './' }).catch(err => console.error('Error registrando SW:', err)), 500);
                } else {
                    navigator.serviceWorker.register('js/sw.js', { scope: './' }).catch(err => console.error('Error registrando SW:', err));
                }
            });
        });
    }

    LumenRouter.navigateTo('landing');
});