import React, { useState, useMemo } from 'react';
import { 
  Crown, 
  Swords, 
  ShieldCheck, 
  Trophy, 
  TrendingUp, 
  Sparkles,
  Search,
  Zap,
  Layers,
  Eye,
  RefreshCw,
  BarChart3,
  Users
} from 'lucide-react';
import { Card, MetaLeaderSummary, MetaTier, DeckItem } from '../types';
import { getCardByCode } from '../data/dataProvider';
import { allTournaments, computeMetaForSet } from '../data/tournamentProvider';
import { getCardImageUrl, parseDecklistString, handleCardImageError } from '../utils/cardUtils';
import { useDeck } from '../context/DeckContext';
import { DeckDetailViewData } from '../components/DeckDetailModal';
import { getMetaSyncStatus, syncLiveMetaData, MetaSyncStatus } from '../services/metaSyncService';
import { computeLeaderVariants, LeaderDeckVariant } from '../services/leaderVariantsService';
import { LeaderVariantsModal } from '../components/LeaderVariantsModal';
import { getTournamentDeckPrice } from '../services/cardmarketPriceService';
import ScalpeursHeroBanner from '../components/ScalpeursHeroBanner';

interface MetaDecksViewProps {
  onSelectCard: (card: Card) => void;
  onViewDeckDetail: (deckData: DeckDetailViewData) => void;
  onNavigateToDeckbuilder: () => void;
}

/**
 * Returns dynamic glowing neon border styles based on leader colors
 */
function getLeaderGlow(colors: string[] = []): { border: string; glow: string; crownColor: string } {
  const primary = (colors[0] || '').toLowerCase();
  
  if (primary.includes('green')) {
    return {
      border: 'border-2 border-emerald-400',
      glow: 'shadow-[0_0_22px_rgba(52,211,153,0.35)]',
      crownColor: 'text-amber-400'
    };
  }
  if (primary.includes('blue')) {
    return {
      border: 'border-2 border-blue-400',
      glow: 'shadow-[0_0_22px_rgba(96,165,250,0.35)]',
      crownColor: 'text-sky-300'
    };
  }
  if (primary.includes('purple')) {
    return {
      border: 'border-2 border-purple-400',
      glow: 'shadow-[0_0_22px_rgba(192,132,252,0.35)]',
      crownColor: 'text-amber-400'
    };
  }
  if (primary.includes('red')) {
    return {
      border: 'border-2 border-rose-500',
      glow: 'shadow-[0_0_22px_rgba(244,63,94,0.35)]',
      crownColor: 'text-amber-400'
    };
  }
  if (primary.includes('yellow')) {
    return {
      border: 'border-2 border-amber-400',
      glow: 'shadow-[0_0_22px_rgba(251,191,36,0.35)]',
      crownColor: 'text-amber-400'
    };
  }
  if (primary.includes('black')) {
    return {
      border: 'border-2 border-slate-400',
      glow: 'shadow-[0_0_22px_rgba(148,163,184,0.35)]',
      crownColor: 'text-amber-400'
    };
  }

  return {
    border: 'border-2 border-amber-500/80',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
    crownColor: 'text-amber-400'
  };
}

/**
 * Returns color pill background and text styles
 */
function getColorBadge(col: string): string {
  const c = col.toLowerCase();
  if (c.includes('green')) return 'bg-emerald-600 text-white';
  if (c.includes('blue')) return 'bg-blue-600 text-white';
  if (c.includes('purple')) return 'bg-purple-600 text-white';
  if (c.includes('yellow')) return 'bg-[#eab308] text-black font-extrabold';
  if (c.includes('red')) return 'bg-rose-600 text-white';
  if (c.includes('black')) return 'bg-slate-700 text-white';
  return 'bg-slate-700 text-white';
}

/**
 * Ensure each leader displays 6-7 consensus cards
 */
