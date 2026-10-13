const https = require('https');

function testEndpoint(path) {
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
  const eps = [
    '/api/catalogue/fr',
    '/api/catalogue/en',
    '/api/catalogue/jp',
    '/api/catalogue',
    '/api/favoris-infos'
  ];
  for (const ep of eps) {
    const res = await testEndpoint(ep);
    console.log(ep, res.status, res.length, res.sample);
  }
}
run();
