import fs from 'fs';

const content = fs.readFileSync('C:\\Users\\LuffyVlg\\.gemini\\antigravity\\brain\\ff955f3e-d11e-4b2f-87d2-4508fd6675a1\\.system_generated\\steps\\3408\\content.md', 'utf8');

// Match any href or text mentions of price guide / download
const links = content.match(/href="([^"]+)"/g) || [];
console.log('--- LINKS IN CARDMARKET ARTICLE ---');
links.forEach(l => {
  if (l.toLowerCase().includes('data') || l.toLowerCase().includes('price') || l.toLowerCase().includes('download') || l.toLowerCase().includes('guide') || l.toLowerCase().includes('csv')) {
    console.log(l);
  }
});

// Look for article body text
const bodyMatch = content.match(/<article[^>]*>([\s\S]*?)<\/article>/i) || content.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
if (bodyMatch) {
  const textOnly = bodyMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  console.log('\n--- ARTICLE BODY ---');
  console.log(textOnly.slice(0, 1500));
}
