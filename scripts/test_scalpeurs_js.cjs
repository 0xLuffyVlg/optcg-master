const https = require('https');
https.get('https://scalpeurs.com/assets/index-DcW1OjVe.js', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('JS length:', data.length);
    const idx = data.indexOf('/Products/Singles/');
    if (idx !== -1) {
      console.log('Found /Products/Singles/ in JS:');
      console.log(data.slice(Math.max(0, idx - 400), idx + 600));
    } else {
      console.log('Not found /Products/Singles/, searching for "Products" or "cardmarket"');
      const idx2 = data.indexOf('cardmarket.com');
      if (idx2 !== -1) {
        console.log('Found cardmarket.com:');
        console.log(data.slice(Math.max(0, idx2 - 300), idx2 + 500));
      }
    }
  });
});
