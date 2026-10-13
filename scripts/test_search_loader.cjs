const https = require('https');
https.get('https://scalpeurs.com/assets/index-DcW1OjVe.js', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    let idx = 0;
    while ((idx = data.indexOf('carte-francaise', idx)) !== -1) {
      console.log('--- FOUND AT', idx);
      console.log(data.slice(Math.max(0, idx - 200), idx + 400));
      idx += 15;
    }
  });
});
