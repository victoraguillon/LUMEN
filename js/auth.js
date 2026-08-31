const LumenAuth = {
    isAdmin: false, currentUser: null, userProfile: null, _unsub: null,
    get isMember() {
        return this.userProfile && ['miembro', 'admin'].includes(this.userProfile.role);
    },
    get isCoordinator() {
        return this.isAdmin;
    },
    init: function() {
        this.updateUI();
        supabase.auth.onAuthStateChange((event, session) => {
            const user = session?.user || null;
            if (user) {
                this.currentUser = user;
                this.loadProfile(user);
            } else {
                this.currentUser = null; this.userProfile = null; this.isAdmin = false;
                this.updateUI();
                let v = LumenRouter.currentView;
                if (['perfil', 'gestion', 'encuestas', 'intenciones', 'notificaciones', 'recursos'].includes(v)) v = 'landing';
                LumenRouter.navigateTo(v);
            }
        });
    },
    loadProfile: function(user) {
        supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()
            .then(({ data, error }) => {
                if (error) { console.error('[LUMEN] getProfile', error); return; }
                const profile = data;
                this.userProfile = profile || null;
                if (profile && profile.status === 'pending') {
                    LumenUI.showToast('Tu cuenta está en espera de aprobación.', 'error');
                    supabase.auth.signOut(); return;
                }
                this.isAdmin = !!(profile && profile.role === 'admin' && profile.status === 'approved');
                this.updateUI();
                LumenRouter.navigateTo(LumenRouter.currentView);
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
            const avatarLetter = this.userProfile?.nombre ? this.userProfile.nombre.charAt(0) : 'L';
            const picUrl = this.userProfile?.photo_url ? encodeURI(this.userProfile.photo_url) : `https://via.placeholder.com/100/005F8A/ffffff?text=${encodeURIComponent(avatarLetter)}`;
            userDataZone.innerHTML = `<div class="user-profile-btn" onclick="LumenRouter.navigateTo('perfil')"><img src="${picUrl}" alt="Perfil"><span>${LumenUI.escapeHTML(this.userProfile?.nombre || 'Usuario')}</span></div>`;
            
            const isMember = this.isMember;

            adminLink.style.display = this.isAdmin ? 'block' : 'none';
            if(drawerAdminLink) drawerAdminLink.style.display = this.isAdmin ? 'block' : 'none';
            
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
    login: function(email, password) {
        return supabase.auth.signInWithPassword({ email, password })
            .then(({ error }) => {
                if (error) throw error;
                LumenUI.closeModal('login-modal');
                LumenUI.showToast('Sesión iniciada', 'success');
            })
            .catch(err => LumenUI.showToast(LumenUI.getErrorMessage(err), 'error'));
    },
    resetPassword: function(email) {
        return supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
            .then(() => { LumenUI.showToast('Enlace enviado.', 'success'); LumenUI.toggleForgotPassword(false); })
            .catch(err => LumenUI.showToast(LumenUI.getErrorMessage(err), 'error'));
    },
    register: function(data) {
        const wantsJuvemar = !!data.wantsJuvemar;
        const juvemarStatus = wantsJuvemar ? (data.juvemarStatus || 'Nuevo') : 'No';
        const role = wantsJuvemar ? 'miembro' : 'global';
        const status = wantsJuvemar ? 'pending' : 'approved';

        const userData = {
            nombre: data.nombre, edad: data.age, nacimiento: data.birthdate, direccion: data.sector, telefono: data.phone,
            juvemar_status: juvemarStatus, juvemar_tiempo: data.juvemarTime || '', sacramentos: data.sacramentos || [],
            kerigma: data.kerigma, kerigma_otra: data.kerigmaOtra || '', samuel_parroquia: data.samuelParroquia || '',
            email: data.email, role: role, status: status
        };
        if (data.age && parseInt(data.age) < 18) { userData.representante_nombre = data.guardianName; userData.representante_telefono = data.guardianPhone; }

        return supabase.auth.signUp({ email: data.email, password: data.password })
            .then(({ data: authData, error }) => {
                if (error) throw error;
                const uid = authData.user && authData.user.id;
                if (uid) {
                    return supabase.from('profiles').update({ ...userData, email: data.email })
                        .eq('id', uid)
                        .then(() => ({ data: authData }));
                }
                return { data: authData };
            })
            .then(({ data: authData }) => {
                if (wantsJuvemar) {
                    fetch('https://formsubmit.co/ajax/juvemar08@gmail.com', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ _subject: `Nuevo Registro Juvemar: ${data.nombre}`, email: data.email, message: `${data.nombre} requiere aprobación.` }) }).catch(err => console.error(err));
                    LumenData.saveNotification(`Nuevo registro Juvemar: ${data.nombre} requiere aprobación.`, false);
                    LumenUI.showToast("Registro exitoso. Espera aprobación del coordinador.", 'success');
                } else {
                    LumenUI.showToast("¡Bienvenido a LUMEN! Ya puedes explorar la plataforma.", 'success');
                }
                LumenUI.closeModal('register-modal');
                this.loadProfile(authData.user);
            })
            .catch(err => LumenUI.showToast(LumenUI.getErrorMessage(err), 'error'));
    },
    updateJuvemarProfile: function(juvemarData) {
        if (!this.currentUser) return Promise.reject(new Error('No hay usuario logeado'));
        const uid = this.currentUser.id;
        const wantsJuvemar = !!juvemarData.wantsJuvemar;
        const juvemarStatus = wantsJuvemar ? (juvemarData.juvemarStatus || 'Nuevo') : 'No';
        const role = wantsJuvemar ? 'miembro' : 'global';
        const status = wantsJuvemar ? 'pending' : 'approved';

        const updateData = {
            juvemar_status: juvemarStatus,
            juvemar_tiempo: juvemarData.juvemarTime || '',
            sacramentos: juvemarData.sacramentos || [],
            kerigma: juvemarData.kerigma,
            kerigma_otra: juvemarData.kerigmaOtra || '',
            samuel_parroquia: juvemarData.samuelParroquia || '',
            direccion: juvemarData.sector || '',
            role: role,
            status: status
        };
        if (juvemarData.age && parseInt(juvemarData.age) < 18) {
            updateData.representante_nombre = juvemarData.guardianName;
            updateData.representante_telefono = juvemarData.guardianPhone;
        }

        return supabase.from('profiles').update(updateData).eq('id', uid)
            .then(({ error }) => {
                if (error) throw error;
                return this.loadProfile(this.currentUser);
            })
            .then(() => {
                LumenUI.showToast("Solicitud enviada. Espera aprobación del coordinador.", 'success');
                LumenUI.closeModal('register-modal');
            })
            .catch(err => LumenUI.showToast(LumenUI.getErrorMessage(err), 'error'));
    },
    logout: function() { supabase.auth.signOut().then(() => LumenUI.showToast('Sesión cerrada', 'success')); },
    deleteAccount: function() {
        if (!this.currentUser) return;
        const uid = this.currentUser.id;
        LumenUI.showConfirm("¿Seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.").then(confirmed => {
            if (!confirmed) return;
            supabase.auth.getSession()
                .then(({ data }) => {
                    const token = data.session?.access_token;
                    return fetch(`${supabaseConfig.url}/auth/v1/user`, {
                        method: 'DELETE',
                        headers: {
                            apikey: supabaseConfig.anonKey,
                            Authorization: `Bearer ${token}`
                        }
                    });
                })
                .then(res => {
                    if (!res.ok) {
                        return res.json().catch(() => ({})).then(body => {
                            throw new Error(body.msg || body.message || `Estado ${res.status}`);
                        });
                    }
                    return res.json();
                })
                .then(() => supabase.from('profiles').delete().eq('id', uid))
                .then(() => {
                    supabase.auth.signOut();
                    this.currentUser = null; this.userProfile = null; this.isAdmin = false;
                    this.updateUI(); LumenRouter.navigateTo('landing');
                    LumenUI.showToast("Cuenta eliminada.", "success");
                })
                .catch(err => {
                    supabase.rpc('eliminar_mi_cuenta')
                        .then(({ error }) => {
                            if (error) throw new Error('No fue posible eliminar la cuenta. Contacta a un coordinador.');
                            return supabase.from('profiles').delete().eq('id', uid);
                        })
                        .then(() => {
                            supabase.auth.signOut();
                            this.currentUser = null; this.userProfile = null; this.isAdmin = false;
                            this.updateUI(); LumenRouter.navigateTo('landing');
                            LumenUI.showToast("Cuenta eliminada.", "success");
                        })
                        .catch(() => LumenUI.showToast(LumenUI.getErrorMessage(err), 'error'));
                });
        });
    },
    requestAdmin: function() {
        if (!this.currentUser) return;
        if (this.userProfile.role !== 'miembro') {
            return LumenUI.showToast('Debes ser miembro activo de Juvemar para solicitar ser coordinador.', 'error');
        }
        fetch('https://formsubmit.co/ajax/juvemar08@gmail.com', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ _subject: `Solicitud Admin LUMEN`, email: this.currentUser.email, message: `${this.userProfile.nombre} solicita ser admin. UID: ${this.currentUser.id}` }) })
        .then(() => { LumenUI.showToast('Solicitud enviada.', 'success'); LumenData.saveNotification(`${this.userProfile.nombre} solicitó ser coordinador.`, false); })
        .catch(() => LumenUI.showToast('Error al enviar', 'error'));
    },
    requestJuvemarMembership: function() {
        if (!this.currentUser || this.userProfile.role !== 'global') return;
        LumenUI.showConfirm("¿Deseas solicitar el ingreso a Juvemar? Un coordinador revisará tu solicitud.").then(confirmed => {
            if(confirmed) {
                supabase.from('profiles').update({ role: 'miembro', status: 'pending' }).eq('id', this.currentUser.id)
                    .then(() => {
                        LumenData.saveNotification(`${this.userProfile.nombre} solicitó ingresar a Juvemar.`, false);
                        LumenUI.showToast('Solicitud enviada. Tu cuenta quedará en espera hasta ser aprobada.', 'success');
                        supabase.auth.signOut();
                    })
                    .catch(err => LumenUI.showToast(LumenUI.getErrorMessage(err), 'error'));
            }
        });
    }
};
