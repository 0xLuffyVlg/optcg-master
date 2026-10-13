const https = require('https');
const fs = require('fs');

function searchCM(query) {
  return new Promise(resolve => {
    https.get('https://www.cardmarket.com/en/OnePiece/Products/Search?searchString=' + encodeURIComponent(query), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
  });
}

async function run() {
  const html = await searchCM('OP13-118');
  console.log('HTML length:', html.length);
  const regex = /href="(\/en\/OnePiece\/Products\/Singles\/[^"]+)"[^>]*>([^<]+)<\/a>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    console.log(match[1], '->', match[2]);
  }
}

run();
