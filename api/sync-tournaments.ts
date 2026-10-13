import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

function parseDeckComposition(compStr: string) {
  if (!compStr) return { leader: '', cards: [] as { cardCode: string; count: number }[] };
  const items = compStr.split('a').filter(Boolean);
  let leader = '';
  const cards: { cardCode: string; count: number }[] = [];

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

function parseScore(placementStr: string) {
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

function parsePageHtml(html: string, sourceName: string, prefix: string) {
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  const tournaments: any[] = [];

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

function parseTournamentDateToTimestamp(dateStr?: string): number {
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
  const isoMatch = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    return Date.UTC(year, month, day);
  }

  // Pattern 3: Mon DD, YYYY
  const monthNames: Record<string, number> = {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
      'Referer': 'https://onepiecetopdecks.com/'
    };

    // Fetch both target pages sequentially with delay to avoid rate-limiting
    const jpRes = await fetch('https://onepiecetopdecks.com/deck-list/japan-op17-deck-list-the-worlds-strongest-warriors/', { headers });
    await new Promise(r => setTimeout(r, 1000));
    const engRes = await fetch('https://onepiecetopdecks.com/deck-list/english-op17-deck-list-the-worlds-strongest-warriors/', { headers });

    let jpTourneys: any[] = [];
    let engTourneys: any[] = [];

    if (jpRes.ok) {
      const jpHtml = await jpRes.text();
      jpTourneys = parsePageHtml(jpHtml, 'Japan OP17', 'jp');
    }

    if (engRes.ok) {
      const engHtml = await engRes.text();
      engTourneys = parsePageHtml(engHtml, 'English OP17', 'eng');
    }

    // Combine and sort strictly by date descending (newest first)
    const allCombined = [...jpTourneys, ...engTourneys].sort((a, b) => {
      const diff = parseTournamentDateToTimestamp(b.start_date) - parseTournamentDateToTimestamp(a.start_date);
      if (diff !== 0) return diff;
      return (a.placement || 8) - (b.placement || 8);
    });

    // Upsert into Supabase if configured
    if (SUPABASE_URL && SUPABASE_ANON_KEY && allCombined.length > 0) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        await supabase.from('live_tournaments').upsert(
          allCombined.map(t => ({
            id: t.id,
            tournament_name: t.tournament_name,
            set_group: t.set_group,
            country: t.country,
            host: t.host,
            start_date: t.start_date,
            placement_str: t.placement_str,
            deck_type: t.deck_type,
            player_name: t.player_name,
            score: t.score,
            tournament_results: t.tournament_results,
            updated_at: new Date().toISOString()
          })),
          { onConflict: 'id' }
        );
      } catch (e: any) {
        console.warn('Supabase tournament upsert error:', e.message);
      }
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      counts: {
        japan: jpTourneys.length,
        english: engTourneys.length,
        total: allCombined.length
      },
      tournaments: allCombined
    });
  } catch (error: any) {
    console.error('OP17 Tournament sync error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
