async function testProductCatalogUrls() {
  const candidates = [
    'https://downloads.s3.cardmarket.com/productCatalog/productCatalog/product_catalog_18.json',
    'https://downloads.s3.cardmarket.com/productCatalog/product_catalog_18.json',
    'https://downloads.s3.cardmarket.com/productCatalog/products_18.json',
    'https://downloads.s3.cardmarket.com/productCatalog/productCatalogue/product_catalogue_18.json',
    'https://downloads.s3.cardmarket.com/productCatalog/productCatalog/products_18.json',
    'https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_18.json.gz',
    'https://downloads.s3.cardmarket.com/productCatalog/productCatalog/product_catalog_18.json.gz',
    'https://downloads.s3.cardmarket.com/productCatalog/products_18.csv',
    'https://downloads.s3.cardmarket.com/productCatalog/productCatalog/products_18.csv.gz'
  ];

  for (const u of candidates) {
    try {
      const res = await fetch(u, { method: 'HEAD' });
      console.log(`[${res.status}] ${u}`);
    } catch (e) {
      console.log(`[ERR] ${u}: ${e.message}`);
    }
  }
}

testProductCatalogUrls();
