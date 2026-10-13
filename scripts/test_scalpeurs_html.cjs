const https = require('https');
https.get('https://scalpeurs.com/carte-francaise/st36-005-eustass-captain-kidd', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const idx = data.indexOf('appLinks:');
    if (idx !== -1) {
      console.log('--- AROUND appLinks:');
      console.log(data.slice(Math.max(0, idx - 300), idx + 500));
    }
  });
});
