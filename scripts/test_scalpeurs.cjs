const https = require('https');
https.get('https://scalpeurs.com/carte-francaise/st36-005-eustass-captain-kidd', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const cmLinks = data.match(/https?:\/\/[^\s"'<>]+cardmarket[^\s"'<>]+/gi) || [];
    console.log('CM links in page:', cmLinks);
    
    // Check if there are JS chunks referenced
    const scriptSrcs = data.match(/src="([^"]+\.js)"/g) || [];
    console.log('Scripts:', scriptSrcs);
  });
}).on('error', console.error);
