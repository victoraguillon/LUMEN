// LumenStore: caché local (IndexedDB) + outbox para operar sin conexión.
// - kv:      `cachedSet/cachedGet/cachedDel` guardan snapshots de datasets (eventos,
//            recursos, notificaciones, articulos, profiles).
// - outbox:  escrituras pendientes mientras offline; se reemiten al volver.
// Todo es best-effort: cualquier fallo de IndexedDB devuelve null/[] sin lanzar.
const LumenStore = (function() {
    const DB_NAME = 'lumen-offline';
    const DB_VERSION = 1;
    const KV = 'kv';
    const OUTBOX = 'outbox';

    let _db = null;

    function open() {
        if (_db) return Promise.resolve(_db);
        return new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) return reject(new Error('IndexedDB no disponible'));
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = function() {
                const db = req.result;
                if (!db.objectStoreNames.contains(KV)) db.createObjectStore(KV, { keyPath: 'key' });
                if (!db.objectStoreNames.contains(OUTBOX)) db.createObjectStore(OUTBOX, { keyPath: 'id', autoIncrement: true });
            };
            req.onsuccess = function() { _db = req.result; resolve(_db); };
            req.onerror = function() { reject(req.error || new Error('IndexedDB error')); };
        });
    }

    function tx(storeName, mode, fn) {
        return open().then(db => new Promise((resolve, reject) => {
            const t = db.transaction(storeName, mode);
            const s = t.objectStore(storeName);
            let result;
            try { result = fn(s); } catch (e) { reject(e); return; }
            t.oncomplete = () => resolve(result ? result.result : undefined);
            t.onerror = () => reject(t.error);
            t.onabort = () => reject(t.error);
        }));
    }

    return {
        cachedGet: function(key) {
            return tx(KV, 'readonly', s => s.get(key)).then(v => (v && v.value) || null).catch(() => null);
        },
        cachedSet: function(key, value) {
            return tx(KV, 'readwrite', s => s.put({ key: key, value: value })).catch(() => null);
        },
        cachedDel: function(key) {
            return tx(KV, 'readwrite', s => s.delete(key)).catch(() => null);
        },
        outboxAdd: function(entry) {
            return tx(OUTBOX, 'readwrite', s => s.add({ op: entry.op, payload: entry.payload, ts: Date.now() }))
                .catch(err => { console.error('[LumenStore] outboxAdd', err); return null; });
        },
        outboxList: function() {
            return tx(OUTBOX, 'readonly', s => s.getAll()).catch(() => []);
        },
        outboxRemove: function(id) {
            return tx(OUTBOX, 'readwrite', s => s.delete(id)).catch(() => null);
        }
    };
})();