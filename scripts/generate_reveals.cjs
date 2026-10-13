const fs = require('fs');

const spoilers = JSON.parse(fs.readFileSync('scripts/spoiler_cards_kaizoku.json', 'utf8'));

function cleanText(t) {
  if (!t) return '';
  return t.replace(/<br\s*\/?>/gi, '\n').trim();
}

function frText(en) {
  if (!en || en === '-') return '-';
  let t = en
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\[Blocker\]\s*(\([^)]*\))?/g, '[Bloqueur] (Après la déclaration d\'attaque adverse, vous pouvez épuiser cette carte pour en faire la nouvelle cible de l\'attaque.)')
    .replace(/\[Rush\]/g, '[Assaut]')
    .replace(/\[Banish\]/g, '[Bannissement]')
    .replace(/\[Double Strike\]/g, '[Double Frappe]')
    .replace(/\[On Play\]/g, '[Jouée]')
    .replace(/\[When Attacking\]/g, '[Lors d\'une attaque]')
    .replace(/\[On K\.O\.\]/g, '[Au K.O.]')
    .replace(/\[On Block\]/g, '[Au Blocage]')
    .replace(/\[Activate: Main\]/g, '[Activation : Principale]')
    .replace(/\[Once Per Turn\]/g, '[Une fois par tour]')
    .replace(/\[Your Turn\]/g, '[Votre tour]')
    .replace(/\[Opponent\'s Turn\]/g, '[Tour adverse]')
    .replace(/\[On Your Opponent\'s Attack\]/g, '[Lors d\'une attaque adverse]')
    .replace(/\[Trigger\]/g, '[Déclencheur]');
  return t;
}

const eb05FrenchTranslations = {
  'EB05-002': {
    meta: 'Recherche de 5 cartes chez la Marine pour récupérer 2 cartes de coût 2 ou plus avec Counter +2000.',
    fr: '[Jouée] Regardez les 5 cartes du dessus de votre deck ; révélez jusqu\'à 2 cartes de type {Marine} de coût 2 ou plus et ajoutez-les à votre main, puis placez le reste sous votre deck dans l\'ordre de votre choix. Ensuite, défaussez 1 carte de votre main.'
  },
  'EB05-005': {
    meta: 'Support offensif Armée Révolutionnaire : booste 3 personnages de +2000 de puissance ou affaiblit un adversaire de -2000.',
    fr: '[Jouée] Jusqu\'à 3 de vos Personnages possédant à la fois le type {Armée Révolutionnaire} et un [Déclencheur] gagnent +2000 de puissance pendant ce tour.\n[Activation : Principale] Vous pouvez défausser ce Personnage : Donnez à jusqu\'à 1 Personnage adverse -2000 de puissance pendant ce tour.'
  },
  'EB05-007': {
    meta: 'Moteur de pioche Punk Hazard et corps défensif montant à 6000 de puissance pendant le tour adverse.',
    fr: '[Jouée] Vous pouvez révéler un total de 3 cartes Événement ou de type {Punk Hazard} depuis votre main : Piochez 1 carte.\n[Fin de votre tour] Ce Personnage gagne +5000 de puissance jusqu\'à la fin de la prochaine Phase de Fin de votre adversaire.'
  },
  'EB05-010': {
    meta: 'Leader révolutionnaire axé sur l\'attribut <Wisdom> (Sagesse) : regagne de la Vie lors des K.O. alliés et redresse un combattant pour une seconde attaque !',
    fr: '[Une fois par tour] Lorsqu\'un de vos Personnages ayant l\'attribut <Sagesse> et sans [Bloqueur] est mis K.O., ajoutez jusqu\'à 1 carte du dessus de votre deck au-dessus de vos cartes de Vie.\n[Activation : Principale] [Une fois par tour] Redressez jusqu\'à 1 de vos Personnages ayant l\'attribut <Sagesse> et 6000 de puissance ou moins.'
  },
  'EB05-011': {
    meta: 'Contre +2000 pour Shirahoshi et contrôle de créature adverse jusqu\'à coût 5 en retournant une carte de Vie face cachée.',
    fr: '[Jouée] Si votre Leader est [Shirahoshi], vous pouvez retourner face cachée 1 carte du dessus de vos cartes de Vie : Épuisez jusqu\'à 1 Personnage adverse de coût 5 ou moins.'
  },
  'EB05-013': {
    meta: 'Défense continue pour les Hommes-Poissons : octroie +2000 de puissance au Leader lors des attaques adverses pour 1 DON!!.',
    fr: '[Lors d\'une attaque adverse] [Une fois par tour] Vous pouvez épuiser 1 de vos cartes DON!! : Votre Leader de type {Homme-Poisson} ou {Ondin} gagne +2000 de puissance pendant ce combat.'
  },
  'EB05-016': {
    meta: 'Support majeur pour le Leader Robin : déploie un allié de coût 5 gratuitement avec attribut Sagesse et Déclencheur d\'épuisement de coût 6 adverse.',
    fr: '[Votre tour] [Jouée] Jouez jusqu\'à 1 carte Personnage de coût 5 ou moins ayant l\'attribut [Sagesse] depuis votre main.\n[Déclencheur] Épuisez jusqu\'à 1 Personnage adverse de coût 6 ou moins.'
  },
  'EB05-017': {
    meta: 'Contre +2000 et boost défensif d\'urgence de +4000 de puissance pour le Leader Homme-Poisson/Ondin.',
    fr: '[Lors d\'une attaque adverse] Vous pouvez épuiser 1 de vos cartes DON!! et défausser ce Personnage : Votre Leader de type {Homme-Poisson} ou {Ondin} gagne +4000 de puissance pendant ce combat.'
  },
  'EB05-022': {
    meta: 'Pioche 2 cartes lors de son K.O. pour seulement 1 coût.',
    fr: '[Au K.O.] Piochez 2 cartes.'
  },
  'EB05-023': {
    meta: 'Contre +2000 et moteur de filtrage : défausse 2 Événements pour piocher 3 cartes.',
    fr: '[Jouée] Vous pouvez défausser 2 cartes Événement de votre main : Piochez 3 cartes.'
  },
  'EB05-025': {
    meta: 'Contre +2000 et recyclage en fond de deck lors du K.O.',
    fr: '[Au K.O.] Placez jusqu\'à 1 Personnage avec l\'attribut <Sagesse> depuis votre défausse sous le deck de son propriétaire.'
  },
  'EB05-035': {
    meta: 'Moteur d\'essaim SMILE : cherche 2 cartes SMILE et en déploie jusqu\'à 2 avec 5000 de puissance ou moins.',
    fr: '[Jouée] DON!! -1 : Regardez les 5 cartes du dessus de votre deck ; révélez jusqu\'à 2 cartes de type {SMILE} et ajoutez-les à votre main, puis placez le reste sous votre deck. Ensuite, jouez jusqu\'à 2 cartes Personnage de type {SMILE} ayant 5000 de puissance ou moins depuis votre main.'
  },
  'EB05-036': {
    meta: 'Support Navy Violet : pioche 1 carte et accélère 1 DON!! épuisé si le Leader est de type Marine.',
    fr: '[Jouée] Si votre Leader est de type {Marine}, piochez 1 carte et ajoutez jusqu\'à 1 carte DON!! épuisée depuis votre deck DON!!.'
  },
  'EB05-038': {
    meta: 'Contre +2000 et boost d\'attaque de +3000 de puissance pour Señor Pink.',
    fr: '[Jouée] Jusqu\'à 1 de vos cartes [Senor Pink] gagne +3000 de puissance pendant ce tour.'
  },
  'EB05-042': {
    meta: 'Contre +2000 et recyclage de main Wano : pioche 2 cartes et défausse 2 cartes.',
    fr: '[Jouée] Piochez 2 cartes et défaussez 2 cartes de votre main.'
  },
  'EB05-045': {
    meta: 'Moteur de recherche Baroque Works sur K.O. et sacrifice d\'allié.',
    fr: '[Jouée] Mettez K.O. jusqu\'à 1 de vos Personnages ayant un type incluant "Baroque Works".\n[Au K.O.] Regardez les 3 cartes du dessus de votre deck ; révélez jusqu\'à 1 carte de type incluant "Baroque Works" et ajoutez-la à votre main. Défaussez le reste.'
  },
  'EB05-047': {
    meta: 'Gagne un coût massif de +12 (devenant coût 14) et réanime une créature de coût 2 ou moins depuis la défausse.',
    fr: 'Ce Personnage gagne +12 en coût.\n[Jouée] Vous pouvez défausser 1 carte de votre main : Jouez jusqu\'à 1 carte Personnage de coût 2 ou moins depuis votre défausse.'
  },
  'EB05-051': {
    meta: 'Contrôle Jaune Révolutionnaire : épuise un personnage adverse et se joue directement sur Déclencheur !',
    fr: '[Jouée] Épuisez jusqu\'à 1 Personnage adverse de coût inférieur ou égal au total des cartes de Vie combinées des deux joueurs.\n[Déclencheur] Jouez cette carte.'
  },
  'EB05-054': {
    meta: 'Contre +2000 et Déclencheur permettant de jouer la carte directement depuis la Vie.',
    fr: '[Déclencheur] Jouez cette carte.'
  },
  'EB05-056': {
    meta: 'Contre +2000 Ohara et pioche de 2 cartes pour le Leader Nico Robin en défaussant une carte à Déclencheur.',
    fr: '[Jouée] Vous pouvez défausser 1 carte avec un [Déclencheur] de votre main : Si votre Leader est [Nico Robin], piochez 2 cartes.\n[Déclencheur] Jouez cette carte.'
  },
  'EB05-057': {
    meta: 'Contre +2000 East Blue et redistribution de DON!! épuisés à chaque tour pour les cartes Sagesse/Spécial.',
    fr: '[Activation : Principale] [Une fois par tour] Donnez jusqu\'à 1 carte DON!! épuisée à 1 de vos cartes (Leader ou Personnage) ayant l\'attribut <Spécial> ou <Sagesse>.'
  }
};

const eb05Cards = spoilers.EB05.map(c => {
  const custom = eb05FrenchTranslations[c.cardNumber] || {};
  const isLeader = c.cardType === 'LEADER';
  return {
    id: c.cardNumber.toLowerCase(),
    code: c.cardNumber,
    name: c.cardName + (isLeader ? ' (Leader)' : ''),
    jpName: c.jp_cardName || undefined,
    set: 'EB05',
    setName: 'Heroines Edition Vol.2 [EB-05]',
    category: isLeader ? 'Leader' : (c.cardType === 'STAGE' ? 'Stage' : (c.cardType === 'EVENT' ? 'Event' : 'Character')),
    color: c.color ? c.color.split('/') : ['Colorless'],
    rarity: c.rarity,
    isAlternateArt: false,
    cost: c.cost ? parseInt(c.cost) : (isLeader ? null : 0),
    power: c.power ? parseInt(c.power) : (isLeader ? 5000 : null),
    life: isLeader ? 4 : undefined,
    counter: c.counter ? parseInt(c.counter) : 0,
    type: c.feature ? c.feature.split('/') : [],
    attribute: c.attribute || undefined,
    effect: cleanText(c.text),
    effectFr: custom.fr || frText(c.text),
    trigger: c.trigger ? cleanText(c.trigger) : '',
    revealDate: '2026-08-23',
    source: 'CardKaizoku Spoilers',
    sourceEvent: 'CardKaizoku Spoilers',
    leakStatus: 'CardKaizoku',
    imageUrl: '/reveals/' + c.cardNumber.toLowerCase() + '.png',
    metaAnalysis: custom.meta || 'Carte officielle révélée dans l\'Extra Booster EB-05 Heroines Edition Vol.2.',
    isConfirmed: true
  };
});

const prb02FrenchTranslations = {
  'PRB02-001': {
    meta: 'Attaquant Marine Rouge : gagne 6000 de puissance en défense, détruit une créature adverse jusqu\'à 3000 de base et pioche si vous avez 6 cartes ou moins en main.',
    fr: '[Tour adverse] Si votre Leader est de type {Marine}, ce Personnage gagne +1000 de puissance.\n[Lors d\'une attaque] Mettez K.O. jusqu\'à 1 Personnage adverse avec 3000 de puissance de base ou moins. Ensuite, si vous avez 6 cartes ou moins en main, piochez 1 carte.'
  },
  'PRB02-002': {
    meta: 'Carte maîtresse Heart Pirates Rouge à 7000 de puissance : immunité contre le retrait adverse et affaiblissement de -2000 adverse en attaquant.',
    fr: '[Une fois par tour] Si ce Personnage devait quitter le terrain à cause d\'un effet adverse, vous pouvez lui infliger -2000 de puissance pendant ce tour à la place.\n[Lors d\'une attaque] Donnez à jusqu\'à 1 Personnage adverse -2000 de puissance pendant ce tour.'
  },
  'PRB02-003': {
    meta: 'Bloqueur Rouge à 4 de coût qui recycle la main en défaussant un gros Personnage de 6000+ puissance pour piocher 2 cartes.',
    fr: '[Bloqueur] (Après la déclaration d\'attaque adverse, vous pouvez épuiser cette carte pour en faire la nouvelle cible de l\'attaque.)\n[Jouée] Vous pouvez défausser 1 carte Personnage de 6000 de puissance ou plus de votre main : Piochez 2 cartes.'
  },
  'PRB02-004': {
    meta: 'Bloqueur Vert incontournable à 3 de coût : redresse 1 carte DON!! à chaque attaque adverse pour financer vos contres !',
    fr: '[Bloqueur] (Après la déclaration d\'attaque adverse, vous pouvez épuiser cette carte pour en faire la nouvelle cible de l\'attaque.)\n[Lors d\'une attaque adverse] [Une fois par tour] Redressez jusqu\'à 1 de vos cartes DON!!.'
  },
  'PRB02-005': {
    meta: 'Contrôle de tempo Vert pour Leaders multicolores : force l\'adversaire à commencer son tour avec un DON!! épuisé !',
    fr: '[Votre tour] [Jouée] Si votre Leader est multicolore et que votre adversaire a 7 cartes DON!! ou moins sur son terrain, votre adversaire épuise 1 de ses cartes DON!! actives au début de sa prochaine Phase Principale.'
  },
  'PRB02-006': {
    meta: 'Bloqueur Vert à 4000 de puissance protégé contre les effets d\'épuisement adverse en épuisant un allié à sa place.',
    fr: '[Tour adverse] Si ce Personnage devait être épuisé par l\'effet d\'un Personnage adverse, vous pouvez épuiser 1 de vos autres Personnages à la place.\n[Bloqueur]'
  },
  'PRB02-007': {
    meta: 'Moteur de recherche Grands Corsaires Bleu : cherche 1 carte Corsaire parmi le top 5 et renvoie un personnage de coût 1 sous le deck lors de ses attaques.',
    fr: '[Jouée] Regardez les 5 cartes du dessus de votre deck ; révélez jusqu\'à 1 carte de type {Sept Grands Corsaires} autre que [Jinbe] et ajoutez-la à votre main. Placez le reste sous votre deck.\n[Lors d\'une attaque] Placez jusqu\'à 1 Personnage de coût 1 ou moins sous le deck de son propriétaire.'
  },
  'PRB02-008': {
    meta: 'Bloqueur Bleu légendaire à 6000 de puissance : pioche 2 cartes lors de son K.O. !',
    fr: '[Bloqueur] (Après la déclaration d\'attaque adverse, vous pouvez épuiser cette carte pour en faire la nouvelle cible de l\'attaque.)\n[Au K.O.] Piochez 2 cartes.'
  },
  'PRB02-009': {
    meta: 'Bloqueur Bleu à 2 de coût qui permet de piocher 2 cartes s\'il est épuisé par un effet adverse.',
    fr: 'Cet effet peut être activé lorsque ce Personnage est épuisé par un effet adverse. Vous pouvez défausser ce Personnage et piocher 2 cartes.\n[Bloqueur]'
  },
  'PRB02-010': {
    meta: 'Support colossal pour Big Mom Pirates Violet : pioche 2 cartes et déploie gratuitement un personnage de 6000 à 8000 puissance depuis votre main.',
    fr: '[Jouée] DON!! -2 : Si votre Leader est de type {Équipage de Big Mom} et que votre adversaire possède 6 cartes DON!! ou plus sur son terrain, piochez 2 cartes. Ensuite, jouez jusqu\'à 1 carte Personnage de type {Équipage de Big Mom} ayant entre 6000 et 8000 de puissance depuis votre main.'
  },
  'PRB02-011': {
    meta: 'Bloqueur Violet à 6000 de puissance : accélère 1 carte DON!! depuis le deck DON!! si votre Leader est multicolore.',
    fr: '[Bloqueur]\n[Jouée] Si votre Leader est multicolore, ajoutez jusqu\'à 1 carte DON!! depuis votre deck DON!! et épuisez-la.'
  },
  'PRB02-012': {
    meta: 'Rechercheuse Straw Hat Violette indispensable : regarde les 5 cartes du dessus pour trouver une carte Équipage du Chapeau de paille.',
    fr: '[Jouée] Regardez les 5 cartes du dessus de votre deck ; révélez jusqu\'à 1 carte de type {Équipage de Chapeau de paille} autre que [Nami] et ajoutez-la à votre main. Placez ensuite le reste sous votre deck dans l\'ordre de votre choix.'
  },
  'PRB02-013': {
    meta: 'Réanimation Thriller Bark Noire : joue un personnage de coût 4 ou moins depuis la défausse et réattribue un DON!! épuisé.',
    fr: '[Jouée] Si votre Leader est de type {Thriller Bark}, jouez jusqu\'à 1 carte Personnage de coût 4 ou moins depuis votre défausse en position épuisée. Ensuite, donnez jusqu\'à 1 carte DON!! épuisée à votre Leader ou à 1 de vos Personnages.'
  },
  'PRB02-014': {
    meta: 'Bloqueur Noir avec Contre +2000 dont le coût passe à seulement 3 si vous avez 15 cartes ou plus dans votre défausse.',
    fr: 'Si vous avez 15 cartes ou plus dans votre défausse, cette carte dans votre main coûte 3 de moins.\n[Bloqueur] (Après la déclaration d\'attaque adverse, vous pouvez épuiser cette carte pour en faire la nouvelle cible de l\'attaque.)'
  },
  'PRB02-015': {
    meta: 'Pilier défensif Barbe Noire : gagne Bloqueur et passe à coût 8, et détruit un personnage adverse de coût de base 4 au K.O.',
    fr: 'Si votre Leader est de type {Équipage de Barbe Noire}, ce Personnage gagne [Bloqueur] et +4 en coût.\n[Au K.O.] Si votre Leader est de type {Équipage de Barbe Noire}, mettez K.O. jusqu\'à 1 Personnage adverse avec un coût de base de 4 ou moins.'
  },
  'PRB02-016': {
    meta: 'Contre +2000 et boost offensif Jaune massif de +3000 de puissance en reprenant une carte de Vie en main.',
    fr: '[Activation : Principale] Vous pouvez épuiser ce Personnage et ajouter 1 carte du dessus ou du dessous de vos cartes de Vie à votre main : Jusqu\'à 1 de vos cartes (Leader ou Personnage) gagne +3000 de puissance pendant ce tour.'
  },
  'PRB02-017': {
    meta: 'Contrôle total Jaune SR à 7000 de puissance : empêche le Leader adverse ou un combattant d\'attaquer, et détruit une créature de coût 4 sur Déclencheur !',
    fr: '[Jouée] Vous pouvez défausser 1 carte avec un [Déclencheur] de votre main : Le Leader adverse épuisé ou jusqu\'à 1 Personnage adverse autre que [Monkey.D.Luffy] ne peut pas attaquer jusqu\'à la fin de la prochaine Phase de Fin adverse.\n[Déclencheur] Mettez K.O. jusqu\'à 1 Personnage adverse de coût 4 ou moins.'
  },
  'PRB02-018': {
    meta: 'Invocateur des trois frères Jaune : joue instantanément Sabo, Ace ou Luffy de coût 2 depuis la main ou la défausse.',
    fr: '[Jouée] Si vous avez une carte de Vie face visible, jouez jusqu\'à 1 [Sabo], [Portgas.D.Ace] ou [Monkey.D.Luffy] de coût 2 depuis votre main ou votre défausse.'
  }
};

const prb02Cards = spoilers.PRB02.map(c => {
  const custom = prb02FrenchTranslations[c.cardNumber] || {};
  return {
    id: c.cardNumber.toLowerCase(),
    code: c.cardNumber,
    name: c.cardName,
    jpName: c.jp_cardName || undefined,
    set: 'PRB02',
    setName: 'The Best Vol. 2 [PRB-02]',
    category: 'Character',
    color: c.color ? c.color.split('/') : ['Colorless'],
    rarity: c.rarity,
    isAlternateArt: false,
    cost: c.cost ? parseInt(c.cost) : 0,
    power: c.power ? parseInt(c.power) : null,
    counter: c.counter ? parseInt(c.counter) : 0,
    type: c.feature ? c.feature.split('/') : [],
    attribute: c.attribute || undefined,
    effect: cleanText(c.text),
    effectFr: custom.fr || frText(c.text),
    trigger: c.trigger ? cleanText(c.trigger) : '',
    revealDate: '2026-08-23',
    source: 'CardKaizoku Spoilers',
    sourceEvent: 'CardKaizoku Spoilers',
    leakStatus: 'CardKaizoku',
    imageUrl: '/reveals/' + c.cardNumber.toLowerCase() + '.png',
    metaAnalysis: custom.meta || 'Carte officielle révélée pour le booster The Best Vol. 2 (PRB-02).',
    isConfirmed: true
  };
});

fs.writeFileSync('scripts/generated_cards.json', JSON.stringify({
  eb05Cards,
  prb02Cards
}, null, 2));

console.log('Generated cards JSON successfully. EB05:', eb05Cards.length, 'PRB02:', prb02Cards.length);
