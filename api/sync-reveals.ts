import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('[REVEALS SYNC] Checking OnePieceTopDecks leaks feed...');

    const feedRes = await fetch('https://onepiecetopdecks.com/feed/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      }
    });

    if (!feedRes.ok) {
      return res.status(502).json({ success: false, error: 'Feed unavailable' });
    }

    const xml = await feedRes.text();
    const itemMatches = [...xml.matchAll(/<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<\/item>/gi)];

    const leakArticles = [];
    for (const m of itemMatches) {
      const title = m[1].replace(/<!\[CDATA\[(.*?)\]\]>/gi, '$1').trim();
      const link = m[2].trim();
      if (title.toLowerCase().includes('leak') || title.includes('OP-') || title.includes('EB-')) {
        leakArticles.push({ title, link });
      }
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      source: 'OnePieceTopDecks Feed',
      leaksFound: leakArticles.length,
      articles: leakArticles
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
}
