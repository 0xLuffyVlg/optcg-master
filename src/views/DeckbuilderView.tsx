import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  Filter, 
  Save, 
  RotateCcw, 
  Share2, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Crown,
  ChevronDown,
  ChevronUp,
  Layers,
  BarChart2,
  Shield,
  Zap,
  Swords,
  Eye,
  SlidersHorizontal,
  FolderHeart,
  Shuffle,
  Coins,
  ShoppingCart,
  ExternalLink,
  Ban,
  Check
} from 'lucide-react';
import { Card, CardCategory, CardColor } from '../types';
import { allCards, allSetsList, allPrintsAsCards } from '../data/dataProvider';
import { getCardImageUrl, getColorClass, matchesCardSearch, handleCardImageError, detectCardLanguage } from '../utils/cardUtils';
import { useDeck } from '../context/DeckContext';
import { useCollection } from '../context/CollectionContext';
import { generateProxyPdf } from '../utils/proxyGenerator';
import { HandSimulatorModal } from '../components/HandSimulatorModal';
import { isCardUnlimited, isCardBanned, isCardRestricted } from '../data/banlistData';
import { calculateMissingCardsForDeck } from '../services/cardmarketPriceService';

interface DeckbuilderViewProps {
  onSelectCard: (card: Card) => void;
  onOpenImportExport: () => void;
}

