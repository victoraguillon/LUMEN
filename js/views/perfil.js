const PerfilView = {
    cropper: null,

    // ¿Este perfil corresponde a un miembro Juvemar (con campos extendidos)?
    isJuvemar: function(user) {
        return user && ['miembro', 'admin'].includes(user.role);
    },

    // Campos que aplican según el rol. Global => solo lo que guarda su registro.
    fieldCountFor: function(user) {
        let fields = ['nombre', 'photo_url', 'telefono', 'edad', 'nacimiento'];
        if (this.isJuvemar(user)) fields = fields.concat(['direccion', 'sacramentos']);
        return fields;
    },
    fieldWeightFor: function(user) {
        return Math.round(100 / this.fieldCountFor(user).length);
    },

    render: function() {
        if (!LumenAuth.currentUser) return `<div class="state-container"><h3>Acceso Denegado</h3><p>Debes iniciar sesión.</p></div>`;

        const user = LumenAuth.userProfile || {};
        const isJuvemar = this.isJuvemar(user);
        const picUrl = user.photo_url || `https://via.placeholder.com/150/005F8A/ffffff?text=${user.nombre ? encodeURIComponent(user.nombre.charAt(0)) : 'L'}`;

        // Progreso: solo cuenta los campos que aplican al rol
        let progress = 0;
        const fieldWeight = this.fieldWeightFor(user);
        const filled = (v) => v !== undefined && v !== null && String(v).trim() !== '';
        if (filled(user.nombre)) progress += fieldWeight;
        if (filled(user.photo_url)) progress += fieldWeight;
        if (filled(user.telefono)) progress += fieldWeight;
        if (filled(user.edad)) progress += fieldWeight;
        if (filled(user.nacimiento)) progress += fieldWeight;
        if (isJuvemar) {
            if (filled(user.direccion)) progress += fieldWeight;
            if (user.sacramentos && user.sacramentos.length > 0) progress += fieldWeight;
        }
        progress = Math.min(100, Math.round(progress));

        // Badge de Rol
        let roleBadge = '<span class="table-badge pending">Pendiente</span>';
        if (user.role === 'global') roleBadge = '<span class="table-badge minor is-global">Usuario Global</span>';
        if (user.role === 'miembro') roleBadge = '<span class="table-badge approved">Miembro Juvemar</span>';
        if (user.role === 'admin') roleBadge = '<span class="table-badge approved is-admin">Coordinador</span>';

        let joinJuvemarBtn = user.role === 'global' ? `<button class="btn btn-primary" onclick="LumenAuth.requestJuvemarMembership()">Solicitar Ingreso a Juvemar</button>` : '';
        let requestAdminBtn = (user.role === 'miembro' && !LumenAuth.isAdmin) ? `<button class="btn btn-outline" onclick="LumenAuth.requestAdmin()">Solicitar ser Coordinador</button>` : '';

        // --- Datos personales (comunes a todos los roles) ---
        let personalInfo = `
            <p><strong>Edad:</strong> ${LumenUI.escapeHTML(user.edad) || 'N/A'}</p>
            <p><strong>Nacimiento:</strong> ${LumenUI.escapeHTML(user.nacimiento) || 'N/A'}</p>
            <p><strong>Teléfono:</strong> ${LumenUI.escapeHTML(user.telefono) || 'N/A'}</p>
        `;
        // --- Campos exclusivos de Juvemar ---
        let juvemarInfo = '';
        if (isJuvemar) {
            let juvemarText = user.juvemar_status || 'No especificado';
            if (user.juvemar_status === 'Pertenece' && user.juvemar_tiempo) juvemarText = `Pertenece desde ${user.juvemar_tiempo}`;
            personalInfo += `<p><strong>Dirección:</strong> ${LumenUI.escapeHTML(user.direccion) || 'N/A'}</p>`;
            personalInfo += `<p><strong>Juvemar:</strong> ${LumenUI.escapeHTML(juvemarText)}</p>`;
        }
        const sacramentalCard = isJuvemar ? `
            <div class="info-card">
                <h4>${Icons.cross} Vida Sacramental</h4>
                <ul>
                    ${(user.sacramentos || []).map(s => `<li>${LumenUI.escapeHTML(s)}</li>`).join('') || '<li>No especificado</li>'}
                </ul>
            </div>
            <div class="info-card">
                <h4>${Icons.book} Experiencias</h4>
                <p><strong>Kerigma:</strong> ${LumenUI.escapeHTML(user.kerigma) || 'N/A'} ${user.samuel_parroquia ? `(${LumenUI.escapeHTML(user.samuel_parroquia)})` : ''}</p>
                ${user.kerigma_otra ? `<p><strong>Otra:</strong> ${LumenUI.escapeHTML(user.kerigma_otra)}</p>` : ''}
            </div>
            ${user.representante_nombre ? `
            <div class="info-card is-representante">
                <h4>${Icons.alert} Representante</h4>
                <p><strong>Nombre:</strong> ${LumenUI.escapeHTML(user.representante_nombre)}</p>
                <p><strong>Teléfono:</strong> ${LumenUI.escapeHTML(user.representante_telefono)}</p>
            </div>
            ` : ''}
        ` : '';

        return `
            <div class="view">
                <div class="profile-header-card">
                    <img src="${picUrl}" alt="Perfil" class="profile-avatar-large">
                    <h2 class="profile-name-large">${LumenUI.escapeHTML(user.nombre || 'Usuario')} ${roleBadge}</h2>
                    <p class="profile-email-large">${LumenUI.escapeHTML(user.email)}</p>

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
                        ${personalInfo}
                    </div>
                    ${sacramentalCard}
                </div>
            </div>
        `;
    },

    showEditForm: function() {
        const user = LumenAuth.userProfile || {};
        const isJuvemar = this.isJuvemar(user);
        const picUrl = user.photo_url || `https://via.placeholder.com/100/005F8A/ffffff?text=${user.nombre ? encodeURIComponent(user.nombre.charAt(0)) : 'L'}`;

        // Campos de dirección/sacramentos SOLO para Juvemar.
        // (El teléfono y la nacimiento son comunes; se renderizan más abajo.)
        const juvemarFields = isJuvemar ? `
            <div class="form-grid-2">
                <div class="form-group"><label for="ep-address">Dirección:</label><input type="text" id="ep-address" value="${LumenUI.escapeHTML(user.direccion || '')}"></div>
                <div class="form-group"><label for="ep-phone">Número telefónico: *</label><input type="tel" id="ep-phone" value="${LumenUI.escapeHTML(user.telefono || '')}" required></div>
            </div>
            <div class="form-group"><label for="ep-birthdate">Fecha de cumpleaños (DD/MM/YYYY): *</label><input type="text" id="ep-birthdate" value="${LumenUI.escapeHTML(user.nacimiento || '')}" required></div>
            <div class="form-group">
                <label>Sacramentos hechos:</label>
                <div class="checkbox-group">
                    <div class="checkbox-item"><input type="checkbox" id="ep-sac-bautismo" ${user.sacramentos?.includes('Bautismo') ? 'checked' : ''}><label for="ep-sac-bautismo">Bautismo</label></div>
                    <div class="checkbox-item"><input type="checkbox" id="ep-sac-comunion" ${user.sacramentos?.includes('Primera comunión') ? 'checked' : ''}><label for="ep-sac-comunion">Primera comunión</label></div>
                    <div class="checkbox-item"><input type="checkbox" id="ep-sac-confirmacion" ${user.sacramentos?.includes('Confirmación') ? 'checked' : ''}><label for="ep-sac-confirmacion">Confirmación</label></div>
                </div>
            </div>
        ` : `
            <div class="form-grid-2">
                <div class="form-group"><label>Fecha de cumpleaños (DD/MM/YYYY): *</label><input type="text" id="ep-nacimiento-field" value="${LumenUI.escapeHTML(user.nacimiento || '')}" required></div>
                <div class="form-group"><label>Número telefónico: *</label><input type="tel" id="ep-phone" value="${LumenUI.escapeHTML(user.telefono || '')}" required></div>
            </div>
        `;

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
                    <div class="form-group"><label for="ep-name">Nombre y Apellido: *</label><input type="text" id="ep-name" value="${LumenUI.escapeHTML(user.nombre || '')}" required></div>
                    <div class="form-group"><label>Edad: *</label><input type="number" id="ep-age" value="${LumenUI.escapeHTML(user.edad || '')}" min="10" max="30" required></div>
                </div>
                <div class="form-group">
                    <label>Correo Electrónico:</label>
                    <input type="email" value="${LumenUI.escapeHTML(user.email || '')}" readonly disabled class="readonly-field" aria-label="Correo electrónico (no editable)">
                    <p class="form-hint">El correo se gestiona desde tu cuenta y no puede cambiarse aquí.</p>
                </div>
                ${juvemarFields}
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
        const uid = LumenAuth.currentUser.id;
        document.getElementById('ep-pic-preview').src = canvas.toDataURL('image/jpeg', 0.9);
        document.getElementById('ep-pic-preview').style.display = 'block';
        document.getElementById('cropper-area').style.display = 'none';
        document.getElementById('crop-save-btn').style.display = 'none';
        this.cropper.destroy();
        this.cropper = null;

        canvas.toBlob((blob) => {
            const filePath = `${uid}/photo.jpg`;
            supabase.storage.from('avatars').upload(filePath, blob, { contentType: 'image/jpeg', upsert: true })
                .then(({ error }) => {
                    if (error) throw error;
                    const publicUrl = supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl;
                    return supabase.from('profiles').update({ photo_url: publicUrl }).eq('id', uid)
                        .then(({ error: upErr }) => {
                            if (upErr) throw upErr;
                            return publicUrl;
                        });
                })
                .then(() => {
                    // Recargar el perfil real desde la BD para sincronizar estado.
                    // El modal sigue abierto para que el usuario pueda completar el formulario.
                    return LumenAuth.loadProfile(LumenAuth.currentUser);
                })
                .then(() => {
                    LumenAuth.updateUI();
                    LumenUI.showToast('Foto de perfil actualizada en alta calidad', 'success');
                })
                .catch(err => {
                    console.error('[LUMEN] Error al guardar foto:', err);
                    LumenUI.showToast(LumenUI.getErrorMessage(err), 'error');
                });
        }, 'image/jpeg', 0.9);
    },
    saveEdit: function(e) {
        e.preventDefault();
        const isJuvemar = this.isJuvemar(LumenAuth.userProfile);
        const sacramentos = [];
        if (isJuvemar) {
            if (document.getElementById('ep-sac-bautismo').checked) sacramentos.push("Bautismo");
            if (document.getElementById('ep-sac-comunion').checked) sacramentos.push("Primera comunión");
            if (document.getElementById('ep-sac-confirmacion').checked) sacramentos.push("Confirmación");
        }

        const data = { nombre: document.getElementById('ep-name').value, edad: document.getElementById('ep-age').value };
        if (isJuvemar) {
            data.nacimiento = document.getElementById('ep-birthdate').value;
            data.direccion = document.getElementById('ep-address').value;
            data.sacramentos = sacramentos;
        } else {
            data.nacimiento = document.getElementById('ep-nacimiento-field').value;
        }
        data.telefono = document.getElementById('ep-phone').value;

        supabase.from('profiles').update(data).eq('id', LumenAuth.currentUser.id)
            .then(({ error }) => {
                if (error) {
                    console.error('[LUMEN] Error actualizando perfil:', error);
                    LumenUI.showToast(LumenUI.getErrorMessage(error), 'error');
                    return;
                }
                LumenUI.closeModal('admin-modal');
                LumenUI.showToast('Perfil actualizado correctamente', 'success');
                // Recargar perfil real desde la BD (esto también re-renderiza la vista)
                return LumenAuth.loadProfile(LumenAuth.currentUser);
            })
            .catch(err => {
                console.error('[LUMEN] Error actualizando perfil:', err);
                LumenUI.showToast(LumenUI.getErrorMessage(err), 'error');
            });
    },
    init: function() { LumenRouter.initScrollReveal(); },
    destroy: function() {
        if (this.cropper) { try { this.cropper.destroy(); } catch (e) {} this.cropper = null; }
    }
};
