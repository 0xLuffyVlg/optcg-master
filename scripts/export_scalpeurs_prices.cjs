/**
 * scripts/export_scalpeurs_prices.cjs
 * 
 * Permet d'exporter les prix JSON de scalpeurs.com :
 * Usage :
 *   node scripts/export_scalpeurs_prices.cjs [set_slug] [lang]
 * Exemples :
 *   node scripts/export_scalpeurs_prices.cjs op09 fr
 *   node scripts/export_scalpeurs_prices.cjs all fr
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function main() {
  const targetSet = (process.argv[2] || 'op09').toLowerCase();
  const targetLang = (process.argv[3] || 'fr').toLowerCase();

  console.log(`📦 Extraction des prix scalpeurs.com [Set: ${targetSet.toUpperCase()}, Langue: ${targetLang.toUpperCase()}]...`);

  if (targetSet !== 'all') {
    const url = `https://scalpeurs.com/api/prix-groupe/${targetLang}/${targetSet}`;
    try {
      const data = await fetchJson(url);
      const outPath = path.resolve(__dirname, `../public/data/prices_${targetSet}_${targetLang}.json`);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
      
      const count = data[targetSet] ? Object.keys(data[targetSet]).length : 0;
      console.log(`✓ ${count} cartes extraites avec succès pour ${targetSet.toUpperCase()}`);
      console.log(`✓ Fichier JSON généré : ${outPath}`);
    } catch (err) {
      console.error(`❌ Erreur : ${err.message}`);
    }
  } else {
    // Exporter un index complet
    console.log('Synchronisation et export complet...');
  }
}

main();
