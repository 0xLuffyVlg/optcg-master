import fs from 'fs';
import path from 'path';

const apiKey = 'AQ.Ab8RN6LAI7dIghyCXMGMoEQboU-e6XF7HMIjKwLVtOpkh5m3iA';

async function testThinkingBudget() {
  const prompt = 'Identify this One Piece card. Return ONLY valid JSON: {"cardCode": "OP01-016", "cardName": "Nami"}';

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 2048
      }
    })
  });
  const data = await res.json();
  console.log('Result:', JSON.stringify(data, null, 2));
}

testThinkingBudget();
