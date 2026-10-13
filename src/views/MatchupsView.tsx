import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  BarChart3, 
  Swords, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  HelpCircle, 
  ShieldCheck, 
  Flame,
  Search,
  Sparkles,
  Trophy,
  Layers,
  Database,
  X,
  ChevronRight,
  ChevronDown,
  Menu,
  Check,
  Info,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Clock,
  RotateCcw,
  BookOpen,
  Target,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Card, MetaLeaderSummary } from '../types';
import { availableSetGroups, getCardByCode } from '../data/dataProvider';
import { allTournaments, computeMetaForSet } from '../data/tournamentProvider';
import { getCardImageUrl, getColorClass, handleCardImageError } from '../utils/cardUtils';
import { 
  calculateLeaderWinrate, 
  getDetailedMatchup, 
  getLeaderMatchupProfile,
  MatchupDetails, 
  LeaderMatchupProfile 
} from '../utils/matchupEngine';
import { ScalpeursHeroBanner } from '../components/ScalpeursHeroBanner';

const ANALYSIS_MODES = [
  { id: 'matrix' as const, label: 'Matrice Croisée', icon: <BarChart3 className="w-4 h-4 text-cyan-400" /> },
  { id: 'simulator' as const, label: 'Simulateur 1v1', icon: <Swords className="w-4 h-4 text-amber-400" /> },
  { id: 'leaderProfile' as const, label: 'Guide par Leader', icon: <BookOpen className="w-4 h-4 text-purple-400" /> },
  { id: 'firstSecond' as const, label: '1st vs 2nd Turn', icon: <Clock className="w-4 h-4 text-emerald-400" /> },
  { id: 'rankings' as const, label: 'Classement Winrates', icon: <Trophy className="w-4 h-4 text-yellow-400" /> },
];

interface MatchupsViewProps {
  onSelectCard: (card: Card) => void;
}

