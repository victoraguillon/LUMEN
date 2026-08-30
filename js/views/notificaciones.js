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
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:15px;">
                <h2 class="reveal" style="color: var(--celeste-oscuro); margin:0;">Centro de Notificaciones</h2>
                <button class="btn btn-outline" style="padding: 8px 15px; font-size: 12px;" onclick="NotificacionesView.markAllRead()">✓ Marcar todo como leído</button>
            </div>
        `;

        if (notifs.length === 0) {
            html += `<div class="state-container">${Icons.empty_box}<h3>Sin notificaciones</h3><p>No tienes notificaciones nuevas por ahora.</p></div>`;
        } else {
            html += '<div class="timeline">';
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
        }

        return `<div class="view">${html}</div>`;
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