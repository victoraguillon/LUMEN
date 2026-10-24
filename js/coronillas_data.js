/* Datos de las coronillas. Los textos comunes se resuelven con `ref`
   desde RosarioView._texts para no duplicar oraciones. */
const CORONILLAS_DATA = {
  'divina-misericordia': {
    id: 'divina-misericordia',
    title: 'Coronilla de la Divina Misericordia',
    shortTitle: 'Divina Misericordia',
    subtitle: 'Confianza en la misericordia de Jesús',
    description: 'Una coronilla para pedir misericordia para nosotros y para el mundo entero, confiando en la Pasión de Cristo.',
    icon: 'heart',
    opening: [
      { label: 'Señal de la Cruz', ref: 'cruz', icon: 'cross' },
      { label: 'Padre Nuestro', ref: 'padrenuestro', icon: 'rosario' },
      { label: 'Ave María', ref: 'avemaria', icon: 'feather' },
      { label: 'Credo', ref: 'credo', icon: 'cross' }
    ],
    sections: [
      {
        title: 'Primera decena',
        blocks: [
          {
            label: 'Padre Eterno',
            text: 'Padre Eterno, te ofrezco el Cuerpo y la Sangre, el Alma y la Divinidad de tu Amadísimo Hijo, Nuestro Señor Jesucristo, como propiciación por nuestros pecados y los del mundo entero.',
            count: 1,
            icon: 'heart'
          },
          {
            label: 'Por su dolorosa Pasión',
            text: 'Por su dolorosa Pasión, ten misericordia de nosotros y del mundo entero.',
            count: 10,
            icon: 'feather'
          },
          {
            label: 'Santo Dios',
            text: 'Santo Dios, Santo Fuerte, Santo Inmortal, ten piedad de nosotros y del mundo entero.',
            count: 3,
            icon: 'sparkles'
          }
        ]
      },
      {
        title: 'Segunda decena',
        blocks: [
          {
            label: 'Padre Eterno',
            text: 'Padre Eterno, te ofrezco el Cuerpo y la Sangre, el Alma y la Divinidad de tu Amadísimo Hijo, Nuestro Señor Jesucristo, como propiciación por nuestros pecados y los del mundo entero.',
            count: 1,
            icon: 'heart'
          },
          {
            label: 'Por su dolorosa Pasión',
            text: 'Por su dolorosa Pasión, ten misericordia de nosotros y del mundo entero.',
            count: 10,
            icon: 'feather'
          },
          {
            label: 'Santo Dios',
            text: 'Santo Dios, Santo Fuerte, Santo Inmortal, ten piedad de nosotros y del mundo entero.',
            count: 3,
            icon: 'sparkles'
          }
        ]
      },
      {
        title: 'Tercera decena',
        blocks: [
          {
            label: 'Padre Eterno',
            text: 'Padre Eterno, te ofrezco el Cuerpo y la Sangre, el Alma y la Divinidad de tu Amadísimo Hijo, Nuestro Señor Jesucristo, como propiciación por nuestros pecados y los del mundo entero.',
            count: 1,
            icon: 'heart'
          },
          {
            label: 'Por su dolorosa Pasión',
            text: 'Por su dolorosa Pasión, ten misericordia de nosotros y del mundo entero.',
            count: 10,
            icon: 'feather'
          },
          {
            label: 'Santo Dios',
            text: 'Santo Dios, Santo Fuerte, Santo Inmortal, ten piedad de nosotros y del mundo entero.',
            count: 3,
            icon: 'sparkles'
          }
        ]
      },
      {
        title: 'Cuarta decena',
        blocks: [
          {
            label: 'Padre Eterno',
            text: 'Padre Eterno, te ofrezco el Cuerpo y la Sangre, el Alma y la Divinidad de tu Amadísimo Hijo, Nuestro Señor Jesucristo, como propiciación por nuestros pecados y los del mundo entero.',
            count: 1,
            icon: 'heart'
          },
          {
            label: 'Por su dolorosa Pasión',
            text: 'Por su dolorosa Pasión, ten misericordia de nosotros y del mundo entero.',
            count: 10,
            icon: 'feather'
          },
          {
            label: 'Santo Dios',
            text: 'Santo Dios, Santo Fuerte, Santo Inmortal, ten piedad de nosotros y del mundo entero.',
            count: 3,
            icon: 'sparkles'
          }
        ]
      },
      {
        title: 'Quinta decena',
        blocks: [
          {
            label: 'Padre Eterno',
            text: 'Padre Eterno, te ofrezco el Cuerpo y la Sangre, el Alma y la Divinidad de tu Amadísimo Hijo, Nuestro Señor Jesucristo, como propiciación por nuestros pecados y los del mundo entero.',
            count: 1,
            icon: 'heart'
          },
          {
            label: 'Por su dolorosa Pasión',
            text: 'Por su dolorosa Pasión, ten misericordia de nosotros y del mundo entero.',
            count: 10,
            icon: 'feather'
          },
          {
            label: 'Santo Dios',
            text: 'Santo Dios, Santo Fuerte, Santo Inmortal, ten piedad de nosotros y del mundo entero.',
            count: 3,
            icon: 'sparkles'
          }
        ]
      }
    ],
    closing: [
      {
        label: 'Oh Sangre y Agua',
        text: 'Oh Sangre y Agua que brotaste del Corazón de Jesús como una fuente de misericordia para nosotros, en ti confío.',
        count: 3,
        icon: 'heart'
      },
      {
        label: 'Jesús, en ti confío',
        text: 'Jesús, en ti confío.',
        count: 3,
        icon: 'sparkles'
      },
      {
        label: 'Oración final',
        text: 'Dios eterno, en quien la misericordia es infinita y el tesoro de compasión inagotable, míranos con bondad y aumenta en nosotros la confianza en tu misericordia, para que en los momentos difíciles no desesperemos, sino que nos abandonemos siempre a tu santa voluntad. Por Jesucristo, nuestro Señor. Amén.',
        count: 1,
        icon: 'cross'
      }
    ]
  },

  'san-miguel': {
    id: 'san-miguel',
    title: 'Coronilla de San Miguel Arcángel',
    shortTitle: 'San Miguel',
    subtitle: 'Protección y defensa en la batalla espiritual',
    description: 'Una coronilla que recorre los nueve coros de ángeles y pide la intercesión de San Miguel para defendernos del mal.',
    icon: 'shield',
    opening: [
      { label: 'Señal de la Cruz', ref: 'cruz', icon: 'cross' },
      { label: 'Invocación inicial', text: 'Dios, ven en mi auxilio. Señor, date prisa en socorrerme. Gloria al Padre, y al Hijo, y al Espíritu Santo. Como era en el principio, ahora y siempre, por los siglos de los siglos. Amén.', count: 1, icon: 'shield' }
    ],
    sections: [
      {
        title: 'Serafines',
        blocks: [
          { label: 'San Miguel, defiéndenos', text: 'Por la intercesión de San Miguel y del coro celestial de los Serafines, que el Señor nos conceda el amor ardiente a Dios y la gracia de buscar siempre su gloria.', count: 1, icon: 'heart' },
          { label: 'Padre Nuestro', ref: 'padrenuestro', icon: 'rosario' },
          { label: 'Ave María', ref: 'avemaria', count: 3, icon: 'feather' }
        ]
      },
      {
        title: 'Querubines',
        blocks: [
          { label: 'San Miguel, defiéndenos', text: 'Por la intercesión de San Miguel y del coro celestial de los Querubines, que el Señor nos conceda la luz de la fe y la sabiduría para discernir su voluntad.', count: 1, icon: 'sparkles' },
          { label: 'Padre Nuestro', ref: 'padrenuestro', icon: 'rosario' },
          { label: 'Ave María', ref: 'avemaria', count: 3, icon: 'feather' }
        ]
      },
      {
        title: 'Tronos',
        blocks: [
          { label: 'San Miguel, defiéndenos', text: 'Por la intercesión de San Miguel y del coro celestial de los Tronos, que el Señor nos conceda un corazón humilde y la paz que nace de abandonarse en sus manos.', count: 1, icon: 'crown' },
          { label: 'Padre Nuestro', ref: 'padrenuestro', icon: 'rosario' },
          { label: 'Ave María', ref: 'avemaria', count: 3, icon: 'feather' }
        ]
      },
      {
        title: 'Dominaciones',
        blocks: [
          { label: 'San Miguel, defiéndenos', text: 'Por la intercesión de San Miguel y del coro celestial de las Dominaciones, que el Señor nos conceda el dominio de nosotros mismos y la libertad de los hijos de Dios.', count: 1, icon: 'crown' },
          { label: 'Padre Nuestro', ref: 'padrenuestro', icon: 'rosario' },
          { label: 'Ave María', ref: 'avemaria', count: 3, icon: 'feather' }
        ]
      },
      {
        title: 'Potestades',
        blocks: [
          { label: 'San Miguel, defiéndenos', text: 'Por la intercesión de San Miguel y del coro celestial de las Potestades, que el Señor nos conceda fortaleza para vencer la tentación y fidelidad en la prueba.', count: 1, icon: 'shield' },
          { label: 'Padre Nuestro', ref: 'padrenuestro', icon: 'rosario' },
          { label: 'Ave María', ref: 'avemaria', count: 3, icon: 'feather' }
        ]
      },
      {
        title: 'Virtudes',
        blocks: [
          { label: 'San Miguel, defiéndenos', text: 'Por la intercesión de San Miguel y del coro celestial de las Virtudes, que el Señor nos conceda constancia en el bien y valentía para testimoniar el Evangelio.', count: 1, icon: 'sparkles' },
          { label: 'Padre Nuestro', ref: 'padrenuestro', icon: 'rosario' },
          { label: 'Ave María', ref: 'avemaria', count: 3, icon: 'feather' }
        ]
      },
      {
        title: 'Principados',
        blocks: [
          { label: 'San Miguel, defiéndenos', text: 'Por la intercesión de San Miguel y del coro celestial de los Principados, que el Señor nos conceda cuidar a los que nos confía y servir con humildad a su pueblo.', count: 1, icon: 'crown' },
          { label: 'Padre Nuestro', ref: 'padrenuestro', icon: 'rosario' },
          { label: 'Ave María', ref: 'avemaria', count: 3, icon: 'feather' }
        ]
      },
      {
        title: 'Arcángeles',
        blocks: [
          { label: 'San Miguel, defiéndenos', text: 'Por la intercesión de San Miguel y del coro celestial de los Arcángeles, que el Señor nos conceda escuchar su voz y anunciar con alegría su salvación.', count: 1, icon: 'sparkles' },
          { label: 'Padre Nuestro', ref: 'padrenuestro', icon: 'rosario' },
          { label: 'Ave María', ref: 'avemaria', count: 3, icon: 'feather' }
        ]
      },
      {
        title: 'Ángeles',
        blocks: [
          { label: 'San Miguel, defiéndenos', text: 'Por la intercesión de San Miguel y del coro celestial de los Ángeles, que el Señor nos conceda caminar bajo su protección y llegar un día a la patria celestial.', count: 1, icon: 'feather' },
          { label: 'Padre Nuestro', ref: 'padrenuestro', icon: 'rosario' },
          { label: 'Ave María', ref: 'avemaria', count: 3, icon: 'feather' }
        ]
      }
    ],
    closing: [
      {
        label: 'San Miguel Arcángel',
        text: 'San Miguel Arcángel, defiéndenos en la batalla. Sé nuestro amparo contra la perversidad y asechanzas del demonio. Reprímale Dios, pedimos suplicantes; y tú, Príncipe de la Milicia Celestial, arroja al infierno con el divino poder a Satanás y a los demás espíritus malignos que vagan por el mundo para la perdición de las almas. Amén.',
        count: 1,
        icon: 'shield'
      },
      {
        label: 'Oración final',
        text: 'Oh glorioso San Miguel, príncipe de la milicia celestial, defensor de las almas, vencedor de los espíritus rebeldes, fiel servidor de Dios y guardián de su pueblo: tú que brillas por la santidad y la fuerza, alcánzanos del Señor la gracia de perseverar en el bien y de ser protegidos en todos los peligros. Amén.',
        count: 1,
        icon: 'cross'
      }
    ]
  },

  'espiritu-santo': {
    id: 'espiritu-santo',
    title: 'Coronilla al Espíritu Santo',
    shortTitle: 'Espíritu Santo',
    subtitle: 'Siete dones, siete invocaciones',
    description: 'Un recorrido por los siete dones del Espíritu Santo, con siete invocaciones en cada don para pedir su luz y su fuego.',
    icon: 'sparkles',
    opening: [
      { label: 'Señal de la Cruz', ref: 'cruz', icon: 'cross' },
      { label: 'Ven, Espíritu Santo', text: 'Ven, Espíritu Santo, llena los corazones de tus fieles y enciende en ellos el fuego de tu amor. Envía tu Espíritu y serán creados, y renovarás la faz de la tierra. Oremos: Oh Dios, que instruiste los corazones de tus fieles con la luz del Espíritu Santo, concédenos gustar siempre lo que es recto y gozar de su consuelo. Por Jesucristo, nuestro Señor. Amén.', count: 1, icon: 'sparkles' },
      { label: 'Padre Nuestro', ref: 'padrenuestro', icon: 'rosario' },
      { label: 'Ave María', ref: 'avemaria', icon: 'feather' },
      { label: 'Gloria', ref: 'gloria', icon: 'star' }
    ],
    sections: [
      {
        title: 'Don de Sabiduría',
        mystery: { title: 'Don de Sabiduría', reference: 'Isaías 11,2', biblicalText: 'Reposará sobre él el espíritu del Señor: espíritu de sabiduría y de inteligencia, espíritu de consejo y de fortaleza, espíritu de ciencia y de piedad.' },
        blocks: [
          { label: 'Espíritu de Sabiduría', text: 'Ven, Espíritu de Sabiduría, y enséñanos a gustar las cosas de Dios y a ordenar toda nuestra vida según su voluntad.', count: 7, icon: 'sparkles' },
          { label: 'Gloria', ref: 'gloria', icon: 'star' }
        ]
      },
      {
        title: 'Don de Entendimiento',
        mystery: { title: 'Don de Entendimiento', reference: 'Lucas 24,45', biblicalText: 'Entonces les abrió el entendimiento para comprender las Escrituras.' },
        blocks: [
          { label: 'Espíritu de Entendimiento', text: 'Ven, Espíritu de Entendimiento, y abre nuestra mente a la verdad de tu Palabra y al sentido profundo de tu amor.', count: 7, icon: 'book' },
          { label: 'Gloria', ref: 'gloria', icon: 'star' }
        ]
      },
      {
        title: 'Don de Consejo',
        mystery: { title: 'Don de Consejo', reference: 'Juan 14,26', biblicalText: 'El Paráclito, el Espíritu Santo que el Padre enviará en mi nombre, os lo enseñará todo y os recordará todo lo que yo os he dicho.' },
        blocks: [
          { label: 'Espíritu de Consejo', text: 'Ven, Espíritu de Consejo, y guíanos en las decisiones de cada día para que busquemos siempre lo que agrada a Dios.', count: 7, icon: 'compass' },
          { label: 'Gloria', ref: 'gloria', icon: 'star' }
        ]
      },
      {
        title: 'Don de Fortaleza',
        mystery: { title: 'Don de Fortaleza', reference: 'Hechos 1,8', biblicalText: 'Recibiréis la fuerza del Espíritu Santo, que vendrá sobre vosotros, y seréis mis testigos en Jerusalén, en toda Judea y Samaría, y hasta los confines de la tierra.' },
        blocks: [
          { label: 'Espíritu de Fortaleza', text: 'Ven, Espíritu de Fortaleza, y danos valentía para sostener la fe en la prueba y testimoniar a Cristo con nuestra vida.', count: 7, icon: 'shield' },
          { label: 'Gloria', ref: 'gloria', icon: 'star' }
        ]
      },
      {
        title: 'Don de Ciencia',
        mystery: { title: 'Don de Ciencia', reference: 'Sabiduría 7,17', biblicalText: 'Él me dio el conocimiento verdadero de las cosas: conocer la estructura del mundo y la fuerza de los elementos.' },
        blocks: [
          { label: 'Espíritu de Ciencia', text: 'Ven, Espíritu de Ciencia, y ayúdanos a leer la creación y la historia con los ojos de Dios, descubriendo su presencia en todo.', count: 7, icon: 'book' },
          { label: 'Gloria', ref: 'gloria', icon: 'star' }
        ]
      },
      {
        title: 'Don de Piedad',
        mystery: { title: 'Don de Piedad', reference: 'Romanos 8,15', biblicalText: 'No habéis recibido un espíritu de esclavitud para volver a caer en el temor, sino que habéis recibido un Espíritu de hijos adoptivos, que nos hace llamar a Dios: ¡Abbá, Padre!' },
        blocks: [
          { label: 'Espíritu de Piedad', text: 'Ven, Espíritu de Piedad, y despierta en nosotros la confianza de hijos y el amor filial hacia Dios y hacia nuestros hermanos.', count: 7, icon: 'heart' },
          { label: 'Gloria', ref: 'gloria', icon: 'star' }
        ]
      },
      {
        title: 'Don de Temor de Dios',
        mystery: { title: 'Don de Temor de Dios', reference: 'Proverbios 9,10', biblicalText: 'El temor del Señor es el principio de la sabiduría, y el conocimiento del Santo es la inteligencia.' },
        blocks: [
          { label: 'Espíritu de Temor de Dios', text: 'Ven, Espíritu de Temor de Dios, y danos un corazón reverente que huya del pecado y se alegre en agradar al Padre.', count: 7, icon: 'cross' },
          { label: 'Gloria', ref: 'gloria', icon: 'star' }
        ]
      }
    ],
    closing: [
      {
        label: 'Oración final',
        text: 'Espíritu Santo, alma de nuestra alma, te adoramos y te amamos. Guíanos, ilumínanos, santifícanos. Danos tus siete dones y haz de nosotros testigos vivos del amor de Cristo. Amén.',
        count: 1,
        icon: 'sparkles'
      }
    ]
  },

  'san-jose': {
    id: 'san-jose',
    title: 'Coronilla de los Imposibles',
    shortTitle: 'San José',
    subtitle: 'Siete intenciones, siete invocaciones',
    description: 'Una coronilla para confiar a San José las causas difíciles, con siete intenciones y siete invocaciones en cada una.',
    icon: 'crown',
    opening: [
      { label: 'Señal de la Cruz', ref: 'cruz', icon: 'cross' },
      { label: 'Invocación inicial', text: 'San José, patrono de los imposibles, esposo de María y padre adoptivo de Jesús, te pedimos que intercedas por nosotros ante el Padre y nos alcances la gracia de confiar siempre en su providencia. Amén.', count: 1, icon: 'crown' },
      { label: 'Padre Nuestro', ref: 'padrenuestro', icon: 'rosario' },
      { label: 'Ave María', ref: 'avemaria', icon: 'feather' },
      { label: 'Gloria', ref: 'gloria', icon: 'star' }
    ],
    sections: [
      {
        title: 'Por los que no tienen trabajo',
        blocks: [
          { label: 'San José, patrono de los imposibles', text: 'San José, patrono de los imposibles, ruega por nosotros y alcánzanos trabajo digno, justo y estable para quienes lo necesitan.', count: 7, icon: 'crown' },
          { label: 'Gloria', ref: 'gloria', icon: 'star' }
        ]
      },
      {
        title: 'Por las familias',
        blocks: [
          { label: 'San José, patrono de los imposibles', text: 'San José, patrono de los imposibles, ruega por nuestras familias y ayúdanos a vivir con fidelidad, paciencia y amor.', count: 7, icon: 'heart' },
          { label: 'Gloria', ref: 'gloria', icon: 'star' }
        ]
      },
      {
        title: 'Por los enfermos',
        blocks: [
          { label: 'San José, patrono de los imposibles', text: 'San José, patrono de los imposibles, ruega por los enfermos y alcánzanos salud del cuerpo y fortaleza del alma.', count: 7, icon: 'cross' },
          { label: 'Gloria', ref: 'gloria', icon: 'star' }
        ]
      },
      {
        title: 'Por los que sufren soledad',
        blocks: [
          { label: 'San José, patrono de los imposibles', text: 'San José, patrono de los imposibles, ruega por los que sufren soledad, abandono o tristeza, y dales consuelo y compañía.', count: 7, icon: 'heart' },
          { label: 'Gloria', ref: 'gloria', icon: 'star' }
        ]
      },
      {
        title: 'Por los pecadores',
        blocks: [
          { label: 'San José, patrono de los imposibles', text: 'San José, patrono de los imposibles, ruega por los pecadores y por los que se han alejado de Dios, para que encuentren el camino de la conversión.', count: 7, icon: 'sparkles' },
          { label: 'Gloria', ref: 'gloria', icon: 'star' }
        ]
      },
      {
        title: 'Por la Iglesia',
        blocks: [
          { label: 'San José, patrono de los imposibles', text: 'San José, patrono de los imposibles, ruega por la Iglesia, por el Papa, los obispos y los sacerdotes, y alcánzanos vocaciones santas y fieles.', count: 7, icon: 'cross' },
          { label: 'Gloria', ref: 'gloria', icon: 'star' }
        ]
      },
      {
        title: 'Por la paz',
        blocks: [
          { label: 'San José, patrono de los imposibles', text: 'San José, patrono de los imposibles, ruega por la paz del mundo y ayúdanos a ser constructores de reconciliación y justicia.', count: 7, icon: 'shield' },
          { label: 'Gloria', ref: 'gloria', icon: 'star' }
        ]
      }
    ],
    closing: [
      {
        label: 'Oración final',
        text: 'San José, esposo de María y custodio del Redentor, tú que supiste acoger la voluntad de Dios en medio de la incertidumbre, enséñanos a confiar, a trabajar con amor y a esperar con esperanza. Ruega por nosotros. Amén.',
        count: 1,
        icon: 'crown'
      }
    ]
  }
};
