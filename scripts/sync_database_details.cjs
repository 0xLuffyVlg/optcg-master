const fs = require('fs');
const path = require('path');

console.log('--- Starting Database & Detail Links Synchronization ---');

const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCE_ALL_PATH = 'C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data/cards-all.json';
const DETAILS_DIR = path.join(ROOT_DIR, 'public/data/details');

if (!fs.existsSync(SOURCE_ALL_PATH)) {
  console.error('Source cards-all.json not found at:', SOURCE_ALL_PATH);
  process.exit(1);
}

const rawAll = JSON.parse(fs.readFileSync(SOURCE_ALL_PATH, 'utf8'));
console.log(`Loaded ${rawAll.length} cards from cards-all.json`);

// 1. Index all detail files
console.log('Indexing detail files from public/data/details...');
const detailFiles = fs.readdirSync(DETAILS_DIR).filter(f => f.endsWith('.json'));
console.log(`Found ${detailFiles.length} detail files`);

const detailsByFile = new Map();
for (const file of detailFiles) {
  try {
    const content = JSON.parse(fs.readFileSync(path.join(DETAILS_DIR, file), 'utf8'));
    detailsByFile.set(file.toLowerCase(), content);
  } catch (e) {
    // Ignore invalid JSON
  }
}
console.log(`Indexed ${detailsByFile.size} detail files into memory`);

// Helper to get detail for a file
function getDetailForFile(detailFile) {
  if (!detailFile) return null;
  return detailsByFile.get(detailFile.toLowerCase()) || null;
}

// Map cards-all by ID
const allById = new Map();
for (const c of rawAll) {
  if (c.id) allById.set(c.id, c);
}

// 2. Synchronize optcg_complete_database.json
const dbPath = path.join(ROOT_DIR, 'src/data/optcg_complete_database.json');
let completeDb = [];
if (fs.existsSync(dbPath)) {
  completeDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  console.log(`Loaded ${completeDb.length} cards from optcg_complete_database.json`);
}

let dbUpdated = 0;
for (const card of completeDb) {
  const src = allById.get(card.id);
  if (src) {
    card.detail_file = src.detail_file || `${src.code}.json`;
    if (src.cardmarket_url) card.cardmarket_url = src.cardmarket_url;
    if (src.cardmarket_url_jp) card.cardmarket_url_jp = src.cardmarket_url_jp;
    if (src.price_eur !== undefined) card.price_eur = src.price_eur;
    if (src.price_min_eur !== undefined) card.price_min_eur = src.price_min_eur;
    if (src.price_avg7_eur !== undefined) card.price_avg7_eur = src.price_avg7_eur;
    if (src.price_avg30_eur !== undefined) card.price_avg30_eur = src.price_avg30_eur;
    if (src.listings_count !== undefined) card.listings_count = src.listings_count;
    if (src.art_type) card.art_type = src.art_type;
    if (src.variant) card.variant = src.variant;

    const detail = getDetailForFile(src.detail_file);
    if (detail) {
      if (detail.tcgplayer_url) card.tcgplayer_url = detail.tcgplayer_url;
      if (!card.cardmarket_url && detail.cardmarket_url) card.cardmarket_url = detail.cardmarket_url;
      if (!card.cardmarket_url_jp && detail.cardmarket_url_jp) card.cardmarket_url_jp = detail.cardmarket_url_jp;
    }
    dbUpdated++;
  }
}
console.log(`Updated ${dbUpdated} records in optcg_complete_database.json`);
fs.writeFileSync(dbPath, JSON.stringify(completeDb, null, 2), 'utf8');

// 3. Build comprehensive card_links.json
console.log('Building card_links.json...');
const byPath = {};
const byBasename = {};
const byCode = {};
const byId = {};

