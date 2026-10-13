import fs from 'fs';

const tournaments = JSON.parse(fs.readFileSync('src/data/tournaments.json', 'utf8'));
const cards = JSON.parse(fs.readFileSync('src/data/cards.json', 'utf8'));
const cardsByCode = new Map();
cards.forEach(c => {
  if (c && c.card_code) cardsByCode.set(c.card_code.toUpperCase(), c);
});

function getCard(code) {
  return cardsByCode.get(code.toUpperCase());
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
          const cardCode = rawCode.trim().toUpperCase();
          const count = parseInt(rawCount || '1', 10);
          items.push({ cardCode, count });
          totalCards += count;
        }
      }
    }
  } catch (e) {}

  return { items, totalCards };
}

function computeLeaderVariants(leaderCode) {
  const matchingDecks = [];
  for (const t of tournaments) {
    for (const r of t.tournament_results) {
      if ((r.deck_type || '').toUpperCase() === leaderCode.toUpperCase()) {
        const url = r.deck_list_url?.[0];
        if (url) {
          const parsed = parseDecklistString(url);
          matchingDecks.push({
            placement: r.placement || 8,
            playerName: r.player_name,
            tournamentName: t.tournament_name,
            deckUrl: url,
            items: parsed.items,
            score: r.score
          });
        }
      }
    }
  }
  return matchingDecks;
}

const xebecDecks = computeLeaderVariants('OP17-039');
console.log(`Rocks.D.Xebec OP17-039 has ${xebecDecks.length} tournament decklists!`);
const mihawkDecks = computeLeaderVariants('OP14-020');
console.log(`Dracule Mihawk OP14-020 has ${mihawkDecks.length} tournament decklists!`);
const aceDecks = computeLeaderVariants('OP16-001');
console.log(`Portgas.D.Ace OP16-001 has ${aceDecks.length} tournament decklists!`);
