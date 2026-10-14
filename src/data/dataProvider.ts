import cardsDataRaw from './cards.json';
import variantsDataRaw from './variants.json';
import completeDatabaseRaw from './optcg_complete_database.json';
import gamedataRaw from './gamedata.json';
import cardtraderMappingRaw from './cardtrader_mapping.json';
import cardtraderPricesRaw from './cardtrader_prices.json';
import cardmarketPricesRaw from './cardmarket_prices.json';
import marketTrendsRaw from './market_trends.json';
import { Card, CardVariant, RawCardPrint, Tournament, ParsedDecklist, MetaTier, MetaLeaderSummary, MarketTrendItem } from '../types';
import { parseDecklistString } from '../utils/cardUtils';

export interface CardTraderPriceRecord {
  blueprint_id: number;
  lowest_eur: number;
  avg_eur: number;
  listings_count: number;
  url: string;
}

export interface CardmarketPriceRecord {
  idProduct: number;
  trend_eur: number;
  low_eur: number;
  avg_eur: number;
  foil_trend_eur?: number;
  url: string;
}

export interface CardTraderCardInfo {
  card_code: string;
  name: string;
  primary_blueprint_id: number;
  cardtrader_url: string;
  blueprints: {
    id: number;
    name: string;
    version?: string | null;
    expansion_id?: number;
    expansion_name?: string;
    rarity?: string;
    collector_number?: string;
    url: string;
    image_url?: string;
  }[];
}

export const allCards: Card[] = cardsDataRaw as unknown as Card[];
export const allVariants: CardVariant[] = variantsDataRaw as unknown as CardVariant[];
export const allRawCards: RawCardPrint[] = completeDatabaseRaw as unknown as RawCardPrint[];
export const cardtraderMapping: Record<string, CardTraderCardInfo> = cardtraderMappingRaw as unknown as Record<string, CardTraderCardInfo>;
export const cardtraderPrices: Record<string, CardTraderPriceRecord> = cardtraderPricesRaw as unknown as Record<string, CardTraderPriceRecord>;
export const cardmarketPrices: Record<string, CardmarketPriceRecord> = cardmarketPricesRaw as unknown as Record<string, CardmarketPriceRecord>;
export const allMarketTrends: MarketTrendItem[] = marketTrendsRaw as unknown as MarketTrendItem[];

export const marketTrendsByCode = new Map<string, MarketTrendItem>();
for (const item of allMarketTrends) {
  if (item && item.card_code) {
    marketTrendsByCode.set(item.card_code.toUpperCase(), item);
  }
}

export function getMarketTrendByCode(code: string): MarketTrendItem | undefined {
  if (!code) return undefined;
  return marketTrendsByCode.get(code.trim().toUpperCase());
}

export const rawCardsById = new Map<string, RawCardPrint>();
for (const item of allRawCards) {
  if (item && item.id) {
    rawCardsById.set(item.id.toUpperCase(), item);
  }
}

export function getRawCardById(id: string): RawCardPrint | undefined {
  if (!id) return undefined;
  return rawCardsById.get(id.toUpperCase().trim());
}

export function getCardtraderCardInfo(code: string): CardTraderCardInfo | undefined {
  if (!code) return undefined;
  return cardtraderMapping[code.trim().toUpperCase()];
}

export function getCardtraderPriceRecord(code: string): CardTraderPriceRecord | undefined {
  if (!code) return undefined;
  return cardtraderPrices[code.trim().toUpperCase()];
}

/**
 * Parse any tournament date string into a numeric timestamp for precise sorting
 */
