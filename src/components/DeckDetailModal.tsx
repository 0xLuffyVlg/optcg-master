import React, { useState, useMemo } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Play, 
  Printer, 
  Share2, 
  DollarSign, 
  Trophy, 
  Calendar, 
  Users, 
  ExternalLink,
  Crown,
  Layers,
  BarChart3,
  Shield,
  Zap,
  Swords,
  TrendingUp,
  Tag,
  ZoomIn,
  Shuffle
} from 'lucide-react';
import { Card, DeckItem } from '../types';
import { getCardImageUrl, getColorClass, generateOptcSimString, handleCardImageError, detectCardLanguage } from '../utils/cardUtils';
import { getVariantsByCode } from '../data/dataProvider';
import { generateProxyPdf } from '../utils/proxyGenerator';
import { HandSimulatorModal } from './HandSimulatorModal';
import { useCollection } from '../context/CollectionContext';
import { 
  getCardmarketPriceInfo, 
  getCardPriceForArtwork,
  getCardmarketUrl, 
  getCardtraderUrl, 
  calculateMissingCardsForDeck, 
  formatEur 
} from '../services/cardmarketPriceService';

export interface DeckDetailViewData {
  id?: string;
  name: string;
  leader: Card | null;
  cards: DeckItem[];
  format?: string;
  setGroup?: string;
  playerName?: string;
  placement?: number;
  tournamentName?: string;
  eventType?: string;
  date?: string;
}

interface DeckDetailModalProps {
  deckData: DeckDetailViewData | null;
  onClose: () => void;
  onOpenInDeckbuilder: (deckData: DeckDetailViewData) => void;
  onSelectCard: (card: Card) => void;
}

function getColorHex(colorName?: string): string {
  switch (colorName?.toLowerCase()) {
    case 'red': return '#dc2626';
    case 'green': return '#16a34a';
    case 'blue': return '#2563eb';
    case 'purple': return '#9333ea';
    case 'black': return '#334155';
    case 'yellow': return '#eab308';
    default: return '#475569';
  }
}

