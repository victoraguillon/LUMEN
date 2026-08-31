/* Mis Favoritos — agrupados y reordenables por tipo */
const FavoritosView = {
    _groupLabel: {
        formacion: 'Formación',
        oraciones: 'Oraciones',
        novenas: 'Novenas',
        santos: 'Santos',
        glosario: 'Glosario'
    },

    _groupIcon: {
        formacion: '📖',
        oraciones: '🙏',
        novenas: '🕯️',
        santos: '🙏',
        glosario: '📚'
    },

    _open: function(entry) {
        switch (entry.kind) {
            case 'formacion': FormacionView.openFav(entry.id); break;
            case 'oraciones': OracionesView.openFav(entry.id); break;
            case 'novenas': NovenasView.open(entry.id); break;
            case 'santos': FormacionView.openSaintFav(entry.id); break;
            case 'glosario': FormacionView.openGlosFav(); break;
            default: LumenRouter.navigateTo('formacion'); break;
        }
    },

    render: function() {
        const favs = LumenUI.getFavorites();
        const ids = Object.keys(favs);
        if (!ids.length) {
            return `<div class="view">
                <section class="formacion-hero reveal">
                    <div class="hero-label">Guarda lo que te alimenta ${LumenUI.liturgicalBadgeHTML()}</div>
                    <h1 class="grad-title">Mis Favoritos</h1>
                    <p>Toca ♥ en cualquier sección, oración, novena o santo para guardarlo aquí.</p>
                </section>
                <div class="state-container">${typeof Icons !== 'undefined' ? Icons.empty_box : '📭'}<h3>Sin favoritos todavía</h3><p>Explora Formación, Oraciones o Novenas y marca lo que más te guste.</p><button class="btn btn-primary" style="margin-top:15px;" onclick="LumenRouter.navigateTo('formacion')">Explorar Formación</button></div>
            </div>`;
        }

        const groups = {};
        ids.forEach(function(key) {
            const e = favs[key];
            (groups[e.kind] = groups[e.kind] || []).push({ key: key, e: e });
        });

        const blocks = Object.keys(groups).map(function(kind) {
            const row = groups[kind];
            const items = row.map(function(r) {
                const e = r.e;
                return `<div class="fav-item reveal">
                    <span class="fav-ic">${this._groupIcon[kind] || '⭐'}</span>
                    <div class="fav-info">
                        <p class="fav-title">${e.title}</p>
                        <p class="fav-sub">${e.sub || ''}</p>
                    </div>
                    <div class="fav-actions">
                        <button class="btn btn-sm" onclick="FavoritosView._openByName('${e.kind}','${e.id}')">Abrir</button>
                        <button class="fav-btn on" onclick="LumenUI.removeFavorite('${r.key}');LumenRouter.navigateTo('favoritos', true)" aria-label="Quitar">♥</button>
                    </div>
                </div>`;
            }, this).join('');
            return `<section class="favoritos-group reveal">
                <h3>${this._groupIcon[kind] || ''} ${this._groupLabel[kind] || kind} <span class="fm-count">${row.length}</span></h3>
                <div class="favoritos-list">${items}</div>
            </section>`;
        }, this);

        return `<div class="view">
            <section class="formacion-hero reveal">
                <div class="hero-label">Tus guardados ${LumenUI.liturgicalBadgeHTML()}</div>
                <h1 class="grad-title">Mis Favoritos</h1>
                <p>${ids.length} elemento${ids.length === 1 ? '' : 's'} guardado${ids.length === 1 ? '' : 's'}.</p>
            </section>
            ${blocks}
        </div>`;
    },

    init: function() { LumenRouter.initScrollReveal(); }
};

FavoritosView._openByName = function(kind, id) {
    const favs = LumenUI.getFavorites();
    const key = kind + '::' + id;
    const e = favs[key] || { kind: kind, id: id };
    FavoritosView._open(e);
};