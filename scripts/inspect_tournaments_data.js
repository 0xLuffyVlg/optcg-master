import fs from 'fs';
import path from 'path';

const tournaments = JSON.parse(fs.readFileSync('src/data/tournaments.json', 'utf8'));
console.log('Total tournaments:', tournaments.length);

const sample = tournaments.find(t => t.tournament_results && t.tournament_results.length > 5);
if (sample) {
  console.log('Tournament:', sample.name);
  console.log('Sample result:', sample.tournament_results[0]);
}

// Find a popular leader like ST01-001 or OP01-001 or OP07-019
const leaderCounts = new Map();
for (const t of tournaments) {
  if (t.tournament_results) {
    for (const r of t.tournament_results) {
      const code = r.leader_card_code;
      if (code) {
        leaderCounts.set(code, (leaderCounts.get(code) || 0) + 1);
      }
    }
  }
}

console.log('Top 5 most played leaders:');
const sorted = Array.from(leaderCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
console.log(sorted);
