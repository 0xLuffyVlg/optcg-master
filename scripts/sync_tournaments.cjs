/**
 * scripts/sync_tournaments.cjs
 * 
 * Synchronise automatiquement les tournois compétitifs One Piece TCG depuis OnePieceTopDecks :
 * - Japan EB05/OP18 (Heroines and the Dominance of God)
 * - English EB05/OP18 (Heroines and the Dominance of God)
 * - Japan OP17 (The World's Strongest Warriors)
 * - English OP17 (The World's Strongest Warriors)
 * - Auto-découverte des nouveaux formats sur le hub de OnePieceTopDecks
 * 
 * Fusionne avec src/data/tournaments.json sans doublons, avec tri chronologique UTC strict.
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TOURNAMENTS_FILE = path.resolve(__dirname, '../src/data/tournaments.json');

async function fetchUrl(url, maxRetries = 3) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
    'Referer': 'https://onepiecetopdecks.com/'
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // Attempt 1: Node 18+ native fetch
    try {
      if (typeof fetch === 'function') {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 25000);
        const res = await fetch(url, { headers, signal: controller.signal });
        clearTimeout(timer);
        if (res.ok) {
          const text = await res.text();
          if (text && text.length > 500) {
            return text;
          }
        }
      }
    } catch (e) {
      // fetch error, fallback to curl
    }

    // Attempt 2: Fallback to curl binary
    try {
      const curlBin = process.platform === 'win32' ? 'curl.exe' : 'curl';
      const output = execFileSync(curlBin, ['-s', '-L', '--max-time', '30', url], {
        maxBuffer: 30 * 1024 * 1024,
        encoding: 'utf8'
      });
      if (output && output.length > 500) {
        return output;
      }
    } catch (err) {
      // curl error
    }

    if (attempt < maxRetries) {
      await new Promise(r => setTimeout(r, 1500 * attempt));
    }
  }

  return '';
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

function parsePageHtml(html, sourceName, setGroup, prefix) {
  if (!html) return [];
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
    const tournamentName = cleanCells[9] || `${setGroup} Tournament`;
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
      id: `${setGroup.toLowerCase()}-${prefix}-${i}`,
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
      set_group: setGroup,
      format: `${sourceName} - ${setGroup}`,
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

function makeFingerprint(t) {
  const date = (t.start_date || '').trim();
  const player = (t.player_name || '').trim().toLowerCase();
  const leader = (t.deck_type || '').trim().toUpperCase();
  const host = (t.host || '').trim().toLowerCase();
  const placement = (t.placement_str || '').trim().toLowerCase();
  return `${date}|${player}|${leader}|${host}|${placement}`;
}

async function syncTournaments() {
  console.log('===========================================================');
  console.log('🏆 SYNCHRONISATION AUTOMATIQUE DES TOURNOIS COMPETITIFS');
  console.log('===========================================================\n');

  if (!fs.existsSync(TOURNAMENTS_FILE)) {
    console.error('Fichier introuvable :', TOURNAMENTS_FILE);
    process.exit(1);
  }

  const existing = JSON.parse(fs.readFileSync(TOURNAMENTS_FILE, 'utf8'));
  console.log(`1. Base locale chargée : ${existing.length} tournois existants.`);

  // 1. Définition des cibles prioritaires (EB05/OP18 et OP17)
  const targets = [
    {
      url: 'https://onepiecetopdecks.com/deck-list/japan-eb05op18-deck-list-heroines-and-the-dominance-of-god/',
      sourceName: 'Japan EB05/OP18',
      setGroup: 'OP18',
      prefix: 'jp'
    },
    {
      url: 'https://onepiecetopdecks.com/deck-list/english-eb05op18-deck-list-heroines-and-the-dominance-of-god/',
      sourceName: 'English EB05/OP18',
      setGroup: 'OP18',
      prefix: 'eng'
    },
    {
      url: 'https://onepiecetopdecks.com/deck-list/japan-op17-deck-list-the-worlds-strongest-warriors/',
      sourceName: 'Japan OP17',
      setGroup: 'OP17',
      prefix: 'jp'
    },
    {
      url: 'https://onepiecetopdecks.com/deck-list/english-op17-deck-list-the-worlds-strongest-warriors/',
      sourceName: 'English OP17',
      setGroup: 'OP17',
      prefix: 'eng'
    }
  ];

  // 2. Découverte optionnelle depuis le hub OnePieceTopDecks
  try {
    const hubHtml = await fetchUrl('https://onepiecetopdecks.com/deck-list/', 2);
    if (hubHtml) {
      const linkRegex = /href="(https:\/\/onepiecetopdecks\.com\/deck-list\/[^"]+)"/gi;
      let match;
      const discoveredUrls = new Set();
      while ((match = linkRegex.exec(hubHtml)) !== null) {
        const u = match[1];
        if (u.includes('op19') || u.includes('op20') || u.includes('eb06')) {
          discoveredUrls.add(u);
        }
      }
      for (const dUrl of discoveredUrls) {
        const isJp = dUrl.toLowerCase().includes('japan') || dUrl.toLowerCase().includes('jp');
        const setMatch = dUrl.match(/(op\d+|eb\d+)/i);
        const setCode = setMatch ? setMatch[1].toUpperCase() : 'OP18';
        targets.push({
          url: dUrl,
          sourceName: `${isJp ? 'Japan' : 'English'} ${setCode}`,
          setGroup: setCode,
          prefix: isJp ? 'jp' : 'eng'
        });
      }
    }
  } catch (hubErr) {
    console.warn('[SYNC WARNING] Impossible de lire le hub deck-list:', hubErr.message);
  }

  console.log(`2. Scraping de ${targets.length} pages de métagame actives...`);
  const scraped = [];

  for (const target of targets) {
    try {
      console.log(`   -> Téléchargement de ${target.sourceName} (${target.url})...`);
      const html = await fetchUrl(target.url);
      if (html) {
        const tourneys = parsePageHtml(html, target.sourceName, target.setGroup, target.prefix);
        console.log(`      Trouvé : ${tourneys.length} tournois.`);
        scraped.push(...tourneys);
      } else {
        console.warn(`      [AVERTISSEMENT] Aucune donnée reçue pour ${target.sourceName}`);
      }
    } catch (err) {
      console.warn(`      [AVERTISSEMENT] Erreur scraping ${target.sourceName}:`, err.message);
    }
    await new Promise(r => setTimeout(r, 800));
  }

  console.log(`\n3. Analyse des résultats : ${scraped.length} tournois récupérés au total.`);

  // 3. Déduplication précise par empreinte unique
  const existingFingerprints = new Map();
  const existingIds = new Set();

  for (let idx = 0; idx < existing.length; idx++) {
    const t = existing[idx];
    if (t.id) existingIds.add(t.id.toLowerCase());
    const fp = makeFingerprint(t);
    existingFingerprints.set(fp, idx);
  }

  let added = 0;
  let updated = 0;
  const toAdd = [];

  for (const t of scraped) {
    const fp = makeFingerprint(t);
    if (existingFingerprints.has(fp)) {
      const idx = existingFingerprints.get(fp);
      // Actualise si nécessaire
      existing[idx] = {
        ...existing[idx],
        ...t,
        id: existing[idx].id || t.id // préserve l'ID d'origine
      };
      updated++;
    } else {
      existingFingerprints.set(fp, -1);
      // Assurer un ID unique sans collision
      let finalId = t.id;
      if (existingIds.has(finalId.toLowerCase())) {
        finalId = `${t.id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      }
      existingIds.add(finalId.toLowerCase());
      t.id = finalId;
      toAdd.push(t);
      added++;
    }
  }

  console.log(`4. Fusion : +${added} nouveaux tournois ajoutés, ${updated} actualisés.`);
  const all = [...toAdd, ...existing];

  // Tri strict décroissant par date UTC (du plus récent au plus ancien)
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

  console.log(`5. Sauvegardé avec succès : ${all.length} tournois au total.`);
  console.log(`   Plus récent : [${all[0]?.start_date}] ${all[0]?.tournament_name} (${all[0]?.deck_name}) - ${all[0]?.player_name}`);
  console.log('===========================================================');
}

syncTournaments().catch(err => {
  console.warn('[SYNC WARNING]: Impossible de finaliser la mise à jour tournois ce jour :', err.message);
  process.exit(0);
});
