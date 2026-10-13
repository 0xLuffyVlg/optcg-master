async function testGumGum() {
  try {
    const res = await fetch('https://gumgum.gg/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      }
    });
    console.log('GumGum status:', res.status);
    const html = await res.text();
    const rscChunks = [...html.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g)].map(m => m[1]);
    console.log('RSC chunks count:', rscChunks.length);
    let combined = '';
    for (const chunk of rscChunks) {
      try {
        combined += JSON.parse(`"${chunk}"`);
      } catch (e) {
        combined += chunk;
      }
    }
    const deckRegex = /\{"id":\s*"([0-9a-f-]{36})"[^}]*?"set":\s*"([^"]+)"[^}]*?"date":\s*"([^"]+)"[^}]*?"author":\s*"([^"]+)"[^}]*?"placement":\s*(\d+)[^}]*?"leader_id":\s*"([^"]+)"[^}]*?"decklist":\s*"([^"]+)"[^}]*\}/g;
    const matches = [...combined.matchAll(deckRegex)];
    console.log('Matches:', matches.length);
    if (matches.length > 0) {
      console.log('Sample match date:', matches[0][3], matches[0][4], matches[0][6]);
    }
  } catch (err) {
    console.error('GumGum error:', err.message);
  }
}
testGumGum();
