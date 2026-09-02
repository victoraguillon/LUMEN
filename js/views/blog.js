const BlogView = {
    searchTerm: '',
    _articles: [],
    _pending: [],

    render: function() {
        let writeBtn;
        if (LumenAuth.currentUser) {
            writeBtn = `<button class="btn btn-add" onclick="BlogView.showWriteForm()">${Icons.edit} Escribir Artículo</button>`;
        } else {
            writeBtn = `<button class="btn btn-outline" onclick="LumenUI.openModal('login-modal')">${Icons.edit} Quiero escribir</button>`;
        }

        return `
            <div class="view">
                <header class="blog-header reveal">
                    <div class="blog-header-copy">
                        <span class="about-eyebrow">${Icons.book} Blog católico</span>
                        <h1 class="blog-title">Reflexiones que <em>anuncian</em></h1>
                        <p class="blog-sub">Fe, testimonio y vida de comunidad, contadas por nuestros hermanos.</p>
                    </div>
                    <div class="blog-header-actions">${writeBtn}</div>
                </header>

                <div class="blog-toolbar reveal">
                    <label class="blog-search">
                        ${LumenIcons.search}
                        <input type="search" id="blog-search" placeholder="Buscar por título, autor o tema…" aria-label="Buscar artículos" value="${LumenUI.escapeHTML(this.searchTerm)}" oninput="BlogView.onSearch(this.value)">
                    </label>
                </div>

                <div id="blog-list">
                    <div class="state-container"><div class="skeleton-card blog-skeleton"></div></div>
                </div>
            </div>
        `;
    },

    init: function() {
        this.loadArticles();
    },

    destroy: function() {
        this.searchTerm = '';
        this._articles = [];
        this._pending = [];
    },

    onSearch: function(value) {
        this.searchTerm = value || '';
        const list = document.getElementById('blog-list');
        if (list) this.renderList(list);
    },

    loadArticles: function() {
        let q = supabase.from('articulos').select('*').order('timestamp', { ascending: false }).limit(50);
        if (!LumenAuth.isAdmin) q = q.eq('status', 'approved');
        q.then(({ data, error }) => {
            const list = document.getElementById('blog-list');
            if (!list) return;
            if (error) { list.innerHTML = `<div class="state-container">${Icons.alert}<h3>Error al cargar los artículos</h3></div>`; return; }
            const articles = data || [];
            const approvedArticles = articles.filter(a => LumenAuth.isAdmin ? (a.status !== 'pending') : a.status === 'approved');
            this._articles = approvedArticles;
            this._pending = LumenAuth.isAdmin ? articles.filter(a => a.status === 'pending') : [];
            this.renderList(list);
        });
    },

    renderList: function(list) {
        const pending = this._pending || [];
        const pendingBox = pending.length > 0
            ? `<div class="admin-request-box" style="grid-column: 1 / -1; margin-bottom: 20px;">
                ${Icons.alert}
                <div>
                    <h4 style="margin-bottom: 5px; color: #f59e0b;">Tienes ${pending.length} artículo(s) pendiente(s) de aprobación.</h4>
                    <p style="font-size:13px; margin:0;">Ve al Panel de Gestión para revisarlos.</p>
                </div>
            </div>`
            : '';

        let articles = this._articles || [];
        const term = (this.searchTerm || '').trim().toLowerCase();
        if (term) {
            articles = articles.filter(a => {
                const hay = `${a.titulo || ''} ${a.author_name || ''} ${a.contenido || ''}`.toLowerCase();
                return hay.includes(term);
            });
        }

        if (articles.length === 0) {
            const empty = term
                ? `${Icons.empty_box}<h3>Sin resultados</h3><p>No encontramos nada para “${LumenUI.escapeHTML(term)}”. Prueba con otra búsqueda.</p>`
                : `${Icons.empty_box}<h3>No hay artículos todavía</h3><p>Pronto compartiremos contenido inspirador. Si tienes una reflexión, anímate a escribir.</p>`;
            list.innerHTML = pendingBox + `<div class="state-container">${empty}</div>`;
        } else {
            list.innerHTML = pendingBox + `<div class="blog-grid">${this.renderArticles(articles)}</div>`;
        }
        LumenRouter.initScrollReveal();
    },

    renderArticles: function(articles) {
        let html = '';
        articles.forEach((a, idx) => {
            const date = new Date(a.timestamp).toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' });
            const featured = idx === 0;
            const excerpt = (a.contenido || '').substring(0, featured ? 220 : 110);
            const media = a.image_url
                ? `<img src="${LumenUI.escapeHTML(a.image_url)}" alt="${LumenUI.escapeHTML(a.titulo)}" loading="lazy">`
                : `<div class="blog-noimg">${Icons.book}<span>${LumenUI.escapeHTML(a.titulo.split(' ').slice(0, 3).join(' '))}</span></div>`;
            html += `
                <article class="${featured ? 'blog-featured-card' : 'blog-card'} reveal" style="cursor:pointer;" onclick="BlogView.viewArticle('${a.id}')">
                    <div class="blog-media">${media}</div>
                    <div class="blog-card-body">
                        <span class="blog-meta">${Icons.user} ${LumenUI.escapeHTML(a.author_name)} · ${date}</span>
                        <h3>${LumenUI.escapeHTML(a.titulo)}</h3>
                        <p>${LumenUI.escapeHTML(excerpt)}…</p>
                        <span class="blog-readmore">Leer artículo ${LumenIcons.chevron_right}</span>
                    </div>
                </article>
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
                <article class="article-modal">
                    ${a.image_url ? `<img class="article-modal-hero" src="${LumenUI.escapeHTML(a.image_url)}" alt="${LumenUI.escapeHTML(a.titulo)}">` : ''}
                    <span class="blog-meta">${Icons.user} ${LumenUI.escapeHTML(a.author_name)} · ${date}</span>
                    <h2>${LumenUI.escapeHTML(a.titulo)}</h2>
                    <div class="article-modal-text">${LumenUI.escapeHTML(a.contenido)}</div>
                </article>
            `;
            LumenUI.openAdminModal('Artículo', contentHTML);
        });
    },

    showWriteForm: function() {
        if (!LumenAuth.currentUser) {
            LumenUI.showToast('Debes iniciar sesión para escribir', 'error');
            LumenUI.openModal('login-modal');
            return;
        }
        const formHTML = `
            <form onsubmit="BlogView.saveArticle(event)">
                <div class="form-group"><label>Título del Artículo:</label><input type="text" id="blog-title" required></div>
                <div class="form-group"><label>URL de la Imagen (Opcional):</label><input type="url" id="blog-image" placeholder="https://…"></div>
                <div class="form-group"><label>Contenido:</label><textarea id="blog-content" rows="8" required placeholder="Escribe tu reflexión aquí…"></textarea></div>
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