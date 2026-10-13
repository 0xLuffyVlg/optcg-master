import fs from 'fs';

async function testRss() {
  try {
    const res = await fetch('https://onepiecetopdecks.com/feed/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      }
    });

    console.log('Feed status:', res.status);
    if (res.ok) {
      const xml = await res.text();
      console.log('XML Length:', xml.length);
      const items = [...xml.matchAll(/<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<\/item>/gi)];
      console.log(`Found ${items.length} items in RSS feed:`);
      for (const it of items) {
        console.log(`- Title: ${it[1]}\n  Link: ${it[2]}`);
      }
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testRss();
