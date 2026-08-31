let currentGestionTab = "estadisticas";
let gestionCharts = {}; 
let currentMatrixYear = new Date().getFullYear();
let currentMatrixMonth = new Date().getMonth() + 1;

const GestionView = {
    render: function() {
        if (!LumenAuth.isAdmin) {
            return `<div class="state-container">${Icons.alert}<h3>Acceso Denegado</h3><p>No tienes permisos de administrador.</p></div>`;
        }
        return `
            <div class="view">
                <h2 class="reveal" style="color: var(--celeste-oscuro); margin-bottom:20px;">Módulo de Gestión</h2>
                <div class="admin-tabs reveal" style="overflow-x: auto;">
                    <button class="admin-tab ${currentGestionTab === 'estadisticas' ? 'active' : ''}" onclick="GestionView.changeTab('estadisticas')">Estadísticas</button>
                    <button class="admin-tab ${currentGestionTab === 'usuarios' ? 'active' : ''}" onclick="GestionView.changeTab('usuarios')">Censo</button>
                    <button class="admin-tab ${currentGestionTab === 'inscritos' ? 'active' : ''}" onclick="GestionView.changeTab('inscritos')">Inscritos</button>
                    <button class="admin-tab ${currentGestionTab === 'asistencia' ? 'active' : ''}" onclick="GestionView.changeTab('asistencia')">Asistencia</button>
                    <button class="admin-tab ${currentGestionTab === 'comunicacion' ? 'active' : ''}" onclick="GestionView.changeTab('comunicacion')">Comunicación</button>
                    <button class="admin-tab ${currentGestionTab === 'cumpleanos' ? 'active' : ''}" onclick="GestionView.changeTab('cumpleanos')">Cumpleaños</button>
                    <button class="admin-tab ${currentGestionTab === 'blog' ? 'active' : ''}" onclick="GestionView.changeTab('blog')">Blog</button>
                </div>
                <div id="gestion-content" class="reveal"></div>
            </div>
        `;
    },
    init: function() {
        if (!LumenData.users) { LumenData.loadUsers().then(() => this.renderContent()); } else { this.renderContent(); }
    },
    changeTab: function(tab) { 
        Object.values(gestionCharts).forEach(chart => chart.destroy());
        gestionCharts = {};
        currentGestionTab = tab; 
        LumenRouter.navigateTo('gestion'); 
    },
    renderContent: function() {
        const container = document.getElementById('gestion-content');
        if (currentGestionTab === 'estadisticas') container.innerHTML = this.renderStats();
        else if (currentGestionTab === 'usuarios') container.innerHTML = this.renderUsuarios();
        else if (currentGestionTab === 'inscritos') container.innerHTML = this.renderInscritos();
        else if (currentGestionTab === 'asistencia') container.innerHTML = this.renderMatrix();
        else if (currentGestionTab === 'comunicacion') container.innerHTML = this.renderComunicacion();
        else if (currentGestionTab === 'cumpleanos') container.innerHTML = this.renderCumpleanos();
        else if (currentGestionTab === 'blog') container.innerHTML = this.renderBlog();
    },
    ensureUsers: function(cb) {
        if (LumenData.users) return cb();
        LumenData.loadUsers().then(() => cb());
    },

    // --- BLOG GESTIÓN ---
    renderBlog: function() {
        if (!LumenData.blogArticles) return `<div class="state-container"><div class="skeleton-card" style="height:300px; width:100%;"></div></div>`;
        
        const pending = LumenData.blogArticles.filter(a => a.status === 'pending');
        const approved = LumenData.blogArticles.filter(a => a.status === 'approved');

        let html = '<h3 style="margin-bottom: 15px;">Artículos Pendientes</h3>';
        if (pending.length === 0) html += '<p>No hay artículos pendientes.</p>';
        
        pending.forEach(a => {
            html += `
                <div class="attendance-card" style="flex-direction: column; align-items: flex-start; margin-bottom: 15px;">
                    <h4>${LumenUI.escapeHTML(a.titulo)}</h4>
                    <p style="font-size: 12px; color: var(--texto-gris); margin-bottom: 10px;">Por ${LumenUI.escapeHTML(a.author_name)}</p>
                    <p style="font-size: 14px; margin-bottom: 15px;">${LumenUI.escapeHTML((a.contenido || '').substring(0, 150))}...</p>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-primary" onclick="GestionView.approveArticle('${a.id}')">Aprobar</button>
                        <button class="btn btn-danger" onclick="GestionView.deleteArticle('${a.id}')">Eliminar</button>
                    </div>
                </div>
            `;
        });

        html += '<h3 style="margin: 30px 0 15px;">Artículos Publicados</h3>';
        if (approved.length === 0) html += '<p>No hay artículos publicados.</p>';
        
        approved.forEach(a => {
            html += `
                <div class="attendance-card" style="margin-bottom: 10px;">
                    <div class="mini-event-info">
                        <h4>${LumenUI.escapeHTML(a.titulo)}</h4>
                        <p>Por ${LumenUI.escapeHTML(a.author_name)}</p>
                    </div>
                    <button class="btn btn-danger" style="margin-left: auto;" onclick="GestionView.deleteArticle('${a.id}')">Eliminar</button>
                </div>
            `;
        });

        return html;
    },
    approveArticle: function(id) {
        supabase.from('articulos').update({ status: 'approved' }).eq('id', id).then(({ error }) => {
            if (error) return LumenUI.showToast(LumenUI.getErrorMessage(error), 'error');
            LumenUI.showToast('Artículo aprobado y publicado', 'success');
            LumenData.loadBlog();
            supabase.from('articulos').select('*').eq('id', id).single().then(({ data: a }) => {
                if (a && a.author_email) {
                    fetch('https://formsubmit.co/ajax/' + a.author_email, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify({ _subject: 'Tu artículo fue publicado en LUMEN', titulo: a.titulo, mensaje: `¡Hola ${a.author_name || ''}! Tu artículo "${a.titulo}" fue aprobado y ya está publicado en el blog de LUMEN. ¡Gracias por compartir!` })
                    }).catch(() => {});
                }
            });
        });
    },
    deleteArticle: function(id) {
        LumenUI.showConfirm("¿Eliminar este artículo permanentemente?").then(confirmed => {
            if(confirmed) {
                supabase.from('articulos').delete().eq('id', id).then(({ error }) => {
                    if (error) return LumenUI.showToast(LumenUI.getErrorMessage(error), 'error');
                    LumenUI.showToast('Artículo eliminado', 'success');
                    LumenData.loadBlog();
                });
            }
        });
    },

    // --- ESTADÍSTICAS ---
    renderStats: function() {
        if (!LumenData.users) {
            return `<div class="state-container"><div class="skeleton-card" style="height:300px; width:100%;"></div></div>`;
        }
        const users = Object.values(LumenData.users).filter(u => u.status === 'approved' || u.role === 'admin');
        const totalActivos = users.length;
        const totalPendientes = Object.values(LumenData.users).filter(u => u.status === 'pending').length;
        const totalEventos = LumenData.eventos.length;

        return `
            <div class="info-grid" style="margin-bottom: 30px;">
                <div class="stat-card"><h3>${totalActivos}</h3><p>Miembros Activos</p></div>
                <div class="stat-card"><h3 style="color: var(--error);">${totalPendientes}</h3><p>Pendientes</p></div>
                <div class="stat-card"><h3>${totalEventos}</h3><p>Actividades</p></div>
            </div>
            <div class="cards-grid">
                <div class="card"><div class="card-body"><canvas id="chart-edades"></canvas></div></div>
                <div class="card"><div class="card-body"><canvas id="chart-sacramentos"></canvas></div></div>
            </div>
        `;
    },
    initCharts: function() {
        if (currentGestionTab !== 'estadisticas' || !LumenData.users) return;
        const users = Object.values(LumenData.users).filter(u => u.status === 'approved' || u.role === 'admin');

        let rango14_17 = 0, rango18_21 = 0, rango22_27 = 0;
        users.forEach(u => {
            const age = parseInt(u.edad);
            if (age >= 14 && age <= 17) rango14_17++;
            else if (age >= 18 && age <= 21) rango18_21++;
            else if (age >= 22 && age <= 27) rango22_27++;
        });

        gestionCharts.edades = new Chart(document.getElementById('chart-edades'), {
            type: 'doughnut',
            data: { labels: ['14-17 años', '18-21 años', '22-27 años'], datasets: [{ data: [rango14_17, rango18_21, rango22_27], backgroundColor: ['#00A2E8', '#005F8A', '#2ecc71'] }] },
            options: { plugins: { title: { display: true, text: 'Rangos de Edad' } } }
        });

        let bautismo = 0, comunion = 0, confirmacion = 0;
        users.forEach(u => {
            if (u.sacramentos) {
                if (u.sacramentos.includes("Bautismo")) bautismo++;
                if (u.sacramentos.includes("Primera comunión")) comunion++;
                if (u.sacramentos.includes("Confirmación")) confirmacion++;
            }
        });

        gestionCharts.sacramentos = new Chart(document.getElementById('chart-sacramentos'), {
            type: 'bar',
            data: { labels: ['Bautismo', 'Comunión', 'Confirmación'], datasets: [{ label: 'Jóvenes', data: [bautismo, comunion, confirmacion], backgroundColor: '#00A2E8' }] },
            options: { plugins: { title: { display: true, text: 'Sacramentos Recibidos' } } }
        });
    },

    // --- CENSO CON BUSCADOR ---
    renderUsuarios: function() {
        if (!LumenData.users) {
            return `<div class="state-container"><div class="skeleton-card" style="height:300px; width:100%;"></div></div>`;
        }
        
        let html = `
            <input type="text" class="search-bar" placeholder="🔍 Buscar joven por nombre, dirección o teléfono..." onkeyup="GestionView.filterCensus(this.value)">
            <div style="text-align: right; margin-bottom: 15px;"><button class="btn btn-outline" onclick="GestionView.exportExcel()">${Icons.download} Exportar a Excel</button></div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th><th>Edad</th><th>Nacimiento</th><th>Sacramentos</th><th>Juvemar</th><th>Teléfono</th><th>Email</th><th>Dirección</th><th>Representante</th><th>Tel. Rep.</th><th>Estado</th>
                        </tr>
                    </thead>
                    <tbody id="census-tbody"></tbody>
                </table>
            </div>
        `;
        
        setTimeout(() => this.renderCensusRows(Object.keys(LumenData.users)), 100);
        return html;
    },
    
    filterCensus: function(query) {
        query = query.toLowerCase();
        const filtered = Object.keys(LumenData.users).filter(uid => {
            const u = LumenData.users[uid];
            return (u.nombre && u.nombre.toLowerCase().includes(query)) || 
                   (u.direccion && u.direccion.toLowerCase().includes(query)) || 
                   (u.telefono && u.telefono.includes(query));
        });
        this.renderCensusRows(filtered);
    },
    
    renderCensusRows: function(uids) {
        const tbody = document.getElementById('census-tbody');
        if (!tbody) return;
        let rowsHTML = '';
        
        if (uids.length === 0) {
            tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;">No se encontraron jóvenes.</td></tr>`;
            return;
        }
        
        uids.forEach(uid => {
            const u = LumenData.users[uid];
            if (!u) return;
            let roleBadge = u.role === 'admin' ? '<span class="table-badge approved" style="background:#005F8A; color:white;">Admin</span>' : '<span class="table-badge adult">Usuario</span>';
            if (u.role === 'global') roleBadge = '<span class="table-badge minor">Global</span>';
            if (u.role === 'miembro') roleBadge = '<span class="table-badge approved">Juvemar</span>';

            let ageBadge = parseInt(u.edad) < 18 ? '<span class="table-badge minor">Menor</span>' : '<span class="table-badge adult">Mayor</span>';
            let sacramentos = (u.sacramentos || []).join(', ') || 'N/A';
            let juvemarInfo = u.juvemar_status || 'N/A';
            if (u.juvemar_status === 'Pertenece' && u.juvemar_tiempo) juvemarInfo = `Pertenece (${u.juvemar_tiempo})`;
            let guardian = u.representante_nombre ? `${u.representante_nombre}` : 'N/A';
            let guardianPhone = u.representante_telefono || 'N/A';
            let statusBadge = u.status === 'pending' ? '<span class="table-badge pending">Pendiente</span>' : '<span class="table-badge approved">Aprobado</span>';
            let approveBtn = u.status === 'pending' ? `<button class="btn btn-edit" onclick="GestionView.approveUser('${uid}')">Aprobar</button>` : '';
            let coordBtn = (u.status === 'approved' && u.role !== 'admin') ? `<button class="btn btn-edit" onclick="GestionView.makeAdmin('${uid}')">Coordinador</button>` : '';
            
            rowsHTML += `
                <tr>
                    <td><strong>${LumenUI.escapeHTML(u.nombre)}</strong> ${ageBadge} ${roleBadge}</td>
                    <td>${LumenUI.escapeHTML(u.edad) || 'N/A'}</td>
                    <td>${LumenUI.escapeHTML(u.nacimiento) || 'N/A'}</td>
                    <td>${LumenUI.escapeHTML(sacramentos)}</td>
                    <td>${LumenUI.escapeHTML(juvemarInfo)}</td>
                    <td>${LumenUI.escapeHTML(u.telefono) || 'N/A'}</td>
                    <td>${LumenUI.escapeHTML(u.email) || 'N/A'}</td>
                    <td>${LumenUI.escapeHTML(u.direccion) || 'N/A'}</td>
                    <td>${LumenUI.escapeHTML(guardian)}</td>
                    <td>${LumenUI.escapeHTML(guardianPhone)}</td>
                    <td>${statusBadge} ${approveBtn} ${coordBtn}</td>
                </tr>
            `;
        });
        tbody.innerHTML = rowsHTML;
    },
    
    exportExcel: function() {
        if (!LumenData.users) return LumenUI.showToast('No hay datos para exportar', 'error');
        let data = [];
        Object.values(LumenData.users).forEach(u => {
            data.push({
                "Nombre": u.nombre || 'N/A', "Edad": u.edad || 'N/A', "Nacimiento": u.nacimiento || 'N/A',
                "Sacramentos": (u.sacramentos || []).join(', ') || 'N/A',
                "Juvemar": u.juvemar_status === 'Pertenece' ? `Pertenece (${u.juvemar_tiempo || 'Fecha N/A'})` : (u.juvemar_status || 'N/A'),
                "Teléfono": u.telefono || 'N/A', "Email": u.email || 'N/A', "Dirección": u.direccion || 'N/A',
                "Representante": u.representante_nombre || 'N/A', "Teléfono Representante": u.representante_telefono || 'N/A',
                "Estado": u.status === 'approved' ? 'Aprobado' : 'Pendiente', "Rol": u.role || 'user'
            });
        });
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Censo LUMEN");
        XLSX.writeFile(wb, "Censo_LUMEN.xlsx");
    },
    
    approveUser: function(uid) {
        LumenUI.showConfirm("¿Seguro que deseas aprobar a este usuario?").then(confirmed => {
            if (confirmed) {
                supabase.from('profiles').update({ status: 'approved' }).eq('id', uid).then(() => {
                    LumenUI.showToast('Usuario aprobado con éxito', 'success');
                    LumenData.loadUsers().then(() => this.renderCensusRows(Object.keys(LumenData.users)));
                });
            }
        });
    },

    makeAdmin: function(uid) {
        LumenUI.showConfirm("¿Ascender a este usuario como Coordinador (admin)?").then(confirmed => {
            if (confirmed) {
                supabase.from('profiles').update({ role: 'admin', status: 'approved' }).eq('id', uid)
                    .then(() => {
                        LumenUI.showToast('Ahora es Coordinador', 'success');
                        LumenData.loadUsers().then(() => this.renderCensusRows(Object.keys(LumenData.users)));
                    })
                    .catch(err => LumenUI.showToast(LumenUI.getErrorMessage(err), 'error'));
            }
        });
    },

    // --- INSCRITOS POR EVENTO ---
    renderInscritos: function() {
        if (LumenData.state.eventos !== 'ideal') return `<div class="state-container">${Icons.empty_box}<h3>No hay actividades</h3></div>`;
        let eventOptions = '<option value="">Selecciona una actividad...</option>';
        LumenData.eventos.forEach(ev => { eventOptions += `<option value="${ev.id}">${LumenUI.escapeHTML(ev.titulo)}</option>`; });
        return `<div style="background:var(--blanco); padding:20px; border-radius:12px; box-shadow:var(--sombra-media); margin-bottom:20px;"><div class="form-group" style="margin:0;"><label>Selecciona actividad para ver inscritos:</label><select id="inscritos-event-select" onchange="GestionView.loadInscritosList(this.value)">${eventOptions}</select></div></div><div id="inscritos-list-container"></div>`;
    },
    profileMap: {},
    loadInscritosList: function(eventId) {
        const container = document.getElementById('inscritos-list-container');
        if (!eventId) { container.innerHTML = ''; return; }
        
        supabase.from('inscripciones').select('*').eq('evento_id', eventId).then(({ data, error }) => {
            const inscritos = data || [];
            let usersHTML = '';
            if (inscritos.length === 0) usersHTML = '<p>No hay inscritos aún.</p>';
            
            Promise.all(inscritos.map(ins => this.getProfile(ins.user_id))).then(profiles => {
                inscritos.forEach((ins, i) => {
                    const u = profiles[i] || ins;
                    usersHTML += `
                        <div class="attendance-card" style="flex-direction: column; align-items: flex-start; gap: 5px;">
                            <h4>${LumenUI.escapeHTML(u.nombre || ins.nombre || 'Sin nombre')}</h4>
                            <p style="font-size: 12px; color: var(--texto-gris);">Tel: ${LumenUI.escapeHTML(u.telefono || ins.telefono || 'N/A')}</p>
                            ${u.representante_nombre ? `<p style="font-size: 12px; color: var(--error);">Representante: ${LumenUI.escapeHTML(u.representante_nombre)} (${LumenUI.escapeHTML(u.representante_telefono)})</p>` : ''}
                        </div>
                    `;
                });
                container.innerHTML = `<h3 style="margin: 20px 0 10px;">Lista de Inscritos (${inscritos.length})</h3><div class="attendance-list">${usersHTML}</div>`;
            });
        });
    },
    getProfile: function(uid) {
        if (LumenData.users && LumenData.users[uid]) return Promise.resolve(LumenData.users[uid]);
        return supabase.from('profiles').select('*').eq('id', uid).maybeSingle().then(({ data }) => data || {});
    },

    // --- MATRIZ DE ASISTENCIA MENSUAL CON WHATSAPP ---
    getDayIndex: function(dayName) {
        if (!dayName) return -1;
        const days = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
        const cleanDay = dayName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        const prefix = cleanDay.substring(0, 3);
        for (let i = 0; i < days.length; i++) {
            if (days[i].startsWith(prefix)) return i;
        }
        return -1;
    },
    getColumnsForMonth: function() {
        let columns = [];
        LumenData.eventos.forEach(ev => {
            if (ev.tipo === 'unico' && ev.fecha_inicio) {
                const d = new Date(ev.fecha_inicio);
                if (d.getMonth() + 1 === currentMatrixMonth && d.getFullYear() === currentMatrixYear) {
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    columns.push({ id: ev.id, date: d, name: `${ev.titulo.substring(0,15)} (${day}/${month})` });
                }
            } else if (ev.tipo === 'recurrente') {
                const targetDayIndex = this.getDayIndex(ev.dia);
                if (targetDayIndex !== -1) {
                    let date = new Date(currentMatrixYear, currentMatrixMonth - 1, 1);
                    let firstDayIndex = date.getDay();
                    let offset = (targetDayIndex - firstDayIndex + 7) % 7;
                    date.setDate(1 + offset);
                    while (date.getMonth() === currentMatrixMonth - 1) {
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const colId = `${ev.id}_${date.getTime()}`; 
                        columns.push({ id: colId, date: new Date(date), name: `${ev.titulo.substring(0,10)} (${day}/${month})` });
                        date.setDate(date.getDate() + 7);
                    }
                }
            }
        });
        columns.sort((a, b) => a.date - b.date);
        return columns;
    },
    renderMatrix: function() {
        const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const currentYear = new Date().getFullYear();
        let years = [currentYear - 1, currentYear, currentYear + 1];
        let monthOptions = months.map((m, i) => `<option value="${i+1}" ${i+1 === currentMatrixMonth ? 'selected' : ''}>${m}</option>`).join('');
        let yearOptions = years.map(y => `<option value="${y}" ${y === currentMatrixYear ? 'selected' : ''}>${y}</option>`).join('');
        return `
            <div class="matrix-controls">
                <div class="form-group" style="margin:0; flex:1; min-width: 150px;">
                    <label>Mes:</label>
                    <select onchange="GestionView.changeMatrixDate(this.value, 'month')">${monthOptions}</select>
                </div>
                <div class="form-group" style="margin:0; flex:1; min-width: 100px;">
                    <label>Año:</label>
                    <select onchange="GestionView.changeMatrixDate(this.value, 'year')">${yearOptions}</select>
                </div>
                <div style="margin-left: auto; display:flex; gap:10px; flex-wrap:wrap;">
                    <button class="btn btn-success" style="background:#25D366; color:white; border:none;" onclick="GestionView.messageAbsentees()">💬 Msj Ausentes</button>
                    <button class="btn btn-outline" onclick="GestionView.exportMatrixExcel()">${Icons.download} Exportar a Excel</button>
                </div>
            </div>
            <div id="matrix-table-container" class="table-container" style="max-height: 600px; overflow: auto;">
                <div class="state-container"><div class="skeleton-card" style="height:300px; width:100%;"></div></div>
            </div>
        `;
    },
    
    messageAbsentees: function() {
        if (!LumenData.users || !LumenData.eventos) return LumenUI.showToast('No hay datos cargados', 'error');
        
        const activeUsers = Object.keys(LumenData.users).filter(uid => LumenData.users[uid].status === 'approved' || LumenData.users[uid].role === 'admin');
        const columns = this.getColumnsForMonth();
        
        if (columns.length === 0) return LumenUI.showToast('No hay actividades en este mes', 'error');
        
        const mes = `${currentMatrixYear}-${currentMatrixMonth}`;
        supabase.from('asistencia').select('*').eq('mes', mes).then(({ data, error }) => {
            const rows = data || [];
            let absentees = [];
            
            activeUsers.forEach(uid => {
                const u = LumenData.users[uid];
                if (!u) return;
                let missedAny = false;
                columns.forEach(col => {
                    const present = rows.some(r => r.user_id === uid && r.col_id === col.id);
                    if (!present) missedAny = true;
                });
                if (missedAny) absentees.push(u.nombre);
            });
            
            if (absentees.length === 0) {
                return LumenUI.showToast('¡Todos asistieron! No hay ausentes.', 'success');
            }
            
            let msg = `Hola coordinador, estos jóvenes faltaron a alguna actividad de ${["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][currentMatrixMonth-1]}:\n\n- ${absentees.join('\n- ')}\n\n¡Intentemos contactarlos!`;
            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
        });
    },
    
    changeMatrixDate: function(val, type) {
        if (type === 'month') currentMatrixMonth = parseInt(val);
        if (type === 'year') currentMatrixYear = parseInt(val);
        this.loadMatrixData();
    },
    loadMatrixData: function() {
        if (!LumenData.users) {
            LumenData.loadUsers().then(() => this.loadMatrixData());
            return;
        }

        const activeUsers = Object.keys(LumenData.users).filter(uid => LumenData.users[uid].status === 'approved' || LumenData.users[uid].role === 'admin');
        const columns = this.getColumnsForMonth();

        if (columns.length === 0) {
            document.getElementById('matrix-table-container').innerHTML = `<div class="state-container">${Icons.empty_box}<h3>Sin actividades</h3><p>No hay actividades registradas para este mes.</p></div>`;
            return;
        }

        let tableHTML = `<table class="matrix-table"><thead><tr><th>Nombre</th>`;
        columns.forEach(col => { tableHTML += `<th>${LumenUI.escapeHTML(col.name)}</th>`; });
        tableHTML += `</tr></thead><tbody>`;

        const mes = `${currentMatrixYear}-${currentMatrixMonth}`;
        supabase.from('asistencia').select('*').eq('mes', mes).then(({ data, error }) => {
            const rows = data || [];
            activeUsers.forEach(uid => {
                const u = LumenData.users[uid];
                tableHTML += `<tr><td>${LumenUI.escapeHTML(u.nombre)}</td>`;
                columns.forEach(col => {
                    const isChecked = rows.some(r => r.user_id === uid && r.col_id === col.id) ? 'checked' : '';
                    tableHTML += `<td><input type="checkbox" class="matrix-checkbox" ${isChecked} onchange="GestionView.saveMatrixCell('${uid}', '${col.id}', this.checked)"></td>`;
                });
                tableHTML += `</tr>`;
            });
            tableHTML += `</tbody></table>`;
            document.getElementById('matrix-table-container').innerHTML = tableHTML;
        });
    },
    saveMatrixCell: function(uid, colId, isChecked) {
        const mes = `${currentMatrixYear}-${currentMatrixMonth}`;
        if (isChecked) {
            supabase.from('asistencia').upsert({ user_id: uid, mes: mes, col_id: colId, presente: true }, { onConflict: 'user_id,mes,col_id' }).catch(err => LumenUI.showToast(LumenUI.getErrorMessage(err), 'error'));
        } else {
            supabase.from('asistencia').delete().eq('user_id', uid).eq('mes', mes).eq('col_id', colId).catch(err => LumenUI.showToast(LumenUI.getErrorMessage(err), 'error'));
        }
    },
    exportMatrixExcel: function() {
        if (!LumenData.users) return LumenUI.showToast('No hay datos de usuarios', 'error');
        if (!LumenData.eventos || LumenData.eventos.length === 0) return LumenUI.showToast('No hay actividades', 'error');

        const activeUsers = Object.keys(LumenData.users).filter(uid => LumenData.users[uid].status === 'approved' || LumenData.users[uid].role === 'admin');
        const columns = this.getColumnsForMonth();

        if (columns.length === 0) return LumenUI.showToast('No hay actividades en este mes para exportar', 'error');

        const mes = `${currentMatrixYear}-${currentMatrixMonth}`;
        supabase.from('asistencia').select('*').eq('mes', mes).then(({ data, error }) => {
            const rows = data || [];
            let excel = [];
            activeUsers.forEach(uid => {
                const u = LumenData.users[uid];
                let row = { "Nombre": u.nombre };
                columns.forEach(col => { row[col.name] = rows.some(r => r.user_id === uid && r.col_id === col.id) ? 'X' : ''; });
                excel.push(row);
            });

            const ws = XLSX.utils.json_to_sheet(excel);
            const wb = XLSX.utils.book_new();
            const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            XLSX.utils.book_append_sheet(wb, ws, `Asistencia ${monthNames[currentMatrixMonth-1]}`);
            XLSX.writeFile(wb, `Asistencia_LUMEN_${currentMatrixYear}_${currentMatrixMonth}.xlsx`);
            LumenUI.showToast('Asistencia exportada con éxito', 'success');
        }).catch(err => {
            console.error(err);
            LumenUI.showToast('Error al exportar asistencia', 'error');
        });
    },

    // --- COMUNICACIÓN (AVISOS MANUALES) ---
    renderComunicacion: function() {
        return `
            <div class="card">
                <div class="card-body">
                    <h3>Enviar Aviso General</h3>
                    <p style="font-size: 14px; color: var(--texto-gris); margin-bottom: 15px;">Llegará al buzón de notificaciones y como notificación en los dispositivos de quienes tengan activadas.</p>
                    <form id="manual-aviso-form">
                        <div class="form-group"><textarea id="manual-aviso-text" rows="4" required placeholder="Ej: Mañana no hay reunión por el clima. ¡Dios los bendiga!"></textarea></div>
                        <button type="submit" class="btn btn-primary btn-block">Enviar Aviso a la Comunidad</button>
                    </form>
                </div>
            </div>
        `;
    },

    // --- CUMPLEAÑOS (año completo + próximos destacados) ---
    renderCumpleanos: function() {
        return `
            <h3 style="margin: 20px 0 10px;">Cumpleaños del Año</h3>
            <p style="font-size: 13px; color: var(--texto-gris); margin-bottom: 15px;">Próximos cumpleaños (hoy y siguientes 7 días) resaltados en rojo.</p>
            <div id="cumpleanos-list" class="attendance-list">
                <div class="state-container"><div class="skeleton-card" style="height:200px; width:100%;"></div></div>
            </div>
        `;
    },
    loadCumpleanos: function() {
        const container = document.getElementById('cumpleanos-list');
        if (!container) return;
        LumenData.loadBirthdays(400).then(list => {
            if (list.length === 0) {
                container.innerHTML = '<p>No hay cumpleaños registrados.</p>';
                return;
            }
            const mesesNombres = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            const monthAbrev = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
            const orden = [...list].sort((a, b) => (a.mes - b.mes) || (a.dia - b.dia));
            let html = '';
            let lastMonth = -1;
            orden.forEach(c => {
                const proximos = c.en_dias >= 0 && c.en_dias <= 7;
                if (c.mes !== lastMonth) {
                    html += `<h4 style="margin: 20px 0 10px; color: var(--celeste-oscuro);">${mesesNombres[c.mes - 1] || ''}</h4>`;
                    lastMonth = c.mes;
                }
                html += `
                    <div class="attendance-card" style="${proximos ? 'border-left-color: #e74c3c; background: rgba(231,76,60,0.06);' : ''}">
                        <div class="mini-event-date" style="background: ${proximos ? '#ffe0e0' : 'var(--celeste-suave, #e0f2fe)'}; color: ${proximos ? '#c0392b' : 'var(--celeste-oscuro)'};">
                            <span>${c.dia}</span><small>${monthAbrev[c.mes - 1] || ''}</small>
                        </div>
                        <div class="mini-event-info">
                            <h4>${LumenUI.escapeHTML(c.nombre)}</h4>
                            <p>${c.edad ? c.edad + ' años' : 'Edad no registrada'} ${proximos ? '· <strong style="color:#e74c3c;">' + (c.en_dias === 0 ? '¡HOY ES SU CUMPLEAÑOS! 🎉' : 'en ' + c.en_dias + ' día' + (c.en_dias === 1 ? '' : 's')) + '</strong>' : ''}</p>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        });
    }
};

const originalRenderContent = GestionView.renderContent;
GestionView.renderContent = function() {
    originalRenderContent.call(this);
    if (currentGestionTab === 'estadisticas') {
        setTimeout(() => this.initCharts(), 100);
    } else if (currentGestionTab === 'asistencia') {
        this.loadMatrixData();
    } else if (currentGestionTab === 'comunicacion') {
        const form = document.getElementById('manual-aviso-form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const text = document.getElementById('manual-aviso-text').value;
                supabase.from('notificaciones').insert({
                    texto: text, for_admin: false, timestamp: Date.now(), manual: true
                }).select().single().then(({ data, error }) => {
                    if (error) throw error;
                    const avisoId = data ? data.id : null;
                    if (typeof LumenPush !== 'undefined' && LumenPush.enviarPush) {
                        LumenPush.enviarPush({ mode: 'all', title: 'LUMEN · Aviso de la comunidad', body: text, url: '/notificaciones', avisoId }).then(res => {
                            if (res && res.ok && res.result && res.result.sent > 0) {
                                LumenUI.showToast(`Aviso enviado y entregado en ${res.result.sent} dispositivo${res.result.sent === 1 ? '' : 's'}.`, 'success');
                            } else if (res && res.ok) {
                                LumenUI.showToast('Aviso guardado. (Nadie con notificaciones activas aún.)', 'success');
                            } else {
                                LumenUI.showToast('Aviso guardado, pero el push no pudo enviarse desde aquí. Se programará automáticamente.', 'error');
                            }
                        });
                    } else {
                        LumenUI.showToast('Aviso enviado a la comunidad.', 'success');
                    }
                    document.getElementById('manual-aviso-text').value = '';
                    LumenData.loadNotifications();
                }).catch(err => LumenUI.showToast(LumenUI.getErrorMessage(err), 'error'));
            });
        }
    } else if (currentGestionTab === 'cumpleanos') {
        this.loadCumpleanos();
    }
};
