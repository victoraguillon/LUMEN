const BlogView = {
    render: function() {
        let writeButton = LumenAuth.currentUser ? `<button class="btn btn-add" onclick="BlogView.showWriteForm()">${Icons.edit} Escribir Artículo</button>` : '';
        
        return `
            <div class="view">
                <h2 class="reveal" style="color: var(--celeste-oscuro); margin-bottom:20px;">Blog Católico</h2>
                <div class="reveal">${writeButton}</div>
                <div id="blog-list" class="cards-grid" style="margin-top: 20px;">
                    <div class="state-container"><div class="skeleton-card" style="height:300px; width:100%;"></div></div>
                </div>
            </div>
        `;
    },
    init: function() {
        this.loadArticles();
    },
    loadArticles: function() {
        let q = supabase.from('articulos').select('*').order('timestamp', { ascending: false }).limit(20);
        if (!LumenAuth.isAdmin) q = q.eq('status', 'approved');
        q.then(({ data, error }) => {
            const list = document.getElementById('blog-list');
            if (!list) return;
            if (error) { list.innerHTML = `<div class="state-container">${Icons.alert}<h3>Error al cargar</h3></div>`; return; }
            const articles = data || [];
            const approvedArticles = articles.filter(a => LumenAuth.isAdmin ? a.status !== 'pending' || true : a.status === 'approved');
            
            if (LumenAuth.isAdmin) {
                const pending = articles.filter(a => a.status === 'pending');
                if (pending.length > 0) {
                    list.innerHTML = `<div class="admin-request-box" style="grid-column: 1/-1; margin-bottom: 20px;">
                        ${Icons.alert}
                        <div>
                            <h4 style="margin-bottom: 5px; color: #f59e0b;">Tienes ${pending.length} artículo(s) pendiente(s) de aprobación.</h4>
                            <p style="font-size:13px; margin:0;">Ve al Panel de Gestión para revisarlos.</p>
                        </div>
                    </div>` + this.renderArticles(approvedArticles);
                    return;
                }
            }

            if (approvedArticles.length === 0) {
                list.innerHTML = `<div class="state-container">${Icons.empty_box}<h3>No hay artículos</h3><p>Pronto compartiremos contenido inspirador.</p></div>`;
            } else {
                list.innerHTML = this.renderArticles(approvedArticles);
            }
            LumenRouter.initScrollReveal();
        });
    },
    renderArticles: function(articles) {
        let html = '';
        articles.forEach(a => {
            const date = new Date(a.timestamp).toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' });
            html += `
                <div class="card reveal" style="cursor: pointer;" onclick="BlogView.viewArticle('${a.id}')">
                    ${a.image_url ? `<img src="${LumenUI.escapeHTML(a.image_url)}" alt="${LumenUI.escapeHTML(a.titulo)}" loading="lazy" width="400" height="200" style="width:100%; height: 200px; object-fit: cover;">` : ''}
                    <div class="card-header">${Icons.book}<h3>${LumenUI.escapeHTML(a.titulo)}</h3></div>
                    <div class="card-body">
                        <p style="font-size: 14px; color: var(--texto-gris); margin-bottom: 10px;">Por ${LumenUI.escapeHTML(a.author_name)} | ${date}</p>
                        <p>${LumenUI.escapeHTML((a.contenido || '').substring(0, 120))}...</p>
                        <button class="btn btn-outline btn-block" style="margin-top: 15px;">Leer más</button>
                    </div>
                </div>
            `;
        });
        return html;
    },
    viewArticle: function(id) {
        supabase.from('articulos').select('*').eq('id', id).single().then(({ data, error }) => {
            const a = data;
            if (!a) return;
            const date = new Date(a.timestamp).toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' });
            const contentHTML = `
                <div style="text-align: left;">
                    ${a.image_url ? `<img src="${LumenUI.escapeHTML(a.image_url)}" alt="${LumenUI.escapeHTML(a.titulo)}" style="width:100%; height: 250px; object-fit: cover; border-radius: 12px; margin-bottom: 20px;">` : ''}
                    <h2 style="color: var(--celeste-oscuro); margin-bottom: 10px;">${LumenUI.escapeHTML(a.titulo)}</h2>
                    <p style="font-size: 14px; color: var(--texto-gris); margin-bottom: 20px;">Por <strong>${LumenUI.escapeHTML(a.author_name)}</strong> | ${date}</p>
                    <div style="white-space: pre-wrap; line-height: 1.8; color: var(--texto-oscuro); font-size: 16px;">${LumenUI.escapeHTML(a.contenido)}</div>
                </div>
            `;
            LumenUI.openAdminModal('Artículo', contentHTML);
        });
    },
    showWriteForm: function() {
        if (!LumenAuth.currentUser) return LumenUI.showToast("Debes iniciar sesión", "error");
        const formHTML = `
            <form onsubmit="BlogView.saveArticle(event)">
                <div class="form-group"><label>Título del Artículo:</label><input type="text" id="blog-title" required></div>
                <div class="form-group"><label>URL de la Imagen (Opcional):</label><input type="url" id="blog-image" placeholder="https://..." ></div>
                <div class="form-group"><label>Contenido:</label><textarea id="blog-content" rows="8" required placeholder="Escribe tu reflexión aquí..."></textarea></div>
                <button type="submit" class="btn btn-primary btn-block">Enviar para Revisión</button>
            </form>
        `;
        LumenUI.openAdminModal('Escribir Artículo', formHTML);
    },
    saveArticle: function(e) {
        e.preventDefault();
        const title = document.getElementById('blog-title').value;
        const imageUrl = LumenUI.sanitizeImageUrl(document.getElementById('blog-image').value);
        const content = document.getElementById('blog-content').value;
        const authorName = LumenAuth.userProfile?.nombre || 'Usuario';
        const authorEmail = LumenAuth.currentUser?.email || '';

        supabase.from('articulos').insert({
            titulo: title, image_url: imageUrl, contenido: content,
            author_name: authorName,
            author_email: authorEmail,
            author_uid: LumenAuth.currentUser.id,
            timestamp: Date.now(),
            status: 'pending'
        }).then(({ error }) => {
            if (error) { console.error(error); LumenUI.showToast('Error al enviar el artículo. Inténtalo de nuevo.', 'error'); return; }
            LumenUI.closeModal('admin-modal');
            LumenUI.showToast('Artículo enviado a revisión. Te notificaremos su aprobación, ¡gracias!', 'success');
            LumenData.saveNotification(`Nuevo artículo de blog pendiente: ${title}`, false);
            fetch('https://formsubmit.co/ajax/juvemar08@gmail.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ _subject: `Nuevo artículo de blog en revisión: ${title}`, autor: authorName, email: authorEmail, titulo: title, mensaje: content })
            }).catch(() => {});
        }).catch(err => {
            console.error(err);
            LumenUI.showToast('Error al enviar el artículo. Inténtalo de nuevo.', 'error');
        });
    }
};
