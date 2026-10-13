import fs from 'fs';
import path from 'path';

async function testFullCardmarketSync() {
  console.log('--- TEST OFFICIAL CARDMARKET SYNC (S3) ---');
  
  // 1. Fetch products
  console.log('1. Fetching products_singles_18.json...');
  const prodRes = await fetch('https://downloads.s3.cardmarket.com/productCatalog/productList/products_singles_18.json');
  const prodData = await prodRes.json();
  console.log(`Loaded ${prodData.products?.length} products.`);

  // 2. Fetch prices
  console.log('2. Fetching price_guide_18.json...');
  const priceRes = await fetch('https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_18.json');
  const priceData = await priceRes.json();
  console.log(`Loaded ${priceData.priceGuides?.length} price guides.`);

  // Create product id -> card code map
  const productCodeMap = new Map();
  for (const p of prodData.products || []) {
    const match = (p.name || '').match(/\((OP\d{2}-\d{3}[A-Za-z0-9_-]*|EB\d{2}-\d{3}[A-Za-z0-9_-]*|ST\d{2}-\d{3}[A-Za-z0-9_-]*|P-\d{3}[A-Za-z0-9_-]*)\)/i) ||
                  (p.name || '').match(/(OP\d{2}-\d{3}|EB\d{2}-\d{3}|ST\d{2}-\d{3}|P-\d{3})/i);
    if (match) {
      const code = match[1].toUpperCase();
      productCodeMap.set(p.idProduct, {
        code,
        name: p.name,
        isAltArt: (p.name || '').toLowerCase().includes('v.2') || (p.name || '').toLowerCase().includes('alternate')
      });
    }
  }

  console.log(`Mapped ${productCodeMap.size} products to One Piece card codes.`);

  // Group prices by card code
  const pricesByCode = new Map();
  for (const pg of priceData.priceGuides || []) {
    const prodInfo = productCodeMap.get(pg.idProduct);
    if (prodInfo) {
      const code = prodInfo.code;
      const trend = pg.trend || pg.avg || 0.5;
      const low = pg.low || trend * 0.8;
      const avg = pg.avg || trend;

      if (!pricesByCode.has(code) || (trend > 0 && !prodInfo.isAltArt)) {
        pricesByCode.set(code, {
          code,
          low: Math.round(low * 100) / 100,
          trend: Math.round(trend * 100) / 100,
          avg: Math.round(avg * 100) / 100,
          idProduct: pg.idProduct,
          productName: prodInfo.name
        });
      }
    }
  }

  console.log(`Total unique One Piece card codes with real Cardmarket prices: ${pricesByCode.size}`);

  // Test some famous cards
  const samples = ['OP01-001', 'OP01-016', 'OP01-025', 'OP17-039', 'OP05-060', 'EB01-006', 'ST01-001'];
  for (const s of samples) {
    console.log(`Sample ${s}:`, pricesByCode.get(s));
  }
}

testFullCardmarketSync();
