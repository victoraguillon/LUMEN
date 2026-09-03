const EncuestasView = {
    render: function() {
        if (!LumenAuth.currentUser) return `<div class="state-container"><h3>Acceso para miembros</h3><p>Inicia sesión para responder encuestas.</p><button class="btn btn-primary" style="margin-top: 15px;" onclick="LumenUI.requireMember()">Iniciar Sesión</button></div>`;
        if (!LumenAuth.isMember) return `<div class="state-container"><h3>Solo miembros</h3><p>Las encuestas están disponibles para miembros de Juvemar.</p><button class="btn btn-primary" style="margin-top: 15px;" onclick="LumenUI.requireMember()">Solicitar Ingreso</button></div>`;
        
        let adminButton = LumenAuth.isAdmin ? `<button class="btn btn-add" onclick="EncuestasView.showAddForm()">${Icons.plus} Crear Encuesta</button>` : '';
        
        return `
            <div class="view">
                <div class="v-header reveal">
                    <span class="v-eyebrow">${Icons.message} Comunidad</span>
                    <h2 class="v-title">Encuestas <em>Rápidas</em></h2>
                    <p class="v-sub">Comparte tu opinión y descubre qué prefiere la comunidad de Juvemar.</p>
                </div>
                <div class="v-section" style="padding-top:0;">
                    ${adminButton}
                    <div id="encuestas-list" class="v-grid">
                        <div class="v-skeleton"></div>
                        <div class="v-skeleton"></div>
                    </div>
                </div>
            </div>
        `;
    },
    init: function() {
        this.loadEncuestas();
        this.subscribe();
    },
    destroy: function() {
        if (this.channel) { try { this.channel.unsubscribe(); } catch (e) {} this.channel = null; }
    },
    loadEncuestas: function() {
        supabase.from('encuestas').select('*').order('timestamp', { ascending: false }).limit(10).then(({ data, error }) => {
            const list = document.getElementById('encuestas-list');
            if (!list) return;
            if (error) { list.innerHTML = `<div class="v-empty">${Icons.alert}<h3>Error al cargar</h3><p>No pudimos cargar las encuestas. Intenta de nuevo.</p></div>`; return; }
            const encuestas = data || [];
            if (encuestas.length === 0) {
                list.innerHTML = `<div class="v-empty">${Icons.empty_box}<h3>No hay encuestas</h3><p>Crea una encuesta para que la comunidad decida.</p></div>`;
                return;
            }
            Promise.all(encuestas.map(e => this.loadVotes(e.id))).then(votesMaps => {
                let html = '';
                encuestas.forEach((enc, idx) => {
                    const votes = votesMaps[idx] || [];
                    const totalVotes = votes.length;
                    const myVote = LumenAuth.currentUser ? votes.find(v => v.user_id === LumenAuth.currentUser.id) : null;
                    const userVote = myVote ? myVote.option_index : null;
                    const isAdmin = LumenAuth.isAdmin;
                    
                    let optionsHTML = '';
                    (enc.options || []).forEach((opt, index) => {
                        const votesForOpt = votes.filter(v => v.option_index === index).length;
                        const percentage = totalVotes > 0 ? (votesForOpt / totalVotes * 100).toFixed(0) : 0;
                        
                        if (userVote !== null || isAdmin) {
                            optionsHTML += `
                                <div class="poll-result-item">
                                    <div class="poll-result-header">
                                        <span>${LumenUI.escapeHTML(opt)} ${userVote === index ? '✓' : ''}</span>
                                        <span>${percentage}% (${votesForOpt})</span>
                                    </div>
                                    <div class="poll-results-bar">
                                        <div class="poll-results-fill" style="width: ${percentage}%"></div>
                                    </div>
                                </div>
                            `;
                        } else {
                            optionsHTML += `
                                <div class="poll-option" onclick="EncuestasView.vote('${enc.id}', ${index})">
                                    <input type="radio" name="poll-${enc.id}" value="${index}">
                                    <label>${LumenUI.escapeHTML(opt)}</label>
                                </div>
                            `;
                        }
                    });

                    html += `
                        <div class="v-card">
                            <div class="v-card-meta">${Icons.bell} Encuesta</div>
                            <h3>${LumenUI.escapeHTML(enc.question)}</h3>
                            <div style="margin:12px 0;">
                                ${optionsHTML}
                            </div>
                            <p style="font-size:12px; color:var(--texto-gris); margin:10px 0 0;">Total de votos: ${totalVotes}</p>
                        </div>
                    `;
                });
                list.innerHTML = html;
            });
        });
    },
    loadVotes: function(encuestaId) {
        return supabase.from('encuesta_votos').select('user_id, option_index').eq('encuesta_id', encuestaId).then(({ data, error }) => data || []);
    },
    subscribe: function() {
        if (this.channel) return;
        this.channel = supabase
            .channel('lumen-encuestas')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'encuestas' }, () => this.loadEncuestas())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'encuesta_votos' }, () => this.loadEncuestas())
            .subscribe();
    },
    showAddForm: function() {
        const formHTML = `
            <form onsubmit="EncuestasView.savePoll(event)">
                <div class="form-group"><label>Pregunta:</label><input type="text" id="poll-question" required placeholder="Ej: ¿Qué comida pedimos?"></div>
                <div class="form-group"><label>Opción 1:</label><input type="text" id="poll-opt-1" required></div>
                <div class="form-group"><label>Opción 2:</label><input type="text" id="poll-opt-2" required></div>
                <div class="form-group"><label>Opción 3 (Opcional):</label><input type="text" id="poll-opt-3"></div>
                <button type="submit" class="btn btn-primary btn-block">Crear Encuesta</button>
            </form>
        `;
        LumenUI.openAdminModal('Crear Encuesta', formHTML);
    },
    savePoll: function(e) {
        e.preventDefault();
        const question = document.getElementById('poll-question').value;
        const options = [
            document.getElementById('poll-opt-1').value,
            document.getElementById('poll-opt-2').value
        ].filter(o => o.trim() !== '');
        
        if (document.getElementById('poll-opt-3').value) options.push(document.getElementById('poll-opt-3').value);

        supabase.from('encuestas').insert({ question, options, timestamp: Date.now() })
            .then(() => { LumenUI.closeModal('admin-modal'); LumenUI.showToast('Encuesta creada', 'success'); })
            .catch(err => LumenUI.showToast(LumenUI.getErrorMessage(err), 'error'));
    },
    vote: function(pollId, optionIndex) {
        if (!LumenAuth.currentUser) return;
        const uid = LumenAuth.currentUser.id;
        supabase.from('encuesta_votos').upsert({ encuesta_id: pollId, user_id: uid, option_index: optionIndex }, { onConflict: 'encuesta_id,user_id' })
            .then(() => LumenUI.showToast('Voto registrado', 'success'))
            .catch(err => LumenUI.showToast(LumenUI.getErrorMessage(err), 'error'));
    }
};
