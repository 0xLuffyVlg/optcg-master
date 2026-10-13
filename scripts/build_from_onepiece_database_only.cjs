/**
 * 100% Zero-Scraping Database Generator:
 * Builds cards.json, optcg_complete_database.json and variants.json
 * SOLELY AND EXCLUSIVELY from onepiece-database (cards-all.json).
 * Completely removes all old scraped Bandai data.
 */
const fs = require('fs');
const path = require('path');

const ONEPIECE_DIR = path.resolve(__dirname, '../../onepiece-database/data');
const CARDS_JSON_PATH = path.resolve(__dirname, '../src/data/cards.json');
const COMPLETE_DB_PATH = path.resolve(__dirname, '../src/data/optcg_complete_database.json');
const VARIANTS_PATH = path.resolve(__dirname, '../src/data/variants.json');

console.log('Loading onepiece-database...');
const cardsAll = JSON.parse(fs.readFileSync(path.join(ONEPIECE_DIR, 'cards-all.json'), 'utf8'));
console.log(`Loaded ${cardsAll.length} items from onepiece-database.`);

// Helper: Normalize colors
function normalizeColors(colorStr) {
  if (!colorStr) return ['Red'];
  const map = {
    'rouge': 'Red', 'red': 'Red', '赤': 'Red',
    'vert': 'Green', 'green': 'Green', '緑': 'Green',
    'bleu': 'Blue', 'blue': 'Blue', '青': 'Blue',
    'violet': 'Purple', 'purple': 'Purple', '紫': 'Purple',
    'noir': 'Black', 'black': 'Black', '黒': 'Black',
    'jaune': 'Yellow', 'yellow': 'Yellow', '黄': 'Yellow'
  };

  const parts = colorStr.split(/[\/,]/).map(s => s.trim().toLowerCase());
  const res = parts.map(p => map[p] || 'Red').filter(Boolean);
  return res.length > 0 ? res : ['Red'];
}

// Helper: Normalize category
function normalizeCategory(catStr) {
  if (!catStr) return 'Character';
  const u = catStr.toUpperCase().trim();
  if (u.includes('LEADER')) return 'Leader';
  if (u.includes('EVENT')) return 'Event';
  if (u.includes('STAGE')) return 'Stage';
  return 'Character';
}

// 1. Group unique cards by card_code
const uniqueCardsMap = new Map();

for (const c of cardsAll) {
  const code = (c.code || '').trim().toUpperCase();
  if (!code) continue;

  if (!uniqueCardsMap.has(code)) {
    const setCodeMatch = code.match(/^([A-Z0-9]+)-/);
    const setCode = setCodeMatch ? setCodeMatch[1] : (c.set_slug ? c.set_slug.toUpperCase() : 'OP');

    uniqueCardsMap.set(code, {
      id: code,
      card_code: code,
      set_code: setCode,
      name: c.name,
      name_fr: c.language === 'fr' ? c.name : undefined,
      jp_name: c.name_jp || (c.language === 'jp' ? c.name : undefined),
      category: normalizeCategory(c.category),
      rarity: c.rarity || 'C',
      color: normalizeColors(c.color),
      cost: null,
      power: null,
      counter: 0,
      type: [],
      attribute: '',
      trigger: '',
      effect: '',
      price_eur: c.price_eur,
      price_min_eur: c.price_min_eur,
      price_avg7_eur: c.price_avg7_eur,
      price_avg30_eur: c.price_avg30_eur,
      scalpeurs_image_url: c.image_url,
      _imagePaths: [c.image_url],
      _defaultImagePath: c.image_url
    });
  } else {
    const card = uniqueCardsMap.get(code);
    if (c.language === 'fr' && !card.name_fr) card.name_fr = c.name;
    if (c.language === 'en') card.name = c.name;
    if (c.name_jp && !card.jp_name) card.jp_name = c.name_jp;
    if (c.image_url && !card._imagePaths.includes(c.image_url)) {
      card._imagePaths.push(c.image_url);
    }
    if (c.price_eur !== null && c.price_eur !== undefined) {
      if (!card.price_eur || c.language === 'fr') {
        card.price_eur = c.price_eur;
        card.price_min_eur = c.price_min_eur;
        card.price_avg7_eur = c.price_avg7_eur;
        card.price_avg30_eur = c.price_avg30_eur;
      }
    }
  }
}

const uniqueCards = Array.from(uniqueCardsMap.values()).sort((a, b) => 
  a.card_code.localeCompare(b.card_code, undefined, { numeric: true })
);

console.log(`Unique base cards generated (100% onepiece-database): ${uniqueCards.length}`);

// 2. Build 17,330 prints for optcg_complete_database.json
const allPrints = cardsAll.map(c => {
  const code = (c.code || '').trim().toUpperCase();
  const parent = uniqueCardsMap.get(code);

  return {
    id: c.id,
    card_code: code || parent?.card_code || 'OP',
    name: c.name || parent?.name || code,
    name_fr: c.language === 'fr' ? c.name : parent?.name_fr,
    name_jp: c.name_jp || parent?.jp_name,
    language: c.language,
    rarity: c.rarity || parent?.rarity || 'C',
    type: normalizeCategory(c.category || parent?.category),
    cost: null,
    power: null,
    counter: null,
    color: normalizeColors(c.color || (parent?.color ? parent.color.join('/') : 'Red')),
    attribute: null,
    types: [],
    effect: '',
    trigger: null,
    set: c.set_name || parent?.set_code || '',
    image_url: c.image_url || ''
  };
});

console.log(`Total complete prints generated (100% onepiece-database): ${allPrints.length}`);

// 3. Build variants.json
const allVariants = cardsAll.map(c => {
  const code = (c.code || '').trim().toUpperCase();
  let label = 'Base';
  if (c.art_type === 'MANGA_ART') label = 'Manga Rare 👑';
  else if (c.art_type === 'ALT_ART') label = `Alternate Art (v${c.variant || 1}) ✨`;
  else if (c.variant && c.variant > 1) label = `Variante ${c.variant}`;
  if (c.language) label += ` [${c.language.toUpperCase()}]`;

  return {
    card_code: code,
    variant_label: label,
    name: c.name,
    name_fr: c.language === 'fr' ? c.name : undefined,
    name_jp: c.name_jp,
    language: c.language,
    image_path: c.image_url,
    image_url: c.image_url,
    scalpeurs_image_url: c.image_url,
    market_price: c.price_eur,
    low_price: c.price_min_eur,
    avg_price: c.price_avg7_eur,
    trend_price: c.price_eur,
    price_eur: c.price_eur,
    price_min_eur: c.price_min_eur,
    price_avg7_eur: c.price_avg7_eur,
    price_avg30_eur: c.price_avg30_eur,
    listings_count: c.listings_count,
    price_currency: 'EUR',
    updated_at: new Date().toISOString()
  };
});

console.log(`Total variants generated: ${allVariants.length}`);

// Save all 3 files
console.log('Writing cards.json...');
fs.writeFileSync(CARDS_JSON_PATH, JSON.stringify(uniqueCards, null, 2), 'utf8');

console.log('Writing optcg_complete_database.json...');
fs.writeFileSync(COMPLETE_DB_PATH, JSON.stringify(allPrints), 'utf8');

console.log('Writing variants.json...');
fs.writeFileSync(VARIANTS_PATH, JSON.stringify(allVariants), 'utf8');

console.log('Done! All scraped data has been completely eliminated.');
