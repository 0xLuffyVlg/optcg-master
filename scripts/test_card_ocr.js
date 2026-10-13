import { createWorker } from 'tesseract.js';
import fs from 'fs';

function extractCardCodeFromOcrText(text) {
  if (!text) return null;
  const normalized = text
    .replace(/[|]/g, 'I')
    .replace(/[\r\n\t]+/g, ' ')
    .toUpperCase();

  const mainRegex = /(OP|0P|DP|ST|5T|EB|FB|PRB)[\s\-_.:]*([0-9OQD]{1,2})[\s\-_.:]*([0-9OQDlI|]{3})/i;
  const match = normalized.match(mainRegex);
  if (match) {
    let prefix = match[1].toUpperCase();
    if (prefix === '0P' || prefix === 'DP') prefix = 'OP';
    if (prefix === '5T') prefix = 'ST';
    if (prefix === 'FB') prefix = 'EB';

    const setNum = match[2].replace(/[OQD]/g, '0').padStart(2, '0');
    const cardNum = match[3].replace(/[OQD]/g, '0').replace(/[lI|]/g, '1');
    return `${prefix}${setNum}-${cardNum}`;
  }

  const promoRegex = /\bP[\s\-_.:]*([0-9OQDlI|]{3})\b/i;
  const pMatch = normalized.match(promoRegex);
  if (pMatch) {
    const cardNum = pMatch[1].replace(/[OQD]/g, '0').replace(/[lI|]/g, '1');
    return `P-${cardNum}`;
  }

  return null;
}

async function testCardOcr() {
  const imagePath = 'public/reveals/op18-060-loki.jpg';
  console.log(`Running OCR on ${imagePath}...`);
  
  const worker = await createWorker('eng');
  const ret = await worker.recognize(imagePath);
  console.log('--- OCR RAW TEXT ---');
  console.log(ret.data.text);
  console.log('--- EXTRACTED CODE ---');
  const code = extractCardCodeFromOcrText(ret.data.text);
  console.log('Found code:', code);
  await worker.terminate();
}

testCardOcr();
