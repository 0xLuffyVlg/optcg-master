import sharp from 'sharp';
import { createWorker } from 'tesseract.js';

async function testTargetedOcr() {
  const imagePath = 'public/reveals/op18-060-loki.jpg';
  const meta = await sharp(imagePath).metadata();
  console.log('Image dimensions:', meta.width, meta.height);

  // Bottom 15% of card
  const cropH = Math.floor(meta.height * 0.15);
  const cropY = meta.height - cropH;
  // Right 50%
  const cropW = Math.floor(meta.width * 0.5);
  const cropX = meta.width - cropW;

  const croppedBuffer = await sharp(imagePath)
    .extract({ left: cropX, top: cropY, width: cropW, height: cropH })
    .resize(cropW * 3, cropH * 3, { kernel: 'lanczos3' })
    .grayscale()
    .normalise()
    .threshold(140)
    .toBuffer();

  const worker = await createWorker('eng');
  const ret = await worker.recognize(croppedBuffer);
  console.log('--- TARGETED BOTTOM-RIGHT OCR ---');
  console.log(ret.data.text);
  await worker.terminate();
}

testTargetedOcr();
