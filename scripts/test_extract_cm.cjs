const https = require('https');
const fs = require('fs');

const frSitemap = JSON.parse(fs.readFileSync('C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data/sitemap_urls_fr.json', 'utf8'));
const enSitemap = JSON.parse(fs.readFileSync('C:/Users/LuffyVlg/.gemini/antigravity/scratch/onepiece-database/data/sitemap_urls_en.json', 'utf8'));

function fetchCardCmLink(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const m = data.match(/appLinks:\$R\[\d+\]=\{cm:"([^"]+)"/);
        if (m) {
          resolve(m[1]);
        } else {
          const m2 = data.match(/"(https:\/\/www\.cardmarket\.com\/[^\"]+)"/);
          resolve(m2 ? m2[1] : null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function test() {
  const tests = [
    { code: 'OP01-001', url: enSitemap['OP01-001'] },
    { code: 'OP05-060', url: enSitemap['OP05-060'] },
    { code: 'ST36-005 (FR)', url: frSitemap['ST36-005'] },
    { code: 'ST36-005 (EN)', url: enSitemap['ST36-005'] }
  ];

  for (const t of tests) {
    if (t.url) {
      const cm = await fetchCardCmLink(t.url);
      console.log(t.code, '->', cm);
    }
  }
}
test();
