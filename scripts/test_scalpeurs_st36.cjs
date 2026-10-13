const https = require('https');

https.get('https://scalpeurs.com/api/prix/fr', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log('Sets in /api/prix/fr:', Object.keys(json));
    console.log('st36 in /api/prix/fr:', json['st36']);
  });
});
