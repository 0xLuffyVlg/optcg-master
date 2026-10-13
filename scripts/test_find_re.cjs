const https = require('https');
https.get('https://scalpeurs.com/assets/index-DcW1OjVe.js', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Search around pl definition
    const idx = data.indexOf('pl=D(`/carte-francaise/$slug`)');
    if (idx !== -1) {
      console.log('Context before pl:');
      console.log(data.slice(Math.max(0, idx - 800), idx + 200));
    }
  });
});
