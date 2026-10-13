import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Tesseract from 'tesseract.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicRevealsDir = path.resolve(__dirname, '../public/reveals');

const eb05Cards = [
  { url: 'https://onepiecetopdecks.com/wp-content/uploads/2026/08/EB05-010.jpg', file: 'eb05-010-robin.jpg' },
  { url: 'https://onepiecetopdecks.com/wp-content/uploads/2026/08/EB05-010_p2.jpg', file: 'eb05-010-robin-aa.jpg' },
  { url: 'https://onepiecetopdecks.com/wp-content/uploads/2026/08/EB05-016_p2.jpg', file: 'eb05-016-robin-char.jpg' },
  { url: 'https://onepiecetopdecks.com/wp-content/uploads/2026/08/OP01-016_p5.jpg', file: 'eb05-nami-sp.jpg' },
  { url: 'https://onepiecetopdecks.com/wp-content/uploads/2026/08/EB03-001_p3.jpg', file: 'eb05-card-5.jpg' },
  { url: 'https://onepiecetopdecks.com/wp-content/uploads/2026/08/OP11-041_p3.jpg', file: 'eb05-card-6.jpg' },
  { url: 'https://onepiecetopdecks.com/wp-content/uploads/2026/08/OP11-022_p3.jpg', file: 'eb05-card-7.jpg' },
  { url: 'https://onepiecetopdecks.com/wp-content/uploads/2026/08/OP14-041_p3.jpg', file: 'eb05-card-8.jpg' },
  { url: 'https://onepiecetopdecks.com/wp-content/uploads/2026/08/OP15-039_p3.jpg', file: 'eb05-card-9.jpg' },
  { url: 'https://onepiecetopdecks.com/wp-content/uploads/2026/08/OP13-100_p3.jpg', file: 'eb05-card-10.jpg' }
];

async function run() {
  console.log('Downloading all EB05 cards...');
  for (const c of eb05Cards) {
    const dest = path.join(publicRevealsDir, c.file);
    const res = await fetch(c.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Referer': 'https://onepiecetopdecks.com/'
      }
    });
    if (res.ok) {
      const buf = await res.arrayBuffer();
      fs.writeFileSync(dest, Buffer.from(buf));
      console.log(`[OK] ${c.file} (${buf.byteLength} bytes)`);
    } else {
      console.log(`[ERR ${res.status}] ${c.url}`);
    }
  }

  console.log('\nRunning OCR on all downloaded EB05 cards...');
  for (const c of eb05Cards) {
    const dest = path.join(publicRevealsDir, c.file);
    if (!fs.existsSync(dest)) continue;
    console.log(`\n=================== OCR for ${c.file} ===================`);
    try {
      const { data: { text } } = await Tesseract.recognize(dest, 'eng');
      console.log(text.trim());
    } catch (e) {
      console.log(`OCR error on ${c.file}:`, e.message);
    }
  }
}

run();
