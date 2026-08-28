const LumenAuth = {
    isAdmin: false, currentUser: null, userProfile: null,
    get isMember() {
        return this.userProfile && ['miembro', 'admin'].includes(this.userProfile.role);
    },
    get isCoordinator() {
        return this.isAdmin;
    },
    init: function() {
        auth.onAuthStateChanged(user => {
            if (user) {
                this.currentUser = user;
                db.ref('users/' + user.uid).on('value', (snap) => {
                    this.userProfile = snap.val();
                    if (this.userProfile && this.userProfile.status === 'pending') { 
                        LumenUI.showToast('Tu cuenta está en espera de aprobación.', 'error'); 
                        auth.signOut(); return; 
                    }
                    this.isAdmin = this.userProfile && this.userProfile.role === 'admin' && this.userProfile.status === 'approved';
                    this.updateUI();
                    LumenRouter.navigateTo(LumenRouter.currentView);
                });
            } else {
                this.currentUser = null; this.userProfile = null; this.isAdmin = false;
                this.updateUI();
                let v = LumenRouter.currentView;
                if (['perfil', 'gestion', 'encuestas', 'intenciones', 'notificaciones', 'recursos'].includes(v)) v = 'landing';
                LumenRouter.navigateTo(v);
            }
        });
    },
    updateUI: function() {
        const userDataZone = document.getElementById('user-data-zone');
        const adminLink = document.getElementById('admin-nav-link');
        const notifLink = document.getElementById('notificaciones-nav-link');
        const intencionesLink = document.getElementById('intenciones-nav-link');
        const encuestasLink = document.getElementById('encuestas-nav-link');
        const recursosLink = document.getElementById('recursos-nav-link');
        const drawerAdminLink = document.getElementById('drawer-admin-link');
        const drawerNotifLink = document.getElementById('drawer-notif-link');
        const drawerIntencionesLink = document.getElementById('drawer-intenciones-link');
        const drawerEncuestasLink = document.getElementById('drawer-encuestas-link');
        const drawerRecursosLink = document.getElementById('drawer-recursos-link');
        
        if (this.currentUser) {
            const picUrl = this.userProfile?.photoURL || `https://via.placeholder.com/100/005F8A/ffffff?text=${this.userProfile?.nombre ? this.userProfile.nombre.charAt(0) : 'L'}`;
            userDataZone.innerHTML = `<div class="user-profile-btn" onclick="LumenRouter.navigateTo('perfil')"><img src="${picUrl}" alt="Perfil"><span>${this.userProfile?.nombre || 'Usuario'}</span></div>`;
            
            const isMember = this.isMember;

            adminLink.style.display = this.isAdmin ? 'block' : 'none';
            if(drawerAdminLink) drawerAdminLink.style.display = this.isAdmin ? 'block' : 'none';
            
            // Recursos y Avisos solo para miembros de Juvemar
            notifLink.style.display = isMember ? 'block' : 'none';
            if(drawerNotifLink) drawerNotifLink.style.display = isMember ? 'block' : 'none';
            if(recursosLink) recursosLink.style.display = isMember ? 'block' : 'none';
            if(drawerRecursosLink) drawerRecursosLink.style.display = isMember ? 'block' : 'none';
            encuestasLink.style.display = 'block';
            if(drawerEncuestasLink) drawerEncuestasLink.style.display = 'block';
            intencionesLink.style.display = 'block';
            if(drawerIntencionesLink) drawerIntencionesLink.style.display = 'block';
        } else {
            userDataZone.innerHTML = `<button class="btn btn-primary" onclick="LumenUI.openModal('login-modal')">Iniciar Sesión</button>`;
            adminLink.style.display = 'none'; 
            if(drawerAdminLink) drawerAdminLink.style.display = 'none';
            notifLink.style.display = 'none';
            if(drawerNotifLink) drawerNotifLink.style.display = 'none';
            intencionesLink.style.display = 'block';
            if(drawerIntencionesLink) drawerIntencionesLink.style.display = 'block';
            encuestasLink.style.display = 'none';
            if(drawerEncuestasLink) drawerEncuestasLink.style.display = 'none';
            if(recursosLink) recursosLink.style.display = 'none';
            if(drawerRecursosLink) drawerRecursosLink.style.display = 'none';
        }
    },
    login: function(email, password) { auth.signInWithEmailAndPassword(email, password).then(() => { LumenUI.closeModal('login-modal'); LumenUI.showToast('Sesión iniciada', 'success'); }).catch(err => LumenUI.showToast(LumenUI.getErrorMessage(err), 'error')); },
    resetPassword: function(email) { auth.sendPasswordResetEmail(email).then(() => { LumenUI.showToast('Enlace enviado.', 'success'); LumenUI.toggleForgotPassword(false); }).catch(err => LumenUI.showToast(LumenUI.getErrorMessage(err), 'error')); },
    register: function(name, age, birthdate, address, phone, juvemarStatus, juvemarTime, sacramentos, kerigma, kerigma_otra, samuel_parroquia, email, password, guardianName, guardianPhone) {
        auth.createUserWithEmailAndPassword(email, password).then(userCredential => {
            const uid = userCredential.user.uid;
            
            // Si es nuevo, es global (aprobado). Si pertenece, es miembro (pendiente)
            const role = juvemarStatus === 'Pertenece' ? 'miembro' : 'global';
            const status = juvemarStatus === 'Pertenece' ? 'pending' : 'approved';

            const userData = { 
                nombre: name, edad: age, nacimiento: birthdate, direccion: address, telefono: phone, 
                juvemar_status: juvemarStatus, juvemar_tiempo: juvemarTime, sacramentos: sacramentos, 
                kerigma: kerigma, kerigma_otra: kerigma_otra, samuel_parroquia: samuel_parroquia, 
                email: email, role: role, status: status 
            };
            if (parseInt(age) < 18) { userData.representante_nombre = guardianName; userData.representante_telefono = guardianPhone; }
            
            db.ref('users/' + uid).set(userData);
            
            if (role === 'miembro') {
                fetch('https://formsubmit.co/ajax/juvemar08@gmail.com', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ _subject: `Nuevo Registro Juvemar: ${name}`, email: email, message: `${name} requiere aprobación.` }) }).catch(err => console.error(err));
                LumenData.saveNotification(`Nuevo registro Juvemar: ${name} requiere aprobación.`, true);
                LumenUI.showToast("Registro exitoso. Espera aprobación del coordinador.", 'success');
            } else {
                LumenUI.showToast("¡Bienvenido a LUMEN! Ya puedes explorar la plataforma.", 'success');
            }
            
            auth.signOut(); 
            LumenUI.closeModal('register-modal');
        }).catch(err => LumenUI.showToast(LumenUI.getErrorMessage(err), 'error'));
    },
    logout: function() { auth.signOut(); LumenUI.showToast('Sesión cerrada', 'success'); },
    deleteAccount: function() {
        if (!this.currentUser) return;
        LumenUI.showConfirm("¿Seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.").then(confirmed => {
            if(confirmed) {
                const uid = this.currentUser.uid;
                db.ref('users/' + uid).remove().then(() => this.currentUser.delete()).then(() => {
                    LumenUI.showToast("Cuenta eliminada.", "success");
                    this.currentUser = null; this.userProfile = null; this.isAdmin = false;
                    this.updateUI(); LumenRouter.navigateTo('landing');
                }).catch(err => LumenUI.showToast(LumenUI.getErrorMessage(err), "error"));
            }
        });
    },
    requestAdmin: function() {
        if (!this.currentUser) return;
        if (this.userProfile.role !== 'miembro') {
            return LumenUI.showToast('Debes ser miembro activo de Juvemar para solicitar ser coordinador.', 'error');
        }
        fetch('https://formsubmit.co/ajax/juvemar08@gmail.com', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ _subject: `Solicitud Admin LUMEN`, email: this.currentUser.email, message: `${this.userProfile.nombre} solicita ser admin. UID: ${this.currentUser.uid}` }) })
        .then(() => { LumenUI.showToast('Solicitud enviada.', 'success'); LumenData.saveNotification(`${this.userProfile.nombre} solicitó ser coordinador.`, true); })
        .catch(() => LumenUI.showToast('Error al enviar', 'error'));
    },
    requestJuvemarMembership: function() {
        if (!this.currentUser || this.userProfile.role !== 'global') return;
        LumenUI.showConfirm("¿Deseas solicitar el ingreso a Juvemar? Un coordinador revisará tu solicitud.").then(confirmed => {
            if(confirmed) {
                db.ref('users/' + this.currentUser.uid).update({ role: 'miembro', status: 'pending' }).then(() => {
                    LumenData.saveNotification(`${this.userProfile.nombre} solicitó ingresar a Juvemar.`, true);
                    LumenUI.showToast('Solicitud enviada. Tu cuenta quedará en espera hasta ser aprobada.', 'success');
                    auth.signOut();
                });
            }
        });
    }
};