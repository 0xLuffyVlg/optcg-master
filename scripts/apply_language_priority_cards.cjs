const fs = require('fs');
const path = require('path');

const frCards = JSON.parse(fs.readFileSync('C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data/cards-fr.json', 'utf8'));
const enCards = JSON.parse(fs.readFileSync('C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data/cards-en.json', 'utf8'));
const jpCards = JSON.parse(fs.readFileSync('C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data/cards-jp.json', 'utf8'));

// Build maps by code
const frMap = new Map();
for (const c of frCards) {
  if (c.code) frMap.set(c.code.trim().toUpperCase(), c);
}

const enMap = new Map();
for (const c of enCards) {
  if (c.code) enMap.set(c.code.trim().toUpperCase(), c);
}

const jpMap = new Map();
for (const c of jpCards) {
  if (c.code) jpMap.set(c.code.trim().toUpperCase(), c);
}

// 1. Update cards.json
const cardsPath = path.resolve('src/data/cards.json');
const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));

let updatedFrCount = 0;
let updatedEnCount = 0;

for (const card of cards) {
  const code = (card.card_code || card.id || '').trim().toUpperCase();
  const fr = frMap.get(code);
  const en = enMap.get(code);
  const jp = jpMap.get(code);

  const allImages = card._imagePaths || (card._defaultImagePath ? [card._defaultImagePath] : []);

  // Find images for each language
  const frImg = allImages.find(img => img.includes('/cards-fr/')) || (fr ? fr.image_url : null);
  const enImg = allImages.find(img => img.includes('/cards-en/')) || (en ? en.image_url : null);
  const jpImg = allImages.find(img => img.includes('/cards-jp/')) || (jp ? jp.image_url : null);
  const otherImgs = allImages.filter(img => !img.includes('/cards-fr/') && !img.includes('/cards-en/') && !img.includes('/cards-jp/'));

  if (fr) {
    updatedFrCount++;
    // French priority
    if (frImg) {
      card._defaultImagePath = frImg;
      const sortedImgs = [frImg];
      if (enImg) sortedImgs.push(enImg);
      if (jpImg) sortedImgs.push(jpImg);
      sortedImgs.push(...otherImgs);
      card._imagePaths = [...new Set(sortedImgs)];
    }
    card.price_min_eur = fr.price_min_eur !== null && fr.price_min_eur !== undefined ? fr.price_min_eur : card.price_min_eur;
    card.price_eur = fr.price_eur !== null && fr.price_eur !== undefined ? fr.price_eur : card.price_eur;
    card.price_avg7_eur = fr.price_avg7_eur !== null && fr.price_avg7_eur !== undefined ? fr.price_avg7_eur : card.price_avg7_eur;
    card.price_avg30_eur = fr.price_avg30_eur !== null && fr.price_avg30_eur !== undefined ? fr.price_avg30_eur : card.price_avg30_eur;
    card.listings_count = fr.listings_count !== null && fr.listings_count !== undefined ? fr.listings_count : card.listings_count;
    if (fr.name) card.name_fr = fr.name;
  } else if (en) {
    updatedEnCount++;
    // English priority
    if (enImg) {
      card._defaultImagePath = enImg;
      const sortedImgs = [enImg];
      if (jpImg) sortedImgs.push(jpImg);
      sortedImgs.push(...otherImgs);
      card._imagePaths = [...new Set(sortedImgs)];
    }
    card.price_min_eur = en.price_min_eur !== null && en.price_min_eur !== undefined ? en.price_min_eur : card.price_min_eur;
    card.price_eur = en.price_eur !== null && en.price_eur !== undefined ? en.price_eur : card.price_eur;
    card.price_avg7_eur = en.price_avg7_eur !== null && en.price_avg7_eur !== undefined ? en.price_avg7_eur : card.price_avg7_eur;
    card.price_avg30_eur = en.price_avg30_eur !== null && en.price_avg30_eur !== undefined ? en.price_avg30_eur : card.price_avg30_eur;
    card.listings_count = en.listings_count !== null && en.listings_count !== undefined ? en.listings_count : card.listings_count;
  } else if (jp) {
    if (jpImg) {
      card._defaultImagePath = jpImg;
      card._imagePaths = [...new Set([jpImg, ...otherImgs])];
    }
    card.price_min_eur = jp.price_min_eur !== null && jp.price_min_eur !== undefined ? jp.price_min_eur : card.price_min_eur;
    card.price_eur = jp.price_eur !== null && jp.price_eur !== undefined ? jp.price_eur : card.price_eur;
    card.price_avg7_eur = jp.price_avg7_eur !== null && jp.price_avg7_eur !== undefined ? jp.price_avg7_eur : card.price_avg7_eur;
    card.price_avg30_eur = jp.price_avg30_eur !== null && jp.price_avg30_eur !== undefined ? jp.price_avg30_eur : card.price_avg30_eur;
    card.listings_count = jp.listings_count !== null && jp.listings_count !== undefined ? jp.listings_count : card.listings_count;
  }
}

fs.writeFileSync(cardsPath, JSON.stringify(cards, null, 2), 'utf8');
console.log(`Updated cards.json: ${updatedFrCount} FR prioritized, ${updatedEnCount} EN prioritized.`);

// Check ST36-005 specifically
const kid = cards.find(c => c.card_code === 'ST36-005');
console.log('Updated ST36-005:', {
  card_code: kid.card_code,
  _defaultImagePath: kid._defaultImagePath,
  _imagePaths: kid._imagePaths,
  price_min_eur: kid.price_min_eur,
  price_eur: kid.price_eur,
  price_avg7_eur: kid.price_avg7_eur,
  price_avg30_eur: kid.price_avg30_eur,
  listings_count: kid.listings_count
});
