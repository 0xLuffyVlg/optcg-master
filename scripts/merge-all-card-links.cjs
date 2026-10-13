const fs = require('fs');
const path = require('path');

const opDir = 'C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data/';
console.log('Loading onepiece-database source files...');

const cardsDetailsObj = JSON.parse(fs.readFileSync(path.join(opDir, 'cards-details.json'), 'utf8'));
const cardsAll = JSON.parse(fs.readFileSync(path.join(opDir, 'cards-all.json'), 'utf8'));
const cardsFr = JSON.parse(fs.readFileSync(path.join(opDir, 'cards-fr.json'), 'utf8'));
const cardsEn = JSON.parse(fs.readFileSync(path.join(opDir, 'cards-en.json'), 'utf8'));
const cardsJp = JSON.parse(fs.readFileSync(path.join(opDir, 'cards-jp.json'), 'utf8'));

const optcgCardsPath = path.join(__dirname, '../src/data/cards.json');
const optcgVariantsPath = path.join(__dirname, '../src/data/variants.json');

const optcgCards = JSON.parse(fs.readFileSync(optcgCardsPath, 'utf8'));
const optcgVariants = JSON.parse(fs.readFileSync(optcgVariantsPath, 'utf8'));

console.log(`Source records: details=${Object.keys(cardsDetailsObj).length}, all=${cardsAll.length}, fr=${cardsFr.length}, en=${cardsEn.length}, jp=${cardsJp.length}`);
console.log(`Target records: cards=${optcgCards.length}, variants=${optcgVariants.length}`);

// 1. Index cardsAll by image basename
const allByImgBasename = new Map();
for (const a of cardsAll) {
  if (a.image_path) {
    const base = a.image_path.split('/').pop().toLowerCase();
    allByImgBasename.set(base, a);
  }
}

// 2. Index cardsAll by code + language
const allByCodeLang = new Map();
for (const a of cardsAll) {
  const code = (a.code || '').toUpperCase().trim();
  const lang = (a.language || '').toLowerCase().trim();
  const key = `${code}_${lang}`;
  if (!allByCodeLang.has(key)) allByCodeLang.set(key, []);
  allByCodeLang.get(key).push(a);
}

// 3. Index cardsDetails variants by image basename
const detailVarByImg = new Map();
for (const [code, d] of Object.entries(cardsDetailsObj)) {
  if (d.variants && Array.isArray(d.variants)) {
    d.variants.forEach(v => {
      if (v.image_url) {
        const base = v.image_url.split('/').pop().toLowerCase();
        detailVarByImg.set(base, v);
      }
    });
  }
}

// === ENRICH VARIANTS ===
let varCmCount = 0;
let varCmJpCount = 0;
let varTcgCount = 0;

for (const v of optcgVariants) {
  const code = (v.card_code || '').toUpperCase().trim();
  const vImgBase = v.image_path ? v.image_path.split('/').pop().toLowerCase() : '';
  
  // 1. Match from cardsAll (100% 1:1 image basename match)
  const matchedAll = vImgBase ? allByImgBasename.get(vImgBase) : null;
  if (matchedAll) {
    if (matchedAll.cardmarket_url) {
      v.cardmarket_url = matchedAll.cardmarket_url;
      varCmCount++;
    }
    if (matchedAll.cardmarket_url_jp) {
      v.cardmarket_url_jp = matchedAll.cardmarket_url_jp;
      varCmJpCount++;
    }
  }

  // 2. Match from cardsDetails
  const detail = cardsDetailsObj[code];
  if (detail) {
    const matchedDetailVar = (vImgBase && detailVarByImg.get(vImgBase));
    if (matchedDetailVar && matchedDetailVar.tcgplayer_url) {
      v.tcgplayer_url = matchedDetailVar.tcgplayer_url;
      varTcgCount++;
    } else if (detail.tcgplayer_url) {
      v.tcgplayer_url = detail.tcgplayer_url;
      varTcgCount++;
    }

    if (!v.cardmarket_url && detail.cardmarket_url) {
      v.cardmarket_url = detail.cardmarket_url;
      varCmCount++;
    }
    if (!v.cardmarket_url_jp && detail.cardmarket_url_jp) {
      v.cardmarket_url_jp = detail.cardmarket_url_jp;
      varCmJpCount++;
    }
  }

  // 3. Fallback TCGplayer search URL if missing
  if (!v.tcgplayer_url && code) {
    v.tcgplayer_url = `https://www.tcgplayer.com/search/one-piece-card-game/product?q=${encodeURIComponent(code)}`;
  }
}

