let currentAboutTab = "juvemar";

function avatarInitials(name) {
    return name.trim().split(/\s+/).slice(0, 2).map(p => p.charAt(0)).join('').toUpperCase();
}

const NosotrosView = {
    render: function() {
        return `
            <div class="view">
                <section class="about-hero reveal">
                    <span class="about-eyebrow">${Icons.cross} Comunidad juvenil · Nuestra Señora de Lourdes</span>
                    <h1 class="about-hero-title">¿Quiénes <em>somos</em>?</h1>
                    <p class="about-hero-sub">Dos hermanadades con una sola vocación: ser jóvenes en salida que se atreven a ser más.</p>
                    <div class="about-tabs" role="tablist" aria-label="Grupos de LUMEN">
                        <button class="about-tab ${currentAboutTab === 'juvemar' ? 'active' : ''}" role="tab" aria-selected="${currentAboutTab === 'juvemar'}" onclick="NosotrosView.changeTab('juvemar')">${Icons.users} Juvemar</button>
                        <button class="about-tab ${currentAboutTab === 'samuel' ? 'active' : ''}" role="tab" aria-selected="${currentAboutTab === 'samuel'}" onclick="NosotrosView.changeTab('samuel')">${Icons.bell} El Llamado de Samuel</button>
                    </div>
                </section>
                <div id="about-content"></div>
            </div>
        `;
    },
    init: function() { this.renderContent(); LumenRouter.initScrollReveal(); },
    changeTab: function(tab) { currentAboutTab = tab; LumenRouter.navigateTo('nosotros'); },
    renderContent: function() {
        const container = document.getElementById('about-content');
        container.innerHTML = currentAboutTab === 'juvemar' ? this.renderJuvemar() : this.renderSamuel();
        LumenRouter.initScrollReveal();
    },
    renderIntro: function(intro) {
        return `
            <section class="about-section about-intro reveal">
                <div class="about-intro-copy">
                    <h2 class="about-section-title">${intro.title}</h2>
                    <p class="about-intro-text">${intro.text}</p>
                    <div class="about-stats">
                        ${intro.stats.map(s => `
                            <div class="about-stat reveal reveal-delay-1">
                                <span class="about-stat-num">${s.num}</span>
                                <span class="about-stat-label">${s.label}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <figure class="about-intro-media reveal reveal-delay-2">
                    <img src="${intro.image}" alt="${intro.imageAlt}" loading="lazy" onerror="this.src='${intro.imageFallback}'">
                    <figcaption>${intro.caption}</figcaption>
                </figure>
            </section>
        `;
    },
    renderTermRows: function(items) {
        return `
            <section class="about-section reveal">
                <h2 class="about-section-title is-center">${items.heading}</h2>
                <div class="term-rows">
                    ${items.rows.map((item, i) => `
                        <article class="term-row reveal reveal-delay-${(i % 4) + 1}">
                            <div class="term-icon">${item.icon}</div>
                            <div class="term-body">
                                <h3>${item.title}</h3>
                                <p>${item.text}</p>
                            </div>
                        </article>
                    `).join('')}
                </div>
            </section>
        `;
    },
    renderLema: function(lema) {
        return `
            <section class="about-section reveal">
                <h2 class="about-section-title is-center">${lema.heading}</h2>
                <div class="lema-grid">
                    ${lema.items.map((item, i) => `
                        <article class="lema-item reveal reveal-delay-${(i % 4) + 1}">
                            <span class="lema-num">0${i + 1}</span>
                            <h3>${item.title}</h3>
                            <p>${item.text}</p>
                        </article>
                    `).join('')}
                </div>
            </section>
        `;
    },
    renderOffers: function(offers) {
        return `
            <section class="about-section reveal">
                <h2 class="about-section-title is-center">${offers.heading}</h2>
                <div class="offers-grid">
                    ${offers.items.map((offer, i) => `
                        <article class="offer-card reveal reveal-delay-${(i % 4) + 1}">
                            <div class="offer-icon">${offer.icon}</div>
                            <h3>${offer.title}</h3>
                            <p>${offer.text}</p>
                        </article>
                    `).join('')}
                </div>
            </section>
        `;
    },
    renderComisiones: function(comisiones) {
        return `
            <section class="about-section reveal">
                <h2 class="about-section-title is-center">${comisiones.heading}</h2>
                <div class="comisiones-grid">
                    ${comisiones.items.map((com, i) => `
                        <article class="comision reveal reveal-delay-${(i % 4) + 1}">
                            <h4>${com.icon} ${com.title}</h4>
                            <p>${com.text}</p>
                        </article>
                    `).join('')}
                </div>
            </section>
        `;
    },
    renderTeam: function(team) {
        return team.map(member => `
            <div class="team-card reveal">
                <div class="team-avatar" aria-hidden="true">${avatarInitials(member.name)}</div>
                <div class="team-role">${member.role}</div>
                <div class="team-name">${member.name}</div>
            </div>
        `).join('');
    },
    renderTeamSection: function(team) {
        return `
            <section class="about-section reveal">
                <h2 class="about-section-title is-center">Equipo de Coordinación</h2>
                <div class="team-grid">${this.renderTeam(team)}</div>
            </section>
        `;
    },
    renderJuvemar: function() {
        const team = [
            { role: "Repetidora", name: "Evanyelina Valbuena" },
            { role: "Repetidor Adjunto", name: "Victor M. Aguillón" },
            { role: "Secretaria", name: "Sofia Serrano" },
            { role: "Asesora", name: "Maria José Rosales" },
            { role: "Guía Espiritual", name: "Padre Juan Navarro" }
        ];

        const intro = {
            title: "Juventud <em>Mariana</em> en Salida",
            text: `Es un grupo juvenil cristiano católico adscrito al servicio de <strong>JovenMision</strong> perteneciente a la parroquia <strong>Nuestra Señora de Lourdes</strong>, en el Barrio San José, Maracaibo. Fue fundado el <strong>19 de octubre del 2025</strong>, durante el Domingo Mundial de las Misiones.`,
            stats: [
                { num: "2025", label: "Fundación" },
                { num: "14–27", label: "Edades del grupo" },
                { num: "Lourdes", label: "Raíz parroquial" }
            ],
            image: "assets/banner_juvemar.jpg",
            imageAlt: "Grupo Juvemar en comunidad",
            imageFallback: "https://images.unsplash.com/photo-1529070538774-1843cb3c1f36?auto=format&fit=crop&w=1400&q=80",
            caption: "En salida desde el 19 de octubre de 2025."
        };

        const nombre = {
            heading: "Nuestro Nombre",
            rows: [
                { icon: Icons.users, title: "Juventud", text: "Somos un grupo de jóvenes entre 14 y 27 años, que hemos decidido ser jóvenes diferentes que se atreven a ser más, como lo decía San Carlo Acutis." },
                { icon: Icons.star, title: "Mariana", text: "Nuestra espiritualidad está ligada al ejemplo de Nuestra Señora de Lourdes (Estrella de la Evangelización). Ella es la guía de nuestro camino y apostolado." },
                { icon: Icons.globe, title: "En Salida", text: "Somos misioneros, siempre motivados a \"hacer lío\" y salir para predicar la Palabra de Dios a todas las naciones. En la misión encontramos a Dios." }
            ]
        };

        const lema = {
            heading: "Nuestro Lema",
            items: [
                { title: "Creer", text: "Nos llama a creer fielmente en las enseñanzas del Señor, en sus mandatos y en la verdad que nos ha revelado como pueblo elegido." },
                { title: "Vivir", text: "Recordatorio de vivir la fe por medio de obras y vida en comunidad, siendo compasivos, misericordiosos y dando testimonio real de Cristo." },
                { title: "Anunciar", text: "Nos invita a predicar la verdad que Cristo nos ha entregado por amor para atraer más obreros a su mies, más jóvenes a su Iglesia." }
            ]
        };

        const offers = {
            heading: "¿Qué ofrecemos?",
            items: [
                { icon: Icons.music, title: "Vivencia Comunitaria y Apostolado", text: "Ofrecemos una vivencia comunitaria de la fe desde diversos apostolados como la música, la formación y la acción social." },
                { icon: Icons.flame, title: "Experiencias Espirituales", text: "Vivimos experiencias enriquecedoras como \"El Llamado de Samuel\" que nos permite responder al Señor diciendo: <em>Habla Señor que tu Siervo Escucha</em>." }
            ]
        };

        const comisiones = {
            heading: "Nuestras Comisiones",
            items: [
                { icon: Icons.music, title: "Música", text: "Encargada de animar la liturgia y las reuniones a través del canto, creando un ambiente de alabanza que disponga el corazón para el encuentro con Dios." },
                { icon: Icons.flame, title: "Espiritualidad", text: "Promueve la vida de oración del grupo, organizando momentos de adoración al Santísimo, rezo del santo rosario y formación espiritual continua." },
                { icon: Icons.users, title: "Protocolo", text: "Se encarga de la logística, bienvenida y atención a los participantes en nuestros retiros y encuentros, asegurando que todo fluya con orden y fraternidad." },
                { icon: Icons.heart, title: "Recreación", text: "Dinamiza los espacios de descanso y fraternidad, integrando dinámicas y juegos que fortalezcan la unidad y la alegría entre los jóvenes." }
            ]
        };

        return this.renderIntro(intro) + this.renderTermRows(nombre) + this.renderLema(lema) + this.renderOffers(offers) + this.renderComisiones(comisiones) + this.renderTeamSection(team);
    },
    renderSamuel: function() {
        const team = [
            { role: "Coordinadora", name: "Maria Celeste Cuartt" },
            { role: "Coordinador", name: "Henry Koussa" },
            { role: "Secretaria", name: "Sofia Pernia" },
            { role: "Asesora", name: "Dayana Larreal" },
            { role: "Asesor", name: "Kendrick Pineda" },
            { role: "Tesorera", name: "Evelyn Fuenmayor" },
            { role: "Guía Espiritual", name: "Padre Juan Navarro" }
        ];

        const intro = {
            title: "Hermandad de <em>El Llamado de Samuel</em>",
            text: `Compuesta por hermanos de Juvemar que han vivido o servido en el Retiro de <strong>El Llamado de Samuel</strong>. Tuvo sus inicios en el año <strong>2022</strong>, formalizándose en diciembre de 2024 con la Primera Edición en Nuestra Señora de Lourdes.`,
            stats: [
                { num: "2022", label: "Inicios" },
                { num: "3", label: "Ediciones del retiro" },
                { num: "+200", label: "Jóvenes alcanzados" }
            ],
            image: "assets/banner_samuel.png",
            imageAlt: "Hermandad de El Llamado de Samuel",
            imageFallback: "https://images.unsplash.com/photo-1507692049790-de5829034338?auto=format&fit=crop&w=1400&q=80",
            caption: "Retiros y encuentros de la hermandad."
        };

        const historia = {
            heading: "Nuestra Historia",
            items: [
                { icon: Icons.calendar, title: "Retiros y Encuentros", text: "Hemos organizado tres ediciones de Samuel, siendo instrumento para que más de 200 jóvenes conozcan la voz de Dios. Hemos participado activamente en hitos como el Encuentro Arquidiocesano de la Arquidiocesis de Maracaibo, haciendo sentir la alegría que Dios nos ha regalado." }
            ]
        };

        const lema = {
            heading: "Nuestro Lema",
            items: [
                { title: "«Habla, Señor»", text: "Pedimos al Señor que nos hable, que nos haga ver el camino que debemos seguir y que nos llame en cada momento de nuestras vidas." },
                { title: "«que tu siervo»", text: "Nos reconocemos como siervos del Señor, entregando nuestra vida por amor, quien nos guía como un buen Pastor y da la vida por cada uno de nosotros." },
                { title: "«escucha»", text: "Nos comprometemos a escuchar su voz en el ruido del mundo o en el silencio de nuestro corazón para ser servidores e instrumentos suyos." }
            ]
        };

        const offers = {
            heading: "¿Qué ofrecemos?",
            items: [
                { icon: Icons.heart, title: "Servicio y Entrega", text: "Una vivencia de la fe basada en el servicio y entrega a los demás. Nos motiva a dejar todo por el todo y a responder al Llamado de Dios. Forma parte de Juvemar como una de las experiencias que rigen nuestra espiritualidad." }
            ]
        };

        return this.renderIntro(intro)
            + this.renderOffers(historia)
            + this.renderLema(lema)
            + this.renderOffers(offers)
            + `
            <section class="about-section reveal">
                <div class="pastoral-alert">${Icons.alert}<p><strong>Importante:</strong> Para formar parte de nuestra hermandad, es indispensable participar activamente de nuestro grupo de apostolado de Juvemar. El Llamado de Samuel es más que un retiro; nos conformamos por personas conscientes de que es necesario conocer a Dios para amarlo verdaderamente.</p></div>
            </section>
            `
            + this.renderTeamSection(team);
    }
};