import fs from 'fs';

const tournaments = JSON.parse(fs.readFileSync('src/data/tournaments.json', 'utf8'));
const cards = JSON.parse(fs.readFileSync('src/data/cards.json', 'utf8'));
const cardMap = new Map(cards.map(c => [c.card_code.toUpperCase(), c]));

function parseDeckUrl(url) {
  if (!url) return null;
  const m = url.match(/deck=([^&]+)/);
  if (!m) return null;
  const items = m[1].split(',').map(part => {
    const [code, count] = part.split(':');
    return { code: code.toUpperCase().trim(), count: parseInt(count, 10) || 1 };
  });
  return items;
}

function testLeaderVariants(leaderCode) {
  const matching = [];

  for (const t of tournaments) {
    if (t.tournament_results) {
      for (const r of t.tournament_results) {
        if ((r.deck_type || '').toUpperCase() === leaderCode.toUpperCase()) {
          const url = r.deck_list_url?.[0];
          const parsed = parseDeckUrl(url);
          if (parsed && parsed.length >= 8) {
            matching.push({
              placement: r.placement || 8,
              playerName: r.player_name || 'Joueur Compétitif',
              tournamentName: t.tournament_name || 'Tournoi Officiel',
              deckUrl: url,
              items: parsed
            });
          }
        }
      }
    }
  }

  console.log(`Total lists for ${leaderCode}: ${matching.length}`);

  // Create fingerprints
  const clusters = new Map();

  for (const list of matching) {
    // Sort items by code to create consistent signature
    const sorted = [...list.items].sort((a, b) => a.code.localeCompare(b.code));
    const fingerprint = sorted.map(i => `${i.code}:${i.count}`).join(',');

    if (!clusters.has(fingerprint)) {
      clusters.set(fingerprint, {
        fingerprint,
        items: list.items,
        totalCopies: list.items.reduce((s, i) => s + i.count, 0),
        decks: []
      });
    }
    clusters.get(fingerprint).decks.push(list);
  }

  console.log(`Unique distinct variants found: ${clusters.size}`);
  const sortedClusters = Array.from(clusters.values()).sort((a, b) => b.decks.length - a.decks.length);

  sortedClusters.slice(0, 6).forEach((c, idx) => {
    console.log(`Variant #${idx + 1}: ${c.decks.length} fois joué | Cartes uniques: ${c.items.length} | Total cartes: ${c.totalCopies}`);
    console.log(`Sample tournament: ${c.decks[0].tournamentName} (${c.decks[0].playerName}, placement: ${c.decks[0].placement})`);
  });
}

testLeaderVariants('OP17-039');
testLeaderVariants('OP01-060');
