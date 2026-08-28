const DetalleView = {
    render: function() {
        const evento = LumenData.eventos.find(e => e.id === LumenData.selectedEventId);
        if (!evento) return `<div class="state-container"><h3>Actividad no encontrada</h3></div>`;

        let fechaHTML = '';
        if (evento.tipo === 'recurrente') {
            fechaHTML = `<p><strong>Frecuencia:</strong> Todos los ${evento.dia} a las ${evento.hora}</p>`;
        } else {
            let inicio = evento.fecha_inicio ? new Date(evento.fecha_inicio).toLocaleString('es-VE') : 'Por definir';
            let fin = evento.fecha_fin ? new Date(evento.fecha_fin).toLocaleString('es-VE') : 'Por definir';
            fechaHTML = `<p><strong>Comienza:</strong> ${inicio}</p><p><strong>Termina:</strong> ${fin}</p>`;
        }

        let reqHTML = '<p>Ninguno (Todos pueden participar).</p>';
        if (evento.requisito_edad === 'mayor15') reqHTML = '<p style="color: var(--error); font-weight:600;">Solo para mayores de 15 años.</p>';
        if (evento.requisito_edad === 'mayor18') reqHTML = '<p style="color: var(--error); font-weight:600;">Solo para mayores de 18 años.</p>';
        if (evento.requisito_edad === 'nacido_antes') reqHTML = `<p style="color: var(--error); font-weight:600;">Solo para nacidos antes del ${evento.requisito_fecha || 'fecha no especificada'}.</p>`;
        if (evento.requisito_edad === 'nacido_desde') reqHTML = `<p style="color: var(--error); font-weight:600;">Solo para nacidos desde el ${evento.requisito_fecha || 'fecha no especificada'}.</p>`;
        if (evento.requisito_edad === 'rango_edad') reqHTML = `<p style="color: var(--error); font-weight:600;">Solo para jóvenes entre ${evento.requisito_min_edad} y ${evento.requisito_max_edad} años.</p>`;

        let costoHTML = '';
        if (evento.costo) {
            costoHTML = `<p style="color: var(--celeste-oscuro); font-weight:600;">💰 Costo/Aporte: ${evento.costo}</p>`;
        }

        let ubicacionHTML = '';
        if (evento.ubicacion) {
            ubicacionHTML = `<p><strong>📍 Ubicación:</strong> ${evento.ubicacion}</p>`;
        }

        let reqAdicionalHTML = '';
        if (evento.requisitos_texto) {
            reqAdicionalHTML = `<p><strong>📋 Requisitos Adicionales:</strong><br>${evento.requisitos_texto}</p>`;
        }

        let imageHTML = '';
        if (evento.imageUrl) {
            imageHTML = `<img src="${evento.imageUrl}" alt="${evento.titulo}" class="detail-hero-img">`;
        }

        return `
            <div class="view">
                <button class="btn btn-outline" style="margin-bottom: 20px;" onclick="LumenRouter.navigateTo('actividades')">${Icons.arrow_down} Volver</button>
                
                <div class="detail-layout">
                    <div class="detail-main">
                        ${imageHTML}
                        <span class="card-badge ${evento.tipo === 'recurrente' ? 'badge-recurring' : 'badge-unique'}">${evento.tipo === 'recurrente' ? 'Semanal' : 'Único'}</span>
                        <h1 style="color: var(--celeste-oscuro); margin: 15px 0 20px;">${evento.titulo}</h1>
                        
                        <div style="margin-bottom: 30px;">
                            <h3 style="color: var(--celeste-oscuro); margin-bottom: 10px; display:flex; align-items:center; gap:8px;">${Icons.book} Descripción</h3>
                            <p style="color: var(--texto-gris); white-space: pre-wrap; line-height: 1.8;">${evento.descripcion}</p>
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
    }
};