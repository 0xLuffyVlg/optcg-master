const fs = require('fs');

const opDir = 'C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data/';
const cardsDetailsObj = JSON.parse(fs.readFileSync(opDir + 'cards-details.json', 'utf8'));
const cardsAll = JSON.parse(fs.readFileSync(opDir + 'cards-all.json', 'utf8'));
const cardsFr = JSON.parse(fs.readFileSync(opDir + 'cards-fr.json', 'utf8'));
const cardsEn = JSON.parse(fs.readFileSync(opDir + 'cards-en.json', 'utf8'));
const cardsJp = JSON.parse(fs.readFileSync(opDir + 'cards-jp.json', 'utf8'));

const optcgCards = JSON.parse(fs.readFileSync('src/data/cards.json', 'utf8'));
const optcgVariants = JSON.parse(fs.readFileSync('src/data/variants.json', 'utf8'));

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

// 3. Index cardsDetails variants by image basename or variant_index
const detailVarByImg = new Map();
const detailVarByCodeAndIndex = new Map();
for (const [code, d] of Object.entries(cardsDetailsObj)) {
  if (d.variants && Array.isArray(d.variants)) {
    d.variants.forEach((v, idx) => {
      if (v.image_url) {
        const base = v.image_url.split('/').pop().toLowerCase();
        detailVarByImg.set(base, v);
      }
      detailVarByCodeAndIndex.set(`${code.toUpperCase()}_${idx + 1}`, v);
      detailVarByCodeAndIndex.set(`${code.toUpperCase()}_${v.variant_index}`, v);
    });
  }
}

console.log('Indexed cardsAll img basenames:', allByImgBasename.size);
console.log('Indexed detail variants:', detailVarByImg.size);

// === ENRICH VARIANTS ===
let varCmCount = 0;
let varCmJpCount = 0;
let varTcgCount = 0;

for (const v of optcgVariants) {
  const code = (v.card_code || '').toUpperCase().trim();
  const vImgBase = v.image_path ? v.image_path.split('/').pop().toLowerCase() : '';
  
  // Find in cardsAll
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

  // Find in cardsDetails
  const detail = cardsDetailsObj[code];
  if (detail) {
    // Check variant in details
    const matchedDetailVar = (vImgBase && detailVarByImg.get(vImgBase));
    if (matchedDetailVar && matchedDetailVar.tcgplayer_url) {
      v.tcgplayer_url = matchedDetailVar.tcgplayer_url;
      varTcgCount++;
    } else if (detail.tcgplayer_url) {
      // If variant doesn't have specific tcg link, fallback to base card tcgplayer link
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
}

console.log('Enriched variants (out of 17330):');
console.log('  with cardmarket_url:', varCmCount);
console.log('  with cardmarket_url_jp:', varCmJpCount);
console.log('  with tcgplayer_url:', varTcgCount);

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

  // If still missing tcgplayer_url, build standard search URL
  if (!c.tcgplayer_url) {
    c.tcgplayer_url = `https://www.tcgplayer.com/search/one-piece-card-game/product?q=${encodeURIComponent(code)}`;
  }
}

console.log('Enriched cards (out of 2885):');
console.log('  with cardmarket_url:', cardCmCount);
console.log('  with cardmarket_url_jp:', cardCmJpCount);
console.log('  with tcgplayer_url:', cardTcgCount);

console.log('\nSample enriched card (OP09-004 Shanks):');
const shanks = optcgCards.find(c => c.card_code === 'OP09-004');
console.log({
  code: shanks.card_code,
  name: shanks.name,
  cardmarket_url: shanks.cardmarket_url,
  tcgplayer_url: shanks.tcgplayer_url
});

console.log('Sample enriched variant (first 3):');
optcgVariants.slice(0, 3).forEach(v => {
  console.log({
    code: v.card_code,
    lang: v.language,
    cardmarket_url: v.cardmarket_url,
    tcgplayer_url: v.tcgplayer_url
  });
});
