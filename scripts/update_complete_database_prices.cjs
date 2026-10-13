const fs = require('fs');
const path = require('path');

const frCards = JSON.parse(fs.readFileSync('C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data/cards-fr.json', 'utf8'));
const enCards = JSON.parse(fs.readFileSync('C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data/cards-en.json', 'utf8'));
const jpCards = JSON.parse(fs.readFileSync('C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data/cards-jp.json', 'utf8'));

const allDbPath = path.resolve('src/data/optcg_complete_database.json');
const allDb = JSON.parse(fs.readFileSync(allDbPath, 'utf8'));

// Build lookup map by id
const priceMap = new Map();
for (const c of frCards) priceMap.set(c.id, c);
for (const c of enCards) priceMap.set(c.id, c);
for (const c of jpCards) priceMap.set(c.id, c);

let updated = 0;
for (const item of allDb) {
  const p = priceMap.get(item.id);
  if (p) {
    if (p.price_eur !== null && p.price_eur !== undefined) item.price_eur = p.price_eur;
    if (p.price_min_eur !== null && p.price_min_eur !== undefined) item.price_min_eur = p.price_min_eur;
    if (p.price_avg7_eur !== null && p.price_avg7_eur !== undefined) item.price_avg7_eur = p.price_avg7_eur;
    if (p.price_avg30_eur !== null && p.price_avg30_eur !== undefined) item.price_avg30_eur = p.price_avg30_eur;
    if (p.listings_count !== null && p.listings_count !== undefined) item.listings_count = p.listings_count;
    if (p.name_fr) item.name_fr = p.name_fr;
    updated++;
  }
}

fs.writeFileSync(allDbPath, JSON.stringify(allDb, null, 2), 'utf8');
console.log(`Updated ${updated} items in optcg_complete_database.json!`);

// Verify ST36-005 entries
const kidEntries = allDb.filter(c => c.card_code === 'ST36-005');
console.log('Kid entries in optcg_complete_database:', kidEntries.map(k => ({
  id: k.id,
  lang: k.language,
  min: k.price_min_eur,
  trend: k.price_eur,
  listings: k.listings_count
})));
