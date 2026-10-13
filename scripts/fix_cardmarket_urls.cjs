/**
 * scripts/fix_cardmarket_urls.cjs
 * 
 * Corrige les URLs Cardmarket dans :
 * - src/data/optcg_complete_database.json
 * - src/data/variants.json
 * - public/data/details/*.json
 * 
 * Source de vérité : C:\Users\LuffyVlg\.gemini\antigravity\scratch\onepiece-database\data\details\
 * Logique : JP → cardmarket_url_jp, EN/FR → cardmarket_url
 */

const fs = require('fs');
const path = require('path');

const DETAILS_SOURCE = 'C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data/details';
const OPTCG_DIR = path.resolve(__dirname, '..');

console.log('===========================================================');
console.log('🔗 CORRECTION DES URLS CARDMARKET (Audit + Fix)');
console.log('===========================================================\n');

const t0 = Date.now();

// ─── 1. Build source of truth map from onepiece-database details ───
console.log('1. Chargement de la source de vérité (onepiece-database/data/details/)...');
const sourceFiles = fs.readdirSync(DETAILS_SOURCE).filter(f => f.endsWith('.json'));
console.log(`   ${sourceFiles.length} fichiers détails trouvés.`);

// Map: detail_file → { cardmarket_url, cardmarket_url_jp }
const sourceMap = new Map();
for (const file of sourceFiles) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(DETAILS_SOURCE, file), 'utf8'));
    sourceMap.set(file, {
      cardmarket_url: data.cardmarket_url || '',
      cardmarket_url_jp: data.cardmarket_url_jp || '',
      all_variants: data.all_variants || []
    });
  } catch (e) {
    // skip bad files
  }
}
console.log(`   ${sourceMap.size} fiches chargées.\n`);

