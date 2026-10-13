import fs from 'fs';
import path from 'path';

function searchInDir(dir, pattern) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      searchInDir(full, pattern);
    } else if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.json')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes(pattern)) {
        console.log(`Found "${pattern}" in: ${full}`);
      }
    }
  }
}

searchInDir('src', 'tournaments.json');
searchInDir('src', 'TournamentsView');
searchInDir('api', 'tournaments');
