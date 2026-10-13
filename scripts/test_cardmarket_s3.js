async function testS3Cardmarket() {
  const url = 'https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_18.json';
  console.log(`Fetching ${url}...`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json'
      }
    });

    console.log(`Status: ${res.status} ${res.statusText}`);
    console.log(`Headers:`, Object.fromEntries(res.headers.entries()));

    if (res.ok) {
      const text = await res.text();
      console.log(`Length: ${text.length} bytes`);
      console.log(`Preview:`, text.slice(0, 500));
      try {
        const json = JSON.parse(text);
        if (Array.isArray(json)) {
          console.log(`Total items in array: ${json.length}`);
          console.log(`Sample item 0:`, json[0]);
          console.log(`Sample item 1:`, json[1]);
        } else {
          console.log(`Keys:`, Object.keys(json));
          const firstKey = Object.keys(json)[0];
          console.log(`Sample entry ${firstKey}:`, json[firstKey]);
        }
      } catch (e) {
        console.log('Error parsing JSON:', e.message);
      }
    }
  } catch (e) {
    console.log('Fetch error:', e.message);
  }
}

testS3Cardmarket();
