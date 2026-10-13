const fs = require('fs');

const generated = JSON.parse(fs.readFileSync('scripts/generated_cards.json', 'utf8'));

const op18Cards = [
  // 1. Franky Leader OP18-021 (Régulier)
  {
    id: 'op18-021',
    code: 'OP18-021',
    name: 'Franky (Leader)',
    jpName: 'フランキー',
    set: 'OP18',
    setName: 'The Dominance of God [OP-18]',
    category: 'Leader',
    color: ['Green', 'Purple'],
    rarity: 'L',
    isAlternateArt: false,
    cost: null,
    power: 5000,
    life: 4,
    counter: 0,
    type: ['Water Seven', 'The Franky Family', 'Straw Hat Crew'],
    attribute: 'Special',
    effect: 'All Stage cards in your hand have a +1000 Counter.\n[Activate: Main] [Once Per Turn] DON!! -1: Play up to 1 Stage card with a cost of 5 or less from your hand.',
    effectFr: 'Toutes les cartes Terrain dans votre main possèdent un Contre de +1000.\n[Activation : Principale] [Une fois par tour] DON!! -1 : Jouez jusqu\'à 1 carte Terrain de coût 5 ou moins depuis votre main.',
    trigger: '',
    revealDate: '2026-08-23',
    source: 'CardKaizoku & OnePieceTopDecks',
    sourceEvent: 'CardKaizoku Spoilers',
    leakStatus: 'CardKaizoku',
    imageUrl: '/reveals/op18-021.png',
    altImageUrl: '/reveals/op18-021-franky-aa.jpg',
    metaAnalysis: 'Premier Leader Stage du jeu ! Il transforme tous les Terrains en cartes de Contre défensif dans la main et permet de déployer un Terrain jusqu\'à coût 5 à chaque tour pour seulement 1 DON!!.',
    isConfirmed: true
  },

  // 2. Franky Leader OP18-021 (ALTERNATE ART / PARALLEL)
  {
    id: 'op18-021-aa',
    code: 'OP18-021',
    name: 'Franky (Alternate Art Parallel)',
    jpName: 'フランキー (パラレル)',
    set: 'OP18',
    setName: 'The Dominance of God [OP-18]',
    category: 'Leader',
    color: ['Green', 'Purple'],
    rarity: 'L',
    isAlternateArt: true,
    cost: null,
    power: 5000,
    life: 4,
    counter: 0,
    type: ['Water Seven', 'The Franky Family', 'Straw Hat Crew'],
    attribute: 'Special',
    effect: 'All Stage cards in your hand have a +1000 Counter.\n[Activate: Main] [Once Per Turn] DON!! -1: Play up to 1 Stage card with a cost of 5 or less from your hand.',
    effectFr: 'Toutes les cartes Terrain dans votre main possèdent un Contre de +1000.\n[Activation : Principale] [Une fois par tour] DON!! -1 : Jouez jusqu\'à 1 carte Terrain de coût 5 ou moins depuis votre main.',
    trigger: '',
    revealDate: '2026-08-23',
    source: 'CardKaizoku & OnePieceTopDecks',
    sourceEvent: 'CardKaizoku Spoilers',
    leakStatus: 'CardKaizoku',
    imageUrl: '/reveals/op18-021-franky-aa.jpg',
    altImageUrl: '/reveals/op18-021.png',
    metaAnalysis: 'Version Alternate Art (AA) officielle du Leader Franky Vert/Violet avec pose de combat dynamique et dorures brillantes.',
    isConfirmed: true
  },

  // 3. Saint Shamrock OP18-119 (SECRET RARE SEC)
  {
    id: 'op18-119',
    code: 'OP18-119',
    name: 'Saint Shamrock (Secret Rare)',
    jpName: 'シャムロック聖 (SEC)',
    set: 'OP18',
    setName: 'The Dominance of God [OP-18]',
    category: 'Character',
    color: ['Black'],
    rarity: 'SEC',
    isAlternateArt: false,
    cost: 8,
    power: 9000,
    counter: 0,
    type: ['Celestial Dragons', 'Holy Knights of God'],
    attribute: 'Slash',
    effect: '[On K.O.] You may trash 1 card from your hand: Play this Character card from your trash.\n[Activate: Main] [Once Per Turn] If this Character was played on this turn, play up to 1 {Holy Knights of God} type Character card with a cost of 6 or less from your trash.',
    effectFr: '[Au K.O.] Vous pouvez défausser 1 carte de votre main : Jouez cette carte Personnage depuis votre défausse.\n[Activation : Principale] [Une fois par tour] Si ce Personnage a été joué pendant ce tour, jouez jusqu\'à 1 carte Personnage de type {Chevaliers Divins} de coût 6 ou moins depuis votre défausse.',
    trigger: '',
    revealDate: '2026-08-23',
    source: 'CardKaizoku & OnePieceTopDecks',
    sourceEvent: 'CardKaizoku Spoilers',
    leakStatus: 'CardKaizoku',
    imageUrl: '/reveals/op18-119.png',
    altImageUrl: '/reveals/op18-065-shamrock-aa.jpg',
    metaAnalysis: 'La carte Secret Rare majeure d\'OP-18 à 9000 de puissance ! Résurrection infinie sur K.O. et réanimation immédiate d\'un allié jusqu\'à coût 6 depuis la défausse.',
    isConfirmed: true
  },

  // 4. Saint Shamrock OP18-119 (ALTERNATE ART / PARALLEL)
  {
    id: 'op18-119-aa',
    code: 'OP18-119',
    name: 'Saint Shamrock (Secret Rare Alternate Art)',
    jpName: 'シャムロック聖 (パラレル SEC)',
    set: 'OP18',
    setName: 'The Dominance of God [OP-18]',
    category: 'Character',
    color: ['Black'],
    rarity: 'SEC',
    isAlternateArt: true,
    cost: 8,
    power: 9000,
    counter: 0,
    type: ['Celestial Dragons', 'Holy Knights of God'],
    attribute: 'Slash',
    effect: '[On K.O.] You may trash 1 card from your hand: Play this Character card from your trash.\n[Activate: Main] [Once Per Turn] If this Character was played on this turn, play up to 1 {Holy Knights of God} type Character card with a cost of 6 or less from your trash.',
    effectFr: '[Au K.O.] Vous pouvez défausser 1 carte de votre main : Jouez cette carte Personnage depuis votre défausse.\n[Activation : Principale] [Une fois par tour] Si ce Personnage a été joué pendant ce tour, jouez jusqu\'à 1 carte Personnage de type {Chevaliers Divins} de coût 6 ou moins depuis votre défausse.',
    trigger: '',
    revealDate: '2026-08-23',
    source: 'CardKaizoku & OnePieceTopDecks',
    sourceEvent: 'CardKaizoku Spoilers',
    leakStatus: 'CardKaizoku',
    imageUrl: '/reveals/op18-065-shamrock-aa.jpg',
    altImageUrl: '/reveals/op18-119.png',
    metaAnalysis: 'Version Alternate Art SEC collector de Saint Shamrock avec dorures exclusives et effet holographique.',
    isConfirmed: true
  },

  // 5. Saint Gunko Leader OP18-060 (Régulier)
  {
    id: 'op18-060',
    code: 'OP18-060',
    name: 'Saint Gunko (Leader)',
    jpName: '軍子聖 (神の騎士団)',
    set: 'OP18',
    setName: 'The Dominance of God [OP-18]',
    category: 'Leader',
    color: ['Black', 'Purple'],
    rarity: 'L',
    isAlternateArt: false,
    cost: null,
    power: 5000,
    life: 4,
    counter: 0,
    type: ['Celestial Dragons', 'Holy Knights of God'],
    attribute: 'Special',
    effect: '[Once Per Turn] When a Character is played from your trash, draw 2 cards and trash 1 card from your hand.\n[Activate: Main] [Once Per Turn] You may trash 1 card from your hand: If you have a Character with 8000 base power or more, add up to 1 DON!! card as active from your DON!! deck.',
    effectFr: '[Une fois par tour] Lorsqu\'un Personnage est joué depuis votre défausse, piochez 2 cartes et défaussez 1 carte de votre main.\n[Activation : Principale] [Une fois par tour] Vous pouvez défausser 1 carte de votre main : Si vous possédez un Personnage ayant 8000 de puissance de base ou plus, ajoutez jusqu\'à 1 carte DON!! active depuis votre deck DON!!.',
    trigger: '',
    revealDate: '2026-08-23',
    source: 'CardKaizoku & OnePieceTopDecks',
    sourceEvent: 'CardKaizoku Spoilers',
    leakStatus: 'CardKaizoku',
    imageUrl: '/reveals/op18-060.png',
    altImageUrl: '/reveals/op18-060-loki-aa.jpg',
    metaAnalysis: 'Leader officiel des Chevaliers Divins (Holy Knights of God) ! Moteur de pioche massif lors des résurrections et accélération de DON!! actifs.',
    isConfirmed: true
  },

  // 6. Saint Gunko Leader OP18-060 (ALTERNATE ART / PARALLEL)
  {
    id: 'op18-060-aa',
    code: 'OP18-060',
    name: 'Saint Gunko (Leader Alternate Art)',
    jpName: '軍子聖 (パラレル)',
    set: 'OP18',
    setName: 'The Dominance of God [OP-18]',
    category: 'Leader',
    color: ['Black', 'Purple'],
    rarity: 'L',
    isAlternateArt: true,
    cost: null,
    power: 5000,
    life: 4,
    counter: 0,
    type: ['Celestial Dragons', 'Holy Knights of God'],
    attribute: 'Special',
    effect: '[Once Per Turn] When a Character is played from your trash, draw 2 cards and trash 1 card from your hand.\n[Activate: Main] [Once Per Turn] You may trash 1 card from your hand: If you have a Character with 8000 base power or more, add up to 1 DON!! card as active from your DON!! deck.',
    effectFr: '[Une fois par tour] Lorsqu\'un Personnage est joué depuis votre défausse, piochez 2 cartes et défaussez 1 carte de votre main.\n[Activation : Principale] [Une fois par tour] Vous pouvez défausser 1 carte de votre main : Si vous possédez un Personnage ayant 8000 de puissance de base ou plus, ajoutez jusqu\'à 1 carte DON!! active depuis votre deck DON!!.',
    trigger: '',
    revealDate: '2026-08-23',
    source: 'CardKaizoku & OnePieceTopDecks',
    sourceEvent: 'CardKaizoku Spoilers',
    leakStatus: 'CardKaizoku',
    imageUrl: '/reveals/op18-060-loki-aa.jpg',
    altImageUrl: '/reveals/op18-060.png',
    metaAnalysis: 'Version Alternate Art (AA) officielle du Leader Saint Gunko avec illustration plein cadre sans bordure des Chevaliers Divins.',
    isConfirmed: true
  },

  // 7. Saint Gunko Character OP18-065 (SR)
  {
    id: 'op18-065',
    code: 'OP18-065',
    name: 'Saint Gunko (Character SR)',
    jpName: '軍子聖 (SR)',
    set: 'OP18',
    setName: 'The Dominance of God [OP-18]',
    category: 'Character',
    color: ['Purple'],
    rarity: 'SR',
    isAlternateArt: false,
    cost: 10,
    power: 11000,
    counter: 0,
    type: ['Celestial Dragons', 'Holy Knights of God'],
    attribute: 'Special',
    effect: '[Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)\n[On Play] DON!! -1: Play up to 1 {Celestial Dragons} type Character card with 6000 power or less from your trash.',
    effectFr: '[Bloqueur] (Après la déclaration d\'attaque adverse, vous pouvez épuiser cette carte pour en faire la nouvelle cible de l\'attaque.)\n[Jouée] DON!! -1 : Jouez jusqu\'à 1 carte Personnage de type {Dragons Célestes} avec 6000 de puissance ou moins depuis votre défausse.',
    trigger: '',
    revealDate: '2026-08-23',
    source: 'CardKaizoku & OnePieceTopDecks',
    sourceEvent: 'CardKaizoku Spoilers',
    leakStatus: 'CardKaizoku',
    imageUrl: '/reveals/op18-065.png',
    metaAnalysis: 'Bloqueur titanesque à 11000 de puissance qui réanime un Dragon Céleste de 6000 puissance dès son arrivée en jeu.',
    isConfirmed: true
  },

  // 8. Nico Robin Manga Parallel Rare OP18-031
  {
    id: 'op18-031',
    code: 'OP18-031',
    name: 'Nico Robin (Character SR / Manga Parallel)',
    jpName: 'ニコ・ロビン (Manga Rare)',
    set: 'OP18',
    setName: 'The Dominance of God [OP-18]',
    category: 'Character',
    color: ['Green'],
    rarity: 'MANGA',
    isAlternateArt: true,
    cost: 4,
    power: 5000,
    counter: 1000,
    type: ['Water Seven', 'Straw Hat Crew'],
    attribute: 'Wisdom',
    effect: '[Opponent\'s Turn] If your Character would be removed from the field by your opponent\'s effect, you may rest this Character instead.\n[End of Your Turn] Set up to 1 of your {Water Seven} type cards and up to 1 of your DON!! cards as active.',
    effectFr: '[Tour adverse] Si un de vos Personnages devait quitter le terrain à cause d\'un effet adverse, vous pouvez épuiser ce Personnage à la place.\n[Fin de votre tour] Redressez jusqu\'à 1 de vos cartes de type {Water Seven} et jusqu\'à 1 de vos cartes DON!!.',
    trigger: '',
    revealDate: '2026-08-23',
    source: 'CardKaizoku & OnePieceTopDecks',
    sourceEvent: 'CardKaizoku Spoilers',
    leakStatus: 'CardKaizoku',
    imageUrl: '/reveals/op18-031.png',
    altImageUrl: '/reveals/op18-031-robin-manga.jpg',
    metaAnalysis: 'La carte Manga Rare officielle d\'OP-18 ! Protection absolue contre les effets de retrait adverse et redressement de DON!! en fin de tour.',
    isConfirmed: true
  },

  // 9. Mini-Merry II OP18-078
  {
    id: 'op18-078',
    code: 'OP18-078',
    name: 'Mini-Merry II (Stage UC)',
    jpName: 'ミニメリー2号',
    set: 'OP18',
    setName: 'The Dominance of God [OP-18]',
    category: 'Stage',
    color: ['Purple'],
    rarity: 'UC',
    isAlternateArt: false,
    cost: 5,
    power: null,
    counter: 0,
    type: ['Straw Hat Crew'],
    attribute: '-',
    effect: '[On Play] Draw 1 card, then add up to 1 DON!! card as rested from your DON!! deck.\n[Activate: Main] You may rest this Stage: Give up to a total of 4 of your Leader or Characters 1 rested DON!! card each.',
    effectFr: '[Jouée] Piochez 1 carte, puis ajoutez jusqu\'à 1 carte DON!! épuisée depuis votre deck DON!!.\n[Activation : Principale] Vous pouvez épuiser ce Terrain : Donnez à un total de jusqu\'à 4 de vos cartes (Leader ou Personnages) 1 carte DON!! épuisée chacune.',
    trigger: '',
    revealDate: '2026-08-23',
    source: 'CardKaizoku & OnePieceTopDecks',
    sourceEvent: 'CardKaizoku Spoilers',
    leakStatus: 'CardKaizoku',
    imageUrl: '/reveals/op18-078.png',
    metaAnalysis: 'Moteur d\'accélération DON!! pour Franky et Straw Hat : pioche à l\'entrée et redistribue 4 DON!! épuisés à chaque tour.',
    isConfirmed: true
  }
];

