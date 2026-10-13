import fs from 'fs';

const data = JSON.parse(fs.readFileSync('src/data/tournaments.json', 'utf8'));

const distinctDates = new Set();
data.forEach(t => {
  if (t.start_date) distinctDates.add(t.start_date);
});

console.log('Total tournaments:', data.length);
console.log('Sample dates:', Array.from(distinctDates).slice(0, 30));
