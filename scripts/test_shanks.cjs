const https = require('https');

https.get('https://scalpeurs.com/carte-francaise/op09-001-shanks', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Find all cardmarket links in the page
    const allCm = data.match(/https?:\/\/[^\s"'<>]+cardmarket[^\s"'<>]+/gi) || [];
    console.log('All CM links for OP09-001:', [...new Set(allCm)]);
    
    // Also check how variants are presented in data
    const idx = data.indexOf('variantes');
    if (idx !== -1) {
      console.log('Variantes snippet:', data.slice(idx - 50, idx + 400));
    }
  });
});