console.log(`Variants enriched: CM=${varCmCount}, CM_JP=${varCmJpCount}, TCG=${varTcgCount}`);

// === ENRICH CARDS ===
let cardCmCount = 0;
let cardCmJpCount = 0;
let cardTcgCount = 0;

for (const c of optcgCards) {
  const code = (c.card_code || c.id || '').toUpperCase().trim();
  const detail = cardsDetailsObj[code];
  
  if (detail) {
    if (detail.cardmarket_url) {
      c.cardmarket_url = detail.cardmarket_url;
      cardCmCount++;
    }
    if (detail.cardmarket_url_jp) {
      c.cardmarket_url_jp = detail.cardmarket_url_jp;
      cardCmJpCount++;
    }
    if (detail.tcgplayer_url) {
      c.tcgplayer_url = detail.tcgplayer_url;
      cardTcgCount++;
    }
  }

  // If missing cardmarket_url from details, try cardsAll
  if (!c.cardmarket_url) {
    const listFr = allByCodeLang.get(`${code}_fr`);
    const listEn = allByCodeLang.get(`${code}_en`);
    const listJp = allByCodeLang.get(`${code}_jp`);
    const found = (listFr && listFr[0]) || (listEn && listEn[0]) || (listJp && listJp[0]);
    if (found && found.cardmarket_url) {
      c.cardmarket_url = found.cardmarket_url;
      cardCmCount++;
    }
    if (found && found.cardmarket_url_jp) {
      c.cardmarket_url_jp = found.cardmarket_url_jp;
      cardCmJpCount++;
    }
  }

  // Fallback TCGplayer search URL if missing
  if (!c.tcgplayer_url && code) {
    c.tcgplayer_url = `https://www.tcgplayer.com/search/one-piece-card-game/product?q=${encodeURIComponent(code)}`;
  }
}

console.log(`Cards enriched: CM=${cardCmCount}, CM_JP=${cardCmJpCount}, TCG=${cardTcgCount}`);

// Write back to files
fs.writeFileSync(optcgCardsPath, JSON.stringify(optcgCards, null, 2), 'utf8');
fs.writeFileSync(optcgVariantsPath, JSON.stringify(optcgVariants, null, 2), 'utf8');

// Build an ultra-fast lookup map card_links.json for runtime resolution
const linksMap = {
  byCode: {},
  byImage: {}
};

for (const c of optcgCards) {
  const code = (c.card_code || c.id || '').toUpperCase().trim();
  if (code) {
    linksMap.byCode[code] = {
      cm: c.cardmarket_url || null,
      cm_jp: c.cardmarket_url_jp || null,
      tcg: c.tcgplayer_url || null
    };
  }
}

for (const v of optcgVariants) {
  if (v.image_path) {
    const base = v.image_path.split('/').pop().toLowerCase();
    linksMap.byImage[base] = {
      cm: v.cardmarket_url || null,
      cm_jp: v.cardmarket_url_jp || null,
      tcg: v.tcgplayer_url || null
    };
  }
}

const cardLinksPath = path.join(__dirname, '../src/data/card_links.json');
fs.writeFileSync(cardLinksPath, JSON.stringify(linksMap), 'utf8');
console.log(`Wrote card_links.json with ${Object.keys(linksMap.byCode).length} codes and ${Object.keys(linksMap.byImage).length} images.`);
console.log('Merge complete successfully!');
