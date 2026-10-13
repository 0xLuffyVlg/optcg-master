const fs = require('fs');

const cards = JSON.parse(fs.readFileSync('src/data/cards.json', 'utf8'));
console.log('cards.json count:', cards.length);
console.log('cards.json sample keys:', Object.keys(cards[0]));
console.log('sample card 0:', {
  id: cards[0].id,
  card_code: cards[0].card_code,
  name: cards[0].name,
  cardmarket_url: cards[0].cardmarket_url,
  tcgplayer_url: cards[0].tcgplayer_url
});

const cardsWithCm = cards.filter(c => c.cardmarket_url);
const cardsWithTcg = cards.filter(c => c.tcgplayer_url);
console.log(`Cards with cardmarket_url in cards.json: ${cardsWithCm.length} / ${cards.length}`);
console.log(`Cards with tcgplayer_url in cards.json: ${cardsWithTcg.length} / ${cards.length}`);

const variants = JSON.parse(fs.readFileSync('src/data/variants.json', 'utf8'));
console.log('variants.json count:', variants.length);
console.log('variants.json sample keys:', Object.keys(variants[0]));
const varsWithCm = variants.filter(v => v.cardmarket_url);
const varsWithTcg = variants.filter(v => v.tcgplayer_url);
console.log(`Variants with cardmarket_url: ${varsWithCm.length} / ${variants.length}`);
console.log(`Variants with tcgplayer_url: ${varsWithTcg.length} / ${variants.length}`);
