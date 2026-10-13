const fs = require('fs');

const cards = JSON.parse(fs.readFileSync('src/data/cards.json', 'utf8'));
const variants = JSON.parse(fs.readFileSync('src/data/variants.json', 'utf8'));
const urls = JSON.parse(fs.readFileSync('src/data/cardmarket_product_urls.json', 'utf8'));

const kid = cards.find(c => c.card_code === 'ST36-005');

console.log('Kid in cards.json:');
console.log({
  card_code: kid.card_code,
  _defaultImagePath: kid._defaultImagePath,
  _imagePaths: kid._imagePaths,
  price_min_eur: kid.price_min_eur,
  price_eur: kid.price_eur,
  price_avg7_eur: kid.price_avg7_eur,
  price_avg30_eur: kid.price_avg30_eur,
  listings_count: kid.listings_count
});
