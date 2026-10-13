const apiKey = 'AQ.Ab8RN6LAI7dIghyCXMGMoEQboU-e6XF7HMIjKwLVtOpkh5m3iA';

async function testSingle() {
  const prompt = 'Return JSON: {"cardCode":"OP01-016"}';
  const url36 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url36, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 800
      }
    })
  });
  const data = await res.json();
  console.log('Result:', JSON.stringify(data?.candidates?.[0]?.content?.parts?.[0]?.text));
}

testSingle();
