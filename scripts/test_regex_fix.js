const testStr = "this Leader gains +1000 power until the start of your next turn.";
const regex1 = /this Leader gains ([+\-−]\d+) power until the start of your next turn\./gi;
console.log("Match test 1:", testStr.replace(regex1, 'ce Leader gagne $1 de puissance jusqu\'au début de votre prochain tour.'));

const testStr2 = "Give up to 1 of your opponent's Characters −3000 power during this turn.";
const regex2 = /give up to (\d+) of your opponent's Characters ([+\-−]\d+) power during this turn\./gi;
console.log("Match test 2:", testStr2.replace(regex2, 'Donnez à jusqu\'à $1 Personnage(s) adverse(s) $2 de puissance pendant ce tour.'));
