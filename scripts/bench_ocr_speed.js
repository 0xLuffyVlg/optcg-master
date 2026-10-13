import { createWorker } from 'tesseract.js';
import sharp from 'sharp';

async function benchTinyOcr() {
  const worker = await createWorker('eng');
  await worker.setParameters({
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789- '
  });

  // Create a 200x60 test image with text "OP01-004 UC"
  const svgBuffer = Buffer.from(`
    <svg width="240" height="70" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <text x="10" y="45" font-family="Arial" font-size="28" font-weight="bold" fill="black">OP01-004 UC</text>
    </svg>
  `);

  const pngBuffer = await sharp(svgBuffer).png().toBuffer();

  console.log('Running benchmark on tiny image...');
  const t0 = Date.now();
  const res = await worker.recognize(pngBuffer);
  const t1 = Date.now();

  console.log(`Recognized: "${res.data.text.trim()}" in ${t1 - t0}ms`);

  const t2 = Date.now();
  const res2 = await worker.recognize(pngBuffer);
  const t3 = Date.now();
  console.log(`Second run: "${res2.data.text.trim()}" in ${t3 - t2}ms`);

  await worker.terminate();
}

benchTinyOcr();
