import fs from 'fs';

// Let's inspect src/data/tournaments.json
const tournaments = JSON.parse(fs.readFileSync('src/data/tournaments.json', 'utf8'));
console.log(`Loaded ${tournaments.length} tournaments.`);

// Check tournaments by set_group
const bySet = {};
for (const t of tournaments) {
  const set = t.set_group || 'UNKNOWN';
  bySet[set] = (bySet[set] || 0) + 1;
}
console.log('Tournaments by set:', bySet);
