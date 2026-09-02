const IntencionesView = {
    _handsIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 11l1.5-2a2.5 2.5 0 0 1 4.28 2.58c-1.05 1.43-2.46 3.28-2.46 3.28"></path><path d="M7 11l-1.5-2a2.5 2.5 0 0 0-4.28 2.58C2.27 13 3.68 14.86 3.68 14.86"></path><path d="M12.6 17.2a2 2 0 0 0-1.2 0"></path><path d="M12 21s-6-5-7-8.5C4.6 9.5 6 9 7 10.5c.5.7.8 1.5 1 2"></path><path d="M12 21s6-5 7-8.5c-.6-2.5-2-3-3-1.5-.5.7-.8 1.5-1 2"></path></svg>',

    render: function() {
        let postCard = '';
        if (LumenAuth.currentUser && LumenAuth.isMember) {
            postCard = `
                <div class="v-card reveal" style="margin-bottom: var(--ds-5);">
                    <div class="v-card__top">
                        <h3 class="v-card__title">${this._handsIcon} Comparte una intención</h3>
                    </div>
                    <p class="v-card__sub" style="margin:0;">¿Por qué quieres que oremos hoy?</p>
                    <form id="intencion-form">
                        <div class="form-group" style="margin-bottom:0;">
                            <textarea id="intencion-text" rows="3" maxlength="500" required placeholder="Ej: Oren por la salud de mi abuela..."></textarea>
                            <small class="char-count">0/500</small>
                        </div>
                        <div style="margin-top:14px;">
                            <button type="submit" class="btn btn-primary btn-block">Publicar Intención</button>
                        </div>
                    </form>
                </div>
            `;
        } else {
            postCard = `
                <div class="v-card v-card--tint reveal" style="margin-bottom: var(--ds-5);">
                    <div class="v-card__top">
                        <h3 class="v-card__title">${this._handsIcon} Comparte una intención</h3>
                    </div>
                    <p class="v-card__sub" style="margin:0;">Solo los miembros de Juvemar pueden publicar intenciones.</p>
                    <div style="margin-top:4px;">
                        <button class="btn btn-primary btn-block" onclick="LumenUI.requireMember()">${LumenAuth.currentUser ? 'Solicitar Ingreso' : 'Iniciar Sesión'}</button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="view">
                <header class="v-header reveal">
                    <h1 class="v-title">Muro de Intenciones</h1>
                    <p class="v-sub">Une tu intención a la oración de la comunidad. “Oren unos por otros.”</p>
                </header>

                <div class="verse-card reveal" style="margin-bottom: var(--ds-5);">
                    ${this._handsIcon.replace('<svg', '<svg style="width:40px; height:40px; opacity:0.3; position:absolute; top:20px; left:20px;"')}
                    <h3 style="color:#ffffff; margin-bottom:10px; font-size:1.05rem; font-family:'Sora', sans-serif;">Intención del Papa (Mes Actual)</h3>
                    <p style="font-size:18px; font-style:italic; margin-bottom:10px; color:#ffffff; line-height:1.55;">“Recemos por los jóvenes, especialmente por aquellos que estudian, para que, al escuchar la Palabra de Dios, estén dispuestos a testimoniarla en sus ambientes.”</p>
                    <cite style="opacity:0.8; color:#ffffff;">Red Mundial de Oración del Papa</cite>
                </div>

                ${postCard}

                <section class="v-sec--tight">
                    <h2 class="v-sec__title" style="margin-bottom: var(--ds-4);">Intenciones de la Comunidad</h2>
                    <div id="intenciones-list" class="v-grid v-grid--cards">
                        <div class="v-skeleton v-skeleton--row" style="grid-column: 1 / -1;"></div>
                    </div>
                </section>
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
            if (error) {
                list.innerHTML = `<div class="v-empty" style="grid-column: 1 / -1;">${Icons.alert}<h3>Error al cargar</h3></div>`;
                return;
            }
            const intenciones = data || [];
            if (intenciones.length === 0) {
                list.innerHTML = `<div class="v-empty" style="grid-column: 1 / -1;">${Icons.empty_box}<h3>No hay intenciones</h3><p>Sé el primero en compartir una.</p></div>`;
                return;
            }
            Promise.all(intenciones.map(i => this.loadLikes(i.id))).then(likeMaps => {
                let html = '';
                intenciones.forEach((int, idx) => {
                    const likes = likeMaps[idx] || [];
                    const date = new Date(int.timestamp).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' });
                    const likesCount = likes.length;
                    const userLiked = LumenAuth.currentUser && likes.some(l => l.user_id === LumenAuth.currentUser.id);
                    html += `
                        <article class="intencion-card reveal">
                            <p class="intencion-texto">${LumenUI.escapeHTML(int.texto)}</p>
                            <div class="intencion-meta">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 21v-1a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v1"></path></svg>
                                <span>Ora por <strong>${LumenUI.escapeHTML(int.author_name)}</strong> · ${date}</span>
                            </div>
                            <div class="intencion-actions">
                                <button class="btn-pray-hard ${userLiked ? 'active' : ''}" onclick="IntencionesView.toggleLike('${int.id}')">
                                    ${Icons.heart} ${likesCount > 0 ? likesCount + ' ' : ''}Rezo por ti
                                </button>
                            </div>
                        </article>
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