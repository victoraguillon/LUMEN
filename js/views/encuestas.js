const EncuestasView = {
    render: function() {
        if (!LumenAuth.currentUser) return `<div class="state-container"><h3>Acceso para miembros</h3><p>Inicia sesión para responder encuestas.</p><button class="btn btn-primary" style="margin-top: 15px;" onclick="LumenUI.requireMember()">Iniciar Sesión</button></div>`;
        if (!LumenAuth.isMember) return `<div class="state-container"><h3>Solo miembros</h3><p>Las encuestas están disponibles para miembros de Juvemar.</p><button class="btn btn-primary" style="margin-top: 15px;" onclick="LumenUI.requireMember()">Solicitar Ingreso</button></div>`;
        
        let adminButton = LumenAuth.isAdmin ? `<button class="btn btn-add" onclick="EncuestasView.showAddForm()">${Icons.plus} Crear Encuesta</button>` : '';
        
        return `
            <div class="view">
                <h2 style="color: var(--celeste-oscuro); margin-bottom:20px;">Encuestas Rápidas</h2>
                ${adminButton}
                <div id="encuestas-list" class="cards-grid">
                    <div class="state-container"><div class="skeleton-card" style="height:200px; width:100%;"></div></div>
                </div>
            </div>
        `;
    },
    init: function() {
        db.ref('encuestas').limitToLast(10).on('value', (snapshot) => {
            const data = snapshot.val() || {};
            const list = document.getElementById('encuestas-list');
            if (!list) return;

            const encuestas = Object.keys(data).map(k => ({ id: k, ...data[k] })).reverse();
            
            if (encuestas.length === 0) {
                list.innerHTML = `<div class="state-container">${Icons.empty_box}<h3>No hay encuestas</h3><p>Crea una encuesta para que la comunidad decida.</p></div>`;
                return;
            }

            let html = '';
            encuestas.forEach(enc => {
                const totalVotes = enc.votes ? Object.keys(enc.votes).length : 0;
                const userVote = enc.votes && LumenAuth.currentUser ? enc.votes[LumenAuth.currentUser.uid] : null;
                const isAdmin = LumenAuth.isAdmin;
                
                let optionsHTML = '';
                enc.options.forEach((opt, index) => {
                    const votesForOpt = enc.votes ? Object.values(enc.votes).filter(v => v === index).length : 0;
                    const percentage = totalVotes > 0 ? (votesForOpt / totalVotes * 100).toFixed(0) : 0;
                    
                    if (userVote !== null || isAdmin) {
                        optionsHTML += `
                            <div class="poll-result-item">
                                <div class="poll-result-header">
                                    <span>${opt} ${userVote === index ? '✓' : ''}</span>
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
                                <label>${opt}</label>
                            </div>
                        `;
                    }
                });

                html += `
                    <div class="card">
                        <div class="card-header">${Icons.bell}<h3>${enc.question}</h3></div>
                        <div class="card-body">
                            ${optionsHTML}
                            <p style="font-size: 12px; color: var(--texto-gris); margin-top: 10px;">Total de votos: ${totalVotes}</p>
                        </div>
                    </div>
                `;
            });
            list.innerHTML = html;
        });
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

        db.ref('encuestas').push({ question, options, votes: {}, timestamp: Date.now() })
            .then(() => { LumenUI.closeModal('admin-modal'); LumenUI.showToast('Encuesta creada', 'success'); })
            .catch(err => LumenUI.showToast(LumenUI.getErrorMessage(err), 'error'));
    },
    vote: function(pollId, optionIndex) {
        if (!LumenAuth.currentUser) return;
        db.ref(`encuestas/${pollId}/votes/${LumenAuth.currentUser.uid}`).set(optionIndex)
            .then(() => LumenUI.showToast('Voto registrado', 'success'))
            .catch(err => LumenUI.showToast(LumenUI.getErrorMessage(err), 'error'));
    }
};