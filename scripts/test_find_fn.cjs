const https = require('https');
https.get('https://scalpeurs.com/assets/index-DcW1OjVe.js', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const regex = /[a-zA-Z0-9_$]+(?:\s*=\s*createServerFn|createServerFn\s*\()/g;
    let m;
    while ((m = regex.exec(data)) !== null) {
      console.log('ServerFn:', data.slice(Math.max(0, m.index - 50), m.index + 150));
    }
  });
});
