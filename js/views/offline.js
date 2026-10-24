/* Descargas: permite guardar grupos de contenido público para usarlos sin conexión. */
const OfflineView = {
    _icon: function(name) {
        return (typeof LumenIcons !== 'undefined' && LumenIcons[name]) ? LumenIcons[name] : LumenIcons.download;
    },

    _card: function(id) {
        const group = LumenOffline.groups[id];
        const downloaded = LumenOffline.isDownloaded(id);
        const state = LumenOffline.state()[id];
        const count = state && state.count ? state.count + ' archivos' : '';
        return `<article class="offline-card reveal${downloaded ? ' is-downloaded' : ''}" data-offline-group="${id}">
            <div class="offline-card-icon">${this._icon(group.icon)}</div>
            <div class="offline-card-copy">
                <h3>${LumenUI.escapeHTML(group.label)}</h3>
                <p>${LumenUI.escapeHTML(group.desc)}</p>
                <span class="offline-status">${downloaded ? '✓ Descargado' : 'No descargado'}${count ? ' · ' + count : ''}</span>
            </div>
            <div class="offline-card-actions">
                ${downloaded
                    ? `<button class="btn btn-sm btn-outline" type="button" onclick="OfflineView.remove('${id}')">Quitar</button>`
                    : `<button class="btn btn-sm btn-primary" type="button" onclick="OfflineView.download('${id}', this)">Descargar</button>`}
            </div>
        </article>`;
    },

    render: function() {
        if (typeof LumenOffline === 'undefined') return `<div class="state-container"><h3>Descargas no disponibles</h3></div>`;
        const supported = LumenOffline.supported();
        const cards = ['formacion', 'oracion', 'devocional', 'planes'].map(function(id) { return this._card(id); }, this).join('');
        return `<div class="view">
            <div class="v-header reveal">
                <span class="v-eyebrow">${LumenIcons.download} Sin conexión ${LumenUI.liturgicalBadgeHTML()}</span>
                <h1 class="v-title">Lleva LUMEN <em>contigo</em></h1>
                <p class="v-sub">Descarga los contenidos que más usas para consultarlos y rezarlos cuando no tengas señal. Las descargas son públicas: nunca se guardan datos de tu cuenta, avisos ni inscripciones.</p>
            </div>
            ${supported ? '' : `<div class="offline-warning" role="alert">Tu navegador no permite descargas offline. Prueba desde Chrome, Edge o Safari actualizado.</div>`}
            <section class="offline-storage reveal" aria-label="Uso de almacenamiento">
                <div class="offline-storage-head"><span>Almacenamiento del dispositivo</span><strong id="offline-storage-text">Calculando…</strong></div>
                <div class="offline-storage-bar"><i id="offline-storage-bar" style="width:0%"></i></div>
                <p>Las descargas ocupan espacio local. Puedes quitarlas en cualquier momento sin afectar tu cuenta.</p>
            </section>
            <section class="v-section">
                <div class="section-heading">
                    <span class="section-kicker">Elige qué guardar</span>
                    <h2 class="section-title">Descargas por grupo</h2>
                </div>
                <div class="offline-grid">${cards}</div>
                <div class="offline-all reveal">
                    <div>
                        <h3>${LumenIcons.download} Todo LUMEN</h3>
                        <p>Formación, oración, devocional y planes en una sola descarga.</p>
                    </div>
                    <div class="offline-all-actions">
                        ${LumenOffline.isDownloaded('todo')
                            ? `<button class="btn btn-outline" type="button" onclick="OfflineView.remove('todo')">Quitar todo</button>`
                            : `<button class="btn btn-primary" type="button" onclick="OfflineView.download('todo', this)">Descargar todo</button>`}
                    </div>
                </div>
                <div class="offline-clear">
                    <button class="btn btn-ghost btn-sm" type="button" onclick="OfflineView.clearAll()">Borrar todas las descargas</button>
                </div>
            </section>
            <p class="plan-note">Consejo: después de descargar, abre LUMEN una vez sin conexión para comprobar que todo está disponible. El contenido de la comunidad se actualiza cuando vuelves a conectarte.</p>
        </div>`;
    },

    init: function() {
        LumenRouter.initScrollReveal();
        this._updateStorage();
    },

    _updateStorage: function() {
        if (typeof LumenOffline === 'undefined') return;
        LumenOffline.storage().then(function(est) {
            const text = document.getElementById('offline-storage-text');
            const bar = document.getElementById('offline-storage-bar');
            if (!text || !bar) return;
            if (!est) { text.textContent = 'No disponible'; return; }
            text.textContent = LumenOffline.formatBytes(est.usage) + ' de ' + LumenOffline.formatBytes(est.quota);
            bar.style.width = est.pct + '%';
        });
    },

    download: function(id, btn) {
        const original = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = 'Preparando…'; }
        LumenOffline.download(id, function(done, total) {
            if (btn) btn.textContent = 'Descargando ' + done + '/' + total;
        }).then(function() {
            LumenUI.showToast('Descarga completada. Ya puedes usar este contenido sin conexión.', 'success');
            OfflineView._rerender();
        }).catch(function(err) {
            if (btn) { btn.disabled = false; btn.textContent = original; }
            LumenUI.showToast(err && err.message ? err.message : 'No se pudo completar la descarga.', 'error');
        });
    },

    remove: function(id) {
        const label = LumenOffline.groups[id] ? LumenOffline.groups[id].label : 'este grupo';
        LumenUI.showConfirm('¿Quitar la descarga de ' + label + '?').then(function(ok) {
            if (!ok) return;
            LumenOffline.remove(id).then(function() {
                LumenUI.showToast('Descarga eliminada.', 'success');
                OfflineView._rerender();
            }).catch(function() {
                LumenUI.showToast('No se pudo quitar la descarga.', 'error');
            });
        });
    },

    clearAll: function() {
        LumenUI.showConfirm('¿Borrar todas las descargas offline?').then(function(ok) {
            if (!ok) return;
            LumenOffline.clearAll().then(function() {
                LumenUI.showToast('Descargas eliminadas.', 'success');
                OfflineView._rerender();
            });
        });
    },

    _rerender: function() {
        const container = document.getElementById('app-container');
        if (!container) return;
        container.innerHTML = this.render();
        this.init();
    }
};