// Special SP Heroines Cards
const eb05SpecialCards = [
  {
    id: 'eb05-010-aa',
    code: 'EB05-010',
    name: 'Nico Robin (Leader Alternate Art)',
    jpName: 'ニコ・ロビン (パラレル)',
    set: 'EB05',
    setName: 'Heroines Edition Vol.2 [EB-05]',
    category: 'Leader',
    color: ['Green', 'Yellow'],
    rarity: 'L',
    isAlternateArt: true,
    cost: null,
    power: 5000,
    life: 4,
    counter: 0,
    type: ['Straw Hat Crew'],
    attribute: 'Wisdom',
    effect: '[Once Per Turn] When one of your Characters with the [Wisdom] attribute and without [Blocker] is K.O.\'d, add up to 1 card from the top of your deck to the top of your Life cards.\n[Activate: Main] [Once Per Turn] Set up to 1 of your Characters with the [Wisdom] attribute and 6000 power or less as active.',
    effectFr: '[Une fois par tour] Lorsqu\'un de vos Personnages ayant l\'attribut <Sagesse> et sans [Bloqueur] est mis K.O., ajoutez jusqu\'à 1 carte du dessus de votre deck au-dessus de vos cartes de Vie.\n[Activation : Principale] [Une fois par tour] Redressez jusqu\'à 1 de vos Personnages ayant l\'attribut <Sagesse> et 6000 de puissance ou moins.',
    trigger: '',
    revealDate: '2026-08-23',
    source: 'CardKaizoku & OnePieceTopDecks',
    sourceEvent: 'CardKaizoku Spoilers',
    leakStatus: 'CardKaizoku',
    imageUrl: '/reveals/eb05-010-robin-aa.jpg',
    altImageUrl: '/reveals/eb05-010.png',
    metaAnalysis: 'Version Alternate Art (AA) collector du Leader Nico Robin avec un gros plan magnifique et effets dorés Heroines.',
    isConfirmed: true
  },
  {
    id: 'eb05-001',
    code: 'EB05-001',
    name: 'Nami (Special SP)',
    jpName: 'ナミ (SP)',
    set: 'EB05',
    setName: 'Heroines Edition Vol.2 [EB-05]',
    category: 'Character',
    color: ['Red'],
    rarity: 'SP',
    isAlternateArt: true,
    cost: 1,
    power: 2000,
    counter: 2000,
    type: ['Straw Hat Crew'],
    attribute: 'Special',
    effect: '[On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Straw Hat Crew} type card other than [Nami] and add it to your hand. Then place the rest at the bottom of your deck in any order.',
    effectFr: '[Jouée] Regardez les 5 cartes du dessus de votre deck ; révélez jusqu\'à 1 carte de type {Équipage de Chapeau de paille} autre que [Nami] et ajoutez-la à votre main. Placez ensuite le reste sous votre deck dans l\'ordre de votre choix.',
    trigger: '',
    revealDate: '2026-08-23',
    source: 'CardKaizoku & OnePieceTopDecks',
    sourceEvent: 'CardKaizoku Spoilers',
    leakStatus: 'CardKaizoku',
    imageUrl: '/reveals/eb05-nami-sp.jpg',
    metaAnalysis: 'Version Special Card SP officielle de la carte de recherche Nami indispensable avec Counter +2000.',
    isConfirmed: true
  },
  {
    id: 'eb05-hancock',
    code: 'EB05-SP04',
    name: 'Boa Hancock (Leader SP)',
    jpName: 'ボア・ハンコック (Leader SP)',
    set: 'EB05',
    setName: 'Heroines Edition Vol.2 [EB-05]',
    category: 'Leader',
    color: ['Blue'],
    rarity: 'SP',
    isAlternateArt: true,
    cost: null,
    power: 5000,
    life: 5,
    counter: 0,
    type: ['Kuja Pirates', 'Seven Warlords of the Sea'],
    attribute: 'Special',
    effect: 'When you play a Character, draw 1 card.\n[When Attacking] When one of your {Amazon Lily} or {Kuja Pirates} type Characters with 5000 base power or more attacks: Return up to 1 of your opponent\'s Characters with a cost of 3 or less to the owner\'s hand.',
    effectFr: 'Lorsque vous jouez un Personnage, piochez 1 carte.\n[Lors d\'une attaque] Lorsqu\'un de vos Personnages de type {Amazon Lily} ou {Pirates Kuja} ayant 5000 de puissance de base ou plus attaque : Renvoyez jusqu\'à 1 Personnage adverse de coût 3 ou moins dans la main de son propriétaire.',
    trigger: '',
    revealDate: '2026-08-23',
    source: 'CardKaizoku & OnePieceTopDecks',
    sourceEvent: 'CardKaizoku Spoilers',
    leakStatus: 'CardKaizoku',
    imageUrl: '/reveals/eb05-card-8.jpg',
    metaAnalysis: 'Édition Heroines SP somptueuse du Leader Boa Hancock Bleu avec pioche continue et contrôle de terrain.',
    isConfirmed: true
  },
  {
    id: 'eb05-shirahoshi',
    code: 'EB05-SP03',
    name: 'Shirahoshi (Leader SP)',
    jpName: 'しらほし (Leader SP)',
    set: 'EB05',
    setName: 'Heroines Edition Vol.2 [EB-05]',
    category: 'Leader',
    color: ['Green', 'Yellow'],
    rarity: 'SP',
    isAlternateArt: true,
    cost: null,
    power: 5000,
    life: 5,
    counter: 0,
    type: ['Merfolk', 'Fish-Man Island'],
    attribute: 'Special',
    effect: 'This Leader cannot attack.\n[Activate: Main] [Once Per Turn] You may rest 1 of your DON!! cards and turn 1 card from the top of your Life cards face-up: Play up to 1 {Neptunian} type Character card with a cost equal to or less than the number of DON!! cards on your field from your hand.',
    effectFr: 'Ce Leader ne peut pas attaquer.\n[Activation : Principale] [Une fois par tour] Vous pouvez épuiser 1 de vos cartes DON!! et retourner face visible 1 carte du dessus de vos cartes de Vie : Jouez depuis votre main jusqu\'à 1 carte Personnage de type {Monstre marin} d\'un coût inférieur ou égal au nombre de cartes DON!! sur votre terrain.',
    trigger: '',
    revealDate: '2026-08-23',
    source: 'CardKaizoku & OnePieceTopDecks',
    sourceEvent: 'CardKaizoku Spoilers',
    leakStatus: 'CardKaizoku',
    imageUrl: '/reveals/eb05-card-7.jpg',
    metaAnalysis: 'Version Heroines SP de la princesse Shirahoshi Vert/Jaune permettant d\'invoquer les Rois des Mers depuis la main.',
    isConfirmed: true
  },
  {
    id: 'eb05-bonney',
    code: 'EB05-SP06',
    name: 'Jewelry Bonney (Leader SP)',
    jpName: 'ジュエリー・ボニー (Leader SP)',
    set: 'EB05',
    setName: 'Heroines Edition Vol.2 [EB-05]',
    category: 'Leader',
    color: ['Green'],
    rarity: 'SP',
    isAlternateArt: true,
    cost: null,
    power: 5000,
    life: 5,
    counter: 0,
    type: ['Supernovae', 'Bonney Pirates'],
    attribute: 'Special',
    effect: '[Your Turn] [Once Per Turn] This effect can be activated when you play a Character with a Trigger: Give up to 2 rested DON!! cards to 1 of your Leader or Character cards.',
    effectFr: '[Votre Tour] [Une fois par tour] Cet effet peut être activé lorsque vous jouez un Personnage avec Déclencheur : Donnez jusqu\'à 2 cartes DON!! épuisées à 1 de vos cartes Leader ou Personnage.',
    trigger: '',
    revealDate: '2026-08-23',
    source: 'CardKaizoku & OnePieceTopDecks',
    sourceEvent: 'CardKaizoku Spoilers',
    leakStatus: 'CardKaizoku',
    imageUrl: '/reveals/eb05-card-10.jpg',
    metaAnalysis: 'Leader Bonney Verte en version Heroines SP avec accélération de 2 DON!! dès qu\'une carte à Déclencheur est jouée.',
    isConfirmed: true
  },
  {
    id: 'eb05-nami-leader',
    code: 'EB05-SP02',
    name: 'Nami (Leader SP)',
    jpName: 'ナミ (Leader SP)',
    set: 'EB05',
    setName: 'Heroines Edition Vol.2 [EB-05]',
    category: 'Leader',
    color: ['Blue'],
    rarity: 'SP',
    isAlternateArt: true,
    cost: null,
    power: 5000,
    life: 4,
    counter: 0,
    type: ['Straw Hat Crew'],
    attribute: 'Special',
    effect: '[Activate: Main] [Once Per Turn] Trash 1 card from your hand: This Leader gains +2000 power during this turn.',
    effectFr: '[Activation : Principale] [Une fois par tour] Défaussez 1 carte de votre main : Ce Leader gagne +2000 de puissance pendant ce tour.',
    trigger: '',
    revealDate: '2026-08-23',
    source: 'CardKaizoku & OnePieceTopDecks',
    sourceEvent: 'CardKaizoku Spoilers',
    leakStatus: 'CardKaizoku',
    imageUrl: '/reveals/eb05-card-6.jpg',
    metaAnalysis: 'Version Heroines SP officielle de Nami Leader Bleue avec boost d\'attaque à 7000.',
    isConfirmed: true
  },
  {
    id: 'eb05-vivi',
    code: 'EB05-SP01',
    name: 'Nefeltari Vivi (Leader SP)',
    jpName: 'ネフェルタリ・ビビ (Leader SP)',
    set: 'EB05',
    setName: 'Heroines Edition Vol.2 [EB-05]',
    category: 'Leader',
    color: ['Red', 'Blue'],
    rarity: 'SP',
    isAlternateArt: true,
    cost: null,
    power: 5000,
    life: 4,
    counter: 0,
    type: ['Alabasta'],
    attribute: 'Slash',
    effect: 'If your Character with a base cost of 5 or more would be K.O.\'d, you may trash 1 card from your hand instead.\n[Activate: Main] You may rest this Leader: Give up to 1 of your opponent\'s Characters -2000 power during this turn, and up to 1 of your Characters without a [Blocker] effect gains [Rush].',
    effectFr: 'Si un de vos Personnages de coût de base 5 ou plus devait être mis K.O., vous pouvez défausser 1 carte de votre main à la place.\n[Activation : Principale] Vous pouvez épuiser ce Leader : Donnez jusqu\'à 1 Personnage adverse -2000 de puissance pendant ce tour, et jusqu\'à 1 de vos Personnages sans [Bloqueur] gagne [Assaut].',
    trigger: '',
    revealDate: '2026-08-23',
    source: 'CardKaizoku & OnePieceTopDecks',
    sourceEvent: 'CardKaizoku Spoilers',
    leakStatus: 'CardKaizoku',
    imageUrl: '/reveals/eb05-card-5.jpg',
    metaAnalysis: 'Réédition prestige en version Heroines SP de Vivi Rouge/Bleue avec protection contre les K.O. et octroi d\'Assaut.',
    isConfirmed: true
  },
  {
    id: 'eb05-rebecca',
    code: 'EB05-SP05',
    name: 'Rebecca (Leader SP)',
    jpName: 'レベッカ (Leader SP)',
    set: 'EB05',
    setName: 'Heroines Edition Vol.2 [EB-05]',
    category: 'Leader',
    color: ['Blue', 'Black'],
    rarity: 'SP',
    isAlternateArt: true,
    cost: null,
    power: 5000,
    life: 5,
    counter: 0,
    type: ['Dressrosa'],
    attribute: 'Slash',
    effect: 'This Leader cannot attack.\n[Activate: Main] [Once Per Turn] (1): You may rest this Leader and return 1 of your {Dressrosa} type Characters to the owner\'s hand: Play up to 1 {Dressrosa} type Character card with a cost of 3 or less from your hand.',
    effectFr: 'Ce Leader ne peut pas attaquer.\n[Activation : Principale] [Une fois par tour] (1) : Vous pouvez épuiser ce Leader et renvoyer 1 de vos Personnages de type {Dressrosa} dans la main de son propriétaire : Jouez jusqu\'à 1 carte Personnage de type {Dressrosa} de coût 3 ou moins depuis votre main.',
    trigger: '',
    revealDate: '2026-08-23',
    source: 'CardKaizoku & OnePieceTopDecks',
    sourceEvent: 'CardKaizoku Spoilers',
    leakStatus: 'CardKaizoku',
    imageUrl: '/reveals/eb05-card-9.jpg',
    metaAnalysis: 'Édition collector Heroines SP de la reine du contrôle Dressrosa avec 5 cartes de vie.',
    isConfirmed: true
  }
];

