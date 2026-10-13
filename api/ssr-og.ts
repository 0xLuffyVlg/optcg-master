import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

// Canonical domain and default assets
const SITE_DOMAIN = 'https://www.optcg-master.fr';
const DEFAULT_OG_IMAGE = `${SITE_DOMAIN}/og-image.png`;

interface CardSeoItem {
  code: string;
  name: string;
  set_code: string;
  category: string;
  rarity: string;
  color: string[];
  cost?: number | null;
  power?: number | null;
  counter?: number | null;
  attribute?: string;
  type?: string[];
  effect?: string;
  trigger?: string;
  cmPrice: number;
  ctPrice: number;
}

interface VariantSeoItem {
  code: string;
  baseCode: string;
  label: string;
  cmPrice: number;
  ctPrice: number;
}

// In-memory memoized caches
let memoizedCards: Map<string, CardSeoItem> | null = null;
let memoizedVariants: Map<string, VariantSeoItem> | null = null;
let memoizedSiblings: Map<string, Array<{ code: string; label: string }>> | null = null;

function loadJsonFile(filename: string): any {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, 'src/data', filename),
    path.join(cwd, 'data', filename),
    path.resolve(cwd, 'src/data', filename),
    path.resolve(cwd, 'dist/data', filename),
    path.resolve('src/data', filename),
    path.resolve('data', filename)
  ];

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf8');
        return JSON.parse(raw);
      }
    } catch {
      // Continue to next candidate
    }
  }
  return null;
}

function isValidCardCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  const clean = code.trim();
  if (!clean) return false;

  // Reject if contains http/https, slashes, backslashes, spaces, %, or image extensions
  if (/https?:/i.test(clean)) return false;
  if (/[\/\\ \s%]/i.test(clean)) return false;
  if (/\.(webp|png|jpg|jpeg|svg|gif|avif)$/i.test(clean)) return false;
  if (clean.includes(':') || clean.includes('?') || clean.includes('#')) return false;

  const cardCodeRegex = /^(OP|ST|EB|PRB|P|DON)[A-Z0-9]*(-[A-Z0-9]+)?(_[A-Z0-9]+|-R)?$/i;
  return cardCodeRegex.test(clean);
}

function initData() {
  if (memoizedCards && memoizedVariants && memoizedSiblings) return;

  const rawCards = loadJsonFile('cards.json') || [];
  const rawVariants = loadJsonFile('variants.json') || [];
  const cmPrices = loadJsonFile('cardmarket_prices.json') || {};
  const ctPrices = loadJsonFile('cardtrader_prices.json') || {};

  const cardsMap = new Map<string, CardSeoItem>();
  const variantsMap = new Map<string, VariantSeoItem>();
  const siblingsMap = new Map<string, Array<{ code: string; label: string }>>();

  for (const c of rawCards) {
    if (!c || !c.card_code) continue;
    const code = c.card_code.toUpperCase().trim();
    if (!isValidCardCode(code)) continue;

    const cm = cmPrices[code]?.trend_eur || cmPrices[code]?.avg_eur || 0;
    const ct = ctPrices[code]?.lowest_eur || ctPrices[code]?.avg_eur || 0;

    cardsMap.set(code, {
      code: c.card_code,
      name: c.name || code,
      set_code: c.set_code || code.split('-')[0],
      category: c.category || 'Character',
      rarity: c.rarity || 'C',
      color: Array.isArray(c.color) ? c.color : (c.color ? [c.color] : []),
      cost: c.cost,
      power: c.power,
      counter: c.counter || 0,
      attribute: c.attribute || '',
      type: Array.isArray(c.type) ? c.type : (c.type ? [c.type] : []),
      effect: c.effect_fr || c.effect || '',
      trigger: c.trigger || '',
      cmPrice: typeof cm === 'number' ? cm : parseFloat(cm) || 0,
      ctPrice: typeof ct === 'number' ? ct : parseFloat(ct) || 0
    });
  }

  for (const v of rawVariants) {
    if (!v || !v.image_path) continue;
    const rawImg = (v.image_path || '').trim();
    if (rawImg.startsWith('http') || rawImg.startsWith('/') || rawImg.includes('\\') || rawImg.includes(' ')) {
      continue;
    }

    const vCode = rawImg.replace(/\.(webp|png|jpg|jpeg)$/i, '').toUpperCase().trim();
    if (!isValidCardCode(vCode)) continue;

    const baseCode = (v.card_code || vCode.split('_')[0]).toUpperCase().trim();
    const label = v.variant_label || 'Version Alternative';
    const cm = v.cardmarket_trend || v.market_price || 0;
    const ct = v.cardtrader_price || 0;

    variantsMap.set(vCode, {
      code: vCode,
      baseCode,
      label,
      cmPrice: typeof cm === 'number' ? cm : parseFloat(cm) || 0,
      ctPrice: typeof ct === 'number' ? ct : parseFloat(ct) || 0
    });

    if (!siblingsMap.has(baseCode)) {
      siblingsMap.set(baseCode, []);
    }
    siblingsMap.get(baseCode)!.push({ code: vCode, label });
  }

  memoizedCards = cardsMap;
  memoizedVariants = variantsMap;
  memoizedSiblings = siblingsMap;
}

