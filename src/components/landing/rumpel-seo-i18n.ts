/**
 * Stable IDs make translations independent of English array order.
 * CI validates these IDs against the route's English FAQ, HowTo and rules.
 */
export const RUMPEL_SEO_IDS = {
  "faq": [
    "origin",
    "dance",
    "generate",
    "audio",
    "year"
  ],
  "steps": [
    "image",
    "template",
    "render"
  ],
  "locks": [
    "character",
    "set",
    "beats",
    "grade",
    "audio"
  ],
  "rules": [
    "original",
    "accurate_label",
    "consent",
    "music",
    "disclosure"
  ]
} as const;
type SeoId<T extends keyof typeof RUMPEL_SEO_IDS> = (typeof RUMPEL_SEO_IDS)[T][number];

export type RumpelSeoCopy = {
  faq: Readonly<Record<SeoId<'faq'>, readonly [string, string]>>;
  steps: Readonly<Record<SeoId<'steps'>, readonly [string, string]>>;
  locks: Readonly<Record<SeoId<'locks'>, readonly [string, string]>>;
  rules: Readonly<Record<SeoId<'rules'>, string>>;
  sections: Readonly<Record<string, string>>;
};
/** Only locales with translated long-form content are advertised. */
export const RUMPEL_SEO_LOCALES = ['en', 'es', 'pt-BR', 'fr', 'de'] as const;
const copies: Record<string, RumpelSeoCopy> = {
  "es": {
    "faq": {
      "origin": [
        "¿La escena de Rumpelstiltskin (1987) pertenece a una película real?",
        "En 1987 sí se estrenó una película de Rumpelstiltskin, un musical de Cannon Movie Tales protagonizado por Billy Barty, pero la escena del granero no aparece en ella. El clip fue generado con IA y se publicó por primera vez en Instagram en agosto de 2026."
      ],
      "dance": [
        "¿Qué es el baile de Rumpelstiltskin?",
        "Es el baile de puntillas del clip viral: un hombre pequeño con esmoquin de terciopelo cruza sigilosamente un granero, pide silencio a la cámara y sigue bailando mientras la paja se transforma en oro."
      ],
      "generate": [
        "¿Cómo creo un vídeo Rumpelstiltskin con IA?",
        "Sube una imagen clara y abre la plantilla Rumpelstiltskin. El personaje, el granero y el aspecto de película ya están configurados: no necesitas escribir un prompt. El vídeo tarda unos minutos."
      ],
      "audio": [
        "¿Puedo utilizar el audio original?",
        "Solo si tienes los derechos necesarios. La canción que popularizó la tendencia es una grabación comercial. Utiliza audio autorizado o el sonido de una plantilla con licencia."
      ],
      "year": [
        "¿Por qué aparece 1987 si no es de ese año?",
        "Es parte de la broma, pero también genera confusión. El título pretende hacer parecer que es una película perdida. Si creas tu versión, inventa un título y señala que está hecho con IA."
      ]
    },
    "steps": {
      "image": [
        "Sube una imagen clara",
        "Elige una imagen clara y bien iluminada, con el sujeto visible y espacio suficiente para mostrar la postura del baile. Evita imágenes borrosas o con filtros intensos."
      ],
      "template": [
        "Abre la plantilla Rumpelstiltskin",
        "El personaje, el granero, el oro y la estética de cine ochentero ya están definidos. Al elegir la plantilla no tienes que escribir un prompt."
      ],
      "render": [
        "Genera y descarga",
        "El clip se genera en HD en unos minutos con pasos de puntillas, gesto de silencio y transformación en oro. Identifica el resultado como IA cuando lo publiques."
      ]
    },
    "locks": {
      "character": [
        "Mantén fijo el personaje",
        "Crea una ficha del personaje con vistas frontal, lateral y de cuerpo entero. Usa la misma ficha en cada plano para reducir los cambios de rostro entre tomas."
      ],
      "set": [
        "Fija el escenario con una imagen",
        "Primero genera el granero como una fotografía: noche, pacas de heno, un farol, sombras profundas y estética de película. Si la imagen parece digital, el vídeo también."
      ],
      "beats": [
        "Anima en fragmentos de 4 a 6 segundos",
        "Un movimiento por generación: caminar de puntillas, detenerse y pedir silencio, la mujer girando y el baile. Las tomas largas pierden coherencia."
      ],
      "grade": [
        "Corrige el color como una película, no como un filtro",
        "Describe en el prompt la emulsión y sus defectos: «fotograma de cuento de hadas de los años 70, 16 mm, grano visible, enfoque suave, halo luminoso». Añade grano y un ligero temblor vertical en la edición."
      ],
      "audio": [
        "El audio, al final",
        "Comprueba que tengas licencia: consulta las normas de derechos más abajo."
      ]
    },
    "rules": {
      "original": "Crea tu propia versión. Rumpelstiltskin es un personaje de los hermanos Grimm de 1812, de dominio público; no es la imagen de una persona viva. Puedes utilizar tu propia foto.",
      "accurate_label": "No lo presentes como una película real. Existe Rumpelstiltskin (1987), cuyos derechos corresponden a Amazon MGM; atribuirle falsamente esta escena perjudicaría a sus creadores y al legado de Billy Barty. Inventa un título, estudio y año ficticios.",
      "consent": "No utilices imágenes de personas sin permiso. Aunque circulen versiones con figuras públicas, debes disponer de los derechos y de cualquier consentimiento necesario para editar o publicar la imagen de otra persona. Utiliza solo imágenes que estés autorizado a editar.",
      "music": "No incluyas la canción de Riff Raff sin tener derechos. «Tip Toe Wing in My Jawwdinz» se publicó en Mad Decent; que aparezca en sonidos populares no supone una licencia. Utiliza música autorizada.",
      "disclosure": "Indica claramente que es IA. Añade «IA» en la propia tarjeta de título, no en un comentario poco visible."
    },
    "sections": {
      "whatTitle": "Qué es realmente el vídeo Rumpelstiltskin de 1987",
      "whatP1": "Un hombre pequeño, de pelo rojizo encrespado, arrugas pintadas, esmoquin de terciopelo negro y pajarita, se asoma tras una paca de heno, camina de puntillas hacia la cámara, se lleva un dedo a los labios, baila entre la paja y la convierte en monedas de oro.",
      "whatP2": "La descripción afirma que es de 1987, pero esa escena no existe en ninguna película de ese año. La auténtica Rumpelstiltskin (1987) fue un musical de Cannon Movie Tales rodado en Israel y protagonizado por Billy Barty: llevaba gorro con pluma y túnica marrón y actuaba junto a una rueca dentro de un castillo. Ni granero ni esmoquin.",
      "whatP3": "El clip está generado con IA. Know Your Meme lo vincula a un Reel de Instagram del 27 de agosto de 2026 de @stroinaya, con texto publicitario en ruso para un curso de IA y sin mencionar la herramienta. Se difundió a finales de septiembre, cuando alguien añadió «Tip Toe Wing in My Jawwdinz» de Riff Raff (2014); una publicación de TikTok del 29 de septiembre impulsó la tendencia. Después llegó a X, donde una publicación alcanzó 11,4 millones de visualizaciones, y a TikTok, Reels y Shorts con #tiptoeinginmyjordans. Las sustituciones de personajes aparecieron a los pocos días y mucha gente buscó una película que no existe.",
      "imageAlt": "Rumpelstiltskin con IA: vídeo de puntillas en un granero, simulando una película de 1987",
      "lostTitle": "Por qué parece una película perdida",
      "lostP1": "Tres elementos crean la ilusión: el grano, el color y el título. Enfoque suave, Technicolor cálido y saturado, un ligero temblor de fotograma y un rótulo con tipografía de época que dice «Rumpelstiltskin (1987)», aunque el clip de origen no tenía tarjeta de título, marca de agua ni créditos.",
      "lostP2": "Las pistas habituales de la IA siguen ahí: cambia la geometría del rostro entre el gesto de silencio y la sonrisa, el oro aparece de golpe amontonado y nunca se ve una rueca.",
      "three": "Tres pasos",
      "howTitle": "Cómo crear tu vídeo Rumpelstiltskin con IA",
      "handTitle": "Cómo hacerlo manualmente: cinco puntos de control",
      "handIntro": "Si prefieres crear el efecto en un modelo de imagen a vídeo, reconstruye el proceso fijando personaje, escenario y movimientos cortos:",
      "handLinkBefore": "¿Prefieres usar Genjutsu con tu propio vídeo de referencia? Sigue nuestra guía paso a paso:",
      "handLink": "Cómo crear un vídeo Rumpelstiltskin con IA en Genjutsu AI",
      "rulesTitle": "Qué puedes hacer y qué no con esta tendencia",
      "rulesBefore": "Consulta las reglas completas en nuestra",
      "rulesLink": "Política de uso permitido",
      "faqTitle": "Preguntas frecuentes sobre Rumpelstiltskin con IA",
      "howToName": "Cómo crear un vídeo Rumpelstiltskin con IA",
      "articleAbout": "Tendencia de vídeo Rumpelstiltskin (1987) de puntillas generado con IA"
    }
  },
  "pt-BR": {
    "faq": {
      "origin": [
        "O vídeo Rumpelstiltskin de 1987 é de um filme real?",
        "Um filme Rumpelstiltskin foi lançado em 1987, um musical Cannon Movie Tales com Billy Barty, mas a cena do celeiro não aparece nele. O vídeo foi gerado por IA e publicado inicialmente no Instagram em agosto de 2026."
      ],
      "dance": [
        "O que é a dança Rumpelstiltskin?",
        "É a dança sorrateira na ponta dos pés do vídeo viral: um homem pequeno de smoking de veludo atravessa o celeiro, pede silêncio para a câmera e continua dançando enquanto a palha vira ouro."
      ],
      "generate": [
        "Como criar um vídeo Rumpelstiltskin com IA?",
        "Envie uma imagem nítida e abra o modelo Rumpelstiltskin. O personagem, o celeiro e o visual de filme já estão configurados, sem precisar escrever prompt. A geração leva alguns minutos."
      ],
      "audio": [
        "Posso usar o áudio original?",
        "Somente se tiver os direitos necessários. A música que popularizou a tendência é um lançamento comercial. Use áudio liberado ou um som de modelo licenciado."
      ],
      "year": [
        "Por que o vídeo diz 1987 se não é daquele ano?",
        "É uma piada, mas também desinformação. O título faz parecer um filme perdido. Crie um título fictício para sua versão e identifique o vídeo como IA."
      ]
    },
    "steps": {
      "image": [
        "Envie uma imagem nítida",
        "Escolha uma imagem nítida e bem iluminada, com o personagem visível e espaço para mostrar a pose da dança. Evite imagens borradas ou com filtros fortes."
      ],
      "template": [
        "Abra o modelo Rumpelstiltskin",
        "O personagem, o celeiro, o ouro e o visual de filme dos anos 80 já estão configurados. Basta selecionar o modelo, sem escrever prompt."
      ],
      "render": [
        "Gere e baixe",
        "O vídeo é gerado em HD em alguns minutos, com os passos, o gesto de silêncio e o ouro já coreografados. Informe que foi feito com IA ao publicar."
      ]
    },
    "locks": {
      "character": [
        "Defina o personagem primeiro",
        "Crie uma ficha do personagem com vista frontal, lateral e corpo inteiro em um modelo de imagem. Use a mesma ficha em todas as cenas para evitar mudanças de rosto."
      ],
      "set": [
        "Defina o cenário em uma imagem",
        "Gere primeiro uma foto do celeiro: noite, fardos de feno, uma lanterna, sombras profundas e visual de filme. Se a imagem parecer digital, o vídeo também parecerá."
      ],
      "beats": [
        "Anime em trechos de 4 a 6 segundos",
        "Um movimento por geração: andar na ponta dos pés, parar e pedir silêncio, a mulher se virando e a dança. Cenas longas perdem consistência."
      ],
      "grade": [
        "Faça a correção de cor como filme, não como filtro",
        "Descreva no prompt a película e seus defeitos: «fotograma de conto de fadas dos anos 70, 16 mm, grão visível, foco suave, brilho difuso». Depois adicione grão e leve tremor vertical na edição."
      ],
      "audio": [
        "Áudio por último",
        "Verifique os direitos — consulte a seção abaixo."
      ]
    },
    "rules": {
      "original": "Crie sua própria versão. Rumpelstiltskin é um personagem dos irmãos Grimm de 1812, em domínio público, sem envolver a imagem de uma pessoa viva. Usar sua foto é permitido.",
      "accurate_label": "Não apresente como filme real. Rumpelstiltskin (1987) existe e seus direitos pertencem à Amazon MGM; atribuir essa cena ao filme prejudica seus criadores e o legado de Billy Barty. Invente título, estúdio e ano fictícios.",
      "consent": "Não use imagens de pessoas sem permissão. Mesmo que circulem versões com figuras públicas, você precisa ter os direitos e qualquer consentimento necessário para editar ou publicar a imagem de outra pessoa. Use apenas imagens que você tenha autorização para editar.",
      "music": "Não use a música de Riff Raff sem direitos. «Tip Toe Wing in My Jawwdinz» é um lançamento Mad Decent; uma biblioteca de sons populares não constitui licença. Escolha áudio autorizado.",
      "disclosure": "Identifique como IA. Coloque «IA» no próprio cartão de título, não em um comentário que ninguém verá."
    },
    "sections": {
      "whatTitle": "O que realmente é o vídeo Rumpelstiltskin de 1987",
      "whatP1": "Um homem baixinho, de cabelo ruivo arrepiado, rugas pintadas, smoking de veludo preto e gravata borboleta surge atrás de um fardo de feno, anda na ponta dos pés em direção à câmera, leva o dedo aos lábios, dança na palha e a transforma em moedas de ouro.",
      "whatP2": "A legenda diz 1987, mas essa cena não existe no filme. O verdadeiro Rumpelstiltskin (1987) foi um musical Cannon Movie Tales rodado em Israel, estrelado por Billy Barty em seu único papel principal, com chapéu de penas, túnica marrom e uma roca em uma sala do castelo. Nada de celeiro ou smoking.",
      "whatP3": "O vídeo foi gerado por IA. Segundo Know Your Meme, surgiu em um Reel de Instagram de 27 de agosto de 2026 de @stroinaya, com propaganda em russo de um curso de IA e sem citar ferramenta. Ficou pouco conhecido até o fim de setembro, quando alguém adicionou «Tip Toe Wing in My Jawwdinz» de Riff Raff (2014); um TikTok de 29 de setembro impulsionou a tendência. Depois chegou ao X, onde uma republicação atingiu 11,4 milhões de visualizações, e se espalhou por TikTok, Reels e Shorts com #tiptoeinginmyjordans. Em três dias apareceram trocas de personagens e muita gente procurou um filme inexistente.",
      "imageAlt": "Rumpelstiltskin com IA: vídeo na ponta dos pés em um celeiro, com visual de filme de 1987",
      "lostTitle": "Por que parece um filme perdido",
      "lostP1": "Três elementos criam a ilusão: granulação, cor e legenda. Foco suave, Technicolor quente e saturado, leve oscilação de fotograma e um cartão de título com tipografia antiga dizendo «Rumpelstiltskin (1987)», mesmo que o vídeo original não tivesse título, marca d’água nem créditos.",
      "lostP2": "Os sinais de IA aparecem: o rosto do personagem muda entre o gesto de silêncio e o sorriso, o ouro surge instantaneamente e nenhuma roca aparece.",
      "three": "Três etapas",
      "howTitle": "Como criar seu vídeo Rumpelstiltskin com IA",
      "handTitle": "Fazendo manualmente: cinco elementos fixos",
      "handIntro": "Se preferir criar o efeito em um modelo de imagem para vídeo, reconstrua o processo com personagem e cenário fixos e movimentos curtos:",
      "handLinkBefore": "Prefere usar o Genjutsu com seu próprio modelo de vídeo? Veja o passo a passo:",
      "handLink": "Como criar um vídeo Rumpelstiltskin com IA no Genjutsu AI",
      "rulesTitle": "O que pode e o que não pode fazer com a tendência",
      "rulesBefore": "As regras completas estão em nossa",
      "rulesLink": "Política de Uso Aceitável",
      "faqTitle": "Perguntas frequentes sobre Rumpelstiltskin com IA",
      "howToName": "Como criar um vídeo Rumpelstiltskin com IA",
      "articleAbout": "Tendência de vídeo Rumpelstiltskin (1987) na ponta dos pés com IA"
    }
  },
  "fr": {
    "faq": {
      "origin": [
        "La scène Rumpelstiltskin de 1987 vient-elle d’un vrai film ?",
        "Un film Rumpelstiltskin est bien sorti en 1987 : une comédie musicale Cannon Movie Tales avec Billy Barty. Mais la scène de grange n’y figure pas. Le clip est généré par IA et a été publié sur Instagram en août 2026."
      ],
      "dance": [
        "Qu’est-ce que la danse Rumpelstiltskin ?",
        "C’est la danse furtive sur la pointe des pieds du clip viral : un petit homme en smoking de velours traverse une grange, fait signe de se taire à la caméra et danse tandis que la paille devient de l’or."
      ],
      "generate": [
        "Comment créer une vidéo Rumpelstiltskin IA ?",
        "Importez une image nette et ouvrez le modèle Rumpelstiltskin. Le personnage, la grange et le rendu film sont préconfigurés : aucun prompt à rédiger. La génération prend quelques minutes."
      ],
      "audio": [
        "Puis-je utiliser l’audio original ?",
        "Seulement si vous en détenez les droits. La chanson qui a popularisé la tendance est une sortie commerciale. Utilisez une piste autorisée ou un son de modèle sous licence."
      ],
      "year": [
        "Pourquoi l’année 1987 apparaît-elle si la vidéo est récente ?",
        "C’est une plaisanterie, mais aussi une information trompeuse. La légende vise à faire croire à un film perdu. Pour votre version, inventez un titre et précisez qu’elle est générée par IA."
      ]
    },
    "steps": {
      "image": [
        "Importez une image nette",
        "Choisissez une image nette et bien éclairée où le sujet est visible et dispose d'assez d'espace pour la posture de danse. Évitez le flou et les filtres prononcés."
      ],
      "template": [
        "Ouvrez le modèle Rumpelstiltskin",
        "Le personnage, la grange, l’or et le rendu de film des années 80 sont déjà définis. Vous n’avez pas besoin de rédiger de prompt."
      ],
      "render": [
        "Générez et téléchargez",
        "La vidéo HD se génère en quelques minutes, avec les pas, le geste de silence et l’or déjà chorégraphiés. Signalez l’IA lors de la publication."
      ]
    },
    "locks": {
      "character": [
        "Fixez d’abord le personnage",
        "Créez une fiche de personnage de face, de profil et en pied avec un modèle d’image. Utilisez-la dans chaque plan pour éviter la dérive du visage."
      ],
      "set": [
        "Fixez le décor sur une image",
        "Générez d’abord une photographie de la grange : nuit, bottes de foin, lanterne, ombres profondes et rendu de pellicule. Si l’image paraît numérique, la vidéo aussi."
      ],
      "beats": [
        "Animez par séquences de 4 à 6 secondes",
        "Un mouvement par génération : pas sur la pointe des pieds, arrêt et doigt sur les lèvres, femme se retournant, danse. Les longues prises dérivent."
      ],
      "grade": [
        "Étalonnez comme une pellicule, pas comme un filtre",
        "Indiquez le support et ses défauts dans le prompt : « photogramme de conte de fées des années 1970, 16 mm, grain visible, mise au point douce, halo lumineux ». Ajoutez ensuite du grain et une légère oscillation verticale."
      ],
      "audio": [
        "Ajoutez l’audio en dernier",
        "Assurez-vous de disposer des droits : consultez la section ci-dessous."
      ]
    },
    "rules": {
      "original": "Créez votre propre version. Rumpelstiltskin est un personnage des frères Grimm datant de 1812, dans le domaine public, sans ressemblance avec une personne vivante. Vous pouvez utiliser votre propre photo.",
      "accurate_label": "Ne présentez pas le clip comme un vrai film. Rumpelstiltskin (1987) existe, avec des droits appartenant à Amazon MGM ; lui attribuer cette scène serait trompeur pour les créateurs et l’héritage de Billy Barty. Inventez plutôt un titre, un studio et une année fictifs.",
      "consent": "N’utilisez pas d’images de personnes sans autorisation. Même si des versions mettant en scène des personnalités públicas circulent, vous devez disposer des droits et des consentements nécessaires pour modifier ou publier l’image d’autrui. Utilisez uniquement des images que vous êtes autorisé à modifier.",
      "music": "N’utilisez pas la chanson de Riff Raff sans droits. « Tip Toe Wing in My Jawwdinz » est sorti chez Mad Decent ; une bibliothèque de sons tendance n’est pas en soi une licence. Choisissez une piste autorisée.",
      "disclosure": "Signalez l’IA. Ajoutez « IA » sur la carte de titre elle-même, pas dans un commentaire invisible."
    },
    "sections": {
      "whatTitle": "Ce qu’est réellement le clip Rumpelstiltskin de 1987",
      "whatP1": "Un petit homme aux cheveux roux ébouriffés, aux rides maquillées, en smoking de velours noir et nœud papillon, se cache derrière une botte de foin, avance sur la pointe des pieds, pose un doigt sur ses lèvres, danse dans la paille et transforme celle-ci en pièces d’or.",
      "whatP2": "La légende indique 1987, mais cette scène n’existe pas dans le vrai film. Rumpelstiltskin (1987) était une comédie musicale Cannon Movie Tales tournée en Israël, avec Billy Barty dans son unique rôle principal : chapeau à plume, tunique brune et rouet dans un château. Ni grange ni smoking.",
      "whatP3": "Le clip est généré par IA. Know Your Meme le rattache à un Reel Instagram du 27 août 2026 de @stroinaya, accompagné d’une publicité en russe pour un cours d’IA sans mentionner d’outil. Il a peu circulé jusqu’à fin septembre, quand quelqu’un lui a ajouté « Tip Toe Wing in My Jawwdinz » de Riff Raff (2014). Un TikTok du 29 septembre a lancé la vague. La vidéo a ensuite atteint X, où une republication a obtenu 11,4 millions de vues, puis TikTok, Reels et Shorts avec #tiptoeinginmyjordans. Les remplacements de personnages ont suivi en trois jours et beaucoup ont recherché un film inexistant.",
      "imageAlt": "Rumpelstiltskin IA : vidéo de danse sur la pointe des pieds dans une grange, style film de 1987",
      "lostTitle": "Pourquoi on croit voir un film perdu",
      "lostP1": "Trois éléments créent l’illusion : grain, étalonnage et légende. Flou doux, Technicolor chaud et saturé, léger tremblement de pellicule et carton à typographie ancienne annonçant « Rumpelstiltskin (1987) », alors que la source n’avait ni carton, ni filigrane, ni générique.",
      "lostP2": "Les indices habituels de l’IA restent visibles : le visage change entre le geste de silence et le sourire, l’or apparaît d’un coup et aucun rouet n’est montré.",
      "three": "Trois étapes",
      "howTitle": "Comment créer votre vidéo Rumpelstiltskin IA",
      "handTitle": "Créer l’effet à la main : cinq éléments à fixer",
      "handIntro": "Si vous préférez reconstruire l’effet dans un modèle image-vers-vidéo, fixez personnage et décor puis animez en courtes séquences :",
      "handLinkBefore": "Vous préférez Genjutsu avec votre propre vidéo de référence ? Suivez notre guide pas à pas :",
      "handLink": "Créer une vidéo Rumpelstiltskin IA avec Genjutsu AI",
      "rulesTitle": "Ce que vous pouvez faire ou non avec cette tendance",
      "rulesBefore": "Retrouvez toutes les règles dans notre",
      "rulesLink": "Politique d’utilisation acceptable",
      "faqTitle": "FAQ Rumpelstiltskin IA",
      "howToName": "Comment créer une vidéo Rumpelstiltskin IA",
      "articleAbout": "Tendance vidéo Rumpelstiltskin (1987) sur la pointe des pieds générée par IA"
    }
  },
  "de": {
    "faq": {
      "origin": [
        "Ist der Rumpelstiltskin-Clip von 1987 aus einem echten Film?",
        "1987 erschien tatsächlich ein Rumpelstiltskin-Film – ein Cannon-Movie-Tales-Musical mit Billy Barty. Die Scheunenszene kommt darin jedoch nicht vor. Der Clip wurde mit KI erstellt und erstmals im August 2026 auf Instagram veröffentlicht."
      ],
      "dance": [
        "Was ist der Rumpelstiltskin-Tanz?",
        "Der freche Zehenspitzen-Tanz aus dem viralen Clip: Ein kleiner Mann im Samtsmoking schleicht durch eine Scheune, mahnt die Kamera zur Ruhe und tanzt, während Stroh zu Gold wird."
      ],
      "generate": [
        "Wie erstelle ich ein Rumpelstiltskin-KI-Video?",
        "Lade ein klares Bild hoch und öffne die Rumpelstiltskin-Vorlage. Figur, Scheune und Filmlook sind voreingestellt. Du brauchst keinen Prompt; das Video wird in einigen Minuten erstellt."
      ],
      "audio": [
        "Darf ich den Originalton verwenden?",
        "Nur wenn du die Rechte daran besitzt. Der Trend-Song ist eine kommerzielle Veröffentlichung. Nutze einen rechtmäßig lizenzierten Titel oder Vorlagensound."
      ],
      "year": [
        "Warum steht 1987 im Video, obwohl es nicht von damals ist?",
        "Das ist der Witz, aber auch irreführend. Der Titel soll wie ein verschollener Film wirken. Erfinde für deine Version einen Titel und kennzeichne sie als KI-generiert."
      ]
    },
    "steps": {
      "image": [
        "Klares Bild hochladen",
        "Wähle ein klares, gut beleuchtetes Bild, auf dem das Motiv und seine Tanzhaltung ausreichend zu sehen sind. Vermeide unscharfe Bilder und starke Filter."
      ],
      "template": [
        "Rumpelstiltskin-Vorlage öffnen",
        "Figur, Scheune, Gold und 80er-Filmlook sind bereits festgelegt. Mit dieser Vorlage entfällt das Schreiben eines Prompts."
      ],
      "render": [
        "Generieren und herunterladen",
        "Der HD-Clip wird in einigen Minuten erstellt, inklusive Zehenspitzen-Tanz, Ruhezeichen und Gold. Kennzeichne ihn beim Posten als KI."
      ]
    },
    "locks": {
      "character": [
        "Zuerst die Figur festlegen",
        "Erstelle ein Character-Sheet mit Vorder-, Seiten- und Ganzkörperansicht. Nutze dieselbe Vorlage für jede Einstellung, damit das Gesicht nicht von Szene zu Szene abweicht."
      ],
      "set": [
        "Die Kulisse als Standbild festlegen",
        "Generiere zuerst ein Foto der Scheune: Nacht, Heuballen, eine Laterne, tiefe Schatten und Filmlook. Wenn das Standbild digital aussieht, wirkt das Video genauso."
      ],
      "beats": [
        "In 4–6-Sekunden-Bewegungen animieren",
        "Eine Bewegung pro Generierung: Zehenspitzen, Anhalten mit Finger auf den Lippen, Drehung der Frau, Tanz. Lange Einstellungen verlieren an Konsistenz."
      ],
      "grade": [
        "Farbkorrektur wie beim Film statt Filter",
        "Beschreibe im Prompt das Filmmaterial mit seinen Fehlern: „Märchenfilm-Standbild der 1970er, 16 mm, sichtbares Korn, weicher Fokus, Lichtsaum“. Füge anschließend Korn und ein leichtes vertikales Bildzittern hinzu."
      ],
      "audio": [
        "Audio zum Schluss",
        "Kläre die Rechte – siehe unten."
      ]
    },
    "rules": {
      "original": "Erstelle eine eigene Version. Rumpelstilzchen ist eine Märchenfigur der Brüder Grimm aus dem Jahr 1812 und gemeinfrei, kein Abbild einer lebenden Person. Du kannst dein eigenes Foto verwenden.",
      "accurate_label": "Tu nicht so, als stamme der Clip aus einem echten Film. Rumpelstiltskin (1987) existiert und die Rechte liegen bei Amazon MGM; eine falsche Zuordnung wäre irreführend gegenüber den Urhebern und dem Nachlass von Billy Barty. Erfinde besser einen fiktiven Filmtitel, ein Studio und ein Jahr.",
      "consent": "Verwende keine Bilder von Personen ohne Erlaubnis. Auch wenn Versionen mit bekannten Persönlichkeiten im Umlauf sind, musst du die erforderlichen Rechte und gegebenenfalls Einwilligungen besitzen, um das Abbild einer anderen Person zu bearbeiten oder zu veröffentlichen. Verwende nur Bilder, die du bearbeiten darfst.",
      "music": "Verwende den Riff-Raff-Titel nicht ohne Musikrechte. „Tip Toe Wing in My Jawwdinz“ erschien bei Mad Decent; eine Trend-Sound-Bibliothek ist keine allgemeine Lizenz. Nutze rechtmäßig freigegebenen Ton.",
      "disclosure": "Kennzeichne das Ergebnis als KI. Schreibe „KI“ auf die Titelkarte selbst, nicht in einen versteckten Kommentar."
    },
    "sections": {
      "whatTitle": "Was der Rumpelstiltskin-Clip von 1987 wirklich ist",
      "whatP1": "Ein kleiner Mann mit zerzausten roten Haaren, aufgemalten Falten, schwarzem Samtsmoking und Fliege lugt hinter einem Heuballen hervor, schleicht auf Zehenspitzen zur Kamera, legt einen Finger auf die Lippen, tanzt im Stroh und verwandelt es in Goldmünzen.",
      "whatP2": "Die Beschriftung behauptet, die Szene sei von 1987. Im echten Film existiert sie nicht. Rumpelstiltskin (1987) war ein in Israel gedrehtes Cannon-Movie-Tales-Musical mit Billy Barty in seiner einzigen Hauptrolle. Er trug Federhut und braune Tunika und stand in einer Burg vor einem Spinnrad. Keine Scheune, kein Smoking.",
      "whatP3": "Der Clip ist KI-generiert. Laut Know Your Meme stammt er von einem Instagram-Reel vom 27. August 2026 von @stroinaya; die russische Bildunterschrift bewarb einen KI-Kurs und nannte kein Tool. Der Clip blieb weitgehend unbeachtet, bis ihm Ende September jemand Riff Raffs „Tip Toe Wing in My Jawwdinz“ (2014) unterlegte. Ein TikTok-Post vom 29. September löste die Welle aus. Danach verbreitete er sich auf X – ein Repost erreichte 11,4 Millionen Aufrufe – sowie auf TikTok, Reels und Shorts unter #tiptoeinginmyjordans. Innerhalb von drei Tagen erschienen KI-Versionen mit anderen Gesichtern, während viele nach einem Film suchten, den es nie gab.",
      "imageAlt": "Rumpelstiltskin-KI-Clip mit Zehenspitzen-Tanz in einer Scheune im Stil eines Films von 1987",
      "lostTitle": "Warum viele an einen verschollenen Film glauben",
      "lostP1": "Drei Dinge sorgen für die Illusion: Filmkorn, Farbgebung und Titel. Weicher Fokus, warmes gesättigtes Technicolor, leichtes Bildzittern und eine historische Serifenschrift mit „Rumpelstiltskin (1987)“, obwohl das ursprüngliche Video keine Titelkarte, kein Wasserzeichen und keinen Abspann hatte.",
      "lostP2": "Die typischen KI-Hinweise sind sichtbar: Das Gesicht verändert sich zwischen Ruhezeichen und Grinsen, das Gold erscheint auf einen Schlag und ein Spinnrad ist nie zu sehen.",
      "three": "Drei Schritte",
      "howTitle": "Dein eigenes Rumpelstiltskin-KI-Video erstellen",
      "handTitle": "Selbst bauen: fünf Dinge festlegen",
      "handIntro": "Wenn du den Look mit einem Bild-zu-Video-Modell selbst erstellen möchtest, arbeite mit festen Figur- und Kulissenreferenzen und kurzen Bewegungsabschnitten:",
      "handLinkBefore": "Du möchtest den Genjutsu-Generator mit deinem eigenen Referenzvideo nutzen? Hier ist die Schritt-für-Schritt-Anleitung:",
      "handLink": "Rumpelstiltskin-KI-Video mit Genjutsu AI erstellen",
      "rulesTitle": "Was bei diesem Trend erlaubt ist und was nicht",
      "rulesBefore": "Die vollständigen Regeln stehen in unserer",
      "rulesLink": "Richtlinie zur zulässigen Nutzung",
      "faqTitle": "Rumpelstiltskin KI – FAQ",
      "howToName": "Rumpelstiltskin-KI-Video erstellen",
      "articleAbout": "KI-Rumpelstiltskin-Video-Trend (1987) mit Zehenspitzen-Tanz"
    }
  }
};
export function getRumpelSeoCopy(locale: string): RumpelSeoCopy | null {
  return copies[locale] ?? null;
}