for (const c of rawAll) {
  const detail = getDetailForFile(c.detail_file);
  const cm = c.cardmarket_url || detail?.cardmarket_url || null;
  const cm_jp = c.cardmarket_url_jp || detail?.cardmarket_url_jp || null;
  const tcg = detail?.tcgplayer_url || null;
  const lang = (c.language || 'en').toLowerCase();
  const code = (c.code || '').toUpperCase().trim();
  const detail_file = c.detail_file || (code ? `${code}.json` : null);

  const linkEntry = { cm, cm_jp, tcg, detail_file, price_eur: c.price_eur ?? detail?.price_eur ?? null };

  if (c.id) {
    byId[c.id] = linkEntry;
  }

  if (c.image_path) {
    const cleanPath = c.image_path.replace(/^\//, '').toLowerCase();
    byPath[cleanPath] = linkEntry;
    byPath['/' + cleanPath] = linkEntry;

    const baseName = path.basename(c.image_path).toLowerCase();
    const nameWithoutExt = baseName.replace(/\.(webp|png|jpg|jpeg)$/i, '');

    if (!byBasename[baseName]) byBasename[baseName] = {};
    byBasename[baseName][lang] = linkEntry;

    if (!byBasename[nameWithoutExt]) byBasename[nameWithoutExt] = {};
    byBasename[nameWithoutExt][lang] = linkEntry;
  }

  if (c.image_url) {
    try {
      const urlObj = new URL(c.image_url);
      const urlPath = urlObj.pathname.replace(/^\//, '').toLowerCase();
      byPath[urlPath] = linkEntry;
      byPath['/' + urlPath] = linkEntry;
    } catch (e) {}
  }

  // byCode index: organize by base code and language
  if (code) {
    if (!byCode[code]) {
      byCode[code] = {
        cm: null,
        cm_jp: null,
        tcg: null,
        detail_file: null,
        fr: null,
        en: null,
        jp: null
      };
    }

    const cur = byCode[code];
    if (lang === 'fr' && cm && (!cur.fr || c.variant === 1)) cur.fr = cm;
    if (lang === 'en' && cm && (!cur.en || c.variant === 1)) cur.en = cm;
    if (lang === 'jp' && cm && (!cur.jp || c.variant === 1)) cur.jp = cm;
    if (cm_jp && !cur.cm_jp) cur.cm_jp = cm_jp;
    if (tcg && (!cur.tcg || c.variant === 1)) cur.tcg = tcg;
    if (!cur.detail_file && detail_file) cur.detail_file = detail_file;

    // Default cm: prefer FR, then EN, then JP
    if (!cur.cm || c.variant === 1) {
      cur.cm = cur.fr || cur.en || cur.jp || cm;
    }
  }
}

// Also augment byCode with base fiches {code}.json
for (const file of detailFiles) {
  if (!file.includes('-v')) {
    const code = file.replace(/\.json$/i, '').toUpperCase();
    const detail = detailsByFile.get(file.toLowerCase());
    if (detail) {
      if (!byCode[code]) {
        byCode[code] = {
          cm: detail.cardmarket_url || null,
          cm_jp: detail.cardmarket_url_jp || null,
          tcg: detail.tcgplayer_url || null,
          detail_file: file,
          fr: detail.cardmarket_url || null,
          en: detail.cardmarket_url || null,
          jp: detail.cardmarket_url_jp || null
        };
      } else {
        if (!byCode[code].cm && detail.cardmarket_url) byCode[code].cm = detail.cardmarket_url;
        if (!byCode[code].tcg && detail.tcgplayer_url) byCode[code].tcg = detail.tcgplayer_url;
        if (!byCode[code].cm_jp && detail.cardmarket_url_jp) byCode[code].cm_jp = detail.cardmarket_url_jp;
        if (!byCode[code].detail_file) byCode[code].detail_file = file;
      }
    }
  }
}

const cardLinksData = { byPath, byBasename, byCode, byId };
const linksPath = path.join(ROOT_DIR, 'src/data/card_links.json');
fs.writeFileSync(linksPath, JSON.stringify(cardLinksData, null, 2), 'utf8');
console.log(`Saved card_links.json: ${Object.keys(byId).length} byId, ${Object.keys(byCode).length} byCode, ${Object.keys(byPath).length} byPath`);

// 4. Update variants.json
const variantsPath = path.join(ROOT_DIR, 'src/data/variants.json');
if (fs.existsSync(variantsPath)) {
  const variants = JSON.parse(fs.readFileSync(variantsPath, 'utf8'));
  let varUpdated = 0;
  for (const v of variants) {
    const rawPath = (v.image_path || v.image_url || '').toLowerCase();
    const cleanImg = rawPath.replace(/^https?:\/\/[^\/]+/, '').replace(/^\//, '');
    const baseName = path.basename(rawPath);
    const lang = (v.language || 'fr').toLowerCase();
    const link = byPath[cleanImg] || byPath['/' + cleanImg] || byPath[rawPath] || byBasename[baseName]?.[lang] || byBasename[baseName]?.['en'] || byBasename[baseName]?.['fr'] || byBasename[baseName]?.['jp'];
    if (link) {
      if (link.cm) v.cardmarket_url = link.cm;
      if (link.cm_jp) v.cardmarket_url_jp = link.cm_jp;
      if (link.tcg) v.tcgplayer_url = link.tcg;
      if (link.detail_file) v.detail_file = link.detail_file;
      if (link.price_eur !== undefined && link.price_eur !== null) v.price_eur = link.price_eur;
      varUpdated++;
    }
  }
  fs.writeFileSync(variantsPath, JSON.stringify(variants, null, 2), 'utf8');
  console.log(`Updated ${varUpdated} variants in variants.json`);
}

// 5. Update cards.json
const cardsPath = path.join(ROOT_DIR, 'src/data/cards.json');
if (fs.existsSync(cardsPath)) {
  const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));
  let cardsUpdated = 0;
  for (const c of cards) {
    const code = (c.card_code || c.id || '').toUpperCase().trim();
    const codeEntry = byCode[code];
    if (codeEntry) {
      if (codeEntry.cm) c.cardmarket_url = codeEntry.cm;
      if (codeEntry.cm_jp) c.cardmarket_url_jp = codeEntry.cm_jp;
      if (codeEntry.tcg) c.tcgplayer_url = codeEntry.tcg;
      if (codeEntry.detail_file) c.detail_file = codeEntry.detail_file;
      cardsUpdated++;
    }
  }
  fs.writeFileSync(cardsPath, JSON.stringify(cards, null, 2), 'utf8');
  console.log(`Updated ${cardsUpdated} cards in cards.json`);
}

console.log('--- Database & Detail Links Synchronization Complete! ---');
