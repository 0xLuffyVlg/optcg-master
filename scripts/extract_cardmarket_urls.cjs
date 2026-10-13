const https = require('https');
const fs = require('fs');
const path = require('path');

const agent = new https.Agent({ keepAlive: true, maxSockets: 25 });
const frSitemap = JSON.parse(fs.readFileSync('C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data/sitemap_urls_fr.json', 'utf8'));
const enSitemap = JSON.parse(fs.readFileSync('C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data/sitemap_urls_en.json', 'utf8'));

function fetchCmLink(url) {
  return new Promise((resolve) => {
    https.get(url, { agent, headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const m = data.match(/appLinks:\$R\[\d+\]=\{cm:"([^"]+)"/);
        if (m) return resolve(m[1]);
        const m2 = data.match(/href="(https:\/\/www\.cardmarket\.com\/[^"]+)"/);
        return resolve(m2 ? m2[1] : null);
      });
    }).on('error', () => resolve(null));
  });
}

async function runQueue(items, concurrency = 20) {
  const results = {};
  let idx = 0;
  const total = items.length;

  async function worker() {
    while (idx < total) {
      const current = items[idx++];
      try {
        const cmUrl = await fetchCmLink(current.url);
        if (cmUrl) {
          results[current.code] = cmUrl;
        }
      } catch (e) {}
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

async function main() {
  console.log('Extracting FR cards Cardmarket URLs...');
  const frItems = Object.entries(frSitemap).map(([code, url]) => ({ code, url }));
  console.time('FR fetch');
  const frUrls = await runQueue(frItems, 25);
  console.timeEnd('FR fetch');
  console.log(`FR fetched: ${Object.keys(frUrls).length} / ${frItems.length}`);

  console.log('Extracting EN cards Cardmarket URLs...');
  const enItems = Object.entries(enSitemap).map(([code, url]) => ({ code, url }));
  console.time('EN fetch');
  const enUrls = await runQueue(enItems, 25);
  console.timeEnd('EN fetch');
  console.log(`EN fetched: ${Object.keys(enUrls).length} / ${enItems.length}`);

  const combined = {
    fr: frUrls,
    en: enUrls
  };

  const outPath = path.resolve('src/data/cardmarket_product_urls.json');
  fs.writeFileSync(outPath, JSON.stringify(combined, null, 2), 'utf8');
  console.log(`Saved ${Object.keys(frUrls).length} FR and ${Object.keys(enUrls).length} EN Cardmarket URLs to ${outPath}!`);

  // Verify ST36-005
  console.log('ST36-005 FR:', frUrls['ST36-005']);
  console.log('ST36-005 EN:', enUrls['ST36-005']);
}

main().catch(console.error);
