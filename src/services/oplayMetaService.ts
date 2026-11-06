import oplaySummaryRaw from '../data/oplay_summary.json';

export interface OPlayMatchupItem {
  opponentLeader: string;
  games: number;
  wins: number;
  winrate: number;
  firstGames?: number;
  firstWins?: number;
}

export interface OPlayLeaderStats {
  leaderCode: string;
  rank: number;
  totalGames: number;
  totalWins: number;
  winrate: number;
  firstTurn: {
    games: number;
    wins: number;
    winrate: number;
  };
  secondTurn: {
    games: number;
    wins: number;
    winrate: number;
  };
  uniquePlayers: number;
  matchupsCount?: number;
  matchups?: OPlayMatchupItem[];
  topMatchups?: OPlayMatchupItem[];
}

export interface OPlayWindowData {
  days: number;
  totalRankedGames: number;
  globalFirstPlayerWinrate: number;
  leadersCount: number;
  leaders: OPlayLeaderStats[];
}

export interface OPlayMetaDataset {
  source: string;
  generatedAt: string;
  period: {
    from: string;
    to: string;
  };
  cutRules?: {
    minGames: number;
    minPlayers: number;
  };
  windows: {
    d7?: OPlayWindowData;
    d30?: OPlayWindowData;
    all?: OPlayWindowData;
  };
}

// Active in-memory cache
let activeDataset: OPlayMetaDataset = oplaySummaryRaw as unknown as OPlayMetaDataset;
let isFullDatasetLoaded = false;
let fullLoadPromise: Promise<OPlayMetaDataset> | null = null;

/**
 * Lazy loads the complete full dataset from /data/oplay_meta_stats.json
 */
export async function loadFullOPlayStats(): Promise<OPlayMetaDataset> {
  if (isFullDatasetLoaded) return activeDataset;
  if (fullLoadPromise) return fullLoadPromise;

  fullLoadPromise = (async () => {
    try {
      if (typeof window !== 'undefined') {
        const res = await fetch('/data/oplay_meta_stats.json');
        if (res.ok) {
          const fullData = await res.json();
          if (fullData && fullData.windows) {
            activeDataset = fullData;
            isFullDatasetLoaded = true;
          }
        }
      }
    } catch (e) {
      console.warn('[OPlayService] Failed to load full dataset, keeping summary', e);
    }
    return activeDataset;
  })();

  return fullLoadPromise;
}

/**
 * Get data for a specific window ('d7' | 'd30' | 'all')
 */
export function getOPlayWindowData(windowKey: 'd7' | 'd30' | 'all' = 'd7'): OPlayWindowData | undefined {
  return activeDataset.windows[windowKey];
}

/**
 * Get full metadata
 */
export function getOPlayMetadata() {
  return {
    source: activeDataset.source,
    generatedAt: activeDataset.generatedAt,
    period: activeDataset.period,
    totalGames7Days: activeDataset.windows.d7?.totalRankedGames || 0,
    firstPlayerWinrate7Days: activeDataset.windows.d7?.globalFirstPlayerWinrate || 50.2
  };
}

/**
 * Get individual leader simulator stats
 */
export function getLeaderSimulatorStats(leaderCode: string, windowKey: 'd7' | 'd30' | 'all' = 'd7'): OPlayLeaderStats | undefined {
  const code = (leaderCode || '').trim().toUpperCase();
  const windowData = activeDataset.windows[windowKey];
  if (!windowData) return undefined;
  return windowData.leaders.find(l => l.leaderCode.toUpperCase() === code);
}

/**
 * Head-to-head match stats between Leader A and Leader B
 */
export function getHeadToHeadSimulatorMatchup(
  leaderCodeA: string,
  leaderCodeB: string,
  windowKey: 'd7' | 'd30' | 'all' = 'd7'
): {
  hasData: boolean;
  games: number;
  winsA: number;
  lossesA: number;
  winrateA: number;
  winrateB: number;
  firstGamesA?: number;
  firstWinsA?: number;
} {
  const codeA = (leaderCodeA || '').trim().toUpperCase();
  const codeB = (leaderCodeB || '').trim().toUpperCase();

  if (codeA === codeB) {
    return {
      hasData: true,
      games: 0,
      winsA: 0,
      lossesA: 0,
      winrateA: 50.0,
      winrateB: 50.0
    };
  }

  const leaderAStats = getLeaderSimulatorStats(codeA, windowKey);
  const matchupsList = leaderAStats?.matchups || leaderAStats?.topMatchups || [];
  const directMatchup = matchupsList.find(m => m.opponentLeader.toUpperCase() === codeB);

  if (directMatchup && directMatchup.games > 0) {
    const winsA = directMatchup.wins;
    const games = directMatchup.games;
    const lossesA = games - winsA;
    const winrateA = directMatchup.winrate;
    const winrateB = Math.round((100 - winrateA) * 10) / 10;

    return {
      hasData: true,
      games,
      winsA,
      lossesA,
      winrateA,
      winrateB,
      firstGamesA: directMatchup.firstGames,
      firstWinsA: directMatchup.firstWins
    };
  }

  return {
    hasData: false,
    games: 0,
    winsA: 0,
    lossesA: 0,
    winrateA: 50.0,
    winrateB: 50.0
  };
}
