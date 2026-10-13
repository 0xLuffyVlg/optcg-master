import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, apiKey: clientApiKey } = req.body || {};
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 requise' });
    }

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (!apiKey) {
      return res.status(400).json({
        error: 'Aucune clé Gemini configurée sur le serveur.'
      });
    }

    // Clean base64
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `You are an expert One Piece Card Game (OPTCG) identifier.
Analyze this photo from a user's camera containing a physical One Piece trading card.
Identify:
1. Card Code printed at the bottom right corner (e.g. OP01-016, OP05-060, OP15-078, ST01-001, EB01-001, PRB01-001, P-001).
   - Be extremely attentive to the set number: distinguish 'OP15' from 'OP05', 'OP08' from 'OP03', 'OP10' from 'OP01', 'EB01' from 'EB02'.
2. Character / Card Name printed in bold on the card (e.g. "Mamaragan", "Monkey.D.Luffy", "Nami", "Shanks", "Charlotte Katakuri", "Roronoa Zoro").
3. Artwork style: Determine whether this card is an Alternate Art (Parallel Art / Alt Art / Manga Rare / Special Rare / SP / Treasure Rare / borderless / textured full art) or standard base card art.

Return ONLY a valid JSON object with this exact format:
{
  "cardCode": "ACTUAL_PRINTED_CODE",
  "cardName": "ACTUAL_CHARACTER_NAME",
  "isParallel": true
}

If the code is partially blurred or foiled, give the best recognizable code AND the exact character name.
If no One Piece card is visible at all, return:
{
  "cardCode": null,
  "cardName": null,
  "isParallel": false
}`;

    const fastModels = [
      'gemini-flash-lite-latest',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-2.0-flash-lite-preview-02-05'
    ];

    let geminiRes: Response | null = null;
    let lastErrText = '';

    for (const modelName of fastModels) {
      try {
        const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const res = await fetch(googleUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: 'image/jpeg',
                      data: cleanBase64
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 250
            }
          })
        });

        if (res.ok) {
          geminiRes = res;
          break;
        } else {
          lastErrText = await res.text();
        }
      } catch (err: any) {
        lastErrText = err.message;
      }
    }

    if (!geminiRes) {
      return res.status(500).json({ error: 'Erreur API Google Gemini', details: lastErrText });
    }

    const data = await geminiRes.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse JSON from response
    let parsed: any = null;
    try {
      const clean = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('JSON parse warning:', e);
    }

    const hasValidCode = parsed?.cardCode && parsed.cardCode !== 'null' && parsed.cardCode !== 'ACTUAL_PRINTED_CODE';
    const hasValidName = parsed?.cardName && parsed.cardName !== 'null' && parsed.cardName !== 'ACTUAL_CHARACTER_NAME';

    if (!parsed || (!hasValidCode && !hasValidName)) {
      return res.status(200).json({ success: false, result: null });
    }

    return res.status(200).json({
      success: true,
      result: {
        cardCode: parsed.cardCode && parsed.cardCode !== 'null' ? parsed.cardCode : null,
        cardName: parsed.cardName && parsed.cardName !== 'null' ? parsed.cardName : null,
        isParallel: Boolean(parsed.isParallel)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
