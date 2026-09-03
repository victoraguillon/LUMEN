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
        formacion: LumenIcons.catecismo,
        oraciones: LumenIcons.oraciones,
        novenas: LumenIcons.novenas,
        santos: LumenIcons.santos,
        glosario: LumenIcons.scroll
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
                <div class="v-header reveal">
                    <span class="v-eyebrow">Tus guardados ${LumenUI.liturgicalBadgeHTML()}</span>
                    <h2 class="v-title">Mis <em>Favoritos</em></h2>
                    <p class="v-sub">Toca ♥ en cualquier sección, oración, novena o santo para guardarlo aquí.</p>
                </div>
                <div class="v-empty reveal" style="max-width:1080px; margin:0 auto;">${typeof Icons !== 'undefined' ? Icons.empty_box : '📭'}<h3>Sin favoritos todavía</h3><p>Explora Formación, Oraciones o Novenas y marca lo que más te guste.</p><button class="btn btn-primary" onclick="LumenRouter.navigateTo('formacion')">Explorar Formación</button></div>
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
                    <span class="fav-ic">${this._groupIcon[kind] || LumenIcons.fav}</span>
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
            <div class="v-header reveal">
                <span class="v-eyebrow">Tus guardados ${LumenUI.liturgicalBadgeHTML()}</span>
                <h2 class="v-title">Mis <em>Favoritos</em></h2>
                <p class="v-sub">${ids.length} elemento${ids.length === 1 ? '' : 's'} guardado${ids.length === 1 ? '' : 's'}.</p>
            </div>
            <div class="v-section" style="padding-top:0;">
                ${blocks}
            </div>
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