export function parseTournamentDateToTimestamp(dateStr?: string): number {
  if (!dateStr) return 0;
  const clean = String(dateStr).trim();

  // Pattern 1: M/D/YYYY or MM/DD/YYYY or M-D-YYYY
  const usMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (usMatch) {
    const month = parseInt(usMatch[1], 10) - 1;
    const day = parseInt(usMatch[2], 10);
    const year = parseInt(usMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  // Pattern 2: YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  const ts = Date.parse(clean);
  return isNaN(ts) ? 0 : ts;
}

/**
 * Format a tournament date into a clean, localized date format (DD/MM/YYYY)
 */
export function formatTournamentDate(dateStr?: string): string {
  if (!dateStr) return 'Date N/A';
  const ts = parseTournamentDateToTimestamp(dateStr);
  if (!ts) return dateStr;
  
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export const gameData = gamedataRaw;

// Quick lookup maps
export const cardsByCode = new Map<string, Card>();
export const variantsByCode = new Map<string, CardVariant[]>();

// Populate maps
for (const card of allCards) {
  if (card && card.card_code) {
    cardsByCode.set(card.card_code.toUpperCase(), card);
  }
}

for (const variant of allVariants) {
  if (variant && variant.card_code) {
    const code = variant.card_code.toUpperCase();
    if (!variantsByCode.has(code)) {
      variantsByCode.set(code, []);
    }
    variantsByCode.get(code)!.push(variant);
  }
}

// Variant lookup map by image path
const variantLookupMap = new Map<string, CardVariant>();
for (const v of allVariants) {
  if (v && v.image_path) {
    const cleanImg = v.image_path.toLowerCase().replace(/\.(webp|png|jpg)$/i, '');
    variantLookupMap.set(cleanImg, v);
  }
}

// Convert all raw prints to Card objects with full metadata
export const allPrintsAsCards: Card[] = allRawCards.map(raw => {
  const codeMatch = raw.card_code || raw.id.match(/([A-Z0-9]{2,4}-[0-9]{3,4})/i)?.[1] || raw.id.split('_')[0].split('-r')[0];
  const baseCode = (codeMatch || 'OP').toUpperCase();
  const setCodeMatch = baseCode.match(/^([A-Z0-9]+)-/);
  const setCode = setCodeMatch ? setCodeMatch[1] : (raw.id.split('-')[0] || 'OP');
  const existing = cardsByCode.get(baseCode);

  let category: any = 'Character';
  const tUpper = (raw.type || '').toUpperCase();
  if (tUpper.includes('LEADER')) category = 'Leader';
  else if (tUpper.includes('EVENT')) category = 'Event';
  else if (tUpper.includes('STAGE')) category = 'Stage';

  const cost = raw.cost && raw.cost !== '-' && !isNaN(parseInt(raw.cost)) ? parseInt(raw.cost, 10) : (existing?.cost ?? null);
  const power = raw.power && raw.power !== '-' && !isNaN(parseInt(raw.power)) ? parseInt(raw.power, 10) : (existing?.power ?? null);
  const counter = raw.counter && raw.counter !== '-' && !isNaN(parseInt(raw.counter)) ? parseInt(raw.counter, 10) : (existing?.counter ?? 0);
  const defaultImg = raw.image_url || (raw.id.endsWith('.png') ? raw.id : raw.id + '.png');
  const imgFilename = raw.id.endsWith('.png') ? raw.id : raw.id + '.png';
  const cleanImg = raw.id.toLowerCase().replace(/\.(webp|png|jpg)$/i, '');
  const vMatch = variantLookupMap.get(cleanImg);

  const officialRarity = raw.rarity || existing?.rarity || 'C';
  let variantType = 'BASE';
  let variantLabel = 'Base';
  if (vMatch?.variant_label) {
    variantLabel = vMatch.variant_label;
    if (vMatch.variant_label.includes('Manga')) variantType = 'MANGA';
    else if (vMatch.variant_label.includes('SP') || vMatch.variant_label.includes('Special')) variantType = 'SP';
    else if (vMatch.variant_label.includes('Parallel') || vMatch.variant_label.includes('Alternate')) variantType = 'ALT';
    else if (vMatch.variant_label.includes('Winner')) variantType = 'WINNER';
  } else if (cleanImg.includes('manga')) {
    variantType = 'MANGA';
    variantLabel = 'Manga Rare 👑';
  } else if (cleanImg.includes('_sp') || cleanImg.includes('sp')) {
    variantType = 'SP';
    variantLabel = 'Special Card (SP) ⭐';
  } else if (cleanImg.includes('_p')) {
    variantType = 'ALT';
    variantLabel = 'Alternate Art ✨';
  }

  return {
    id: raw.id,
    card_code: baseCode,
    set_code: setCode,
    name: raw.name || existing?.name || baseCode,
    name_fr: raw.name_fr || existing?.name_fr,
    jp_name: raw.name_jp || existing?.jp_name,
    category,
    rarity: officialRarity,
    variant_type: variantType,
    variant_label: variantLabel,
    color: Array.isArray(raw.color) && raw.color.length > 0 ? raw.color : (existing?.color || ['Red']),
    cost,
    power,
    counter,
    type: Array.isArray(raw.types) && raw.types.length > 0 ? raw.types.filter(Boolean) : (existing?.type || []),
    attribute: raw.attribute || existing?.attribute || '',
    trigger: raw.trigger || existing?.trigger || '',
    effect: raw.effect || existing?.effect || '',
    effect_fr: existing?.effect_fr,
    language: (raw.language || (raw.id.startsWith('fr-') ? 'fr' : (raw.id.startsWith('jp-') ? 'jp' : 'en'))).toLowerCase(),
    price_eur: raw.price_eur !== undefined && raw.price_eur !== null 
      ? raw.price_eur 
      : (vMatch?.price_eur || existing?.price_eur),
    price_min_eur: (raw.price_min_eur !== undefined && raw.price_min_eur !== null) 
      ? raw.price_min_eur 
      : (raw.price_eur !== undefined && raw.price_eur !== null 
          ? raw.price_eur 
          : (vMatch?.price_min_eur || vMatch?.price_eur || existing?.price_min_eur)),
    price_avg7_eur: raw.price_avg7_eur !== undefined && raw.price_avg7_eur !== null ? raw.price_avg7_eur : (vMatch?.price_avg7_eur || existing?.price_avg7_eur),
    price_avg30_eur: raw.price_avg30_eur !== undefined && raw.price_avg30_eur !== null ? raw.price_avg30_eur : (vMatch?.price_avg30_eur || existing?.price_avg30_eur),
    listings_count: raw.listings_count !== undefined && raw.listings_count !== null ? raw.listings_count : (vMatch?.listings_count || existing?.listings_count),
    scalpeurs_image_url: raw.image_url || existing?.scalpeurs_image_url,
    cardmarket_url: (raw as any).cardmarket_url || vMatch?.cardmarket_url || existing?.cardmarket_url,
    detail_file: (raw as any).detail_file || (vMatch as any)?.detail_file || (raw.id.match(/-([2-9])-(\d+)$/) ? `${baseCode}-v${raw.id.match(/-([2-9])-(\d+)$/)![1]}.json` : ((existing as any)?.detail_file || (baseCode ? `${baseCode}.json` : undefined))),
    _imagePaths: [defaultImg, imgFilename, ...(existing?._imagePaths || [])].filter((v, i, a) => a.indexOf(v) === i),
    _defaultImagePath: defaultImg
  };
}).sort((a, b) => {
  if (a.card_code !== b.card_code) {
    return a.card_code > b.card_code ? 1 : -1;
  }

  const isBaseA = !a.id.includes('_') && !a.id.includes('-r');
  const isBaseB = !b.id.includes('_') && !b.id.includes('-r');
  if (isBaseA && !isBaseB) return -1;
  if (!isBaseA && isBaseB) return 1;

  return a.id > b.id ? 1 : (a.id < b.id ? -1 : 0);
});

/**
 * Normalizes any variation of an OPTCG card code
 * e.g. "op1-4" -> "OP01-004", "OP17 39" -> "OP17-039", "p-1" -> "P-001"
 */
export function normalizeCardCode(input: string): string {
  if (!input) return '';
  const clean = input.trim().toUpperCase().replace(/[\s_.:]+/g, '-');
  
  // Format: P-001, P1, P-1, P001
  const pMatch = clean.match(/^P-?(\d{1,3})$/);
  if (pMatch) {
    return `P-${pMatch[1].padStart(3, '0')}`;
  }

  // Format: OP01-001, OP1-1, OP17-39, ST01-001, EB01-001, PRB01-001, OP14014
  const m = clean.match(/^([A-Z]{2,3})-?(\d{1,2})-?(\d{1,3})$/);
  if (m) {
    const prefix = m[1];
    const setNum = m[2].padStart(2, '0');
    const cardNum = m[3].padStart(3, '0');
    return `${prefix}${setNum}-${cardNum}`;
  }

  return clean;
}

export function getCardByCode(code: string): Card | undefined {
  if (!code) return undefined;
  const clean = code.trim().toUpperCase().replace(/\.(WEBP|PNG|JPG|JPEG)$/i, '');
  const baseCode = clean.split('_')[0].split('-R')[0];

  let found = cardsByCode.get(clean);
  if (!found) {
    found = cardsByCode.get(baseCode);
  }
  if (!found) {
    const normalized = normalizeCardCode(baseCode || code);
    found = cardsByCode.get(normalized);
  }

  if (found && clean !== found.card_code.toUpperCase()) {
    const matchingImg = (found._imagePaths || []).find(img => 
      img.toLowerCase().replace(/\.(webp|png|jpg|jpeg)$/i, '') === clean.toLowerCase()
    ) || `${clean.toLowerCase()}.png`;

    return {
      ...found,
      _defaultImagePath: matchingImg
    };
  }

  return found;
}

export function getVariantsByCode(code: string): CardVariant[] {
  if (!code) return [];
  const clean = code.trim().toUpperCase();
  const direct = variantsByCode.get(clean);
  if (direct && direct.length > 0) return direct;

  const baseCode = clean.split('_')[0].split('-R')[0].replace(/\.(WEBP|PNG|JPG)$/i, '');
  const baseDirect = variantsByCode.get(baseCode);
  if (baseDirect && baseDirect.length > 0) return baseDirect;

  const normalized = normalizeCardCode(baseCode || code);
  return variantsByCode.get(normalized) || [];
}

// Available Set Groups in order
export const availableSetGroups: string[] = [
  'OP18', 'OP17', 'OP16', 'OP15', 'OP14', 'OP13', 'OP12', 'OP11', 'OP10',
  'OP09', 'OP08', 'OP07', 'OP06', 'OP05', 'OP04', 'OP03', 'OP02', 'OP01',
  'EB05', 'EB04', 'EB03', 'EB02', 'EB01',
  'PRB02', 'PRB01',
  'P'
];

export const allSetsList: string[] = [
  ...availableSetGroups,
  'ST01', 'ST02', 'ST03', 'ST04', 'ST05', 'ST06', 'ST07', 'ST08', 'ST09', 'ST10',
  'ST11', 'ST12', 'ST13', 'ST14', 'ST15', 'ST16', 'ST17', 'ST18', 'ST19', 'ST20',
  'ST21', 'ST22', 'ST23', 'ST24', 'ST25', 'ST26', 'ST27', 'ST28', 'ST29', 'ST30',
  'ST31', 'ST32', 'ST33', 'ST34', 'ST35', 'ST36'
];

