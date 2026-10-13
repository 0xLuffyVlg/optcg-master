const fs = require('fs');

const cardmarketProductUrls = JSON.parse(fs.readFileSync('src/data/cardmarket_product_urls.json', 'utf8'));
const variants = JSON.parse(fs.readFileSync('src/data/variants.json', 'utf8'));

function detectCardLanguage(card, artworkKey, cardCode) {
  if (artworkKey) {
    const art = artworkKey.toLowerCase();
    if (art.includes('/cards-fr/') || art.includes('language=fr') || art.includes('_fr') || art.includes('-fr')) return 'fr';
    if (art.includes('/cards-jp/') || art.includes('language=jp') || art.includes('_jp') || art.includes('-jp') || art.includes('-ja')) return 'jp';
    if (art.includes('/cards-en/') || art.includes('language=en') || art.includes('_en') || art.includes('-en')) return 'en';
  }
  if (card) {
    const c = card;
    if (c.language) {
      const l = c.language.toLowerCase();
      if (l === 'fr' || l === 'français' || l === 'french') return 'fr';
      if (l === 'jp' || l === 'ja' || l === 'japonais' || l === 'japanese') return 'jp';
      if (l === 'en' || l === 'anglais' || l === 'english') return 'en';
    }
    if (c.id) {
      const idLow = c.id.toLowerCase();
      if (idLow.startsWith('fr-') || idLow.includes('/cards-fr/')) return 'fr';
      if (idLow.startsWith('jp-') || idLow.includes('/cards-jp/')) return 'jp';
      if (idLow.startsWith('en-') || idLow.includes('/cards-en/')) return 'en';
    }
    if (c._defaultImagePath) {
      const def = String(c._defaultImagePath).toLowerCase();
      if (def.includes('/cards-fr/')) return 'fr';
      if (def.includes('/cards-jp/')) return 'jp';
      if (def.includes('/cards-en/')) return 'en';
    }
  }
  return 'fr'; // Default to French for this app
}

function getCardmarketUrl(cardCode, artworkKey, cardOrLang) {
  if (!cardCode) return 'https://www.cardmarket.com/en/OnePiece';

  const lang = detectCardLanguage(cardOrLang, artworkKey, cardCode);
  const cleanCode = cardCode.trim().toUpperCase();
  const baseCode = cleanCode.split('_')[0].split('-R')[0].replace(/\.(WEBP|PNG|JPG|JPEG)$/i, '').replace(/^(FR|JP)-/i, '');
  const langId = lang === 'fr' ? '2' : (lang === 'jp' ? '7' : '1');

  // Check direct 1:1 single product mapping
  const dict = lang === 'fr' ? cardmarketProductUrls.fr : cardmarketProductUrls.en;
  let directUrl = dict[baseCode] || cardmarketProductUrls.en[baseCode] || cardmarketProductUrls.fr[baseCode];

  if (directUrl) {
    const art = (artworkKey || cleanCode).toLowerCase().replace(/\.(webp|png|jpg|jpeg)$/i, '');
    const isAlt = art.includes('_p') || art.includes('_r') || art.includes('manga') || art.includes('sp') || art.includes('winner') || art.includes('parallel');

    if (isAlt) {
      let suffix = 'V2';
      if (art.includes('manga') || art.includes('_p3') || art.includes('_p4')) suffix = 'V3';
      else if (art.includes('sp') || art.includes('special') || art.includes('_sp')) suffix = 'VSP';
      else if (art.includes('winner') || art.includes('tournoi')) suffix = 'Winner';

      if (directUrl.includes('-V1')) {
        directUrl = directUrl.replace('-V1', `-${suffix}`);
      } else {
        const parts = directUrl.split('?');
        directUrl = `${parts[0]}-${suffix}${parts[1] ? `?${parts[1]}` : ''}`;
      }
    }

    // Set language param
    if (directUrl.includes('language=')) {
      directUrl = directUrl.replace(/language=\d+/, `language=${langId}`);
    } else {
      directUrl += (directUrl.includes('?') ? '&' : '?') + `language=${langId}`;
    }

    // Locale in URL
    if (lang === 'fr' && directUrl.includes('/en/OnePiece/')) {
      directUrl = directUrl.replace('/en/OnePiece/', '/fr/OnePiece/');
    } else if (lang !== 'fr' && directUrl.includes('/fr/OnePiece/')) {
      directUrl = directUrl.replace('/fr/OnePiece/', '/en/OnePiece/');
    }

    // Enforce Near Mint
    if (!directUrl.includes('minCondition=')) {
      directUrl += '&minCondition=2';
    }

    return directUrl;
  }

  // Fallback search
  const query = encodeURIComponent(baseCode);
  const locale = lang === 'fr' ? 'fr' : 'en';
  return `https://www.cardmarket.com/${locale}/OnePiece/Products/Search?searchString=${query}&language=${langId}&minCondition=2`;
}

// Test ST36-005 with French card
const testCardFr = {
  card_code: 'ST36-005',
  language: 'fr',
  _defaultImagePath: 'https://scalpeurs.com/img/cards-fr/st36-p006.webp'
};

console.log('Test ST36-005 FR link:', getCardmarketUrl('ST36-005', 'https://scalpeurs.com/img/cards-fr/st36-p006.webp', testCardFr));
console.log('Test ST36-005 EN link:', getCardmarketUrl('ST36-005', 'https://scalpeurs.com/img/cards-en/st36-p006.webp', { card_code: 'ST36-005', language: 'en' }));
console.log('Test OP09-001 Base link:', getCardmarketUrl('OP09-001', 'https://scalpeurs.com/img/cards-fr/op09-p001.webp', { card_code: 'OP09-001', language: 'fr' }));
console.log('Test OP09-001 Alt link:', getCardmarketUrl('OP09-001', 'op09-001_p1.webp', { card_code: 'OP09-001', language: 'fr' }));
console.log('Test OP09-001 Manga link:', getCardmarketUrl('OP09-001', 'op09-001_manga.webp', { card_code: 'OP09-001', language: 'fr' }));
