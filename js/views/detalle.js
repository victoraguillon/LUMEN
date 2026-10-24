const DetalleView = {
    route: function() {
        return { parts: (typeof LumenData !== 'undefined' && LumenData.selectedEventId)
            ? [LumenData.selectedEventId]
            : [], query: null };
    },
    applyRoute: function(params) {
        if (typeof LumenData === 'undefined') return;
        LumenData.selectedEventId = params[0] || null;
    },

    _calendarHTML: function(evento) {
        if (typeof LumenCalendar === 'undefined' || !LumenCalendar.canExport(evento)) return '';
        return `<div class="calendar-actions">
            <button class="btn btn-sm btn-outline" type="button" onclick="LumenCalendar.download(LumenData.eventos.find(e=>e.id==='${evento.id}'))">Añadir al calendario (.ics)</button>
            <button class="btn btn-sm btn-outline" type="button" onclick="LumenCalendar.openGoogle(LumenData.eventos.find(e=>e.id==='${evento.id}'))">Google Calendar</button>
        </div>`;
    },

    _registrationHTML: function(evento) {
        const ins = (typeof LumenData !== 'undefined' && LumenData.inscripcionFor) ? LumenData.inscripcionFor(evento.id) : null;
        if (!ins) {
            return `<button class="btn btn-primary btn-block" onclick="LumenUI.openRegistration('${evento.id}')">Inscribirse Ahora</button>`;
        }
        return `<div class="registered-box">
            <span class="registered-badge">${LumenIcons.check_circle} Estás inscrito</span>
            <p class="registered-note">Tu inscripción está confirmada. Puedes cancelarla si no podrás asistir.</p>
            <div class="registered-actions">
                <button class="btn btn-sm btn-danger" type="button" onclick="DetalleView.cancelRegistration('${evento.id}')">Cancelar inscripción</button>
            </div>
            ${this._calendarHTML(evento)}
        </div>`;
    },

    refreshRegistration: function() {
        const evento = LumenData.eventos.find(e => e.id === LumenData.selectedEventId);
        const box = document.getElementById('registration-box');
        if (evento && box) box.innerHTML = this._registrationHTML(evento);
    },

    cancelRegistration: function(eventId) {
        const ins = LumenData.inscripcionFor(eventId);
        if (!ins) return;
        LumenUI.showConfirm('¿Quieres cancelar tu inscripción a esta actividad?').then(function(ok) {
            if (!ok) return;
            LumenData.cancelInscripcion(ins.id).then(function() {
                LumenUI.showToast(navigator.onLine === false ? 'Cancelación guardada; se enviará al recuperar conexión.' : 'Inscripción cancelada.', 'success');
                DetalleView.refreshRegistration();
            }).catch(function(err) {
                LumenUI.showToast(LumenUI.getErrorMessage ? LumenUI.getErrorMessage(err) : 'No se pudo cancelar la inscripción.', 'error');
            });
        });
    },

    render: function() {
        const evento = LumenData.eventos.find(e => e.id === LumenData.selectedEventId);
        if (!evento) return `<div class="state-container"><h3>Actividad no encontrada</h3></div>`;

        let fechaHTML = '';
        if (evento.tipo === 'recurrente') {
            fechaHTML = `<p><strong>Frecuencia:</strong> Todos los ${LumenUI.escapeHTML(evento.dia)} a las ${LumenUI.escapeHTML(evento.hora)}</p>`;
        } else {
            let inicio = evento.fecha_inicio ? new Date(evento.fecha_inicio).toLocaleString('es-VE') : 'Por definir';
            let fin = evento.fecha_fin ? new Date(evento.fecha_fin).toLocaleString('es-VE') : 'Por definir';
            fechaHTML = `<p><strong>Comienza:</strong> ${inicio}</p><p><strong>Termina:</strong> ${fin}</p>`;
        }

        let reqHTML = '<p>Ninguno (Todos pueden participar).</p>';
        if (evento.requisitos_edad === 'mayor15') reqHTML = '<p class="v-err-txt" >Solo para mayores de 15 años.</p>';
        if (evento.requisitos_edad === 'mayor18') reqHTML = '<p class="v-err-txt" >Solo para mayores de 18 años.</p>';
        if (evento.requisitos_edad === 'nacido_antes') reqHTML = `<p class="v-err-txt" >Solo para nacidos antes del ${LumenUI.escapeHTML(evento.requisito_fecha) || 'fecha no especificada'}.</p>`;
        if (evento.requisitos_edad === 'nacido_desde') reqHTML = `<p class="v-err-txt" >Solo para nacidos desde el ${LumenUI.escapeHTML(evento.requisito_fecha) || 'fecha no especificada'}.</p>`;
        if (evento.requisitos_edad === 'rango_edad') reqHTML = `<p class="v-err-txt" >Solo para jóvenes entre ${LumenUI.escapeHTML(evento.requisito_min_edad)} y ${LumenUI.escapeHTML(evento.requisito_max_edad)} años.</p>`;

        let costoHTML = '';
        if (evento.costo) {
            costoHTML = `<p class="v-chip" style="margin:8px 0;">💰 Costo/Aporte: ${LumenUI.escapeHTML(evento.costo)}</p>`;
        }

        let ubicacionHTML = '';
        if (evento.ubicacion) {
            ubicacionHTML = `<p><strong>${LumenIcons.map_pin} Ubicación:</strong> ${LumenUI.escapeHTML(evento.ubicacion)}</p>`;
        }

        let reqAdicionalHTML = '';
        if (evento.requisitos_texto) {
            reqAdicionalHTML = `<p><strong>📋 Requisitos Adicionales:</strong><br>${LumenUI.escapeHTML(evento.requisitos_texto)}</p>`;
        }

        let imageHTML = '';
        if (evento.image_url) {
            imageHTML = `<img src="${LumenUI.sanitizeImageUrl(evento.image_url)}" alt="${LumenUI.escapeHTML(evento.titulo)}" width="1200" height="675" decoding="async" class="detail-hero-img">`;
        }

        return `
            <div class="view">
                <div class="v-detailbar reveal">
                    <button class="btn btn-icon" onclick="LumenRouter.navigateTo('actividades')" aria-label="Volver a actividades">←</button>
                    <div class="fm-title"><span class="fm-mod">${evento.tipo === 'recurrente' ? Icons.calendar + ' Actividad semanal' : LumenIcons.sparkles + ' Actividad única'}</span></div>
                    <div class="fm-actions"></div>
                </div>
                
                <div class="detail-layout">
                    <div class="detail-main">
                        ${imageHTML}
                        <span class="v-chip ${evento.tipo === 'recurrente' ? '' : 'is-dorado'}" style="margin:14px 0 0;">${evento.tipo === 'recurrente' ? 'Semanal' : 'Único'}</span>
                        <h1 class="v-title detail-title">${LumenUI.escapeHTML(evento.titulo)}</h1>
                        
                        <div class="v-mb30" >
                            <div class="v-section-title">${Icons.book} Descripción</div>
                            <p style="color: var(--texto-gris); white-space: pre-wrap; line-height: 1.8; margin-top:8px;">${LumenUI.escapeHTML(evento.descripcion)}</p>
                        </div>
                    </div>

                    <div class="detail-sidebar">
                        <div class="sidebar-section">
                            <div class="sidebar-title">${Icons.calendar} Fecha y Hora</div>
                            ${fechaHTML}
                            ${ubicacionHTML}
                            ${costoHTML}
                        </div>

                        <div class="sidebar-section">
                            <div class="sidebar-title">${Icons.alert} Requisitos</div>
                            ${reqHTML}
                            ${reqAdicionalHTML}
                        </div>

                        <div id="registration-box">${this._registrationHTML(evento)}</div>
                    </div>
                </div>
            </div>
        `;
    },
    init: function() {
        LumenRouter.initScrollReveal();
        if (typeof LumenAuth !== 'undefined' && LumenAuth.currentUser && LumenData.loadMyInscripciones) {
            LumenData.loadMyInscripciones().then(function() { DetalleView.refreshRegistration(); }).catch(function() {});
        }
    }
};