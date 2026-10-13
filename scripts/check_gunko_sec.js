import path from 'path';
import { fileURLToPath } from 'url';
import Tesseract from 'tesseract.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicRevealsDir = path.resolve(__dirname, '../public/reveals');

async function checkSpecific() {
  for (const f of ['op18-002-gunko.jpg', 'op18-119-sec.jpg']) {
    console.log(`\n=================== ${f} ===================`);
    const { data: { text } } = await Tesseract.recognize(path.join(publicRevealsDir, f), 'eng');
    console.log(text.trim());
  }
}

checkSpecific();
