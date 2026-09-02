const ContactoView = {
    render: function() {
        const channel = (href, icon, nombre, detalle) => `
            <a href="${href}" target="_blank" rel="noopener noreferrer" class="contact-channel">
                <span class="contact-channel__icon">${icon}</span>
                <span style="min-width:0;">
                    <strong>${nombre}</strong><br>
                    <small>${detalle}</small>
                </span>
            </a>`;

        return `
            <div class="view">
                <header class="v-header reveal">
                    <h1 class="v-title">Contáctanos</h1>
                    <p class="v-sub">Si tienes alguna duda o quieres unirte a nuestra comunidad, no dudes en contactarnos directamente a través de WhatsApp o redes sociales.</p>
                </header>

                <div class="contact-split">
                    <aside class="contact-panel reveal">
                        <h3>¡Estamos para servirte!</h3>
                        <div style="display:flex; flex-direction:column; gap:10px; margin-top:6px;">
                            ${channel('https://wa.me/584126413737', Icons.whatsapp, 'Victor M. Aguillon', '+58 412-6413737')}
                            ${channel('https://wa.me/584127212080', Icons.whatsapp, 'Evanyelina Valbuena', '+58 412-7212080')}
                            ${channel('https://instagram.com/juvemar_', Icons.instagram, 'Juvemar', '@juvemar_')}
                            ${channel('https://instagram.com/samuellourdes_', Icons.instagram, 'El Llamado de Samuel', '@samuellourdes_')}
                        </div>
                    </aside>

                    <section class="contact-form-card reveal reveal-delay-1">
                        <h3>Envíanos un mensaje</h3>
                        <p class="lead">Déjanos tu nombre, correo y mensaje; te responderemos a la brevedad.</p>
                        <form id="contact-form" novalidate>
                            <div class="form-group" style="position: absolute; left: -9999px; top: auto; width: 1px; height: 1px; overflow: hidden;" aria-hidden="true">
                                <label>No rellenar este campo</label>
                                <input type="text" id="contact-honey" tabindex="-1" autocomplete="off">
                            </div>
                            <div class="form-group">
                                <label for="contact-name">Nombre</label>
                                <input type="text" id="contact-name" autocomplete="name" placeholder="Tu nombre" required>
                            </div>
                            <div class="form-group">
                                <label for="contact-email">Correo Electrónico</label>
                                <input type="email" id="contact-email" autocomplete="email" placeholder="tucorreo@ejemplo.com" required>
                            </div>
                            <div class="form-group">
                                <label for="contact-message">Mensaje</label>
                                <textarea id="contact-message" rows="5" maxlength="1000" placeholder="Escribe tu mensaje…" required></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block">Enviar Mensaje</button>
                        </form>
                    </section>
                </div>
            </div>
        `;
    },
    init: function() {
        const renderTime = Date.now();
        document.getElementById('contact-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const honey = document.getElementById('contact-honey').value;
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const message = document.getElementById('contact-message').value;

            const tooFast = (Date.now() - renderTime) < 2000;
            const botDetected = honey !== '' || tooFast;

            if (botDetected) {
                LumenUI.showToast('¡Mensaje enviado con éxito!', 'success');
                document.getElementById('contact-form').reset();
                return;
            }

            if (!name.trim() || !email.trim() || !message.trim()) {
                LumenUI.showToast('Por favor completa todos los campos', 'error');
                return;
            }

            LumenUI.showToast('Enviando mensaje...', 'success');

            fetch('https://formsubmit.co/ajax/juvemar08@gmail.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ _subject: `Nuevo mensaje de contacto de ${name}`, _honey: honey, name: name, email: email, message: message })
            }).then(response => response.json())
              .then(data => {
                  if (data.success === 'true' || data.success === true) {
                      LumenUI.showToast('¡Mensaje enviado con éxito!', 'success');
                      document.getElementById('contact-form').reset();
                      LumenData.saveNotification(`Nuevo mensaje de contacto de ${name}. Revisa tu correo.`, true);
                  } else {
                      LumenUI.showToast('Error al enviar el mensaje', 'error');
                  }
              })
              .catch(() => LumenUI.showToast('Error de conexión', 'error'));
        });
    }
};