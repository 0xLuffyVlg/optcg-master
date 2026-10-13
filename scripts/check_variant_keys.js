import fs from 'fs';
const variantsData = JSON.parse(fs.readFileSync('src/data/variants.json', 'utf8'));
console.log('Keys in a variant:', Object.keys(variantsData[0]));
console.log('Sample variant 0:', variantsData[0]);
console.log('Sample variant 1:', variantsData[1]);
