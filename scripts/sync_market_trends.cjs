const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const trendsPath = path.join(DATA_DIR, 'market_trends.json');
const ctPricesPath = path.join(DATA_DIR, 'cardtrader_prices.json');
const cmPricesPath = path.join(DATA_DIR, 'cardmarket_prices.json');
const cardsPath = path.join(DATA_DIR, 'cards.json');

const trends = JSON.parse(fs.readFileSync(trendsPath, 'utf8'));
const ctPrices = JSON.parse(fs.readFileSync(ctPricesPath, 'utf8'));
const cmPrices = JSON.parse(fs.readFileSync(cmPricesPath, 'utf8'));
const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));

const cardMap = new Map();
cards.forEach(c => cardMap.set(c.card_code.toUpperCase(), c));

const updatedTrends = trends.map(t => {
  const code = (t.card_code || '').toUpperCase().trim();
  const ct = ctPrices[code];
  const cm = cmPrices[code];

  let currentPrice = t.current_price_eur;
  if (cm && cm.trend_eur > 0) {
    currentPrice = cm.trend_eur;
  } else if (ct && ct.lowest_eur > 0) {
    currentPrice = ct.lowest_eur;
  }

  let ctUrl = t.cardtrader_url;
  if (ct && ct.url) {
    ctUrl = ct.url;
  }

  let cmUrl = t.cardmarket_url;
  if (cm && cm.url) {
    cmUrl = cm.url;
  }

  return {
    ...t,
    current_price_eur: currentPrice,
    cardtrader_url: ctUrl,
    cardmarket_url: cmUrl
  };
});

fs.writeFileSync(trendsPath, JSON.stringify(updatedTrends, null, 2), 'utf8');
console.log('Successfully updated market_trends.json with ' + updatedTrends.length + ' accurate items!');
