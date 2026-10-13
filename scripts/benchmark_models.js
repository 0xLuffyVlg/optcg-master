import fs from 'fs';
import path from 'path';

const apiKey = 'AQ.Ab8RN6LAI7dIghyCXMGMoEQboU-e6XF7HMIjKwLVtOpkh5m3iA';

const modelsToTest = [
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.6-flash'
];

async function benchmark() {
  const imgPath = path.resolve('dist/reveals/eb05-010-robin.jpg');
  const buffer = fs.readFileSync(imgPath);
  const base64 = buffer.toString('base64');

  const prompt = 'Identify One Piece card. Return ONLY JSON: {"cardCode": "...", "cardName": "..."}';

  for (const model of modelsToTest) {
    const t0 = Date.now();
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
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
            maxOutputTokens: 2000
          }
        })
      });
      const duration = Date.now() - t0;
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log(`[${model}] Status: ${res.status}, Time: ${duration}ms, Text: ${text ? text.replace(/\n/g, ' ').slice(0, 60) : JSON.stringify(data?.error?.message)}`);
    } catch (e) {
      console.log(`[${model}] Error: ${e.message}`);
    }
  }
}

benchmark();
