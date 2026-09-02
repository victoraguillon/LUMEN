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
                <div class="v-card__top">
                    <h3 class="v-card__title" style="color:#be185d;">${LumenIcons.sparkles} ¡Hoy es un día especial!</h3>
                </div>
                <p style="font-size:0.95rem; color:var(--texto-oscuro); line-height:1.6; margin:0;">Hoy cumple años: <strong>${LumenUI.escapeHTML(celebrantes.map(c => c.nombre).join(', '))}</strong>. ¡Dedícale un momento de oración y envíale un saludo!</p>
            `;
        });
    },

    _eventChip: function(ev) {
        const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        if (ev.tipo === 'recurrente') {
            return `<span class="act-date-chip"><strong>${LumenUI.escapeHTML((ev.dia || 'Semana').substring(0, 3))}</strong><span>Semanal</span></span>`;
        }
        const fecha = ev.fecha_inicio ? new Date(ev.fecha_inicio) : null;
        const num = fecha && !isNaN(fecha.getTime()) ? fecha.getDate() : '—';
        const mes = fecha && !isNaN(fecha.getTime()) ? MESES_CORTOS[fecha.getMonth()] : 'Pronto';
        return `<span class="act-date-chip"><strong>${num}</strong><span>${mes}</span></span>`;
    },

    _eventRow: function(ev) {
        const chip = this._eventChip(ev);

        let countdownHTML = '';
        if (ev.tipo === 'unico' && ev.fecha_inicio) {
            const diff = new Date(ev.fecha_inicio) - new Date();
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            if (days > 0) countdownHTML = `<div class="act-countdown">${LumenIcons.hourglass} Faltan ${days} ${days === 1 ? 'día' : 'días'} y ${hours} h</div>`;
            else if (days === 0 && hours > 0) countdownHTML = `<div class="act-countdown act-countdown--hoy">${LumenIcons.racha} ¡ES HOY! Faltan ${hours} h</div>`;
        }

        return `
            <div class="dash-item" onclick="LumenData.selectedEventId='${ev.id}'; LumenRouter.navigateTo('detalle')">
                ${chip}
                <div class="dash-item__info">
                    <strong>${LumenUI.escapeHTML(ev.titulo)}</strong>
                    <small>${LumenUI.escapeHTML((ev.descripcion || '').substring(0, 60))}…</small>
                    ${countdownHTML}
                </div>
            </div>
        `;
    },

    _accessRow: function(icon, titulo, detalle, destino) {
        return `
            <a class="v-row-link" onclick="LumenRouter.navigateTo('${destino}')" href="#/${destino}">
                <span class="v-row-link__icon">${icon}</span>
                <span class="v-row-link__text">
                    <strong>${titulo}</strong>
                    <small>${detalle}</small>
                </span>
                ${LumenIcons.chevron_right ? `<span class="v-row-link__arrow">${LumenIcons.chevron_right.replace('<svg', '<svg class="v-row-link__arrow"')}</span>` : ''}
            </a>
        `;
    },

    _verseTile: function(frase, ctaLabel) {
        return `
            <article class="v-hero dash-verse dash-span reveal">
                <span class="v-eyebrow">Alimento de hoy</span>
                <p class="v-quote">“${LumenUI.escapeHTML(frase.frase)}”</p>
                <cite class="v-quote-cite">${LumenUI.escapeHTML(frase.autor)}</cite>
                <div class="v-hero__cta">
                    <button class="btn btn-outline" onclick="LumenRouter.navigateTo('devocional')">${LumenIcons.oraciones} ${ctaLabel}</button>
                </div>
            </article>
        `;
    },

    render: function() {
        const isMember = LumenAuth.isMember;
        const dayOfMonth = new Date().getDate();
        const fraseDelDia = (typeof FRASES_SANTOS !== 'undefined' && FRASES_SANTOS.length) ? FRASES_SANTOS[(dayOfMonth - 1) % FRASES_SANTOS.length] : { frase: "Dios nos ama y nos acompaña siempre.", autor: "Lumen" };

        let accessRowIntenciones = this._accessRow(
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
            'Muro de Intenciones', 'Oremos unos por otros. Comparte tu intención.', 'intenciones'
        );
        let accessRowContacto = this._accessRow(
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
            'Contacto', '¿Dudas o quieres saber más sobre Juvemar? Escríbenos.', 'contacto'
        );

        if (!LumenAuth.currentUser) {
            const upcomingPublic = LumenData.upcomingEventos(3);
            let upcomingHTML = '';
            if (upcomingPublic.length === 0) {
                upcomingHTML = '<p class="v-hint" style="margin:0;">No hay actividades programadas.</p>';
            } else {
                upcomingHTML = upcomingPublic.map(ev => this._eventRow(ev)).join('');
            }

            return `
                <div class="view">
                    <header class="v-header reveal">
                        <span class="v-eyebrow">Pastoral Juvenil Digital</span>
                        <h1 class="v-title">¡Bienvenido a LUMEN!</h1>
                        <p class="v-sub">Descubre nuestra comunidad, actividades y crecimiento espiritual.</p>
                    </header>

                    ${this._verseTile(fraseDelDia, 'Mira el pasaje y santo de hoy')}

                    <div class="dash-grid">
                        <section class="v-card dash-card reveal">
                            <div class="v-card__top">
                                <h2 class="v-card__title">${LumenIcons.agenda || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>'} Próximas Actividades</h2>
                            </div>
                            <div class="dash-list">
                                ${upcomingHTML}
                            </div>
                            <button class="btn btn-outline btn-block" onclick="LumenRouter.navigateTo('actividades')">Ver todas</button>
                        </section>

                        <section class="v-card v-card--tint dash-span reveal">
                            <div class="v-card__top">
                                <h2 class="v-card__title">${LumenIcons.miembros || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'} Únete a la Comunidad</h2>
                            </div>
                            <p style="margin:0;">Crea tu cuenta en tres pasos, participa en actividades y sé parte de la familia Juvemar.</p>
                            <div class="btn-row" style="margin:6px 0 0;">
                                <button class="btn btn-primary" onclick="LumenUI.openModal('register-modal')">Crear mi cuenta</button>
                                <button class="btn btn-outline" onclick="LumenUI.openModal('login-modal')">Ya tengo cuenta</button>
                            </div>
                        </section>

                        <section class="v-card v-card--tint-soft reveal">
                            <div class="v-card__top">
                                <h2 class="v-card__title">Explora</h2>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:10px;">
                                ${accessRowIntenciones}
                                ${accessRowContacto}
                            </div>
                        </section>
                    </div>
                </div>
            `;
        }

        const user = LumenAuth.userProfile || {};
        const firstName = LumenUI.escapeHTML((user.nombre?.split(' ')[0] || 'Hermano(a)'));
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
            tenureMessage = "¡Bienvenido a la familia Juvemar! Estamos felices de tenerte aquí.";
        }

        let upcomingEventsHTML = '';
        const upcoming = LumenData.upcomingEventos(3);
        if (upcoming.length === 0) {
            upcomingEventsHTML = '<p class="v-hint" style="margin:0;">No hay actividades programadas.</p>';
        } else {
            upcomingEventsHTML = upcoming.map(ev => this._eventRow(ev)).join('');
        }

        let adminBox = '';
        if (isMember && !LumenAuth.isAdmin) {
            adminBox = `
                <section class="v-card v-card--tint dash-span reveal" style="background:rgba(217,119,6,0.06); border-color:rgba(217,119,6,0.2);">
                    <div class="v-card__top">
                        <h2 class="v-card__title" style="color:#b45309;">${LumenIcons.alert || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'} ¿Quieres ayudar a coordinar?</h2>
                    </div>
                    <p style="margin:0;">Solicita ser administrador para añadir actividades y recursos.</p>
                    <div class="btn-row" style="margin:2px 0 0;">
                        <button class="btn btn-primary" onclick="LumenAuth.requestAdmin()">Solicitar Acceso</button>
                    </div>
                </section>
            `;
        }

        let juvemarInviteBox = '';
        const isGlobal = LumenAuth.currentUser && !LumenAuth.isMember && !LumenAuth.isAdmin;
        if (isGlobal) {
            juvemarInviteBox = `
                <section class="v-card v-card--tint dash-span reveal" style="background:rgba(201,168,76,0.08); border-color:rgba(201,168,76,0.25);">
                    <div class="v-card__top">
                        <h2 class="v-card__title" style="color:#8a6d1f;">${LumenIcons.miembros || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'} ¿Deseas ser parte de Juvemar?</h2>
                    </div>
                    <p style="margin:0;">Únete a nuestra comunidad juvenil: formación, actividades, apostolado y vida fraterna.</p>
                    <div class="btn-row" style="margin:2px 0 0;">
                        <button class="btn btn-primary btn-block" onclick="LumenUI.openJuvemarJoin()">Quiero unirme</button>
                    </div>
                </section>
            `;
        }

        let recursosCard = '';
        if (isMember) {
            recursosCard = this._accessRow(
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
                'Recursos', 'Material de formación, oraciones y guías de retiro.', 'recursos'
            );
        }

        return `
            <div class="view">
                <header class="v-header v-header--split reveal">
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <h1 class="v-title">${greeting}, ${firstName}!</h1>
                        <p class="v-sub">${tenureMessage}</p>
                    </div>
                    <div class="v-header__actions">
                        <div class="v-stat">
                            <strong>${LumenData.eventos.length}</strong>
                            <span>Actividades</span>
                        </div>
                    </div>
                </header>

                ${this._verseTile(fraseDelDia, 'Mira el pasaje y santo de hoy')}

                <div class="dash-grid" style="margin-top: var(--ds-6);">
                    <section class="v-card dash-card reveal">
                        <div class="v-card__top">
                            <h2 class="v-card__title">${LumenIcons.agenda || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>'} Próximas Actividades</h2>
                        </div>
                        <div class="dash-list">
                            ${upcomingEventsHTML}
                        </div>
                        <button class="btn btn-outline btn-block" onclick="LumenRouter.navigateTo('actividades')">Ver todas</button>
                    </section>

                    <section class="v-card dash-card reveal" id="cumple-hoy-box" data-cumple style="display:none;"></section>

                    <section class="v-card reveal" data-push-card>
                        <div class="v-card__top">
                            <h2 class="v-card__title">${Icons.bell} Activa Notificaciones</h2>
                        </div>
                        <p style="margin:0;">Recibe los recordatorios de las actividades y los avisos importantes directamente en este dispositivo.</p>
                        <button class="btn btn-primary btn-block" data-push-action onclick="LumenPush.activarNotificaciones()">Activar Avisos</button>
                    </section>

                    ${adminBox}
                    ${juvemarInviteBox}

                    <section class="v-card v-card--tint-soft dash-span reveal">
                        <div class="v-card__top">
                            <h2 class="v-card__title">Explora</h2>
                        </div>
                        <div style="display:grid; gap:10px; grid-template-columns:1fr;">
                            ${accessRowIntenciones}
                            ${recursosCard}
                            ${accessRowContacto}
                        </div>
                    </section>
                </div>
            </div>
        `;
    }
};