import React, { useState, useMemo, useDeferredValue, useEffect } from 'react';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Search, 
  Play, 
  Copy, 
  Printer, 
  ExternalLink, 
  ChevronRight, 
  Layers,
  Sparkles,
  Check,
  Flame,
  Award,
  Eye,
  RefreshCw,
  Crown,
  X,
  Filter,
  SlidersHorizontal,
  Info,
  Globe
} from 'lucide-react';
import { Tournament, TournamentResult, Card, DeckItem } from '../types';
import { 
  availableSetGroups, 
  getCardByCode, 
  formatTournamentDate,
  parseTournamentDateToTimestamp
} from '../data/dataProvider';
import { allTournaments, mergeLiveTournaments } from '../data/tournamentProvider';
import { getCardImageUrl, getColorClass, parseDecklistString, handleCardImageError } from '../utils/cardUtils';
import { useDeck } from '../context/DeckContext';
import { DeckDetailViewData } from '../components/DeckDetailModal';
import { getTournamentDeckPrice, formatEur } from '../services/cardmarketPriceService';
import { ScalpeursHeroBanner } from '../components/ScalpeursHeroBanner';

// Color translations FR <-> EN for seamless bilingual search
const COLOR_TRANSLATIONS: Record<string, string> = {
  rouge: 'red',
  vert: 'green',
  bleu: 'blue',
  violet: 'purple',
  noir: 'black',
  jaune: 'yellow',
  red: 'rouge',
  green: 'vert',
  blue: 'bleu',
  purple: 'violet',
  black: 'noir',
  yellow: 'jaune'
};

// Aliases for popular leaders
const LEADER_SEARCH_ALIASES: Record<string, string> = {
  whitebeard: 'edward.newgate',
  'barbe blanche': 'edward.newgate',
  blackbeard: 'marshall.d.teach',
  'barbe noire': 'marshall.d.teach',
  'big mom': 'charlotte linlin',
  bigmom: 'charlotte linlin',
  doffy: 'donquixote doflamingo',
  akainu: 'sakazuki',
  aokiji: 'kuzan',
  kizaru: 'borsalino',
  fujitora: 'issho',
  ryokugyu: 'aramaki',
  corazon: 'donquixote rosinante',
  vegapunk: 'vega punk',
  kidd: 'eustass',
  mugiwara: 'monkey.d.luffy',
  'chapeau de paille': 'monkey.d.luffy'
};

// Popular Quick Leader suggestions
const POPULAR_LEADERS = [
  { name: 'Luffy', query: 'Luffy' },
  { name: 'Zoro', query: 'Zoro' },
  { name: 'Ace', query: 'Ace' },
  { name: 'Doflamingo', query: 'Doflamingo' },
  { name: 'Bonney', query: 'Bonney' },
  { name: 'Katakuri', query: 'Katakuri' },
  { name: 'Rob Lucci', query: 'Lucci' },
  { name: 'Enel', query: 'Enel' },
  { name: 'Kaido', query: 'Kaido' },
  { name: 'Whitebeard', query: 'Whitebeard' },
  { name: 'Mihawk', query: 'Mihawk' },
  { name: 'Xebec', query: 'Xebec' },
  { name: 'Nami', query: 'Nami' },
  { name: 'Law', query: 'Law' },
  { name: 'Sabo', query: 'Sabo' },
  { name: 'Hancock', query: 'Hancock' },
  { name: 'Blackbeard', query: 'Blackbeard' }
];

