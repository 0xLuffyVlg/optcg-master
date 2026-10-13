/**
 * scripts/sync_prices.cjs
 * 
 * Script de synchronisation des prix Cardmarket (FR, EN, JP)
 * Compatible : Windows local ET GitHub Actions (Linux)
 * 
 * Sources : API Scalpeurs (cotes Cardmarket Near Mint consolidées)
 * 
 * Étapes :
 * 1. Télécharge les flux de prix (FR, EN, JP) + métadonnées
 * 2. (Optionnel) Met à jour onepiece-database si le dossier existe
 * 3. Met à jour src/data/optcg_complete_database.json
 * 4. Met à jour src/data/variants.json (double mapping : price_eur + market_price/cardmarket_trend)
 * 5. Met à jour src/data/cards.json et src/data/card_links.json
 * 6. Met à jour src/data/cardmarket_prices.json (fallback frontend)
 * 7. Met à jour les micro-fiches public/data/details/*.json
 * 8. Enregistre src/data/price_sync_meta.json
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const OPTCG_DIR = path.resolve(__dirname, '..');
const ONPIECE_DIR_LOCAL = path.resolve('C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database');
const HAS_ONPIECE_DIR = fs.existsSync(path.join(ONPIECE_DIR_LOCAL, 'data/cards-all.json'));

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

/**
 * Extrait le set_slug et la position depuis l'image_url Scalpeurs
 * Ex: "https://scalpeurs.com/img/cards-fr/op09-p001.webp" → { setSlug: "op09", pos: 1 }
 * Ex: "https://scalpeurs.com/img/cards-jp/st13-p015.webp" → { setSlug: "st13", pos: 15 }
 */
function extractSetAndPos(imageUrl) {
  if (!imageUrl) return null;
  const match = imageUrl.match(/\/([a-z0-9-]+)-p(\d+)(?:[-_][a-z0-9]+)?\.\w+(?:\?.*)?$/i);
  if (!match) {
    const fallback = imageUrl.match(/\b([a-z0-9-]+)-p(\d+)\b/i);
    if (!fallback) return null;
    return { setSlug: fallback[1].toLowerCase(), pos: parseInt(fallback[2], 10) };
  }
  return { setSlug: match[1].toLowerCase(), pos: parseInt(match[2], 10) };
}

