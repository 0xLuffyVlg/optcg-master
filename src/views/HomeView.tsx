import React, { useState, useMemo, useRef, useEffect } from 'react';
import '../styles/scalpeurs-home.css';
import { Card, MarketTrendItem } from '../types';
import { allCards, allMarketTrends } from '../data/dataProvider';
import { ActiveTab } from '../components/Navbar';
import { getCardImageUrl } from '../utils/cardUtils';
import { 
  Camera, 
  FolderHeart, 
  Search, 
  Flame, 
  Layers, 
  Boxes, 
  TrendingUp, 
  Trophy, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface HomeViewProps {
  onSelectCard: (card: Card) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenScanner?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ 
  onSelectCard, 
  onNavigateTab,
  onOpenScanner 
}) => {
  // --- Search state ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState<'jp' | 'fr' | 'en'>('jp');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // --- Gesture / Phone carousel state ---
  const [gestureStep, setGestureStep] = useState<number>(0);

  // Close search suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered search results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];

    return allCards
      .filter((c) => {
        const matchCode = c.card_code?.toLowerCase().includes(q);
        const matchName = c.name?.toLowerCase().includes(q);
        return matchCode || matchName;
      })
      .slice(0, 7);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      onSelectCard(searchResults[0]);
      setIsSearchFocused(false);
    } else {
      onNavigateTab('database');
    }
  };

  // --- Real Market Movers from dataProvider ---
  const { topGainers, topLosers } = useMemo(() => {
    const significantCards = allMarketTrends.filter((t) => (t.current_price_eur || 0) >= 15);
    
    // Sort gainers (highest % change)
    const gainers = [...significantCards]
      .sort((a, b) => (b.change_7d_percent || 0) - (a.change_7d_percent || 0))
      .slice(0, 3);

    // Sort losers (lowest % change)
    const losers = [...significantCards]
      .sort((a, b) => (a.change_7d_percent || 0) - (b.change_7d_percent || 0))
      .slice(0, 3);

    return { topGainers: gainers, topLosers: losers };
  }, []);

  // Helper to find a card by code
  const getCardForTrend = (trend: MarketTrendItem): Card | undefined => {
    const cleanCode = trend.card_code.split('_')[0].split('-R')[0].toUpperCase();
    return allCards.find((c) => c.card_code.toUpperCase() === cleanCode) ||
      allCards.find((c) => c.card_code.toUpperCase() === trend.card_code.toUpperCase());
  };

  // Reference Gol D. Roger Manga OP09-148 for the Trio section
  const rogerCard = useMemo(() => {
    return allCards.find((c) => c.card_code.toUpperCase() === 'OP09-148') ||
      allCards.find((c) => c.card_code.toUpperCase() === 'OP09-118') ||
      allCards[0];
  }, []);

  // Action helper: Add card / Scan
  const handleAddCardClick = () => {
    if (onOpenScanner) {
      onOpenScanner();
    } else {
      onNavigateTab('collection');
    }
  };

  return (
    <div className="acc-racine min-h-screen bg-[#0b0c10] text-[#f5f5f7] relative overflow-x-clip">
      {/* Background Starfield Galaxy */}
      <div className="acc-galaxie pointer-events-none fixed inset-0 z-0 opacity-80" aria-hidden="true">
        <i className="acc-galaxie-c acc-galaxie-c--loin"></i>
        <i className="acc-galaxie-c acc-galaxie-c--milieu"></i>
        <i className="acc-galaxie-c acc-galaxie-c--pres"></i>
        <i className="acc-galaxie-filante"></i>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: HERO - RECHERCHE INSTANTANÉE & CARTES 3D FLOTTANTES           */}
      {/* ========================================================================= */}
      <section className="relative pt-6 sm:pt-12 pb-16 sm:pb-24 z-10">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-12">
            
            {/* Left Column: Floating Animated Cards (Scene 3D) */}
            <div className="lg:col-span-6 order-2 lg:order-1 relative flex items-center justify-center">
              <div className="acc-ciel w-full max-w-[540px] h-[340px] sm:h-[440px] relative rounded-3xl overflow-hidden border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                <div className="acc-ciel-fond" aria-hidden="true">
                  <i className="acc-etoiles acc-etoiles--loin"></i>
                  <i className="acc-etoiles acc-etoiles--milieu"></i>
                  <i className="acc-etoiles acc-etoiles--pres"></i>
                  <i className="acc-filante"></i>
                </div>

                <div className="acc-ciel-scene">
                  {/* Card 1 - Zoro OP06 */}
                  <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--loin" style={{ ['--x' as any]: '12%', ['--y' as any]: '16%', ['--w' as any]: 13, ['--r' as any]: '-14deg', ['--d' as any]: 0.12, ['--dl' as any]: '-1s', ['--i' as any]: 10, ['--xp' as any]: '8%', ['--yp' as any]: '16%', ['--wp' as any]: 6.2, ['--rp' as any]: '-14deg' }}>
                    <span className="acc-ciel-envol">
                      <span className="acc-ciel-flotte">
                        <img src="/media/cartes/op06-p142-zoro.webp" alt="" width="44" height="61" decoding="async" />
                      </span>
                    </span>
                  </span>

                  {/* Card 2 - Sabo OP13 */}
                  <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--loin" style={{ ['--x' as any]: '88%', ['--y' as any]: '14%', ['--w' as any]: 12, ['--r' as any]: '12deg', ['--d' as any]: 0.12, ['--dl' as any]: '-3s', ['--i' as any]: 9, ['--xp' as any]: '92%', ['--yp' as any]: '14%', ['--wp' as any]: 6.2, ['--rp' as any]: '12deg' }}>
                    <span className="acc-ciel-envol">
                      <span className="acc-ciel-flotte">
                        <img src="/media/cartes/op13-p160-sabo.webp" alt="" width="44" height="61" decoding="async" />
                      </span>
                    </span>
                  </span>

                  {/* Card 3 - Mid Left */}
                  <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--large" style={{ ['--x' as any]: '15%', ['--y' as any]: '68%', ['--w' as any]: 19, ['--r' as any]: '-9deg', ['--d' as any]: 0.45, ['--dl' as any]: '-2.5s', ['--i' as any]: 5, ['--xp' as any]: '18%', ['--yp' as any]: '12%', ['--wp' as any]: 8.6, ['--rp' as any]: '-7deg' }}>
                    <span className="acc-ciel-envol">
                      <span className="acc-ciel-flotte">
                        <img src="/media/cartes/op13-p160-sabo.webp" alt="" width="280" height="391" decoding="async" />
                      </span>
                    </span>
                  </span>

                  {/* Card 4 - Mid Right */}
                  <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--large" style={{ ['--x' as any]: '82%', ['--y' as any]: '38%', ['--w' as any]: 19, ['--r' as any]: '11deg', ['--d' as any]: 0.5, ['--dl' as any]: '-1.5s', ['--i' as any]: 4, ['--xp' as any]: '80%', ['--yp' as any]: '12%', ['--wp' as any]: 8.6, ['--rp' as any]: '9deg' }}>
                    <span className="acc-ciel-envol">
                      <span className="acc-ciel-flotte">
                        <img src="/media/cartes/op06-p142-zoro.webp" alt="" width="280" height="391" decoding="async" />
                      </span>
                    </span>
                  </span>

                  {/* Card 5 - Luffy Manga OP05 */}
                  <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--pres" style={{ ['--x' as any]: '28%', ['--y' as any]: '44%', ['--w' as any]: 27, ['--r' as any]: '-12deg', ['--d' as any]: 0.78, ['--dl' as any]: '-3.5s', ['--i' as any]: 2, ['--xp' as any]: '14%', ['--yp' as any]: '43%', ['--wp' as any]: 12.6, ['--rp' as any]: '-9deg' }}>
                    <span className="acc-ciel-envol">
                      <span className="acc-ciel-flotte">
                        <span className="acc-holo">
                          <span className="acc-holo-in">
                            <img src="/media/cartes/op05-p147-luffy.webp" alt="" width="420" height="587" decoding="async" />
                            <span className="acc-holo-reflet" aria-hidden="true"></span>
                            <span className="acc-holo-irise" aria-hidden="true"></span>
                          </span>
                        </span>
                      </span>
                    </span>
                  </span>

                  {/* Card 6 - Shanks Manga OP09 */}
                  <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--pres acc-ciel-carte--large" style={{ ['--x' as any]: '72%', ['--y' as any]: '62%', ['--w' as any]: 27, ['--r' as any]: '10deg', ['--d' as any]: 0.82, ['--dl' as any]: '-0.5s', ['--i' as any]: 1, ['--xp' as any]: '76%', ['--yp' as any]: '80%', ['--wp' as any]: 9.8, ['--rp' as any]: '10deg' }}>
                    <span className="acc-ciel-envol">
                      <span className="acc-ciel-flotte">
                        <span className="acc-holo">
                          <span className="acc-holo-in">
                            <img src="/media/cartes/op09-p009-shanks.webp" alt="" width="420" height="587" decoding="async" />
                            <span className="acc-holo-reflet" aria-hidden="true"></span>
                            <span className="acc-holo-irise" aria-hidden="true"></span>
                          </span>
                        </span>
                      </span>
                    </span>
                  </span>

                  {/* Card 7 - Gol D. Roger Manga OP09-148 */}
                  <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--pres" style={{ ['--x' as any]: '50%', ['--y' as any]: '48%', ['--w' as any]: 34, ['--r' as any]: '-3deg', ['--d' as any]: 1, ['--dl' as any]: '0s', ['--i' as any]: 0, ['--xp' as any]: '88%', ['--yp' as any]: '42%', ['--wp' as any]: 13.6, ['--rp' as any]: '7deg' }}>
                    <span className="acc-ciel-envol">
                      <span className="acc-ciel-flotte">
                        <span className="acc-holo">
                          <span className="acc-holo-in">
                            <img src="/media/cartes/op09-p148-jp.webp" alt="" width="420" height="587" decoding="async" />
                            <span className="acc-holo-reflet" aria-hidden="true"></span>
                            <span className="acc-holo-irise" aria-hidden="true"></span>
                          </span>
                        </span>
                      </span>
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Pitch & Live Search */}
            <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
              
              {/* Top Ticker Pill */}
              <a 
                href="#mouvements" 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition-all shadow-[0_0_15px_rgba(245,166,35,0.15)] group"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34c759]"></span>
                <span>Argus Cardmarket en direct</span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-white tracking-tight leading-[1.08]">
                Combien vaut <span className="text-amber-400 underline decoration-amber-500/40 underline-offset-4">vraiment</span> ta collection One Piece ?
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                Le site qui réunit toutes les cartes One Piece TCG, en japonais, français et anglais : <strong className="text-white font-bold">{allCards.length.toLocaleString('fr-FR')} cartes</strong> référencées. Recherche une carte, scanne-la ou suis sa valeur au prix du jour.
              </p>

              {/* Interactive Search Box */}
              <div ref={searchContainerRef} className="relative w-full max-w-xl">
                <form id="cherche" className="acc-cherche" role="search" aria-label="Chercher le prix d'une carte" onSubmit={handleSearchSubmit}>
                  <div className="acc-cherche-ligne">
                    <div className="acc-cherche-champ">
                      <Search className="w-5 h-5 text-slate-400" />
                      <input
                        type="search"
                        inputMode="search"
                        enterKeyHint="search"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                        placeholder="Nom ou code : Roger, OP09-118, Luffy..."
                        aria-label="Nom ou code d'une carte"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setIsSearchFocused(true);
                        }}
                        onFocus={() => setIsSearchFocused(true)}
                      />
                    </div>
                    <button type="submit" className="acc-cherche-ok">
                      Voir la cote
                    </button>
                  </div>

                  {/* Language Selector Radios */}
                  <div className="acc-cherche-langues" role="radiogroup" aria-label="La langue de ta carte">
                    <span className="acc-cherche-langues-titre" aria-hidden="true">Cote en langue :</span>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selectedLang === 'jp'}
                      onClick={() => setSelectedLang('jp')}
                    >
                      <img className="acc-drapeau" src="/media/flag-jp.png" alt="" width="18" height="18" />
                      Japonaise
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selectedLang === 'fr'}
                      onClick={() => setSelectedLang('fr')}
                    >
                      <img className="acc-drapeau" src="/media/flag-fr.png" alt="" width="18" height="18" />
                      Française
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selectedLang === 'en'}
                      onClick={() => setSelectedLang('en')}
                    >
                      <img className="acc-drapeau" src="/media/flag-en.png" alt="" width="18" height="18" />
                      Anglaise
                    </button>
                  </div>
                </form>

                {/* Autocomplete Dropdown */}
                {isSearchFocused && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#12141c]/98 backdrop-blur-2xl border border-amber-500/40 rounded-2xl p-2 shadow-2xl z-50 overflow-hidden divide-y divide-slate-800/60 max-h-[380px] overflow-y-auto">
                    {searchResults.map((card) => {
                      const imgUrl = getCardImageUrl(card, undefined, selectedLang);
                      const price = (card as any).price_eur || (card as any).cardmarket_price_eur || null;
                      return (
                        <div
                          key={card.card_code + (card.id || '')}
                          onClick={() => {
                            onSelectCard(card);
                            setIsSearchFocused(false);
                          }}
                          className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-amber-500/15 cursor-pointer transition-colors group text-left"
                        >
                          <div className="w-10 h-14 rounded-md overflow-hidden bg-slate-900 border border-slate-700/60 flex-shrink-0 flex items-center justify-center">
                            <img
                              src={imgUrl}
                              alt={card.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/logo.png';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-amber-400 text-xs tracking-wider">
                                {card.card_code}
                              </span>
                              {card.rarity && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700">
                                  {card.rarity}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                              {card.name}
                            </p>
                            <span className="text-[11px] text-slate-400 capitalize">
                              {card.category || 'Carte'} · {card.color?.join('/') || 'Neutre'}
                            </span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {price ? (
                              <span className="text-sm font-black text-emerald-400">
                                {Number(price).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500 font-medium">Cardmarket</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Trust Checklist */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 pt-2 text-xs text-slate-400 font-semibold">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  100% Gratuit, sans carte bancaire
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Rien à installer
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Scanner IA intégré
                </span>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: MARKET MOVERS (HAUSSES ET BAISSES DU JOUR)                    */}
      {/* ========================================================================= */}
      <section className="relative py-16 sm:py-24 border-t border-slate-800/60" id="mouvements">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Relevé chaque jour
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Depuis hier, <span className="text-slate-300">ces cartes ont bougé.</span>
            </h2>
            <p className="text-slate-400 text-base">
              Une carte peut prendre ou perdre de la valeur en une nuit : surveille ici les plus grandes variations de cote.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Top Losers */}
            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 shadow-lg">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-xs">
                  ▼
                </span>
                <h3 className="font-extrabold text-white text-base">Les plus fortes baisses</h3>
              </div>
              <div className="space-y-3">
                {topLosers.map((item) => {
                  const card = getCardForTrend(item);
                  const img = card ? getCardImageUrl(card) : '/logo.png';
                  return (
                    <div 
                      key={item.card_code} 
                      onClick={() => card && onSelectCard(card)} 
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/40 cursor-pointer transition-all group"
                    >
                      <div className="w-9 h-12 rounded overflow-hidden bg-slate-900 border border-slate-700/60 flex-shrink-0">
                        <img src={img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-slate-200 text-sm truncate block group-hover:text-amber-300 transition-colors">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-slate-500">{item.card_code}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <b className="text-slate-100 font-extrabold text-sm block">
                          {item.current_price_eur.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                        </b>
                        <span className="text-rose-400 font-bold text-xs">
                          {item.change_7d_percent}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Gainers */}
            <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 shadow-lg">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs">
                  ▲
                </span>
                <h3 className="font-extrabold text-white text-base">Les plus fortes hausses</h3>
              </div>
              <div className="space-y-3">
                {topGainers.map((item) => {
                  const card = getCardForTrend(item);
                  const img = card ? getCardImageUrl(card) : '/logo.png';
                  return (
                    <div 
                      key={item.card_code} 
                      onClick={() => card && onSelectCard(card)} 
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/40 cursor-pointer transition-all group"
                    >
                      <div className="w-9 h-12 rounded overflow-hidden bg-slate-900 border border-slate-700/60 flex-shrink-0">
                        <img src={img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-slate-200 text-sm truncate block group-hover:text-amber-300 transition-colors">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-slate-500">{item.card_code}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <b className="text-slate-100 font-extrabold text-sm block">
                          {item.current_price_eur.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                        </b>
                        <span className="text-emerald-400 font-bold text-xs">
                          +{item.change_7d_percent}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500 max-w-xl mx-auto mt-6">
            Prix Cardmarket : offre la moins chère en Near Mint dans la langue de la carte. Relevé quotidien automatique.
          </p>

          <div className="flex justify-center mt-6">
            <button 
              type="button" 
              onClick={() => onNavigateTab('database')} 
              className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>Explorer toute la bourse Cardmarket</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: TRIO COMPARATIF (MÊME CARTE, 3 LANGUES, 3 PRIX)               */}
      {/* ========================================================================= */}
      <section className="relative py-16 sm:py-24 border-t border-slate-800/60" id="langues">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
              Une carte, trois prix
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Même carte, même illustration. <span className="text-slate-300">Pas le même prix.</span>
            </h2>
            <p className="text-slate-400 text-base">
              Une japonaise n'a pas la cote d'une française, ni d'une anglaise. Ta collection est estimée dans la langue exacte de <b>chaque carte</b>.
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap my-8">
            {/* Version Japonaise */}
            <div 
              className="acc-trio-carte cursor-pointer group" 
              onClick={() => onSelectCard(rogerCard)}
              title="Voir Gol.D.Roger Manga en détail"
            >
              <span className="acc-holo">
                <span className="acc-holo-in">
                  <img src="/media/cartes/op09-p148-jp.webp" alt="Carte japonaise" width="360" height="504" loading="lazy" decoding="async" />
                  <span className="acc-holo-reflet" aria-hidden="true"></span>
                  <span className="acc-holo-irise" aria-hidden="true"></span>
                </span>
              </span>
              <span className="acc-trio-prix">
                <img className="acc-drapeau" src="/media/flag-jp.png" alt="" width="16" height="16" />
                <b>1 150,00 €</b>
              </span>
            </div>

            {/* Version Française */}
            <div 
              className="acc-trio-carte cursor-pointer group" 
              onClick={() => onSelectCard(rogerCard)}
              title="Voir Gol.D.Roger Manga en détail"
            >
              <span className="acc-holo">
                <span className="acc-holo-in">
                  <img src="/media/cartes/op09-p148-fr.webp" alt="Carte française" width="360" height="504" loading="lazy" decoding="async" />
                  <span className="acc-holo-reflet" aria-hidden="true"></span>
                  <span className="acc-holo-irise" aria-hidden="true"></span>
                </span>
              </span>
              <span className="acc-trio-prix">
                <img className="acc-drapeau" src="/media/flag-fr.png" alt="" width="16" height="16" />
                <b>1 850,00 €</b>
              </span>
            </div>

            {/* Version Anglaise */}
            <div 
              className="acc-trio-carte cursor-pointer group" 
              onClick={() => onSelectCard(rogerCard)}
              title="Voir Gol.D.Roger Manga en détail"
            >
              <span className="acc-holo">
                <span className="acc-holo-in">
                  <img src="/media/cartes/op09-p148-en.webp" alt="Carte anglaise" width="360" height="504" loading="lazy" decoding="async" />
                  <span className="acc-holo-reflet" aria-hidden="true"></span>
                  <span className="acc-holo-irise" aria-hidden="true"></span>
                </span>
              </span>
              <span className="acc-trio-prix">
                <img className="acc-drapeau" src="/media/flag-en.png" alt="" width="16" height="16" />
                <b>1 420,00 €</b>
              </span>
            </div>
          </div>

          {/* Catalog Access Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-10">
            <button 
              type="button" 
              onClick={() => onNavigateTab('database')} 
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <img className="w-5 h-5 rounded-full" src="/media/flag-jp.png" alt="" />
                <span className="text-sm font-bold text-slate-200">
                  <strong className="text-white">5 772</strong> japonaises
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button 
              type="button" 
              onClick={() => onNavigateTab('database')} 
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <img className="w-5 h-5 rounded-full" src="/media/flag-fr.png" alt="" />
                <span className="text-sm font-bold text-slate-200">
                  <strong className="text-white">4 087</strong> françaises
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button 
              type="button" 
              onClick={() => onNavigateTab('database')} 
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <img className="w-5 h-5 rounded-full" src="/media/flag-en.png" alt="" />
                <span className="text-sm font-bold text-slate-200">
                  <strong className="text-white">7 741</strong> anglaises
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: EN 3 GESTES (CARROUSEL SMARTPHONE 3D INTERACTIF)               */}
      {/* ========================================================================= */}
      <section className="relative py-16 sm:py-24 border-t border-slate-800/60" id="collection">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-2xl mx-auto space-y-3 mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Ta collection estimée <span className="text-amber-400">en 3 gestes.</span>
            </h2>
            <p className="text-slate-400 text-base">
              Ajoute tes cartes facilement, suis l'évolution de ta valeur au prix du jour et exporte tes classeurs.
            </p>
          </div>

          <div className="acc-visuel acc-visuel--p3 max-w-3xl mx-auto">
            <div className="acc-p3-scene">
              {/* Phone 1: Roger Card in App */}
              <button
                type="button"
                className={`acc-tel-pos ${gestureStep === 0 ? 'acc-tel-pos--centre' : gestureStep === 1 ? 'acc-tel-pos--gauche' : 'acc-tel-pos--droite'}`}
                onClick={() => setGestureStep(0)}
                data-etape="0"
                data-actif={gestureStep === 0 ? 'oui' : undefined}
                aria-label="Étape 1 : Ajoute ta carte"
              >
                <div className="acc-tel">
                  <div className="acc-tel-ecran" style={{ ['--haut' as any]: '#2b1b19' }}>
                    <div className="acc-tel-barre" aria-hidden="true">
                      <span>9:41</span>
                      <svg viewBox="0 0 66 12" fill="currentColor">
                        <rect x="0" y="7" width="3" height="5" rx="1"></rect>
                        <rect x="4.5" y="5" width="3" height="7" rx="1"></rect>
                        <rect x="9" y="2.5" width="3" height="9.5" rx="1"></rect>
                        <rect x="13.5" y="0" width="3" height="12" rx="1"></rect>
                        <path d="M28.6 3.6a9.4 9.4 0 0 1 12.8 0l-1.4 1.5a7.3 7.3 0 0 0-10 0Z M31.3 6.5a5.4 5.4 0 0 1 7.4 0l-1.4 1.5a3.4 3.4 0 0 0-4.6 0Z M35 11.4l-1.6-1.7a2.3 2.3 0 0 1 3.2 0Z"></path>
                        <rect x="45" y="1" width="18" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="1" opacity=".5"></rect>
                        <rect x="47" y="3" width="14" height="6" rx="1.5"></rect>
                        <rect x="64" y="4.2" width="1.6" height="3.6" rx=".8" opacity=".5"></rect>
                      </svg>
                    </div>
                    <div className="acc-tel-vue">
                      <img className="acc-ecran" src="/media/accueil/ecran-roger-600.webp" alt="Fiche Gol D. Roger" width="900" height="1948" loading="eager" decoding="async" />
                    </div>
                    <span className="acc-tel-ilot" aria-hidden="true"></span>
                  </div>
                </div>
                <span className="acc-tel-legende" aria-hidden="true">
                  <i>1</i><b>Ajoute ta carte</b><small>Son prix dans sa langue</small>
                </span>
              </button>

              {/* Phone 2: Collection Overview */}
              <button
                type="button"
                className={`acc-tel-pos ${gestureStep === 1 ? 'acc-tel-pos--centre' : gestureStep === 2 ? 'acc-tel-pos--gauche' : 'acc-tel-pos--droite'}`}
                onClick={() => setGestureStep(1)}
                data-etape="1"
                data-actif={gestureStep === 1 ? 'oui' : undefined}
                aria-label="Étape 2 : Suis sa valeur"
              >
                <div className="acc-tel">
                  <div className="acc-tel-ecran" style={{ ['--haut' as any]: '#121419' }}>
                    <div className="acc-tel-barre" aria-hidden="true">
                      <span>9:41</span>
                      <svg viewBox="0 0 66 12" fill="currentColor">
                        <rect x="0" y="7" width="3" height="5" rx="1"></rect>
                        <rect x="4.5" y="5" width="3" height="7" rx="1"></rect>
                        <rect x="9" y="2.5" width="3" height="9.5" rx="1"></rect>
                        <rect x="13.5" y="0" width="3" height="12" rx="1"></rect>
                        <path d="M28.6 3.6a9.4 9.4 0 0 1 12.8 0l-1.4 1.5a7.3 7.3 0 0 0-10 0Z M31.3 6.5a5.4 5.4 0 0 1 7.4 0l-1.4 1.5a3.4 3.4 0 0 0-4.6 0Z M35 11.4l-1.6-1.7a2.3 2.3 0 0 1 3.2 0Z"></path>
                        <rect x="45" y="1" width="18" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="1" opacity=".5"></rect>
                        <rect x="47" y="3" width="14" height="6" rx="1.5"></rect>
                        <rect x="64" y="4.2" width="1.6" height="3.6" rx=".8" opacity=".5"></rect>
                      </svg>
                    </div>
                    <div className="acc-tel-vue">
                      <img className="acc-ecran" src="/media/accueil/ecran-collection-600.webp" alt="Ma Collection" width="900" height="1948" loading="lazy" decoding="async" />
                    </div>
                    <span className="acc-tel-ilot" aria-hidden="true"></span>
                  </div>
                </div>
                <span className="acc-tel-legende" aria-hidden="true">
                  <i>2</i><b>Suis sa valeur</b><small>Au prix du jour</small>
                </span>
              </button>

              {/* Phone 3: Lockscreen Notification View */}
              <button
                type="button"
                className={`acc-tel-pos ${gestureStep === 2 ? 'acc-tel-pos--centre' : gestureStep === 0 ? 'acc-tel-pos--gauche' : 'acc-tel-pos--droite'}`}
                onClick={() => setGestureStep(2)}
                data-etape="2"
                data-actif={gestureStep === 2 ? 'oui' : undefined}
                aria-label="Étape 3 : Organise ton classeur"
              >
                <div className="acc-tel">
                  <div className="acc-tel-ecran" style={{ ['--haut' as any]: '#0e0f14' }}>
                    <div className="acc-tel-vue acc-tel-vue--plein">
                      <div className="acc-verrou">
                        <div className="acc-verrou-heure" aria-hidden="true">
                          <small>Aujourd'hui</small>
                          <b>9:41</b>
                        </div>
                        <div className="acc-verrou-notifs">
                          <div className="acc-verrou-notif">
                            <img src="/logo.png" alt="" width="38" height="38" loading="lazy" className="rounded-full" />
                            <div>
                              <small>
                                <span>OPTCG MASTER</span><span>maintenant</span>
                              </small>
                              <b>Gol.D.Roger Manga ajouté !</b>
                              <span>1 850,00 € · Version française</span>
                            </div>
                          </div>
                          <div className="acc-verrou-notif">
                            <img src="/logo.png" alt="" width="38" height="38" loading="lazy" className="rounded-full" />
                            <div>
                              <small>
                                <span>OPTCG MASTER</span><span>il y a 2 h</span>
                              </small>
                              <b>Classeur mis à jour</b>
                              <span>Valeur estimée : +145 € cette semaine</span>
                            </div>
                          </div>
                        </div>
                        <span className="acc-verrou-barre" aria-hidden="true"></span>
                      </div>
                    </div>
                    <span className="acc-tel-ilot" aria-hidden="true"></span>
                  </div>
                </div>
                <span className="acc-tel-legende" aria-hidden="true">
                  <i>3</i><b>Organise ton classeur</b><small>Export & Partage</small>
                </span>
              </button>
            </div>

            <p className="acc-geste">
              <span>{gestureStep + 1}</span>
              <b>{gestureStep === 0 ? 'Ajoute ta carte' : gestureStep === 1 ? 'Suis sa valeur' : 'Organise ton classeur'}</b>
              <small>{gestureStep === 0 ? 'Son prix dans sa langue' : gestureStep === 1 ? 'Au prix du jour' : 'Partage ton binder en ligne'}</small>
            </p>

            <div className="acc-points">
              <button type="button" aria-label="Étape 1" aria-current={gestureStep === 0} onClick={() => setGestureStep(0)}>
                <i></i>
              </button>
              <button type="button" aria-label="Étape 2" aria-current={gestureStep === 1} onClick={() => setGestureStep(1)}>
                <i></i>
              </button>
              <button type="button" aria-label="Étape 3" aria-current={gestureStep === 2} onClick={() => setGestureStep(2)}>
                <i></i>
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <button 
              type="button" 
              onClick={handleAddCardClick} 
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition-all shadow-[0_0_20px_rgba(245,166,35,0.3)] hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Ajouter une carte (Scanner IA)</span>
            </button>
            
            <button 
              type="button" 
              onClick={() => onNavigateTab('collection')} 
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <FolderHeart className="w-4 h-4 text-pink-400" />
              <span>Ouvrir ma collection</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: BENTO GRID - TOUT LE RESTE, GRATUIT                           */}
      {/* ========================================================================= */}
      <section className="relative py-16 sm:py-24 border-t border-slate-800/60" id="options">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Tout le reste, <span className="text-amber-400">gratuit.</span>
            </h2>
            <p className="text-slate-400 text-base">
              L'écosystème le plus complet pour jouer, collectionner et analyser One Piece Card Game.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            
            {/* Tile 1: Quotas des Displays avec VRAIES photos de displays */}
            <div 
              onClick={() => onNavigateTab('quotas')}
              className="bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-xl group cursor-pointer"
            >
              <div>
                {/* Visual Showcase: Real Display Boxes from public/images/sealed/ */}
                <div className="h-44 sm:h-52 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-950/80 to-slate-950 border border-slate-800/80 relative overflow-hidden flex items-center justify-center mb-6">
                  <div className="flex items-center justify-center relative w-full h-full">
                    {/* Display OP-05 */}
                    <img 
                      src="/images/sealed/op-05-display.jpg" 
                      alt="Display OP-05" 
                      className="w-24 sm:w-28 object-contain rounded-lg shadow-2xl -rotate-12 -translate-x-12 translate-y-2 group-hover:-translate-x-14 group-hover:-rotate-16 transition-transform duration-300 border border-white/10" 
                    />
                    {/* Display OP-09 Center */}
                    <img 
                      src="/images/sealed/op-09-display.jpg" 
                      alt="Display OP-09" 
                      className="w-28 sm:w-32 object-contain rounded-lg shadow-2xl z-10 group-hover:scale-105 transition-transform duration-300 border border-white/20" 
                    />
                    {/* Display OP-13 */}
                    <img 
                      src="/images/sealed/op-13-display.jpg" 
                      alt="Display OP-13" 
                      className="w-24 sm:w-28 object-contain rounded-lg shadow-2xl rotate-12 translate-x-12 translate-y-2 group-hover:translate-x-14 group-hover:rotate-16 transition-transform duration-300 border border-white/10" 
                    />
                  </div>
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-black uppercase tracking-wider">
                    SEC · SP · Manga
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                    Calculateur de pull rates
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
                    Les quotas des displays
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Combien de SEC, de SP et de Manga par display avant d'acheter vos boîtes scellées. Statistiques vérifiées et calculateur de probabilités de drop.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 group-hover:underline inline-flex items-center gap-1">
                  Voir tous les quotas
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <Boxes className="w-5 h-5 text-amber-400/60" />
              </div>
            </div>

            {/* Tile 2: Toutes les collections avec VRAIES cartes en éventail */}
            <div 
              onClick={() => onNavigateTab('database')}
              className="bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-teal-500/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-xl group cursor-pointer"
            >
              <div>
                {/* Visual Showcase: Real Cards Fan */}
                <div className="h-44 sm:h-52 rounded-2xl bg-gradient-to-br from-teal-500/10 via-slate-950/80 to-slate-950 border border-slate-800/80 relative overflow-hidden flex items-center justify-center mb-6">
                  <div className="flex items-center justify-center relative w-full h-full">
                    {/* Card 1: Zoro OP06 */}
                    <img 
                      src="/media/cartes/op06-p142-zoro.webp" 
                      alt="Zoro" 
                      className="w-20 sm:w-24 rounded-lg shadow-xl -rotate-15 -translate-x-16 group-hover:-translate-x-20 transition-transform duration-300" 
                    />
                    {/* Card 2: Luffy OP05 Manga */}
                    <img 
                      src="/media/cartes/op05-p147-luffy.webp" 
                      alt="Luffy Manga" 
                      className="w-22 sm:w-26 rounded-lg shadow-xl -rotate-6 -translate-x-8 group-hover:-translate-x-10 transition-transform duration-300 z-10" 
                    />
                    {/* Card 3: Roger OP09 Center */}
                    <img 
                      src="/media/cartes/op09-p148-jp.webp" 
                      alt="Gol D. Roger" 
                      className="w-24 sm:w-28 rounded-lg shadow-2xl z-20 group-hover:scale-105 transition-transform duration-300 border border-amber-400/30" 
                    />
                    {/* Card 4: Shanks OP09 */}
                    <img 
                      src="/media/cartes/op09-p009-shanks.webp" 
                      alt="Shanks Manga" 
                      className="w-22 sm:w-26 rounded-lg shadow-xl rotate-6 translate-x-8 group-hover:translate-x-10 transition-transform duration-300 z-10" 
                    />
                    {/* Card 5: Sabo OP13 */}
                    <img 
                      src="/media/cartes/op13-p160-sabo.webp" 
                      alt="Sabo" 
                      className="w-20 sm:w-24 rounded-lg shadow-xl rotate-15 translate-x-16 group-hover:translate-x-20 transition-transform duration-300" 
                    />
                  </div>
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-[11px] font-black uppercase tracking-wider">
                    7 400+ Cartes HD
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-black uppercase text-teal-400 tracking-wider">
                    Encyclopédie Complète
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-teal-300 transition-colors">
                    Toutes les collections, triées
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Extensions OP01 à OP17, promos Championship, decks de démarrage et réimpressions PRB. Scans ultra-haute définition et filtres avancés.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between">
                <span className="text-xs font-bold text-teal-400 group-hover:underline inline-flex items-center gap-1">
                  Ouvrir le catalogue
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <Search className="w-5 h-5 text-teal-400/60" />
              </div>
            </div>

            {/* Tile 3: Méta Decks & Tournois Mondiaux */}
            <div 
              onClick={() => onNavigateTab('meta')}
              className="bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-xl group cursor-pointer"
            >
              <div>
                {/* Visual Showcase: Meta Leaders & Winrate */}
                <div className="h-44 sm:h-52 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-950/80 to-slate-950 border border-slate-800/80 relative overflow-hidden flex items-center justify-center mb-6 p-4">
                  <div className="flex items-center justify-center gap-4">
                    {/* Leader Shanks OP09 */}
                    <div className="relative group-hover:scale-105 transition-transform">
                      <img 
                        src="/media/cartes/op09-p009-shanks.webp" 
                        alt="Shanks Leader" 
                        className="w-24 sm:w-28 rounded-xl border-2 border-amber-400 shadow-[0_0_15px_rgba(245,166,35,0.4)]" 
                      />
                      <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px] shadow">
                        TIER 1
                      </span>
                    </div>

                    {/* Stats pills */}
                    <div className="space-y-2 text-left">
                      <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Winrate Moyen</span>
                        <b className="text-emerald-400 text-base font-black">62.8 %</b>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Tournois Relevés</span>
                        <b className="text-white text-base font-black">10 000+</b>
                      </div>
                    </div>
                  </div>
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-black uppercase tracking-wider">
                    Tier List Live
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                    Compétition & Tournois
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
                    Méta Decks & Tier List
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Les meilleurs decks du moment analysés sur plus de 10 000 tournois mondiaux. Compositions de listes victorieuses, guides de match-ups et statistiques.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 group-hover:underline inline-flex items-center gap-1">
                  Découvrir la Tier List
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <Trophy className="w-5 h-5 text-amber-400/60" />
              </div>
            </div>

            {/* Tile 4: Deckbuilder Compétitif */}
            <div 
              onClick={() => onNavigateTab('deckbuilder')}
              className="bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-xl group cursor-pointer"
            >
              <div>
                {/* Visual Showcase: Deck Crafting */}
                <div className="h-44 sm:h-52 rounded-2xl bg-gradient-to-br from-blue-500/10 via-slate-950/80 to-slate-950 border border-slate-800/80 relative overflow-hidden flex items-center justify-center mb-6">
                  <div className="flex items-center justify-center gap-3">
                    {/* Leader card */}
                    <img 
                      src="/media/cartes/op05-p147-luffy.webp" 
                      alt="Leader" 
                      className="w-20 sm:w-24 rounded-lg shadow-xl border-2 border-blue-400/60 group-hover:scale-105 transition-transform" 
                    />
                    {/* Deck breakdown pills */}
                    <div className="space-y-1.5 text-left">
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black">
                        <span>✓ 50 Cartes Validées</span>
                      </div>
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold">
                        <span>10 Cartes DON!!</span>
                      </div>
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
                        <span>Simulateur de mains</span>
                      </div>
                    </div>
                  </div>
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[11px] font-black uppercase tracking-wider">
                    Simulateur Intégré
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-black uppercase text-blue-400 tracking-wider">
                    Constructeur de Decks
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-blue-300 transition-colors">
                    Deckbuilder Compétitif
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Construis tes decks avec vérification des règles officielles, courbe de coût en direct, simulation de main de départ et export vers OPTCGSim.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 group-hover:underline inline-flex items-center gap-1">
                  Lancer le Deckbuilder
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <Layers className="w-5 h-5 text-blue-400/60" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: FAQ ACCORDÉON INTERACTIF                                       */}
      {/* ========================================================================= */}
      <section className="relative py-16 sm:py-24 border-t border-slate-800/60" aria-labelledby="acc-faq-titre">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight" id="acc-faq-titre">
              Tu te demandes <span className="text-amber-400">peut‑être…</span>
            </h2>
            <p className="text-slate-400 text-base">
              Retrouve les réponses aux questions les plus fréquemment posées.
            </p>
          </div>

          <div className="acc-faq max-w-3xl mx-auto space-y-3">
            <details>
              <summary>
                C'est vraiment gratuit, où est le piège ?
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </summary>
              <p>
                Il n'y en a aucun : l'ensemble de la plateforme est accessible gratuitement, sans carte bancaire, sans abonnement et sans limitation d'usage. Vous pouvez suivre votre collection, utiliser le deckbuilder et consulter les cotes en toute liberté.
              </p>
            </details>

            <details>
              <summary>
                D'où viennent les cotes et les prix affichés ?
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </summary>
              <p>
                Directement de Cardmarket : le prix correspond à l'offre Near Mint la moins chère disponible dans la langue exacte de votre carte. Toutes les cartes du catalogue sont synchronisées quotidiennement. Pour les cartes japonaises et anglaises, nous agrégeons également les références Yuyu-tei et TCGplayer.
              </p>
            </details>

            <details>
              <summary>
                Pourquoi utiliser OPTCG Master plutôt que juste Cardmarket ?
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </summary>
              <p>
                Cardmarket affiche une offre à la fois, sans vision d'ensemble. OPTCG Master calcule instantanément la valeur totale de votre classeur ou de vos decks, suit l'évolution des cotes dans le temps, vous permet de scanner vos cartes par caméra ou IA et met à votre disposition un deckbuilder compétitif connecté aux tournois mondiaux.
              </p>
            </details>

            <details>
              <summary>
                Faut-il installer une application ?
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </summary>
              <p>
                Non. Tout s'exécute directement dans votre navigateur web, aussi bien sur smartphone que sur ordinateur ou tablette. Le site est une Progressive Web App (PWA) : vous pouvez l'ajouter en un clic à l'écran d'accueil de votre téléphone pour une utilisation plein écran fluide.
              </p>
            </details>

            <details>
              <summary>
                Pourquoi OPTCG Master ?
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
              </summary>
              <p>
                OPTCG Master a été conçu par et pour la communauté française de One Piece Card Game. Notre objectif est de vous offrir la plateforme francophone la plus complète, rapide et moderne : argus des cartes en 3 langues, calcul des quotas de boîtes, deckbuilder de tournoi, scanner par intelligence artificielle et analyse approfondie de la méta internationale.
              </p>
            </details>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: CALL TO ACTION FINAL                                           */}
      {/* ========================================================================= */}
      <section className="relative py-20 sm:py-28 border-t border-slate-800/60 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Card fan visual */}
          <div className="acc-eventail acc-declic my-6" aria-hidden="true">
            <span className="acc-eventail-carte" style={{ ['--i' as any]: -1, ['--a' as any]: 1, ['--k' as any]: 0, ['--z' as any]: 9 }}>
              <span className="acc-holo">
                <span className="acc-holo-in">
                  <img src="/media/cartes/op09-p148-jp.webp" alt="" width="300" height="420" loading="lazy" decoding="async" />
                  <span className="acc-holo-reflet" aria-hidden="true"></span>
                  <span className="acc-holo-irise" aria-hidden="true"></span>
                </span>
              </span>
            </span>
            <span className="acc-eventail-carte" style={{ ['--i' as any]: 0, ['--a' as any]: 0, ['--k' as any]: 1, ['--z' as any]: 10 }}>
              <span className="acc-holo">
                <span className="acc-holo-in">
                  <img src="/media/cartes/op09-p148-fr.webp" alt="" width="300" height="420" loading="lazy" decoding="async" />
                  <span className="acc-holo-reflet" aria-hidden="true"></span>
                  <span className="acc-holo-irise" aria-hidden="true"></span>
                </span>
              </span>
            </span>
            <span className="acc-eventail-carte" style={{ ['--i' as any]: 1, ['--a' as any]: 1, ['--k' as any]: 2, ['--z' as any]: 9 }}>
              <span className="acc-holo">
                <span className="acc-holo-in">
                  <img src="/media/cartes/op09-p148-en.webp" alt="" width="300" height="420" loading="lazy" decoding="async" />
                  <span className="acc-holo-reflet" aria-hidden="true"></span>
                  <span className="acc-holo-irise" aria-hidden="true"></span>
                </span>
              </span>
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-6">
            Sache enfin ce que vaut <span className="text-amber-400">ta collection.</span>
          </h2>

          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto mt-4">
            Gratuit, sans carte bancaire, sans rien installer. Scanne ta première carte en quelques secondes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto my-8">
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 font-semibold">
              Cote du jour en 3 langues
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 font-semibold">
              Valeur de collection
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 font-semibold">
              Quotas des displays
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 font-semibold">
              Tier List & Méta
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 font-semibold">
              Deckbuilder
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 font-semibold">
              Scanner IA
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              type="button" 
              onClick={handleAddCardClick} 
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base transition-all shadow-[0_0_25px_rgba(245,166,35,0.35)] hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <span>Ajouter une carte (Scanner IA)</span>
            </button>
            <button 
              type="button" 
              onClick={() => onNavigateTab('collection')} 
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white font-bold text-sm sm:text-base transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <FolderHeart className="w-5 h-5 text-pink-400" />
              <span>Ouvrir ma collection</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

        </div>
      </section>
    </div>
  );
};
