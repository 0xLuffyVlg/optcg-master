const apiKey = 'AQ.Ab8RN6LAI7dIghyCXMGMoEQboU-e6XF7HMIjKwLVtOpkh5m3iA';

async function testThinking() {
  const prompt = `Identify this One Piece card. If visible, give code and name.
Respond ONLY with JSON: {"cardCode": "OP01-016", "cardName": "Nami"}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 1000
      }
    })
  });
  const data = await res.json();
  console.log('gemini-2.5-flash Status:', res.status, JSON.stringify(data?.error || data?.candidates?.[0]?.content?.parts?.[0]?.text));
  
  // Test gemini-3.6-flash
  const url36 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
  const res36 = await fetch(url36, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 1000
      }
    })
  });
  const data36 = await res36.json();
  console.log('gemini-3.6-flash Status:', res36.status, JSON.stringify(data36?.error || data36?.candidates?.[0]?.content?.parts?.[0]?.text));
}

testThinking();
