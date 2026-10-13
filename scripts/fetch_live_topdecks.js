import fetch from 'node-fetch';
import fs from 'fs';

async function testFetch() {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
  };

  const urls = [
    'https://onepiecetopdecks.com/deck-list/japan-op17-deck-list-the-worlds-strongest-warriors/',
    'https://onepiecetopdecks.com/deck-list/english-op17-deck-list-the-worlds-strongest-warriors/',
    'https://onepiecetopdecks.com/deck-list/japan-op-17-the-worlds-strongest-warriors-deck-list/',
    'https://onepiecetopdecks.com/deck-list/japan-op16-deck-list/',
    'https://onepiecetopdecks.com/deck-list/japan-op-17/'
  ];

  for (const url of urls) {
    try {
      console.log('Fetching:', url);
      const res = await fetch(url, { headers });
      console.log('Status:', res.status);
      if (res.ok) {
        const html = await res.text();
        const trMatches = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
        console.log(`Found ${trMatches.length} rows in ${url}`);

        // Check for dates in rows
        const sampleDates = [];
        for (let i = 1; i < Math.min(25, trMatches.length); i++) {
          const cells = [...trMatches[i][1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(m => m[1].replace(/<[^>]+>/g, ' ').trim());
          if (cells[5]) sampleDates.push(cells[5]);
        }
        console.log('Sample dates:', sampleDates.slice(0, 10));
      }
    } catch (err) {
      console.error('Error fetching', url, err.message);
    }
  }
}

testFetch();
