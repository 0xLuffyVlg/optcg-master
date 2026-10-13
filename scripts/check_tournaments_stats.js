import fs from 'fs';

const tournaments = JSON.parse(fs.readFileSync('src/data/tournaments.json', 'utf8'));
console.log('Total tournaments:', tournaments.length);
if (tournaments.length > 0) {
  console.log('First 5 tournament names:');
  tournaments.slice(0, 5).forEach((t, i) => console.log(`${i + 1}. ${t.tournament_name} (${t.set_group || t.format}) - ${t.tournament_results?.length || 0} results`));
  console.log('Last 5 tournament names:');
  tournaments.slice(-5).forEach((t, i) => console.log(`${i + 1}. ${t.tournament_name} (${t.set_group || t.format})`));
}
