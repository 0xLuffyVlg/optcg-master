async function testSinglesList() {
  const url = 'https://downloads.s3.cardmarket.com/productCatalog/productList/products_singles_18.json';
  console.log(`Fetching ${url}...`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    console.log(`Status: ${res.status} ${res.statusText}`);
    if (res.ok) {
      const text = await res.text();
      console.log(`Length: ${text.length} bytes`);
      console.log(`Preview:`, text.slice(0, 500));
      const json = JSON.parse(text);
      console.log(`Keys:`, Object.keys(json));
      if (json.products) {
        console.log(`Total singles products: ${json.products.length}`);
        console.log(`Sample product 0:`, json.products[0]);
        console.log(`Sample product 1:`, json.products[1]);
      }
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}

testSinglesList();
