import fs from 'fs';

const tournaments = JSON.parse(fs.readFileSync('src/data/tournaments.json', 'utf8'));

const leaderMap = new Map();
for (const t of tournaments) {
  if (t.tournament_results) {
    for (const r of t.tournament_results) {
      const leader = r.deck_type;
      if (leader) {
        if (!leaderMap.has(leader)) {
          leaderMap.set(leader, []);
        }
        leaderMap.get(leader).push({
          placement: r.placement,
          playerName: r.player_name,
          deckUrl: r.deck_list_url?.[0],
          tournament: t.name || t.tournament_name || 'Major Tournament'
        });
      }
    }
  }
}

console.log('Total unique leaders in tournaments:', leaderMap.size);
const sorted = Array.from(leaderMap.entries()).sort((a, b) => b[1].length - a[1].length).slice(0, 10);
for (const [leader, lists] of sorted) {
  console.log(`${leader}: ${lists.length} decklists recorded`);
}

// Sample leader lists
const op17Sample = leaderMap.get('OP17-039') || [];
console.log(`\nSample for OP17-039 (${op17Sample.length} lists):`);
console.log(op17Sample.slice(0, 3));
