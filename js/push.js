// LumenPush: suscripción Web Push + envío vía Edge Function send-push
const LumenPush = {
    channel: null,
    init: function() {
        if (!this.supported()) return;
        navigator.serviceWorker.ready.then(() => this.aplicarEstadoUI()).catch(() => {});
    },
    supported: function() { return 'PushManager' in window && 'Notification' in window; },
    b64ToUint8: function(base64) {
        const padding = '='.repeat((4 - base64.length % 4) % 4);
        const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
        const raw = window.atob(b64);
        const bytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
        return bytes;
    },
    getSW: function() { return navigator.serviceWorker.ready; },
    activarNotificaciones: async function() {
        if (!this.supported()) { LumenUI.showToast('Tu navegador no soporta notificaciones push.', 'error'); return false; }
        if (!LumenAuth.currentUser) { LumenUI.openModal('login-modal'); return false; }
        try {
            const perm = await Notification.requestPermission();
            if (perm !== 'granted') { LumenUI.showToast('Permiso de notificaciones no otorgado.', 'error'); return false; }
            await this.registrarSuscripcion();
            LumenUI.showToast('¡Notificaciones activadas! Recibirás avisos en tu teléfono.', 'success');
            return true;
        } catch (e) {
            console.error('[LumenPush] activar', e);
            LumenUI.showToast('Error al activar notificaciones.', 'error');
            return false;
        }
    },
    registrarSuscripcion: async function() {
        try {
            const reg = await this.getSW();
            let sub = await reg.pushManager.getSubscription();
            if (!sub) {
                sub = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: supabaseConfig.pushVapidKey
                });
            }
            const plain = JSON.parse(JSON.stringify(sub));
            await supabase.from('profiles').update({ push_subscription: plain }).eq('id', LumenAuth.currentUser.id);
            this.applySubscriptionState();
            return true;
        } catch (e) {
            console.error('[LumenPush] registrar', e);
            if (e && e.name === 'NotAllowedError') LumenUI.showToast('El permiso fue denegado en el navegador.', 'error');
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
        document.querySelectorAll('[data-push-card]').forEach(card => {
            const btn = card.querySelector('[data-push-action]');
            if (!btn) return;
            if (!supported || estado === 'on') {
                card.style.display = 'none';
            } else {
                card.style.display = '';
            }
        });
    },
    enviarPush: async function(opts) {
        if (!LumenAuth.currentUser) return;
        try {
            const { data } = await supabase.auth.getSession();
            const token = data && data.session ? data.session.access_token : null;
            if (!token) return;
            const res = await fetch(supabaseConfig.pushEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ mode: opts.mode || 'self', title: opts.title || '', body: opts.body || '', url: opts.url || '/actividades' })
            });
            if (!res.ok && res.status !== 401 && res.status !== 403) console.error('[LumenPush] enviar', res.status);
        } catch (e) { console.error('[LumenPush] enviar', e); }
    },
    desactivar: async function() {
        if (!LumenAuth.currentUser) return;
        try {
            const reg = await navigator.serviceWorker.getRegistration().catch(() => null);
            if (reg && reg.pushManager) {
                const sub = await reg.pushManager.getSubscription().catch(() => null);
                if (sub) await sub.unsubscribe();
            }
            await supabase.from('profiles').update({ push_subscription: null }).eq('id', LumenAuth.currentUser.id);
            LumenUI.showToast('Notificaciones desactivadas.', 'success');
        } catch (e) { console.error('[LumenPush] desactivar', e); }
    }
};