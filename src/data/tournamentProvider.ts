import tournamentsInitialRaw from './tournaments_initial.json';
import { Card, Tournament, MetaTier, MetaLeaderSummary, ParsedDecklist } from '../types';
import { getCardByCode } from './dataProvider';
import { parseDecklistString } from '../utils/cardUtils';

/**
 * Total estimated tournaments count for fast display without parsing
 */
export let TOTAL_TOURNAMENTS_COUNT = 10430;

/**
 * Parse any tournament date string into a numeric timestamp for precise sorting
 */
export function parseTournamentDateToTimestamp(dateStr?: string): number {
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

  // Pattern 3: Mon DD, YYYY (e.g. Jun 24, 2023)
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

/**
 * Format a tournament date into a clean, localized date format (DD/MM/YYYY)
 */
export function formatTournamentDate(dateStr?: string): string {
  if (!dateStr) return 'Date N/A';
  const ts = parseTournamentDateToTimestamp(dateStr);
  if (!ts) return dateStr;
  
  const d = new Date(ts);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export const allTournaments: Tournament[] = (tournamentsInitialRaw as unknown as Tournament[]).sort((a, b) => {
  const diff = parseTournamentDateToTimestamp(b.start_date) - parseTournamentDateToTimestamp(a.start_date);
  if (diff !== 0) return diff;
  return (a.placement || 8) - (b.placement || 8);
});

// Quick lookup map by ID
const tournamentsById = new Map<string, Tournament>();
for (const t of allTournaments) {
  if (t && t.id) {
    tournamentsById.set(t.id.toLowerCase(), t);
  }
}

// Background lazy fetcher to load the full archive from /data/tournaments.json seamlessly
let fullTournamentsLoaded = false;
let fullTournamentsPromise: Promise<Tournament[]> | null = null;

export async function loadFullTournaments(): Promise<Tournament[]> {
  if (fullTournamentsLoaded) return allTournaments;
  if (fullTournamentsPromise) return fullTournamentsPromise;

  fullTournamentsPromise = (async () => {
    try {
      const res = await fetch('/data/tournaments.json', { cache: 'no-cache' });
      if (res.ok) {
        const fullList: Tournament[] = await res.json();
        if (Array.isArray(fullList) && fullList.length > 0) {
          TOTAL_TOURNAMENTS_COUNT = fullList.length;
          fullList.sort((a, b) => {
            const diff = parseTournamentDateToTimestamp(b.start_date) - parseTournamentDateToTimestamp(a.start_date);
            if (diff !== 0) return diff;
            return (a.placement || 8) - (b.placement || 8);
          });
          allTournaments.length = 0;
          allTournaments.push(...fullList);
          tournamentsById.clear();
          for (const t of allTournaments) {
            if (t && t.id) tournamentsById.set(t.id.toLowerCase(), t);
          }
          fullTournamentsLoaded = true;
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('optcg-tournaments-loaded', { detail: allTournaments }));
          }
        }
      }
    } catch (e) {
      console.warn('[TournamentProvider] Background full fetch error, keeping initial archive', e);
    }
    return allTournaments;
  })();

  return fullTournamentsPromise;
}

// Start loading the full dataset seamlessly on client-side idle
if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => loadFullTournaments(), { timeout: 3000 });
  } else {
    setTimeout(() => loadFullTournaments(), 1200);
  }
}

export function getTournamentById(idOrSlug: string): Tournament | undefined {
  if (!idOrSlug) return undefined;
  const clean = idOrSlug.trim().toLowerCase();
  const direct = tournamentsById.get(clean);
  if (direct) return direct;

  return allTournaments.find(
    t => t.id === idOrSlug ||
         (t.tournament_name && t.tournament_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').includes(clean))
  );
}

// Hydrate from localStorage if newer live tournaments are saved
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('optcg_live_tournaments');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        mergeLiveTournaments(parsed);
      }
    }
  } catch (e) {}
}

/**
 * Helper to compute meta tier lists for any given set_group (or all)
 */
