const fs = require('fs');
const path = require('path');

// Helper: convert a generic Cardmarket URL to a Japanese-specific one (language=7, -Japanese slug)
const SETS_WITH_JP_SLUG = [
  'Romance-Dawn', 'Paramount-War', 'Pillars-of-Strength', 'Kingdoms-of-Intrigue',
  'Awakening-of-the-New-Era', 'Flamboyant', '500-Years-in-the-Future', 'Two-Legends',
  'Emperors-in-the-New-World', 'Royal-Blood', 'A-New-Era-Begins', 'Memorial-Collection'
];
function resolveToJpUrl(url) {
  if (!url || !url.includes('cardmarket.com')) return url;
  let u = url.trim();
  if (u.includes('language=')) u = u.replace(/language=\d+/g, 'language=7');
  else u += (u.includes('?') ? '&' : '?') + 'language=7';
  for (const s of SETS_WITH_JP_SLUG) {
    if (u.includes('/' + s + '/') && !u.includes(s + '-Japanese')) {
      u = u.replace('/' + s + '/', '/' + s + '-Japanese/');
    }
  }
  return u;
}

const opDir = 'C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data/';
console.log('Loading onepiece-database source files...');

const cardsAll = JSON.parse(fs.readFileSync(path.join(opDir, 'cards-all.json'), 'utf8'));
const cardsDetails = JSON.parse(fs.readFileSync(path.join(opDir, 'cards-details.json'), 'utf8'));
const cardsFr = JSON.parse(fs.readFileSync(path.join(opDir, 'cards-fr.json'), 'utf8'));
const cardsEn = JSON.parse(fs.readFileSync(path.join(opDir, 'cards-en.json'), 'utf8'));
const cardsJp = JSON.parse(fs.readFileSync(path.join(opDir, 'cards-jp.json'), 'utf8'));

const compPath = path.join(__dirname, '../src/data/optcg_complete_database.json');
const varsPath = path.join(__dirname, '../src/data/variants.json');
const cardsPath = path.join(__dirname, '../src/data/cards.json');

const comp = JSON.parse(fs.readFileSync(compPath, 'utf8'));
const vars = JSON.parse(fs.readFileSync(varsPath, 'utf8'));
const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));

console.log(`Source records: all=${cardsAll.length}, details=${Object.keys(cardsDetails).length}`);
console.log(`Target records: comp=${comp.length}, vars=${vars.length}, cards=${cards.length}`);

// 1. Build Index from cardsAll by ID
const allById = new Map();
for (const a of cardsAll) {
  if (a.id) allById.set(a.id, a);
}

