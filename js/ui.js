const LumenUI = {
    audioCtx: null,
    escapeHTML: function(str) { return String(str ?? '').replace(/[&<>"']/g, function(c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); },
    playSound: function() {
        try {
            if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const o = this.audioCtx.createOscillator();
            const g = this.audioCtx.createGain();
            o.connect(g); g.connect(this.audioCtx.destination);
            o.frequency.value = 600; o.type = 'triangle';
            g.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.05);
            o.start(); o.stop(this.audioCtx.currentTime + 0.05);
        } catch(e) {}
    },
    openModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        if (modalId === 'register-modal') this._resetRegister();
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        const first = modal.querySelector('input:not([readonly]):not([type="hidden"]), textarea, select');
        if (first) { try { window.setTimeout(function() { first.focus({ preventScroll: true }); }, 60); } catch(e) {} }
    },
    closeModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.classList.remove('active');
        const form = modal.querySelector('form');
        if (form) form.reset();
        if (modalId === 'register-modal') this._resetRegister();
        if (!document.querySelector('.modal-overlay.active')) document.body.classList.remove('modal-open');
    },
    openAdminModal: function(title, contentHTML) {
        document.getElementById('admin-modal-title').innerText = title;
        document.getElementById('admin-modal-content').innerHTML = contentHTML;
        this.openModal('admin-modal');
    },
    requireMember: function(action) {
        if (!LumenAuth.currentUser) {
            this.showToast('Debes iniciar sesión para continuar.', 'error');
            this.openModal('login-modal');
            return false;
        }
        if (!LumenAuth.isMember) {
            LumenUI.showToast('Debes ser miembro de Juvemar para continuar.', 'error');
            LumenAuth.requestJuvemarMembership();
            return false;
        }
        return true;
    },
    showToast: function(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'status');
        toast.innerHTML = `${type === 'success' ? Icons.check_circle : Icons.alert} <span>${this.escapeHTML(message)}</span>`;
        const container = document.getElementById('toast-container');
        if (container.firstElementChild) {
            container.firstElementChild.remove();
        }
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('fade-out'), 3000);
        setTimeout(() => toast.remove(), 3400);
        toast.addEventListener('click', () => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 250);
        });
    },
    firebaseMessages: {
        'auth/invalid-email': 'El correo no es válido. Revísalo e inténtalo de nuevo.',
        'auth/user-disabled': 'Tu cuenta fue desactivada. Contacta a un coordinador.',
        'auth/user-not-found': 'No encontramos una cuenta con ese correo. Verifícalo o regístrate.',
        'auth/wrong-password': 'La contraseña es incorrecta. Inténtalo de nuevo.',
        'auth/invalid-credential': 'El correo o la contraseña son incorrectos.',
        'auth/email-already-in-use': 'Ya existe una cuenta con este correo. Inicia sesión o usa otro.',
        'auth/weak-password': 'La contraseña es muy corta. Usa al menos 6 caracteres.',
        'auth/too-many-requests': 'Demasiados intentos. Espera un momento y vuelve a intentarlo.',
        'auth/network-request-failed': 'Problema de conexión. Revisa tu internet e inténtalo de nuevo.',
        'auth/requires-recent-login': 'Por seguridad, vuelve a iniciar sesión antes de continuar.',
        'auth/operation-not-allowed': 'Esta opción no está disponible por ahora.',
        'auth/account-exists-with-different-credential': 'Ya hay una cuenta con ese correo, pero con otro método de acceso.',
        'Invalid login credentials': 'El correo o la contraseña son incorrectos.',
        'Email not confirmed': 'Aún no confirmas tu correo. Revisa tu bandeja de entrada.',
        'User already registered': 'Ya existe una cuenta con este correo. Inicia sesión o usa otro.',
        'Password should be at least 6 characters': 'La contraseña es muy corta. Usa al menos 6 caracteres.',
        'Rate limit exceeded': 'Demasiados intentos. Espera un momento y vuelve a intentarlo.'
    },
    defaultError: 'Ocurrió un problema. Inténtalo de nuevo.',
    getErrorMessage: function(err) {
        const code = err && (err.code || err.name);
        if (err && err.message) console.error('[LUMEN]', err.code || '', err);
        if (code && this.firebaseMessages[code]) return this.firebaseMessages[code];
        if (err && err.message) {
            const key = Object.keys(this.firebaseMessages).find(k => err.message.includes(k));
            if (key) return this.firebaseMessages[key];
        }
        return this.defaultError;
    },
    hidePreloader: function() { document.getElementById('preloader').classList.add('hidden'); },
    
    toggleDarkMode: function() {
        try {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            document.documentElement.classList.toggle('dark-scheme', isDark);
            localStorage.setItem('lumen-theme', isDark ? 'dark' : 'light');
            const sunIcon = document.getElementById('theme-icon-sun');
            const moonIcon = document.getElementById('theme-icon-moon');
            if (sunIcon) sunIcon.style.display = isDark ? 'none' : 'block';
            if (moonIcon) moonIcon.style.display = isDark ? 'block' : 'none';
            const meta = document.querySelector('meta[name="theme-color"]');
            if (meta) meta.content = isDark ? '#0B0F19' : '#005F8A';
        } catch(e) { console.error("Error toggling dark mode", e); }
    },
    initDarkMode: function() {
        try {
            const savedTheme = localStorage.getItem('lumen-theme') || 'light';
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
                document.documentElement.classList.add('dark-scheme');
                const sunIcon = document.getElementById('theme-icon-sun');
                const moonIcon = document.getElementById('theme-icon-moon');
                if (sunIcon) sunIcon.style.display = 'none';
                if (moonIcon) moonIcon.style.display = 'block';
                const meta = document.querySelector('meta[name="theme-color"]');
                if (meta) meta.content = '#0B0F19';
            }
        } catch(e) { console.error("Error init dark mode", e); }
    },

    formatDate: function(dateStr) {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${mins}`;
    },

    // --- NUEVAS FUNCIONES UX/UI ---

    // Modal de Confirmación Elegante
    showConfirm: function(message) {
        return new Promise((resolve) => {
            document.getElementById('confirm-message').innerText = message;
            this.openModal('confirm-modal');
            
            const acceptBtn = document.getElementById('confirm-accept-btn');
            const newBtn = acceptBtn.cloneNode(true);
            acceptBtn.parentNode.replaceChild(newBtn, acceptBtn);
            newBtn.addEventListener('click', () => {
                this.closeModal('confirm-modal');
                resolve(true);
            });
        });
    },

    // Copiar al Portapapeles
    copyToClipboard: function(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('¡Copiado al portapapeles!', 'success');
        }).catch(err => {
            this.showToast('Error al copiar', 'error');
        });
    },

    // Estado de Carga en Botones
    setLoading: function(btn, text) {
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = `${text}...`;
        btn.disabled = true;
        btn.style.opacity = '0.7';
    },
    resetLoading: function(btn) {
        if (btn.dataset.originalText) {
            btn.innerHTML = btn.dataset.originalText;
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    },

    // Enmascaramiento de Inputs
    applyMasks: function() {
        const dateInput = document.getElementById('reg-birthdate');
        if (dateInput) {
            dateInput.addEventListener('input', function(e) {
                let v = e.target.value.replace(/\D/g, '').substring(0, 8);
                if (v.length > 4) v = v.substring(0,2) + '/' + v.substring(2,4) + '/' + v.substring(4);
                else if (v.length > 2) v = v.substring(0,2) + '/' + v.substring(2);
                e.target.value = v;
                const ageEl = document.getElementById('reg-age');
                if (v.length === 10 && ageEl) {
                    const age = LumenUI.ageFromBirthdate(v);
                    ageEl.value = age === '' ? '' : age;
                    LumenUI.toggleGuardianFields(v);
                }
            });
        }
        const phoneInputs = document.querySelectorAll('#reg-phone-user, #reg-phone, #reg-guardian-phone');
        phoneInputs.forEach(input => {
            input.addEventListener('input', function(e) {
                let v = e.target.value.replace(/\D/g, '').substring(0, 11);
                if (v.length > 4) v = v.substring(0,4) + '-' + v.substring(4,7) + '-' + v.substring(7);
                e.target.value = v;
            });
        });
    },

    // Actualizar Badge de Notificaciones
    updateNotifBadge: function() {
        const badge = document.getElementById('notif-badge');
        const drawerBadge = document.querySelector('.drawer-notif-badge');
        if (!LumenAuth.currentUser) return;
        
        const lastRead = parseInt(localStorage.getItem('lumen-last-read-notif') || 0);
        let unread = 0;
        if (LumenData.notifications) {
            LumenData.notifications.forEach(n => {
                if (n.timestamp > lastRead && (LumenAuth.isAdmin || n.for_admin === false)) unread++;
            });
        }
        const show = unread > 0;
        if (badge) { badge.style.display = show ? 'inline-block' : 'none'; badge.innerText = unread; }
        if (drawerBadge) { drawerBadge.style.display = show ? 'inline-block' : 'none'; drawerBadge.innerText = unread; }
    },

    // --- FIN NUEVAS FUNCIONES ---

    openRegistration: function(eventId) {
        const evento = LumenData.eventos.find(e => e.id === eventId);
        if (!evento) return;
        if (!this.requireMember()) return;
        const user = LumenAuth.userProfile;
        const userAge = parseInt(user.edad);

        if (evento.requisito_edad === 'mayor15' && userAge < 15) return this.showToast('Requisito: Mayores de 15 años.', 'error');
        if (evento.requisito_edad === 'mayor18' && userAge < 18) return this.showToast('Requisito: Mayores de 18 años.', 'error');
        if (evento.requisito_edad === 'rango_edad' && evento.requisito_min_edad && evento.requisito_max_edad) {
            if (userAge < parseInt(evento.requisito_min_edad) || userAge > parseInt(evento.requisito_max_edad)) {
                return this.showToast(`Requisito: Edad entre ${evento.requisito_min_edad} y ${evento.requisito_max_edad} años.`, 'error');
            }
        }
        if ((evento.requisito_edad === 'nacido_antes' || evento.requisito_edad === 'nacido_desde') && evento.requisito_fecha) {
            const parts = user.nacimiento.split('/');
            const birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
            const limitDate = new Date(evento.requisito_fecha);
            if (evento.requisito_edad === 'nacido_antes' && birthDate > limitDate) return this.showToast('Requisito: Nacidos antes de ' + evento.requisito_fecha, 'error');
            if (evento.requisito_edad === 'nacido_desde' && birthDate < limitDate) return this.showToast('Requisito: Nacidos desde ' + evento.requisito_fecha, 'error');
        }

        const uid = LumenAuth.currentUser.id;
        supabase.from('inscripciones').select('*').eq('evento_id', eventId).eq('user_id', uid).maybeSingle().then(({ data }) => {
            if (data) { this.showToast('Ya estás inscrito.', 'error'); } 
            else {
                document.getElementById('modal-title').innerText = `Inscripción: ${evento.titulo}`;
                const form = document.getElementById('registration-form');
                form.setAttribute('data-event-id', eventId);
                document.getElementById('reg-name').value = user.nombre || '';
                document.getElementById('reg-phone').value = user.telefono || '';
                this.openModal('registration-modal');
            }
        });
    },
    toggleGuardianFields: function(birthdateValue) {
        const age = this.ageFromBirthdate(birthdateValue);
        const guardianDiv = document.getElementById('guardian-fields');
        if (!guardianDiv) return;
        const guardianName = document.getElementById('reg-guardian-name');
        const guardianPhone = document.getElementById('reg-guardian-phone');
        if (age && age < 18) {
            guardianDiv.style.display = 'block';
            guardianName.setAttribute('required', 'true');
            guardianPhone.setAttribute('required', 'true');
        } else {
            guardianDiv.style.display = 'none';
            guardianName.removeAttribute('required');
            guardianPhone.removeAttribute('required');
        }
    },
    toggleFase2Fields: function() {
        const wantSi = document.getElementById('juvemar-want-si');
        const next = document.getElementById('reg-next');
        const submit = document.getElementById('reg-submit');
        if (wantSi && wantSi.checked) {
            this.wantsJuvemar = true;
            if (next) next.textContent = 'Siguiente';
            if (submit) submit.style.display = 'none';
        } else {
            this.wantsJuvemar = false;
            if (next) next.textContent = 'Crear Cuenta';
            if (submit) submit.style.display = 'none';
        }
    },
    toggleJuvemarTime: function() {
        const pertenece = document.getElementById('juvemar-status-pertenece');
        const timeWrap = document.getElementById('juvemar-time-wrap');
        if (timeWrap) timeWrap.style.display = (pertenece && pertenece.checked) ? 'block' : 'none';
    },
    toggleKerigmaFields: function() {
        const samuel = document.getElementById('kerigma-samuel');
        const otra = document.getElementById('kerigma-otra');
        const ninguna = document.getElementById('kerigma-ninguna');
        const samuelWrap = document.getElementById('samuel-parroquia-wrap');
        const otraWrap = document.getElementById('kerigma-otra-wrap');
        const subInputs = document.getElementById('kerigma-sub-inputs');
        const anyChecked = samuel.checked || otra.checked;
        
        // Mutua exclusión: "Ninguna" vs las demás
        if (ninguna && ninguna.checked) {
            if (samuel) samuel.checked = false;
            if (otra) otra.checked = false;
            document.getElementById('kerigma-emaus').checked = false;
        } else if (anyChecked || document.getElementById('kerigma-emaus').checked) {
            if (ninguna) ninguna.checked = false;
        }
        
        if (subInputs) subInputs.style.display = anyChecked ? 'block' : 'none';
        if (samuelWrap) samuelWrap.style.display = samuel.checked ? 'block' : 'none';
        if (otraWrap) otraWrap.style.display = otra.checked ? 'block' : 'none';
    },
    toggleSamuelEdition: function(value) { const show = (value === true || value === 'si' || value === true); document.getElementById('samuel-edition-wrap').style.display = show ? 'block' : 'none'; },

    // --- Asistente de Registro (2 fases) ---
    regStep: 0,
    wantsJuvemar: false,
    ageFromBirthdate: function(value) {
        const m = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (!m) return '';
        const dd = +m[1], mm = +m[2], yyyy = +m[3];
        if (mm < 1 || mm > 12 || dd < 1 || dd > new Date(yyyy, mm, 0).getDate()) return '';
        const today = new Date();
        const bd = new Date(yyyy, mm - 1, dd);
        if (bd > today) return '';
        let age = today.getFullYear() - yyyy;
        if (today.getMonth() + 1 < mm || (today.getMonth() + 1 === mm && today.getDate() < dd)) age--;
        return age;
    },
    registerNext: function() {
        const form = document.getElementById('register-form');
        if (!form) return;
        const steps = form.querySelectorAll('.reg-step');
        if (this.regStep >= steps.length - 1) return;

        if (this.regStep === 0) {
            if (!this.validateStep(0)) return;
            const wantSi = document.getElementById('juvemar-want-si');
            if (!wantSi || (!wantSi.checked && !document.getElementById('juvemar-want-no').checked)) {
                this.showToast('Selecciona si deseas formar parte de Juvemar.', 'error'); return;
            }
            this.wantsJuvemar = wantSi.checked;
            if (!this.wantsJuvemar) {
                this.submitRegister({ wantsJuvemar: false });
                return;
            }
            this.regStep = 1;
            this._renderRegister();
        } else if (this.regStep === 1) {
            if (!this.validateStep(1)) return;
            this.submitRegister({ wantsJuvemar: true });
        }
    },
    validateStep: function(stepIndex) {
        const form = document.getElementById('register-form');
        if (!form) return false;
        const step = form.querySelectorAll('.reg-step')[stepIndex];
        if (!step) return false;
        
        const inputs = step.querySelectorAll('input[required], select[required], textarea[required]');
        for (const input of inputs) {
            if (input.offsetParent === null) continue; // oculto, saltar
            if (!input.checkValidity()) {
                input.focus();
                this.showToast('Completa los campos obligatorios.', 'error');
                return false;
            }
        }
        // Validaciones extra por paso
        if (stepIndex === 0) {
            const wantSi = document.getElementById('juvemar-want-si');
            if (!wantSi || (!wantSi.checked && !document.getElementById('juvemar-want-no').checked)) {
                this.showToast('Selecciona si deseas formar parte de Juvemar.', 'error'); return false;
            }
        } else if (stepIndex === 1) {
            const sector = document.getElementById('reg-sector');
            if (!sector.value.trim()) { this.showToast('El sector es obligatorio.', 'error'); sector.focus(); return false; }
            const juvemarStatus = document.querySelector('input[name="juvemar-status"]:checked');
            if (!juvemarStatus) { this.showToast('Selecciona si eres nuevo o ya formas parte de Juvemar.', 'error'); return false; }
            if (juvemarStatus.value === 'Pertenece') {
                const timeText = document.getElementById('juvemar-time-text');
                if (!timeText.value) { this.showToast('Indica desde cuándo formas parte (Mes y Año).', 'error'); timeText.focus(); return false; }
            }
            const anySac = ['sac-bautismo', 'sac-comunion', 'sac-confirmacion', 'sac-ninguno'].some(id => { const el = document.getElementById(id); return el && el.checked; });
            if (!anySac) { this.showToast('Marca al menos un sacramento.', 'error'); return false; }
            const anyKerigma = document.querySelectorAll('#kerigma-grid input[name="kerigma"]:checked').length > 0;
            if (!anyKerigma) { this.showToast('Selecciona al menos una experiencia kerigmática.', 'error'); return false; }
            if (document.getElementById('kerigma-samuel').checked && document.getElementById('samuel-si').checked) {
                const edition = document.getElementById('samuel-edition-text').value.trim();
                if (!edition) { this.showToast('Indica la edición de Samuel.', 'error'); return false; }
            }
            if (document.getElementById('kerigma-otra').checked) {
                const otra = document.getElementById('kerigma-otra-text').value.trim();
                if (!otra) { this.showToast('Especifica la otra experiencia.', 'error'); return false; }
            }
        }
        return true;
    },
    registerPrev: function() {
        if (this.regStep <= 0) return;
        this.regStep--;
        this._renderRegister();
    },
    submitRegister: function(extra) {
        const form = document.getElementById('register-form');
        if (!form) return;
        if (document.getElementById('reg-pass').value !== document.getElementById('reg-pass2').value) {
            this.showToast('Las contraseñas no coinciden.', 'error'); return;
        }
        const data = this.collectRegisterData();
        data.wantsJuvemar = !!extra.wantsJuvemar;
        LumenAuth.register(data);
    },
    collectRegisterData: function() {
        const juvemarStatus = document.querySelector('input[name="juvemar-status"]:checked');
        const kerigmaChecked = Array.from(document.querySelectorAll('#kerigma-grid input[name="kerigma"]:checked')).map(c => c.value);
        
        // Nueva lógica: Samuel parroquia solo si Samuel kerigma está seleccionado
        const samuelKerigmaChecked = document.getElementById('kerigma-samuel').checked;
        const samuelParroquiaSi = document.getElementById('samuel-parroquia-si');
        const samuelParroquia = samuelKerigmaChecked && samuelParroquiaSi && samuelParroquiaSi.checked
            ? `Sí (Edición: ${document.getElementById('samuel-edition-text').value || 'No especificada'})`
            : (samuelKerigmaChecked ? 'No' : '');

        return {
            nombre: document.getElementById('reg-fullname').value.trim(),
            birthdate: document.getElementById('reg-birthdate').value.trim(),
            age: this.ageFromBirthdate(document.getElementById('reg-birthdate').value),
            phone: document.getElementById('reg-phone-user').value.trim(),
            email: document.getElementById('reg-email').value.trim().toLowerCase(),
            password: document.getElementById('reg-pass').value,
            sector: document.getElementById('reg-sector').value.trim() || '',
            guardianName: document.getElementById('reg-guardian-name').value.trim() || '',
            guardianPhone: document.getElementById('reg-guardian-phone').value.trim() || '',
            juvemarStatus: juvemarStatus ? juvemarStatus.value : 'Nuevo',
            juvemarTime: document.getElementById('juvemar-time-text').value || '',
            sacramentos: Array.from(document.querySelectorAll('input[name="sacramentos"]:checked')).map(c => c.value),
            kerigma: kerigmaChecked.join(', ') || 'Ninguna',
            kerigmaOtra: document.getElementById('kerigma-otra-text').value.trim() || '',
            samuelParroquia: samuelParroquia,
        };
    },
    _renderRegister: function() {
        const steps = document.querySelectorAll('#register-modal .reg-step');
        const items = document.querySelectorAll('#register-modal .reg-step-item');
        steps.forEach((s, i) => s.classList.toggle('active', i === this.regStep));
        items.forEach((it, i) => {
            it.classList.toggle('active', i === this.regStep);
            it.classList.toggle('done', i < this.regStep);
        });
        const prev = document.getElementById('reg-prev');
        const next = document.getElementById('reg-next');
        const submit = document.getElementById('reg-submit');
        const isLast = this.regStep === 1;
        if (prev) prev.style.display = this.regStep === 0 ? 'none' : 'inline-block';
        if (next) next.style.display = isLast ? 'none' : 'inline-block';
        if (submit) submit.style.display = isLast ? 'block' : 'none';
        const modal = document.querySelector('#register-modal .modal');
        if (modal) modal.scrollTop = 0;
    },
    _resetRegister: function() {
        this.toggleGuardianFields('');
        ['juvemar-time-wrap', 'samuel-parroquia-wrap', 'samuel-edition-wrap', 'kerigma-otra-wrap'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        const subInputs = document.getElementById('kerigma-sub-inputs');
        if (subInputs) subInputs.style.display = 'none';
        const hintWrap = document.getElementById('pass-hint-wrap');
        if (hintWrap) { hintWrap.hidden = true; hintWrap.classList.remove('hint-error', 'hint-ok'); }
        this.regStep = 0;
        this.wantsJuvemar = false;
        const wantNo = document.getElementById('juvemar-want-no');
        const wantSi = document.getElementById('juvemar-want-si');
        if (wantNo) wantNo.checked = false;
        if (wantSi) wantSi.checked = false;
        // NO tocar display de steps; CSS .active lo maneja
        const stepperItem2 = document.querySelectorAll('#register-modal .reg-step-item')[1];
        if (stepperItem2) stepperItem2.style.display = 'none';
        this._renderRegister();
    },
    openJuvemarJoin: function() {
        if (!LumenAuth.currentUser) { LumenUI.openModal('register-modal'); return; }
        if (LumenAuth.isMember) { this.showToast('Ya eres miembro de Juvemar.', 'info'); return; }
        this.openModal('register-modal');
        const step0 = document.getElementById('reg-step-0');
        const step1 = document.getElementById('reg-step-1');
        if (step0) step0.style.display = 'none';
        if (step1) step1.style.display = 'block';
        const stepperItem1 = document.querySelectorAll('#register-modal .reg-step-item')[0];
        const stepperItem2 = document.querySelectorAll('#register-modal .reg-step-item')[1];
        if (stepperItem1) stepperItem1.classList.add('done');
        if (stepperItem2) stepperItem2.classList.add('active');
        this.regStep = 1;
        this.wantsJuvemar = true;
        const profile = LumenAuth.userProfile || {};
        const prefill = (id, val) => { const el = document.getElementById(id); if (el && val) { el.value = val; el.setAttribute('readonly', 'true'); el.style.opacity = '0.7'; } };
        prefill('reg-fullname', profile.nombre);
        prefill('reg-birthdate', profile.nacimiento);
        prefill('reg-phone-user', profile.telefono);
        prefill('reg-email', profile.email);
        document.getElementById('reg-pass').removeAttribute('readonly');
        document.getElementById('reg-pass2').removeAttribute('readonly');
        document.getElementById('reg-pass').style.opacity = '1';
        document.getElementById('reg-pass2').style.opacity = '1';
        document.getElementById('juvemar-want-si').checked = true;
        document.getElementById('juvemar-want-no').checked = false;
        const next = document.getElementById('reg-next');
        const submit = document.getElementById('reg-submit');
        if (next) next.style.display = 'none';
        if (submit) submit.style.display = 'block';
        const modal = document.querySelector('#register-modal .modal');
        if (modal) modal.scrollTop = 0;
    },
    toggleForgotPassword: function(show) { document.getElementById('login-view').style.display = show ? 'none' : 'block'; document.getElementById('forgot-password-view').style.display = show ? 'block' : 'none'; },
    // Función para el Menú Lateral Móvil
    toggleDrawer: function() {
        document.getElementById('side-drawer').classList.toggle('active');
        document.getElementById('drawer-overlay').classList.toggle('active');
    },

    initDrawerGestures: function() {
        const drawer = document.getElementById('side-drawer');
        const overlay = document.getElementById('drawer-overlay');
        if (!drawer || !overlay) return;
        let startX = 0, currentX = 0, dragging = false;

        const onStart = (e) => {
            if (!drawer.classList.contains('active')) return;
            startX = e.clientX;
            currentX = startX;
            dragging = false;
        };
        const onMove = (e) => {
            if (!drawer.classList.contains('active')) return;
            currentX = e.clientX;
            let diff = startX - currentX;
            if (!dragging && Math.abs(diff) < 8) return; // espera a movimiento real
            dragging = true;
            if (diff < 0) diff = 0; // no tirar del borde derecho
            drawer.style.transition = 'none';
            drawer.style.transform = `translateX(${-diff}px)`;
        };
        const onEnd = () => {
            if (!drawer.classList.contains('active') || !dragging) return;
            drawer.style.transition = '';
            drawer.style.transform = '';
            if (startX - currentX > 80) {
                this.toggleDrawer();
            }
            dragging = false;
        };

        drawer.addEventListener('pointerdown', onStart);
        drawer.addEventListener('pointermove', onMove);
        drawer.addEventListener('pointerup', onEnd);
        drawer.addEventListener('pointercancel', onEnd);
    },

};

document.addEventListener('click', (e) => { if (e.target.closest('.btn, .nav-link, .modal-close, .tab-btn, .checkbox-item, .admin-tab, .poll-option, .dropdown-trigger')) LumenUI.playSound(); });
function safeListener(id, type, handler) { const el = document.getElementById(id); if (el) el.addEventListener(type, handler); }

safeListener('registration-form', 'submit', function(e) {
    e.preventDefault();
    const eventId = this.getAttribute('data-event-id');
    const name = document.getElementById('reg-name').value;
    const phone = document.getElementById('reg-phone').value;
    const uid = LumenAuth.currentUser.id;
    const eventTitle = document.getElementById('modal-title').innerText.replace('Inscripción: ', '');
    const submitBtn = this.querySelector('button[type="submit"]');
    
    LumenUI.setLoading(submitBtn, 'Inscribiendo');

    supabase.from('inscripciones').insert({ evento_id: eventId, user_id: uid, nombre: name, telefono: phone, fecha: new Date().toISOString() })
      .then(({ error }) => {
          if (error) throw error;
          if (typeof LumenPush !== 'undefined' && LumenPush.enviarPush) {
              LumenPush.enviarPush({ mode: 'self', title: '¡Inscripción confirmada!', body: `Te has inscrito a "${eventTitle}". Recibirás un recordatorio antes de que comience.`, url: '/actividades' });
          }
          return fetch('https://formsubmit.co/ajax/juvemar08@gmail.com', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ _subject: `Nueva Inscripción: ${eventTitle}`, name: name, phone: phone, message: `${name} se ha inscrito a "${eventTitle}". Tel: ${phone}` }) });
      })
      .then(response => response.json())
      .then(() => { 
          LumenUI.closeModal('registration-modal'); 
          LumenUI.resetLoading(submitBtn);
          LumenUI.showToast(`¡Inscripción exitosa, ${name}!`, 'success'); 
      })
      .catch(err => { 
          LumenUI.resetLoading(submitBtn);
          LumenUI.showToast(LumenUI.getErrorMessage(err), 'error');
      });
});

safeListener('login-form', 'submit', function(e) { e.preventDefault(); LumenAuth.login(document.getElementById('login-email').value, document.getElementById('login-password').value); });
safeListener('forgot-form', 'submit', function(e) { e.preventDefault(); LumenAuth.resetPassword(document.getElementById('forgot-email').value); });

safeListener('register-form', 'submit', function(e) {
    e.preventDefault();
    const form = document.getElementById('register-form');
    const steps = form.querySelectorAll('.reg-step');
    const cur = Array.prototype.findIndex.call(steps, s => s.classList.contains('active'));
    if (cur < 1) { LumenUI.registerNext(); return; }
    const data = LumenUI.collectRegisterData();
    data.wantsJuvemar = LumenUI.wantsJuvemar;
    if (data.password !== document.getElementById('reg-pass2').value) {
        LumenUI.showToast('Las contraseñas no coinciden. Revísalas.', 'error');
        return;
    }
    LumenAuth.register(data);
});

// Comentario en vivo de contraseñas del registro
function initRegisterPasswordHint() {
    const p1 = document.getElementById('reg-pass');
    const p2 = document.getElementById('reg-pass2');
    const wrap = document.getElementById('pass-hint-wrap');
    const hint = document.getElementById('pass-hint');
    if (!p1 || !p2 || !wrap || !hint) return;
    function update() {
        const a = p1.value, b = p2.value;
        if (b && a !== b) {
            wrap.hidden = false; wrap.classList.add('hint-error'); wrap.classList.remove('hint-ok');
            hint.textContent = 'Las contraseñas no coinciden.';
        } else if (a && a.length < 6) {
            wrap.hidden = false; wrap.classList.add('hint-error'); wrap.classList.remove('hint-ok');
            hint.textContent = 'La contraseña debe tener al menos 6 caracteres.';
        } else if (a && b) {
            wrap.hidden = false; wrap.classList.add('hint-ok'); wrap.classList.remove('hint-error');
            hint.textContent = 'Las contraseñas coinciden.';
        } else {
            wrap.hidden = true; wrap.classList.remove('hint-error', 'hint-ok');
        }
    }
    p1.addEventListener('input', update);
    p2.addEventListener('input', update);
}

// Cerrar modales con Escape y click fuera del panel
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const open = document.querySelectorAll('.modal-overlay.active');
        if (open.length) LumenUI.closeModal(open[open.length - 1].id);
    }
});
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList && e.target.classList.contains('modal-overlay') && e.target.id !== 'confirm-modal') {
        LumenUI.closeModal(e.target.id);
    }
});
LumenUI.regStep = 0;
initRegisterPasswordHint();

// Aplicar máscaras cuando el modal de registro se abre
const registerObserver = new MutationObserver(() => { if (document.getElementById('register-modal').classList.contains('active')) LumenUI.applyMasks(); });
registerObserver.observe(document.getElementById('register-modal'), { attributes: true });

/* ============================================
   NÚCLEO INMERSIVO: lector, favoritos, liturgia, racha
   ============================================ */
Object.assign(LumenUI, {

    // ---- Preferencias de lectura (Aa) ----
    _lectorKey: 'lumen-reader',
    loadReader: function() {
        try { return JSON.parse(localStorage.getItem(this._lectorKey)) || this._lectorDefault(); }
        catch (e) { return this._lectorDefault(); }
    },
    _lectorDefault: function() { return { fontSize: 17, serif: true }; },
    saveReader: function(p) { localStorage.setItem(this._lectorKey, JSON.stringify(p)); },
    applyReaderPrefs: function() {
        const p = this.loadReader();
        const fuente = p.serif ? "'Crimson Text', Georgia, serif" : "'Poppins', system-ui, sans-serif";
        document.querySelectorAll('.reading-surface').forEach(function(el) {
            el.style.setProperty('--lector-tam', p.fontSize + 'px');
            el.style.setProperty('--lector-fuente', fuente);
        });
    },
    readerFontSize: function(delta) {
        const p = this.loadReader();
        p.fontSize = Math.max(15, Math.min(23, (p.fontSize || 17) + delta));
        this.saveReader(p);
        this.applyReaderPrefs();
    },
    toggleReaderFont: function() {
        const p = this.loadReader();
        p.serif = !p.serif;
        this.saveReader(p);
        this.applyReaderPrefs();
    },
    readerToolbarHTML: function() {
        return `<div class="reader-toolbar" role="group" aria-label="Ajustes de lectura">
            <span class="reader-name">Aa</span>
            <button class="reader-btn" onclick="LumenUI.readerFontSize(-1)" aria-label="Reducir texto">A−</button>
            <button class="reader-btn" onclick="LumenUI.readerFontSize(1)" aria-label="Aumentar texto">A+</button>
            <button class="reader-btn" onclick="LumenUI.toggleReaderFont()" aria-label="Cambiar tipografía">Serif</button>
        </div>`;
    },

    // ---- Favoritos ----
    _favKey: 'lumen-favorites',
    _favId: function(kind, id) { return kind + '::' + id; },
    isFavorite: function(kind, id) {
        try { return !!JSON.parse(localStorage.getItem(this._favKey))[this._favId(kind, id)]; }
        catch (e) { return false; }
    },
    toggleFavorite: function(kind, id, title, sub) {
        let store = {};
        try { store = JSON.parse(localStorage.getItem(this._favKey)) || {}; } catch (e) {}
        const key = this._favId(kind, id);
        if (store[key]) {
            delete store[key];
            this.showToast('Quitado de favoritos', 'error');
        } else {
            store[key] = { kind: kind, id: id, title: title || 'Sin título', sub: sub || '' };
            this.showToast('Añadido a favoritos', 'success');
        }
        localStorage.setItem(this._favKey, JSON.stringify(store));
        return !!store[key];
    },
    removeFavorite: function(key) {
        let store = {};
        try { store = JSON.parse(localStorage.getItem(this._favKey)) || {}; } catch (e) {}
        delete store[key];
        localStorage.setItem(this._favKey, JSON.stringify(store));
    },
    getFavorites: function() {
        try { return JSON.parse(localStorage.getItem(this._favKey)) || {}; } catch (e) { return {}; }
    },
    // Escapa contenido para incrustarlo seguro dentro de onclick="..." (heredan título/sub con comillas).
    _escJson: function(str) {
        return JSON.stringify(str === undefined ? '' : str).replace(/"/g, '&quot;');
    },
    favHeart: function(kind, id) {
        return `<button class="fav-btn ${this.isFavorite(kind, id) ? 'on' : ''}" onclick="LumenUI.toggleFavorite('${kind}','${id}','${String(kind).replace(/'/g, '')}')" aria-label="Favorito">♥</button>`;
    },

    // ---- Tiempo litúrgico ----
    _easter: function(year) {
        const a = year % 19, b = Math.floor(year / 100), c = year % 100,
            d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3),
            h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4,
            l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
        return new Date(year, Math.floor((h + l - 7 * m + 114) / 31) - 1, (h + l - 7 * m + 114) % 31 + 1);
    },
    liturgicalInfo: function(date) {
        date = date || new Date();
        const y = date.getFullYear();
        const ea = this._easter(y);
        const day = (new Date(y, 0, 1));
        const navidad = new Date(y, 11, 25);
        const adviento = new Date(y, 10, 27);
        const ash = new Date(ea.getFullYear(), ea.getMonth(), ea.getDate() - 46);
        const pent = new Date(ea.getFullYear(), ea.getMonth(), ea.getDate() + 49);
        const navFin = new Date(y, 0, 13);
        const t = date.getTime();
        let seasonId = 'ordinario', label = 'Tiempo Ordinario', cls = 'lit-verde', color = '#22c55e';
        if (t >= adviento.getTime() && t < navidad.getTime()) { seasonId = 'adviento'; label = 'Adviento'; cls = 'lit-morado'; color = '#8b5cf6'; }
        else if (t >= navidad.getTime() && t < navFin.getTime()) { seasonId = 'navidad'; label = 'Navidad'; cls = 'lit-blanco'; color = '#f8fafc'; }
        else if (t >= ash.getTime() && t < ea.getTime()) { seasonId = 'cuaresma'; label = 'Cuaresma'; cls = 'lit-morado'; color = '#8b5cf6'; }
        else if (t >= ea.getTime() && t < pent.getTime()) { seasonId = 'pascua'; label = 'Pascua'; cls = 'lit-blanco'; color = '#f8fafc'; }
        return { seasonId: seasonId, label: label, cls: cls, color: color };
    },
    liturgicalBadgeHTML: function() {
        const info = this.liturgicalInfo(new Date());
        return `<span class="liturgical-badge ${info.cls}" title="Tiempo litúrgico"><span class="lit-dot" style="background:${info.color}"></span>${info.label}</span>`;
    },

    // ---- Racha diaria ----
    _streakKey: 'lumen-streak',
    _dayKey: function(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
    streakInfo: function() {
        let s = null;
        try { s = JSON.parse(localStorage.getItem(this._streakKey)); } catch (e) {}
        if (!s) return { days: 0, today: false };
        const today = this._dayKey();
        const y = new Date(); y.setDate(y.getDate() - 1);
        const yesterday = this._dayKey(y);
        return { days: s.days, today: (s.last === today), streakAlive: (s.last === today || s.last === yesterday) };
    },
    recordStreak: function() {
        const today = this._dayKey();
        let s = { last: today, days: 1 };
        try { s = JSON.parse(localStorage.getItem(this._streakKey)) || s; } catch (e) {}
        if (s.last === today) return { days: s.days, newDay: false };
        const y = new Date(); y.setDate(y.getDate() - 1);
        if (s.last === this._dayKey(y)) { s.days += 1; } else { s.days = 1; }
        s.last = today;
        localStorage.setItem(this._streakKey, JSON.stringify(s));
        return { days: s.days, newDay: true };
    },
    streakChipHTML: function() {
        const info = this.streakInfo();
        if (!info.days) return '';
        return `<span class="streak-chip" title="Días seguidos en LUMEN">${LumenIcons.racha} ${info.days} día${info.days === 1 ? '' : 's'}</span>`;
    },

    // ---- Celebración de logro ----
    celebrate: function(title, msg) {
        const card = document.createElement('div');
        card.className = 'celebrate-overlay';
        card.innerHTML = `<div class="celebrate-card"><div class="sparkle sparkle-1">✦</div><div class="sparkle sparkle-2">✦</div><div class="sparkle sparkle-3">✦</div><div class="sparkle sparkle-4">✦</div><h3>${this.escapeHTML(title)}</h3><p>${this.escapeHTML(msg || '')}</p><button class="btn btn-primary" onclick="this.closest('.celebrate-overlay').remove()">¡Amén!</button></div>`;
        document.body.appendChild(card);
    },

    // ---- Descarga PNG / impresión ----
    exportPng: function(el, name) {
        if (window.html2canvas) {
            html2canvas(el, { backgroundColor: '#ffffff', scale: 2 }).then(function(canvas) {
                const a = document.createElement('a');
                a.download = name || 'imagen.png';
                a.href = canvas.toDataURL('image/png');
                a.click();
            });
        } else {
            window.print();
        }
    }
});

LumenUI.applyReaderPrefs();