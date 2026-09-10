const LUMEN_GLOS_LINKS = [
    { term: 'Eucaristía', to: ['formacion', 'glosario'], query: 't=Eucaristía' },
    { term: 'Transubstanciación', to: ['formacion', 'glosario'], query: 't=Transubstanciación' },
    { term: 'Misa', to: ['formacion', 'glosario'], query: 't=Misa' },
    { term: 'Bautismo', to: ['formacion', 'glosario'], query: 't=Bautismo' },
    { term: 'Confirmación', to: ['formacion', 'glosario'], query: 't=Confirmación' },
    { term: 'Liturgia', to: ['formacion', 'glosario'], query: 't=Liturgia' },
    { term: 'Trinidad', to: ['formacion', 'glosario'], query: 't=Trinidad' },
    { term: 'Encarnación', to: ['formacion', 'glosario'], query: 't=Encarnación' },
    { term: 'Gracia', to: ['formacion', 'glosario'], query: 't=Gracia' },
    { term: 'Salvación', to: ['formacion', 'glosario'], query: 't=Salvación' },
    { term: 'Revelación', to: ['formacion', 'glosario'], query: 't=Revelación' },
    { term: 'Pecado', to: ['formacion', 'glosario'], query: 't=Pecado' },
    { term: 'Magisterio', to: ['formacion', 'glosario'], query: 't=Magisterio' },
    { term: 'Papa', to: ['formacion', 'glosario'], query: 't=Papa' },
    { term: 'Obispo', to: ['formacion', 'glosario'], query: 't=Obispo' },
    { term: 'Sacerdote', to: ['formacion', 'glosario'], query: 't=Sacerdote' },
    { term: 'Diácono', to: ['formacion', 'glosario'], query: 't=Diácono' },
    { term: 'Infalibilidad', to: ['formacion', 'glosario'], query: 't=Infalibilidad' },
    { term: 'Oración', to: ['formacion', 'glosario'], query: 't=Oración' },
    { term: 'Contemplación', to: ['formacion', 'glosario'], query: 't=Contemplación' },
    { term: 'Meditación', to: ['formacion', 'glosario'], query: 't=Meditación' },
    { term: 'Virtud', to: ['formacion', 'glosario'], query: 't=Virtud' },
    { term: 'Mística', to: ['formacion', 'glosario'], query: 't=Mística' },
    { term: 'Devoción', to: ['formacion', 'glosario'], query: 't=Devoción' },
    { term: 'Conciencia', to: ['formacion', 'glosario'], query: 't=Conciencia' },
    { term: 'Ley Natural', to: ['formacion', 'glosario'], query: 't=Ley Natural' },
    { term: 'Libre Albedrío', to: ['formacion', 'glosario'], query: 't=Libre Albedrío' },
    { term: 'Escándalo', to: ['formacion', 'glosario'], query: 't=Escándalo' },
    { term: 'Bien Común', to: ['formacion', 'glosario'], query: 't=Bien Común' },
    { term: 'Justicia Social', to: ['formacion', 'glosario'], query: 't=Justicia Social' }
];

