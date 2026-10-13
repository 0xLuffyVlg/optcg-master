import { createWorker } from 'tesseract.js';

async function testWhitelist() {
  const worker = await createWorker('eng');
  await worker.setParameters({
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789- '
  });
  console.log('Whitelist parameters applied successfully!');
  await worker.terminate();
}

testWhitelist();
