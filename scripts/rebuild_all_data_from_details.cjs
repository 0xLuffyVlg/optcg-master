/**
 * rebuild_all_data_from_details.cjs
 * 
 * Rebuilds all website datasets EXCLUSIVELY and 100% from:
 * onepiece-database/data/details/*.json (7,443 micro-fiches)
 * 
 * Absolutely NO external backup files, NO git history, NO old databases.
 * 
 * Generated targets:
 * 1. public/data/details/ (7,443 micro-fiches synchronized)
 * 2. src/data/cards.json (2,710 base cards directly from [CODE].json)
 * 3. src/data/variants.json (4,733 variants directly from [CODE]-v[N].json)
 * 4. src/data/optcg_complete_database.json (4,733 prints directly from [CODE]-v[N].json)
 * 5. src/data/card_links.json (fast lookup mapping byPath, byBasename, byCode, byId, byFile)
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCE_DETAILS_DIR = path.resolve(ROOT_DIR, '../onepiece-database/data/details');
const PUBLIC_DETAILS_DIR = path.resolve(ROOT_DIR, 'public/data/details');

const TARGET_CARDS_JSON = path.resolve(ROOT_DIR, 'src/data/cards.json');
const TARGET_COMPLETE_DB = path.resolve(ROOT_DIR, 'src/data/optcg_complete_database.json');
const TARGET_VARIANTS_JSON = path.resolve(ROOT_DIR, 'src/data/variants.json');
const TARGET_CARD_LINKS = path.resolve(ROOT_DIR, 'src/data/card_links.json');

console.log('=== REBUILDING ALL DATA EXCLUSIVELY FROM onepiece-database/data/details ===');

if (!fs.existsSync(SOURCE_DETAILS_DIR)) {
  console.error(`ERROR: Source directory not found: ${SOURCE_DETAILS_DIR}`);
  process.exit(1);
}

// 0. Synchronize public/data/details
console.log('1. Synchronizing source details into public/data/details...');
if (!fs.existsSync(PUBLIC_DETAILS_DIR)) {
  fs.mkdirSync(PUBLIC_DETAILS_DIR, { recursive: true });
}

const sourceFiles = fs.readdirSync(SOURCE_DETAILS_DIR).filter(f => f.endsWith('.json'));
console.log(`Found ${sourceFiles.length} JSON files in source details directory.`);

let copiedCount = 0;
for (const f of sourceFiles) {
  const srcFile = path.join(SOURCE_DETAILS_DIR, f);
  const dstFile = path.join(PUBLIC_DETAILS_DIR, f);
  fs.copyFileSync(srcFile, dstFile);
  copiedCount++;
}
console.log(`Public details synchronized (${copiedCount} files updated).`);

// Helper to normalize colors
function mapColor(str) {
  if (!str) return ['Red'];
  const parts = str.split(/[\/,]/);
  const res = [];
  for (const p of parts) {
    const s = p.trim().toLowerCase();
    if (s.includes('roug') || s.includes('red')) res.push('Red');
    else if (s.includes('vert') || s.includes('green')) res.push('Green');
    else if (s.includes('bleu') || s.includes('blue')) res.push('Blue');
    else if (s.includes('viol') || s.includes('purp')) res.push('Purple');
    else if (s.includes('noir') || s.includes('black')) res.push('Black');
    else if (s.includes('jaun') || s.includes('yell')) res.push('Yellow');
  }
  return res.length > 0 ? Array.from(new Set(res)) : ['Red'];
}

// Helper to normalize category
function mapCategory(cat) {
  if (!cat) return 'Character';
  const c = String(cat).trim().toLowerCase();
  if (c.includes('leader')) return 'Leader';
  if (c.includes('event')) return 'Event';
  if (c.includes('stage')) return 'Stage';
  return 'Character';
}

// 1. Read and separate all fiches
console.log('2. Loading and separating base and variant fiches...');
const baseFiches = []; // [CODE].json
const variantFiches = []; // [CODE]-v[N].json
const fichesByFile = new Map();

for (const f of sourceFiles) {
  const filePath = path.join(SOURCE_DETAILS_DIR, f);
  try {
    const d = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    fichesByFile.set(f.toLowerCase(), d);
    fichesByFile.set(f.toLowerCase().replace(/\.json$/i, ''), d);

    if (/-v\d+\.json$/i.test(f)) {
      variantFiches.push({ fileName: f, data: d });
    } else {
      baseFiches.push({ fileName: f, data: d });
    }
  } catch (err) {
    console.error(`Error reading ${f}:`, err.message);
  }
}

console.log(`Indexed ${baseFiches.length} base fiches and ${variantFiches.length} variant fiches.`);

// 2. Build src/data/cards.json (Base cards only)
console.log('3. Generating src/data/cards.json...');
baseFiches.sort((a, b) => a.data.code.localeCompare(b.data.code, undefined, { numeric: true }));

const builtCards = baseFiches.map(item => {
  const d = item.data;
  const code = (d.code || item.fileName.replace(/\.json$/i, '')).toUpperCase().trim();
  const setCode = code.split('-')[0];
  const imagePaths = [d.image_fr, d.image_en, d.image_jp, d.image_path, d.image_url]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i);

  const defaultImg = d.image_fr || d.image_en || d.image_jp || d.image_path || d.image_url || '';

  return {
    id: code,
    card_code: code,
    set_code: setCode,
    name: d.name || code,
    name_fr: d.language === 'fr' ? d.name : undefined,
    category: mapCategory(d.category),
    rarity: d.rarity || 'C',
    variant: 1,
    variant_type: 'BASE',
    variant_label: 'Base',
    color: mapColor(d.color),
    cost: d.cost !== null && d.cost !== undefined ? Number(d.cost) : null,
    power: d.power !== null && d.power !== undefined ? Number(d.power) : null,
    counter: d.counter !== null && d.counter !== undefined ? Number(d.counter) : 0,
    life: d.life !== null && d.life !== undefined ? Number(d.life) : null,
    type: d.types ? d.types.split(/[\/,]/).map(t => t.trim()).filter(Boolean) : [],
    attribute: d.attribute || '',
    effect: d.effect || '',
    trigger: d.trigger || '',
    block: d.block ? String(d.block) : undefined,
    language: d.language || 'en',
    image_path: d.image_path || d.image_url || defaultImg,
    image_url: d.image_url || d.image_path || defaultImg,
    image_fr: d.image_fr || null,
    image_en: d.image_en || null,
    image_jp: d.image_jp || null,
    _imagePaths: imagePaths,
    _defaultImagePath: defaultImg,
    scalpeurs_image_url: d.image_url || d.image_path || defaultImg,
    price_eur: d.price_eur ?? null,
    price_min_eur: d.price_min_eur ?? d.price_eur ?? null,
    price_avg7_eur: d.price_avg7_eur ?? null,
    price_avg30_eur: d.price_avg30_eur ?? null,
    listings_count: 0,
    cardmarket_url: d.cardmarket_url || '',
    cardmarket_url_jp: d.cardmarket_url_jp || '',
    tcgplayer_url: d.tcgplayer_url || '',
    detail_file: item.fileName
  };
});

fs.writeFileSync(TARGET_CARDS_JSON, JSON.stringify(builtCards, null, 2), 'utf-8');
console.log(`Saved ${builtCards.length} base cards to ${TARGET_CARDS_JSON}`);

// Helper to determine variant classification
function classifyVariant(d, vIndex) {
  const vName = (d.variant_name || d.name || '').toLowerCase();
  const rar = (d.rarity || '').toUpperCase();
  const idLow = (d.code || '').toLowerCase();

  const isTourney = vName.includes('winner') || vName.includes('championship') || vName.includes('cup') || vName.includes('treasure') || vName.includes('3on3') || vName.includes('serial number') || idLow.includes('champ');
  if (isTourney) {
    return { variantType: 'WINNER', variantLabel: d.variant_name || 'Tournament Promo 🏆' };
  }

  const isManga = vName.includes('manga') || rar === 'MANGA';
  if (isManga) {
    return { variantType: 'MANGA', variantLabel: d.variant_name || 'Manga Rare 👑' };
  }

  const isSP = vName.includes('(sp)') || vName.includes(' sp ') || vName.endsWith(' sp') || vName.includes('wanted') || vName.includes('special card') || rar === 'SP';
  if (isSP) {
    return { variantType: 'SP', variantLabel: d.variant_name || 'Special Card (SP) ⭐' };
  }

  if (vIndex > 1 || vName.includes('parallel') || vName.includes('alternate')) {
    return { variantType: 'ALT', variantLabel: d.variant_name || 'Alternate Art ✨' };
  }

  return { variantType: 'BASE', variantLabel: d.variant_name || 'Base' };
}

// 3. Build src/data/variants.json
console.log('4. Generating src/data/variants.json...');
variantFiches.sort((a, b) => {
  const codeCmp = a.data.code.localeCompare(b.data.code, undefined, { numeric: true });
  if (codeCmp !== 0) return codeCmp;
  return (a.data.variant_index || 1) - (b.data.variant_index || 1);
});

const builtVariants = variantFiches.map(item => {
  const d = item.data;
  const code = (d.code || item.fileName.split('-v')[0]).toUpperCase().trim();
  const vIndex = d.variant_index || parseInt((d.variant_version || 'v1').replace('v', ''), 10) || 1;
  const img = d.image_path || d.image_url || '';
  const { variantType, variantLabel } = classifyVariant(d, vIndex);

  return {
    id: `${code}_v${vIndex}`,
    card_code: code,
    variant: vIndex,
    variant_version: d.variant_version || `v${vIndex}`,
    variant_type: variantType,
    variant_label: variantLabel,
    name: d.name || code,
    rarity: d.rarity || 'C',
    color: mapColor(d.color),
    image_path: img,
    image_url: img,
    image_fr: d.image_fr || null,
    image_en: d.image_en || null,
    image_jp: d.image_jp || null,
    price_eur: d.price_eur ?? null,
    price_min_eur: d.price_min_eur ?? d.price_eur ?? null,
    price_avg7_eur: d.price_avg7_eur ?? null,
    price_avg30_eur: d.price_avg30_eur ?? null,
    listings_count: 0,
    cardmarket_url: d.cardmarket_url || '',
    cardmarket_url_jp: d.cardmarket_url_jp || '',
    tcgplayer_url: d.tcgplayer_url || '',
    detail_file: item.fileName
  };
});

fs.writeFileSync(TARGET_VARIANTS_JSON, JSON.stringify(builtVariants, null, 2), 'utf-8');
console.log(`Saved ${builtVariants.length} variants to ${TARGET_VARIANTS_JSON}`);

// 4. Build src/data/optcg_complete_database.json (All variant prints directly from details)
console.log('5. Generating src/data/optcg_complete_database.json...');
const builtCompleteDb = variantFiches.map(item => {
  const d = item.data;
  const code = (d.code || item.fileName.split('-v')[0]).toUpperCase().trim();
  const vIndex = d.variant_index || parseInt((d.variant_version || 'v1').replace('v', ''), 10) || 1;
  const img = d.image_path || d.image_url || '';
  const { variantType, variantLabel } = classifyVariant(d, vIndex);

  return {
    id: `${code}-v${vIndex}`,
    card_code: code,
    name: d.name || code,
    variant_name: d.variant_name || d.name,
    variant_version: d.variant_version || `v${vIndex}`,
    variant: vIndex,
    variant_type: variantType,
    variant_label: variantLabel,
    language: d.language || 'en',
    rarity: d.rarity || 'C',
    type: d.category || 'Character',
    cost: d.cost !== null && d.cost !== undefined ? String(d.cost) : null,
    power: d.power !== null && d.power !== undefined ? String(d.power) : null,
    counter: d.counter !== null && d.counter !== undefined ? String(d.counter) : null,
    color: mapColor(d.color),
    attribute: d.attribute || null,
    types: d.types ? d.types.split(/[\/,]/).map(t => t.trim()).filter(Boolean) : [],
    effect: d.effect || '',
    trigger: d.trigger || null,
    set: code.split('-')[0],
    image_path: img,
    image_url: img,
    image_fr: d.image_fr || null,
    image_en: d.image_en || null,
    image_jp: d.image_jp || null,
    _imagePaths: [img, d.image_fr, d.image_en, d.image_jp].filter(Boolean),
    _defaultImagePath: img,
    price_eur: d.price_eur ?? null,
    price_min_eur: d.price_min_eur ?? d.price_eur ?? null,
    price_avg7_eur: d.price_avg7_eur ?? null,
    price_avg30_eur: d.price_avg30_eur ?? null,
    listings_count: 0,
    cardmarket_url: d.cardmarket_url || '',
    cardmarket_url_jp: d.cardmarket_url_jp || '',
    tcgplayer_url: d.tcgplayer_url || '',
    detail_file: item.fileName
  };
});

fs.writeFileSync(TARGET_COMPLETE_DB, JSON.stringify(builtCompleteDb, null, 2), 'utf-8');
console.log(`Saved ${builtCompleteDb.length} prints to ${TARGET_COMPLETE_DB}`);

// 5. Build src/data/card_links.json (Lookup index from details fiches)
console.log('6. Generating src/data/card_links.json...');
const byPath = {};
const byBasename = {};
const byCode = {};
const byId = {};
const byFile = {};

for (const item of [...baseFiches, ...variantFiches]) {
  const d = item.data;
  const fName = item.fileName;
  const code = (d.code || fName.split('-v')[0]).toUpperCase().trim();
  const fileEntry = {
    cm: d.cardmarket_url || null,
    cm_jp: d.cardmarket_url_jp || null,
    tcg: d.tcgplayer_url || null,
    price_eur: d.price_eur ?? null,
    image_url: d.image_path || d.image_url || null,
    image_fr: d.image_fr || null,
    image_en: d.image_en || null,
    image_jp: d.image_jp || null,
    detail_file: fName,
    variant_version: d.variant_version || null,
    name: d.variant_name || d.name || null
  };

  byFile[fName.toLowerCase()] = fileEntry;
  byFile[fName.toLowerCase().replace(/\.json$/i, '')] = fileEntry;

  // byId
  if (d.code) {
    if (d.variant_version) {
      byId[`${d.code}-${d.variant_version}`] = fileEntry;
      byId[`${d.code}_${d.variant_version}`] = fileEntry;
    } else {
      byId[d.code] = fileEntry;
    }
  }

  // byPath & byBasename
  const images = [d.image_path, d.image_url, d.image_fr, d.image_en, d.image_jp].filter(Boolean);
  for (const img of images) {
    const cleanPath = img
      .replace(/^https?:\/\/scalpeurs\.com\/img\//i, '')
      .replace(/^https?:\/\/scalpeurs\.com\//i, '')
      .replace(/^\/img\//i, '')
      .replace(/^\//i, '')
      .toLowerCase();

    if (!byPath[cleanPath]) {
      byPath[cleanPath] = fileEntry;
    }

    const bName = cleanPath.split('/').pop();
    if (bName) {
      if (!byBasename[bName]) {
        byBasename[bName] = fileEntry;
      }
      const noExt = bName.replace(/\.(webp|png|jpg|jpeg)$/i, '');
      if (!byBasename[noExt]) {
        byBasename[noExt] = fileEntry;
      }
    }
  }

  // byCode for base cards or v1
  if (code && (!fName.includes('-v') || fName.endsWith('-v1.json'))) {
    if (!byCode[code] || fName.endsWith('-v1.json')) {
      byCode[code] = fileEntry;
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
console.log(`Saved card_links.json: ${Object.keys(byPath).length} paths, ${Object.keys(byBasename).length} basenames, ${Object.keys(byCode).length} codes, ${Object.keys(byFile).length} files.`);

console.log('=== DATA REBUILD FROM DETAILS COMPLETED SUCCESSFULLY ===');