const LUMEN_RELATED = {
    'formacion:catecismo:profession-faith:trinity': [
        { parts: ['formacion', 'glosario'], query: 't=Trinidad', label: 'Trinidad en el glosario', icon: 'scroll' },
        { parts: ['novenas', 'espiritu-santo'], label: 'Novena al Espíritu Santo', icon: 'novenas' }
    ],
    'formacion:catecismo:profession-faith:incarnation': [
        { parts: ['formacion', 'glosario'], query: 't=Encarnación', label: 'Encarnación en el glosario', icon: 'scroll' },
        { parts: ['rosario', 'gozosos'], label: 'Misterios gozosos', icon: 'rosario' }
    ],
    'formacion:catecismo:profession-faith:creation': [
        { parts: ['formacion', 'mundo-actual', 'ciencia-fe', 'origen'], label: 'Fe y ciencia', icon: 'catecismo' },
        { parts: ['formacion', 'glosario'], query: 't=Revelación', label: 'Revelación en el glosario', icon: 'scroll' }
    ],
    'formacion:catecismo:christian-mystery:sacraments-initiation': [
        { parts: ['formacion', 'glosario'], query: 't=Bautismo', label: 'Bautismo en el glosario', icon: 'scroll' },
        { parts: ['liturgia', 'devotions-traditions', 'eucharistic-adoration'], label: 'Adoración eucarística', icon: 'liturgia' }
    ],
    'formacion:catecismo:life-christ:human-vocation': [
        { parts: ['formacion', 'vocacion', 'llamados', 'plan'], label: 'El plan de Dios', icon: 'catecismo' },
        { parts: ['formacion', 'glosario'], query: 't=Libre Albedrío', label: 'Libre albedrío en el glosario', icon: 'scroll' }
    ],
    'formacion:catecismo:life-christ:virtues': [
        { parts: ['formacion', 'glosario'], query: 't=Virtud', label: 'Virtud en el glosario', icon: 'scroll' },
        { parts: ['formacion', 'moral', 'virtudes'], label: 'Virtudes en la moral', icon: 'catecismo' }
    ],
    'formacion:catecismo:life-christ:social-doctrine': [
        { parts: ['formacion', 'doctrina-social', 'principios'], label: 'Principios de la doctrina social', icon: 'catecismo' }
    ],
    'formacion:liturgia:sacraments-initiation:eucharist': [
        { parts: ['formacion', 'glosario'], query: 't=Eucaristía', label: 'Eucaristía en el glosario', icon: 'scroll' },
        { parts: ['formacion', 'liturgia', 'devotions-traditions', 'eucharistic-adoration'], label: 'Adoración eucarística', icon: 'liturgia' }
    ],
    'formacion:liturgia:sacraments-healing:penance': [
        { parts: ['formacion', 'moral', 'reconciliacion'], label: 'El sacramento de la penitencia', icon: 'catecismo' },
        { parts: ['examen', 'mandamientos'], label: 'Examen de conciencia', icon: 'examen' }
    ],
    'formacion:liturgia:sacraments-healing:mercy-forgiveness': [
        { parts: ['oraciones', 'devotional-prayers'], label: 'Oraciones de misericordia', icon: 'oraciones' }
    ],
    'formacion:liturgia:devotions-traditions:marian-devotions': [
        { parts: ['rosario', 'gozosos'], label: 'Rezar el Rosario', icon: 'rosario' },
        { parts: ['novenas', 'virgen-desatanudos'], label: 'Novena a María', icon: 'novenas' }
    ],
    'formacion:liturgia:devotions-traditions:eucharistic-adoration': [
        { parts: ['formacion', 'glosario'], query: 't=Eucaristía', label: 'Eucaristía en el glosario', icon: 'scroll' },
        { parts: ['oraciones', 'devotional-prayers'], label: 'Oraciones de adoración', icon: 'oraciones' }
    ],
    'formacion:liturgia:devotions-traditions:way-cross': [
        { parts: ['rosario', 'dolorosos'], label: 'Misterios dolorosos', icon: 'rosario' },
        { parts: ['oraciones', 'devotional-prayers'], label: 'Oraciones', icon: 'oraciones' }
    ],
    'formacion:liturgia:devotions-traditions:liturgical-music': [
        { parts: ['devocional'], label: 'Devocional del día', icon: 'compass' }
    ],
    'formacion:moral:conciencia:examen-conciencia': [
        { parts: ['examen', 'mandamientos'], label: 'Hacer el examen', icon: 'examen' },
        { parts: ['formacion', 'glosario'], query: 't=Conciencia', label: 'Conciencia en el glosario', icon: 'scroll' }
    ],
    'formacion:moral:conciencia:pecado-misericordia': [
        { parts: ['oraciones', 'devotional-prayers'], label: 'Oraciones de misericordia', icon: 'oraciones' },
        { parts: ['formacion', 'glosario'], query: 't=Pecado', label: 'Pecado en el glosario', icon: 'scroll' }
    ],
    'formacion:moral:reconciliacion:confesion': [
        { parts: ['examen', 'mandamientos'], label: 'Examen de conciencia', icon: 'examen' },
        { parts: ['formacion', 'glosario'], query: 't=Pecado', label: 'Pecado en el glosario', icon: 'scroll' }
    ],
    'formacion:moral:reconciliacion:empezar': [
        { parts: ['examen', 'mandamientos'], label: 'Examen de conciencia', icon: 'examen' }
    ],
    'formacion:doctrina-social:principios:dignidad': [
        { parts: ['formacion', 'glosario'], query: 't=Bien Común', label: 'Bien Común en el glosario', icon: 'scroll' },
        { parts: ['formacion', 'glosario'], query: 't=Justicia Social', label: 'Justicia Social en el glosario', icon: 'scroll' }
    ],
    'formacion:doctrina-social:principios:bien-comun': [
        { parts: ['formacion', 'doctrina-social', 'principios', 'dignidad'], label: 'Dignidad de la persona', icon: 'catecismo' }
    ],
    'formacion:doctrina-social:principios:solidaridad': [
        { parts: ['formacion', 'doctrina-social', 'principios', 'bien-comun'], label: 'Bien Común', icon: 'catecismo' }
    ],
    'formacion:vocacion:llamados:plan': [
        { parts: ['formacion', 'catecismo', 'life-christ', 'human-vocation'], label: 'La vocación del hombre', icon: 'catecismo' }
    ],
    'formacion:vocacion:discernimiento:orar': [
        { parts: ['oraciones'], label: 'Oraciones', icon: 'oraciones' },
        { parts: ['formacion', 'glosario'], query: 't=Oración', label: 'Oración en el glosario', icon: 'scroll' }
    ],
    'formacion:vocacion:discernimiento:consejo': [
        { parts: ['formacion', 'glosario'], query: 't=Conciencia', label: 'Conciencia en el glosario', icon: 'scroll' }
    ],
    'formacion:vocacion:estados:matrimonio': [
        { parts: ['oraciones', 'liturgical-special'], label: 'Oraciones por la familia', icon: 'oraciones' }
    ],
    'formacion:vocacion:estados:consagrada': [
        { parts: ['formacion', 'santos', 'church-doctors'], label: 'Santos doctores', icon: 'santos' },
        { parts: ['novenas', 'san-jose'], label: 'Novena a san José', icon: 'novenas' }
    ],
    'formacion:vocacion:estados:sacerdocio': [
        { parts: ['formacion', 'santos', 'founders'], label: 'Santos fundadores', icon: 'santos' },
        { parts: ['formacion', 'glosario'], query: 't=Sacerdote', label: 'Sacerdote en el glosario', icon: 'scroll' }
    ],
    'formacion:virgen:maria-escritura:anunciacion': [
        { parts: ['rosario', 'gozosos'], label: 'Misterios gozosos', icon: 'rosario' }
    ],
    'formacion:virgen:maria-escritura:cruz': [
        { parts: ['rosario', 'dolorosos'], label: 'Misterios dolorosos', icon: 'rosario' }
    ],
    'formacion:virgen:rosario:rezarlo': [
        { parts: ['rosario', 'gozosos'], label: 'Rezar el Rosario', icon: 'rosario' },
        { parts: ['novenas', 'virgen-desatanudos'], label: 'Novena a María', icon: 'novenas' }
    ],
    'formacion:virgen:rosario:misterios': [
        { parts: ['rosario', 'gozosos'], label: 'Misterios gozosos', icon: 'rosario' },
        { parts: ['rosario', 'luminosos'], label: 'Misterios luminosos', icon: 'rosario' }
    ],
    'formacion:virgen:dogmas:madre-dios': [
        { parts: ['formacion', 'glosario'], query: 't=Devoción', label: 'Devoción en el glosario', icon: 'scroll' }
    ],
    'formacion:apologetica:marian-devotion:mary-worship': [
        { parts: ['formacion', 'glosario'], query: 't=Devoción', label: 'Devoción en el glosario', icon: 'scroll' },
        { parts: ['rosario', 'gozosos'], label: 'Rosario', icon: 'rosario' }
    ],
    'formacion:apologetica:sacraments-worship:transubstantiation': [
        { parts: ['formacion', 'glosario'], query: 't=Transubstanciación', label: 'Transubstanciación en el glosario', icon: 'scroll' },
        { parts: ['formacion', 'glosario'], query: 't=Eucaristía', label: 'Eucaristía en el glosario', icon: 'scroll' }
    ],
    'formacion:apologetica:papal-authority:papal-infallibility': [
        { parts: ['formacion', 'glosario'], query: 't=Infalibilidad', label: 'Infalibilidad en el glosario', icon: 'scroll' },
        { parts: ['formacion', 'glosario'], query: 't=Magisterio', label: 'Magisterio en el glosario', icon: 'scroll' }
    ],
    'formacion:apologetica:saints-intercession:pray-to-saints': [
        { parts: ['novenas', 'san-miguel'], label: 'Novena a san Miguel', icon: 'novenas' },
        { parts: ['formacion', 'glosario'], query: 't=Devoción', label: 'Devoción en el glosario', icon: 'scroll' }
    ],
    'formacion:apologetica:eschatology:purgatory': [
        { parts: ['oraciones', 'liturgical-special'], label: 'Oraciones por las almas', icon: 'oraciones' },
        { parts: ['examen', 'preceptos'], label: 'Examen de conciencia', icon: 'examen' }
    ],
    'formacion:mundo-actual:creer-hoy:distraido': [
        { parts: ['devocional'], label: 'Devocional del día', icon: 'compass' },
        { parts: ['oraciones'], label: 'Oraciones', icon: 'oraciones' }
    ],
    'formacion:mundo-actual:ciencia-fe:origen': [
        { parts: ['formacion', 'catecismo', 'profession-faith', 'creation'], label: 'Dios creador', icon: 'catecismo' },
        { parts: ['formacion', 'glosario'], query: 't=Revelación', label: 'Revelación en el glosario', icon: 'scroll' }
    ],
    'formacion:mundo-actual:testigos:tu-testimonio': [
        { parts: ['evangelio'], label: 'Evangelio del día', icon: 'book' },
        { parts: ['devocional'], label: 'Devocional del día', icon: 'compass' }
    ],
    'formacion:santos:popular-devotion': [
        { parts: ['novenas', 'san-jose'], label: 'Novena a san José', icon: 'novenas' },
        { parts: ['formacion', 'glosario'], query: 't=Devoción', label: 'Devoción en el glosario', icon: 'scroll' }
    ],
    'formacion:santos:marian-saints': [
        { parts: ['rosario', 'gozosos'], label: 'Rosario', icon: 'rosario' },
        { parts: ['novenas', 'virgen-desatanudos'], label: 'Novena a María', icon: 'novenas' }
    ],
    'formacion:santos:church-doctors': [
        { parts: ['novenas', 'espiritu-santo'], label: 'Novena al Espíritu Santo', icon: 'novenas' },
        { parts: ['formacion', 'glosario'], query: 't=Magisterio', label: 'Magisterio en el glosario', icon: 'scroll' }
    ]
};

