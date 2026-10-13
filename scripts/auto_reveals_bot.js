/**
 * Autonomous OnePieceTopDecks Card Leaks & Reveals Scraper Bot
 * Automatically detects new card leaks, downloads images to public/reveals,
 * parses card effects using OCR, and updates src/data/reveals_feed.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Tesseract from 'tesseract.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REVEALS_DIR = path.resolve(__dirname, '../public/reveals');
const REVEALS_DATA_FILE = path.resolve(__dirname, '../src/data/reveals_feed.json');
const SYNC_META_FILE = path.resolve(__dirname, '../src/data/reveals_last_sync.json');

if (!fs.existsSync(REVEALS_DIR)) {
  fs.mkdirSync(REVEALS_DIR, { recursive: true });
}

export async function runAutoRevealsSync() {
  console.log('\n=============================================');
  console.log('🤖 OnePieceTopDecks Autonomous Reveals Bot');
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log('=============================================\n');

  try {
    console.log('[BOT] Checking https://onepiecetopdecks.com/feed/ for new leaks...');
    const res = await fetch('https://onepiecetopdecks.com/feed/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) {
      throw new Error(`Feed fetch returned status ${res.status}`);
    }

    const xml = await res.text();
    const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
    console.log(`[BOT] Found ${itemMatches.length} recent articles in feed.`);

    // Load existing cards
    let existingCards = [];
    if (fs.existsSync(REVEALS_DATA_FILE)) {
      try {
        existingCards = JSON.parse(fs.readFileSync(REVEALS_DATA_FILE, 'utf8'));
      } catch (e) {
        existingCards = [];
      }
    }

    const seenImages = new Set(existingCards.map(c => c.imageUrl).filter(Boolean));
    const seenCodes = new Set(existingCards.map(c => c.code + (c.isAlternateArt ? '-AA' : '')).filter(Boolean));

    let newCardsFound = 0;
    const leakArticles = [];

    for (const itemMatch of itemMatches) {
      const itemXml = itemMatch[1];
      const titleMatch = itemXml.match(/<title>(.*?)<\/title>/i);
      const linkMatch = itemXml.match(/<link>(.*?)<\/link>/i);
      const contentMatch = itemXml.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/i);

      if (!titleMatch || !linkMatch) continue;
      const title = titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/gi, '$1').trim();
      const link = linkMatch[1].trim();

      // Only inspect leaks and upcoming set releases
      const isLeak = title.toLowerCase().includes('leak') || 
                     title.toLowerCase().includes('booster') || 
                     title.toLowerCase().includes('starter') ||
                     title.includes('OP-') || 
                     title.includes('EB-') || 
                     title.includes('ST-');

      if (!isLeak || !contentMatch) continue;

      console.log(`\n[BOT] Processing leak post: "${title}"`);
      const htmlContent = contentMatch[1];

      // Extract all image URLs from post
      const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
      const imgsInPost = [];
      let m;
      while ((m = imgRegex.exec(htmlContent)) !== null) {
        const src = m[1];
        if (src.includes('wp-content/uploads') && 
            !src.includes('Screenshot-2022') && 
            !src.includes('120x120') && 
            !src.includes('cropped-')) {
          imgsInPost.push(src);
        }
      }

      console.log(`[BOT] Found ${imgsInPost.length} card images in this post.`);

      leakArticles.push({
        title,
        link,
        imageCount: imgsInPost.length,
        detectedAt: new Date().toISOString()
      });

      // Download images and OCR if not already seen
      for (const imgUrl of imgsInPost) {
        const filename = path.basename(imgUrl).split('?')[0];
        const localPath = path.join(REVEALS_DIR, filename);
        const publicUrl = `/reveals/${filename}`;

        if (!fs.existsSync(localPath)) {
          console.log(`[BOT] New card image detected: ${filename}`);
          try {
            const imgRes = await fetch(imgUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'Referer': 'https://onepiecetopdecks.com/'
              }
            });

            if (imgRes.ok) {
              const buffer = await imgRes.arrayBuffer();
              fs.writeFileSync(localPath, Buffer.from(buffer));
              console.log(`[BOT] Saved ${filename} (${buffer.byteLength} bytes)`);

              // Run OCR to read text
              console.log(`[BOT] Running OCR on ${filename}...`);
              const { data: { text } } = await Tesseract.recognize(localPath, 'eng');
              const cleanText = text.trim();

              // Detect set, code, character name
              const codeMatch = cleanText.match(/(OP\d{2}-\d{3}|EB\d{2}-\d{3}|ST\d{2}-\d{3})/i) || filename.match(/([A-Z]{2}\d{2}-\d{3})/i);
              const cardCode = codeMatch ? codeMatch[1].toUpperCase() : 'UNKNOWN-' + Math.floor(Math.random() * 1000);
              const isAA = filename.toLowerCase().includes('aa') || filename.toLowerCase().includes('_p') || cleanText.toLowerCase().includes('parallel');

              const isLeader = cleanText.toLowerCase().includes('leader') || filename.toLowerCase().includes('leader') || filename.toLowerCase().includes('ld');
              const isStage = cleanText.toLowerCase().includes('stage');

              const newCard = {
                id: `auto-${filename.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
                code: cardCode,
                name: extractCardName(cleanText, filename),
                set: cardCode.startsWith('OP18') ? 'OP18' : cardCode.startsWith('EB05') ? 'EB05' : 'AUTO',
                setName: cardCode.startsWith('OP18') ? 'The Dominance of God [OP-18]' : 'Heroines Edition Vol.2 [EB-05]',
                category: isLeader ? 'Leader' : isStage ? 'Stage' : 'Character',
                color: extractColors(cleanText),
                rarity: isAA ? 'SP' : isLeader ? 'L' : 'SR',
                isAlternateArt: isAA,
                cost: extractCost(cleanText),
                power: extractPower(cleanText),
                counter: extractCounter(cleanText),
                life: isLeader ? 4 : undefined,
                type: ['One Piece Leaks'],
                effect: cleanText.replace(/\n\s*\n/g, '\n').slice(0, 400),
                effectFr: '(Traduction automatique en attente)',
                revealDate: new Date().toISOString().split('T')[0],
                source: `OnePieceTopDecks Leaks (${title})`,
                sourceEvent: 'OnePieceTopDecks Auto-Sync',
                leakStatus: 'OnePieceTopDecks',
                imageUrl: publicUrl,
                isConfirmed: true
              };

              existingCards.unshift(newCard);
              newCardsFound++;
            }
          } catch (err) {
            console.error(`[BOT] Error processing ${filename}:`, err.message);
          }
        }
      }
    }

    // Save updated reveals data and sync metadata
    fs.writeFileSync(REVEALS_DATA_FILE, JSON.stringify(existingCards, null, 2), 'utf8');

    const syncMeta = {
      lastSyncTime: new Date().toISOString(),
      status: 'ONLINE',
      articlesDetected: leakArticles,
      newCardsAddedThisRun: newCardsFound,
      totalRevealedCards: existingCards.length
    };
    fs.writeFileSync(SYNC_META_FILE, JSON.stringify(syncMeta, null, 2), 'utf8');

    console.log(`\n[BOT] Sync finished: ${newCardsFound} new cards added. Total cards: ${existingCards.length}`);
    return syncMeta;

  } catch (error) {
    console.error('[BOT] Sync error:', error.message);
    const syncMeta = {
      lastSyncTime: new Date().toISOString(),
      status: 'ERROR',
      error: error.message
    };
    fs.writeFileSync(SYNC_META_FILE, JSON.stringify(syncMeta, null, 2), 'utf8');
    return syncMeta;
  }
}

function extractCardName(text, filename) {
  if (text.includes('Franky') || filename.toLowerCase().includes('franky')) return 'Franky';
  if (text.includes('Nico Robin') || filename.toLowerCase().includes('robin')) return 'Nico Robin';
  if (text.includes('Saint Gunko') || filename.toLowerCase().includes('gunko')) return 'Saint Gunko';
  if (text.includes('Saint Shamrock') || filename.toLowerCase().includes('shamrock')) return 'Saint Shamrock';
  if (text.includes('Loki') || filename.toLowerCase().includes('loki')) return 'Loki';
  if (text.includes('Boa Hancock') || filename.toLowerCase().includes('hancock')) return 'Boa Hancock';
  if (text.includes('Shirahoshi') || filename.toLowerCase().includes('shirahoshi')) return 'Shirahoshi';
  if (text.includes('Jewelry Bonney') || filename.toLowerCase().includes('bonney')) return 'Jewelry Bonney';
  if (text.includes('Nami') || filename.toLowerCase().includes('nami')) return 'Nami';
  if (text.includes('Rebecca') || filename.toLowerCase().includes('rebecca')) return 'Rebecca';
  if (text.includes('Vivi') || filename.toLowerCase().includes('vivi')) return 'Nefeltari Vivi';
  return filename.replace(/\.(jpg|png|webp)$/i, '').replace(/[-_]/g, ' ');
}

function extractColors(text) {
  const colors = [];
  const lower = text.toLowerCase();
  if (lower.includes('red')) colors.push('Red');
  if (lower.includes('green')) colors.push('Green');
  if (lower.includes('blue')) colors.push('Blue');
  if (lower.includes('purple')) colors.push('Purple');
  if (lower.includes('black')) colors.push('Black');
  if (lower.includes('yellow')) colors.push('Yellow');
  return colors.length > 0 ? colors : ['Purple'];
}

function extractPower(text) {
  const m = text.match(/(\d{4,5})\s*power/i) || text.match(/\b([3-9]000|1[0-2]000)\b/);
  return m ? parseInt(m[1], 10) : 5000;
}

function extractCost(text) {
  const m = text.match(/cost\s*(?:of)?\s*(\d)/i) || text.match(/\b([1-9])\s*cost\b/i);
  return m ? parseInt(m[1], 10) : 4;
}

function extractCounter(text) {
  if (text.includes('2000') && text.toLowerCase().includes('counter')) return 2000;
  if (text.includes('1000') && text.toLowerCase().includes('counter')) return 1000;
  return 0;
}

// Auto-run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runAutoRevealsSync();
}
