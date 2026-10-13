async function testCardmarketUrl(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    });
    console.log(`[${res.status}] ${url}`);
    if (res.ok) {
      const text = await res.text();
      console.log(`Length: ${text.length}`);
      const downloadLinks = text.match(/href="([^"]*(?:download|price|guide|csv|gz|json)[^"]*)"/gi) || [];
      console.log('Download links found:', downloadLinks);
    }
  } catch (e) {
    console.log(`Error on ${url}:`, e.message);
  }
}

async function run() {
  await testCardmarketUrl('https://www.cardmarket.com/fr/OnePiece/Data/Price-Guide');
  await testCardmarketUrl('https://www.cardmarket.com/en/OnePiece/Data/Price-Guide');
  await testCardmarketUrl('https://www.cardmarket.com/Data/Download');
}

run();
