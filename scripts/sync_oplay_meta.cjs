/**
 * scripts/sync_oplay_meta.cjs
 * 
 * Récupère et extrait l'intégralité des statistiques méta et matchups
 * depuis le simulateur en ligne OPlayTCG (oplaytcg.com/en/meta-stats).
 * 
 * Données extraites :
 * - Périodes : 7 jours (d7), 30 jours (d30), All-time (all)
 * - Métriques : Winrate global, Winrate Tour 1 (Going 1st) vs Tour 2 (Going 2nd)
 * - Matrice complète des matchups entre leaders (victoires, défaites, winrate)
 * - Nombre de parties jouées et joueurs uniques
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.resolve(__dirname, '../src/data/oplay_meta_stats.json');

async function fetchOPlayHtml(url = 'https://oplaytcg.com/en/meta-stats') {
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
  const headers = {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8'
  };

  try {
    if (typeof fetch === 'function') {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(url, { headers, signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 50000) return text;
      }
    }
  } catch (e) {
    // Fallback to curl
  }

  const curlBin = process.platform === 'win32' ? 'curl.exe' : 'curl';
  return execFileSync(curlBin, [
    '-s', '-L', '--max-time', '45',
    '-A', userAgent,
    url
  ], { maxBuffer: 30 * 1024 * 1024, encoding: 'utf8' });
}

function extractPayload(html) {
  const regex = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const raw = match[1];
    if (raw.includes('payload') && raw.includes('windows')) {
      const unescaped = raw
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t');

      const startIdx = unescaped.indexOf('{"payload":');
      if (startIdx === -1) continue;

      let depth = 0;
      let endIdx = -1;
      let inString = false;
      let escape = false;

      for (let i = startIdx; i < unescaped.length; i++) {
        const ch = unescaped[i];
        if (escape) { escape = false; continue; }
        if (ch === '\\') { escape = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (!inString) {
          if (ch === '{') depth++;
          else if (ch === '}') {
            depth--;
            if (depth === 0) { endIdx = i + 1; break; }
          }
        }
      }

      if (endIdx !== -1) {
        return JSON.parse(unescaped.substring(startIdx, endIdx));
      }
    }
  }
  return null;
}

function processPayload(rawJson) {
  const payload = rawJson.payload;
  if (!payload || !payload.windows) {
    throw new Error('Structure payload invalide');
  }

  let extractedAt = new Date().toISOString();
  try {
    if (fs.existsSync(OUTPUT_FILE)) {
      const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
      if (existing && existing.generatedAt === payload.gen && existing.extractedAt) {
        extractedAt = existing.extractedAt;
      }
    }
  } catch (e) {}

  const result = {
    source: 'OPlayTCG Simulator (oplaytcg.com)',
    extractedAt,
    generatedAt: payload.gen,
    period: {
      from: payload.from,
      to: payload.to
    },
    cutRules: payload.cut,
    windows: {}
  };

  for (const windowKey of Object.keys(payload.windows)) {
    const w = payload.windows[windowKey];
    const ranked = w.ranked;
    if (!ranked) continue;

    const totalGames = ranked.n || 0;
    const firstWins = ranked.firstWins || 0;
    const globalFirstWinrate = totalGames > 0 ? (firstWins / totalGames) * 100 : 50;

    const prevMap = new Map();
    if (Array.isArray(ranked.prev)) {
      ranked.prev.forEach(([code, games, wins], idx) => {
        prevMap.set(code, {
          rank: idx + 1,
          games,
          wins,
          winrate: games > 0 ? Math.round((wins / games) * 1000) / 10 : 0
        });
      });
    }

    const leadersList = [];
    if (Array.isArray(ranked.leaders)) {
      for (const l of ranked.leaders) {
        const leaderCode = l.l;
        const games = l.g || 0;
        const wins = l.w || 0;
        const winrate = games > 0 ? Math.round((wins / games) * 1000) / 10 : 0;

        const firstGames = l.gf || 0;
        const firstWins = l.wf || 0;
        const firstWinrate = firstGames > 0 ? Math.round((firstWins / firstGames) * 1000) / 10 : 0;

        const secondGames = games - firstGames;
        const secondWins = wins - firstWins;
        const secondWinrate = secondGames > 0 ? Math.round((secondWins / secondGames) * 1000) / 10 : 0;

        const matchups = (l.m || []).map(m => {
          const mGames = m.g || 0;
          const mWins = m.w || 0;
          return {
            opponentLeader: m.o,
            games: mGames,
            wins: mWins,
            winrate: mGames > 0 ? Math.round((mWins / mGames) * 1000) / 10 : 0,
            firstGames: m.gf || 0,
            firstWins: m.wf || 0
          };
        }).sort((a, b) => b.games - a.games);

        const rankInfo = prevMap.get(leaderCode);

        leadersList.push({
          leaderCode,
          rank: rankInfo?.rank || 999,
          totalGames: games,
          totalWins: wins,
          winrate,
          firstTurn: {
            games: firstGames,
            wins: firstWins,
            winrate: firstWinrate
          },
          secondTurn: {
            games: secondGames,
            wins: secondWins,
            winrate: secondWinrate
          },
          uniquePlayers: l.u || 0,
          matchupsCount: matchups.length,
          matchups
        });
      }
    }

    leadersList.sort((a, b) => b.totalGames - a.totalGames);

    result.windows[windowKey] = {
      days: w.dias,
      totalRankedGames: totalGames,
      globalFirstPlayerWinrate: Math.round(globalFirstWinrate * 10) / 10,
      leadersCount: leadersList.length,
      leaders: leadersList
    };
  }

  return result;
}

async function main() {
  console.log('===========================================================');
  console.log('⚡ EXTRACTION DES META-STATS OPLAYTCG (SIMULATEUR EN DIRECT)');
  console.log('===========================================================\n');

  console.log('1. Téléchargement de la page https://oplaytcg.com/en/meta-stats...');
  const html = await fetchOPlayHtml();
  console.log(`   Page téléchargée : ${(html.length / (1024 * 1024)).toFixed(2)} Mo.`);

  console.log('2. Décodage du stream React Server Component (Next.js)...');
  const rawData = extractPayload(html);
  if (!rawData) {
    console.error('❌ Échec : Impossible d\'extraire les données du stream RSC.');
    process.exit(1);
  }

  console.log('3. Traitement et structuration des statistiques...');
  const processed = processPayload(rawData);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(processed, null, 2), 'utf8');
  console.log(`4. Sauvegardé avec succès dans : ${OUTPUT_FILE}`);

  const publicFile = path.resolve(__dirname, '../public/data/oplay_meta_stats.json');
  fs.writeFileSync(publicFile, JSON.stringify(processed), 'utf8');

  const summaryFile = path.resolve(__dirname, '../src/data/oplay_summary.json');
  const summary = {
    source: processed.source,
    generatedAt: processed.generatedAt,
    period: processed.period,
    windows: {}
  };
  for (const wKey of Object.keys(processed.windows || {})) {
    const w = processed.windows[wKey];
    summary.windows[wKey] = {
      days: w.days,
      totalRankedGames: w.totalRankedGames,
      globalFirstPlayerWinrate: w.globalFirstPlayerWinrate,
      leadersCount: w.leadersCount,
      leaders: (w.leaders || []).map(l => ({
        leaderCode: l.leaderCode,
        rank: l.rank,
        totalGames: l.totalGames,
        totalWins: l.totalWins,
        winrate: l.winrate,
        firstTurn: l.firstTurn,
        secondTurn: l.secondTurn,
        uniquePlayers: l.uniquePlayers,
        topMatchups: (l.matchups || []).slice(0, 15)
      }))
    };
  }
  fs.writeFileSync(summaryFile, JSON.stringify(summary), 'utf8');
  console.log('   Également synchronisé public/data/oplay_meta_stats.json et src/data/oplay_summary.json');

  const d7 = processed.windows.d7;
  if (d7) {
    console.log(`\n📊 Aperçu Fenêtre 7 Jours :`);
    console.log(`   - Parties classées analysées : ${d7.totalRankedGames.toLocaleString()}`);
    console.log(`   - Taux de victoire Joueur 1 (Going 1st) : ${d7.globalFirstPlayerWinrate}%`);
    console.log(`   - Leaders compétitifs répertoriés : ${d7.leadersCount}`);
    console.log('\n🏆 Top 5 Leaders les plus joués :');
    d7.leaders.slice(0, 5).forEach((lead, i) => {
      console.log(`   ${i + 1}. [${lead.leaderCode}] : ${lead.totalGames.toLocaleString()} matchs | WR: ${lead.winrate}% (1st: ${lead.firstTurn.winrate}% | 2nd: ${lead.secondTurn.winrate}%) - ${lead.uniquePlayers} joueurs`);
    });
  }

  console.log('\n===========================================================');
}

main()
  .then(() => {
    console.log('✓ Synchronisation OPlay terminée avec succès.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Erreur:', err.message);
    process.exit(1);
  });
