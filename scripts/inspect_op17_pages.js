import fs from 'fs';

async function testFetch(url, name) {
  console.log(`Fetching ${name} from ${url}...`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      }
    });
    console.log(`Status: ${res.status} ${res.statusText}`);
    const html = await res.text();
    fs.writeFileSync(`scripts/${name}.html`, html);
    console.log(`Saved ${name}.html (${html.length} bytes)`);

    // Let's look for tables or tablepress or entry-content
    const tables = [...html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi)];
    console.log(`Found ${tables.length} tables in ${name}`);

    // Check table headers
    for (let i = 0; i < tables.length; i++) {
      const ths = [...tables[i][1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
      console.log(`Table ${i} THs:`, ths);
      const trs = [...tables[i][1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
      console.log(`Table ${i} TR count:`, trs.length);
    }
  } catch (err) {
    console.error(`Error fetching ${name}:`, err);
  }
}

async function run() {
  await testFetch('https://onepiecetopdecks.com/deck-list/japan-op17-deck-list-the-worlds-strongest-warriors/', 'japan_op17');
  await testFetch('https://onepiecetopdecks.com/deck-list/english-op17-deck-list-the-worlds-strongest-warriors/', 'english_op17');
}

run();