async function main() {
  console.log('===========================================================');
  console.log('🟢 SYNCHRONISATION DES COTES CARDMARKET (Near Mint)');
  console.log(`   Environnement : ${HAS_ONPIECE_DIR ? 'Local Windows (avec onepiece-database)' : 'CI/GitHub Actions (standalone)'}`);
  console.log('===========================================================\n');
  const t0 = Date.now();

  // ─── 1. Téléchargement des cours via /api/prix-groupe/{lang}/{set} ───
  console.log('1. Téléchargement des cours du jour par groupe (FR, EN, JP)...');
  
  // Lire completeDb pour connaître tous les setSlugs par langue
  const completeDbPathInit = path.join(OPTCG_DIR, 'src/data/optcg_complete_database.json');
  const completeDbInit = JSON.parse(fs.readFileSync(completeDbPathInit, 'utf8'));

  const setGroupTasks = [];
  const seenSetGroups = new Set();
  for (const c of completeDbInit) {
    const parsed = extractSetAndPos(c.image_url);
    if (parsed && c.language) {
      const key = `${c.language}/${parsed.setSlug}`;
      if (!seenSetGroups.has(key)) {
        seenSetGroups.add(key);
        setGroupTasks.push({ lang: c.language.toLowerCase(), setSlug: parsed.setSlug });
      }
    }
  }
  console.log(`  -> ${setGroupTasks.length} extensions à synchroniser...`);

  const priceBySetPosLang = new Map();
  const chunkSize = 25;
  let setsReceived = 0;

  for (let i = 0; i < setGroupTasks.length; i += chunkSize) {
    const chunk = setGroupTasks.slice(i, i + chunkSize);
    const results = await Promise.all(
      chunk.map(async t => {
        const url = `https://scalpeurs.com/api/prix-groupe/${t.lang}/${t.setSlug}`;
        const data = await fetchJson(url).catch(() => null);
        return { task: t, data };
      })
    );

    for (const res of results) {
      if (res.data && typeof res.data === 'object' && res.data.ok !== false) {
        setsReceived++;
        for (const [setSlug, positions] of Object.entries(res.data)) {
          if (!positions || typeof positions !== 'object') continue;
          for (const [posKey, priceData] of Object.entries(positions)) {
            const pos = parseInt(posKey.replace('p', ''), 10);
            if (isNaN(pos)) continue;
            priceBySetPosLang.set(`${setSlug.toLowerCase()}#${pos}#${res.task.lang}`, priceData);
          }
        }
      }
    }
  }

  const metaFr = await fetchJson('https://scalpeurs.com/api/prix-meta/fr').catch(() => null);
  console.log(`  ✓ Données reçues en ${Date.now() - t0}ms (${setsReceived} sets chargés)`);
  if (metaFr) {
    console.log(`  Source: ${metaFr.source}`);
    console.log(`  Dernier relevé: ${metaFr.releve} (${metaFr.cartes} cartes, fin à ${metaFr.releve_fin})`);
  }
  console.log(`  ✓ Index prix construit : ${priceBySetPosLang.size} entrées\n`);

  // ─── 2. (Optionnel) Mise à jour de onepiece-database ───
  if (HAS_ONPIECE_DIR) {
    console.log('2. Mise à jour de onepiece-database (dossier local détecté)...');
    try {
      const allPath = path.join(ONPIECE_DIR_LOCAL, 'data/cards-all.json');
      const allCards = JSON.parse(fs.readFileSync(allPath, 'utf8'));
      let updatedCount = 0;

      for (const card of allCards) {
        const p = priceBySetPosLang.get(`${(card.set_slug || '').toLowerCase()}#${card.pos}#${(card.language || 'en').toLowerCase()}`);
        if (p) {
          card.price_eur = p.m ?? p.lmin ?? p.min ?? null;
          card.price_min_eur = p.lmin ?? p.min ?? null;
          card.price_avg7_eur = p.a7 ?? null;
          card.price_avg30_eur = p.a30 ?? null;
          card.listings_count = p.nb ?? p.nml ?? null;
          updatedCount++;
        }
      }

      fs.writeFileSync(allPath, JSON.stringify(allCards, null, 2), 'utf8');
      fs.writeFileSync(path.join(ONPIECE_DIR_LOCAL, 'data/cards-fr.json'), JSON.stringify(allCards.filter(c => c.language === 'fr'), null, 2), 'utf8');
      fs.writeFileSync(path.join(ONPIECE_DIR_LOCAL, 'data/cards-en.json'), JSON.stringify(allCards.filter(c => c.language === 'en'), null, 2), 'utf8');
      fs.writeFileSync(path.join(ONPIECE_DIR_LOCAL, 'data/cards-jp.json'), JSON.stringify(allCards.filter(c => c.language === 'jp'), null, 2), 'utf8');
      console.log(`  ✓ ${updatedCount}/${allCards.length} cartes mises à jour dans onepiece-database.`);

      // SQLite update
      const sqliteFile = path.join(ONPIECE_DIR_LOCAL, 'data/onepiece.sqlite');
      if (fs.existsSync(sqliteFile)) {
        try {
          const { DatabaseSync } = require('node:sqlite');
          const db = new DatabaseSync(sqliteFile);
          db.exec('PRAGMA synchronous = OFF; PRAGMA journal_mode = MEMORY;');
          db.exec('BEGIN TRANSACTION;');
          const updateStmt = db.prepare(`
            UPDATE cards 
            SET price_eur = ?, price_min_eur = ?, price_avg7_eur = ?, price_avg30_eur = ?, listings_count = ?
            WHERE id = ?
          `);
          for (const card of allCards) {
            updateStmt.run(card.price_eur, card.price_min_eur, card.price_avg7_eur, card.price_avg30_eur, card.listings_count, card.id);
          }
          db.exec('COMMIT;');
          db.close();
          console.log('  ✓ SQLite à jour.');
        } catch (e) {
          console.warn('  ⚠ SQLite skip:', e.message);
        }
      }
    } catch (err) {
      console.warn('  ⚠ onepiece-database skip:', err.message);
    }
  } else {
    console.log('2. onepiece-database non trouvé (CI) — étape ignorée.');
  }

  // ─── 3. Mise à jour de optcg_complete_database.json ───
  console.log('\n3. Mise à jour de src/data/optcg_complete_database.json...');
  const completeDbPath = path.join(OPTCG_DIR, 'src/data/optcg_complete_database.json');
  const completeDb = JSON.parse(fs.readFileSync(completeDbPath, 'utf8'));
  let dbUpdated = 0;

  // Build a lookup by card ID for later use
  const priceById = new Map();

  for (const card of completeDb) {
    const parsed = extractSetAndPos(card.image_url);
    if (!parsed) continue;

    const lang = (card.language || 'en').toLowerCase();
    const key = `${parsed.setSlug}#${parsed.pos}#${lang}`;
    const p = priceBySetPosLang.get(key);

    if (p) {
      card.price_eur = p.lmin ?? p.m ?? p.min ?? card.price_eur;
      card.price_min_eur = p.lmin ?? p.min ?? card.price_min_eur;
      card.price_avg7_eur = p.a7 ?? card.price_avg7_eur;
      card.price_avg30_eur = p.a30 ?? card.price_avg30_eur;
      card.listings_count = p.nb ?? p.nml ?? card.listings_count;
      dbUpdated++;
    }

    // Store for later matching by ID
    priceById.set(card.id, {
      price_eur: card.price_eur,
      price_min_eur: card.price_min_eur,
      price_avg7_eur: card.price_avg7_eur,
      price_avg30_eur: card.price_avg30_eur,
      listings_count: card.listings_count,
      card_code: card.card_code,
      variant: card.variant || 1,
      language: lang,
      setSlug: parsed ? parsed.setSlug : (card.set_slug || '').toLowerCase()
    });
  }

  fs.writeFileSync(completeDbPath, JSON.stringify(completeDb, null, 2), 'utf8');
  console.log(`  ✓ ${dbUpdated}/${completeDb.length} cartes actualisées.`);

  // Also build a lookup by code+variant+lang with smart booster vs promo priority
  const priceByCodeVarLang = new Map();
  const priceByCodeVar = new Map();
  for (const [id, info] of priceById) {
    const code = (info.card_code || '').toUpperCase().trim();
    const v = info.variant || 1;
    const lang = (info.language || 'fr').toLowerCase();
    priceByCodeVarLang.set(`${code}#${v}#${lang}`, info);

    const baseSetPrefix = code.split('-')[0].toLowerCase();
    const isBaseBooster = info.setSlug === baseSetPrefix;
    const isPromo = info.setSlug && (info.setSlug.startsWith('pr-') || info.setSlug.startsWith('promo') || info.setSlug.startsWith('champ'));

    const existing = priceByCodeVar.get(`${code}#${v}`);
    if (!existing) {
      priceByCodeVar.set(`${code}#${v}`, info);
    } else {
      const existingIsBaseBooster = existing.setSlug === baseSetPrefix;
      const existingIsPromo = existing.setSlug && (existing.setSlug.startsWith('pr-') || existing.setSlug.startsWith('promo') || existing.setSlug.startsWith('champ'));

      if (isBaseBooster && !existingIsBaseBooster) {
        priceByCodeVar.set(`${code}#${v}`, info);
      } else if (!existingIsBaseBooster && existingIsPromo && !isPromo) {
        priceByCodeVar.set(`${code}#${v}`, info);
      } else if (existing.language !== 'fr' && lang === 'fr' && (!existingIsBaseBooster || isBaseBooster)) {
        priceByCodeVar.set(`${code}#${v}`, info);
      }
    }
  }

  // ─── 4. Mise à jour de variants.json (DOUBLE MAPPING) ───
  console.log('\n4. Mise à jour de src/data/variants.json (double mapping complet)...');
  const variantsPath = path.join(OPTCG_DIR, 'src/data/variants.json');
  const variants = JSON.parse(fs.readFileSync(variantsPath, 'utf8'));
  let varUpdated = 0;

  for (const v of variants) {
    const parsed = extractSetAndPos(v.image_url || v.image_path || v.scalpeurs_image_url);
    if (!parsed) continue;

    // Try language-specific match first, then any language
    const lang = (v.language || 'fr').toLowerCase();
    const p = priceBySetPosLang.get(`${parsed.setSlug}#${parsed.pos}#${lang}`);

    if (p) {
      const trendPrice = p.m ?? p.lmin ?? 0;
      const lowPrice = p.lmin ?? p.min ?? 0;
      const avgPrice = p.a7 ?? trendPrice;

      // ─── Double mapping : anciens champs + nouveaux champs ───
      // Champs lus par cardmarketPriceService.ts → getCardmarketPriceInfo()
      v.cardmarket_trend = trendPrice;
      v.market_price = trendPrice;
      v.cardmarket_low = lowPrice;
      v.low_price = lowPrice;
      v.cardmarket_avg = avgPrice;
      v.avg_price = avgPrice;
      v.trend_price = trendPrice;

      // Champs Scalpeurs (prix détaillés)
      v.price_eur = p.lmin ?? p.m ?? v.price_eur;
      v.price_min_eur = lowPrice || v.price_min_eur;
      v.price_avg7_eur = p.a7 ?? v.price_avg7_eur;
      v.price_avg30_eur = p.a30 ?? v.price_avg30_eur;
      v.listings_count = p.nb ?? p.nml ?? v.listings_count;

      v.updated_at = new Date().toISOString();
      varUpdated++;
    }
  }

  fs.writeFileSync(variantsPath, JSON.stringify(variants, null, 2), 'utf8');
  console.log(`  ✓ ${varUpdated}/${variants.length} variantes actualisées (champs: cardmarket_trend, market_price, price_eur, etc.)`);

  // ─── 5. Mise à jour de cards.json ───
  console.log('\n5. Mise à jour de src/data/cards.json...');
  const cardsPath = path.join(OPTCG_DIR, 'src/data/cards.json');
  const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));
  let cardsUpdated = 0;

  for (const c of cards) {
    const code = (c.card_code || c.id || '').toUpperCase().trim();
    // Use variant 1 (base) for cards.json
    const price = priceByCodeVar.get(`${code}#1`);
    if (price && price.price_eur !== undefined) {
      c.price_eur = price.price_eur;
      c.price_min_eur = price.price_min_eur ?? price.price_eur;
      c.price_avg7_eur = price.price_avg7_eur ?? price.price_eur;
      c.price_avg30_eur = price.price_avg30_eur ?? price.price_eur;
      cardsUpdated++;
    }
  }

  fs.writeFileSync(cardsPath, JSON.stringify(cards, null, 2), 'utf8');
  console.log(`  ✓ ${cardsUpdated}/${cards.length} cartes actualisées.`);

  // ─── 5b. Mise à jour de card_links.json ───
  console.log('\n5b. Mise à jour de src/data/card_links.json...');
  const linksPath = path.join(OPTCG_DIR, 'src/data/card_links.json');
  if (fs.existsSync(linksPath)) {
    const cardLinks = JSON.parse(fs.readFileSync(linksPath, 'utf8'));
    let linksUpdated = 0;
    if (cardLinks.byId) {
      for (const [id, info] of priceById) {
        if (cardLinks.byId[id]) {
          cardLinks.byId[id].price_eur = info.price_eur ?? null;
          linksUpdated++;
        }
      }
    }
    fs.writeFileSync(linksPath, JSON.stringify(cardLinks, null, 2), 'utf8');
    console.log(`  ✓ ${linksUpdated} entrées actualisées.`);
  }

  // ─── 6. Mise à jour de cardmarket_prices.json (fallback frontend) ───
  console.log('\n6. Mise à jour de src/data/cardmarket_prices.json...');
  const cmPricesPath = path.join(OPTCG_DIR, 'src/data/cardmarket_prices.json');
  const cmPrices = fs.existsSync(cmPricesPath) ? JSON.parse(fs.readFileSync(cmPricesPath, 'utf8')) : {};
  let cmUpdated = 0;

  // Build from variant 1 (base) prices grouped by card_code
  for (const [key, info] of priceByCodeVar) {
    const parts = key.split('#');
    const code = parts[0];
    const varNum = parseInt(parts[1], 10);
    // Only use base variant (1) for cardmarket_prices.json
    if (varNum !== 1 || !code) continue;

    const priceEur = info.price_eur ?? 0;
    const minEur = info.price_min_eur ?? 0;
    const avgEur = info.price_avg7_eur ?? priceEur;

    if (priceEur > 0 || minEur > 0) {
      const existing = cmPrices[code] || {};
      cmPrices[code] = {
        idProduct: existing.idProduct || 0,
        trend_eur: priceEur,
        low_eur: minEur,
        avg_eur: avgEur,
        foil_trend_eur: existing.foil_trend_eur || 0,
        url: existing.url || `https://www.cardmarket.com/en/OnePiece/Products/Search?searchString=${encodeURIComponent(code)}`
      };
      cmUpdated++;
    }
  }

  fs.writeFileSync(cmPricesPath, JSON.stringify(cmPrices, null, 2), 'utf8');
  console.log(`  ✓ ${cmUpdated} entrées dans cardmarket_prices.json.`);

  // ─── 7. Mise à jour des micro-fiches public/data/details/*.json ───
  console.log('\n7. Mise à jour des micro-fiches public/data/details/...');
  const detailsDir = path.join(OPTCG_DIR, 'public/data/details');
  const detailsAltDir = HAS_ONPIECE_DIR ? path.join(ONPIECE_DIR_LOCAL, 'data/details') : null;

  if (fs.existsSync(detailsDir)) {
    const detailFiles = fs.readdirSync(detailsDir).filter(f => f.endsWith('.json'));
    let modifiedMicroFiles = 0;

    for (const file of detailFiles) {
      const filePath = path.join(detailsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      // Match by image_url or image_path
      const parsed = extractSetAndPos(data.image_url) || extractSetAndPos(data.image_path);
      const lang = (data.language || 'fr').toLowerCase();
      let changed = false;

      if (parsed) {
        let p = priceBySetPosLang.get(`${parsed.setSlug}#${parsed.pos}#${lang}`);
        if (!p && lang !== 'fr') p = priceBySetPosLang.get(`${parsed.setSlug}#${parsed.pos}#fr`);
        if (!p && lang !== 'en') p = priceBySetPosLang.get(`${parsed.setSlug}#${parsed.pos}#en`);
        if (!p && lang !== 'jp') p = priceBySetPosLang.get(`${parsed.setSlug}#${parsed.pos}#jp`);

        if (p) {
          const newPriceEur = p.m ?? p.lmin ?? p.min ?? null;
          const newMinEur = p.lmin ?? p.min ?? p.m ?? null;
          const newAvg7 = p.a7 ?? null;
          const newAvg30 = p.a30 ?? null;
          const newListings = p.nb ?? p.nml ?? null;

          if (newPriceEur !== null && data.price_eur !== newPriceEur) { data.price_eur = newPriceEur; changed = true; }
          if (newMinEur !== null && data.price_min_eur !== newMinEur) { data.price_min_eur = newMinEur; changed = true; }
          if (newAvg7 !== null && data.price_avg7_eur !== newAvg7) { data.price_avg7_eur = newAvg7; changed = true; }
          if (newAvg30 !== null && data.price_avg30_eur !== newAvg30) { data.price_avg30_eur = newAvg30; changed = true; }
          if (newListings !== null && data.listings_count !== newListings) { data.listings_count = newListings; changed = true; }
        }
      }

      // Also update all_variants array if present
      if (Array.isArray(data.all_variants)) {
        for (const item of data.all_variants) {
          const itemParsed = extractSetAndPos(item.image_url) || extractSetAndPos(item.image_path) || (item.file ? extractSetAndPos(item.file) : null);
          if (itemParsed) {
            let ip = priceBySetPosLang.get(`${itemParsed.setSlug}#${itemParsed.pos}#${lang}`);
            if (!ip && lang !== 'fr') ip = priceBySetPosLang.get(`${itemParsed.setSlug}#${itemParsed.pos}#fr`);
            if (!ip && lang !== 'en') ip = priceBySetPosLang.get(`${itemParsed.setSlug}#${itemParsed.pos}#en`);
            if (!ip && lang !== 'jp') ip = priceBySetPosLang.get(`${itemParsed.setSlug}#${itemParsed.pos}#jp`);

            if (ip) {
              const ivPrice = ip.m ?? ip.lmin ?? ip.min ?? null;
              if (ivPrice !== null && item.price_eur !== ivPrice) {
                item.price_eur = ivPrice;
                changed = true;
              }
            }
          } else if (item.variant_index === 1 && data.price_eur !== null && item.price_eur !== data.price_eur) {
            item.price_eur = data.price_eur;
            changed = true;
          }
        }
      }

      if (changed) {
        const updatedJson = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, updatedJson, 'utf8');
        if (detailsAltDir && fs.existsSync(detailsAltDir)) {
          try { fs.writeFileSync(path.join(detailsAltDir, file), updatedJson, 'utf8'); } catch (e) {}
        }
        modifiedMicroFiles++;
      }
    }
    console.log(`  ✓ ${modifiedMicroFiles}/${detailFiles.length} fiches modifiées.`);
  } else {
    console.log('  ⚠ Dossier public/data/details/ non trouvé — étape ignorée.');
  }

  // ─── 8. Enregistrer les métadonnées de synchronisation ───
  const metaSync = {
    synchronized_at: new Date().toISOString(),
    total_cards: completeDb.length,
    updated_cards: dbUpdated,
    source_releve: metaFr ? metaFr.releve : null,
    source_releve_fin: metaFr ? metaFr.releve_fin : null,
    source_description: metaFr ? metaFr.source : 'cardmarket.com - Near Mint',
    execution_time_seconds: Number(((Date.now() - t0) / 1000).toFixed(2))
  };

  fs.writeFileSync(
    path.join(OPTCG_DIR, 'src/data/price_sync_meta.json'),
    JSON.stringify(metaSync, null, 2),
    'utf8'
  );

  console.log('\n===========================================================');
  console.log(`✨ SUCCÈS : ${dbUpdated} cartes + ${varUpdated} variantes actualisées en ${metaSync.execution_time_seconds}s`);
  console.log(`   cardmarket_prices.json : ${cmUpdated} entrées`);
  console.log(`   Double mapping : price_eur + cardmarket_trend + market_price ✓`);
  console.log('===========================================================');
}

main().catch(err => {
  console.error('❌ Erreur lors de la synchronisation des prix :', err);
  process.exit(1);
});
