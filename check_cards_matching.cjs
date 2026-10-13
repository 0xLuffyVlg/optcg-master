const fs = require('fs');

const opDir = 'C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data/';
const cardsDetailsObj = JSON.parse(fs.readFileSync(opDir + 'cards-details.json', 'utf8'));
const cardsAll = JSON.parse(fs.readFileSync(opDir + 'cards-all.json', 'utf8'));
const optcgCards = JSON.parse(fs.readFileSync('src/data/cards.json', 'utf8'));

// Test matching optcgCards
let matchedInDetails = 0;
let matchedInAll = 0;
let tcgFound = 0;
let cmFound = 0;

for (const c of optcgCards) {
  const code = (c.card_code || c.id || '').toUpperCase().trim();
  const detail = cardsDetailsObj[code];
  if (detail) {
    matchedInDetails++;
    if (detail.tcgplayer_url) tcgFound++;
    if (detail.cardmarket_url || detail.cardmarket_url_jp) cmFound++;
  }
}

console.log(`optcgCards total: ${optcgCards.length}`);
console.log(`Matched in cards-details.json: ${matchedInDetails} / ${optcgCards.length}`);
console.log(`  with tcgplayer_url from details: ${tcgFound}`);
console.log(`  with cardmarket_url from details: ${cmFound}`);

// For cards not in cards-details, what are they?
const notInDetails = optcgCards.filter(c => !cardsDetailsObj[(c.card_code || c.id || '').toUpperCase().trim()]);
console.log('Sample cards not in cards-details (count: ' + notInDetails.length + '):');
notInDetails.slice(0, 10).forEach(c => console.log('  ', c.card_code, c.name, c.set_code));
