import fs from 'fs';

const cardsRaw = JSON.parse(fs.readFileSync('src/data/cards.json', 'utf8'));
const tournamentsRaw = JSON.parse(fs.readFileSync('src/data/tournaments.json', 'utf8'));
const variantsRaw = JSON.parse(fs.readFileSync('src/data/variants.json', 'utf8'));

// Build lookup maps
const cardsByCode = new Map();
for (const c of cardsRaw) {
  if (c && c.card_code) cardsByCode.set(c.card_code.toUpperCase(), c);
}

function normalizeCardCode(input) {
  if (!input) return '';
  const clean = input.trim().toUpperCase().replace(/[\s_.:]+/g, '-');
  const pMatch = clean.match(/^P-?(\d{1,3})$/);
  if (pMatch) return `P-${pMatch[1].padStart(3, '0')}`;
  const m = clean.match(/^([A-Z]{2,3})-?(\d{1,2})-?(\d{1,3})$/);
  if (m) {
    return `${m[1]}${m[2].padStart(2, '0')}-${m[3].padStart(3, '0')}`;
  }
  return clean;
}

function getCardByCode(code) {
  if (!code) return undefined;
  const direct = cardsByCode.get(code.trim().toUpperCase());
  if (direct) return direct;
  return cardsByCode.get(normalizeCardCode(code));
}

function parseDecklistString(url) {
  const items = [];
  let totalCards = 0;
  if (!url) return { items, totalCards };

  try {
    const queryPart = url.includes('?') ? url.split('?')[1] : url;
    const params = new URLSearchParams(queryPart);
    const deckParam = params.get('deck') || (queryPart.startsWith('deck=') ? queryPart.replace('deck=', '').split('&')[0] : '');

    if (deckParam) {
      const parts = deckParam.split(',');
      for (const p of parts) {
        const [rawCode, rawCount] = p.split(':');
        if (rawCode) {
          const cardCode = normalizeCardCode(rawCode);
          const count = parseInt(rawCount || '1', 10);
          items.push({ cardCode, count });
          totalCards += count;
        }
      }
    }
  } catch (e) {}

  return { items, totalCards };
}

const availableSetGroups = [
  'OP17', 'OP16', 'OP15', 'OP14', 'OP13', 'OP12', 'OP11', 'OP10',
  'OP09', 'OP08', 'OP07', 'OP06', 'OP05', 'OP04', 'OP03', 'OP02', 'OP01',
  'EB01', 'EB02', 'PRB01', 'ALL'
];

function computeMetaForSet(setGroup) {
  const targetSet = setGroup && setGroup !== 'ALL' ? setGroup.trim().toUpperCase() : null;
  const filteredTournaments = targetSet
    ? tournamentsRaw.filter(t => {
        if (t.set_group && t.set_group.toUpperCase() === targetSet) return true;
        if (t.format && t.format.toUpperCase().includes(targetSet)) return true;
        return false;
      })
    : tournamentsRaw;

  const leaderStats = new Map();
  let totalPlacements = 0;

  for (const t of filteredTournaments) {
    if (!t.tournament_results) continue;
    for (const r of t.tournament_results) {
      if (!r.deck_type) continue;
      const leaderCode = r.deck_type.trim().toUpperCase();
      totalPlacements++;

      if (!leaderStats.has(leaderCode)) {
        leaderStats.set(leaderCode, {
          totalTops: 0,
          wins: 0,
          topCutCount: 0,
          sampleDecklists: [],
          cardCounts: new Map()
        });
      }

      const stat = leaderStats.get(leaderCode);
      stat.totalTops++;
      if (r.placement === 1) stat.wins++;
      if (r.placement <= 4) stat.topCutCount++;

      if (r.deck_list_url && r.deck_list_url.length > 0) {
        const parsed = parseDecklistString(r.deck_list_url[0]);
        stat.sampleDecklists.push({
          tournamentName: t.tournament_name,
          playerName: r.player_name || 'Anonymous',
          placement: r.placement,
          decklistUrl: r.deck_list_url[0],
          parsedDeck: parsed
        });

        for (const item of parsed.items) {
          if (!stat.cardCounts.has(item.cardCode)) {
            stat.cardCounts.set(item.cardCode, { totalCopies: 0, appearances: 0 });
          }
          const c = stat.cardCounts.get(item.cardCode);
          c.totalCopies += item.count;
          c.appearances++;
        }
      }
    }
  }

  const results = [];

  for (const [leaderCode, stat] of leaderStats.entries()) {
    const leaderCard = getCardByCode(leaderCode);
    if (!leaderCard) continue;

    const metaShare = totalPlacements > 0 ? (stat.totalTops / totalPlacements) * 100 : 0;
    const topCutConversion = stat.totalTops > 0 ? (stat.topCutCount / stat.totalTops) * 100 : 0;

    let tier = 'Rogue';
    if (metaShare >= 20 || (metaShare >= 14 && stat.wins >= 5)) {
      tier = 'Tier 0';
    } else if (metaShare >= 10 || stat.wins >= 3) {
      tier = 'Tier 1';
    } else if (metaShare >= 5 || stat.wins >= 1) {
      tier = 'Tier 1.5';
    } else if (metaShare >= 2 || stat.totalTops >= 3) {
      tier = 'Tier 2';
    } else {
      tier = 'Tier 3';
    }

    const keyCards = [];
    const totalLists = stat.sampleDecklists.length;

    if (totalLists > 0) {
      for (const [code, cardFreq] of stat.cardCounts.entries()) {
        const cardObj = getCardByCode(code);
        if (!cardObj || cardObj.category === 'Leader') continue;

        const inclusionRate = Math.round((cardFreq.appearances / totalLists) * 100);
        const avgCopies = Math.round((cardFreq.totalCopies / cardFreq.appearances) * 10) / 10;

        if (inclusionRate >= 35) {
          keyCards.push({ card: cardObj, avgCopies, inclusionRate });
        }
      }
      keyCards.sort((a, b) => b.inclusionRate - a.inclusionRate);
    }

    results.push({
      leaderCard,
      tier,
      metaShare: Math.round(metaShare * 10) / 10,
      topCutConversion: Math.round(topCutConversion * 10) / 10,
      tournamentWins: stat.wins,
      totalTops: stat.totalTops,
      sampleDecklists: stat.sampleDecklists.sort((a, b) => a.placement - b.placement).slice(0, 10),
      keyCards: keyCards.slice(0, 12)
    });
  }

  const tierWeight = {
    'Tier 0': 5,
    'Tier 1': 4,
    'Tier 1.5': 3,
    'Tier 2': 2,
    'Tier 3': 1,
    'Rogue': 0
  };

  return results.sort((a, b) => {
    if (tierWeight[b.tier] !== tierWeight[a.tier]) {
      return tierWeight[b.tier] - tierWeight[a.tier];
    }
    return b.totalTops - a.totalTops;
  });
}

// Compute precomputed meta for all sets
const metaBySet = {};
for (const set of availableSetGroups) {
  const meta = computeMetaForSet(set);
  if (meta.length > 0) {
    metaBySet[set] = meta;
    console.log(`Set ${set}: ${meta.length} leaders found (Top: ${meta[0]?.leaderCard?.name})`);
  }
}

fs.writeFileSync('src/data/metaDecksData.json', JSON.stringify(metaBySet));
console.log('Saved src/data/metaDecksData.json successfully! File size:', fs.statSync('src/data/metaDecksData.json').size);
