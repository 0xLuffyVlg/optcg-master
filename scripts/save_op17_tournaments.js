import fs from 'fs';

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

function parsePage(filename, sourceName, formatGroup) {
  const html = fs.readFileSync(`scripts/${filename}.html`, 'utf8');
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
      id: `op17-${filename}-${i}`,
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
      set_group: formatGroup,
      format: `${sourceName} - ${formatGroup}`,
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

const japan = parsePage('japan_op17', 'Japan OP17', 'OP17');
const english = parsePage('english_op17', 'English OP17', 'OP17');
const allTourneys = [...japan, ...english];

fs.writeFileSync('src/data/tournaments.json', JSON.stringify(allTourneys, null, 2));
console.log(`Saved ${allTourneys.length} OP17 tournaments to src/data/tournaments.json! File size:`, fs.statSync('src/data/tournaments.json').size);
