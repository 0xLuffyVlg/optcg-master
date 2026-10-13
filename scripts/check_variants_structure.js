import fs from 'fs';

const prodData = JSON.parse(fs.readFileSync('src/data/cards.json', 'utf8'));
const variantsData = JSON.parse(fs.readFileSync('src/data/variants.json', 'utf8'));

console.log('Sample variants for OP01-001:');
const zoroVariants = variantsData.filter(v => v.card_code === 'OP01-001');
console.log(zoroVariants.map(v => ({ id: v.id, variant_type: v.variant_type, price: v.market_price })));

console.log('\nSample variants for OP17-039:');
const rocksVariants = variantsData.filter(v => v.card_code === 'OP17-039');
console.log(rocksVariants.map(v => ({ id: v.id, variant_type: v.variant_type, price: v.market_price })));
