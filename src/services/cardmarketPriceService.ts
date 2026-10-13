import { Card, CardVariant, Deck } from '../types';
import { allVariants, getVariantsByCode, getCardByCode, cardtraderMapping, cardtraderPrices, cardmarketPrices } from '../data/dataProvider';
import { parseDecklistString, getCardmarketUrl as getCardmarketUrlUtil, getCardtraderUrl as getCardtraderUrlUtil, getTcgplayerUrl as getTcgplayerUrlUtil, detectCardLanguage as detectCardLanguageUtil } from '../utils/cardUtils';

export const getCardmarketUrl = getCardmarketUrlUtil;
export const getCardtraderUrl = getCardtraderUrlUtil;
export const getTcgplayerUrl = getTcgplayerUrlUtil;
export const detectCardLanguage = detectCardLanguageUtil;

export interface CardmarketPriceInfo {
  cardCode: string;
  lowPriceEur: number;
  avgPriceEur: number;
  trendPriceEur: number;
  foilTrendEur: number;
  cardtraderPriceEur: number;
  cardmarketUrl: string;
  cardtraderUrl: string;
  tcgplayerUrl: string;
  hasFoilOption: boolean;
  priceChange7d?: number;
  lastUpdated: string;
}

export interface DeckCostBreakdown {
  totalEstimatedCostEur: number;
  totalCardtraderCostEur: number;
  minPossibleCostEur: number;
  maxFoilCostEur: number;
  coreCardsCostEur: number;
  techCardsCostEur: number;
  isBudgetDeck: boolean;
  currency: 'EUR';
  cardmarketBulkBuyUrl: string;
  cardtraderBulkBuyUrl: string;
  itemizedCosts: {
    card: Card;
    count: number;
    unitPriceEur: number;
    totalPriceEur: number;
    cardtraderUnitPriceEur: number;
    cardmarketUrl: string;
    cardtraderUrl: string;
  }[];
}

export interface MissingCardsReport {
  totalDeckCount: number;
  ownedCardsCount: number;
  missingCardsCount: number;
  missingEstimatedCostEur: number;
  missingCardtraderCostEur: number;
  isComplete: boolean;
  missingItems: {
    card: Card;
    countNeeded: number;
    countOwned: number;
    countMissing: number;
    unitPriceEur: number;
    totalMissingCostEur: number;
    cardmarketUrl: string;
    cardtraderUrl: string;
  }[];
}

/**
 * Quick memory cache for computed card prices (keyed by cardCode + language)
 */
const priceCache = new Map<string, CardmarketPriceInfo>();
const tournamentDeckPriceCache = new Map<string, { totalEur: number; minEur: number; isBudget: boolean }>();

/**
 * Calculates or retrieves official Cardmarket + CardTrader price info for any card code matching language
 */
