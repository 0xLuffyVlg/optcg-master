const https = require('https');

function getUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', (e) => resolve({ status: 500, data: e.message }));
  });
}

async function checkPages() {
  // Let's test known patterns on onepiecetopdecks
  const candidates = [
    'https://onepiecetopdecks.com/deck-list/japan-op17-deck-list-the-worlds-strongest-warriors/',
    'https://onepiecetopdecks.com/deck-list/english-op17-deck-list-the-worlds-strongest-warriors/',
    'https://onepiecetopdecks.com/deck-list/japan-op16-deck-list-the-two-legends/',
    'https://onepiecetopdecks.com/deck-list/english-op16-deck-list-the-two-legends/',
    'https://onepiecetopdecks.com/deck-list/japan-op-17-deck-list/',
    'https://onepiecetopdecks.com/deck-list/english-op-17-deck-list/',
    'https://onepiecetopdecks.com/deck-list/japan-op18-deck-list-the-two-emperors/',
    'https://onepiecetopdecks.com/deck-list/japan-op18-deck-list/',
    'https://onepiecetopdecks.com/deck-list/japan-eb02-deck-list-anime-25th-collection/',
    'https://onepiecetopdecks.com/deck-list/english-eb02-deck-list-anime-25th-collection/'
  ];

  for (const url of candidates) {
    const res = await getUrl(url);
    if (res.status === 200) {
      const rows = (res.data.match(/<tr/gi) || []).length;
      console.log(`[200 OK] ${url} (${rows} rows)`);
    } else {
      console.log(`[${res.status}] ${url}`);
    }
  }
}

checkPages();
