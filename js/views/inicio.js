const InicioView = {
    init: function() {
        // Cumpleañero de hoy (vía RPC, no depende de RLS de profiles)
        this.loadHoyBirthday();
        // Refrescar estado de notificaciones push
        if (typeof LumenPush !== 'undefined' && LumenPush.aplicarEstadoUI) LumenPush.aplicarEstadoUI();
    },
    loadHoyBirthday: function() {
        if (!LumenAuth.currentUser) return;
        LumenData.loadBirthdays(0).then(list => {
            const container = document.getElementById('cumple-hoy-box');
            if (!container) return;
            const hoy = new Date();
            const todayDay = String(hoy.getDate()).padStart(2, '0');
            const todayMonth = String(hoy.getMonth() + 1).padStart(2, '0');
            const celebrantes = list.filter(c => String(c.mes) === todayMonth && String(c.dia).padStart(2, '0') === todayDay);
            if (celebrantes.length === 0) {
                container.style.display = 'none';
                return;
            }
            container.style.display = '';
            container.innerHTML = `
                <div class="bento-title" style="color: #ef4444;">${LumenIcons.sparkles} ¡Hoy es un día especial!</div>
                <p style="font-size: 16px; color: var(--texto-oscuro); margin:0;">Hoy cumple años: <strong>${LumenUI.escapeHTML(celebrantes.map(c => c.nombre).join(', '))}</strong>. ¡Dedícale un momento de oración y envíale un saludo!</p>
            `;
        });
    },
    render: function() {
        const isMember = LumenAuth.isMember;

        if (!LumenAuth.currentUser) {
            const upcomingPublic = LumenData.upcomingEventos(3);
            let upcomingHTML = '';
            if (upcomingPublic.length === 0) {
                upcomingHTML = '<p style="color:var(--texto-gris); font-size:14px; margin:0;">No hay actividades programadas.</p>';
            } else {
                upcomingPublic.forEach(ev => {
                    let dateStr = ev.tipo === 'recurrente' ? (ev.dia || '').substring(0,3) : (ev.fecha_inicio ? LumenUI.formatDate(ev.fecha_inicio).split(' ')[0] : 'Pronto');
                    upcomingHTML += `
                        <div class="mini-event-card" onclick="LumenData.selectedEventId='${ev.id}'; LumenRouter.navigateTo('detalle')" style="cursor:pointer; flex-direction:column; align-items:flex-start; gap:5px;">
                            <div style="display:flex; gap:15px; width:100%; align-items:center;">
                                <div class="mini-event-date">
                                    <span>${dateStr}</span>
                                    <small>${ev.tipo === 'recurrente' ? 'Semanal' : 'Único'}</small>
                                </div>
                                <div class="mini-event-info">
                                    <h4>${LumenUI.escapeHTML(ev.titulo)}</h4>
                                    <p>${LumenUI.escapeHTML((ev.descripcion || '').substring(0, 40))}...</p>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
            const dayOfMonth = new Date().getDate();
            const frase = (typeof FRASES_SANTOS !== 'undefined' && FRASES_SANTOS.length) ? FRASES_SANTOS[(dayOfMonth - 1) % FRASES_SANTOS.length] : { frase: "Dios nos ama y nos acompaña siempre.", autor: "Lumen" };
            return `
                <div class="view">
                    <div class="v-header reveal">
                        <h2 class="v-title">¡Bienvenido a <em>LUMEN</em>    !</h2>
                        <p class="v-sub">Descubre nuestra comunidad, actividades y crecimiento espiritual.</p>
                    </div>

                    <div class="bento-grid">
                        <div class="bento-box bento-large reveal" style="background: var(--gradiente-lumen); justify-content: center; text-align: center; padding: 40px;">
                            <div class="bento-title on-gradient" style="justify-content: center;">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                <span style="font-size: 22px;">Friendly Reminder</span>
                            </div>
                            <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
                                <p class="verse-text-large on-gradient" style="font-size: 28px; font-style: italic; font-weight: 300; margin-bottom: 24px; line-height: 1.45;">"${frase.frase}"</p>
                                <cite class="on-gradient" style="font-size: 16px; font-weight: 600; opacity: 0.9; text-transform: uppercase; letter-spacing: 2px;">(${frase.autor})</cite>
                                <button class="btn btn-outline btn-block on-gradient" style="max-width: 280px; margin: 32px auto 0;" onclick="LumenRouter.navigateTo('devocional')">${LumenIcons.oraciones} Mira el pasaje y santo de hoy</button>
                            </div>
                        </div>

                        <div class="bento-box bento-tall reveal reveal-delay-1">
                            <div class="bento-title">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                Próximas Actividades
                            </div>
                            <div style="display:flex; flex-direction:column; gap:15px;">
                                ${upcomingHTML}
                            </div>
                            <button class="btn btn-outline btn-block" style="margin-top:auto;" onclick="LumenRouter.navigateTo('actividades')">Ver todas</button>
                        </div>

                        <div class="bento-box reveal reveal-delay-2">
                            <div class="bento-title">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                Muro de Intenciones
                            </div>
                            <p>Oremos unos por otros. Comparte tu intención.</p>
                            <button class="btn btn-primary btn-block" style="margin-top:auto;" onclick="LumenRouter.navigateTo('intenciones')">Ir al Muro</button>
                        </div>

                        <div class="bento-box reveal reveal-delay-3">
                            <div class="bento-title">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                Contacto
                            </div>
                            <p>¿Dudas o quieres saber más sobre Juvemar? Escríbenos.</p>
                            <button class="btn btn-primary btn-block" style="margin-top:auto;" onclick="LumenRouter.navigateTo('contacto')">Contáctanos</button>
                        </div>

                        <div class="bento-box bento-wide reveal">
                            <div class="bento-title">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                Únete a la Comunidad
                            </div>
                            <p>Crea tu cuenta en tres pasos, participa en actividades y sé parte de la familia Juvemar.</p>
                            <div class="btn-row">
                                <button class="btn btn-primary" onclick="LumenUI.openModal('register-modal')">Crear mi cuenta</button>
                                <button class="btn btn-outline" onclick="LumenUI.openModal('login-modal')">Ya tengo cuenta</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        const user = LumenAuth.userProfile || {};
        const firstName = LumenUI.escapeHTML((user.nombre?.split(' ')[0] || 'Hermano(a)'));
        
        // Saludo Dinámico
        const hour = new Date().getHours();
        let greeting = "¡Buenas noches";
        if (hour >= 6 && hour < 12) greeting = "¡Buenos días";
        else if (hour >= 12 && hour < 19) greeting = "¡Buenas tardes";

        let tenureMessage = "¡Nos alegra mucho que estés aquí! Eres nuevo en la plataforma.";
        if (user.juvemar_status === 'Pertenece' && user.juvemar_tiempo) {
            const since = new Date(user.juvemar_tiempo + "-01T00:00:00");
            const now = new Date();
            let months = (now.getFullYear() - since.getFullYear()) * 12 + (now.getMonth() - since.getMonth());
            if (months < 0) months = 0;
            let years = Math.floor(months / 12);
            let remMonths = months % 12;
            let timeStr = "";
            if (years > 0) timeStr += `${years} ${years === 1 ? 'año' : 'años'}`;
            if (remMonths > 0) {
                if (years > 0) timeStr += " y ";
                timeStr += `${remMonths} ${remMonths === 1 ? 'mes' : 'meses'}`;
            }
            if (years === 0 && remMonths === 0) tenureMessage = "¡Recién comenzaste tu camino en Juvemar este mes! Bienvenido.";
            else tenureMessage = `Llevas <strong>${timeStr}</strong> en Juvemar. ¡Gracias por tu compromiso!`;
        } else if (user.juvemar_status === 'Nuevo') {
            tenureMessage = `¡Bienvenido a la familia Juvemar! Estamos felices de tenerte aquí.`;
        }

        const dayOfMonth = new Date().getDate();
        const fraseDelDia = (typeof FRASES_SANTOS !== 'undefined' && FRASES_SANTOS.length) ? FRASES_SANTOS[(dayOfMonth - 1) % FRASES_SANTOS.length] : { frase: "Dios nos ama y nos acompaña siempre.", autor: "Lumen" };

        let upcomingEventsHTML = '';
        const upcoming = LumenData.upcomingEventos(3);
        if (upcoming.length === 0) {
            upcomingEventsHTML = '<p style="color:var(--texto-gris); font-size:14px; margin:0;">No hay actividades programadas.</p>';
        } else {
            upcoming.forEach(ev => {
                let dateStr = ev.tipo === 'recurrente' ? (ev.dia || '').substring(0,3) : (ev.fecha_inicio ? LumenUI.formatDate(ev.fecha_inicio).split(' ')[0] : 'Pronto');
                
                // Lógica Countdown
                let countdownHTML = '';
                if (ev.tipo === 'unico' && ev.fecha_inicio) {
                    const diff = new Date(ev.fecha_inicio) - new Date();
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    if (days > 0) countdownHTML = `<div class="countdown-timer">${LumenIcons.hourglass} Faltan ${days} días y ${hours} horas</div>`;
                    else if (days === 0 && hours > 0) countdownHTML = `<div class="countdown-timer">${LumenIcons.racha} ¡ES HOY! Faltan ${hours} horas</div>`;
                }

                upcomingEventsHTML += `
                    <div class="mini-event-card" onclick="LumenData.selectedEventId='${ev.id}'; LumenRouter.navigateTo('detalle')" style="cursor:pointer; flex-direction:column; align-items:flex-start; gap:5px;">
                        <div style="display:flex; gap:15px; width:100%; align-items:center;">
                            <div class="mini-event-date">
                                <span>${dateStr}</span>
                                <small>${ev.tipo === 'recurrente' ? 'Semanal' : 'Único'}</small>
                            </div>
                            <div class="mini-event-info">
                                <h4>${LumenUI.escapeHTML(ev.titulo)}</h4>
                                <p>${LumenUI.escapeHTML((ev.descripcion || '').substring(0, 40))}...</p>
                            </div>
                        </div>
                        ${countdownHTML}
                    </div>
                `;
            });
        }

        let adminBox = '';
        if (isMember && !LumenAuth.isAdmin) {
            adminBox = `
                <div class="admin-request-box" style="margin-top: 20px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 32px; height: 32px; color: var(--warning); flex-shrink: 0;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    <div style="flex:1">
                        <h4 class="is-warning-title" style="margin-bottom: 5px;">¿Quieres ayudar a coordinar?</h4>
                        <p style="font-size:13px; margin-bottom:10px; color: var(--texto-gris);">Solicita ser administrador para añadir actividades y recursos.</p>
                        <button class="btn btn-primary" style="padding: 8px 20px; font-size: 13px;" onclick="LumenAuth.requestAdmin()">Solicitar Acceso</button>
                    </div>
                </div>
            `;
        }

        let juvemarInviteBox = '';
        const isGlobal = LumenAuth.currentUser && !LumenAuth.isMember && !LumenAuth.isAdmin;
        if (isGlobal) {
            juvemarInviteBox = `
            <div class="bento-box bento-wide warning-box reveal">
                <div class="bento-title is-warning" style="justify-content: center;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    ¿Deseas ser parte de LUMEN?
                </div>
                <p style="color: var(--texto-gris); text-align: center; margin: 10px 0;">Únete a nuestra comunidad juvenil: formación, actividades, apostolado y vida fraterna.</p>
                <button class="btn btn-primary btn-block" style="max-width: 300px; margin: 0 auto;" onclick="LumenUI.openJuvemarJoin()">Quiero unirme</button>
            </div>`;
        }

        return `
            <div class="view">
                <div class="v-header reveal align-left" style="text-align:left; align-items:flex-start;">
                    <h2 class="v-title">${greeting}, <em>${firstName}</em>!</h2>
                    <p class="v-sub">${tenureMessage}</p>
                    <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:4px;">
                        <span class="v-chip">${Icons.calendar} ${LumenData.eventos.length} Actividades</span>
                    </div>
                </div>

                <div class="bento-grid">
                    <div class="bento-box bento-large reveal" style="background: var(--gradiente-lumen); justify-content: center; text-align: center; padding: 40px;">
                        <div class="bento-title on-gradient" style="justify-content: center;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="28" height="28"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            <span style="font-size: 22px;">Friendly Reminder</span>
                        </div>
                        <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
                            <p class="verse-text-large on-gradient" style="font-size: 28px; font-style: italic; font-weight: 300; margin-bottom: 24px; line-height: 1.45;">"${fraseDelDia.frase}"</p>
                            <cite class="on-gradient" style="font-size: 16px; font-weight: 600; opacity: 0.9; text-transform: uppercase; letter-spacing: 2px;">(${fraseDelDia.autor})</cite>
                            <button class="btn btn-outline btn-block on-gradient" style="max-width: 280px; margin: 32px auto 0;" onclick="LumenRouter.navigateTo('devocional')">${LumenIcons.oraciones} Mira el pasaje y santo de hoy</button>
                        </div>
                    </div>

                    <div class="bento-box bento-tall reveal reveal-delay-1">
                        <div class="bento-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            Próximas Actividades
                        </div>
                        <div style="display:flex; flex-direction:column; gap:15px;">
                            ${upcomingEventsHTML}
                        </div>
                        <button class="btn btn-outline btn-block" style="margin-top:auto;" onclick="LumenRouter.navigateTo('actividades')">Ver todas</button>
                    </div>

                    <div class="bento-box bento-wide danger-box reveal" id="cumple-hoy-box" style="display:none;"></div>

                    <div class="bento-box reveal" data-push-card>
                        <div class="bento-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            Activa Notificaciones
                        </div>
                        <p>Recibe los recordatorios de las actividades y los avisos importantes directamente en este dispositivo.</p>
                        <button class="btn btn-primary btn-block" style="margin-top:auto;" data-push-action onclick="LumenPush.activarNotificaciones()">${Icons.bell} Activar Avisos</button>
                    </div>

                    <div class="bento-box reveal reveal-delay-2">
                        <div class="bento-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                            Muro de Intenciones
                        </div>
                        <p>Oremos unos por otros. Comparte tu intención.</p>
                        <button class="btn btn-primary btn-block" style="margin-top:auto;" onclick="LumenRouter.navigateTo('intenciones')">Ir al Muro</button>
                    </div>

                    ${isMember ? `<div class="bento-box reveal reveal-delay-3">
                        <div class="bento-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            Recursos
                        </div>
                        <p>Material de formación, oraciones y guías de retiro.</p>
                        <button class="btn btn-primary btn-block" style="margin-top:auto;" onclick="LumenRouter.navigateTo('recursos')">Ir a Recursos</button>
                    </div>` : ''}
                    
                    ${juvemarInviteBox}
                    ${adminBox ? `<div class="bento-box bento-wide reveal">${adminBox}</div>` : ''}
                </div>
            </div>
        `;
    }
};