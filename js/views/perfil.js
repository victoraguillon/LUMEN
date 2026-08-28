const PerfilView = {
    cropper: null, 

    render: function() {
        if (!LumenAuth.currentUser) return `<div class="state-container"><h3>Acceso Denegado</h3><p>Debes iniciar sesión.</p></div>`;
        
        const user = LumenAuth.userProfile || {};
        const picUrl = user.photoURL || `https://via.placeholder.com/150/005F8A/ffffff?text=${user.nombre ? user.nombre.charAt(0) : 'L'}`;
        
        let juvemarInfo = user.juvemar_status || 'No especificado';
        if (user.juvemar_status === 'Pertenece' && user.juvemar_tiempo) juvemarInfo = `Pertenece desde ${user.juvemar_tiempo}`;

        let progress = 0;
        if (user.nombre) progress += 20;
        if (user.photoURL) progress += 20;
        if (user.telefono) progress += 20;
        if (user.direccion) progress += 20;
        if (user.sacramentos && user.sacramentos.length > 0) progress += 20;

        // Badge de Rol
        let roleBadge = '<span class="table-badge pending">Pendiente</span>';
        if (user.role === 'global') roleBadge = '<span class="table-badge minor" style="background:rgba(0,162,232,0.1); color:#005F8A;">Usuario Global</span>';
        if (user.role === 'miembro') roleBadge = '<span class="table-badge approved">Miembro Juvemar</span>';
        if (user.role === 'admin') roleBadge = '<span class="table-badge approved" style="background:#005F8A; color:white;">Coordinador</span>';

        let joinJuvemarBtn = user.role === 'global' ? `<button class="btn btn-primary" onclick="LumenAuth.requestJuvemarMembership()">Solicitar Ingreso a Juvemar</button>` : '';
        let requestAdminBtn = (user.role === 'miembro' && !LumenAuth.isAdmin) ? `<button class="btn btn-outline" onclick="LumenAuth.requestAdmin()">Solicitar ser Coordinador</button>` : '';

        return `
            <div class="view">
                <div class="profile-header-card">
                    <img src="${picUrl}" alt="Perfil" class="profile-avatar-large">
                    <h2 class="profile-name-large">${user.nombre || 'Usuario'} ${roleBadge}</h2>
                    <p class="profile-email-large">${user.email}</p>
                    
                    <div style="width: 100%; max-width: 300px; margin: 20px auto 0;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                            <span style="font-size:12px; color:var(--texto-gris);">Progreso del perfil</span>
                            <span style="font-size:12px; color:var(--celeste-primario); font-weight:700;">${progress}%</span>
                        </div>
                        <div class="profile-progress-container">
                            <div class="profile-progress-bar" style="width: ${progress}%;"></div>
                        </div>
                    </div>

                    <div class="profile-actions">
                        <button class="btn btn-primary" onclick="PerfilView.showEditForm()">${Icons.edit} Editar Perfil</button>
                        ${joinJuvemarBtn}
                        ${requestAdminBtn}
                        <button class="btn btn-outline" onclick="LumenAuth.logout()">Cerrar Sesión</button>
                        <button class="btn btn-danger" onclick="LumenAuth.deleteAccount()">Eliminar Cuenta</button>
                    </div>
                </div>

                <div class="info-grid">
                    <div class="info-card">
                        <h4>${Icons.users} Datos Personales</h4>
                        <p><strong>Edad:</strong> ${user.edad || 'N/A'}</p>
                        <p><strong>Nacimiento:</strong> ${user.nacimiento || 'N/A'}</p>
                        <p><strong>Dirección:</strong> ${user.direccion || 'N/A'}</p>
                        <p><strong>Teléfono:</strong> ${user.telefono || 'N/A'}</p>
                        <p><strong>Juvemar:</strong> ${juvemarInfo}</p>
                    </div>
                    <div class="info-card">
                        <h4>${Icons.cross} Vida Sacramental</h4>
                        <ul>
                            ${(user.sacramentos || []).map(s => `<li>${s}</li>`).join('') || '<li>No especificado</li>'}
                        </ul>
                    </div>
                    <div class="info-card">
                        <h4>${Icons.book} Experiencias</h4>
                        <p><strong>Kerigma:</strong> ${user.kerigma || 'N/A'} ${user.samuel_parroquia ? `(${user.samuel_parroquia})` : ''}</p>
                        ${user.kerigma_otra ? `<p><strong>Otra:</strong> ${user.kerigma_otra}</p>` : ''}
                    </div>
                    ${user.representante_nombre ? `
                    <div class="info-card" style="border-left-color: #f39c12;">
                        <h4>${Icons.alert} Representante</h4>
                        <p><strong>Nombre:</strong> ${user.representante_nombre}</p>
                        <p><strong>Teléfono:</strong> ${user.representante_telefono}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    },
    
    showEditForm: function() {
        const user = LumenAuth.userProfile || {};
        const picUrl = user.photoURL || `https://via.placeholder.com/100/005F8A/ffffff?text=${user.nombre ? user.nombre.charAt(0) : 'L'}`;
        
        const formHTML = `
            <form onsubmit="PerfilView.saveEdit(event)">
                <div class="edit-avatar-section">
                    <img src="${picUrl}" id="ep-pic-preview" alt="Avatar">
                    <label for="ep-upload-pic" class="btn btn-edit">${Icons.edit} Cambiar Foto</label>
                    <input type="file" id="ep-upload-pic" accept="image/*" style="display:none" onchange="PerfilView.handlePicUpload(event)">
                    <div id="cropper-area"></div>
                    <button type="button" id="crop-save-btn" class="btn btn-primary" style="display:none; margin-top:15px;" onclick="PerfilView.cropAndSave()">Guardar Foto Recortada</button>
                </div>
                <div class="form-grid-2">
                    <div class="form-group"><label>Nombre y Apellido: *</label><input type="text" id="ep-name" value="${user.nombre || ''}" required></div>
                    <div class="form-group"><label>Edad: *</label><input type="number" id="ep-age" value="${user.edad || ''}" min="10" max="30" required></div>
                </div>
                <div class="form-grid-2">
                    <div class="form-group"><label>Fecha de cumpleaños (DD/MM/YYYY): *</label><input type="text" id="ep-birthdate" value="${user.nacimiento || ''}" required></div>
                    <div class="form-group"><label>Dirección: *</label><input type="text" id="ep-address" value="${user.direccion || ''}" required></div>
                </div>
                <div class="form-group"><label>Número telefónico: *</label><input type="tel" id="ep-phone" value="${user.telefono || ''}" required></div>
                <div class="form-group">
                    <label>Sacramentos hechos:</label>
                    <div class="checkbox-group">
                        <div class="checkbox-item"><input type="checkbox" id="ep-sac-bautismo" ${user.sacramentos?.includes('Bautismo') ? 'checked' : ''}><label for="ep-sac-bautismo">Bautismo</label></div>
                        <div class="checkbox-item"><input type="checkbox" id="ep-sac-comunion" ${user.sacramentos?.includes('Primera comunión') ? 'checked' : ''}><label for="ep-sac-comunion">Primera comunión</label></div>
                        <div class="checkbox-item"><input type="checkbox" id="ep-sac-confirmacion" ${user.sacramentos?.includes('Confirmación') ? 'checked' : ''}><label for="ep-sac-confirmacion">Confirmación</label></div>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Guardar Cambios</button>
            </form>
        `;
        LumenUI.openAdminModal('Editar Mi Perfil', formHTML);
    },
    handlePicUpload: function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const cropArea = document.getElementById('cropper-area');
            const cropBtn = document.getElementById('crop-save-btn');
            document.getElementById('ep-pic-preview').style.display = 'none';
            cropArea.style.display = 'block';
            cropBtn.style.display = 'block';
            cropArea.innerHTML = `<img src="${ev.target.result}" id="crop-image" style="max-width:100%;">`;
            if (this.cropper) this.cropper.destroy();
            const image = document.getElementById('crop-image');
            this.cropper = new Cropper(image, {
                aspectRatio: 1 / 1, viewMode: 1, dragMode: 'move', autoCropArea: 1.0,
                cropBoxMovable: false, cropBoxResizable: false, background: false, center: false, guides: false
            });
        };
        reader.readAsDataURL(file);
    },
    cropAndSave: function() {
        if (!this.cropper) return LumenUI.showToast('Primero selecciona una imagen.', 'error');
        const canvas = this.cropper.getCroppedCanvas({ width: 600, height: 600, fillColor: '#fff', imageSmoothingEnabled: true, imageSmoothingQuality: 'high' });
        if (!canvas) return LumenUI.showToast('No se pudo recortar la imagen. Intenta con otra.', 'error');
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.9);
        document.getElementById('ep-pic-preview').src = compressedBase64;
        document.getElementById('ep-pic-preview').style.display = 'block';
        document.getElementById('cropper-area').style.display = 'none';
        document.getElementById('crop-save-btn').style.display = 'none';
        this.cropper.destroy();
        this.cropper = null;
        db.ref('users/' + LumenAuth.currentUser.uid + '/photoURL').set(compressedBase64)
            .then(() => {
                LumenAuth.userProfile.photoURL = compressedBase64;
                LumenAuth.updateUI();
                LumenUI.showToast('Foto de perfil actualizada en alta calidad', 'success');
            });
    },
    saveEdit: function(e) {
        e.preventDefault();
        const sacramentos = [];
        if (document.getElementById('ep-sac-bautismo').checked) sacramentos.push("Bautismo");
        if (document.getElementById('ep-sac-comunion').checked) sacramentos.push("Primera comunión");
        if (document.getElementById('ep-sac-confirmacion').checked) sacramentos.push("Confirmación");
        const data = {
            nombre: document.getElementById('ep-name').value, edad: document.getElementById('ep-age').value,
            nacimiento: document.getElementById('ep-birthdate').value, direccion: document.getElementById('ep-address').value,
            telefono: document.getElementById('ep-phone').value, sacramentos: sacramentos
        };
        db.ref('users/' + LumenAuth.currentUser.uid).update(data)
            .then(() => {
                LumenAuth.userProfile = { ...LumenAuth.userProfile, ...data };
                LumenAuth.updateUI(); LumenUI.closeModal('admin-modal');
                LumenUI.showToast('Perfil actualizado correctamente', 'success');
                LumenRouter.navigateTo('perfil');
            }).catch(() => LumenUI.showToast('Error al actualizar', 'error'));
    },
    init: function() {}
};