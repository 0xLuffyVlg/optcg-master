function generatePriceHistory(card, timeframe = '30d') {
  const currentPrice = card.price_min_eur || card.price_eur || 1.4;
  const a7 = card.price_avg7_eur || currentPrice * 1.05;
  const a30 = card.price_avg30_eur || a7 * 1.08;
  const v7 = card.v7 !== undefined ? card.v7 : ((currentPrice - a7) / a7) * 100;

  const days = timeframe === '7d' ? 7 : (timeframe === '90d' ? 90 : 30);
  const points = [];
  const now = new Date('2026-10-01T10:00:00Z');

  // Pseudo-random deterministic noise based on card code
  let seed = 0;
  const code = card.card_code || 'OP01-001';
  for (let i = 0; i < code.length; i++) seed = (seed * 31 + code.charCodeAt(i)) % 10000;

  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Progress from 0 (days ago) to 1 (today)
    const t = (days - i) / days;

    // Anchor points:
    // When i > 7: interpolate between a30 and a7
    // When i <= 7: interpolate between a7 and currentPrice
    let baseVal;
    if (i > 7) {
      const subT = (days - i) / (days - 7);
      baseVal = a30 + (a7 - a30) * subT;
    } else {
      const subT = (7 - i) / 7;
      baseVal = a7 + (currentPrice - a7) * subT;
    }

    // Add gentle smooth variation
    const noise = Math.sin(i * 0.8 + seed) * (baseVal * 0.015);
    const val = i === 0 ? currentPrice : Math.max(0.02, Math.round((baseVal + noise) * 100) / 100);

    points.push({ date: dateStr, price: val });
  }

  const startPrice = points[0].price;
  const diff = currentPrice - startPrice;
  const changePercent = Math.round((diff / (startPrice || 1)) * 1000) / 10;

  return {
    timeframe,
    points,
    currentPrice,
    startPrice,
    changePercent,
    changeEur: Math.round(diff * 100) / 100,
    min: Math.min(...points.map(p => p.price)),
    max: Math.max(...points.map(p => p.price))
  };
}

// Test with ST36-005
const st36 = {
  card_code: 'ST36-005',
  price_min_eur: 1.4,
  price_eur: 2.31,
  price_avg7_eur: 2.38,
  price_avg30_eur: 2.14,
  v7: -6.7
};

console.log('ST36-005 30d history:', generatePriceHistory(st36, '30d'));
console.log('ST36-005 7d history:', generatePriceHistory(st36, '7d'));
