import { jsPDF } from 'jspdf';
import { Deck } from '../types';
import { getCardImageUrl } from './cardUtils';

// Standard TCG card size: 63mm x 88mm
const CARD_WIDTH_MM = 63;
const CARD_HEIGHT_MM = 88;

// A4 dimensions: 210mm x 297mm
const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;

// 3 columns x 3 rows = 9 cards per page
const COLS = 3;
const ROWS = 3;
const GRID_WIDTH = COLS * CARD_WIDTH_MM; // 189mm
const GRID_HEIGHT = ROWS * CARD_HEIGHT_MM; // 264mm
const START_X = (PAGE_WIDTH_MM - GRID_WIDTH) / 2; // ~10.5mm margin
const START_Y = (PAGE_HEIGHT_MM - GRID_HEIGHT) / 2; // ~16.5mm margin

async function loadImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 300;
      canvas.height = img.naturalHeight || 420;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      } else {
        reject(new Error('Canvas context failed'));
      }
    };
    img.onerror = () => {
      // Return a fallback colored placeholder
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 420;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 300, 420);
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px sans-serif';
      ctx.fillText('Card Image', 80, 200);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = url;
  });
}

export async function generateProxyPdf(
  deck: Deck,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const cardList: { url: string; code: string; name: string }[] = [];

  // 1. Leader
  if (deck.leader) {
    cardList.push({
      url: getCardImageUrl(deck.leader),
      code: deck.leader.card_code,
      name: deck.leader.name
    });
  }

  // 2. Main Deck cards (expanded by count)
  for (const item of deck.cards) {
    const url = getCardImageUrl(item.card, item.selectedArtwork);
    for (let i = 0; i < item.count; i++) {
      cardList.push({
        url,
        code: item.card.card_code,
        name: item.card.name
      });
    }
  }

  const totalCards = cardList.length;
  if (totalCards === 0) {
    throw new Error('Le deck est vide.');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const cardsPerPage = COLS * ROWS;
  const totalPages = Math.ceil(totalCards / cardsPerPage);

  for (let cardIdx = 0; cardIdx < totalCards; cardIdx++) {
    const pageIndex = Math.floor(cardIdx / cardsPerPage);
    const indexOnPage = cardIdx % cardsPerPage;

    if (indexOnPage === 0 && pageIndex > 0) {
      doc.addPage('a4', 'portrait');
    }

    const col = indexOnPage % COLS;
    const row = Math.floor(indexOnPage / COLS);
    const x = START_X + col * CARD_WIDTH_MM;
    const y = START_Y + row * CARD_HEIGHT_MM;

    if (onProgress) {
      onProgress(cardIdx + 1, totalCards);
    }

    const item = cardList[cardIdx];
    try {
      const base64 = await loadImageAsBase64(item.url);
      doc.addImage(base64, 'JPEG', x, y, CARD_WIDTH_MM, CARD_HEIGHT_MM, undefined, 'FAST');
    } catch (e) {
      // Draw placeholder box
      doc.setDrawColor(100, 116, 139);
      doc.setFillColor(30, 41, 59);
      doc.rect(x, y, CARD_WIDTH_MM, CARD_HEIGHT_MM, 'FD');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text(item.code, x + 5, y + 10);
      doc.text(item.name.slice(0, 18), x + 5, y + 18);
    }

    // Draw cut lines (subtle border around each card)
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.1);
    doc.rect(x, y, CARD_WIDTH_MM, CARD_HEIGHT_MM);
  }

  const fileName = `${(deck.name || 'one-piece-deck').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_proxies.pdf`;
  doc.save(fileName);
}
