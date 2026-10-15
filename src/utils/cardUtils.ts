import { Card, Deck, ParsedDecklist } from '../types';
import { isCardBanned, isCardRestricted, isCardUnlimited } from '../data/banlistData';
import cardmarketProductUrlsData from '../data/cardmarket_product_urls.json';
import cardLinksRaw from '../data/card_links.json';

const cardmarketProductUrls = cardmarketProductUrlsData as {
  fr: Record<string, string>;
  en: Record<string, string>;
};

const cardLinks = cardLinksRaw as unknown as {
  byPath?: Record<string, { cm?: string | null; cm_jp?: string | null; tcg?: string | null }>;
  byBasename?: Record<string, Record<string, { cm?: string | null; cm_jp?: string | null; tcg?: string | null }>>;
  byCode?: Record<string, { cm?: string | null; cm_jp?: string | null; tcg?: string | null; fr?: string | null; en?: string | null; jp?: string | null }>;
  byId?: Record<string, { cm?: string | null; cm_jp?: string | null; tcg?: string | null }>;
};

export const CARD_IMG_BASE = '/images/cards/';
export const EGMAN_PROXY_BASE = '/egman-img/';
export const EGMAN_DIRECT_BASE = 'https://img.egmanevents.com/optcg/';
export const CDN_BASE_URL = CARD_IMG_BASE;

export function getCardImageUrl(card: Card | null | undefined, artworkName?: string): string {
  if (!card) return 'https://placehold.co/300x420/1e293b/94a3b8?text=No+Card';
  
  // 1. Direct HTTP / HTTPS URL
  if (artworkName && typeof artworkName === 'string') {
    if (artworkName.startsWith('http://') || artworkName.startsWith('https://')) {
      return artworkName;
    }
  }
  if (!artworkName && card._defaultImagePath) {
    if (card._defaultImagePath.startsWith('http://') || card._defaultImagePath.startsWith('https://')) {
      return card._defaultImagePath;
    }
  }
  if (!artworkName && card.scalpeurs_image_url) {
    return card.scalpeurs_image_url;
  }

  // Check if card has an http image in _imagePaths
  if (card._imagePaths && Array.isArray(card._imagePaths)) {
    const httpImg = card._imagePaths.find(p => typeof p === 'string' && (p.startsWith('http://') || p.startsWith('https://')));
    if (httpImg) {
      return httpImg;
    }
  }

  // 2. Static local reveals path (/reveals/...)
  const checkReveal = artworkName || card._defaultImagePath || '';
  if (typeof checkReveal === 'string' && checkReveal.includes('reveals/')) {
    return checkReveal.startsWith('/') ? checkReveal : '/' + checkReveal;
  }

  let rawName = card.card_code || card.id || '';

  if (artworkName && typeof artworkName === 'string') {
    const withoutExt = artworkName.trim().replace(/\.(webp|png|jpg|jpeg)$/i, '');
    const codeClean = (card.card_code || card.id || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const artClean = withoutExt.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    if (artClean.startsWith(codeClean) || withoutExt.includes('_') || withoutExt.includes('-')) {
      rawName = withoutExt;
    } else if (card._defaultImagePath && !card._defaultImagePath.startsWith('http')) {
      rawName = card._defaultImagePath.replace(/\.(webp|png|jpg|jpeg)$/i, '');
    }
  } else if (card._defaultImagePath && !card._defaultImagePath.startsWith('http')) {
    rawName = card._defaultImagePath.replace(/\.(webp|png|jpg|jpeg)$/i, '');
  } else if (card.id && (card.id.includes('_') || card.id.includes('-r'))) {
    rawName = card.id.replace(/\.(webp|png|jpg|jpeg)$/i, '');
  }

  // Strip temporary release timestamp hashes like "-r1787082572676"
  rawName = rawName.replace(/-r\d+.*$/i, '');

  // Clean filename if it has leading slashes
  const cleanName = rawName.startsWith('/') ? rawName.slice(1) : rawName;
  const egmanName = cleanName.replace(/_P(\d+)/g, '_p$1');
  
  // High-speed Cloudflare CDN WebP
  return `${EGMAN_DIRECT_BASE}${egmanName}.webp`;
}

/**
 * Graceful multi-tier fallback handler for card images
 */
export function handleCardImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  card?: Card | null
) {
  const img = e.currentTarget;
  const currentSrc = img.src || '';
  const cardCode = card?.card_code || card?.id || 'OP01-001';
  const baseCode = cardCode.split('_')[0].split('-r')[0].replace(/\.(webp|png|jpg)$/i, '').replace(/^(fr|jp|en)-/i, '').toUpperCase();

  if (currentSrc.includes('placehold.co')) {
    return;
  }

  // Fallback 1: Try direct Scalpeurs image if not yet tried
  if (card?.scalpeurs_image_url && !currentSrc.includes(card.scalpeurs_image_url)) {
    img.src = card.scalpeurs_image_url;
    return;
  }

  // Fallback 2: Try direct default image path if not yet tried
  if (card?._defaultImagePath && card._defaultImagePath.startsWith('http') && !currentSrc.includes(card._defaultImagePath)) {
    img.src = card._defaultImagePath;
    return;
  }

  // Fallback 3: Official Bandai card image from Egman CDN (100% available for base cards)
  const egmanUrl = `https://img.egmanevents.com/optcg/${baseCode}.webp`;
  if (!currentSrc.includes(egmanUrl)) {
    img.src = egmanUrl;
    return;
  }

  // Fallback 4: Clean card badge placeholder as final fallback only
  img.src = `https://placehold.co/300x420/0f172a/f59e0b?text=${encodeURIComponent(baseCode)}`;
}

