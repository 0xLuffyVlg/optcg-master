import fs from 'fs';

const tournaments = JSON.parse(fs.readFileSync('src/data/tournaments.json', 'utf8'));
const cards = JSON.parse(fs.readFileSync('src/data/cards.json', 'utf8'));
const cardMap = new Map(cards.map(c => [c.card_code.toUpperCase(), c]));

function parseDecklistString(deckString) {
  if (!deckString) return { leaderCode: null, items: [] };
  const clean = deckString.trim();
  const egmanMatch = clean.match(/deck=([^&]+)/);
  if (egmanMatch) {
    const rawPairs = egmanMatch[1].split(',');
    let leaderCode = null;
    const items = [];
    for (const pair of rawPairs) {
      const [code, countStr] = pair.split(':');
      if (code && countStr) {
        const count = parseInt(countStr, 10);
        items.push({ cardCode: code.toUpperCase().trim(), count: isNaN(count) ? 1 : count });
      }
    }
    return { leaderCode, items };
  }
  return { leaderCode: null, items: [] };
}

function testAllVariants(leaderCode) {
  const matchingDecks = [];
  for (const t of tournaments) {
    if (t.tournament_results) {
      for (const r of t.tournament_results) {
        if ((r.deck_type || '').toUpperCase() === leaderCode) {
          const url = r.deck_list_url?.[0];
          if (url) {
            const parsed = parseDecklistString(url);
            if (parsed && parsed.items.length >= 6) {
              matchingDecks.push({
                placement: r.placement || 8,
                playerName: r.player_name || 'Joueur Compétitif',
                tournamentName: t.tournament_name || 'Tournoi Officiel',
                deckUrl: url,
                items: parsed.items
              });
            }
          }
        }
      }
    }
  }

  console.log(`Matching decks: ${matchingDecks.length}`);

  const clusterMap = new Map();
  for (const deck of matchingDecks) {
    const sorted = [...deck.items]
      .filter(i => i.cardCode.toUpperCase() !== leaderCode)
      .sort((a, b) => a.cardCode.localeCompare(b.cardCode));
    const fingerprint = sorted.map(i => `${i.cardCode}:${i.count}`).join(',');
    if (!clusterMap.has(fingerprint)) {
      clusterMap.set(fingerprint, { items: sorted, decks: [] });
    }
    clusterMap.get(fingerprint).decks.push(deck);
  }

  console.log(`Cluster count: ${clusterMap.size}`);
  let idx = 0;
  for (const [fp, cluster] of clusterMap.entries()) {
    idx++;
    let resolvedCards = 0;
    let missingCards = [];
    for (const it of cluster.items) {
      if (cardMap.has(it.cardCode)) {
        resolvedCards += it.count;
      } else {
        missingCards.push(it.cardCode);
      }
    }
    console.log(`Cluster #${idx}: ${cluster.items.length} unique cards, resolved: ${resolvedCards} cards, missing: ${missingCards.length} (${missingCards.join(', ')})`);
    if (idx >= 6) break;
  }
}

testAllVariants('OP17-039');
testAllVariants('OP01-060');
