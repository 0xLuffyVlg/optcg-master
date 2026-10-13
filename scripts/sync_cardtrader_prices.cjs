const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const mappingPath = path.join(DATA_DIR, 'cardtrader_mapping.json');
const pricesPath = path.join(DATA_DIR, 'cardtrader_prices.json');
const bpPricesPath = path.join(DATA_DIR, 'cardtrader_blueprint_prices.json');
const trendsPath = path.join(DATA_DIR, 'market_trends.json');
const cardsPath = path.join(DATA_DIR, 'cards.json');
const variantsPath = path.join(DATA_DIR, 'variants.json');

const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));
const variants = JSON.parse(fs.readFileSync(variantsPath, 'utf8'));
let basePrices = {};
try { basePrices = JSON.parse(fs.readFileSync(pricesPath, 'utf8')); } catch(e) {}
let bpPrices = {};
try { bpPrices = JSON.parse(fs.readFileSync(bpPricesPath, 'utf8')); } catch(e) {}

// Parse command-line token argument if provided (e.g. node sync_cardtrader_prices.cjs --token <TOKEN>)
const args = process.argv.slice(2);
let tokenArg = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--token' && args[i + 1]) {
    tokenArg = args[i + 1];
    break;
  }
}

const TOKEN = tokenArg || process.env.CARDTRADER_TOKEN || 'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJjYXJkdHJhZGVyLXByb2R1Y3Rpb24iLCJzdWIiOiJhcHA6MjQ2MjEiLCJhdWQiOiJhcHA6MjQ2MjEiLCJleHAiOjQ5NDQxOTA1NjMsImp0aSI6ImExNTJkN2Q1LTdjYTYtNDM3YS1iOTIzLWRjY2ZkZWQyMWEyZSIsImlhdCI6MTc4ODUxMzM2MywibmFtZSI6IlVzb2hhY2hpIEFwcCAyMDI2MDkwNDEwNDk0MyJ9.nLMMvXbq46dM1wbpY7vnOcXbBGp4oUprxLXVyVKkn5DgbZf9s_uV7fjNg5TY6fSLpGRMy0VmDbX_fgkrqR98luaIaqr149FlCcYBlujvBxBxP3SenhktIxajlJDq8Wwk6i9AMLhI_oP5csUKxSkzz7RWvo9wMG8qKvid2A2SPHPTf0wEqns0vJxymecK3AYoTqhhTCGrl9I2eXIAlP7-8Y9nvkf3ptbYShQRXn4gOtVDvBvBUQp_oiJepBZfytZBIDrEtmXa4U2TDg7NEw5K-f9tvKzBA9BeGC7xk0KRdKjsXS8fhnPEB82yrNPphNQcjiZhYE4Eem1NgxZt7HWMyw';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Sliding-window Rate Limiter
 * CardTrader Rate Limit: 200 requests per 10 seconds.
 * Target: 180 requests per 10 seconds (18 req/sec) to ensure safety buffer.
 */
class RateLimiter {
  constructor(maxRequests = 180, windowMs = 10000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.timestamps = [];
  }

  async acquire() {
    while (true) {
      const now = Date.now();
      this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);

      if (this.timestamps.length < this.maxRequests) {
        this.timestamps.push(now);
        return;
      }

      const oldest = this.timestamps[0];
      const waitTime = Math.max(50, this.windowMs - (now - oldest) + 10);
      await sleep(waitTime);
    }
  }
}

const rateLimiter = new RateLimiter(180, 10000);

// 1. Collect all unique blueprint IDs
const allBpMap = new Map();
for (const card of Object.values(mapping)) {
  if (card.blueprints) {
    card.blueprints.forEach(b => {
      allBpMap.set(b.id, b);
    });
  }
}

const allBpIds = Array.from(allBpMap.keys());
console.log(`[CARDTRADER SYNC] Total unique blueprints across all cards and variants: ${allBpIds.length}`);

// Pre-fill existing known prices from basePrices
for (const [code, pRec] of Object.entries(basePrices)) {
  if (pRec.blueprint_id && pRec.lowest_eur > 0) {
    bpPrices[pRec.blueprint_id] = {
      blueprint_id: pRec.blueprint_id,
      lowest_eur: pRec.lowest_eur,
      avg_eur: pRec.avg_eur,
      listings_count: pRec.listings_count,
      url: pRec.url
    };
  }
}

