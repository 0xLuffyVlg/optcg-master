const apiKey = 'AQ.Ab8RN6LAI7dIghyCXMGMoEQboU-e6XF7HMIjKwLVtOpkh5m3iA';

async function testFast() {
  const t0 = Date.now();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
  
  // Test with thinking_config: { thinking_budget: 0 }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Answer with 1 word: Ready' }] }],
      generationConfig: {
        thinkingConfig: {
          thinkingBudget: 0
        }
      }
    })
  });
  
  const d = await res.json();
  const duration = Date.now() - t0;
  console.log(`Duration: ${duration}ms`);
  console.log('Response:', JSON.stringify(d, null, 2));
}

testFast();
