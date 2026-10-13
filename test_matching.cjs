const fs = require('fs');

const opDir = 'C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data/';
const cardsAll = JSON.parse(fs.readFileSync(opDir + 'cards-all.json', 'utf8'));
const cardsDetailsObj = JSON.parse(fs.readFileSync(opDir + 'cards-details.json', 'utf8'));
const cardsDetailsList = Object.values(cardsDetailsObj);

console.log('cardsDetails count:', Object.keys(cardsDetailsObj).length);

const sampleEntry = cardsDetailsObj['OP09-004'] || cardsDetailsObj['OP01-001'];
console.log('Sample card in cards-details.json:');
console.log({
  code: sampleEntry.code,
  name: sampleEntry.name,
  cardmarket_url: sampleEntry.cardmarket_url,
  cardmarket_url_jp: sampleEntry.cardmarket_url_jp,
  tcgplayer_url: sampleEntry.tcgplayer_url,
  variantsCount: sampleEntry.variants ? sampleEntry.variants.length : 0,
  variants: sampleEntry.variants
});

// Check how many cardsDetails have tcgplayer_url
const withTcg = cardsDetailsList.filter(c => c.tcgplayer_url);
console.log(`cardsDetails with tcgplayer_url: ${withTcg.length} / ${cardsDetailsList.length}`);

// Check cards-all.json (17330)
console.log('cardsAll count:', cardsAll.length);
const allWithCm = cardsAll.filter(c => c.cardmarket_url);
console.log(`cardsAll with cardmarket_url: ${allWithCm.length} / ${cardsAll.length}`);

// Check image_path or image_url mapping between cardsAll and optcgVariants
const optcgVariants = JSON.parse(fs.readFileSync('src/data/variants.json', 'utf8'));
console.log('optcgVariants count:', optcgVariants.length);

// Compare optcgVariants image_path with cardsAll image_path
let matchCount = 0;
for (let i = 0; i < Math.min(optcgVariants.length, cardsAll.length); i++) {
  const v = optcgVariants[i];
  const a = cardsAll[i];
  if (v.image_path === a.image_path || (v.card_code === a.code && v.language === a.language)) {
    matchCount++;
  }
}
console.log(`Matching optcgVariants[i] with cardsAll[i]: ${matchCount} / 17330`);
