const IntencionesView = {
    render: function() {
        let postCard = '';
        const verseSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="40" height="40" style="opacity:0.3; position:absolute; top:20px; left:20px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        if (LumenAuth.currentUser && LumenAuth.isMember) {
            postCard = `
                <div class="v-card reveal" style="margin-bottom: var(--v-gap);">
                    <span class="v-eyebrow" style="align-self:flex-start; margin-bottom: 10px;">${Icons.heart} Comparte</span>
                    <h3 style="font-family:'Sora',sans-serif;font-weight:700;font-size:17px;margin:0 0 6px;color:var(--texto-oscuro);">Comparte una intención</h3>
                    <p style="font-size: 14px; color: var(--texto-gris); margin-bottom: 15px;">¿Por qué quieres que oremos hoy?</p>
                    <form id="intencion-form">
                        <div class="form-group">
                            <textarea id="intencion-text" rows="3" maxlength="500" required placeholder="Ej: Oren por la salud de mi abuela..."></textarea>
                            <small class="char-count" style="text-align:right; color:var(--texto-gris); font-size:12px;">0/500</small>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Publicar Intención</button>
                    </form>
                </div>
            `;
        } else {
            postCard = `
                <div class="v-card reveal" style="margin-bottom: var(--v-gap);">
                    <span class="v-eyebrow" style="align-self:flex-start; margin-bottom: 10px;">${Icons.heart} Comparte</span>
                    <h3 style="font-family:'Sora',sans-serif;font-weight:700;font-size:17px;margin:0 0 6px;color:var(--texto-oscuro);">Comparte una intención</h3>
                    <p style="font-size: 14px; color: var(--texto-gris); margin-bottom: 15px;">Solo los miembros de Juvemar pueden publicar intenciones.</p>
                    <button class="btn btn-primary btn-block" onclick="LumenUI.requireMember()">${LumenAuth.currentUser ? 'Solicitar Ingreso' : 'Iniciar Sesión'}</button>
                </div>
            `;
        }

        return `
            <div class="view">
                <div class="v-header reveal">
                    <span class="v-eyebrow">${Icons.heart} Comunidad</span>
                    <h2 class="v-title">Muro de <em>Intenciones</em></h2>
                    <p class="v-sub">Oremos unos por otros. Comparte por quién quieres que recemos hoy.</p>
                </div>

                <div class="v-section" style="padding-top:0;">
                    <div class="verse-card reveal" style="margin-bottom: var(--v-gap);">
                        ${verseSvg}
                        <h3 style="color: #ffffff; margin-bottom: 10px;">${LumenIcons.oraciones} Intención del Papa (Mes Actual)</h3>
                        <p style="font-size: 18px; font-style: italic; margin-bottom: 10px; color: #ffffff;">"Recemos por los jóvenes, especialmente por aquellos que estudian, para que, al escuchar la Palabra de Dios, estén dispuestos a testimoniarla en sus ambientes."</p>
                        <cite style="opacity: 0.8; color: #ffffff;">Red Mundial de Oración del Papa</cite>
                    </div>

                    ${postCard}

                    <div class="v-section-title">Intenciones de la Comunidad</div>
                    <div id="intenciones-list" class="v-grid">
                        <div class="v-skeleton"></div>
                    </div>
                </div>
            </div>
        `;
    },
    init: function() {
        this.loadIntenciones();
        this.subscribe();
        const form = document.getElementById('intencion-form');
        if (form) {
            const textarea = document.getElementById('intencion-text');
            const counter = form.querySelector('.char-count');
            if (textarea && counter) {
                textarea.addEventListener('input', () => {
                    counter.textContent = `${textarea.value.length}/500`;
                });
            }
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const text = document.getElementById('intencion-text').value;
                if (!LumenAuth.userProfile) return LumenUI.showToast("Inicia sesión", "error");
                const uid = LumenAuth.currentUser.id;
                supabase.from('intenciones').insert({
                    texto: text, author_name: LumenAuth.userProfile.nombre,
                    author_uid: uid, timestamp: Date.now()
                }).then(({ error }) => {
                    if (error) return LumenUI.showToast(LumenUI.getErrorMessage(error), 'error');
                    document.getElementById('intencion-text').value = '';
                    LumenUI.showToast('Intención compartida. La comunidad está orando por ti.', 'success');
                }).catch(err => LumenUI.showToast(LumenUI.getErrorMessage(err), 'error'));
            });
        }
    },
    loadIntenciones: function() {
        supabase.from('intenciones').select('*').order('timestamp', { ascending: false }).limit(50).then(({ data, error }) => {
            const list = document.getElementById('intenciones-list');
            if (!list) return;
            if (error) { list.innerHTML = `<div class="v-empty">${Icons.alert}<h3>Error al cargar</h3></div>`; return; }
            const intenciones = data || [];
            if (intenciones.length === 0) {
                list.innerHTML = `<div class="v-empty">${Icons.empty_box}<h3>No hay intenciones</h3><p>Sé el primero en compartir una.</p></div>`;
                return;
            }
            Promise.all(intenciones.map(i => this.loadLikes(i.id))).then(likeMaps => {
                let html = '';
                intenciones.forEach((int, idx) => {
                    const likes = likeMaps[idx] || [];
                    const date = new Date(int.timestamp).toLocaleDateString('es-VE', { day: 'numeric', month: 'short' });
                    const likesCount = likes.length;
                    const userLiked = LumenAuth.currentUser && likes.some(l => l.user_id === LumenAuth.currentUser.id);
                    html += `
                        <div class="v-card">
                            <p style="font-size:11.5px; text-transform:uppercase; letter-spacing:0.06em; font-weight:600; color:var(--texto-gris); margin:0 0 10px;">Por ${LumenUI.escapeHTML(int.author_name)} · ${date}</p>
                            <p style="color: var(--texto-oscuro); font-weight: 500; margin: 0 0 14px; line-height:1.65; flex:1;">${LumenUI.escapeHTML(int.texto)}</p>
                            <button class="btn ${userLiked ? 'btn-primary' : 'btn-outline'}" style="justify-content:center;" onclick="IntencionesView.toggleLike('${int.id}')">
                                ${Icons.heart} ${likesCount} Rezo por ti
                            </button>
                        </div>
                    `;
                });
                list.innerHTML = html;
                LumenRouter.initScrollReveal();
            });
        });
    },
    loadLikes: function(intencionId) {
        return supabase.from('intencion_likes').select('user_id').eq('intencion_id', intencionId).then(({ data, error }) => data || []);
    },
    subscribe: function() {
        if (this.channel) return;
        this.channel = supabase
            .channel('lumen-intenciones')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'intenciones' }, () => this.loadIntenciones())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'intencion_likes' }, () => this.loadIntenciones())
            .subscribe();
    },
    destroy: function() {
        if (this.channel) { try { this.channel.unsubscribe(); } catch (e) {} this.channel = null; }
    },
    toggleLike: function(intencionId) {
        if (!LumenUI.requireMember()) return;
        const uid = LumenAuth.currentUser.id;
        supabase.from('intencion_likes').select('user_id').eq('intencion_id', intencionId).eq('user_id', uid).maybeSingle().then(({ data, error }) => {
            if (data) {
                supabase.from('intencion_likes').delete().eq('intencion_id', intencionId).eq('user_id', uid).then(() => this.loadIntenciones());
            } else {
                supabase.from('intencion_likes').insert({ intencion_id: intencionId, user_id: uid }).then(({ error: e }) => {
                    if (e) return LumenUI.showToast(LumenUI.getErrorMessage(e), 'error');
                    this.loadIntenciones();
                });
            }
        }).catch(err => LumenUI.showToast(LumenUI.getErrorMessage(err), 'error'));
    }
};
