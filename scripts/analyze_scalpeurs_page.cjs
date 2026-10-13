const https = require('https');

https.get('https://scalpeurs.com/carte-francaise/st36-005-eustass-captain-kidd', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Extract hist
    const histMatch = data.match(/hist:\$R\[\d+\]=(\[[^\]]+\])/);
    console.log('Hist match:', histMatch ? histMatch[1] : 'not found directly');

    // Search for array of date, price pairs
    const pairs = data.match(/\["2026-\d\d-\d\d",[\d\.]+\]/g);
    console.log('Date/price pairs in page:', pairs ? pairs.slice(0, 15) : 'none');
    console.log('Total historical points:', pairs ? pairs.length : 0);

    // Let's inspect the sections in the HTML
    // Find headings: h1, h2, h3
    const headings = data.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi);
    console.log('\nHeadings in page:', headings);

    // Find price comparison block (Cardmarket vs Cardtrader vs TCGplayer)
    const idxSources = data.indexOf('Sources');
    if (idxSources !== -1) {
      console.log('\nSources snippet:');
      console.log(data.slice(idxSources - 100, idxSources + 1200));
    }
  });
});
