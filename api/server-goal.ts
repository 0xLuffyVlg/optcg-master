import type { VercelRequest, VercelResponse } from '@vercel/node';

// Default initial state (Real metrics)
let liveStats = {
  goal: 15,
  current: 0,
  month: 'Septembre 2026',
  paypalHandle: 'OptcgMaster',
  paypalUrl: 'https://paypal.me/OptcgMaster',
  kofiHandle: 'optcgmaster',
  kofiUrl: 'https://ko-fi.com/optcgmaster',
  donorsCount: 0,
  updatedAt: new Date().toISOString()
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: liveStats
    });
  }

  if (req.method === 'POST') {
    const { amount, adminKey } = req.body || {};
    // Admin password or valid update
    if (adminKey === 'optcg2026' || adminKey === process.env.ADMIN_KEY) {
      if (typeof amount === 'number') {
        liveStats.current = Math.max(0, amount);
        liveStats.updatedAt = new Date().toISOString();
        return res.status(200).json({ success: true, data: liveStats });
      }
    }
    return res.status(403).json({ error: 'Non autorisé' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
