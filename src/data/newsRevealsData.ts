export interface RevealedCard {
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

export const UPCOMING_SETS = [
  {
    "code": "OP18",
    "name": "The Dominance of God",
    "frenchName": "La Domination Divine [OP-18]",
    "type": "Main Booster Pack",
    "japanReleaseDate": "Novembre 2026",
    "globalReleaseDate": "Février 2027",
    "description": "Nouveau booster pack majeur centré sur les Chevaliers Divins (Holy Knights of God), l'arc Elbaf et Water Seven. Révélé avec Franky Leader (Vert/Violet), Loki (Secret Rare), Nico Robin Manga Rare, Saint Gunko et Saint Shamrock.",
    "highlightLeaders": [
      "Franky Leader (Normal & Alt Art)",
      "Loki SEC (Secret Rare)",
      "Saint Gunko (Normal & Alt Art)",
      "Saint Shamrock (Normal & Alt Art)",
      "Nico Robin Manga Rare",
      "Mini-Merry II"
    ],
    "cardCount": 126,
    "bannerUrl": "/reveals/op18-pack.jpg"
  },
  {
    "code": "EB05",
    "name": "Extra Booster - ONE PIECE HEROINES EDITION vol.2",
    "frenchName": "Heroines Edition Vol. 2 [EB-05]",
    "type": "Extra Booster Pack",
    "japanReleaseDate": "30 Octobre 2026",
    "globalReleaseDate": "22 Janvier 2027",
    "description": "Second volume officiel de la collection Heroines avec plus de 28 cartes révélées : Nico Robin Leader (Normal & Alt Art), Nico Robin Caractère, Nami SP, Doll, Belo Betty, Monet, Ripley, et les Leaders SP de Boa Hancock, Shirahoshi, Nami, Vivi, Rebecca et Jewelry Bonney.",
    "highlightLeaders": [
      "Leader Nico Robin (Normal & Alt)",
      "Boa Hancock Leader SP",
      "Shirahoshi Leader SP",
      "Jewelry Bonney Leader SP",
      "Nami Leader SP",
      "Vivi Leader SP",
      "Rebecca Leader SP",
      "Doll R",
      "Ripley R"
    ],
    "cardCount": 65,
    "bannerUrl": "/reveals/eb05-banner.jpg"
  },
  {
    "code": "PRB02",
    "name": "Premium Booster - ONE PIECE CARD THE BEST Vol.2",
    "frenchName": "The Best Vol. 2 [PRB-02]",
    "type": "Premium Booster Pack",
    "japanReleaseDate": "Décembre 2026",
    "globalReleaseDate": "Mars 2027",
    "description": "Deuxième édition du format The Best regroupant les réimpressions premium les plus recherchées et de nouveaux soutiens pour toutes les couleurs (Law, Sabo, Marco, Pudding, Doflamingo, Boa Hancock, Ace, Luffy, Otama, Shiryu, Koby).",
    "highlightLeaders": [
      "Trafalgar Law SR",
      "Sabo SR Blocker",
      "Boa Hancock SR",
      "Charlotte Pudding SR",
      "Marco SR",
      "Monkey.D.Luffy SR"
    ],
    "cardCount": 130,
    "bannerUrl": "/reveals/prb02-001.png"
  }
];

export const REVEALED_CARDS: RevealedCard[] = [
  {
    "id": "op18-021",
    "code": "OP18-021",
    "name": "Franky (Leader)",
    "jpName": "フランキー",
    "set": "OP18",
    "setName": "The Dominance of God [OP-18]",
    "category": "Leader",
    "color": [
      "Green",
      "Purple"
    ],
    "rarity": "L",
    "isAlternateArt": false,
    "cost": null,
    "power": 5000,
    "life": 4,
    "counter": 0,
    "type": [
      "Water Seven",
      "The Franky Family",
      "Straw Hat Crew"
    ],
    "attribute": "Special",
    "effect": "All Stage cards in your hand have a +1000 Counter.\n[Activate: Main] [Once Per Turn] DON!! -1: Play up to 1 Stage card with a cost of 5 or less from your hand.",
    "effectFr": "Toutes les cartes Terrain dans votre main possèdent un Contre de +1000.\n[Activation : Principale] [Une fois par tour] DON!! -1 : Jouez jusqu'à 1 carte Terrain de coût 5 ou moins depuis votre main.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku & OnePieceTopDecks",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/op18-021.png",
    "altImageUrl": "/reveals/op18-021-franky-aa.jpg",
    "metaAnalysis": "Premier Leader Stage du jeu ! Il transforme tous les Terrains en cartes de Contre défensif dans la main et permet de déployer un Terrain jusqu'à coût 5 à chaque tour pour seulement 1 DON!!.",
    "isConfirmed": true
  },
  {
    "id": "op18-021-aa",
    "code": "OP18-021",
    "name": "Franky (Alternate Art Parallel)",
    "jpName": "フランキー (パラレル)",
    "set": "OP18",
    "setName": "The Dominance of God [OP-18]",
    "category": "Leader",
    "color": [
      "Green",
      "Purple"
    ],
    "rarity": "L",
    "isAlternateArt": true,
    "cost": null,
    "power": 5000,
    "life": 4,
    "counter": 0,
    "type": [
      "Water Seven",
      "The Franky Family",
      "Straw Hat Crew"
    ],
    "attribute": "Special",
    "effect": "All Stage cards in your hand have a +1000 Counter.\n[Activate: Main] [Once Per Turn] DON!! -1: Play up to 1 Stage card with a cost of 5 or less from your hand.",
    "effectFr": "Toutes les cartes Terrain dans votre main possèdent un Contre de +1000.\n[Activation : Principale] [Une fois par tour] DON!! -1 : Jouez jusqu'à 1 carte Terrain de coût 5 ou moins depuis votre main.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku & OnePieceTopDecks",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/op18-021-franky-aa.jpg",
    "altImageUrl": "/reveals/op18-021.png",
    "metaAnalysis": "Version Alternate Art (AA) officielle du Leader Franky Vert/Violet avec pose de combat dynamique et dorures brillantes.",
    "isConfirmed": true
  },
  {
    "id": "op18-119",
    "code": "OP18-119",
    "name": "Saint Shamrock (Secret Rare)",
    "jpName": "シャムロック聖 (SEC)",
    "set": "OP18",
    "setName": "The Dominance of God [OP-18]",
    "category": "Character",
    "color": [
      "Black"
    ],
    "rarity": "SEC",
    "isAlternateArt": false,
    "cost": 8,
    "power": 9000,
    "counter": 0,
    "type": [
      "Celestial Dragons",
      "Holy Knights of God"
    ],
    "attribute": "Slash",
    "effect": "[On K.O.] You may trash 1 card from your hand: Play this Character card from your trash.\n[Activate: Main] [Once Per Turn] If this Character was played on this turn, play up to 1 {Holy Knights of God} type Character card with a cost of 6 or less from your trash.",
    "effectFr": "[Au K.O.] Vous pouvez défausser 1 carte de votre main : Jouez cette carte Personnage depuis votre défausse.\n[Activation : Principale] [Une fois par tour] Si ce Personnage a été joué pendant ce tour, jouez jusqu'à 1 carte Personnage de type {Chevaliers Divins} de coût 6 ou moins depuis votre défausse.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku & OnePieceTopDecks",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/op18-119.png",
    "altImageUrl": "/reveals/op18-065-shamrock-aa.jpg",
    "metaAnalysis": "La carte Secret Rare majeure d'OP-18 à 9000 de puissance ! Résurrection infinie sur K.O. et réanimation immédiate d'un allié jusqu'à coût 6 depuis la défausse.",
    "isConfirmed": true
  },
  {
    "id": "op18-119-aa",
    "code": "OP18-119",
    "name": "Saint Shamrock (Secret Rare Alternate Art)",
    "jpName": "シャムロック聖 (パラレル SEC)",
    "set": "OP18",
    "setName": "The Dominance of God [OP-18]",
    "category": "Character",
    "color": [
      "Black"
    ],
    "rarity": "SEC",
    "isAlternateArt": true,
    "cost": 8,
    "power": 9000,
    "counter": 0,
    "type": [
      "Celestial Dragons",
      "Holy Knights of God"
    ],
    "attribute": "Slash",
    "effect": "[On K.O.] You may trash 1 card from your hand: Play this Character card from your trash.\n[Activate: Main] [Once Per Turn] If this Character was played on this turn, play up to 1 {Holy Knights of God} type Character card with a cost of 6 or less from your trash.",
    "effectFr": "[Au K.O.] Vous pouvez défausser 1 carte de votre main : Jouez cette carte Personnage depuis votre défausse.\n[Activation : Principale] [Une fois par tour] Si ce Personnage a été joué pendant ce tour, jouez jusqu'à 1 carte Personnage de type {Chevaliers Divins} de coût 6 ou moins depuis votre défausse.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku & OnePieceTopDecks",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/op18-065-shamrock-aa.jpg",
    "altImageUrl": "/reveals/op18-119.png",
    "metaAnalysis": "Version Alternate Art SEC collector de Saint Shamrock avec dorures exclusives et effet holographique.",
    "isConfirmed": true
  },
  {
    "id": "op18-060",
    "code": "OP18-060",
    "name": "Saint Gunko (Leader)",
    "jpName": "軍子聖 (神の騎士団)",
    "set": "OP18",
    "setName": "The Dominance of God [OP-18]",
    "category": "Leader",
    "color": [
      "Black",
      "Purple"
    ],
    "rarity": "L",
    "isAlternateArt": false,
    "cost": null,
    "power": 5000,
    "life": 4,
    "counter": 0,
    "type": [
      "Celestial Dragons",
      "Holy Knights of God"
    ],
    "attribute": "Special",
    "effect": "[Once Per Turn] When a Character is played from your trash, draw 2 cards and trash 1 card from your hand.\n[Activate: Main] [Once Per Turn] You may trash 1 card from your hand: If you have a Character with 8000 base power or more, add up to 1 DON!! card as active from your DON!! deck.",
    "effectFr": "[Une fois par tour] Lorsqu'un Personnage est joué depuis votre défausse, piochez 2 cartes et défaussez 1 carte de votre main.\n[Activation : Principale] [Une fois par tour] Vous pouvez défausser 1 carte de votre main : Si vous possédez un Personnage ayant 8000 de puissance de base ou plus, ajoutez jusqu'à 1 carte DON!! active depuis votre deck DON!!.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku & OnePieceTopDecks",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/op18-060.png",
    "altImageUrl": "/reveals/op18-060-loki-aa.jpg",
    "metaAnalysis": "Leader officiel des Chevaliers Divins (Holy Knights of God) ! Moteur de pioche massif lors des résurrections et accélération de DON!! actifs.",
    "isConfirmed": true
  },
  {
    "id": "op18-060-aa",
    "code": "OP18-060",
    "name": "Saint Gunko (Leader Alternate Art)",
    "jpName": "軍子聖 (パラレル)",
    "set": "OP18",
    "setName": "The Dominance of God [OP-18]",
    "category": "Leader",
    "color": [
      "Black",
      "Purple"
    ],
    "rarity": "L",
    "isAlternateArt": true,
    "cost": null,
    "power": 5000,
    "life": 4,
    "counter": 0,
    "type": [
      "Celestial Dragons",
      "Holy Knights of God"
    ],
    "attribute": "Special",
    "effect": "[Once Per Turn] When a Character is played from your trash, draw 2 cards and trash 1 card from your hand.\n[Activate: Main] [Once Per Turn] You may trash 1 card from your hand: If you have a Character with 8000 base power or more, add up to 1 DON!! card as active from your DON!! deck.",
    "effectFr": "[Une fois par tour] Lorsqu'un Personnage est joué depuis votre défausse, piochez 2 cartes et défaussez 1 carte de votre main.\n[Activation : Principale] [Une fois par tour] Vous pouvez défausser 1 carte de votre main : Si vous possédez un Personnage ayant 8000 de puissance de base ou plus, ajoutez jusqu'à 1 carte DON!! active depuis votre deck DON!!.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku & OnePieceTopDecks",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/op18-060-loki-aa.jpg",
    "altImageUrl": "/reveals/op18-060.png",
    "metaAnalysis": "Version Alternate Art (AA) officielle du Leader Saint Gunko avec illustration plein cadre sans bordure des Chevaliers Divins.",
    "isConfirmed": true
  },
  {
    "id": "op18-065",
    "code": "OP18-065",
    "name": "Saint Gunko (Character SR)",
    "jpName": "軍子聖 (SR)",
    "set": "OP18",
    "setName": "The Dominance of God [OP-18]",
    "category": "Character",
    "color": [
      "Purple"
    ],
    "rarity": "SR",
    "isAlternateArt": false,
    "cost": 10,
    "power": 11000,
    "counter": 0,
    "type": [
      "Celestial Dragons",
      "Holy Knights of God"
    ],
    "attribute": "Special",
    "effect": "[Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)\n[On Play] DON!! -1: Play up to 1 {Celestial Dragons} type Character card with 6000 power or less from your trash.",
    "effectFr": "[Bloqueur] (Après la déclaration d'attaque adverse, vous pouvez épuiser cette carte pour en faire la nouvelle cible de l'attaque.)\n[Jouée] DON!! -1 : Jouez jusqu'à 1 carte Personnage de type {Dragons Célestes} avec 6000 de puissance ou moins depuis votre défausse.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku & OnePieceTopDecks",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/op18-065.png",
    "metaAnalysis": "Bloqueur titanesque à 11000 de puissance qui réanime un Dragon Céleste de 6000 puissance dès son arrivée en jeu.",
    "isConfirmed": true
  },
  {
    "id": "op18-031",
    "code": "OP18-031",
    "name": "Nico Robin (Character SR / Manga Parallel)",
    "jpName": "ニコ・ロビン (Manga Rare)",
    "set": "OP18",
    "setName": "The Dominance of God [OP-18]",
    "category": "Character",
    "color": [
      "Green"
    ],
    "rarity": "MANGA",
    "isAlternateArt": true,
    "cost": 4,
    "power": 5000,
    "counter": 1000,
    "type": [
      "Water Seven",
      "Straw Hat Crew"
    ],
    "attribute": "Wisdom",
    "effect": "[Opponent's Turn] If your Character would be removed from the field by your opponent's effect, you may rest this Character instead.\n[End of Your Turn] Set up to 1 of your {Water Seven} type cards and up to 1 of your DON!! cards as active.",
    "effectFr": "[Tour adverse] Si un de vos Personnages devait quitter le terrain à cause d'un effet adverse, vous pouvez épuiser ce Personnage à la place.\n[Fin de votre tour] Redressez jusqu'à 1 de vos cartes de type {Water Seven} et jusqu'à 1 de vos cartes DON!!.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku & OnePieceTopDecks",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/op18-031.png",
    "altImageUrl": "/reveals/op18-031-robin-manga.jpg",
    "metaAnalysis": "La carte Manga Rare officielle d'OP-18 ! Protection absolue contre les effets de retrait adverse et redressement de DON!! en fin de tour.",
    "isConfirmed": true
  },
  {
    "id": "op18-078",
    "code": "OP18-078",
    "name": "Mini-Merry II (Stage UC)",
    "jpName": "ミニメリー2号",
    "set": "OP18",
    "setName": "The Dominance of God [OP-18]",
    "category": "Stage",
    "color": [
      "Purple"
    ],
    "rarity": "UC",
    "isAlternateArt": false,
    "cost": 5,
    "power": null,
    "counter": 0,
    "type": [
      "Straw Hat Crew"
    ],
    "attribute": "-",
    "effect": "[On Play] Draw 1 card, then add up to 1 DON!! card as rested from your DON!! deck.\n[Activate: Main] You may rest this Stage: Give up to a total of 4 of your Leader or Characters 1 rested DON!! card each.",
    "effectFr": "[Jouée] Piochez 1 carte, puis ajoutez jusqu'à 1 carte DON!! épuisée depuis votre deck DON!!.\n[Activation : Principale] Vous pouvez épuiser ce Terrain : Donnez à un total de jusqu'à 4 de vos cartes (Leader ou Personnages) 1 carte DON!! épuisée chacune.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku & OnePieceTopDecks",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/op18-078.png",
    "metaAnalysis": "Moteur d'accélération DON!! pour Franky et Straw Hat : pioche à l'entrée et redistribue 4 DON!! épuisés à chaque tour.",
    "isConfirmed": true
  },
  {
    "id": "eb05-010-aa",
    "code": "EB05-010",
    "name": "Nico Robin (Leader Alternate Art)",
    "jpName": "ニコ・ロビン (パラレル)",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Leader",
    "color": [
      "Green",
      "Yellow"
    ],
    "rarity": "L",
    "isAlternateArt": true,
    "cost": null,
    "power": 5000,
    "life": 4,
    "counter": 0,
    "type": [
      "Straw Hat Crew"
    ],
    "attribute": "Wisdom",
    "effect": "[Once Per Turn] When one of your Characters with the [Wisdom] attribute and without [Blocker] is K.O.'d, add up to 1 card from the top of your deck to the top of your Life cards.\n[Activate: Main] [Once Per Turn] Set up to 1 of your Characters with the [Wisdom] attribute and 6000 power or less as active.",
    "effectFr": "[Une fois par tour] Lorsqu'un de vos Personnages ayant l'attribut <Sagesse> et sans [Bloqueur] est mis K.O., ajoutez jusqu'à 1 carte du dessus de votre deck au-dessus de vos cartes de Vie.\n[Activation : Principale] [Une fois par tour] Redressez jusqu'à 1 de vos Personnages ayant l'attribut <Sagesse> et 6000 de puissance ou moins.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku & OnePieceTopDecks",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-010-robin-aa.jpg",
    "altImageUrl": "/reveals/eb05-010.png",
    "metaAnalysis": "Version Alternate Art (AA) collector du Leader Nico Robin avec un gros plan magnifique et effets dorés Heroines.",
    "isConfirmed": true
  },
  {
    "id": "eb05-001",
    "code": "EB05-001",
    "name": "Nami (Special SP)",
    "jpName": "ナミ (SP)",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Character",
    "color": [
      "Red"
    ],
    "rarity": "SP",
    "isAlternateArt": true,
    "cost": 1,
    "power": 2000,
    "counter": 2000,
    "type": [
      "Straw Hat Crew"
    ],
    "attribute": "Special",
    "effect": "[On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Straw Hat Crew} type card other than [Nami] and add it to your hand. Then place the rest at the bottom of your deck in any order.",
    "effectFr": "[Jouée] Regardez les 5 cartes du dessus de votre deck ; révélez jusqu'à 1 carte de type {Équipage de Chapeau de paille} autre que [Nami] et ajoutez-la à votre main. Placez ensuite le reste sous votre deck dans l'ordre de votre choix.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku & OnePieceTopDecks",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-nami-sp.jpg",
    "metaAnalysis": "Version Special Card SP officielle de la carte de recherche Nami indispensable avec Counter +2000.",
    "isConfirmed": true
  },
  {
    "id": "eb05-hancock",
    "code": "EB05-SP04",
    "name": "Boa Hancock (Leader SP)",
    "jpName": "ボア・ハンコック (Leader SP)",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Leader",
    "color": [
      "Blue"
    ],
    "rarity": "SP",
    "isAlternateArt": true,
    "cost": null,
    "power": 5000,
    "life": 5,
    "counter": 0,
    "type": [
      "Kuja Pirates",
      "Seven Warlords of the Sea"
    ],
    "attribute": "Special",
    "effect": "When you play a Character, draw 1 card.\n[When Attacking] When one of your {Amazon Lily} or {Kuja Pirates} type Characters with 5000 base power or more attacks: Return up to 1 of your opponent's Characters with a cost of 3 or less to the owner's hand.",
    "effectFr": "Lorsque vous jouez un Personnage, piochez 1 carte.\n[Lors d'une attaque] Lorsqu'un de vos Personnages de type {Amazon Lily} ou {Pirates Kuja} ayant 5000 de puissance de base ou plus attaque : Renvoyez jusqu'à 1 Personnage adverse de coût 3 ou moins dans la main de son propriétaire.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku & OnePieceTopDecks",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-card-8.jpg",
    "metaAnalysis": "Édition Heroines SP somptueuse du Leader Boa Hancock Bleu avec pioche continue et contrôle de terrain.",
    "isConfirmed": true
  },
  {
    "id": "eb05-shirahoshi",
    "code": "EB05-SP03",
    "name": "Shirahoshi (Leader SP)",
    "jpName": "しらほし (Leader SP)",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Leader",
    "color": [
      "Green",
      "Yellow"
    ],
    "rarity": "SP",
    "isAlternateArt": true,
    "cost": null,
    "power": 5000,
    "life": 5,
    "counter": 0,
    "type": [
      "Merfolk",
      "Fish-Man Island"
    ],
    "attribute": "Special",
    "effect": "This Leader cannot attack.\n[Activate: Main] [Once Per Turn] You may rest 1 of your DON!! cards and turn 1 card from the top of your Life cards face-up: Play up to 1 {Neptunian} type Character card with a cost equal to or less than the number of DON!! cards on your field from your hand.",
    "effectFr": "Ce Leader ne peut pas attaquer.\n[Activation : Principale] [Une fois par tour] Vous pouvez épuiser 1 de vos cartes DON!! et retourner face visible 1 carte du dessus de vos cartes de Vie : Jouez depuis votre main jusqu'à 1 carte Personnage de type {Monstre marin} d'un coût inférieur ou égal au nombre de cartes DON!! sur votre terrain.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku & OnePieceTopDecks",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-card-7.jpg",
    "metaAnalysis": "Version Heroines SP de la princesse Shirahoshi Vert/Jaune permettant d'invoquer les Rois des Mers depuis la main.",
    "isConfirmed": true
  },
  {
    "id": "eb05-bonney",
    "code": "EB05-SP06",
    "name": "Jewelry Bonney (Leader SP)",
    "jpName": "ジュエリー・ボニー (Leader SP)",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Leader",
    "color": [
      "Green"
    ],
    "rarity": "SP",
    "isAlternateArt": true,
    "cost": null,
    "power": 5000,
    "life": 5,
    "counter": 0,
    "type": [
      "Supernovae",
      "Bonney Pirates"
    ],
    "attribute": "Special",
    "effect": "[Your Turn] [Once Per Turn] This effect can be activated when you play a Character with a Trigger: Give up to 2 rested DON!! cards to 1 of your Leader or Character cards.",
    "effectFr": "[Votre Tour] [Une fois par tour] Cet effet peut être activé lorsque vous jouez un Personnage avec Déclencheur : Donnez jusqu'à 2 cartes DON!! épuisées à 1 de vos cartes Leader ou Personnage.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku & OnePieceTopDecks",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-card-10.jpg",
    "metaAnalysis": "Leader Bonney Verte en version Heroines SP avec accélération de 2 DON!! dès qu'une carte à Déclencheur est jouée.",
    "isConfirmed": true
  },
  {
    "id": "eb05-nami-leader",
    "code": "EB05-SP02",
    "name": "Nami (Leader SP)",
    "jpName": "ナミ (Leader SP)",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Leader",
    "color": [
      "Blue"
    ],
    "rarity": "SP",
    "isAlternateArt": true,
    "cost": null,
    "power": 5000,
    "life": 4,
    "counter": 0,
    "type": [
      "Straw Hat Crew"
    ],
    "attribute": "Special",
    "effect": "[Activate: Main] [Once Per Turn] Trash 1 card from your hand: This Leader gains +2000 power during this turn.",
    "effectFr": "[Activation : Principale] [Une fois par tour] Défaussez 1 carte de votre main : Ce Leader gagne +2000 de puissance pendant ce tour.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku & OnePieceTopDecks",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-card-6.jpg",
    "metaAnalysis": "Version Heroines SP officielle de Nami Leader Bleue avec boost d'attaque à 7000.",
    "isConfirmed": true
  },
  {
    "id": "eb05-vivi",
    "code": "EB05-SP01",
    "name": "Nefeltari Vivi (Leader SP)",
    "jpName": "ネフェルタリ・ビビ (Leader SP)",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Leader",
    "color": [
      "Red",
      "Blue"
    ],
    "rarity": "SP",
    "isAlternateArt": true,
    "cost": null,
    "power": 5000,
    "life": 4,
    "counter": 0,
    "type": [
      "Alabasta"
    ],
    "attribute": "Slash",
    "effect": "If your Character with a base cost of 5 or more would be K.O.'d, you may trash 1 card from your hand instead.\n[Activate: Main] You may rest this Leader: Give up to 1 of your opponent's Characters -2000 power during this turn, and up to 1 of your Characters without a [Blocker] effect gains [Rush].",
    "effectFr": "Si un de vos Personnages de coût de base 5 ou plus devait être mis K.O., vous pouvez défausser 1 carte de votre main à la place.\n[Activation : Principale] Vous pouvez épuiser ce Leader : Donnez jusqu'à 1 Personnage adverse -2000 de puissance pendant ce tour, et jusqu'à 1 de vos Personnages sans [Bloqueur] gagne [Assaut].",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku & OnePieceTopDecks",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-card-5.jpg",
    "metaAnalysis": "Réédition prestige en version Heroines SP de Vivi Rouge/Bleue avec protection contre les K.O. et octroi d'Assaut.",
    "isConfirmed": true
  },
  {
    "id": "eb05-rebecca",
    "code": "EB05-SP05",
    "name": "Rebecca (Leader SP)",
    "jpName": "レベッカ (Leader SP)",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Leader",
    "color": [
      "Blue",
      "Black"
    ],
    "rarity": "SP",
    "isAlternateArt": true,
    "cost": null,
    "power": 5000,
    "life": 5,
    "counter": 0,
    "type": [
      "Dressrosa"
    ],
    "attribute": "Slash",
    "effect": "This Leader cannot attack.\n[Activate: Main] [Once Per Turn] (1): You may rest this Leader and return 1 of your {Dressrosa} type Characters to the owner's hand: Play up to 1 {Dressrosa} type Character card with a cost of 3 or less from your hand.",
    "effectFr": "Ce Leader ne peut pas attaquer.\n[Activation : Principale] [Une fois par tour] (1) : Vous pouvez épuiser ce Leader et renvoyer 1 de vos Personnages de type {Dressrosa} dans la main de son propriétaire : Jouez jusqu'à 1 carte Personnage de type {Dressrosa} de coût 3 ou moins depuis votre main.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku & OnePieceTopDecks",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-card-9.jpg",
    "metaAnalysis": "Édition collector Heroines SP de la reine du contrôle Dressrosa avec 5 cartes de vie.",
    "isConfirmed": true
  },
  {
    "id": "eb05-047",
    "code": "EB05-047",
    "name": "Ripley",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Character",
    "color": [
      "Black"
    ],
    "rarity": "R",
    "isAlternateArt": false,
    "cost": 4,
    "power": 4000,
    "counter": 2000,
    "type": [
      "Giant",
      "Elbaph"
    ],
    "attribute": "Wisdom",
    "effect": "This Character gains +12 cost. [On Play] You may trash 1 card from your hand: Play up to 1 Character card with a cost of 2 or less from your trash.",
    "effectFr": "Ce Personnage gagne +12 en coût.\n[Jouée] Vous pouvez défausser 1 carte de votre main : Jouez jusqu'à 1 carte Personnage de coût 2 ou moins depuis votre défausse.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-047.png",
    "metaAnalysis": "Gagne un coût massif de +12 (devenant coût 14) et réanime une créature de coût 2 ou moins depuis la défausse.",
    "isConfirmed": true
  },
  {
    "id": "eb05-025",
    "code": "EB05-025",
    "name": "Domino",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Character",
    "color": [
      "Blue"
    ],
    "rarity": "C",
    "isAlternateArt": false,
    "cost": 2,
    "power": 3000,
    "counter": 1000,
    "type": [
      "Impel Down"
    ],
    "attribute": "Wisdom",
    "effect": "[On Play] Look at 3 cards from the top of your deck; reveal up to 1 {Impel Down} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.",
    "effectFr": "[Au K.O.] Placez jusqu'à 1 Personnage avec l'attribut <Sagesse> depuis votre défausse sous le deck de son propriétaire.",
    "trigger": "[Trigger] Activate this card's [On Play] effect.",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-025.png",
    "metaAnalysis": "Contre +2000 et recyclage en fond de deck lors du K.O.",
    "isConfirmed": true
  },
  {
    "id": "eb05-054",
    "code": "EB05-054",
    "name": "Charlotte Brulee",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Character",
    "color": [
      "Yellow"
    ],
    "rarity": "C",
    "isAlternateArt": false,
    "cost": 3,
    "power": 4000,
    "counter": 1000,
    "type": [
      "Big Mom Pirates"
    ],
    "attribute": "Special",
    "effect": "",
    "effectFr": "[Déclencheur] Jouez cette carte.",
    "trigger": "[Trigger] Play up to 2 {Big Mom Pirates} type Character cards with 4000 power from your hand.",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-054.png",
    "metaAnalysis": "Contre +2000 et Déclencheur permettant de jouer la carte directement depuis la Vie.",
    "isConfirmed": true
  },
  {
    "id": "eb05-042",
    "code": "EB05-042",
    "name": "Shinobu",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Character",
    "color": [
      "Black"
    ],
    "rarity": "C",
    "isAlternateArt": false,
    "cost": 4,
    "power": 5000,
    "counter": 2000,
    "type": [
      "Land of Wano"
    ],
    "attribute": "Special",
    "effect": "[On Play] Draw 2 cards and trash 2 cards from your hand.",
    "effectFr": "[Jouée] Piochez 2 cartes et défaussez 2 cartes de votre main.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-042.png",
    "metaAnalysis": "Contre +2000 et recyclage de main Wano : pioche 2 cartes et défausse 2 cartes.",
    "isConfirmed": true
  },
  {
    "id": "eb05-023",
    "code": "EB05-023",
    "name": "Osome",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Character",
    "color": [
      "Blue"
    ],
    "rarity": "C",
    "isAlternateArt": false,
    "cost": 1,
    "power": 0,
    "counter": 2000,
    "type": [
      "Land of Wano"
    ],
    "attribute": "Wisdom",
    "effect": "[On Play] You may trash 2 Events from your hand: Draw 3 cards.",
    "effectFr": "[Jouée] Vous pouvez défausser 2 cartes Événement de votre main : Piochez 3 cartes.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-023.png",
    "metaAnalysis": "Contre +2000 et moteur de filtrage : défausse 2 Événements pour piocher 3 cartes.",
    "isConfirmed": true
  },
  {
    "id": "eb05-057",
    "code": "EB05-057",
    "name": "Nojiko",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Character",
    "color": [
      "Yellow"
    ],
    "rarity": "R",
    "isAlternateArt": false,
    "cost": 2,
    "power": 0,
    "counter": 2000,
    "type": [
      "East Blue"
    ],
    "attribute": "Wisdom",
    "effect": "[Activate: Main] [Once Per Turn] Give up to 1 rested DON!! card to 1 of your Leader or Character cards with the <Special> or <Wisdom> attribute.",
    "effectFr": "[Activation : Principale] [Une fois par tour] Donnez jusqu'à 1 carte DON!! épuisée à 1 de vos cartes (Leader ou Personnage) ayant l'attribut <Spécial> ou <Sagesse>.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-057.png",
    "metaAnalysis": "Contre +2000 East Blue et redistribution de DON!! épuisés à chaque tour pour les cartes Sagesse/Spécial.",
    "isConfirmed": true
  },
  {
    "id": "eb05-017",
    "code": "EB05-017",
    "name": "Mermaid Cafe Dancers",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Character",
    "color": [
      "Green"
    ],
    "rarity": "C",
    "isAlternateArt": false,
    "cost": 1,
    "power": 0,
    "counter": 2000,
    "type": [
      "Merfolk",
      "Fish-Man Island"
    ],
    "attribute": "Wisdom",
    "effect": "[On Your Opponent's Attack] You may rest 1 of your DON!! cards and trash this Character: Your {Fish-Man} or {Merfolk} type Leader gains +4000 power during this battle.",
    "effectFr": "[Lors d'une attaque adverse] Vous pouvez épuiser 1 de vos cartes DON!! et défausser ce Personnage : Votre Leader de type {Homme-Poisson} ou {Ondin} gagne +4000 de puissance pendant ce combat.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-017.png",
    "metaAnalysis": "Contre +2000 et boost défensif d'urgence de +4000 de puissance pour le Leader Homme-Poisson/Ondin.",
    "isConfirmed": true
  },
  {
    "id": "eb05-011",
    "code": "EB05-011",
    "name": "Otohime",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Character",
    "color": [
      "Green"
    ],
    "rarity": "C",
    "isAlternateArt": false,
    "cost": 1,
    "power": 0,
    "counter": 2000,
    "type": [
      "Merfolk",
      "Fish-Man Island"
    ],
    "attribute": "Wisdom",
    "effect": "[On Play] If your Leader is [Shirahoshi], you may turn 1 card from the top of your Life cards face-down: Rest up to 1 of your opponent's Characters with a cost of 5 or less.",
    "effectFr": "[Jouée] Si votre Leader est [Shirahoshi], vous pouvez retourner face cachée 1 carte du dessus de vos cartes de Vie : Épuisez jusqu'à 1 Personnage adverse de coût 5 ou moins.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-011.png",
    "metaAnalysis": "Contre +2000 pour Shirahoshi et contrôle de créature adverse jusqu'à coût 5 en retournant une carte de Vie face cachée.",
    "isConfirmed": true
  },
  {
    "id": "eb05-016",
    "code": "EB05-016",
    "name": "Nico Robin",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Character",
    "color": [
      "Green",
      "Yellow"
    ],
    "rarity": "SR",
    "isAlternateArt": false,
    "cost": 6,
    "power": 6000,
    "counter": 1000,
    "type": [
      "Straw Hat Crew"
    ],
    "attribute": "Wisdom",
    "effect": "[Your Turn] [On Play] Play up to 1 Character card with a cost of 5 or less and the [Wisdom] attribute from your hand.",
    "effectFr": "[Votre tour] [Jouée] Jouez jusqu'à 1 carte Personnage de coût 5 ou moins ayant l'attribut [Sagesse] depuis votre main.\n[Déclencheur] Épuisez jusqu'à 1 Personnage adverse de coût 6 ou moins.",
    "trigger": "[Trigger] Rest up to 1 of your opponent's Characters with a cost of 6 or less.",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-016.png",
    "metaAnalysis": "Support majeur pour le Leader Robin : déploie un allié de coût 5 gratuitement avec attribut Sagesse et Déclencheur d'épuisement de coût 6 adverse.",
    "isConfirmed": true
  },
  {
    "id": "eb05-002",
    "code": "EB05-002",
    "name": "Doll",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Character",
    "color": [
      "Red"
    ],
    "rarity": "R",
    "isAlternateArt": false,
    "cost": 1,
    "power": 2000,
    "counter": 2000,
    "type": [
      "Navy"
    ],
    "attribute": "Strike",
    "effect": "[On Play] Look at 5 cards from the top of your deck; reveal up to 2 {Navy} type cards with a cost of 2 or more and add them to your hand, then place the rest at the bottom of your deck in any order. Then, trash 1 card from your hand.",
    "effectFr": "[Jouée] Regardez les 5 cartes du dessus de votre deck ; révélez jusqu'à 2 cartes de type {Marine} de coût 2 ou plus et ajoutez-les à votre main, puis placez le reste sous votre deck dans l'ordre de votre choix. Ensuite, défaussez 1 carte de votre main.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-002.png",
    "metaAnalysis": "Recherche de 5 cartes chez la Marine pour récupérer 2 cartes de coût 2 ou plus avec Counter +2000.",
    "isConfirmed": true
  },
  {
    "id": "eb05-035",
    "code": "EB05-035",
    "name": "Speed",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Character",
    "color": [
      "Purple"
    ],
    "rarity": "C",
    "isAlternateArt": false,
    "cost": 6,
    "power": 6000,
    "counter": 1000,
    "type": [
      "SMILE",
      "Animal Kingdom Pirates"
    ],
    "attribute": "Strike",
    "effect": "[On Play] DON!! -1: Look at 5 cards from the top of your deck; reveal up to 2 {SMILE} type cards and add them to your hand, then place the rest at the bottom of your deck in any order. Then, play up to 2 {SMILE} type Character cards with 5000 power or less from your hand.",
    "effectFr": "[Jouée] DON!! -1 : Regardez les 5 cartes du dessus de votre deck ; révélez jusqu'à 2 cartes de type {SMILE} et ajoutez-les à votre main, puis placez le reste sous votre deck. Ensuite, jouez jusqu'à 2 cartes Personnage de type {SMILE} ayant 5000 de puissance ou moins depuis votre main.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-035.png",
    "metaAnalysis": "Moteur d'essaim SMILE : cherche 2 cartes SMILE et en déploie jusqu'à 2 avec 5000 de puissance ou moins.",
    "isConfirmed": true
  },
  {
    "id": "eb05-022",
    "code": "EB05-022",
    "name": "Octopako",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Character",
    "color": [
      "Blue"
    ],
    "rarity": "C",
    "isAlternateArt": false,
    "cost": 1,
    "power": 2000,
    "counter": 1000,
    "type": [
      "Fish-Man",
      "Fish-Man Island"
    ],
    "attribute": "Wisdom",
    "effect": "[On K.O.] Draw 2 cards.",
    "effectFr": "[Au K.O.] Piochez 2 cartes.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-022.png",
    "metaAnalysis": "Pioche 2 cartes lors de son K.O. pour seulement 1 coût.",
    "isConfirmed": true
  },
  {
    "id": "eb05-036",
    "code": "EB05-036",
    "name": "Tsuru",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Character",
    "color": [
      "Purple"
    ],
    "rarity": "C",
    "isAlternateArt": false,
    "cost": 4,
    "power": 0,
    "counter": 1000,
    "type": [
      "Navy"
    ],
    "attribute": "Special",
    "effect": "[On Play] If your Leader has the {Navy} type, draw 1 card, and add up to 1 DON!! card as rested from your DON!! deck.",
    "effectFr": "[Jouée] Si votre Leader est de type {Marine}, piochez 1 carte et ajoutez jusqu'à 1 carte DON!! épuisée depuis votre deck DON!!.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-036.png",
    "metaAnalysis": "Support Navy Violet : pioche 1 carte et accélère 1 DON!! épuisé si le Leader est de type Marine.",
    "isConfirmed": true
  },
  {
    "id": "eb05-007",
    "code": "EB05-007",
    "name": "Monet",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Character",
    "color": [
      "Red"
    ],
    "rarity": "C",
    "isAlternateArt": false,
    "cost": 2,
    "power": 1000,
    "counter": 2000,
    "type": [
      "Punk Hazard",
      "Donquixote Pirates"
    ],
    "attribute": "Special",
    "effect": "[On Play] You may reveal a total of 3 Event or {Punk Hazard} type cards from your hand: Draw 1 card.\n[End of Your Turn] This Character gains +5000 power until the end of your opponent's next End Phase.",
    "effectFr": "[Jouée] Vous pouvez révéler un total de 3 cartes Événement ou de type {Punk Hazard} depuis votre main : Piochez 1 carte.\n[Fin de votre tour] Ce Personnage gagne +5000 de puissance jusqu'à la fin de la prochaine Phase de Fin de votre adversaire.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-007.png",
    "metaAnalysis": "Moteur de pioche Punk Hazard et corps défensif montant à 6000 de puissance pendant le tour adverse.",
    "isConfirmed": true
  },
  {
    "id": "eb05-013",
    "code": "EB05-013",
    "name": "Shirley",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Character",
    "color": [
      "Green"
    ],
    "rarity": "C",
    "isAlternateArt": false,
    "cost": 3,
    "power": 4000,
    "counter": 1000,
    "type": [
      "Merfolk",
      "Fish-Man Island"
    ],
    "attribute": "Wisdom",
    "effect": "[On Your Opponent's Attack] [Once Per Turn] You may rest 1 of your DON!! cards: Your {Fish-Man} or {Merfolk} type Leader gains +2000 power during this battle.",
    "effectFr": "[Lors d'une attaque adverse] [Une fois par tour] Vous pouvez épuiser 1 de vos cartes DON!! : Votre Leader de type {Homme-Poisson} ou {Ondin} gagne +2000 de puissance pendant ce combat.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-013.png",
    "metaAnalysis": "Défense continue pour les Hommes-Poissons : octroie +2000 de puissance au Leader lors des attaques adverses pour 1 DON!!.",
    "isConfirmed": true
  },
  {
    "id": "eb05-005",
    "code": "EB05-005",
    "name": "Belo Betty",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Character",
    "color": [
      "Red"
    ],
    "rarity": "C",
    "isAlternateArt": false,
    "cost": 2,
    "power": 3000,
    "counter": 1000,
    "type": [
      "Revolutionary Army"
    ],
    "attribute": "Special",
    "effect": "[On Play] Up to 3 of your Characters with both the {Revolutionary Army} type and a [Trigger] gain +2000 power during this turn.\n[Activate: Main] You may trash this Character: Give up to 1 of your opponent's Characters -2000 power during this turn.",
    "effectFr": "[Jouée] Jusqu'à 3 de vos Personnages possédant à la fois le type {Armée Révolutionnaire} et un [Déclencheur] gagnent +2000 de puissance pendant ce tour.\n[Activation : Principale] Vous pouvez défausser ce Personnage : Donnez à jusqu'à 1 Personnage adverse -2000 de puissance pendant ce tour.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-005.png",
    "metaAnalysis": "Support offensif Armée Révolutionnaire : booste 3 personnages de +2000 de puissance ou affaiblit un adversaire de -2000.",
    "isConfirmed": true
  },
  {
    "id": "eb05-038",
    "code": "EB05-038",
    "name": "Russian",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Character",
    "color": [
      "Purple"
    ],
    "rarity": "C",
    "isAlternateArt": false,
    "cost": 1,
    "power": 0,
    "counter": 2000,
    "type": [
      "Senor Pink's Wife"
    ],
    "attribute": "Wisdom",
    "effect": "[On Play] Up to 1 of your [Senor Pink] cards gains +3000 power during this turn.",
    "effectFr": "[Jouée] Jusqu'à 1 de vos cartes [Senor Pink] gagne +3000 de puissance pendant ce tour.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-038.png",
    "metaAnalysis": "Contre +2000 et boost d'attaque de +3000 de puissance pour Señor Pink.",
    "isConfirmed": true
  },
  {
    "id": "eb05-051",
    "code": "EB05-051",
    "name": "Ahiru",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Character",
    "color": [
      "Yellow"
    ],
    "rarity": "C",
    "isAlternateArt": false,
    "cost": 3,
    "power": 4000,
    "counter": 1000,
    "type": [
      "Revolutionary Army"
    ],
    "attribute": "Ranged",
    "effect": "[On Play] Rest up to 1 of your opponent's Characters with a cost equal to or less than the total of your and your opponent's Life cards.",
    "effectFr": "[Jouée] Épuisez jusqu'à 1 Personnage adverse de coût inférieur ou égal au total des cartes de Vie combinées des deux joueurs.\n[Déclencheur] Jouez cette carte.",
    "trigger": "[Trigger] Play this card.",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-051.png",
    "metaAnalysis": "Contrôle Jaune Révolutionnaire : épuise un personnage adverse et se joue directement sur Déclencheur !",
    "isConfirmed": true
  },
  {
    "id": "eb05-045",
    "code": "EB05-045",
    "name": "Ms. Monday",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Character",
    "color": [
      "Black"
    ],
    "rarity": "C",
    "isAlternateArt": false,
    "cost": 2,
    "power": 3000,
    "counter": 1000,
    "type": [
      "Baroque Works"
    ],
    "attribute": "Strike",
    "effect": "[On Play] K.O. up to 1 of your Characters with a type including \"Baroque Works\".\n[On K.O.] Look at 3 cards from the top of your deck; reveal up to 1 card with a type including \"Baroque Works\" and add it to your hand. Then, trash the rest.",
    "effectFr": "[Jouée] Mettez K.O. jusqu'à 1 de vos Personnages ayant un type incluant \"Baroque Works\".\n[Au K.O.] Regardez les 3 cartes du dessus de votre deck ; révélez jusqu'à 1 carte de type incluant \"Baroque Works\" et ajoutez-la à votre main. Défaussez le reste.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-045.png",
    "metaAnalysis": "Moteur de recherche Baroque Works sur K.O. et sacrifice d'allié.",
    "isConfirmed": true
  },
  {
    "id": "eb05-056",
    "code": "EB05-056",
    "name": "Nico Olivia",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Character",
    "color": [
      "Yellow"
    ],
    "rarity": "C",
    "isAlternateArt": false,
    "cost": 1,
    "power": 0,
    "counter": 2000,
    "type": [
      "Ohara"
    ],
    "attribute": "Wisdom",
    "effect": "[On Play] You may trash 1 card with a [Trigger] from your hand: If your Leader is [Nico Robin], draw 2 cards.",
    "effectFr": "[Jouée] Vous pouvez défausser 1 carte avec un [Déclencheur] de votre main : Si votre Leader est [Nico Robin], piochez 2 cartes.\n[Déclencheur] Jouez cette carte.",
    "trigger": "[Trigger] Play this card.",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-056.png",
    "metaAnalysis": "Contre +2000 Ohara et pioche de 2 cartes pour le Leader Nico Robin en défaussant une carte à Déclencheur.",
    "isConfirmed": true
  },
  {
    "id": "eb05-010",
    "code": "EB05-010",
    "name": "Nico Robin (Leader)",
    "set": "EB05",
    "setName": "Heroines Edition Vol.2 [EB-05]",
    "category": "Leader",
    "color": [
      "Green",
      "Yellow"
    ],
    "rarity": "L",
    "isAlternateArt": false,
    "cost": null,
    "power": 5000,
    "life": 4,
    "counter": 0,
    "type": [
      "Straw Hat Crew"
    ],
    "attribute": "Wisdom",
    "effect": "[Once Per Turn] When one of your Characters with the [Wisdom] attribute and without [Blocker] is K.O.'d, add up to 1 card from the top of your deck to the top of your Life cards.\n[Activate: Main] [Once Per Turn] Set up to 1 of your Characters with the [Wisdom] attribute and 6000 power or less as active.",
    "effectFr": "[Une fois par tour] Lorsqu'un de vos Personnages ayant l'attribut <Sagesse> et sans [Bloqueur] est mis K.O., ajoutez jusqu'à 1 carte du dessus de votre deck au-dessus de vos cartes de Vie.\n[Activation : Principale] [Une fois par tour] Redressez jusqu'à 1 de vos Personnages ayant l'attribut <Sagesse> et 6000 de puissance ou moins.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/eb05-010.png",
    "metaAnalysis": "Leader révolutionnaire axé sur l'attribut <Wisdom> (Sagesse) : regagne de la Vie lors des K.O. alliés et redresse un combattant pour une seconde attaque !",
    "isConfirmed": true
  },
  {
    "id": "prb02-017",
    "code": "PRB02-017",
    "name": "Boa Hancock",
    "jpName": "ボア・ハンコック",
    "set": "PRB02",
    "setName": "The Best Vol. 2 [PRB-02]",
    "category": "Character",
    "color": [
      "Yellow"
    ],
    "rarity": "SR",
    "isAlternateArt": false,
    "cost": 5,
    "power": 7000,
    "counter": 0,
    "type": [
      "FILM",
      "The Seven Warlords of the Sea",
      "Kuja Pirates"
    ],
    "attribute": "Special",
    "effect": "[On Play] You may trash 1 card with a [Trigger] from your hand: Your opponent's rested Leader or up to 1 of your opponent's Characters other than [Monkey.D.Luffy] cannot attack until the end of your opponent's next End Phase.",
    "effectFr": "[Jouée] Vous pouvez défausser 1 carte avec un [Déclencheur] de votre main : Le Leader adverse épuisé ou jusqu'à 1 Personnage adverse autre que [Monkey.D.Luffy] ne peut pas attaquer jusqu'à la fin de la prochaine Phase de Fin adverse.\n[Déclencheur] Mettez K.O. jusqu'à 1 Personnage adverse de coût 4 ou moins.",
    "trigger": "[Trigger] K.O. up to 1 of your opponent's Characters with a cost of 4 or less.",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/prb02-017.png",
    "metaAnalysis": "Contrôle total Jaune SR à 7000 de puissance : empêche le Leader adverse ou un combattant d'attaquer, et détruit une créature de coût 4 sur Déclencheur !",
    "isConfirmed": true
  },
  {
    "id": "prb02-009",
    "code": "PRB02-009",
    "name": "Mr.3(Galdino)",
    "jpName": "Mr.3(ギャルディーノ)",
    "set": "PRB02",
    "setName": "The Best Vol. 2 [PRB-02]",
    "category": "Character",
    "color": [
      "Blue"
    ],
    "rarity": "R",
    "isAlternateArt": false,
    "cost": 2,
    "power": 1000,
    "counter": 1000,
    "type": [
      "Cross Guild",
      "Former Baroque Works"
    ],
    "attribute": "Special",
    "effect": "This effect can be activated when this Character is rested by your opponent's effect. You may trash this Character and draw 2 cards. \n [Blocker]",
    "effectFr": "Cet effet peut être activé lorsque ce Personnage est épuisé par un effet adverse. Vous pouvez défausser ce Personnage et piocher 2 cartes.\n[Bloqueur]",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/prb02-009.png",
    "metaAnalysis": "Bloqueur Bleu à 2 de coût qui permet de piocher 2 cartes s'il est épuisé par un effet adverse.",
    "isConfirmed": true
  },
  {
    "id": "prb02-014",
    "code": "PRB02-014",
    "name": "Sabo",
    "jpName": "サボ",
    "set": "PRB02",
    "setName": "The Best Vol. 2 [PRB-02]",
    "category": "Character",
    "color": [
      "Black"
    ],
    "rarity": "SR",
    "isAlternateArt": false,
    "cost": 6,
    "power": 6000,
    "counter": 2000,
    "type": [
      "Dressrosa",
      "Revolutionary Army"
    ],
    "attribute": "Special",
    "effect": "If you have 15 or more cards in your trash, give this card in your hand −3 cost. \n [Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)",
    "effectFr": "Si vous avez 15 cartes ou plus dans votre défausse, cette carte dans votre main coûte 3 de moins.\n[Bloqueur] (Après la déclaration d'attaque adverse, vous pouvez épuiser cette carte pour en faire la nouvelle cible de l'attaque.)",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/prb02-014.png",
    "metaAnalysis": "Bloqueur Noir avec Contre +2000 dont le coût passe à seulement 3 si vous avez 15 cartes ou plus dans votre défausse.",
    "isConfirmed": true
  },
  {
    "id": "prb02-002",
    "code": "PRB02-002",
    "name": "Trafalgar Law",
    "jpName": "トラファルガー・ロー",
    "set": "PRB02",
    "setName": "The Best Vol. 2 [PRB-02]",
    "category": "Character",
    "color": [
      "Red"
    ],
    "rarity": "SR",
    "isAlternateArt": false,
    "cost": 6,
    "power": 7000,
    "counter": 1000,
    "type": [
      "Punk Hazard",
      "The Seven Warlords of the Sea",
      "Heart Pirates"
    ],
    "attribute": "Slash",
    "effect": "[Once Per Turn] If this Character would be removed from the field by your opponent's effect, you may give this Character −2000 power during this turn instead. \n [When Attacking] Give up to 1 of your opponent's Characters −2000 power during this turn.",
    "effectFr": "[Une fois par tour] Si ce Personnage devait quitter le terrain à cause d'un effet adverse, vous pouvez lui infliger -2000 de puissance pendant ce tour à la place.\n[Lors d'une attaque] Donnez à jusqu'à 1 Personnage adverse -2000 de puissance pendant ce tour.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/prb02-002.png",
    "metaAnalysis": "Carte maîtresse Heart Pirates Rouge à 7000 de puissance : immunité contre le retrait adverse et affaiblissement de -2000 adverse en attaquant.",
    "isConfirmed": true
  },
  {
    "id": "prb02-010",
    "code": "PRB02-010",
    "name": "Charlotte Pudding",
    "jpName": "シャーロット・プリン",
    "set": "PRB02",
    "setName": "The Best Vol. 2 [PRB-02]",
    "category": "Character",
    "color": [
      "Purple"
    ],
    "rarity": "SR",
    "isAlternateArt": false,
    "cost": 7,
    "power": 5000,
    "counter": 1000,
    "type": [
      "Big Mom Pirates"
    ],
    "attribute": "Wisdom",
    "effect": "[On Play] DON!! −2: If your Leader has the {Big Mom Pirates} type and your opponent has 6 or more DON!! cards on their field, draw 2 cards. Then, play up to 1 {Big Mom Pirates} type Character card with 6000 to 8000 power from your hand.",
    "effectFr": "[Jouée] DON!! -2 : Si votre Leader est de type {Équipage de Big Mom} et que votre adversaire possède 6 cartes DON!! ou plus sur son terrain, piochez 2 cartes. Ensuite, jouez jusqu'à 1 carte Personnage de type {Équipage de Big Mom} ayant entre 6000 et 8000 de puissance depuis votre main.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/prb02-010.png",
    "metaAnalysis": "Support colossal pour Big Mom Pirates Violet : pioche 2 cartes et déploie gratuitement un personnage de 6000 à 8000 puissance depuis votre main.",
    "isConfirmed": true
  },
  {
    "id": "prb02-016",
    "code": "PRB02-016",
    "name": "Otama",
    "jpName": "お玉",
    "set": "PRB02",
    "setName": "The Best Vol. 2 [PRB-02]",
    "category": "Character",
    "color": [
      "Yellow"
    ],
    "rarity": "R",
    "isAlternateArt": false,
    "cost": 2,
    "power": 0,
    "counter": 2000,
    "type": [
      "Land of Wano"
    ],
    "attribute": "Special",
    "effect": "[Activate: Main] You may rest this Character and add 1 card from the top or bottom of your Life cards to your hand: Up to 1 of your Leader or Character cards gains +3000 power during this turn.",
    "effectFr": "[Activation : Principale] Vous pouvez épuiser ce Personnage et ajouter 1 carte du dessus ou du dessous de vos cartes de Vie à votre main : Jusqu'à 1 de vos cartes (Leader ou Personnage) gagne +3000 de puissance pendant ce tour.",
    "trigger": "[Trigger] Rest up to 1 of your opponent's Characters with a cost of 4 or less.",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/prb02-016.png",
    "metaAnalysis": "Contre +2000 et boost offensif Jaune massif de +3000 de puissance en reprenant une carte de Vie en main.",
    "isConfirmed": true
  },
  {
    "id": "prb02-008",
    "code": "PRB02-008",
    "name": "Marco",
    "jpName": "マルコ",
    "set": "PRB02",
    "setName": "The Best Vol. 2 [PRB-02]",
    "category": "Character",
    "color": [
      "Blue"
    ],
    "rarity": "SR",
    "isAlternateArt": false,
    "cost": 4,
    "power": 6000,
    "counter": 0,
    "type": [
      "Land of Wano",
      "Former Whitebeard Pirates"
    ],
    "attribute": "Special",
    "effect": "[Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) \n [On K.O.] Draw 2 cards.",
    "effectFr": "[Bloqueur] (Après la déclaration d'attaque adverse, vous pouvez épuiser cette carte pour en faire la nouvelle cible de l'attaque.)\n[Au K.O.] Piochez 2 cartes.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/prb02-008.png",
    "metaAnalysis": "Bloqueur Bleu légendaire à 6000 de puissance : pioche 2 cartes lors de son K.O. !",
    "isConfirmed": true
  },
  {
    "id": "prb02-001",
    "code": "PRB02-001",
    "name": "Koby",
    "jpName": "コビー",
    "set": "PRB02",
    "setName": "The Best Vol. 2 [PRB-02]",
    "category": "Character",
    "color": [
      "Red"
    ],
    "rarity": "R",
    "isAlternateArt": false,
    "cost": 4,
    "power": 5000,
    "counter": 1000,
    "type": [
      "Navy",
      "SWORD"
    ],
    "attribute": "Strike",
    "effect": "[Opponent's Turn] If your Leader has the {Navy} type, this Character gains +1000 power. \n [When Attacking] K.O. up to 1 of your opponent's Characters with 3000 base power or less. Then, if you have 6 or less cards in your hand, draw 1 card.",
    "effectFr": "[Tour adverse] Si votre Leader est de type {Marine}, ce Personnage gagne +1000 de puissance.\n[Lors d'une attaque] Mettez K.O. jusqu'à 1 Personnage adverse avec 3000 de puissance de base ou moins. Ensuite, si vous avez 6 cartes ou moins en main, piochez 1 carte.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/prb02-001.png",
    "metaAnalysis": "Attaquant Marine Rouge : gagne 6000 de puissance en défense, détruit une créature adverse jusqu'à 3000 de base et pioche si vous avez 6 cartes ou moins en main.",
    "isConfirmed": true
  },
  {
    "id": "prb02-013",
    "code": "PRB02-013",
    "name": "Gecko Moria",
    "jpName": "ゲッコー・モリア",
    "set": "PRB02",
    "setName": "The Best Vol. 2 [PRB-02]",
    "category": "Character",
    "color": [
      "Black"
    ],
    "rarity": "R",
    "isAlternateArt": false,
    "cost": 6,
    "power": 7000,
    "counter": 0,
    "type": [
      "The Seven Warlords of the Sea",
      "Thriller Bark Pirates"
    ],
    "attribute": "Special",
    "effect": "[On Play] If your Leader has the {Thriller Bark Pirates} type, play up to 1 Character card with a cost of 4 or less from your trash rested. Then, give up to 1 rested DON!! card to your Leader or 1 of your Characters.",
    "effectFr": "[Jouée] Si votre Leader est de type {Thriller Bark}, jouez jusqu'à 1 carte Personnage de coût 4 ou moins depuis votre défausse en position épuisée. Ensuite, donnez jusqu'à 1 carte DON!! épuisée à votre Leader ou à 1 de vos Personnages.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/prb02-013.png",
    "metaAnalysis": "Réanimation Thriller Bark Noire : joue un personnage de coût 4 ou moins depuis la défausse et réattribue un DON!! épuisé.",
    "isConfirmed": true
  },
  {
    "id": "prb02-011",
    "code": "PRB02-011",
    "name": "Donquixote Doflamingo",
    "jpName": "ドンキホーテ・ドフラミンゴ",
    "set": "PRB02",
    "setName": "The Best Vol. 2 [PRB-02]",
    "category": "Character",
    "color": [
      "Purple"
    ],
    "rarity": "R",
    "isAlternateArt": false,
    "cost": 5,
    "power": 6000,
    "counter": 1000,
    "type": [
      "The Seven Warlords of the Sea",
      "Donquixote Pirates"
    ],
    "attribute": "Special",
    "effect": "[Blocker] \n [On Play] If your Leader is multicolored, add up to 1 DON!! card from your DON!! deck and rest it.",
    "effectFr": "[Bloqueur]\n[Jouée] Si votre Leader est multicolore, ajoutez jusqu'à 1 carte DON!! depuis votre deck DON!! et épuisez-la.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/prb02-011.png",
    "metaAnalysis": "Bloqueur Violet à 6000 de puissance : accélère 1 carte DON!! depuis le deck DON!! si votre Leader est multicolore.",
    "isConfirmed": true
  },
  {
    "id": "prb02-018",
    "code": "PRB02-018",
    "name": "Portgas.D.Ace",
    "jpName": "ポートガス・D・エース",
    "set": "PRB02",
    "setName": "The Best Vol. 2 [PRB-02]",
    "category": "Character",
    "color": [
      "Yellow"
    ],
    "rarity": "R",
    "isAlternateArt": false,
    "cost": 5,
    "power": 7000,
    "counter": 0,
    "type": [
      "Whitebeard Pirates"
    ],
    "attribute": "Special",
    "effect": "[On Play] If you have a face-up Life card, play up to 1 [Sabo], [Portgas.D.Ace], or [Monkey.D.Luffy] with a cost of 2 from your hand or trash.",
    "effectFr": "[Jouée] Si vous avez une carte de Vie face visible, jouez jusqu'à 1 [Sabo], [Portgas.D.Ace] ou [Monkey.D.Luffy] de coût 2 depuis votre main ou votre défausse.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/prb02-018.png",
    "metaAnalysis": "Invocateur des trois frères Jaune : joue instantanément Sabo, Ace ou Luffy de coût 2 depuis la main ou la défausse.",
    "isConfirmed": true
  },
  {
    "id": "prb02-003",
    "code": "PRB02-003",
    "name": "Lucky.Roux",
    "jpName": "ラッキー・ルウ",
    "set": "PRB02",
    "setName": "The Best Vol. 2 [PRB-02]",
    "category": "Character",
    "color": [
      "Red"
    ],
    "rarity": "R",
    "isAlternateArt": false,
    "cost": 4,
    "power": 2000,
    "counter": 1000,
    "type": [
      "Red-Haired Pirates"
    ],
    "attribute": "Ranged",
    "effect": "[Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) \n [On Play] You may trash 1 Character card with 6000 power or more from your hand: Draw 2 cards.",
    "effectFr": "[Bloqueur] (Après la déclaration d'attaque adverse, vous pouvez épuiser cette carte pour en faire la nouvelle cible de l'attaque.)\n[Jouée] Vous pouvez défausser 1 carte Personnage de 6000 de puissance ou plus de votre main : Piochez 2 cartes.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/prb02-003.png",
    "metaAnalysis": "Bloqueur Rouge à 4 de coût qui recycle la main en défaussant un gros Personnage de 6000+ puissance pour piocher 2 cartes.",
    "isConfirmed": true
  },
  {
    "id": "prb02-004",
    "code": "PRB02-004",
    "name": "Jewelry Bonney",
    "jpName": "ジュエリー・ボニー",
    "set": "PRB02",
    "setName": "The Best Vol. 2 [PRB-02]",
    "category": "Character",
    "color": [
      "Green"
    ],
    "rarity": "R",
    "isAlternateArt": false,
    "cost": 3,
    "power": 3000,
    "counter": 1000,
    "type": [
      "Supernovas",
      "Bonney Pirates"
    ],
    "attribute": "Special",
    "effect": "[Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.) \n [On Your Opponent's Attack] [Once Per Turn] Set up to 1 of your DON!! cards as active.",
    "effectFr": "[Bloqueur] (Après la déclaration d'attaque adverse, vous pouvez épuiser cette carte pour en faire la nouvelle cible de l'attaque.)\n[Lors d'une attaque adverse] [Une fois par tour] Redressez jusqu'à 1 de vos cartes DON!!.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/prb02-004.png",
    "metaAnalysis": "Bloqueur Vert incontournable à 3 de coût : redresse 1 carte DON!! à chaque attaque adverse pour financer vos contres !",
    "isConfirmed": true
  },
  {
    "id": "prb02-005",
    "code": "PRB02-005",
    "name": "Monkey.D.Luffy",
    "jpName": "モンキー・D・ルフィ",
    "set": "PRB02",
    "setName": "The Best Vol. 2 [PRB-02]",
    "category": "Character",
    "color": [
      "Green"
    ],
    "rarity": "SR",
    "isAlternateArt": false,
    "cost": 4,
    "power": 5000,
    "counter": 1000,
    "type": [
      "Supernovas",
      "Straw Hat Crew"
    ],
    "attribute": "Strike",
    "effect": "[Your Turn] [On Play] If your Leader is multicolored and your opponent has 7 or less DON!! cards on their field, your opponent rests 1 of their active DON!! cards at the start of their next Main Phase.",
    "effectFr": "[Votre tour] [Jouée] Si votre Leader est multicolore et que votre adversaire a 7 cartes DON!! ou moins sur son terrain, votre adversaire épuise 1 de ses cartes DON!! actives au début de sa prochaine Phase Principale.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/prb02-005.png",
    "metaAnalysis": "Contrôle de tempo Vert pour Leaders multicolores : force l'adversaire à commencer son tour avec un DON!! épuisé !",
    "isConfirmed": true
  },
  {
    "id": "prb02-006",
    "code": "PRB02-006",
    "name": "Roronoa Zoro",
    "jpName": "ロロノア・ゾロ",
    "set": "PRB02",
    "setName": "The Best Vol. 2 [PRB-02]",
    "category": "Character",
    "color": [
      "Green"
    ],
    "rarity": "R",
    "isAlternateArt": false,
    "cost": 4,
    "power": 4000,
    "counter": 2000,
    "type": [
      "Supernovas",
      "Straw Hat Crew"
    ],
    "attribute": "Slash",
    "effect": "[Opponent's Turn] If this Character would be rested by your opponent's Character's effect, you may rest 1 of your other Characters instead. \n [Blocker]",
    "effectFr": "[Tour adverse] Si ce Personnage devait être épuisé par l'effet d'un Personnage adverse, vous pouvez épuiser 1 de vos autres Personnages à la place.\n[Bloqueur]",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/prb02-006.png",
    "metaAnalysis": "Bloqueur Vert à 4000 de puissance protégé contre les effets d'épuisement adverse en épuisant un allié à sa place.",
    "isConfirmed": true
  },
  {
    "id": "prb02-007",
    "code": "PRB02-007",
    "name": "Jinbe",
    "jpName": "ジンベエ",
    "set": "PRB02",
    "setName": "The Best Vol. 2 [PRB-02]",
    "category": "Character",
    "color": [
      "Blue"
    ],
    "rarity": "R",
    "isAlternateArt": false,
    "cost": 4,
    "power": 5000,
    "counter": 1000,
    "type": [
      "Fish-Man",
      "The Seven Warlords of the Sea",
      "The Sun Pirates"
    ],
    "attribute": "Strike",
    "effect": "[On Play] Look at 5 cards from the top of your deck; reveal up to 1 {The Seven Warlords of the Sea} type card other than [Jinbe] and add it to your hand. Then, place the rest at the bottom of your deck in any order. \n [When Attacking] Place up to 1 Character with a cost of 1 or less at the bottom of the owner's deck.",
    "effectFr": "[Jouée] Regardez les 5 cartes du dessus de votre deck ; révélez jusqu'à 1 carte de type {Sept Grands Corsaires} autre que [Jinbe] et ajoutez-la à votre main. Placez le reste sous votre deck.\n[Lors d'une attaque] Placez jusqu'à 1 Personnage de coût 1 ou moins sous le deck de son propriétaire.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/prb02-007.png",
    "metaAnalysis": "Moteur de recherche Grands Corsaires Bleu : cherche 1 carte Corsaire parmi le top 5 et renvoie un personnage de coût 1 sous le deck lors de ses attaques.",
    "isConfirmed": true
  },
  {
    "id": "prb02-012",
    "code": "PRB02-012",
    "name": "Nami",
    "jpName": "ナミ",
    "set": "PRB02",
    "setName": "The Best Vol. 2 [PRB-02]",
    "category": "Character",
    "color": [
      "Purple"
    ],
    "rarity": "R",
    "isAlternateArt": false,
    "cost": 2,
    "power": 2000,
    "counter": 1000,
    "type": [
      "Straw Hat Crew"
    ],
    "attribute": "Special",
    "effect": "[On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Straw Hat Crew} type card other than [Nami] and add it to your hand. Then, place the rest at the bottom of your deck in any order.",
    "effectFr": "[Jouée] Regardez les 5 cartes du dessus de votre deck ; révélez jusqu'à 1 carte de type {Équipage de Chapeau de paille} autre que [Nami] et ajoutez-la à votre main. Placez ensuite le reste sous votre deck dans l'ordre de votre choix.",
    "trigger": "[Trigger] Play this card.",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/prb02-012.png",
    "metaAnalysis": "Rechercheuse Straw Hat Violette indispensable : regarde les 5 cartes du dessus pour trouver une carte Équipage du Chapeau de paille.",
    "isConfirmed": true
  },
  {
    "id": "prb02-015",
    "code": "PRB02-015",
    "name": "Shiryu",
    "jpName": "シリュウ",
    "set": "PRB02",
    "setName": "The Best Vol. 2 [PRB-02]",
    "category": "Character",
    "color": [
      "Black"
    ],
    "rarity": "R",
    "isAlternateArt": false,
    "cost": 4,
    "power": 5000,
    "counter": 1000,
    "type": [
      "Blackbeard Pirates"
    ],
    "attribute": "Slash",
    "effect": "If your Leader has the {Blackbeard Pirates} type, this Character gains [Blocker] and +4 cost. \n [On K.O.] If your Leader has the {Blackbeard Pirates} type, K.O. up to 1 of your opponent's Characters with a base cost of 4 or less.",
    "effectFr": "Si votre Leader est de type {Équipage de Barbe Noire}, ce Personnage gagne [Bloqueur] et +4 en coût.\n[Au K.O.] Si votre Leader est de type {Équipage de Barbe Noire}, mettez K.O. jusqu'à 1 Personnage adverse avec un coût de base de 4 ou moins.",
    "trigger": "",
    "revealDate": "2026-08-23",
    "source": "CardKaizoku Spoilers",
    "sourceEvent": "CardKaizoku Spoilers",
    "leakStatus": "CardKaizoku",
    "imageUrl": "/reveals/prb02-015.png",
    "metaAnalysis": "Pilier défensif Barbe Noire : gagne Bloqueur et passe à coût 8, et détruit un personnage adverse de coût de base 4 au K.O.",
    "isConfirmed": true
  }
];

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    "id": "news-kaizoku-spoilers",
    "title": "Spoilers Majeurs CardKaizoku : 45 Nouvelles Cartes (EB05, OP18, PRB02)",
    "category": "Card Reveal",
    "date": "2026-09-12",
    "summary": "Mise à jour majeure de la base Spoilers & Reveals avec l'ajout complet des fuites de CardKaizoku : 21 cartes EB-05 Heroines, 6 cartes OP-18 The Dominance of God et 18 cartes PRB-02 The Best Vol. 2.",
    "content": "La base de données des Révélations s'enrichit avec les derniers spoilers officiels issus de CardKaizoku :\n\n- **EB-05 Heroines Edition Vol. 2** (21 cartes) : Doll (R), Belo Betty (C), Monet (C), Nico Robin (Leader & SR), Otohime (C), Shirley (C), Mermaid Cafe Dancers (C), Octopako (C), Osome (C), Domino (C), Speed (C), Tsuru (C), Russian (C), Shinobu (C), Ms. Monday (C), Ripley (R), Ahiru (C), Charlotte Brulee (C), Nico Olivia (C), Nojiko (R).\n- **OP-18 The Dominance of God** (6 cartes) : Franky Leader (Vert/Violet), Saint Gunko Leader & SR (Chevaliers Divins), Saint Shamrock SEC, Nico Robin SR/Manga Rare, Mini-Merry II Terrain.\n- **PRB-02 The Best Vol. 2** (18 cartes) : Koby, Trafalgar Law, Lucky Roux, Jewelry Bonney, Monkey D. Luffy, Roronoa Zoro, Jinbe, Marco, Mr. 3, Charlotte Pudding, Donquixote Doflamingo, Nami, Gecko Moria, Sabo, Shiryu, Otama, Boa Hancock, Portgas D. Ace.\n\nToutes les cartes disposent des scans HD, des effets traduits en français et des analyses de méta détaillées.",
    "tags": [
      "CardKaizoku",
      "EB05",
      "OP18",
      "PRB02",
      "Heroines",
      "The Best Vol. 2",
      "Dominance of God"
    ],
    "productCode": "EB05 / OP18 / PRB02",
    "sourceUrl": "https://www.cardkaizoku.com/spoilers",
    "imageUrl": "/reveals/eb05-banner.jpg",
    "releaseDates": {
      "japan": "Octobre - Décembre 2026",
      "global": "Janvier - Mars 2027"
    }
  },
  {
    "id": "news-topdecks-op18",
    "title": "Leaks: OPCG BOOSTER PACK -THE DOMINANCE OF GOD- [OP-18]",
    "category": "Set Announcement",
    "date": "2026-08-23",
    "summary": "Révélation complète du booster OP-18 avec Franky Leader (Normal & Alt Art), Loki SEC, Nico Robin Manga Rare, Mini-Merry et les cartes de Saint Shamrock et Saint Gunko.",
    "content": "OPCG BOOSTER PACK -THE DOMINANCE OF GOD- [OP-18] sortira en Novembre 2026.\n\nContenu Récapitulatif :\n- Leader Vert/Violet : Franky (OP18-021) version Normale et version Alternate Art (AA)\n- Secret Rare Violet : Saint Shamrock (OP18-119 SEC) version Normale et version Alternate Art (AA)\n- Leader Violet/Noir : Saint Gunko (OP18-060) version Normale et version Alternate Art (AA)\n- Personnage Violet SR : Saint Gunko (OP18-065)\n- Nico Robin (OP18-031) : Manga Comic Parallel officielle pour le set OP18\n- OP18-078 Mini-Merry II : Terrain d'attachement de DON!!",
    "tags": [
      "OP18",
      "Dominance of God",
      "Franky Alt Art",
      "Saint Gunko Alt Art",
      "Nico Robin Manga",
      "Saint Shamrock Alt Art"
    ],
    "productCode": "OP18",
    "sourceUrl": "https://onepiecetopdecks.com/leaks-opcg-booster-pack-the-dominance-of-god-op-18/",
    "imageUrl": "/reveals/op18-pack.jpg",
    "releaseDates": {
      "japan": "Novembre 2026",
      "global": "Février 2027"
    }
  },
  {
    "id": "news-topdecks-eb05",
    "title": "Leaks: ONE PIECE Heroines Edition vol.2 EB05",
    "category": "Product Launch",
    "date": "2026-08-23",
    "summary": "Sortie officielle de l'Extra Booster EB-05 annoncée avec plus de 25 cartes révélées : Leader Nico Robin (Normal & Alt Art), Nico Robin Caractère, Nami SP et les Leaders SP de Boa Hancock, Shirahoshi, Nami, Vivi, Rebecca et Bonney.",
    "content": "OPCG EXTRA BOOSTER PACK -ONE PIECE Heroines Edition vol.2- [EB-05] sortira en Octobre 2026.\n\nContenu Confirmé :\n- Leader : Nico Robin (EB05-010) Violet/Noir & Vert/Jaune version Normale et version Alternate Art (AA)\n- Personnage : Nico Robin (EB05-016)\n- Personnage : Nami (EB05-001) Spéciale SP\n- Leaders Special Parallel (SP) : Boa Hancock, Shirahoshi, Jewelry Bonney, Nami, Nefeltari Vivi, Rebecca\n- Nombreux soutiens pour l'attribut <Wisdom> (Sagesse), la Marine, les Hommes-Poissons et Baroque Works.",
    "tags": [
      "EB05",
      "Heroines Edition vol.2",
      "Nico Robin Leader",
      "Boa Hancock SP",
      "Shirahoshi SP",
      "Bonney SP",
      "Nami SP",
      "Vivi SP",
      "Rebecca SP"
    ],
    "productCode": "EB05",
    "sourceUrl": "https://onepiecetopdecks.com/leaks-one-piece-heroines-edition-vol-2-eb05/",
    "imageUrl": "/reveals/eb05-banner.jpg",
    "releaseDates": {
      "japan": "30 Octobre 2026",
      "global": "22 Janvier 2027"
    }
  }
];