export const DeckbuilderView: React.FC<DeckbuilderViewProps> = ({
  onSelectCard,
  onOpenImportExport
}) => {
  const {
    currentDeck,
    setDeckName,
    setLeader,
    addCard,
    removeCard,
    setCardCount,
    setCardArtwork,
    clearDeck,
    saveCurrentDeck,
    validation
  } = useDeck();

  const { getCardCountInCollection } = useCollection();

  // Mobile active tab switcher ('deck' | 'library' | 'stats')
  const [mobileTab, setMobileTab] = useState<'deck' | 'library' | 'stats'>('deck');

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [variantFilter, setVariantFilter] = useState<'ALL' | 'BASE' | 'ALT'>('ALL');
  const [selectedColor, setSelectedColor] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCost, setSelectedCost] = useState<string>('ALL');
  const [selectedSet, setSelectedSet] = useState<string>('ALL');
  const [onlyLeaderColors, setOnlyLeaderColors] = useState<boolean>(true);
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);
  const [isHandSimOpen, setIsHandSimOpen] = useState<boolean>(false);
  const [showMissingDetails, setShowMissingDetails] = useState<boolean>(false);

  // Missing cards & completion cost calculation
  const missingReport = useMemo(() => {
    return calculateMissingCardsForDeck(
      currentDeck.cards,
      currentDeck.leader,
      getCardCountInCollection
    );
  }, [currentDeck.cards, currentDeck.leader, getCardCountInCollection]);

  // Filter cards library
  const filteredLibraryCards = useMemo(() => {
    const hasSearch = Boolean(searchQuery.trim());
    let list = hasSearch ? allPrintsAsCards : allCards;

    // Leader color match restriction
    if (onlyLeaderColors && currentDeck.leader && currentDeck.leader.color && !hasSearch) {
      const leaderColors = currentDeck.leader.color.map(c => c.toLowerCase());
      list = list.filter(card => {
        if (card.category === 'Leader') return true;
        const cardColors = (card.color || []).map(c => c.toLowerCase());
        return cardColors.some(c => leaderColors.includes(c));
      });
    }

    // Search query
    if (hasSearch) {
      list = list.filter(card => matchesCardSearch(card, searchQuery));
    }

    // Variant / Print filter
    if (variantFilter === 'BASE') {
      list = list.filter(card => !card.id.includes('_') && !card.id.includes('-r'));
    } else if (variantFilter === 'ALT') {
      list = list.filter(card => card.id.includes('_') || card.id.includes('-r'));
    }

    // Color filter
    if (selectedColor !== 'ALL') {
      list = list.filter(card => 
        (card.color || []).some(c => c.toLowerCase() === selectedColor.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      list = list.filter(card => card.category === selectedCategory);
    }

    // Cost filter
    if (selectedCost !== 'ALL') {
      const targetCost = parseInt(selectedCost, 10);
      list = list.filter(card => card.cost === targetCost);
    }

    // Set filter
    if (selectedSet !== 'ALL') {
      list = list.filter(card => card.set_code === selectedSet);
    }

    return list.slice(0, 150); // fast virtualization limit
  }, [allCards, searchQuery, variantFilter, selectedColor, selectedCategory, selectedCost, selectedSet, onlyLeaderColors, currentDeck.leader]);

  // Deck Statistics calculations
  const stats = useMemo(() => {
    const costCurve: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
    const typeDistribution = { Character: 0, Event: 0, Stage: 0 };
    const counterDistribution = { 0: 0, 1000: 0, 2000: 0 };

    let totalCards = 0;

    for (const item of currentDeck.cards) {
      totalCards += item.count;
      // Cost
      const cost = item.card.cost !== null && item.card.cost !== undefined ? Math.min(10, Math.max(0, item.card.cost)) : 0;
      costCurve[cost] = (costCurve[cost] || 0) + item.count;

      // Type
      if (item.card.category === 'Character') typeDistribution.Character += item.count;
      if (item.card.category === 'Event') typeDistribution.Event += item.count;
      if (item.card.category === 'Stage') typeDistribution.Stage += item.count;

      // Counter
      if (item.card.counter === 2000) counterDistribution[2000] += item.count;
      else if (item.card.counter === 1000) counterDistribution[1000] += item.count;
      else counterDistribution[0] += item.count;
    }

    return { costCurve, typeDistribution, counterDistribution, totalCards };
  }, [currentDeck]);

  const handleSave = () => {
    saveCurrentDeck();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleExportPdf = () => {
    generateProxyPdf(currentDeck);
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Top Deck Management Header */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        
        {/* Deck Title and Status */}
        <div className="flex-1 min-w-0 space-y-1 w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={currentDeck.name}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="Nom de votre deck..."
              className="text-base sm:text-xl font-black text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-amber-500 focus:outline-none px-1 py-0.5 w-full max-w-md"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg border font-bold ${
              validation.isOfficialLegal 
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300' 
                : 'bg-amber-950/50 border-amber-500/40 text-amber-300'
            }`}>
              {validation.isOfficialLegal ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
              <span>{validation.isOfficialLegal ? '✅ Légal Tournoi Bandai' : '⚠️ Non Réglementaire'}</span>
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-medium">
              Cartes : <strong className={validation.mainDeckCount === 50 ? 'text-emerald-400' : 'text-amber-400'}>{validation.mainDeckCount}/50</strong>
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">
              Leader : {currentDeck.leader ? <strong className="text-amber-400">{currentDeck.leader.name}</strong> : <span className="text-rose-400 font-bold">Requis</span>}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">DON!! : <strong className="text-amber-400">10/10</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-start sm:justify-end">
          
          <button
            onClick={handleSave}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savedFeedback ? 'Enregistré !' : 'Sauvegarder'}</span>
          </button>

          <button
            onClick={() => setIsHandSimOpen(true)}
            disabled={currentDeck.cards.length === 0}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 disabled:opacity-40"
            title="Tester la main de départ & Mulligan"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Tester Main</span>
          </button>

          <button
            onClick={onOpenImportExport}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Partager</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-800 text-slate-200 hover:text-rose-300 font-bold text-xs transition-colors"
            title="Générer Proxies PDF"
          >
            <Printer className="w-4 h-4 text-rose-400" />
          </button>

          <button
            onClick={clearDeck}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
            title="Vider le deck"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Official Bandai Legality Banner */}
      <div className={`p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
        validation.isOfficialLegal
          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
          : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
      }`}>
        <div className="flex items-start sm:items-center space-x-3">
          <div className={`p-2 rounded-xl flex-shrink-0 ${
            validation.isOfficialLegal ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            {validation.isOfficialLegal ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-black text-white">
                {validation.isOfficialLegal ? 'Deck Homologué Tournois Officiels Bandai' : 'Deck Non Réglementaire Tournois Bandai'}
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                validation.isOfficialLegal 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {validation.isOfficialLegal ? 'Légal OPTCG' : 'Ajustements Requis'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {validation.isOfficialLegal
                ? 'Conforme au format officiel Bandai TCG : 1 Leader + 50 Cartes de sa couleur, restriction et banlist respectées.'
                : `${validation.errors.length} condition(s) à corriger pour rendre ce deck valide en tournoi officiel.`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-center">
          <span className="text-[11px] font-mono font-bold bg-slate-900/90 px-3 py-1 rounded-xl border border-slate-800 text-slate-300">
            {validation.mainDeckCount}/50 Cartes
          </span>
        </div>
      </div>

      {/* Validation alert banner if invalid */}
      {!validation.isValid && validation.errors.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-900/50 text-xs text-rose-200 space-y-1.5 shadow-md">
          <span className="font-extrabold text-[11px] uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Points à corriger pour la légalité :
          </span>
          {validation.errors.map((err, i) => (
            <div key={i} className="flex items-center gap-2 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}

      {/* Mobile Tab Switcher Segmented Control */}
      <div className="lg:hidden flex items-center p-1 rounded-xl bg-[#0F172A] border border-slate-800 shadow-md">
        <button
          onClick={() => setMobileTab('deck')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
            mobileTab === 'deck'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Deck ({validation.mainDeckCount}/50)</span>
        </button>

        <button
          onClick={() => setMobileTab('library')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
            mobileTab === 'library'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Cartes (+)</span>
        </button>

        <button
          onClick={() => setMobileTab('stats')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
            mobileTab === 'stats'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Stats</span>
        </button>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Active Deck Arena (5 Columns on Large) */}
        <div className={`lg:col-span-5 space-y-4 ${mobileTab === 'deck' || mobileTab === 'stats' ? 'block' : 'hidden lg:block'}`}>
          
          {/* Deck Cards & Leader Section (Visible when mobileTab is 'deck', always on desktop) */}
          <div className={`space-y-4 ${mobileTab === 'deck' ? 'block' : 'hidden lg:block'}`}>

            {/* Leader Slot */}
            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider font-extrabold text-amber-400 flex items-center gap-1.5">
                  <Crown className="w-4 h-4" />
                  Carte Leader (1)
                </span>
                {currentDeck.leader && (
                  <button
                    onClick={() => setLeader(null)}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-bold"
                  >
                    Changer
                  </button>
                )}
              </div>

              {currentDeck.leader ? (
                <div className={`flex items-center space-x-3.5 p-2 rounded-xl bg-[#0B0F17] border ${
                  validation.bannedCards?.includes(currentDeck.leader.card_code) ? 'border-rose-900/60 bg-rose-950/20' : 'border-slate-800'
                }`}>
                  <div 
                    onClick={() => onSelectCard(currentDeck.leader!)}
                    className="w-16 h-22 rounded-lg overflow-hidden border border-amber-500/50 shadow-md cursor-pointer hover:scale-105 transition-transform bg-slate-900 flex-shrink-0"
                  >
                    <img
                      src={getCardImageUrl(currentDeck.leader, currentDeck.leader._defaultImagePath)}
                      alt={currentDeck.leader.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => handleCardImageError(e, currentDeck.leader)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-bold text-amber-400">
                        {currentDeck.leader.card_code}
                      </span>
                      {(currentDeck.leader.color || []).map(col => (
                        <span key={col} className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${getColorClass(col).bg} text-white`}>
                          {col}
                        </span>
                      ))}
                      {validation.bannedCards?.includes(currentDeck.leader.card_code) && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white font-black text-[9px]">
                          🚫 BANNI
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-black text-white truncate mt-1">
                      {currentDeck.leader.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {currentDeck.leader.power?.toLocaleString()} Power • {currentDeck.leader.attribute}
                    </p>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => {
                    setSelectedCategory('Leader');
                    setMobileTab('library');
                  }}
                  className="p-6 rounded-xl border-2 border-dashed border-slate-700 hover:border-amber-500/60 bg-[#0B0F17]/50 text-center cursor-pointer transition-colors"
                >
                  <Crown className="w-8 h-8 mx-auto text-amber-400/50 mb-1" />
                  <p className="text-xs font-bold text-slate-300">Aucun Leader sélectionné</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Cliquez pour choisir un Leader dans la bibliothèque</p>
                </div>
              )}
            </div>

            {/* Main Deck Cards List (50 cards) */}
            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-extrabold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Deck Principal ({stats.totalCards}/50)
                </span>
                <button
                  onClick={() => setMobileTab('library')}
                  className="lg:hidden text-xs font-bold text-amber-400 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter</span>
                </button>
              </div>

              {currentDeck.cards.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <Layers className="w-10 h-10 mx-auto mb-2 opacity-30 text-blue-400" />
                  <p className="text-xs font-bold text-slate-400">Votre deck principal est vide.</p>
                  <button
                    onClick={() => setMobileTab('library')}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold"
                  >
                    Ouvrir la bibliothèque
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                  {currentDeck.cards.map(({ card, count, selectedArtwork }) => {
                    const cardImg = getCardImageUrl(card, selectedArtwork);
                    const isUnlimited = isCardUnlimited(card.card_code);
                    const isMax = isUnlimited ? count >= 50 : count >= 4;
                    const owned = getCardCountInCollection(card.card_code);
                    const isBanned = validation.bannedCards?.includes(card.card_code);
                    const isRestricted = validation.restrictedCards?.includes(card.card_code);

                    return (
                      <div
                        key={card.card_code}
                        className={`group flex items-center justify-between p-2 rounded-xl bg-[#0B0F17] border transition-all ${
                          isBanned 
                            ? 'border-rose-900/60 bg-rose-950/20' 
                            : isRestricted && count > 1 
                              ? 'border-amber-900/60 bg-amber-950/20' 
                              : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Card Thumbnail & Info */}
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div 
                            onClick={() => onSelectCard(card)}
                            className="w-9 h-13 rounded-md overflow-hidden border border-slate-700 cursor-pointer flex-shrink-0 bg-slate-900 hover:scale-105 transition-transform"
                          >
                            <img
                              src={cardImg}
                              alt={card.name}
                              referrerPolicy="no-referrer"
                              onError={(e) => handleCardImageError(e, card)}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5 flex-wrap">
                              <span className="text-[10px] font-mono font-bold text-amber-400">
                                {card.cost !== null ? `${card.cost}⚡` : ''}
                              </span>
                              <span className="text-xs font-bold text-white truncate max-w-[100px] sm:max-w-[150px]">
                                {card.name_fr || card.name}
                              </span>
                              {isBanned && (
                                <span className="px-1 py-0.2 rounded bg-rose-600 text-white font-black text-[8px] uppercase">
                                  🚫 BANNI
                                </span>
                              )}
                              {isRestricted && (
                                <span className="px-1 py-0.2 rounded bg-amber-500 text-black font-black text-[8px] uppercase">
                                  MAX 1
                                </span>
                              )}
                              {isUnlimited && (
                                <span className="px-1 py-0.2 rounded bg-blue-600/80 text-white font-bold text-[8px] uppercase">
                                  ♾️ ILLIMITÉ
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                              <span>{card.card_code}</span>
                              <span>•</span>
                              <span className={owned >= count ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                                {owned > 0 ? `Possédé : ${owned}` : 'Non possédé'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quantity Modifier Buttons */}
                        <div className="flex items-center space-x-1 sm:space-x-1.5 flex-shrink-0">
                          <button
                            onClick={() => removeCard(card.card_code, 1)}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs transition-colors active:scale-95"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <span className={`w-5 sm:w-6 text-center font-black text-xs sm:text-sm ${isMax ? 'text-amber-400' : 'text-white'}`}>
                            {count}
                          </span>

                          <button
                            onClick={() => addCard(card, 1)}
                            disabled={isMax}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 flex items-center justify-center font-bold text-xs transition-colors active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setCardCount(card.card_code, 0)}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 flex items-center justify-center transition-colors ml-0.5 sm:ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Collection Missing Cards & Completion Cost Box */}
            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      Collection & Coût d'Achèvement
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      {missingReport.ownedCardsCount}/{missingReport.totalDeckCount} cartes possédées ({missingReport.totalDeckCount > 0 ? Math.round((missingReport.ownedCardsCount / missingReport.totalDeckCount) * 100) : 0}%)
                    </p>
                  </div>
                </div>

                {missingReport.missingCardsCount > 0 && (
                  <button
                    onClick={() => setShowMissingDetails(prev => !prev)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-amber-400 border border-slate-700 transition-colors"
                  >
                    <span>{showMissingDetails ? 'Masquer' : 'Détails'}</span>
                    {showMissingDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    missingReport.isComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                  }`}
                  style={{
                    width: `${missingReport.totalDeckCount > 0 ? Math.min(100, Math.round((missingReport.ownedCardsCount / missingReport.totalDeckCount) * 100)) : 0}%`
                  }}
                />
              </div>

              {missingReport.isComplete ? (
                <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>🎉 <strong>Deck 100% Complet !</strong> Vous possédez toutes les cartes nécessaires dans votre collection physique.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#0B0F17] border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Coût Cardmarket</span>
                      <span className="text-sm font-black text-amber-400">
                        ~{missingReport.missingEstimatedCostEur.toFixed(2)} €
                      </span>
                      <span className="text-[9px] text-slate-500 block">Prix Tendance</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#0B0F17] border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Coût CardTrader</span>
                      <span className="text-sm font-black text-blue-400">
                        ~{missingReport.missingCardtraderCostEur.toFixed(2)} €
                      </span>
                      <span className="text-[9px] text-slate-500 block">Prix Marché</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Il vous manque <strong>{missingReport.missingCardsCount}</strong> exemplaire(s) sur <strong>{missingReport.missingItems.length}</strong> carte(s).</span>
                  </div>

                  {/* Expanded Missing Items List */}
                  {showMissingDetails && (
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-1 border-t border-slate-800 pt-2">
                      {missingReport.missingItems.map(item => (
                        <div
                          key={item.card.card_code}
                          className="flex items-center justify-between p-2 rounded-xl bg-[#0B0F17] border border-slate-800/80 text-xs"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <div 
                              onClick={() => onSelectCard(item.card)}
                              className="w-7 h-10 rounded overflow-hidden flex-shrink-0 bg-slate-900 border border-slate-700 cursor-pointer"
                            >
                              <img
                                src={getCardImageUrl(item.card, item.card._defaultImagePath)}
                                alt={item.card.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate max-w-[120px]">{item.card.name_fr || item.card.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {item.card.card_code} • Manque : <strong className="text-amber-400">{item.countMissing}x</strong> ({item.countOwned}/{item.countNeeded})
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5 flex-shrink-0">
                            <span className="text-xs font-bold text-amber-300 mr-1">
                              ~{item.totalMissingCostEur.toFixed(2)} €
                            </span>
                            <a
                              href={item.cardmarketUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] flex items-center gap-1 transition-colors"
                              title={`Acheter la version ${detectCardLanguage(item.card).toUpperCase()} sur Cardmarket`}
                            >
                              <span>CM {detectCardLanguage(item.card).toUpperCase()}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                            <a
                              href={item.cardtraderUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold text-[10px] flex items-center gap-1 transition-colors border border-slate-700"
                              title="Acheter sur CardTrader"
                            >
                              <span>CT</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Stats Section (Visible when mobileTab is 'stats', always visible on desktop) */}
          <div className={`space-y-4 ${mobileTab === 'stats' ? 'block' : 'hidden lg:block'}`}>
            <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg space-y-3">
              <span className="text-xs uppercase tracking-wider font-extrabold text-amber-400 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4" />
                Courbe de Coût & Répartition
              </span>

              {/* Histogram Bars */}
              <div className="flex items-end justify-between h-24 pt-4 px-1 gap-1">
                {Object.entries(stats.costCurve).map(([cost, count]) => {
                  const maxCount = Math.max(...Object.values(stats.costCurve), 1);
                  const heightPercent = (count / maxCount) * 100;

                  return (
                    <div key={cost} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold text-slate-400">{count > 0 ? count : ''}</span>
                      <div className="w-full bg-slate-800 rounded-t h-16 flex items-end overflow-hidden">
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

              {/* Type & Counter Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                <div className="p-2.5 rounded-xl bg-[#0B0F17] space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Répartition Types</span>
                  <p className="text-slate-200">
                    Perso : <strong>{stats.typeDistribution.Character}</strong> • Événement : <strong>{stats.typeDistribution.Event}</strong> • Stage : <strong>{stats.typeDistribution.Stage}</strong>
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0B0F17] space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Contres Totaux</span>
                  <p className="text-slate-200">
                    +2000 : <strong className="text-emerald-400">{stats.counterDistribution[2000]}</strong> • +1000 : <strong className="text-blue-400">{stats.counterDistribution[1000]}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Card Library Browser (7 Columns on Large) */}
        <div className={`lg:col-span-7 space-y-4 ${mobileTab === 'library' ? 'block' : 'hidden lg:block'}`}>
          
          {/* Filters Bar */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg space-y-3">
            
            {/* Search Input & Color Toggle */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Chercher par nom, code (OP01-001, _p1)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0B0F17] border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Leader color identity filter toggle */}
              {currentDeck.leader && (
                <button
                  onClick={() => setOnlyLeaderColors(prev => !prev)}
                  className={`w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border ${
                    onlyLeaderColors
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Couleurs ({currentDeck.leader.color?.join('/')})
                </button>
              )}

            </div>

            {/* Base vs Alt-Arts Dissociation Selector */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Versions :</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setVariantFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    variantFilter === 'ALL'
                      ? 'bg-amber-400 text-black font-black shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  🌟 Toutes
                </button>
                <button
                  onClick={() => setVariantFilter('BASE')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    variantFilter === 'BASE'
                      ? 'bg-blue-600 text-white font-black shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  🎴 Base
                </button>
                <button
                  onClick={() => setVariantFilter('ALT')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    variantFilter === 'ALT'
                      ? 'bg-purple-600 text-white font-black shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  ✨ Alt-Arts
                </button>
              </div>
            </div>

            {/* Colors Filter Buttons */}
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setSelectedColor('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  selectedColor === 'ALL' ? 'bg-white text-black' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Toutes
              </button>
              {['Red', 'Green', 'Blue', 'Purple', 'Black', 'Yellow'].map(col => {
                const isSel = selectedColor.toLowerCase() === col.toLowerCase();
                const style = getColorClass(col);
                return (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      isSel ? `${style.bg} text-white shadow-md` : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {col}
                  </button>
                );
              })}
            </div>

            {/* Secondary Select Dropdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              
              {/* Category */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-1.5 rounded-lg bg-[#0B0F17] border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">Tous les Types</option>
                <option value="Leader">Leader</option>
                <option value="Character">Personnage</option>
                <option value="Event">Événement</option>
                <option value="Stage">Terrain (Stage)</option>
              </select>

              {/* Cost */}
              <select
                value={selectedCost}
                onChange={(e) => setSelectedCost(e.target.value)}
                className="p-1.5 rounded-lg bg-[#0B0F17] border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">Tous les Coûts</option>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                  <option key={c} value={c.toString()}>Coût {c}</option>
                ))}
              </select>

              {/* Set */}
              <select
                value={selectedSet}
                onChange={(e) => setSelectedSet(e.target.value)}
                className="p-1.5 rounded-lg bg-[#0B0F17] border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">Toutes les Extensions</option>
                {allSetsList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <div className="text-right flex items-center justify-end text-[11px] text-slate-400 font-medium">
                {filteredLibraryCards.length} cartes affichées
              </div>

            </div>

          </div>

          {/* Cards Gallery Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[750px] overflow-y-auto p-1">
            {filteredLibraryCards.map((card) => {
              const cardImg = getCardImageUrl(card);
              const isLeader = card.category === 'Leader';
              const deckItem = currentDeck.cards.find(item => item.card.card_code === card.card_code);
              const inDeckCount = deckItem ? deckItem.count : 0;
              const ownedInCollection = getCardCountInCollection(card.card_code);
              const isBanned = Boolean(isCardBanned(card.card_code));
              const isRestricted = Boolean(isCardRestricted(card.card_code));

              return (
                <div
                  key={card.card_code}
                  className="group relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-amber-500/80 shadow-md transition-all duration-150 flex flex-col"
                >
                  {/* Card Visual */}
                  <div 
                    onClick={() => onSelectCard(card)}
                    className="relative aspect-[5/7] w-full overflow-hidden cursor-pointer bg-slate-950"
                  >
                    <img
                      src={cardImg}
                      alt={card.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => handleCardImageError(e, card)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />

                    {/* Quantity in Deck badge */}
                    {inDeckCount > 0 && (
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-amber-500 text-black font-black text-xs shadow-lg z-10">
                        {inDeckCount}x
                      </div>
                    )}

                    {/* Ban / Restricted Status Badge */}
                    {isBanned && inDeckCount === 0 && (
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-rose-600 text-white font-black text-[9px] shadow-md z-10 flex items-center gap-0.5">
                        <Ban className="w-2.5 h-2.5" />
                        <span>BANNI</span>
                      </div>
                    )}
                    {isRestricted && !isBanned && inDeckCount === 0 && (
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-amber-500 text-black font-black text-[9px] shadow-md z-10">
                        MAX 1
                      </div>
                    )}

                    {/* Owned in Collection Pill */}
                    {ownedInCollection > 0 && (
                      <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.2 rounded bg-emerald-950/90 text-emerald-300 font-black text-[9px] border border-emerald-800/50 flex items-center gap-0.5">
                        <FolderHeart className="w-2.5 h-2.5" />
                        <span>Possédé {ownedInCollection}x</span>
                      </div>
                    )}

                    {/* Cost Badge */}
                    {card.cost !== null && card.cost !== undefined && (
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded bg-black/80 text-amber-400 font-bold text-[10px] border border-amber-500/30">
                        {card.cost}⚡
                      </div>
                    )}
                  </div>

                  {/* Add to Deck overlay / bottom button */}
                  <div className="p-2 bg-[#0F172A] border-t border-slate-800 flex items-center justify-between gap-1">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-white truncate">{card.name}</p>
                      <p className="text-[9px] text-slate-400 font-mono">{card.card_code}</p>
                    </div>

                    <button
                      onClick={() => {
                        if (isLeader) setLeader(card);
                        else addCard(card, 1);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center justify-center transition-transform active:scale-90 ${
                        isLeader
                          ? 'bg-amber-500 hover:bg-amber-400 text-black'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {isLeader ? 'Leader' : '+1'}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* Hand Simulator & Mulligan Modal */}
      <HandSimulatorModal
        isOpen={isHandSimOpen}
        onClose={() => setIsHandSimOpen(false)}
        deckName={currentDeck.name}
        leader={currentDeck.leader}
        cards={currentDeck.cards}
        onSelectCard={onSelectCard}
      />

    </div>
  );
};
