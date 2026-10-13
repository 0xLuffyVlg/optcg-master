const fs = require('fs');

const p = 'C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data/cards-details.json';
const data = JSON.parse(fs.readFileSync(p, 'utf8'));
const arr = Array.isArray(data) ? data : Object.values(data);
console.log('cards-details.json total count:', arr.length);
console.log('Sample keys:', Object.keys(arr[0]));

const withTcg = arr.filter(x => JSON.stringify(x).includes('tcgplayer'));
console.log('Items with tcgplayer count:', withTcg.length);
if (withTcg.length > 0) {
  console.log('Sample item with tcgplayer:');
  const sample = withTcg[0];
  console.log('ID / Code / Name:', sample.id, sample.code, sample.card_code, sample.name);
  for (const [k, v] of Object.entries(sample)) {
    if (typeof v === 'string' && (v.includes('http') || v.includes('tcg') || v.includes('cardmarket'))) {
      console.log(`  ${k}: ${v}`);
    } else if (typeof v === 'object' && v !== null) {
      const str = JSON.stringify(v);
      if (str.includes('tcg') || str.includes('cardmarket')) {
        console.log(`  ${k}: ${str.slice(0, 300)}`);
      }
    }
  }
}
