// LumenPush: suscripción y envío de notificaciones push.
// El envío lo resuelve el servidor Node.js (api/send-push de Vercel) con web-push.
const LumenPush = {
    DEFAULT_BTN_TEXT: '🔔 Activar Avisos',

    init: function() {
        if (!this.supported()) return;
        navigator.serviceWorker.ready.then(() => this.aplicarEstadoUI()).catch(() => this.aplicarEstadoUI());
    },

    supported: function() {
        return ('PushManager' in window && 'Notification' in window) || this.esIOS();
    },

    esIOS: function() {
        return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    },

    esStandalone: function() {
        return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    },

    getSW: async function() {
        const reg = await navigator.serviceWorker.getRegistration().catch(() => null);
        if (reg && reg.active) return reg;
        return navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });
    },

    abrirAyudaInstalacion: function() {
        if (typeof LumenUI !== 'undefined' && LumenUI.openModal) LumenUI.openModal('pwa-help-modal');
    },

    activarNotificaciones: async function() {
        try {
            if (!this.supported()) {
                LumenUI.showToast('Tu navegador no soporta notificaciones push.', 'error');
                return false;
            }
            if (this.esIOS() && !this.esStandalone()) {
                LumenUI.showToast('En iPhone primero debes instalar LUMEN: Compartir → Añadir a pantalla de inicio', 'error');
                this.abrirAyudaInstalacion();
                return false;
            }
            if (!LumenAuth.currentUser) {
                LumenUI.openModal('login-modal');
                return false;
            }
            const perm = await Notification.requestPermission();
            if (perm === 'denied') {
                LumenUI.showToast(this.esIOS()
                    ? 'Permiso bloqueado: Ajustes → ' + (this.esStandalone() ? 'LUMEN' : 'Safari') + ' → Notificaciones → Permitir.'
                    : 'El permiso fue denegado en el navegador.', 'error');
                return false;
            }
            if (perm !== 'granted') {
                LumenUI.showToast('Necesitamos tu permiso para avisarte. Si no apareció la ventana, revisa los Ajustes del dispositivo.', 'error');
                return false;
            }
            const ok = await this.registrarSuscripcion();
            if (ok) LumenUI.showToast('¡Notificaciones activadas! Recibirás los avisos en este dispositivo.', 'success');
            return ok;
        } catch (e) {
            console.error('[LumenPush] activar', e);
            LumenUI.showToast('Error al activar notificaciones (' + ((e && e.name) || 'desconocido') + ').', 'error');
            return false;
        }
    },

    registrarSuscripcion: async function() {
        try {
            const reg = await this.getSW();

            // iOS (WebKit) exige que la página esté CONTROLADA por el SW para suscribirse.
            if (this.esIOS() && !navigator.serviceWorker.controller) {
                LumenUI.showToast('La app aún no está lista para notificaciones: cierra y vuelve a abrirla desde el ícono.', 'error');
                return false;
            }

            let sub = await reg.pushManager.getSubscription();
            if (!sub) {
                sub = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: supabaseConfig.pushVapidKey
                });
            }

            const plain = JSON.parse(JSON.stringify(sub));
            // Multi-dispositivo: una fila por endpoint (upsert) para no machacar otros dispositivos.
            await supabase.from('push_subscriptions').upsert({
                endpoint: plain.endpoint,
                user_id: LumenAuth.currentUser.id,
                keys: plain.keys
            }, { onConflict: 'endpoint' });
            await supabase.from('profiles').update({ push_subscription: plain }).eq('id', LumenAuth.currentUser.id);
            this.aplicarEstadoUI();
            return true;
        } catch (e) {
            console.error('[LumenPush] registrar', e);
            const name = e && e.name;
            if (name === 'NotAllowedError') {
                LumenUI.showToast(this.esIOS()
                    ? 'El permiso no fue concedido. Revisa Ajustes → ' + (this.esStandalone() ? 'LUMEN' : 'Safari') + ' → Notificaciones.'
                    : 'El permiso fue denegado en el navegador.', 'error');
            } else {
                LumenUI.showToast('Error al suscribir (' + (name || 'desconocido') + ').', 'error');
            }
            return false;
        }
    },

    estadoActual: async function() {
        if (!this.supported() || !LumenAuth.currentUser) return 'off';
        try {
            const reg = await navigator.serviceWorker.getRegistration().catch(() => null);
            if (!reg || !reg.pushManager) return 'off';
            const sub = await reg.pushManager.getSubscription().catch(() => null);
            if (sub && Notification.permission === 'granted') return 'on';
            if (Notification.permission === 'denied') return 'denied';
            return 'off';
        } catch (e) { return 'off'; }
    },

    aplicarEstadoUI: async function() {
        const estado = await this.estadoActual();
        const supported = this.supported();
        const iosSinInstalar = this.esIOS() && !this.esStandalone();
        document.querySelectorAll('[data-push-card]').forEach(card => {
            const btn = card.querySelector('[data-push-action]');
            if (!btn) return;
            if (!supported || estado === 'on') {
                card.style.display = 'none';
                return;
            }
            card.style.display = '';
            if (iosSinInstalar) {
                btn.textContent = '📱 Instalar LUMEN para recibir avisos';
                btn.onclick = () => this.abrirAyudaInstalacion();
            } else {
                btn.textContent = this.DEFAULT_BTN_TEXT;
                btn.onclick = () => this.activarNotificaciones();
            }
        });
    },

    enviarPush: async function(opts) {
        if (!LumenAuth.currentUser) return { ok: false, reason: 'no-session' };
        try {
            const { data } = await supabase.auth.getSession();
            const token = data && data.session ? data.session.access_token : null;
            if (!token) return { ok: false, reason: 'no-token' };
            const res = await fetch(supabaseConfig.pushEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    mode: opts.mode || 'self', title: opts.title || '', body: opts.body || '',
                    url: opts.url || '/actividades', avisoId: opts.avisoId || null
                })
            });
            if (res.ok) {
                const result = await res.json().catch(() => ({}));
                return { ok: true, result };
            }
            console.error('[LumenPush] enviar', res.status);
            return { ok: false, status: res.status };
        } catch (e) {
            console.error('[LumenPush] enviar', e);
            return { ok: false, error: e };
        }
    },

    desactivar: async function() {
        if (!LumenAuth.currentUser) return;
        try {
            const reg = await navigator.serviceWorker.getRegistration().catch(() => null);
            let endpoint = null;
            if (reg && reg.pushManager) {
                const sub = await reg.pushManager.getSubscription().catch(() => null);
                if (sub) {
                    endpoint = sub.endpoint;
                    await sub.unsubscribe();
                }
            }
            // Borra solo la suscripción de ESTE dispositivo; otras siguen activas.
            if (endpoint) await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
            await supabase.from('profiles').update({ push_subscription: null }).eq('id', LumenAuth.currentUser.id);
            LumenUI.showToast('Notificaciones desactivadas.', 'success');
        } catch (e) { console.error('[LumenPush] desactivar', e); }
    }
};