const ContactoView = {
    render: function() {
        return `
            <div class="view">
                <div class="v-header reveal">
                    <span class="v-eyebrow">${Icons.message} Contacto</span>
                    <h2 class="v-title">Contáctanos</h2>
                    <p class="v-sub">Si tienes alguna duda o quieres unirte a nuestra comunidad, escríbenos.</p>
                </div>
                <div class="v-section" style="padding-top:0;">
                <div class="split-container">
                    <div class="contact-info-panel">
                        <h3 style="font-size: 22px; margin-bottom: 15px; font-family:'Sora',sans-serif; font-weight:800;">¡Estamos para servirte!</h3>
                        <p style="opacity: 0.9; margin-bottom: 30px;">Puedes contactarnos directamente a través de WhatsApp o redes sociales.</p>
                        
                        <a href="https://wa.me/584126413737" target="_blank" rel="noopener noreferrer" class="contact-info-item" style="text-decoration: none; color: white;">
                            ${Icons.whatsapp}
                            <div>
                                <strong>Victor M. Aguillon</strong><br>
                                <span style="font-size: 14px; opacity: 0.8;">+58 412-6413737</span>
                            </div>
                        </a>
                        
                        <a href="https://wa.me/584127212080" target="_blank" rel="noopener noreferrer" class="contact-info-item" style="text-decoration: none; color: white;">
                            ${Icons.whatsapp}
                            <div>
                                <strong>Evanyelina Valbuena</strong><br>
                                <span style="font-size: 14px; opacity: 0.8;">+58 412-7212080</span>
                            </div>
                        </a>

                        <a href="https://instagram.com/juvemar_" target="_blank" rel="noopener noreferrer" class="contact-info-item" style="text-decoration: none; color: white;">
                            ${Icons.instagram}
                            <div>
                                <strong>Juvemar</strong><br>
                                <span style="font-size: 14px; opacity: 0.8;">@juvemar_</span>
                            </div>
                        </a>

                        <a href="https://instagram.com/samuellourdes_" target="_blank" rel="noopener noreferrer" class="contact-info-item" style="text-decoration: none; color: white;">
                            ${Icons.instagram}
                            <div>
                                <strong>El Llamado de Samuel</strong><br>
                                <span style="font-size: 14px; opacity: 0.8;">@samuellourdes_</span>
                            </div>
                        </a>
                    </div>

                    <div class="v-card" style="padding: 28px;">
                        <h4 style="font-family:'Sora',sans-serif; font-size:18px; font-weight:700; color: var(--texto-oscuro); margin-bottom: 18px;">Envíanos un mensaje</h4>
                        <form id="contact-form">
                            <div style="position: absolute; left: -9999px; top: auto; width: 1px; height: 1px; overflow: hidden;" aria-hidden="true">
                                <label>No rellenar este campo</label>
                                <input type="text" id="contact-honey" tabindex="-1" autocomplete="off">
                            </div>
                            <div class="v-field"><label>Nombre:</label><input type="text" id="contact-name" autocomplete="name" required></div>
                            <div class="v-field"><label>Correo Electrónico:</label><input type="email" id="contact-email" autocomplete="email" required></div>
                            <div class="v-field"><label>Mensaje:</label><textarea id="contact-message" rows="5" maxlength="1000" required></textarea></div>
                            <button type="submit" class="btn btn-primary btn-block">Enviar Mensaje</button>
                        </form>
                    </div>
                </div>
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
                  if(data.success === 'true' || data.success === true) {
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