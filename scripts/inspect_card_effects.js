import fs from 'fs';

const cards = JSON.parse(fs.readFileSync('src/data/cards.json', 'utf8'));

// Count common English words remaining in translated cards
const sampleCardsWithEffects = cards.filter(c => c.effect && c.effect.trim().length > 10).slice(0, 50);

console.log(`Analyzing 50 cards with effects...`);
for (let i = 0; i < 10; i++) {
  const c = sampleCardsWithEffects[i];
  console.log(`\n--- Card ${c.card_code} (${c.name}) ---`);
  console.log("EN:", c.effect);
}
