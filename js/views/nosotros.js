let currentAboutTab = "juvemar";

function avatarInitials(name) {
    return name.trim().split(/\s+/).slice(0, 2).map(p => p.charAt(0)).join('').toUpperCase();
}

const NosotrosView = {
    route: function() {
        return { parts: currentAboutTab ? [currentAboutTab] : [], query: null };
    },
    applyRoute: function(params) {
        if (params[0] && (params[0] === 'juvemar' || params[0] === 'samuel' || params[0] === 'jovenmision')) currentAboutTab = params[0];
    },

    render: function() {
        return `
            <div class="view">
                <section class="about-hero reveal">
                    <h1 class="about-hero-title">¿Quiénes <em>somos</em>?</h1>
                    <div class="about-tabs" role="tablist" aria-label="Grupos de LUMEN">
                        <button class="about-tab ${currentAboutTab === 'juvemar' ? 'active' : ''}" role="tab" aria-selected="${currentAboutTab === 'juvemar'}" onclick="NosotrosView.changeTab('juvemar')">${Icons.users} Juvemar</button>
                        <button class="about-tab ${currentAboutTab === 'samuel' ? 'active' : ''}" role="tab" aria-selected="${currentAboutTab === 'samuel'}" onclick="NosotrosView.changeTab('samuel')">${Icons.bell} El Llamado de Samuel</button>
                        <button class="about-tab ${currentAboutTab === 'jovenmision' ? 'active' : ''}" role="tab" aria-selected="${currentAboutTab === 'jovenmision'}" onclick="NosotrosView.changeTab('jovenmision')">${Icons.globe} Jovenmisión</button>
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
        const content = {
            juvemar: () => this.renderJuvemar(),
            samuel: () => this.renderSamuel(),
            jovenmision: () => this.renderJovenmision()
        };
        container.innerHTML = content[currentAboutTab]();
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
                { num: "Est. 2025", label: "Fundación" },
                { num: "15–25", label: "Edades del grupo" },
                { num: "JovenMisión", label: "Servicio" }
            ],
            image: "assets/banner_juvemar.jpg",
            imageAlt: "Grupo Juvemar en comunidad",
            imageFallback: "https://images.unsplash.com/photo-1529070538774-1843cb3c1f36?auto=format&fit=crop&w=1400&q=80",
            caption: "En salida desde el 19 de octubre de 2025."
        };

        const nombre = {
            heading: "Nuestro Nombre",
            rows: [
                { icon: Icons.users, title: "Juventud", text: "Somos un grupo de jóvenes entre 15 y 25 años, que hemos decidido ser jóvenes diferentes que se atreven a ser más, como lo decía San Carlo Acutis." },
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
    },

    renderSlides: function(slides) {
        return `
            <section class="about-section reveal">
                <h2 class="about-section-title is-center">Así es <em>Jovenmisión</em></h2>
                <p class="slides-note">La presentación oficial del servicio. Descarga los <a href="assets/Estatutos-de-Jovenmision-2026.pdf" target="_blank" rel="noopener">Estatutos de Jovenmisión 2026</a>.</p>
                <div class="slides-grid">
                    ${slides.map((s, i) => `
                        <figure class="slide-card reveal reveal-delay-${(i % 4) + 1}">
                            <img src="${s.image}" alt="${s.alt}" loading="lazy">
                            <figcaption>${s.caption}</figcaption>
                        </figure>
                    `).join('')}
                </div>
            </section>
        `;
    },

    renderJovenmision: function() {
        const intro = {
            title: "Servicio de <em>Jovenmisión</em>",
            text: `Jovenmisión es el <strong>Servicio de Animación y Cooperación Misionera Juvenil</strong> de Venezuela: un servicio conformado por jóvenes para la evangelización de los jóvenes, que nació en <strong>1983</strong> en el seno de las Obras Misionales Pontificias y hoy acompaña a estaciones y grupos animados en toda la Iglesia. Juvemar forma parte de este servicio.`,
            stats: [
                { num: "Est. 1983", label: "Nace en Venezuela" },
                { num: "16–29", label: "Edad de los miembros" },
                { num: "4", label: "Líneas de acción" }
            ],
            image: "assets/jovenmision_cover.jpg",
            imageAlt: "Portada de la presentación de Jovenmisión",
            imageFallback: "https://images.unsplash.com/photo-1507692049790-de5829034338?auto=format&fit=crop&w=1400&q=80",
            caption: "Servicio de Animación y Cooperación Misionera Juvenil."
        };

        const queEs = {
            heading: "¿Qué es Jovenmisión?",
            rows: [
                { icon: Icons.heart, title: "Un servicio de jóvenes", text: "Conformado por jóvenes para la evangelización de los jóvenes. Ofrece un proceso de espiritualidad, formación, comunión y misión que impulsa la vocación misionera en sus ambientes y en la misión ad gentes, ad intra y ad extra." },
                { icon: Icons.globe, title: "En el corazón de las OMP", text: "Está adscrito a la Pontificia Obra de la Propagación de la Fe (POPF), una de las Obras Misionales Pontificias, de quien recibe acompañamiento y seguimiento más inmediato." },
                { icon: Icons.star, title: "Su lema", text: "«La misión por y para los jóvenes»: jóvenes discípulos misioneros que anuncian la Buena Nueva a otros jóvenes." }
            ]
        };

        const objetivo = {
            heading: "Nuestro Objetivo",
            items: [
                { title: "Objetivo general", text: "Ofrecer un servicio de animación, formación y cooperación misionera que capacite a los jóvenes para la evangelización del mundo juvenil y los estimule al compromiso misionero en sus Iglesias particulares y a la misión ad gentes, ad intra y ad extra." },
                { title: "Encuentro con Cristo", text: "Propiciar espacios y experiencias para el encuentro personal con Jesucristo y animar a responder al mandato misionero de Cristo, viviendo en plenitud la vocación bautismal." },
                { title: "Formación integral", text: "Ofrecer procesos de formación que ayuden a la madurez vocacional y al compromiso misionero y social, informando sobre la vida misionera de la Iglesia." },
                { title: "Impulsar encuentros", text: "Congresos, campamentos locales, nacionales e internacionales, caminatas, jornadas y reuniones de formación y espiritualidad, conforme a la naturaleza de Jovenmisión." },
                { title: "Vocación ad gentes", text: "Promover la vocación particular misionera ad gentes, ad intra y ad extra de los jóvenes, creciendo en la conciencia de su corresponsabilidad en la misión." },
                { title: "Iglesia en salida", text: "Hacer propias las necesidades de la humanidad y de las realidades misioneras, y preparar a los jóvenes para ser levadura misionera en la pastoral juvenil." }
            ]
        };

        const lineas = {
            heading: "Nuestras Líneas de Acción",
            items: [
                { icon: Icons.flame, title: "Espiritualidad misionera", text: "Vivir la unción y el envío del Espíritu Santo (Lc 4,18) es el origen de nuestra inspiración y acción: oración, vida sacramental, Palabra de Dios, retiros y devoción mariana." },
                { icon: Icons.book, title: "Formación", text: "A los pies del Señor Jesús formamos mente y corazón de discípulos misioneros: formación humana y comunitaria, espiritual y doctrinal, pastoral y misionera." },
                { icon: Icons.users, title: "Comunión", text: "Como las primeras comunidades cristianas (Hch 2,42-47), cultivamos relaciones fraternas marcadas por la acogida, el diálogo, el perdón y la alegría compartida." },
                { icon: Icons.globe, title: "Misión", text: "La misión es la naturaleza más íntima de la Iglesia (AG 2). Como Pablo, «¡ay de mí si no evangelizo!» (1 Co 9,16): anunciar la salvación con el testimonio de la vida, de joven a joven." }
            ]
        };

        const historia = {
            heading: "Nuestra Historia",
            items: [
                { icon: Icons.calendar, title: "Un impulso de las OMP", text: "En los años 80, los animadores de las Obras Misionales Pontificias de Venezuela sintieron la necesidad de despertar la vocación misionera entre los jóvenes y pusieron manos a la obra." },
                { icon: Icons.star, title: "Nace: 4 de junio de 1983", text: "Primera reunión de lo que sería Jovenmisión, con el Pbro. Nelson Lachance, el diác. Oscar Martínez y las hermanas Elba Valera, María Virginia Giménez y Orfa Ardila. Ese mismo año se presentó oficialmente en la Reunión Nacional de las OMP." },
                { icon: Icons.sparkles, title: "Los primeros hitos", text: "1984: la I Interestación, donde nace el léxico. 1986: el I Encuentro Nacional. 1988: el I CAJUMI y el estreno del himno. 1989: el primer secretario nacional y los inicios de la escuela de líderes. 1999: Jovenmisión pasa a depender de la Pontificia Obra de la Propagación de la Fe." },
                { icon: Icons.globe, title: "Hoy", text: "Estaciones y grupos animados en las diócesis, la Asamblea Radar, las escuelas de líderes misioneros y la revista Vía Satélite siguen haciendo «la misión por y para los jóvenes» en toda Venezuela." }
            ]
        };

        const actividades = {
            heading: "Actividades que nos identifican",
            items: [
                { icon: Icons.flame, title: "Espiritualidad", text: "Pascua Juvenil Misionera, retiros, adoración y los Encuentros de Formación Virtual (ENFORVI): ocasiones para el encuentro con Jesús." },
                { icon: Icons.book, title: "Formación", text: "Escuela de Formación para Repetidores (EFOR), Escuela de Líderes Misioneros (ELMI I y II) y el Fin de Semana Misionero (FINDEMI) para crecer como discípulos misioneros." },
                { icon: Icons.users, title: "Comunión", text: "Asamblea Radar, Interestaciones, Encuentros Fraternos, la Jornada Nacional (JONAJUMI) y el Congreso Nacional (CONAJUMI) cada 5 años, que celebran el camino recorrido." },
                { icon: Icons.globe, title: "Misión", text: "Campamento Juvenil Misionero (CAJUMI), Salidas Misioneras, En Ondas con Jesús y el envío de jóvenes «en el aire» hacia la misión ad gentes." }
            ]
        };

        const estructura = {
            heading: "Estructura organizativa",
            rows: [
                { icon: Icons.crown, title: "Equipo Satélite", text: "El equipo nacional: el director nacional de las OMP, el secretario nacional de la Pontificia Obra de la Propagación de la Fe y el repetidor nacional. Guía y acompaña todo el servicio." },
                { icon: Icons.compass, title: "Equipo de Enlace", text: "Los animadores provinciales acompañan los procesos de las diócesis de su provincia eclesiástica, incentivando la comunión e integración entre estaciones." },
                { icon: Icons.landmark, title: "Equipo Repetidor Diocesano", text: "Liderado por el repetidor diocesano y su adjunto, anima la vida de las estaciones y grupos animados de la diócesis, en comunión con el director diocesano de las OMP." },
                { icon: Icons.users, title: "Estaciones y grupos animados", text: "En las parroquias y pequeñas comunidades, bajo la guía del párroco, las estaciones son los grupos afiliados que hacen vida la semilla misionera donde están." }
            ]
        };

        const afiliacion = {
            heading: "¿Cómo afiliarte?",
            items: [
                { title: "Grupo animado", text: "Todo grupo juvenil puede iniciar un tiempo de animación misionera. Para afiliarse debe completar al menos seis meses de animación y formación." },
                { title: "Requisitos", text: "Un mínimo de 8 integrantes entre 16 y 29 años. En una estación ya afiliada, para incorporar nuevos miembros se requiere al menos 5 integrantes nuevos." },
                { title: "Informe", text: "El grupo envía la solicitud al repetidor diocesano, quien la presenta al equipo satélite para su evaluación." },
                { title: "La afiliación", text: "Es un acto público en contexto litúrgico. Desde entonces el grupo pasa a llamarse estación y cada miembro recibe el pin con el logo de Jovenmisión." },
                { title: "Actualización", text: "Un año después de afiliada, la estación renueva su afiliación: actualiza sus datos e incorpora a los nuevos miembros." }
            ]
        };

        const slides = [
            { image: "assets/jovenmision_s_nacimiento.jpg", alt: "Cómo nace Jovenmisión", caption: "Cómo nace Jovenmisión: los hitos de sus primeros años." },
            { image: "assets/jovenmision_s_que_es.jpg", alt: "Qué es Jovenmisión", caption: "¿Qué es Jovenmisión? La naturaleza del servicio." },
            { image: "assets/jovenmision_s_lineas.jpg", alt: "Líneas de acción de Jovenmisión", caption: "Las cuatro líneas de acción del servicio." },
            { image: "assets/jovenmision_s_logo.jpg", alt: "Logo de Jovenmisión", caption: "El logo, con su anuncio kerigmático: Cristo nos envía." },
            { image: "assets/jovenmision_s_estructura.jpg", alt: "Estructura organizativa de Jovenmisión", caption: "La estructura organizativa de Jovenmisión." },
            { image: "assets/jovenmision_s_parroquia.jpg", alt: "Jovenmisión en la parroquia", caption: "De la parroquia y la estación a la misión universal." }
        ];

        return this.renderIntro(intro)
            + this.renderTermRows(queEs)
            + this.renderLema(objetivo)
            + this.renderOffers(lineas)
            + this.renderOffers(historia)
            + this.renderComisiones(actividades)
            + this.renderTermRows(estructura)
            + this.renderLema(afiliacion)
            + `
            <section class="about-section reveal">
                <h2 class="about-section-title is-center">Oración del <em>Joven Misionero</em></h2>
                <blockquote class="about-quote">
                    Señor Dios, Padre de todos los hombres, te damos gracias por habernos llamado a la fe y a ser parte de la Santa Iglesia. Aviva en nuestra comunidad cristiana el Espíritu Misionero y ayúdanos a comprender que nuestro primer deber es creer, vivir y anunciar el Evangelio.
                    Haz resonar en nuestros corazones la voz apremiante de Jesús: «Sígueme». Danos el valor de ir predicando la salvación a quienes no te conocen, para que tu mies tenga obreros, tus ovejas pastores buenos, tus hijos hermanos. Por intercesión de la Santísima Virgen María, Estrella de la Evangelización. Amén.
                </blockquote>
            </section>
            `
            + `
            <section class="about-section reveal">
                <div class="pastoral-alert">${Icons.gift}<p><strong>Juvemar es una estación de Jovenmisión.</strong> Nuestro grupo vive este servicio en la parroquia Nuestra Señora de Lourdes y en él se encuentran El Llamado de Samuel y nuestras comisiones. <a href="#/nosotros/juvemar">Conócenos en la pestaña Juvemar.</a></p></div>
            </section>
            `
            + this.renderSlides(slides);
    }
};