const allRevealedCards = [
  ...op18Cards,
  ...eb05SpecialCards,
  ...generated.eb05Cards,
  ...generated.prb02Cards
];

const upcomingSets = [
  {
    code: 'OP18',
    name: 'The Dominance of God',
    frenchName: 'La Domination Divine [OP-18]',
    type: 'Main Booster Pack',
    japanReleaseDate: 'Novembre 2026',
    globalReleaseDate: 'Février 2027',
    description: 'Nouveau booster pack majeur centré sur les Chevaliers Divins (Holy Knights of God), l\'arc Elbaf et Water Seven. Révélé avec Franky Leader (Vert/Violet), Loki (Secret Rare), Nico Robin Manga Rare, Saint Gunko et Saint Shamrock.',
    highlightLeaders: ['Franky Leader (Normal & Alt Art)', 'Loki SEC (Secret Rare)', 'Saint Gunko (Normal & Alt Art)', 'Saint Shamrock (Normal & Alt Art)', 'Nico Robin Manga Rare', 'Mini-Merry II'],
    cardCount: 126,
    bannerUrl: '/reveals/op18-pack.jpg'
  },
  {
    code: 'EB05',
    name: 'Extra Booster - ONE PIECE HEROINES EDITION vol.2',
    frenchName: 'Heroines Edition Vol. 2 [EB-05]',
    type: 'Extra Booster Pack',
    japanReleaseDate: '30 Octobre 2026',
    globalReleaseDate: '22 Janvier 2027',
    description: 'Second volume officiel de la collection Heroines avec plus de 28 cartes révélées : Nico Robin Leader (Normal & Alt Art), Nico Robin Caractère, Nami SP, Doll, Belo Betty, Monet, Ripley, et les Leaders SP de Boa Hancock, Shirahoshi, Nami, Vivi, Rebecca et Jewelry Bonney.',
    highlightLeaders: ['Leader Nico Robin (Normal & Alt)', 'Boa Hancock Leader SP', 'Shirahoshi Leader SP', 'Jewelry Bonney Leader SP', 'Nami Leader SP', 'Vivi Leader SP', 'Rebecca Leader SP', 'Doll R', 'Ripley R'],
    cardCount: 65,
    bannerUrl: '/reveals/eb05-banner.jpg'
  },
  {
    code: 'PRB02',
    name: 'Premium Booster - ONE PIECE CARD THE BEST Vol.2',
    frenchName: 'The Best Vol. 2 [PRB-02]',
    type: 'Premium Booster Pack',
    japanReleaseDate: 'Décembre 2026',
    globalReleaseDate: 'Mars 2027',
    description: 'Deuxième édition du format The Best regroupant les réimpressions premium les plus recherchées et de nouveaux soutiens pour toutes les couleurs (Law, Sabo, Marco, Pudding, Doflamingo, Boa Hancock, Ace, Luffy, Otama, Shiryu, Koby).',
    highlightLeaders: ['Trafalgar Law SR', 'Sabo SR Blocker', 'Boa Hancock SR', 'Charlotte Pudding SR', 'Marco SR', 'Monkey.D.Luffy SR'],
    cardCount: 130,
    bannerUrl: '/reveals/prb02-001.png'
  }
];