/**
 * Detect card language (fr, jp, en) from card object, language string, code, or artwork key
 */
export function detectCardLanguage(
  cardOrLang?: Card | { language?: string; id?: string; is_japanese?: boolean; set_code?: string; cardLang?: string } | string | null,
  artworkKey?: string,
  cardCode?: string
): 'fr' | 'en' | 'jp' {
  if (typeof cardOrLang === 'string') {
    const s = cardOrLang.toLowerCase().trim();
    if (s === 'fr' || s === 'french') return 'fr';
    if (s === 'jp' || s === 'ja' || s === 'japanese') return 'jp';
    if (s === 'en' || s === 'english') return 'en';
    if (s.startsWith('fr-') || s.includes('/cards-fr/')) return 'fr';
    if (s.startsWith('jp-') || s.includes('/cards-jp/')) return 'jp';
  }

  const art = (artworkKey || '').toLowerCase();
  if (art.includes('/cards-fr/') || art.startsWith('fr-') || art.includes('_fr.')) return 'fr';
  if (art.includes('/cards-jp/') || art.startsWith('jp-') || art.includes('_jp.')) return 'jp';

  const code = (cardCode || '').toUpperCase().trim();
  if (code.startsWith('FR-')) return 'fr';
  if (code.startsWith('JP-')) return 'jp';

  if (cardOrLang && typeof cardOrLang === 'object') {
    const c = cardOrLang as any;
    if (c.language) {
      const l = String(c.language).toLowerCase().trim();
      if (l === 'fr' || l === 'french') return 'fr';
      if (l === 'jp' || l === 'ja' || l === 'japanese') return 'jp';
      if (l === 'en' || l === 'english') return 'en';
    }
    if (c.id) {
      const idLow = String(c.id).toLowerCase().trim();
      if (idLow.startsWith('fr-') || idLow.includes('/cards-fr/')) return 'fr';
      if (idLow.startsWith('jp-') || idLow.includes('/cards-jp/')) return 'jp';
    }
    if (c.is_japanese || c.set_code === 'OP18' || c.set_code === 'EB05' || c.set_code === 'PRB02') {
      return 'jp';
    }
    if (c._defaultImagePath) {
      const def = String(c._defaultImagePath).toLowerCase();
      if (def.includes('/cards-fr/')) return 'fr';
      if (def.includes('/cards-jp/')) return 'jp';
    }
  }

  return 'en';
}

/**
 * Return direct Cardmarket 1:1 product URL for a card or specific variant matching language (FR, JP, EN)
 * Directly opens the single card product page (e.g. /Products/Singles/Starter-Deck-Yellow-Eustass-Captain-Kid/EustassCaptainKid-ST36-005?language=2&minCondition=2)
 */
