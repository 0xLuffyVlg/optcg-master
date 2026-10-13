import type { VercelRequest, VercelResponse } from '@vercel/node';
import https from 'https';
import http from 'http';

/**
 * Fetch a buffer with custom browser-like headers
 */
function fetchBuffer(url: string, referer?: string): Promise<{ status: number; contentType: string; buffer: Buffer }> {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https:');
    const client = isHttps ? https : http;

    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': referer || 'https://en.onepiece-cardgame.com/cardlist/',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site'
      },
      timeout: 6000
    }, (res) => {
      // Follow redirect if 301/302
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
        return resolve(fetchBuffer(res.headers.location, referer));
      }

      const chunks: Buffer[] = [];
      res.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          status: res.statusCode || 500,
          contentType: res.headers['content-type'] || 'image/png',
          buffer
        });
      });
    });

    req.on('error', () => {
      resolve({ status: 500, contentType: 'text/plain', buffer: Buffer.from('') });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 504, contentType: 'text/plain', buffer: Buffer.from('') });
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const rawName = String(req.query.name || req.query.code || '').trim();
  if (!rawName) {
    return res.status(400).send('Missing image name');
  }

  // Normalize filename
  const cleanName = rawName
    .replace(/^.*[\\\/]/, '')
    .replace(/\.(webp|png|jpg|jpeg)$/i, '')
    .replace(/-r\d+.*$/i, '');

  const baseCode = cleanName.split('_')[0].split('-r')[0].toUpperCase();

  // Try Step 1: Bandai Direct CDN (PNG)
  const bandaiUrl = `https://en.onepiece-cardgame.com/images/cardlist/card/${cleanName}.png`;
  const bandaiRes = await fetchBuffer(bandaiUrl, 'https://en.onepiece-cardgame.com/cardlist/');

  if (bandaiRes.status === 200 && bandaiRes.buffer.length > 2000) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).send(bandaiRes.buffer);
  }

  // Try Step 2: Egman Events CDN (WebP) with exact variant name
  const egmanVariantUrl = `https://img.egmanevents.com/optcg/${cleanName}.webp`;
  const egmanVariantRes = await fetchBuffer(egmanVariantUrl, 'https://egmanevents.com/');

  if (egmanVariantRes.status === 200 && egmanVariantRes.buffer.length > 1500) {
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).send(egmanVariantRes.buffer);
  }

  // Try Step 3: Egman Events CDN (WebP) with base card code
  if (baseCode !== cleanName) {
    const egmanBaseUrl = `https://img.egmanevents.com/optcg/${baseCode}.webp`;
    const egmanBaseRes = await fetchBuffer(egmanBaseUrl, 'https://egmanevents.com/');

    if (egmanBaseRes.status === 200 && egmanBaseRes.buffer.length > 1500) {
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).send(egmanBaseRes.buffer);
    }
  }

  // Step 4: Fallback SVG card placeholder
  const svgPlaceholder = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420">
    <rect width="100%" height="100%" rx="16" fill="#0f172a" stroke="#f59e0b" stroke-width="3"/>
    <text x="50%" y="45%" text-anchor="middle" fill="#f59e0b" font-family="sans-serif" font-weight="900" font-size="22">${baseCode}</text>
    <text x="50%" y="58%" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-weight="700" font-size="14">ONE PIECE TCG</text>
  </svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).send(svgPlaceholder);
}
