const NotificacionesView = {
    render: function() {
        if (!LumenAuth.currentUser) {
            return `<div class="state-container"><h3>Acceso para miembros</h3><p>Inicia sesión para ver los avisos del grupo.</p><button class="btn btn-primary" style="margin-top: 15px;" onclick="LumenUI.requireMember()">Iniciar Sesión</button></div>`;
        }
        if (!LumenAuth.isMember) {
            return `<div class="state-container"><h3>Solo miembros</h3><p>Los avisos del grupo están disponibles para miembros de Juvemar.</p><button class="btn btn-primary" style="margin-top: 15px;" onclick="LumenUI.requireMember()">Solicitar Ingreso</button></div>`;
        }

        let notifs = [];
        if (LumenData.notifications) {
            notifs = LumenData.notifications.filter(n => LumenAuth.isAdmin || n.for_admin === false).reverse();
        }

        let html = `
            <div class="v-header reveal align-left">
                <span class="v-eyebrow">${Icons.bell} Avisos</span>
                <h2 class="v-title">Centro de <em>Notificaciones</em></h2>
                <p class="v-sub">Mantente al día con los avisos, recordatorios y noticias de Juvemar.</p>
                <div style="margin-top:16px;">
                    <button class="btn btn-outline" onclick="NotificacionesView.markAllRead()">✓ Marcar todo como leído</button>
                </div>
            </div>
        `;

        if (notifs.length === 0) {
            html += `<div class="v-empty" style="max-width:1080px;margin:0 auto;">${Icons.empty_box}<h3>Sin notificaciones</h3><p>No tienes notificaciones nuevas por ahora.</p></div>`;
        } else {
            html += '<div class="timeline" style="max-width:1080px;margin:0 auto;">';
            notifs.forEach(n => {
                // Lógica de colores según el texto de la notificación
                let itemClass = 'admin-notif'; // Azul por defecto
                if ((n.texto || '').toLowerCase().includes('recurso')) itemClass = 'recurso-notif';
                if ((n.texto || '').toLowerCase().includes('recordatorio') || (n.texto || '').toLowerCase().includes('mañana') || (n.texto || '').toLowerCase().includes('atención')) itemClass = 'recordatorio-notif';
                
                html += `
                    <div class="timeline-item ${itemClass} reveal">
                        <div class="timeline-time">${new Date(n.timestamp).toLocaleString()}</div>
                        <div class="timeline-text">${LumenUI.escapeHTML(n.texto)}</div>
                    </div>
                `;
            });
            html += '</div>';
            if (notifs.length >= LumenData.notifTake) {
                html += '<div style="text-align:center; margin-top:24px;"><button class="btn btn-outline" onclick="LumenData.loadMoreNotifications()">Cargar más avisos</button></div>';
            }
        }

        return `<div class="view" style="padding-top:var(--view-pad-top);">${html}</div>`;
    },
    init: function() {
        // Al entrar a la vista, marcamos todas como leídas en el LocalStorage y actualizamos el badge
        localStorage.setItem('lumen-last-read-notif', Date.now());
        LumenUI.updateNotifBadge();
        LumenRouter.initScrollReveal();
    },
    markAllRead: function() {
        localStorage.setItem('lumen-last-read-notif', Date.now());
        LumenUI.updateNotifBadge();
        LumenUI.showToast('Notificaciones marcadas como leídas', 'success');
    }
};