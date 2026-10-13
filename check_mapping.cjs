const fs = require('fs');

const opDir = 'C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data/';
const cardsAll = JSON.parse(fs.readFileSync(opDir + 'cards-all.json', 'utf8'));
const optcgVariants = JSON.parse(fs.readFileSync('src/data/variants.json', 'utf8'));

// Build lookup map from cardsAll
const byImgBasename = new Map();
const byCodeLang = new Map();

for (const a of cardsAll) {
  if (a.image_path) {
    const base = a.image_path.split('/').pop().toLowerCase();
    byImgBasename.set(base, a);
  }
  const key = `${(a.code || '').toUpperCase()}_${(a.language || '').toLowerCase()}`;
  if (!byCodeLang.has(key)) byCodeLang.set(key, []);
  byCodeLang.get(key).push(a);
}

let matchedByImg = 0;
let matchedByCodeLang = 0;

for (const v of optcgVariants) {
  const vImg = v.image_path ? v.image_path.split('/').pop().toLowerCase() : '';
  if (vImg && byImgBasename.has(vImg)) {
    matchedByImg++;
  } else {
    const key = `${(v.card_code || '').toUpperCase()}_${(v.language || '').toLowerCase()}`;
    if (byCodeLang.has(key)) {
      matchedByCodeLang++;
    }
  }
}

console.log('Matching optcgVariants (17330):');
console.log('  Matched by img basename:', matchedByImg);
console.log('  Matched by code+lang:', matchedByCodeLang);
console.log('Total matched:', matchedByImg + matchedByCodeLang);

console.log('Sample 3 v.image_path:');
optcgVariants.slice(0, 3).forEach(v => console.log('  v:', v.card_code, v.language, v.image_path));
console.log('Sample 3 cardsAll.image_path:');
cardsAll.slice(0, 3).forEach(a => console.log('  a:', a.code, a.language, a.image_path, a.cardmarket_url));
