import fs from 'fs';

// Let's inspect how computeMetaForSet and computeLeaderVariants work
const cards = JSON.parse(fs.readFileSync('src/data/cards.json', 'utf8'));
const tournaments = JSON.parse(fs.readFileSync('src/data/tournaments.json', 'utf8'));
const variants = JSON.parse(fs.readFileSync('src/data/variants.json', 'utf8'));

console.log('Cards:', cards.length);
console.log('Tournaments:', tournaments.length);
console.log('Variants:', variants.length);
