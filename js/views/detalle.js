const DetalleView = {
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
        if (evento.requisito_edad === 'mayor15') reqHTML = '<p style="color: var(--error); font-weight:600;">Solo para mayores de 15 años.</p>';
        if (evento.requisito_edad === 'mayor18') reqHTML = '<p style="color: var(--error); font-weight:600;">Solo para mayores de 18 años.</p>';
        if (evento.requisito_edad === 'nacido_antes') reqHTML = `<p style="color: var(--error); font-weight:600;">Solo para nacidos antes del ${LumenUI.escapeHTML(evento.requisito_fecha) || 'fecha no especificada'}.</p>`;
        if (evento.requisito_edad === 'nacido_desde') reqHTML = `<p style="color: var(--error); font-weight:600;">Solo para nacidos desde el ${LumenUI.escapeHTML(evento.requisito_fecha) || 'fecha no especificada'}.</p>`;
        if (evento.requisito_edad === 'rango_edad') reqHTML = `<p style="color: var(--error); font-weight:600;">Solo para jóvenes entre ${LumenUI.escapeHTML(evento.requisito_min_edad)} y ${LumenUI.escapeHTML(evento.requisito_max_edad)} años.</p>`;

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
            imageHTML = `<img src="${LumenUI.escapeHTML(evento.image_url)}" alt="${LumenUI.escapeHTML(evento.titulo)}" class="detail-hero-img">`;
        }

        return `
            <div class="view">
                <div class="v-detailbar reveal">
                    <button class="btn btn-icon" onclick="LumenRouter.navigateTo('actividades')" aria-label="Volver a actividades">←</button>
                    <div class="fm-title"><span class="fm-mod">${evento.tipo === 'recurrente' ? Icons.calendar + ' Actividad semanal' : Icons.sparkles + ' Actividad única'}</span></div>
                    <div class="fm-actions"></div>
                </div>
                
                <div class="detail-layout">
                    <div class="detail-main">
                        ${imageHTML}
                        <span class="v-chip ${evento.tipo === 'recurrente' ? '' : 'is-dorado'}" style="margin:14px 0 0;">${evento.tipo === 'recurrente' ? 'Semanal' : 'Único'}</span>
                        <h2 class="v-title detail-title">${LumenUI.escapeHTML(evento.titulo)}</h2>
                        
                        <div style="margin-bottom: 30px;">
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

                        <button class="btn btn-primary btn-block" onclick="LumenUI.openRegistration('${evento.id}')">Inscribirse Ahora</button>
                    </div>
                </div>
            </div>
        `;
    },
    init: function() { LumenRouter.initScrollReveal(); }
};