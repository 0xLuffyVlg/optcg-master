const https = require('https');

function getUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function findLinks() {
  try {
    const home = await getUrl('https://onepiecetopdecks.com/');
    const regex = /href=["']([^"']+)["']/gi;
    const links = [];
    let match;
    while ((match = regex.exec(home.data)) !== null) {
      const url = match[1];
      if (url.includes('deck') || url.includes('tournament') || url.includes('op')) {
        links.push(url);
      }
    }
    const unique = [...new Set(links)];
    console.log(`Found ${unique.length} relevant links:`);
    unique.slice(0, 40).forEach(l => console.log('  ', l));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

findLinks();
