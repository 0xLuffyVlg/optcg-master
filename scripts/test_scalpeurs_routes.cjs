const https = require('https');
https.get('https://scalpeurs.com/assets/index-DcW1OjVe.js', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const apiMatches = data.match(/\/api\/[a-zA-Z0-9_\-\/]+/g) || [];
    console.log('API routes in JS:', [...new Set(apiMatches)]);
    
    // Also search for "cardmarket.com" or "Products" or "Singles"
    const regex = /[a-zA-Z0-9_\-\.\/]*Singles[a-zA-Z0-9_\-\.\/]*/g;
    const singles = data.match(regex) || [];
    console.log('Singles matches:', singles.slice(0, 10));
  });
});
