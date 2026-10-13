const fs = require('fs');
const path = require('path');

const detailsPath = path.resolve(__dirname, '../../onepiece-database/data/cards-details.json');
const outputPath = path.resolve(__dirname, '../supabase/migrations/20260930_card_details_inserts.sql');

const details = JSON.parse(fs.readFileSync(detailsPath, 'utf8'));

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  return "'" + String(val).replace(/'/g, "''") + "'";
}

let sql = '-- Inserts pour la table card_details (2710 cartes de onepiece-database)\n';
for (const [code, d] of Object.entries(details)) {
  const values = [
    escapeSql(d.code),
    escapeSql(d.name),
    escapeSql(d.category),
    escapeSql(d.cost),
    escapeSql(d.power),
    escapeSql(d.counter),
    escapeSql(d.life),
    escapeSql(d.attribute),
    escapeSql(d.types),
    escapeSql(d.effect),
    escapeSql(d.trigger),
    escapeSql(d.illust),
    escapeSql(d.color),
    escapeSql(d.rarity),
    escapeSql(d.block),
    escapeSql(d.language)
  ].join(', ');

  sql += `INSERT INTO public.card_details (code, name, category, cost, power, counter, life, attribute, types, effect, trigger, illust, color, rarity, block, language) VALUES (${values}) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, effect = EXCLUDED.effect, cost = EXCLUDED.cost, power = EXCLUDED.power, counter = EXCLUDED.counter, types = EXCLUDED.types, attribute = EXCLUDED.attribute;\n`;
}

fs.writeFileSync(outputPath, sql, 'utf8');
console.log('Successfully generated SQL inserts for', Object.keys(details).length, 'cards in', outputPath);
