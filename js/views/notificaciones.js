const NotificacionesView = {
    _iconForTone: function(tone) {
        if (tone === 'recurso') return Icons.book;
        if (tone === 'recordatorio') return Icons.alert;
        return Icons.bell;
    },
    _toneFor: function(texto) {
        const t = (texto || '').toLowerCase();
        if (t.includes('recurso')) return 'recurso';
        if (t.includes('recordatorio') || t.includes('mañana') || t.includes('atención')) return 'recordatorio';
        return 'info';
    },
    _timeIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',

    render: function() {
        if (!LumenAuth.currentUser) {
            return `
                <div class="view">
                    <div class="v-empty" style="margin-top:12vh;">
                        ${Icons.users}
                        <h3>Acceso para miembros</h3>
                        <p>Inicia sesión para ver los avisos del grupo.</p>
                        <button class="btn btn-primary" onclick="LumenUI.requireMember()">Iniciar Sesión</button>
                    </div>
                </div>`;
        }
        if (!LumenAuth.isMember) {
            return `
                <div class="view">
                    <div class="v-empty" style="margin-top:12vh;">
                        ${Icons.users}
                        <h3>Solo miembros</h3>
                        <p>Los avisos del grupo están disponibles para miembros de Juvemar.</p>
                        <button class="btn btn-primary" onclick="LumenUI.requireMember()">Solicitar Ingreso</button>
                    </div>
                </div>`;
        }

        let notifs = [];
        if (LumenData.notifications) {
            notifs = LumenData.notifications.filter(n => LumenAuth.isAdmin || n.for_admin === false).reverse();
        }

        let body = '';

        if (notifs.length === 0) {
            body = `
                <div class="v-empty">
                    ${Icons.empty_box}
                    <h3>Sin notificaciones</h3>
                    <p>No tienes notificaciones nuevas por ahora.</p>
                </div>`;
        } else {
            body = `
                <div class="notif-list">
                    ${notifs.map(n => {
                        const tone = this._toneFor(n.texto);
                        return `
                            <article class="notif-item reveal" data-tone="${tone}">
                                <span class="notif-mark">${this._iconForTone(tone)}</span>
                                <div class="notif-body">
                                    <p>${LumenUI.escapeHTML(n.texto)}</p>
                                    <span class="notif-time">${this._timeIcon} ${new Date(n.timestamp).toLocaleString('es-VE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </article>`;
                    }).join('')}
                </div>`;
            if (notifs.length >= LumenData.notifTake) {
                body += '<div style="text-align:center; margin-top:28px;"><button class="btn btn-outline" onclick="LumenData.loadMoreNotifications()">Cargar más avisos</button></div>';
            }
        }

        return `
            <div class="view">
                <header class="v-header v-header--split reveal">
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <h1 class="v-title">Centro de Notificaciones</h1>
                        <p class="v-sub">Avisos, recordatorios y novedades de la comunidad.</p>
                    </div>
                    <div class="v-header__actions">
                        <button class="btn btn-outline btn--sm" onclick="NotificacionesView.markAllRead()">${Icons.check || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px;"><polyline points="20 6 9 17 4 12"></polyline></svg>'} Marcar todo como leído</button>
                    </div>
                </header>
                ${body}
            </div>
        `;
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