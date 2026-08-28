const IntencionesView = {
    render: function() {
        let postCard = '';
        if (LumenAuth.currentUser && LumenAuth.isMember) {
            postCard = `
                <div class="card reveal" style="margin-bottom: 30px;">
                    <div class="card-body">
                        <h3>Comparte una intención</h3>
                        <p style="font-size: 14px; color: var(--texto-gris); margin-bottom: 15px;">¿Por qué quieres que oremos hoy?</p>
                        <form id="intencion-form">
                            <div class="form-group">
                                <textarea id="intencion-text" rows="3" maxlength="500" required placeholder="Ej: Oren por la salud de mi abuela..."></textarea>
                                <small class="char-count" style="text-align:right; color:var(--texto-gris); font-size:12px;">0/500</small>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block">Publicar Intención</button>
                        </form>
                    </div>
                </div>
            `;
        } else {
            postCard = `
                <div class="card reveal" style="margin-bottom: 30px;">
                    <div class="card-body">
                        <h3>Comparte una intención</h3>
                        <p style="font-size: 14px; color: var(--texto-gris); margin-bottom: 15px;">Solo los miembros de Juvemar pueden publicar intenciones.</p>
                        <button class="btn btn-primary btn-block" onclick="LumenUI.requireMember()">${LumenAuth.currentUser ? 'Solicitar Ingreso' : 'Iniciar Sesión'}</button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="view">
                <h2 class="reveal" style="color: var(--celeste-oscuro); margin-bottom:20px;">Muro de Intenciones</h2>
                
                <div class="verse-card reveal" style="margin-bottom: 30px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="40" height="40" style="opacity:0.3; position:absolute; top:20px; left:20px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <h3 style="color: #ffffff; margin-bottom: 10px;">🙏 Intención del Papa (Mes Actual)</h3>
                    <p style="font-size: 18px; font-style: italic; margin-bottom: 10px; color: #ffffff;">"Recemos por los jóvenes, especialmente por aquellos que estudian, para que, al escuchar la Palabra de Dios, estén dispuestos a testimoniarla en sus ambientes."</p>
                    <cite style="opacity: 0.8; color: #ffffff;">Red Mundial de Oración del Papa</cite>
                </div>

                ${postCard}

                <h3 class="reveal" style="margin-bottom: 15px;">Intenciones de la Comunidad</h3>
                <div id="intenciones-list" class="cards-grid">
                    <div class="state-container"><div class="skeleton-card" style="height:150px; width:100%;"></div></div>
                </div>
            </div>
        `;
    },
    init: function() {
        db.ref('intenciones').limitToLast(50).on('value', (snapshot) => {
            const data = snapshot.val() || {};
            const list = document.getElementById('intenciones-list');
            if (!list) return;

            const intenciones = Object.keys(data).map(k => ({ id: k, ...data[k] })).reverse();
            
            if (intenciones.length === 0) {
                list.innerHTML = `<div class="state-container">${Icons.empty_box}<h3>No hay intenciones</h3><p>Sé el primero en compartir una.</p></div>`;
                return;
            }

            let html = '';
            intenciones.forEach(int => {
                const date = new Date(int.timestamp).toLocaleDateString('es-VE', { day: 'numeric', month: 'short' });
                const likesCount = int.likes ? Object.keys(int.likes).length : 0;
                const userLiked = int.likes && LumenAuth.currentUser && int.likes[LumenAuth.currentUser.uid];
                
                html += `
                    <div class="card reveal">
                        <div class="card-body">
                            <p style="color: var(--texto-oscuro); font-weight: 500; margin-bottom: 10px;">${int.text}</p>
                            <small style="color: var(--texto-gris);">Por ${int.authorName} - ${date}</small>
                        </div>
                        <div class="card-footer" style="justify-content: center;">
                            <button class="btn ${userLiked ? 'btn-primary' : 'btn-outline'}" style="padding: 8px 15px; font-size: 13px;" onclick="IntencionesView.toggleLike('${int.id}')">
                                ${Icons.heart} ${likesCount} Rezo por ti
                            </button>
                        </div>
                    </div>
                `;
            });
            list.innerHTML = html;
            LumenRouter.initScrollReveal();
        });

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
                
                db.ref('intenciones').push({
                    text: text, authorName: LumenAuth.userProfile.nombre,
                    authorUid: LumenAuth.currentUser.uid, timestamp: Date.now(), likes: {}
                }).then(() => {
                    document.getElementById('intencion-text').value = '';
                    LumenUI.showToast('Intención compartida. La comunidad está orando por ti.', 'success');
                }).catch(err => LumenUI.showToast(LumenUI.getErrorMessage(err), 'error'));
            });
        }
    },
    toggleLike: function(intencionId) {
        if (!LumenUI.requireMember()) return;
        const uid = LumenAuth.currentUser.uid;
        const ref = db.ref(`intenciones/${intencionId}/likes/${uid}`);
        ref.once('value').then(snap => {
            if (snap.exists()) ref.remove();
            else ref.set(true);
        }).catch(err => LumenUI.showToast(LumenUI.getErrorMessage(err), 'error'));
    }
};