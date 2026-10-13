/**
 * Merges cards-details.json (2,710 detailed cards from onepiece-database)
 * into cards.json and optcg_complete_database.json.
 */
const fs = require('fs');
const path = require('path');

const DETAILS_PATH = path.resolve(__dirname, '../../onepiece-database/data/cards-details.json');
const CARDS_JSON_PATH = path.resolve(__dirname, '../src/data/cards.json');
const COMPLETE_DB_PATH = path.resolve(__dirname, '../src/data/optcg_complete_database.json');

console.log('Loading datasets...');
const details = JSON.parse(fs.readFileSync(DETAILS_PATH, 'utf8'));
const cards = JSON.parse(fs.readFileSync(CARDS_JSON_PATH, 'utf8'));
const completeDb = JSON.parse(fs.readFileSync(COMPLETE_DB_PATH, 'utf8'));

function cleanEffect(effect) {
  if (!effect) return '';
  let e = effect.trim();
  if (e.startsWith('"')) e = e.slice(1);
  if (e.endsWith('"')) e = e.slice(0, -1);
  return e.trim();
}

function normalizeCategory(catStr) {
  if (!catStr) return 'Character';
  const u = catStr.toUpperCase().trim();
  if (u.includes('LEADER')) return 'Leader';
  if (u.includes('EVENT')) return 'Event';
  if (u.includes('STAGE')) return 'Stage';
  return 'Character';
}

console.log(`Cards in cards.json: ${cards.length}`);
console.log(`Card details available: ${Object.keys(details).length}`);

let matchedCount = 0;

for (const card of cards) {
  const code = (card.card_code || card.id || '').toUpperCase().trim();
  const d = details[code];

  if (d) {
    matchedCount++;
    if (d.cost !== null && d.cost !== undefined) card.cost = Number(d.cost);
    if (d.power !== null && d.power !== undefined) card.power = Number(d.power);
    if (d.counter !== null && d.counter !== undefined) card.counter = Number(d.counter);
    if (d.life !== null && d.life !== undefined) card.life = Number(d.life);
    if (d.attribute) card.attribute = d.attribute;
    if (d.types) {
      card.type = d.types.split(/[\/,]/).map(t => t.trim()).filter(Boolean);
    }
    if (d.category) card.category = normalizeCategory(d.category);
    if (d.effect) {
      const clean = cleanEffect(d.effect);
      if (d.language === 'fr') {
        card.effect_fr = clean;
        if (!card.effect) card.effect = clean;
      } else {
        card.effect = clean;
      }
    }
    if (d.trigger) card.trigger = cleanEffect(d.trigger);
  }
}

console.log(`Enriched ${matchedCount} / ${cards.length} cards in cards.json with full gameplay details!`);

// Update optcg_complete_database.json
const cardsMap = new Map(cards.map(c => [c.card_code.toUpperCase(), c]));
let completeMatched = 0;

for (const p of completeDb) {
  const code = (p.card_code || p.id.match(/([A-Z0-9]{2,4}-[0-9]{3,4})/i)?.[1] || '').toUpperCase().trim();
  const parent = cardsMap.get(code);

  if (parent) {
    completeMatched++;
    p.cost = parent.cost !== null && parent.cost !== undefined ? String(parent.cost) : null;
    p.power = parent.power !== null && parent.power !== undefined ? String(parent.power) : null;
    p.counter = parent.counter !== null && parent.counter !== undefined ? String(parent.counter) : null;
    p.life = parent.life !== null && parent.life !== undefined ? String(parent.life) : null;
    p.attribute = parent.attribute || null;
    p.types = parent.type || [];
    p.category = parent.category;
    p.effect = parent.effect || '';
    p.effect_fr = parent.effect_fr || '';
    p.trigger = parent.trigger || null;
  }
}

console.log(`Enriched ${completeMatched} / ${completeDb.length} prints in optcg_complete_database.json!`);

// Save updated files
fs.writeFileSync(CARDS_JSON_PATH, JSON.stringify(cards, null, 2), 'utf8');
fs.writeFileSync(COMPLETE_DB_PATH, JSON.stringify(completeDb), 'utf8');
console.log('Successfully saved cards.json and optcg_complete_database.json!');