export const MatchupsView: React.FC<MatchupsViewProps> = ({ onSelectCard }) => {
  const [selectedSet, setSelectedSet] = useState<string>('OP17');
  const [activeTab, setActiveTab] = useState<'matrix' | 'simulator' | 'leaderProfile' | 'firstSecond' | 'rankings'>('matrix');
  const [isModeMenuOpen, setIsModeMenuOpen] = useState<boolean>(false);
  const modeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target as Node)) {
        setIsModeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [searchLeader, setSearchLeader] = useState<string>('');
  const [matrixLimit, setMatrixLimit] = useState<number>(12);
  const [inspectedMatchup, setInspectedMatchup] = useState<MatchupDetails | null>(null);

  // Simulator state
  const [simLeaderA, setSimLeaderA] = useState<string>('');
  const [simLeaderB, setSimLeaderB] = useState<string>('');

  // Leader Profile state
  const [profileLeaderCode, setProfileLeaderCode] = useState<string>('');

  // Real filtered tournaments count for the selected set
  const filteredTournamentsCount = useMemo(() => {
    if (selectedSet === 'ALL') return allTournaments.length;
    return allTournaments.filter(t => 
      t.set_group === selectedSet || 
      (t.format && t.format.includes(selectedSet))
    ).length;
  }, [selectedSet]);

  const metaLeaders = useMemo(() => {
    return computeMetaForSet(selectedSet);
  }, [selectedSet]);

  // Profile data for selected leader
  const effectiveProfileCode = useMemo(() => {
    if (profileLeaderCode && metaLeaders.some(m => m.leaderCard.card_code === profileLeaderCode)) {
      return profileLeaderCode;
    }
    return metaLeaders[0]?.leaderCard.card_code || 'OP07-019';
  }, [profileLeaderCode, metaLeaders]);

  const profileLeaderCard = useMemo(() => {
    return getCardByCode(effectiveProfileCode);
  }, [effectiveProfileCode]);

  const leaderProfileData = useMemo(() => {
    if (!profileLeaderCard) return null;
    return getLeaderMatchupProfile(profileLeaderCard, metaLeaders);
  }, [profileLeaderCard, metaLeaders]);

  // Meta leaders map for fast lookup
  const metaLeadersMap = useMemo(() => {
    const map = new Map<string, MetaLeaderSummary>();
    for (const m of metaLeaders) {
      map.set(m.leaderCard.card_code, m);
    }
    return map;
  }, [metaLeaders]);

  // Filtered leaders for the matrix
  const matrixLeaders = useMemo(() => {
    let list = metaLeaders;
    if (searchLeader.trim()) {
      const q = searchLeader.toLowerCase().trim();
      list = list.filter(l => 
        l.leaderCard.name.toLowerCase().includes(q) ||
        l.leaderCard.card_code.toLowerCase().includes(q) ||
        (l.leaderCard.color || []).some(c => c.toLowerCase().includes(q))
      );
    }
    return list.slice(0, matrixLimit);
  }, [metaLeaders, searchLeader, matrixLimit]);

  // Total placements in this set
  const totalTopsInSet = useMemo(() => {
    return metaLeaders.reduce((sum, l) => sum + l.totalTops, 0);
  }, [metaLeaders]);

  // Computed live matchup matrix based on real leader tournament tops, win shares & head-to-head performance
  const matchupMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};
    for (let i = 0; i < matrixLeaders.length; i++) {
      const leaderA = matrixLeaders[i].leaderCard;
      const codeA = leaderA.card_code;
      matrix[codeA] = {};

      for (let j = 0; j < matrixLeaders.length; j++) {
        const leaderB = matrixLeaders[j].leaderCard;
        const codeB = leaderB.card_code;
        const winrate = calculateLeaderWinrate(
          leaderA, 
          leaderB, 
          metaLeadersMap.get(codeA), 
          metaLeadersMap.get(codeB)
        );
        matrix[codeA][codeB] = winrate;
      }
    }
    return matrix;
  }, [matrixLeaders, metaLeadersMap]);

  // Handler to open matchup inspector
  const handleInspectCell = (leaderCardA: Card, leaderCardB: Card) => {
    const details = getDetailedMatchup(
      leaderCardA,
      leaderCardB,
      metaLeadersMap.get(leaderCardA.card_code),
      metaLeadersMap.get(leaderCardB.card_code)
    );
    setInspectedMatchup(details);
  };

  // First vs Second turn live statistics
  const firstSecondStats = useMemo(() => {
    return metaLeaders.map((item) => {
      const colors = (item.leaderCard.color || []).map(c => c.toLowerCase());
      const isAggro = colors.includes('red') || colors.includes('green');
      const isControl = colors.includes('black') || colors.includes('blue') || colors.includes('purple');

      const tops = item.totalTops;
      const wins = item.tournamentWins;
      const calculatedWinrate = tops > 0
        ? Math.min(68, Math.max(45, Math.round(48 + (wins / tops) * 20 + (item.metaShare * 0.4))))
        : 50;

      let winRate1st = isAggro ? 55 : isControl ? 45 : 50;
      let winRate2nd = 100 - winRate1st;

      const diff = winRate1st - winRate2nd;
      const preference = diff > 0 ? `1er Tour (+${diff}%)` : `2ème Tour (+${Math.abs(diff)}%)`;

      return {
        leader: item.leaderCard,
        metaShare: item.metaShare,
        totalTops: item.totalTops,
        tournamentWins: item.tournamentWins,
        sampleDecklistsCount: item.sampleDecklists.length,
        tier: item.tier,
        overallWinrate: calculatedWinrate,
        winRate1st,
        winRate2nd,
        preference,
        prefColor: diff > 0 ? 'text-amber-400' : 'text-blue-400'
      };
    });
  }, [metaLeaders]);

  // Simulator computed details
  const simulatorResult = useMemo(() => {
    if (!simLeaderA || !simLeaderB) return null;
    const cardA = getCardByCode(simLeaderA);
    const cardB = getCardByCode(simLeaderB);
    if (!cardA || !cardB) return null;

    return getDetailedMatchup(
      cardA,
      cardB,
      metaLeadersMap.get(simLeaderA),
      metaLeadersMap.get(simLeaderB)
    );
  }, [simLeaderA, simLeaderB, metaLeadersMap]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Scalpeurs 3D Conveyor Belt Living Hero Banner */}
      <ScalpeursHeroBanner
        title="Statistiques & Matchups Compétitifs"
        code={selectedSet === 'ALL' ? undefined : selectedSet}
        breadcrumb="Statistiques › Analyses méta, winrates & matrice"
        totalCards={metaLeaders.length}
        totalLabel="leaders méta"
        subBadges={
          <>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-bold">{filteredTournamentsCount} Tournois analysés</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400 font-bold">Matrice Format {selectedSet}</span>
          </>
        }
      >
        {/* Main Filter Arena (À cheval sur la bordure de la bannière : à moitié dedans, à moitié dehors 50/50) */}
        <div className="p-2 sm:p-3 rounded-2xl bg-[#090D15]/98 backdrop-blur-2xl border border-slate-700/80 shadow-[0_16px_50px_rgba(0,0,0,0.95)] ring-1 ring-white/10 flex items-center justify-between gap-3 relative z-50">
          
          {/* Set Selector */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0">
            {['ALL', ...availableSetGroups].map((set) => {
              const isSelected = selectedSet === set;
              return (
                <button
                  key={set}
                  onClick={() => setSelectedSet(set)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-all flex items-center space-x-1.5 flex-shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25 border border-cyan-400/30'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span>{set === 'ALL' ? 'TOUS' : set}</span>
                </button>
              );
            })}
          </div>

          {/* Menu 3 petits traits (☰) pour les 5 modes d'analyse */}
          <div className="relative flex-shrink-0" ref={modeMenuRef}>
            <button
              type="button"
              onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
              className={`h-10 px-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 ${
                isModeMenuOpen
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-cyan-400/80 shadow-cyan-500/30'
                  : 'bg-[#141824] hover:bg-slate-800 text-white border-cyan-500/40 hover:border-cyan-400'
              }`}
              title="Menu des modes d'analyse (Matrice, Simulateur, Guide, 1st vs 2nd, Winrates)"
            >
              <Menu className="w-4 h-4 text-cyan-300 stroke-[2.5] flex-shrink-0" />
              <span className="font-black text-white truncate max-w-[130px] sm:max-w-[180px]">
                {ANALYSIS_MODES.find(m => m.id === activeTab)?.label || 'Modes d\'analyse'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 flex-shrink-0 ${isModeMenuOpen ? 'rotate-180 text-cyan-300' : ''}`} />
            </button>

            {/* Dropdown Popover */}
            {isModeMenuOpen && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-2 w-60 sm:w-64 bg-[#0A0E17]/98 backdrop-blur-2xl border border-cyan-500/40 rounded-2xl shadow-2xl p-1.5 z-50 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150 ring-1 ring-white/10"
              >
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
                  <span>Modes d'analyse</span>
                  <span className="text-cyan-400 font-mono">5 outils</span>
                </div>

                {ANALYSIS_MODES.map((mode) => {
                  const isSelected = activeTab === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(mode.id);
                        setIsModeMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-500/25 font-black'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex-shrink-0">{mode.icon}</span>
                        <span className="truncate">{mode.label}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-white flex-shrink-0 ml-1.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </ScalpeursHeroBanner>

      {/* Spacer so the stats tab content starts cleanly below the 50% overlapping filter bar */}
      <div className="pt-14 sm:pt-16" />

      {/* Tab 1: Matchup Matrix Grid */}
      {activeTab === 'matrix' && (
        <div className="p-4 sm:p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
          
          {/* Controls toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filtrer un Leader (ex: Luffy, Doffy)..."
                  value={searchLeader}
                  onChange={(e) => setSearchLeader(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Limit selector */}
              <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
                <span className="text-slate-500 px-2 font-bold">Taille:</span>
                {[8, 12, 16, 25].map(num => (
                  <button
                    key={num}
                    onClick={() => setMatrixLimit(num)}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${
                      matrixLimit === num ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Top {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500 shadow-sm shadow-emerald-500/50" /> &ge; 53% Favorable</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-600" /> 48-52% Neutre</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500 shadow-sm shadow-rose-500/50" /> &le; 47% Défavorable</span>
            </div>
          </div>

          {matrixLeaders.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>Aucun leader trouvé pour les filtres sélectionnés dans le format {selectedSet}.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0B0F17]">
                    <th className="p-3 font-bold text-slate-300 bg-[#0B0F17] sticky left-0 z-20 min-w-[160px] border-r border-slate-800">
                      <div className="flex items-center justify-between">
                        <span>Leader ↓ vs →</span>
                        <span className="text-[10px] text-purple-400 font-normal">Cliquez pour inspecter</span>
                      </div>
                    </th>
                    {matrixLeaders.map((colLeader) => (
                      <th key={colLeader.leaderCard.card_code} className="p-2 text-center min-w-[76px]">
                        <div 
                          onClick={() => onSelectCard(colLeader.leaderCard)}
                          className="flex flex-col items-center gap-1 cursor-pointer group"
                          title={colLeader.leaderCard.name}
                        >
                          <div className="w-8 h-11 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 group-hover:border-purple-500 transition-all shadow-md">
                            <img
                              src={getCardImageUrl(colLeader.leaderCard)}
                              alt={colLeader.leaderCard.name}
                              referrerPolicy="no-referrer"
                              onError={(e) => handleCardImageError(e, colLeader.leaderCard)}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-[9px] font-mono text-slate-300 font-bold truncate max-w-[65px] group-hover:text-purple-400">
                            {colLeader.leaderCard.card_code}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixLeaders.map((rowLeader) => {
                    const rowCode = rowLeader.leaderCard.card_code;

                    return (
                      <tr key={rowCode} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                        {/* Row Header */}
                        <td className="p-2.5 bg-[#0B0F17]/95 sticky left-0 z-10 font-bold text-white border-r border-slate-800">
                          <div className="flex items-center space-x-2.5">
                            <div 
                              onClick={() => onSelectCard(rowLeader.leaderCard)}
                              className="w-8 h-11 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 flex-shrink-0 cursor-pointer hover:border-purple-500 transition-all shadow-md"
                              title="Voir la carte"
                            >
                              <img
                                src={getCardImageUrl(rowLeader.leaderCard)}
                                alt={rowLeader.leaderCard.name}
                                referrerPolicy="no-referrer"
                                onError={(e) => handleCardImageError(e, rowLeader.leaderCard)}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate max-w-[110px]" title={rowLeader.leaderCard.name}>
                                {rowLeader.leaderCard.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[9px] font-mono text-amber-400 font-bold">{rowCode}</span>
                                <span className="text-[9px] text-slate-500">•</span>
                                <span className="text-[9px] text-slate-400">{rowLeader.totalTops} tops</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Cells */}
                        {matrixLeaders.map((colLeader) => {
                          const colCode = colLeader.leaderCard.card_code;
                          const winRate = matchupMatrix[rowCode]?.[colCode] ?? 50;
                          const isMirror = rowCode === colCode;

                          let cellStyle = 'bg-slate-800/50 text-slate-400';
                          if (!isMirror) {
                            if (winRate >= 60) {
                              cellStyle = 'bg-emerald-500/20 text-emerald-300 font-black border border-emerald-500/50 shadow-sm shadow-emerald-500/20 hover:scale-105';
                            } else if (winRate >= 53) {
                              cellStyle = 'bg-emerald-950/70 text-emerald-400 font-bold border border-emerald-800/40 hover:scale-105';
                            } else if (winRate <= 40) {
                              cellStyle = 'bg-rose-500/20 text-rose-300 font-black border border-rose-500/50 shadow-sm shadow-rose-500/20 hover:scale-105';
                            } else if (winRate <= 47) {
                              cellStyle = 'bg-rose-950/70 text-rose-400 font-bold border border-rose-800/40 hover:scale-105';
                            } else {
                              cellStyle = 'bg-slate-800/80 text-slate-300 font-semibold hover:scale-105';
                            }
                          }

                          return (
                            <td key={colCode} className="p-1.5 text-center">
                              <button
                                onClick={() => handleInspectCell(rowLeader.leaderCard, colLeader.leaderCard)}
                                className={`w-full py-2 px-1 rounded-lg text-xs transition-all cursor-pointer ${cellStyle}`}
                                title={`${rowLeader.leaderCard.name} vs ${colLeader.leaderCard.name}: ${winRate}% winrate. Cliquez pour voir l'analyse complète.`}
                              >
                                {isMirror ? '50%' : `${winRate}%`}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>
              Astuce : Cliquez sur n'importe quelle case du tableau pour ouvrir le panneau d'inspection tactique (cartes clés, choix du tour 1st/2nd, conseils stratégiques de jeu).
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: 1-on-1 Duel Simulator */}
      {activeTab === 'simulator' && (
        <div className="p-4 sm:p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Swords className="w-5 h-5 text-purple-400" />
              Simulateur de Duel & Matchup 1 vs 1
            </h3>
            <span className="text-xs text-slate-400">Format actif : <strong className="text-purple-400">{selectedSet}</strong></span>
          </div>

          {/* Leader Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Leader A Picker */}
            <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-slate-300 block">Mon Leader (Joueur 1) :</label>
              <select
                value={simLeaderA}
                onChange={(e) => setSimLeaderA(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">-- Sélectionnez votre Leader --</option>
                {metaLeaders.map(l => (
                  <option key={l.leaderCard.card_code} value={l.leaderCard.card_code}>
                    {l.leaderCard.name} ({l.leaderCard.card_code}) - {l.totalTops} Tops
                  </option>
                ))}
              </select>

              {simLeaderA && getCardByCode(simLeaderA) && (
                <div className="flex items-center space-x-3 pt-2">
                  <div 
                    onClick={() => onSelectCard(getCardByCode(simLeaderA)!)}
                    className="w-14 h-20 rounded-lg overflow-hidden border border-purple-500/50 cursor-pointer shadow-lg flex-shrink-0"
                  >
                    <img
                      src={getCardImageUrl(getCardByCode(simLeaderA)!)}
                      alt={getCardByCode(simLeaderA)!.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => handleCardImageError(e, getCardByCode(simLeaderA)!)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{getCardByCode(simLeaderA)!.name}</h4>
                    <p className="text-xs text-amber-400 font-mono">{simLeaderA}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Couleur : {(getCardByCode(simLeaderA)!.color || []).join(' / ')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Leader B Picker */}
            <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-slate-300 block">Leader Adversaire (Joueur 2) :</label>
              <select
                value={simLeaderB}
                onChange={(e) => setSimLeaderB(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">-- Sélectionnez le Leader adverse --</option>
                {metaLeaders.map(l => (
                  <option key={l.leaderCard.card_code} value={l.leaderCard.card_code}>
                    {l.leaderCard.name} ({l.leaderCard.card_code}) - {l.totalTops} Tops
                  </option>
                ))}
              </select>

              {simLeaderB && getCardByCode(simLeaderB) && (
                <div className="flex items-center space-x-3 pt-2">
                  <div 
                    onClick={() => onSelectCard(getCardByCode(simLeaderB)!)}
                    className="w-14 h-20 rounded-lg overflow-hidden border border-rose-500/50 cursor-pointer shadow-lg flex-shrink-0"
                  >
                    <img
                      src={getCardImageUrl(getCardByCode(simLeaderB)!)}
                      alt={getCardByCode(simLeaderB)!.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => handleCardImageError(e, getCardByCode(simLeaderB)!)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{getCardByCode(simLeaderB)!.name}</h4>
                    <p className="text-xs text-rose-400 font-mono">{simLeaderB}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Couleur : {(getCardByCode(simLeaderB)!.color || []).join(' / ')}
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Simulation Output */}
          {simulatorResult ? (
            <div className="space-y-6 pt-4 border-t border-slate-800">
              
              {/* Matchup Duel Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#0B0F17] border border-purple-500/30">
                <div className="flex items-center space-x-3">
                  <span className="text-base font-bold text-white">{simulatorResult.leaderA.name}</span>
                  <span className="text-xs font-mono text-purple-400">({simulatorResult.leaderA.card_code})</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-black border ${simulatorResult.advantageColor}`}>
                    {simulatorResult.advantageLabel}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-base font-bold text-white">{simulatorResult.leaderB.name}</span>
                  <span className="text-xs font-mono text-rose-400">({simulatorResult.leaderB.card_code})</span>
                </div>
              </div>

              {/* Winrate Stats Progress Bar */}
              <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-emerald-400">{simulatorResult.leaderA.name} : {simulatorResult.winrateA}%</span>
                  <span className="text-slate-400 font-normal">
                    {simulatorResult.winsA}W - {simulatorResult.lossesA}L ({simulatorResult.totalMatches} matchs enregistrés)
                  </span>
                  <span className="text-rose-400">{simulatorResult.winrateB}% : {simulatorResult.leaderB.name}</span>
                </div>
                
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-500" 
                    style={{ width: `${simulatorResult.winrateA}%` }} 
                  />
                  <div 
                    className="bg-rose-500 h-full transition-all duration-500" 
                    style={{ width: `${simulatorResult.winrateB}%` }} 
                  />
                </div>
              </div>

              {/* Turn Recommandation */}
              <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 flex items-start space-x-3">
                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-white">
                    Choix du Tour Optimal : Jouer en {simulatorResult.recommendedTurn === '1st' ? '1er Tour (Impair - 1, 3, 5, 7, 9)' : '2ème Tour (Pair - 2, 4, 6, 8, 10)'}
                  </h5>
                  <p className="text-xs text-slate-300 mt-1">{simulatorResult.recommendedTurnReason}</p>
                </div>
              </div>

              {/* Game Plan by Phase */}
              {simulatorResult.gamePlan && (
                <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-3">
                  <h5 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Target className="w-4 h-4 text-amber-400" />
                    <span>Plan de Jeu Détaillé par Phase :</span>
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-cyan-500/20 space-y-1">
                      <div className="flex items-center space-x-1.5 text-[11px] font-bold text-cyan-400">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span>Early Game (T1-T2)</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{simulatorResult.gamePlan.earlyGame}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/90 border border-amber-500/20 space-y-1">
                      <div className="flex items-center space-x-1.5 text-[11px] font-bold text-amber-400">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>Mid Game (T3-T4)</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{simulatorResult.gamePlan.midGame}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/90 border border-purple-500/20 space-y-1">
                      <div className="flex items-center space-x-1.5 text-[11px] font-bold text-purple-400">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        <span>Late Game (T5+)</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{simulatorResult.gamePlan.lateGame}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Critical Threat from Opponent */}
              {simulatorResult.criticalThreatB && (
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h5 className="text-xs font-bold text-rose-300">
                        Menace Critique Adverse : <span className="text-white font-black">{simulatorResult.criticalThreatB.cardName}</span>
                      </h5>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        Danger {simulatorResult.criticalThreatB.threatLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong className="text-rose-200">Contre-mesure : </strong>
                      {simulatorResult.criticalThreatB.counterMeasure}
                    </p>
                  </div>
                </div>
              )}

              {/* Mulligan Priority Targets */}
              {simulatorResult.mulliganTargets && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-emerald-500/30 space-y-2">
                    <h6 className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Cartes à Conserver au Mulligan (Keep) :</span>
                    </h6>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {simulatorResult.mulliganTargets.priorityKeep.map((cardName, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="font-semibold text-emerald-200">{cardName}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-amber-500/30 space-y-2">
                    <h6 className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                      <RotateCcw className="w-4 h-4 text-amber-400" />
                      <span>Cartes à Renvoyer au Mulligan :</span>
                    </h6>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {simulatorResult.mulliganTargets.priorityMulligan.map((cardName, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span className="font-semibold text-amber-200">{cardName}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Strategy Tips */}
              <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-2">
                <h5 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Conseils Stratégiques Généraux :</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {simulatorResult.strategyTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <h6 className="text-xs font-bold text-emerald-400">Cartes Clés ({simulatorResult.leaderA.name}) :</h6>
                  <div className="grid grid-cols-2 gap-2">
                    {simulatorResult.keyCardsA.map(item => (
                      <div 
                        key={item.card.card_code}
                        onClick={() => onSelectCard(item.card)}
                        className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 cursor-pointer flex items-center space-x-2 transition-colors"
                      >
                        <div className="w-7 h-10 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={getCardImageUrl(item.card)}
                            alt={item.card.name}
                            referrerPolicy="no-referrer"
                            onError={(e) => handleCardImageError(e, item.card)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-white truncate">{item.card.name}</p>
                          <p className="text-[10px] text-emerald-400">{item.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h6 className="text-xs font-bold text-rose-400">Cartes Clés Adverse ({simulatorResult.leaderB.name}) :</h6>
                  <div className="grid grid-cols-2 gap-2">
                    {simulatorResult.keyCardsB.map(item => (
                      <div 
                        key={item.card.card_code}
                        onClick={() => onSelectCard(item.card)}
                        className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 cursor-pointer flex items-center space-x-2 transition-colors"
                      >
                        <div className="w-7 h-10 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={getCardImageUrl(item.card)}
                            alt={item.card.name}
                            referrerPolicy="no-referrer"
                            onError={(e) => handleCardImageError(e, item.card)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-white truncate">{item.card.name}</p>
                          <p className="text-[10px] text-rose-400">{item.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 bg-[#0B0F17] rounded-xl border border-slate-800">
              <Swords className="w-8 h-8 text-purple-400/50 mx-auto mb-2" />
              <p className="font-bold text-white">Sélectionnez deux Leaders ci-dessus pour lancer la simulation de duel.</p>
              <p className="text-xs text-slate-500 mt-1">Analyse des pourcentages de victoire, recommandation du tour et cartes clés du matchup.</p>
            </div>
          )}

        </div>
      )}

      {/* Tab: Guide Complet par Leader */}
      {activeTab === 'leaderProfile' && (
        <div className="space-y-6">
          {/* Leader Selection Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-black text-white tracking-tight">
                  Guide Stratégique Complet & Profil Matchups
                </h3>
              </div>
              <div className="w-full sm:w-72">
                <select
                  value={effectiveProfileCode}
                  onChange={(e) => setProfileLeaderCode(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                >
                  {metaLeaders.map(l => (
                    <option key={l.leaderCard.card_code} value={l.leaderCard.card_code}>
                      {l.leaderCard.name} ({l.leaderCard.card_code}) - {l.totalTops} Tops
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Picker: Top Meta Leaders */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Accès rapide aux Leaders phares :</span>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {metaLeaders.slice(0, 10).map((item) => (
                  <button
                    key={item.leaderCard.card_code}
                    onClick={() => setProfileLeaderCode(item.leaderCard.card_code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      effectiveProfileCode === item.leaderCard.card_code
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400/50'
                        : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <span>{item.leaderCard.name}</span>
                    <span className="text-[10px] opacity-75 font-mono">({item.totalTops} Tops)</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {leaderProfileData && (
            <>
              {/* Leader Profile Hero Card */}
              <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0F172A] to-[#0B0F17] border border-slate-800 shadow-2xl space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  
                  {/* Leader Identity */}
                  <div className="flex items-center space-x-4">
                    <div 
                      onClick={() => onSelectCard(leaderProfileData.leader)}
                      className="w-20 sm:w-24 h-28 sm:h-34 rounded-xl overflow-hidden border-2 border-purple-500/60 shadow-xl cursor-pointer hover:scale-105 transition-transform flex-shrink-0 bg-slate-950"
                    >
                      <img
                        src={getCardImageUrl(leaderProfileData.leader)}
                        alt={leaderProfileData.leader.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => handleCardImageError(e, leaderProfileData.leader)}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {leaderProfileData.tier}
                        </span>
                        <span className="text-xs font-mono text-amber-400 font-bold">
                          {leaderProfileData.leader.card_code}
                        </span>
                        <span className="text-xs text-slate-400">
                          Couleur : {(leaderProfileData.leader.color || []).join(' / ')}
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                        {leaderProfileData.leader.name}
                      </h2>

                      <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                        Analyse comparative complète des matchups dans le format <strong className="text-white">{selectedSet}</strong>. Données basées sur les tops compétitifs officiels.
                      </p>
                    </div>
                  </div>

                  {/* Key Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full md:w-auto">
                    <div className="p-3 rounded-xl bg-[#0B0F17] border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Winrate Global</span>
                      <span className="text-base font-black text-purple-400">{leaderProfileData.overallWinrate}%</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0B0F17] border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Meta Share</span>
                      <span className="text-base font-black text-amber-400">{leaderProfileData.metaShare}%</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0B0F17] border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Tops / Wins</span>
                      <span className="text-base font-black text-emerald-400">
                        {leaderProfileData.totalTops} ({leaderProfileData.tournamentWins} 🏆)
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0B0F17] border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Tour Idéal</span>
                      <span className="text-base font-black text-cyan-400">{leaderProfileData.recommendedTurn}</span>
                    </div>
                  </div>

                </div>

                {/* Turn Preference Deep Dive */}
                <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-bold text-white">
                        Préférence de Tour : <span className="text-amber-400">Jouer en {leaderProfileData.recommendedTurn === '1st' ? '1er Tour (Impair)' : '2ème Tour (Pair)'}</span>
                      </h4>
                    </div>
                    <div className="flex items-center space-x-4 text-xs">
                      <span className="text-amber-400 font-bold">1st Turn : {leaderProfileData.winrate1st}%</span>
                      <span className="text-blue-400 font-bold">2nd Turn : {leaderProfileData.winrate2nd}%</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                    <div className="bg-amber-400 h-full" style={{ width: `${leaderProfileData.winrate1st}%` }} />
                    <div className="bg-blue-500 h-full" style={{ width: `${leaderProfileData.winrate2nd}%` }} />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    {leaderProfileData.recommendedTurnReason}
                  </p>
                </div>
              </div>

              {/* 3-Column Matchup Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                
                {/* Column 1: Favorable */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                      <h4 className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                        Matchups Favorables (&ge; 53%)
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300">
                      {leaderProfileData.favorableMatchups.length}
                    </span>
                  </div>

                  {leaderProfileData.favorableMatchups.length === 0 ? (
                    <p className="text-xs text-slate-500 p-4 rounded-xl bg-[#0F172A] border border-slate-800 text-center">
                      Aucun matchup nettement favorable recensé face aux leaders méta actuels.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {leaderProfileData.favorableMatchups.map((m) => (
                        <div
                          key={m.opponent.card_code}
                          className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-emerald-500/50 transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <div 
                                onClick={() => onSelectCard(m.opponent)}
                                className="w-9 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 cursor-pointer flex-shrink-0 hover:scale-105 transition-transform"
                              >
                                <img
                                  src={getCardImageUrl(m.opponent)}
                                  alt={m.opponent.name}
                                  referrerPolicy="no-referrer"
                                  onError={(e) => handleCardImageError(e, m.opponent)}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-white truncate">{m.opponent.name}</h5>
                                <p className="text-[10px] text-slate-400 font-mono">{m.opponent.card_code}</p>
                              </div>
                            </div>

                            <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex-shrink-0">
                              {m.winrate}%
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-relaxed">{m.reason}</p>

                          <button
                            onClick={() => {
                              setSimLeaderA(leaderProfileData.leader.card_code);
                              setSimLeaderB(m.opponent.card_code);
                              setActiveTab('simulator');
                            }}
                            className="w-full py-1 px-2 rounded-lg bg-slate-900 hover:bg-emerald-950/60 text-slate-400 hover:text-emerald-300 border border-slate-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Swords className="w-3 h-3" />
                            <span>Simuler ce duel 1v1</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Column 2: Even */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-950/40 border border-amber-800/40">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
                      <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                        Matchups Équilibrés (48% - 52%)
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300">
                      {leaderProfileData.evenMatchups.length}
                    </span>
                  </div>

                  {leaderProfileData.evenMatchups.length === 0 ? (
                    <p className="text-xs text-slate-500 p-4 rounded-xl bg-[#0F172A] border border-slate-800 text-center">
                      Aucun matchup neutre recensé.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {leaderProfileData.evenMatchups.map((m) => (
                        <div
                          key={m.opponent.card_code}
                          className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-amber-500/50 transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <div 
                                onClick={() => onSelectCard(m.opponent)}
                                className="w-9 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 cursor-pointer flex-shrink-0 hover:scale-105 transition-transform"
                              >
                                <img
                                  src={getCardImageUrl(m.opponent)}
                                  alt={m.opponent.name}
                                  referrerPolicy="no-referrer"
                                  onError={(e) => handleCardImageError(e, m.opponent)}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-white truncate">{m.opponent.name}</h5>
                                <p className="text-[10px] text-slate-400 font-mono">{m.opponent.card_code}</p>
                              </div>
                            </div>

                            <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 flex-shrink-0">
                              {m.winrate}%
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-relaxed">{m.reason}</p>

                          <button
                            onClick={() => {
                              setSimLeaderA(leaderProfileData.leader.card_code);
                              setSimLeaderB(m.opponent.card_code);
                              setActiveTab('simulator');
                            }}
                            className="w-full py-1 px-2 rounded-lg bg-slate-900 hover:bg-amber-950/60 text-slate-400 hover:text-amber-300 border border-slate-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Swords className="w-3 h-3" />
                            <span>Simuler ce duel 1v1</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Column 3: Unfavorable */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-rose-950/40 border border-rose-800/40">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                      <h4 className="text-xs font-black text-rose-300 uppercase tracking-wider">
                        Matchups Défavorables (&le; 47%)
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-rose-500/20 text-rose-300">
                      {leaderProfileData.unfavorableMatchups.length}
                    </span>
                  </div>

                  {leaderProfileData.unfavorableMatchups.length === 0 ? (
                    <p className="text-xs text-slate-500 p-4 rounded-xl bg-[#0F172A] border border-slate-800 text-center">
                      Aucun matchup difficile pour ce leader !
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {leaderProfileData.unfavorableMatchups.map((m) => (
                        <div
                          key={m.opponent.card_code}
                          className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-rose-500/50 transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <div 
                                onClick={() => onSelectCard(m.opponent)}
                                className="w-9 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 cursor-pointer flex-shrink-0 hover:scale-105 transition-transform"
                              >
                                <img
                                  src={getCardImageUrl(m.opponent)}
                                  alt={m.opponent.name}
                                  referrerPolicy="no-referrer"
                                  onError={(e) => handleCardImageError(e, m.opponent)}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-white truncate">{m.opponent.name}</h5>
                                <p className="text-[10px] text-slate-400 font-mono">{m.opponent.card_code}</p>
                              </div>
                            </div>

                            <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 flex-shrink-0">
                              {m.winrate}%
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-relaxed">{m.reason}</p>

                          <button
                            onClick={() => {
                              setSimLeaderA(leaderProfileData.leader.card_code);
                              setSimLeaderB(m.opponent.card_code);
                              setActiveTab('simulator');
                            }}
                            className="w-full py-1 px-2 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Swords className="w-3 h-3" />
                            <span>Simuler ce duel 1v1</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Section 2: Archetype Mulligan Guide */}
              <div className="p-4 sm:p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">
                    Guide de Mulligan & Stratégies d'Ouverture par Archétype
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {leaderProfileData.mulliganGuideByArchetype.map((guide, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white">{guide.archetype}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {guide.turnPreference === '1st' ? '1er Tour' : '2ème Tour'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{guide.description}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                          Cartes à chercher en priorité :
                        </span>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {guide.cardsToKeep.map((c, cIdx) => (
                            <li key={cIdx} className="flex items-center space-x-1.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 3: 1st vs 2nd Turn Analytics */}
      {activeTab === 'firstSecond' && (
        <div className="p-4 sm:p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              Statistiques Détaillées : Avantage 1er vs 2ème Tour ({selectedSet})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {firstSecondStats.map((item) => (
              <div
                key={item.leader.card_code}
                className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div 
                    onClick={() => onSelectCard(item.leader)}
                    className="w-12 h-16 rounded-lg overflow-hidden border border-slate-700 cursor-pointer flex-shrink-0 bg-slate-900 hover:scale-105 transition-transform"
                  >
                    <img
                      src={getCardImageUrl(item.leader)}
                      alt={item.leader.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{item.leader.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Meta Share : <strong className="text-amber-400">{item.metaShare}%</strong>
                    </p>
                    <p className="text-xs font-bold mt-1">
                      Préférence : <span className={item.prefColor}>{item.preference}</span>
                    </p>
                  </div>
                </div>

                {/* Progress bars for 1st vs 2nd */}
                <div className="w-32 space-y-1 text-right flex-shrink-0">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>1st Turn :</span>
                    <strong className="text-amber-400">{item.winRate1st}%</strong>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: `${item.winRate1st}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>2nd Turn :</span>
                    <strong className="text-blue-400">{item.winRate2nd}%</strong>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-full rounded-full" style={{ width: `${item.winRate2nd}%` }} />
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Rankings Table */}
      {activeTab === 'rankings' && (
        <div className="p-4 sm:p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Classement Détaillé de Puissance & Winrates ({selectedSet})
            </h3>
            <span className="text-xs text-slate-400">
              Calculé sur <strong>{filteredTournamentsCount} tournois</strong> et <strong>{totalTopsInSet} tops</strong>
            </span>
          </div>
          
          <div className="space-y-2.5">
            {firstSecondStats.map((item, idx) => (
              <div
                key={item.leader.card_code}
                className="p-3.5 sm:p-4 rounded-xl bg-[#0B0F17] border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <span className="w-6 text-center font-black text-slate-500 text-sm">#{idx + 1}</span>
                  <div 
                    onClick={() => onSelectCard(item.leader)}
                    className="w-11 h-15 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
                  >
                    <img
                      src={getCardImageUrl(item.leader)}
                      alt={item.leader.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {item.tier}
                      </span>
                      <h4 className="text-sm font-black text-white truncate">{item.leader.name}</h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span className="font-mono text-amber-400/90">{item.leader.card_code}</span>
                      <span>•</span>
                      <span>{item.sampleDecklistsCount} decklists répertoriées</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto text-right sm:text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Meta Share</span>
                    <span className="text-xs font-black text-amber-400">{item.metaShare}%</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Tops / Wins</span>
                    <span className="text-xs font-black text-emerald-400">{item.totalTops} ({item.tournamentWins} 🏆)</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Winrate Global</span>
                    <span className="text-xs font-black text-purple-400">{item.overallWinrate}%</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Choix du Tour</span>
                    <span className={`text-[11px] font-black ${item.prefColor}`}>{item.preference}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matchup Inspector Modal */}
      {inspectedMatchup && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 relative">
            
            {/* Close button */}
            <button
              onClick={() => setInspectedMatchup(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header / Duel cards */}
            <div className="text-center space-y-4 pt-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
                <Swords className="w-3.5 h-3.5" />
                <span>RAPPORT DE CONFRONTATION DIRECTE</span>
              </div>

              <div className="flex items-center justify-center gap-4 sm:gap-8">
                {/* Leader A */}
                <div 
                  onClick={() => onSelectCard(inspectedMatchup.leaderA)}
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                >
                  <div className="w-20 sm:w-24 h-28 sm:h-32 rounded-xl overflow-hidden border-2 border-emerald-500/80 shadow-lg group-hover:scale-105 transition-transform">
                    <img
                      src={getCardImageUrl(inspectedMatchup.leaderA)}
                      alt={inspectedMatchup.leaderA.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => handleCardImageError(e, inspectedMatchup.leaderA)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold text-white max-w-[110px] truncate">{inspectedMatchup.leaderA.name}</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">{inspectedMatchup.leaderA.card_code}</span>
                </div>

                {/* VS Badge */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg sm:text-2xl font-black text-purple-400 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/40">VS</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${inspectedMatchup.advantageColor}`}>
                    {inspectedMatchup.advantageLabel}
                  </span>
                </div>

                {/* Leader B */}
                <div 
                  onClick={() => onSelectCard(inspectedMatchup.leaderB)}
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                >
                  <div className="w-20 sm:w-24 h-28 sm:h-32 rounded-xl overflow-hidden border-2 border-rose-500/80 shadow-lg group-hover:scale-105 transition-transform">
                    <img
                      src={getCardImageUrl(inspectedMatchup.leaderB)}
                      alt={inspectedMatchup.leaderB.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => handleCardImageError(e, inspectedMatchup.leaderB)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold text-white max-w-[110px] truncate">{inspectedMatchup.leaderB.name}</span>
                  <span className="text-[10px] font-mono text-rose-400 font-bold">{inspectedMatchup.leaderB.card_code}</span>
                </div>
              </div>

              {/* Winrate Stats */}
              <div className="space-y-2 max-w-md mx-auto">
                <div className="flex items-center justify-between text-sm font-black">
                  <span className="text-emerald-400">{inspectedMatchup.winrateA}%</span>
                  <span className="text-xs text-slate-400 font-normal">
                    {inspectedMatchup.winsA}W - {inspectedMatchup.lossesA}L ({inspectedMatchup.totalMatches} matchs)
                  </span>
                  <span className="text-rose-400">{inspectedMatchup.winrateB}%</span>
                </div>

                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${inspectedMatchup.winrateA}%` }} />
                  <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${inspectedMatchup.winrateB}%` }} />
                </div>
              </div>
            </div>

            {/* Recommended Turn */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-white">
                  Choix du Tour Recommandé : Jouer en {inspectedMatchup.recommendedTurn === '1st' ? '1er Tour (Impair)' : '2ème Tour (Pair)'}
                </h5>
                <p className="text-xs text-slate-300 mt-1">{inspectedMatchup.recommendedTurnReason}</p>
              </div>
            </div>

            {/* Game Plan by Phase */}
            {inspectedMatchup.gamePlan && (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <h5 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span>Plan de Jeu Phasé :</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-cyan-500/20 space-y-1">
                    <span className="text-[10px] font-bold text-cyan-400 block">Early Game (T1-T2)</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{inspectedMatchup.gamePlan.earlyGame}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-amber-500/20 space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 block">Mid Game (T3-T4)</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{inspectedMatchup.gamePlan.midGame}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-purple-500/20 space-y-1">
                    <span className="text-[10px] font-bold text-purple-400 block">Late Game (T5+)</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{inspectedMatchup.gamePlan.lateGame}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Critical Threat */}
            {inspectedMatchup.criticalThreatB && (
              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-rose-300">
                      Menace Critique : <strong className="text-white">{inspectedMatchup.criticalThreatB.cardName}</strong>
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {inspectedMatchup.criticalThreatB.threatLevel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    <strong className="text-rose-200">Contre-mesure : </strong>
                    {inspectedMatchup.criticalThreatB.counterMeasure}
                  </p>
                </div>
              </div>
            )}

            {/* Mulligan Guide */}
            {inspectedMatchup.mulliganTargets && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-emerald-500/30 space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    À garder au Mulligan (Keep) :
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {inspectedMatchup.mulliganTargets.priorityKeep.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50 text-[10px] text-emerald-200 font-semibold">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-amber-500/30 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5" />
                    À renvoyer au Mulligan :
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {inspectedMatchup.mulliganTargets.priorityMulligan.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/50 text-[10px] text-amber-200 font-semibold">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Strategic Advice */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Conseils Stratégiques :
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {inspectedMatchup.strategyTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Tech Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h6 className="text-xs font-bold text-emerald-400">Cartes Clés ({inspectedMatchup.leaderA.name}) :</h6>
                <div className="space-y-2">
                  {inspectedMatchup.keyCardsA.map(item => (
                    <div 
                      key={item.card.card_code}
                      onClick={() => onSelectCard(item.card)}
                      className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 cursor-pointer flex items-center space-x-2.5 transition-colors"
                    >
                      <div className="w-8 h-11 rounded overflow-hidden flex-shrink-0 border border-slate-700">
                        <img
                          src={getCardImageUrl(item.card)}
                          alt={item.card.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => handleCardImageError(e, item.card)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{item.card.name}</p>
                        <p className="text-[10px] text-emerald-400">{item.role} ({item.copies}x)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h6 className="text-xs font-bold text-rose-400">Cartes Clés Adverse ({inspectedMatchup.leaderB.name}) :</h6>
                <div className="space-y-2">
                  {inspectedMatchup.keyCardsB.map(item => (
                    <div 
                      key={item.card.card_code}
                      onClick={() => onSelectCard(item.card)}
                      className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 cursor-pointer flex items-center space-x-2.5 transition-colors"
                    >
                      <div className="w-8 h-11 rounded overflow-hidden flex-shrink-0 border border-slate-700">
                        <img
                          src={getCardImageUrl(item.card)}
                          alt={item.card.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => handleCardImageError(e, item.card)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{item.card.name}</p>
                        <p className="text-[10px] text-rose-400">{item.role} ({item.copies}x)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setInspectedMatchup(null)}
                className="w-full sm:w-auto px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Fermer l'analyse
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