export function getCardmarketPriceInfo(
  cardCode: string,
  cardOrLang?: Card | { language?: string; id?: string; is_japanese?: boolean; set_code?: string; cardLang?: string } | string | null
): CardmarketPriceInfo {
  if (!cardCode) {
    return {
      cardCode: '',
      lowPriceEur: 0.10,
      avgPriceEur: 0.25,
      trendPriceEur: 0.25,
      foilTrendEur: 1.50,
      cardtraderPriceEur: 0.25,
      cardmarketUrl: 'https://www.cardmarket.com/en/OnePiece',
      cardtraderUrl: 'https://www.cardtrader.com/en/search?q=One+Piece',
      tcgplayerUrl: 'https://www.tcgplayer.com/',
      hasFoilOption: false,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  }

  const lang = detectCardLanguage(cardOrLang, undefined, cardCode);
  const cleanCode = cardCode.trim().toUpperCase();
  const cacheKey = `${cleanCode}_${lang}`;
  if (priceCache.has(cacheKey)) {
    return priceCache.get(cacheKey)!;
  }

  const baseCode = cleanCode.split('_')[0].split('-R')[0].replace(/\.(WEBP|PNG|JPG)$/i, '').replace(/^(FR|JP)-/i, '');
  const isSpecificPrint = cleanCode.includes('_') || cleanCode.includes('-R');

  // If this is a specific print (e.g. OP01-016_p2), find the exact variant directly!
  if (isSpecificPrint && allVariants && allVariants.length > 0) {
    const cleanImg = cleanCode.toLowerCase().replace(/\.(webp|png|jpg)$/i, '');
    const exactVar = allVariants.find(v => (v.image_path || '').toLowerCase().replace(/\.(webp|png|jpg)$/i, '') === cleanImg);
    if (exactVar && ((exactVar.cardmarket_trend && exactVar.cardmarket_trend > 0) || (exactVar.market_price && exactVar.market_price > 0) || (exactVar.cardtrader_price && exactVar.cardtrader_price > 0))) {
      const cmPrice = exactVar.cardmarket_trend || exactVar.market_price || 0;
      const ctPrice = exactVar.cardtrader_price || 0;
      const result: CardmarketPriceInfo = {
        cardCode: cleanCode,
        lowPriceEur: exactVar.cardmarket_low || exactVar.low_price || cmPrice,
        avgPriceEur: exactVar.cardmarket_avg || exactVar.avg_price || cmPrice,
        trendPriceEur: cmPrice,
        foilTrendEur: cmPrice,
        cardtraderPriceEur: ctPrice,
        cardmarketUrl: (lang === 'jp' && exactVar.cardmarket_url_jp ? exactVar.cardmarket_url_jp : exactVar.cardmarket_url) || getCardmarketUrl(baseCode, cleanImg, cardOrLang || lang),
        cardtraderUrl: exactVar.cardtrader_url || getCardtraderUrl(baseCode),
        tcgplayerUrl: exactVar.tcgplayer_url || getTcgplayerUrl(baseCode, cleanImg, cardOrLang),
        hasFoilOption: true,
        lastUpdated: exactVar.updated_at ? exactVar.updated_at.split('T')[0] : new Date().toISOString().split('T')[0]
      };
      priceCache.set(cacheKey, result);
      return result;
    }
  }

  const variants = getVariantsByCode(baseCode || cleanCode);
  const cmRecord = cardmarketPrices[baseCode || cleanCode];
  const ctRecord = cardtraderPrices[baseCode || cleanCode];

  // 1. Pure Cardmarket JSON Pricing with language-specific link
  let lowPrice = 0.15;
  let avgPrice = 0.35;
  let trendPrice = 0.35;
  let foilTrend = 0;
  let hasFoil = false;
  const cardObj = typeof cardOrLang === 'object' ? cardOrLang as Card : null;
  let cardmarketUrl = (lang === 'jp' && cardObj?.cardmarket_url_jp ? cardObj.cardmarket_url_jp : cardObj?.cardmarket_url) || getCardmarketUrl(baseCode || cleanCode, undefined, cardOrLang || lang);
  let tcgplayerUrl = cardObj?.tcgplayer_url || getTcgplayerUrl(baseCode || cleanCode, undefined, cardObj);

  if (cmRecord && (cmRecord.trend_eur > 0 || cmRecord.low_eur > 0 || cmRecord.avg_eur > 0)) {
    trendPrice = cmRecord.trend_eur > 0 ? cmRecord.trend_eur : (cmRecord.avg_eur > 0 ? cmRecord.avg_eur : cmRecord.low_eur);
    lowPrice = cmRecord.low_eur > 0 ? cmRecord.low_eur : trendPrice;
    avgPrice = cmRecord.avg_eur > 0 ? cmRecord.avg_eur : trendPrice;
    foilTrend = cmRecord.foil_trend_eur || 0;
    if (!cardObj?.cardmarket_url) {
      cardmarketUrl = getCardmarketUrl(baseCode || cleanCode, undefined, cardOrLang || lang);
    }
  } else if (variants && variants.length > 0) {
    const normalVar = variants.find(v => (v.variant_label || '').toLowerCase().includes('base')) || variants[0];
    if (normalVar.cardmarket_trend && normalVar.cardmarket_trend > 0) {
      trendPrice = normalVar.cardmarket_trend;
      lowPrice = normalVar.cardmarket_low || trendPrice;
      avgPrice = normalVar.cardmarket_avg || trendPrice;
    } else if (normalVar.market_price && normalVar.market_price > 0) {
      trendPrice = normalVar.market_price;
      lowPrice = normalVar.low_price || trendPrice;
      avgPrice = normalVar.avg_price || trendPrice;
    }
    if (normalVar.cardmarket_url) {
      cardmarketUrl = (lang === 'jp' && normalVar.cardmarket_url_jp ? normalVar.cardmarket_url_jp : normalVar.cardmarket_url);
    }
    if (normalVar.tcgplayer_url) {
      tcgplayerUrl = normalVar.tcgplayer_url;
    }
  }

  // Check parallel foil in variants
  if (variants && variants.length > 0) {
    const normalVar = variants.find(v => (v.variant_label || '').toLowerCase().includes('base')) || variants[0];
    const parallelVars = variants.filter(v => v !== normalVar);
    if (parallelVars.length > 0) {
      hasFoil = true;
      if (foilTrend === 0) {
        const maxVar = parallelVars.reduce((max, curr) => ((curr.cardmarket_trend || curr.market_price || 0) > (max.cardmarket_trend || max.market_price || 0)) ? curr : max, parallelVars[0]);
        foilTrend = (maxVar.cardmarket_trend || maxVar.market_price) ? Math.round((maxVar.cardmarket_trend || maxVar.market_price)! * 100) / 100 : trendPrice * 3;
      }
    }
  }

  // 2. Pure CardTrader API Pricing
  let cardtraderPrice = 0;
  let cardtraderUrl = getCardtraderUrl(baseCode || cleanCode);
  if (ctRecord && ctRecord.lowest_eur > 0) {
    cardtraderPrice = ctRecord.lowest_eur;
    if (ctRecord.url) cardtraderUrl = ctRecord.url;
  } else if (variants && variants.length > 0) {
    const normalVar = variants.find(v => (v.variant_label || '').toLowerCase().includes('base')) || variants[0];
    if (normalVar.cardtrader_price && normalVar.cardtrader_price > 0) {
      cardtraderPrice = normalVar.cardtrader_price;
      if (normalVar.cardtrader_url) cardtraderUrl = normalVar.cardtrader_url;
    }
  }

  // Ensure minimums
  if (lowPrice <= 0) lowPrice = 0.05;
  if (trendPrice <= 0) trendPrice = 0.10;
  if (avgPrice <= 0) avgPrice = trendPrice;

  const result: CardmarketPriceInfo = {
    cardCode: cleanCode,
    lowPriceEur: lowPrice,
    avgPriceEur: avgPrice,
    trendPriceEur: trendPrice,
    foilTrendEur: foilTrend > 0 ? foilTrend : trendPrice * 2.5,
    cardtraderPriceEur: cardtraderPrice,
    cardmarketUrl,
    cardtraderUrl,
    tcgplayerUrl,
    hasFoilOption: hasFoil,
    lastUpdated: new Date().toISOString().split('T')[0]
  };

  priceCache.set(cacheKey, result);
  return result;
}

export interface ArtworkPriceResult {
  priceEur: number;
  priceMinEur?: number;
  priceAvg7Eur?: number;
  priceAvg30Eur?: number;
  listingsCount?: number;
  cardmarketPriceEur: number;
  cardtraderPriceEur: number;
  cardmarketUrl: string;
  cardtraderUrl: string;
  tcgplayerUrl: string;
  isAlt: boolean;
  variantLabel: string;
}

const artworkPriceCache = new Map<string, ArtworkPriceResult>();

/**
 * Single unified source of truth for artwork / variant pricing across the entire application
 */
export function getCardPriceForArtwork(
  card: Card | { card_code: string; language?: string; id?: string; is_japanese?: boolean; set_code?: string; _imagePaths?: string[]; _defaultImagePath?: string; cardLang?: string; price_eur?: number | null; price_min_eur?: number | null; price_avg7_eur?: number | null; price_avg30_eur?: number | null; listings_count?: number | null; cardmarket_url?: string; cardmarket_url_jp?: string; tcgplayer_url?: string; },
  artworkKey?: string
): ArtworkPriceResult {
  if (!card || !card.card_code) {
    return {
      priceEur: 0.25,
      priceMinEur: 0.10,
      priceAvg7Eur: 0.25,
      priceAvg30Eur: 0.25,
      listingsCount: 0,
      cardmarketPriceEur: 0.25,
      cardtraderPriceEur: 0.25,
      cardmarketUrl: 'https://www.cardmarket.com/en/OnePiece',
      cardtraderUrl: 'https://www.cardtrader.com/en/search?q=One+Piece',
      tcgplayerUrl: 'https://www.tcgplayer.com/',
      isAlt: false,
      variantLabel: 'Carte de Base'
    };
  }

  const cacheKey = `${(card as any).id || card.card_code}_${artworkKey || (card as any)._defaultImagePath || ''}`;
  const cached = artworkPriceCache.get(cacheKey);
  if (cached) return cached;

  const result = computeCardPriceForArtwork(card, artworkKey);
  artworkPriceCache.set(cacheKey, result);
  return result;
}

function computeCardPriceForArtwork(
  card: Card | { card_code: string; language?: string; id?: string; is_japanese?: boolean; set_code?: string; _imagePaths?: string[]; _defaultImagePath?: string; cardLang?: string; price_eur?: number | null; price_min_eur?: number | null; price_avg7_eur?: number | null; price_avg30_eur?: number | null; listings_count?: number | null; cardmarket_url?: string; cardmarket_url_jp?: string; tcgplayer_url?: string; },
  artworkKey?: string
): ArtworkPriceResult {

  const cardAny = card as any;
  const cleanCode = card.card_code.trim().toUpperCase();
  const baseCode = cleanCode.split('_')[0].split('-R')[0].replace(/\.(WEBP|PNG|JPG|JPEG)$/i, '').replace(/^(FR|JP)-/i, '');
  const basePriceInfo = getCardmarketPriceInfo(baseCode, card as Card);

  const allImages = card._imagePaths && card._imagePaths.length > 0 
    ? card._imagePaths 
    : [card._defaultImagePath || `${baseCode}.webp`];

  // Extract clean basename from artworkKey
  const rawKey = artworkKey || card._defaultImagePath || '';
  const cleanArt = rawKey.split('/').pop()?.split('\\').pop()?.toLowerCase().replace(/\.(webp|png|jpg|jpeg)$/i, '') || '';
  const cleanBaseArt = (allImages[0] || `${baseCode}.webp`).split('/').pop()?.split('\\').pop()?.toLowerCase().replace(/\.(webp|png|jpg|jpeg)$/i, '') || '';

  const isAltVariant = (cardAny.variant && cardAny.variant > 1) 
    || (cardAny.art_type && cardAny.art_type !== 'REG_ART')
    || (cardAny.variant_type && cardAny.variant_type !== 'BASE')
    || (cardAny.id && (cardAny.id.includes('-2-') || cardAny.id.includes('-3-') || cardAny.id.includes('-4-') || cardAny.id.includes('-5-') || cardAny.id.includes('-6-') || cardAny.id.includes('_') || cardAny.id.includes('-r')))
    || cleanArt.includes('_p') || cleanArt.includes('_r') || cleanArt.includes('-p0') || cleanArt.includes('-p1') || cleanArt.includes('-p2') || cleanArt.includes('-p3') || cleanArt.includes('manga') || cleanArt.includes('sp') || cleanArt.includes('winner') || cleanArt.includes('parallel') || cleanArt.includes('gold');
  
  const isBase = !isAltVariant;
  const targetLang = detectCardLanguage(card, artworkKey, cleanCode);

  // If card object directly has verified variant price from optcg_complete_database, use it immediately
  if (isAltVariant && cardAny.price_eur !== undefined && cardAny.price_eur !== null && cardAny.price_eur > 0) {
    const trendPrice = cardAny.price_eur;
    // Protect minPrice so base card 0.05€ never pollutes high-value alternate art
    const minPrice = (cardAny.price_min_eur !== undefined && cardAny.price_min_eur !== null && cardAny.price_min_eur >= trendPrice * 0.4) 
      ? cardAny.price_min_eur 
      : trendPrice;
    return {
      priceEur: trendPrice,
      priceMinEur: minPrice,
      priceAvg7Eur: cardAny.price_avg7_eur || trendPrice,
      priceAvg30Eur: cardAny.price_avg30_eur,
      listingsCount: cardAny.listings_count || 0,
      cardmarketPriceEur: trendPrice,
      cardtraderPriceEur: cardAny.cardtrader_price || 0,
      cardmarketUrl: (targetLang === 'jp' ? (cardAny.cardmarket_url_jp || cardAny.cardmarket_url) : cardAny.cardmarket_url) || getCardmarketUrl(baseCode, rawKey, card as Card),
      cardtraderUrl: basePriceInfo.cardtraderUrl,
      tcgplayerUrl: cardAny.tcgplayer_url || getTcgplayerUrl(baseCode, rawKey, card as Card),
      isAlt: true,
      variantLabel: cardAny.art_type || 'Parallel Art'
    };
  }

  // Look up in variants matching language
  const variants = getVariantsByCode(baseCode);
  const langVariants = variants.filter(v => (v.language || '').toLowerCase() === targetLang);
  const searchPool = langVariants.length > 0 ? langVariants : variants;

  if (isBase) {
    const baseVar = searchPool.find(v => (v.variant_label || '').toLowerCase().includes('base')) || searchPool[0];
    const trendPrice = baseVar?.price_eur || baseVar?.cardmarket_trend || (card as any).price_eur || baseVar?.market_price || basePriceInfo.trendPriceEur || 0;
    const minPrice = baseVar?.price_min_eur || (card as any).price_min_eur || baseVar?.low_price || trendPrice;
    const avg7 = baseVar?.price_avg7_eur || (card as any).price_avg7_eur || baseVar?.avg_price;
    const avg30 = baseVar?.price_avg30_eur || (card as any).price_avg30_eur;
    const listingsCount = baseVar?.listings_count !== undefined && baseVar?.listings_count !== null ? baseVar.listings_count : ((card as any).listings_count || 0);
    const ctPrice = (baseVar?.cardtrader_price && baseVar.cardtrader_price > 0)
      ? baseVar.cardtrader_price
      : (basePriceInfo.cardtraderPriceEur > 0 ? basePriceInfo.cardtraderPriceEur : 0);

    const mainPrice = trendPrice > 0 ? trendPrice : minPrice;

    return {
      priceEur: mainPrice,
      priceMinEur: minPrice > 0 ? minPrice : mainPrice,
      priceAvg7Eur: avg7,
      priceAvg30Eur: avg30,
      listingsCount,
      cardmarketPriceEur: mainPrice,
      cardtraderPriceEur: ctPrice,
      cardmarketUrl: getCardmarketUrl(baseCode, rawKey, card as Card),
      cardtraderUrl: baseVar?.cardtrader_url || basePriceInfo.cardtraderUrl,
      tcgplayerUrl: getTcgplayerUrl(baseCode, rawKey, card as Card),
      isAlt: false,
      variantLabel: baseVar?.variant_label || 'Carte de Base'
    };
  }

  if (searchPool && searchPool.length > 0) {
    // 1. Exact match on image_path
    const exact = searchPool.find(v => {
      const vImg = (v.image_path || '').split('/').pop()?.split('\\').pop()?.toLowerCase().replace(/\.(webp|png|jpg|jpeg)$/i, '');
      return vImg === cleanArt;
    }) || variants.find(v => {
      const vImg = (v.image_path || '').split('/').pop()?.split('\\').pop()?.toLowerCase().replace(/\.(webp|png|jpg|jpeg)$/i, '');
      return vImg === cleanArt;
    });

    if (exact) {
      let trendPrice = exact.price_eur || exact.cardmarket_trend || exact.market_price || exact.trend_price || 0;
      let minPrice = exact.price_min_eur || exact.low_price || trendPrice;
      if (trendPrice <= 0 && minPrice > 0) trendPrice = minPrice;
      let ctPrice = exact.cardtrader_price || 0;
      const vLabel = (exact.variant_label || '').toLowerCase();

      // Guard minimum prices for high rarity alt arts if not in DB
      if (trendPrice <= 0 && minPrice <= 0) {
        if (vLabel.includes('manga') || cleanArt.includes('manga')) {
          trendPrice = 650;
          minPrice = 450;
        } else if (vLabel.includes('sp') || vLabel.includes('special') || cleanArt.includes('_sp')) {
          trendPrice = 45;
          minPrice = 25;
        }
      }

      const finalPrice = trendPrice > 0 ? trendPrice : minPrice;

      return {
        priceEur: finalPrice,
        priceMinEur: minPrice > 0 ? minPrice : finalPrice,
        priceAvg7Eur: exact.price_avg7_eur || exact.avg_price,
        priceAvg30Eur: exact.price_avg30_eur,
        listingsCount: exact.listings_count || 0,
        cardmarketPriceEur: finalPrice,
        cardtraderPriceEur: ctPrice,
        cardmarketUrl: (targetLang === 'jp' ? (exact.cardmarket_url_jp || exact.cardmarket_url) : exact.cardmarket_url) || getCardmarketUrl(baseCode, exact.image_path || rawKey, card as Card),
        cardtraderUrl: exact.cardtrader_url || getCardtraderUrl(baseCode, cleanArt),
        tcgplayerUrl: exact.tcgplayer_url || getTcgplayerUrl(baseCode, exact.image_path || rawKey, card as Card),
        isAlt: true,
        variantLabel: exact.variant_label || 'Variante Alternative'
      };
    }

    // 2. Manga variant match
    if (cleanArt.includes('manga')) {
      const manga = searchPool.find(v => (v.variant_label || '').toLowerCase().includes('manga')) || variants.find(v => (v.variant_label || '').toLowerCase().includes('manga'));
      if (manga) {
        const minPrice = manga.price_min_eur || manga.low_price || 450;
        const cmPrice = manga.price_eur || manga.cardmarket_trend || manga.market_price || 650;
        const ctPrice = manga.cardtrader_price || 620;
        const finalPrice = minPrice > 0 ? minPrice : cmPrice;
        return {
          priceEur: finalPrice,
          priceMinEur: minPrice,
          priceAvg7Eur: manga.price_avg7_eur || manga.avg_price,
          priceAvg30Eur: manga.price_avg30_eur,
          listingsCount: manga.listings_count || 0,
          cardmarketPriceEur: finalPrice,
          cardtraderPriceEur: ctPrice,
          cardmarketUrl: (targetLang === 'jp' ? (manga.cardmarket_url_jp || manga.cardmarket_url) : manga.cardmarket_url) || getCardmarketUrl(baseCode, manga.image_path || 'manga', card as Card),
          cardtraderUrl: manga.cardtrader_url || getCardtraderUrl(baseCode, 'manga'),
          tcgplayerUrl: manga.tcgplayer_url || getTcgplayerUrl(baseCode, manga.image_path || 'manga', card as Card),
          isAlt: true,
          variantLabel: manga.variant_label || 'Manga Panel Rare 👑'
        };
      }
    }

    // 3. Special / SP variant match
    if (cleanArt.includes('sp') || cleanArt.includes('special') || cleanArt.includes('_sp')) {
      const sp = searchPool.find(v => (v.variant_label || '').toLowerCase().includes('special') || (v.variant_label || '').toLowerCase().includes('sp')) || variants.find(v => (v.variant_label || '').toLowerCase().includes('special') || (v.variant_label || '').toLowerCase().includes('sp'));
      if (sp) {
        const minPrice = sp.price_min_eur || sp.low_price || 25;
        const cmPrice = sp.price_eur || sp.cardmarket_trend || sp.market_price || 45;
        const ctPrice = sp.cardtrader_price || 42;
        const finalPrice = minPrice > 0 ? minPrice : cmPrice;
        return {
          priceEur: finalPrice,
          priceMinEur: minPrice,
          priceAvg7Eur: sp.price_avg7_eur || sp.avg_price,
          priceAvg30Eur: sp.price_avg30_eur,
          listingsCount: sp.listings_count || 0,
          cardmarketPriceEur: finalPrice,
          cardtraderPriceEur: ctPrice,
          cardmarketUrl: (targetLang === 'jp' ? (sp.cardmarket_url_jp || sp.cardmarket_url) : sp.cardmarket_url) || getCardmarketUrl(baseCode, sp.image_path || 'sp', card as Card),
          cardtraderUrl: sp.cardtrader_url || getCardtraderUrl(baseCode, 'sp'),
          tcgplayerUrl: sp.tcgplayer_url || getTcgplayerUrl(baseCode, sp.image_path || 'sp', card as Card),
          isAlt: true,
          variantLabel: sp.variant_label || 'Special Card (SP) ⭐'
        };
      }
    }

    // 4. Alternate Art / Parallel variant match
    const alt = searchPool.find(v => (v.variant_label || '').toLowerCase().includes('alt') || (v.variant_label || '').toLowerCase().includes('parallel')) || variants.find(v => (v.variant_label || '').toLowerCase().includes('alt') || (v.variant_label || '').toLowerCase().includes('parallel'));
    if (alt) {
      const minPrice = alt.price_min_eur || alt.low_price || 0;
      const cmPrice = alt.price_eur || alt.cardmarket_trend || alt.market_price || 0;
      const ctPrice = alt.cardtrader_price || 0;
      const finalPrice = minPrice > 0 ? minPrice : cmPrice;
      return {
        priceEur: finalPrice > 0 ? finalPrice : ctPrice,
        priceMinEur: minPrice > 0 ? minPrice : finalPrice,
        priceAvg7Eur: alt.price_avg7_eur || alt.avg_price,
        priceAvg30Eur: alt.price_avg30_eur,
        listingsCount: alt.listings_count || 0,
        cardmarketPriceEur: finalPrice > 0 ? finalPrice : ctPrice,
        cardtraderPriceEur: ctPrice,
        cardmarketUrl: (targetLang === 'jp' ? (alt.cardmarket_url_jp || alt.cardmarket_url) : alt.cardmarket_url) || getCardmarketUrl(baseCode, alt.image_path || 'parallel', card as Card),
        cardtraderUrl: alt.cardtrader_url || getCardtraderUrl(baseCode, 'parallel'),
        tcgplayerUrl: alt.tcgplayer_url || getTcgplayerUrl(baseCode, alt.image_path || 'parallel', card as Card),
        isAlt: true,
        variantLabel: alt.variant_label || 'Alternate Art (Parallel) ✨'
      };
    }
  }

  // Fallback
  const fallbackCm = Math.max(15.00, basePriceInfo.trendPriceEur * 3);
  const fallbackCt = Math.max(12.00, basePriceInfo.cardtraderPriceEur > 0 ? basePriceInfo.cardtraderPriceEur * 3 : fallbackCm * 0.9);
  return {
    priceEur: fallbackCm,
    priceMinEur: fallbackCm * 0.8,
    listingsCount: 0,
    cardmarketPriceEur: fallbackCm,
    cardtraderPriceEur: fallbackCt,
    cardmarketUrl: getCardmarketUrl(baseCode, rawKey, card as Card),
    cardtraderUrl: getCardtraderUrl(baseCode, cleanArt),
    tcgplayerUrl: getTcgplayerUrl(baseCode, rawKey, card as Card),
    isAlt: true,
    variantLabel: 'Variante Alternative'
  };
}

/**
 * Calculates complete Deck Cost Breakdown based on Cardmarket & CardTrader pricing
 */
export function calculateDeckCostBreakdown(
  deckItems: { card: Card; count: number }[],
  leaderCard?: Card | null
): DeckCostBreakdown {
  let totalEstimated = 0;
  let totalCardtrader = 0;
  let minPossible = 0;
  let maxFoil = 0;
  let coreCost = 0;
  let techCost = 0;

  const itemized: {
    card: Card;
    count: number;
    unitPriceEur: number;
    totalPriceEur: number;
    cardtraderUnitPriceEur: number;
    cardmarketUrl: string;
    cardtraderUrl: string;
  }[] = [];

  // 1. Leader card cost
  if (leaderCard) {
    const leaderPrice = getCardmarketPriceInfo(leaderCard.card_code, leaderCard);
    totalEstimated += leaderPrice.trendPriceEur;
    totalCardtrader += leaderPrice.cardtraderPriceEur;
    minPossible += leaderPrice.lowPriceEur;
    maxFoil += leaderPrice.foilTrendEur || leaderPrice.trendPriceEur;
    coreCost += leaderPrice.trendPriceEur;

    itemized.push({
      card: leaderCard,
      count: 1,
      unitPriceEur: leaderPrice.trendPriceEur,
      totalPriceEur: leaderPrice.trendPriceEur,
      cardtraderUnitPriceEur: leaderPrice.cardtraderPriceEur,
      cardmarketUrl: leaderPrice.cardmarketUrl,
      cardtraderUrl: leaderPrice.cardtraderUrl
    });
  }

  // 2. Main Deck 50 Cards cost
  for (const item of deckItems) {
    if (!item.card || item.count <= 0) continue;
    const priceInfo = getCardmarketPriceInfo(item.card.card_code, item.card);
    const itemTotalTrend = Math.round(priceInfo.trendPriceEur * item.count * 100) / 100;
    const itemTotalCardtrader = Math.round(priceInfo.cardtraderPriceEur * item.count * 100) / 100;
    const itemTotalLow = Math.round(priceInfo.lowPriceEur * item.count * 100) / 100;
    const itemTotalFoil = Math.round(priceInfo.foilTrendEur * item.count * 100) / 100;

    totalEstimated += itemTotalTrend;
    totalCardtrader += itemTotalCardtrader;
    minPossible += itemTotalLow;
    maxFoil += itemTotalFoil;

    // Categorize Core (3-4 copies) vs Tech (1-2 copies)
    if (item.count >= 3) {
      coreCost += itemTotalTrend;
    } else {
      techCost += itemTotalTrend;
    }

    itemized.push({
      card: item.card,
      count: item.count,
      unitPriceEur: priceInfo.trendPriceEur,
      totalPriceEur: itemTotalTrend,
      cardtraderUnitPriceEur: priceInfo.cardtraderPriceEur,
      cardmarketUrl: priceInfo.cardmarketUrl,
      cardtraderUrl: priceInfo.cardtraderUrl
    });
  }

  // Generate Cardmarket / CardTrader Search Links
  const searchTerms = deckItems.map(i => i.card.card_code).slice(0, 5).join(' ');
  const cardmarketBulkBuyUrl = `https://www.cardmarket.com/en/OnePiece/Products/Search?searchString=${encodeURIComponent(searchTerms || 'One Piece Deck')}`;
  const cardtraderBulkBuyUrl = `https://www.cardtrader.com/en/search?q=${encodeURIComponent(searchTerms || 'One Piece')}`;

  const totalCost = Math.round(totalEstimated * 100) / 100;

  return {
    totalEstimatedCostEur: totalCost,
    totalCardtraderCostEur: Math.round(totalCardtrader * 100) / 100,
    minPossibleCostEur: Math.round(minPossible * 100) / 100,
    maxFoilCostEur: Math.round(maxFoil * 100) / 100,
    coreCardsCostEur: Math.round(coreCost * 100) / 100,
    techCardsCostEur: Math.round(techCost * 100) / 100,
    isBudgetDeck: totalCost < 50,
    currency: 'EUR',
    cardmarketBulkBuyUrl,
    cardtraderBulkBuyUrl,
    itemizedCosts: itemized
  };
}

/**
 * Calculates missing cards and cost to complete any deck given user collection
 */
export function calculateMissingCardsForDeck(
  deckItems: { card: Card; count: number }[],
  leaderCard?: Card | null,
  getOwnedCountFn?: (cardCode: string) => number
): MissingCardsReport {
  let totalDeck = 0;
  let ownedCount = 0;
  let missingCount = 0;
  let missingCost = 0;
  let missingCtCost = 0;

  const missingItems: MissingCardsReport['missingItems'] = [];

  // 1. Leader
  if (leaderCard) {
    totalDeck += 1;
    const owned = getOwnedCountFn ? getOwnedCountFn(leaderCard.card_code) : 0;
    const needed = 1;
    const missing = Math.max(0, needed - owned);

    if (missing > 0) {
      const price = getCardmarketPriceInfo(leaderCard.card_code, leaderCard);
      const totalItemCost = price.trendPriceEur * missing;
      missingCount += missing;
      missingCost += totalItemCost;
      missingCtCost += price.cardtraderPriceEur * missing;

      missingItems.push({
        card: leaderCard,
        countNeeded: needed,
        countOwned: Math.min(needed, owned),
        countMissing: missing,
        unitPriceEur: price.trendPriceEur,
        totalMissingCostEur: Math.round(totalItemCost * 100) / 100,
        cardmarketUrl: price.cardmarketUrl,
        cardtraderUrl: price.cardtraderUrl
      });
    } else {
      ownedCount += 1;
    }
  }

  // 2. Main Deck Items
  for (const item of deckItems) {
    if (!item.card || item.count <= 0) continue;
    totalDeck += item.count;
    const owned = getOwnedCountFn ? getOwnedCountFn(item.card.card_code) : 0;
    const needed = item.count;
    const missing = Math.max(0, needed - owned);

    if (missing > 0) {
      const price = getCardmarketPriceInfo(item.card.card_code, item.card);
      const totalItemCost = price.trendPriceEur * missing;
      missingCount += missing;
      missingCost += totalItemCost;
      missingCtCost += price.cardtraderPriceEur * missing;
      ownedCount += Math.min(needed, owned);

      missingItems.push({
        card: item.card,
        countNeeded: needed,
        countOwned: Math.min(needed, owned),
        countMissing: missing,
        unitPriceEur: price.trendPriceEur,
        totalMissingCostEur: Math.round(totalItemCost * 100) / 100,
        cardmarketUrl: price.cardmarketUrl,
        cardtraderUrl: price.cardtraderUrl
      });
    } else {
      ownedCount += needed;
    }
  }

  return {
    totalDeckCount: totalDeck,
    ownedCardsCount: ownedCount,
    missingCardsCount: missingCount,
    missingEstimatedCostEur: Math.round(missingCost * 100) / 100,
    missingCardtraderCostEur: Math.round(missingCtCost * 100) / 100,
    isComplete: missingCount === 0,
    missingItems
  };
}

/**
 * Calculates estimated tournament deck price from its decklist string (cached)
 */
export function getTournamentDeckPrice(
  decklistString?: string,
  leaderCode?: string
): { totalEur: number; minEur: number; isBudget: boolean } {
  if (!decklistString) return { totalEur: 35.0, minEur: 20.0, isBudget: true };

  const cacheKey = `${leaderCode || ''}_${decklistString}`;
  if (tournamentDeckPriceCache.has(cacheKey)) {
    return tournamentDeckPriceCache.get(cacheKey)!;
  }

  const parsed = parseDecklistString(decklistString);
  const leaderCard = leaderCode ? getCardByCode(leaderCode) : (parsed.leaderCode ? getCardByCode(parsed.leaderCode) : null);
  
  const deckItems: { card: Card; count: number }[] = [];
  for (const item of parsed.items) {
    if (leaderCard && item.cardCode === leaderCard.card_code) continue;
    const card = getCardByCode(item.cardCode);
    if (card) {
      deckItems.push({ card, count: item.count });
    }
  }

  const breakdown = calculateDeckCostBreakdown(deckItems, leaderCard);
  const result = {
    totalEur: breakdown.totalEstimatedCostEur,
    minEur: breakdown.minPossibleCostEur,
    isBudget: breakdown.isBudgetDeck
  };

  tournamentDeckPriceCache.set(cacheKey, result);
  return result;
}

/**
 * Formats EUR amount nicely
 * e.g. 45.5 -> "45,50 €"
 */
export function formatEur(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0,25 €';
  return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}
