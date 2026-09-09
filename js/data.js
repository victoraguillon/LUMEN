const LumenData = {
    eventos: [], recursos: {}, notifications: [], blogArticles: [], users: null, state: { eventos: 'loading', recursos: 'loading' }, selectedEventId: null, notifTake: 20,
    _fp: { eventos: null, recursos: null, notificaciones: null, articulos: null, profiles: null },
    _deb: {},
    init: function() {
        this.loadEventos();
        this.loadRecursos();
        this.loadNotifications();
        this.loadBlog();
        this.loadUsers();
        this.subscribe();
        const self = this;
        window.addEventListener('offline', () => { if (LumenUI.setOfflineBadge) LumenUI.setOfflineBadge(true); });
        window.addEventListener('online', () => self.flushOutbox());
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
            supabase
                .channel('lumen-realtime')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'eventos' }, () => this.loadEventos())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'recursos' }, () => this.loadRecursos())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'notificaciones' }, () => this.loadNotifications())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'articulos' }, () => this.loadBlog())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => this.loadUsers())
                .subscribe();
        } catch (e) { console.error('[LUMEN] realtime', e); }
    },
    loadEventos: function() {
        return supabase.from('eventos').select('*').order('created_at', { ascending: true }).then(({ data, error }) => {
            if (error) return this._servirCaché('eventos');
            this._aplicarEventos(data);
            LumenStore.cachedSet('eventos', data);
            if (LumenUI.setOfflineBadge) LumenUI.setOfflineBadge(false);
        }).catch(() => this._servirCaché('eventos'));
    },
    _aplicarEventos: function(data) {
        const fp = this._fingerprint('eventos', data);
        if (fp === this._fp.eventos) return;
        this._fp.eventos = fp;
        this.eventos = data || [];
        this.state.eventos = data && data.length > 0 ? 'ideal' : 'empty';
        this._debouncedRender('actividades');
    },
    // Fallback offline: sirve el snapshot local y avisa; si no hay, marca error.
    _servirCaché: function(kind) {
        return LumenStore.cachedGet(kind).then(cached => {
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
        return { eventos: 'actividades', recursos: 'recursos', notificaciones: 'notificaciones', articulos: 'blog', profiles: 'gestion' }[kind] || 'landing';
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
        return supabase.from('recursos').select('*').order('created_at', { ascending: true }).then(({ data, error }) => {
            if (error) return this._servirCaché('recursos');
            this._aplicarRecursos(data);
            LumenStore.cachedSet('recursos', data);
        }).catch(() => this._servirCaché('recursos'));
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
        return supabase.from('notificaciones').select('*').order('timestamp', { ascending: false }).limit(this.notifTake).then(({ data, error }) => {
            if (error) return this._servirCaché('notificaciones');
            const fp = this._fingerprint('notificaciones', data);
            if (fp === this._fp.notificaciones) return;
            this._fp.notificaciones = fp;
            this.notifications = data && data.length > 0 ? data : [];
            this._debouncedRender('notificaciones');
            LumenUI.updateNotifBadge();
            LumenStore.cachedSet('notificaciones', data || []);
        }).catch(() => this._servirCaché('notificaciones'));
    },
    loadMoreNotifications: function() {
        this.notifTake += 20;
        return this.loadNotifications();
    },
    loadBlog: function() {
        return supabase.from('articulos').select('*').order('timestamp', { ascending: false }).limit(50).then(({ data, error }) => {
            if (error) return this._servirCaché('articulos');
            const fp = this._fingerprint('articulos', data);
            if (fp === this._fp.articulos) return;
            this._fp.articulos = fp;
            this.blogArticles = data || [];
            this._debouncedRender('blog');
            LumenStore.cachedSet('articulos', data || []);
        }).catch(() => this._servirCaché('articulos'));
    },
    loadUsers: function() {
        return supabase.from('profiles').select('*').then(({ data, error }) => {
            if (error) { console.error('[LUMEN] loadUsers', error); return this._servirCaché('profiles'); }
            const fp = this._fingerprint('profiles', data);
            if (fp === this._fp.profiles) return;
            this._fp.profiles = fp;
            this.users = {};
            (data || []).forEach(u => { this.users[u.id] = u; });
            this._debouncedRender('inicio');
            this._debouncedRender('gestion');
            LumenStore.cachedSet('profiles', data || []);
        }).catch((err) => { console.error('[LUMEN] loadUsers', err); return this._servirCaché('profiles'); });
    },
    checkExpiredActivities: function() {},
    checkScheduledNotifications: function() {},
    updateViewIfActive: function(viewName) { this._debouncedRender(viewName); },
    // Outbox: encola una escritura para reempezar cuando haya conexión.
    _encolar: function(op, payload) {
        return LumenStore.outboxAdd({ op, payload }).then(() => {
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
        return LumenStore.outboxList().then(list => {
            if (!list.length) return;
            const replays = list.reduce((chain, item) => chain
                .then(() => this._replay(item.op, item.payload))
                .then(() => LumenStore.outboxRemove(item.id))
                .catch(err => { console.error('[LUMEN] outbox item', item.op, err); return LumenStore.outboxRemove(item.id); }), Promise.resolve());
            return replays.then(() => {
                if (LumenUI.setOfflineBadge) LumenUI.setOfflineBadge(false);
                LumenUI.showToast('Cambios pendientes sincronizados.', 'success');
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
            case 'notify': return this.saveNotification(payload.text, payload.forAdmin);
        }
        return Promise.resolve();
    }
};