let currentResourceTab = "Oraciones";
let resourceSearchQuery = "";

const RecursosView = {
    render: function() {
        if (!LumenAuth.currentUser) {
            return `<div class="state-container"><h3>Acceso para miembros</h3><p>Inicia sesión para acceder a los recursos.</p><button class="btn btn-primary" style="margin-top: 15px;" onclick="LumenUI.requireMember()">Iniciar Sesión</button></div>`;
        }
        if (!LumenAuth.isMember) {
            return `<div class="state-container"><h3>Solo miembros</h3><p>Los recursos están disponibles para miembros de Juvemar.</p><button class="btn btn-primary" style="margin-top: 15px;" onclick="LumenUI.requireMember()">Solicitar Ingreso</button></div>`;
        }
        const categorias = Object.keys(LumenData.recursos);
        let tabsHTML = '';
        if (categorias.length > 0) {
            if (!categorias.includes(currentResourceTab)) currentResourceTab = categorias[0];
            tabsHTML = `<div class="seg-tabs reveal">`;
            categorias.forEach(cat => {
                tabsHTML += `<button class="seg-tab ${cat === currentResourceTab ? 'active' : ''}" onclick="RecursosView.changeTab('${cat}')">${cat}</button>`;
            });
            tabsHTML += `</div>`;
        }

        let content = '';
        if (LumenData.state.recursos === 'loading') {
            content = `<div class="v-skeleton"></div>`;
        } else if (LumenData.state.recursos === 'empty' || categorias.length === 0) {
            content = `<div class="v-empty">${Icons.empty_box}<h3>No hay recursos disponibles</h3><p>Pronto subiremos materiales de formación.</p></div>`;
        } else {
            const recursosTab = LumenData.recursos[currentResourceTab] || {};
            let filteredResources = Object.keys(recursosTab).map(k => ({ id: k, ...recursosTab[k] }));
            
            // Lógica de Búsqueda
            if (resourceSearchQuery) {
                filteredResources = filteredResources.filter(r => (r.titulo || '').toLowerCase().includes(resourceSearchQuery.toLowerCase()));
            }

            if (filteredResources.length === 0) {
                content = `<div class="v-empty">${Icons.empty_box}<h3>Sin resultados</h3><p>No se encontraron recursos para tu búsqueda.</p></div>`;
            } else {
                let cardsHTML = '';
                filteredResources.forEach(res => {
                    // Selección de icono según tipo
                    let icon = Icons.book;
                    if ((res.tipo || '').toLowerCase().includes('video')) icon = Icons.megaphone;
                    else if ((res.tipo || '').toLowerCase().includes('audio') || (res.tipo || '').toLowerCase().includes('música')) icon = Icons.music;
                    
                    cardsHTML += `
                        <button class="v-card reveal" onclick="RecursosView.showResourceDetails('${res.id}')" style="align-items:stretch; text-align:left;">
                            <div class="v-card-icon" style="margin-bottom:12px;">${icon}</div>
                            <h3>${LumenUI.escapeHTML(res.titulo)}</h3>
                            <span class="v-chip" style="align-self:flex-start; margin-top:8px;">${LumenUI.escapeHTML(res.tipo)}</span>
                        </button>
                    `;
                });
                content = `<input type="text" class="search-bar" placeholder="Buscar recurso…" onkeyup="RecursosView.search(this.value)" value="${LumenUI.escapeHTML(resourceSearchQuery)}"><div class="v-grid">${cardsHTML}</div>`;
            }
        }

        let adminButton = LumenAuth.isAdmin ? `<button class="btn btn-add" onclick="RecursosView.showAddForm()">${Icons.plus} Añadir Recurso</button>` : '';

        return `
            <div class="view">
                <div class="v-header reveal">
                    <span class="v-eyebrow">${Icons.book} Formación</span>
                    <h2 class="v-title">Recursos y <em>Formación</em></h2>
                    <p class="v-sub">Materiales de formación, oraciones y guías exclusivas para miembros.</p>
                </div>
                <div class="v-section" style="padding-top:0;">
                    <div class="reveal">${adminButton}</div>
                    ${tabsHTML}
                    ${content}
                </div>
            </div>
        `;
    },
    init: function() {
        LumenRouter.initScrollReveal();
    },
    search: function(q) {
        resourceSearchQuery = q;
        // Re-renderizar solo el contenedor de recursos sin recargar la página entera
        document.getElementById('app-container').innerHTML = RecursosView.render();
        this.init();
    },
    showResourceDetails: function(resId) {
        const res = LumenData.recursos[currentResourceTab][resId];
        if (!res) return;
        const adminActions = LumenAuth.isAdmin ? `
            <div style="display:flex; gap:10px; margin-top:15px;">
                <button class="btn btn-edit" style="flex:1;" onclick="LumenUI.closeModal('admin-modal'); RecursosView.showAddForm('${resId}')">${Icons.edit} Editar</button>
                <button class="btn btn-danger" style="flex:1;" onclick="RecursosView.deleteResource('${resId}')">${Icons.trash} Eliminar</button>
            </div>
        ` : '';
        const contentHTML = `
            <div style="text-align:center; padding:10px;">
                <h3 style="color:var(--celeste-oscuro); margin-bottom:10px;">${LumenUI.escapeHTML(res.titulo)}</h3>
                <p style="color:var(--texto-gris); margin-bottom:20px;">Formato: ${LumenUI.escapeHTML(res.tipo)}</p>
                <a href="${LumenUI.escapeHTML(res.url)}" target="_blank" rel="noopener" class="btn btn-primary btn-block">${Icons.download} Ver / Descargar</a>
                ${adminActions}
            </div>
        `;
        LumenUI.openAdminModal('Detalle del Recurso', contentHTML);
    },
    changeTab: function(cat) {
        currentResourceTab = cat;
        resourceSearchQuery = "";
        LumenRouter.navigateTo('recursos');
    },
    showAddForm: function(key = null) {
        const res = key ? LumenData.recursos[currentResourceTab][key] : {};
        const formHTML = `
            <form onsubmit="RecursosView.saveResource(event, '${key || ''}')">
                <div class="form-group"><label>Título:</label><input type="text" id="res-title" value="${LumenUI.escapeHTML(res.titulo || '')}" required></div>
                <div class="form-group"><label>Categoría:</label><input type="text" id="res-cat" value="${LumenUI.escapeHTML(currentResourceTab)}" required></div>
                <div class="form-group"><label>Tipo (PDF, Video, Audio):</label><input type="text" id="res-type" value="${LumenUI.escapeHTML(res.tipo || '')}" required></div>
                <div class="form-group"><label>Enlace (URL Google Drive, YouTube, etc.):</label><input type="url" id="res-url" value="${LumenUI.escapeHTML(res.url || '')}" placeholder="https://..." required></div>
                <button type="submit" class="btn btn-primary btn-block">Guardar Recurso</button>
            </form>
        `;
        LumenUI.openAdminModal(key ? 'Editar Recurso' : 'Añadir Recurso', formHTML);
    },
    deleteResource: function(key) {
        LumenUI.showConfirm("¿Eliminar este recurso?").then(confirmed => {
            if (confirmed) {
                LumenData.deleteResource(currentResourceTab, key).then(() => LumenUI.showToast('Eliminado', 'success'));
            }
        });
    },
    saveResource: function(e, key) {
        e.preventDefault();
        const title = document.getElementById('res-title').value;
        const cat = document.getElementById('res-cat').value;
        const type = document.getElementById('res-type').value;
        const url = document.getElementById('res-url').value;
        const data = { titulo: title, tipo: type, url: url };
        const action = key ? LumenData.updateResource(cat, key, data) : LumenData.saveResource(cat, data);
        action.then(() => {
            LumenUI.closeModal('admin-modal');
            LumenUI.showToast('Recurso guardado', 'success');
            currentResourceTab = cat;
        }).catch(err => LumenUI.showToast(LumenUI.getErrorMessage(err), 'error'));
    }
};