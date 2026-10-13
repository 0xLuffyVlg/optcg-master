import fs from 'fs';

const metaDecks = JSON.parse(fs.readFileSync('src/data/metaDecksData.json', 'utf8'));
const cards = JSON.parse(fs.readFileSync('src/data/cards.json', 'utf8'));

console.log('Sets in metaDecks:', Object.keys(metaDecks));
const op17Leaders = metaDecks['OP17'];
console.log('OP17 leaders count:', op17Leaders.length);
const topLeader = op17Leaders[0];
console.log('Top leader:', topLeader.leaderCard.name, topLeader.leaderCard.card_code);
console.log('Sample decklists for top leader:', topLeader.sampleDecklists.length);
if (topLeader.sampleDecklists.length > 0) {
  console.log('First decklist parsed items count:', topLeader.sampleDecklists[0].parsedDeck.items.length);
}
