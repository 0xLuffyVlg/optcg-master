import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Trophy, 
  TrendingUp, 
  Eye, 
  Copy, 
  Check, 
  Play, 
  Layers, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Sparkles,
  Search,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Card } from '../types';
import { LeaderDeckVariant } from '../services/leaderVariantsService';
import { getCardImageUrl, getColorClass, handleCardImageError } from '../utils/cardUtils';
import { formatEur } from '../services/cardmarketPriceService';

interface LeaderVariantsModalProps {
  leaderCard: Card;
  variants: LeaderDeckVariant[];
  onClose: () => void;
  onSelectDeck: (variant: LeaderDeckVariant) => void;
  onOpenInDeckbuilder: (optcSimString: string, deckName: string) => void;
  onSelectCard: (card: Card) => void;
}

export const LeaderVariantsModal: React.FC<LeaderVariantsModalProps> = ({
  leaderCard,
  variants,
  onClose,
  onSelectDeck,
  onOpenInDeckbuilder,
  onSelectCard
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // Expand ALL variants by default so every single deck displays its cards immediately
  const [expandedVariantIds, setExpandedVariantIds] = useState<Set<string>>(
    () => new Set(variants.map(v => v.id))
  );
  const [visibleCount, setVisibleCount] = useState<number>(15);
  const [filterSearch, setFilterSearch] = useState<string>('');

  // Update expanded IDs if variants change
  useEffect(() => {
    setExpandedVariantIds(new Set(variants.map(v => v.id)));
  }, [variants]);

  const colors = leaderCard.color || [];
  const colorStyles = colors.map(c => getColorClass(c));

  const totalPlayed = variants.reduce((sum, v) => sum + v.timesPlayed, 0);
  const avgWinRate = variants.length > 0 
    ? Math.round((variants.reduce((sum, v) => sum + v.winRate, 0) / variants.length) * 10) / 10
    : 56.0;

  const handleCopy = (variant: LeaderDeckVariant) => {
    navigator.clipboard.writeText(variant.optcSimString);
    setCopiedId(variant.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const toggleVariant = (id: string) => {
    setExpandedVariantIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedVariantIds(new Set(variants.map(v => v.id)));
  };

  const collapseAll = () => {
    setExpandedVariantIds(new Set());
  };

  const filteredVariants = variants.filter(v => {
    if (!filterSearch.trim()) return true;
    const q = filterSearch.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.playerName.toLowerCase().includes(q) ||
      v.tournamentName.toLowerCase().includes(q) ||
      v.allCards.some(c => c.card.name.toLowerCase().includes(q) || c.card.card_code.toLowerCase().includes(q))
    );
  });

  const displayedVariants = filteredVariants.slice(0, visibleCount);
  const allExpanded = displayedVariants.length > 0 && displayedVariants.every(v => expandedVariantIds.has(v.id));

  // Lock background body scroll when modal is open
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] overflow-y-auto bg-[#070B14]/98 backdrop-blur-2xl p-0 sm:p-4 md:p-6 flex justify-center items-start animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl bg-[#0F172A] border-0 sm:border border-slate-700/80 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden my-0 sm:my-6 flex flex-col min-h-screen sm:min-h-0 sm:max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile Quick Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:hidden z-30 w-8 h-8 rounded-full bg-slate-800/90 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 shadow-md cursor-pointer"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
        
        {/* Header - Leader & Global Stats */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-950 via-[#131C35] to-[#0F172A] border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-shrink-0">
          
          <div className="flex items-center space-x-4 min-w-0">
            {/* Leader Avatar */}
            <div 
              onClick={() => onSelectCard(leaderCard)}
              className="w-16 h-22 sm:w-20 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-xl flex-shrink-0 bg-slate-900 cursor-pointer hover:scale-105 transition-transform"
              title="Cliquez pour zoomer sur le Leader"
            >
              <img 
                src={getCardImageUrl(leaderCard)} 
                alt={leaderCard.name}
                referrerPolicy="no-referrer"
                onError={(e) => handleCardImageError(e, leaderCard)}
                className="w-full h-full object-cover" 
              />
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono font-black text-amber-400 text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                  {leaderCard.card_code}
                </span>
                {colors.map((col, idx) => (
                  <span key={col} className={`px-2 py-0.5 rounded text-[10px] font-black ${colorStyles[idx]?.bg || 'bg-slate-800'} text-white`}>
                    {col}
                  </span>
                ))}
                {leaderCard.power && (
                  <span className="text-[11px] font-bold text-slate-300">
                    • {leaderCard.power.toLocaleString()} PWR
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                {leaderCard.name}
              </h2>
              <p className="text-xs text-slate-400">
                <strong>{variants.length} variantes réelles</strong> et <strong>{totalPlayed} decklists</strong> de tournois avec leurs 50 cartes complètes
              </p>
            </div>
          </div>

          {/* Aggregate Stats Badges */}
          <div className="flex items-center space-x-2 self-stretch sm:self-auto justify-between sm:justify-end">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-[#0B0F17] border border-slate-800 text-center min-w-[80px]">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Variantes</span>
              <span className="text-sm sm:text-base font-black text-cyan-400">{variants.length}</span>
            </div>

            <div className="p-2.5 sm:p-3 rounded-2xl bg-[#0B0F17] border border-slate-800 text-center min-w-[80px]">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Total Decks</span>
              <span className="text-sm sm:text-base font-black text-amber-400">{totalPlayed}</span>
            </div>

            <div className="p-2.5 sm:p-3 rounded-2xl bg-[#0B0F17] border border-slate-800 text-center min-w-[80px]">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Win Rate</span>
              <span className={`text-sm sm:text-base font-black ${avgWinRate >= 55 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {avgWinRate}%
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Filter & Control Bar */}
        <div className="px-4 sm:px-6 py-3 bg-[#0B0F17] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
              placeholder="Filtrer par carte, joueur, tournoi..."
              className="w-full bg-[#131C35] text-xs text-white placeholder-slate-400 rounded-xl pl-9 pr-3 py-1.5 border border-slate-700 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={allExpanded ? collapseAll : expandAll}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {allExpanded ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Tout replier</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Tout déplier (50 cartes)</span>
                </>
              )}
            </button>
            <span className="text-xs text-slate-500">
              {displayedVariants.length} sur {filteredVariants.length} variantes
            </span>
          </div>
        </div>

        {/* Scrollable Variants List */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[calc(94vh-180px)]">
          {displayedVariants.map((variant, idx) => {
            const isExpanded = expandedVariantIds.has(variant.id);
            const isHighWR = variant.winRate >= 55;
            const isMidWR = variant.winRate >= 50 && variant.winRate < 55;
            const wrColor = isHighWR ? 'text-emerald-400' : isMidWR ? 'text-amber-400' : 'text-rose-400';
            const wrBg = isHighWR ? 'bg-emerald-500/15 border-emerald-500/40' : isMidWR ? 'bg-amber-500/15 border-amber-500/40' : 'bg-rose-500/15 border-rose-500/40';
            const wrBarColor = isHighWR ? 'bg-emerald-500' : isMidWR ? 'bg-amber-500' : 'bg-rose-500';

            return (
              <div 
                key={variant.id}
                className="rounded-2xl bg-[#111827] border border-slate-800 hover:border-slate-700 transition-all shadow-xl overflow-hidden group"
              >
                
                {/* Variant Header Info */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-black text-xs">
                          {idx === 0 ? '🏆 Build #1 (Consensus)' : `Build #${idx + 1}`}
                        </span>
                        <h4 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                          {variant.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400">
                        {variant.subtitle} • {variant.tournamentName} ({variant.playerName})
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 self-stretch sm:self-auto justify-end">
                      <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-right">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Cote Cardmarket</span>
                        <span className="text-xs font-black text-emerald-400">~ {formatEur(variant.estimatedCostEur)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    
                    {/* Times Played */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-[#0B0F17] border border-slate-800/80 space-y-0.5">
                      <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Fois Joué</span>
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-base sm:text-lg font-black text-white">{variant.timesPlayed}</span>
                        <span className="text-xs text-slate-500 font-bold">({variant.sharePercentage}%)</span>
                      </div>
                    </div>

                    {/* Win Rate */}
                    <div className={`p-2.5 sm:p-3 rounded-xl bg-[#0B0F17] border ${wrBg} space-y-0.5`}>
                      <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Taux de Victoire</span>
                      <div className="flex items-center justify-between">
                        <span className={`text-base sm:text-lg font-black ${wrColor}`}>{variant.winRate}%</span>
                        <span className="text-[11px] font-bold text-slate-400">
                          {variant.wins}W - {variant.losses}L
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
                        <div 
                          className={`h-full rounded-full ${wrBarColor}`} 
                          style={{ width: `${Math.min(100, Math.max(0, variant.winRate))}%` }} 
                        />
                      </div>
                    </div>

                    {/* 1st vs 2nd */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-[#0B0F17] border border-slate-800/80 space-y-0.5">
                      <span className="text-[10px] uppercase font-extrabold text-slate-400 block">1er vs 2nd Tour</span>
                      <div className="flex items-center justify-between text-xs font-bold pt-1">
                        <span className="text-amber-300">1er : {variant.winRateFirst}%</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-blue-300">2nd : {variant.winRateSecond}%</span>
                      </div>
                    </div>

                    {/* Placement */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-[#0B0F17] border border-slate-800/80 space-y-0.5">
                      <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Classement Tournoi</span>
                      <div className="flex items-center space-x-1.5 pt-0.5">
                        <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span className="text-xs font-black text-amber-300 truncate">
                          {variant.bestPlacement === 1 ? '1ère Place 🥇' : `Top ${variant.bestPlacement}`}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Toggle Header Bar for this deck */}
                  <button
                    onClick={() => toggleVariant(variant.id)}
                    className="w-full py-2 px-3 rounded-xl bg-[#0B0F17] hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span>{isExpanded ? 'Masquer la composition du deck' : 'Afficher toutes les 50 cartes de ce build'}</span>
                      <span className="text-slate-500 font-medium">({variant.totalCardsCount} cartes au total : {variant.characters.reduce((s, c) => s + c.count, 0)} Personnages, {variant.events.reduce((s, c) => s + c.count, 0)} Events, {variant.stages.reduce((s, c) => s + c.count, 0)} Terrains)</span>
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {/* Full 50 Cards Visual Grid for this deck */}
                  {isExpanded && (
                    <div className="pt-3 space-y-4 border-t border-slate-800/80 animate-in fade-in duration-150">
                      
                      {/* Characters */}
                      {variant.characters.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-black uppercase text-amber-400 flex items-center gap-1.5">
                            <span>Personnages ({variant.characters.reduce((s, c) => s + c.count, 0)})</span>
                          </span>
                          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                            {variant.characters.map(item => (
                              <div
                                key={item.card.card_code}
                                onClick={() => onSelectCard(item.card)}
                                title={`${item.card.name} (${item.card.card_code}) - ${item.count}x exemplaires`}
                                className="relative rounded-xl overflow-hidden border border-slate-700 hover:border-amber-400 bg-slate-900 cursor-pointer transition-all hover:scale-105 group/c shadow-md"
                              >
                                <img
                                  src={getCardImageUrl(item.card)}
                                  alt={item.card.name}
                                  referrerPolicy="no-referrer"
                                  onError={(e) => handleCardImageError(e, item.card)}
                                  className="w-full aspect-[2.5/3.5] object-cover"
                                  loading="lazy"
                                />
                                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/90 text-amber-300 font-black text-[10px] border border-amber-400/50 shadow">
                                  {item.count}x
                                </span>
                                {item.card.cost !== null && (
                                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-950/90 text-white font-black text-[9px] flex items-center justify-center border border-slate-600">
                                    {item.card.cost}
                                  </span>
                                )}
                                <div className="absolute inset-x-0 bottom-0 p-1 bg-black/85 text-[8px] font-bold text-white truncate text-center">
                                  {item.card.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Events */}
                      {variant.events.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-black uppercase text-cyan-400 flex items-center gap-1.5">
                            <span>Événements ({variant.events.reduce((s, c) => s + c.count, 0)})</span>
                          </span>
                          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                            {variant.events.map(item => (
                              <div
                                key={item.card.card_code}
                                onClick={() => onSelectCard(item.card)}
                                title={`${item.card.name} (${item.card.card_code}) - ${item.count}x exemplaires`}
                                className="relative rounded-xl overflow-hidden border border-slate-700 hover:border-cyan-400 bg-slate-900 cursor-pointer transition-all hover:scale-105 shadow-md"
                              >
                                <img
                                  src={getCardImageUrl(item.card)}
                                  alt={item.card.name}
                                  referrerPolicy="no-referrer"
                                  onError={(e) => handleCardImageError(e, item.card)}
                                  className="w-full aspect-[2.5/3.5] object-cover"
                                  loading="lazy"
                                />
                                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/90 text-cyan-300 font-black text-[10px] border border-cyan-400/50 shadow">
                                  {item.count}x
                                </span>
                                <div className="absolute inset-x-0 bottom-0 p-1 bg-black/85 text-[8px] font-bold text-white truncate text-center">
                                  {item.card.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stages */}
                      {variant.stages.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-black uppercase text-emerald-400 flex items-center gap-1.5">
                            <span>Terrains ({variant.stages.reduce((s, c) => s + c.count, 0)})</span>
                          </span>
                          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                            {variant.stages.map(item => (
                              <div
                                key={item.card.card_code}
                                onClick={() => onSelectCard(item.card)}
                                title={`${item.card.name} (${item.card.card_code}) - ${item.count}x exemplaires`}
                                className="relative rounded-xl overflow-hidden border border-slate-700 hover:border-emerald-400 bg-slate-900 cursor-pointer transition-all hover:scale-105 shadow-md"
                              >
                                <img
                                  src={getCardImageUrl(item.card)}
                                  alt={item.card.name}
                                  referrerPolicy="no-referrer"
                                  onError={(e) => handleCardImageError(e, item.card)}
                                  className="w-full aspect-[2.5/3.5] object-cover"
                                  loading="lazy"
                                />
                                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/90 text-emerald-300 font-black text-[10px] border border-emerald-400/50 shadow">
                                  {item.count}x
                                </span>
                                <div className="absolute inset-x-0 bottom-0 p-1 bg-black/85 text-[8px] font-bold text-white truncate text-center">
                                  {item.card.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* Actions Toolbar */}
                  <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-800/60">
                    <button
                      onClick={() => handleCopy(variant)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                      title="Copier au format OPTCSim"
                    >
                      {copiedId === variant.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier OPTCSim</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        onOpenInDeckbuilder(variant.optcSimString, `${leaderCard.name} - ${variant.name}`);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Deckbuilder</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectDeck(variant);
                        onClose();
                      }}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspecter le Deck (Courbe, PDF)</span>
                    </button>
                  </div>

                </div>

              </div>
            );
          })}

          {visibleCount < filteredVariants.length && (
            <div className="pt-2 text-center">
              <button
                onClick={() => setVisibleCount(prev => prev + 15)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-black text-xs border border-slate-700 transition-all shadow-lg cursor-pointer"
              >
                Afficher plus de variantes ({filteredVariants.length - visibleCount} restantes)
              </button>
            </div>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
};
