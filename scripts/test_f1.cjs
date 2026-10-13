const https = require('https');
https.get('https://scalpeurs.com/assets/carte-francaise._slug-aKteypoR.js', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('f1 content:', data));
});
