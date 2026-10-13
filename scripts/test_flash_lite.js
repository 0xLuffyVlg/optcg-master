import fs from 'fs';
import path from 'path';

const apiKey = 'AQ.Ab8RN6LAI7dIghyCXMGMoEQboU-e6XF7HMIjKwLVtOpkh5m3iA';

async function testFlashLite() {
  const imgPath = path.resolve('dist/reveals/eb05-010-robin.jpg');
  const buffer = fs.readFileSync(imgPath);
  const base64 = buffer.toString('base64');

  const prompt = 'Identify One Piece card. Return ONLY JSON: {"cardCode": "...", "cardName": "..."}';

  for (let i = 1; i <= 3; i++) {
    const t0 = Date.now();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: 'image/jpeg', data: base64 } }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 500
        }
      })
    });
    const d = await res.json();
    console.log(`Call #${i}: status=${res.status}, time=${Date.now() - t0}ms, code=${d?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()}`);
  }
}

testFlashLite();