function normalizeArtworkPath(p?: string): string {
  if (!p) return '';
  return p.toLowerCase()
    .replace('https://scalpeurs.com/img/', '')
    .replace('https://scalpeurs.com/', '')
    .replace(/^\/img\//, '')
    .replace(/^\//, '')
    .trim();
}

/**
 * Ensures a Cardmarket URL strictly points to the desired language edition (JP, FR, EN)
 * Preserves curated ?language=2 (French NM) and ?language=1 (English) query parameters from Scalpeurs
 */
export function resolveCardmarketUrlForLanguage(url?: string, targetLang: 'JP' | 'FR' | 'EN' = 'FR'): string {
  if (!url) return 'https://www.cardmarket.com/fr/OnePiece';
  let u = url.trim();

  // 1. Keep Cardmarket website UI locale in French (/fr/) or English (/en/)
  const siteLocale = targetLang === 'EN' ? 'en' : 'fr';
  u = u.replace(/https?:\/\/(www\.)?cardmarket\.com\/[a-z]{2}\//i, `https://www.cardmarket.com/${siteLocale}/`);

  // 2. Language filter alignment: if explicitly requesting EN, translate ?language=2 to ?language=1
  if (targetLang === 'EN' && u.includes('language=2')) {
    u = u.replace('language=2', 'language=1');
  }

  // 3. For Japanese edition requests:
  if (targetLang === 'JP') {
    const setsWithJp = [
      'Romance-Dawn', 'Paramount-War', 'Pillars-of-Strength', 'Kingdoms-of-Intrigue',
      'Awakening-of-the-New-Era', 'Flamboyant', '500-Years-in-the-Future', 'Two-Legends',
      'Emperors-in-the-New-World', 'Royal-Blood', 'A-New-Era-Begins', 'Memorial-Collection'
    ];
    for (const s of setsWithJp) {
      if (u.includes('/' + s + '/') && !u.includes(s + '-Japanese')) {
        u = u.replace('/' + s + '/', '/' + s + '-Japanese/');
      }
    }
  }

  return u;
}

/**
 * Extracts numeric variant from card (e.g. variant: 2 -> 2, -2-13 -> 2, _p01 -> 2)
 */
export function extractCardVariantNumber(card: any): number {
  if (!card) return 1;
  if (card.variant && Number(card.variant) > 1) {
    return Number(card.variant);
  }
  const id = String(card.id || '').toLowerCase();
  const idMatch = id.match(/-([2-9])-(\d+)$/);
  if (idMatch) return parseInt(idMatch[1], 10);
  const vMatch = id.match(/[-_]v([0-9]+)/i);
  if (vMatch) return parseInt(vMatch[1], 10);
  const pMatch = id.match(/_p0?([0-9]+)/i) || String(card._defaultImagePath || '').match(/_p0?([0-9]+)/i);
  if (pMatch) return parseInt(pMatch[1], 10) + 1;
  return 1;
}

/**
 * Preserves the curated 1:1 Cardmarket product URL from the database and detail fiches
 */
export function fixVariantCardmarketUrl(url?: string | null, _cardOrVariant?: any): string {
  if (!url) return '';
  return url;
}

/**
 * Return direct Cardmarket 1:1 product URL for a card or specific variant matching language (FR, JP, EN)
 */
export function getCardmarketUrl(
  cardCode: string,
  artworkKey?: string,
  cardOrLang?: Card | { language?: string; id?: string; is_japanese?: boolean; set_code?: string; cardLang?: string; cardmarket_url?: string; cardmarket_url_jp?: string } | string | null
): string {
  if (!cardCode && !artworkKey && (!cardOrLang || typeof cardOrLang === 'string')) return 'https://www.cardmarket.com/fr/OnePiece';

  const lang = detectCardLanguage(cardOrLang, artworkKey, cardCode);
  const cleanCode = (cardCode || (typeof cardOrLang === 'object' ? (cardOrLang as any)?.card_code || (cardOrLang as any)?.id : '') || '').trim().toUpperCase();
  const baseCode = cleanCode.split('_')[0].split('-R')[0].replace(/\.(WEBP|PNG|JPG|JPEG)$/i, '').replace(/^(FR|JP)-/i, '');
  const langId = lang === 'fr' ? '2' : (lang === 'jp' ? '7' : '1');
  const locale = lang === 'fr' ? 'fr' : 'en';

  const cleanArt = normalizeArtworkPath(artworkKey);

  // 1. Direct cardmarket_url_jp if requesting JP
  if (lang === 'jp') {
    if (cardOrLang && typeof cardOrLang === 'object') {
      const cObj = cardOrLang as any;
      if (cObj.cardmarket_url_jp) {
        return resolveCardmarketUrlForLanguage(cObj.cardmarket_url_jp, 'JP');
      }
      if (cObj.id && (cardLinks as any).byId?.[cObj.id]?.cm_jp) {
        return resolveCardmarketUrlForLanguage((cardLinks as any).byId[cObj.id].cm_jp, 'JP');
      }
      if (cObj.cardmarket_url && (cObj.cardmarket_url.includes('-Japanese') || cObj.cardmarket_url.includes('Non-English'))) {
        return resolveCardmarketUrlForLanguage(cObj.cardmarket_url, 'JP');
      }
    }
    if (cleanArt && (cardLinks as any).byPath?.[cleanArt]?.cm_jp) {
      return resolveCardmarketUrlForLanguage((cardLinks as any).byPath[cleanArt].cm_jp, 'JP');
    }
    if (baseCode && (cardLinks as any).byCode?.[baseCode]?.jp) {
      return resolveCardmarketUrlForLanguage((cardLinks as any).byCode[baseCode].jp, 'JP');
    }
  }

  // 2. If artworkKey points to a specific variant, match by path or basename FIRST
  if (cleanArt) {
    const pathEntry = (cardLinks as any).byPath?.[cleanArt];
    if (pathEntry) {
      if (lang === 'jp' && pathEntry.cm_jp) return resolveCardmarketUrlForLanguage(pathEntry.cm_jp, 'JP');
      if (pathEntry.cm) {
        return resolveCardmarketUrlForLanguage(pathEntry.cm, lang.toUpperCase() as any);
      }
    }

    const baseName = cleanArt.split('/').pop() || '';
    const baseEntry = (cardLinks as any).byBasename?.[baseName];
    if (baseEntry) {
      const lEntry = baseEntry[lang] || baseEntry.en || baseEntry.fr || baseEntry.jp;
      if (lEntry) {
        if (lang === 'jp' && lEntry.cm_jp) return resolveCardmarketUrlForLanguage(lEntry.cm_jp, 'JP');
        if (lEntry.cm) return resolveCardmarketUrlForLanguage(lEntry.cm, lang.toUpperCase() as any);
      }
    }
  }

  // 3. Direct cardmarket_url on cardOrLang object if this is the card itself or matches by ID
  if (cardOrLang && typeof cardOrLang === 'object') {
    const cObj = cardOrLang as any;
    if (cObj.id && (cardLinks as any).byId?.[cObj.id]) {
      const idEntry = (cardLinks as any).byId[cObj.id];
      if (lang === 'jp' && idEntry.cm_jp) return resolveCardmarketUrlForLanguage(idEntry.cm_jp, 'JP');
      if (idEntry.cm) return resolveCardmarketUrlForLanguage(idEntry.cm, lang.toUpperCase() as any);
    }

    if (lang === 'jp' && cObj.cardmarket_url_jp) {
      return resolveCardmarketUrlForLanguage(cObj.cardmarket_url_jp, 'JP');
    }
    if (cObj.cardmarket_url) {
      return resolveCardmarketUrlForLanguage(cObj.cardmarket_url, lang.toUpperCase() as any);
    }
  }

  // 4. Exact match by baseCode from card_links.json
  if (baseCode && (cardLinks as any).byCode?.[baseCode]) {
    const entry = (cardLinks as any).byCode[baseCode];
    if (lang === 'jp' && (entry.jp || entry.cm_jp)) return resolveCardmarketUrlForLanguage(entry.jp || entry.cm_jp, 'JP');
    if (lang === 'fr' && entry.fr) return resolveCardmarketUrlForLanguage(entry.fr, 'FR');
    if (lang === 'en' && entry.en) return resolveCardmarketUrlForLanguage(entry.en, 'EN');
    if (entry.cm) {
      return resolveCardmarketUrlForLanguage(entry.cm, lang.toUpperCase() as any);
    }
  }

  // 5. Fallback search URL on Cardmarket (clean base code search)
  return `https://www.cardmarket.com/${locale}/OnePiece/Products/Search?searchString=${encodeURIComponent(baseCode || cleanCode)}&language=${langId}&minCondition=2`;
}

/**
 * Return direct TCGPlayer URL for a card or specific variant
 */
export function getTcgplayerUrl(
  cardCode: string,
  artworkKey?: string,
  cardOrLang?: Card | { tcgplayer_url?: string; [key: string]: any } | string | null
): string {
  if (!cardCode && !artworkKey) return 'https://www.tcgplayer.com/';

  const cleanCode = (cardCode || (typeof cardOrLang === 'object' ? (cardOrLang as any)?.card_code || (cardOrLang as any)?.id : '') || '').trim().toUpperCase();
  const baseCode = cleanCode.split('_')[0].split('-R')[0].replace(/\.(WEBP|PNG|JPG|JPEG)$/i, '');

  const cleanArt = normalizeArtworkPath(artworkKey);

  // 1. If artworkKey provided, check exact path or basename in card_links
  if (cleanArt) {
    const pathEntry = (cardLinks as any).byPath?.[cleanArt];
    if (pathEntry?.tcg) return pathEntry.tcg;

    const baseName = cleanArt.split('/').pop() || '';
    const baseEntry = (cardLinks as any).byBasename?.[baseName];
    if (baseEntry) {
      const tcg = baseEntry.en?.tcg || baseEntry.fr?.tcg || baseEntry.jp?.tcg;
      if (tcg) return tcg;
    }
  }

  // 2. Direct tcgplayer_url on cardOrLang object if provided
  if (cardOrLang && typeof cardOrLang === 'object' && (cardOrLang as any).tcgplayer_url) {
    return (cardOrLang as any).tcgplayer_url;
  }

  // 3. Exact match by card ID
  if (cardOrLang && typeof cardOrLang === 'object' && (cardOrLang as any).id) {
    const idEntry = (cardLinks as any).byId?.[(cardOrLang as any).id];
    if (idEntry?.tcg) return idEntry.tcg;
  }

  // 4. Exact match by baseCode from card_links.json
  if (baseCode && (cardLinks as any).byCode?.[baseCode]?.tcg) {
    return (cardLinks as any).byCode[baseCode].tcg;
  }

  return `https://www.tcgplayer.com/search/one-piece-card-game/product?q=${encodeURIComponent(baseCode || cleanCode)}`;
}

/**
 * Return direct CardTrader URL for a card or specific variant
 */
export function getCardtraderUrl(cardCode: string, artworkKey?: string): string {
  if (!cardCode) return 'https://www.cardtrader.com/en/search?q=One+Piece';
  const cleanCode = cardCode.trim().toUpperCase();
  const baseCode = cleanCode.split('_')[0].split('-R')[0].replace(/\.(WEBP|PNG|JPG|JPEG)$/i, '');
  
  const art = (artworkKey || cleanCode).toLowerCase().replace(/\.(webp|png|jpg|jpeg)$/i, '');
  const isAlt = art.includes('_p') || art.includes('_r') || art.includes('manga') || art.includes('sp') || art.includes('winner') || art.includes('parallel');

  if (isAlt) {
    if (art.includes('manga') || art.includes('_p3') || art.includes('_p4')) {
      return `https://www.cardtrader.com/en/search?q=${encodeURIComponent(baseCode + ' Manga')}`;
    }
    if (art.includes('sp') || art.includes('special') || art.includes('_sp')) {
      return `https://www.cardtrader.com/en/search?q=${encodeURIComponent(baseCode + ' SP')}`;
    }
    if (art.includes('prb') || art.includes('réimpression') || art.includes('_r')) {
      return `https://www.cardtrader.com/en/search?q=${encodeURIComponent(baseCode + ' PRB')}`;
    }
    if (art.includes('winner') || art.includes('tournoi')) {
      return `https://www.cardtrader.com/en/search?q=${encodeURIComponent(baseCode + ' Winner')}`;
    }
    return `https://www.cardtrader.com/en/search?q=${encodeURIComponent(baseCode + ' Parallel')}`;
  }

  return `https://www.cardtrader.com/en/search?q=${encodeURIComponent(baseCode)}`;
}

/**
 * Format price in EUR (€ Cardmarket / CardTrader) or USD ($ TCGPlayer)
 */
export function formatCardPrice(price?: number | null, currency: 'EUR' | 'USD' = 'EUR'): string {
  if (price === undefined || price === null || isNaN(price) || price <= 0) {
    return currency === 'EUR' ? '0,25 €' : '$0.25';
  }
  if (currency === 'EUR') {
    return `${price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
  }
  return `$${price.toFixed(2)}`;
}

/**
 * Universal flexible search matcher for OPTCG cards
 * Matches OP14-014, op14014, OP14 014, monkey d luffy, Japanese kanji/kana, types, effects, triggers
 */
export function matchesCardSearch(card: Card | null | undefined, query: string): boolean {
  if (!card) return false;
  if (!query || !query.trim()) return true;

  const rawQ = query.trim().toLowerCase();
  
  // Normalize French accents (e.g. "é" -> "e")
  const normQ = rawQ.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const cleanQ = normQ.replace(/[^a-z0-9\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/gi, '');

  const codeRaw = (card.card_code || '').toLowerCase();
  const codeClean = codeRaw.replace(/[^a-z0-9]/gi, '');
  const idRaw = (card.id || '').toLowerCase();
  const idClean = idRaw.replace(/[^a-z0-9]/gi, '');

  // 1. Direct or alphanumeric code / ID match (e.g. "op14-014", "op14014", "op17-079_p1", "op17079p1", "op17079_p1")
  if (
    codeRaw.includes(rawQ) || 
    idRaw.includes(rawQ) || 
    (cleanQ.length > 0 && (codeClean.includes(cleanQ) || idClean.includes(cleanQ)))
  ) {
    return true;
  }

  // 2. Name match (English / Romaji)
  const nameRaw = (card.name || '').toLowerCase();
  const nameNorm = nameRaw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const nameClean = nameNorm.replace(/[^a-z0-9]/gi, '');
  if (nameRaw.includes(rawQ) || nameNorm.includes(normQ) || (cleanQ.length > 0 && nameClean.includes(cleanQ))) {
    return true;
  }

  // 3. Japanese Name match (Kanji / Katakana / Hiragana)
  if (card.jp_name) {
    const jpLow = card.jp_name.toLowerCase();
    if (jpLow.includes(rawQ) || (cleanQ.length > 0 && jpLow.includes(cleanQ))) {
      return true;
    }
  }

  // 4. Image filename or specific variant match (e.g. "p1", "p2", "manga", "sp", "winner")
  if (card._defaultImagePath && card._defaultImagePath.toLowerCase().includes(rawQ)) {
    return true;
  }
  if (card.rarity && card.rarity.toLowerCase() === rawQ) {
    return true;
  }

  // 5. Japanese / Reveal keywords
  if ((rawQ === 'jp' || rawQ === 'japon' || rawQ === 'japonais' || rawQ === 'japanese' || rawQ === 'reveal' || rawQ === 'reveals') && 
      (card.is_japanese || card.set_code === 'OP18' || card.set_code === 'EB05' || card.jp_name)) {
    return true;
  }

  // 6. Effects / French Effect / Trigger / Types
  if (card.effect && card.effect.toLowerCase().includes(rawQ)) return true;
  if (card.effect_fr && card.effect_fr.toLowerCase().includes(rawQ)) return true;
  if (card.trigger && card.trigger.toLowerCase().includes(rawQ)) return true;
  if (card.type && card.type.some(t => t.toLowerCase().includes(rawQ) || t.toLowerCase().normalize('NFD').includes(normQ))) return true;

  return false;
}

export function getColorClass(colorName: string): { bg: string; text: string; border: string; glow: string } {
  const normalized = colorName.toLowerCase();
  switch (normalized) {
    case 'red':
      return { bg: 'bg-red-600', text: 'text-red-400', border: 'border-red-500', glow: 'shadow-red-500/30' };
    case 'green':
      return { bg: 'bg-emerald-600', text: 'text-emerald-400', border: 'border-emerald-500', glow: 'shadow-emerald-500/30' };
    case 'blue':
      return { bg: 'bg-blue-600', text: 'text-blue-400', border: 'border-blue-500', glow: 'shadow-blue-500/30' };
    case 'purple':
      return { bg: 'bg-purple-600', text: 'text-purple-400', border: 'border-purple-500', glow: 'shadow-purple-500/30' };
    case 'black':
      return { bg: 'bg-slate-700', text: 'text-slate-300', border: 'border-slate-500', glow: 'shadow-slate-500/30' };
    case 'yellow':
      return { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-400', glow: 'shadow-amber-500/30' };
    default:
      return { bg: 'bg-slate-700', text: 'text-slate-200', border: 'border-slate-600', glow: 'shadow-slate-600/30' };
  }
}

export function parseDecklistString(str: string): ParsedDecklist {
  const result: ParsedDecklist = {
    leaderCode: null,
    items: []
  };

  if (!str) return result;

  // Case 1: Egman / URL format: ?deck=OP01-001:1,OP01-004:4... or OP01-001:1,OP01-004:4
  if (str.includes(':')) {
    const cleanStr = str.includes('deck=') ? str.split('deck=')[1].split('&')[0] : str;
    const parts = cleanStr.split(',');
    for (const part of parts) {
      const [code, countStr] = part.split(':');
      if (code && countStr) {
        const count = parseInt(countStr, 10);
        if (!isNaN(count) && count > 0) {
          result.items.push({ cardCode: code.trim(), count });
        }
      }
    }
    return result;
  }

  // Case 2: OPTCSim text format: "1xOP01-001\n4xOP01-004..." or "1 OP01-001"
  const lines = str.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Match 1xOP01-001 or 4xST01-004 or 4 OP01-004 or OP01-004
    const match = trimmed.match(/^(\d+)x?\s*([A-Z0-9\-]+)/i);
    if (match) {
      const count = parseInt(match[1], 10);
      const code = match[2].toUpperCase();
      result.items.push({ cardCode: code, count });
    } else {
      const codeMatch = trimmed.match(/([A-Z]{1,3}\d{2}-\d{3})/i);
      if (codeMatch) {
        result.items.push({ cardCode: codeMatch[1].toUpperCase(), count: 1 });
      }
    }
  }

  return result;
}

export function generateOptcSimString(deck: Deck): string {
  const lines: string[] = [];
  
  if (deck.leader) {
    lines.push(`1x${deck.leader.card_code}`);
  }
  
  // Sort cards by code
  const sortedCards = [...deck.cards].sort((a, b) => a.card.card_code.localeCompare(b.card.card_code));
  for (const item of sortedCards) {
    if (item.count > 0) {
      lines.push(`${item.count}x${item.card.card_code}`);
    }
  }
  
  return lines.join('\n');
}

export function generateDeckUrlParam(deck: Deck): string {
  const parts: string[] = [];
  if (deck.leader) {
    parts.push(`${deck.leader.card_code}:1`);
  }
  for (const item of deck.cards) {
    if (item.count > 0) {
      parts.push(`${item.card.card_code}:${item.count}`);
    }
  }
  return parts.join(',');
}

export function validateDeck(deck: Deck): {
  isValid: boolean;
  isOfficialLegal: boolean;
  mainDeckCount: number;
  leaderCount: number;
  errors: string[];
  warnings: string[];
  bannedCards: string[];
  restrictedCards: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const bannedCards: string[] = [];
  const restrictedCards: string[] = [];

  const leaderCount = deck.leader ? 1 : 0;
  const mainDeckCount = deck.cards.reduce((acc, item) => acc + item.count, 0);

  if (leaderCount === 0) {
    errors.push('Un Leader est requis pour valider le deck.');
  } else {
    // Check if Leader is banned
    const leaderBan = isCardBanned(deck.leader.card_code);
    if (leaderBan) {
      bannedCards.push(deck.leader.card_code);
      errors.push(`🚫 [Banlist Bandai] Le Leader ${deck.leader.name} (${deck.leader.card_code}) est banni en tournoi officiel.`);
    }
  }

  if (mainDeckCount !== 50) {
    errors.push(`Le deck principal doit contenir exactement 50 cartes (actuellement : ${mainDeckCount}/50).`);
  }

  // Check color match
  if (deck.leader) {
    const leaderColors = (deck.leader.color || []).map(c => c.toLowerCase());
    for (const item of deck.cards) {
      const cardColors = (item.card.color || []).map(c => c.toLowerCase());
      const hasMatchingColor = cardColors.some(c => leaderColors.includes(c));
      if (!hasMatchingColor && cardColors.length > 0) {
        errors.push(`La carte ${item.card.card_code} (${item.card.name}) n'est pas de la couleur de votre Leader.`);
      }
    }
  }

  // Check card limits, banlist & restrictions
  for (const item of deck.cards) {
    const code = item.card.card_code;

    // 1. Check if card is banned
    const banEntry = isCardBanned(code);
    if (banEntry) {
      bannedCards.push(code);
      errors.push(`🚫 [Banlist Bandai] La carte ${code} (${item.card.name}) est bannie en tournoi officiel.`);
    }

    // 2. Check if card is restricted to 1 copy
    const restEntry = isCardRestricted(code);
    if (restEntry && item.count > 1) {
      restrictedCards.push(code);
      errors.push(`⚠️ [Banlist Bandai] La carte ${code} (${item.card.name}) est limitée à 1 seul exemplaire maximum (${item.count}/1).`);
    }

    // 3. Check 4 copies limit (except for Pacifista and special cards)
    const isUnlimited = isCardUnlimited(code);
    if (!isUnlimited && item.count > 4) {
      errors.push(`La carte ${code} dépasse la limite de 4 exemplaires (${item.count}/4).`);
    }
  }

  const isOfficialLegal = errors.length === 0 && leaderCount === 1 && mainDeckCount === 50 && bannedCards.length === 0;

  return {
    isValid: errors.length === 0,
    isOfficialLegal,
    mainDeckCount,
    leaderCount,
    errors,
    warnings,
    bannedCards,
    restrictedCards
  };
}

/**
 * Determines whether a given card is an Alternate Art / Parallel / Manga / SP / Variant
 */
export function isAltArtworkCard(c: Card | { id?: string; card_code?: string; variant?: number; art_type?: string; variant_type?: string; _defaultImagePath?: string; image_path?: string; image_url?: string; _isAlt?: boolean } | null | undefined): boolean {
  if (!c) return false;
  const anyC = c as any;
  if (anyC._isAlt !== undefined) return anyC._isAlt;
  if (anyC.variant && anyC.variant > 1) return (anyC._isAlt = true);
  if (anyC.art_type && anyC.art_type !== 'REG_ART') return (anyC._isAlt = true);
  if (anyC.variant_type && anyC.variant_type !== 'BASE') return (anyC._isAlt = true);
  const id = (c.id || '').toLowerCase();
  if (id.includes('champ') || id.includes('cup') || id.includes('treasure') || id.includes('winner') || id.includes('3on3')) return (anyC._isAlt = true);
  if (id.includes('_') || (id.includes('-r') && !id.includes('-reg-'))) return (anyC._isAlt = true);
  if (/-[2-9]-[0-9]+/.test(id) || /-[0-9]+-[2-9]/.test(id)) return (anyC._isAlt = true);
  const img = (anyC._defaultImagePath || anyC.image_path || anyC.image_url || anyC.scalpeurs_image_url || '').toLowerCase();
  if (img.includes('_p') || img.includes('-p0') || img.includes('manga') || img.includes('sp') || img.includes('winner') || img.includes('parallel')) return (anyC._isAlt = true);
  return (anyC._isAlt = false);
}
