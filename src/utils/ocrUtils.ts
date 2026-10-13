/**
 * Image Preprocessing and Multi-Zone OCR utilities for One Piece Card Game
 */

export interface CropBox {
  x: number;      // 0 to 1 (percentage)
  y: number;      // 0 to 1
  width: number;  // 0 to 1
  height: number; // 0 to 1
}

/**
 * Preprocesses an image source (Canvas or Image or DataUrl)
 * Crops to a specific zone, converts to grayscale, and applies high-contrast binarization
 */
export function preprocessCanvas(
  sourceImage: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  crop?: CropBox
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const srcWidth = (sourceImage as HTMLVideoElement).videoWidth || (sourceImage as HTMLImageElement).naturalWidth || sourceImage.width || 640;
  const srcHeight = (sourceImage as HTMLVideoElement).videoHeight || (sourceImage as HTMLImageElement).naturalHeight || sourceImage.height || 480;

  const cropX = crop ? Math.floor(crop.x * srcWidth) : 0;
  const cropY = crop ? Math.floor(crop.y * srcHeight) : 0;
  const cropW = crop ? Math.floor(crop.width * srcWidth) : srcWidth;
  const cropH = crop ? Math.floor(crop.height * srcHeight) : srcHeight;

  // Scale up small crops so OCR has high pixel density
  const scale = cropW < 400 ? 2 : 1;
  canvas.width = cropW * scale;
  canvas.height = cropH * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Draw scaled crop
  ctx.drawImage(
    sourceImage,
    cropX, cropY, cropW, cropH,
    0, 0, canvas.width, canvas.height
  );

  // Apply Grayscale and Contrast Enhancement
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Grayscale luminance
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // Contrast boost: push darks lower, lights higher
    const contrast = 1.6;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    let adjusted = factor * (gray - 128) + 128;
    adjusted = Math.min(255, Math.max(0, adjusted));

    data[i] = adjusted;
    data[i + 1] = adjusted;
    data[i + 2] = adjusted;
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Extracts standard One Piece card code from OCR text
 */
export function extractCardCodeFromOcrText(text: string): string | null {
  if (!text) return null;
  
  const normalized = text
    .replace(/[|]/g, 'I')
    .replace(/[\r\n\t]+/g, ' ')
    .toUpperCase();

  // Pattern 1: Standard OP, ST, EB, PRB codes (e.g. OP01-004, ST01-001, EB01-001, PRB01-001)
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

  // Pattern 2: Promo cards (P-001, P 001)
  const promoRegex = /\bP[\s\-_.:]*([0-9OQDlI|]{3})\b/i;
  const pMatch = normalized.match(promoRegex);
  if (pMatch) {
    const cardNum = pMatch[1].replace(/[OQD]/g, '0').replace(/[lI|]/g, '1');
    return `P-${cardNum}`;
  }

  return null;
}
