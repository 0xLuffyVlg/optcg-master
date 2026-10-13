const https = require('https');

https.get('https://scalpeurs.com/carte-francaise/st36-005-eustass-captain-kidd', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const idx = data.indexOf('Évolution du prix');
    if (idx !== -1) {
      console.log('Chart HTML snippet:');
      console.log(data.slice(idx - 100, idx + 2500));
    }
  });
});
