import path from 'path';
import { fileURLToPath } from 'url';
import Tesseract from 'tesseract.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicRevealsDir = path.resolve(__dirname, '../public/reveals');

const op18Files = [
  'op18-002-gunko.jpg',
  'op18-021-franky.jpg',
  'op18-021-franky-aa.jpg',
  'op18-060-loki.jpg',
  'op18-060-loki-aa.jpg',
  'op18-065-shamrock.jpg',
  'op18-065-shamrock-aa.jpg',
  'op18-119-sec.jpg'
];

async function checkAllOP18() {
  for (const file of op18Files) {
    console.log(`\n=================== ${file} ===================`);
    try {
      const { data: { text } } = await Tesseract.recognize(path.join(publicRevealsDir, file), 'eng');
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      console.log(lines.slice(0, 10).join('\n'));
      console.log('--- bottom lines: ---');
      console.log(lines.slice(-6).join('\n'));
    } catch (e) {
      console.error(e.message);
    }
  }
}

checkAllOP18();
