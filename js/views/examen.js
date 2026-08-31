/* Examen de Conciencia — Fase 2: guiado, lista para confesión, exportar */
const ExamenView = {
    _cat: null,
    _idx: 0,
    _answers: {},

    open: function(id) {
        this._cat = id; this._idx = 0; this._answers = {};
        LumenRouter.navigateTo('examen', true);
    },
    back: function() {
        this._cat = null; this._idx = 0; this._answers = {};
        LumenRouter.navigateTo('examen', true);
    },

    _catData: function() { return EXAMEN_DATA.find(function(c) { return c.id === this._cat; }, this); },
    _allQuestions: function() {
        const cat = this._catData();
        const qs = [];
        (cat.sections || []).forEach(function(s) {
            (s.questions || []).forEach(function(q) { qs.push({ section: s.title, text: q.text, id: q.id, sId: s.id }); });
        });
        return qs;
    },

    answer: function(val) {
        const qs = this._allQuestions();
        const q = qs[this._idx];
        if (!q) return;
        this._answers[q.id] = val;
        LumenUI.playSound();
        if (this._idx < qs.length - 1) {
            this._idx++;
            this._renderStep(qs);
        } else {
            this._renderResults(qs);
        }
    },

    prev: function() {
        const qs = this._allQuestions();
        if (this._idx > 0) { this._idx--; this._renderStep(qs); }
    },
    restart: function() {
        this._idx = 0; this._answers = {};
        LumenRouter.navigateTo('examen', true);
    },

    _renderStep: function(qs) {
        const host = document.getElementById('examen-step');
        const bar = document.getElementById('examen-bar');
        if (!host) { LumenRouter.navigateTo('examen', true); return; }
        const q = qs[this._idx];
        const cur = this._answers[q.id];
        host.innerHTML = `
            <div class="examen-q reveal2">
                <span class="examen-section">${q.section}</span>
                <p class="examen-text">${q.text}</p>
                <div class="examen-opts">
                    <button class="examen-opt ${cur === 'si' ? 'sel-yes' : ''}" onclick="ExamenView.answer('si')">Sí</button>
                    <button class="examen-opt ${cur === 'no' ? 'sel-no' : ''}" onclick="ExamenView.answer('no')">No</button>
                    <button class="examen-opt ${cur === 'quizas' ? 'sel-maybe' : ''}" onclick="ExamenView.answer('quizas')">Quizás</button>
                </div>
                <div class="flat-nav">
                    <button class="btn btn-outline" ${this._idx === 0 ? 'disabled' : ''} onclick="ExamenView.prev()">← Atrás</button>
                    <span>${this._idx + 1} / ${qs.length}</span>
                    <span></span>
                </div>
            </div>`;
        if (bar) bar.style.width = Math.round(((this._idx) / qs.length) * 100) + '%';
    },

    _renderResults: function(qs) {
        const host = document.getElementById('examen-step');
        const bar = document.getElementById('examen-bar');
        const yes = qs.filter(function(q) { return this._answers[q.id] === 'si'; }, this);
        const maybe = qs.filter(function(q) { return this._answers[q.id] === 'quizas'; }, this);
        const list = yes.concat(maybe).map(function(q) {
            return `<li>${q.text} <span class="exam-tag ${this._answers[q.id] === 'si' ? '' : 'tag-maybe'}">${this._answers[q.id] === 'si' ? 'para confesión' : 'para reflexionar'}</span></li>`;
        }, this).join('') || '<li>No marcaste faltas. Date gracias a Dios por su gracia y sigue creciendo.</li>';

        host.innerHTML = `
        <div id="examen-report" class="examen-report">
            <h2>Conciencia examinada</h2>
            <p class="examen-summary">Revisaste <strong>${qs.length}</strong> puntos. Lleva contigo humildad y la certeza de la misericordia de Dios.</p>
            <h3>${LumenIcons.oraciones} Recordar para la confesión</h3>
            <ul class="examen-list">${list}</ul>
            <div class="prayer-actions" style="justify-content:center; flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="ExamenView.copyReport()">Copiar lista</button>
                <button class="btn" onclick="LumenUI.exportPng(document.getElementById('examen-report'),'examen-conciencia.png')">${Icons.download} Descargar PNG</button>
                <button class="btn" onclick="window.print()">${LumenIcons.printer} Imprimir</button>
            </div>
            <div class="flat-nav">
                <button class="btn btn-outline" onclick="ExamenView.prev()">← Revisar</button>
                <button class="btn btn-outline" onclick="ExamenView.restart()">Empezar de nuevo</button>
            </div>
        </div>`;
        if (bar) bar.style.width = '100%';
    },

    copyReport: function() {
        const qs = this._allQuestions();
        const yes = qs.filter(function(q) { return this._answers[q.id] === 'si'; }, this);
        const maybe = qs.filter(function(q) { return this._answers[q.id] === 'quizas'; }, this);
        const lines = yes.concat(maybe).map(function(q) { return '☐ ' + q.text; });
        const text = 'Examen de Conciencia\nPara confesión y reflexión:\n\n' + lines.join('\n') + '\n\n— LUMEN.com';
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(function() { LumenUI.showToast('Lista copiada', 'success'); });
        } else {
            LumenUI.showToast('No se pudo copiar', 'error');
        }
    },

    render: function() {
        if (!this._cat) {
            const cards = EXAMEN_DATA.map(function(c) {
                const count = c.sections.reduce(function(a, s) { return a + s.questions.length; }, 0);
                return `<button class="formacion-card reveal" onclick="ExamenView.open('${c.id}')">
                    <span class="fc-icon">${LumenIcons.examen}</span>
                    <span class="fc-body">
                        <span class="fc-title">${c.title}</span>
                        <span class="fc-desc">${c.subtitle}</span>
                        <span class="fc-meta">${count} puntos de revisión</span>
                    </span>
                </button>`;
            }).join('');
            return `
            <div class="view">
                <section class="formacion-hero reveal">
                    <div class="hero-label">Reflexión sincera ante Dios ${LumenUI.liturgicalBadgeHTML()}</div>
                    <h1 class="grad-title">Examen de Conciencia</h1>
                    <p>Guíate por los mandamientos y los preceptos de la Iglesia para preparar tu confesión con honestidad y paz.</p>
                    <div class="hero-actions" style="justify-content:flex-start;">${LumenUI.streakChipHTML()}</div>
                </section>
                <div class="formacion-grid">${cards}</div>
            </div>`;
        }

        const cat = this._catData();
        const qs = this._allQuestions();
        if (!qs.length) return this.render();
        if (this._idx >= qs.length) this._idx = qs.length - 1;
        const q = qs[this._idx] || { section: '', text: '' };

        return `
        <div class="view">
            <header class="formacion-mhead reveal">
                <button class="btn btn-icon" onclick="ExamenView.back()" aria-label="Volver">←</button>
                <div class="fm-title"><span class="fm-mod">${LumenIcons.examen}${cat.title}</span></div>
                <div class="fm-actions"></div>
            </header>
            <div class="examen-progress"><i id="examen-bar" style="width:${Math.round((this._idx / qs.length) * 100)}%"></i></div>
            <div id="examen-step" class="examen-step">
                <div class="examen-q">
                    <span class="examen-section">${q.section}</span>
                    <p class="examen-text">${q.text}</p>
                    <div class="examen-opts">
                        <button class="examen-opt ${this._answers[q.id] === 'si' ? 'sel-yes' : ''}" onclick="ExamenView.answer('si')">Sí</button>
                        <button class="examen-opt ${this._answers[q.id] === 'no' ? 'sel-no' : ''}" onclick="ExamenView.answer('no')">No</button>
                        <button class="examen-opt ${this._answers[q.id] === 'quizas' ? 'sel-maybe' : ''}" onclick="ExamenView.answer('quizas')">Quizás</button>
                    </div>
                    <div class="flat-nav">
                        <button class="btn btn-outline" ${this._idx === 0 ? 'disabled' : ''} onclick="ExamenView.prev()">← Atrás</button>
                        <span>${this._idx + 1} / ${qs.length}</span>
                        <span></span>
                    </div>
                </div>
            </div>
        </div>`;
    },

    init: function() {
        LumenRouter.initScrollReveal();
        LumenUI.applyReaderPrefs();
    }
};