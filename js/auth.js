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
        return supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()
            .then(({ data, error }) => {
                if (error) { console.error('[LUMEN] getProfile', error); throw error; }
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
            const avatarLetter = this.userProfile?.nombre ? this.userProfile.nombre.charAt(0).toUpperCase() : 'L';
            let picUrl;
            if (this.userProfile?.photo_url) {
                picUrl = encodeURI(this.userProfile.photo_url);
            } else {
                const svg = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#005F8A"/><text x="50" y="50" fill="#fff" font-family="Arial, sans-serif" font-size="48" text-anchor="middle" dominant-baseline="central">${avatarLetter}</text></svg>`);
                picUrl = `data:image/svg+xml;charset=utf-8,${svg}`;
            }
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

        // Validar datos básicos críticos ANTES de signUp (evita usuarios huérfanos sin perfil)
        const nombre = String(data.nombre || '').trim();
        const email = String(data.email || '').trim().toLowerCase();
        const phone = String(data.phone || '').trim();
        const birthdate = String(data.birthdate || '').trim();
        const password = data.password || '';
        if (!nombre) { this._regError('El nombre es obligatorio.'); return; }
        if (!email) { this._regError('El email es obligatorio.'); return; }
        if (!phone) { this._regError('El teléfono es obligatorio.'); return; }
        if (!birthdate) { this._regError('La fecha de nacimiento es obligatoria.'); return; }
        if (password.length < 6) { this._regError('La contraseña debe tener al menos 6 caracteres.'); return; }

        const juvemarStatus = wantsJuvemar ? (data.juvemarStatus || 'Nuevo') : 'No';
        const ageNum = parseInt(data.age, 10);

        // Datos guardados en el INSERT inicial. role/status siempren global/approved:
        // la BD (guard guard_profiles_privileges) SOLO admite role='global' + status='approved'
        // en el alta de perfil. Juvemar pasa luego a miembro/pending mediante UPDATE.
        const userData = {
            nombre: nombre, edad: Number.isFinite(ageNum) ? ageNum : null, nacimiento: birthdate,
            direccion: data.sector || '', telefono: phone,
            juvemar_status: juvemarStatus, juvemar_tiempo: data.juvemarTime || '', sacramentos: data.sacramentos || [],
            kerigma: data.kerigma || '', kerigma_otra: data.kerigmaOtra || '', samuel_parroquia: data.samuelParroquia || '',
            email: email, role: 'global', status: 'approved',
            acepta_terminos: true, acepta_terminos_ts: new Date().toISOString()
        };
        if (ageNum && ageNum < 18) { userData.representante_nombre = data.guardianName || ''; userData.representante_telefono = data.guardianPhone || ''; }

        console.log('[LUMEN] Register | userData:', userData);

        return supabase.auth.signUp({ email, password })
            .then(({ data: authData, error }) => {
                if (error) throw error;
                const uid = authData.user && authData.user.id;
                if (!uid) throw new Error('No se obtuvo UID del usuario');

                console.log('[LUMEN] Upserting profile data:', { ...userData, id: uid });

                return supabase.from('profiles').upsert({ ...userData, id: uid }, { onConflict: 'id' })
                    .then((result) => {
                        if (result.error) {
                            console.error('[LUMEN] Upsert error:', result.error);
                            throw new Error(`Error guardando perfil: ${result.error.message}`);
                        }
                        console.log('[LUMEN] Upsert successful:', result);
                        return { data: authData, uid };
                    });
            })
            .then(({ data: authData, uid }) => {
                // Si quiere ser de Juvemar: 2º paso UPDATE a miembro/pending (permitido por el guard)
                if (wantsJuvemar) {
                    const memberData = {
                        juvemar_status: juvemarStatus,
                        juvemar_tiempo: data.juvemarTime || '',
                        sacramentos: data.sacramentos || [],
                        kerigma: data.kerigma || '',
                        kerigma_otra: data.kerigmaOtra || '',
                        samuel_parroquia: data.samuelParroquia || '',
                        direccion: data.sector || '',
                        role: 'miembro',
                        status: 'pending'
                    };
                    if (ageNum && ageNum < 18) { memberData.representante_nombre = data.guardianName || ''; memberData.representante_telefono = data.guardianPhone || ''; }
                    console.log('[LUMEN] Update perfil Juvemar:', memberData);
                    return supabase.from('profiles').update(memberData).eq('id', uid)
                        .then((result) => {
                            if (result.error) {
                                console.error('[LUMEN] Update Juvemar error:', result.error);
                                throw new Error(`Error actualizando perfil Juvemar: ${result.error.message}`);
                            }
                            console.log('[LUMEN] Perfil Juvemar actualizado:', result);
                            LumenData.saveNotification(`Nuevo registro Juvemar: ${nombre} requiere aprobación.`, false);
                            LumenUI.showToast("Registro exitoso. Espera aprobación del coordinador.", 'success');
                        })
                        .then(() => {
                            fetch('https://formsubmit.co/ajax/juvemar08@gmail.com', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ _subject: `Nuevo Registro Juvemar: ${nombre}`, email, message: `${nombre} requiere aprobación.` }) }).catch(err => console.error(err));
                            LumenUI.closeModal('register-modal');
                            this.loadProfile(authData.user);
                        });
                } else {
                    LumenUI.showToast("¡Bienvenido a LUMEN! Ya puedes explorar la plataforma.", 'success');
                    LumenUI.closeModal('register-modal');
                    this.loadProfile(authData.user);
                }
            })
            .catch(err => {
                console.error('[LUMEN] Register error:', err);
                LumenUI.showToast(LumenUI.getErrorMessage(err), 'error');
            });
    },
    _regError: function(msg) {
        console.error('[LUMEN] Register validation:', msg);
        LumenUI.showToast(msg, 'error');
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
            status: status,
            acepta_terminos: true,
            acepta_terminos_ts: new Date().toISOString()
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
