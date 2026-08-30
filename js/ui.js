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
    openModal: function(modalId) { document.getElementById(modalId).classList.add('active'); },
    closeModal: function(modalId) {
        document.getElementById(modalId).classList.remove('active');
        const form = document.querySelector(`#${modalId} form`);
        if (form) form.reset();
        if (modalId === 'register-modal') document.getElementById('guardian-fields').style.display = 'none';
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
    toggleGuardianFields: function(age) {
        const guardianDiv = document.getElementById('guardian-fields');
        if (!guardianDiv) return;
        const guardianName = document.getElementById('reg-guardian-name');
        const guardianPhone = document.getElementById('reg-guardian-phone');
        if (parseInt(age) < 18) {
            guardianDiv.style.display = 'block';
            guardianName.setAttribute('required', 'true');
            guardianPhone.setAttribute('required', 'true');
        } else {
            guardianDiv.style.display = 'none';
            guardianName.removeAttribute('required');
            guardianPhone.removeAttribute('required');
        }
    },
    toggleJuvemarFields: function() { const juvemarSi = document.getElementById('juvemar-si'); const timeWrap = document.getElementById('juvemar-time-wrap'); if(timeWrap) timeWrap.style.display = juvemarSi.checked ? 'block' : 'none'; },
    toggleKerigmaFields: function() { const samuelRadio = document.getElementById('kerigma-samuel'); const otraRadio = document.getElementById('kerigma-otra'); const samuelWrap = document.getElementById('samuel-parroquia-wrap'); const otraWrap = document.getElementById('kerigma-otra-wrap'); if(samuelWrap) samuelWrap.style.display = samuelRadio.checked ? 'block' : 'none'; if(otraWrap) otraWrap.style.display = otraRadio.checked ? 'block' : 'none'; },
    toggleSamuelEdition: function(isChecked) { document.getElementById('samuel-edition-wrap').style.display = isChecked ? 'block' : 'none'; },
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
    const name = document.getElementById('reg-fullname').value;
    const age = document.getElementById('reg-age').value;
    const birthdate = document.getElementById('reg-birthdate').value;
    const address = document.getElementById('reg-sector').value;
    const phone = document.getElementById('reg-phone-user').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;

    let juvemarStatus = "No respondió", juvemarTime = "";
    const selectedJuvemar = document.querySelector('input[name="juvemar-status"]:checked');
    if (selectedJuvemar) { juvemarStatus = selectedJuvemar.value; if (juvemarStatus === "Pertenece") juvemarTime = document.getElementById('juvemar-time-text').value; }

    const sacramentos = [];
    if (document.getElementById('sac-bautismo').checked) sacramentos.push("Bautismo");
    if (document.getElementById('sac-comunion').checked) sacramentos.push("Primera comunión");
    if (document.getElementById('sac-confirmacion').checked) sacramentos.push("Confirmación");
    if (document.getElementById('sac-ninguno').checked) sacramentos.push("Ninguno");

    let kerigma = "No respondió", kerigma_otra = "", samuel_parroquia = "";
    const selectedKerigma = document.querySelector('input[name="kerigma"]:checked');
    if (selectedKerigma) {
        kerigma = selectedKerigma.value;
        if (kerigma === "Otra experiencia") kerigma_otra = document.getElementById('kerigma-otra-text').value;
        if (kerigma === "Samuel") {
            const samuelCheck = document.getElementById('samuel-si');
            if (samuelCheck.checked) { const editionText = document.getElementById('samuel-edition-text').value; samuel_parroquia = `Si (Edición: ${editionText || 'No especificada'})`; } 
            else samuel_parroquia = "No respondió si lo hizo en la parroquia";
        }
    }

    let guardianName = '', guardianPhone = '';
    if (parseInt(age) < 18) { guardianName = document.getElementById('reg-guardian-name').value; guardianPhone = document.getElementById('reg-guardian-phone').value; }
    if (pass !== document.getElementById('reg-pass2').value) {
        LumenUI.showToast('Las contraseñas no coinciden. Revísalas.', 'error');
        return;
    }
    LumenAuth.register(name, age, birthdate, address, phone, juvemarStatus, juvemarTime, sacramentos, kerigma, kerigma_otra, samuel_parroquia, email, pass, guardianName, guardianPhone);
});

// Aplicar máscaras cuando el modal de registro se abre
const registerObserver = new MutationObserver(() => { if (document.getElementById('register-modal').classList.contains('active')) LumenUI.applyMasks(); });
registerObserver.observe(document.getElementById('register-modal'), { attributes: true });