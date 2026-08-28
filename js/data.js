const LumenData = {
    eventos: [], recursos: {}, notifications: [], blogArticles: [], state: { eventos: 'loading', recursos: 'loading' }, selectedEventId: null,
    init: function() {
        db.ref('eventos').on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) { this.eventos = Object.keys(data).map(k => ({...data[k], id: k})); this.state.eventos = 'ideal'; this.checkExpiredActivities(); this.checkScheduledNotifications(); } 
            else { this.eventos = []; this.state.eventos = 'empty'; }
            this.updateViewIfActive('actividades');
            if (LumenRouter.currentView === 'detalle') LumenRouter.navigateTo('detalle');
        }, (err) => { this.state.eventos = 'error'; this.updateViewIfActive('actividades'); });

        db.ref('recursos').on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) { this.recursos = data; this.state.recursos = 'ideal'; } 
            else { this.recursos = {}; this.state.recursos = 'empty'; }
            this.updateViewIfActive('recursos');
        }, (err) => { this.state.recursos = 'error'; this.updateViewIfActive('recursos'); });

        db.ref('notifications').limitToLast(20).on('value', (snapshot) => {
            this.notifications = [];
            snapshot.forEach(child => { this.notifications.push({id: child.key, ...child.val()}); });
            this.updateViewIfActive('notificaciones');
            LumenUI.updateNotifBadge();
        });

        db.ref('blog').on('value', (snapshot) => {
            const data = snapshot.val() || {};
            this.blogArticles = Object.keys(data).map(k => ({ id: k, ...data[k] }));
            this.updateViewIfActive('blog');
        });

        setInterval(() => this.checkScheduledNotifications(), 60000);
    },
    checkExpiredActivities: function() {
        const now = new Date();
        this.eventos.forEach(ev => {
            if (ev.tipo === 'unico' && ev.fecha_fin) { if (new Date(ev.fecha_fin) < now) db.ref('eventos/' + ev.id).remove(); }
        });
    },
    checkScheduledNotifications: function() {
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
                if (needsUpdate) db.ref('eventos/' + ev.id).update({ notifs_sent: sentNotifs });
            }
        });
    },
    updateViewIfActive: function(viewName) { if (document.querySelector('.nav-link.active')?.getAttribute('data-view') === viewName) LumenRouter.navigateTo(viewName); },
    saveActivity: function(activity) { const ref = db.ref('eventos').push(activity); this.saveNotification(`Nueva actividad: ${activity.titulo}`, false); return ref; },
    updateActivity: function(id, activity) { return db.ref('eventos/' + id).update(activity); },
    deleteActivity: function(id) { return db.ref('eventos/' + id).remove(); },
    saveResource: function(category, resource) { const ref = db.ref(`recursos/${category}`).push(resource); this.saveNotification(`Nuevo recurso: ${resource.titulo}`, false); return ref; },
    updateResource: function(category, id, resource) { return db.ref(`recursos/${category}/${id}`).update(resource); },
    deleteResource: function(category, id) { return db.ref(`recursos/${category}/${id}`).remove(); },
    saveNotification: function(text, forAdmin) { db.ref('notifications').push({ text: text, forAdmin: forAdmin, timestamp: Date.now() }); }
};