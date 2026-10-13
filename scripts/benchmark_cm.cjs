const https = require('https');
const fs = require('fs');

const agent = new https.Agent({ keepAlive: true, maxSockets: 20 });
const frSitemap = JSON.parse(fs.readFileSync('C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data/sitemap_urls_fr.json', 'utf8'));

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

async function benchmark() {
  const keys = Object.keys(frSitemap).slice(0, 50);
  console.time('50 cards');
  const results = await Promise.all(keys.map(k => fetchCmLink(frSitemap[k])));
  console.timeEnd('50 cards');
  console.log('Sample result:', keys[0], results[0]);
  console.log('Non-null count:', results.filter(Boolean).length);
}
benchmark();
