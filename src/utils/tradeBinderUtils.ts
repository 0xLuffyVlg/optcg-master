import { Card, TradeBinderItem, TradeBinderShareData } from '../types';
import { allCards, getCardByCode } from '../data/dataProvider';
import { getCardPriceForArtwork } from '../services/cardmarketPriceService';

/**
 * Scan collection and extract duplicates
 * @param collection Map of storage keys -> count
 * @param threshold Mode threshold (1 for spare copies, 4 for surplus playsets)
 */
export function computeDuplicatesFromCollection(
  collection: Record<string, number>,
  threshold: number = 1
): TradeBinderItem[] {
  const items: TradeBinderItem[] = [];

  for (const [key, count] of Object.entries(collection)) {
    if (typeof count !== 'number' || count <= threshold) continue;

    const isAlt = key.includes('__');
    const cardCode = isAlt ? key.split('__')[0] : key;
    const artworkKey = isAlt ? key.split('__')[1] : undefined;

    const card = getCardByCode(cardCode);
    if (!card) continue;

    const priceObj = getCardPriceForArtwork(card, artworkKey);
    const availableForTrade = count - threshold;

    items.push({
      cardCode,
      artworkKey,
      card,
      totalOwned: count,
      tradeQuantity: availableForTrade,
      priceEur: priceObj.priceEur,
      condition: 'Near Mint',
      language: card.is_japanese ? 'JP' : 'EN',
      forTrade: true
    });
  }

  // Sort by price descending (highest value first)
  items.sort((a, b) => b.priceEur - a.priceEur);
  return items;
}

/**
 * Encode trade binder data into a compressed URL-safe string
 */
export function encodeTradeBinderToUrl(data: TradeBinderShareData): string {
  try {
    const compactPayload = {
      o: data.ownerName,
      t: Date.now(),
      d: data.contactDiscord,
      e: data.contactEmail,
      n: data.notes,
      i: data.items.map(item => [
        item.cardCode,
        item.qty,
        item.priceEur,
        item.artworkKey || '',
        item.cond || 'NM',
        item.lang || 'EN'
      ])
    };

    const json = JSON.stringify(compactPayload);
    // Base64 encode safe for URL
    const b64 = btoa(encodeURIComponent(json));
    return b64;
  } catch (e) {
    console.error('Error encoding trade binder:', e);
    return '';
  }
}

/**
 * Decode trade binder data from a URL parameter
 */
export function decodeTradeBinderFromUrl(encodedStr: string): TradeBinderShareData | null {
  try {
    if (!encodedStr) return null;
    const json = decodeURIComponent(atob(encodedStr));
    const raw = JSON.parse(json);

    if (!raw || !Array.isArray(raw.i)) return null;

    const items = raw.i.map((arr: any[]) => ({
      cardCode: String(arr[0] || '').toUpperCase(),
      qty: Number(arr[1] || 1),
      priceEur: Number(arr[2] || 0.25),
      artworkKey: arr[3] ? String(arr[3]) : undefined,
      cond: arr[4] ? String(arr[4]) : 'Near Mint',
      lang: arr[5] ? String(arr[5]) : 'EN'
    }));

    return {
      ownerName: raw.o || 'Joueur OPTCG',
      updatedAt: raw.t ? new Date(raw.t).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
      contactDiscord: raw.d,
      contactEmail: raw.e,
      notes: raw.n,
      items
    };
  } catch (e) {
    console.error('Error decoding trade binder:', e);
    return null;
  }
}

/**
 * Generate formatted Discord trade post
 */
export function generateDiscordTradePost(
  ownerName: string,
  items: TradeBinderItem[],
  totalValueEur: number,
  shareUrl: string,
  contactDiscord?: string
): string {
  const topItems = items.slice(0, 8);
  const totalCards = items.reduce((sum, i) => sum + i.tradeQuantity, 0);

  let msg = `🏴‍☠️ **CLASSEUR D'ÉCHANGES ONE PIECE TCG — ${ownerName.toUpperCase()}**
`;
  msg += `📦 **${totalCards} cartes à l'échange** (${items.length} références) | Valeur estimée : **${totalValueEur.toFixed(2)} €**
`;
  if (shareUrl) {
    msg += `🔗 **Voir le classeur complet interactif :** ${shareUrl}
`;
  }
  msg += `
✨ **TOP CARTES DISPONIBLES :**
`;

  for (const item of topItems) {
    const artLabel = item.artworkKey ? ' (Alt Art)' : '';
    msg += `• ${item.tradeQuantity}x **${item.card.name}** (${item.card.card_code}${artLabel}) [${item.card.rarity}] ~ **${item.priceEur.toFixed(2)} €**
`;
  }

  if (items.length > 8) {
    msg += `... et ${items.length - 8} autres cartes à découvrir sur le lien !
`;
  }

  if (contactDiscord) {
    msg += `
💬 **Contact Discord :** ${contactDiscord}`;
  } else {
    msg += `
💬 *Envoyez-moi un MP pour discuter des échanges !*`;
  }

  return msg;
}

/**
 * Generate CSV text for export
 */
export function generateTradeCsv(items: TradeBinderItem[]): string {
  const headers = ['Code', 'Nom', 'Rareté', 'Couleur', 'Quantité', 'Prix Unitaire EUR', 'Valeur Totale EUR', 'Langue', 'État'];
  const rows = items.map(i => [
    i.cardCode,
    `"${i.card.name.replace(/"/g, '""')}"`,
    i.card.rarity,
    `"${(i.card.color || []).join('/')}"`,
    i.tradeQuantity,
    i.priceEur.toFixed(2),
    (i.priceEur * i.tradeQuantity).toFixed(2),
    i.language,
    i.condition
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
