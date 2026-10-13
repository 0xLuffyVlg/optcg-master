const https = require('https');

function get(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function findCardHtml() {
  const html = await get('https://scalpeurs.com/cartes-anglaises');
  const match = html.match(/<a[^>]*href=["'][^"']*\/carte-[^"']*["'][^>]*>[\s\S]*?<\/a>/i);
  if (match) {
    console.log('Sample Card HTML:');
    console.log(match[0]);
  } else {
    console.log('No match found.');
  }
}
findCardHtml();
