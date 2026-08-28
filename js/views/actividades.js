let activeFilter = 'Todos';

const ActividadesView = {
    cropper: null, 
    render: function() {
        let content = '';
        let adminButton = LumenAuth.isAdmin ? `<button class="btn btn-add" onclick="ActividadesView.showAddForm()">${Icons.plus} Crear Nueva Actividad</button>` : '';

        if (LumenData.state.eventos === 'loading') {
            let skeletons = ''; for(let i=0; i<3; i++) skeletons += `<div class="skeleton-card"></div>`;
            content = `<div class="cards-grid">${skeletons}</div>`;
        } 
        else if (LumenData.state.eventos === 'empty') {
            content = `<div class="state-container">${Icons.empty_box}<h3>No hay actividades programadas</h3><p>Vuelve pronto para ver los próximos retiros y misiones.</p></div>`;
        } 
        else if (LumenData.state.eventos === 'ideal') {
            // Chips de Filtro
            let chipsHTML = `
                <div class="filter-chips reveal">
                    <div class="chip ${activeFilter === 'Todos' ? 'active' : ''}" onclick="ActividadesView.setFilter('Todos')">Todos</div>
                    <div class="chip ${activeFilter === 'unico' ? 'active' : ''}" onclick="ActividadesView.setFilter('unico')">Únicos</div>
                    <div class="chip ${activeFilter === 'recurrente' ? 'active' : ''}" onclick="ActividadesView.setFilter('recurrente')">Recurrentes</div>
                </div>
            `;

            let cardsHTML = '';
            // Filtrar eventos
            const filteredEvents = LumenData.eventos.filter(ev => activeFilter === 'Todos' || ev.tipo === activeFilter);
            
            if (filteredEvents.length === 0) {
                cardsHTML = `<div class="state-container">${Icons.empty_box}<h3>No hay actividades de este tipo</h3></div>`;
            } else {
                filteredEvents.forEach(evento => {
                    let adminButtons = LumenAuth.isAdmin ? `
                        <div class="card-footer">
                            <button class="btn btn-edit" onclick="ActividadesView.showAddForm('${evento.id}')">${Icons.edit} Editar</button>
                            <button class="btn btn-danger" onclick="ActividadesView.deleteActivity('${evento.id}')">${Icons.trash} Eliminar</button>
                        </div>
                    ` : '';
                    let badgeClass = evento.tipo === 'recurrente' ? 'badge-recurring' : 'badge-unique';
                    let badgeText = evento.tipo === 'recurrente' ? 'Semanal' : 'Único';
                    let fechaText = evento.tipo === 'recurrente' ? `Todos los ${evento.dia} a las ${evento.hora}` : (evento.fecha_inicio ? new Date(evento.fecha_inicio).toLocaleDateString('es-VE') : 'Pronto');

                    cardsHTML += `
                        <div class="card reveal">
                            ${evento.imageUrl ? `<img src="${evento.imageUrl}" alt="${evento.titulo}" loading="lazy" width="400" height="180" style="width:100%; height: 180px; object-fit: cover;">` : ''}
                            <div class="card-header">${Icons.calendar}<h3>${evento.titulo}</h3></div>
                            <div class="card-body">
                                <span class="card-badge ${badgeClass}">${badgeText}</span>
                                <p><strong>Fecha:</strong> ${fechaText}</p>
                                <p>${evento.descripcion.substring(0, 60)}...</p>
                                <button class="btn btn-primary btn-block" onclick="LumenData.selectedEventId='${evento.id}'; LumenRouter.navigateTo('detalle')">Ver Detalle</button>
                                ${adminButtons}
                            </div>
                        </div>
                    `;
                });
            }
            content = `${chipsHTML}<div class="cards-grid">${cardsHTML}</div>`;
        }

        return `<div class="view"><h2 class="reveal" style="color: var(--celeste-oscuro); margin-bottom:20px;">Próximas Actividades</h2><div class="reveal">${adminButton}</div>${content}</div>`;
    },
    setFilter: function(filter) {
        activeFilter = filter;
        LumenRouter.navigateTo('actividades');
    },
    showAddForm: function(id = null) {
        const evento = id ? LumenData.eventos.find(e => e.id === id) : {};
        const formHTML = `
            <form onsubmit="ActividadesView.saveActivity(event, '${id || ''}')">
                <div class="edit-avatar-section" style="margin-bottom: 20px;">
                    <img src="${evento.imageUrl || 'https://via.placeholder.com/400x200/005F8A/ffffff?text=Foto+Actividad'}" id="act-pic-preview" alt="Foto" style="width: 100%; height: 150px; border-radius: 12px; object-fit: cover;">
                    <label for="act-upload-pic" class="btn btn-edit" style="margin-top: 10px;">${Icons.edit} Subir/Recortar Foto</label>
                    <input type="file" id="act-upload-pic" accept="image/*" style="display:none" onchange="ActividadesView.handlePicUpload(event)">
                    <div id="cropper-area"></div>
                    <button type="button" id="act-crop-btn" class="btn btn-primary" style="display:none; margin-top:10px;" onclick="ActividadesView.cropAndSave('act')">Guardar Foto</button>
                    <input type="hidden" id="act-image-url" value="${evento.imageUrl || ''}">
                </div>
                <div class="form-group"><label>Título:</label><input type="text" id="act-title" value="${evento.titulo || ''}" required></div>
                <div class="form-group">
                    <label>Tipo de Actividad:</label>
                    <select id="act-type" onchange="ActividadesView.toggleFechaFields(this.value)">
                        <option value="unico" ${evento.tipo === 'unico' ? 'selected' : ''}>Única (Ej. Retiro)</option>
                        <option value="recurrente" ${evento.tipo === 'recurrente' ? 'selected' : ''}>Recurrente (Ej. Formación)</option>
                    </select>
                </div>
                <div id="unico-fields" style="display:${evento.tipo === 'recurrente' ? 'none' : 'block'};">
                    <div class="form-group"><label>Fecha y Hora de Inicio:</label><input type="datetime-local" id="act-start-date" value="${evento.fecha_inicio || ''}"></div>
                    <div class="form-group"><label>Fecha y Hora de Fin:</label><input type="datetime-local" id="act-end-date" value="${evento.fecha_fin || ''}"></div>
                </div>
                <div id="recurrente-fields" style="display:${evento.tipo === 'recurrente' ? 'block' : 'none'};">
                    <div class="form-grid-2">
                        <div class="form-group"><label>Día de la semana:</label><input type="text" id="act-day" value="${evento.dia || 'Sábado'}"></div>
                        <div class="form-group"><label>Hora:</label><input type="time" id="act-time" value="${evento.hora || '16:00'}"></div>
                    </div>
                </div>
                <div class="form-group"><label>Ubicación (Texto o URL Google Maps):</label><input type="text" id="act-location" value="${evento.ubicacion || ''}" placeholder="Ej: Salón Parroquial"></div>
                <div class="form-group">
                    <label>Requisitos de Edad:</label>
                    <select id="act-req-edad" onchange="ActividadesView.toggleReqFields(this.value)">
                        <option value="ninguno" ${evento.requisito_edad === 'ninguno' || !evento.requisito_edad ? 'selected' : ''}>Ninguno</option>
                        <option value="mayor15" ${evento.requisito_edad === 'mayor15' ? 'selected' : ''}>Mayores de 15 años</option>
                        <option value="mayor18" ${evento.requisito_edad === 'mayor18' ? 'selected' : ''}>Mayores de 18 años</option>
                        <option value="nacido_antes" ${evento.requisito_edad === 'nacido_antes' ? 'selected' : ''}>Nacidos antes de una fecha</option>
                        <option value="nacido_desde" ${evento.requisito_edad === 'nacido_desde' ? 'selected' : ''}>Nacidos desde una fecha</option>
                        <option value="rango_edad" ${evento.requisito_edad === 'rango_edad' ? 'selected' : ''}>Rango de edad</option>
                    </select>
                </div>
                <div id="req-fecha-wrap" class="sub-input" style="display:${(evento.requisito_edad === 'nacido_antes' || evento.requisito_edad === 'nacido_desde') ? 'block' : 'none'}; margin-bottom: 15px;">
                    <label>Fecha límite de nacimiento (Ej: 2006-01-01)</label>
                    <input type="date" id="act-req-fecha" value="${evento.requisito_fecha || ''}">
                </div>
                <div id="req-rango-wrap" class="sub-input" style="display:${evento.requisito_edad === 'rango_edad' ? 'block' : 'none'}; margin-bottom: 15px;">
                    <div class="form-grid-2">
                        <div class="form-group"><label>Edad Mínima:</label><input type="number" id="act-req-min-edad" value="${evento.requisito_min_edad || ''}"></div>
                        <div class="form-group"><label>Edad Máxima:</label><input type="number" id="act-req-max-edad" value="${evento.requisito_max_edad || ''}"></div>
                    </div>
                </div>
                <div class="form-group">
                    <label>¿Tiene Costo?</label>
                    <select id="act-has-cost" onchange="ActividadesView.toggleCostField(this.value)">
                        <option value="no" ${!evento.costo ? 'selected' : ''}>No</option>
                        <option value="si" ${evento.costo ? 'selected' : ''}>Sí</option>
                    </select>
                </div>
                <div id="cost-wrap" class="sub-input" style="display:${evento.costo ? 'block' : 'none'}; margin-bottom: 15px;">
                    <label>Describa el monto o aporte:</label>
                    <input type="text" id="act-cost" value="${evento.costo || ''}" placeholder="Ej: $5 o 1kg de comida no perecedera">
                </div>
                <div class="form-group"><label>Requisitos Adicionales:</label><textarea id="act-req-text" rows="2" placeholder="Traer Biblia, ropa cómoda...">${evento.requisitos_texto || ''}</textarea></div>
                <div class="form-group"><label>Descripción:</label><textarea id="act-desc" rows="3" required>${evento.descripcion || ''}</textarea></div>
                <button type="submit" class="btn btn-primary btn-block">Guardar Actividad</button>
            </form>
        `;
        LumenUI.openAdminModal(id ? 'Editar Actividad' : 'Crear Actividad', formHTML);
        if(id) { this.toggleFechaFields(evento.tipo); this.toggleReqFields(evento.requisito_edad || 'ninguno'); this.toggleCostField(evento.costo ? 'si' : 'no'); }
    },
    handlePicUpload: function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const cropArea = document.getElementById('cropper-area');
            const cropBtn = document.getElementById('act-crop-btn');
            document.getElementById('act-pic-preview').style.display = 'none';
            cropArea.style.display = 'block';
            cropBtn.style.display = 'block';
            cropArea.innerHTML = `<img src="${ev.target.result}" id="crop-image" style="max-width:100%;">`;
            if (this.cropper) this.cropper.destroy();
            const image = document.getElementById('crop-image');
            this.cropper = new Cropper(image, {
                aspectRatio: 16 / 9, viewMode: 1, dragMode: 'move', autoCropArea: 1.0,
                cropBoxMovable: false, cropBoxResizable: false, background: false, guides: false
            });
        };
        reader.readAsDataURL(file);
    },
    cropAndSave: function(prefix) {
        if (!this.cropper) return LumenUI.showToast('Primero selecciona una imagen.', 'error');
        const canvas = this.cropper.getCroppedCanvas({ width: 1280, height: 720, minWidth: 800, minHeight: 450, maxWidth: 1920, maxHeight: 1080, fillColor: '#fff', imageSmoothingEnabled: true, imageSmoothingQuality: 'high' });
        if (!canvas) return LumenUI.showToast('Error al recortar.', 'error');
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.9);
        document.getElementById('act-pic-preview').src = compressedBase64;
        document.getElementById('act-pic-preview').style.display = 'block';
        document.getElementById('act-image-url').value = compressedBase64;
        document.getElementById('cropper-area').style.display = 'none';
        document.getElementById('act-crop-btn').style.display = 'none';
        this.cropper.destroy();
        this.cropper = null;
        LumenUI.showToast('Foto de actividad lista en alta calidad. ¡Guarda los cambios!', 'success');
    },
    toggleFechaFields: function(type) {
        document.getElementById('unico-fields').style.display = type === 'unico' ? 'block' : 'none';
        document.getElementById('recurrente-fields').style.display = type === 'recurrente' ? 'block' : 'none';
    },
    toggleReqFields: function(type) {
        document.getElementById('req-fecha-wrap').style.display = (type === 'nacido_antes' || type === 'nacido_desde') ? 'block' : 'none';
        document.getElementById('req-rango-wrap').style.display = type === 'rango_edad' ? 'block' : 'none';
    },
    toggleCostField: function(type) {
        document.getElementById('cost-wrap').style.display = type === 'si' ? 'block' : 'none';
    },
    deleteActivity: function(id) {
        LumenUI.showConfirm("¿Seguro que quieres eliminar esta actividad? Esta acción no se puede deshacer.").then(confirmed => {
            if (confirmed) {
                LumenData.deleteActivity(id).then(() => LumenUI.showToast('Actividad eliminada', 'success'));
            }
        });
    },
    saveActivity: function(e, id) {
        e.preventDefault();
        const type = document.getElementById('act-type').value;
        const data = {
            titulo: document.getElementById('act-title').value,
            tipo: type,
            descripcion: document.getElementById('act-desc').value,
            ubicacion: document.getElementById('act-location').value,
            requisitos_edad: document.getElementById('act-req-edad').value,
            requisitos_texto: document.getElementById('act-req-text').value,
            imageUrl: document.getElementById('act-image-url').value
        };
        
        if (document.getElementById('act-has-cost').value === 'si') {
            data.costo = document.getElementById('act-cost').value;
        }
        
        if (data.requisitos_edad === 'nacido_antes' || data.requisitos_edad === 'nacido_desde') {
            data.requisito_fecha = document.getElementById('act-req-fecha').value;
        } else if (data.requisitos_edad === 'rango_edad') {
            data.requisito_min_edad = document.getElementById('act-req-min-edad').value;
            data.requisito_max_edad = document.getElementById('act-req-max-edad').value;
        }

        if (type === 'unico') {
            data.fecha_inicio = document.getElementById('act-start-date').value;
            data.fecha_fin = document.getElementById('act-end-date').value;
        } else {
            data.dia = document.getElementById('act-day').value;
            data.hora = document.getElementById('act-time').value;
        }
        
        const action = id ? LumenData.updateActivity(id, data) : LumenData.saveActivity(data);
        action.then(() => { LumenUI.closeModal('admin-modal'); LumenUI.showToast('Actividad guardada', 'success'); });
    }
};