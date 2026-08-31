const LumenData = {
    eventos: [], recursos: {}, notifications: [], blogArticles: [], users: null, state: { eventos: 'loading', recursos: 'loading' }, selectedEventId: null, notifTake: 20,
    init: function() {
        this.loadEventos();
        this.loadRecursos();
        this.loadNotifications();
        this.loadBlog();
        this.loadUsers();
        this.subscribe();
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
        supabase.from('eventos').select('*').order('created_at', { ascending: true }).then(({ data, error }) => {
            if (error) { this.state.eventos = 'error'; this.updateViewIfActive('actividades'); return; }
            if (data && data.length > 0) { this.eventos = data; this.state.eventos = 'ideal'; }
            else { this.eventos = []; this.state.eventos = 'empty'; }
            this.updateViewIfActive('actividades');
            if (LumenRouter.currentView === 'detalle') LumenRouter.navigateTo('detalle');
        });
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
            if (error) { this.state.recursos = 'error'; this.updateViewIfActive('recursos'); return; }
            this.recursos = {};
            (data || []).forEach(r => {
                if (!this.recursos[r.categoria]) this.recursos[r.categoria] = {};
                this.recursos[r.categoria][r.id] = r;
            });
            this.state.recursos = data && data.length > 0 ? 'ideal' : 'empty';
            this.updateViewIfActive('recursos');
        });
    },
    loadNotifications: function() {
        return supabase.from('notificaciones').select('*').order('timestamp', { ascending: false }).limit(this.notifTake).then(({ data, error }) => {
            this.notifications = data && data.length > 0 ? data : [];
            this.updateViewIfActive('notificaciones');
            LumenUI.updateNotifBadge();
        });
    },
    loadMoreNotifications: function() {
        this.notifTake += 20;
        return this.loadNotifications();
    },
    loadBlog: function() {
        return supabase.from('articulos').select('*').order('timestamp', { ascending: false }).limit(50).then(({ data, error }) => {
            this.blogArticles = data || [];
            this.updateViewIfActive('blog');
        });
    },
    loadUsers: function() {
        return supabase.from('profiles').select('*').then(({ data, error }) => {
            if (error) { console.error('[LUMEN] loadUsers', error); return; }
            this.users = {};
            (data || []).forEach(u => { this.users[u.id] = u; });
            const v = LumenRouter.currentView;
            if (['gestion', 'inicio'].includes(v)) LumenRouter.navigateTo(v);
        });
    },
    checkExpiredActivities: function() {},
    checkScheduledNotifications: function() {},
    updateViewIfActive: function(viewName) { if (document.querySelector('.nav-link.active')?.getAttribute('data-view') === viewName) LumenRouter.navigateTo(viewName); },
    saveActivity: function(activity) {
        return supabase.from('eventos').insert(activity).select('*').single().then(({ data, error }) => {
            if (error) throw error;
            this.saveNotification(`Nueva actividad: ${activity.titulo}`, false);
            return { key: data.id };
        });
    },
    updateActivity: function(id, activity) { return supabase.from('eventos').update(activity).eq('id', id); },
    deleteActivity: function(id) { return supabase.from('eventos').delete().eq('id', id); },
    saveResource: function(category, resource) {
        const row = { ...resource, categoria: category };
        return supabase.from('recursos').insert(row).select('*').single().then(({ data, error }) => {
            if (error) throw error;
            this.saveNotification(`Nuevo recurso: ${resource.titulo}`, false);
            return { key: data.id };
        });
    },
    updateResource: function(category, id, resource) { return supabase.from('recursos').update({ ...resource, categoria: category }).eq('id', id); },
    deleteResource: function(category, id) { return supabase.from('recursos').delete().eq('id', id); },
    saveNotification: function(text, forAdmin) { return supabase.rpc('send_notification', { p_texto: text, p_for_admin: !!forAdmin }).then(({ error }) => { if (error) console.error('[LUMEN] saveNotification', error); }); }
};
