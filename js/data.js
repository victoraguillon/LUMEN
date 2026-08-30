const LumenData = {
    eventos: [], recursos: {}, notifications: [], blogArticles: [], users: null, state: { eventos: 'loading', recursos: 'loading' }, selectedEventId: null,
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
            if (data && data.length > 0) { this.eventos = data; this.state.eventos = 'ideal'; this.checkExpiredActivities(); this.checkScheduledNotifications(); }
            else { this.eventos = []; this.state.eventos = 'empty'; }
            this.updateViewIfActive('actividades');
            if (LumenRouter.currentView === 'detalle') LumenRouter.navigateTo('detalle');
        });
    },
    subscribeEventos: function() {
        supabase
            .channel('lumen-eventos')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'eventos' }, () => this.loadEventos())
            .subscribe();
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
        return supabase.from('notificaciones').select('*').order('timestamp', { ascending: false }).limit(20).then(({ data, error }) => {
            this.notifications = data && data.length > 0 ? data : [];
            this.updateViewIfActive('notificaciones');
            LumenUI.updateNotifBadge();
        });
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
    checkExpiredActivities: function() {
        const now = new Date();
        const toDelete = [];
        this.eventos.forEach(ev => {
            if (ev.tipo === 'unico' && ev.fecha_fin) {
                if (new Date(ev.fecha_fin) < now) {
                    supabase.from('eventos').delete().eq('id', ev.id).then(() => {});
                }
            }
        });
    },
    checkScheduledNotifications: function() {
        if (!LumenAuth.currentUser) return;
        const now = new Date();
        this.eventos.forEach(ev => {
            if (ev.tipo === 'unico' && ev.fecha_inicio) {
                const inicio = new Date(ev.fecha_inicio);
                const diffMs = inicio - now;
                const diffDays = diffMs / (1000 * 60 * 60 * 24);
                const diffHours = diffMs / (1000 * 60 * 60);
                let sentNotifs = ev.notifs_sent || [];
                let needsUpdate = false;
                if (diffDays <= 5 && diffDays > 1 && !sentNotifs.includes('5days')) { this.saveNotification(`Recuerda: "${ev.titulo}" es en 5 días.`, false); sentNotifs.push('5days'); needsUpdate = true; }
                if (diffDays <= 1 && diffHours > 1 && !sentNotifs.includes('1day')) { this.saveNotification(`Mañana es "${ev.titulo}".`, false); sentNotifs.push('1day'); needsUpdate = true; }
                if (diffHours <= 1 && diffHours > 0 && !sentNotifs.includes('1hour')) { this.saveNotification(`¡ATENCIÓN! "${ev.titulo}" en 1 hora.`, false); sentNotifs.push('1hour'); needsUpdate = true; }
                if (needsUpdate) supabase.from('eventos').update({ notifs_sent: sentNotifs }).eq('id', ev.id).then(() => {});
            }
        });
    },
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
