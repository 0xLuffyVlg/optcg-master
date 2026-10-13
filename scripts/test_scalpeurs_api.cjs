const https = require('https');

function get(path) {
  return new Promise((resolve) => {
    https.get('https://scalpeurs.com' + path, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ path, status: res.statusCode, length: data.length, sample: data.slice(0, 300) });
      });
    }).on('error', (err) => resolve({ path, error: err.message }));
  });
}

async function run() {
  const endpoints = [
    '/api/prix-meta/fr',
    '/api/prix/fr',
    '/api/prix/en',
    '/api/prix/jp',
    '/api/cartes/fr',
    '/api/links/fr'
  ];
  for (const ep of endpoints) {
    const res = await get(ep);
    console.log(ep, res.status, res.length, res.sample);
  }
}
run();
