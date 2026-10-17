import React, { useState, useMemo, useEffect, useRef } from 'react';
import '../styles/scalpeurs-home.css';
import { Card, MarketTrendItem } from '../types';
import { allCards, allMarketTrends } from '../data/dataProvider';
import { ActiveTab } from '../components/Navbar';
import { getCardImageUrl } from '../utils/cardUtils';

interface HomeViewProps {
  onSelectCard: (card: Card) => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onSelectCard, onNavigateTab }) => {
  // --- Search state ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState<'jp' | 'fr' | 'en'>('jp');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // --- Gesture / Phone carousel state ---
  const [gestureStep, setGestureStep] = useState<number>(0);

  // --- Intro state ---
  useEffect(() => {
    try {
      const introSeen = localStorage.getItem('acc-intro-seen');
      if (!introSeen) {
        document.documentElement.setAttribute('data-intro', 'play');
        const timer = setTimeout(() => {
          document.documentElement.removeAttribute('data-intro');
          localStorage.setItem('acc-intro-seen', 'true');
        }, 2500);
        return () => {
          clearTimeout(timer);
          document.documentElement.removeAttribute('data-intro');
        };
      }
    } catch (e) {
      // Ignore if localStorage unavailable
    }
  }, []);

  const handleDismissIntro = () => {
    document.documentElement.removeAttribute('data-intro');
    try {
      localStorage.setItem('acc-intro-seen', 'true');
    } catch (e) {}
  };

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

  return (
    <div className="acc-racine">
      {/* Intro Devil Fruit Animation (Scalpeurs Signature) */}
      <div 
        id="acc-intro" 
        className="acc-intro" 
        role="button" 
        tabIndex={-1} 
        aria-label="Entrer sur le site"
        onClick={handleDismissIntro}
      >
        <div className="acc-intro-volet" data-v="a" aria-hidden="true">
          <div className="acc-intro-fond"></div>
        </div>
        <div className="acc-intro-volet" data-v="b" aria-hidden="true">
          <div className="acc-intro-fond"></div>
        </div>
        <div className="acc-intro-rayons" aria-hidden="true"></div>
        <div className="acc-intro-scene" aria-hidden="true">
          <div className="acc-intro-ombre"></div>
          <div className="acc-intro-corps">
            <span className="acc-intro-lueur"></span>
            <span className="acc-intro-entier">
              <img className="acc-intro-fruit" src="/media/accueil/fruit-intro.webp" alt="" width="438" height="512" decoding="async" />
            </span>
            <div className="acc-intro-moitie" data-m="a">
              <div className="acc-intro-vol">
                <span className="acc-intro-peau">
                  <img className="acc-intro-fruit" src="/media/accueil/fruit-intro.webp" alt="" width="438" height="512" decoding="async" />
                </span>
                <span className="acc-intro-face"></span>
              </div>
            </div>
            <div className="acc-intro-moitie" data-m="b">
              <div className="acc-intro-vol">
                <span className="acc-intro-peau">
                  <img className="acc-intro-fruit" src="/media/accueil/fruit-intro.webp" alt="" width="438" height="512" decoding="async" />
                </span>
                <span className="acc-intro-face"></span>
              </div>
            </div>
          </div>
        </div>
        <div className="acc-intro-lame" aria-hidden="true"></div>
        <div className="acc-intro-eclair" aria-hidden="true"></div>
        <div className="acc-intro-coeur" aria-hidden="true"></div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: HERO AVEC CARTES FLOTTANTES 3D ET RECHERCHE EN DIRECT         */}
      {/* ========================================================================= */}
      <section className="acc-hero acc-hero--ciel">
        <div className="acc-galaxie" aria-hidden="true">
          <i className="acc-galaxie-c acc-galaxie-c--loin"></i>
          <i className="acc-galaxie-c acc-galaxie-c--milieu"></i>
          <i className="acc-galaxie-c acc-galaxie-c--pres"></i>
          <i className="acc-galaxie-filante"></i>
        </div>

        <div className="acc-wrap acc-hero-grille">
          {/* Ciel & Floating Animated Cards */}
          <div className="acc-ciel">
            <div className="acc-ciel-fond" aria-hidden="true">
              <i className="acc-etoiles acc-etoiles--loin"></i>
              <i className="acc-etoiles acc-etoiles--milieu"></i>
              <i className="acc-etoiles acc-etoiles--pres"></i>
              <i className="acc-filante"></i>
            </div>

            <div className="acc-ciel-scene">
              {/* Card 1 - Background distant */}
              <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--loin" style={{ ['--x' as any]: '9%', ['--y' as any]: '17%', ['--w' as any]: 13, ['--r' as any]: '-14deg', ['--d' as any]: 0.12, ['--dl' as any]: '-1s', ['--i' as any]: 10, ['--xp' as any]: '4.5%', ['--yp' as any]: '16%', ['--wp' as any]: 6.2, ['--rp' as any]: '-14deg' }}>
                <span className="acc-ciel-envol">
                  <span className="acc-ciel-flotte">
                    <img src="/media/cartes/op06-p142-zoro.webp" alt="" width="44" height="61" decoding="async" />
                  </span>
                </span>
              </span>

              {/* Card 2 */}
              <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--loin" style={{ ['--x' as any]: '91%', ['--y' as any]: '12%', ['--w' as any]: 12, ['--r' as any]: '12deg', ['--d' as any]: 0.12, ['--dl' as any]: '-3s', ['--i' as any]: 9, ['--xp' as any]: '95.5%', ['--yp' as any]: '14%', ['--wp' as any]: 6.2, ['--rp' as any]: '12deg' }}>
                <span className="acc-ciel-envol">
                  <span className="acc-ciel-flotte">
                    <img src="/media/cartes/op13-p160-sabo.webp" alt="" width="44" height="61" decoding="async" />
                  </span>
                </span>
              </span>

              {/* Card 3 - Large Mid-plane */}
              <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--large" style={{ ['--x' as any]: '13%', ['--y' as any]: '68%', ['--w' as any]: 19, ['--r' as any]: '-9deg', ['--d' as any]: 0.45, ['--dl' as any]: '-2.5s', ['--i' as any]: 5, ['--xp' as any]: '17.5%', ['--yp' as any]: '11.5%', ['--wp' as any]: 8.6, ['--rp' as any]: '-7deg' }}>
                <span className="acc-ciel-envol">
                  <span className="acc-ciel-flotte">
                    <img src="/media/cartes/op13-p160-sabo.webp" alt="" width="280" height="391" decoding="async" />
                  </span>
                </span>
              </span>

              {/* Card 4 - Large Mid-plane Right */}
              <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--large" style={{ ['--x' as any]: '85%', ['--y' as any]: '34%', ['--w' as any]: 19, ['--r' as any]: '11deg', ['--d' as any]: 0.5, ['--dl' as any]: '-1.5s', ['--i' as any]: 4, ['--xp' as any]: '81.5%', ['--yp' as any]: '11.5%', ['--wp' as any]: 8.6, ['--rp' as any]: '9deg' }}>
                <span className="acc-ciel-envol">
                  <span className="acc-ciel-flotte">
                    <img src="/media/cartes/op06-p142-zoro.webp" alt="" width="280" height="391" decoding="async" />
                  </span>
                </span>
              </span>

              {/* Card 5 - Foreground Left (Luffy Manga OP05) */}
              <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--pres" style={{ ['--x' as any]: '27%', ['--y' as any]: '40%', ['--w' as any]: 27, ['--r' as any]: '-12deg', ['--d' as any]: 0.78, ['--dl' as any]: '-3.5s', ['--i' as any]: 2, ['--xp' as any]: '10%', ['--yp' as any]: '43%', ['--wp' as any]: 12.6, ['--rp' as any]: '-9deg' }}>
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

              {/* Card 6 - Foreground Right (Shanks Manga OP09) */}
              <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--pres acc-ciel-carte--large" style={{ ['--x' as any]: '74%', ['--y' as any]: '64%', ['--w' as any]: 27, ['--r' as any]: '10deg', ['--d' as any]: 0.82, ['--dl' as any]: '-0.5s', ['--i' as any]: 1, ['--xp' as any]: '79%', ['--yp' as any]: '83%', ['--wp' as any]: 9.8, ['--rp' as any]: '10deg' }}>
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

              {/* Card 7 - Centerpiece Gol D. Roger Manga OP09-148 */}
              <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--pres" style={{ ['--x' as any]: '50%', ['--y' as any]: '47%', ['--w' as any]: 35, ['--r' as any]: '-3deg', ['--d' as any]: 1, ['--dl' as any]: '0s', ['--i' as any]: 0, ['--xp' as any]: '89.5%', ['--yp' as any]: '41%', ['--wp' as any]: 13.6, ['--rp' as any]: '7deg' }}>
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

          {/* Hero Content & Live Search */}
          <div className="acc-hero-texte">
            <a className="acc-sur acc-sur--lien" href="#mouvements">
              <span className="acc-point" aria-hidden="true"></span>
              <span>Prix relus chaque jour</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9 6 6 6-6 6"></path>
              </svg>
            </a>

            <h1 className="acc-h1">
              Combien vaut <em>vraiment</em> ta collection One Piece ?
            </h1>

            <p className="acc-lead">
              Le site qui réunit toutes les cartes One Piece, en japonais, français et anglais : <b>{allCards.length.toLocaleString('fr-FR')}</b> cartes. Ajoute les tiennes, on calcule ta collection.
            </p>

            {/* Interactive Live Search Form */}
            <div ref={searchContainerRef} className="relative w-full max-w-xl mx-auto">
              <form id="cherche" className="acc-cherche" role="search" aria-label="Chercher le prix d'une carte" onSubmit={handleSearchSubmit}>
                <div className="acc-cherche-ligne">
                  <div className="acc-cherche-champ">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="m20 20-3.6-3.6"></path>
                    </svg>
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
                    Voir le prix
                  </button>
                </div>

                {/* Language Selectors */}
                <div className="acc-cherche-langues" role="radiogroup" aria-label="La langue de ta carte">
                  <span className="acc-cherche-langues-titre" aria-hidden="true">Ta carte est</span>
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

              {/* Instant Search Suggestions Dropdown */}
              {isSearchFocused && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#12141c]/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-2 shadow-2xl z-50 overflow-hidden divide-y divide-slate-800/60 max-h-[380px] overflow-y-auto">
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
                        className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-amber-500/10 cursor-pointer transition-colors group text-left"
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
                            <span className="text-sm font-extrabold text-emerald-400">
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

            <ul className="acc-confiance">
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m8 12 3 3 5-6"></path>
                </svg>
                Gratuit, sans carte bancaire
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m8 12 3 3 5-6"></path>
                </svg>
                Rien à installer
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="m8 12 3 3 5-6"></path>
                </svg>
                Sans compte pour commencer
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: MARKET MOVERS (HAUSSES ET BAISSES EN TEMPS RÉEL)               */}
      {/* ========================================================================= */}
      <section className="acc-section acc-section--ciel acc-mv-section" id="mouvements" aria-labelledby="acc-mv-titre">
        <div className="acc-fond-ciel acc-fond-ciel--1" aria-hidden="true">
          <i className="acc-fond-ciel-c acc-fond-ciel-c--loin"></i>
          <i className="acc-fond-ciel-c acc-fond-ciel-c--milieu"></i>
          <i className="acc-fond-ciel-c acc-fond-ciel-c--pres"></i>
        </div>

        <div className="acc-mv-tete">
          <p className="acc-direct">
            <span className="acc-point" aria-hidden="true"></span>
            Relevé chaque jour
          </p>
          <h2 className="acc-h2" id="acc-mv-titre">
            Depuis hier<span className="acc-ponct">,</span> <em>ces cartes ont bougé<span className="acc-ponct">.</span></em>
          </h2>
          <p className="acc-p">
            Une carte peut prendre ou perdre des centaines d'euros en une nuit : ici, tu le vois.
          </p>
        </div>

        <div className="acc-mv">
          {/* Top Losers */}
          <div className="acc-mv-col">
            <h3>
              <span className="acc-mv-ic acc-bas" aria-hidden="true">▼</span>
              Les plus fortes baisses
            </h3>
            <ol>
              {topLosers.map((item) => {
                const card = getCardForTrend(item);
                const img = card ? getCardImageUrl(card) : '/logo.png';
                return (
                  <li key={item.card_code} onClick={() => card && onSelectCard(card)} className="cursor-pointer">
                    <div className="acc-mv-ligne hover:bg-white/5 transition-colors p-2 rounded-xl">
                      <div className="w-8 h-11 rounded overflow-hidden bg-slate-900 border border-slate-700/60 flex-shrink-0">
                        <img src={img} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="truncate flex-1 font-bold text-slate-200">
                        {item.name}
                      </span>
                      <div className="text-right flex-shrink-0">
                        <b className="text-slate-100 font-extrabold block">
                          {item.current_price_eur.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                        </b>
                        <em className="text-rose-400 font-bold not-italic text-xs">
                          {item.change_7d_percent}%
                        </em>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Top Gainers */}
          <div className="acc-mv-col">
            <h3>
              <span className="acc-mv-ic acc-haut" aria-hidden="true">▲</span>
              Les plus fortes hausses
            </h3>
            <ol>
              {topGainers.map((item) => {
                const card = getCardForTrend(item);
                const img = card ? getCardImageUrl(card) : '/logo.png';
                return (
                  <li key={item.card_code} onClick={() => card && onSelectCard(card)} className="cursor-pointer">
                    <div className="acc-mv-ligne hover:bg-white/5 transition-colors p-2 rounded-xl">
                      <div className="w-8 h-11 rounded overflow-hidden bg-slate-900 border border-slate-700/60 flex-shrink-0">
                        <img src={img} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="truncate flex-1 font-bold text-slate-200">
                        {item.name}
                      </span>
                      <div className="text-right flex-shrink-0">
                        <b className="text-slate-100 font-extrabold block">
                          {item.current_price_eur.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                        </b>
                        <em className="text-emerald-400 font-bold not-italic text-xs">
                          +{item.change_7d_percent}%
                        </em>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <p className="acc-note-source">
          Prix Cardmarket : la moins chère en Near Mint, dans la langue de la carte. Relevé sur l'ensemble des 7 400+ cartes répertoriées.
        </p>

        <div className="acc-ctas">
          <button 
            type="button" 
            onClick={() => onNavigateTab('database')} 
            className="acc-lien cursor-pointer"
          >
            Explorer toute la bourse Cardmarket
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 6 6 6-6 6"></path>
            </svg>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: TRIO COMPARATIF (MÊME CARTE, 3 LANGUES, 3 PRIX)               */}
      {/* ========================================================================= */}
      <section className="acc-section acc-trio-section" id="langues" aria-labelledby="acc-trio-titre">
        <div className="acc-trio-grille">
          <div className="acc-trio-texte">
            <p className="acc-sur">Une carte, trois prix</p>
            <h2 className="acc-h2 acc-h2--deux" id="acc-trio-titre">
              Même carte<span className="acc-ponct">,</span> même illustration<span className="acc-ponct">.</span> <em>Pas le même prix<span className="acc-ponct">.</span></em>
            </h2>
            <p className="acc-p">
              Une japonaise n'a pas le prix d'une française, ni d'une anglaise. Ta collection est estimée dans la langue de <b>chaque</b> carte, jamais au prix d'une autre.
            </p>
          </div>

          <div className="acc-trio acc-r" aria-label="La même carte en trois langues">
            {/* Version Japonaise */}
            <div 
              className="acc-trio-carte cursor-pointer group" 
              onClick={() => onSelectCard(rogerCard)}
              title="Voir Gol.D.Roger Manga en détail"
            >
              <span className="acc-holo">
                <span className="acc-holo-in">
                  <img src="/media/cartes/op09-p148-jp.webp" alt="Carte, version japonaise" width="360" height="504" loading="lazy" decoding="async" />
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
                  <img src="/media/cartes/op09-p148-fr.webp" alt="Carte, version française" width="360" height="504" loading="lazy" decoding="async" />
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
                  <img src="/media/cartes/op09-p148-en.webp" alt="Carte, version anglaise" width="360" height="504" loading="lazy" decoding="async" />
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

          <ul className="acc-catalogues" aria-label="Les catalogues par langue">
            <li>
              <button 
                type="button" 
                onClick={() => onNavigateTab('database')} 
                className="acc-catalogue-lien w-full text-left cursor-pointer"
              >
                <img className="acc-drapeau" src="/media/flag-jp.png" alt="" width="22" height="22" />
                <span><b>5 772</b> cartes japonaises</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 6 6 6-6 6"></path>
                </svg>
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => onNavigateTab('database')} 
                className="acc-catalogue-lien w-full text-left cursor-pointer"
              >
                <img className="acc-drapeau" src="/media/flag-fr.png" alt="" width="22" height="22" />
                <span><b>4 087</b> cartes françaises</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 6 6 6-6 6"></path>
                </svg>
              </button>
            </li>
            <li>
              <button 
                type="button" 
                onClick={() => onNavigateTab('database')} 
                className="acc-catalogue-lien w-full text-left cursor-pointer"
              >
                <img className="acc-drapeau" src="/media/flag-en.png" alt="" width="22" height="22" />
                <span><b>7 741</b> cartes anglaises</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 6 6 6-6 6"></path>
                </svg>
              </button>
            </li>
          </ul>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: EN 3 GESTES (CARROUSEL 3D INTERACTIF DES ÉCRANS DU TÉLÉPHONE)   */}
      {/* ========================================================================= */}
      <section className="acc-section acc-section--ciel acc-gestes" id="collection" aria-labelledby="acc-plan-titre">
        <div className="acc-fond-ciel acc-fond-ciel--2" aria-hidden="true">
          <i className="acc-fond-ciel-c acc-fond-ciel-c--loin"></i>
          <i className="acc-fond-ciel-c acc-fond-ciel-c--milieu"></i>
          <i className="acc-fond-ciel-c acc-fond-ciel-c--pres"></i>
        </div>

        <div className="acc-gestes-tete">
          <h2 className="acc-h2" id="acc-plan-titre">
            Ta collection estimée <em>en 3 gestes<span className="acc-ponct">.</span></em>
          </h2>
        </div>

        <div className="acc-visuel acc-visuel--p3">
          <div className="acc-p3-scene">
            {/* Phone 1: Roger manga card view */}
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

            {/* Phone 3: Simulated Notification Screen */}
            <button
              type="button"
              className={`acc-tel-pos ${gestureStep === 2 ? 'acc-tel-pos--centre' : gestureStep === 0 ? 'acc-tel-pos--gauche' : 'acc-tel-pos--droite'}`}
              onClick={() => setGestureStep(2)}
              data-etape="2"
              data-actif={gestureStep === 2 ? 'oui' : undefined}
              aria-label="Étape 3 : Sois prévenu"
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
                          <img src="/media/icon-512.png" alt="" width="38" height="38" loading="lazy" />
                          <div>
                            <small>
                              <span>SCALPEURS</span><span>maintenant</span>
                            </small>
                            <b>Shanks · 349,00 €</b>
                            <span>▼ 11 € sous ton seuil · carte japonaise, Near Mint</span>
                          </div>
                        </div>
                        <div className="acc-verrou-notif">
                          <img src="/media/icon-512.png" alt="" width="38" height="38" loading="lazy" />
                          <div>
                            <small>
                              <span>SCALPEURS</span><span>il y a 2 h</span>
                            </small>
                            <b>Monkey.D.Luffy · 1 790,00 €</b>
                            <span>▼ 10 € sous ton seuil · carte française</span>
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
                <i>3</i><b>Sois prévenu</b><small>Au prix que tu choisis</small>
              </span>
            </button>
          </div>

          <p className="acc-geste">
            <span>{gestureStep + 1}</span>
            <b>{gestureStep === 0 ? 'Ajoute ta carte' : gestureStep === 1 ? 'Suis sa valeur' : 'Sois prévenu'}</b>
            <small>{gestureStep === 0 ? 'Son prix dans sa langue' : gestureStep === 1 ? 'Au prix du jour' : 'Au prix que tu choisis'}</small>
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

        <div className="acc-ctas acc-ctas--centre acc-gestes-ctas">
          <a className="acc-btn cursor-pointer" href="#cherche">
            Ajoute ta première carte
          </a>
          <button 
            type="button" 
            onClick={() => onNavigateTab('collection')} 
            className="acc-lien cursor-pointer"
          >
            Ouvrir ma collection
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 6 6 6-6 6"></path>
            </svg>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: ALERTES DE PRIX (AVEC NOTIFICATIONS ANIMÉES)                   */}
      {/* ========================================================================= */}
      <section className="acc-section" id="alertes">
        <div className="acc-tuile acc-tuile--large acc-alerte acc-declic">
          <div className="acc-alerte-tete">
            <div className="acc-alerte-marque">
              <span className="acc-cloche" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <g className="acc-cloche-corps">
                    <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6"></path>
                    <path className="acc-cloche-battant" d="M9 17v1a3 3 0 0 0 6 0v-1"></path>
                  </g>
                  <path className="acc-cloche-onde" d="M21 6.727a11.05 11.05 0 0 0 -2.794 -3.727"></path>
                  <path className="acc-cloche-onde" d="M3 6.727a11.05 11.05 0 0 1 2.792 -3.727"></path>
                </svg>
                <i className="acc-cloche-badge">
                  <span>1</span><span>2</span><span>3</span>
                </i>
              </span>
              <p className="acc-sur">Les alertes de prix</p>
            </div>
            <h2 className="acc-h2 acc-alerte-titre">
              Passe devant <em>les autres acheteurs<span className="acc-ponct">.</span></em>
            </h2>
            <p className="acc-alerte-lead">
              Choisis ton prix : dès qu'une offre Cardmarket passe en dessous, ton téléphone sonne. Ne laisse plus filer ta chance.
            </p>
          </div>

          <div className="acc-notifs" aria-label="Exemples de notifications">
            <div className="acc-notif2" style={{ ['--n' as any]: 0 }}>
              <img src="/media/icon-512.png" alt="" width="38" height="38" loading="lazy" />
              <div>
                <small>
                  <span>SCALPEURS</span><span>maintenant</span>
                </small>
                <b>Shanks · 349,00 €</b>
                <span>▼ 11 € sous ton seuil · carte japonaise, Near Mint · objectif atteint</span>
              </div>
            </div>

            <div className="acc-notif2" style={{ ['--n' as any]: 1 }}>
              <img src="/media/icon-512.png" alt="" width="38" height="38" loading="lazy" />
              <div>
                <small>
                  <span>SCALPEURS</span><span>il y a 2 h</span>
                </small>
                <b>Monkey.D.Luffy · 1 790,00 €</b>
                <span>▼ 10 € sous ton seuil · carte française, Near Mint · objectif atteint</span>
              </div>
            </div>

            <div className="acc-notif2" style={{ ['--n' as any]: 2 }}>
              <img src="/media/icon-512.png" alt="" width="38" height="38" loading="lazy" />
              <div>
                <small>
                  <span>SCALPEURS</span><span>hier</span>
                </small>
                <b>3 autres cartes sous ton seuil</b>
                <span>Touche pour les voir</span>
              </div>
            </div>
            <p className="acc-notifs-legende">Exemples de notifications</p>
          </div>

          <div className="acc-alerte-corps">
            <div className="acc-stat">
              <p className="acc-stat-grand">
                <small>jusqu'à</small>
                <b>−79 %</b>
              </p>
              <p className="acc-stat-legende">sous le prix moyen de vente du mois</p>
            </div>

            <div className="acc-ctas">
              <button 
                type="button" 
                onClick={() => onNavigateTab('database')} 
                className="acc-btn cursor-pointer"
              >
                Créer une alerte
              </button>
            </div>

            <p className="acc-note-source">
              Relevé en direct : des dizaines de cartes ont chaque jour une offre Near Mint sous leur moyenne mensuelle.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: BENTO GRID ECOSYSTEM (QUOTAS, CATALOGUE, TOURNOIS, DECKBUILDER) */}
      {/* ========================================================================= */}
      <section className="acc-section acc-section--ciel" id="options">
        <div className="acc-fond-ciel acc-fond-ciel--3" aria-hidden="true">
          <i className="acc-fond-ciel-c acc-fond-ciel-c--loin"></i>
          <i className="acc-fond-ciel-c acc-fond-ciel-c--milieu"></i>
          <i className="acc-fond-ciel-c acc-fond-ciel-c--pres"></i>
        </div>

        <div className="acc-centre">
          <h2 className="acc-h2">
            Tout le reste<span className="acc-ponct">,</span> <em>gratuit<span className="acc-ponct">.</span></em>
          </h2>
        </div>

        <div className="acc-bento">
          {/* Tile 1: Quotas Displays */}
          <div 
            className="acc-tuile acc-tuile--scene acc-tuile--lien acc-opt acc-opt--quotas acc-declic cursor-pointer group"
            onClick={() => onNavigateTab('quotas')}
          >
            <div className="acc-scene acc-scene--quotas" aria-hidden="true">
              <img className="acc-s1" src="/media/accueil/display-op13.webp" alt="" width="320" height="320" loading="lazy" />
              <img className="acc-s2" src="/media/accueil/display-op16.webp" alt="" width="301" height="320" loading="lazy" />
              <img className="acc-s3" src="/media/accueil/display-op14.webp" alt="" width="320" height="320" loading="lazy" />
              <span className="acc-scene-puce">SEC · SP · Manga</span>
              <span className="acc-scene-eclat"></span>
            </div>
            <h3>Les quotas des displays</h3>
            <p className="acc-opt-chiffre">SEC · SP · Manga</p>
            <p>Combien de SEC, de SP et de Manga par display, avant de l'acheter (estimations et statistiques vérifiées).</p>
            <div className="acc-ctas">
              <span className="acc-lien">
                Voir les quotas
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 6 6 6-6 6"></path>
                </svg>
              </span>
            </div>
          </div>

          {/* Tile 2: Complete Catalog */}
          <div 
            className="acc-tuile acc-tuile--scene acc-tuile--lien acc-opt acc-opt--collections acc-declic cursor-pointer group"
            onClick={() => onNavigateTab('database')}
          >
            <div className="acc-scene acc-scene--collections" aria-hidden="true">
              <img className="acc-k acc-k1" src="/media/cartes/op05-p147-luffy.webp" alt="" width="240" height="336" loading="lazy" />
              <img className="acc-k acc-k2" src="/media/cartes/op06-p142-zoro.webp" alt="" width="240" height="336" loading="lazy" />
              <img className="acc-k acc-k3" src="/media/cartes/op13-p160-sabo.webp" alt="" width="240" height="336" loading="lazy" />
              <img className="acc-k acc-k4" src="/media/cartes/op09-p009-shanks.webp" alt="" width="240" height="336" loading="lazy" />
              <img className="acc-k acc-k5" src="/media/cartes/op09-p148-jp.webp" alt="" width="240" height="336" loading="lazy" />
              <span className="acc-scene-puce">{allCards.length.toLocaleString('fr-FR')} cartes</span>
            </div>
            <h3>Toutes les collections, triées</h3>
            <p className="acc-opt-chiffre">{allCards.length.toLocaleString('fr-FR')} cartes</p>
            <p>Extensions, promos, Championship, decks : en japonais, français et anglais avec scans haute définition.</p>
            <div className="acc-ctas">
              <span className="acc-lien">
                Voir le catalogue
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 6 6 6-6 6"></path>
                </svg>
              </span>
            </div>
          </div>

          {/* Tile 3: Méta & Tournois */}
          <div 
            className="acc-tuile acc-tuile--scene acc-tuile--lien acc-opt acc-opt--forum acc-declic cursor-pointer group"
            onClick={() => onNavigateTab('meta')}
          >
            <div className="acc-scene acc-scene--forum" aria-hidden="true">
              <span className="acc-f-cadre">
                <img className="acc-f1" src="/media/accueil/forum-une.webp" alt="" width="480" height="320" loading="lazy" />
              </span>
            </div>
            <h3>Méta Decks & Tournois</h3>
            <p>Tier lists en temps réel, analyses des tournois mondiaux (10 000+ tournois) et compositions gagnantes.</p>
            <div className="acc-ctas">
              <span className="acc-lien">
                Découvrir la Tier List
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 6 6 6-6 6"></path>
                </svg>
              </span>
            </div>
          </div>

          {/* Tile 4: Deckbuilder Compétitif */}
          <div 
            className="acc-tuile acc-tuile--scene acc-tuile--lien acc-opt acc-opt--jeux acc-declic cursor-pointer group"
            onClick={() => onNavigateTab('deckbuilder')}
          >
            <div className="acc-scene acc-scene--jeux" aria-hidden="true">
              <img className="acc-j1" src="/media/cartes/op05-p147-luffy.webp" alt="" width="219" height="256" loading="lazy" />
              <img className="acc-j2" src="/media/cartes/op09-p009-shanks.webp" alt="" width="219" height="256" loading="lazy" />
              <img className="acc-j3" src="/media/cartes/op06-p142-zoro.webp" alt="" width="219" height="256" loading="lazy" />
              <span className="acc-entaille"></span>
            </div>
            <h3>Deckbuilder Compétitif</h3>
            <p>Construis tes decks, teste tes probabilités de main de départ et exporte au format officiel Bandai & OPTCGSim.</p>
            <div className="acc-podium">
              <div><small>Vérifié</small><b>50 Cartes</b></div>
              <div><small>Leader</small><b>10 DON!!</b></div>
              <div><small>Export</small><b>Simulateur</b></div>
            </div>
            <div className="acc-ctas">
              <span className="acc-lien">
                Lancer le Deckbuilder
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 6 6 6-6 6"></path>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: SIMULATEUR DE BOOSTERS & SAISON                                */}
      {/* ========================================================================= */}
      <section className="acc-section" id="saison">
        <div className="acc-saison acc-declic">
          <div className="acc-saison-tete">
            <span className="acc-etiquette acc-etiquette--orange">Saison 2 · OP‑17 + OP‑09</span>
            <span className="acc-etiquette">Fin de saison · Simulateur Actif</span>
          </div>

          <div className="acc-saison-grille">
            <div>
              <p className="acc-virtuel">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="6" y="2.5" width="12" height="19" rx="2.5"></rect>
                  <path d="M10 18.5h4"></path>
                </svg>
                Boosters 100 % virtuels · 0 € à payer
              </p>
              <h2 className="acc-h2">
                Des boosters <span className="acc-mot-virtuel">virtuels</span>, gratuits<span className="acc-ponct">.</span> <em>De vraies cartes à gagner<span className="acc-ponct">.</span></em>
              </h2>
              <p className="acc-p">
                Tu ouvres des boosters virtuels sur le site, avec des Berrys offerts (2 000 ฿ pour commencer). Les lots du classement, eux, sont de vraies cartes, remises aux gagnants.
              </p>
              <ol className="acc-etapes">
                <li>
                  <b>1 500 ฿ offerts chaque jour</b>
                  même les jours où tu ne viens pas : ils t'attendent à ton retour.
                </li>
                <li>
                  <b>Un booster virtuel coûte 300 ฿</b>
                  en OP-17 et OP-09, ouvert directement à l'écran.
                </li>
                <li>
                  <b>Chaque nouvelle carte compte</b>
                  Une carte que tu n'avais pas encore te fait monter au classement.
                </li>
                <li>
                  <b>À la fin de la saison</b>
                  les 10 premiers du classement gagnent leur lot.
                </li>
              </ol>
              <div className="acc-ctas">
                <button 
                  type="button" 
                  onClick={() => onNavigateTab('collection')} 
                  className="acc-btn cursor-pointer"
                >
                  Ouvrir mon premier booster
                </button>
                <button 
                  type="button" 
                  onClick={() => onNavigateTab('database')} 
                  className="acc-lien cursor-pointer"
                >
                  Voir les taux de drop
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 6 6 6-6 6"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <div className="acc-lot-visuel" aria-hidden="true">
                <img className="acc-lot-b1" src="/media/booster-op09.webp" alt="" width="343" height="571" loading="lazy" />
                <img className="acc-lot-b2" src="/media/booster-op17.webp" alt="" width="343" height="571" loading="lazy" />
                <img className="acc-lot-carte" src="/ui/lot-manga.webp" alt="" width="240" height="344" loading="lazy" />
                <span className="acc-tampon">Vraie carte à gagner</span>
                <span className="acc-lot-etiquette acc-lot-etiquette--virtuel">Boosters virtuels</span>
              </div>
              <p className="acc-lots-titre">Les 10 lots de la saison</p>
              <ul className="acc-lots">
                <li><span className="acc-place">1ʳᵉ</span><span>Une carte Manga japonaise</span></li>
                <li><span className="acc-place">2ᵉ</span><span>Une carte SP Gold OP-17</span></li>
                <li><span className="acc-place">3ᵉ à 5ᵉ</span><span>Une carte SP</span></li>
                <li><span className="acc-place">6ᵉ à 9ᵉ</span><span>Une carte ALT</span></li>
                <li><span className="acc-place">10ᵉ</span><span>Une carte Panda OP-17</span></li>
              </ul>
              <p className="acc-saison-preuve">Saison 1 : une Display OP-17 scellée, remise au vainqueur.</p>
            </div>
          </div>
          <p className="acc-legal">
            Jeu gratuit, sans obligation d'achat. Les Berrys n'ont aucune valeur en argent.
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 8: FAQ ACCORDÉON INTERACTIF                                       */}
      {/* ========================================================================= */}
      <section className="acc-section acc-section--ciel" aria-labelledby="acc-faq-titre">
        <div className="acc-fond-ciel acc-fond-ciel--4" aria-hidden="true">
          <i className="acc-fond-ciel-c acc-fond-ciel-c--loin"></i>
          <i className="acc-fond-ciel-c acc-fond-ciel-c--milieu"></i>
          <i className="acc-fond-ciel-c acc-fond-ciel-c--pres"></i>
        </div>

        <div className="acc-centre">
          <h2 className="acc-h2" id="acc-faq-titre">
            Tu te demandes <em>peut‑être<span className="acc-ponct">…</span></em>
          </h2>
        </div>

        <div className="acc-faq">
          <details>
            <summary>
              C'est vraiment gratuit, où est le piège ?
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
            </summary>
            <p>
              Il n'y en a pas : tout le site est gratuit, sans carte bancaire et sans abonnement. Rien ne s'achète, pas même les Berrys : ils sont offerts chaque jour et n'ont aucune valeur en argent.
            </p>
          </details>

          <details>
            <summary>
              D'où viennent les prix ?
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
            </summary>
            <p>
              De Cardmarket : la carte la moins chère en Near Mint, dans la langue de ta carte. Toutes les cartes à 1 € ou plus sont relues chaque jour. Les fiches anglaises ajoutent TCGplayer, les japonaises Yuyu-tei, et les fiches renvoient aussi vers PriceCharting (historique des ventes) et eBay.
            </p>
          </details>

          <details>
            <summary>
              Pourquoi pas juste Cardmarket ?
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
            </summary>
            <p>
              Cardmarket te montre le prix d'une carte, une à la fois. Ici, tu vois la valeur de toute ta collection, dans la langue de chaque carte, son évolution jour après jour, et tu es prévenu quand un prix t'intéresse.
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
              Non. Tout marche dans ton navigateur, sur téléphone comme sur ordinateur. Pour recevoir les alertes sur iPhone, ajoute le site à ton écran d'accueil (bouton Partager, puis « Sur l'écran d'accueil »).
            </p>
          </details>

          <details>
            <summary>
              Les lots sont-ils vrais ?
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
            </summary>
            <p>
              Oui : 10 vraies cartes pour les 10 premiers du classement en fin de saison. Le lot de la saison 1, une Display OP-17 scellée, a été remis à son vainqueur.
            </p>
          </details>

          <details>
            <summary>
              Pourquoi « scalpeurs » ?
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
            </summary>
            <p>
              Le scalpeur, c'est celui qui sait ce que vaut une carte. Ici, ce savoir est à toi, gratuitement : on ne vend aucune carte, on te montre leur prix.
            </p>
          </details>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 9: CALL TO ACTION FINAL AVEC ÉVENTAIL DE CARTES HOLOGRAPHIQUES    */}
      {/* ========================================================================= */}
      <section className="acc-final">
        <div className="acc-eventail acc-declic" aria-hidden="true">
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

        <h2 className="acc-h2">
          Sache enfin ce que vaut <em>ta collection<span className="acc-ponct">.</span></em>
        </h2>

        <p className="acc-p">
          Gratuit, sans carte bancaire, sans rien installer. Ta première carte s'ajoute sans compte.
        </p>

        <ul className="acc-pastilles acc-gratuit" aria-label="Tout ce qui est gratuit">
          <li>Prix du jour en 3 langues</li>
          <li>Valeur de ta collection</li>
          <li>Alertes de prix</li>
          <li>Quotas des displays</li>
          <li>Tier List & Méta</li>
          <li>Deckbuilder</li>
          <li>Boosters virtuels</li>
        </ul>

        <div className="acc-ctas acc-ctas--centre">
          <a className="acc-btn cursor-pointer" href="#cherche">
            Ajoute ta première carte
          </a>
          <button 
            type="button" 
            onClick={() => onNavigateTab('collection')} 
            className="acc-lien cursor-pointer"
          >
            Ouvrir ma collection
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 6 6 6-6 6"></path>
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
};
