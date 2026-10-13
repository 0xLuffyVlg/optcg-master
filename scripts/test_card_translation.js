function translateCardEffect(englishEffect, targetLang = 'FR') {
  if (!englishEffect || targetLang === 'EN') {
    return englishEffect || '';
  }

  let text = englishEffect;

  const keywordReplacements = [
    [/\[On Play\]/gi, '[À l\'entrée en jeu]'],
    [/\[When Attacking\]/gi, '[Lors d\'une attaque]'],
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
    [/\[Opponent's Turn\]/gi, '[Tour adverse]'],
    [/\[On K\.O\.\]/gi, '[Lors d\'un K.O.]'],
    [/\[On Block\]/gi, '[Lors d\'un blocage]'],
    [/\[End of Turn\]/gi, '[Fin du tour]']
  ];

  for (const [regex, replacement] of keywordReplacements) {
    text = text.replace(regex, replacement);
  }

  const phraseReplacements = [
    [/Look at (\d+) cards from the top of your deck;?\s*reveal up to (\d+) ([^.]+?) and add (?:it|them) to your hand\.\s*Then,?\s*place the rest at the bottom of your deck in any order\./gi,
     'Regardez les $1 cartes du dessus de votre deck ; révélez jusqu\'à $2 $3 et ajoutez-la à votre main. Ensuite, placez le reste en dessous de votre deck dans l\'ordre de votre choix.'],
    
    [/Look at (\d+) cards from the top of your deck;?\s*reveal up to (\d+) ([^.]+?) and add (?:it|them) to your hand\./gi,
     'Regardez les $1 cartes du dessus de votre deck ; révélez jusqu\'à $2 $3 et ajoutez-la à votre main.'],

    [/place the rest at the bottom of your deck in any order\./gi,
     'placez le reste en dessous de votre deck dans l\'ordre de votre choix.'],

    [/Draw (\d+) cards?\./gi, 'Piochez $1 carte(s).'],
    [/Draw (\d+) cards? and trash (\d+) cards? from your hand\./gi, 'Piochez $1 carte(s) et défaussez $2 carte(s) de votre main.'],
    [/Trash (\d+) cards? from your hand:?/gi, 'Défaussez $1 carte(s) de votre main :'],
    [/Trash (\d+) cards? from your hand\./gi, 'Défaussez $1 carte(s) de votre main.'],

    [/Give up to (\d+) of your opponent's Characters ([+-]\d+) power during this turn\./gi,
     'Donnez à jusqu\'à $1 Personnage(s) adverse(s) $2 de puissance pendant ce tour.'],
    [/Give up to (\d+) of your Leader or Character cards ([+-]\d+) power during this turn\./gi,
     'Donnez à jusqu\'à $1 de vos cartes Leader ou Personnage $2 de puissance pendant ce tour.'],
    [/Your Leader or (\d+) of your Characters gains ([+-]\d+) power during this battle\./gi,
     'Votre Leader ou $1 de vos Personnages gagne $2 de puissance pendant ce combat.'],
    [/Your Leader or (\d+) of your Characters gains ([+-]\d+) power during this turn\./gi,
     'Votre Leader ou $1 de vos Personnages gagne $2 de puissance pendant ce tour.'],
    [/This Character gains ([+-]\d+) power during this turn\./gi,
     'Ce Personnage gagne $1 de puissance pendant ce tour.'],
    [/This Character gains ([+-]\d+) power during this battle\./gi,
     'Ce Personnage gagne $1 de puissance pendant ce combat.'],

    [/K\.O\. up to (\d+) of your opponent's Characters with a cost of (\d+) or less\./gi,
     'Mettez K.O. jusqu\'à $1 Personnage(s) adverse(s) d\'un coût de $2 ou moins.'],
    [/K\.O\. up to (\d+) of your opponent's Characters with (\d+) or less power\./gi,
     'Mettez K.O. jusqu\'à $1 Personnage(s) adverse(s) de $2 de puissance ou moins.'],
    [/K\.O\. up to (\d+) of your opponent's Characters\./gi,
     'Mettez K.O. jusqu\'à $1 Personnage(s) adverse(s).'],
    [/Place up to (\d+) of your opponent's Characters at the bottom of the owner's deck\./gi,
     'Placez jusqu\'à $1 Personnage(s) adverse(s) en dessous du deck de son propriétaire.'],

    [/Rest up to (\d+) of your opponent's Characters with a cost of (\d+) or less\./gi,
     'Inclinez jusqu\'à $1 Personnage(s) adverse(s) d\'un coût de $2 ou moins.'],
    [/Rest up to (\d+) of your opponent's Characters\./gi,
     'Inclinez jusqu\'à $1 Personnage(s) adverse(s).'],
    [/Set this Character as active\./gi, 'Passez ce Personnage en actif.'],
    [/Set up to (\d+) of your DON!! cards as active\./gi, 'Passez jusqu\'à $1 de vos cartes DON!! en active(s).'],
    [/Set this Leader as active\./gi, 'Passez ce Leader en actif.'],

    [/Play up to (\d+) Character card with a cost of (\d+) or less from your hand\./gi,
     'Jouez depuis votre main jusqu\'à $1 carte(s) Personnage d\'un coût de $2 ou moins.'],
    [/Play up to (\d+) Character card from your trash\./gi,
     'Jouez depuis votre défausse jusqu\'à $1 carte(s) Personnage.'],

    [/Add up to (\d+) card from the top of your deck to the top of your Life cards\./gi,
     'Ajoutez jusqu\'à $1 carte du dessus de votre deck au-dessus de vos cartes de Vie.'],
    [/If you have (\d+) or fewer Life cards,?/gi, 'Si vous avez $1 cartes de Vie ou moins,'],
    [/If you have (\d+) or more Life cards,?/gi, 'Si vous avez $1 cartes de Vie ou plus,'],
    [/Take (\d+) card from the top of your Life cards and add it to your hand\./gi,
     'Prenez $1 carte du dessus de vos cartes de Vie et ajoutez-la à votre main.'],

    [/If your Leader has the {([^}]+)} type,?/gi, 'Si votre Leader possède le type {$1},'],
    [/If you have a {([^}]+)} type Character,?/gi, 'Si vous avez un Personnage de type {$1},'],
    [/You may rest this Leader:?/gi, 'Vous pouvez incliner ce Leader :'],
    [/You may rest this Character:?/gi, 'Vous pouvez incliner ce Personnage :'],
    [/You may return (\d+) DON!! card from your field to your DON!! deck:?/gi,
     'Vous pouvez renvoyer $1 carte DON!! de votre terrain vers votre deck DON!! :'],
    [/DON!! -(\d+):?/gi, 'DON!! -$1 :']
  ];

  for (const [regex, replacement] of phraseReplacements) {
    text = text.replace(regex, replacement);
  }

  return text;
}

const sample1 = "[On Play] Look at 5 cards from the top of your deck; reveal up to 1 {Straw Hat Crew} type card and add it to your hand. Then, place the rest at the bottom of your deck in any order.";
const sample2 = "[DON!! x1] [When Attacking] Give up to 1 of your opponent's Characters -2000 power during this turn.";
const sample3 = "[Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)";
const sample4 = "[Activate: Main] [Once Per Turn] Draw 1 card and trash 1 card from your hand.";
const sample5 = "[Trigger] K.O. up to 1 of your opponent's Characters with a cost of 4 or less.";

console.log("English 1:", sample1);
console.log("French 1 :", translateCardEffect(sample1, 'FR'));

console.log("\nEnglish 2:", sample2);
console.log("French 2 :", translateCardEffect(sample2, 'FR'));

console.log("\nEnglish 3:", sample3);
console.log("French 3 :", translateCardEffect(sample3, 'FR'));

console.log("\nEnglish 4:", sample4);
console.log("French 4 :", translateCardEffect(sample4, 'FR'));

console.log("\nEnglish 5:", sample5);
console.log("French 5 :", translateCardEffect(sample5, 'FR'));
