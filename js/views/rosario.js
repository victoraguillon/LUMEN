/* Rosario y coronillas — hub, rosario convencional, eucarístico y coronillas */
const RosarioView = {
    _mode: 'hub', // hub | convencional | set | eucaristico | coronilla
    _set: null,
    _coronilla: null,
    _pos: 0,

    DAY_MAP: { 0: 'gloriosos', 1: 'gozosos', 2: 'dolorosos', 3: 'gloriosos', 4: 'luminosos', 5: 'dolorosos', 6: 'gozosos' },
    SET_LABEL: { gozosos: 'Gozosos · Lunes y Sábados', dolorosos: 'Dolorosos · Martes y Viernes', gloriosos: 'Gloriosos · Miércoles y Domingos', luminosos: 'Luminosos · Jueves' },
    SET_TITLE: { gozosos: 'Gozosos', dolorosos: 'Dolorosos', gloriosos: 'Gloriosos', luminosos: 'Luminosos' },

    _texts: {
        cruz: 'Por la señal de la Santa Cruz, de nuestros enemigos líbranos, Señor, Dios nuestro. En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén.',
        credo: 'Creo en Dios Padre todopoderoso, Creador del cielo y de la tierra. Creo en Jesucristo, su único Hijo, nuestro Señor, que fue concebido por obra y gracia del Espíritu Santo, nació de Santa María Virgen, padeció bajo el poder de Poncio Pilato, fue crucificado, muerto y sepultado, descendió a los infiernos, resucitó al tercer día de entre los muertos, subió a los cielos y está sentado a la derecha de Dios Padre todopoderoso. Desde allí ha de venir a juzgar a vivos y muertos. Creo en el Espíritu Santo, la Santa Iglesia Católica, la comunión de los santos, el perdón de los pecados, la resurrección de la carne y la vida eterna. Amén.',
        padrenuestro: 'Padre nuestro que estás en el cielo, santificado sea tu Nombre; venga a nosotros tu Reino; hágase tu voluntad en la tierra como en el cielo. Danos hoy nuestro pan de cada día; perdona nuestras ofensas, como también nosotros perdonamos a los que nos ofenden; no nos dejes caer en la tentación, y líbranos del mal. Amén.',
        avemaria: 'Dios te salve, María, llena eres de gracia, el Señor es contigo. Bendita tú eres entre todas las mujeres, y bendito es el fruto de tu vientre, Jesús. Santa María, Madre de Dios, ruega por nosotros, pecadores, ahora y en la hora de nuestra muerte. Amén.',
        gloria: 'Gloria al Padre, y al Hijo, y al Espíritu Santo. Como era en el principio, ahora y siempre, por los siglos de los siglos. Amén.',
        fatima: 'Oh Jesús mío, perdona nuestros pecados, líbranos del fuego del infierno, lleva al cielo a todas las almas, especialmente a las más necesitadas de tu misericordia. Amén.',
        salve: 'Dios te salve, Reina y Madre de misericordia, vida, dulzura y esperanza nuestra, Dios te salve. A ti clamamos los desterrados hijos de Eva; a ti suspiramos, gimiendo y llorando en este valle de lágrimas. Ea, pues, Señora, abogada nuestra, vuelve a nosotros esos tus ojos misericordiosos; y después de este destierro, muéstranos a Jesús, fruto bendito de tu vientre. Oh clemente, oh piadosa, oh dulce Virgen María. Ruega por nosotros, Santa Madre de Dios, para que seamos dignos de alcanzar las promesas de nuestro Señor Jesucristo. Amén.'
    },

    _icon: function(key) {
        return (typeof LumenIcons !== 'undefined' && LumenIcons[key]) ? LumenIcons[key] : LumenIcons.rosario;
    },

    // ---- Constructores de pasos ----
    _buildConventional: function(setId) {
        const TS = this._texts;
        const ORDINALES = ['Primera', 'Segunda', 'Tercera', 'Cuarta', 'Quinta', 'Sexta', 'Séptima', 'Octava', 'Novena', 'Décima'];
        const steps = [
            { label: 'Señal de la Cruz', text: TS.cruz, icon: this._icon('cross') },
            { label: 'Credo', text: TS.credo, icon: this._icon('cross') },
            { label: 'Padre Nuestro', text: TS.padrenuestro, icon: this._icon('rosario') },
            { label: 'Primera, Segunda y Tercera Avemaría', text: TS.avemaria + ' ' + TS.avemaria + ' ' + TS.avemaria, icon: this._icon('feather') },
            { label: 'Gloria', text: TS.gloria, icon: this._icon('star') }
        ];
        const misterios = (ROSARIO_DATA.sets && ROSARIO_DATA.sets[setId]) ? ROSARIO_DATA.sets[setId] : [];
        for (let d = 0; d < misterios.length; d++) {
            const m = misterios[d];
            steps.push({ label: 'Misterio ' + (d + 1) + (m && m.title ? ': ' + m.title : ''), mystery: m, text: m && m.biblicalText ? m.biblicalText : '', icon: this._icon('novenas') });
            steps.push({ label: 'Padre Nuestro', text: TS.padrenuestro, icon: this._icon('rosario') });
            for (let a = 0; a < 10; a++) steps.push({ label: ORDINALES[a] + ' Avemaría', text: TS.avemaria, icon: this._icon('feather') });
            steps.push({ label: 'Gloria', text: TS.gloria, icon: this._icon('star') });
            steps.push({ label: 'Oración de Fátima', text: TS.fatima, icon: this._icon('oraciones') });
        }
        steps.push({ label: 'Salve Regina', text: TS.salve, icon: this._icon('crown') });
        return steps;
    },

    _buildEucaristico: function() {
        const E = (typeof ROSARIO_DATA !== 'undefined' && ROSARIO_DATA.eucaristico) ? ROSARIO_DATA.eucaristico : null;
        if (!E) return [];
        const TS = this._texts;
        const steps = [
            { label: 'Señal de la Cruz', text: TS.cruz, icon: this._icon('cross') },
            { label: 'Ofrecimiento eucarístico', text: 'Señor Jesucristo, que en el Santísimo Sacramento del Altar te haces realmente presente, te adoramos y te amamos. Acompáñanos en este rosario eucarístico y aviva en nosotros la fe en tu presencia. Amén.', icon: this._icon('heart') },
            { label: 'Padre Nuestro', text: TS.padrenuestro, icon: this._icon('rosario') },
            { label: 'Primera Alabanza Eucarística', text: E.smallBeadPrayer, icon: this._icon('feather') },
            { label: 'Segunda Alabanza Eucarística', text: E.smallBeadPrayer, icon: this._icon('feather') },
            { label: 'Tercera Alabanza Eucarística', text: E.smallBeadPrayer, icon: this._icon('feather') }
        ];
        for (let d = 0; d < E.mysteries.length; d++) {
            const m = E.mysteries[d];
            steps.push({ label: 'Misterio ' + (d + 1) + ': ' + m.title, mystery: m, text: m.biblicalText, icon: this._icon('novenas') });
            steps.push({ label: 'Padre Nuestro', text: TS.padrenuestro, icon: this._icon('rosario') });
            for (let a = 0; a < 10; a++) steps.push({ label: 'Alabanza Eucarística ' + (a + 1) + '/10', text: E.smallBeadPrayer, icon: this._icon('feather') });
            steps.push({ label: 'Oración de Fátima', text: TS.fatima, icon: this._icon('oraciones') });
            steps.push({ label: 'Jaculatoria eucarística', text: E.jaculatoria, icon: this._icon('heart') });
            steps.push({ label: 'Ofrecimiento de la decena', text: E.offering, icon: this._icon('heart') });
        }
        steps.push({ label: 'Gloria', text: TS.gloria, icon: this._icon('star') });
        steps.push({ label: 'Salve Regina', text: TS.salve, icon: this._icon('crown') });
        steps.push({ label: 'Oración final', text: E.closing, icon: this._icon('cross') });
        return steps;
    },

    _buildCoronilla: function(id) {
        const data = (typeof CORONILLAS_DATA !== 'undefined') ? CORONILLAS_DATA[id] : null;
        if (!data) return [];
        const TS = this._texts;
        const steps = [];
        const resolveText = function(block) {
            return block.text || (block.ref ? TS[block.ref] : '') || '';
        };
        const pushBlock = function(block, section, firstOfSection) {
            const text = resolveText(block);
            const count = Math.max(1, block.count || 1);
            for (let i = 0; i < count; i++) {
                const label = block.label + (count > 1 ? ' ' + (i + 1) + '/' + count : '');
                steps.push({
                    label: label,
                    text: text,
                    icon: block.icon ? (LumenIcons[block.icon] || LumenIcons.rosario) : (LumenIcons[data.icon] || LumenIcons.rosario),
                    sectionTitle: firstOfSection && i === 0 && section ? section.title : null,
                    sectionStart: !!(firstOfSection && i === 0 && section),
                    mystery: (firstOfSection && i === 0 && section && section.mystery) ? section.mystery : null
                });
            }
        };
        (data.opening || []).forEach(function(block) { pushBlock(block, null, false); });
        (data.sections || []).forEach(function(section) {
            (section.blocks || []).forEach(function(block, idx) {
                pushBlock(block, section, idx === 0);
            });
        });
        (data.closing || []).forEach(function(block) { pushBlock(block, null, false); });
        return steps;
    },

    _build: function() {
        if (this._mode === 'eucaristico') return this._buildEucaristico();
        if (this._mode === 'coronilla') return this._buildCoronilla(this._coronilla);
        return this._buildConventional(this._set);
    },

    // ---- Progreso ----
    _progKeyForMode: function() {
        return this._mode === 'coronilla' ? 'lumen-coronilla-progress' : 'lumen-rosario-progress';
    },
    _currentKey: function() {
        if (this._mode === 'eucaristico') return 'eucaristico';
        if (this._mode === 'coronilla') return this._coronilla;
        return this._set;
    },
    _readStore: function(key) {
        try { return JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { return {}; }
    },
    _readPos: function() {
        const key = this._currentKey();
        if (!key) return 0;
        return this._readStore(this._progKeyForMode())[key] || 0;
    },
    _savePos: function() {
        const key = this._currentKey();
        if (!key) return;
        const storeKey = this._progKeyForMode();
        const p = this._readStore(storeKey);
        p[key] = this._pos;
        localStorage.setItem(storeKey, JSON.stringify(p));
    },
    _savedPos: function(storeKey, key) {
        return this._readStore(storeKey)[key] || 0;
    },
    _pct: function(pos, total) {
        if (!total) return 0;
        return Math.min(100, Math.round((pos / total) * 100));
    },

    _todaySet: function() { return this.DAY_MAP[new Date().getDay()] || 'gozosos'; },

    // ---- Rutas ----
    route: function() {
        if (this._mode === 'convencional') return { parts: ['convencional'], query: null };
        if (this._mode === 'set' && this._set) return { parts: [this._set], query: null };
        if (this._mode === 'eucaristico') return { parts: ['eucaristico'], query: null };
        if (this._mode === 'coronilla' && this._coronilla) return { parts: [this._coronilla], query: null };
        return { parts: [], query: null };
    },

    applyRoute: function(params) {
        const first = params && params[0];
        this._mode = 'hub';
        this._set = null;
        this._coronilla = null;
        this._pos = 0;
        if (!first) return;

        if (first === 'convencional') {
            this._mode = 'convencional';
            return;
        }
        if (first === 'eucaristico') {
            this._mode = 'eucaristico';
            this._pos = this._readPos();
            this._remember();
            return;
        }
        if (typeof CORONILLAS_DATA !== 'undefined' && CORONILLAS_DATA[first]) {
            this._mode = 'coronilla';
            this._coronilla = first;
            this._pos = this._readPos();
            this._remember();
            return;
        }
        if (typeof ROSARIO_DATA !== 'undefined' && ROSARIO_DATA.sets && ROSARIO_DATA.sets[first]) {
            this._mode = 'set';
            this._set = first;
            this._pos = this._readPos();
            this._remember();
        }
    },

    _remember: function() {
        if (typeof LumenUI === 'undefined' || !LumenUI.setRecent) return;
        if (this._mode === 'set' && this._set) {
            LumenUI.setRecent('rosario', this._set, 'Misterios ' + this.SET_TITLE[this._set], ['rosario', this._set]);
        } else if (this._mode === 'eucaristico') {
            LumenUI.setRecent('rosario', 'eucaristico', 'Rosario Eucarístico', ['rosario', 'eucaristico']);
        } else if (this._mode === 'coronilla' && this._coronilla) {
            const data = CORONILLAS_DATA[this._coronilla];
            LumenUI.setRecent('rosario', this._coronilla, data ? data.title : 'Coronilla', ['rosario', this._coronilla]);
        }
    },

    // ---- Acciones de navegación ----
    openConventional: function() {
        this._mode = 'convencional';
        this._set = null;
        this._coronilla = null;
        this._pos = 0;
        LumenRouter.navigateTo('rosario', true);
    },
    pick: function(setId) {
        this._mode = 'set';
        this._set = setId;
        this._coronilla = null;
        this._pos = this._savedPos('lumen-rosario-progress', setId);
        this._remember();
        LumenRouter.navigateTo('rosario', true);
    },
    openMystery: function(setId, title) {
        const steps = this._buildConventional(setId);
        const index = steps.findIndex(function(step) { return step.mystery && step.mystery.title === title; });
        this._mode = 'set';
        this._set = setId;
        this._coronilla = null;
        this._pos = index > -1 ? index : this._savedPos('lumen-rosario-progress', setId);
        this._remember();
        LumenRouter.navigateTo('rosario', true);
    },
    openEucharistic: function() {
        this._mode = 'eucaristico';
        this._set = null;
        this._coronilla = null;
        this._pos = this._savedPos('lumen-rosario-progress', 'eucaristico');
        this._remember();
        LumenRouter.navigateTo('rosario', true);
    },
    openEucharisticMystery: function(title) {
        const steps = this._buildEucaristico();
        const index = steps.findIndex(function(step) { return step.mystery && step.mystery.title === title; });
        this._mode = 'eucaristico';
        this._set = null;
        this._coronilla = null;
        this._pos = index > -1 ? index : this._savedPos('lumen-rosario-progress', 'eucaristico');
        this._remember();
        LumenRouter.navigateTo('rosario', true);
    },
    openCoronilla: function(id) {
        this._mode = 'coronilla';
        this._set = null;
        this._coronilla = id;
        this._pos = this._savedPos('lumen-coronilla-progress', id);
        this._remember();
        LumenRouter.navigateTo('rosario', true);
    },
    openTarget: function(type, id) {
        if (type === 'eucaristico') return this.openEucharistic();
        if (type === 'coronilla') return this.openCoronilla(id);
        if (type === 'convencional') return this.openConventional();
        if (type === 'set' && id) return this.pick(id);
    },
    back: function() {
        if (this._mode === 'set') {
            this._mode = 'convencional';
            this._set = null;
            this._pos = 0;
        } else {
            this._mode = 'hub';
            this._set = null;
            this._coronilla = null;
            this._pos = 0;
        }
        LumenRouter.navigateTo('rosario', true);
    },

    nextStep: function() {
        const steps = this._build();
        if (!steps.length) return;
        if (this._pos < steps.length - 1) {
            this._pos++;
            this._savePos();
            if (typeof LumenUI !== 'undefined' && LumenUI.recordStreak) LumenUI.recordStreak();
            this._rerenderStep();
            return;
        }
        if (typeof LumenUI !== 'undefined' && LumenUI.recordStreak) LumenUI.recordStreak();
        const title = this._mode === 'eucaristico' ? '¡Rosario Eucarístico completado!' : (this._mode === 'coronilla' ? '¡Coronilla completada!' : '¡Rosario completado!');
        const msg = this._mode === 'coronilla' ? 'Has terminado esta coronilla con devoción y fe.' : 'Has rezado este rosario con devoción y fe.';
        if (typeof LumenUI !== 'undefined' && LumenUI.celebrate) LumenUI.celebrate(title, msg);
        this._pos = 0;
        this._savePos();
        if (this._mode === 'set') {
            this._mode = 'convencional';
            this._set = null;
        } else {
            this._mode = 'hub';
            this._coronilla = null;
        }
        LumenRouter.navigateTo('rosario', true);
    },
    prevStep: function() {
        if (this._pos > 0) {
            this._pos--;
            this._savePos();
            this._rerenderStep();
        }
    },

    _audioText: function(step) {
        if (!step) return '';
        // La voz lee solo la oración o el pasaje bíblico, nunca el título del paso.
        return step.text || (step.mystery && step.mystery.biblicalText) || '';
    },

    _audioButton: function(step) {
        if (typeof LumenAudio === 'undefined' || !LumenAudio.supported || !LumenAudio.supported()) return '';
        return LumenAudio.buttonHTML(this._audioText(step), 'Escuchar este paso');
    },

    _rerenderStep: function() {
        if (typeof LumenAudio !== 'undefined' && LumenAudio.stop) LumenAudio.stop();
        const steps = this._build();
        const step = steps[this._pos];
        const box = document.getElementById('rosario-step');
        if (!box || !step) return;
        const pct = this._pct(this._pos, steps.length);
        const bar = document.getElementById('rosario-bar');
        if (bar) bar.style.width = pct + '%';
        const counter = document.getElementById('rosario-counter');
        if (counter) counter.textContent = (this._pos + 1) + ' / ' + steps.length;
        const prev = document.getElementById('rosario-prev-btn');
        if (prev) prev.disabled = this._pos === 0;
        const next = document.getElementById('rosario-next-btn');
        if (next) next.textContent = this._pos >= steps.length - 1 ? 'Terminar' : 'Siguiente cuenta →';
        box.innerHTML = this._stepHTML(step, pct);
    },

    _stepHTML: function(step, pct) {
        const text = step.text || (step.mystery && step.mystery.biblicalText) || '';
        const sectionHTML = step.sectionStart && step.sectionTitle ? `<p class="rosario-section-label">${LumenUI.escapeHTML(step.sectionTitle)}</p>` : '';
        return `<div class="rosario-step-content">
            <span class="rosario-icon">${step.icon || LumenIcons.rosario}</span>
            ${sectionHTML}
            <h2>${LumenUI.escapeHTML(step.label || '')}</h2>
            <div class="reading-surface rosario-text">${String(text).replace(/\n/g, '<br>')}</div>
            <div class="rosario-step-actions">${this._audioButton(step)}</div>
            <div class="rosario-progress"><i id="rosario-bar" style="width:${pct}%"></i></div>
        </div>`;
    },

    // ---- Render del hub ----
    _card: function(opts) {
        const pct = opts.pct || 0;
        return `<button class="formacion-card rosario-card reveal${opts.today ? ' today' : ''}" onclick="${opts.onclick}">
            <span class="fc-icon">${opts.icon || LumenIcons.rosario}</span>
            <span class="fc-body">
                <span class="fc-title">${LumenUI.escapeHTML(opts.title)}</span>
                <span class="fc-desc">${LumenUI.escapeHTML(opts.desc)}</span>
                ${pct ? `<span class="fc-progress"><i style="width:${pct}%"></i></span>` : ''}
                <span class="fc-meta">${LumenUI.escapeHTML(opts.meta || '')}${pct ? ' · ' + pct + '%' : ''}</span>
            </span>
        </button>`;
    },

    _renderHub: function() {
        const today = this._todaySet();
        const conventionalTotal = this._buildConventional(today).length;
        const conventionalPos = this._savedPos('lumen-rosario-progress', today);
        const eucTotal = this._buildEucaristico().length;
        const eucPos = this._savedPos('lumen-rosario-progress', 'eucaristico');
        const conventionalCard = this._card({
            title: 'Rosario convencional',
            desc: 'Misterios gozosos, dolorosos, gloriosos y luminosos',
            icon: LumenIcons.rosario,
            onclick: 'RosarioView.openConventional()',
            meta: 'Hoy: ' + this.SET_TITLE[today] + ' · 5 misterios',
            pct: this._pct(conventionalPos, conventionalTotal),
            today: true
        });
        const eucCard = this._card({
            title: 'Rosario Eucarístico',
            desc: 'Cinco misterios ante Jesús vivo en el Santísimo Sacramento',
            icon: LumenIcons.heart,
            onclick: 'RosarioView.openEucharistic()',
            meta: '5 misterios · Alabanza eucarística',
            pct: this._pct(eucPos, eucTotal)
        });
        const coronillas = Object.keys(CORONILLAS_DATA || {}).map(function(id) {
            const data = CORONILLAS_DATA[id];
            const total = this._buildCoronilla(id).length;
            const pos = this._savedPos('lumen-coronilla-progress', id);
            return this._card({
                title: data.shortTitle || data.title,
                desc: data.subtitle || '',
                icon: this._icon(data.icon),
                onclick: "RosarioView.openCoronilla('" + id + "')",
                meta: data.title,
                pct: this._pct(pos, total)
            });
        }, this).join('');

        return `
        <div class="view">
            <div class="v-header reveal">
                <span class="v-eyebrow">${LumenIcons.rosario} Reza con guía ${LumenUI.liturgicalBadgeHTML()}</span>
                <h1 class="v-title">Rosario y <em>coronillas</em></h1>
                <p class="v-sub">Elige un rosario o una coronilla. Cada paso trae su texto, su progreso y la posibilidad de escucharlo.</p>
                <div class="hero-actions v-jcc v-mt20">${LumenUI.streakChipHTML()}</div>
            </div>

            <div class="v-section rosario-hub">
                <div class="rosario-hub-group">
                    <div class="section-heading">
                        <span class="section-kicker">Rosarios</span>
                        <h2 class="section-title">El Rosario y el Rosario Eucarístico</h2>
                    </div>
                    <div class="formacion-grid v-stagger">${conventionalCard}${eucCard}</div>
                </div>

                <div class="rosario-hub-group">
                    <div class="section-heading">
                        <span class="section-kicker">Coronillas</span>
                        <h2 class="section-title">Oraciones breves para momentos concretos</h2>
                    </div>
                    <div class="formacion-grid v-stagger">${coronillas}</div>
                </div>
            </div>
        </div>`;
    },

    _renderConventional: function() {
        const saved = this._readStore('lumen-rosario-progress');
        const today = this._todaySet();
        const imgMap = {
            gozosos: 'assets/gozosos.jpg',
            dolorosos: 'assets/dolorosos.jpg',
            gloriosos: 'assets/gloriosos.jpg',
            luminosos: 'assets/luminosos.jpg'
        };
        const sets = ['gozosos', 'dolorosos', 'gloriosos', 'luminosos'].map(function(s) {
            const myst = (ROSARIO_DATA.sets[s] || []);
            const total = this._buildConventional(s).length;
            const pct = this._pct(saved[s] || 0, total);
            const isToday = s === today;
            const img = imgMap[s];
            const iconHtml = img
                ? `<img src="${img}" alt="Misterios ${this.SET_TITLE[s]}" class="v-media">`
                : (isToday ? LumenIcons.racha : LumenIcons.rosario);
            return `<button class="formacion-card rosario-card reveal${isToday ? ' today' : ''}" onclick="RosarioView.pick('${s}')">
                <span class="fc-icon">${iconHtml}</span>
                <span class="fc-body">
                    <span class="fc-title">Misterios ${this.SET_TITLE[s]}</span>
                    <span class="fc-desc">${this.SET_LABEL[s]}${isToday ? ' · HOY' : ''}</span>
                    <span class="fc-progress"><i style="width:${pct}%"></i></span>
                    <span class="fc-meta">${myst.length} misterios${pct ? ' · ' + pct + '%' : ''}</span>
                </span>
            </button>`;
        }, this).join('');

        return `
        <div class="view">
            <header class="formacion-mhead reveal">
                <button class="btn btn-icon" onclick="RosarioView.back()" aria-label="Volver al Rosario">←</button>
                <div class="fm-title"><span class="fm-mod">${LumenIcons.rosario}Rosario convencional</span></div>
                <div class="fm-actions"></div>
            </header>
            <div class="v-header reveal" style="padding-top:0;">
                <span class="v-eyebrow">${LumenUI.liturgicalBadgeHTML()}</span>
                <h1 class="v-title">Misterios <em>del Rosario</em></h1>
                <p class="v-sub">Los misterios de hoy son los <strong>${this.SET_LABEL[today]}</strong>. Ve avanzando cuenta por cuenta: cada misterio trae su pasaje bíblico para meditar.</p>
                <div class="hero-actions v-jcc v-mt20">${LumenUI.streakChipHTML()}</div>
            </div>
            <div class="v-section" style="padding-top:0;">
                <div class="formacion-grid v-stagger">${sets}</div>
            </div>
        </div>`;
    },

    _titleForMode: function() {
        if (this._mode === 'set') return 'Misterios ' + (this.SET_TITLE[this._set] || this._set);
        if (this._mode === 'eucaristico') return 'Rosario Eucarístico';
        if (this._mode === 'coronilla' && CORONILLAS_DATA[this._coronilla]) return CORONILLAS_DATA[this._coronilla].title;
        return 'Rosario';
    },

    _renderStep: function() {
        const steps = this._build();
        if (!steps.length) return this._renderHub();
        if (!steps[this._pos]) this._pos = 0;
        const step = steps[this._pos];
        const pct = this._pct(this._pos, steps.length);
        const title = this._titleForMode();
        const backLabel = this._mode === 'set' ? 'Volver a misterios' : 'Volver al Rosario';
        return `
        <div class="view">
            <h1 class="sr-only">${LumenUI.escapeHTML(title)}, cuenta ${this._pos + 1}</h1>
            <header class="formacion-mhead reveal" id="rosario-prayer-header">
                <button class="btn btn-icon" onclick="RosarioView.back()" aria-label="${backLabel}">←</button>
                <div class="fm-title"><span class="fm-mod">${LumenIcons.rosario}${LumenUI.escapeHTML(title)}</span><span id="rosario-counter" class="fm-count">${this._pos + 1} / ${steps.length}</span></div>
                <div class="fm-actions">
                    <button class="btn btn-icon" type="button" id="rosario-focus-btn" onclick="RosarioView.toggleFocus()" aria-label="Activar modo oración" aria-pressed="false">${LumenIcons.sparkles}</button>
                </div>
            </header>
            <div class="rosario-stage reveal">
                <div id="rosario-step" class="rosario-step">${this._stepHTML(step, pct)}</div>
                <nav class="flat-nav" aria-label="Avanza por la oración">
                    <button id="rosario-prev-btn" class="btn btn-outline" ${this._pos === 0 ? 'disabled' : ''} onclick="RosarioView.prevStep()">← Anterior</button>
                    <button id="rosario-next-btn" class="btn btn-primary" onclick="RosarioView.nextStep()">${this._pos >= steps.length - 1 ? 'Terminar' : 'Siguiente cuenta →'}</button>
                </nav>
                <button class="focus-exit" type="button" onclick="RosarioView.toggleFocus()">Salir del modo oración</button>
            </div>
        </div>`;
    },

    render: function() {
        if (this._mode === 'hub') return this._renderHub();
        if (this._mode === 'convencional') return this._renderConventional();
        return this._renderStep();
    },

    toggleFocus: function() {
        const on = document.body.classList.toggle('prayer-focus');
        const btn = document.getElementById('rosario-focus-btn');
        if (btn) {
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
            btn.setAttribute('aria-label', on ? 'Salir del modo oración' : 'Activar modo oración');
        }
    },

    openFav: function() { LumenRouter.navigateTo('rosario'); },

    init: function() {
        LumenRouter.initScrollReveal();
        LumenUI.applyReaderPrefs();
    },

    destroy: function() {
        if (typeof LumenAudio !== 'undefined' && LumenAudio.stop) LumenAudio.stop();
        document.body.classList.remove('prayer-focus');
    }
};
