import fs from 'fs';
import path from 'path';

const apiKey = 'AQ.Ab8RN6LAI7dIghyCXMGMoEQboU-e6XF7HMIjKwLVtOpkh5m3iA';

async function testRealCard() {
  const imgPath = path.resolve('dist/reveals/eb05-010-robin.jpg');
  const buffer = fs.readFileSync(imgPath);
  const base64 = buffer.toString('base64');

  const prompt = `You are an expert One Piece Card Game (OPTCG) identifier.
Analyze this card image carefully:
1. Find the exact Card Code (e.g. OP01-016, OP05-060, ST01-001, EB05-010, etc.). It is printed on the card (usually in the bottom right corner or bottom border, format is 2-4 letters, 2 digits, hyphen, 3 digits).
2. Find the character / card name (e.g. Nico Robin, Monkey.D.Luffy, etc.).

Respond ONLY with valid JSON:
{
  "cardCode": "...",
  "cardName": "..."
}`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: 'image/jpeg', data: base64 } }
        ]
      }],
      generationConfig: { maxOutputTokens: 800 }
    })
  });
  const data = await res.json();
  console.log('Result for real card:', data?.candidates?.[0]?.content?.parts?.[0]?.text);
}

testRealCard();
