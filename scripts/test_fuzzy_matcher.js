import fs from 'fs';

const cards = JSON.parse(fs.readFileSync('src/data/cards.json', 'utf8'));

// Build index of words -> cards
const cardTokens = cards.map(c => {
  const nameParts = c.name.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length >= 3);
  return {
    card: c,
    code: c.card_code.toUpperCase(),
    nameParts,
    power: c.power ? String(c.power) : null,
    cost: c.cost !== null ? String(c.cost) : null,
  };
});

function matchCardFromText(ocrText) {
  if (!ocrText) return null;
  const clean = ocrText.toUpperCase().replace(/[|]/g, 'I');

  // 1. Direct Card Code Regex
  const codeRegex = /(OP|0P|DP|ST|5T|EB|FB|PRB)[\s\-_.:]*([0-9OQD]{1,2})[\s\-_.:]*([0-9OQDlI]{3})/i;
  const match = clean.match(codeRegex);
  if (match) {
    let prefix = match[1].toUpperCase();
    if (prefix === '0P' || prefix === 'DP') prefix = 'OP';
    if (prefix === '5T') prefix = 'ST';
    if (prefix === 'FB') prefix = 'EB';

    const setNum = match[2].replace(/[OQD]/g, '0').padStart(2, '0');
    const cardNum = match[3].replace(/[OQD]/g, '0').replace(/[lI]/g, '1');
    const directCode = `${prefix}${setNum}-${cardNum}`;

    const found = cards.find(c => c.card_code === directCode);
    if (found) {
      return { card: found, confidence: 0.99, matchType: 'code' };
    }
  }

  // 2. Fuzzy match by name tokens + power/cost
  const lowerText = ocrText.toLowerCase();
  let bestScore = 0;
  let bestCard = null;

  for (const entry of cardTokens) {
    let score = 0;
    // Check name tokens
    for (const part of entry.nameParts) {
      if (lowerText.includes(part)) {
        score += part.length * 2;
      }
    }

    // Power match bonus
    if (entry.power && lowerText.includes(entry.power)) {
      score += 5;
    }

    // Card code partial bonus (e.g. OP01, OP17)
    if (clean.includes(entry.code.slice(0, 4))) {
      score += 4;
    }

    if (score > bestScore && score >= 8) {
      bestScore = score;
      bestCard = entry.card;
    }
  }

  if (bestCard) {
    return { card: bestCard, confidence: Math.min(0.95, bestScore / 20), matchType: 'fuzzy' };
  }

  return null;
}

// Test with our Saint Gunko raw OCR output from earlier
const sampleOcr = `
70) 0, 5,
‘Mh 5000, 2
5741 J
Saint Gunko wi
Celestial Dragons, Holy Knights of Gog
When a Character is played from your hand
`;

console.log('Testing fuzzy match on raw OCR:');
const result = matchCardFromText(sampleOcr);
console.log('Match result:', result?.card?.name, result?.card?.card_code, result?.matchType, result?.confidence);
