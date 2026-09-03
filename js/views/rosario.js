/* Rosario Interactivo — Fase 2 (texto primero) */
const RosarioView = {
    _set: null,
    _pos: 0,

    DAY_MAP: { 0: 'gloriosos', 1: 'gozosos', 2: 'dolorosos', 3: 'gloriosos', 4: 'luminosos', 5: 'dolorosos', 6: 'gozosos' },
    SET_LABEL: { gozosos: 'Gozosos · Lunes y Sábados', dolorosos: 'Dolorosos · Martes y Viernes', gloriosos: 'Gloriosos · Miércoles y Domingos', luminosos: 'Luminosos · Jueves' },

    _texts: {
        cruz: 'Por la señal de la Santa Cruz, de nuestros enemigos líbranos, Señor, Dios nuestro. En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén.',
        credo: 'Creo en Dios Padre todopoderoso, Creador del cielo y de la tierra. Creo en Jesucristo, su único Hijo, nuestro Señor, que fue concebido por obra y gracia del Espíritu Santo, nació de Santa María Virgen, padeció bajo el poder de Poncio Pilato, fue crucificado, muerto y sepultado, descendió a los infiernos, resucitó al tercer día de entre los muertos, subió a los cielos y está sentado a la derecha de Dios Padre todopoderoso. Desde allí ha de venir a juzgar a vivos y muertos. Creo en el Espíritu Santo, la Santa Iglesia Católica, la comunión de los santos, el perdón de los pecados, la resurrección de la carne y la vida eterna. Amén.',
        padrenuestro: 'Padre nuestro que estás en el cielo, santificado sea tu Nombre; venga a nosotros tu Reino; hágase tu voluntad en la tierra como en el cielo. Danos hoy nuestro pan de cada día; perdona nuestras ofensas, como también nosotros perdonamos a los que nos ofenden; no nos dejes caer en la tentación, y líbranos del mal. Amén.',
        avemaria: 'Dios te salve, María, llena eres de gracia, el Señor es contigo. Bendita tú eres entre todas las mujeres, y bendito es el fruto de tu vientre, Jesús. Santa María, Madre de Dios, ruega por nosotros, pecadores, ahora y en la hora de nuestra muerte. Amén.',
        gloria: 'Gloria al Padre, y al Hijo, y al Espíritu Santo. Como era en el principio, ahora y siempre, por los siglos de los siglos. Amén.',
        fatima: 'Oh Jesús mío, perdona nuestros pecados, líbranos del fuego del infierno, lleva al cielo a todas las almas, especialmente a las más necesitadas de tu misericordia. Amén.',
        salve: 'Dios te salve, Reina y Madre de misericordia, vida, dulzura y esperanza nuestra, Dios te salve. A ti clamamos los desterrados hijos de Eva; a ti suspiramos, gimiendo y llorando en este valle de lágrimas. Ea, pues, Señora, abogada nuestra, vuelve a nosotros esos tus ojos misericordiosos; y después de este destierro, muéstranos a Jesús, fruto bendito de tu vientre. Oh clemente, oh piadosa, oh dulce Virgen María. Ruega por nosotros, Santa Madre de Dios, para que seamos dignos de alcanzar las promesas de nuestro Señor Jesucristo. Amén.'
    },

    _build: function() {
        const TS = this._texts;
        const ORDINALES = ['Primera','Segunda','Tercera','Cuarta','Quinta','Sexta','Séptima','Octava','Novena','Décima'];
        const steps = [
            { label: 'Señal de la Cruz', text: TS.cruz, icon: LumenIcons.cross },
            { label: 'Credo', text: TS.credo, icon: LumenIcons.cross },
            { label: 'Padre Nuestro', text: TS.padrenuestro, icon: LumenIcons.rosario },
            { label: 'Primera, Segunda y Tercera Avemaría', text: TS.avemaria + ' ' + TS.avemaria + ' ' + TS.avemaria, icon: LumenIcons.feather },
            { label: 'Gloria', text: TS.gloria, icon: Icons.star }
        ];
        const misterios = (ROSARIO_DATA.sets[this._set] || []);
        for (let d = 0; d < misterios.length; d++) {
            const m = misterios[d];
            steps.push({ label: 'Misterio ' + (d + 1) + (m && m.title ? ': ' + m.title : ''), mystery: m, text: m && m.biblicalText ? m.biblicalText : '', icon: LumenIcons.novenas });
            steps.push({ label: 'Padre Nuestro', text: TS.padrenuestro, icon: LumenIcons.rosario });
            for (let a = 0; a < 10; a++) steps.push({ label: ORDINALES[a] + ' Avemaría', text: TS.avemaria, icon: LumenIcons.feather });
            steps.push({ label: 'Gloria', text: TS.gloria, icon: Icons.star });
            steps.push({ label: 'Oración de Fátima', text: TS.fatima, icon: LumenIcons.oraciones });
        }
        steps.push({ label: 'Salve Regina', text: TS.salve, icon: LumenIcons.crown });
        return steps;
    },

    _progKey: 'lumen-rosario-progress',
    _readPos: function() { try { return JSON.parse(localStorage.getItem(this._progKey)) || {}; } catch (e) { return {}; } },
    _savePos: function() {
        const p = this._readPos();
        p[this._set] = this._pos;
        localStorage.setItem(this._progKey, JSON.stringify(p));
    },

    _todaySet: function() { return this.DAY_MAP[new Date().getDay()] || 'gozosos'; },

    pick: function(s) {
        this._set = s;
        const saved = this._readPos();
        this._pos = saved[s] || 0;
        LumenRouter.navigateTo('rosario', true);
    },

    nextStep: function() {
        const steps = this._build();
        if (this._pos < steps.length - 1) {
            this._pos++;
            this._savePos();
            this._rerenderStep();
        } else {
            LumenUI.celebrate('¡Rosario completado!', 'Has rezado el misterio de hoy con devoción y fe.');
            this._pos = 0; this._savePos();
            LumenRouter.navigateTo('rosario', true);
        }
    },
    prevStep: function() {
        if (this._pos > 0) { this._pos--; this._savePos(); this._rerenderStep(); }
    },
    back: function() { this._set = null; LumenRouter.navigateTo('rosario', true); },

    _rerenderStep: function() {
        const steps = this._build();
        const step = steps[this._pos];
        const box = document.getElementById('rosario-step');
        if (!box) return;
        const pct = Math.round(((this._pos) / steps.length) * 100);
        const bar = document.getElementById('rosario-bar');
        if (bar) bar.style.width = pct + '%';
        const counter = document.getElementById('rosario-counter');
        if (counter) counter.textContent = (this._pos + 1) + ' / ' + steps.length;
        box.innerHTML = this._stepHTML(step, pct);
    },

    _stepHTML: function(step, pct) {
        const mysteryHTML = step.mystery ? `<div class="mystery-box">
            <h3>${step.mystery.title || ''}</h3>
            <p class="mystery-ref">${step.mystery.reference || ''}</p>
            <div class="reading-surface mystery-text">${String(step.text || step.mystery.biblicalText || '').replace(/\n/g, '<br>')}</div>
        </div>` : '';
        return `<div class="rosario-step-content">
            <span class="rosario-icon">${step.icon || LumenIcons.rosario}</span>
            <h2>${step.label}</h2>
            ${mysteryHTML}
            ${!step.mystery ? `<div class="reading-surface rosario-text">${String(step.text || '').replace(/\n/g, '<br>')}</div>` : ''}
            <div class="rosario-progress"><i id="rosario-bar" style="width:${pct}%"></i></div>
        </div>`;
    },

    render: function() {
        if (!this._set) {
            const saved = this._readPos();
            const today = this._todaySet();
            const imgMap = {
                gozosos: 'assets/gozosos.jpg',
                dolorosos: 'assets/dolorosos.jpg',
                gloriosos: 'assets/gloriosos.jpg',
                luminosos: 'assets/luminosos.jpg',
            };
            const sets = ['gozosos','dolorosos','gloriosos','luminosos'].map(function(s) {
                const myst = (ROSARIO_DATA.sets[s] || []);
                const total = 5 + myst.length * 14 + 1;
                const pct = Math.round(((saved[s] || 0) / total) * 100);
                const isToday = s === today;
                const img = imgMap[s];
                const iconHtml = img
                    ? `<img src="${img}" alt="Misterios ${s === 'gozosos' ? 'Gozosos' : s === 'dolorosos' ? 'Dolorosos' : s === 'gloriosos' ? 'Gloriosos' : 'Luminosos'}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`
                    : (isToday ? LumenIcons.racha : LumenIcons.rosario);
                return `<button class="formacion-card rosario-card reveal${isToday ? ' today' : ''}" onclick="RosarioView.pick('${s}')">
                    <span class="fc-icon">${iconHtml}</span>
                    <span class="fc-body">
                        <span class="fc-title">Misterios ${s === 'gozosos' ? 'Gozosos' : s === 'dolorosos' ? 'Dolorosos' : s === 'gloriosos' ? 'Gloriosos' : 'Luminosos'}</span>
                        <span class="fc-desc">${this.SET_LABEL[s]}${isToday ? ' · HOY' : ''}</span>
                        <span class="fc-progress"><i style="width:${pct}%"></i></span>
                        <span class="fc-meta">${myst.length} misterios${pct ? ' · ' + pct + '%' : ''}</span>
                    </span>
                </button>`;
            }, this).join('');

            return `
            <div class="view">
                <div class="v-header reveal">
                    <span class="v-eyebrow">${LumenIcons.rosario} Reza con guía ${LumenUI.liturgicalBadgeHTML()}</span>
                    <h2 class="v-title">Rosario <em>Interactivo</em></h2>
                    <p class="v-sub">Los misterios de hoy son los <strong>${this.SET_LABEL[today]}</strong>. Ve avanzando cuenta por cuenta: cada misterio trae su pasaje bíblico para meditar.</p>
                    <div class="hero-actions" style="justify-content:center; margin-top:20px;">${LumenUI.streakChipHTML()}</div>
                </div>
                <div class="v-section" style="padding-top:0;">
                    <div class="formacion-grid">${sets}</div>
                </div>
            </div>`;
        }

        const steps = this._build();
        if (!steps[this._pos]) this._pos = 0;
        const step = steps[this._pos];
        const pct = Math.round(((this._pos) / steps.length) * 100);

        return `
        <div class="view">
            <header class="formacion-mhead reveal">
                <button class="btn btn-icon" onclick="RosarioView.back()" aria-label="Volver a misterios">←</button>
                <div class="fm-title"><span class="fm-mod">${LumenIcons.rosario}Misterios ${this._set}</span><span id="rosario-counter" class="fm-count">${this._pos + 1} / ${steps.length}</span></div>
                <div class="fm-actions"></div>
            </header>
            <div class="rosario-stage reveal">
                <div id="rosario-step" class="rosario-step">${this._stepHTML(step, pct)}</div>
                <nav class="flat-nav" aria-label="Avanza por el rosario">
                    <button class="btn btn-outline" ${this._pos === 0 ? 'disabled' : ''} onclick="RosarioView.prevStep()">← Anterior</button>
                    <button class="btn btn-primary" onclick="RosarioView.nextStep()">${this._pos >= steps.length - 1 ? 'Terminar' : 'Siguiente cuenta →'}</button>
                </nav>
            </div>
        </div>`;
    },

    openFav: function() { LumenRouter.navigateTo('rosario'); },

    init: function() {
        LumenRouter.initScrollReveal();
        LumenUI.applyReaderPrefs();
    }
};