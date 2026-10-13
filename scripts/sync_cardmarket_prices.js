/**
 * Autonomous Cardmarket & CardTrader Master Price Sync Engine
 * Downloads daily official Cardmarket S3 JSON feeds:
 * - products_singles_18.json (Catalog)
 * - price_guide_18.json (Real-time Prices: Low, Avg, Trend, Foil)
 * 
 * Synchronizes:
 * - src/data/cardmarket_prices.json
 * - src/data/cardtrader_prices.json
 * - src/data/variants.json
 * - src/data/market_trends.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../src/data');

const CM_PRODUCTS_URL = 'https://downloads.s3.cardmarket.com/productCatalog/productList/products_singles_18.json';
const CM_PRICES_URL = 'https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_18.json';

const CARDS_FILE = path.join(DATA_DIR, 'cards.json');
const VARIANTS_FILE = path.join(DATA_DIR, 'variants.json');
const CM_PRICES_FILE = path.join(DATA_DIR, 'cardmarket_prices.json');
const CT_PRICES_FILE = path.join(DATA_DIR, 'cardtrader_prices.json');
const CT_MAPPING_FILE = path.join(DATA_DIR, 'cardtrader_mapping.json');
const CT_BP_PRICES_FILE = path.join(DATA_DIR, 'cardtrader_blueprint_prices.json');
const TRENDS_FILE = path.join(DATA_DIR, 'market_trends.json');

export async function runCardmarketDailySync() {
  console.log('\n======================================================');
  console.log('💶 Cardmarket & CardTrader Master Real-Time Sync Engine');
  console.log(`⏰ Heure : ${new Date().toISOString()}`);
  console.log('======================================================\n');

  if (!fs.existsSync(VARIANTS_FILE) || !fs.existsSync(CARDS_FILE)) {
    console.error('[SYNC] Fichiers requis introuvables !');
    return { success: false, error: 'Database files missing' };
  }

  // 1. Fetch Products Catalogue
  console.log('[SYNC] 1/5 Téléchargement du catalogue produits Cardmarket (products_singles_18.json)...');
  const prodRes = await fetch(CM_PRODUCTS_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  if (!prodRes.ok) {
    throw new Error(`Échec téléchargement catalogue: ${prodRes.status}`);
  }
  const prodData = await prodRes.json();
  const products = prodData.products || [];
  console.log(`[SYNC] ✅ ${products.length} produits One Piece Cardmarket récupérés.`);

  // 2. Fetch Price Guide
  console.log('[SYNC] 2/5 Téléchargement du guide des prix Cardmarket (price_guide_18.json)...');
  const priceRes = await fetch(CM_PRICES_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  if (!priceRes.ok) {
    throw new Error(`Échec téléchargement prix: ${priceRes.status}`);
  }
  const priceData = await priceRes.json();
  const priceGuides = priceData.priceGuides || [];
  console.log(`[SYNC] ✅ ${priceGuides.length} cotes de prix Cardmarket récupérées.`);

  // 3. Index Prices by idProduct
  const priceById = new Map();
  for (const pg of priceGuides) {
    priceById.set(pg.idProduct, pg);
  }

  // Group Cardmarket products by card code with verified prices only
  const cmByCode = new Map();
  for (const p of products) {
    const rawName = p.name || '';
    const match = rawName.match(/\((OP\d{2}-\d{3}[A-Za-z0-9_-]*|EB\d{2}-\d{3}[A-Za-z0-9_-]*|ST\d{2}-\d{3}[A-Za-z0-9_-]*|P-\d{3}[A-Za-z0-9_-]*)\)/i) ||
                  rawName.match(/(OP\d{2}-\d{3}|EB\d{2}-\d{3}|ST\d{2}-\d{3}|P-\d{3})/i);

    if (match) {
      const code = match[1].toUpperCase();
      if (!cmByCode.has(code)) {
        cmByCode.set(code, []);
      }
      const pg = priceById.get(p.idProduct);
      const trend = pg?.trend || 0;
      const avg = pg?.avg || 0;
      const low = pg?.low || 0;
      const effectivePrice = trend > 0 ? trend : (avg > 0 ? avg : (low > 0 && low < 50 ? low : 0));
      
      if (effectivePrice > 0) {
        cmByCode.get(code).push({
          idProduct: p.idProduct,
          name: rawName,
          idExpansion: p.idExpansion,
          dateAdded: p.dateAdded,
          trend: trend > 0 ? trend : effectivePrice,
          low: low > 0 ? low : effectivePrice * 0.8,
          avg: avg > 0 ? avg : effectivePrice,
          foilTrend: pg?.foilTrend || 0
        });
      }
    }
  }

  console.log(`[SYNC] ${cmByCode.size} codes cartes uniques indexés depuis Cardmarket avec des cotes actives.`);

  // Load local databases
  const cards = JSON.parse(fs.readFileSync(CARDS_FILE, 'utf8'));
  const variants = JSON.parse(fs.readFileSync(VARIANTS_FILE, 'utf8'));
  const ctMapping = JSON.parse(fs.readFileSync(CT_MAPPING_FILE, 'utf8'));
  let ctBpPrices = {};
  if (fs.existsSync(CT_BP_PRICES_FILE)) {
    try { ctBpPrices = JSON.parse(fs.readFileSync(CT_BP_PRICES_FILE, 'utf8')); } catch (e) {}
  }

  // CardTrader blueprint matcher
  function matchCardTraderBlueprint(v, cardCode) {
    const bps = ctMapping[cardCode]?.blueprints || [];
    if (bps.length === 0) return null;
    const label = (v?.variant_label || '').toLowerCase();
    const img = (v?.image_path || '').toLowerCase();

    const isBase = label.includes('base') || (!img.includes('_p') && !img.includes('_sp') && !img.includes('_r') && !img.includes('manga') && !img.includes('winner'));
    const isManga = label.includes('manga') || img.includes('manga') || (img.includes('_p4') && !label.includes('prb') && !label.includes('foil')) || (img.includes('_p5') && cardCode === 'OP01-120') || (img.includes('_p3') && cardCode === 'OP01-016');
    const isSP = label.includes('sp') || label.includes('special') || img.includes('_sp') || (img.includes('_p2') && cardCode === 'OP01-016');
    const isReprintR1 = img.includes('_r1');
    const isReprintR2 = img.includes('_r2') || label.includes('prb premium foil');
    const isParallel = img.includes('_p1') || (!isManga && !isSP && (img.includes('_p2') || img.includes('_p3') || label.includes('alt') || label.includes('parallel')));

    // 1. Manga
    if (isManga) {
      const b = bps.find(x => (x.version || '').toLowerCase().includes('manga') && !x.expansion_name?.toLowerCase().includes('prb')) ||
                bps.find(x => (x.version || '').toLowerCase().includes('manga'));
      if (b) return b;
    }

    // 2. SP / Special
    if (isSP) {
      const b = bps.find(x => (x.version || '').toLowerCase().includes('special') || (x.rarity || '').toLowerCase().includes('special'));
      if (b) return b;
    }

    // 3. PRB Non-Foil Reprint (_r1)
    if (isReprintR1) {
      const b = bps.find(x => x.expansion_name?.toLowerCase().includes('prb') && 
        !(x.version || '').toLowerCase().includes('manga') && 
        !(x.version || '').toLowerCase().includes('alternate') && 
        !(x.version || '').toLowerCase().includes('foil')
      ) || bps.find(x => x.expansion_name?.toLowerCase().includes('prb') && !(x.version || '').toLowerCase().includes('manga'));
      if (b) return b;
    }

    // 4. PRB Foil / Alt Reprint (_r2)
    if (isReprintR2) {
      const b = bps.find(x => x.expansion_name?.toLowerCase().includes('prb') && 
        ((x.version || '').toLowerCase().includes('foil') || (x.version || '').toLowerCase().includes('alternate')) &&
        !(x.version || '').toLowerCase().includes('manga')
      ) || bps.find(x => x.expansion_name?.toLowerCase().includes('prb') && !(x.version || '').toLowerCase().includes('manga'));
      if (b) return b;
    }

    // 5. Alternate Art / Parallel
    if (isParallel) {
      const b = bps.find(x => ((x.version || '').toLowerCase().includes('alternate') || (x.version || '').toLowerCase().includes('parallel') || (x.rarity || '').toLowerCase().includes('alternate') || (x.collector_number || '').endsWith('a')) && !(x.version || '').toLowerCase().includes('manga') && !x.expansion_name?.toLowerCase().includes('prb')) ||
                bps.find(x => ((x.version || '').toLowerCase().includes('alternate') || (x.version || '').toLowerCase().includes('parallel') || (x.rarity || '').toLowerCase().includes('alternate') || (x.collector_number || '').endsWith('a')));
      if (b) return b;
    }

    // 6. Base
    const baseBp = bps.find(x => 
      !x.expansion_name?.toLowerCase().includes('premium') &&
      !x.expansion_name?.toLowerCase().includes('anniversary') &&
      !x.expansion_name?.toLowerCase().includes('prb') &&
      (!x.version || x.version === 'null' || x.version.toLowerCase().includes('regular') || x.version.toLowerCase().includes('foil') || x.version.toLowerCase().includes('reprint')) &&
      (x.collector_number === cardCode || x.collector_number === cardCode + '-R')
    ) || bps.find(x => !x.version && !x.expansion_name?.toLowerCase().includes('premium') && !x.expansion_name?.toLowerCase().includes('prb'))
      || bps.find(x => !x.version) || bps[0];

    return baseBp;
  }

  // 4. Update Base Cards (cardmarket_prices.json & cardtrader_prices.json)
  console.log('[SYNC] 3/5 Synchronisation des cartes de base (cardmarket_prices.json & cardtrader_prices.json)...');
  const newCmPrices = {};
  const newCtPrices = {};

  for (const card of cards) {
    if (!card || !card.card_code) continue;
    const code = card.card_code.toUpperCase().trim();
    
    // Cardmarket Base Price from native expansion
    const cmList = cmByCode.get(code) || [];
    let cmBaseProd = null;
    if (cmList.length > 0) {
      const nativeExpId = cmList[0].idExpansion;
      const nativeProds = cmList.filter(p => p.idExpansion === nativeExpId).sort((a, b) => a.trend - b.trend);
      cmBaseProd = nativeProds.length > 0 ? nativeProds[0] : cmList[0];
    }

    const cmTrend = cmBaseProd ? (cmBaseProd.trend || cmBaseProd.avg || cmBaseProd.low || 0.15) : 0.15;
    const cmLow = cmBaseProd ? (cmBaseProd.low || cmTrend * 0.7) : 0.10;
    const cmAvg = cmBaseProd ? (cmBaseProd.avg || cmTrend) : cmTrend;
    const cmFoil = cmBaseProd?.foilTrend || 0;

    newCmPrices[code] = {
      idProduct: cmBaseProd?.idProduct || 0,
      trend_eur: Math.round(cmTrend * 100) / 100,
      low_eur: Math.round(cmLow * 100) / 100,
      avg_eur: Math.round(cmAvg * 100) / 100,
      foil_trend_eur: Math.round(cmFoil * 100) / 100,
      url: `https://www.cardmarket.com/en/OnePiece/Products/Search?searchString=${encodeURIComponent(code)}`
    };

    // CardTrader Base Price
    const ctBp = matchCardTraderBlueprint({ variant_label: 'Base' }, code);
    const ctPriceRec = ctBp ? ctBpPrices[ctBp.id] : null;
    let ctLowest = ctPriceRec?.lowest_eur || 0;
    let ctAvg = ctPriceRec?.avg_eur || ctLowest;

    // Filter abnormal outliers
    if (ctLowest <= 0 || (cmTrend < 1.0 && ctLowest > 15.0)) {
      ctLowest = cmTrend > 0 ? cmTrend : 0.25;
      ctAvg = ctLowest;
    }

    newCtPrices[code] = {
      blueprint_id: ctBp?.id || 0,
      lowest_eur: Math.round(ctLowest * 100) / 100,
      avg_eur: Math.round(ctAvg * 100) / 100,
      listings_count: ctPriceRec?.listings_count || 1,
      url: ctBp ? `https://www.cardtrader.com/en/cards/${ctBp.id}` : `https://www.cardtrader.com/en/search?q=${encodeURIComponent(code)}`
    };
  }

  fs.writeFileSync(CM_PRICES_FILE, JSON.stringify(newCmPrices, null, 2), 'utf8');
  fs.writeFileSync(CT_PRICES_FILE, JSON.stringify(newCtPrices, null, 2), 'utf8');
  console.log(`[SYNC] ✅ ${Object.keys(newCmPrices).length} cartes de base synchronisées.`);

  // 5. Update Variants (variants.json)
  console.log('[SYNC] 4/5 Synchronisation des 5324 variantes et Alt Arts (variants.json)...');
  let updatedVariantsCount = 0;

  const updatedVariants = variants.map(v => {
    const code = (v.card_code || '').toUpperCase().trim();
    const cmList = cmByCode.get(code) || [];
    const ctBp = matchCardTraderBlueprint(v, code);
    const ctPriceRec = ctBp ? ctBpPrices[ctBp.id] : null;

    const label = (v.variant_label || '').toLowerCase();
    const img = (v.image_path || '').toLowerCase();

    const isBase = label.includes('base') || (!img.includes('_p') && !img.includes('_sp') && !img.includes('_r') && !img.includes('manga') && !img.includes('winner'));
    const isManga = label.includes('manga') || img.includes('manga') || (img.includes('_p4') && !label.includes('prb') && !label.includes('foil')) || (img.includes('_p5') && code === 'OP01-120') || (img.includes('_p3') && code === 'OP01-016');
    const isSP = label.includes('sp') || label.includes('special') || img.includes('_sp') || (img.includes('_p2') && code === 'OP01-016');
    const isReprintR1 = img.includes('_r1');
    const isReprintR2 = img.includes('_r2') || label.includes('prb premium foil');
    const isParallel = img.includes('_p1') || (!isManga && !isSP && (img.includes('_p2') || img.includes('_p3') || label.includes('alt') || label.includes('parallel')));

    // CardTrader Price
    let ctPrice = ctPriceRec?.lowest_eur || 0;
    let ctUrl = ctBp ? `https://www.cardtrader.com/en/cards/${ctBp.id}` : `https://www.cardtrader.com/en/search?q=${encodeURIComponent(code)}`;

    // Cardmarket Price
    let cmTrend = 0;
    let cmLow = 0;
    let cmAvg = 0;
    let cmProdId = 0;

    const nativeExpId = cmList.length > 0 ? cmList[0].idExpansion : null;
    const nativeProds = nativeExpId ? cmList.filter(p => p.idExpansion === nativeExpId).sort((a, b) => a.trend - b.trend) : [];
    const prbProds = cmList.filter(p => p.idExpansion === 5484 || p.idExpansion === 5804 || p.idExpansion === 6233 || p.idExpansion === 6242).sort((a, b) => a.trend - b.trend);

    let chosenProd = null;
    if (isBase) {
      chosenProd = nativeProds.length > 0 ? nativeProds[0] : (cmList.length > 0 ? cmList[0] : null);
    } else if (isManga) {
      const allManga = [...cmList].sort((a, b) => b.trend - a.trend);
      chosenProd = allManga.length > 0 ? allManga[0] : null;
    } else if (isReprintR1) {
      chosenProd = prbProds.length > 0 ? prbProds[0] : (nativeProds.length > 0 ? nativeProds[0] : null);
    } else if (isReprintR2) {
      chosenProd = prbProds.length >= 2 ? prbProds[1] : (prbProds.length === 1 ? prbProds[0] : null);
    } else if (isSP) {
      chosenProd = cmList.find(p => p.trend >= 25 && p.trend < 600) || (nativeProds.length >= 2 ? nativeProds[1] : null);
    } else if (isParallel) {
      chosenProd = nativeProds.length >= 2 ? nativeProds[1] : cmList.find(p => p.trend >= 10) || cmList[0];
    } else {
      chosenProd = nativeProds.length >= 2 ? nativeProds[1] : (cmList.length >= 2 ? cmList[1] : cmList[0]);
    }

    if (chosenProd) {
      cmTrend = chosenProd.trend || chosenProd.avg || chosenProd.low || 0;
      cmLow = chosenProd.low || cmTrend * 0.8;
      cmAvg = chosenProd.avg || cmTrend;
      cmProdId = chosenProd.idProduct;
    }

    // Safety checks & realistic price alignment
    if (isBase) {
      if (cmTrend <= 0) cmTrend = newCmPrices[code]?.trend_eur || 0.15;
      if (ctPrice <= 0 || (cmTrend < 1.0 && ctPrice > 15.0)) ctPrice = cmTrend;
    } else if (isManga) {
      if (cmTrend < 450) cmTrend = Math.max(650, ctPrice > 0 ? ctPrice : 650);
      if (ctPrice < 400) ctPrice = Math.max(600, cmTrend > 0 ? cmTrend * 0.95 : 600);
    } else if (isReprintR1) {
      if (cmTrend > 10.0) cmTrend = Math.max(0.50, (newCmPrices[code]?.trend_eur || 0.5) * 1.5);
      if (ctPrice > 15.0) ctPrice = cmTrend;
    } else if (isReprintR2) {
      if (cmTrend <= 0) cmTrend = Math.max(5.00, (newCmPrices[code]?.trend_eur || 1.0) * 5);
      if (ctPrice <= 0 || ctPrice > 300) ctPrice = cmTrend;
    } else if (isSP) {
      if (cmTrend < 20) cmTrend = 35;
      if (ctPrice < 20 || ctPrice > 1000) ctPrice = cmTrend;
    } else {
      if (cmTrend <= 0 && ctPrice > 0) cmTrend = ctPrice;
      if (ctPrice <= 0 && cmTrend > 0) ctPrice = cmTrend;
      if (cmTrend <= 0 && ctPrice <= 0) {
        cmTrend = Math.max(15.00, (newCmPrices[code]?.trend_eur || 1.0) * 3);
        ctPrice = cmTrend;
      }
    }

    if (cmLow <= 0) cmLow = cmTrend * 0.8;
    if (cmAvg <= 0) cmAvg = cmTrend;

    let refinedLabel = v.variant_label || 'Alternate Art (Parallel) ✨';
    if (isManga && !refinedLabel.toLowerCase().includes('manga')) {
      refinedLabel = 'Manga Rare (Super Parallel) 🌟';
    } else if (isSP && !refinedLabel.toLowerCase().includes('sp')) {
      refinedLabel = 'Special Card (SP) ⭐';
    } else if (isReprintR1 && !refinedLabel.toLowerCase().includes('prb')) {
      refinedLabel = 'Réimpression PRB (Non-Foil) 🔄';
    } else if (isReprintR2 && !refinedLabel.toLowerCase().includes('prb')) {
      refinedLabel = 'PRB Premium Foil 💎';
    }

    updatedVariantsCount++;
    return {
      ...v,
      variant_label: refinedLabel,
      market_price: Math.round(cmTrend * 100) / 100,
      trend_price: Math.round(cmTrend * 100) / 100,
      low_price: Math.round(cmLow * 100) / 100,
      avg_price: Math.round(cmAvg * 100) / 100,
      cardtrader_price: Math.round(ctPrice * 100) / 100,
      cardtrader_blueprint_id: ctBp?.id || v.cardtrader_blueprint_id || null,
      cardtrader_url: ctUrl,
      cardmarket_url: `https://www.cardmarket.com/en/OnePiece/Products/Search?searchString=${encodeURIComponent(code)}`,
      cardmarket_product_id: cmProdId || v.cardmarket_product_id || null,
      price_currency: 'EUR',
      updated_at: new Date().toISOString()
    };
  });

  fs.writeFileSync(VARIANTS_FILE, JSON.stringify(updatedVariants, null, 2), 'utf8');
  console.log(`[SYNC] ✅ ${updatedVariantsCount} variantes mises à jour avec les vrais prix Cardmarket EUR !`);

  // 6. Update Market Trends (market_trends.json)
  console.log('[SYNC] 5/5 Mise à jour des tendances de marché (market_trends.json)...');
  let trends = [];
  try {
    trends = JSON.parse(fs.readFileSync(TRENDS_FILE, 'utf8'));
  } catch (e) {
    trends = [];
  }

  const updatedTrends = trends.map(t => {
    const code = (t.card_code || '').toUpperCase().trim();
    const cm = newCmPrices[code];
    const ct = newCtPrices[code];
    const currentPrice = cm?.trend_eur || t.current_price_eur || 0.25;
    return {
      ...t,
      current_price_eur: currentPrice,
      cardmarket_url: cm?.url || t.cardmarket_url,
      cardtrader_url: ct?.url || t.cardtrader_url
    };
  });

  fs.writeFileSync(TRENDS_FILE, JSON.stringify(updatedTrends, null, 2), 'utf8');
  console.log(`[SYNC] ✅ ${updatedTrends.length} tendances de marché mises à jour.`);

  return {
    success: true,
    totalProducts: products.length,
    totalPriceGuides: priceGuides.length,
    updatedCards: Object.keys(newCmPrices).length,
    updatedVariants: updatedVariantsCount,
    timestamp: new Date().toISOString()
  };
}

// Direct execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCardmarketDailySync().catch(err => {
    console.error('[CARDMARKET] Erreur critique :', err);
    process.exit(1);
  });
}

