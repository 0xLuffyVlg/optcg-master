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

  // 6. Alternate Art / Parallel
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

  // 7. Reprint PRB
  if (label.includes('réimpression') || img.includes('_r')) {
    const rBp = blueprints.find(b => b.expansion_name?.toLowerCase().includes('prb') || b.expansion_name?.toLowerCase().includes('best') || b.version?.toLowerCase().includes('reprint'));
    if (rBp) return rBp;
  }

  return candidateBps[0] || blueprints[0];
}

console.log('--- Applying perfect price sync across 3078 cards and 5324 variants ---');

// 1. Update base cards CardTrader prices
for (const card of cards) {
  if (!card || !card.card_code) continue;
  const code = card.card_code.toUpperCase().trim();
  const bps = mapping[code]?.blueprints || [];
  const baseBp = matchVariantToBlueprintAccurately({ variant_label: 'Base', image_path: `${code}.png` }, code, bps);
  if (baseBp) {
    const p = bpPrices[baseBp.id];
    const lowest = (p && p.lowest_eur > 0) ? p.lowest_eur : 0.25;
    baseCtPrices[code] = {
      blueprint_id: baseBp.id,
      lowest_eur: lowest,
      avg_eur: (p && p.avg_eur > 0) ? p.avg_eur : lowest,
      listings_count: p?.listings_count || 1,
      url: `https://www.cardtrader.com/en/cards/${baseBp.id}`
    };
  }
}
fs.writeFileSync(ctPricesPath, JSON.stringify(baseCtPrices, null, 2), 'utf8');

// 2. Update all variants
const nowIso = new Date().toISOString();
const updatedVariants = variants.map(v => {
  const code = (v.card_code || '').toUpperCase().trim();
  const bps = mapping[code]?.blueprints || [];
  const matchedBp = matchVariantToBlueprintAccurately(v, code, bps);
  const p = matchedBp ? bpPrices[matchedBp.id] : null;
  
  let ctLowest = (p && p.lowest_eur > 0) ? p.lowest_eur : (v.cardtrader_price || 0.25);
  let ctAvg = (p && p.avg_eur > 0) ? p.avg_eur : ctLowest;
  let bpId = matchedBp ? matchedBp.id : v.cardtrader_blueprint_id;
  let ctUrl = matchedBp ? `https://www.cardtrader.com/en/cards/${matchedBp.id}` : (v.cardtrader_url || `https://www.cardtrader.com/en/search?q=${encodeURIComponent(code)}`);

  // Clean up any absurd cardmarket_trend mismatch if variant is not manga/serial
  let cmTrend = v.cardmarket_trend || v.market_price || ctLowest;
  let cmLow = v.cardmarket_low || v.low_price || cmTrend;
  let cmAvg = v.cardmarket_avg || v.avg_price || cmTrend;

  const isManga = (v.variant_label || '').toLowerCase().includes('manga') || (v.image_path || '').toLowerCase().includes('manga');
  const isWanted = (v.variant_label || '').toLowerCase().includes('wanted') || (v.image_path || '').toLowerCase().includes('wanted') || (code === 'OP13-118' && (v.image_path || '').includes('_p2'));

  if (!isManga && cmTrend > 5000 && !matchedBp?.version?.toLowerCase().includes('serial')) {
    // Correct erroneous manga price assignment to normal variant
    cmTrend = ctLowest > 0 ? ctLowest : 25;
    cmLow = cmTrend;
    cmAvg = ctAvg > 0 ? ctAvg : cmTrend;
  }

  // Realistic price for sorting/filter
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

fs.writeFileSync(variantsPath, JSON.stringify(updatedVariants, null, 2), 'utf8');
console.log('Successfully updated variants.json (' + updatedVariants.length + ' variants)!');

// 3. Inspect OP13-118 in updated variants
console.log('\n=== OP13-118 in updated variants ===');
updatedVariants.filter(v => v.card_code === 'OP13-118').forEach(v => {
  console.log(v.image_path, '|', v.variant_label, '| CT:', v.cardtrader_price, '| CM:', v.cardmarket_trend, '| BP:', v.cardtrader_blueprint_id, '| URL:', v.cardtrader_url);
});
