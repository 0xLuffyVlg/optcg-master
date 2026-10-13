import { createWorker } from 'tesseract.js';

async function testTesseract() {
  console.log('Testing Tesseract.js installation...');
  try {
    const worker = await createWorker('eng');
    console.log('Worker created successfully!');
    await worker.terminate();
    console.log('Worker terminated successfully!');
  } catch (e) {
    console.error('Error with Tesseract.js:', e);
  }
}

testTesseract();