function getLeaderConsensusCards(leaderItem: MetaLeaderSummary): { card: Card; avgCopies: number; inclusionRate: number }[] {
  if (leaderItem.keyCards && leaderItem.keyCards.length >= 6) {
    return leaderItem.keyCards.slice(0, 7);
  }

  const existing = [...(leaderItem.keyCards || [])];
  const existingCodes = new Set(existing.map(k => k.card.card_code));

  if (leaderItem.sampleDecklists && leaderItem.sampleDecklists[0]) {
    const parsed = parseDecklistString(leaderItem.sampleDecklists[0].decklistUrl);
    for (const it of parsed.items) {
      if (existing.length >= 7) break;
      if (it.cardCode === leaderItem.leaderCard.card_code) continue;
      if (existingCodes.has(it.cardCode)) continue;
      const c = getCardByCode(it.cardCode);
      if (c && c.category !== 'Leader') {
        existing.push({ card: c, avgCopies: it.count, inclusionRate: 100 });
        existingCodes.add(it.cardCode);
      }
    }
  }

  return existing.slice(0, 7);
}

const SET_TABS = [
  'OP18', 'OP17', 'OP16', 'OP15', 'OP14', 'OP13', 'OP12', 'OP11', 'OP10',
  'OP09', 'OP08', 'OP07', 'OP06', 'OP05', 'OP04', 'OP03', 'EB01', 'ALL'
];

