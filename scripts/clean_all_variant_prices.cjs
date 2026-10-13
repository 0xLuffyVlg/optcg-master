const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const cardsPath = path.join(DATA_DIR, 'cards.json');
const variantsPath = path.join(DATA_DIR, 'variants.json');
const mappingPath = path.join(DATA_DIR, 'cardtrader_mapping.json');
const bpPricesPath = path.join(DATA_DIR, 'cardtrader_blueprint_prices.json');
const ctPricesPath = path.join(DATA_DIR, 'cardtrader_prices.json');
const cmPricesPath = path.join(DATA_DIR, 'cardmarket_prices.json');
const trendsPath = path.join(DATA_DIR, 'market_trends.json');

const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));
const variants = JSON.parse(fs.readFileSync(variantsPath, 'utf8'));
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
const bpPrices = JSON.parse(fs.readFileSync(bpPricesPath, 'utf8'));
const cmPrices = JSON.parse(fs.readFileSync(cmPricesPath, 'utf8'));
let baseCtPrices = {};
try { baseCtPrices = JSON.parse(fs.readFileSync(ctPricesPath, 'utf8')); } catch(e) {}

const SET_NAMES = {
  'OP01': 'Romance Dawn',
  'OP02': 'Paramount War',
  'OP03': 'Pillars of Strength',
  'OP04': 'Kingdoms of Intrigue',
  'OP05': 'Awakening of the New Era',
  'OP06': 'Wings of the Captain',
  'OP07': '500 Years in the Future',
  'OP08': 'Two Legends',
  'OP09': 'Emperors in the New World',
  'OP10': 'The Royal Bloodline',
  'OP11': 'Fist of Divine Speed',
  'OP12': 'Legacy of the Master',
  'OP13': 'Carrying on his Will',
  'OP14': 'The Azure Dragon',
  'OP15': 'Adventure on Kami',
  'OP16': 'The Pirate Island',
  'OP17': 'The Final Battle',
  'OP18': 'The Dominance of God',
  'EB01': 'Memorial Collection',
  'EB02': 'Anime 25th',
  'EB03': 'Egghead',
  'EB04': 'Extra Booster',
  'EB05': 'Heroines',
  'PRB01': 'The Best'
};

function matchVariantToBlueprintAccurately(v, cardCode, blueprints) {
  if (!blueprints || blueprints.length === 0) return null;
  const setCode = cardCode.split('-')[0].toUpperCase();
  const setName = SET_NAMES[setCode];
  
  const label = (v.variant_label || '').toLowerCase();
  const img = (v.image_path || '').toLowerCase();
  
  const nativeBps = setName ? blueprints.filter(b => (b.expansion_name || '').toLowerCase().includes(setName.toLowerCase())) : [];
  const candidateBps = nativeBps.length > 0 ? nativeBps : blueprints;

  // 1. Base card
  const isBase = label.includes('base') || (!img.includes('_p') && !img.includes('_sp') && !img.includes('_r'));
  if (isBase) {
    const baseBp = candidateBps.find(b => 
      (b.collector_number === cardCode || b.collector_number === cardCode + '-R') &&
      b.rarity !== 'Alternate Art' && 
      b.rarity !== 'Promo' &&
      !b.version?.toLowerCase().includes('alternate') && 
      !b.version?.toLowerCase().includes('wanted') && 
      !b.version?.toLowerCase().includes('manga') &&
      !b.expansion_name?.toLowerCase().includes('premium') &&
      !b.expansion_name?.toLowerCase().includes('championship')
    ) || candidateBps.find(b => 
      !b.version?.toLowerCase().includes('alternate') && 
      !b.version?.toLowerCase().includes('wanted') && 
      !b.version?.toLowerCase().includes('manga') &&
      !b.expansion_name?.toLowerCase().includes('premium') &&
      !b.expansion_name?.toLowerCase().includes('championship')
    ) || candidateBps.find(b => !b.version) || candidateBps[0];
    return baseBp;
  }

  // 2. Manga Super Parallel (Manga Panel)
  if (label.includes('manga') || img.includes('manga')) {
    if (img.includes('_p4') || label.includes('red') || label.includes('gold')) {
      const redManga = blueprints.find(b => (b.version || '').toLowerCase().includes('red manga') || (b.version || '').toLowerCase().includes('gold manga') || (b.collector_number || '').endsWith('r'));
      if (redManga) return redManga;
    }
    const mangaBp = candidateBps.find(b => (b.version || '').toLowerCase().includes('manga'))
      || blueprints.find(b => (b.version || '').toLowerCase().includes('manga'));
    if (mangaBp) return mangaBp;
  }

  // 3. Wanted Poster
  if (label.includes('wanted') || img.includes('wanted') || (setCode === 'OP13' && img.includes('_p2')) || (setCode === 'OP03' && img.includes('_p2') && candidateBps.some(b => b.version?.toLowerCase().includes('wanted')))) {
    const wantedBp = candidateBps.find(b => (b.version || '').toLowerCase().includes('wanted') || (b.collector_number || '').endsWith('w'))
      || blueprints.find(b => (b.version || '').toLowerCase().includes('wanted'));
    if (wantedBp) return wantedBp;
  }

  // 4. Special Rare / SP / Special Parallel
  if (label.includes('sp') || label.includes('special') || img.includes('_sp')) {
    const spBp = candidateBps.find(b => (b.version || '').toLowerCase().includes('special') || (b.rarity || '').toLowerCase().includes('special') || (b.collector_number || '').endsWith('s') || (b.collector_number || '').endsWith('sp'))
      || blueprints.find(b => (b.version || '').toLowerCase().includes('special') || (b.rarity || '').toLowerCase().includes('special'));
    if (spBp) return spBp;
  }

  // 5. Explicit Winner / Championship / Judge / Serialized Promo
  if (label.includes('winner') || label.includes('championship') || label.includes('judge') || label.includes('serial') || img.includes('winner') || img.includes('judge')) {
    const promoBp = blueprints.find(b => (b.expansion_name || '').toLowerCase().includes('championship') || (b.version || '').toLowerCase().includes('winner') || (b.version || '').toLowerCase().includes('serial'));
    if (promoBp) return promoBp;
  }

  // 6. Reprint PRB
  if (label.includes('réimpression') || img.includes('_r')) {
    // Make sure non-manga reprints don't match the Manga reprint blueprint!
    const rBp = blueprints.find(b => (b.expansion_name?.toLowerCase().includes('prb') || b.expansion_name?.toLowerCase().includes('best')) && !b.version?.toLowerCase().includes('manga'));
    if (rBp) return rBp;
  }

  // 7. Alternate Art / Parallel
  if (label.includes('alt') || label.includes('parallel') || img.includes('_p')) {
    const altBp = candidateBps.find(b => 
      ((b.version || '').toLowerCase().includes('alternate') || (b.version || '').toLowerCase().includes('parallel') || (b.rarity || '').toLowerCase().includes('alternate') || (b.collector_number || '').endsWith('a'))
      && !b.version?.toLowerCase().includes('manga')
      && !b.version?.toLowerCase().includes('wanted')
    ) || blueprints.find(b => 
      ((b.version || '').toLowerCase().includes('alternate') || (b.version || '').toLowerCase().includes('parallel'))
      && !b.version?.toLowerCase().includes('manga')
      && !b.version?.toLowerCase().includes('wanted')
      && !b.expansion_name?.toLowerCase().includes('championship')
    );
    if (altBp) return altBp;
  }

  return candidateBps[0] || blueprints[0];
}