// 2. Build Index from cardsAll by exact normalized image path (e.g. 'cards-fr/op09-p001.webp')
function normalizeImgPath(p) {
  if (!p) return '';
  return p.toLowerCase()
    .replace('https://scalpeurs.com/img/', '')
    .replace('https://scalpeurs.com/', '')
    .replace(/^\/img\//, '')
    .replace(/^\//, '')
    .trim();
}

const allByNormPath = new Map();
for (const a of cardsAll) {
  const norm1 = normalizeImgPath(a.image_path);
  const norm2 = normalizeImgPath(a.image_url);
  if (norm1) allByNormPath.set(norm1, a);
  if (norm2) allByNormPath.set(norm2, a);
}

// 3. Build TCGplayer lookup from cardsDetails
const tcgByCodeAndVariant = new Map();
const tcgByCardCode = new Map();
for (const [code, d] of Object.entries(cardsDetails)) {
  const cClean = code.toUpperCase().trim();
  if (d.tcgplayer_url) {
    tcgByCardCode.set(cClean, d.tcgplayer_url);
  }
  if (d.variants && Array.isArray(d.variants)) {
    d.variants.forEach((v, idx) => {
      const vNum = v.variant_index || (idx + 1);
      if (v.tcgplayer_url) {
        tcgByCodeAndVariant.set(`${cClean}_${vNum}`, v.tcgplayer_url);
      }
    });
  }
}

// 4. Enrich optcg_complete_database.json (17,330 cards)
let compCmCount = 0;
let compTcgCount = 0;
for (let i = 0; i < comp.length; i++) {
  const target = comp[i];
  const source = allById.get(target.id) || cardsAll[i];
  
  if (source) {
    if (source.cardmarket_url) {
      target.cardmarket_url = source.cardmarket_url;
      compCmCount++;
    }
    if (source.cardmarket_url_jp) {
      target.cardmarket_url_jp = source.cardmarket_url_jp;
    }

    // TCGPlayer match
    const code = (target.card_code || source.code || '').toUpperCase().trim();
    const vNum = source.variant || 1;
    const vTcg = tcgByCodeAndVariant.get(`${code}_${vNum}`) || tcgByCardCode.get(code);
    if (vTcg) {
      target.tcgplayer_url = vTcg;
      compTcgCount++;
    }
  }
}
console.log(`Enriched optcg_complete_database: CM=${compCmCount}, TCG=${compTcgCount}`);

// 5. Enrich variants.json (17,330 variants)
let varsCmCount = 0;
let varsTcgCount = 0;
for (const v of vars) {
  const norm = normalizeImgPath(v.image_path || v.image_url);
  const matchedAll = allByNormPath.get(norm);
  
  if (matchedAll) {
    if (!v.card_code && matchedAll.code) {
      v.card_code = matchedAll.code;
    }
    if (matchedAll.cardmarket_url) {
      v.cardmarket_url = matchedAll.cardmarket_url;
      varsCmCount++;
    }
    if (matchedAll.cardmarket_url_jp) {
      v.cardmarket_url_jp = matchedAll.cardmarket_url_jp;
    }

    const code = (v.card_code || matchedAll.code || '').toUpperCase().trim();
    const vNum = matchedAll.variant || 1;
    const vTcg = tcgByCodeAndVariant.get(`${code}_${vNum}`) || tcgByCardCode.get(code);
    if (vTcg) {
      v.tcgplayer_url = vTcg;
      varsTcgCount++;
    }
  } else if (v.card_code) {
    const code = v.card_code.toUpperCase().trim();
    const d = cardsDetails[code];
    if (d) {
      if (d.cardmarket_url) v.cardmarket_url = d.cardmarket_url;
      if (d.cardmarket_url_jp) v.cardmarket_url_jp = d.cardmarket_url_jp;
      if (d.tcgplayer_url) v.tcgplayer_url = d.tcgplayer_url;
    }
  }
}
console.log(`Enriched variants.json: CM=${varsCmCount}, TCG=${varsTcgCount}`);

// 6. Enrich cards.json (2,885 base cards)
let cardsCmCount = 0;
let cardsTcgCount = 0;

for (const c of cards) {
  const code = (c.card_code || c.id || '').toUpperCase().trim();
  const d = cardsDetails[code];

  if (d) {
    c.cardmarket_url = d.cardmarket_url || null;
    c.cardmarket_url_jp = d.cardmarket_url_jp || null;
    c.tcgplayer_url = d.tcgplayer_url || null;
    if (c.cardmarket_url) cardsCmCount++;
    if (c.tcgplayer_url) cardsTcgCount++;
  } else {
    // Try from cardsFr / cardsEn / cardsJp
    const fromFr = cardsFr.find(x => x.code === code);
    const fromEn = cardsEn.find(x => x.code === code);
    const fromJp = cardsJp.find(x => x.code === code);
    const candidate = fromFr || fromEn || fromJp;
    if (candidate) {
      if (candidate.cardmarket_url) {
        c.cardmarket_url = candidate.cardmarket_url;
        cardsCmCount++;
      }
      if (candidate.cardmarket_url_jp) {
        c.cardmarket_url_jp = candidate.cardmarket_url_jp;
      }
    }
  }

  // Fallback direct TCGplayer search if missing
  if (!c.tcgplayer_url && code) {
    c.tcgplayer_url = `https://www.tcgplayer.com/search/one-piece-card-game/product?q=${encodeURIComponent(code)}`;
    cardsTcgCount++;
  }
}
console.log(`Enriched cards.json: CM=${cardsCmCount}, TCG=${cardsTcgCount}`);

// Save enriched files
fs.writeFileSync(compPath, JSON.stringify(comp, null, 2), 'utf8');
fs.writeFileSync(varsPath, JSON.stringify(vars, null, 2), 'utf8');
fs.writeFileSync(cardsPath, JSON.stringify(cards, null, 2), 'utf8');

// 7. Build card_links.json with multi-level indexing
const cardLinks = {
  byPath: {},      // 'cards-fr/op09-p001.webp' -> { cm, cm_jp, tcg }
  byBasename: {},  // 'op09-p001.webp' -> { fr: { cm, tcg }, en: { cm, tcg }, jp: { cm, tcg } }
  byCode: {},      // 'OP09-001' -> { cm, cm_jp, tcg, fr: cm_fr, en: cm_en, jp: cm_jp }
  byId: {}         // 'fr-op09-OP09-001-reg-1' -> { cm, cm_jp, tcg }
};

for (const a of cardsAll) {
  const cm = a.cardmarket_url || null;
  const cm_jp = a.cardmarket_url_jp || null;
  const code = (a.code || '').toUpperCase().trim();
  const lang = (a.language || 'en').toLowerCase().trim();
  const vNum = a.variant || 1;
  const tcg = tcgByCodeAndVariant.get(`${code}_${vNum}`) || tcgByCardCode.get(code) || null;

  const linkObj = { cm, cm_jp, tcg };

  if (a.id) cardLinks.byId[a.id] = linkObj;

  const norm = normalizeImgPath(a.image_path || a.image_url);
  if (norm) cardLinks.byPath[norm] = linkObj;

  const base = norm.split('/').pop().toLowerCase();
  if (base) {
    if (!cardLinks.byBasename[base]) cardLinks.byBasename[base] = {};
    cardLinks.byBasename[base][lang] = linkObj;
  }

  if (code) {
    if (!cardLinks.byCode[code]) {
      cardLinks.byCode[code] = {
        cm: null,
        cm_jp: null,
        tcg: null,
        fr: null,
        en: null,
        jp: null
      };
    }
    const cEntry = cardLinks.byCode[code];
    if (lang === 'fr' && cm) cEntry.fr = cm;
    if (lang === 'en' && cm) cEntry.en = cm;
    // For JP entries: prefer cm_jp (already Japanese-specific URL), else derive from base URL
    if (lang === 'jp') {
      const jpUrl = cm_jp || (cm ? resolveToJpUrl(cm) : null);
      if (jpUrl) cEntry.jp = jpUrl;
    }
    if (cm_jp) cEntry.cm_jp = cm_jp;
    if (tcg && !cEntry.tcg) cEntry.tcg = tcg;
    if (!cEntry.cm) cEntry.cm = (lang === 'fr' ? cEntry.fr : (cEntry.en || cEntry.jp || cm));
  }
}

// Add base cards to byCode
for (const c of cards) {
  const code = (c.card_code || c.id || '').toUpperCase().trim();
  if (code && !cardLinks.byCode[code]) {
    cardLinks.byCode[code] = {
      cm: c.cardmarket_url || null,
      cm_jp: c.cardmarket_url_jp || null,
      tcg: c.tcgplayer_url || null
    };
  }
}

const cardLinksPath = path.join(__dirname, '../src/data/card_links.json');
fs.writeFileSync(cardLinksPath, JSON.stringify(cardLinks, null, 2), 'utf8');
console.log(`card_links.json written: byPath=${Object.keys(cardLinks.byPath).length}, byBasename=${Object.keys(cardLinks.byBasename).length}, byCode=${Object.keys(cardLinks.byCode).length}, byId=${Object.keys(cardLinks.byId).length}`);
console.log('Complete rebuild done!');
