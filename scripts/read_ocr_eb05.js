import path from 'path';
import { fileURLToPath } from 'url';
import Tesseract from 'tesseract.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicRevealsDir = path.resolve(__dirname, '../public/reveals');

const eb05Images = [
  'eb05-001-nami-sp.jpg',
  'eb05-016-sp.jpg',
  'eb05-025-hancock-sp.jpg',
  'eb05-bonney-sp.jpg',
  'eb05-yamato-sp.jpg'
];

async function runOCR() {
  for (const imgName of eb05Images) {
    const imgPath = path.join(publicRevealsDir, imgName);
    console.log(`\n=================== OCR for ${imgName} ===================`);
    try {
      const { data: { text } } = await Tesseract.recognize(imgPath, 'eng');
      console.log(text.trim());
    } catch (e) {
      console.error('OCR Error:', e.message);
    }
  }
}

runOCR();