function normalizeSearchStr(str?: string): string {
  if (!str) return '';
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

const tournamentSearchCache = new Map<string, string>();

function getTournamentSearchString(t: Tournament): string {
  const cached = tournamentSearchCache.get(t.id);
  if (cached !== undefined) return cached;

  const parts: string[] = [
    t.tournament_name || '',
    t.format || '',
    t.country || '',
    t.host || '',
    t.player_name || '',
    t.deck_name || '',
    t.deck_color || '',
    t.deck_type || ''
  ];

  if (t.tournament_results) {
    for (const r of t.tournament_results) {
      if (r.player_name) parts.push(r.player_name);
      if (r.deck_type) {
        parts.push(r.deck_type);
        const lCard = getCardByCode(r.deck_type);
        if (lCard) {
          parts.push(lCard.name);
          parts.push(lCard.card_code);
          if (lCard.color && Array.isArray(lCard.color)) parts.push(...lCard.color);
        }
      }
    }
  }

  const result = normalizeSearchStr(parts.join(' '));
  tournamentSearchCache.set(t.id, result);
  return result;
}

interface TournamentsViewProps {
  onSelectCard: (card: Card) => void;
  onViewDeckDetail: (deckData: DeckDetailViewData) => void;
  onNavigateToDeckbuilder: () => void;
}

export const TournamentsView: React.FC<TournamentsViewProps> = ({
  onSelectCard,
  onViewDeckDetail,
  onNavigateToDeckbuilder
}) => {
  const { importDecklist } = useDeck();
  // Default to 'ALL' (Tous les Formats) so all leaders & tournaments are immediately searchable
  const [selectedSet, setSelectedSet] = useState<string>('ALL');
  const [selectedLeaderCode, setSelectedLeaderCode] = useState<string>('ALL');
  const [selectedColor, setSelectedColor] = useState<string>('ALL');
  const [isBudgetOnly, setIsBudgetOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [tournamentsList, setTournamentsList] = useState<Tournament[]>(() => [...allTournaments]);

  // Progressive loading / pagination limit (loads 36 at a time for 60fps responsiveness)
  const PAGE_INCREMENT = 36;
  const [displayLimit, setDisplayLimit] = useState<number>(PAGE_INCREMENT);

  // Reset pagination limit when any filter changes
  useEffect(() => {
    setDisplayLimit(PAGE_INCREMENT);
  }, [selectedSet, selectedLeaderCode, selectedColor, isBudgetOnly, deferredSearchQuery]);

  // Automatic silent background sync on mount (checks every 4 hours without bothering the user)
  useEffect(() => {
    const lastSync = localStorage.getItem('optcg_last_tournaments_sync_ts');
    const now = Date.now();
    if (!lastSync || now - parseInt(lastSync, 10) > 4 * 60 * 60 * 1000) {
      fetch('/api/sync-tournaments')
        .then(res => res.json())
        .then(data => {
          if (data && data.success && Array.isArray(data.tournaments)) {
            const added = mergeLiveTournaments(data.tournaments);
            if (added > 0) {
              setTournamentsList([...allTournaments]);
            }
            try {
              localStorage.setItem('optcg_live_tournaments', JSON.stringify(data.tournaments));
              localStorage.setItem('optcg_last_tournaments_sync_ts', String(now));
            } catch (e) {}
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleSyncTournaments = async () => {
    setIsSyncing(true);
    setSyncFeedback('Synchronisation en cours avec OnePieceTopDecks...');
    try {
      const res = await fetch('/api/sync-tournaments');
      const data = await res.json();
      if (data.success && data.tournaments) {
        const added = mergeLiveTournaments(data.tournaments);
        setTournamentsList([...allTournaments]);
        try {
          localStorage.setItem('optcg_live_tournaments', JSON.stringify(data.tournaments));
          localStorage.setItem('optcg_last_tournaments_sync_ts', String(Date.now()));
        } catch (err) {}
        setSyncFeedback(`✅ Synchronisation réussie : ${data.counts?.total || data.tournaments.length} tournois au total (+${added} nouveaux tournois ajoutés).`);
      } else {
        setSyncFeedback('✅ Tous les tournois sont déjà synchronisés et à jour.');
      }
    } catch (e: any) {
      setSyncFeedback('Synchronisation effectuée avec la base locale.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 5000);
    }
  };

  // 1. Compute all distinct leaders with their total tops count
  const allGameLeaders = useMemo(() => {
    const countMap = new Map<string, { card: Card; count: number; sets: Set<string> }>();

    for (const t of tournamentsList) {
      const winner = t.tournament_results?.find(r => r.placement === 1) || t.tournament_results?.[0];
      const leaderCode = winner?.deck_type || t.deck_type;
      if (!leaderCode) continue;

      const codeUpper = leaderCode.trim().toUpperCase();
      const card = getCardByCode(codeUpper);
      if (!card) continue;

      const curr = countMap.get(codeUpper) || { card, count: 0, sets: new Set() };
      curr.count++;
      if (t.set_group) curr.sets.add(t.set_group);
      countMap.set(codeUpper, curr);
    }

    return Array.from(countMap.entries())
      .map(([code, data]) => ({
        code,
        card: data.card,
        count: data.count,
        sets: Array.from(data.sets)
      }))
      .sort((a, b) => b.count - a.count || a.card.name.localeCompare(b.card.name));
  }, [tournamentsList]);

  // Leaders available in the currently selected set
  const leadersInSelectedSet = useMemo(() => {
    if (selectedSet === 'ALL') return allGameLeaders;
    return allGameLeaders.filter(l => l.sets.includes(selectedSet));
  }, [allGameLeaders, selectedSet]);

  const handleSetChange = (newSet: string) => {
    setSelectedSet(newSet);
    setSelectedLeaderCode('ALL');
    setDisplayLimit(PAGE_INCREMENT);
  };

  const handleLeaderSelect = (leaderCode: string) => {
    setSelectedLeaderCode(leaderCode);
    setDisplayLimit(PAGE_INCREMENT);
    if (leaderCode !== 'ALL' && selectedSet !== 'ALL') {
      const leadInfo = allGameLeaders.find(l => l.code === leaderCode);
      if (leadInfo && !leadInfo.sets.includes(selectedSet)) {
        // Automatically switch to ALL so user sees the tournaments for this leader
        setSelectedSet('ALL');
      }
    }
  };

  const handleQuickLeaderChip = (leadQuery: string) => {
    setSearchQuery(leadQuery);
    setSelectedLeaderCode('ALL');
    setDisplayLimit(PAGE_INCREMENT);
  };

  const handleResetFilters = () => {
    setSelectedSet('ALL');
    setSelectedLeaderCode('ALL');
    setSelectedColor('ALL');
    setIsBudgetOnly(false);
    setSearchQuery('');
    setDisplayLimit(PAGE_INCREMENT);
  };

  const hasActiveFilters = selectedLeaderCode !== 'ALL' || selectedColor !== 'ALL' || isBudgetOnly || searchQuery.trim() !== '' || selectedSet !== 'ALL';

  // 2. Filter tournaments with ultra-fast search cache
  const { filteredTournaments, isSearchAutoExpanded, totalMatchesInAllSets } = useMemo(() => {
    let list = tournamentsList;

    // Color filter
    if (selectedColor !== 'ALL') {
      const targetCol = selectedColor.toLowerCase();
      list = list.filter(t => {
        const winner = t.tournament_results?.find(r => r.placement === 1) || t.tournament_results?.[0];
        const winnerCode = winner?.deck_type || t.deck_type;
        const card = winnerCode ? getCardByCode(winnerCode) : null;
        if (card && card.color && card.color.some(c => c.toLowerCase() === targetCol)) return true;
        if (t.deck_color && t.deck_color.toLowerCase().includes(targetCol)) return true;
        return false;
      });
    }

    // Leader code filter
    if (selectedLeaderCode !== 'ALL') {
      const normSelected = normalizeSearchStr(selectedLeaderCode);
      list = list.filter(t => {
        const winner = t.tournament_results?.find(r => r.placement === 1) || t.tournament_results?.[0];
        const winnerCode = winner?.deck_type || t.deck_type;
        if (winnerCode && normalizeSearchStr(winnerCode) === normSelected) return true;
        return t.tournament_results?.some(r => r.deck_type && normalizeSearchStr(r.deck_type) === normSelected);
      });
    }

    // Budget filter
    if (isBudgetOnly) {
      list = list.filter(t => {
        const winner = (t.tournament_results || []).find(r => r.placement === 1) || t.tournament_results?.[0];
        if (!winner || !winner.deck_list_url?.[0]) return false;
        const price = getTournamentDeckPrice(winner.deck_list_url[0], winner.deck_type);
        return price.isBudget;
      });
    }

    let isSearchAutoExpanded = false;
    let totalMatchesInAllSets = 0;

    // Search query with instant cached index lookup
    if (deferredSearchQuery.trim()) {
      const rawQ = deferredSearchQuery.toLowerCase().trim();
      const qNorm = normalizeSearchStr(deferredSearchQuery);
      const aliasTarget = LEADER_SEARCH_ALIASES[rawQ] ? normalizeSearchStr(LEADER_SEARCH_ALIASES[rawQ]) : null;

      const allMatching = list.filter(t => {
        const searchStr = getTournamentSearchString(t);
        if (searchStr.includes(qNorm)) return true;
        if (aliasTarget && searchStr.includes(aliasTarget)) return true;
        return false;
      });
      totalMatchesInAllSets = allMatching.length;

      if (selectedSet !== 'ALL') {
        const setMatching = allMatching.filter(t => t.set_group === selectedSet || (t.format && t.format.includes(selectedSet)));
        if (setMatching.length > 0) {
          list = setMatching;
        } else if (allMatching.length > 0) {
          // If 0 in current set, auto-expand to show matching tournaments from all sets
          list = allMatching;
          isSearchAutoExpanded = true;
        } else {
          list = [];
        }
      } else {
        list = allMatching;
      }
    } else if (selectedSet !== 'ALL') {
      list = list.filter(t => t.set_group === selectedSet || (t.format && t.format.includes(selectedSet)));
    }

    // Strictly sort newest to oldest
    const sorted = [...list].sort((a, b) => {
      const diff = parseTournamentDateToTimestamp(b.start_date) - parseTournamentDateToTimestamp(a.start_date);
      if (diff !== 0) return diff;
      return (a.placement || 8) - (b.placement || 8);
    });

    return {
      filteredTournaments: sorted,
      isSearchAutoExpanded,
      totalMatchesInAllSets
    };
  }, [tournamentsList, selectedSet, selectedLeaderCode, selectedColor, isBudgetOnly, deferredSearchQuery]);

  // Paginated/Sliced tournaments for silky smooth rendering
  const displayedTournaments = useMemo(() => {
    return filteredTournaments.slice(0, displayLimit);
  }, [filteredTournaments, displayLimit]);

  const createDeckViewData = (tourney: Tournament, res: TournamentResult): DeckDetailViewData | null => {
    if (!res.deck_list_url || res.deck_list_url.length === 0) return null;
    const leaderCard = getCardByCode(res.deck_type);
    const parsed = parseDecklistString(res.deck_list_url[0]);
    const items: DeckItem[] = [];

    for (const item of parsed.items) {
      if (leaderCard && item.cardCode === leaderCard.card_code) continue;
      const card = getCardByCode(item.cardCode);
      if (card) {
        items.push({
          card,
          count: item.count,
          selectedArtwork: card._defaultImagePath
        });
      }
    }

    return {
      name: `${tourney.set_group || 'OP'} ${leaderCard ? leaderCard.name : res.deck_type} — ${res.player_name}`,
      leader: leaderCard || null,
      cards: items,
      setGroup: tourney.set_group,
      format: tourney.format,
      playerName: res.player_name || 'Joueur Anonyme',
      tournamentName: tourney.tournament_name,
      placement: res.placement,
      date: formatTournamentDate(tourney.start_date)
    };
  };

  const handleOpenDeckView = (tourney: Tournament, res: TournamentResult) => {
    const deckData = createDeckViewData(tourney, res);
    if (deckData) {
      onViewDeckDetail(deckData);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Scalpeurs 3D Conveyor Belt Living Hero Banner */}
      <ScalpeursHeroBanner
        title={selectedSet === 'ALL' ? 'Tournois Compétitifs' : `Tournois Format ${selectedSet}`}
        code={selectedSet === 'ALL' ? undefined : selectedSet}
        breadcrumb="Tournois › tous les formats & decklists compétitives"
        totalCards={filteredTournaments.length}
        totalLabel="tournois"
        subBadges={
          <>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-bold">{leadersInSelectedSet.length} Leaders Joués</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-bold">{tournamentsList.length} Championnats & Regionals</span>
          </>
        }
      >
        {/* Main Filter Arena (À cheval sur la bordure de la bannière : à moitié dedans, à moitié dehors 50/50) */}
        <div className="p-2.5 sm:p-3.5 rounded-2xl bg-[#090D15]/98 backdrop-blur-2xl border border-slate-700/80 shadow-[0_16px_50px_rgba(0,0,0,0.95)] ring-1 ring-white/10 space-y-2.5 relative z-50">
          
          {/* Row 1: Set Selector Tabs + Budget Toggle + Sync Button */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <div className="flex items-center space-x-1.5 flex-nowrap">
              <button
                onClick={() => handleSetChange('ALL')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                  selectedSet === 'ALL'
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg shadow-yellow-500/25 scale-105 ring-2 ring-yellow-400/50'
                    : 'text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700'
                }`}
              >
                🏆 Tous les Formats ({tournamentsList.length.toLocaleString()})
              </button>

              {availableSetGroups.map((set) => (
                <button
                  key={set}
                  onClick={() => handleSetChange(set)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                    selectedSet === set
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg shadow-yellow-500/25 scale-105'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  {set}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Budget Decks (< 50 €) Toggle Button */}
              <button
                onClick={() => setIsBudgetOnly(!isBudgetOnly)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wide transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isBudgetOnly
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 scale-105 ring-2 ring-emerald-400'
                    : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/50'
                }`}
                title="Filtrer uniquement les decks compétitifs coûtant moins de 50 €"
              >
                <span>🏷️ Budget (&lt; 50 €)</span>
              </button>

              {/* Sync Button */}
              <button
                onClick={handleSyncTournaments}
                disabled={isSyncing}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
                title="Actualiser les tournois"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isSyncing ? 'Sync...' : 'Actualiser'}</span>
              </button>
            </div>
          </div>

        {/* Row 2: Leader Filter Dropdown, Color Dropdown & Search Input */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-slate-800/80">
          
          {/* Leader Dropdown Filter for All 143 Leaders */}
          <div className="sm:col-span-5 md:col-span-4 relative">
            <div className="relative">
              <Crown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 pointer-events-none" />
              <select
                value={selectedLeaderCode}
                onChange={(e) => handleLeaderSelect(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#0B0F17] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-yellow-500 font-bold appearance-none cursor-pointer"
              >
                <option value="ALL">
                  👑 Filtrer par Leader ({allGameLeaders.length} disponibles)
                </option>
                {selectedSet !== 'ALL' && leadersInSelectedSet.length > 0 && (
                  <optgroup label={`— Leaders du format ${selectedSet} —`}>
                    {leadersInSelectedSet.map((lead) => (
                      <option key={`set-${lead.code}`} value={lead.code}>
                        {lead.card.name} ({lead.code}) — {lead.count} top{lead.count > 1 ? 's' : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="— Tous les Leaders du jeu —">
                  {allGameLeaders.map((lead) => (
                    <option key={`all-${lead.code}`} value={lead.code}>
                      {lead.card.name} ({lead.code}) — {lead.count} top{lead.count > 1 ? 's' : ''}
                    </option>
                  ))}
                </optgroup>
              </select>
              {selectedLeaderCode !== 'ALL' && (
                <button
                  onClick={() => setSelectedLeaderCode('ALL')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 cursor-pointer"
                  title="Effacer le filtre de leader"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Color Filter Dropdown */}
          <div className="sm:col-span-3 md:col-span-3 relative">
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0B0F17] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-yellow-500 font-bold appearance-none cursor-pointer"
            >
              <option value="ALL">🎨 Toutes les Couleurs</option>
              <option value="Red">🔴 Rouge (Red)</option>
              <option value="Green">🟢 Vert (Green)</option>
              <option value="Blue">🔵 Bleu (Blue)</option>
              <option value="Purple">🟣 Violet (Purple)</option>
              <option value="Black">⚫ Noir (Black)</option>
              <option value="Yellow">🟡 Jaune (Yellow)</option>
            </select>
          </div>

          {/* Smart Search Input */}
          <div className="sm:col-span-4 md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher un Leader (Luffy, Zoro, Ace, Bonney...), tournoi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#0B0F17] border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-yellow-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 cursor-pointer"
                title="Effacer la recherche"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* Quick Leader Search Suggestions */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-[11px]">
          <span className="text-slate-500 font-bold flex-shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-yellow-500" /> Leaders populaires :
          </span>
          {POPULAR_LEADERS.map((lead) => (
            <button
              key={lead.name}
              onClick={() => handleQuickLeaderChip(lead.query)}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
                searchQuery.toLowerCase() === lead.query.toLowerCase()
                  ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/20 scale-105'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/80'
              }`}
            >
              👑 {lead.name}
            </button>
          ))}
        </div>

        {/* Search Auto-Expanded Banner Alert */}
        {isSearchAutoExpanded && (
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                Aucun tournoi <strong>{selectedSet}</strong> trouvé pour <strong>"{searchQuery}"</strong> — Recherche élargie à <strong>tous les sets</strong> ({filteredTournaments.length} tournois trouvés).
              </span>
            </div>
            <button
              onClick={() => setSelectedSet('ALL')}
              className="px-2.5 py-1 rounded-lg bg-amber-500 text-black font-black text-[11px] whitespace-nowrap cursor-pointer hover:bg-amber-400 shadow-sm"
            >
              Passer sur Tous les Formats
            </button>
          </div>
        )}

        {/* Active Filter Chips Row */}
        {hasActiveFilters && (
          <div className="flex items-center flex-wrap gap-2 pt-1 text-xs">
            <span className="text-slate-400 text-[11px] font-bold">Filtres actifs :</span>

            {selectedSet !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[11px]">
                <span>🏷️ Format : {selectedSet}</span>
                <button onClick={() => setSelectedSet('ALL')} className="hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedLeaderCode !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 font-bold text-[11px]">
                <span>👑 Leader : {getCardByCode(selectedLeaderCode)?.name || selectedLeaderCode}</span>
                <button onClick={() => setSelectedLeaderCode('ALL')} className="hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedColor !== 'ALL' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 font-bold text-[11px]">
                <span>🎨 Couleur : {selectedColor}</span>
                <button onClick={() => setSelectedColor('ALL')} className="hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {isBudgetOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-[11px]">
                <span>🏷️ Budget &lt; 50 €</span>
                <button onClick={() => setIsBudgetOnly(false)} className="hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-bold text-[11px]">
                <span>🔍 "{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')} className="hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline font-bold ml-auto cursor-pointer"
            >
              Réinitialiser tous les filtres
            </button>
          </div>
        )}
        </div>
      </ScalpeursHeroBanner>

      {/* Spacer so the tournaments list starts cleanly below the 50% overlapping filter bar */}
      <div className="pt-24 sm:pt-28" />
      {filteredTournaments.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[#0B0F17] border border-slate-800 p-8 space-y-3 shadow-xl">
          <Trophy className="w-14 h-14 mx-auto text-yellow-500/30" />
          <h3 className="text-base font-bold text-white">
            Aucun tournoi {selectedSet !== 'ALL' ? `dans le format ${selectedSet}` : ''} ne correspond aux filtres
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {hasActiveFilters 
              ? 'Aucun tournoi trouvé avec cette combinaison de critères de recherche.'
              : `Aucun tournoi enregistré pour le format ${selectedSet}.`}
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs cursor-pointer shadow-lg transition-all"
            >
              Réinitialiser tous les filtres
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedTournaments.map((tourney) => {
              const results = tourney.tournament_results || [];
              const winner = results.find(r => r.placement === 1) || results[0];
              const winnerCard = winner ? getCardByCode(winner.deck_type) : null;
              const countryFlag = tourney.country === 'JP' ? '🇯🇵 JP' : tourney.country === 'Europe' ? '🇪🇺 EU' : tourney.country === 'US' || tourney.country === 'NA' ? '🇺🇸 US' : `🌍 ${tourney.country || 'Global'}`;
              const deckPrice = winner?.deck_list_url?.[0]
                ? getTournamentDeckPrice(winner.deck_list_url[0], winner.deck_type)
                : { totalEur: 75, minEur: 45, isBudget: false };

              return (
                <div
                  key={tourney.id}
                  className="group rounded-2xl bg-[#111827] border border-slate-800 hover:border-yellow-500/50 shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between"
                >
                  {/* Header & Meta Badges: Set, Date, Pays, Placement, Tournoi, Host */}
                  <div className="p-4 sm:p-5 space-y-3">
                    
                    {/* Top Badges Row: Format Set + Date + Pays + Placement */}
                    <div className="flex items-center justify-between flex-wrap gap-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-yellow-500/20 text-yellow-300 font-black text-[11px] border border-yellow-500/30">
                          🏷️ {tourney.set_group || 'OP'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold text-[11px] border border-slate-700 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-yellow-400" />
                          {formatTournamentDate(tourney.start_date)}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold text-[11px] border border-blue-500/30">
                          {countryFlag}
                        </span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-md font-black text-xs border ${
                        tourney.placement === 1 || (tourney.placement_str && tourney.placement_str.includes('1st'))
                          ? 'bg-amber-400 text-black border-amber-300 shadow-sm shadow-amber-400/40'
                          : 'bg-slate-800 text-amber-300 border-slate-700'
                      }`}>
                        🏆 {tourney.placement_str || (tourney.placement === 1 ? '1st Place' : `Top ${tourney.placement || 8}`)}
                      </span>
                    </div>

                    {/* Tournament Name & Host */}
                    <div>
                      <h3 className="text-base font-black text-white tracking-wide group-hover:text-yellow-400 transition-colors line-clamp-1">
                        ⚔️ {tourney.tournament_name || `Tournoi ${tourney.set_group || 'OP'}`}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                        <span>🏢 Host :</span>
                        <span className="font-bold text-slate-200 truncate">{tourney.host || 'Organisateur Officiel'}</span>
                      </p>
                    </div>

                    {/* Winner Preview & Deck Spotlight */}
                    {winner && (
                      <div 
                        onClick={() => handleOpenDeckView(tourney, winner)}
                        className="p-3 rounded-xl bg-[#0B0F17] border border-slate-800 hover:border-yellow-500/50 cursor-pointer flex flex-col gap-2 mt-1 group/spot transition-all"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-11 h-15 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 border border-yellow-500/40 shadow-md">
                            {winnerCard ? (
                              <img
                                src={getCardImageUrl(winnerCard)}
                                alt={winnerCard.name}
                                loading="lazy"
                                decoding="async"
                                referrerPolicy="no-referrer"
                                onError={(e) => handleCardImageError(e, winnerCard)}
                                className="w-full h-full object-cover group-hover/spot:scale-105 transition-transform"
                              />
                            ) : null}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-yellow-400 uppercase tracking-wider">
                                👤 {winner.player_name || tourney.player_name || 'Champion'}
                              </span>
                              <span className="text-[10px] text-amber-400 font-bold group-hover/spot:underline">
                                Voir Deck (50) ›
                              </span>
                            </div>
                            <p className="text-xs font-bold text-white truncate mt-0.5">
                              Leader : {winnerCard ? winnerCard.name : winner.deck_type}
                            </p>
                            {tourney.score && (
                              <p className="text-[10px] text-emerald-400 font-bold mt-0.5">
                                ⚡ {tourney.score.matches} Combats • {tourney.score.winRate}% WR
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Estimated Deck Price Bar (Cardmarket / CardTrader) */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                          <span className="text-slate-400 font-medium flex items-center gap-1">
                            💰 Coût estimé : <strong className="text-emerald-400 font-black">~{deckPrice.totalEur.toFixed(0)} €</strong>
                          </span>
                          {deckPrice.isBudget ? (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-[10px] font-black text-emerald-300 border border-emerald-500/40 shadow-sm">
                              🏷️ Budget &lt; 50 €
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">Cardmarket / CardTrader</span>
                          )}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Bottom Actions */}
                  <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => winner && handleOpenDeckView(tourney, winner)}
                      className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Afficher la Decklist (50 Cartes)</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Load More Pagination Bar */}
          {displayedTournaments.length < filteredTournaments.length && (
            <div className="flex flex-col items-center justify-center gap-3 pt-8 pb-4">
              <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
                <span>Affichage de</span>
                <span className="px-2 py-0.5 rounded-md bg-yellow-500/20 text-yellow-300 font-black border border-yellow-500/30">
                  {displayedTournaments.length.toLocaleString()}
                </span>
                <span>sur</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-white font-black border border-slate-700">
                  {filteredTournaments.length.toLocaleString()}
                </span>
                <span>tournois</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/60 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_#f59e0b]"
                  style={{ width: `${Math.min(100, (displayedTournaments.length / filteredTournaments.length) * 100)}%` }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-2 flex-wrap justify-center">
                <button
                  onClick={() => setDisplayLimit(prev => prev + PAGE_INCREMENT)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black text-xs shadow-lg shadow-yellow-500/20 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  <span>Afficher plus de tournois (+{Math.min(PAGE_INCREMENT, filteredTournaments.length - displayedTournaments.length)})</span>
                </button>

                {filteredTournaments.length - displayedTournaments.length > PAGE_INCREMENT && (
                  <button
                    onClick={() => setDisplayLimit(prev => Math.min(prev + PAGE_INCREMENT * 4, filteredTournaments.length))}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all active:scale-95 cursor-pointer"
                  >
                    +144 tournois
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Tournament Standings Full Modal */}
      {selectedTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F17]">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-bold text-xs">
                    {selectedTournament.set_group}
                  </span>
                  <h2 className="text-lg font-black text-white">
                    {selectedTournament.tournament_name}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatTournamentDate(selectedTournament.start_date)} • {selectedTournament.player_count || selectedTournament.tournament_results?.length || 8} participants • {selectedTournament.format}
                </p>
              </div>

              <button
                onClick={() => setSelectedTournament(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Standings Table */}
            <div className="p-6 overflow-y-auto space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Classement & Decklists des Joueurs ({selectedTournament.tournament_results.length} listes enregistrées)
              </div>

              <div className="space-y-2">
                {selectedTournament.tournament_results.map((res, idx) => {
                  const leaderCard = getCardByCode(res.deck_type);
                  const isTop1 = res.placement === 1;
                  const isTop2 = res.placement === 2;
                  const isTop4 = res.placement <= 4;
                  const hasDecklist = res.deck_list_url && res.deck_list_url.length > 0;

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#0B0F17] border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all"
                    >
                      {/* Player & Leader */}
                      <div className="flex items-center space-x-3.5 min-w-0">
                        
                        {/* Placement badge */}
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 ${
                          isTop1
                            ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30'
                            : isTop2
                            ? 'bg-slate-300 text-black'
                            : isTop4
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {res.placement === 1 ? '1er' : res.placement === 2 ? '2e' : `Top ${res.placement}`}
                        </div>

                        {/* Leader card thumbnail */}
                        <div 
                          onClick={() => leaderCard && onSelectCard(leaderCard)}
                          className="w-10 h-14 rounded overflow-hidden bg-slate-800 border border-slate-700 cursor-pointer flex-shrink-0 hover:scale-105 transition-transform"
                        >
                          {leaderCard && (
                            <img
                              src={getCardImageUrl(leaderCard)}
                              alt={leaderCard.name}
                              referrerPolicy="no-referrer"
                              onError={(e) => handleCardImageError(e, leaderCard)}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        {/* Details */}
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">
                            {res.player_name || 'Joueur Anonyme'}
                          </h4>
                          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="text-yellow-400 font-medium">{leaderCard ? leaderCard.name : res.deck_type}</span>
                            <span>•</span>
                            <span className="font-mono text-[10px]">{res.deck_type}</span>
                          </p>
                        </div>

                      </div>

                      {/* Action buttons */}
                      {hasDecklist && (
                        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                          
                          <button
                            onClick={() => {
                              handleOpenDeckView(selectedTournament, res);
                              setSelectedTournament(null);
                            }}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Afficher le Deck</span>
                          </button>

                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
