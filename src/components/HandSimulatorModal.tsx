import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  RefreshCw, 
  Sparkles, 
  Shuffle, 
  Plus, 
  Minus,
  Shield, 
  Zap, 
  Flame, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  Info
} from 'lucide-react';
import { Card, DeckItem } from '../types';
import { getCardImageUrl, handleCardImageError } from '../utils/cardUtils';

interface HandSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckName: string;
  leader: Card | null;
  cards: DeckItem[];
  onSelectCard?: (card: Card) => void;
}

export const HandSimulatorModal: React.FC<HandSimulatorModalProps> = ({
  isOpen,
  onClose,
  deckName,
  leader,
  cards,
  onSelectCard
}) => {
  const [deckPool, setDeckPool] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [hasMulliganed, setHasMulliganed] = useState<boolean>(false);
  const [turn, setTurn] = useState<number>(1);
  const [isFirstPlayer, setIsFirstPlayer] = useState<boolean>(true);

  // Build the full 50-card flat deck array
  const buildFlatDeck = (): Card[] => {
    const flat: Card[] = [];
    for (const item of cards) {
      for (let i = 0; i < item.count; i++) {
        flat.push(item.card);
      }
    }
    return flat;
  };

  // Fisher-Yates Shuffle
  const shuffleDeck = (deckArray: Card[]): Card[] => {
    const shuffled = [...deckArray];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Start fresh initial hand
  const startNewHand = () => {
    const flat = buildFlatDeck();
    const shuffled = shuffleDeck(flat);
    const initialHand = shuffled.slice(0, 5);
    const remainingDeck = shuffled.slice(5);

    setHand(initialHand);
    setDeckPool(remainingDeck);
    setHasMulliganed(false);
    setTurn(1);
  };

  // Official Bandai OPTCG Mulligan rule: Shuffle entire 50-card deck and redraw 5 cards once
  const handleMulligan = () => {
    if (hasMulliganed) return;
    const flat = buildFlatDeck();
    const shuffled = shuffleDeck(flat);
    const newHand = shuffled.slice(0, 5);
    const remainingDeck = shuffled.slice(5);

    setHand(newHand);
    setDeckPool(remainingDeck);
    setHasMulliganed(true);
    setTurn(1);
  };

  // Advance turn + draw 1 card
  const handleNextTurn = () => {
    let nextHand = [...hand];
    let nextPool = [...deckPool];

    if (nextPool.length > 0) {
      nextHand.push(nextPool[0]);
      nextPool = nextPool.slice(1);
    }

    setHand(nextHand);
    setDeckPool(nextPool);
    setTurn(prev => Math.min(10, prev + 1));
  };

  // Previous turn
  const handlePrevTurn = () => {
    if (turn > 1) {
      setTurn(prev => prev - 1);
    }
  };

  // Draw 1 card without advancing turn
  const handleDrawCard = () => {
    if (deckPool.length === 0) return;
    const drawnCard = deckPool[0];
    setHand(prev => [...prev, drawnCard]);
    setDeckPool(prev => prev.slice(1));
  };

  useEffect(() => {
    if (isOpen) {
      startNewHand();
    }
  }, [isOpen, cards]);

  // DON!! Calculation per OPTCG official tournament rules
  // 1st Player: T1=1, T2=3, T3=5, T4=7, T5=9, T6+=10
  // 2nd Player: T1=2, T2=4, T3=6, T4=8, T5+=10
  const currentDon = isFirstPlayer
    ? Math.min(10, turn === 1 ? 1 : 1 + (turn - 1) * 2)
    : Math.min(10, turn * 2);

  // Hand Analytics
  const totalCardsInHand = hand.length;
  let counter2kCount = 0;
  let counter1kCount = 0;
  let totalCounterPower = 0;
  let blockersCount = 0;
  let playableThisTurnCount = 0;

  for (const card of hand) {
    const counterVal = Number(card.counter) || 0;
    if (counterVal === 2000) {
      counter2kCount++;
      totalCounterPower += 2000;
    } else if (counterVal === 1000) {
      counter1kCount++;
      totalCounterPower += 1000;
    }

    if (card.effect && /blocker|bloqueur/i.test(card.effect)) {
      blockersCount++;
    }

    const costVal = card.cost !== undefined && card.cost !== null ? Number(card.cost) : 99;
    if (costVal <= currentDon) {
      playableThisTurnCount++;
    }
  }

  const avgCost = hand.length > 0 
    ? (hand.reduce((sum, c) => sum + (c.cost ? Number(c.cost) : 0), 0) / hand.length).toFixed(1)
    : '0';

  // Smart Mulligan Analysis
  const mulliganAdvice = useMemo(() => {
    if (hasMulliganed) {
      return {
        status: 'neutral' as const,
        badge: 'Main Finale (Mulligan Effectué)',
        badgeColor: 'bg-slate-700 text-slate-200 border-slate-600',
        title: 'Mulligan déjà utilisé',
        description: 'Selon les règles officielles Bandai, un seul mulligan est autorisé par partie. Jouez cette main au mieux !'
      };
    }

    const highCostCount = hand.filter(c => (c.cost ?? 0) >= 6).length;
    const playableEarly = hand.filter(c => (c.cost !== null && c.cost !== undefined && c.cost <= (isFirstPlayer ? 3 : 2))).length;
    const searcherCount = hand.filter(c => c.effect && /search|cherchez|regardez|pioch|reveal|révél/i.test(c.effect)).length;

    if (highCostCount >= 3) {
      return {
        status: 'danger' as const,
        badge: 'Mulligan Fortement Conseillé ⚠️',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        title: 'Main trop lourde en Don (Bricks)',
        description: `Vous avez ${highCostCount} cartes de coût 6+ en main de départ. Risque élevé de perdre du tempo avant le Tour 4.`
      };
    }

    if (playableEarly === 0 && counter2kCount === 0) {
      return {
        status: 'danger' as const,
        badge: 'Mulligan Conseillé ⚠️',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        title: 'Aucun jeu T1/T2 & Absence de Contre +2000',
        description: 'Aucune sortie active garantie sur les deux premiers tours et aucune ressource défensive majeure pour absorber l\'agression.'
      };
    }

    if ((playableEarly >= 1 || searcherCount >= 1) && counter2kCount >= 1) {
      return {
        status: 'success' as const,
        badge: 'Excellente Main (Garder) ✅',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        title: 'Courbe optimale & Défense solide',
        description: `Présence précoce assurée (${playableEarly} carte(s) T1-T2${searcherCount > 0 ? ' avec moteur de recherche' : ''}) + ${counter2kCount} Contre(s) +2000 (+${totalCounterPower.toLocaleString()} DEF totale).`
      };
    }

    if (playableEarly >= 1) {
      return {
        status: 'success' as const,
        badge: 'Main Jouable (Garder) 👍',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        title: 'Bon tempo de départ',
        description: `Vous avez ${playableEarly} carte(s) à courbe pour poser vos pièces dès les premiers tours sans perdre de DON!!. Défense : +${totalCounterPower.toLocaleString()}.`
      };
    }

    return {
      status: 'warning' as const,
      badge: 'Main Moyenne (Discutable) 🤔',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      title: 'Bonne défense mais départ lent',
      description: `Bonne réserve de contres (+${totalCounterPower.toLocaleString()}) mais aucun jeu actif ou moteur de recherche garanti aux tours 1 et 2.`
    };
  }, [hand, hasMulliganed, isFirstPlayer, counter2kCount, totalCounterPower]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl bg-[#0F172A] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] cursor-default animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-[#0F172A] to-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Shuffle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-white">Simulateur de Main & Mulligan</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Tour {turn}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-sm sm:max-w-md">
                Deck : <strong className="text-slate-200">{deckName}</strong> ({cards.reduce((sum, c) => sum + c.count, 0)} cartes)
              </p>
            </div>
          </div>

          {/* Player Turn Mode (1st / 2nd) & Close */}
          <div className="flex items-center space-x-2 self-end sm:self-center">
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <button
                onClick={() => setIsFirstPlayer(true)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  isFirstPlayer
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1er Joueur
              </button>
              <button
                onClick={() => setIsFirstPlayer(false)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  !isFirstPlayer
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2ème Joueur
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DON!! Progression Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#0B0F17] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              DON!! Disponibles :
            </span>
            <span className="text-sm font-black text-white">
              {currentDon} / 10
            </span>
            <span className="text-[10px] text-slate-400">
              ({isFirstPlayer ? '1er Joueur' : '2ème Joueur'} • Tour {turn})
            </span>
          </div>

          {/* Visual DON Tokens */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: 10 }).map((_, i) => {
              const isFilled = i < currentDon;
              return (
                <div
                  key={i}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md flex items-center justify-center text-[9px] font-black transition-all ${
                    isFilled
                      ? 'bg-gradient-to-t from-amber-600 to-amber-400 text-black shadow-[0_0_8px_rgba(245,158,11,0.5)] scale-105'
                      : 'bg-slate-800/80 text-slate-600 border border-slate-700/50'
                  }`}
                  title={`DON!! #${i + 1}`}
                >
                  ⚡
                </div>
              );
            })}
          </div>
        </div>

        {/* Smart Mulligan Recommendation Banner */}
        <div className="p-3 sm:px-6 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-2.5">
              <div className="mt-0.5">
                {mulliganAdvice.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : mulliganAdvice.status === 'danger' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                ) : (
                  <Info className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-white">{mulliganAdvice.title}</h4>
                  <span className={`px-2 py-0.2 rounded text-[10px] font-extrabold border ${mulliganAdvice.badgeColor}`}>
                    {mulliganAdvice.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  {mulliganAdvice.description}
                </p>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Jouables Tour {turn}</span>
              <span className="text-sm font-black text-amber-400">{playableThisTurnCount} carte(s)</span>
            </div>
          </div>
        </div>

        {/* Hand Analytics Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 sm:px-6 bg-[#0B0F17] border-b border-slate-800 text-xs">
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Cartes en Main :</span>
            <span className="font-black text-white text-sm">{totalCardsInHand}</span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Counters 2k :</span>
            <span className="font-black text-amber-400 text-sm">{counter2kCount} ex.</span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Défense Totale :</span>
            <span className="font-black text-emerald-400 text-sm">+{totalCounterPower}</span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Bloqueurs :</span>
            <span className="font-black text-blue-400 text-sm">{blockersCount}</span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between col-span-2 sm:col-span-1">
            <span className="text-slate-400">Coût Moyen :</span>
            <span className="font-black text-purple-400 text-sm">{avgCost} ⚡</span>
          </div>
        </div>

        {/* Card Hand Display Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto min-h-[260px] bg-[#0A0D14]/70 flex flex-col justify-center">
          {hand.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Layers className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p>Votre main est vide. Cliquez sur « Nouvelle Main ».</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 items-start">
              {hand.map((card, index) => {
                const imgUrl = getCardImageUrl(card);
                const is2k = Number(card.counter) === 2000;
                const is1k = Number(card.counter) === 1000;
                const isBlocker = card.effect && /blocker|bloqueur/i.test(card.effect);
                const isPlayable = card.cost !== null && card.cost !== undefined && Number(card.cost) <= currentDon;

                return (
                  <div
                    key={`${card.card_code}_${index}`}
                    onClick={() => onSelectCard && onSelectCard(card)}
                    className="group relative cursor-pointer transform transition-all duration-200 hover:-translate-y-2 hover:scale-105"
                  >
                    {/* Card Frame with Playable Glow */}
                    <div className={`aspect-[2.5/3.5] rounded-xl overflow-hidden bg-slate-900 transition-all ${
                      isPlayable
                        ? 'border-2 border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.45)] ring-1 ring-amber-400/60'
                        : 'border-2 border-slate-700/70 group-hover:border-slate-500 shadow-md opacity-80 group-hover:opacity-100'
                    }`}>
                      <img
                        src={imgUrl}
                        alt={card.name}
                        className="w-full h-full object-cover"
                        onError={(e) => handleCardImageError(e, card)}
                        loading="lazy"
                      />
                    </div>

                    {/* Overlay Badges */}
                    <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 items-end pointer-events-none">
                      {isPlayable && (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-black font-black text-[9px] shadow-md flex items-center gap-0.5 animate-pulse">
                          <Zap className="w-2.5 h-2.5" />
                          Jouable T{turn}
                        </span>
                      )}
                      {is2k && (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-black font-black text-[10px] shadow-md">
                          +2000
                        </span>
                      )}
                      {is1k && !is2k && (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[10px] shadow-md">
                          +1000
                        </span>
                      )}
                      {isBlocker && (
                        <span className="px-1.5 py-0.5 rounded-md bg-blue-600 text-white font-extrabold text-[9px] shadow-md flex items-center gap-0.5">
                          <Shield className="w-2.5 h-2.5" />
                          Blocker
                        </span>
                      )}
                    </div>

                    {/* Card Title & Cost Pill */}
                    <div className="mt-1.5 text-center">
                      <span className="text-[11px] font-bold text-slate-200 truncate block group-hover:text-amber-400 transition-colors">
                        {card.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {card.card_code} • {card.cost !== undefined ? `${card.cost} Don` : '-'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Controls Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Reste dans le deck : <strong className="text-white">{deckPool.length}</strong> cartes</span>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-2">
            {/* Tour navigation */}
            <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700">
              <button
                onClick={handlePrevTurn}
                disabled={turn <= 1}
                className="px-2 py-1.5 rounded-lg text-slate-300 hover:text-white disabled:opacity-30 text-xs font-bold transition-colors"
                title="Tour Précédent"
              >
                -1 Tour
              </button>
              <span className="px-2 text-xs font-mono font-bold text-amber-400">
                T{turn}
              </span>
              <button
                onClick={handleNextTurn}
                disabled={turn >= 10 || deckPool.length === 0}
                className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-extrabold transition-colors flex items-center gap-1"
                title="Tour Suivant + Piocher"
              >
                <span>Tour +1 (Piocher)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleDrawCard}
              disabled={deckPool.length === 0}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 transition-all active:scale-95"
              title="Piocher 1 carte sans changer de tour"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span>Piocher (+1)</span>
            </button>

            <button
              onClick={handleMulligan}
              disabled={hasMulliganed}
              title={hasMulliganed ? 'Mulligan déjà utilisé (règle officielle : 1 seul mulligan par partie)' : 'Redessiner 5 cartes'}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all active:scale-95 border ${
                hasMulliganed
                  ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black border-amber-400/50 shadow-lg shadow-amber-500/20'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${hasMulliganed ? '' : 'text-black'}`} />
              <span>{hasMulliganed ? 'Mulligan Utilisé' : 'Mulligan (5 Cartes)'}</span>
            </button>

            <button
              onClick={startNewHand}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 transition-all active:scale-95"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-400" />
              <span>Nouvelle Partie</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
