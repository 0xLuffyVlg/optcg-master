/**
 * Card Details Service - High-Speed Lazy-Loading Micro-Fiches
 * Provides on-demand loading of individual card and variant JSON fiches (~500B to 1.8KB)
 * from `/data/details/` with client-side in-memory caching.
 */

export interface CardDetailVariant {
  variant_index: number;
  variant_version: string;
  name: string;
  rarity?: string;
  price_eur?: number | null;
  cardmarket_url?: string | null;
  file: string;
}

export interface CardDetailData {
  code: string;
  variant_version?: string;
  variant_index?: number;
  name: string;
  variant_name?: string;
  category?: string;
  cost?: number | null;
  power?: number | null;
  counter?: number | null;
  life?: number | null;
  attribute?: string | null;
  types?: string | null;
  effect?: string | null;
  trigger?: string | null;
  illust?: string | null;
  color?: string | null;
  rarity?: string | null;
  block?: number | null;
  language?: string;
  image_path?: string | null;
  image_url?: string | null;
  price_eur?: number | null;
  price_usd?: number | null;
  cardmarket_url?: string | null;
  cardmarket_url_jp?: string | null;
  tcgplayer_url?: string | null;
  pricecharting_url?: string | null;
  all_variants?: CardDetailVariant[];
}

// In-memory cache for ultra-fast instant lookups (<1ms)
const detailCache = new Map<string, CardDetailData>();
const pendingRequests = new Map<string, Promise<CardDetailData | null>>();

/**
 * Normalizes a filename or code for cache lookup
 */
function normalizeKey(key: string): string {
  return key.trim().toUpperCase().replace(/\.JSON$/i, '');
}

/**
 * Synchronous lookup in local cache
 */
export function getCardDetailSync(key: string): CardDetailData | null {
  if (!key) return null;
  return detailCache.get(normalizeKey(key)) || null;
}

/**
 * Fetches the dedicated micro-fiche JSON for a card or variant on demand.
 * Example keys: "ST21-015-v1.json", "ST21-015-v2.json", "ST21-015", "OP09-001"
 */
export async function fetchCardDetail(fileNameOrCode: string): Promise<CardDetailData | null> {
  if (!fileNameOrCode) return null;

  const rawKey = fileNameOrCode.trim();
  const normKey = normalizeKey(rawKey);

  // 1. Check memory cache
  if (detailCache.has(normKey)) {
    return detailCache.get(normKey)!;
  }

  // 2. Prevent duplicate in-flight network requests
  if (pendingRequests.has(normKey)) {
    return pendingRequests.get(normKey)!;
  }

  const promise = (async (): Promise<CardDetailData | null> => {
    // Determine file candidates to try
    let candidateFiles: string[] = [];

    if (rawKey.toLowerCase().endsWith('.json')) {
      candidateFiles.push(rawKey);
    } else {
      // It's a code or variant identifier, e.g. "ST21-015" or "ST21-015-v1"
      candidateFiles.push(`${rawKey}.json`);
      if (!rawKey.toLowerCase().includes('-v')) {
        candidateFiles.push(`${rawKey}-v1.json`);
      }
    }

    for (const file of candidateFiles) {
      try {
        const cleanFileName = file.split('/').pop()?.split('\\').pop() || file;
        const res = await fetch(`/data/details/${cleanFileName}`, {
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          const data: CardDetailData = await res.json();
          if (data && data.code) {
            // Cache by original requested key, by data.code, and by file name
            detailCache.set(normKey, data);
            detailCache.set(normalizeKey(data.code), data);
            if (data.variant_version) {
              detailCache.set(normalizeKey(`${data.code}-${data.variant_version}`), data);
            }
            detailCache.set(normalizeKey(cleanFileName), data);
            return data;
          }
        }
      } catch (err) {
        // Silently continue to next candidate
      }
    }

    return null;
  })().finally(() => {
    pendingRequests.delete(normKey);
  });

  pendingRequests.set(normKey, promise);
  return promise;
}