// ─── 2. Fix optcg_complete_database.json ───
console.log('2. Correction de src/data/optcg_complete_database.json...');
const dbPath = path.join(OPTCG_DIR, 'src/data/optcg_complete_database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let dbFixed = 0, dbCorrect = 0, dbNoSource = 0, dbNoUrl = 0;

for (const card of db) {
  const df = card.detail_file;
  if (!df) { dbNoSource++; continue; }

  const source = sourceMap.get(df);
  if (!source) { dbNoSource++; continue; }

  const lang = (card.language || '').toLowerCase();
  
  // Correct URL based on language
  let correctUrl;
  if (lang === 'jp') {
    correctUrl = source.cardmarket_url_jp || source.cardmarket_url || '';
  } else {
    correctUrl = source.cardmarket_url || '';
  }

  if (!correctUrl) { dbNoUrl++; continue; }

  const currentUrl = card.cardmarket_url || '';
  
  if (currentUrl !== correctUrl) {
    card.cardmarket_url = correctUrl;
    dbFixed++;
  } else {
    dbCorrect++;
  }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log(`   ✓ ${dbFixed} URLs corrigées, ${dbCorrect} déjà correctes, ${dbNoSource} sans source, ${dbNoUrl} sans URL\n`);

// ─── 3. Fix variants.json ───
console.log('3. Correction de src/data/variants.json...');
const variantsPath = path.join(OPTCG_DIR, 'src/data/variants.json');
const variants = JSON.parse(fs.readFileSync(variantsPath, 'utf8'));

// Build a lookup from detail_file to correct URL by language
const dbUrlMap = new Map();
for (const card of db) {
  if (card.detail_file && card.cardmarket_url) {
    const key = `${card.detail_file}#${(card.language || '').toLowerCase()}`;
    dbUrlMap.set(key, card.cardmarket_url);
  }
}

let varFixed = 0, varCorrect = 0, varNoMatch = 0;

for (const v of variants) {
  const df = v.detail_file;
  if (!df) { varNoMatch++; continue; }

  const lang = (v.language || 'en').toLowerCase();
  const correctUrl = dbUrlMap.get(`${df}#${lang}`);
  
  if (!correctUrl) {
    // Try to get from source directly
    const source = sourceMap.get(df);
    if (!source) { varNoMatch++; continue; }
    const url = lang === 'jp' ? (source.cardmarket_url_jp || source.cardmarket_url) : source.cardmarket_url;
    if (url && v.cardmarket_url !== url) {
      v.cardmarket_url = url;
      varFixed++;
    } else if (url) {
      varCorrect++;
    } else {
      varNoMatch++;
    }
    continue;
  }

  if (v.cardmarket_url !== correctUrl) {
    v.cardmarket_url = correctUrl;
    varFixed++;
  } else {
    varCorrect++;
  }
}

fs.writeFileSync(variantsPath, JSON.stringify(variants, null, 2), 'utf8');
console.log(`   ✓ ${varFixed} URLs corrigées, ${varCorrect} déjà correctes, ${varNoMatch} sans correspondance\n`);

// ─── 4. Fix public/data/details/*.json (micro-fiches) ───
console.log('4. Correction des micro-fiches public/data/details/...');
const publicDetailsDir = path.join(OPTCG_DIR, 'public/data/details');

if (fs.existsSync(publicDetailsDir)) {
  const publicFiles = fs.readdirSync(publicDetailsDir).filter(f => f.endsWith('.json'));
  let pubFixed = 0, pubCorrect = 0;

  for (const file of publicFiles) {
    const source = sourceMap.get(file);
    if (!source) continue;

    const filePath = path.join(publicDetailsDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let changed = false;

    // Fix main cardmarket_url (use the base/EN URL)
    if (source.cardmarket_url && data.cardmarket_url !== source.cardmarket_url) {
      data.cardmarket_url = source.cardmarket_url;
      changed = true;
    }

    // Fix cardmarket_url_jp if present in source
    if (source.cardmarket_url_jp) {
      if (data.cardmarket_url_jp !== source.cardmarket_url_jp) {
        data.cardmarket_url_jp = source.cardmarket_url_jp;
        changed = true;
      }
    }

    // Fix all_variants URLs if present
    if (Array.isArray(data.all_variants) && source.all_variants.length > 0) {
      for (const sv of source.all_variants) {
        const dv = data.all_variants.find(v => v.variant_index === sv.variant_index);
        if (dv && sv.cardmarket_url && dv.cardmarket_url !== sv.cardmarket_url) {
          dv.cardmarket_url = sv.cardmarket_url;
          changed = true;
        }
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      pubFixed++;
    } else {
      pubCorrect++;
    }
  }

  console.log(`   ✓ ${pubFixed} fiches corrigées, ${pubCorrect} déjà correctes (${publicFiles.length} total)\n`);
} else {
  console.log('   ⚠ Dossier public/data/details/ non trouvé.\n');
}

// ─── 5. Rebuild cardmarket_prices.json with correct URLs ───
console.log('5. Mise à jour de src/data/cardmarket_prices.json avec les bonnes URLs...');
const cmPricesPath = path.join(OPTCG_DIR, 'src/data/cardmarket_prices.json');
const cmPrices = fs.existsSync(cmPricesPath) ? JSON.parse(fs.readFileSync(cmPricesPath, 'utf8')) : {};

let cmUpdated = 0;

// Group DB entries by card_code, prefer EN variant 1 URL
const codeToUrl = new Map();
for (const card of db) {
  const code = (card.card_code || '').toUpperCase().trim();
  if (!code || !card.cardmarket_url) continue;

  const lang = (card.language || '').toLowerCase();
  const variant = card.variant || 1;

  // Prefer EN/FR variant 1 for the fallback price file
  if (variant === 1) {
    const existing = codeToUrl.get(code);
    if (!existing || (lang === 'en' || lang === 'fr')) {
      codeToUrl.set(code, card.cardmarket_url);
    }
  }
}

for (const [code, url] of codeToUrl) {
  if (cmPrices[code]) {
    if (cmPrices[code].url !== url) {
      cmPrices[code].url = url;
      cmUpdated++;
    }
  }
}

fs.writeFileSync(cmPricesPath, JSON.stringify(cmPrices, null, 2), 'utf8');
console.log(`   ✓ ${cmUpdated} URLs mises à jour dans cardmarket_prices.json\n`);

// ─── 6. Summary ───
const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
console.log('===========================================================');
console.log(`✨ TERMINÉ en ${elapsed}s`);
console.log(`   optcg_complete_database : ${dbFixed} corrigées`);
console.log(`   variants.json           : ${varFixed} corrigées`);
console.log(`   cardmarket_prices.json  : ${cmUpdated} corrigées`);
console.log(`   Total URLs vérifiées    : ${db.length + variants.length}`);
console.log('===========================================================');
