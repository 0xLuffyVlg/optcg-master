/**
 * Rebuild optcg_complete_database.json from onepiece-database/data/cards-all.json
 * Replaces the old 4,844 scraped prints with all 17,330 clean prints (FR, EN, JP)
 * while preserving gameplay stats (effects, costs, powers, counters, types).
 */
const fs = require('fs');
const path = require('path');

const ONEPIECE_DIR = path.resolve(__dirname, '../../onepiece-database/data');
const COMPLETE_DB_PATH = path.resolve(__dirname, '../src/data/optcg_complete_database.json');
const CARDS_JSON_PATH = path.resolve(__dirname, '../src/data/cards.json');

console.log('Loading onepiece-database and cards.json...');
const cardsAll = JSON.parse(fs.readFileSync(path.join(ONEPIECE_DIR, 'cards-all.json'), 'utf8'));
const cardsJson = JSON.parse(fs.readFileSync(CARDS_JSON_PATH, 'utf8'));
const cardsByCode = new Map(cardsJson.map(c => [c.card_code.toUpperCase(), c]));

console.log(`Loaded ${cardsAll.length} cards from onepiece-database.`);

const newPrints = cardsAll.map(c => {
  const codeMatch = c.code || c.id.match(/([A-Z0-9]{2,4}-[0-9]{3,4})/i)?.[1];
  const code = (codeMatch || '').toUpperCase().trim();
  const parent = cardsByCode.get(code);

  return {
    id: c.id,
    card_code: code || parent?.card_code || 'OP',
    name: c.name || parent?.name || code,
    name_fr: c.language === 'fr' ? c.name : parent?.name_fr,
    name_jp: c.name_jp || parent?.jp_name,
    language: c.language,
    rarity: c.rarity || parent?.rarity || 'C',
    type: c.category || parent?.category || 'Character',
    cost: parent?.cost !== undefined && parent?.cost !== null ? String(parent.cost) : null,
    power: parent?.power !== undefined && parent?.power !== null ? String(parent.power) : null,
    counter: parent?.counter !== undefined && parent?.counter !== null ? String(parent.counter) : null,
    color: parent?.color || [c.color || 'Red'],
    attribute: parent?.attribute || null,
    types: parent?.type || [],
    effect: parent?.effect || '',
    trigger: parent?.trigger || null,
    set: c.set_name || parent?.set_code || '',
    image_url: c.image_url || ''
  };
});

console.log(`Writing ${newPrints.length} prints to optcg_complete_database.json...`);
fs.writeFileSync(COMPLETE_DB_PATH, JSON.stringify(newPrints), 'utf8');
console.log('Done! Successfully rebuilt optcg_complete_database.json with 17,330 prints.');