const newsArticles = [
  {
    id: 'news-kaizoku-spoilers',
    title: 'Spoilers Majeurs CardKaizoku : 45 Nouvelles Cartes (EB05, OP18, PRB02)',
    category: 'Card Reveal',
    date: '2026-09-12',
    summary: 'Mise à jour majeure de la base Spoilers & Reveals avec l\'ajout complet des fuites de CardKaizoku : 21 cartes EB-05 Heroines, 6 cartes OP-18 The Dominance of God et 18 cartes PRB-02 The Best Vol. 2.',
    content: `La base de données des Révélations s'enrichit avec les derniers spoilers officiels issus de CardKaizoku :

- **EB-05 Heroines Edition Vol. 2** (21 cartes) : Doll (R), Belo Betty (C), Monet (C), Nico Robin (Leader & SR), Otohime (C), Shirley (C), Mermaid Cafe Dancers (C), Octopako (C), Osome (C), Domino (C), Speed (C), Tsuru (C), Russian (C), Shinobu (C), Ms. Monday (C), Ripley (R), Ahiru (C), Charlotte Brulee (C), Nico Olivia (C), Nojiko (R).
- **OP-18 The Dominance of God** (6 cartes) : Franky Leader (Vert/Violet), Saint Gunko Leader & SR (Chevaliers Divins), Saint Shamrock SEC, Nico Robin SR/Manga Rare, Mini-Merry II Terrain.
- **PRB-02 The Best Vol. 2** (18 cartes) : Koby, Trafalgar Law, Lucky Roux, Jewelry Bonney, Monkey D. Luffy, Roronoa Zoro, Jinbe, Marco, Mr. 3, Charlotte Pudding, Donquixote Doflamingo, Nami, Gecko Moria, Sabo, Shiryu, Otama, Boa Hancock, Portgas D. Ace.

Toutes les cartes disposent des scans HD, des effets traduits en français et des analyses de méta détaillées.`,
    tags: ['CardKaizoku', 'EB05', 'OP18', 'PRB02', 'Heroines', 'The Best Vol. 2', 'Dominance of God'],
    productCode: 'EB05 / OP18 / PRB02',
    sourceUrl: 'https://www.cardkaizoku.com/spoilers',
    imageUrl: '/reveals/eb05-banner.jpg',
    releaseDates: {
      japan: 'Octobre - Décembre 2026',
      global: 'Janvier - Mars 2027'
    }
  },
  {
    id: 'news-topdecks-op18',
    title: 'Leaks: OPCG BOOSTER PACK -THE DOMINANCE OF GOD- [OP-18]',
    category: 'Set Announcement',
    date: '2026-08-23',
    summary: 'Révélation complète du booster OP-18 avec Franky Leader (Normal & Alt Art), Loki SEC, Nico Robin Manga Rare, Mini-Merry et les cartes de Saint Shamrock et Saint Gunko.',
    content: `OPCG BOOSTER PACK -THE DOMINANCE OF GOD- [OP-18] sortira en Novembre 2026.

Contenu Récapitulatif :
- Leader Vert/Violet : Franky (OP18-021) version Normale et version Alternate Art (AA)
- Secret Rare Violet : Saint Shamrock (OP18-119 SEC) version Normale et version Alternate Art (AA)
- Leader Violet/Noir : Saint Gunko (OP18-060) version Normale et version Alternate Art (AA)
- Personnage Violet SR : Saint Gunko (OP18-065)
- Nico Robin (OP18-031) : Manga Comic Parallel officielle pour le set OP18
- OP18-078 Mini-Merry II : Terrain d'attachement de DON!!`,
    tags: ['OP18', 'Dominance of God', 'Franky Alt Art', 'Saint Gunko Alt Art', 'Nico Robin Manga', 'Saint Shamrock Alt Art'],
    productCode: 'OP18',
    sourceUrl: 'https://onepiecetopdecks.com/leaks-opcg-booster-pack-the-dominance-of-god-op-18/',
    imageUrl: '/reveals/op18-pack.jpg',
    releaseDates: {
      japan: 'Novembre 2026',
      global: 'Février 2027'
    }
  },
  {
    id: 'news-topdecks-eb05',
    title: 'Leaks: ONE PIECE Heroines Edition vol.2 EB05',
    category: 'Product Launch',
    date: '2026-08-23',
    summary: 'Sortie officielle de l\'Extra Booster EB-05 annoncée avec plus de 25 cartes révélées : Leader Nico Robin (Normal & Alt Art), Nico Robin Caractère, Nami SP et les Leaders SP de Boa Hancock, Shirahoshi, Nami, Vivi, Rebecca et Bonney.',
    content: `OPCG EXTRA BOOSTER PACK -ONE PIECE Heroines Edition vol.2- [EB-05] sortira en Octobre 2026.

Contenu Confirmé :
- Leader : Nico Robin (EB05-010) Violet/Noir & Vert/Jaune version Normale et version Alternate Art (AA)
- Personnage : Nico Robin (EB05-016)
- Personnage : Nami (EB05-001) Spéciale SP
- Leaders Special Parallel (SP) : Boa Hancock, Shirahoshi, Jewelry Bonney, Nami, Nefeltari Vivi, Rebecca
- Nombreux soutiens pour l'attribut <Wisdom> (Sagesse), la Marine, les Hommes-Poissons et Baroque Works.`,
    tags: ['EB05', 'Heroines Edition vol.2', 'Nico Robin Leader', 'Boa Hancock SP', 'Shirahoshi SP', 'Bonney SP', 'Nami SP', 'Vivi SP', 'Rebecca SP'],
    productCode: 'EB05',
    sourceUrl: 'https://onepiecetopdecks.com/leaks-one-piece-heroines-edition-vol-2-eb05/',
    imageUrl: '/reveals/eb05-banner.jpg',
    releaseDates: {
      japan: '30 Octobre 2026',
      global: '22 Janvier 2027'
    }
  }
];

