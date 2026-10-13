import fs from 'fs';

async function compareReveals() {
  const res = await fetch('https://cdn.cardkaizoku.com/card_data.json');
  const kzCards = await res.json();

  const newsContent = fs.readFileSync('src/data/newsRevealsData.ts', 'utf8');
  
  const localCodes = (newsContent.match(/code:\s*['"][^'"]+['"]/g) || [])
    .map(m => m.replace(/code:\s*['"]/, '').replace(/['"]/, ''));
  console.log('Local revealed card codes (' + localCodes.length + '):', localCodes);

  const spoilers = kzCards.filter(c => {
    const num = (c.cardNumber || '').trim();
    return num.startsWith('OP18') || num.startsWith('EB05') || num.startsWith('PRB02');
  });

  console.log('\nCardKaizoku spoiler cards (' + spoilers.length + '):');
  let missingCount = 0;
  for (const s of spoilers) {
    const isPresent = localCodes.includes(s.cardNumber);
    if (!isPresent) missingCount++;
    console.log(`- ${s.cardNumber}: ${s.cardName} (${s.cardType} - ${s.color} - ${s.rarity}) [Present in local reveals: ${isPresent}]`);
  }
  console.log('\nTotal new spoiler cards from CardKaizoku available:', missingCount);
}
compareReveals();


async function testBlank() {
  const blackPixel = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: 'Analyze this image. If a One Piece card is visible, return its code. If not, return {"cardCode": null}' },
          { inline_data: { mime_type: 'image/jpeg', data: blackPixel } }
        ]
      }],
      generationConfig: { maxOutputTokens: 800 }
    })
  });
  const data = await res.json();
  console.log('Data:', JSON.stringify(data, null, 2));
}

testBlank();
