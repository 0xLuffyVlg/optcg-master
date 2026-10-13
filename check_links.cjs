const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data';
const files = fs.readdirSync(dir);
for (const file of files) {
  const fullPath = path.join(dir, file);
  const stat = fs.statSync(fullPath);
  if (stat.isFile() && (file.endsWith('.json') || file.endsWith('.csv') || file.endsWith('.sql'))) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasTcg = content.toLowerCase().includes('tcgplayer');
    const hasCm = content.toLowerCase().includes('cardmarket');
    console.log(`File: ${file} (${(stat.size / 1024 / 1024).toFixed(2)} MB) -> Cardmarket: ${hasCm}, TCGplayer: ${hasTcg}`);
  }
}
