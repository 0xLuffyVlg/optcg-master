const fs = require('fs');
const path = require('path');

const tables = new Set();
const usages = [];

function search(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f === 'node_modules' || f === '.git' || f === 'dist' || f === '.vercel') continue;
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      search(full);
    } else if (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.sql')) {
      const content = fs.readFileSync(full, 'utf8');
      const regex = /\.from\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        tables.add(match[1]);
        usages.push({ file: full, table: match[1] });
      }
    }
  }
}
search('.');

console.log('=== ALL SUPABASE TABLES ACCESSED IN CODEBASE ===');
console.log(Array.from(tables));
console.log('\n=== USAGE BREAKDOWN ===');
usages.forEach(u => console.log(u.file, '-> table:', u.table));
