import fs from 'fs';

async function inspectItemContent() {
  const res = await fetch('https://onepiecetopdecks.com/feed/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    }
  });

  const xml = await res.text();
  const firstItem = xml.match(/<item>([\s\S]*?)<\/item>/i);
  if (firstItem) {
    const content = firstItem[1].match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/i);
    if (content) {
      console.log('Content encoded length:', content[1].length);
      console.log('Sample content:');
      console.log(content[1].slice(0, 1500));
    }
  }
}

inspectItemContent();
