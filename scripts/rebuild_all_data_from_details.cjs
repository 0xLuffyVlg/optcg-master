/**
 * rebuild_all_data_from_details.cjs
 * 
 * Rebuilds all website datasets directly from the single source of truth:
 * onepiece-database/data/details/*.json (7,443 micro-fiches)
 * and language print registries (cards-fr.json, cards-en.json, cards-jp.json)
 *
 * Generated targets:
 * 1. src/data/cards.json (2,885 base cards with multi-language image paths and exact Cardmarket URLs)
 * 2. src/data/optcg_complete_database.json (17,330 prints aligned with detail fiches)
 * 3. src/data/variants.json (all variant fiches indexed with pricing and links)
 * 4. src/data/card_links.json (fast lookup mapping byPath, byBasename, byCode, byId, byFile)
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCE_DETAILS_DIR = path.resolve(ROOT_DIR, '../onepiece-database/data/details');
const PUBLIC_DETAILS_DIR = path.resolve(ROOT_DIR, 'public/data/details');
const CARDS_FR_PATH = path.resolve(ROOT_DIR, '../onepiece-database/data/cards-fr.json');
const CARDS_EN_PATH = path.resolve(ROOT_DIR, '../onepiece-database/data/cards-en.json');
const CARDS_JP_PATH = path.resolve(ROOT_DIR, '../onepiece-database/data/cards-jp.json');

const TARGET_CARDS_JSON = path.resolve(ROOT_DIR, 'src/data/cards.json');
const TARGET_COMPLETE_DB = path.resolve(ROOT_DIR, 'src/data/optcg_complete_database.json');
const TARGET_VARIANTS_JSON = path.resolve(ROOT_DIR, 'src/data/variants.json');
const TARGET_CARD_LINKS = path.resolve(ROOT_DIR, 'src/data/card_links.json');

console.log('--- REBUILDING ALL OPTCG MASTER DATA FROM DETAILS FICHES ---');

// 0. Ensure public/data/details has all files
console.log('1. Checking synchronization between source details and public/data/details...');
if (!fs.existsSync(PUBLIC_DETAILS_DIR)) {
  fs.mkdirSync(PUBLIC_DETAILS_DIR, { recursive: true });
}
const sourceFiles = fs.readdirSync(SOURCE_DETAILS_DIR).filter(f => f.endsWith('.json'));
let copiedCount = 0;
for (const f of sourceFiles) {
  const srcFile = path.join(SOURCE_DETAILS_DIR, f);
  const dstFile = path.join(PUBLIC_DETAILS_DIR, f);
  if (!fs.existsSync(dstFile)) {
    fs.copyFileSync(srcFile, dstFile);
    copiedCount++;
  }
}
console.log(`Synchronized details: ${sourceFiles.length} files available (${copiedCount} new copies).`);

// 1. Read all 7,443 details fiches into memory
console.log('2. Reading all detail fiches into memory...');
const fichesByFile = new Map(); // key: lowercase filename e.g. "st21-015-v3.json"
const baseFichesByCode = new Map(); // key: uppercase code e.g. "ST21-015"
const variantFichesByCode = new Map(); // key: uppercase code -> array of variant fiches

for (const f of sourceFiles) {
  const filePath = path.join(SOURCE_DETAILS_DIR, f);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const lowerFile = f.toLowerCase();
    fichesByFile.set(lowerFile, data);
    fichesByFile.set(lowerFile.replace(/\.json$/i, ''), data);

    const code = (data.code || f.split('-v')[0].replace(/\.json$/i, '')).toUpperCase().trim();
    if (!f.includes('-v')) {
      baseFichesByCode.set(code, data);
    } else {
      if (!variantFichesByCode.has(code)) {
        variantFichesByCode.set(code, []);
      }
      variantFichesByCode.get(code).push({
        fileName: f,
        data
      });
    }
  } catch (err) {
    console.error(`Error parsing ${f}:`, err.message);
  }
}
console.log(`Loaded ${fichesByFile.size / 2} unique fiches (${baseFichesByCode.size} base fiches, ${variantFichesByCode.size} cards with variants).`);

// 2. Read language registries (cards-fr.json, cards-en.json, cards-jp.json)
console.log('3. Indexing language prints (FR, EN, JP)...');
const cardsFr = JSON.parse(fs.readFileSync(CARDS_FR_PATH, 'utf-8'));
const cardsEn = JSON.parse(fs.readFileSync(CARDS_EN_PATH, 'utf-8'));
const cardsJp = JSON.parse(fs.readFileSync(CARDS_JP_PATH, 'utf-8'));

// Maps for fast localized lookups
const localizedImagesByCode = new Map(); // code -> { fr?: string, en?: string, jp?: string }
const localizedImagesByFile = new Map(); // file -> { fr?: string, en?: string, jp?: string }
const localizedCmUrlsByFile = new Map(); // file -> { fr?: string, en?: string, jp?: string }
const printsById = new Map(); // id -> print

function registerLangPrint(p, lang) {
  if (!p) return;
  printsById.set(p.id, { ...p, lang });

  const code = (p.code || '').toUpperCase().trim();
  if (code) {
    if (!localizedImagesByCode.has(code)) {
      localizedImagesByCode.set(code, {});
    }
    const cur = localizedImagesByCode.get(code);
    if (!cur[lang] && p.image_url) {
      cur[lang] = p.image_url;
    }
  }

  const file = (p.detail_file || (code ? `${code}-v${p.variant || 1}.json` : '')).toLowerCase();
  if (file) {
    if (!localizedImagesByFile.has(file)) {
      localizedImagesByFile.set(file, {});
    }
    const fImg = localizedImagesByFile.get(file);
    if (!fImg[lang] && p.image_url) {
      fImg[lang] = p.image_url;
    }

    if (!localizedCmUrlsByFile.has(file)) {
      localizedCmUrlsByFile.set(file, {});
    }
    const fCm = localizedCmUrlsByFile.get(file);
    if (p.cardmarket_url) fCm[lang] = p.cardmarket_url;
    if (p.cardmarket_url_jp && !fCm.jp) fCm.jp = p.cardmarket_url_jp;
  }
}

for (const p of cardsFr) registerLangPrint(p, 'fr');
for (const p of cardsEn) registerLangPrint(p, 'en');
for (const p of cardsJp) registerLangPrint(p, 'jp');

console.log(`Indexed ${printsById.size} prints across FR (${cardsFr.length}), EN (${cardsEn.length}), and JP (${cardsJp.length}).`);

// 3. Rebuild src/data/cards.json (Base cards)
console.log('4. Rebuilding src/data/cards.json...');
const existingCards = JSON.parse(fs.readFileSync(TARGET_CARDS_JSON, 'utf-8'));
const rebuiltCards = [];

for (const card of existingCards) {
  const code = card.card_code.toUpperCase().trim();
  const baseFiche = baseFichesByCode.get(code) || fichesByFile.get(`${code.toLowerCase()}-v1.json`) || {};
  const v1Fiche = fichesByFile.get(`${code.toLowerCase()}-v1.json`) || baseFiche;

  // Localized images for base card
  const langImgs = localizedImagesByCode.get(code) || {};
  const imgFr = langImgs.fr || null;
  const imgEn = langImgs.en || null;
  const imgJp = langImgs.jp || null;
  const ficheImg = v1Fiche.image_path || v1Fiche.image_url || baseFiche.image_path || baseFiche.image_url || null;

  const imagePaths = [imgFr, imgEn, imgJp, ficheImg, ...(card._imagePaths || [])]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i);

  const defaultImage = imgFr || imgEn || imgJp || ficheImg || card._defaultImagePath;

  // Pricing priority: v1 / base fiche
  const priceEur = v1Fiche.price_eur !== undefined && v1Fiche.price_eur !== null
    ? v1Fiche.price_eur
    : (baseFiche.price_eur !== undefined && baseFiche.price_eur !== null ? baseFiche.price_eur : card.price_eur);

  const priceMinEur = v1Fiche.price_min_eur !== undefined && v1Fiche.price_min_eur !== null
    ? v1Fiche.price_min_eur
    : (priceEur !== undefined ? priceEur : card.price_min_eur);

  const cmUrl = v1Fiche.cardmarket_url || baseFiche.cardmarket_url || card.cardmarket_url;
  const cmUrlJp = v1Fiche.cardmarket_url_jp || baseFiche.cardmarket_url_jp || card.cardmarket_url_jp;
  const tcgUrl = v1Fiche.tcgplayer_url || baseFiche.tcgplayer_url || card.tcgplayer_url;

  rebuiltCards.push({
    ...card,
    price_eur: priceEur,
    price_min_eur: priceMinEur,
    price_avg7_eur: v1Fiche.price_avg7_eur ?? baseFiche.price_avg7_eur ?? card.price_avg7_eur,
    price_avg30_eur: v1Fiche.price_avg30_eur ?? baseFiche.price_avg30_eur ?? card.price_avg30_eur,
    listings_count: v1Fiche.listings_count ?? baseFiche.listings_count ?? card.listings_count,
    scalpeurs_image_url: ficheImg || defaultImage,
    _imagePaths: imagePaths,
    _defaultImagePath: defaultImage,
    cardmarket_url: cmUrl,
    cardmarket_url_jp: cmUrlJp,
    tcgplayer_url: tcgUrl,
    detail_file: `${code}-v1.json`
  });
}

fs.writeFileSync(TARGET_CARDS_JSON, JSON.stringify(rebuiltCards, null, 2), 'utf-8');
console.log(`Saved ${rebuiltCards.length} cards to ${TARGET_CARDS_JSON}`);

// 4. Rebuild src/data/optcg_complete_database.json (All Prints)
console.log('5. Rebuilding src/data/optcg_complete_database.json...');
const existingDb = JSON.parse(fs.readFileSync(TARGET_COMPLETE_DB, 'utf-8'));
const rebuiltDb = [];

for (const print of existingDb) {
  const code = (print.card_code || print.id.split('-')[2] || '').toUpperCase().trim();
  
  // Resolve detail file
  let detailFile = print.detail_file;
  if (!detailFile || !fichesByFile.has(detailFile.toLowerCase())) {
    const pRecord = printsById.get(print.id);
    if (pRecord?.detail_file && fichesByFile.has(pRecord.detail_file.toLowerCase())) {
      detailFile = pRecord.detail_file;
    } else if (print.variant && Number(print.variant) > 1 && fichesByFile.has(`${code.toLowerCase()}-v${print.variant}.json`)) {
      detailFile = `${code}-v${print.variant}.json`;
    } else if (fichesByFile.has(`${code.toLowerCase()}-v1.json`)) {
      detailFile = `${code}-v1.json`;
    } else {
      detailFile = `${code}.json`;
    }
  }

  const fiche = fichesByFile.get(detailFile.toLowerCase()) || {};

  // Image URL: clean authentic scalpeurs URL
  let imgUrl = print.image_url;
  if (fiche.image_path) {
    imgUrl = fiche.image_path;
  } else if (fiche.image_url) {
    imgUrl = fiche.image_url;
  }

  // Pricing: prioritize fiche if defined
  let priceEur = print.price_eur;
  if (fiche.price_eur !== undefined && fiche.price_eur !== null && fiche.price_eur > 0) {
    priceEur = fiche.price_eur;
  }

  // Cardmarket URL
  const isJp = (print.language || '').toLowerCase() === 'jp' || print.id.startsWith('jp-');
  let cmUrl = isJp ? (fiche.cardmarket_url_jp || print.cardmarket_url_jp || fiche.cardmarket_url || print.cardmarket_url)
                   : (fiche.cardmarket_url || print.cardmarket_url);

  let cmUrlJp = fiche.cardmarket_url_jp || print.cardmarket_url_jp;
  let tcgUrl = fiche.tcgplayer_url || print.tcgplayer_url;

  rebuiltDb.push({
    ...print,
    image_url: imgUrl,
    price_eur: priceEur,
    price_min_eur: fiche.price_min_eur ?? (priceEur !== undefined ? priceEur : print.price_min_eur),
    price_avg7_eur: fiche.price_avg7_eur ?? print.price_avg7_eur,
    price_avg30_eur: fiche.price_avg30_eur ?? print.price_avg30_eur,
    listings_count: fiche.listings_count ?? print.listings_count,
    cardmarket_url: cmUrl,
    cardmarket_url_jp: cmUrlJp,
    tcgplayer_url: tcgUrl,
    detail_file: detailFile,
    variant_version: fiche.variant_version || print.variant_version || 'v1',
    variant_name: fiche.variant_name || fiche.name || print.variant_name
  });
}

fs.writeFileSync(TARGET_COMPLETE_DB, JSON.stringify(rebuiltDb, null, 2), 'utf-8');
console.log(`Saved ${rebuiltDb.length} prints to ${TARGET_COMPLETE_DB}`);

// 5. Rebuild src/data/variants.json
console.log('6. Rebuilding src/data/variants.json...');
const rebuiltVariants = [];

for (const [code, variantsList] of variantFichesByCode.entries()) {
  // Sort variants by index (v1, v2, v3...)
  variantsList.sort((a, b) => (a.data.variant_index || 1) - (b.data.variant_index || 1));
  for (const item of variantsList) {
    const f = item.data;
    const vIndex = f.variant_index || parseInt((f.variant_version || 'v1').replace('v', ''), 10) || 1;
    rebuiltVariants.push({
      id: `${code}_v${vIndex}`,
      card_code: code,
      variant: vIndex,
      variant_version: f.variant_version || `v${vIndex}`,
      variant_label: f.variant_name || f.name || `Variant ${vIndex}`,
      name: f.name || code,
      rarity: f.rarity || 'C',
      price_eur: f.price_eur ?? null,
      price_min_eur: f.price_min_eur ?? f.price_eur ?? null,
      price_avg7_eur: f.price_avg7_eur ?? null,
      price_avg30_eur: f.price_avg30_eur ?? null,
      listings_count: f.listings_count ?? 0,
      cardmarket_url: f.cardmarket_url || '',
      cardmarket_url_jp: f.cardmarket_url_jp || '',
      tcgplayer_url: f.tcgplayer_url || '',
      image_path: f.image_path || f.image_url || '',
      image_url: f.image_url || f.image_path || '',
      detail_file: item.fileName
    });
  }
}

fs.writeFileSync(TARGET_VARIANTS_JSON, JSON.stringify(rebuiltVariants, null, 2), 'utf-8');
console.log(`Saved ${rebuiltVariants.length} variants to ${TARGET_VARIANTS_JSON}`);

// 6. Rebuild src/data/card_links.json (Lookup index)
console.log('7. Rebuilding src/data/card_links.json...');
const byPath = {};
const byBasename = {};
const byCode = {};
const byId = {};
const byFile = {};

// Index all prints from completeDatabase
for (const p of rebuiltDb) {
  const cm = p.cardmarket_url || null;
  const cm_jp = p.cardmarket_url_jp || null;
  const tcg = p.tcgplayer_url || null;
  const price = p.price_eur ?? null;
  const file = p.detail_file || null;
  const img = p.image_url || null;
  const lang = (p.language || 'en').toLowerCase();

  // byId
  if (p.id) {
    byId[p.id] = { cm, cm_jp, tcg, price_eur: price, detail_file: file };
  }

  // byPath
  if (img) {
    const cleanPath = img
      .replace(/^https?:\/\/scalpeurs\.com\/img\//i, '')
      .replace(/^https?:\/\/scalpeurs\.com\//i, '')
      .replace(/^\/img\//i, '')
      .replace(/^\//i, '')
      .toLowerCase();
    
    byPath[cleanPath] = { cm, cm_jp, tcg, price_eur: price, detail_file: file };

    // byBasename
    const baseName = cleanPath.split('/').pop();
    if (baseName) {
      if (!byBasename[baseName]) {
        byBasename[baseName] = { cm, cm_jp, tcg, price_eur: price, detail_file: file };
      }
      if (!byBasename[baseName][lang]) {
        byBasename[baseName][lang] = { cm, cm_jp, tcg, img };
      }
      const noExt = baseName.replace(/\.(webp|png|jpg|jpeg)$/i, '');
      if (!byBasename[noExt]) {
        byBasename[noExt] = byBasename[baseName];
      }
    }
  }

  // byCode
  const code = (p.card_code || '').toUpperCase().trim();
  if (code && !byCode[code]) {
    byCode[code] = { cm, cm_jp, tcg, price_eur: price, detail_file: file };
  }
}

// Index all 7,443 micro-fiches into byFile and byCode
for (const fName of sourceFiles) {
  const f = fichesByFile.get(fName.toLowerCase());
  if (!f) continue;
  const code = (f.code || fName.split('-v')[0]).toUpperCase().trim();
  const fileEntry = {
    cm: f.cardmarket_url || null,
    cm_jp: f.cardmarket_url_jp || null,
    tcg: f.tcgplayer_url || null,
    price_eur: f.price_eur ?? null,
    image_url: f.image_path || f.image_url || null,
    detail_file: fName,
    variant_version: f.variant_version || null,
    name: f.variant_name || f.name || null
  };

  byFile[fName.toLowerCase()] = fileEntry;
  byFile[fName.toLowerCase().replace(/\.json$/i, '')] = fileEntry;

  // Also enhance byBasename if image_path exists
  if (f.image_path || f.image_url) {
    const fullImg = f.image_path || f.image_url;
    const cleanPath = fullImg
      .replace(/^https?:\/\/scalpeurs\.com\/img\//i, '')
      .replace(/^https?:\/\/scalpeurs\.com\//i, '')
      .replace(/^\/img\//i, '')
      .replace(/^\//i, '')
      .toLowerCase();
    
    if (!byPath[cleanPath]) {
      byPath[cleanPath] = {
        cm: f.cardmarket_url || null,
        cm_jp: f.cardmarket_url_jp || null,
        tcg: f.tcgplayer_url || null,
        price_eur: f.price_eur ?? null,
        detail_file: fName
      };
    }
    const bName = cleanPath.split('/').pop();
    if (bName) {
      if (!byBasename[bName]) {
        byBasename[bName] = {
          cm: f.cardmarket_url || null,
          cm_jp: f.cardmarket_url_jp || null,
          tcg: f.tcgplayer_url || null,
          price_eur: f.price_eur ?? null,
          detail_file: fName
        };
      }
    }
  }

  // byCode for base cards or v1
  if (code && (!fName.includes('-v') || fName.endsWith('-v1.json'))) {
    if (!byCode[code] || fName.endsWith('-v1.json')) {
      byCode[code] = {
        cm: f.cardmarket_url || null,
        cm_jp: f.cardmarket_url_jp || null,
        tcg: f.tcgplayer_url || null,
        price_eur: f.price_eur ?? null,
        detail_file: fName
      };
    }
  }
}

const cardLinksData = {
  byPath,
  byBasename,
  byCode,
  byId,
  byFile
};

fs.writeFileSync(TARGET_CARD_LINKS, JSON.stringify(cardLinksData, null, 2), 'utf-8');
console.log(`Saved card_links.json: ${Object.keys(byPath).length} paths, ${Object.keys(byBasename).length} basenames, ${Object.keys(byCode).length} codes, ${Object.keys(byId).length} IDs, ${Object.keys(byFile).length} files.`);

console.log('--- DATA REBUILD COMPLETE SUCCESSFULLY ---');