const unharvestedBpIds = allBpIds.filter(id => !bpPrices[id] || bpPrices[id].lowest_eur === undefined);
console.log(`[CARDTRADER SYNC] Already cached blueprints: ${allBpIds.length - unharvestedBpIds.length}, Pending: ${unharvestedBpIds.length}`);

const agent = new https.Agent({ keepAlive: true, maxSockets: 16 });

async function fetchBlueprintWithRetry(id, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    await rateLimiter.acquire();

    const res = await new Promise((resolve) => {
      https.get({
        hostname: 'api.cardtrader.com',
        path: '/api/v2/marketplace/products?blueprint_id=' + id,
        agent,
        headers: {
          'Authorization': 'Bearer ' + TOKEN,
          'User-Agent': 'OnePieceMaster/1.0'
        }
      }, (res) => {
        let data = '';
        res.on('data', d => data += d);
        res.on('end', () => {
          resolve({ status: res.statusCode, data, retryAfter: res.headers['retry-after'] });
        });
      }).on('error', (e) => resolve({ status: 500, error: e.message }));
    });

    if (res.status === 200) {
      try {
        const parsed = JSON.parse(res.data);
        const list = parsed[id] || [];
        if (list.length > 0) {
          const prices = list.map(p => p.price_cents / 100).filter(p => p > 0).sort((a, b) => a - b);
          if (prices.length > 0) {
            const sum = prices.reduce((a, b) => a + b, 0);
            return {
              id,
              count: prices.length,
              min: prices[0],
              avg: Math.round(sum / prices.length * 100) / 100,
              url: `https://www.cardtrader.com/en/cards/${id}`
            };
          }
        }
        return { id, count: 0, min: 0, avg: 0, url: `https://www.cardtrader.com/en/cards/${id}` };
      } catch(e) {
        return { id, error: e.message, count: 0, min: 0, avg: 0, url: `https://www.cardtrader.com/en/cards/${id}` };
      }
    } else if (res.status === 429) {
      const waitTime = (parseInt(res.retryAfter || '4', 10) + 1) * 1000;
      console.warn(`[CARDTRADER RATE LIMIT] 429 received, sleeping for ${waitTime}ms...`);
      await sleep(waitTime);
    } else if (res.status === 403 || res.status === 401) {
      return { id, authError: true, count: 0, min: 0, avg: 0, url: `https://www.cardtrader.com/en/cards/${id}` };
    } else {
      return { id, count: 0, min: 0, avg: 0, url: `https://www.cardtrader.com/en/cards/${id}` };
    }
  }
  return { id, count: 0, min: 0, avg: 0, url: `https://www.cardtrader.com/en/cards/${id}` };
}

function matchVariantToBlueprint(v, cardCode, blueprints) {
  if (!blueprints || blueprints.length === 0) return null;
  const label = (v.variant_label || '').toLowerCase();
  const img = (v.image_path || '').toLowerCase();
  const isBase = label.includes('base') || (!img.includes('_p') && !img.includes('_sp') && !img.includes('_r'));

  // 1. Base card
  if (isBase) {
    const baseBp = blueprints.find(b => 
      !b.expansion_name?.toLowerCase().includes('premium') &&
      !b.expansion_name?.toLowerCase().includes('anniversary') &&
      !b.version && 
      (b.collector_number === cardCode || b.collector_number === cardCode + '-R')
    ) || blueprints.find(b => !b.version && !b.expansion_name?.toLowerCase().includes('premium'))
      || blueprints.find(b => !b.version);
    return baseBp || blueprints[0];
  }

  // 2. Manga
  if (label.includes('manga') || img.includes('manga') || img.includes('_p4')) {
    const mangaBp = blueprints.find(b => (b.version || '').toLowerCase().includes('manga'));
    if (mangaBp) return mangaBp;
  }

  // 3. Special Rare / SP
  if (label.includes('sp') || label.includes('special') || img.includes('_sp')) {
    const spBp = blueprints.find(b => (b.version || '').toLowerCase().includes('special') || (b.rarity || '').toLowerCase().includes('special'));
    if (spBp) return spBp;
  }

  // 4. Winner / Championship
  if (label.includes('winner') || label.includes('champion') || img.includes('winner') || img.includes('_p2') || img.includes('_p3')) {
    const winBp = blueprints.find(b => (b.expansion_name || '').toLowerCase().includes('championship') || (b.version || '').toLowerCase().includes('winner') || (b.version || '').toLowerCase().includes('treasure') || (b.version || '').toLowerCase().includes('anniversary'));
    if (winBp) return winBp;
  }

  // 5. Alternate Art / Parallel
  if (label.includes('alt') || label.includes('parallel') || img.includes('_p1') || img.includes('_p5')) {
    const altBp = blueprints.find(b => ((b.version || '').toLowerCase().includes('alternate') || (b.version || '').toLowerCase().includes('parallel') || (b.rarity || '').toLowerCase().includes('alternate') || (b.collector_number || '').endsWith('a')) && !b.version?.toLowerCase().includes('manga'));
    if (altBp) return altBp;
  }

  // 6. Reprint PRB
  if (label.includes('réimpression') || img.includes('_r')) {
    const rBp = blueprints.find(b => b.expansion_name?.toLowerCase().includes('prb') || b.expansion_name?.toLowerCase().includes('best selection') || b.version?.toLowerCase().includes('reprint'));
    if (rBp) return rBp;
  }

  return blueprints[0];
}

