import fs from 'fs';

async function checkTcgMatchmaking() {
  try {
    const jsRes = await fetch('https://stats.tcgmatchmaking.com/assets/index-B3ue8fbf.js');
    if (jsRes.ok) {
      const js = await jsRes.text();
      console.log('JS length:', js.length);

      // Find API endpoints or keywords like "winrate", "variant", "matches", "decklists", "times played"
      const apiEndpoints = [...js.matchAll(/https?:\/\/[^"'\s`]+api[^"'\s`]+/gi)];
      console.log('API endpoints found:', apiEndpoints.map(m => m[0]).slice(0, 10));

      const keywords = ['winRate', 'win_rate', 'matches', 'games', 'played', 'variants', 'archetype'];
      for (const kw of keywords) {
        const matches = [...js.matchAll(new RegExp(`.{0,40}${kw}.{0,40}`, 'gi'))];
        console.log(`Keyword "${kw}": found ${matches.length} snippets. Sample:`, matches.slice(0, 2).map(m => m[0].trim()));
      }
    }
  } catch (e) {
    console.error(e.message);
  }
}

checkTcgMatchmaking();