// Section-specific SEO metadata for bots & crawlers
const SECTION_SEO: Record<string, { title: string; description: string; path: string }> = {
  meta: {
    title: 'Tier List & Méta One Piece TCG (OP17) | OPTCG Master',
    description: 'Analyse complète du méta One Piece Card Game : Tier list compétitive, winrates des Leaders et meilleurs decks de tournois officiels.',
    path: '/meta'
  },
  deckbuilder: {
    title: 'Deckbuilder Compétitif One Piece TCG | OPTCG Master',
    description: 'Créez, testez et exportez vos listes de decks OPTCGSim et formats officiels avec courbe de coût et ratios optimisés.',
    path: '/deckbuilder'
  },
  tournois: {
    title: 'Résultats & Decks Tournois Mondiaux One Piece TCG | OPTCG Master',
    description: 'Historique et decklists des tournois régionaux, championnats nationaux et événements OP17 One Piece Card Game.',
    path: '/tournois'
  },
  tournaments: {
    title: 'Résultats & Decks Tournois Mondiaux One Piece TCG | OPTCG Master',
    description: 'Historique et decklists des tournois régionaux, championnats nationaux et événements OP17 One Piece Card Game.',
    path: '/tournois'
  },
  quotas: {
    title: 'Calculateur de Quotas & Pull Rates Displays One Piece TCG | OPTCG Master',
    description: 'Estimez vos ratios de tirage par display et case (Secret Rare, Manga Rare, Special Rare) pour tous les sets One Piece TCG.',
    path: '/quotas'
  },
  cartes: {
    title: 'Base de Données Cartes HD & Effets One Piece TCG | OPTCG Master',
    description: 'Explorez l\'intégralité des 3000+ cartes One Piece Card Game en haute définition avec filtres couleur, coût, rareté et effets.',
    path: '/cartes'
  },
  database: {
    title: 'Base de Données Cartes HD & Effets One Piece TCG | OPTCG Master',
    description: 'Explorez l\'intégralité des 3000+ cartes One Piece Card Game en haute définition avec filtres couleur, coût, rareté et effets.',
    path: '/cartes'
  },
  collection: {
    title: 'Suivi de Collection Cloud & Valeur Cartes One Piece TCG | OPTCG Master',
    description: 'Gérez votre classeur virtuel, suivez l\'avancement de vos sets et estimez la cote de vos cartes One Piece TCG.',
    path: '/collection'
  },
  news: {
    title: 'News, Spoilers & Reveals Cartes OP18 / EB05 | OPTCG Master',
    description: 'Toutes les dernières annonces officielles et reveals des nouvelles extensions One Piece Card Game traduites.',
    path: '/news'
  },
  reveals: {
    title: 'News, Spoilers & Reveals Cartes OP18 / EB05 | OPTCG Master',
    description: 'Toutes les dernières annonces officielles et reveals des nouvelles extensions One Piece Card Game traduites.',
    path: '/news'
  },
  matchups: {
    title: 'Statistiques & Matchups Compétitifs One Piece TCG | OPTCG Master',
    description: 'Matrice des matchups entre Leaders et taux de victoire comparés en tournoi officiel One Piece TCG.',
    path: '/matchups'
  }
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    initData();
    const cardQuery = String(req.query.card || req.query.carte || req.query.c || '').trim();
    const deckQuery = String(req.query.deck || req.query.d || '').trim();
    const sectionQuery = String(req.query.section || req.query.tab || req.query.s || '').trim();

    // 1. SPECIFIC CARD OR VARIANT SSR BOT RENDERING
    if (cardQuery) {
      const rawClean = cardQuery
        .replace(/^.*[\\\/]/, '')
        .replace(/\.(webp|png|jpg|jpeg)$/i, '')
        .trim();

      const normalizedCode = rawClean.toUpperCase();
      const baseCode = normalizedCode.split('_')[0].split('-R')[0];
      const isSpecificVariant = normalizedCode.includes('_') || normalizedCode.includes('-R');

      if (!isValidCardCode(normalizedCode)) {
        const notFoundHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Carte non trouvée | OPTCG Master</title>
  <meta name="robots" content="noindex, nofollow">
  <style>
    body { background: #0B0F17; color: #E2E8F0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .box { max-width: 480px; background: #0F172A; border: 1px solid #334155; border-radius: 24px; padding: 32px; text-align: center; }
    h1 { font-size: 20px; color: #EF4444; margin-bottom: 12px; }
    p { color: #94A3B8; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
    a { display: inline-block; background: #F59E0B; color: #000; font-weight: 800; padding: 12px 24px; border-radius: 12px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Carte introuvable</h1>
    <p>Le code de carte demandé n'est pas valide.</p>
    <a href="${SITE_DOMAIN}/cartes">Explorer toutes les cartes ⚔️</a>
  </div>
</body>
</html>`;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        return res.status(404).send(notFoundHtml);
      }

      const card = memoizedCards?.get(baseCode) || memoizedCards?.get(normalizedCode);

      // 404 Case: Unknown card code
      if (!card) {
        const notFoundHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Carte non trouvée (${escapeHtml(normalizedCode)}) | OPTCG Master</title>
  <meta name="robots" content="noindex, nofollow">
  <style>
    body { background: #0B0F17; color: #E2E8F0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .box { max-width: 480px; background: #0F172A; border: 1px solid #334155; border-radius: 24px; padding: 32px; text-align: center; }
    h1 { font-size: 20px; color: #EF4444; margin-bottom: 12px; }
    p { color: #94A3B8; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
    a { display: inline-block; background: #F59E0B; color: #000; font-weight: 800; padding: 12px 24px; border-radius: 12px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Carte introuvable</h1>
    <p>Le code de carte <strong>${escapeHtml(normalizedCode)}</strong> n'existe pas dans le catalogue officiel One Piece Card Game.</p>
    <a href="${SITE_DOMAIN}/cartes">Explorer toutes les cartes ⚔️</a>
  </div>
</body>
</html>`;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        return res.status(404).send(notFoundHtml);
      }

      // Resolve variant details
      const variantObj = memoizedVariants?.get(normalizedCode);
      const variantLabel = variantObj?.label || (isSpecificVariant ? 'Version Alternative (Alt Art)' : 'Version Base');
      const colorStr = (card.color || []).join('/');
      const cleanImageUrl = `${SITE_DOMAIN}/images/cards/${normalizedCode}.png`;
      const canonicalUrl = `${SITE_DOMAIN}/carte/${normalizedCode}`;

      // Pricing
      const cmPriceEur = variantObj?.cmPrice || card.cmPrice || 0;
      const ctPriceEur = variantObj?.ctPrice || card.ctPrice || 0;

      // Title: "{Nom} ({CODE}) — {Rareté / VariantLabel} {Couleur} | OPTCG Master"
      const title = isSpecificVariant
        ? `${card.name} (${normalizedCode}) — ${variantLabel} ${colorStr} | OPTCG Master`
        : `${card.name} (${card.code}) — ${card.rarity || 'Carte'} ${colorStr} | OPTCG Master`;

      // Meta Description: Max ~155 chars
      const effectSnippet = (card.effect || '')
        .replace(/\[[^\]]+\]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      const shortEffect = effectSnippet.length > 80 ? effectSnippet.substring(0, 77) + '...' : effectSnippet;
      
      let description = `${card.name} [${normalizedCode}] Set ${card.set_code}, ${card.rarity}, ${colorStr}, ${card.category}.`;
      if (shortEffect) {
        description += ` Effet: ${shortEffect}`;
      }
      if (description.length > 155) {
        description = description.substring(0, 152) + '...';
      }

      // Sibling variants links for deep crawling
      const siblings = memoizedSiblings?.get(baseCode) || [];
      const siblingLinks = siblings
        .map(item => `<a href="${SITE_DOMAIN}/carte/${item.code}" style="display:inline-block;padding:6px 12px;background:#1E293B;color:#CBD5E1;border-radius:8px;font-size:12px;text-decoration:none;margin:3px;">${escapeHtml(item.label || item.code)} (${item.code})</a>`)
        .join('\n');

      // HTML response
      const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta name="robots" content="index, follow, max-image-preview:large">

  <!-- Open Graph / Discord / Facebook / WhatsApp -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="OPTCG Master">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${cleanImageUrl}">
  <meta property="og:image:alt" content="${escapeHtml(card.name)} - ${escapeHtml(variantLabel)}">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${canonicalUrl}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${cleanImageUrl}">

  <!-- Schema.org JSON-LD Product -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "${escapeHtml(card.name)} (${normalizedCode}) - ${escapeHtml(variantLabel)}",
    "identifier": "${normalizedCode}",
    "image": "${cleanImageUrl}",
    "description": "${escapeHtml(description)}",
    "brand": {
      "@type": "Brand",
      "name": "One Piece Card Game"
    },
    "category": "Trading Card Games",
    ${cmPriceEur > 0 ? `"offers": {
      "@type": "Offer",
      "priceCurrency": "EUR",
      "price": "${cmPriceEur.toFixed(2)}",
      "availability": "https://schema.org/InStock",
      "url": "${canonicalUrl}"
    },` : ''}
    "sku": "${normalizedCode}"
  }
  </script>

  <style>
    body { background: #0B0F17; color: #E2E8F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card-box { max-width: 580px; width: 100%; background: #0F172A; border: 1px solid #334155; border-radius: 24px; padding: 28px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    .card-img { width: 240px; border-radius: 14px; box-shadow: 0 10px 30px rgba(245,158,11,0.25); margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 900; margin: 0 0 8px; color: #FFFFFF; }
    .badge { display: inline-block; background: rgba(245,158,11,0.15); color: #FBBF24; border: 1px solid rgba(245,158,11,0.3); font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 999px; margin-bottom: 12px; }
    .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; text-align: left; }
    .info-table td { padding: 6px 10px; border-bottom: 1px solid #1E293B; }
    .info-table td:first-child { color: #94A3B8; font-weight: 700; width: 35%; }
    .info-table td:last-child { color: #FFFFFF; font-weight: 600; }
    .effect-box { background: #131D31; border: 1px solid #1E293B; border-radius: 12px; padding: 14px; font-size: 13px; color: #CBD5E1; text-align: left; line-height: 1.6; margin: 16px 0; }
    .price-row { display: flex; justify-content: space-around; margin: 16px 0; padding: 12px; background: #0B0F17; border-radius: 12px; border: 1px solid #1E293B; }
    .price-item { text-align: center; font-size: 11px; color: #94A3B8; }
    .price-val { font-size: 16px; font-weight: 900; color: #F59E0B; margin-top: 4px; }
    .links-section { margin-top: 20px; padding-top: 16px; border-top: 1px solid #1E293B; text-align: left; }
    .links-title { font-size: 12px; font-weight: 800; color: #F59E0B; margin-bottom: 8px; text-transform: uppercase; }
    .btn { display: inline-block; background: #F59E0B; color: #000; font-weight: 900; font-size: 13px; padding: 12px 24px; border-radius: 12px; text-decoration: none; margin-top: 16px; width: calc(100% - 48px); text-align: center; }
  </style>
</head>
<body>
  <div class="card-box">
    <img src="${cleanImageUrl}" alt="${escapeHtml(card.name)} (${normalizedCode})" class="card-img" />
    <br/>
    <span class="badge">${normalizedCode} • ${escapeHtml(card.rarity || 'C')} • ${escapeHtml(colorStr)}</span>
    <h1>${escapeHtml(card.name)}</h1>
    <p style="font-size:13px;color:#A78BFA;font-weight:700;margin:0 0 10px;">${escapeHtml(variantLabel)}</p>

    <!-- Detailed Stats Table -->
    <table class="info-table">
      <tr><td>Code Officiel</td><td>${normalizedCode}</td></tr>
      <tr><td>Extension (Set)</td><td>${escapeHtml(card.set_code)}</td></tr>
      <tr><td>Catégorie</td><td>${escapeHtml(card.category)}</td></tr>
      <tr><td>Rareté</td><td>${escapeHtml(card.rarity || 'C')}</td></tr>
      <tr><td>Couleur(s)</td><td>${escapeHtml(colorStr)}</td></tr>
      ${card.cost !== null && card.cost !== undefined ? `<tr><td>Coût (Don)</td><td>${card.cost}</td></tr>` : ''}
      ${card.power !== null && card.power !== undefined ? `<tr><td>Puissance</td><td>${card.power}</td></tr>` : ''}
      ${card.counter ? `<tr><td>Contre</td><td>+${card.counter}</td></tr>` : ''}
      ${card.attribute ? `<tr><td>Attribut</td><td>${escapeHtml(card.attribute)}</td></tr>` : ''}
      ${(card.type || []).length > 0 ? `<tr><td>Types / Famille</td><td>${escapeHtml(card.type.join(' / '))}</td></tr>` : ''}
    </table>

    <!-- Effect -->
    ${card.effect ? `
      <div class="effect-box">
        <strong style="color:#F59E0B;display:block;margin-bottom:4px;font-size:11px;text-transform:uppercase;">Effet Officiel :</strong>
        ${escapeHtml(card.effect)}
      </div>
    ` : ''}

    <!-- Trigger -->
    ${card.trigger ? `
      <div class="effect-box" style="background:rgba(245,158,11,0.08);border-color:rgba(245,158,11,0.3);">
        <strong style="color:#FBBF24;display:block;margin-bottom:4px;font-size:11px;text-transform:uppercase;">⚡ Déclencheur (Trigger) :</strong>
        ${escapeHtml(card.trigger)}
      </div>
    ` : ''}

    <!-- Market Pricing -->
    <div class="price-row">
      <div class="price-item">
        <span>Cote Cardmarket</span>
        <div class="price-val" style="color:#60A5FA;">${cmPriceEur > 0 ? cmPriceEur.toFixed(2) + ' €' : '0,25 €'}</div>
      </div>
      <div class="price-item">
        <span>Cote CardTrader</span>
        <div class="price-val" style="color:#34D399;">${ctPriceEur > 0 ? ctPriceEur.toFixed(2) + ' €' : '0,25 €'}</div>
      </div>
    </div>

    <!-- Sibling Variants Internal Links -->
    ${siblingLinks ? `
      <div class="links-section">
        <div class="links-title">Toutes les versions & Alt Arts de cette carte :</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;">
          ${siblingLinks}
        </div>
      </div>
    ` : ''}

    <!-- Site Hubs Links -->
    <div class="links-section">
      <div class="links-title">Découvrir sur OPTCG Master :</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        <a href="${SITE_DOMAIN}/cartes" style="color:#F59E0B;font-size:12px;font-weight:700;text-decoration:none;">📚 Base de Données</a> •
        <a href="${SITE_DOMAIN}/meta" style="color:#F59E0B;font-size:12px;font-weight:700;text-decoration:none;">🏆 Tier List & Decks Méta</a> •
        <a href="${SITE_DOMAIN}/deckbuilder" style="color:#F59E0B;font-size:12px;font-weight:700;text-decoration:none;">⚡ Deckbuilder</a>
      </div>
    </div>

    <a href="${canonicalUrl}" class="btn">Ouvrir la Fiche Interactive sur OPTCG Master ⚔️</a>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(html);
  }

  // 2. Specific Section Open Graph Page for Crawlers / Bots
  const sectionKey = sectionQuery.toLowerCase();
  if (sectionKey && SECTION_SEO[sectionKey]) {
    const meta = SECTION_SEO[sectionKey];
    const pageUrl = `${SITE_DOMAIN}${meta.path}`;

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}">
  <link rel="canonical" href="${pageUrl}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="OPTCG Master">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${escapeHtml(meta.title)}">
  <meta property="og:description" content="${escapeHtml(meta.description)}">
  <meta property="og:image" content="${DEFAULT_OG_IMAGE}">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${pageUrl}">
  <meta name="twitter:title" content="${escapeHtml(meta.title)}">
  <meta name="twitter:description" content="${escapeHtml(meta.description)}">
  <meta name="twitter:image" content="${DEFAULT_OG_IMAGE}">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "${escapeHtml(meta.title)}",
    "url": "${pageUrl}",
    "description": "${escapeHtml(meta.description)}",
    "isPartOf": {
      "@type": "WebSite",
      "name": "OPTCG Master",
      "url": "${SITE_DOMAIN}/"
    }
  }
  </script>
</head>
<body style="background:#0B0F17;color:#E2E8F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:40px;text-align:center;">
  <div style="max-width:540px;margin:auto;background:#0F172A;border:1px solid #334155;border-radius:24px;padding:32px;">
    <h1 style="font-size:22px;color:#FFFFFF;margin-bottom:12px;">${escapeHtml(meta.title)}</h1>
    <p style="font-size:14px;color:#94A3B8;line-height:1.6;margin-bottom:24px;">${escapeHtml(meta.description)}</p>
    <a href="${pageUrl}" style="display:inline-block;background:#F59E0B;color:#000;font-weight:900;font-size:14px;padding:12px 24px;border-radius:12px;text-decoration:none;">Ouvrir sur OPTCG Master ⚔️</a>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(html);
  }

  // 3. Deck Open Graph Page
  const deckName = deckQuery;
  if (deckName) {
    const title = `${deckName} — Deck Compétitif One Piece TCG | OPTCG Master`;
    const description = `Découvrez la liste complète des 50 cartes, ratios, courbe de Don et statistiques de tournoi pour le deck ${deckName} sur OPTCG Master.`;
    const pageUrl = `${SITE_DOMAIN}/deck/${encodeURIComponent(deckName)}`;

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${pageUrl}">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="OPTCG Master">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${DEFAULT_OG_IMAGE}">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${pageUrl}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${DEFAULT_OG_IMAGE}">
</head>
<body style="background:#0B0F17;color:#E2E8F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:40px;text-align:center;">
  <div style="max-width:540px;margin:auto;background:#0F172A;border:1px solid #334155;border-radius:24px;padding:32px;">
    <h1 style="font-size:22px;color:#FFFFFF;margin-bottom:12px;">${escapeHtml(deckName)}</h1>
    <p style="font-size:14px;color:#94A3B8;line-height:1.6;margin-bottom:24px;">${escapeHtml(description)}</p>
    <a href="${pageUrl}" style="display:inline-block;background:#F59E0B;color:#000;font-weight:900;font-size:14px;padding:12px 24px;border-radius:12px;text-decoration:none;">Voir le Deck sur OPTCG Master ⚔️</a>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(html);
  }

    // 4. Fallback General SEO Page
    return res.redirect(302, 'https://www.optcg-master.fr/');
  } catch (err: any) {
    console.error('SSR Error:', err);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(500).send('SSR Handler Error: ' + (err?.message || String(err)));
  }
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
