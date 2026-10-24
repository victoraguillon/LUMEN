const PLANES_DATA = {
  planes: [
    {
      id: 'adviento',
      season: 'adviento',
      title: 'Adviento: prepara el camino',
      shortTitle: 'Adviento',
      description: 'Un camino de cuatro semanas para preparar el corazón a la venida del Señor. Cada día ofrece una referencia evangélica, una breve reflexión, una oración y un gesto concreto. No sigue las lecturas de un año determinado: es una guía general para vivir el Adviento con esperanza, conversión y alegría.',
      weeks: 4,
      steps: [
        {
          week: 1,
          day: 1,
          title: 'Velad con esperanza',
          gospelRef: 'Lc 21,25-28',
          reflection: 'El Adviento comienza con una llamada a levantar la cabeza. No se trata de mirar el futuro con angustia, sino de reconocer que Dios está cerca y que ninguna noche es definitiva. Velar es mantener el corazón despierto, atento a los signos de su presencia en lo cotidiano. Hoy podemos preguntarnos en qué rincón de mi vida necesito recuperar la esperanza.',
          prayer: 'Señor, aviva en mí la esperanza y ayúdame a esperarte con el corazón despierto. Amén.',
          action: 'Dedica cinco minutos de silencio al comenzar el día y nombra una razón concreta para esperar.'
        },
        {
          week: 1,
          day: 2,
          title: 'El deseo que abre el corazón',
          gospelRef: 'Mc 13,33-37',
          reflection: 'Jesús nos pide estar atentos porque no sabemos la hora. Esa incertidumbre no debe paralizarnos; al contrario, despierta el deseo. El corazón humano fue hecho para algo más grande que lo inmediato, y el Adviento nos invita a nombrar esa sed. Cuando reconocemos que nos falta Dios, empezamos a preparar un espacio para recibirlo. Solo quien se sabe necesitado puede acoger el don que Dios le ofrece.',
          prayer: 'Dios mío, despierta en mí el deseo de ti y no permitas que me conforme con lo que no sacia.',
          action: 'Escribe en un papel una necesidad profunda de tu corazón y preséntala al Señor durante la oración.'
        },
        {
          week: 1,
          day: 3,
          title: 'Una voz en el desierto',
          gospelRef: 'Mc 1,1-8',
          reflection: 'Juan el Bautista aparece en el desierto, un lugar incómodo y silencioso. Su voz nos recuerda que la conversión no nace del ruido, sino de la escucha. El desierto puede dar miedo, pero también purifica la mirada y nos devuelve a lo esencial. Esta semana estamos invitados a hacer un poco de silencio para escuchar qué nos pide Dios. El silencio no nos aleja del mundo, nos devuelve a él con una mirada más limpia.',
          prayer: 'Señor, danos valentía para entrar en el silencio y escuchar tu voz.',
          action: 'Apaga las notificaciones del teléfono durante una hora y ofrece ese silencio como oración.'
        },
        {
          week: 1,
          day: 4,
          title: 'Preparad el camino',
          gospelRef: 'Lc 3,4-6',
          reflection: 'Preparar el camino significa quitar los obstáculos que impiden que Dios llegue a nuestra vida. A veces son rencores antiguos, costumbres que nos endurecen o distracciones que lo ocupan todo. No se trata de hacer grandes cosas, sino de allanar el terreno del corazón. Un pequeño gesto de perdón puede abrir un camino que parecía cerrado. Dios no fuerza la entrada; espera que le abramos la puerta desde dentro.',
          prayer: 'Señor, ayúdame a quitar de mi vida lo que te impide entrar.',
          action: 'Piensa en una persona con la que estás distanciado y da un paso sencillo hacia la reconciliación.'
        },
        {
          week: 1,
          day: 5,
          title: 'La luz que no se apaga',
          gospelRef: 'Jn 1,4-5',
          reflection: 'En medio de las sombras, la luz de Cristo sigue brillando. No es una luz que deslumbra y humilla, sino una luz serena que orienta y da calor. El Adviento nos recuerda que la oscuridad nunca tiene la última palabra. Si hoy sientes que algo se apaga en ti, recuerda que basta una pequeña llama para empezar de nuevo. La esperanza no niega la oscuridad, pero se niega a creer que sea el final.',
          prayer: 'Jesús, luz del mundo, ilumina mis tinieblas y enséñame a caminar con esperanza.',
          action: 'Enciende una vela y, mientras la miras, agradece a Dios tres luces concretas de tu vida.'
        },
        {
          week: 1,
          day: 6,
          title: 'María, la que espera',
          gospelRef: 'Lc 1,26-38',
          reflection: 'María recibe el anuncio del ángel y responde con confianza. No sabe cómo se cumplirá la promesa, pero se abandona a Dios. Su espera no es pasiva: escucha, pregunta, medita y se pone en camino para servir. En ella aprendemos que la fe no elimina las preguntas, sino que nos enseña a sostenerlas con esperanza. Su ejemplo nos invita a sostener la espera con paciencia y con obras.',
          prayer: 'Santa María, enséñame a confiar en Dios también cuando no entiendo sus caminos.',
          action: 'Reza un Ave María pidiendo la gracia de confiar más en Dios.'
        },
        {
          week: 1,
          day: 7,
          title: 'La esperanza de los pequeños',
          gospelRef: 'Lc 10,21',
          reflection: 'Jesús se alegra porque el Padre revela sus misterios a los pequeños. La esperanza cristiana no depende de nuestras fuerzas ni de los grandes logros, sino de la sencillez del corazón. A veces los más pequeños nos enseñan a esperar sin cálculos, con esa confianza limpia que no necesita tenerlo todo bajo control. Hoy estamos invitados a mirar la vida con esa humildad.',
          prayer: 'Padre bueno, haznos pequeños y confiados para recibir tu Reino.',
          action: 'Pide a un niño de tu familia o comunidad que te cuente algo que le haga feliz y escúchalo con atención.'
        },
        {
          week: 2,
          day: 1,
          title: 'La paz empieza en casa',
          gospelRef: 'Mt 5,9',
          reflection: 'Ser constructores de paz comienza en los lugares más cercanos: la familia, el trabajo, la comunidad. No hace falta resolver los conflictos del mundo entero; basta con no alimentar la discordia donde estamos. Una palabra amable, una escucha paciente o un silencio oportuno pueden cambiar el clima de una casa. La paz es un don de Dios y también una tarea cotidiana.',
          prayer: 'Señor, hazme instrumento de tu paz en mi hogar y en mi entorno.',
          action: 'Hoy evita una discusión inútil y responde con serenidad a quien te irrita.'
        },
        {
          week: 2,
          day: 2,
          title: 'Reconciliarse es abrir la puerta',
          gospelRef: 'Mt 5,23-24',
          reflection: 'Jesús nos recuerda que la reconciliación no puede esperar. Si hay algo roto con un hermano, el camino hacia Dios pasa por ese encuentro. No siempre es posible arreglarlo todo, pero sí podemos dar el primer paso: reconocer el daño, pedir perdón o perdonar. La puerta que se abre a la reconciliación deja entrar también la paz de Dios. No se trata de tener razón, sino de recuperar la comunión que el amor desea.',
          prayer: 'Señor, dame humildad para pedir perdón y generosidad para perdonar.',
          action: 'Escribe o envía un mensaje breve a alguien con quien necesitas reconciliarte.'
        },
        {
          week: 2,
          day: 3,
          title: 'Paciencia con los procesos',
          gospelRef: 'Mc 4,26-29',
          reflection: 'La semilla crece sin que el sembrador se dé cuenta. Así ocurre muchas veces con la obra de Dios en nosotros: no vemos resultados inmediatos, pero la gracia trabaja en silencio. La paciencia no es resignación, sino confianza activa en quien hace crecer. Hoy podemos dejar de exigirnos frutos instantáneos y aprender a acompañar los procesos con ternura. Dios no tiene prisa, pero tampoco se detiene; camina con nosotros.',
          prayer: 'Dios paciente, enséñame a esperar sin desanimarme y a confiar en tu ritmo.',
          action: 'Elige un hábito bueno que puedas sostener este mes y hazlo hoy sin pensar en resultados.'
        },
        {
          week: 2,
          day: 4,
          title: 'El valor de la familia',
          gospelRef: 'Lc 2,39-40',
          reflection: 'Jesús creció en una familia concreta, con sus rutinas, sus trabajos y sus vínculos. La familia es el primer lugar donde aprendemos a amar, a pedir perdón y a compartir. No es perfecta, pero puede ser escuela de santidad. En Adviento, podemos preguntarnos cómo cuidar mejor a quienes tenemos más cerca, con gestos pequeños y constantes. Los pequeños gestos repetidos con amor construyen vínculos duraderos.',
          prayer: 'Señor, bendice a mi familia y ayúdanos a crecer en amor y comprensión.',
          action: 'Comparte una comida o un momento sin pantallas con tu familia esta semana.'
        },
        {
          week: 2,
          day: 5,
          title: 'Orar en el silencio',
          gospelRef: 'Mt 6,6',
          reflection: 'Jesús nos invita a entrar en nuestro cuarto y cerrar la puerta para orar al Padre en secreto. El silencio no es vacío: es el espacio donde aprendemos a escuchar. En medio de tantas voces, necesitamos un lugar interior donde solo esté Dios. La oración silenciosa no siempre produce emociones, pero sí va transformando el corazón. A veces basta con estar, sin palabras, dejando que Dios nos mire y nos sane.',
          prayer: 'Padre, enséñame a orar en lo secreto y a descansar en tu presencia.',
          action: 'Busca un lugar tranquilo y pasa diez minutos en silencio delante de Dios.'
        },
        {
          week: 2,
          day: 6,
          title: 'La Palabra ilumina el camino',
          gospelRef: 'Lc 24,32',
          reflection: 'Los discípulos de Emaús reconocieron a Jesús cuando les explicó las Escrituras. La Palabra de Dios tiene la capacidad de encender el corazón y dar sentido al camino. No se trata solo de leer, sino de dejar que esa Palabra nos interpele y nos acompañe. En este Adviento, abrir la Biblia con sencillez puede cambiar nuestra manera de mirar. La Escritura no es un libro cerrado, sino una conversación que sigue abierta.',
          prayer: 'Señor, abre mi corazón para que tu Palabra me ilumine y me transforme.',
          action: 'Lee despacio el Evangelio del día y subraya una frase que te acompañe.'
        },
        {
          week: 2,
          day: 7,
          title: 'Dar sin esperar nada',
          gospelRef: 'Lc 6,38',
          reflection: 'Dar con generosidad ensancha el corazón. Jesús nos asegura que la medida que usemos con los demás será usada con nosotros. No se trata de calcular cuánto damos, sino de ofrecer algo de nosotros mismos: tiempo, escucha, paciencia, un servicio sencillo. La caridad verdadera no busca aplausos; se alegra de hacer el bien porque Dios es bueno. El amor gratuito es la firma de Dios en nuestras acciones.',
          prayer: 'Señor, enséñame a dar con alegría y sin buscar reconocimiento.',
          action: 'Haz hoy un favor a alguien sin contárselo a nadie.'
        },
        {
          week: 3,
          day: 1,
          title: 'Alegraos: el Señor está cerca',
          gospelRef: 'Flp 4,4-5',
          reflection: 'La alegría del Adviento no es euforia, sino una certeza profunda: el Señor está cerca. Incluso cuando la vida pesa, podemos alegrarnos porque Dios no nos abandona. Esta alegría se comparte y se contagia; no depende de que todo salga bien, sino de saber que somos amados. Hoy estamos invitados a dejar que esa cercanía cambie nuestro rostro. La alegría cristiana se prueba en la dificultad y se comparte en la sencillez.',
          prayer: 'Señor, llena mi corazón de una alegría sencilla y verdadera.',
          action: 'Sonríe y saluda con calidez a tres personas con las que te cruces hoy.'
        },
        {
          week: 3,
          day: 2,
          title: 'El pan que alimenta la esperanza',
          gospelRef: 'Jn 6,35',
          reflection: 'Jesús se presenta como el pan de vida. La Eucaristía no es un premio para perfectos, sino alimento para caminantes. En ella recibimos su presencia, su perdón y su fuerza para seguir adelante. Si nos acercamos con fe, incluso nuestra debilidad puede convertirse en un lugar de encuentro con Dios. El Adviento nos prepara para recibirlo con un corazón hambriento.',
          prayer: 'Jesús, pan de vida, alimenta mi fe y mi esperanza.',
          action: 'Si te es posible, participa en la Eucaristía y dedica un momento de acción de gracias.'
        },
        {
          week: 3,
          day: 3,
          title: 'Servir con alegría',
          gospelRef: 'Mc 10,45',
          reflection: 'El Hijo del Hombre vino a servir y no a ser servido. Esa es la medida del amor cristiano: ponerse a disposición de los demás, especialmente de los más necesitados. Servir no nos hace menos; nos parecemos más a Jesús. A veces el servicio es visible y otras veces es discreto, pero siempre deja una huella de amor en el mundo.',
          prayer: 'Señor, dame un corazón servicial y alegre.',
          action: 'Ofrece un servicio concreto a alguien de tu comunidad sin esperar nada a cambio.'
        },
        {
          week: 3,
          day: 4,
          title: 'La humildad que libera',
          gospelRef: 'Lc 14,11',
          reflection: 'Quien se enaltece será humillado, y quien se humilla será enaltecido. La humildad no es pensar mal de uno mismo, sino dejar de vivir centrados en la propia imagen. Nos libera de la necesidad de compararnos y nos permite reconocer los dones de los demás. Un corazón humilde agradece, pide ayuda y sabe pedir perdón sin dramatismos. Reconocer la propia verdad nos permite caminar sin máscaras ni miedos.',
          prayer: 'Señor, líbrame del orgullo y enséñame la libertad de la humildad.',
          action: 'Reconoce hoy en voz alta un don de otra persona y agradécele su ejemplo.'
        },
        {
          week: 3,
          day: 5,
          title: 'Perdonar de corazón',
          gospelRef: 'Mt 18,21-22',
          reflection: 'Pedro pregunta cuántas veces debe perdonar, y Jesús responde con una cifra que significa siempre. Perdonar no es olvidar ni justificar el daño; es soltar el deseo de venganza y entregar el dolor a Dios. Es un camino que a veces dura toda la vida. Cada paso de perdón nos hace más libres y nos acerca a la misericordia del Padre.',
          prayer: 'Señor, dame la gracia de perdonar como tú me perdonas.',
          action: 'Reza por una persona que te ha herido y pide a Dios que bendiga su vida.'
        },
        {
          week: 3,
          day: 6,
          title: 'Ser testigos de la alegría',
          gospelRef: 'Mt 5,14-16',
          reflection: 'Jesús nos dice que somos luz del mundo. No se trata de brillar para nosotros mismos, sino de dejar que nuestras obras buenas lleven a otros hacia Dios. La alegría vivida con sencillez es un testimonio elocuente. En un mundo cansado, un cristiano que sirve con esperanza puede ser una señal clara de que el Evangelio sigue siendo buena noticia.',
          prayer: 'Señor, que mi vida refleje tu luz y atraiga a otros hacia ti.',
          action: 'Comparte hoy una experiencia de esperanza con alguien que esté desanimado.'
        },
        {
          week: 3,
          day: 7,
          title: 'Confiar en la Providencia',
          gospelRef: 'Mt 6,25-34',
          reflection: 'Jesús nos invita a no vivir angustiados por el mañana. La Providencia no significa que no tengamos que trabajar o planificar, sino que podemos hacerlo sin que el miedo nos domine. Dios cuida de nosotros con una ternura que supera nuestros cálculos. Confiar es descansar en que no estamos solos y que cada día trae su propia gracia. La confianza se cultiva recordando cómo Dios nos ha sostenido antes.',
          prayer: 'Padre providente, enséñame a confiar en tu cuidado y a vivir el presente.',
          action: 'Escribe tres preocupaciones y entrégalas a Dios en una breve oración.'
        },
        {
          week: 4,
          day: 1,
          title: 'El amor que se hace pequeño',
          gospelRef: 'Jn 3,16',
          reflection: 'Dios amó tanto al mundo que entregó a su Hijo. Ese amor no se quedó en palabras: se hizo pequeño, frágil, cercano. El Adviento nos prepara para contemplar un misterio que desconcierta: la grandeza de Dios escondida en un niño. Si Dios se hace pequeño, también nosotros podemos aprender a amar en lo pequeño y cotidiano. Amar en lo pequeño es la escuela donde se aprende a amar en lo grande.',
          prayer: 'Dios de amor, ayúdame a reconocer tu grandeza en lo sencillo.',
          action: 'Haz un gesto de cariño a alguien que normalmente pasa desapercibido.'
        },
        {
          week: 4,
          day: 2,
          title: 'José, el hombre justo',
          gospelRef: 'Mt 1,18-24',
          reflection: 'José es presentado como un hombre justo, que no actúa impulsado por el escándalo sino por la misericordia. Ante lo que no entiende, escucha el sueño y obedece con confianza. Su silencio no es ausencia, sino disponibilidad. En él vemos un modelo de padre y esposo que protege, trabaja y confía sin hacer ruido. Su fidelidad cotidiana sostuvo el misterio que Dios le confió.',
          prayer: 'San José, enséñame a confiar en Dios y a cuidar a quienes me confía.',
          action: 'Encomienda a San José tus decisiones de esta semana y pide luz para elegir bien.'
        },
        {
          week: 4,
          day: 3,
          title: 'El sí de María',
          gospelRef: 'Lc 1,38',
          reflection: 'María pronuncia un sí que cambia la historia. No es un sí ciego, sino confiado; no es un sí sin coste, sino generoso. Su respuesta nos muestra que Dios cuenta con nuestra libertad. Decir sí a Dios no siempre es fácil, pero siempre abre un camino de vida. Hoy podemos preguntarnos a qué nos está invitando él. Un sí dicho con confianza puede abrir caminos que no imaginamos.',
          prayer: 'Santa María, ayúdame a decir sí a Dios con confianza y alegría.',
          action: 'Identifica una llamada concreta que has estado posponiendo y responde con un paso pequeño.'
        },
        {
          week: 4,
          day: 4,
          title: 'Aprender a escuchar',
          gospelRef: 'Lc 1,39-45',
          reflection: 'María se pone en camino para visitar a Isabel. No lleva un discurso preparado; lleva su presencia y su servicio. Isabel, a su vez, la bendice y reconoce lo que Dios está haciendo. La visita se convierte en un encuentro de fe y alegría. Escuchar de verdad al otro es una forma de hospedar a Dios en nuestra vida. Escuchar es una forma de decirle al otro que su vida nos importa.',
          prayer: 'Señor, enséñame a escuchar con atención y a visitar a quien necesita compañía.',
          action: 'Llama o visita a una persona mayor o sola y escúchala sin prisa.'
        },
        {
          week: 4,
          day: 5,
          title: 'Dios habita en lo sencillo',
          gospelRef: 'Lc 2,1-7',
          reflection: 'Jesús nace en un lugar humilde, sin comodidades ni protagonismo. Dios no escoge la apariencia ni el poder, sino la sencillez de un pesebre. Esa elección nos revela su cercanía y nos invita a descubrirlo en lo ordinario. A veces buscamos a Dios en lo extraordinario y pasamos por alto su presencia en la vida diaria. La sencillez no es pobreza de espíritu, sino libertad para recibir.',
          prayer: 'Señor, ayúdame a descubrirte en lo sencillo y a valorar lo que tengo.',
          action: 'Ordena un espacio de tu casa con cariño y conviértelo en un lugar de oración.'
        },
        {
          week: 4,
          day: 6,
          title: 'Preparar la casa del corazón',
          gospelRef: 'Lc 3,4',
          reflection: 'Preparar el camino del Señor también es preparar la casa del corazón. Podemos limpiar, ordenar y adornar, pero lo esencial es disponer el interior. ¿Qué necesito soltar para recibir a Jesús con libertad? ¿Qué rencor, qué prisa o qué miedo ocupa demasiado espacio? La preparación exterior puede ayudarnos a recordar la interior. Lo que dejamos entrar en nuestro interior acaba moldeando lo que somos.',
          prayer: 'Señor, prepara mi corazón para recibirte con sencillez.',
          action: 'Dedica un tiempo a revisar tu habitación y regala algo que no necesitas.'
        },
        {
          week: 4,
          day: 7,
          title: 'Emmanuel: Dios con nosotros',
          gospelRef: 'Mt 1,23',
          reflection: 'Emmanuel significa Dios con nosotros. No es una idea abstracta, sino una promesa que se cumple en Jesús. Dios no se queda lejos de nuestras alegrías y tristezas; entra en ellas. Celebrar la Navidad es reconocer que ya no caminamos solos. Esa certeza nos da valor para vivir y esperanza para compartir. Su presencia no nos quita los problemas, pero nos da una compañía que sostiene.',
          prayer: 'Emmanuel, quédate conmigo y con mi familia; no permitas que olvidemos tu presencia.',
          action: 'Antes de dormir, agradece a Dios tres momentos en los que sentiste su compañía.'
        }
      ]
    },
    {
      id: 'navidad',
      season: 'navidad',
      title: 'Navidad: Dios con nosotros',
      shortTitle: 'Navidad',
      description: 'Doce días para contemplar el misterio de la Encarnación, desde la Navidad hasta la Epifanía. El plan invita a acoger al Niño Dios en lo sencillo, a dejar que María y José nos enseñen a confiar y a compartir la alegría de la salvación con todos.',
      weeks: 2,
      steps: [
        {
          week: 1,
          day: 1,
          title: 'Dios nace en la pobreza',
          gospelRef: 'Lc 2,6-7',
          reflection: 'El Hijo de Dios nace en un pesebre, lejos de las comodidades y del reconocimiento. La pobreza del establo no es un detalle accidental: nos revela un Dios que se acerca a los más pequeños. Navidad nos invita a mirar dónde está naciendo Jesús hoy: en los pobres, en los que sufren, en los que no tienen lugar. Acogerlo allí cambia nuestra manera de celebrar.',
          prayer: 'Señor, enséñame a reconocerte en los pobres y a compartir con ellos.',
          action: 'Separa algo de tu ropa o de tu despensa y llévalo a una persona o entidad que lo necesite.'
        },
        {
          week: 1,
          day: 2,
          title: 'Los pastores, primeros invitados',
          gospelRef: 'Lc 2,8-16',
          reflection: 'Los primeros en recibir el anuncio no fueron los poderosos, sino unos pastores que velaban en el campo. Dios elige a los sencillos para confiarles una gran noticia. Ellos dejaron lo que estaban haciendo y fueron a ver. Su prisa es la de quien ha encontrado un tesoro. También nosotros estamos invitados a dejar nuestras ocupaciones para encontrar al Señor.',
          prayer: 'Señor, dame la sencillez y la prisa de los pastores para buscarte.',
          action: 'Visita un belén y detente unos minutos a contemplar la escena.'
        },
        {
          week: 1,
          day: 3,
          title: 'María guarda todo en su corazón',
          gospelRef: 'Lc 2,19',
          reflection: 'María conserva y medita en su corazón lo que ha vivido. No lo entiende todo, pero no se queda en la superficie. Guardar en el corazón es dejar que los acontecimientos maduren y se conviertan en oración. En un tiempo de tantas imágenes y noticias, necesitamos aprender de María a rumiar la vida con calma y a descubrir a Dios en ella.',
          prayer: 'Santa María, enséñame a guardar y meditar las maravillas de Dios.',
          action: 'Escribe en un cuaderno una experiencia de estos días que quieras recordar y agradecer.'
        },
        {
          week: 1,
          day: 4,
          title: 'La alegría de los ángeles',
          gospelRef: 'Lc 2,13-14',
          reflection: 'Los ángeles cantan gloria a Dios y paz a los hombres. La Navidad es una explosión de alegría porque Dios ha cumplido su promesa. Esa paz no es la ausencia de problemas, sino la reconciliación con Dios y con los demás. Cantar la gloria de Dios es reconocer que todo lo bueno viene de él y que su amor sostiene el mundo.',
          prayer: 'Señor, que mi vida cante tu gloria y sea un anuncio de paz.',
          action: 'Aprende o canta un villancico y compártelo con alguien.'
        },
        {
          week: 1,
          day: 5,
          title: 'La luz que ilumina a los pueblos',
          gospelRef: 'Jn 1,9',
          reflection: 'Jesús es la luz verdadera que ilumina a todo hombre. Su nacimiento no es una luz para unos pocos privilegiados, sino para todos los pueblos. La Navidad nos recuerda que la salvación es universal y que nadie queda excluido del amor de Dios. Esa luz nos invita a salir de nuestros círculos y a compartirla con quienes aún no la conocen.',
          prayer: 'Jesús, luz del mundo, ilumina a todos los pueblos y hazme testigo de tu amor.',
          action: 'Reza hoy por una persona de otra cultura o país y por la paz entre los pueblos.'
        },
        {
          week: 1,
          day: 6,
          title: 'Simeón espera la salvación',
          gospelRef: 'Lc 2,25-32',
          reflection: 'Simeón espera con paciencia y reconoce en el niño a la salvación que Dios prometió. Su espera no fue pasiva: vivió con fidelidad y confianza. Al ver a Jesús, puede decir que ya ha visto la luz. La Navidad nos enseña que la espera fiel siempre encuentra su recompensa, aunque llegue de una forma distinta a la que imaginábamos. La fidelidad de una vida entera se resume en un instante de reconocimiento.',
          prayer: 'Señor, dame la esperanza paciente de Simeón para reconocerte cuando llegues.',
          action: 'Acompaña a una persona mayor y pídele que te cuente cómo ha vivido la espera de Dios.'
        },
        {
          week: 1,
          day: 7,
          title: 'La familia que crece en Nazaret',
          gospelRef: 'Lc 2,39-40',
          reflection: 'Jesús crece en una familia sencilla, aprendiendo el oficio de José y el amor de María. La vida oculta de Nazaret nos recuerda que la santidad se cultiva en lo cotidiano: en el trabajo, en la mesa, en los pequeños gestos de cuidado. No hace falta hacer cosas extraordinarias para agradar a Dios; basta con vivir con amor lo de cada día.',
          prayer: 'Señor, santifica mi vida cotidiana y bendice a mi familia.',
          action: 'Haz hoy una tarea de casa con especial cuidado y ofrécela como servicio.'
        },
        {
          week: 2,
          day: 8,
          title: 'Los magos buscan la verdad',
          gospelRef: 'Mt 2,1-2',
          reflection: 'Los magos vienen de lejos buscando al Rey que ha nacido. No se conforman con lo que ya saben; se ponen en camino y preguntan. Su búsqueda nos recuerda que la fe también es un camino de búsqueda sincera. Dios se deja encontrar por quienes lo buscan con humildad y perseverancia, aunque tengan que recorrer largas distancias. Buscar a Dios exige dejar comodidades y aceptar que el camino nos cambie.',
          prayer: 'Señor, mantén vivo en mí el deseo de buscarte y de conocer la verdad.',
          action: 'Dedica un tiempo a formarte en la fe: lee un pasaje del Evangelio con calma.'
        },
        {
          week: 2,
          day: 9,
          title: 'La estrella guía el camino',
          gospelRef: 'Mt 2,9-11',
          reflection: 'La estrella conduce a los magos hasta el lugar donde está el niño. Dios utiliza signos sencillos para guiarnos, pero somos nosotros quienes debemos levantar la mirada y seguir. La estrella no les ahorró el camino, solo les indicó la dirección. En nuestra vida también hay señales que nos orientan si estamos dispuestos a caminar. Dios nos guía, pero nos pide caminar y confiar en la dirección que nos da.',
          prayer: 'Señor, ayúdame a reconocer las señales que me guían hacia ti.',
          action: 'Piensa en una decisión que debes tomar y busca consejo en alguien con experiencia de fe.'
        },
        {
          week: 2,
          day: 10,
          title: 'Herodes y la resistencia a la luz',
          gospelRef: 'Mt 2,13-16',
          reflection: 'Herodes se siente amenazado por el nacimiento del niño y responde con violencia. La luz de Dios incomoda a quien vive encerrado en el poder y el egoísmo. También nosotros podemos resistirnos a la verdad cuando nos exige cambiar. La Navidad nos invita a examinar qué actitudes nuestras apagan la luz y a pedir la gracia de un corazón disponible.',
          prayer: 'Señor, líbrame del miedo y del egoísmo que me impiden acogerte.',
          action: 'Reconoce ante Dios una actitud que necesitas cambiar y pide ayuda para hacerlo.'
        },
        {
          week: 2,
          day: 11,
          title: 'La huida y la confianza de José',
          gospelRef: 'Mt 2,13-15',
          reflection: 'José se levanta de noche y huye con el niño y su madre. No entiende todo, pero confía y protege. La Sagrada Familia conoce el exilio y el miedo, y así se hace cercana a tantos migrantes y familias que buscan seguridad. Su ejemplo nos enseña que la confianza en Dios no elimina las dificultades, pero nos da fuerza para atravesarlas.',
          prayer: 'San José, protege a las familias que sufren y enséñanos a confiar en Dios.',
          action: 'Reza por los migrantes y, si puedes, colabora con una obra que los ayude.'
        },
        {
          week: 2,
          day: 12,
          title: 'Epifanía: la salvación es para todos',
          gospelRef: 'Mt 2,11',
          reflection: 'Los magos postrados ante el niño ofrecen oro, incienso y mirra. Son extranjeros, pero son los primeros en reconocer al Salvador. La Epifanía nos revela que Dios no pertenece a un grupo privilegiado: su amor abraza a todos los pueblos. Celebrar esta fiesta es comprometernos a construir una comunidad abierta, donde nadie se sienta excluido. La universalidad del Evangelio comienza en la acogida concreta de cada persona.',
          prayer: 'Señor, hazme instrumento de tu amor universal y derriba en mí todo prejuicio.',
          action: 'Acoge con especial atención a alguien que piensa o vive de manera distinta a la tuya.'
        }
      ]
    },
    {
      id: 'cuaresma',
      season: 'cuaresma',
      title: 'Cuaresma: vuelve a casa',
      shortTitle: 'Cuaresma',
      description: 'Cuarenta pasos de conversión para recorrer la Cuaresma con oración, ayuno y caridad. Los domingos son descanso y no se cuentan como días de camino: son un espacio para celebrar la Pascua del Señor y recuperar fuerzas. Las referencias evangélicas son orientativas y no dependen de un año litúrgico concreto.',
      weeks: 6,
      steps: [
        {
          week: 1,
          day: 1,
          title: 'Ceniza: empezar de nuevo',
          gospelRef: 'Mt 6,1-6',
          reflection: 'La ceniza nos recuerda que somos frágiles y que necesitamos a Dios. No es un gesto para exhibir la propia piedad, sino una invitación a empezar de nuevo con humildad. La Cuaresma nos ofrece un tiempo para revisar la vida y volver a lo esencial. Hoy podemos preguntarnos qué queremos dejar atrás y qué queremos abrazar de nuevo. Dios no se cansa de ofrecernos un comienzo nuevo cada día.',
          prayer: 'Señor, reconozco mi fragilidad; ayúdame a comenzar este camino con humildad.',
          action: 'Haz un examen breve de tu vida y escribe un propósito concreto para esta Cuaresma.'
        },
        {
          week: 1,
          day: 2,
          title: 'El desierto y la tentación',
          gospelRef: 'Mt 4,1-11',
          reflection: 'Jesús es llevado al desierto y allí es tentado. El desierto es un lugar de prueba, pero también de encuentro con Dios. Las tentaciones nos revelan nuestras dependencias y nos invitan a elegir lo que realmente importa. No estamos solos en la lucha: la gracia de Dios nos sostiene y nos enseña a resistir con confianza. Reconocer la propia debilidad es el primer paso para dejar que Dios nos fortalezca.',
          prayer: 'Señor, fortalece mi voluntad y ayúdame a vencer las tentaciones que me alejan de ti.',
          action: 'Identifica una tentación habitual y, cuando llegue hoy, detente y reza una breve oración.'
        },
        {
          week: 1,
          day: 3,
          title: 'Convertirse es volver a casa',
          gospelRef: 'Lc 15,11-24',
          reflection: 'El hijo pródigo se marcha, lo pierde todo y decide volver. Su regreso no es solo un cambio de lugar, sino un cambio de corazón. Dios nos espera siempre con los brazos abiertos, sin humillarnos ni reprocharnos. La conversión es ese movimiento de volver a casa, de reconocer que lejos del Padre no hay plenitud. La conversión no es un logro nuestro, sino una respuesta a un amor que nos espera.',
          prayer: 'Padre misericordioso, recíbeme como al hijo que vuelve a casa.',
          action: 'Si hace tiempo que no te confiesas, ponte una fecha para hacerlo esta Cuaresma.'
        },
        {
          week: 1,
          day: 4,
          title: 'El ayuno que agrada a Dios',
          gospelRef: 'Is 58,6-7',
          reflection: 'El verdadero ayuno no consiste solo en privarse de comida, sino en soltar todo lo que nos esclaviza para servir mejor. Dios nos pide desatar las ataduras, compartir el pan y no dar la espalda a los hermanos. Ayunar es liberar el corazón para amar. Hoy podemos preguntarnos de qué necesitamos ayunar para ser más libres. El ayuno verdadero nos hace más atentos a las necesidades de los demás.',
          prayer: 'Señor, enséñame a ayunar de lo que me impide amarte y servirte.',
          action: 'Ayuna hoy de una queja o de una crítica y ofrece ese silencio como oración.'
        },
        {
          week: 1,
          day: 5,
          title: 'La limosna que libera',
          gospelRef: 'Mt 6,2-4',
          reflection: 'La limosna no es solo dar dinero; es compartir la vida con quien lo necesita. Jesús nos pide hacerlo sin buscar reconocimiento, con sencillez y alegría. Dar nos libera del egoísmo y nos ayuda a descubrir que todo lo que tenemos es un don. La caridad concreta transforma tanto al que recibe como al que da. Compartir lo que tenemos nos recuerda que nada es solo nuestro.',
          prayer: 'Señor, abre mis manos y mi corazón para compartir con los demás.',
          action: 'Haz una donación sencilla a una obra de caridad o ayuda a alguien que lo necesite.'
        },
        {
          week: 1,
          day: 6,
          title: 'Orar sin ruido',
          gospelRef: 'Mt 6,5-8',
          reflection: 'Jesús nos pide orar sin hacerlo para ser vistos. La oración auténtica nace del corazón y busca a Dios, no la admiración de los demás. El silencio y la discreción nos ayudan a estar disponibles. No hace falta decir muchas palabras; basta con presentarnos ante Dios con sencillez y confianza, sabiendo que él ya conoce lo que necesitamos. La oración discreta crece lejos de la mirada de los demás y cerca de Dios.',
          prayer: 'Padre, enséñame a orar con sinceridad y a buscar solo tu presencia.',
          action: 'Reza hoy en un lugar apartado, sin distracciones, durante al menos diez minutos.'
        },
        {
          week: 1,
          day: 7,
          title: 'La cruz, escuela de amor',
          gospelRef: 'Lc 9,23',
          reflection: 'Jesús nos invita a cargar con nuestra cruz y seguirlo. La cruz no es un castigo, sino el lugar donde el amor se entrega hasta el extremo. Cargar la cruz es aceptar las dificultades sin perder la esperanza y ofrecerlas por amor. No estamos invitados a buscarlas, pero sí a atravesarlas con Cristo, sabiendo que no estamos solos. No se trata de resignarse, sino de entregar el dolor con confianza.',
          prayer: 'Jesús, ayúdame a cargar mi cruz contigo y a descubrir en ella tu amor.',
          action: 'Ofrece a Dios una dificultad concreta de tu día y pide fuerza para llevarla con paciencia.'
        },
        {
          week: 2,
          day: 1,
          title: 'La misericordia del Padre',
          gospelRef: 'Lc 15,11-32',
          reflection: 'El padre de la parábola sale al encuentro del hijo que vuelve y también del hijo que se queda resentido. Su amor es más grande que las ofensas y los cálculos. La Cuaresma nos invita a dejarnos abrazar por ese Padre y a aprender de él. La misericordia no niega el daño, pero lo atraviesa con un amor que siempre da otra oportunidad.',
          prayer: 'Padre bueno, déjame experimentar tu abrazo y enséñame a ser misericordioso.',
          action: 'Ten un gesto de misericordia con alguien que te haya decepcionado.'
        },
        {
          week: 2,
          day: 2,
          title: 'Perdonar setenta veces siete',
          gospelRef: 'Mt 18,21-22',
          reflection: 'Jesús amplía sin medida el deber de perdonar. No se trata de olvidar el daño ni de permitir abusos, sino de no dejar que el rencor gobierne la vida. Perdonar es un proceso que puede necesitar tiempo y ayuda. Cada vez que soltamos un poco de rencor, el corazón se vuelve más libre y se parece más al de Dios.',
          prayer: 'Señor, dame la gracia de perdonar y de vivir sin rencor.',
          action: 'Piensa en una persona a la que te cuesta perdonar y reza por ella durante un minuto.'
        },
        {
          week: 2,
          day: 3,
          title: 'El examen de conciencia',
          gospelRef: 'Sal 139,23-24',
          reflection: 'Examina mi corazón, Señor, y muéstrame el camino. El examen de conciencia no es una lista de culpas, sino un encuentro honesto con Dios. Nos ayuda a reconocer lo bueno que él ha sembrado y lo que necesita sanación. Hacerlo con serenidad y sin dureza nos permite crecer y pedir ayuda concreta para cambiar. Unos minutos al final del día pueden transformar nuestra manera de vivir.',
          prayer: 'Señor, ilumina mi conciencia y ayúdame a reconocer tu verdad.',
          action: 'Antes de dormir, repasa tu día: agradece, reconoce una falta y pide ayuda para mañana.'
        },
        {
          week: 2,
          day: 4,
          title: 'Vencer la soberbia',
          gospelRef: 'Lc 18,9-14',
          reflection: 'El fariseo ora seguro de sí mismo, mientras el publicano reconoce su necesidad de Dios. La soberbia nos hace compararnos y despreciar a los demás; la humildad nos abre a la gracia. No se trata de despreciarnos, sino de reconocer la verdad: todo lo bueno es don. La Cuaresma nos invita a orar como el publicano, con el corazón abierto.',
          prayer: 'Señor, ten compasión de mí, que soy pecador y necesito tu misericordia.',
          action: 'Pide perdón a alguien a quien hayas juzgado con dureza.'
        },
        {
          week: 2,
          day: 5,
          title: 'La caridad concreta',
          gospelRef: 'Mt 25,35-40',
          reflection: 'Jesús se identifica con el hambriento, el sediento, el enfermo y el encarcelado. La caridad no es una idea vaga: se hace concreta en gestos que alivian el sufrimiento. Cada persona necesitada es una ocasión de encuentro con Cristo. Hoy podemos preguntarnos qué gesto pequeño está a nuestro alcance y hacerlo con amor. La Cuaresma nos invita a no quedarnos en buenos deseos.',
          prayer: 'Señor, ayúdame a reconocerte en cada persona necesitada.',
          action: 'Averigua qué necesita alguien cercano y ayúdalo de forma concreta.'
        },
        {
          week: 2,
          day: 6,
          title: 'El silencio que sana',
          gospelRef: 'Mc 1,35',
          reflection: 'Jesús se levanta antes del amanecer y busca un lugar solitario para orar. En medio de la actividad, necesita silencio para estar con el Padre. También nosotros estamos llamados a crear espacios de quietud, aunque sea breves. El silencio no es huir del mundo, sino recuperar la calma interior para poder vivir con amor y claridad. En el silencio aprendemos a distinguir la voz de Dios de tantos ruidos.',
          prayer: 'Señor, enséñame a buscar el silencio que me devuelve a ti.',
          action: 'Pasa quince minutos sin pantallas y sin ruido, simplemente en presencia de Dios.'
        },
        {
          week: 2,
          day: 7,
          title: 'María al pie de la cruz',
          gospelRef: 'Jn 19,25-27',
          reflection: 'María permanece de pie junto a la cruz de su Hijo. No huye del dolor; acompaña con una fidelidad silenciosa. Su presencia nos enseña que estar cerca de quien sufre también es una forma de amor. Ella nos recibe como hijos y nos invita a sostener a los demás en sus momentos más oscuros, sin necesidad de palabras. Su fidelidad nos enseña que el amor verdadero permanece cuando todo duele.',
          prayer: 'Santa María, enséñame a permanecer junto a quienes sufren.',
          action: 'Acompaña a una persona que está pasando por un momento difícil, aunque sea con una llamada.'
        },
        {
          week: 3,
          day: 1,
          title: 'El agua viva',
          gospelRef: 'Jn 4,5-14',
          reflection: 'Jesús ofrece a la samaritana un agua que calma la sed más profunda. Todos buscamos algo que dé sentido a la vida, pero muchas veces bebemos de fuentes que no sacian. El agua viva es el amor de Dios, que se entrega sin condiciones. La Cuaresma nos invita a reconocer nuestra sed y a pedirle al Señor que la sacie.',
          prayer: 'Jesús, dame de esa agua que sacia la sed del corazón.',
          action: 'Identifica qué fuente de satisfacción te está dejando vacío y sustitúyela hoy por un momento de oración.'
        },
        {
          week: 3,
          day: 2,
          title: 'La samaritana y la sed de Dios',
          gospelRef: 'Jn 4,23-24',
          reflection: 'Jesús le dice a la samaritana que el Padre busca adoradores que lo hagan en espíritu y verdad. La fe no es un conjunto de gestos vacíos, sino una relación viva. Dios nos busca primero, incluso cuando nosotros nos hemos alejado. La samaritana descubre que el lugar de encuentro no es solo un monte, sino el corazón sincero. Dios nos busca primero, incluso cuando nosotros no sabemos que lo necesitamos.',
          prayer: 'Padre, enséñame a adorarte en espíritu y en verdad.',
          action: 'Participa en una celebración litúrgica con atención, sin prisa por salir.'
        },
        {
          week: 3,
          day: 3,
          title: 'El hijo pródigo vuelve',
          gospelRef: 'Lc 15,20',
          reflection: 'El padre corre al encuentro del hijo cuando aún está lejos. No espera a que llegue con un discurso perfecto; sale a su encuentro. Dios no se cansa de esperarnos ni de buscarnos. Su amor siempre da el primer paso. Esta imagen nos consuela y nos invita a confiar en que nunca es tarde para volver a casa. Dejarnos reconciliar es permitir que Dios sane lo que nosotros no podemos.',
          prayer: 'Padre, gracias por salir a mi encuentro; ayúdame a volver a ti.',
          action: 'Da el primer paso para reencontrarte con alguien de tu familia o comunidad.'
        },
        {
          week: 3,
          day: 4,
          title: 'La alegría del perdón',
          gospelRef: 'Lc 15,7',
          reflection: 'Jesús dice que hay más alegría en el cielo por un pecador que se convierte que por noventa y nueve justos que no necesitan conversión. El perdón de Dios es motivo de fiesta. No somos un problema que resolver, sino hijos que vuelven. La Cuaresma nos invita a dejarnos perdonar y a celebrar la misericordia que nos devuelve la dignidad.',
          prayer: 'Señor, llena mi corazón con la alegría de tu perdón.',
          action: 'Celebra el sacramento de la reconciliación o prepárate para hacerlo pronto.'
        },
        {
          week: 3,
          day: 5,
          title: 'Caminar con los pobres',
          gospelRef: 'Mt 25,40',
          reflection: 'Lo que hacemos por el más pequeño de los hermanos, lo hacemos por Jesús. La pobreza tiene muchas formas: falta de dinero, de compañía, de oportunidades, de dignidad. La Cuaresma nos invita a salir de nosotros mismos y a caminar con quienes están en los márgenes. No se trata de dar lo que nos sobra, sino de compartir la vida.',
          prayer: 'Señor, enséñame a ver tu rostro en los pobres y a servirlos con amor.',
          action: 'Infórmate sobre una necesidad de tu barrio y colabora con una iniciativa que la atienda.'
        },
        {
          week: 3,
          day: 6,
          title: 'La humildad de servir',
          gospelRef: 'Jn 13,12-15',
          reflection: 'Jesús lava los pies de sus discípulos, incluso los de quien lo va a traicionar. El servicio verdadero no elige a los más agradecidos ni espera recompensa. Lavar los pies es inclinarse ante el otro y reconocer su dignidad. La Cuaresma nos invita a servir sin ruido, con la humildad de quien sabe que también necesita ser servido. Servir sin ruido es una de las formas más puras de amar.',
          prayer: 'Jesús, enséñame a servir como tú, con humildad y sin condiciones.',
          action: 'Haz hoy una tarea que otros evitan o que pasa desapercibida en tu casa o comunidad.'
        },
        {
          week: 3,
          day: 7,
          title: 'La paciencia en la prueba',
          gospelRef: 'Rom 5,3-5',
          reflection: 'La tribulación produce paciencia, la paciencia esperanza, y la esperanza no defrauda. Pablo nos recuerda que el sufrimiento puede convertirse en un camino de maduración. No se trata de idealizar el dolor, sino de confiar en que Dios puede escribir derecho con renglones torcidos. La esperanza cristiana no es ingenuidad: es certeza de que el amor tiene la última palabra.',
          prayer: 'Señor, dame paciencia y esperanza en medio de las dificultades.',
          action: 'Piensa en una prueba actual y escribe qué te está enseñando.'
        },
        {
          week: 4,
          day: 1,
          title: 'La luz de Cristo',
          gospelRef: 'Jn 8,12',
          reflection: 'Jesús se presenta como la luz del mundo y promete que quien lo sigue no caminará en tinieblas. La luz no elimina las sombras de golpe, pero nos permite ver el camino. Seguir a Cristo es elegir una dirección y dejar que su verdad ilumine nuestras decisiones. La Cuaresma nos invita a caminar hacia la luz, aunque el camino exija soltar cosas.',
          prayer: 'Jesús, luz verdadera, ilumina mi camino y no permitas que me pierda.',
          action: 'Busca un momento para estar a oscuras y en silencio, y enciende una luz mientras rezas.'
        },
        {
          week: 4,
          day: 2,
          title: 'El ciego de nacimiento',
          gospelRef: 'Jn 9,1-7',
          reflection: 'El ciego de nacimiento recupera la vista después de lavarse en la piscina de Siloé. Su sanación es también un camino de fe: primero cree un poco, luego más. La ceguera no es solo física; todos tenemos zonas donde no vemos bien. La Cuaresma nos invita a dejar que Jesús toque nuestros ojos y nos enseñe a mirar con verdad.',
          prayer: 'Señor, abre los ojos de mi fe y ayúdame a verte en los demás.',
          action: 'Pide perdón a alguien a quien no supiste ver o valorar.'
        },
        {
          week: 4,
          day: 3,
          title: 'Ver con los ojos del corazón',
          gospelRef: 'Ef 1,18',
          reflection: 'Pablo pide que se iluminen los ojos del corazón para conocer la esperanza a la que hemos sido llamados. Ver con el corazón es mirar más allá de las apariencias y descubrir la dignidad de cada persona. Es un don que debemos pedir, porque solos tendemos a juzgar por lo externo. La Cuaresma nos invita a educar la mirada en la misericordia.',
          prayer: 'Señor, ilumina los ojos de mi corazón para verte en todas las cosas.',
          action: 'Observa a alguien sin juzgar y descubre en esa persona un don de Dios.'
        },
        {
          week: 4,
          day: 4,
          title: 'La esperanza que no defrauda',
          gospelRef: 'Rom 5,5',
          reflection: 'La esperanza cristiana no se basa en que todo salga bien, sino en el amor de Dios derramado en nuestros corazones. Esa esperanza no defrauda porque no depende de nuestras fuerzas. Incluso cuando los planes fallan, Dios sigue fiel. La Cuaresma nos invita a apoyar la vida en esa roca firme y a compartirla con quienes han perdido la esperanza.',
          prayer: 'Señor, afianza en mí la esperanza que nace de tu amor.',
          action: 'Anima hoy a alguien que esté desanimado, recordándole que no está solo.'
        },
        {
          week: 4,
          day: 5,
          title: 'El valor de la comunidad',
          gospelRef: 'Mt 18,20',
          reflection: 'Donde dos o tres se reúnen en el nombre de Jesús, él está en medio de ellos. La fe no es un camino solitario; se vive y se sostiene en comunidad. Compartir la oración, la alegría y las dificultades nos ayuda a no desanimarnos. La Cuaresma nos invita a valorar los pequeños grupos donde podemos crecer juntos y apoyarnos mutuamente.',
          prayer: 'Señor, ayúdame a vivir mi fe en comunidad y a ser apoyo para otros.',
          action: 'Participa en un grupo parroquial o reúnete con alguien para rezar juntos.'
        },
        {
          week: 4,
          day: 6,
          title: 'La reconciliación sacramental',
          gospelRef: 'Jn 20,22-23',
          reflection: 'Jesús sopla sobre los discípulos y les da el poder de perdonar los pecados. La reconciliación sacramental es un regalo para volver a empezar, no un tribunal. En ella Dios nos abraza, nos devuelve la paz y nos fortalece para seguir caminando. La Cuaresma es un tiempo especialmente propicio para acercarnos con confianza a este sacramento. No es un examen para condenarnos, sino un encuentro para sanar.',
          prayer: 'Señor, gracias por el regalo del perdón; dame valentía para acercarme a él.',
          action: 'Reserva un momento esta semana para confesarte y preparar tu corazón.'
        },
        {
          week: 4,
          day: 7,
          title: 'El amor a los enemigos',
          gospelRef: 'Mt 5,43-48',
          reflection: 'Jesús nos pide amar a los enemigos y orar por quienes nos persiguen. No es un amor de sentimiento, sino de decisión: buscar el bien del otro aunque no lo merezca. Esta es la medida de la santidad que el Padre nos propone. La Cuaresma nos invita a dejar que el amor de Dios transforme nuestras relaciones más difíciles. El perdón no cambia al otro por arte de magia, pero nos libera a nosotros.',
          prayer: 'Señor, enséñame a amar a quien me cuesta amar y a buscar su bien.',
          action: 'Reza hoy por alguien que te haya hecho daño y pide a Dios que lo bendiga.'
        },
        {
          week: 5,
          day: 1,
          title: 'La resurrección de Lázaro',
          gospelRef: 'Jn 11,1-44',
          reflection: 'Jesús llega cuando Lázaro ya ha muerto y llora con las hermanas. La muerte parece tener la última palabra, pero él llama a su amigo a la vida. La Cuaresma nos prepara para creer que Dios puede devolver la vida a lo que parece seco. Tal vez haya áreas de nuestra existencia que necesitan ese llamado: sal fuera, vive. Dios puede abrir caminos donde nosotros solo vemos un final.',
          prayer: 'Señor, llama a la vida lo que en mí está dormido o herido.',
          action: 'Identifica un área de tu vida que sientes muerta y da hoy un paso para revivirla.'
        },
        {
          week: 5,
          day: 2,
          title: 'Jesús llora con nosotros',
          gospelRef: 'Jn 11,35',
          reflection: 'Jesús llora junto al sepulcro de su amigo. Dios no es indiferente al dolor humano; se conmueve y acompaña. Saber que él también llora nos permite presentarle nuestras tristezas sin sentirnos débiles. La Cuaresma no nos pide disimular el dolor, sino atravesarlo con la certeza de que no estamos solos. El llanto compartido también es una forma de oración. Nuestro llanto también puede ser una oración cuando se lo entregamos.',
          prayer: 'Jesús, gracias por llorar conmigo; recibe mis tristezas y dame consuelo.',
          action: 'Permítete hoy llorar o expresar una tristeza que has estado guardando, y háblale a Dios de ella.'
        },
        {
          week: 5,
          day: 3,
          title: 'La fe que sostiene',
          gospelRef: 'Mc 9,23-24',
          reflection: 'Un padre pide ayuda a Jesús y exclama: creo, pero aumenta mi fe. Esa oración honesta nos representa a muchos. La fe no es tenerlo todo resuelto, sino seguir confiando incluso con dudas. Dios no se asusta de nuestras preguntas; nos acompaña en ellas. La Cuaresma nos invita a presentarle al Señor nuestra fe incompleta y a pedirle que la fortalezca.',
          prayer: 'Señor, creo; ayuda a mi incredulidad y aumenta mi fe.',
          action: 'Escribe una duda o un miedo que tengas y preséntalo a Dios en oración.'
        },
        {
          week: 5,
          day: 4,
          title: 'El grano que muere',
          gospelRef: 'Jn 12,24',
          reflection: 'Jesús dice que si el grano de trigo no muere, queda solo; pero si muere, da mucho fruto. La fecundidad pasa por entregar algo de nosotros mismos. No se trata de buscar sufrimiento, sino de aceptar que el amor implica renuncia y que hay cosas que deben morir para que otras nazcan. La Cuaresma nos invita a confiar en esa promesa.',
          prayer: 'Señor, enséñame a entregar lo que sea necesario para dar fruto.',
          action: 'Renuncia hoy a algo que te gusta para ofrecerlo por una intención concreta.'
        },
        {
          week: 5,
          day: 5,
          title: 'La misión de anunciar',
          gospelRef: 'Mc 16,15',
          reflection: 'Jesús envía a sus discípulos a anunciar el Evangelio a toda la creación. La misión no es solo tarea de especialistas; cada bautizado está llamado a dar testimonio. A veces anunciar significa hablar, y otras veces consiste en servir y acompañar. La Cuaresma nos invita a preguntarnos cómo estamos compartiendo nuestra fe con quienes nos rodean. La alegría del Evangelio se transmite mejor con la vida que con discursos.',
          prayer: 'Señor, hazme testigo valiente y alegre de tu Evangelio.',
          action: 'Comparte hoy con alguien, de forma sencilla, algo que Dios ha hecho en tu vida.'
        },
        {
          week: 5,
          day: 6,
          title: 'La Virgen de los Dolores',
          gospelRef: 'Jn 19,26-27',
          reflection: 'María permanece fiel junto a la cruz y recibe como hijo al discípulo amado. Su dolor no la encierra; la abre a una nueva maternidad. La Virgen de los Dolores nos enseña a sostener el sufrimiento sin perder la esperanza y a cuidar a quienes sufren. La Cuaresma nos invita a permanecer junto a las cruces de los demás. Su ejemplo sigue animando a quienes sufren por la fe.',
          prayer: 'Santa María de los Dolores, enséñame a amar en medio del sufrimiento.',
          action: 'Visita o llama a una persona enferma y ofrécele compañía.'
        },
        {
          week: 6,
          day: 1,
          title: 'Ramos: recibir al Rey',
          gospelRef: 'Mt 21,1-11',
          reflection: 'Jesús entra en Jerusalén montado en un burro, entre gritos de alegría. La multitud lo aclama, pero muchos no entienden qué clase de rey es. Su reino no se impone por la fuerza, sino por el amor. La Cuaresma culmina en esta semana donde la alegría y el dolor se entrelazan. Hoy estamos invitados a recibirlo con un corazón sincero.',
          prayer: 'Señor, recibe mi alabanza y reina en mi corazón.',
          action: 'Participa en la procesión de Ramos y lleva una rama a casa como signo de fe.'
        },
        {
          week: 6,
          day: 2,
          title: 'Jueves Santo: el amor servicial',
          gospelRef: 'Jn 13,1-15',
          reflection: 'Jesús sabe que va a ser entregado y, aun así, se arrodilla para lavar los pies de sus discípulos. El amor verdadero no se impone; se hace servicio. Lavar los pies es reconocer que el otro es digno de cuidado, incluso cuando nos ha fallado. Hoy estamos invitados a imitar ese gesto en nuestra vida diaria, con humildad y ternura.',
          prayer: 'Jesús, enséñame a amar como tú, sirviendo sin esperar nada.',
          action: 'Haz un servicio concreto a alguien de tu familia o comunidad, sin anunciarlo.'
        },
        {
          week: 6,
          day: 3,
          title: 'La Eucaristía, pan de vida',
          gospelRef: 'Lc 22,19-20',
          reflection: 'En la Última Cena, Jesús se entrega bajo las especies del pan y del vino. La Eucaristía es su presencia real, su cuerpo entregado y su sangre derramada por nosotros. No es un símbolo vacío, sino alimento para el camino. Cada vez que participamos con fe, recibimos su amor y somos llamados a convertirnos en pan para los demás. Comulgar es dejarse transformar para poder dar la vida a los demás.',
          prayer: 'Jesús, gracias por quedarte en la Eucaristía; alimenta mi fe y mi amor.',
          action: 'Si puedes, participa en la Misa del Jueves Santo y dedica tiempo a la adoración.'
        },
        {
          week: 6,
          day: 4,
          title: 'Getsemaní: orar en la angustia',
          gospelRef: 'Mt 26,36-46',
          reflection: 'Jesús siente angustia en el huerto y pide a sus amigos que velen con él. Su oración es honesta: Padre, si es posible, aparta este cáliz; pero que se haga tu voluntad. Orar en la angustia no es falta de fe; es llevar el dolor a Dios con confianza. Él nos escucha y nos acompaña, incluso cuando parece que no responde.',
          prayer: 'Padre, en medio de la angustia, ayúdame a confiar en tu voluntad.',
          action: 'Dedica una hora de oración en silencio, acompañando a Jesús en su agonía.'
        },
        {
          week: 6,
          day: 5,
          title: 'Viernes Santo: el amor hasta el extremo',
          gospelRef: 'Jn 19,30',
          reflection: 'En la cruz, Jesús dice: todo está cumplido. No es una derrota, sino la entrega total de un amor que llega hasta el extremo. El sufrimiento del inocente nos desconcierta, pero en la cruz Dios nos muestra que no abandona a quienes sufren. Contemplar la cruz nos invita a unir nuestros dolores a los suyos y a confiar en la vida que nace de la entrega.',
          prayer: 'Jesús crucificado, te adoro y te agradezco tu amor sin medida.',
          action: 'Haz una visita a la cruz de tu parroquia y permanece unos minutos en silencio.'
        },
        {
          week: 6,
          day: 6,
          title: 'Sábado Santo: esperar en silencio',
          gospelRef: 'Lc 23,50-56',
          reflection: 'El Sábado Santo es un día de silencio y espera. Todo parece detenido, pero Dios está trabajando en lo oculto. La espera no es abandono; es confianza en una promesa que aún no se ve. También nosotros vivimos momentos de incertidumbre y aparente ausencia. La Cuaresma termina invitándonos a esperar con María, seguros de que la vida vencerá. El silencio de ese día nos invita a confiar sin exigir señales.',
          prayer: 'Señor, enséñame a esperar con confianza incluso cuando todo parece silencio.',
          action: 'Guarda silencio exterior durante un rato y únete espiritualmente a la espera de María.'
        }
      ]
    },
    {
      id: 'pascua',
      season: 'pascua',
      title: 'Pascua: vive la alegría del Resucitado',
      shortTitle: 'Pascua',
      description: 'Cincuenta días para vivir la alegría del Resucitado, desde el Domingo de Pascua hasta Pentecostés. El plan recorre las apariciones, la vida de la comunidad, la esperanza y la misión, y culmina pidiendo el Espíritu Santo. Es una guía general, no atada a un año litúrgico concreto.',
      weeks: 7,
      steps: [
        {
          week: 1,
          day: 1,
          title: 'Cristo ha resucitado',
          gospelRef: 'Mt 28,1-10',
          reflection: 'La mañana de Pascua, las mujeres encuentran el sepulcro vacío y reciben el anuncio: no está aquí, ha resucitado. La resurrección es el corazón de la fe cristiana, la victoria del amor sobre la muerte. No elimina nuestras preguntas, pero cambia el horizonte. Celebrar la Pascua es dejar que esa noticia ilumine toda la vida y nos llene de esperanza.',
          prayer: 'Jesús resucitado, aumenta mi fe y llena mi corazón de alegría.',
          action: 'Proclama hoy con alegría una frase de fe: Cristo ha resucitado, y compártela con alguien.'
        },
        {
          week: 1,
          day: 2,
          title: 'El sepulcro vacío',
          gospelRef: 'Jn 20,1-10',
          reflection: 'María Magdalena ve el sepulcro vacío y corre a avisar a los discípulos. La ausencia del cuerpo no es el final, sino el comienzo de una nueva presencia. Dios actúa a veces de manera que no entendemos, abriendo caminos donde solo veíamos vacío. La Pascua nos invita a no quedarnos en la tumba, sino a buscar al Viviente. El vacío puede ser el lugar donde Dios nos invita a creer de nuevo.',
          prayer: 'Señor, ayúdame a buscar al Viviente y no quedarme en el vacío.',
          action: 'Visita una iglesia y detente ante el sagrario para reconocer su presencia.'
        },
        {
          week: 1,
          day: 3,
          title: 'María Magdalena, testigo del amor',
          gospelRef: 'Jn 20,11-18',
          reflection: 'María Magdalena llora junto al sepulcro y busca a su Señor. Su amor perseverante la lleva a reconocerlo cuando él la llama por su nombre. La resurrección se experimenta también en el encuentro personal con Jesús. Dios nos llama por nuestro nombre y nos invita a salir de la tristeza para anunciar que está vivo. El amor perseverante es capaz de reconocer al Señor en medio del dolor.',
          prayer: 'Jesús, llámame por mi nombre y enséñame a anunciar tu resurrección.',
          action: 'Escribe tu nombre y, junto a él, una razón concreta para dar gracias al Resucitado.'
        },
        {
          week: 1,
          day: 4,
          title: 'Los discípulos de Emaús',
          gospelRef: 'Lc 24,13-35',
          reflection: 'Dos discípulos caminan tristes y desanimados, alejándose de Jerusalén. Jesús se une a ellos, escucha su dolor y les explica las Escrituras. Al partir el pan, lo reconocen y vuelven llenos de alegría. La Pascua nos enseña que el Resucitado camina con nosotros, incluso cuando no lo reconocemos, y que la Eucaristía nos devuelve la esperanza. La tristeza compartida con Jesús se convierte en un nuevo comienzo.',
          prayer: 'Señor, quédate con nosotros cuando la tristeza nos haga perder el rumbo.',
          action: 'Comparte con alguien una experiencia en la que sentiste la cercanía de Dios.'
        },
        {
          week: 1,
          day: 5,
          title: 'La paz que vence el miedo',
          gospelRef: 'Jn 20,19-23',
          reflection: 'Los discípulos están encerrados por miedo, y Jesús se presenta en medio de ellos con un saludo de paz. No los reprende, sino que les muestra sus heridas y les da el Espíritu. La paz del Resucitado no es superficial: atraviesa el miedo y devuelve la valentía. También hoy nos invita a abrir las puertas y a salir a anunciar su amor.',
          prayer: 'Jesús, entra en mis miedos y dame tu paz.',
          action: 'Abre hoy una puerta que tengas cerrada por temor: una conversación, un perdón o un servicio.'
        },
        {
          week: 1,
          day: 6,
          title: 'Tomás y la fe que busca',
          gospelRef: 'Jn 20,24-29',
          reflection: 'Tomás quiere ver y tocar para creer. Jesús no lo desprecia; se acerca y le muestra sus heridas. La fe también puede crecer a través de las dudas sinceras. No se trata de exigir pruebas, sino de permitir que Dios toque nuestras heridas y nos ayude a confiar. Dichosos los que creen sin haber visto, dice el Señor. Dios no se ofende por nuestras preguntas; nos invita a confiar en él.',
          prayer: 'Señor, ayuda a mi incredulidad y enséñame a confiar en tu palabra.',
          action: 'Presenta a Dios una duda que te inquieta y busca una respuesta en la Escritura o en la comunidad.'
        },
        {
          week: 1,
          day: 7,
          title: 'El desayuno junto al lago',
          gospelRef: 'Jn 21,1-14',
          reflection: 'Los discípulos vuelven a pescar y pasan la noche sin resultado. Al amanecer, Jesús les indica dónde echar las redes y les prepara el desayuno. El Resucitado se hace presente en lo cotidiano, en el trabajo y en la mesa compartida. La Pascua nos invita a reconocerlo en los gestos sencillos de cada día y a confiar en su palabra.',
          prayer: 'Señor, ayúdame a reconocerte en lo cotidiano y a confiar en tu palabra.',
          action: 'Comparte una comida con alguien y da gracias a Dios por ese momento.'
        },
        {
          week: 1,
          day: 8,
          title: 'La misericordia de Pedro',
          gospelRef: 'Jn 21,15-19',
          reflection: 'Jesús pregunta a Pedro tres veces si lo ama, y le confía el cuidado de sus ovejas. Después de la negación, Pedro recibe el perdón y una misión. Dios no se queda en nuestros fracasos; nos levanta y nos vuelve a confiar tareas. La Pascua es tiempo de dejarnos restaurar y de responder con amor a esa confianza. Nuestras caídas no definen nuestro futuro si dejamos que Dios nos levante.',
          prayer: 'Señor, tú lo sabes todo; sabes que te quiero. Restaura mi corazón y envíame.',
          action: 'Reconoce una caída del pasado y pide a Dios la gracia de volver a empezar.'
        },
        {
          week: 2,
          day: 9,
          title: 'La comunidad que comparte',
          gospelRef: 'Hch 2,42-47',
          reflection: 'La primera comunidad persevera en la enseñanza, la comunión, la fracción del pan y la oración. Comparten sus bienes y viven con alegría. La resurrección no se queda en el corazón individual: crea un pueblo nuevo, una familia donde nadie pasa necesidad. La Pascua nos invita a construir comunidades donde el amor se haga visible y concreto. La caridad compartida es el signo más claro de que Cristo está vivo.',
          prayer: 'Señor, haz de nuestra comunidad un lugar de encuentro y de compartir.',
          action: 'Participa activamente en una actividad de tu parroquia o comparte algo con alguien de la comunidad.'
        },
        {
          week: 2,
          day: 10,
          title: 'El gozo de creer',
          gospelRef: '1 Pe 1,8-9',
          reflection: 'Pedro escribe a quienes creen sin haber visto y les dice que se alegran con un gozo inefable. La fe nos da una alegría que no depende de las circunstancias. Es la certeza de ser amados y salvados por Cristo. La Pascua nos invita a dejar que esa alegría se note en el rostro y en el trato con los demás.',
          prayer: 'Señor, llena mi corazón con el gozo de creer en ti.',
          action: 'Comparte hoy tu alegría con alguien que esté triste, sin imponerle nada.'
        },
        {
          week: 2,
          day: 11,
          title: 'La esperanza viva',
          gospelRef: '1 Pe 1,3-4',
          reflection: 'Dios nos ha hecho renacer a una esperanza viva por la resurrección de Jesús. Esa esperanza no es un optimismo vacío, sino la certeza de una herencia que no se corrompe. Aunque la vida tenga pruebas, sabemos que estamos sostenidos por un amor más fuerte que la muerte. La Pascua nos invita a vivir desde esa esperanza y a transmitirla.',
          prayer: 'Padre, gracias por la esperanza viva que me das en Cristo.',
          action: 'Escribe una situación que te preocupa y, junto a ella, una razón para esperar.'
        },
        {
          week: 2,
          day: 12,
          title: 'El buen pastor',
          gospelRef: 'Jn 10,11-18',
          reflection: 'Jesús es el buen pastor que da la vida por sus ovejas. No huye ante el peligro, sino que se entrega por amor. Conoce a cada una por su nombre y las guía con ternura. La Pascua nos invita a reconocer su voz y a dejarnos cuidar por él, sabiendo que nunca nos abandona. También nosotros estamos llamados a cuidar a los demás.',
          prayer: 'Jesús, buen pastor, guíame y enséñame a cuidar a los demás.',
          action: 'Acompaña hoy a alguien que se sienta solo o perdido.'
        },
        {
          week: 2,
          day: 13,
          title: 'La puerta de la salvación',
          gospelRef: 'Jn 10,9',
          reflection: 'Jesús dice: yo soy la puerta; quien entra por mí se salvará. La salvación no es un premio que ganamos, sino un don que recibimos al entrar en su amistad. La puerta está abierta, pero debemos decidir cruzar. La Pascua nos invita a dejar atrás lo que nos ata y a entrar en la vida nueva que él nos ofrece.',
          prayer: 'Jesús, puerta de salvación, ayúdame a entrar y a permanecer en ti.',
          action: 'Deja atrás hoy un hábito que te aleja de Dios y da un paso hacia la vida nueva.'
        },
        {
          week: 2,
          day: 14,
          title: 'Dar la vida por los amigos',
          gospelRef: 'Jn 15,12-15',
          reflection: 'Jesús nos llama amigos y nos pide amar como él nos amó. Ya no somos siervos, sino amigos: él nos ha compartido su vida y sus planes. La amistad con Cristo se demuestra en el amor concreto a los demás. La Pascua nos invita a cultivar relaciones donde el amor sea gratuito y a dar la vida en lo pequeño.',
          prayer: 'Jesús, amigo fiel, enséñame a amar como tú.',
          action: 'Haz un gesto de amistad con alguien que necesite sentirse valorado.'
        },
        {
          week: 2,
          day: 15,
          title: 'La vid y los sarmientos',
          gospelRef: 'Jn 15,5',
          reflection: 'Sin mí no podéis hacer nada, dice Jesús. La imagen de la vid y los sarmientos nos recuerda que la fecundidad viene de permanecer unidos a él. Podemos hacer muchas cosas, pero solo en él encontramos la vida que da fruto. La Pascua nos invita a cuidar la unión con Cristo en la oración, los sacramentos y la vida diaria.',
          prayer: 'Jesús, permanece en mí y haz que yo permanezca en ti.',
          action: 'Dedica hoy un tiempo a la oración y revisa qué frutos está dando tu vida.'
        },
        {
          week: 3,
          day: 16,
          title: 'El mandamiento nuevo',
          gospelRef: 'Jn 13,34-35',
          reflection: 'Jesús nos da un mandamiento nuevo: que nos amemos como él nos ha amado. No es un amor cualquiera, sino el que se entrega y sirve. El amor es la señal que identifica a sus discípulos. La Pascua nos invita a revisar si nuestras relaciones reflejan ese amor o si seguimos instalados en la indiferencia y el egoísmo. Amar como Jesús no es un sentimiento, sino una decisión que se renueva cada día.',
          prayer: 'Señor, enséñame a amar como tú y a hacerlo visible en mi vida.',
          action: 'Ten hoy un detalle de amor con alguien que no te lo pueda devolver.'
        },
        {
          week: 3,
          day: 17,
          title: 'La alegría completa',
          gospelRef: 'Jn 15,11',
          reflection: 'Jesús quiere que su alegría esté en nosotros y que nuestra alegría sea completa. No se trata de una felicidad superficial, sino de la alegría de saberse amados y de vivir en coherencia con el Evangelio. La Pascua es tiempo de dejar que esa alegría nos transforme y nos libre del pesimismo. Una comunidad alegre es un testimonio creíble. La alegría del Evangelio se multiplica cuando se comparte con los demás.',
          prayer: 'Señor, danos tu alegría para que nada ni nadie nos la robe.',
          action: 'Haz algo hoy que lleve alegría a otra persona: una visita, una llamada o un regalo sencillo.'
        },
        {
          week: 3,
          day: 18,
          title: 'El Espíritu, consolador',
          gospelRef: 'Jn 14,15-17',
          reflection: 'Jesús promete el Espíritu Consolador, que permanecerá con nosotros para siempre. El Espíritu nos guía, nos fortalece y nos recuerda las palabras del Señor. No estamos solos en el camino de la fe. La Pascua nos invita a invocar al Espíritu Santo con confianza y a dejarnos consolar y transformar por él. Su presencia discreta sostiene nuestra esperanza en los momentos difíciles.',
          prayer: 'Espíritu Santo, consuélame y guíame en cada paso.',
          action: 'Reza hoy una oración al Espíritu Santo pidiendo luz para una decisión.'
        },
        {
          week: 3,
          day: 19,
          title: 'La paz que el mundo no da',
          gospelRef: 'Jn 14,27',
          reflection: 'Jesús nos da su paz, una paz distinta de la que el mundo ofrece. No depende de que no haya problemas, sino de la certeza de estar en sus manos. Es una paz que sostiene en la tormenta y que nos permite vivir sin angustia. La Pascua nos invita a recibir esa paz y a convertirnos en artesanos de reconciliación.',
          prayer: 'Señor, dame tu paz y hazme instrumento de reconciliación.',
          action: 'Busca hoy un momento de calma y comparte esa calma con alguien nervioso.'
        },
        {
          week: 3,
          day: 20,
          title: 'Creer en medio de la duda',
          gospelRef: 'Jn 14,1-6',
          reflection: 'Jesús dice a sus discípulos que no se turben, que crean en Dios y también en él. La duda no es el contrario de la fe; a veces es parte del camino. Lo importante es a quién dirigimos nuestras preguntas. La Pascua nos invita a confiar en que Jesús es el camino, la verdad y la vida, incluso cuando no vemos el final del recorrido.',
          prayer: 'Jesús, camino, verdad y vida, guía mis pasos y disipa mis dudas.',
          action: 'Lee despacio un pasaje del Evangelio que te cueste entender y pide luz al Espíritu Santo.'
        },
        {
          week: 3,
          day: 21,
          title: 'La oración que escucha',
          gospelRef: 'Jn 15,7',
          reflection: 'Jesús nos dice que si permanecemos en él y sus palabras permanecen en nosotros, pediremos lo que queramos y se nos concederá. No es una fórmula mágica, sino la promesa de una relación profunda. La oración que escucha nace de la amistad con Cristo y busca su voluntad. La Pascua nos invita a orar con confianza y a dejar que él transforme nuestros deseos.',
          prayer: 'Señor, enséñame a orar desde tu palabra y a buscar tu voluntad.',
          action: 'Reza hoy con un salmo y pide a Dios que te ayude a escuchar su respuesta.'
        },
        {
          week: 3,
          day: 22,
          title: 'Ser testigos en lo cotidiano',
          gospelRef: 'Hch 1,8',
          reflection: 'Jesús promete la fuerza del Espíritu para ser sus testigos en Jerusalén, Judea, Samaria y hasta los confines de la tierra. La misión empieza donde estamos, en lo cotidiano. No hace falta ir lejos para anunciar el Evangelio; basta con vivir con coherencia y amor. La Pascua nos invita a ser testigos creíbles en nuestra familia, trabajo y comunidad. La coherencia diaria es el lenguaje que muchos pueden entender.',
          prayer: 'Espíritu Santo, dame fuerza y valentía para ser testigo de Jesús.',
          action: 'Sé hoy testigo con un gesto de honestidad y servicio en tu entorno.'
        },
        {
          week: 4,
          day: 23,
          title: 'La ascensión y la misión',
          gospelRef: 'Mt 28,16-20',
          reflection: 'Jesús se despide de sus discípulos y les envía a bautizar y enseñar. La ascensión no es una ausencia, sino una nueva presencia: él estará con nosotros hasta el final de los tiempos. La misión no es nuestra obra, sino la suya en nosotros. La Pascua nos invita a vivir con la certeza de que no estamos solos y a asumir nuestra responsabilidad en la evangelización.',
          prayer: 'Señor, envíame y acompáñame en la misión de anunciar tu amor.',
          action: 'Acepta una tarea de servicio o anuncio en tu comunidad, aunque te parezca pequeña.'
        },
        {
          week: 4,
          day: 24,
          title: 'El envío a todas las naciones',
          gospelRef: 'Mc 16,15-16',
          reflection: 'El Evangelio no es propiedad de un grupo ni de una cultura. Jesús envía a anunciarlo a toda la creación. Esa universalidad nos desafía a salir de nuestros círculos y a acoger a quienes son diferentes. La Pascua nos invita a vivir la fe con horizonte abierto, colaborando en la misión de la Iglesia y rezando por quienes aún no conocen a Cristo.',
          prayer: 'Señor, abre mi corazón a todos los pueblos y hazme misionero donde estoy.',
          action: 'Reza por las misiones y, si puedes, colabora con una obra misionera.'
        },
        {
          week: 4,
          day: 25,
          title: 'La fuerza del Espíritu',
          gospelRef: 'Hch 2,1-4',
          reflection: 'En Pentecostés, el Espíritu Santo desciende sobre los discípulos y los llena de valor. El miedo se transforma en audacia, la confusión en unidad. El mismo Espíritu sigue actuando hoy en la Iglesia y en cada corazón. La Pascua culmina en Pentecostés, cuando somos enviados a vivir y anunciar el amor de Dios con la fuerza de lo alto. El Espíritu no elimina nuestros límites, pero los pone al servicio del amor.',
          prayer: 'Espíritu Santo, ven a mi corazón y renueva mi valentía.',
          action: 'Pide hoy al Espíritu Santo que te muestre un don que puedes poner al servicio de los demás.'
        },
        {
          week: 4,
          day: 26,
          title: 'Lenguas de fuego, corazones nuevos',
          gospelRef: 'Hch 2,5-13',
          reflection: 'La multitud se reúne y cada uno escucha el anuncio en su propia lengua. El Espíritu derriba las barreras y hace posible la comunión en la diversidad. Un corazón nuevo es capaz de escuchar y de hacerse entender. La Pascua nos invita a dejar que el Espíritu nos enseñe a hablar con respeto y a acoger a quienes piensan distinto.',
          prayer: 'Espíritu Santo, enséñame a comunicar tu amor con respeto y sencillez.',
          action: 'Escucha hoy a alguien que piensa distinto sin interrumpirlo ni juzgarlo.'
        },
        {
          week: 4,
          day: 27,
          title: 'La unidad en la diversidad',
          gospelRef: '1 Cor 12,12-13',
          reflection: 'Todos formamos un solo cuerpo, aunque seamos muchos miembros. Cada persona tiene un lugar y una misión; nadie sobra. La unidad no es uniformidad, sino comunión en el amor. La Pascua nos invita a valorar los dones de los demás y a construir una comunidad donde todos se sientan parte, especialmente los más pequeños. La comunión se construye cuando cada uno aporta su don sin buscar protagonismo.',
          prayer: 'Señor, ayúdanos a vivir la unidad en la diversidad y a valorar a cada hermano.',
          action: 'Agradece hoy a alguien por el don que aporta a tu grupo o comunidad.'
        },
        {
          week: 4,
          day: 28,
          title: 'Los dones del Espíritu',
          gospelRef: '1 Cor 12,4-11',
          reflection: 'El Espíritu reparte sus dones a cada uno según su voluntad. No todos tenemos las mismas capacidades, pero todos estamos llamados a servir. Los dones no son para presumir, sino para edificar a los demás. La Pascua nos invita a descubrir nuestros talentos y a ponerlos al servicio de la comunidad, con humildad y alegría. Un don que no se comparte termina marchitándose; el amor lo hace fecundo.',
          prayer: 'Espíritu Santo, ayúdame a descubrir y usar mis dones para el bien de los demás.',
          action: 'Identifica un talento tuyo y ofrécelo hoy para ayudar en una tarea concreta.'
        },
        {
          week: 4,
          day: 29,
          title: 'La caridad, camino de santidad',
          gospelRef: '1 Cor 13,1-13',
          reflection: 'San Pablo nos recuerda que sin amor nada somos. Podemos tener grandes dones, pero si nos falta caridad, todo se vuelve vacío. El amor es paciente, servicial, no tiene envidia ni busca su propio interés. La Pascua nos invita a medir nuestra vida por el amor y a pedir el don de amar como Dios ama. La santidad no se mide por lo extraordinario, sino por la calidad del amor.',
          prayer: 'Señor, dame un corazón que ame de verdad, sin cálculos ni egoísmos.',
          action: 'Practica hoy una obra de caridad discreta y sin esperar reconocimiento.'
        },
        {
          week: 5,
          day: 30,
          title: 'La viuda y el juez',
          gospelRef: 'Lc 18,1-8',
          reflection: 'Jesús cuenta la parábola de una viuda que insiste ante un juez injusto hasta ser escuchada. Si un juez así responde, cuánto más el Padre, que es bueno. La perseverancia en la oración no es insistir para convencer a Dios, sino mantener la confianza y la relación. La Pascua nos invita a orar sin desanimarnos, incluso cuando parece que no hay respuesta.',
          prayer: 'Padre, enséñame a perseverar en la oración y a confiar en tu justicia.',
          action: 'Retoma hoy una intención por la que habías dejado de rezar y preséntala de nuevo.'
        },
        {
          week: 5,
          day: 31,
          title: 'La oración perseverante',
          gospelRef: 'Lc 11,5-13',
          reflection: 'Jesús nos invita a pedir, buscar y llamar con confianza. El amigo que insiste recibe lo que necesita, y el Padre da el Espíritu Santo a quienes se lo piden. La oración perseverante no es una técnica para obtener cosas, sino una escuela de confianza. La Pascua nos invita a presentar nuestras necesidades con sencillez y a dejarnos transformar por el diálogo con Dios.',
          prayer: 'Padre, enséñame a pedir con confianza y a aceptar tu respuesta.',
          action: 'Pide hoy algo bueno con insistencia y confianza, y escucha lo que Dios te sugiere.'
        },
        {
          week: 5,
          day: 32,
          title: 'Interceder por los demás',
          gospelRef: '1 Tim 2,1-4',
          reflection: 'San Pablo pide que se hagan oraciones y súplicas por todos los hombres, porque Dios quiere que todos se salven. Interceder es ponerse en el lugar del otro y presentar su necesidad ante Dios. No hace falta conocer a todos para rezar por ellos. La Pascua nos invita a ampliar nuestra oración y a pedir por la paz, por los gobernantes y por quienes sufren.',
          prayer: 'Señor, te presento las necesidades de los demás y te pido por su bien.',
          action: 'Reza hoy por una persona que no conoces y por la paz del mundo.'
        },
        {
          week: 5,
          day: 33,
          title: 'La alegría de servir',
          gospelRef: 'Hch 6,1-7',
          reflection: 'La comunidad elige a siete diáconos para atender a los necesitados y no descuidar la oración. El servicio organizado y generoso permite que el Evangelio se difunda. La caridad no es un añadido, sino una dimensión esencial de la vida cristiana. La Pascua nos invita a servir con alegría y a colaborar para que nadie quede sin atención. El servicio alegre transforma tanto al que lo recibe como al que lo ofrece.',
          prayer: 'Señor, danos alegría y constancia en el servicio a los hermanos.',
          action: 'Ofrece tu ayuda en una actividad de caridad de tu parroquia o barrio.'
        },
        {
          week: 5,
          day: 34,
          title: 'El diácono Esteban',
          gospelRef: 'Hch 7,54-60',
          reflection: 'Esteban anuncia con valentía el Evangelio y muere perdonando a sus verdugos. Su testimonio nos muestra que la fe puede sostener incluso en la persecución. No todos estamos llamados al martirio, pero sí a ser coherentes y a perdonar. La Pascua nos invita a vivir con la valentía de quien sabe que su vida está en manos de Dios. Su testimonio recuerda que la valentía cristiana nace de la unión con Cristo.',
          prayer: 'Señor, dame valentía para ser coherente y generosidad para perdonar.',
          action: 'Defiende hoy con respeto a alguien que esté siendo tratado injustamente.'
        },
        {
          week: 5,
          day: 35,
          title: 'Perdonar como Esteban',
          gospelRef: 'Hch 7,59-60',
          reflection: 'Esteban muere pidiendo que no se les tenga en cuenta su pecado. Su perdón refleja el de Jesús en la cruz. Perdonar en situaciones extremas parece imposible, pero Dios puede darnos una fuerza que supera nuestras capacidades. La Pascua nos invita a pedir esa gracia y a dar pasos concretos hacia la reconciliación, incluso cuando el dolor es grande. Perdonar no borra la herida, pero impide que el rencor nos gobierne.',
          prayer: 'Señor, dame un corazón capaz de perdonar como el de Esteban.',
          action: 'Pide a Dios la gracia de perdonar a alguien que te ha herido gravemente.'
        },
        {
          week: 5,
          day: 36,
          title: 'La conversión de Saulo',
          gospelRef: 'Hch 9,1-19',
          reflection: 'Saulo persigue a los cristianos, pero en el camino a Damasco se encuentra con Cristo y su vida cambia. Dios puede transformar incluso a quienes parecen más lejanos. La conversión no es solo un cambio de ideas, sino un encuentro que reorienta la existencia. La Pascua nos invita a creer que nadie está fuera del alcance de la misericordia. Dios escribe derecho incluso con las historias que parecían perdidas.',
          prayer: 'Señor, transforma mi corazón y ayúdame a empezar de nuevo.',
          action: 'Reza por alguien a quien consideras alejado de Dios, sin juzgarlo.'
        },
        {
          week: 6,
          day: 37,
          title: 'Anunciar con valentía',
          gospelRef: 'Hch 4,13',
          reflection: 'Los dirigentes se admiran de la valentía de Pedro y Juan, hombres sencillos que habían estado con Jesús. La cercanía con el Señor da una fuerza que no viene de nosotros. Anunciar no es hablar mucho, sino dejar que la vida hable. La Pascua nos invita a cultivar la amistad con Jesús para poder dar razón de nuestra esperanza con humildad y valentía.',
          prayer: 'Señor, dame valentía y sencillez para anunciar tu amor.',
          action: 'Da hoy un testimonio breve de tu fe a alguien de confianza.'
        },
        {
          week: 6,
          day: 38,
          title: 'La comunidad que ora',
          gospelRef: 'Hch 12,5-17',
          reflection: 'La comunidad ora insistentemente por Pedro, que está encarcelado. Dios responde de una manera que los sorprende. La oración común sostiene a los que sufren y fortalece la fe de todos. La Pascua nos invita a orar unos por otros y a confiar en que Dios escucha, aunque su respuesta llegue por caminos inesperados. La oración común nos recuerda que no estamos solos en la lucha.',
          prayer: 'Señor, escucha la oración de tu Iglesia y fortalece a quienes sufren.',
          action: 'Únete a un grupo de oración o reza hoy por una intención de la comunidad.'
        },
        {
          week: 6,
          day: 39,
          title: 'Pedro liberado',
          gospelRef: 'Hch 12,6-11',
          reflection: 'Pedro está encadenado y duerme, mientras la comunidad ora. Un ángel lo libera y él comprende que el Señor lo ha salvado. Dios actúa en la historia y abre caminos donde parecía no haber salida. La Pascua nos invita a confiar en su poder y a ser instrumentos de liberación para quienes están atrapados por miedos o ataduras. Dios abre puertas que parecían cerradas cuando su pueblo ora con fe.',
          prayer: 'Señor, líbrame de lo que me ata y ayúdame a liberar a otros.',
          action: 'Identifica una atadura en tu vida y pide ayuda a Dios y a una persona de confianza.'
        },
        {
          week: 6,
          day: 40,
          title: 'La misión de Pablo',
          gospelRef: 'Hch 13,1-3',
          reflection: 'La comunidad de Antioquía ayuna, ora e impone las manos a Bernabé y Saulo para enviarlos. La misión nace de la oración y de la comunidad, no de la improvisación. Dios sigue llamando a personas para anunciar el Evangelio en nuevos lugares. La Pascua nos invita a apoyar la misión con la oración y a estar disponibles para servir donde se nos necesite.',
          prayer: 'Señor, envía obreros a tu mies y hazme disponible para tu misión.',
          action: 'Reza por los misioneros y pregunta en tu parroquia dónde puedes colaborar.'
        },
        {
          week: 6,
          day: 41,
          title: 'El amor a la Palabra',
          gospelRef: 'Hch 17,10-12',
          reflection: 'Los de Berea reciben la Palabra con entusiasmo y la examinan cada día para ver si es verdad. Su actitud nos enseña a no creer cualquier cosa sin reflexionar, sino a buscar la verdad con humildad. La Pascua nos invita a leer la Escritura con constancia y a dejar que ilumine nuestras decisiones, contrastándola con la enseñanza de la Iglesia.',
          prayer: 'Señor, dame hambre de tu Palabra y sabiduría para comprenderla.',
          action: 'Lee hoy un pasaje bíblico y escribe qué te dice y cómo puedes vivirlo.'
        },
        {
          week: 6,
          day: 42,
          title: 'La esperanza en la prueba',
          gospelRef: 'Rom 8,18-25',
          reflection: 'Pablo afirma que los sufrimientos del tiempo presente no se comparan con la gloria que se manifestará. La creación entera gime y espera la redención. La esperanza cristiana no ignora el dolor, pero lo sitúa en un horizonte mayor. La Pascua nos invita a esperar con paciencia y a cuidar la creación, que también espera la liberación de Dios. La esperanza madura cuando aprendemos a esperar sin exigir plazos.',
          prayer: 'Señor, sostén mi esperanza en medio de las pruebas y enséñame a esperar.',
          action: 'Haz hoy un gesto ecológico o de cuidado de la creación como acto de esperanza.'
        },
        {
          week: 6,
          day: 43,
          title: 'El Espíritu que ora en nosotros',
          gospelRef: 'Rom 8,26-27',
          reflection: 'No sabemos pedir como conviene, pero el Espíritu intercede por nosotros con gemidos inefables. Dios conoce nuestro corazón y nos escucha más allá de nuestras palabras. La oración no depende solo de nuestra elocuencia, sino de la presencia del Espíritu. La Pascua nos invita a confiar en esa ayuda invisible y a dejar que él ore en nosotros. El Espíritu conoce nuestras heridas y las presenta al Padre con ternura.',
          prayer: 'Espíritu Santo, ora en mí y enséñame a pedir según la voluntad del Padre.',
          action: 'Dedica hoy unos minutos a orar sin palabras, dejando que el Espíritu hable en tu corazón.'
        },
        {
          week: 7,
          day: 44,
          title: 'La unidad de los cristianos',
          gospelRef: 'Jn 17,20-23',
          reflection: 'Jesús ora para que todos sean uno, para que el mundo crea. La unidad no es un adorno, sino un testimonio. Las divisiones hieren el anuncio del Evangelio y debilitan la caridad. La Pascua nos invita a buscar la comunión, a respetar las diferencias legítimas y a rezar por la unidad de los cristianos, sabiendo que es un don de Dios y una tarea nuestra.',
          prayer: 'Señor, haznos uno en el amor y derriba los muros que nos separan.',
          action: 'Reza hoy por la unidad de los cristianos y evita una crítica que divida.'
        },
        {
          week: 7,
          day: 45,
          title: 'María, madre de la Iglesia',
          gospelRef: 'Hch 1,14',
          reflection: 'María está con los discípulos en oración, esperando al Espíritu. Su presencia materna acompaña el nacimiento de la Iglesia. Ella nos enseña a esperar con fe y a estar disponibles. La Pascua nos invita a acudir a María como madre y a aprender de ella a decir sí a Dios en lo cotidiano y a sostener a la comunidad. Con María aprendemos a esperar juntos y a sostener la fe de los demás.',
          prayer: 'Santa María, madre de la Iglesia, acompáñanos y enséñanos a orar.',
          action: 'Reza el Rosario o una decena pidiendo por la Iglesia y sus necesidades.'
        },
        {
          week: 7,
          day: 46,
          title: 'La espera del Espíritu',
          gospelRef: 'Hch 1,12-13',
          reflection: 'Los discípulos vuelven a Jerusalén y se reúnen en oración con María. No saben qué va a pasar, pero obedecen y esperan. La espera activa es una escuela de fe: no es quedarse quietos, sino preparar el corazón. La Pascua nos invita a esperar al Espíritu con paciencia, sin adelantarnos ni desanimarnos, confiando en la promesa de Jesús. La espera se vuelve fecunda cuando se convierte en oración y servicio.',
          prayer: 'Señor, enséñame a esperar con fe y a preparar mi corazón para el Espíritu.',
          action: 'Reserva un tiempo diario de oración durante esta semana de espera.'
        },
        {
          week: 7,
          day: 47,
          title: 'La promesa del Padre',
          gospelRef: 'Hch 1,4-8',
          reflection: 'Jesús les dice a los discípulos que esperen la promesa del Padre: el Espíritu Santo. Les advierte que no les corresponde conocer los tiempos, sino ser testigos. La fe madura cuando dejamos de controlarlo todo y confiamos en los tiempos de Dios. La Pascua nos invita a recibir la promesa con esperanza y a dar testimonio con la fuerza que viene de lo alto.',
          prayer: 'Padre, cumple en mí tu promesa y dame la fuerza de tu Espíritu.',
          action: 'Suelta hoy una preocupación por el futuro y ofrécela a Dios en oración.'
        },
        {
          week: 7,
          day: 48,
          title: 'La alegría de la misión',
          gospelRef: 'Lc 24,46-49',
          reflection: 'Jesús resucitado explica a sus discípulos que el arrepentimiento y el perdón deben anunciarse a todas las naciones. Les promete la fuerza del Espíritu y los envía como testigos. La misión no es una carga, sino una alegría: compartir lo que hemos recibido. La Pascua nos invita a vivir con entusiasmo el anuncio del Evangelio, empezando por nuestro entorno. Anunciar el Evangelio es compartir la alegría que hemos recibido.',
          prayer: 'Señor, llena de alegría mi misión de anunciar tu perdón.',
          action: 'Cuenta hoy a alguien, con alegría, una experiencia de perdón o de gracia.'
        },
        {
          week: 7,
          day: 49,
          title: 'El fuego que transforma',
          gospelRef: 'Hch 2,1-13',
          reflection: 'El Espíritu desciende como un viento impetuoso y lenguas de fuego. El fuego purifica, calienta y enciende; así actúa Dios en el corazón que se abre. Los discípulos pasan del miedo a la valentía. La Pascua nos invita a pedir un Pentecostés personal: que el Espíritu encienda en nosotros el amor y el celo por el Evangelio. El Espíritu nos envía a llevar ese fuego a los lugares donde falta esperanza.',
          prayer: 'Espíritu Santo, enciende en mí el fuego de tu amor.',
          action: 'Pide al Espíritu Santo que te muestre qué debe cambiar en tu vida y da hoy un paso.'
        },
        {
          week: 7,
          day: 50,
          title: 'Pentecostés: enviados a amar',
          gospelRef: 'Jn 20,21-22',
          reflection: 'Jesús sopla sobre los discípulos y les dice: como el Padre me envió, también yo os envío. Pentecostés no es el final, sino el comienzo de la misión. El Espíritu nos da la capacidad de amar y de perdonar como Jesús. La Pascua culmina en el envío: somos testigos de la alegría del Resucitado y estamos llamados a compartirla con todos.',
          prayer: 'Espíritu Santo, envíame a amar y a anunciar que Jesús vive.',
          action: 'Comprométete hoy con un servicio concreto en tu comunidad para este tiempo.'
        }
      ]
    }
  ]
};