const LUMEN_RELATED_DEFAULT = {
    formacion: [
        { parts: ['oraciones'], label: 'Oraciones', icon: 'oraciones' },
        { parts: ['rosario', 'gozosos'], label: 'Rezar el Rosario', icon: 'rosario' }
    ],
    oraciones: [
        { parts: ['rosario', 'gozosos'], label: 'Rosario', icon: 'rosario' },
        { parts: ['devocional'], label: 'Devocional del día', icon: 'compass' }
    ],
    rosario: [
        { parts: ['oraciones'], label: 'Oraciones', icon: 'oraciones' },
        { parts: ['novenas'], label: 'Novenas', icon: 'novenas' }
    ],
    novenas: [
        { parts: ['oraciones'], label: 'Oraciones', icon: 'oraciones' },
        { parts: ['rosario', 'gozosos'], label: 'Rosario', icon: 'rosario' }
    ],
    examen: [
        { parts: ['formacion', 'moral', 'conciencia'], label: 'La conciencia', icon: 'catecismo' },
        { parts: ['oraciones', 'devotional-prayers'], label: 'Oraciones', icon: 'oraciones' }
    ],
    calendario: [
        { parts: ['actividades'], label: 'Actividades', icon: 'calendar' }
    ],
    nosotros: [
        { parts: ['intenciones'], label: 'Intenciones', icon: 'flame' }
    ],
    devocional: [
        { parts: ['rosario', 'gozosos'], label: 'Rosario', icon: 'rosario' },
        { parts: ['oraciones'], label: 'Oraciones', icon: 'oraciones' }
    ]
};