/* Descargas offline por grupos.
   Guarda en la Cache API los datos y scripts que cada grupo necesita. El
   Service Worker sirve esos recursos desde caché cuando no hay conexión. */
const LumenOffline = {
    cacheName: 'lumen-downloads-v1',
    storeKey: 'lumen-offline-groups',

    groups: {
        formacion: {
            label: 'Formación',
            desc: 'Módulos, unidades y lecturas para estudiar la fe sin conexión.',
            icon: 'book',
            routes: ['/formacion'],
            assets: ['/js/formacion_data.js', '/js/views/formacion.js']
        },
        oracion: {
            label: 'Oración',
            desc: 'Oraciones, rosario convencional y eucarístico, coronillas y novenas.',
            icon: 'oraciones',
            routes: ['/oraciones', '/rosario', '/novenas'],
            assets: ['/js/oraciones_data.js', '/js/rosario_data.js', '/js/coronillas_data.js', '/js/novenas_data.js', '/js/audio.js', '/js/views/oraciones.js', '/js/views/rosario.js', '/js/views/novenas.js']
        },
        devocional: {
            label: 'Devocional',
            desc: 'Santo del día, pasajes, examen de conciencia y evangelio.',
            icon: 'santos',
            routes: ['/devocional', '/evangelio', '/examen'],
            assets: ['/js/santoral.js', '/js/devocional_data.js', '/js/frases_santos.js', '/js/examen_data.js', '/js/views/devocional.js', '/js/views/evangelio.js', '/js/views/examen.js']
        },
        planes: {
            label: 'Planes',
            desc: 'Adviento, Navidad, Cuaresma y Pascua, paso a paso.',
            icon: 'compass',
            routes: ['/planes'],
            assets: ['/js/planes_data.js', '/js/views/planes.js', '/js/audio.js']
        },
        todo: {
            label: 'Todo LUMEN',
            desc: 'Todo el contenido público para llevar contigo donde no haya señal.',
            icon: 'download',
            routes: ['/inicio', '/actividades', '/calendario', '/blog', '/formacion', '/oraciones', '/rosario', '/novenas', '/examen', '/devocional', '/evangelio', '/planes'],
            assets: []
        }
    },

    _allAssets: function() {
        const set = {};
        Object.keys(this.groups).forEach(function(id) {
            if (id === 'todo') return;
            (this.groups[id].assets || []).forEach(function(a) { set[a] = true; });
        }, this);
        return Object.keys(set);
    },

    supported: function() {
        return typeof caches !== 'undefined' && 'serviceWorker' in navigator;
    },

    _read: function() {
        try { return JSON.parse(localStorage.getItem(this.storeKey)) || {}; } catch (e) { return {}; }
    },
    _write: function(state) {
        try { localStorage.setItem(this.storeKey, JSON.stringify(state)); } catch (e) {}
    },
    isDownloaded: function(id) {
        return !!this._read()[id];
    },
    state: function() {
        return this._read();
    },

    download: async function(id, onProgress) {
        const group = this.groups[id];
        if (!group) throw new Error('Grupo desconocido');
        if (!this.supported()) throw new Error('Este navegador no permite descargas offline.');
        const assets = id === 'todo' ? this._allAssets() : (group.assets || []);
        const cache = await caches.open(this.cacheName);
        let done = 0;
        let saved = 0;
        for (const asset of assets) {
            try {
                const response = await fetch(asset, { cache: 'reload' });
                if (response && response.ok) {
                    await cache.put(asset, response.clone());
                    saved++;
                }
            } catch (e) {
                // Un recurso que falle no invalida el resto del grupo.
            }
            done++;
            if (typeof onProgress === 'function') onProgress(done, assets.length, asset);
        }
        if (!saved) throw new Error('No se pudo descargar el contenido. Revisa tu conexión e inténtalo de nuevo.');
        const state = this._read();
        const at = Date.now();
        if (id === 'todo') {
            Object.keys(this.groups).forEach(function(key) {
                state[key] = { at: at, count: key === 'todo' ? saved : (this.groups[key].assets || []).length };
            }, this);
        } else {
            state[id] = { at: at, count: saved };
        }
        this._write(state);
        return state;
    },

    remove: async function(id) {
        if (!this.supported()) return;
        let state = this._read();
        if (id === 'todo') {
            state = {};
            const cache = await caches.open(this.cacheName);
            const keys = await cache.keys();
            await Promise.all(keys.map(function(req) { return cache.delete(req); }));
            this._write(state);
            return;
        }
        delete state[id];
        // Al quitar un grupo, "Todo LUMEN" deja de estar completo.
        delete state.todo;
        const needed = {};
        Object.keys(state).forEach(function(key) {
            (this.groups[key].assets || []).forEach(function(a) { needed[a] = true; });
        }, this);
        const cache = await caches.open(this.cacheName);
        const keys = await cache.keys();
        await Promise.all(keys.map(function(req) {
            const path = new URL(req.url).pathname;
            if (!needed[path]) return cache.delete(req);
            return null;
        }));
        this._write(state);
    },

    clearAll: async function() {
        if (!this.supported()) return;
        await caches.delete(this.cacheName);
        this._write({});
    },

    storage: async function() {
        if (!navigator.storage || !navigator.storage.estimate) return null;
        try {
            const est = await navigator.storage.estimate();
            return { usage: est.usage || 0, quota: est.quota || 0, pct: est.quota ? Math.min(100, Math.round((est.usage / est.quota) * 100)) : 0 };
        } catch (e) { return null; }
    },

    formatBytes: function(bytes) {
        if (!bytes) return '0 MB';
        const mb = bytes / (1024 * 1024);
        return mb < 1 ? Math.round(bytes / 1024) + ' KB' : mb.toFixed(1) + ' MB';
    }
};
