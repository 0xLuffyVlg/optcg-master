/**
 * Merge script: Fuses onepiece-database (FR, EN, JP, Scalpeurs prices & images)
 * with existing gameplay cards (effects, costs, powers, counters, traits).
 */
const fs = require('fs');
const path = require('path');

const ONEPIECE_DIR = path.resolve(__dirname, '../../onepiece-database/data');
const CARDS_JSON_PATH = path.resolve(__dirname, '../src/data/cards.json');
const VARIANTS_JSON_PATH = path.resolve(__dirname, '../src/data/variants.json');

console.log('Reading databases...');
const cardsAll = JSON.parse(fs.readFileSync(path.join(ONEPIECE_DIR, 'cards-all.json'), 'utf8'));
const cardsFr = JSON.parse(fs.readFileSync(path.join(ONEPIECE_DIR, 'cards-fr.json'), 'utf8'));
const cardsJp = JSON.parse(fs.readFileSync(path.join(ONEPIECE_DIR, 'cards-jp.json'), 'utf8'));
const existingCards = JSON.parse(fs.readFileSync(CARDS_JSON_PATH, 'utf8'));
const existingVariants = JSON.parse(fs.readFileSync(VARIANTS_JSON_PATH, 'utf8'));

console.log(`Cards in onepiece-database: ${cardsAll.length}`);
console.log(`Existing gameplay cards: ${existingCards.length}`);
console.log(`Existing variants: ${existingVariants.length}`);

// Build maps from onepiece-database
const frNameByCode = new Map();
const jpNameByCode = new Map();
const scalpeurPricesByCode = new Map();
const scalpeurImageByCode = new Map();

for (const c of cardsFr) {
  if (c.code && c.name) {
    const code = c.code.toUpperCase().trim();
    if (!frNameByCode.has(code)) {
      frNameByCode.set(code, c.name);
    }
  }
}

for (const c of cardsJp) {
  if (c.code && (c.name_jp || c.name)) {
    const code = c.code.toUpperCase().trim();
    if (!jpNameByCode.has(code)) {
      jpNameByCode.set(code, c.name_jp || c.name);
    }
  }
}

for (const c of cardsAll) {
  if (c.code) {
    const code = c.code.toUpperCase().trim();
    if (!jpNameByCode.has(code) && c.name_jp) {
      jpNameByCode.set(code, c.name_jp);
    }
    if (c.price_eur !== null && c.price_eur !== undefined) {
      if (!scalpeurPricesByCode.has(code) || c.language === 'fr') {
        scalpeurPricesByCode.set(code, {
          price_eur: c.price_eur,
          price_min_eur: c.price_min_eur,
          price_avg7_eur: c.price_avg7_eur,
          price_avg30_eur: c.price_avg30_eur,
          listings_count: c.listings_count
        });
      }
    }
    if (c.image_url && !scalpeurImageByCode.has(code)) {
      scalpeurImageByCode.set(code, c.image_url);
    }
  }
}

console.log(`Unique FR names indexed: ${frNameByCode.size}`);
console.log(`Unique JP names indexed: ${jpNameByCode.size}`);
console.log(`Unique prices indexed: ${scalpeurPricesByCode.size}`);

// Enrich existingCards
let enrichedCount = 0;
for (const card of existingCards) {
  const code = (card.card_code || card.id || '').toUpperCase().trim();
  const fr = frNameByCode.get(code);
  const jp = jpNameByCode.get(code);
  const price = scalpeurPricesByCode.get(code);
  const imgUrl = scalpeurImageByCode.get(code);

  let updated = false;
  if (fr && !card.name_fr) {
    card.name_fr = fr;
    updated = true;
  }
  if (jp && !card.jp_name) {
    card.jp_name = jp;
    updated = true;
  }
  if (price) {
    card.price_eur = price.price_eur;
    card.price_min_eur = price.price_min_eur;
    card.price_avg7_eur = price.price_avg7_eur;
    card.price_avg30_eur = price.price_avg30_eur;
    updated = true;
  }
  if (imgUrl && !card.scalpeurs_image_url) {
    card.scalpeurs_image_url = imgUrl;
    updated = true;
  }
  if (updated) enrichedCount++;
}

console.log(`Enriched ${enrichedCount} cards with FR names, JP names, and market prices!`);

// Save updated cards.json
fs.writeFileSync(CARDS_JSON_PATH, JSON.stringify(existingCards, null, 2), 'utf8');
console.log('Successfully updated cards.json!');