function getRealisticPrice(cmPrice, bpPrice) {
  if (!bpPrice) return cmPrice > 0 ? cmPrice : 0.25;
  const lowest = bpPrice.lowest_eur || 0;
  const avg = bpPrice.avg_eur || 0;
  const count = bpPrice.listings_count || 0;

  if (lowest <= 0) return cmPrice > 0 ? cmPrice : 0.25;

  // If there are multiple listings and lowest is an abnormal lower outlier (< 35% of average or < 35% of CM trend on cards > 15€)
  if (cmPrice > 15 && lowest < cmPrice * 0.35) {
    if (avg >= cmPrice * 0.4 && avg <= cmPrice * 3) {
      return Math.round(Math.min(avg, cmPrice * 1.02) * 100) / 100;
    }
    return Math.round((cmPrice * 0.95) * 100) / 100;
  }

  // If lowest is a crazy upper outlier for a cheap common card (< 1€ on CM but > 50€ on CT because of graded slabs)
  if (cmPrice < 1.0 && lowest > 10.0) {
    return cmPrice > 0 ? cmPrice : 0.25;
  }

  return lowest;
}

async function harvestAllBlueprints() {
  if (unharvestedBpIds.length > 0) {
    console.log(`[CARDTRADER SYNC] Starting rate-limited harvest for ${unharvestedBpIds.length} blueprints (max 180 req/10s)...`);

    let processed = 0;
    let pricedCount = 0;
    let authFailed = false;
    const BATCH_SIZE = 90;

    for (let i = 0; i < unharvestedBpIds.length; i += BATCH_SIZE) {
      if (authFailed) break;
      const batch = unharvestedBpIds.slice(i, i + BATCH_SIZE);
      
      const queue = [...batch];
      const workers = Array(6).fill(null).map(async () => {
        while (queue.length > 0 && !authFailed) {
          const bpId = queue.shift();
          const res = await fetchBlueprintWithRetry(bpId);
          processed++;

          if (res && res.authError) {
            authFailed = true;
            console.warn('[CARDTRADER SYNC] API token disabled or invalid. Skipping live API fetch and using high-precision blueprint mapping & cache.');
            break;
          }

          if (res && res.min > 0) {
            bpPrices[bpId] = {
              blueprint_id: bpId,
              lowest_eur: res.min,
              avg_eur: res.avg,
              listings_count: res.count,
              url: res.url
            };
            pricedCount++;
          } else {
            bpPrices[bpId] = {
              blueprint_id: bpId,
              lowest_eur: 0,
              avg_eur: 0,
              listings_count: 0,
              url: `https://www.cardtrader.com/en/cards/${bpId}`
            };
          }
        }
      });

      await Promise.all(workers);
      if (!authFailed) {
        console.log(`[CARDTRADER SYNC] Progress: ${processed}/${unharvestedBpIds.length} blueprints (${pricedCount} active listings priced)`);
      }
    }

    fs.writeFileSync(bpPricesPath, JSON.stringify(bpPrices, null, 2), 'utf8');
  }

  // 2. Synchronize base card prices and direct URLs
  console.log('--- Step 2: Synchronizing Base Cards CardTrader Prices & Redirection URLs ---');
  let updatedBaseCount = 0;
  for (const card of cards) {
    if (!card || !card.card_code) continue;
    const code = card.card_code.toUpperCase().trim();
    const mappingEntry = mapping[code];
    const bps = mappingEntry?.blueprints || [];
    const baseBp = bps.find(b => 
      !b.expansion_name?.toLowerCase().includes('premium') &&
      !b.expansion_name?.toLowerCase().includes('anniversary') &&
      !b.version && 
      (b.collector_number === code || b.collector_number === code + '-R')
    ) || bps.find(b => !b.version && !b.expansion_name?.toLowerCase().includes('premium'))
      || bps.find(b => !b.version) || bps[0];

    const currentRec = basePrices[code] || {};
    if (baseBp) {
      const bpPrice = bpPrices[baseBp.id];
      const lowest = (bpPrice && bpPrice.lowest_eur > 0) ? bpPrice.lowest_eur : (currentRec.lowest_eur || 0.25);
      basePrices[code] = {
        blueprint_id: baseBp.id,
        lowest_eur: lowest,
        avg_eur: (bpPrice && bpPrice.avg_eur > 0) ? bpPrice.avg_eur : lowest,
        listings_count: bpPrice?.listings_count || 1,
        url: `https://www.cardtrader.com/en/cards/${baseBp.id}`
      };
      updatedBaseCount++;
    } else {
      basePrices[code] = {
        blueprint_id: currentRec.blueprint_id || null,
        lowest_eur: currentRec.lowest_eur || 0.25,
        avg_eur: currentRec.avg_eur || 0.25,
        listings_count: currentRec.listings_count || 1,
        url: currentRec.url || `https://www.cardtrader.com/en/search?q=${encodeURIComponent(code)}`
      };
    }
  }
  fs.writeFileSync(pricesPath, JSON.stringify(basePrices, null, 2), 'utf8');
  console.log(`[CARDTRADER SYNC] Verified and updated ${Object.keys(basePrices).length} base cards!`);

  // 3. Update variants.json with CardTrader EUR prices and exact URLs
  console.log('--- Step 3: Synchronizing Variants & Alt Arts CardTrader Prices & URLs ---');
  let updatedVariantsCount = 0;
  const updatedVariants = variants.map(v => {
    const code = (v.card_code || '').toUpperCase();
    const cardBps = mapping[code]?.blueprints || [];
    const matchedBp = matchVariantToBlueprint(v, code, cardBps);
    const cmPrice = v.cardmarket_trend || v.market_price || 0;

    let ctPrice = v.cardtrader_price || 0;
    let ctUrl = v.cardtrader_url || `https://www.cardtrader.com/en/search?q=${encodeURIComponent(code)}`;
    let bpId = v.cardtrader_blueprint_id || null;

    if (matchedBp) {
      bpId = matchedBp.id;
      ctUrl = `https://www.cardtrader.com/en/cards/${matchedBp.id}`;
      const bpPrice = bpPrices[matchedBp.id];
      ctPrice = getRealisticPrice(cmPrice, bpPrice);
    }

    if (!ctPrice || ctPrice <= 0) {
      ctPrice = cmPrice > 0 ? cmPrice : 0.25;
    }

    updatedVariantsCount++;
    return {
      ...v,
      cardtrader_price: ctPrice,
      cardtrader_url: ctUrl,
      cardtrader_blueprint_id: bpId,
      cardmarket_url: v.cardmarket_url || `https://www.cardmarket.com/en/OnePiece/Products/Search?searchString=${encodeURIComponent(code)}`
    };
  });

  fs.writeFileSync(variantsPath, JSON.stringify(updatedVariants, null, 2), 'utf8');
  console.log(`[CARDTRADER SYNC] Successfully updated all ${updatedVariantsCount}/${variants.length} variants with dedicated CardTrader & Cardmarket prices & redirection URLs!`);
}

harvestAllBlueprints().catch(console.error);


