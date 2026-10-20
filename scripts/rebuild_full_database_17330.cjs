/**
 * REBUILD COMPLETE DATABASE - ALL 17,330 PRINTS & ALL LANGUAGES (JP, EN, FR)
 * 
 * Ensures:
 * 1. 100% of all 17,330 prints from onepiece-database/data/cards-all.json are preserved.
 *    - 5,651 Japanese cards (language: 'jp')
 *    - 7,606 English cards (language: 'en')
 *    - 4,073 French cards (language: 'fr')
 * 2. Enriched with verified gameplay stats, high-def images, and 1:1 Cardmarket URLs
 *    from onepiece-database/data/details/*.json.
 * 3. Base cards in cards.json (all 2,885 unique card codes) have full Japanese names (jp_name),
 *    French names (name_fr), and localized image triplets (image_fr, image_en, image_jp).
 * 4. card_links.json fully indexed for O(1) synchronous lookup.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const ONEPIECE_DIR = 'C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data';
const DETAILS_DIR = path.join(ONEPIECE_DIR, 'details');
const PUBLIC_DETAILS_DIR = path.join(ROOT_DIR, 'public/data/details');

console.log('=== STARTING REBUILD OF COMPLETE 17,330 PRINTS DATABASE ===');

// 1. Load cards-all.json
const cardsAllPath = path.join(ONEPIECE_DIR, 'cards-all.json');
if (!fs.existsSync(cardsAllPath)) {
  console.error('cards-all.json not found:', cardsAllPath);
  process.exit(1);
}
const cardsAll = JSON.parse(fs.readFileSync(cardsAllPath, 'utf8'));
console.log(`Loaded ${cardsAll.length} prints from cards-all.json`);

// 2. Load all detail files from onepiece-database/data/details and public/data/details
const detailsByFile = new Map();
const detailsByCodeVariant = new Map();
const detailsByCode = new Map();

function loadDetailsFromDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
  for (const f of files) {
    try {
      const fullPath = path.join(dirPath, f);
      const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      const code = (data.code || f.replace(/-v\d+\.json$/i, '').replace(/\.json$/i, '')).toUpperCase().trim();
      const vMatch = f.match(/-v(\d+)\.json$/i);
      const vNum = data.variant_index || (vMatch ? parseInt(vMatch[1], 10) : 1);

      detailsByFile.set(f.toLowerCase(), { ...data, _fileName: f, _code: code, _vNum: vNum });
      detailsByCodeVariant.set(`${code}_${vNum}`, { ...data, _fileName: f, _code: code, _vNum: vNum });
      if (!detailsByCode.has(code) || vNum === 1) {
        detailsByCode.set(code, { ...data, _fileName: f, _code: code, _vNum: vNum });
      }
    } catch (e) {}
  }
}

loadDetailsFromDir(DETAILS_DIR);
// Overlay public details (contains latest targeted fixes like ST15-005, ST16-004, EB04-061)
loadDetailsFromDir(PUBLIC_DETAILS_DIR);
console.log(`Indexed ${detailsByFile.size} detail fiches across ${detailsByCode.size} card codes.`);

// Helper functions
function normalizeCategory(cat) {
  if (!cat) return 'Character';
  const c = String(cat).toUpperCase();
  if (c.includes('LEADER')) return 'Leader';
  if (c.includes('EVENT')) return 'Event';
  if (c.includes('STAGE')) return 'Stage';
  return 'Character';
}

function normalizeColor(color) {
  if (!color) return ['Red'];
  if (Array.isArray(color)) return color;
  const s = String(color).trim();
  const COLOR_MAP = {
    'rouge': 'Red', 'vert': 'Green', 'bleu': 'Blue', 'violet': 'Purple', 'noir': 'Black', 'jaune': 'Yellow',
    'red': 'Red', 'green': 'Green', 'blue': 'Blue', 'purple': 'Purple', 'black': 'Black', 'yellow': 'Yellow',
    '赤': 'Red', '緑': 'Green', '青': 'Blue', '紫': 'Purple', '黒': 'Black', '黄': 'Yellow'
  };
  const parts = s.split(/[\/,]/).map(p => p.trim());
  const mapped = parts.map(p => COLOR_MAP[p.toLowerCase()] || COLOR_MAP[p] || 'Red');
  return mapped.length > 0 ? mapped : ['Red'];
}

function normalizeTypes(types) {
  if (!types) return [];
  if (Array.isArray(types)) return types.filter(Boolean);
  return String(types).split(/[\/,]/).map(t => t.trim()).filter(Boolean);
}

function getSetCode(code, slug) {
  const m = String(code).match(/^([A-Z0-9]+)-/);
  if (m) return m[1];
  if (slug) return String(slug).toUpperCase();
  return 'OP';
}

function computeVariantType(c, detail) {
  const rar = ((detail?.rarity || c.rarity) || '').toUpperCase();
  const artType = (c.art_type || '').toUpperCase();
  const name = ((detail?.variant_name || c.name) || '').toLowerCase();
  const idLow = (c.id || '').toLowerCase();

  if (rar === 'MANGA' || artType === 'MANGA_ART' || name.includes('manga') || idLow.includes('manga')) return 'MANGA';
  if (rar === 'SP' || name.includes('(sp)') || name.includes(' sp ') || name.endsWith(' sp') || name.includes('special card') || idLow.includes('_sp')) return 'SP';
  if (name.includes('winner') || name.includes('top player') || name.includes('champ') || name.includes('tournament') || idLow.includes('champ') || idLow.includes('cup') || idLow.includes('3on3')) return 'WINNER';
  if (c.variant > 1 || artType === 'ALT_ART' || name.includes('parallel') || name.includes('alternate')) return 'ALT';
  return 'BASE';
}

function computeVariantLabel(c, detail, vType) {
  if (vType === 'MANGA') return 'Manga Rare 👑';
  if (vType === 'SP') return 'Special Card (SP) ⭐';
  if (vType === 'WINNER') return detail?.variant_name || 'Tournament Winner 🏆';
  if (detail?.variant_name && !detail.variant_name.toLowerCase().startsWith(c.name?.toLowerCase())) {
    return detail.variant_name;
  }
  if (c.variant > 1) return `Version ${c.variant}`;
  return 'Base';
}

// 3. Group cards by code to build base cards (cards.json)
const printsByCode = new Map();
for (const p of cardsAll) {
  const code = (p.code || '').toUpperCase().trim();
  if (!code) continue;
  if (!printsByCode.has(code)) printsByCode.set(code, []);
  printsByCode.get(code).push(p);
}

console.log(`Found ${printsByCode.size} unique card codes across prints.`);

// Build cards.json (2,885 base cards)
const baseCards = [];
for (const [code, prints] of printsByCode.entries()) {
  const setCode = getSetCode(code, prints[0]?.set_slug);

  // Find representative prints for EN, FR, JP
  const enPrint = prints.find(p => p.language === 'en') || prints[0];
  const frPrint = prints.find(p => p.language === 'fr');
  const jpPrint = prints.find(p => p.language === 'jp');

  // Find detail fiche (prefer {CODE}.json or {CODE}-v1.json)
  const detail = detailsByFile.get(`${code}.json`.toLowerCase()) ||
                 detailsByFile.get(`${code}-v1.json`.toLowerCase()) ||
                 detailsByCode.get(code);

  const nameEn = enPrint?.name || detail?.name || code;
  const nameFr = frPrint?.name || detail?.name_fr || (detail?.language === 'fr' ? detail?.name : undefined);
  const nameJp = jpPrint?.name_jp || (jpPrint?.language === 'jp' ? jpPrint?.name : undefined) || detail?.name_jp;

  const imageEn = enPrint?.image_url || detail?.image_en || detail?.image_url || null;
  const imageFr = frPrint?.image_url || detail?.image_fr || null;
  const imageJp = jpPrint?.image_url || detail?.image_jp || null;

  const allImgs = [imageFr, imageEn, imageJp, detail?.image_path].filter(Boolean);
  const uniqueImgs = allImgs.filter((v, i, a) => a.indexOf(v) === i);
  const defaultImg = imageFr || imageEn || imageJp || uniqueImgs[0] || 'https://placehold.co/300x420/1e293b/94a3b8?text=No+Card';

  const category = normalizeCategory(detail?.category || prints[0]?.category);
  const colors = normalizeColor(detail?.color || prints[0]?.color);
  const types = normalizeTypes(detail?.types);
  const officialRarity = detail?.rarity || prints[0]?.rarity || 'C';

  const priceEur = detail?.price_eur !== undefined && detail?.price_eur !== null ? detail.price_eur : (enPrint?.price_eur ?? jpPrint?.price_eur ?? null);
  const priceMinEur = detail?.price_min_eur !== undefined && detail?.price_min_eur !== null ? detail.price_min_eur : (enPrint?.price_min_eur ?? priceEur);
  const priceAvg7 = detail?.price_avg7_eur !== undefined && detail?.price_avg7_eur !== null ? detail.price_avg7_eur : null;
  const priceAvg30 = detail?.price_avg30_eur !== undefined && detail?.price_avg30_eur !== null ? detail.price_avg30_eur : null;

  baseCards.push({
    id: code,
    card_code: code,
    set_code: setCode,
    name: nameEn,
    name_fr: nameFr,
    jp_name: nameJp,
    category: category,
    rarity: officialRarity,
    variant: 1,
    variant_type: 'BASE',
    variant_label: 'Base',
    color: colors,
    cost: detail?.cost !== undefined && detail?.cost !== null ? Number(detail.cost) : null,
    power: detail?.power !== undefined && detail?.power !== null ? Number(detail.power) : null,
    counter: detail?.counter !== undefined && detail?.counter !== null ? Number(detail.counter) : 0,
    life: detail?.life !== undefined && detail?.life !== null ? Number(detail.life) : null,
    type: types,
    attribute: detail?.attribute || '',
    effect: detail?.effect || '',
    effect_fr: detail?.effect_fr || undefined,
    trigger: detail?.trigger || '',
    block: detail?.block !== undefined && detail?.block !== null ? String(detail.block) : '',
    language: 'en',
    is_japanese: !enPrint && !frPrint,
    image_path: defaultImg,
    image_url: defaultImg,
    image_fr: imageFr,
    image_en: imageEn,
    image_jp: imageJp,
    _imagePaths: uniqueImgs.length > 0 ? uniqueImgs : [defaultImg],
    _defaultImagePath: defaultImg,
    scalpeurs_image_url: defaultImg,
    price_eur: priceEur,
    price_min_eur: priceMinEur,
    price_avg7_eur: priceAvg7,
    price_avg30_eur: priceAvg30,
    listings_count: detail?.listings_count || prints[0]?.listings_count || 0,
    cardmarket_url: detail?.cardmarket_url || enPrint?.cardmarket_url || frPrint?.cardmarket_url || null,
    cardmarket_url_jp: detail?.cardmarket_url_jp || jpPrint?.cardmarket_url_jp || jpPrint?.cardmarket_url || null,
    tcgplayer_url: detail?.tcgplayer_url || null,
    detail_file: detail?._fileName || `${code}.json`
  });
}

baseCards.sort((a, b) => a.card_code.localeCompare(b.card_code, undefined, { numeric: true }));
console.log(`Generated ${baseCards.length} base cards in cards.json`);

const baseCardsMap = new Map(baseCards.map(c => [c.card_code, c]));

// 4. Build optcg_complete_database.json (All 17,330 prints)
console.log('Generating complete database for all 17,330 prints...');
const completeDb = [];

for (const c of cardsAll) {
  const code = (c.code || '').toUpperCase().trim();
  const vNum = c.variant || 1;
  const parent = baseCardsMap.get(code);

  // Detail fiche match
  let detail = null;
  if (c.detail_file && detailsByFile.has(c.detail_file.toLowerCase())) {
    detail = detailsByFile.get(c.detail_file.toLowerCase());
  } else if (code && detailsByCodeVariant.has(`${code}_${vNum}`)) {
    detail = detailsByCodeVariant.get(`${code}_${vNum}`);
  } else if (code && detailsByCode.has(code)) {
    detail = detailsByCode.get(code);
  }

  const vType = computeVariantType(c, detail);
  const vLabel = computeVariantLabel(c, detail, vType);
  const lang = (c.language || 'en').toLowerCase();
  const setCode = getSetCode(code, c.set_slug);

  const colors = normalizeColor(detail?.color || c.color || parent?.color);
  const types = normalizeTypes(detail?.types || parent?.type);
  const category = normalizeCategory(detail?.category || c.category || parent?.category);
  const officialRarity = detail?.rarity || c.rarity || parent?.rarity || 'C';

  const imgPath = c.image_path || c.image_url || detail?.image_path || '';
  const imgUrl = c.image_url || c.image_path || detail?.image_url || '';

  // Localized image fields for this specific print
  const imageJp = lang === 'jp' ? imgUrl : (detail?.image_jp || null);
  const imageEn = lang === 'en' ? imgUrl : (detail?.image_en || null);
  const imageFr = lang === 'fr' ? imgUrl : (detail?.image_fr || null);

  const priceEur = detail?.price_eur !== undefined && detail?.price_eur !== null ? detail.price_eur : (c.price_eur ?? null);
  const priceMinEur = detail?.price_min_eur !== undefined && detail?.price_min_eur !== null ? detail.price_min_eur : (c.price_min_eur ?? priceEur);
  const priceAvg7 = detail?.price_avg7_eur !== undefined && detail?.price_avg7_eur !== null ? detail.price_avg7_eur : null;
  const priceAvg30 = detail?.price_avg30_eur !== undefined && detail?.price_avg30_eur !== null ? detail.price_avg30_eur : null;

  // Cardmarket URL: for JP cards, prefer JP cardmarket URL
  let cmUrl = detail?.cardmarket_url || c.cardmarket_url || null;
  const cmJpUrl = detail?.cardmarket_url_jp || c.cardmarket_url_jp || null;
  if (lang === 'jp' && cmJpUrl) {
    cmUrl = cmJpUrl;
  }

  completeDb.push({
    id: c.id,
    card_code: code || parent?.card_code || 'OP',
    name: c.name || detail?.name || parent?.name || code,
    name_fr: lang === 'fr' ? c.name : (parent?.name_fr || detail?.name_fr),
    name_jp: c.name_jp || (lang === 'jp' ? c.name : parent?.jp_name),
    variant_name: detail?.variant_name || c.name || parent?.name,
    variant_version: detail?.variant_version || `v${vNum}`,
    variant: vNum,
    variant_type: vType,
    variant_label: vLabel,
    language: lang,
    rarity: officialRarity,
    type: category.toUpperCase(),
    cost: detail?.cost !== undefined && detail?.cost !== null ? String(detail.cost) : (parent?.cost !== null && parent?.cost !== undefined ? String(parent.cost) : null),
    power: detail?.power !== undefined && detail?.power !== null ? String(detail.power) : (parent?.power !== null && parent?.power !== undefined ? String(parent.power) : null),
    counter: detail?.counter !== undefined && detail?.counter !== null ? String(detail.counter) : (parent?.counter !== null && parent?.counter !== undefined ? String(parent.counter) : '0'),
    color: colors,
    attribute: detail?.attribute || parent?.attribute || null,
    types: types,
    effect: detail?.effect || parent?.effect || '',
    trigger: detail?.trigger || parent?.trigger || null,
    set: c.set_name || setCode,
    image_path: imgPath,
    image_url: imgUrl,
    image_fr: imageFr,
    image_en: imageEn,
    image_jp: imageJp,
    _imagePaths: [imgUrl, imgPath].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i),
    _defaultImagePath: imgUrl || imgPath,
    price_eur: priceEur,
    price_min_eur: priceMinEur,
    price_avg7_eur: priceAvg7,
    price_avg30_eur: priceAvg30,
    listings_count: detail?.listings_count || c.listings_count || 0,
    cardmarket_url: cmUrl,
    cardmarket_url_jp: cmJpUrl,
    tcgplayer_url: detail?.tcgplayer_url || null,
    detail_file: detail?._fileName || (c.detail_file && !c.detail_file.startsWith('-') ? c.detail_file : null),
    art_type: c.art_type || 'REG_ART'
  });
}

console.log(`Generated complete database with ${completeDb.length} prints.`);
const langCounts = {};
for (const card of completeDb) {
  langCounts[card.language] = (langCounts[card.language] || 0) + 1;
}
console.log('Language breakdown in completeDb:', langCounts);

// 5. Build variants.json (All distinct variants for getVariantsByCode)
console.log('Building variants.json...');
const variantsList = [];
for (const c of completeDb) {
  variantsList.push({
    id: c.id,
    card_code: c.card_code,
    variant: c.variant,
    variant_version: c.variant_version,
    variant_type: c.variant_type,
    variant_label: c.variant_label,
    name: c.name,
    name_fr: c.name_fr,
    name_jp: c.name_jp,
    rarity: c.rarity,
    color: c.color,
    language: c.language,
    image_path: c.image_path,
    image_url: c.image_url,
    image_fr: c.image_fr,
    image_en: c.image_en,
    image_jp: c.image_jp,
    price_eur: c.price_eur,
    price_min_eur: c.price_min_eur,
    price_avg7_eur: c.price_avg7_eur,
    price_avg30_eur: c.price_avg30_eur,
    listings_count: c.listings_count,
    cardmarket_url: c.cardmarket_url,
    cardmarket_url_jp: c.cardmarket_url_jp,
    tcgplayer_url: c.tcgplayer_url,
    detail_file: c.detail_file
  });
}

// 6. Build card_links.json (1:1 ultra-fast lookup index)
console.log('Building card_links.json index...');
const byFile = {};
const byId = {};
const byCode = {};
const byPath = {};
const byBasename = {};

function registerLinkEntry(fileKey, idKeys, codeKey, cardData, detailFileName) {
  const cm = cardData.cardmarket_url || null;
  const cm_jp = cardData.cardmarket_url_jp || null;
  const tcg = cardData.tcgplayer_url || null;
  const price = cardData.price_eur !== undefined && cardData.price_eur !== null ? cardData.price_eur : null;
  const lang = (cardData.language || 'en').toLowerCase();

  const entry = {
    cm,
    cm_jp,
    tcg,
    price_eur: price,
    image_url: cardData.image_url || cardData.image_path || null,
    image_fr: cardData.image_fr || null,
    image_en: cardData.image_en || null,
    image_jp: cardData.image_jp || null,
    detail_file: detailFileName,
    variant_version: cardData.variant_version || null,
    name: cardData.variant_name || cardData.name || null
  };

  if (detailFileName) {
    byFile[detailFileName.toLowerCase()] = entry;
    byFile[detailFileName] = entry;
  }

  for (const id of idKeys) {
    if (id) {
      byId[id] = entry;
      byId[id.toLowerCase()] = entry;
      byId[id.toUpperCase()] = entry;
    }
  }

  const images = [cardData.image_path, cardData.image_url, cardData.image_fr, cardData.image_en, cardData.image_jp].filter(Boolean);
  for (const img of images) {
    const rawImg = String(img).toLowerCase();
    const cleanImg = rawImg.replace(/^https?:\/\/[^\/]+/, '').replace(/^\//, '');
    byPath[cleanImg] = entry;
    byPath['/' + cleanImg] = entry;
    byPath[rawImg] = entry;

    const bName = path.basename(rawImg);
    const nameWithoutExt = bName.replace(/\.(webp|png|jpg|jpeg)$/i, '');

    if (!byBasename[bName]) byBasename[bName] = {};
    byBasename[bName][lang] = entry;
    if (!byBasename[nameWithoutExt]) byBasename[nameWithoutExt] = {};
    byBasename[nameWithoutExt][lang] = entry;
  }

  if (codeKey) {
    const cUpper = codeKey.toUpperCase().trim();
    if (!byCode[cUpper]) {
      byCode[cUpper] = {
        cm: null, cm_jp: null, tcg: null, price_eur: null,
        image_url: null, image_fr: null, image_en: null, image_jp: null,
        detail_file: detailFileName, variant_version: cardData.variant_version || 'v1',
        name: cardData.name
      };
    }
    const cur = byCode[cUpper];
    if (cardData.variant === 1 || !cur.cm) {
      if (cm) cur.cm = cm;
      if (cm_jp) cur.cm_jp = cm_jp;
      if (tcg) cur.tcg = tcg;
      if (price !== null) cur.price_eur = price;
      if (cardData.image_url) cur.image_url = cardData.image_url;
      if (cardData.image_fr) cur.image_fr = cardData.image_fr;
      if (cardData.image_en) cur.image_en = cardData.image_en;
      if (cardData.image_jp) cur.image_jp = cardData.image_jp;
      cur.detail_file = detailFileName;
    }
  }
}

// Index all detail files
for (const [fName, d] of detailsByFile.entries()) {
  const code = d._code;
  const vNum = d._vNum;
  registerLinkEntry(fName, [d.code, `${code}-v${vNum}`, `${code}_v${vNum}`], code, d, fName);
}

// Index all base cards
for (const b of baseCards) {
  registerLinkEntry(b.detail_file, [b.card_code, `${b.card_code}-v1`, `${b.card_code}_v1`], b.card_code, b, b.detail_file);
}

// Index all complete prints
for (const p of completeDb) {
  registerLinkEntry(p.detail_file, [p.id, `${p.card_code}-v${p.variant}`, `${p.card_code}_v${p.variant}`], p.card_code, p, p.detail_file);
}

const cardLinksData = { byFile, byId, byCode, byPath, byBasename };

// 7. Write all files to src/data/
console.log('Writing src/data/cards.json...');
fs.writeFileSync(path.join(ROOT_DIR, 'src/data/cards.json'), JSON.stringify(baseCards, null, 2), 'utf8');

console.log('Writing src/data/optcg_complete_database.json...');
fs.writeFileSync(path.join(ROOT_DIR, 'src/data/optcg_complete_database.json'), JSON.stringify(completeDb, null, 2), 'utf8');

console.log('Writing src/data/variants.json...');
fs.writeFileSync(path.join(ROOT_DIR, 'src/data/variants.json'), JSON.stringify(variantsList, null, 2), 'utf8');

console.log('Writing src/data/card_links.json...');
fs.writeFileSync(path.join(ROOT_DIR, 'src/data/card_links.json'), JSON.stringify(cardLinksData), 'utf8');

console.log('=== COMPLETE REBUILD SUCCESSFULLY FINISHED ===');
console.log(`- Base cards: ${baseCards.length}`);
console.log(`- Complete prints: ${completeDb.length} (JP: ${langCounts.jp}, EN: ${langCounts.en}, FR: ${langCounts.fr})`);
console.log(`- Variants: ${variantsList.length}`);
