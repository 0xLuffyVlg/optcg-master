import fs from 'fs';

const cards = JSON.parse(fs.readFileSync('src/data/cards.json', 'utf8'));
const categories = new Set();
for (const c of cards) {
  categories.add(c.category);
}

console.log('Categories in cards.json:', Array.from(categories));
