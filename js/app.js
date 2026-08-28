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

    if ("Notification" in window && Notification.permission === "default") {
        setTimeout(() => {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") console.log("Notificaciones activadas.");
            });
        }, 5000);
    }

    try {
        if (typeof firebase !== 'undefined') { LumenData.init(); LumenAuth.init(); }
        else { console.error("Firebase no está cargando."); }
    } catch (error) { console.error("Error al inicializar:", error); }

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

    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const pwaBanner = document.getElementById('pwa-install-banner');
        const pwaBtn = document.getElementById('pwa-install-btn');
        if (pwaBanner) pwaBanner.style.display = 'flex';
        if (pwaBtn) {
            pwaBtn.onclick = () => {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(() => {
                    pwaBanner.style.display = 'none';
                    deferredPrompt = null;
                });
            };
        }
    });

    LumenRouter.navigateTo('landing');
});