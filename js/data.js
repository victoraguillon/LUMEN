const EVENT_SUMMARY_FIELDS = 'id,titulo,tipo,descripcion,ubicacion,requisitos_edad,requisitos_texto,requisito_fecha,requisito_min_edad,requisito_max_edad,costo,fecha_inicio,fecha_fin,dia,hora,notifs_sent,created_at,updated_at';

const LumenData = {
    eventos: [], recursos: {}, notifications: [], blogArticles: [], myInscripciones: [], users: null, state: { eventos: 'loading', recursos: 'loading' }, selectedEventId: null, notifTake: 20,
    _fp: { eventos: null, recursos: null, notificaciones: null, articulos: null, profiles: null, inscripciones: null },
    _deb: {},
    _eventImages: {},
    _eventosFull: false,
    _eventosResumenPromise: null,
    _eventosFullPromise: null,
    _recursosPromise: null,
    _notifPromise: null,
    _blogPromise: null,
    _usersPromise: null,
    _inscripcionesPromise: null,
    init: function() {
        this.loadEventos();
        this.subscribe();
        window.addEventListener('offline', () => { if (LumenUI.setOfflineBadge) LumenUI.setOfflineBadge(true); });
        window.addEventListener('online', () => {
            LumenData.flushOutbox();
            if (typeof LumenUI !== 'undefined' && LumenUI.syncStreak) LumenUI.syncStreak();
        });
    },
    // Huella de un dataset: identifica por id + campos de mutabilidad.
    // Un re-render por realtime sólo ocurre si la huella CAMBIÓ (se evita el
    // re-render espurio que borra el estado de la vista, p.ej. el censo).
    _fingerprint: function(kind, rows) {
        switch (kind) {
            case 'eventos': return (rows || []).map(r => [r.id, r.updated_at || r.created_at, r.fecha_inicio || ''].join(':')).sort().join('|');
            case 'recursos': return (rows || []).map(r => [r.id, r.updated_at || r.created_at].join(':')).sort().join('|');
            case 'notificaciones': return (rows || []).map(r => [r.id, r.timestamp || ''].join(':')).sort().join('|');
            case 'articulos': return (rows || []).map(r => [r.id, r.timestamp || ''].join(':')).sort().join('|');
            case 'profiles': return (rows || []).map(r => [r.id, r.status, r.role, r.updated_at || r.nombre || ''].join(':')).sort().join('|');
            case 'inscripciones': return (rows || []).map(r => [r.id, r.evento_id, r.fecha || ''].join(':')).sort().join('|');
        }
        return '';
    },
    // Renderiza la vista activa una sola vez tras una ráfaga de eventos realtime.
    _debouncedRender: function(viewName) {
        if (this._deb[viewName]) clearTimeout(this._deb[viewName]);
        this._deb[viewName] = setTimeout(() => {
            this._deb[viewName] = null;
            const active = document.querySelector('.nav-link.active, .drawer-link.active')?.getAttribute('data-view');
            if (active === viewName) LumenRouter.navigateTo(viewName);
            if (LumenRouter.currentView === 'detalle' && viewName === 'actividades') LumenRouter.navigateTo('detalle');
        }, 300);
    },
    subscribe: function() {
        try {
            // Solo eventos: las tablas protegidas (recursos, notificaciones,
            // profiles) no deben abrir canales anónimos que devuelven 401.
            supabase
                .channel('lumen-realtime')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'eventos' }, () => this.loadEventos(this._eventosFull))
                .subscribe();
        } catch (e) { console.error('[LUMEN] realtime', e); }
    },
    loadEventos: function(full) {
        full = !!full;
        if (full && this._eventosFull) return Promise.resolve(this.eventos);
        if (!full && this._eventosFull) return Promise.resolve(this.eventos);
        if (full && this._eventosFullPromise) return this._eventosFullPromise;
        if (!full && this._eventosResumenPromise) return this._eventosResumenPromise;
        const fields = full ? '*' : EVENT_SUMMARY_FIELDS;
        const cacheKey = full ? 'eventos' : 'eventos_resumen';
        const request = supabase.from('eventos').select(fields).order('created_at', { ascending: true })
            .then(({ data, error }) => {
                if (error) throw error;
                this._aplicarEventos(data, full);
                LumenStore.cachedSet(cacheKey, data || []);
                if (LumenUI.setOfflineBadge) LumenUI.setOfflineBadge(false);
                return this.eventos;
            })
            .catch(() => {
                // Si ya hay un resumen en memoria, no sustituirlo por el estado de error.
                if (this.eventos.length) return this.eventos;
                return this._servirCaché('eventos');
            });
        const tracked = request.finally(() => {
            if (full) this._eventosFullPromise = null;
            else this._eventosResumenPromise = null;
        });
        if (full) this._eventosFullPromise = tracked;
        else this._eventosResumenPromise = tracked;
        return tracked;
    },
    ensureEventosFull: function() {
        return this.loadEventos(true);
    },
    _aplicarEventos: function(data, full) {
        data = data || [];
        // El resumen no trae image_url (base64 pesado). Conservamos las imágenes
        // ya cargadas y las inyectamos al vuelo para no volver a descargarlas.
        data.forEach((ev) => {
            if (ev.image_url) this._eventImages[ev.id] = ev.image_url;
            else if (this._eventImages[ev.id]) ev.image_url = this._eventImages[ev.id];
        });
        const fp = this._fingerprint('eventos', data);
        if (!full && fp === this._fp.eventos) return;
        this._fp.eventos = fp;
        this._eventosFull = !!full || this._eventosFull;
        this.eventos = data;
        this.state.eventos = data.length > 0 ? 'ideal' : 'empty';
        this._debouncedRender('actividades');
    },
    // Fallback offline: sirve el snapshot local y avisa; si no hay, marca error.
    _servirCaché: function(kind) {
        let cachedPromise = LumenStore.cachedGet(kind);
        if (kind === 'eventos') {
            cachedPromise = cachedPromise.then(cached => cached ? cached : LumenStore.cachedGet('eventos_resumen'));
        }
        return cachedPromise.then(cached => {
            if (cached) {
                this._applyFromCache(kind, cached);
                if (LumenUI.setOfflineBadge) LumenUI.setOfflineBadge(true);
            } else {
                this.state[kind] = 'error';
                this._debouncedRender(this._viewOf(kind));
            }
            return cached;
        }).catch(() => null);
    },
    _viewOf: function(kind) {
        return { eventos: 'actividades', recursos: 'recursos', notificaciones: 'notificaciones', articulos: 'blog', profiles: 'gestion', inscripciones: 'actividades' }[kind] || 'landing';
    },
    _applyFromCache: function(kind, cached) {
        switch (kind) {
            case 'eventos': this._aplicarEventos(cached); break;
            case 'recursos': this._aplicarRecursos(cached); break;
            case 'notificaciones':
                this.notifications = cached || [];
                this._debouncedRender('notificaciones');
                if (LumenUI.updateNotifBadge) LumenUI.updateNotifBadge();
                break;
            case 'articulos':
                this.blogArticles = cached || [];
                this._debouncedRender('blog');
                break;
            case 'profiles':
                this.users = {};
                (cached || []).forEach(u => { this.users[u.id] = u; });
                this._debouncedRender('inicio');
                this._debouncedRender('gestion');
                break;
            case 'inscripciones':
                this.myInscripciones = cached || [];
                this._debouncedRender('actividades');
                break;
        }
    },
    // Eventos ordenados por fecha: únicos por fecha_inicio, recurrentes por creación
    sortedEventos: function() {
        return [...this.eventos].sort((a, b) => {
            const ta = a.tipo === 'unico' && a.fecha_inicio ? new Date(a.fecha_inicio).getTime() : (new Date(a.created_at || 0).getTime() || 0);
            const tb = b.tipo === 'unico' && b.fecha_inicio ? new Date(b.fecha_inicio).getTime() : (new Date(b.created_at || 0).getTime() || 0);
            return ta - tb;
        });
    },
    // Próximas: recurrentes siempre + únicos que aún no empezaron
    upcomingEventos: function(limit) {
        const now = Date.now();
        const list = this.sortedEventos().filter(ev => {
            if (ev.tipo === 'recurrente') return true;
            if (!ev.fecha_inicio) return false;
            return new Date(ev.fecha_inicio).getTime() >= now;
        });
        return typeof limit === 'number' ? list.slice(0, limit) : list;
    },
    // Historial: únicos ya finalizados (más reciente primero)
    historialEventos: function() {
        const now = Date.now();
        return this.sortedEventos().filter(ev => ev.tipo === 'unico' && ev.fecha_inicio && new Date(ev.fecha_inicio).getTime() < now).reverse();
    },
    // Cumpleaños por ventana de días (0 = hoy). Requiere RPC cumpleanos_list (migración 4)
    loadBirthdays: function(dias) {
        return supabase.rpc('cumpleanos_list', { p_dias: typeof dias === 'number' ? dias : 0 }).then(({ data, error }) => error ? [] : (data || []));
    },
    loadRecursos: function() {
        if (typeof LumenAuth === 'undefined' || !LumenAuth.isMember) return Promise.resolve();
        if (this._recursosPromise) return this._recursosPromise;
        this._recursosPromise = supabase.from('recursos').select('*').order('created_at', { ascending: true }).then(({ data, error }) => {
            if (error) throw error;
            this._aplicarRecursos(data);
            LumenStore.cachedSet('recursos', data || []);
            return data;
        }).catch(() => this._servirCaché('recursos')).finally(() => { this._recursosPromise = null; });
        return this._recursosPromise;
    },
    _aplicarRecursos: function(data) {
        const fp = this._fingerprint('recursos', data);
        if (fp === this._fp.recursos) return;
        this._fp.recursos = fp;
        this.recursos = {};
        (data || []).forEach(r => {
            if (!this.recursos[r.categoria]) this.recursos[r.categoria] = {};
            this.recursos[r.categoria][r.id] = r;
        });
        this.state.recursos = data && data.length > 0 ? 'ideal' : 'empty';
        this._debouncedRender('recursos');
    },
    loadNotifications: function() {
        if (typeof LumenAuth === 'undefined' || !LumenAuth.isMember) return Promise.resolve();
        if (this._notifPromise) return this._notifPromise;
        this._notifPromise = supabase.from('notificaciones').select('*').order('timestamp', { ascending: false }).limit(this.notifTake).then(({ data, error }) => {
            if (error) throw error;
            const fp = this._fingerprint('notificaciones', data);
            if (fp === this._fp.notificaciones) return [];
            this._fp.notificaciones = fp;
            this.notifications = data && data.length > 0 ? data : [];
            this._debouncedRender('notificaciones');
            if (LumenUI.updateNotifBadge) LumenUI.updateNotifBadge();
            LumenStore.cachedSet('notificaciones', data || []);
            return data || [];
        }).catch(() => this._servirCaché('notificaciones')).finally(() => { this._notifPromise = null; });
        return this._notifPromise;
    },
    loadMoreNotifications: function() {
        this.notifTake += 20;
        return this.loadNotifications();
    },
    loadBlog: function() {
        if (this._blogPromise) return this._blogPromise;
        this._blogPromise = supabase.from('articulos').select('*').order('timestamp', { ascending: false }).limit(50).then(({ data, error }) => {
            if (error) throw error;
            const fp = this._fingerprint('articulos', data);
            if (fp === this._fp.articulos) return [];
            this._fp.articulos = fp;
            this.blogArticles = data || [];
            this._debouncedRender('blog');
            LumenStore.cachedSet('articulos', data || []);
            return data || [];
        }).catch(() => this._servirCaché('articulos')).finally(() => { this._blogPromise = null; });
        return this._blogPromise;
    },
    // Inscripciones propias. La RLS de `inscripciones` ya permite SELECT/DELETE
    // del propio usuario; no se consulta ningún dato de otros miembros.
    loadMyInscripciones: function(force) {
        if (typeof LumenAuth === 'undefined' || !LumenAuth.currentUser) return Promise.resolve([]);
        if (this._inscripcionesPromise) return this._inscripcionesPromise;
        const uid = LumenAuth.currentUser.id;
        if (force) this._fp.inscripciones = null;
        this._inscripcionesPromise = supabase.from('inscripciones').select('*')
            .eq('user_id', uid).order('fecha', { ascending: false })
            .then(({ data, error }) => {
                if (error) throw error;
                this._aplicarInscripciones(data);
                LumenStore.cachedSet('inscripciones', data || []);
                return data || [];
            })
            .catch(() => this._servirCaché('inscripciones'))
            .finally(() => { this._inscripcionesPromise = null; });
        return this._inscripcionesPromise;
    },
    _aplicarInscripciones: function(data) {
        if (typeof LumenAuth !== 'undefined' && !LumenAuth.currentUser) return;
        data = data || [];
        const fp = this._fingerprint('inscripciones', data);
        if (fp === this._fp.inscripciones) return;
        this._fp.inscripciones = fp;
        this.myInscripciones = data;
        this._debouncedRender('actividades');
    },
    isInscrito: function(eventId) {
        return (this.myInscripciones || []).some(function(i) { return i.evento_id === eventId; });
    },
    inscripcionFor: function(eventId) {
        return (this.myInscripciones || []).find(function(i) { return i.evento_id === eventId; }) || null;
    },
    cancelInscripcion: function(inscripcionId) {
        if (!inscripcionId) return Promise.resolve(false);
        const removeLocal = () => {
            this.myInscripciones = (this.myInscripciones || []).filter(i => i.id !== inscripcionId);
            LumenStore.cachedSet('inscripciones', this.myInscripciones);
        };
        if (navigator.onLine === false) {
            removeLocal();
            return this._encolar('cancelInscripcion', { id: inscripcionId }).then(() => true);
        }
        return supabase.from('inscripciones').delete().eq('id', inscripcionId).then(({ error }) => {
            if (error) throw error;
            removeLocal();
            return true;
        });
    },
    loadUsers: function() {
        if (typeof LumenAuth === 'undefined' || !LumenAuth.isAdmin) return Promise.resolve();
        if (this._usersPromise) return this._usersPromise;
        this._usersPromise = supabase.from('profiles').select('*').then(({ data, error }) => {
            if (error) throw error;
            const fp = this._fingerprint('profiles', data);
            if (fp === this._fp.profiles) return [];
            this._fp.profiles = fp;
            this.users = {};
            (data || []).forEach(u => { this.users[u.id] = u; });
            this._debouncedRender('inicio');
            this._debouncedRender('gestion');
            LumenStore.cachedSet('profiles', data || []);
            return data || [];
        }).catch((err) => {
            console.error('[LUMEN] loadUsers', err);
            return this._servirCaché('profiles');
        }).finally(() => { this._usersPromise = null; });
        return this._usersPromise;
    },
    checkExpiredActivities: function() {},
    checkScheduledNotifications: function() {},
    updateViewIfActive: function(viewName) { this._debouncedRender(viewName); },
    // Outbox: encola una escritura para reempezar cuando haya conexión.
    _encolar: function(op, payload) {
        return LumenStore.outboxAdd({ op, payload }).then(ok => {
            if (ok == null) {
                console.error('[LUMEN] _encolar no pudo guardar en el outbox', op);
                return { queued: false, key: null };
            }
            if (LumenUI.setOfflineBadge) LumenUI.setOfflineBadge(true);
            return { queued: true, key: (payload && payload.id != null) ? payload.id : null };
        });
    },
    saveActivity: function(activity) {
        if (navigator.onLine === false) return this._encolar('saveActivity', activity);
        return supabase.from('eventos').insert(activity).select('*').single().then(({ data, error }) => {
            if (error) throw error;
            this.saveNotification(`Nueva actividad: ${activity.titulo}`, false);
            return { key: data.id };
        });
    },
    updateActivity: function(id, activity) {
        if (navigator.onLine === false) return this._encolar('updateActivity', { id, activity });
        return supabase.from('eventos').update(activity).eq('id', id);
    },
    deleteActivity: function(id) {
        if (navigator.onLine === false) return this._encolar('deleteActivity', { id });
        return supabase.from('eventos').delete().eq('id', id);
    },
    saveResource: function(category, resource) {
        const row = { ...resource, categoria: category };
        if (navigator.onLine === false) return this._encolar('saveResource', { categoria: category, resource });
        return supabase.from('recursos').insert(row).select('*').single().then(({ data, error }) => {
            if (error) throw error;
            this.saveNotification(`Nuevo recurso: ${resource.titulo}`, false);
            return { key: data.id };
        });
    },
    updateResource: function(category, id, resource) {
        if (navigator.onLine === false) return this._encolar('updateResource', { categoria: category, id, resource });
        return supabase.from('recursos').update({ ...resource, categoria: category }).eq('id', id);
    },
    deleteResource: function(category, id) {
        if (navigator.onLine === false) return this._encolar('deleteResource', { categoria: category, id });
        return supabase.from('recursos').delete().eq('id', id);
    },
    saveNotification: function(text, forAdmin) {
        if (navigator.onLine === false) return this._encolar('notify', { text, forAdmin: !!forAdmin });
        return supabase.rpc('send_notification', { p_texto: text, p_for_admin: !!forAdmin }).then(({ error }) => { if (error) console.error('[LUMEN] saveNotification', error); });
    },
    // Relee el outbox en orden y reemite; los éxitos se descartan.
    flushOutbox: function() {
        if (navigator.onLine === false) return Promise.resolve();
        const MAX_ATTEMPTS = 5;
        return LumenStore.outboxList().then(list => {
            if (!list.length) return;
            const replays = list.reduce((chain, item) => chain
                .then(() => this._replay(item.op, item.payload)
                    .then(() => LumenStore.outboxRemove(item.id))
                    .catch(err => {
                        console.error('[LUMEN] outbox item', item.op, err);
                        const attempts = (item.attempts || 0) + 1;
                        if (attempts >= MAX_ATTEMPTS) {
                            console.error('[LUMEN] outbox descartado tras', MAX_ATTEMPTS, 'intentos:', item.op);
                            return LumenStore.outboxRemove(item.id);
                        }
                        return LumenStore.outboxBump(item.id, attempts);
                    })), Promise.resolve());
            return replays.catch(() => {}).then(() => LumenStore.outboxList()).then(rest => {
                if (!rest.length) {
                    if (LumenUI.setOfflineBadge) LumenUI.setOfflineBadge(false);
                    if (LumenUI.showToast) LumenUI.showToast('Cambios pendientes sincronizados.', 'success');
                } else if (LumenUI.showToast) {
                    LumenUI.showToast('No se pudieron sincronizar todos los cambios pendientes.', 'error');
                }
            }).catch(() => {});
        }).catch(() => {});
    },
    _replay: function(op, payload) {
        switch (op) {
            case 'saveActivity': return this.saveActivity(payload);
            case 'updateActivity': return this.updateActivity(payload.id, payload.activity);
            case 'deleteActivity': return this.deleteActivity(payload.id);
            case 'saveResource': return this.saveResource(payload.categoria, payload.resource);
            case 'updateResource': return this.updateResource(payload.categoria, payload.id, payload.resource);
            case 'deleteResource': return this.deleteResource(payload.categoria, payload.id);
            case 'cancelInscripcion': return supabase.from('inscripciones').delete().eq('id', payload.id).then(({ error }) => { if (error) throw error; });
            case 'notify': return this.saveNotification(payload.text, payload.forAdmin);
        }
        return Promise.resolve();
    }
};