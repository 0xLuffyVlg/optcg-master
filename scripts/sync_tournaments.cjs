/**
 * scripts/sync_tournaments.cjs
 * 
 * Synchronise automatiquement les tournois compétitifs One Piece TCG depuis OnePieceTopDecks :
 * - Japan OP17 (The World's Strongest Warriors)
 * - English OP17 (The World's Strongest Warriors)
 * 
 * Fusionne avec src/data/tournaments.json sans doublons, avec tri chronologique UTC strict.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const TOURNAMENTS_FILE = path.resolve(__dirname, '../src/data/tournaments.json');

function getUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
        'Referer': 'https://onepiecetopdecks.com/'
      }
    }, res => {
      if (res.statusCode !== 200) {
        console.warn(`[SYNC] ${url} returned status ${res.statusCode}`);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseDeckComposition(compStr) {
  if (!compStr) return { leader: '', cards: [] };
  const items = compStr.split('a').filter(Boolean);
  let leader = '';
  const cards = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const match = item.match(/^(\d+)n([A-Z0-9]+-\d{3})/i);
    if (match) {
      const count = parseInt(match[1], 10);
      const code = match[2].toUpperCase();
      if (i === 0) {
        leader = code;
      } else {
        cards.push({ cardCode: code, count });
      }
    }
  }
  return { leader, cards };
}

function parseScore(placementStr) {
  let wins = 0;
  let losses = 0;
  const scoreMatch = placementStr.match(/\((\d+)-(\d+)\)/);
  if (scoreMatch) {
    wins = parseInt(scoreMatch[1], 10);
    losses = parseInt(scoreMatch[2], 10);
  } else {
    if (placementStr.toLowerCase().includes('1st') || placementStr.toLowerCase().includes('winner')) {
      wins = 5;
      losses = 0;
    } else if (placementStr.toLowerCase().includes('2nd')) {
      wins = 4;
      losses = 1;
    } else if (placementStr.toLowerCase().includes('t4') || placementStr.toLowerCase().includes('top 4')) {
      wins = 3;
      losses = 1;
    } else if (placementStr.toLowerCase().includes('t8') || placementStr.toLowerCase().includes('top 8')) {
      wins = 3;
      losses = 2;
    } else {
      wins = 2;
      losses = 1;
    }
  }
  const matches = wins + losses;
  const winRate = matches > 0 ? Math.round((wins / matches) * 1000) / 10 : 50;
  return { wins, losses, matches, winRate };
}

function parseTournamentDateToTimestamp(dateStr) {
  if (!dateStr) return 0;
  const clean = String(dateStr).trim();

  // Pattern 1: M/D/YYYY or MM/DD/YYYY or M-D-YYYY
  const usMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (usMatch) {
    const month = parseInt(usMatch[1], 10) - 1;
    const day = parseInt(usMatch[2], 10);
    const year = parseInt(usMatch[3], 10);
    return Date.UTC(year, month, day);
  }

  // Pattern 2: YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    return Date.UTC(year, month, day);
  }

  // Pattern 3: Mon DD, YYYY
  const monthNames = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };
  const namedMatch = clean.match(/^([A-Za-z]{3})\s+(\d{1,2}),?\s+(\d{4})$/);
  if (namedMatch) {
    const mStr = namedMatch[1].toLowerCase().slice(0, 3);
    if (mStr in monthNames) {
      const month = monthNames[mStr];
      const day = parseInt(namedMatch[2], 10);
      const year = parseInt(namedMatch[3], 10);
      return Date.UTC(year, month, day);
    }
  }

  const ts = Date.parse(clean);
  return isNaN(ts) ? 0 : ts;
}

function parsePageHtml(html, sourceName, prefix) {
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  const tournaments = [];

  for (let i = 1; i < rows.length; i++) {
    const rowHtml = rows[i][1];
    const cells = [...rowHtml.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(m => m[1]);
    if (cells.length < 10) continue;

    const compRaw = cells[0].replace(/<[^>]+>/g, '').trim();
    const { leader, cards } = parseDeckComposition(compRaw);
    if (!leader) continue;

    const cleanCells = cells.map(c => c.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    const color = cleanCells[2] || '';
    const deckName = cleanCells[4] || '';
    const dateStr = cleanCells[5] || '';
    const country = cleanCells[6] || (sourceName.includes('Japan') ? 'JP' : 'Global');
    const author = cleanCells[7] || 'Anonymous';
    const placementStr = cleanCells[8] || 'Top Cut';
    const tournamentName = cleanCells[9] || 'OP17 Tournament';
    const host = cleanCells[10] || 'Official Store';

    let placement = 8;
    if (placementStr.toLowerCase().includes('1st') || placementStr.toLowerCase().includes('winner')) {
      placement = 1;
    } else if (placementStr.toLowerCase().includes('2nd')) {
      placement = 2;
    } else if (placementStr.toLowerCase().includes('t4') || placementStr.toLowerCase().includes('top 4')) {
      placement = 4;
    } else if (placementStr.toLowerCase().includes('t8') || placementStr.toLowerCase().includes('top 8')) {
      placement = 8;
    }

    const score = parseScore(placementStr);
    const deckQuery = [`${leader}:1`, ...cards.map(c => `${c.cardCode}:${c.count}`)].join(',');
    const decklistUrl = `https://deckbuilder.egmanevents.com/?deck=${deckQuery}&type=optcg`;

    tournaments.push({
      id: `op17-${prefix}-${i}`,
      tournament_name: tournamentName,
      source_name: sourceName,
      start_date: dateStr,
      country: country,
      host: host,
      player_name: author,
      deck_name: deckName,
      deck_type: leader,
      placement_str: placementStr,
      placement: placement,
      score: score,
      set_group: 'OP17',
      format: `${sourceName} - OP17`,
      deck_color: color,
      deck_composition_raw: compRaw,
      tournament_results: [
        {
          player_name: author,
          deck_type: leader,
          placement: placement,
          deck_list_url: [decklistUrl],
          country: country,
          host: host,
          placement_str: placementStr,
          score: score
        }
      ]
    });
  }

  return tournaments;
}

async function syncTournaments() {
  console.log('===========================================================');
  console.log('🏆 SYNCHRONISATION AUTOMATIQUE DES TOURNOIS');
  console.log('===========================================================\n');

  if (!fs.existsSync(TOURNAMENTS_FILE)) {
    console.error('Fichier introuvable :', TOURNAMENTS_FILE);
    process.exit(1);
  }

  const existing = JSON.parse(fs.readFileSync(TOURNAMENTS_FILE, 'utf8'));
  console.log(`1. Base locale chargée : ${existing.length} tournois existants.`);

  console.log('2. Scraping de OnePieceTopDecks (Japan OP17 & English OP17)...');
  const jpHtml = await getUrl('https://onepiecetopdecks.com/deck-list/japan-op17-deck-list-the-worlds-strongest-warriors/');
  await new Promise(r => setTimeout(r, 1200));
  const engHtml = await getUrl('https://onepiecetopdecks.com/deck-list/english-op17-deck-list-the-worlds-strongest-warriors/');

  const jpTourneys = parsePageHtml(jpHtml, 'Japan OP17', 'jp');
  const engTourneys = parsePageHtml(engHtml, 'English OP17', 'eng');
  console.log(`   Récupéré : ${jpTourneys.length} tournois JP, ${engTourneys.length} tournois ENG.`);

  const scraped = [...jpTourneys, ...engTourneys];

  const existingUrls = new Set();
  const existingIds = new Set();
  for (const t of existing) {
    if (t.id) existingIds.add(t.id.toLowerCase());
    const u = t.tournament_results?.[0]?.deck_list_url?.[0];
    if (u) existingUrls.add(u);
  }

  let added = 0;
  let updated = 0;
  const toAdd = [];

  for (const t of scraped) {
    const url = t.tournament_results?.[0]?.deck_list_url?.[0];
    if (url && existingUrls.has(url)) {
      const idx = existing.findIndex(e => e.tournament_results?.[0]?.deck_list_url?.[0] === url);
      if (idx !== -1) {
        existing[idx] = t;
        updated++;
      }
    } else {
      if (url) existingUrls.add(url);
      if (existingIds.has(t.id.toLowerCase())) {
        t.id = `${t.id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      }
      existingIds.add(t.id.toLowerCase());
      toAdd.push(t);
      added++;
    }
  }

  console.log(`3. Fusion : +${added} nouveaux tournois, ${updated} actualisés.`);
  const all = [...toAdd, ...existing];

  // Tri strict décroissant par date UTC
  all.sort((a, b) => {
    const diff = parseTournamentDateToTimestamp(b.start_date) - parseTournamentDateToTimestamp(a.start_date);
    if (diff !== 0) return diff;
    return (a.placement || 8) - (b.placement || 8);
  });

  fs.writeFileSync(TOURNAMENTS_FILE, JSON.stringify(all, null, 2), 'utf8');
  const publicTournaments = path.resolve(__dirname, '../public/data/tournaments.json');
  fs.writeFileSync(publicTournaments, JSON.stringify(all), 'utf8');
  const initialTournaments = path.resolve(__dirname, '../src/data/tournaments_initial.json');
  fs.writeFileSync(initialTournaments, JSON.stringify(all.slice(0, 50)), 'utf8');
  console.log(`4. Sauvegardé avec succès : ${all.length} tournois au total.`);
  console.log(`   Plus récent : [${all[0]?.start_date}] ${all[0]?.tournament_name} - ${all[0]?.player_name}`);
  console.log('\n===========================================================');
}

syncTournaments().catch(err => {
  console.error('[SYNC ERROR]:', err);
  process.exit(1);
});
