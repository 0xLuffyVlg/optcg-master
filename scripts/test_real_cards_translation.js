import fs from 'fs';

// Let's create a robust vocabulary and sentence replacement dictionary for OPTCG
function buildTranslator() {
  const minus = '[-−]'; // ASCII hyphen or unicode minus

  const keywordMap = [
    [/\[On Play\]/gi, '[À l\'entrée en jeu]'],
    [/\[When Attacking\]/gi, '[Lors d\'une attaque]'],
    [/\[On Your Opponent\'s Attack\]/gi, '[Lors d\'une attaque adverse]'],
    [/\[Activate: Main\]/gi, '[Activer : Principal]'],
    [/\[Activate: Main \/ Counter\]/gi, '[Activer : Principal / Contre]'],
    [/\[Main\]/gi, '[Principal]'],
    [/\[Counter\]/gi, '[Contre]'],
    [/\[Trigger\]/gi, '[Déclencheur]'],
    [/\[Blocker\]/gi, '[Bloqueur]'],
    [/\[Rush\]/gi, '[Charge]'],
    [/\[Double Attack\]/gi, '[Double Attaque]'],
    [/\[Banish\]/gi, '[Bannissement]'],
    [/\[Once Per Turn\]/gi, '[Une fois par tour]'],
    [/\[End of Your Turn\]/gi, '[Fin de votre tour]'],
    [/\[Your Turn\]/gi, '[Votre tour]'],
    [/\[Opponent\'s Turn\]/gi, '[Tour adverse]'],
    [/\[On K\.O\.\]/gi, '[Lors d\'un K.O.]'],
    [/\[On Block\]/gi, '[Lors d\'un blocage]'],
    [/\[End of Turn\]/gi, '[Fin du tour]']
  ];

  const phraseMap = [
    // Reminder text
    [/\(After your opponent declares an attack, you may rest this card to make it the new target of the attack\.\)/gi,
     '(Après que votre adversaire a déclaré une attaque, vous pouvez incliner cette carte pour en faire la nouvelle cible de l\'attaque.)'],
    [/\(This card can attack on the turn in which it is played\.\)/gi,
     '(Cette carte peut attaquer le tour où elle est jouée.)'],
    [/\(This card cannot be K\.O\.'d in battle by [^)]+\)/gi,
     '(Cette carte ne peut pas être mise K.O. en combat)'],

    // Give rested DON!!
    [/Give up to (\d+) rested DON!! cards? to your Leader or (\d+) of your Characters\./gi,
     'Attachez jusqu\'à $1 carte(s) DON!! inclinée(s) à votre Leader ou $2 de vos Personnages.'],
    [/Give up to (\d+) rested DON!! cards? to your Leader or Character cards?\./gi,
     'Attachez jusqu\'à $1 carte(s) DON!! inclinée(s) à votre Leader ou l\'un de vos Personnages.'],

    // Deck look & add
    [/Look at (\d+) cards from the top of your deck;?\s*reveal up to (\d+) ([^.]+?) and add (?:it|them) to your hand\.\s*Then,?\s*place the rest at the bottom of your deck in any order\./gi,
     'Regardez les $1 cartes du dessus de votre deck ; révélez jusqu\'à $2 $3 et ajoutez-la à votre main. Ensuite, placez le reste en dessous de votre deck dans l\'ordre de votre choix.'],
    [/Look at (\d+) cards from the top of your deck and play up to (\d+) ([^.]+?)\.\s*Then,?\s*place the rest at the bottom of your deck in any order\./gi,
     'Regardez les $1 cartes du dessus de votre deck et jouez jusqu\'à $2 $3. Ensuite, placez le reste en dessous de votre deck dans l\'ordre de votre choix.'],
    [/place the rest at the bottom of your deck in any order\./gi,
     'placez le reste en dessous de votre deck dans l\'ordre de votre choix.'],

    // Draw & Trash
    [/Draw (\d+) cards? and trash (\d+) cards? from your hand\./gi, 'Piochez $1 carte(s) et défaussez $2 carte(s) de votre main.'],
    [/Draw (\d+) cards?\./gi, 'Piochez $1 carte(s).'],
    [/You may trash (\d+) cards? from your hand:?/gi, 'Vous pouvez défausser $1 carte(s) de votre main :'],
    [/Trash (\d+) cards? from your hand:?/gi, 'Défaussez $1 carte(s) de votre main :'],
    [/Trash (\d+) cards? from your hand\./gi, 'Défaussez $1 carte(s) de votre main.'],

    // Power Modifiers with unicode minus or plus
    [new RegExp(`Give up to (\\d+) of your opponent's Characters ([+${minus}]\\d+) power during this turn\\.`, 'gi'),
     'Donnez à jusqu\'à $1 Personnage(s) adverse(s) $2 de puissance pendant ce tour.'],
    [new RegExp(`Give up to (\\d+) of your opponent's Leader or Character cards ([+${minus}]\\d+) power during this turn\\.`, 'gi'),
     'Donnez à jusqu\'à $1 carte(s) Leader ou Personnage adverse $2 de puissance pendant ce tour.'],
    [new RegExp(`Give up to (\\d+) of your Leader or Character cards ([+${minus}]\\d+) power during this turn\\.`, 'gi'),
     'Donnez à jusqu\'à $1 de vos cartes Leader ou Personnage $2 de puissance pendant ce tour.'],
    [new RegExp(`Your Leader or (\\d+) of your Characters gains ([+${minus}]\\d+) power during this battle\\.`, 'gi'),
     'Votre Leader ou $1 de vos Personnages gagne $2 de puissance pendant ce combat.'],
    [new RegExp(`Your Leader or (\\d+) of your Characters gains ([+${minus}]\\d+) power during this turn\\.`, 'gi'),
     'Votre Leader ou $1 de vos Personnages gagne $2 de puissance pendant ce tour.'],
    [new RegExp(`this Leader gains ([+${minus}]\\d+) power until the start of your next turn\\.`, 'gi'),
     'ce Leader gagne $1 de puissance jusqu\'au début de votre prochain tour.'],
    [new RegExp(`this Character gains ([+${minus}]\\d+) power during this turn\\.`, 'gi'),
     'ce Personnage gagne $1 de puissance pendant ce tour.'],
    [new RegExp(`this Character gains ([+${minus}]\\d+) power during this battle\\.`, 'gi'),
     'ce Personnage gagne $1 de puissance pendant ce combat.'],

    // K.O. & Removal
    [/K\.O\. up to (\d+) of your opponent's Characters with a cost of (\d+) or less\./gi,
     'Mettez K.O. jusqu\'à $1 Personnage(s) adverse(s) d\'un coût de $2 ou moins.'],
    [/K\.O\. up to (\d+) of your opponent's Characters with (\d+) or less power\./gi,
     'Mettez K.O. jusqu\'à $1 Personnage(s) adverse(s) de $2 de puissance ou moins.'],
    [/K\.O\. up to (\d+) of your opponent's Characters with (\d+) base power or less\./gi,
     'Mettez K.O. jusqu\'à $1 Personnage(s) adverse(s) de $2 de puissance de base ou moins.'],
    [/K\.O\. up to (\d+) of your opponent's Characters\./gi,
     'Mettez K.O. jusqu\'à $1 Personnage(s) adverse(s).'],
    [/Place up to (\d+) of your opponent's Characters at the bottom of the owner's deck\./gi,
     'Placez jusqu\'à $1 Personnage(s) adverse(s) en dessous du deck de son propriétaire.'],
    [/Return up to (\d+) of your opponent's Characters to the owner's hand\./gi,
     'Renvoyez jusqu\'à $1 Personnage(s) adverse(s) dans la main de son propriétaire.'],

    // Rest & Active
    [/Rest up to (\d+) of your opponent's Characters with a cost of (\d+) or less\./gi,
     'Inclinez jusqu\'à $1 Personnage(s) adverse(s) d\'un coût de $2 ou moins.'],
    [/Rest up to (\d+) of your opponent's Characters\./gi,
     'Inclinez jusqu\'à $1 Personnage(s) adverse(s).'],
    [/Set this Character as active\./gi, 'Passez ce Personnage en actif.'],
    [/Set up to (\d+) of your DON!! cards as active\./gi, 'Passez jusqu\'à $1 de vos cartes DON!! en active(s).'],
    [/Set this Leader as active\./gi, 'Passez ce Leader en actif.'],

    // Playing Cards
    [/Play up to (\d+) Character card with a cost of (\d+) or less from your hand\./gi,
     'Jouez depuis votre main jusqu\'à $1 carte(s) Personnage d\'un coût de $2 ou moins.'],
    [/Play up to (\d+) Character card from your trash\./gi,
     'Jouez depuis votre défausse jusqu\'à $1 carte(s) Personnage.'],

    // Life manipulation
    [/Add up to (\d+) card from the top of your deck to the top of your Life cards\./gi,
     'Ajoutez jusqu\'à $1 carte du dessus de votre deck au-dessus de vos cartes de Vie.'],
    [/If your opponent has (\d+) or (?:fewer|less) Life cards,?/gi, 'Si votre adversaire a $1 cartes de Vie ou moins,'],
    [/If you have (\d+) or fewer Life cards,?/gi, 'Si vous avez $1 cartes de Vie ou moins,'],
    [/If you have (\d+) or more Life cards,?/gi, 'Si vous avez $1 cartes de Vie ou plus,'],
    [/Take (\d+) card from the top of your Life cards and add it to your hand\./gi,
     'Prenez $1 carte du dessus de vos cartes de Vie et ajoutez-la à votre main.'],

    // Conditions
    [/If your Leader has the {([^}]+)} or {([^}]+)} type,?/gi, 'Si votre Leader possède le type {$1} ou {$2},'],
    [/If your Leader has the {([^}]+)} type,?/gi, 'Si votre Leader possède le type {$1},'],
    [/If you have a {([^}]+)} type Character with a cost of (\d+) or more,?/gi,
     'Si vous avez un Personnage de type {$1} d\'un coût de $2 ou plus,'],
    [/If you have a {([^}]+)} type Character,?/gi, 'Si vous avez un Personnage de type {$1},'],
    [/You may rest this Leader:?/gi, 'Vous pouvez incliner ce Leader :'],
    [/You may rest this Character:?/gi, 'Vous pouvez incliner ce Personnage :'],
    [/You may rest this card/gi, 'Vous pouvez incliner cette carte'],
    [/You may return (\d+) DON!! card from your field to your DON!! deck:?/gi,
     'Vous pouvez renvoyer $1 carte DON!! de votre terrain vers votre deck DON!! :'],
    [/DON!! -(\d+):?/gi, 'DON!! -$1 :'],
    [/during this turn/gi, 'pendant ce tour'],
    [/during this battle/gi, 'pendant ce combat']
  ];

  return function translate(text) {
    if (!text) return text;
    let res = text;
    for (const [r, s] of keywordMap) {
      res = res.replace(r, s);
    }
    for (const [r, s] of phraseMap) {
      res = res.replace(r, s);
    }
    return res;
  };
}

const translate = buildTranslator();
const cards = JSON.parse(fs.readFileSync('src/data/cards.json', 'utf8'));

for (const code of ['EB01-001', 'EB01-002', 'EB01-003', 'EB01-006', 'EB01-009']) {
  const c = cards.find(x => x.card_code === code);
  console.log(`\n=== ${code} (${c.name}) ===`);
  console.log("ORIGINAL:", c.effect);
  console.log("TRANSLATED:", translate(c.effect));
}