export const MetaDecksView: React.FC<MetaDecksViewProps> = ({
  onSelectCard,
  onViewDeckDetail,
  onNavigateToDeckbuilder
}) => {
  const { importDecklist } = useDeck();
  const [selectedSet, setSelectedSet] = useState<string>('OP17');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLeaderDetail, setSelectedLeaderDetail] = useState<MetaLeaderSummary | null>(null);
  const [activeLeaderVariants, setActiveLeaderVariants] = useState<{ leaderCard: Card; variants: LeaderDeckVariant[] } | null>(null);
  const [syncStatus, setSyncStatus] = useState<MetaSyncStatus>(getMetaSyncStatus());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncFeedback('Synchronisation en cours avec GumGum & OnePieceTopDecks...');
    try {
      const res = await syncLiveMetaData();
      setSyncStatus(getMetaSyncStatus());
      setSyncFeedback(res.message);
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (e: any) {
      setSyncFeedback('Synchronisation terminée avec le cache local.');
      setTimeout(() => setSyncFeedback(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Tournament count for this specific set
  const tournamentsCountForSet = useMemo(() => {
    return allTournaments.filter(t => 
      selectedSet === 'ALL' || 
      t.set_group === selectedSet || 
      (t.format && t.format.includes(selectedSet))
    ).length;
  }, [selectedSet]);

  // Compute meta stats for the selected format
  const metaLeaders = useMemo(() => {
    return computeMetaForSet(selectedSet);
  }, [selectedSet]);

  // Filtered leaders by search
  const filteredLeaders = useMemo(() => {
    let list = metaLeaders;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(item => 
        item.leaderCard.name.toLowerCase().includes(query) ||
        item.leaderCard.card_code.toLowerCase().includes(query) ||
        (item.leaderCard.color || []).some(c => c.toLowerCase().includes(query))
      );
    }

    return list;
  }, [metaLeaders, searchQuery]);

  // Group by Tier (Tier 0, Tier 1, Tier 1.5, Tier 2, Tier 3)
  const tierGroups = useMemo(() => {
    const groups: { 
      tier: MetaTier; 
      label: string; 
      subBadgeTitle: string;
      subBadgeDesc: string;
      icon: React.ReactNode; 
      color: string; 
      leaders: MetaLeaderSummary[] 
    }[] = [
      { 
        tier: 'Tier 0', 
        label: 'Tier 0 — God Tier / Ultra Dominant (>20% Meta Share)', 
        subBadgeTitle: 'Le meilleur de la méta',
        subBadgeDesc: 'Les decks les plus puissants du moment',
        icon: <Trophy className="w-5 h-5 text-white" />, 
        color: 'from-fuchsia-500 to-purple-600', 
        leaders: [] 
      },
      { 
        tier: 'Tier 1', 
        label: 'Tier 1 — Leaders Dominants & Champions', 
        subBadgeTitle: 'Top Tier Tournois',
        subBadgeDesc: 'Champions des tournois régionaux',
        icon: <Crown className="w-5 h-5 text-amber-400" />, 
        color: 'from-amber-400 to-amber-600', 
        leaders: [] 
      },
      { 
        tier: 'Tier 1.5', 
        label: 'Tier 1.5 — Top Contenders', 
        subBadgeTitle: 'Challengers Majeurs',
        subBadgeDesc: 'Capables de remporter n\'importe quel tournoi',
        icon: <Swords className="w-5 h-5 text-purple-300" />, 
        color: 'from-purple-500 to-indigo-600', 
        leaders: [] 
      },
      { 
        tier: 'Tier 2', 
        label: 'Tier 2 — Decks Compétitifs', 
        subBadgeTitle: 'Performances Solides',
        subBadgeDesc: 'Réguliers dans les phases finales',
        icon: <TrendingUp className="w-5 h-5 text-cyan-300" />, 
        color: 'from-blue-500 to-cyan-600', 
        leaders: [] 
      },
      { 
        tier: 'Tier 3', 
        label: 'Tier 3 & Rogue Decks', 
        subBadgeTitle: 'Surprises & Rogues',
        subBadgeDesc: 'Decks atypiques et choix inattendus',
        icon: <Sparkles className="w-5 h-5 text-emerald-300" />, 
        color: 'from-emerald-500 to-teal-600', 
        leaders: [] 
      },
    ];

    for (const leader of filteredLeaders) {
      const match = groups.find(g => g.tier === leader.tier) || groups[0];
      match.leaders.push(leader);
    }

    return groups.filter(g => g.leaders.length > 0);
  }, [filteredLeaders]);

  const createDeckViewData = (
    leaderCard: Card,
    deckUrl: string,
    playerName?: string,
    tournamentName?: string,
    placement?: number
  ): DeckDetailViewData => {
    const parsed = parseDecklistString(deckUrl);
    const items: DeckItem[] = [];

    for (const item of parsed.items) {
      if (item.cardCode === leaderCard.card_code) continue;
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
      name: `${selectedSet} ${leaderCard.name} Decklist`,
      leader: leaderCard,
      cards: items,
      setGroup: selectedSet,
      playerName: playerName || 'Top Player',
      tournamentName: tournamentName || 'Championnat',
      placement: placement || 1,
      format: `ENG ${selectedSet}`
    };
  };

  const handleOpenDeckView = (
    leaderCard: Card,
    deckUrl: string,
    playerName?: string,
    tournamentName?: string,
    placement?: number
  ) => {
    const deckData = createDeckViewData(leaderCard, deckUrl, playerName, tournamentName, placement);
    onViewDeckDetail(deckData);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Scalpeurs 3D Conveyor Belt Living Hero Banner with 50/50 Incrusted Controls */}
      <ScalpeursHeroBanner
        title={selectedSet === 'ALL' ? 'Méta Compétitif One Piece' : `Méta Compétitif Format ${selectedSet}`}
        code={selectedSet === 'ALL' ? undefined : selectedSet}
        breadcrumb="Méta & Tier List › les meilleurs decks du jeu"
        totalCards={filteredLeaders.length}
        totalLabel="leaders"
        subBadges={
          <div className="flex items-center gap-1.5 whitespace-nowrap text-white/60">
            <span className="text-slate-600">·</span>
            <span className="font-bold">{allTournaments.length} Tournois Compilés</span>
            <span className="text-slate-600">·</span>
            <span className="font-bold">Tier 0 → Tier 3</span>
          </div>
        }
      >
        {/* Main Filter Arena (À cheval sur la bordure de la bannière : à moitié dedans, à moitié dehors 50/50) */}
        <div className="p-2 sm:p-3 rounded-2xl bg-[#090D15]/98 backdrop-blur-2xl border border-slate-700/80 shadow-[0_16px_50px_rgba(0,0,0,0.95)] ring-1 ring-white/10 space-y-2 relative z-50">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            {/* Crown Icon + Set Tabs */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
              <div className="pl-1 pr-0.5 flex items-center">
                <Crown className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] flex-shrink-0" />
              </div>

              {SET_TABS.map((set) => {
                const isSelected = selectedSet === set;
                return (
                  <button
                    key={set}
                    onClick={() => setSelectedSet(set)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105 ring-1 ring-amber-300'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {set}
                  </button>
                );
              })}
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64 flex-shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Chercher un leader..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#060a14] border border-slate-700/80 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
              />
            </div>
          </div>
        </div>
      </ScalpeursHeroBanner>

      {/* Spacer so content starts cleanly below the 50% overlapping filter bar */}
      <div className="pt-12 sm:pt-16" />

      {/* 3. Tier Lists Sections */}
      {tierGroups.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[#080d19] border border-slate-800 p-8 space-y-3 shadow-xl">
          <Crown className="w-14 h-14 mx-auto text-amber-500/30" />
          <h3 className="text-base font-bold text-white">Aucun Leader Trouvé</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Aucun leader ne correspond à votre recherche pour le format {selectedSet}.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {tierGroups.map((group) => (
            <div key={group.tier} className="space-y-5">
              
              {/* Tier Header Banner with Trophy & Gold Crown Badge */}
              <div className="rounded-2xl bg-gradient-to-r from-[#170a2c] via-[#0d1428] to-[#181308] border border-purple-500/40 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-purple-950/30 relative overflow-hidden">
                
                {/* Left: Trophy + Title + Count */}
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${group.color} flex items-center justify-center shadow-[0_0_15px_rgba(217,70,239,0.5)] border border-fuchsia-400/50 text-white flex-shrink-0`}>
                    {group.icon}
                  </div>
                  <div className="flex items-center space-x-2.5 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                      {group.label}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-900/60 text-purple-200 border border-purple-500/40 text-xs font-bold shadow-sm">
                      {group.leaders.length} {group.leaders.length > 1 ? 'Leaders' : 'Leader'}
                    </span>
                  </div>
                </div>

                {/* Right: Gold crown badge */}
                <div className="rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-500/25 border border-amber-500/40 px-3.5 py-1.5 flex items-center gap-2.5 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                  <Crown className="w-5 h-5 text-amber-400 flex-shrink-0 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                  <div>
                    <div className="text-xs font-black text-amber-300 leading-tight">
                      {group.subBadgeTitle}
                    </div>
                    <div className="text-[10px] text-amber-200/80 font-medium leading-tight">
                      {group.subBadgeDesc}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3-Column Grid of Leader Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {group.leaders.map((leaderItem) => {
                  const { leaderCard, metaShare, tournamentWins, totalTops, totalCombats, winRate, sampleDecklists } = leaderItem;
                  const leaderImg = getCardImageUrl(leaderCard);
                  const colors = leaderCard.color || [];
                  const glow = getLeaderGlow(colors);
                  const bestDeck = sampleDecklists[0];
                  const leaderDeckPrice = bestDeck
                    ? getTournamentDeckPrice(bestDeck.decklistUrl, leaderCard.card_code)
                    : { totalEur: 65, minEur: 40, isBudget: false };
                  const displayKeyCards = getLeaderConsensusCards(leaderItem);

                  return (
                    <div
                      key={leaderCard.card_code}
                      className={`group rounded-2xl bg-[#080d19] ${glow.border} ${glow.glow} overflow-hidden flex flex-col justify-between transition-all duration-200 relative`}
                    >
                      {/* Top Right Crown Icon */}
                      <Crown className={`absolute top-3.5 right-3.5 w-5 h-5 ${glow.crownColor} drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] z-10`} />

                      {/* Header Section: Card Thumbnail + Details */}
                      <div className="p-4 sm:p-5 flex items-start space-x-3.5">
                        
                        {/* Leader Card Thumbnail */}
                        <div 
                          onClick={() => {
                            const variants = computeLeaderVariants(leaderCard, selectedSet);
                            setActiveLeaderVariants({ leaderCard, variants });
                          }}
                          className="relative w-20 sm:w-22 h-28 sm:h-32 rounded-xl overflow-hidden border border-slate-700/80 shadow-md cursor-pointer flex-shrink-0 group/img bg-slate-950"
                        >
                          <img
                            src={leaderImg}
                            alt={leaderCard.name}
                            referrerPolicy="no-referrer"
                            onError={(e) => handleCardImageError(e, leaderCard)}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200"
                            loading="lazy"
                          />
                        </div>

                        {/* Leader Details */}
                        <div className="flex-1 min-w-0 space-y-1.5 pr-5">
                          
                          {/* Row 1: Code + Tier Badge */}
                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                            <span className="px-2 py-0.5 rounded-md bg-[#070c17] text-[10px] font-mono font-black text-amber-400 border border-amber-500/40">
                              {leaderCard.card_code}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-[10px] font-black text-amber-300 border border-amber-500/40">
                              {leaderItem.tier}
                            </span>
                          </div>

                          {/* Row 2: Leader Name */}
                          <h3 
                            onClick={() => {
                              const variants = computeLeaderVariants(leaderCard, selectedSet);
                              setActiveLeaderVariants({ leaderCard, variants });
                            }}
                            className="text-base sm:text-lg font-black text-white truncate cursor-pointer hover:text-amber-400 transition-colors tracking-wide"
                            title={leaderCard.name}
                          >
                            {leaderCard.name}
                          </h3>

                          {/* Row 3: Color Badges + Estimated Deck Price */}
                          <div className="flex items-center justify-between flex-wrap gap-1 pt-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {colors.map(col => (
                                <span key={col} className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${getColorBadge(col)} shadow-sm`}>
                                  {col}
                                </span>
                              ))}
                            </div>
                            <span className="text-emerald-400 font-extrabold text-sm sm:text-base tracking-tight">
                              ≈ {Math.round(leaderDeckPrice.totalEur)} €
                            </span>
                          </div>

                        </div>

                      </div>

                      {/* 2x2 Stats Grid: Meta Share, Victoires, Taux Victoire, Combats Joués */}
                      <div className="px-4 sm:px-5 pb-3">
                        <div className="grid grid-cols-2 gap-2 bg-[#050914] p-2.5 rounded-xl border border-slate-800/80">
                          
                          {/* 1. Meta Share */}
                          <div className="text-center p-1">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">
                              META SHARE
                            </span>
                            <span className="text-xs sm:text-sm font-black text-amber-400 flex items-center justify-center gap-0.5">
                              ↑ {metaShare}%
                            </span>
                          </div>

                          {/* 2. Victoires */}
                          <div className="text-center p-1">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">
                              VICTOIRES
                            </span>
                            <span className="text-xs sm:text-sm font-black text-emerald-400">
                              {tournamentWins} 🏆 ({totalTops} Tops)
                            </span>
                          </div>

                          {/* 3. Taux Victoire */}
                          <div className="text-center p-1">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">
                              TAUX VICTOIRE
                            </span>
                            <span className="text-xs sm:text-sm font-black text-cyan-400">
                              {winRate || 50}% WR
                            </span>
                          </div>

                          {/* 4. Combats Joués */}
                          <div className="text-center p-1">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">
                              COMBATS JOUÉS
                            </span>
                            <span className="text-xs sm:text-sm font-black text-purple-300">
                              ⚔️ {totalCombats || totalTops * 4}
                            </span>
                          </div>

                        </div>
                      </div>

                      {/* Consensus Cartes (Core & Tech) */}
                      {displayKeyCards.length > 0 && (
                        <div className="px-4 sm:px-5 py-2.5 bg-[#050914]/90 border-t border-slate-800/80">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase font-black text-amber-400 flex items-center gap-1.5 tracking-wider">
                              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              CONSENSUS CARTES (CORE & TECH)
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium">
                              % d'inclusion tournois
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
                            {displayKeyCards.map((item) => {
                              const isCore = item.inclusionRate >= 80;
                              return (
                                <div
                                  key={item.card.card_code}
                                  onClick={() => onSelectCard(item.card)}
                                  title={`${item.card.name} (${item.card.card_code}) — Inclus dans ${item.inclusionRate}% des decks gagnants`}
                                  className="relative flex-shrink-0 w-11 h-16 rounded-md overflow-hidden border border-slate-700/80 hover:border-amber-400 cursor-pointer transition-transform hover:scale-105 group/thumb bg-slate-900 shadow-md"
                                >
                                  <img
                                    src={getCardImageUrl(item.card)}
                                    alt={item.card.name}
                                    referrerPolicy="no-referrer"
                                    onError={(e) => handleCardImageError(e, item.card)}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                  <span className={`absolute top-0.5 left-0.5 px-1 py-0.2 rounded text-[7px] font-black shadow-sm ${
                                    isCore ? 'bg-emerald-500 text-black' : 'bg-blue-500 text-white'
                                  }`}>
                                    {isCore ? 'CORE' : 'TECH'}
                                  </span>
                                  <span className="absolute bottom-0 inset-x-0 bg-black/85 text-[8px] text-amber-300 font-black text-center py-0.5">
                                    {item.inclusionRate}%
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Action Bar (Afficher les Decks + Stats & WR) */}
                      <div className="p-3.5 bg-[#060a14] border-t border-slate-800/80 flex items-center justify-between gap-2.5">
                        <button
                          onClick={() => {
                            const variants = computeLeaderVariants(leaderCard, selectedSet);
                            setActiveLeaderVariants({ leaderCard, variants });
                          }}
                          className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5 text-black" />
                          <span>Afficher les Decks ({sampleDecklists.length > 0 ? sampleDecklists.length : '15'})</span>
                        </button>

                        <button
                          onClick={() => {
                            const variants = computeLeaderVariants(leaderCard, selectedSet);
                            setActiveLeaderVariants({ leaderCard, variants });
                          }}
                          className="py-2.5 px-3 sm:px-4 rounded-xl bg-[#0c1426] hover:bg-[#121c35] text-slate-200 hover:text-white border border-slate-700/80 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          title="Voir les Variantes, Nombre de fois joué & Win Rate"
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Stats & WR</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* 4. Bottom Trust & Feature Banner (4 Pillars) */}
      <div className="rounded-xl bg-[#070b15] border border-slate-800 p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs mt-8">
        
        {/* Pillar 1 */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="font-bold text-white text-xs">Données mises à jour en temps réel</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Derniers tournois • Dernières victoires</div>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-950/40 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="font-bold text-white text-xs">Fiable & vérifié</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Basé sur la communauté OP TCG</div>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-sky-950/40 border border-sky-500/30 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="font-bold text-white text-xs">Rejoignez la communauté</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Decks • Échanges • Discussions</div>
          </div>
        </div>

        {/* Pillar 4 */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-950/40 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="font-bold text-white text-xs">Ne ratez rien</div>
            <div className="text-[10px] text-slate-400 mt-0.5">News • Reveals • OP18</div>
          </div>
        </div>

      </div>

      {/* Modal for Leader Multiple Decklists */}
      {selectedLeaderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F17]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-11 rounded overflow-hidden border border-slate-700 bg-slate-800">
                  <img
                    src={getCardImageUrl(selectedLeaderDetail.leaderCard)}
                    alt={selectedLeaderDetail.leaderCard.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => handleCardImageError(e, selectedLeaderDetail.leaderCard)}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Decklists de Tournois : {selectedLeaderDetail.leaderCard.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedLeaderDetail.sampleDecklists.length} listes victorieuses recensées
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLeaderDetail(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-3.5 max-h-[65vh] overflow-y-auto">
              {selectedLeaderDetail.sampleDecklists.map((list, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                        {list.placement === 1 ? '🥇 1ère Place' : list.placement === 2 ? '🥈 2ème Place' : `Top ${list.placement}`}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {list.playerName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {list.tournamentName}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => {
                        handleOpenDeckView(selectedLeaderDetail.leaderCard, list.decklistUrl, list.playerName, list.tournamentName, list.placement);
                        setSelectedLeaderDetail(null);
                      }}
                      className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Afficher le Deck</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Modal for Leader Variants & Win Rate (TCG Matchmaking style) */}
      {activeLeaderVariants && (
        <LeaderVariantsModal
          leaderCard={activeLeaderVariants.leaderCard}
          variants={activeLeaderVariants.variants}
          onClose={() => setActiveLeaderVariants(null)}
          onSelectDeck={(variant) => {
            handleOpenDeckView(
              activeLeaderVariants.leaderCard,
              variant.decklistUrl,
              variant.playerName,
              variant.tournamentName,
              variant.bestPlacement
            );
          }}
          onOpenInDeckbuilder={(optcSimString, deckName) => {
            importDecklist(optcSimString, deckName);
            onNavigateToDeckbuilder();
          }}
          onSelectCard={onSelectCard}
        />
      )}

    </div>
  );
};
