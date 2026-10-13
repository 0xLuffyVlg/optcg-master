import fs from 'fs';

async function testLeaksFeed() {
  try {
    const res = await fetch('https://onepiecetopdecks.com/category/card-leaks/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      }
    });

    if (res.ok) {
      const html = await res.text();
      console.log('Category leaks page length:', html.length);
      const articleLinks = [...html.matchAll(/<a[^>]+href=["'](https:\/\/onepiecetopdecks\.com\/[^"']+)["'][^>]*>(.*?)<\/a>/gi)];
      const uniquePosts = new Map();
      for (const m of articleLinks) {
        const url = m[1];
        const title = m[2].replace(/<[^>]+>/g, '').trim();
        if (url.includes('leak') && title && title.length > 5 && !url.includes('/page/')) {
          uniquePosts.set(url, title);
        }
      }
      console.log('Found leak articles:', Array.from(uniquePosts.entries()));
    } else {
      console.log('Failed status:', res.status);
    }
  } catch (e) {
    console.error(e.message);
  }
}

testLeaksFeed();
