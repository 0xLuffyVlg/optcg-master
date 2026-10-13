const fs = require('fs');
const path = require('path');

const cards = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/cards.json'), 'utf8'));
const variants = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/variants.json'), 'utf8'));

const hubs = [
  { url: 'https://www.optcg-master.fr/', priority: '1.0', changefreq: 'daily' },
  { url: 'https://www.optcg-master.fr/meta', priority: '0.95', changefreq: 'daily' },
  { url: 'https://www.optcg-master.fr/deckbuilder', priority: '0.9', changefreq: 'weekly' },
  { url: 'https://www.optcg-master.fr/tournois', priority: '0.85', changefreq: 'daily' },
  { url: 'https://www.optcg-master.fr/cartes', priority: '0.85', changefreq: 'weekly' },
  { url: 'https://www.optcg-master.fr/collection', priority: '0.8', changefreq: 'weekly' },
  { url: 'https://www.optcg-master.fr/quotas', priority: '0.8', changefreq: 'weekly' },
  { url: 'https://www.optcg-master.fr/news', priority: '0.8', changefreq: 'daily' },
  { url: 'https://www.optcg-master.fr/matchups', priority: '0.75', changefreq: 'daily' }
];

const today = new Date().toISOString().split('T')[0];

// Strict validation rule for One Piece TCG card / variant codes
function isValidCardCode(code) {
  if (!code || typeof code !== 'string') return false;
  const clean = code.trim();
  if (!clean) return false;

  // Reject if contains http/https, slashes, backslashes, spaces, %, or image extensions
  if (/https?:/i.test(clean)) return false;
  if (/[\/\\ \s%]/i.test(clean)) return false;
  if (/\.(webp|png|jpg|jpeg|svg|gif|avif)$/i.test(clean)) return false;
  if (clean.includes(':') || clean.includes('?') || clean.includes('#')) return false;

  // Strict format whitelist:
  // e.g. OP17-039, ST01-001, EB05-020, P-150, PRB01-001, DON0001, OP01-025_P1, OP01-120-R
  const cardCodeRegex = /^(OP|ST|EB|PRB|P|DON)[A-Z0-9]*(-[A-Z0-9]+)?(_[A-Z0-9]+|-R)?$/i;
  return cardCodeRegex.test(clean);
}

// Map all unique prints and determine priority
const cardUrls = new Map();

// 1. Base Cards
for (const card of cards) {
  if (!card || !card.card_code) continue;
  const code = card.card_code.toUpperCase().trim();
  if (!isValidCardCode(code)) continue;

  const isLeader = card.category === 'Leader';
  const isSecret = card.rarity === 'SEC';
  const priority = (isLeader || isSecret) ? '0.85' : '0.70';
  cardUrls.set(code, {
    url: `https://www.optcg-master.fr/carte/${code}`,
    priority,
    changefreq: isLeader ? 'daily' : 'weekly'
  });
}

// 2. Variants & Alt Arts
for (const v of variants) {
  if (!v || !v.image_path) continue;
  const rawImg = (v.image_path || '').trim();

  // Reject if image_path is a URL or contains directory path/slashes/spaces
  if (rawImg.startsWith('http') || rawImg.startsWith('/') || rawImg.includes('\\') || rawImg.includes(' ')) {
    continue;
  }

  const vCode = rawImg.replace(/\.(webp|png|jpg|jpeg)$/i, '').toUpperCase().trim();
  if (!isValidCardCode(vCode)) continue;

  if (!cardUrls.has(vCode)) {
    const label = (v.variant_label || '').toLowerCase();
    const isHighInterest = label.includes('manga') || label.includes('sp') || label.includes('parallel') || label.includes('winner') || label.includes('special');
    cardUrls.set(vCode, {
      url: `https://www.optcg-master.fr/carte/${vCode}`,
      priority: isHighInterest ? '0.85' : '0.75',
      changefreq: 'weekly'
    });
  }
}

let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
xml += '  <!-- Main Navigation Hubs -->\n';
for (const h of hubs) {
  xml += '  <url>\n';
  xml += '    <loc>' + h.url + '</loc>\n';
  xml += '    <lastmod>' + today + '</lastmod>\n';
  xml += '    <changefreq>' + h.changefreq + '</changefreq>\n';
  xml += '    <priority>' + h.priority + '</priority>\n';
  xml += '  </url>\n';
}

xml += '\n  <!-- Individual Cards & Alt Arts Unique SEO Pages (' + cardUrls.size + ' Prints) -->\n';
for (const [code, item] of cardUrls.entries()) {
  xml += '  <url>\n';
  xml += '    <loc>' + item.url + '</loc>\n';
  xml += '    <lastmod>' + today + '</lastmod>\n';
  xml += '    <changefreq>' + item.changefreq + '</changefreq>\n';
  xml += '    <priority>' + item.priority + '</priority>\n';
  xml += '  </url>\n';
}
xml += '</urlset>\n';

fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), xml, 'utf8');
console.log('Successfully generated public/sitemap.xml with ' + (hubs.length + cardUrls.size) + ' URLs (Hubs + Base Cards + Alt Arts)!');
