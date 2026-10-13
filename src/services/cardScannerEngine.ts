/**
 * Cardonaut-grade Card Scanner Engine for One Piece TCG
 * Multi-pass OCR (Standard + Inverted for dark/light cards)
 * Precise bottom-right code extraction + Optical Typo Auto-Correction
 */

import { createWorker, Worker } from 'tesseract.js';
import { Card } from '../types';
import { allCards, getCardByCode } from '../data/dataProvider';

let globalWorker: Worker | null = null;
let isInitializing = false;

/**
 * Initializes and warms up the Tesseract OCR worker with strict character whitelist
 */
export async function getOcrWorker(): Promise<Worker> {
  if (globalWorker) return globalWorker;

  if (isInitializing) {
    while (isInitializing) {
      await new Promise(r => setTimeout(r, 60));
    }
    if (globalWorker) return globalWorker;
  }

  isInitializing = true;
  try {
    const worker = await createWorker('eng');
    // Whitelist letters, digits, and hyphens to eliminate OCR punctuation noise
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789- '
    });
    globalWorker = worker;
    return worker;
  } finally {
    isInitializing = false;
  }
}

export interface ScanCardResult {
  success: boolean;
  card: Card | null;
  cardCode: string | null;
  confidence: number;
  rawText: string;
  suggestedCards: Card[];
  matchType: 'code_standard' | 'code_inverted' | 'code_full' | 'name_strict' | 'none';
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Preprocesses a specific canvas region with upscale and adaptive binarization (standard or inverted)
 */
export function preprocessCanvasRegion(
  source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  rect: CropRect,
  invert: boolean = false
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const cropX = Math.max(0, Math.floor(rect.x));
  const cropY = Math.max(0, Math.floor(rect.y));
  const cropW = Math.max(10, Math.floor(rect.width));
  const cropH = Math.max(10, Math.floor(rect.height));

  // Upscale by 3x so tiny printed text (8-10pt) becomes huge and crisp for OCR
  const scale = cropW < 400 ? 3 : 2;
  canvas.width = cropW * scale;
  canvas.height = cropH * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);

  try {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const contrast = 2.0; // High contrast
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      let adjusted = factor * (gray - 128) + 128;
      adjusted = Math.min(255, Math.max(0, adjusted));

      let binarized = adjusted > 140 ? 255 : 0;
      if (invert) {
        binarized = 255 - binarized;
      }

      data[i] = binarized;
      data[i + 1] = binarized;
      data[i + 2] = binarized;
    }
    ctx.putImageData(imgData, 0, 0);
  } catch (e) {}

  return canvas;
}

/**
 * Optical Typo-Tolerant One Piece Card Code Parser
 * Corrects optical character confusions:
 * '0' <-> 'O', 'Q', 'D'
 * '1' <-> 'I', 'L', '|'
 * '5' <-> 'S', 'B' <-> '8'
 * Tolerates trailing rarity suffixes (e.g. OP01-004UC -> OP01-004)
 */
export function extractOnePieceCardCode(text: string): string | null {
  if (!text) return null;

  const clean = text
    .replace(/[|]/g, 'I')
    .replace(/[^A-Za-z0-9\s\-]/g, ' ')
    .replace(/\s+/g, ' ');

  // Pattern matching OP, ST, EB, PRB codes with optical letter-for-digit confusions
  const standardPattern = /(OP|0P|DP|CP|ST|5T|EB|FB|PRB)[\s\-_.:]*([0-9OQDLlI]{1,2})[\s\-_.:]*([0-9OQDLlI]{3})/i;
  const match = clean.match(standardPattern);

  if (match) {
    let prefix = match[1].toUpperCase();
    if (prefix === '0P' || prefix === 'DP' || prefix === 'CP') prefix = 'OP';
    if (prefix === '5T') prefix = 'ST';
    if (prefix === 'FB') prefix = 'EB';

    const setNum = match[2].toUpperCase().replace(/[OQD]/g, '0').replace(/[LI]/g, '1').padStart(2, '0');
    const cardNum = match[3].toUpperCase().replace(/[OQD]/g, '0').replace(/[LI]/g, '1');

    return `${prefix}${setNum}-${cardNum}`;
  }

  // Promo pattern: P-001, P 025
  const promoPattern = /\bP[\s\-_.:]*([0-9OQDLlI]{3})/i;
  const pMatch = clean.match(promoPattern);
  if (pMatch) {
    const cardNum = pMatch[1].toUpperCase().replace(/[OQD]/g, '0').replace(/[LI]/g, '1');
    return `P-${cardNum}`;
  }

  return null;
}

/**
 * Notable Character Names list for strict fallback matching
 */
