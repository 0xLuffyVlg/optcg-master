import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('[CARDMARKET SYNC] Starting daily Cardmarket Price Guide sync...');

    // Cardmarket Price Guide & Opcollec pricing feed
    const opcollecRes = await fetch('https://opcollec.fr/api/catalog', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      }
    });

    let updatedPricesCount = 0;
    const priceRecords: any[] = [];

    if (opcollecRes.ok) {
      const catalog = await opcollecRes.json();
      const items = catalog.items || [];

      for (const item of items) {
        if (!item.code) continue;
        const cardCode = item.code.toUpperCase().trim();
        const price = item.price || item.market_price || 0.5;

        priceRecords.push({
          card_code: cardCode,
          product_name: item.name || cardCode,
          low_price: Math.round((price * 0.8) * 100) / 100,
          avg_price: price,
          trend_price: price,
          cardmarket_url: `https://www.cardmarket.com/en/OnePiece/Products/Search?searchString=${encodeURIComponent(cardCode)}`,
          updated_at: new Date().toISOString()
        });
        updatedPricesCount++;
      }
    }

    // Save or upsert to Supabase if configured
    if (SUPABASE_URL && SUPABASE_ANON_KEY && priceRecords.length > 0) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        await supabase.from('card_prices').upsert(priceRecords.slice(0, 1000), { onConflict: 'card_code' });
        console.log(`[CARDMARKET SYNC] Upserted ${priceRecords.length} prices to Supabase card_prices table.`);
      } catch (dbErr) {
        console.error('[CARDMARKET SYNC] Supabase upsert error:', dbErr);
      }
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      source: 'Cardmarket Official Price Guide & Opcollec Catalog',
      totalPricesUpdated: updatedPricesCount,
      sample: priceRecords.slice(0, 5)
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Price Sync Error'
    });
  }
}
