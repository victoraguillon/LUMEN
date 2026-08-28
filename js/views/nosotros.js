let currentAboutTab = "juvemar";

const NosotrosView = {
    render: function() {
        return `
            <div class="view">
                <div class="hero reveal" style="padding: 60px 20px; margin-bottom: 40px;">
                    <h1 style="font-size: 36px;">¿Quiénes Somos?</h1>
                    <p>Conoce nuestra identidad, nuestra historia y nuestro equipo de servicio.</p>
                </div>
                
                <div class="about-tabs reveal">
                    <button class="about-tab ${currentAboutTab === 'juvemar' ? 'active' : ''}" onclick="NosotrosView.changeTab('juvemar')">Juvemar</button>
                    <button class="about-tab ${currentAboutTab === 'samuel' ? 'active' : ''}" onclick="NosotrosView.changeTab('samuel')">El Llamado de Samuel</button>
                </div>

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
    renderTeam: function(teamArray) {
        return teamArray.map(member => `
            <div class="team-card reveal">
                <div class="team-photo-wrapper">
                    ${member.photo ? `<img src="${member.photo}" alt="${member.name}">` : Icons.user}
                </div>
                <div class="team-role">${member.role}</div>
                <div class="team-name">${member.name}</div>
            </div>
        `).join('');
    },
    renderJuvemar: function() {
        const team = [
            { role: "Repetidora", name: "Evanyelina Valbuena", photo: "" },
            { role: "Repetidor Adj.", name: "Victor M. Aguillón", photo: "" },
            { role: "Secretaria", name: "Sofia Serrano", photo: "" },
            { role: "Asesora", name: "Maria José Rosales", photo: "" },
            { role: "Guia Espiritual", name: "Padre Juan Navarro", photo: "" }
        ];

        return `
            <img src="assets/banner_juvemar.jpg" class="section-banner reveal" alt="Juvemar" onerror="this.src='https://images.unsplash.com/photo-1529070538774-1843cb3c1f36?auto=format&fit=crop&w=1400&q=80'">
            
            <div class="reveal" style="max-width: 800px; margin: 0 auto 40px; text-align: center;">
                <h2 style="color: var(--celeste-oscuro);">Juventud Mariana en Salida (Juvemar)</h2>
                <p style="color: var(--texto-gris); margin-top: 15px;">
                    Es un grupo juvenil cristiano católico adscrito al servicio de JovenMision perteneciente a la parroquia Nuestra Señora de Lourdes, en el Barrio San José, Maracaibo. Fue fundado el <strong>19 de octubre del 2025</strong>, durante el Domingo Mundial de las Misiones.
                </p>
            </div>

            <h3 class="reveal" style="color: var(--celeste-oscuro); text-align: center; margin-bottom: 20px;">Nuestro Nombre</h3>
            <div class="cards-grid reveal" style="margin-bottom: 50px;">
                <div class="card"><div class="card-header">${Icons.users}<h3>Juventud</h3></div><div class="card-body"><p>Somos un grupo de jóvenes entre 14 y 27 años, que hemos decidido ser jóvenes diferentes que se atreven a ser más, como lo decía San Carlo Acutis.</p></div></div>
                <div class="card"><div class="card-header">${Icons.star}<h3>Mariana</h3></div><div class="card-body"><p>Nuestra espiritualidad está ligada al ejemplo de Nuestra Señora de Lourdes (Estrella de la Evangelización). Ella es la guía de nuestro camino y apostolado.</p></div></div>
                <div class="card"><div class="card-header">${Icons.globe}<h3>En Salida</h3></div><div class="card-body"><p>Somos misioneros, siempre motivados a "hacer lío" y salir para predicar la Palabra de Dios a todas las naciones. En la misión encontramos a Dios.</p></div></div>
            </div>

            <h3 class="reveal" style="color: var(--celeste-oscuro); text-align: center; margin-bottom: 20px;">Nuestro Lema</h3>
            <div class="cards-grid reveal" style="margin-bottom: 50px;">
                <div class="card"><div class="card-header">${Icons.cross}<h3>Creer</h3></div><div class="card-body"><p>Nos llama a creer fielmente en las enseñanzas del Señor, en sus mandatos y en la verdad que nos ha revelado como pueblo elegido.</p></div></div>
                <div class="card"><div class="card-header">${Icons.heart}<h3>Vivir</h3></div><div class="card-body"><p>Recordatorio de vivir la fe por medio de obras y vida en comunidad, siendo compasivos, misericordiosos y dando testimonio real de Cristo.</p></div></div>
                <div class="card"><div class="card-header">${Icons.megaphone}<h3>Anunciar</h3></div><div class="card-body"><p>Nos invita a predicar la verdad que Cristo nos ha entregado por amor para atraer más obreros a su mies, más jóvenes a su Iglesia.</p></div></div>
            </div>

            <h3 class="reveal" style="color: var(--celeste-oscuro); margin-bottom: 20px;">¿Qué ofrecemos?</h3>
            <div class="feature-block reveal"><div class="feature-icon">${Icons.music}</div><div class="feature-text"><h4>Vivencia Comunitaria y Apostolado</h4><p>Ofrecemos una vivencia comunitaria de la fe desde diversas apostolados como la música, la formación y la acción social.</p></div></div>
            <div class="feature-block reveal"><div class="feature-icon">${Icons.flame}</div><div class="feature-text"><h4>Experiencias Espirituales</h4><p>Vivimos experiencias enriquecedoras como "El Llamado de Samuel" que nos permite responder al Señor diciendo: <em>Habla Señor que tu Siervo Escucha</em>.</p></div></div>

            <h3 class="reveal" style="color: var(--celeste-oscuro); margin: 40px 0 20px;">Nuestras Comisiones</h3>
            <div class="cards-grid reveal" style="margin-bottom: 50px;">
                <div class="card"><div class="card-header">${Icons.music}<h3>Música</h3></div><div class="card-body"><p>Encargada de animar la liturgia y las reuniones a través del canto, creando un ambiente de alabanza que disponga el corazón para el encuentro con Dios.</p></div></div>
                <div class="card"><div class="card-header">${Icons.flame}<h3>Espiritualidad</h3></div><div class="card-body"><p>Promueve la vida de oración del grupo, organizando momentos de adoración al Santísimo, rezo del santo rosario y formación espiritual continua.</p></div></div>
                <div class="card"><div class="card-header">${Icons.users}<h3>Protocolo</h3></div><div class="card-body"><p>Se encarga de la logística, bienvenida y atención a los participantes en nuestros retiros y encuentros, asegurando que todo fluya con orden y fraternidad.</p></div></div>
                <div class="card"><div class="card-header">${Icons.heart}<h3>Recreación</h3></div><div class="card-body"><p>Dinamiza los espacios de descanso y fraternidad, integrando dinámicas y juegos que fortalezcan la unidad y la alegría entre los jóvenes.</p></div></div>
            </div>

            <h3 class="reveal" style="color: var(--celeste-oscuro); text-align: center; margin: 50px 0 20px;">Equipo de Coordinación</h3>
            <div class="team-grid reveal">${this.renderTeam(team)}</div>
        `;
    },
    renderSamuel: function() {
        const team = [
            { role: "Coordinadora", name: "Maria Celeste Cuartt", photo: "" },
            { role: "Coordinador", name: "Henry Koussa", photo: "" },
            { role: "Secretaria", name: "Sofia Pernia", photo: "" },
            { role: "Asesora", name: "Dayana Larreal", photo: "" },
            { role: "Asesor", name: "Kendrick Pineda", photo: "" },
            { role: "Tesorera", name: "Evelyn Fuenmayor", photo: "" },
            { role: "Guia Espiritual", name: "Padre Juan Navarro", photo: "" }
        ];

        return `
            <img src="assets/banner_samuel.png" class="section-banner reveal" alt="El Llamado de Samuel" onerror="this.src='https://images.unsplash.com/photo-1507692049790-de5829034338?auto=format&fit=crop&w=1400&q=80'">
            
            <div class="reveal" style="max-width: 800px; margin: 0 auto 40px; text-align: center;">
                <h2 style="color: var(--celeste-oscuro);">Hermandad de "El Llamado de Samuel"</h2>
                <p style="color: var(--texto-gris); margin-top: 15px;">
                    Compuesta por hermanos de Juvemar que han vivido o servido en el Retiro del "El Llamado de Samuel". Tuvo sus inicios en el año 2022, formalizándose en diciembre de 2024 con la Primera Edición en Nuestra Señora de Lourdes.
                </p>
            </div>

            <h3 class="reveal" style="color: var(--celeste-oscuro); margin-bottom: 20px;">Nuestra Historia</h3>
            <div class="feature-block reveal"><div class="feature-icon">${Icons.calendar}</div><div class="feature-text"><h4>Retiros y Encuentros</h4><p>Hemos organizado tres ediciones de Samuel, siendo instrumento para que más de 200 jóvenes conozcan la voz de Dios. Hemos participado activamente en hitos como el Encuentro Arquidiocesano de la Arquidiocesis de Maracaibo, haciendo sentir la alegría que Dios nos ha regalado.</p></div></div>

            <h3 class="reveal" style="color: var(--celeste-oscuro); text-align: center; margin: 50px 0 20px;">Nuestro Lema</h3>
            <div class="cards-grid reveal" style="margin-bottom: 50px;">
                <div class="card"><div class="card-header">${Icons.bell}<h3>"Habla Señor"</h3></div><div class="card-body"><p>Pedimos al Señor que nos hable, que nos haga ver el camino que debemos seguir y que nos llame en cada momento de nuestras vidas.</p></div></div>
                <div class="card"><div class="card-header">${Icons.gift}<h3>"Que tu siervo"</h3></div><div class="card-body"><p>Nos reconocemos como siervos del Señor, entregando nuestra vida por amor, quien nos guía como un buen Pastor y da la vida por cada uno de nosotros.</p></div></div>
                <div class="card"><div class="card-header">${Icons.ear}<h3>"Escucha"</h3></div><div class="card-body"><p>Nos comprometemos a escuchar su voz en el ruido del mundo o en el silencio de nuestro corazón para ser servidores e instrumentos suyos.</p></div></div>
            </div>

            <h3 class="reveal" style="color: var(--celeste-oscuro); margin-bottom: 20px;">¿Qué ofrecemos?</h3>
            <div class="feature-block reveal"><div class="feature-icon">${Icons.heart}</div><div class="feature-text"><h4>Servicio y Entrega</h4><p>Una vivencia de la fe basada en el servicio y entrega a los demás. Nos motiva a dejar todo por el todo y a responder al Llamado de Dios. Forma parte de Juvemar como una de las experiencias que rigen nuestra espiritualidad.</p></div></div>

            <div class="pastoral-alert reveal">${Icons.alert}<p><strong>Importante:</strong> Para formar parte de nuestra hermandad, es indispensable participar activamente de nuestro grupo de apostolado de Juvemar. El Llamado de Samuel es más que un retiro; nos conformamos por personas conscientes de que es necesario conocer a Dios para amarlo verdaderamente.</p></div>

            <h3 class="reveal" style="color: var(--celeste-oscuro); text-align: center; margin: 50px 0 20px;">Equipo de Coordinación</h3>
            <div class="team-grid reveal">${this.renderTeam(team)}</div>
        `;
    }
};