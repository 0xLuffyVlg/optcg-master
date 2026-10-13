const fs = require('fs');

const cards = JSON.parse(fs.readFileSync('src/data/cards.json', 'utf8'));
const variants = JSON.parse(fs.readFileSync('src/data/variants.json', 'utf8'));
const mapping = JSON.parse(fs.readFileSync('src/data/cardtrader_mapping.json', 'utf8'));
const ctb = JSON.parse(fs.readFileSync('src/data/cardtrader_blueprint_prices.json', 'utf8'));
const cm = JSON.parse(fs.readFileSync('src/data/cardmarket_prices.json', 'utf8'));
const ct = JSON.parse(fs.readFileSync('src/data/cardtrader_prices.json', 'utf8'));

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

// Check previously problematic cards
const testCodes = ['OP13-118', 'OP01-120', 'OP02-099', 'OP05-119', 'OP07-119', 'OP08-058', 'EB04-061', 'OP17-118', 'OP13-119', 'OP13-120', 'OP12-020', 'OP10-033', 'ST01-012'];

testCodes.forEach(code => {
  console.log('\n--- ' + code + ' ---');
  const cardVars = variants.filter(v => v.card_code === code);
  const cardBps = mapping[code]?.blueprints || [];
  cardVars.forEach(v => {
    const matched = matchVariantToBlueprintAccurately(v, code, cardBps);
    const p = matched ? ctb[matched.id] : null;
    console.log(v.image_path, '-> BP', matched?.id, matched?.version, '[' + matched?.expansion_name + ']', 'Lowest:', p?.lowest_eur, 'Avg:', p?.avg_eur);
  });
});
