import fs from 'fs';

async function findFetchCalls() {
  const jsRes = await fetch('https://stats.tcgmatchmaking.com/assets/index-B3ue8fbf.js');
  const js = await jsRes.text();

  const fetchCalls = [...js.matchAll(/fetch\(["'`]([^"'`]+)["'`]/gi)];
  console.log('Fetch calls:', fetchCalls.map(m => m[1]));

  // Look for supabase or backend url
  const urls = [...js.matchAll(/https?:\/\/[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s"']*)?/gi)];
  const apiUrls = urls.map(u => u[0]).filter(u => !u.includes('w3.org') && !u.includes('google'));
  console.log('Unique external URLs:', Array.from(new Set(apiUrls)));
}

findFetchCalls();
