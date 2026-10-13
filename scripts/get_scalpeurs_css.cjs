const https = require('https');

function get(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', () => resolve({ status: 500, data: '' }));
  });
}

async function findCss() {
  const page = await get('https://scalpeurs.com/cartes-anglaises');
  const cssMatches = [...page.data.matchAll(/href=["']([^"']+\.css[^"']*)["']/gi)].map(m => m[1]);
  console.log('CSS files:', cssMatches);

  for (const cssUrl of cssMatches) {
    const fullUrl = cssUrl.startsWith('http') ? cssUrl : `https://scalpeurs.com${cssUrl}`;
    const css = await get(fullUrl);
    if (css.data.includes('jp-defile') || css.data.includes('tapis') || css.data.includes('rang')) {
      console.log(`Found in ${fullUrl}!`);
      // Extract rules containing jp-defile, tapis, rang, voile
      const rules = css.data.split('}').filter(r => 
        r.includes('jp-defile') || r.includes('tapis') || r.includes('rang') || r.includes('voile') || r.includes('scene')
      );
      rules.forEach(r => console.log(r.trim() + '}'));
    }
  }
}
findCss();
