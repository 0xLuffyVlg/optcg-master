const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const dbPath = path.resolve(__dirname, '../../onepiece-database/data/onepiece.sqlite');
const db = new DatabaseSync(dbPath);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables);

for (const t of tables) {
  const count = db.prepare('SELECT COUNT(*) as c FROM ' + t.name).get();
  const cols = db.prepare('PRAGMA table_info(' + t.name + ')').all();
  console.log(`\nTable: ${t.name} (Rows: ${count.c})`);
  console.log('Columns:', cols.map(c => c.name).join(', '));
  const sample = db.prepare('SELECT * FROM ' + t.name + ' LIMIT 1').get();
  console.log('Sample row:', sample);
}
