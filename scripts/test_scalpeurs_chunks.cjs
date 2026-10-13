const https = require('https');

function fetchAsset(path) {
  return new Promise(resolve => {
    https.get('https://scalpeurs.com' + path, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
  });
}

async function run() {
  const f1 = await fetchAsset('/assets/carte-francaise._slug-aKteypoR.js');
  console.log('f1 length:', f1.length);
  const f2 = await fetchAsset('/assets/JpCardFiche-DlG2q1cN.js');
  console.log('f2 length:', f2.length);

  // Search in f1 and f2 for cardmarket or cm or Singles or serverFn
  for (const [name, content] of [['f1', f1], ['f2', f2]]) {
    const idx = content.indexOf('cardmarket');
    if (idx !== -1) {
      console.log(`${name} contains cardmarket:`, content.slice(Math.max(0, idx - 200), idx + 300));
    }
    const idx2 = content.indexOf('createServerFn');
    if (idx2 !== -1) {
      console.log(`${name} contains createServerFn:`, content.slice(Math.max(0, idx2 - 100), idx2 + 300));
    }
  }
}
run();
