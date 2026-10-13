/**
 * AI Vision Scanner for One Piece Card Game
 * Powered by Google Gemini 3.6 Flash Vision
 */

import { Card } from '../types';
import { getCardByCode, normalizeCardCode, allCards } from '../data/dataProvider';
import { extractCardCodeFromOcrText } from './ocrUtils';

const GEMINI_API_KEY_STORAGE = 'optcg_gemini_api_key';
const DEFAULT_API_KEY = 'AQ.Ab8RN6Lpx776ywBl8dLxHxvlj3xjB75nB1ckwNQogCTg0I3a0Q';

export function getSavedGeminiApiKey(): string {
  try {
    return localStorage.getItem(GEMINI_API_KEY_STORAGE) || DEFAULT_API_KEY;
  } catch (e) {
    return DEFAULT_API_KEY;
  }
}

export function saveGeminiApiKey(key: string): void {
  try {
    localStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim());
  } catch (e) {}
}

export interface AiScanResult {
  success: boolean;
  cardCode?: string;
  cardName?: string;
  card?: Card;
  suggestedCards?: Card[];
  confidence?: number;
  rawResponse?: string;
  errorMessage?: string;
}

/**
 * Resizes and compresses image to max 1024px and JPEG quality 0.85 for fast AI upload
 */
export async function compressImageForAi(imageSource: string | File | Blob): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const maxDim = 1024;
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        // Export compressed JPEG base64 (clean data without header)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(compressedDataUrl.replace(/^data:image\/jpeg;base64,/, ''));
      } else {
        resolve(typeof imageSource === 'string' ? imageSource.replace(/^data:image\/\w+;base64,/, '') : '');
      }
    };

    img.onerror = () => {
      resolve(typeof imageSource === 'string' ? imageSource.replace(/^data:image\/\w+;base64,/, '') : '');
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(imageSource);
    }
  });
}

/**
 * Sends a card photo to Gemini 3.6 Flash Vision to identify the exact One Piece card
 */
export async function identifyCardWithAiVision(
  rawImageData: string,
  customApiKey?: string
): Promise<AiScanResult> {
  const apiKey = customApiKey || getSavedGeminiApiKey();

  if (!apiKey) {
    return {
      success: false,
      errorMessage: 'Aucune clé API configurée.'
    };
  }

  // Compress image to ensure lightweight payload
  const cleanBase64 = await compressImageForAi(rawImageData);

  const prompt = `You are the world's top expert in the One Piece Card Game (OPTCG).
Look at this photograph of a physical One Piece trading card.
Analyze the illustration, artwork, text, power, cost, and card code at the bottom right.

Identify:
1. The exact Card Code (e.g. OP01-004, OP17-039, ST01-001, EB01-001, PRB01-001, P-001).
2. The exact English Character/Card Name (e.g. "Marshall.D.Teach", "Monkey.D.Luffy", "Usopp", "Kouzuki Oden", "Roronoa Zoro").
3. The Set Code (e.g. OP01, OP02, OP17, ST01, EB01).
4. The Card Category (Leader, Character, Event, Stage).

Return a strict JSON object with this format:
{
  "card_code": "OP01-004",
  "name": "Usopp",
  "set": "OP01",
  "category": "Character"
}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
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
          response_mime_type: 'application/json',
          temperature: 0.1,
          maxOutputTokens: 300
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        errorMessage: `Erreur API (${response.status}) : ${errText.slice(0, 100)}`
      };
    }

    const data = await response.json();
    const candidateParts = data.candidates?.[0]?.content?.parts || [];
    
    let rawText = '';
    for (const part of candidateParts) {
      if (part.text) rawText += part.text + '\n';
    }

    console.log('Gemini 3.6 Flash Raw JSON Output:', rawText);

    let parsed: any = null;
    try {
      parsed = JSON.parse(rawText.trim());
    } catch (jsonErr) {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (e) {}
      }
    }

    // Step 1: Check parsed card code
    let detectedCode = parsed?.card_code ? normalizeCardCode(parsed.card_code) : '';

    // Step 2: Fallback regex on raw response
    if (!detectedCode) {
      const codeRegex = extractCardCodeFromOcrText(rawText);
      if (codeRegex) detectedCode = codeRegex;
    }

    let foundCard = getCardByCode(detectedCode);

    // Step 3: Match by Character Name & Set if direct code wasn't found
    let candidateMatches: Card[] = [];
    if (parsed?.name) {
      const targetName = parsed.name.toLowerCase().trim();
      const targetSet = parsed.set ? parsed.set.toUpperCase() : '';

      candidateMatches = allCards.filter(c => {
        const nameMatch = c.name.toLowerCase().includes(targetName) || targetName.includes(c.name.toLowerCase());
        if (targetSet) {
          return nameMatch && (c.set_code === targetSet || c.card_code.startsWith(targetSet));
        }
        return nameMatch;
      });

      if (!foundCard && candidateMatches.length > 0) {
        foundCard = candidateMatches[0];
      }
    }

    if (foundCard) {
      return {
        success: true,
        cardCode: foundCard.card_code,
        cardName: foundCard.name,
        card: foundCard,
        suggestedCards: candidateMatches.length > 1 ? candidateMatches : undefined,
        confidence: 0.99
      };
    }

    if (candidateMatches.length > 0) {
      return {
        success: true,
        cardCode: candidateMatches[0].card_code,
        cardName: candidateMatches[0].name,
        card: candidateMatches[0],
        suggestedCards: candidateMatches,
        confidence: 0.9
      };
    }

    return {
      success: false,
      rawResponse: rawText,
      errorMessage: `L'IA a analysé la photo mais n'a pas pu faire correspondre un code précis. Utilisez la saisie rapide ci-dessous.`
    };

  } catch (err: any) {
    return {
      success: false,
      errorMessage: err.message || 'Erreur de connexion avec l\'IA Vision.'
    };
  }
}