export const DeckDetailModal: React.FC<DeckDetailModalProps> = ({
  deckData,
  onClose,
  onOpenInDeckbuilder,
  onSelectCard
}) => {
  const { getTotalCardCopies, setCollectionCount } = useCollection();
  const [copiedOptcSim, setCopiedOptcSim] = useState(false);
  const [showPrices, setShowPrices] = useState(true);
  const [activeTab, setActiveTab] = useState<'visual' | 'calculator' | 'stats'>('visual');
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isHandSimOpen, setIsHandSimOpen] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  // Custom owned counts map (allows live ticking/checking in calculator)
  const [customOwned, setCustomOwned] = useState<Record<string, number>>({});

  // Reset customOwned when opening a new deck
  React.useEffect(() => {
    if (!deckData) return;
    const initial: Record<string, number> = {};
    if (deckData.leader) {
      initial[deckData.leader.card_code] = getTotalCardCopies(deckData.leader.card_code);
    }
    for (const item of deckData.cards || []) {
      initial[item.card.card_code] = getTotalCardCopies(item.card.card_code);
    }
    setCustomOwned(initial);
  }, [deckData?.id, deckData?.name]);

  // Deck calculations with safe fallback (hooks must always execute unconditionally)
  const { totalCards, totalPrice, costCurve, typeDist, counterDist } = useMemo(() => {
    let count = 0;
    let price = 0;
    const curve: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
    const types = { Character: 0, Event: 0, Stage: 0 };
    const counters = { 0: 0, 1000: 0, 2000: 0 };

    if (!deckData?.cards) {
      return { totalCards: 0, totalPrice: 0, costCurve: curve, typeDist: types, counterDist: counters };
    }

    for (const item of deckData.cards) {
      count += item.count;
      
      // Price from artwork / variant (1er prix Near Mint)
      const artPrice = getCardPriceForArtwork(item.card, item.selectedArtwork || item.card._defaultImagePath);
      const unitPrice = artPrice.priceMinEur || artPrice.priceEur || artPrice.cardmarketPriceEur;
      price += unitPrice * item.count;

      // Curve
      const c = item.card.cost !== null && item.card.cost !== undefined ? Math.min(10, Math.max(0, item.card.cost)) : 0;
      curve[c] = (curve[c] || 0) + item.count;

      // Types
      if (item.card.category === 'Character') types.Character += item.count;
      if (item.card.category === 'Event') types.Event += item.count;
      if (item.card.category === 'Stage') types.Stage += item.count;

      // Counters
      if (item.card.counter === 2000) counters[2000] += item.count;
      else if (item.card.counter === 1000) counters[1000] += item.count;
      else counters[0] += item.count;
    }

    return {
      totalCards: count,
      totalPrice: Math.round(price * 100) / 100,
      costCurve: curve,
      typeDist: types,
      counterDist: counters
    };
  }, [deckData]);

  // OPTCSim string (unconditional hook)
  const optcSimCode = useMemo(() => {
    if (!deckData) return '';
    const lines: string[] = [];
    if (deckData.leader) lines.push(`1x${deckData.leader.card_code}`);
    for (const item of deckData.cards || []) {
      lines.push(`${item.count}x${item.card.card_code}`);
    }
    return lines.join('\n');
  }, [deckData]);

  // Missing cards & pricing calculation
  const missingReport = useMemo(() => {
    if (!deckData) {
      return {
        totalDeckCount: 0,
        ownedCardsCount: 0,
        missingCardsCount: 0,
        missingCostCt: 0,
        missingCostCm: 0,
        totalDeckCostCt: 0,
        totalDeckCostCm: 0,
        items: []
      };
    }

    let totalDeck = 0;
    let totalOwned = 0;
    let totalMissing = 0;
    let missingCostCt = 0;
    let missingCostCm = 0;
    let totalCt = 0;
    let totalCm = 0;

    const rows: {
      card: Card;
      needed: number;
      owned: number;
      missing: number;
      unitPriceCm: number;
      unitPriceCt: number;
      missingCostCm: number;
      missingCostCt: number;
      cmUrl: string;
      ctUrl: string;
      isLeader: boolean;
    }[] = [];

    // Leader
    if (deckData.leader) {
      const leader = deckData.leader;
      totalDeck += 1;
      const owned = customOwned[leader.card_code] !== undefined ? customOwned[leader.card_code] : getTotalCardCopies(leader.card_code);
      const needed = 1;
      const missing = Math.max(0, needed - owned);
      const artPrice = getCardPriceForArtwork(leader, leader._defaultImagePath);
      const unitCm = artPrice.priceMinEur || artPrice.priceEur || artPrice.cardmarketPriceEur;
      const unitCt = artPrice.cardtraderPriceEur > 0 ? artPrice.cardtraderPriceEur : unitCm;

      totalOwned += Math.min(needed, owned);
      totalMissing += missing;
      totalCm += unitCm;
      totalCt += unitCt;

      if (missing > 0) {
        missingCostCm += unitCm * missing;
        missingCostCt += unitCt * missing;
      }

      rows.push({
        card: leader,
        needed,
        owned: Math.min(needed, owned),
        missing,
        unitPriceCm: unitCm,
        unitPriceCt: unitCt,
        missingCostCm: Math.round(unitCm * missing * 100) / 100,
        missingCostCt: Math.round(unitCt * missing * 100) / 100,
        cmUrl: artPrice.cardmarketUrl,
        ctUrl: artPrice.cardtraderUrl,
        isLeader: true
      });
    }

    // 50 Deck cards
    for (const item of deckData.cards || []) {
      totalDeck += item.count;
      const owned = customOwned[item.card.card_code] !== undefined ? customOwned[item.card.card_code] : getTotalCardCopies(item.card.card_code);
      const needed = item.count;
      const missing = Math.max(0, needed - owned);
      const artPrice = getCardPriceForArtwork(item.card, item.selectedArtwork || item.card._defaultImagePath);
      const unitCm = artPrice.priceMinEur || artPrice.priceEur || artPrice.cardmarketPriceEur;
      const unitCt = artPrice.cardtraderPriceEur > 0 ? artPrice.cardtraderPriceEur : unitCm;

      totalOwned += Math.min(needed, owned);
      totalMissing += missing;
      totalCm += unitCm * needed;
      totalCt += unitCt * needed;

      if (missing > 0) {
        missingCostCm += unitCm * missing;
        missingCostCt += unitCt * missing;
      }

      rows.push({
        card: item.card,
        needed,
        owned: Math.min(needed, owned),
        missing,
        unitPriceCm: unitCm,
        unitPriceCt: unitCt,
        missingCostCm: Math.round(unitCm * missing * 100) / 100,
        missingCostCt: Math.round(unitCt * missing * 100) / 100,
        cmUrl: artPrice.cardmarketUrl,
        ctUrl: artPrice.cardtraderUrl,
        isLeader: false
      });
    }

    return {
      totalDeckCount: totalDeck,
      ownedCardsCount: totalOwned,
      missingCardsCount: totalMissing,
      missingCostCt: Math.round(missingCostCt * 100) / 100,
      missingCostCm: Math.round(missingCostCm * 100) / 100,
      totalDeckCostCt: Math.round(totalCt * 100) / 100,
      totalDeckCostCm: Math.round(totalCm * 100) / 100,
      items: rows
    };
  }, [deckData, customOwned]);

  // Bulk buy URLs for missing cards
  const bulkBuyMissingTerms = useMemo(() => {
    return missingReport.items
      .filter(i => i.missing > 0)
      .map(i => i.card.card_code)
      .slice(0, 6)
      .join(' ');
  }, [missingReport]);

  const bulkBuyCtUrl = getCardtraderUrl(bulkBuyMissingTerms || 'One Piece Card');
  const bulkBuyCmUrl = getCardmarketUrl(bulkBuyMissingTerms || 'One Piece Card');

  // Custom owned handlers
  const handleToggleCardOwned = (cardCode: string, needed: number) => {
    setCustomOwned(prev => {
      const curr = prev[cardCode] !== undefined ? prev[cardCode] : getTotalCardCopies(cardCode);
      return {
        ...prev,
        [cardCode]: curr >= needed ? 0 : needed
      };
    });
  };

  const handleAdjustCount = (cardCode: string, delta: number, max: number) => {
    setCustomOwned(prev => {
      const curr = prev[cardCode] !== undefined ? prev[cardCode] : getTotalCardCopies(cardCode);
      const next = Math.max(0, Math.min(max, curr + delta));
      return { ...prev, [cardCode]: next };
    });
  };

  const handleMarkAllOwned = () => {
    const next: Record<string, number> = {};
    if (deckData?.leader) next[deckData.leader.card_code] = 1;
    for (const item of deckData?.cards || []) {
      next[item.card.card_code] = item.count;
    }
    setCustomOwned(next);
  };

  const handleMarkAllMissing = () => {
    const next: Record<string, number> = {};
    if (deckData?.leader) next[deckData.leader.card_code] = 0;
    for (const item of deckData?.cards || []) {
      next[item.card.card_code] = 0;
    }
    setCustomOwned(next);
  };

  const handleResetToCollection = () => {
    const initial: Record<string, number> = {};
    if (deckData?.leader) {
      initial[deckData.leader.card_code] = getTotalCardCopies(deckData.leader.card_code);
    }
    for (const item of deckData?.cards || []) {
      initial[item.card.card_code] = getTotalCardCopies(item.card.card_code);
    }
    setCustomOwned(initial);
  };

  const handleSaveToMyCollection = () => {
    for (const [code, count] of Object.entries(customOwned)) {
      setCollectionCount(code, count);
    }
    setSavedFeedback('✅ Modifications enregistrées dans votre collection avec succès !');
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  // If no deckData, render nothing (after all hooks are declared)
  if (!deckData) return null;

  const { leader, cards, name, format, setGroup, playerName, placement, tournamentName, date } = deckData;

  const handleCopySim = () => {
    navigator.clipboard.writeText(optcSimCode);
    setCopiedOptcSim(true);
    setTimeout(() => setCopiedOptcSim(false), 2000);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsPdfGenerating(true);
      await generateProxyPdf({
        id: 'deck_proxy',
        name: name || 'one-piece-deck',
        leader,
        cards: cards || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (e: any) {
      alert(e.message || 'Erreur lors de la génération');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const leaderColors = leader?.color || ['Red'];

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-[#0F172A] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] cursor-default"
      >
        
        {/* Top Sticky Bar: Breadcrumbs & Close */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-[#0B0F17]">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 truncate">
            <span className="hover:text-white cursor-default">Decklists</span>
            <span>›</span>
            {leader && (
              <>
                <span className="text-amber-400 font-bold">{leader.name} ({leader.card_code})</span>
                <span>›</span>
              </>
            )}
            <span className="text-slate-300 font-medium">{setGroup || format || 'OP'}</span>
            {playerName && (
              <>
                <span>›</span>
                <span className="text-white font-bold">{playerName}</span>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6">
          
          {/* Header Area */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-5 border-b border-slate-800">
            
            <div className="flex items-center space-x-4 min-w-0">
              
              {/* Glowing Square Leader Avatar */}
              <div className="relative flex-shrink-0">
                <div 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 shadow-2xl relative group cursor-pointer"
                  style={{
                    background: leaderColors.length > 1
                      ? `linear-gradient(135deg, ${getColorHex(leaderColors[0])}, ${getColorHex(leaderColors[1])})`
                      : getColorHex(leaderColors[0])
                  }}
                  onClick={() => leader && onSelectCard(leader)}
                  title="Cliquez pour agrandir le Leader et voir ses effets"
                >
                  <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-900 border border-black/40 relative">
                    {leader ? (
                      <>
                        <img
                          src={getCardImageUrl(leader)}
                          alt={leader.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => handleCardImageError(e, leader)}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ZoomIn className="w-5 h-5 text-amber-400" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                        No Leader
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-1.5 min-w-0">
                
                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs border border-amber-500/30">
                    {setGroup || format || 'OP17'}
                  </span>
                  
                  {placement && (
                    <span className={`px-2.5 py-0.5 rounded-full font-black text-xs ${
                      placement === 1
                        ? 'bg-yellow-500 text-black shadow-md shadow-yellow-500/30'
                        : placement === 2
                        ? 'bg-slate-300 text-black'
                        : 'bg-amber-700 text-white'
                    }`}>
                      {placement === 1 ? '🥇 1ère Place' : placement === 2 ? '🥈 2ème Place' : `Top ${placement}`}
                    </span>
                  )}

                  {leaderColors.map(col => (
                    <span key={col} className={`px-2 py-0.2 rounded text-[10px] font-bold ${getColorClass(col).bg} text-white`}>
                      {col}
                    </span>
                  ))}
                </div>

                {/* Main Deck Name */}
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                  {name || (leader ? `Deck ${leader.name}` : 'Decklist One Piece')}
                </h1>

                {/* Player & Tournament Meta */}
                <p className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                  {playerName && (
                    <span className="font-bold text-slate-200 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      Joueur : {playerName}
                    </span>
                  )}
                  {tournamentName && (
                    <>
                      <span>•</span>
                      <span className="text-slate-300">{tournamentName}</span>
                    </>
                  )}
                  {date && (
                    <>
                      <span>•</span>
                      <span>{date}</span>
                    </>
                  )}
                </p>

              </div>

            </div>

            {/* Total Deck Cost Badges (CardTrader & Cardmarket) */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#0B0F17] to-slate-900 border border-slate-700/80 text-right flex-shrink-0 self-stretch sm:self-auto flex sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-1">
              <span className="text-[10px] text-emerald-400 uppercase font-black tracking-wider">Estimation Deck</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-base sm:text-lg font-black text-emerald-400">
                  {formatEur(missingReport.totalDeckCostCt)}
                </span>
                <span className="text-[11px] text-slate-400 font-bold">
                  (CT) / {formatEur(missingReport.totalDeckCostCm)} (CM)
                </span>
              </div>
            </div>

          </div>

          {/* View Tabs Selector */}
          <div className="flex items-center space-x-2 p-1.5 rounded-2xl bg-[#0B0F17] border border-slate-800">
            <button
              onClick={() => setActiveTab('visual')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'visual'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Composition Visuelle ({totalCards})</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'calculator'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-lg shadow-emerald-500/25'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>
                Calculateur Manquantes {missingReport.missingCardsCount > 0 ? `(${missingReport.missingCardsCount} manquantes)` : '✅'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'stats'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Courbe & Statistiques</span>
            </button>
          </div>

          {/* Action Toolbar & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0B0F17] border border-slate-800">
            
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Copy for Sim */}
              <button
                onClick={handleCopySim}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                {copiedOptcSim ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedOptcSim ? 'Copié !' : 'Copy for Sim (OPTCSim)'}</span>
              </button>

              {/* Hand Simulator Button */}
              <button
                onClick={() => setIsHandSimOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Tester la Main (Mulligan)</span>
              </button>

              {/* Edit Deck in Deckbuilder */}
              <button
                onClick={() => {
                  onOpenInDeckbuilder(deckData);
                  onClose();
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Modifier dans Deckbuilder</span>
              </button>

              {/* Generate PDF Proxies */}
              <button
                onClick={handleDownloadPdf}
                disabled={isPdfGenerating}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-800 text-slate-300 hover:text-rose-300 font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-rose-400" />
                <span>{isPdfGenerating ? 'Génération...' : 'Imprimer Proxies PDF'}</span>
              </button>

            </div>

            {/* Toggle Show Prices switch */}
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 cursor-pointer select-none text-xs text-slate-300 font-medium">
                <span>Afficher les Prix</span>
                <div 
                  onClick={() => setShowPrices(!showPrices)}
                  className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${showPrices ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${showPrices ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </label>
            </div>

          </div>

          {/* TAB 1: VISUAL GRID VIEW */}
          {activeTab === 'visual' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Composition du Deck ({totalCards}/50 Cartes + 1 Leader)
                </span>
                <span className="text-[11px] text-amber-400/90 font-bold flex items-center gap-1">
                  <ZoomIn className="w-3.5 h-3.5" />
                  Cliquez sur une carte pour voir ses effets & détails
                </span>
              </div>

              {/* Grid of 3 to 6 columns */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
                
                {/* Leader Card */}
                {leader && (
                  <div 
                    onClick={() => onSelectCard(leader)}
                    className="group relative rounded-xl overflow-hidden bg-slate-900 border-2 border-amber-400 shadow-xl cursor-pointer flex flex-col transition-all hover:scale-105"
                    title="Cliquez pour agrandir le Leader et voir ses effets"
                  >
                    <div className="relative aspect-[5/7] w-full overflow-hidden bg-slate-950">
                      <img
                        src={getCardImageUrl(leader)}
                        alt={leader.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => handleCardImageError(e, leader)}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-1 left-1 px-2 py-0.5 rounded bg-black/80 text-amber-400 font-black text-[10px] border border-amber-500/40">
                        LEADER
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-amber-400 drop-shadow-md" />
                      </div>
                    </div>

                    <div className="p-2 bg-[#0B0F17] text-center border-t border-slate-800">
                      <span className="font-black text-xs text-amber-400 block">1x</span>
                      <p className="text-[10px] text-slate-300 truncate font-semibold">{leader.name}</p>
                      {showPrices && (
                        <div className="flex items-center justify-center gap-1 text-[9px] font-bold text-emerald-400 mt-0.5">
                          <span>{formatEur(getCardPriceForArtwork(leader, leader._defaultImagePath).cardtraderPriceEur || getCardPriceForArtwork(leader, leader._defaultImagePath).priceEur)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Main Deck Cards */}
                {(cards || []).map(({ card, count, selectedArtwork }) => {
                  const cardImg = getCardImageUrl(card, selectedArtwork);
                  const priceInfo = getCardPriceForArtwork(card, selectedArtwork || card._defaultImagePath);
                  const unitPrice = priceInfo.cardtraderPriceEur > 0 ? priceInfo.cardtraderPriceEur : priceInfo.priceEur;
                  const totalPriceForCard = unitPrice * count;

                  return (
                    <div
                      key={card.card_code}
                      onClick={() => onSelectCard(card)}
                      className="group relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-amber-400 shadow-md cursor-pointer flex flex-col transition-all hover:scale-105"
                      title={`Cliquez pour agrandir ${card.name} et voir ses effets`}
                    >
                      <div className="relative aspect-[5/7] w-full overflow-hidden bg-slate-950">
                        <img
                          src={cardImg}
                          alt={card.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => handleCardImageError(e, card)}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />

                        {/* Cost badge */}
                        {card.cost !== null && card.cost !== undefined && (
                          <div className="absolute top-1 right-1 px-1.5 py-0.2 rounded bg-black/80 text-amber-400 font-black text-[10px] border border-amber-500/30">
                            {card.cost}⚡
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ZoomIn className="w-5 h-5 text-amber-400 drop-shadow-md" />
                        </div>
                      </div>

                      {/* Footer count & price */}
                      <div className="p-2 bg-[#0B0F17] text-center border-t border-slate-800">
                        <span className="font-black text-xs text-white block">
                          {count}x
                        </span>
                        <p className="text-[10px] text-slate-300 truncate font-semibold" title={card.name}>
                          {card.name}
                        </p>
                        {showPrices && (
                          <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">
                            {formatEur(unitPrice)} <span className="text-slate-500">({formatEur(totalPriceForCard)})</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>
          )}

          {/* TAB 2: CALCULATEUR DE CARTES MANQUANTES (« Combien me coûte ce deck ? ») */}
          {activeTab === 'calculator' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Top Banner (User exact statement) */}
              {missingReport.missingCardsCount > 0 ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-[#0B0F17] border border-amber-500/40 shadow-xl space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">💰</span>
                    <h3 className="text-base sm:text-lg font-black text-amber-300 tracking-wide">
                      Il te manque {missingReport.missingCardsCount} carte{missingReport.missingCardsCount > 1 ? 's' : ''} pour compléter ce deck Champion
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200">
                    Coût estimé pour compléter : <strong className="text-emerald-400 font-black text-base">{formatEur(missingReport.missingCostCt)}</strong> sur CardTrader / <strong className="text-blue-400 font-black text-base">{formatEur(missingReport.missingCostCm)}</strong> sur Cardmarket.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <a
                      href={bulkBuyCtUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                      <span>Acheter les cartes manquantes sur CardTrader</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={bulkBuyCmUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                      <span>Acheter sur Cardmarket</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-[#0B0F17] border border-emerald-500/40 shadow-xl space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🎉</span>
                    <h3 className="text-base sm:text-lg font-black text-emerald-300">
                      Félicitations ! Tu possèdes toutes les cartes pour jouer ce deck Champion !
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Toutes les 50 cartes et le Leader sont cochés et possédés dans votre collection.
                  </p>
                </div>
              )}

              {/* Feedback Alert if saved */}
              {savedFeedback && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs animate-in fade-in">
                  {savedFeedback}
                </div>
              )}

              {/* Controls & Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0B0F17] border border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleMarkAllOwned}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all active:scale-95"
                  >
                    ✅ Tout cocher comme possédé
                  </button>
                  <button
                    onClick={handleMarkAllMissing}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all active:scale-95"
                  >
                    ❌ Tout mettre à 0
                  </button>
                  <button
                    onClick={handleResetToCollection}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold transition-all active:scale-95"
                  >
                    🔄 Recharger depuis ma collection
                  </button>
                </div>

                <button
                  onClick={handleSaveToMyCollection}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black transition-all active:scale-95 shadow-md shadow-amber-500/20"
                >
                  💾 Synchroniser vers ma Collection
                </button>
              </div>

              {/* Itemized Missing Cards Checklist Table */}
              <div className="rounded-2xl border border-slate-800 overflow-hidden bg-[#0B0F17] shadow-xl">
                <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Détail des Cartes du Deck & Estimation ({missingReport.items.length} références)</span>
                  <span className="text-amber-400">
                    Possédées : <strong>{missingReport.ownedCardsCount} / {missingReport.totalDeckCount}</strong>
                  </span>
                </div>

                <div className="divide-y divide-slate-800/80 max-h-[50vh] overflow-y-auto">
                  {missingReport.items.map((row) => {
                    const isFullyOwned = row.missing === 0;

                    return (
                      <div
                        key={row.card.card_code}
                        className={`p-3 flex items-center justify-between gap-3 transition-colors ${
                          isFullyOwned ? 'bg-slate-900/20 opacity-70' : 'bg-[#0B0F17] hover:bg-slate-900/50'
                        }`}
                      >
                        {/* Left: Checkbox + Thumbnail + Name + Code */}
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={isFullyOwned}
                            onChange={() => handleToggleCardOwned(row.card.card_code, row.needed)}
                            className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-0 focus:ring-offset-0 bg-slate-900 cursor-pointer"
                          />

                          <div 
                            onClick={() => onSelectCard(row.card)}
                            className="w-10 h-14 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700 cursor-pointer hover:border-amber-400 transition-colors"
                          >
                            <img
                              src={getCardImageUrl(row.card)}
                              alt={row.card.name}
                              referrerPolicy="no-referrer"
                              onError={(e) => handleCardImageError(e, row.card)}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-mono text-amber-400 font-bold text-xs">
                                {row.card.card_code}
                              </span>
                              {row.isLeader && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-[9px] font-black text-amber-300">
                                  LEADER
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs" title={row.card.name}>
                              {row.card.name}
                            </h4>
                            <p className="text-[10px] text-slate-400">
                              Unit : {formatEur(row.unitPriceCt)} (CT) • {formatEur(row.unitPriceCm)} (CM)
                            </p>
                          </div>
                        </div>

                        {/* Middle: Stepper Counter (Needed vs Owned vs Missing) */}
                        <div className="flex items-center space-x-3 flex-shrink-0">
                          
                          {/* Stepper */}
                          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                            <button
                              onClick={() => handleAdjustCount(row.card.card_code, -1, row.needed)}
                              disabled={row.owned <= 0}
                              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-white font-bold text-xs flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-black text-xs text-slate-200">
                              {row.owned}/{row.needed}
                            </span>
                            <button
                              onClick={() => handleAdjustCount(row.card.card_code, 1, row.needed)}
                              disabled={row.owned >= row.needed}
                              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-white font-bold text-xs flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>

                          {/* Missing Cost badge */}
                          <div className="text-right w-24">
                            {row.missing > 0 ? (
                              <div>
                                <span className="text-xs font-black text-rose-400 block">
                                  +{row.missing}x ({formatEur(row.missingCostCt)})
                                </span>
                                <span className="text-[9px] text-slate-500">sur CardTrader</span>
                              </div>
                            ) : (
                              <span className="text-xs font-black text-emerald-400">
                                ✅ Complet
                              </span>
                            )}
                          </div>

                          {/* Marketplace Links */}
                          <div className="flex items-center space-x-1">
                            <a
                              href={row.ctUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold"
                              title="Acheter sur CardTrader"
                            >
                              CT
                            </a>
                            <a
                              href={row.cmUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[10px] font-bold"
                              title={`Acheter la version ${detectCardLanguage(row.card).toUpperCase()} sur Cardmarket`}
                            >
                              CM {detectCardLanguage(row.card).toUpperCase()}
                            </a>
                          </div>

                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: MANA CURVE & STATS BREAKDOWN */}
          {activeTab === 'stats' && (
            <div className="p-5 rounded-2xl bg-[#0B0F17] border border-slate-800 space-y-4 animate-in fade-in duration-150">
              <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4" />
                Courbe de Mana & Répartition du Deck
              </h3>

              {/* Cost Histogram */}
              <div className="flex items-end justify-between h-20 pt-2 px-2 gap-1.5">
                {Object.entries(costCurve).map(([cost, count]) => {
                  const maxCount = Math.max(...Object.values(costCurve), 1);
                  const heightPercent = (count / maxCount) * 100;

                  return (
                    <div key={cost} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold text-slate-400">{count > 0 ? count : ''}</span>
                      <div className="w-full bg-slate-800 rounded-t h-12 flex items-end overflow-hidden">
                        <div 
                          className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t transition-all duration-300"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{cost === '10' ? '10+' : cost}</span>
                    </div>
                  );
                })}
              </div>

              {/* 3 Summary metric pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Types de Cartes</span>
                  <p className="text-slate-200 mt-0.5">
                    Perso : <strong className="text-white">{typeDist.Character}</strong> • Événement : <strong className="text-white">{typeDist.Event}</strong> • Stage : <strong className="text-white">{typeDist.Stage}</strong>
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Valeurs de Contre</span>
                  <p className="text-slate-200 mt-0.5">
                    +2000 : <strong className="text-emerald-400">{counterDist[2000]}</strong> • +1000 : <strong className="text-blue-400">{counterDist[1000]}</strong> • +0 : <strong className="text-slate-400">{counterDist[0]}</strong>
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Deck</span>
                  <p className="text-slate-200 mt-0.5">
                    <strong className="text-amber-400">{totalCards}</strong> Cartes Principales + <strong>1</strong> Leader
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Hand Simulator Modal */}
      {deckData && (
        <HandSimulatorModal
          isOpen={isHandSimOpen}
          onClose={() => setIsHandSimOpen(false)}
          deckName={deckData.name}
          leader={deckData.leader}
          cards={deckData.cards}
          onSelectCard={onSelectCard}
        />
      )}

    </div>
  );
};
