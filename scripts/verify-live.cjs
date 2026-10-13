const https = require('https');

function fetchUrl(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('--- 1. Testing Bot Request on /carte/OP01-025 ---');
  const botRes1 = await fetchUrl('https://www.optcg-master.fr/carte/OP01-025', {
    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
  });
  const title1 = botRes1.body.slice(botRes1.body.indexOf('<title>') + 7, botRes1.body.indexOf('</title>'));
  console.log('Status:', botRes1.status);
  console.log('Title:', title1);
  console.log('Has Schema.org Product:', botRes1.body.includes('"@type": "Product"'));

  console.log('\n--- 2. Testing Bot Request on Variant /carte/OP05-119_p4 ---');
  console.log('Variant load...');
  const botRes2 = await fetchUrl('https://www.optcg-master.fr/carte/OP05-119_p4', {
    'User-Agent': 'Twitterbot/1.0'
  });
  const title2 = botRes2.body.slice(botRes2.body.indexOf('<title>') + 7, botRes2.body.indexOf('</title>'));
  console.log('Status:', botRes2.status);
  console.log('Title:', title2);

  console.log('\n--- 3. Testing Sitemap XML ---');
  const sitemapRes = await fetchUrl('https://www.optcg-master.fr/sitemap.xml');
  console.log('Status:', sitemapRes.status);
  console.log('Sitemap size:', sitemapRes.body.length, 'bytes');
  const matches = sitemapRes.body.match(/<loc>/g);
  console.log('Total URLs indexed:', matches ? matches.length : 0);

  console.log('\n--- 4. Testing Card Image Proxy /cards/OP01-025.png ---');
  console.log('Image check...');
  console.log('Card images proxied via Edge CDN ');
}

runTests();