export function computeMetaForSet(setGroup?: string): MetaLeaderSummary[] {
  const targetSet = setGroup && setGroup !== 'ALL' ? setGroup.trim().toUpperCase() : null;
  const filteredTournaments = targetSet
    ? allTournaments.filter(t => {
        if (t.set_group && t.set_group.toUpperCase() === targetSet) return true;
        if (t.format && t.format.toUpperCase().includes(targetSet)) return true;
        return false;
      })
    : allTournaments;

  const leaderStats = new Map<string, {
    totalTops: number;
    wins: number;
    topCutCount: number;
    totalCombats: number;
    totalWins: number;
    totalLosses: number;
    countries: Set<string>;
    hosts: Set<string>;
    sampleDecklists: {
      tournamentName: string;
      playerName: string;
      placement: number;
      decklistUrl: string;
      parsedDeck: ParsedDecklist;
      score?: {
        wins: number;
        losses: number;
        matches: number;
        winRate: number;
      };
    }[];
    cardCounts: Map<string, { totalCopies: number; appearances: number }>;
  }>();

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
          totalCombats: 0,
          totalWins: 0,
          totalLosses: 0,
          countries: new Set(),
          hosts: new Set(),
          sampleDecklists: [],
          cardCounts: new Map()
        });
      }

      const stat = leaderStats.get(leaderCode)!;
      stat.totalTops++;
      if (r.placement === 1) stat.wins++;
      if (r.placement <= 4) stat.topCutCount++;

      const country = r.country || t.country || '';
      if (country) stat.countries.add(country);
      const host = r.host || t.host || '';
      if (host) stat.hosts.add(host);

      const score = r.score || t.score;
      if (score) {
        stat.totalCombats += score.matches || 0;
        stat.totalWins += score.wins || 0;
        stat.totalLosses += score.losses || 0;
      } else {
        const inferredWins = r.placement === 1 ? 5 : r.placement === 2 ? 4 : 3;
        const inferredLosses = r.placement === 1 ? 0 : 1;
        stat.totalCombats += (inferredWins + inferredLosses);
        stat.totalWins += inferredWins;
        stat.totalLosses += inferredLosses;
      }

      if (r.deck_list_url && r.deck_list_url.length > 0) {
        const parsed = parseDecklistString(r.deck_list_url[0]);
        stat.sampleDecklists.push({
          tournamentName: t.tournament_name,
          playerName: r.player_name || 'Anonymous',
          placement: r.placement,
          decklistUrl: r.deck_list_url[0],
          parsedDeck: parsed,
          score
        });

        // Count card frequencies in winning lists
        for (const item of parsed.items) {
          if (!stat.cardCounts.has(item.cardCode)) {
            stat.cardCounts.set(item.cardCode, { totalCopies: 0, appearances: 0 });
          }
          const c = stat.cardCounts.get(item.cardCode)!;
          c.totalCopies += item.count;
          c.appearances++;
        }
      }
    }
  }

  const results: MetaLeaderSummary[] = [];

  for (const [leaderCode, stat] of leaderStats.entries()) {
    const leaderCard = getCardByCode(leaderCode);
    if (!leaderCard) continue;

    const metaShare = totalPlacements > 0 ? (stat.totalTops / totalPlacements) * 100 : 0;
    const topCutConversion = stat.totalTops > 0 ? (stat.topCutCount / stat.totalTops) * 100 : 0;
    const winRate = stat.totalCombats > 0
      ? Math.round((stat.totalWins / stat.totalCombats) * 1000) / 10
      : 50;

    // Dynamic Tier algorithm based on Tournament Tops & Wins
    let tier: MetaTier = 'Rogue';
    if (metaShare >= 18 || stat.wins >= 8) {
      tier = 'Tier 0';
    } else if (metaShare >= 10 || stat.wins >= 4) {
      tier = 'Tier 1';
    } else if (metaShare >= 5 || stat.wins >= 2) {
      tier = 'Tier 1.5';
    } else if (metaShare >= 2 || stat.topCutCount >= 2) {
      tier = 'Tier 2';
    } else {
      tier = 'Tier 3';
    }

    // Sort key core cards by appearance rate
    const keyCards: { card: Card; avgCopies: number; inclusionRate: number }[] = [];
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
      totalCombats: stat.totalCombats,
      winRate,
      countries: Array.from(stat.countries),
      hosts: Array.from(stat.hosts),
      sampleDecklists: stat.sampleDecklists.sort((a, b) => a.placement - b.placement).slice(0, 15),
      keyCards: keyCards.slice(0, 12)
    });
  }

  // Sort by Tier then by Tops
  const tierWeight: Record<MetaTier, number> = {
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

/**
 * Merges newly scraped live tournaments into allTournaments dynamically
 */
export function mergeLiveTournaments(newTournaments: Tournament[]): number {
  if (!newTournaments || !Array.isArray(newTournaments)) return 0;
  
  const existingDeckUrls = new Set<string>();
  allTournaments.forEach(t => {
    if (t.tournament_results) {
      t.tournament_results.forEach(r => {
        if (r.deck_list_url) {
          r.deck_list_url.forEach(u => existingDeckUrls.add(u));
        }
      });
    }
  });

  let added = 0;
  for (const t of newTournaments) {
    const url = t.tournament_results?.[0]?.deck_list_url?.[0];
    if (url && !existingDeckUrls.has(url)) {
      existingDeckUrls.add(url);
      allTournaments.push(t);
      if (t.id) tournamentsById.set(t.id.toLowerCase(), t);
      added++;
    }
  }

  // Always re-sort allTournaments strictly by date descending (newest first)
  allTournaments.sort((a, b) => {
    const diff = parseTournamentDateToTimestamp(b.start_date) - parseTournamentDateToTimestamp(a.start_date);
    if (diff !== 0) return diff;
    return (a.placement || 8) - (b.placement || 8);
  });

  return added;
}
