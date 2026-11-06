const fs = require('fs');
const path = require('path');

const srcFile = path.resolve(__dirname, '../src/data/oplay_meta_stats.json');
const publicFile = path.resolve(__dirname, '../public/data/oplay_meta_stats.json');
const summaryFile = path.resolve(__dirname, '../src/data/oplay_summary.json');

const raw = JSON.parse(fs.readFileSync(srcFile, 'utf8'));

// Copy full file to public/data/
fs.writeFileSync(publicFile, JSON.stringify(raw), 'utf8');
console.log('Copied full oplay_meta_stats.json to public/data/');

// Build compact summary for instant bundling without bloat
const summary = {
  source: raw.source,
  generatedAt: raw.generatedAt,
  period: raw.period,
  windows: {}
};

for (const wKey of Object.keys(raw.windows || {})) {
  const w = raw.windows[wKey];
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
const stat = fs.statSync(summaryFile);
console.log(`Generated compact oplay_summary.json (${(stat.size / 1024).toFixed(1)} KB)`);