const fileContent = `export interface RevealedCard {
  id: string;
  code: string;
  name: string;
  jpName?: string;
  set: string;
  setName: string;
  category: 'Leader' | 'Character' | 'Event' | 'Stage';
  color: string[];
  rarity: 'L' | 'SEC' | 'SP' | 'SR' | 'R' | 'UC' | 'C' | 'MANGA';
  isAlternateArt?: boolean;
  cost: number | null;
  power: number | null;
  counter: number;
  life?: number;
  type: string[];
  attribute?: string;
  effect: string;
  effectFr: string;
  trigger?: string;
  revealDate: string;
  source: string;
  sourceEvent: string;
  artist?: string;
  leakStatus: 'OnePieceTopDecks' | 'CardKaizoku';
  imageUrl: string;
  altImageUrl?: string;
  metaAnalysis?: string;
  isConfirmed: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  category: 'Set Announcement' | 'Card Reveal' | 'Product Launch';
  date: string;
  summary: string;
  content: string;
  tags: string[];
  productCode?: string;
  sourceUrl?: string;
  imageUrl?: string;
  releaseDates: {
    japan: string;
    global: string;
  };
}

export const UPCOMING_SETS = ${JSON.stringify(upcomingSets, null, 2)};

export const REVEALED_CARDS: RevealedCard[] = ${JSON.stringify(allRevealedCards, null, 2)};

export const NEWS_ARTICLES: NewsArticle[] = ${JSON.stringify(newsArticles, null, 2)};
`;

fs.writeFileSync('src/data/newsRevealsData.ts', fileContent);
console.log('Successfully wrote src/data/newsRevealsData.ts with ' + allRevealedCards.length + ' revealed cards!');
