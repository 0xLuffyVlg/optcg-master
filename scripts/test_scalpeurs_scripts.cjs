const https = require('https');

https.get('https://scalpeurs.com/carte-francaise/st36-005-eustass-captain-kidd', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const scripts = data.match(/src="([^"]+\.js)"/g) || [];
    console.log('Script tags:', scripts);
    // Find any JSON data in script tags
    const scriptBodies = data.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
    console.log('Script count:', scriptBodies.length);
    for (let i = 0; i < scriptBodies.length; i++) {
      if (scriptBodies[i].includes('cardmarket') || scriptBodies[i].includes('appLinks')) {
        console.log(`Script ${i} contains cardmarket/appLinks! Length:`, scriptBodies[i].length);
        console.log(scriptBodies[i].slice(0, 1000));
      }
    }
  });
});