console.log('=== Cleaning and Perfectly Aligning All 5324 Variant Prices ===');

let cleanedCount = 0;
const nowIso = new Date().toISOString();

const cleanedVariants = variants.map(v => {
  const code = (v.card_code || '').toUpperCase().trim();
  const bps = mapping[code]?.blueprints || [];
  const matchedBp = matchVariantToBlueprintAccurately(v, code, bps);
  const p = matchedBp ? bpPrices[matchedBp.id] : null;

  let ctLowest = (p && p.lowest_eur > 0) ? p.lowest_eur : (v.cardtrader_price || 0.25);
  let ctAvg = (p && p.avg_eur > 0) ? p.avg_eur : ctLowest;
  let bpId = matchedBp ? matchedBp.id : v.cardtrader_blueprint_id;
  let ctUrl = matchedBp ? `https://www.cardtrader.com/en/cards/${matchedBp.id}` : (v.cardtrader_url || `https://www.cardtrader.com/en/search?q=${encodeURIComponent(code)}`);

  const label = (v.variant_label || '').toLowerCase();
  const img = (v.image_path || '').toLowerCase();
  const isManga = label.includes('manga') || img.includes('manga');
  const isSerial = label.includes('serial') || matchedBp?.version?.toLowerCase().includes('serial');

  let cmTrend = v.cardmarket_trend || v.market_price || ctLowest;
  let cmLow = v.cardmarket_low || v.low_price || cmTrend;
  let cmAvg = v.cardmarket_avg || v.avg_price || cmTrend;

  // If a regular Alternate Art or Base or Reprint card was given a Manga price (> 300 €) while CT is low (< 150 €)
  if (!isManga && !isSerial && cmTrend > 300 && ctLowest < 200) {
    cleanedCount++;
    cmTrend = ctLowest > 0 ? ctLowest : 25;
    cmLow = ctLowest > 0 ? ctLowest : 20;
    cmAvg = ctAvg > 0 ? ctAvg : cmTrend;
  }

  // Realistic price for display/sorting
  const realisticPrice = ctLowest > 0 ? ctLowest : (cmTrend > 0 ? cmTrend : 0.25);

  return {
    ...v,
    market_price: realisticPrice,
    low_price: ctLowest > 0 ? ctLowest : cmLow,
    avg_price: ctAvg > 0 ? ctAvg : cmAvg,
    trend_price: cmTrend > 0 ? cmTrend : realisticPrice,
    cardmarket_trend: cmTrend,
    cardmarket_low: cmLow,
    cardmarket_avg: cmAvg,
    cardtrader_price: ctLowest,
    cardtrader_blueprint_id: bpId,
    cardtrader_url: ctUrl,
    price_cardtrader_eur: ctLowest,
    price_eur: realisticPrice,
    price_currency: 'EUR',
    updated_at: nowIso
  };
});

fs.writeFileSync(variantsPath, JSON.stringify(cleanedVariants, null, 2), 'utf8');
console.log('Fixed and cleaned ' + cleanedCount + ' contaminated variant prices!');
console.log('Saved ' + cleanedVariants.length + ' variants cleanly to variants.json!');