const NOTABLE_NAMES = [
  'RORONOA ZORO', 'MONKEY.D.LUFFY', 'MONKEY D LUFFY', 'TRAFALGAR LAW',
  'EUSTASS"CAPTAIN"KIDD', 'EUSTASS CAPTAIN KIDD', 'EDWARD.NEWGATE',
  'CHARLOTTE LINLIN', 'CHARLOTTE KATAKURI', 'NICO ROBIN', 'BOA HANCOCK',
  'DONQUIXOTE DOFLAMINGO', 'MARSHALL.D.TEACH', 'MARSHALL D TEACH',
  'PORTGAS.D.ACE', 'PORTGAS D ACE', 'JEWELRY BONNEY', 'YAMATO',
  'SHANKS', 'NAMI', 'SANJI', 'TONY TONY.CHOPPER', 'USOPP', 'BROOK',
  'FRANKY', 'JINBE', 'SABO', 'CROCODILE', 'GEKKO MORIA', 'ENEL',
  'ROB LUCCI', 'SMOKER', 'KOBY', 'KUZAN', 'SAKAZUKI', 'BORSALINO',
  'SAINT GUNKO', 'ROCKS.D.XEBEC', 'GOL.D.ROGER'
];

export function matchStrictCharacterName(text: string): Card | null {
  if (!text || text.length < 4) return null;
  const clean = text.toUpperCase();

  for (const name of NOTABLE_NAMES) {
    if (clean.includes(name)) {
      const candidates = allCards.filter(c => 
        c.name.toUpperCase() === name || 
        c.name.toUpperCase().includes(name)
      );
      if (candidates.length > 0) return candidates[0];
    }
  }
  return null;
}

/**
 * Performs high-precision multi-pass card scan
 * Accepts optional specific card bounding box from viewfinder
 */
export async function scanCardImage(
  imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  cardBounds?: CropRect
): Promise<ScanCardResult> {
  const worker = await getOcrWorker();

  const srcW = (imageSource as HTMLVideoElement).videoWidth || (imageSource as HTMLImageElement).naturalWidth || imageSource.width || 800;
  const srcH = (imageSource as HTMLVideoElement).videoHeight || (imageSource as HTMLImageElement).naturalHeight || imageSource.height || 1000;

  // Use provided card bounds or fallback to full source
  const cardX = cardBounds ? Math.max(0, cardBounds.x) : 0;
  const cardY = cardBounds ? Math.max(0, cardBounds.y) : 0;
  const cardW = cardBounds ? Math.min(srcW - cardX, cardBounds.width) : srcW;
  const cardH = cardBounds ? Math.min(srcH - cardY, cardBounds.height) : srcH;

  // Single Wide Pass: Analyze Bottom Area of Card with Adaptive Contrast
  const bottomCrop: CropRect = {
    x: cardX,
    y: cardY + cardH * 0.65,
    width: cardW,
    height: cardH * 0.35
  };

  // Standard Contrast
  const canvas = preprocessCanvasRegion(imageSource, bottomCrop, false);
  const res = await worker.recognize(canvas);
  const rawText = res.data.text || '';
  let code = extractOnePieceCardCode(rawText);

  if (code) {
    const card = getCardByCode(code);
    if (card) {
      return {
        success: true,
        card,
        cardCode: code,
        confidence: 0.98,
        rawText,
        suggestedCards: allCards.filter(c => c.name === card.name),
        matchType: 'code_standard'
      };
    }
  }

  // Fast Inverted Fallback for Dark / Manga / Parallel cards
  const canvasInv = preprocessCanvasRegion(imageSource, bottomCrop, true);
  const resInv = await worker.recognize(canvasInv);
  const rawTextInv = resInv.data.text || '';
  code = extractOnePieceCardCode(rawTextInv);

  if (code) {
    const card = getCardByCode(code);
    if (card) {
      return {
        success: true,
        card,
        cardCode: code,
        confidence: 0.98,
        rawText: rawTextInv,
        suggestedCards: allCards.filter(c => c.name === card.name),
        matchType: 'code_inverted'
      };
    }
  }

  // Full Card Area Fallback (if user card is positioned differently or uncropped photo)
  const fullCrop: CropRect = {
    x: cardX,
    y: cardY,
    width: cardW,
    height: cardH
  };
  const canvasFull = preprocessCanvasRegion(imageSource, fullCrop, false);
  const resFull = await worker.recognize(canvasFull);
  const rawTextFull = resFull.data.text || '';
  code = extractOnePieceCardCode(rawTextFull);

  if (code) {
    const card = getCardByCode(code);
    if (card) {
      return {
        success: true,
        card,
        cardCode: code,
        confidence: 0.95,
        rawText: rawTextFull,
        suggestedCards: allCards.filter(c => c.name === card.name),
        matchType: 'code_standard'
      };
    }
  }

  return {
    success: false,
    card: null,
    cardCode: null,
    confidence: 0,
    rawText: `${rawText} ${rawTextInv} ${rawTextFull}`.trim(),
    suggestedCards: [],
    matchType: 'none'
  };
}
