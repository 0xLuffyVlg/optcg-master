import path from 'path';
import { fileURLToPath } from 'url';
import Tesseract from 'tesseract.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicRevealsDir = path.resolve(__dirname, '../public/reveals');

const testImages = [
  'op18-021-franky.jpg',
  'op18-078-mini-merry.jpg',
  'op18-031-robin-manga.jpg',
  'op18-060-loki.jpg',
  'op18-065-shamrock.jpg',
  'eb05-010-robin-leader.jpg'
];

async function runOCR() {
  for (const imgName of testImages) {
    const imgPath = path.join(publicRevealsDir, imgName);
    console.log(`\n=================== OCR for ${imgName} ===================`);
    try {
      const { data: { text } } = await Tesseract.recognize(imgPath, 'eng');
      console.log('Result text:');
      console.log(text.trim());
    } catch (e) {
      console.error('OCR Error:', e.message);
    }
  }
}

runOCR();
