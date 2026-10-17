import React, { useState, useMemo, useRef, useEffect } from 'react';
import '../styles/scalpeurs-home.css';
import { Card } from '../types';
import { allCards } from '../data/dataProvider';
import { ActiveTab } from '../components/Navbar';
import { getCardImageUrl } from '../utils/cardUtils';
import { 
  Camera, 
  FolderHeart, 
  Search, 
  Boxes, 
  Trophy, 
  Layers,
  ChevronRight,
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
    <div className="acc-racine">
      {/* ========================================================================= */}
      {/* SECTION 1: HERO - CIEL ÉTOILÉ AVEC CARTES FLOTTANTES AUTOUR DU TEXTE     */}
      {/* ========================================================================= */}
      <section className="acc-hero acc-hero--ciel">
        {/* Galaxy starfield background */}
        <div className="acc-galaxie" aria-hidden="true">
          <i className="acc-galaxie-c acc-galaxie-c--loin"></i>
          <i className="acc-galaxie-c acc-galaxie-c--milieu"></i>
          <i className="acc-galaxie-c acc-galaxie-c--pres"></i>
          <i className="acc-galaxie-filante"></i>
        </div>

        <div className="acc-wrap acc-hero-grille">
          {/* Ciel & Floating Animated Cards across the whole hero */}
          <div className="acc-ciel">
            <div className="acc-ciel-fond" aria-hidden="true">
              <i className="acc-etoiles acc-etoiles--loin"></i>
              <i className="acc-etoiles acc-etoiles--milieu"></i>
              <i className="acc-etoiles acc-etoiles--pres"></i>
              <i className="acc-filante"></i>
            </div>

            <div className="acc-ciel-scene">
              {/* Card 1 - Background distant top left */}
              <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--loin" style={{ ['--x' as any]: '9%', ['--y' as any]: '17%', ['--w' as any]: 13, ['--r' as any]: '-14deg', ['--d' as any]: 0.12, ['--dl' as any]: '-1s', ['--i' as any]: 10, ['--xp' as any]: '4.5%', ['--yp' as any]: '16%', ['--wp' as any]: 6.2, ['--rp' as any]: '-14deg' }}>
                <span className="acc-ciel-envol">
                  <span className="acc-ciel-flotte">
                    <img src="/media/cartes/op06-p142-zoro.webp" alt="" width="44" height="61" decoding="async" />
                  </span>
                </span>
              </span>

              {/* Card 2 - Distant top right */}
              <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--loin" style={{ ['--x' as any]: '91%', ['--y' as any]: '12%', ['--w' as any]: 12, ['--r' as any]: '12deg', ['--d' as any]: 0.12, ['--dl' as any]: '-3s', ['--i' as any]: 9, ['--xp' as any]: '95.5%', ['--yp' as any]: '14%', ['--wp' as any]: 6.2, ['--rp' as any]: '12deg' }}>
                <span className="acc-ciel-envol">
                  <span className="acc-ciel-flotte">
                    <img src="/media/cartes/op13-p160-sabo.webp" alt="" width="44" height="61" decoding="async" />
                  </span>
                </span>
              </span>

              {/* Card 3 - Distant bottom right */}
              <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--loin" style={{ ['--x' as any]: '78%', ['--y' as any]: '90%', ['--w' as any]: 12, ['--r' as any]: '16deg', ['--d' as any]: 0.16, ['--dl' as any]: '-5s', ['--i' as any]: 8, ['--xp' as any]: '5%', ['--yp' as any]: '86%', ['--wp' as any]: 6.2, ['--rp' as any]: '12deg' }}>
                <span className="acc-ciel-envol">
                  <span className="acc-ciel-flotte">
                    <img src="/media/cartes/op13-p160-sabo.webp" alt="" width="44" height="61" decoding="async" />
                  </span>
                </span>
              </span>

              {/* Card 4 - Distant top middle */}
              <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--loin" style={{ ['--x' as any]: '33%', ['--y' as any]: '7%', ['--w' as any]: 10, ['--r' as any]: '8deg', ['--d' as any]: 0.1, ['--dl' as any]: '-2s', ['--i' as any]: 7, ['--xp' as any]: '66%', ['--yp' as any]: '6%', ['--wp' as any]: 5, ['--rp' as any]: '8deg' }}>
                <span className="acc-ciel-envol">
                  <span className="acc-ciel-flotte">
                    <img src="/media/cartes/op06-p142-zoro.webp" alt="" width="44" height="61" decoding="async" />
                  </span>
                </span>
              </span>

              {/* Card 5 - Distant mid right */}
              <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--loin" style={{ ['--x' as any]: '96%', ['--y' as any]: '56%', ['--w' as any]: 11, ['--r' as any]: '-10deg', ['--d' as any]: 0.14, ['--dl' as any]: '-4s', ['--i' as any]: 6, ['--xp' as any]: '96%', ['--yp' as any]: '85%', ['--wp' as any]: 6.2, ['--rp' as any]: '-10deg' }}>
                <span className="acc-ciel-envol">
                  <span className="acc-ciel-flotte">
                    <img src="/media/cartes/op09-p009-shanks.webp" alt="" width="44" height="61" decoding="async" />
                  </span>
                </span>
              </span>

              {/* Card 6 - Mid Left */}
              <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--large" style={{ ['--x' as any]: '13%', ['--y' as any]: '68%', ['--w' as any]: 19, ['--r' as any]: '-9deg', ['--d' as any]: 0.45, ['--dl' as any]: '-2.5s', ['--i' as any]: 5, ['--xp' as any]: '17.5%', ['--yp' as any]: '11.5%', ['--wp' as any]: 8.6, ['--rp' as any]: '-7deg' }}>
                <span className="acc-ciel-envol">
                  <span className="acc-ciel-flotte">
                    <img src="/media/cartes/op13-p160-sabo.webp" alt="" width="280" height="391" decoding="async" />
                  </span>
                </span>
              </span>

              {/* Card 7 - Mid Right */}
              <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--large" style={{ ['--x' as any]: '85%', ['--y' as any]: '34%', ['--w' as any]: 19, ['--r' as any]: '11deg', ['--d' as any]: 0.5, ['--dl' as any]: '-1.5s', ['--i' as any]: 4, ['--xp' as any]: '81.5%', ['--yp' as any]: '11.5%', ['--wp' as any]: 8.6, ['--rp' as any]: '9deg' }}>
                <span className="acc-ciel-envol">
                  <span className="acc-ciel-flotte">
                    <img src="/media/cartes/op06-p142-zoro.webp" alt="" width="280" height="391" decoding="async" />
                  </span>
                </span>
              </span>

              {/* Card 8 - Zoro bottom left */}
              <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--large" style={{ ['--x' as any]: '63%', ['--y' as any]: '9%', ['--w' as any]: 16, ['--r' as any]: '6deg', ['--d' as any]: 0.4, ['--dl' as any]: '-4.5s', ['--i' as any]: 3, ['--xp' as any]: '19.5%', ['--yp' as any]: '85%', ['--wp' as any]: 8.2, ['--rp' as any]: '-8deg' }}>
                <span className="acc-ciel-envol">
                  <span className="acc-ciel-flotte">
                    <img src="/media/cartes/op06-p142-zoro.webp" alt="" width="280" height="391" decoding="async" />
                  </span>
                </span>
              </span>

              {/* Card 9 - Foreground Left: Monkey.D.Luffy Manga OP05 avec prix */}
              <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--pres" style={{ ['--x' as any]: '27%', ['--y' as any]: '40%', ['--w' as any]: 27, ['--r' as any]: '-12deg', ['--d' as any]: 0.78, ['--dl' as any]: '-3.5s', ['--i' as any]: 2, ['--xp' as any]: '10%', ['--yp' as any]: '43%', ['--wp' as any]: 12.6, ['--rp' as any]: '-9deg' }}>
                <span className="acc-ciel-envol">
                  <span className="acc-ciel-flotte">
                    <span className="acc-holo">
                      <span className="acc-holo-in">
                        <img src="/media/cartes/op05-p147-luffy.webp" alt="Monkey D. Luffy" width="420" height="587" decoding="async" />
                        <span className="acc-holo-reflet" aria-hidden="true"></span>
                        <span className="acc-holo-irise" aria-hidden="true"></span>
                      </span>
                    </span>
                  </span>
                </span>
                <span className="acc-ciel-prix">
                  <small>Monkey.D.Luffy</small>
                  <b><img className="acc-drapeau" src="/media/flag-jp.png" alt="" /> 4 750 €</b>
                </span>
              </span>

              {/* Card 10 - Foreground Bottom Right: Shanks Manga OP09 avec prix */}
              <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--pres acc-ciel-carte--large" style={{ ['--x' as any]: '74%', ['--y' as any]: '64%', ['--w' as any]: 27, ['--r' as any]: '10deg', ['--d' as any]: 0.82, ['--dl' as any]: '-0.5s', ['--i' as any]: 1, ['--xp' as any]: '79%', ['--yp' as any]: '83%', ['--wp' as any]: 9.8, ['--rp' as any]: '10deg' }}>
                <span className="acc-ciel-envol">
                  <span className="acc-ciel-flotte">
                    <span className="acc-holo">
                      <span className="acc-holo-in">
                        <img src="/media/cartes/op09-p009-shanks.webp" alt="Shanks Manga" width="420" height="587" decoding="async" />
                        <span className="acc-holo-reflet" aria-hidden="true"></span>
                        <span className="acc-holo-irise" aria-hidden="true"></span>
                      </span>
                    </span>
                  </span>
                </span>
                <span className="acc-ciel-prix">
                  <small>Shanks · Manga</small>
                  <b><img className="acc-drapeau" src="/media/flag-jp.png" alt="" /> 800 €</b>
                </span>
              </span>

              {/* Card 11 - Foreground Right Center: Gol D. Roger Manga OP09-148 avec prix */}
              <span aria-hidden="true" className="acc-ciel-carte acc-ciel-carte--pres" style={{ ['--x' as any]: '50%', ['--y' as any]: '47%', ['--w' as any]: 35, ['--r' as any]: '-3deg', ['--d' as any]: 1, ['--dl' as any]: '0s', ['--i' as any]: 0, ['--xp' as any]: '89.5%', ['--yp' as any]: '41%', ['--wp' as any]: 13.6, ['--rp' as any]: '7deg' }}>
                <span className="acc-ciel-envol">
                  <span className="acc-ciel-flotte">
                    <span className="acc-holo">
                      <span className="acc-holo-in">
                        <img src="/media/cartes/op09-p148-jp.webp" alt="Gol.D.Roger Manga" width="420" height="587" decoding="async" />
                        <span className="acc-holo-reflet" aria-hidden="true"></span>
                        <span className="acc-holo-irise" aria-hidden="true"></span>
                      </span>
                    </span>
                  </span>
                </span>
                <span className="acc-ciel-prix">
                  <small>Gol.D.Roger · Manga</small>
                  <b><img className="acc-drapeau" src="/media/flag-jp.png" alt="" /> 4 500 €</b>
                </span>
              </span>
            </div>
          </div>

          {/* Centered Hero Text & Search Box */}
          <div className="acc-hero-texte">
            <a className="acc-sur acc-sur--lien" href="#mouvements">
              <span className="acc-point" aria-hidden="true"></span>
              <span>Prix relus le 17 octobre</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9 6 6 6-6 6"></path>
              </svg>
            </a>

            <h1 className="acc-h1">
              Combien vaut <em>vraiment</em><br />ta collection One Piece ?
            </h1>

            <p className="acc-lead">
              Le site qui réunit toutes les cartes One Piece, en japonais, français et anglais : <b>17 600</b> cartes. Ajoute les tiennes, on calcule ta collection.
            </p>

            {/* Interactive Search Input Form */}
            <div ref={searchContainerRef} className="relative w-full max-w-xl mx-auto mt-6">
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
                      placeholder="Nom ou code : Roger, OP09-118..."
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

                {/* Radio language switcher */}
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
            <ul className="acc-confiance">
              <li>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                Gratuit, sans carte bancaire
              </li>
              <li>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                Rien à installer
              </li>
              <li>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                Sans compte pour commencer
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: STATS BANNER (« AUTANT DE VERSIONS, AUTANT DE PRIX »)          */}
      {/* ========================================================================= */}
      <div className="acc-wrap">
        <div className="acc-preuves-bloc">
          <div className="acc-preuves-tete">
            <h2 className="acc-h2 acc-h2--compact">Autant de versions, autant de prix.</h2>
            <p className="acc-p">
              Chaque version a son prix : l'offre Near Mint la moins chère sur Cardmarket, dans sa langue. Jamais une moyenne.
            </p>
          </div>
          <ul className="acc-preuves">
            <li>
              <div className="acc-preuve-illu">
                <img src="/media/cartes/op05-p147-luffy.webp" style={{ width: '28px', height: '38px', borderRadius: '3px', transform: 'rotate(-10deg)', marginRight: '-10px' }} alt="" />
                <img src="/media/cartes/op09-p148-jp.webp" style={{ width: '30px', height: '42px', borderRadius: '3px', zIndex: 2 }} alt="" />
                <img src="/media/cartes/op09-p009-shanks.webp" style={{ width: '28px', height: '38px', borderRadius: '3px', transform: 'rotate(10deg)', marginLeft: '-10px' }} alt="" />
              </div>
              <b>17 600</b>
              <span>cartes suivies, chacune dans sa langue</span>
            </li>
            <li>
              <div className="acc-preuve-illu">
                <img src="/images/sealed/op-05-display.jpg" style={{ width: '36px', height: '36px', borderRadius: '4px', transform: 'rotate(-8deg)', marginRight: '-8px', objectFit: 'cover' }} alt="" />
                <img src="/images/sealed/op-09-display.jpg" style={{ width: '40px', height: '40px', borderRadius: '4px', zIndex: 2, objectFit: 'cover' }} alt="" />
              </div>
              <b>324</b>
              <span>collections : extensions, promos, Championship</span>
            </li>
            <li>
              <div className="acc-preuve-illu acc-preuve-illu--courbe">
                <svg viewBox="0 0 116 44" fill="none">
                  <path d="M4 36 C 30 36, 50 20, 80 18 C 95 16, 105 8, 112 4" stroke="#34c759" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="112" cy="4" r="4" fill="#34c759" />
                </svg>
              </div>
              <b>16 739</b>
              <span>cartes avec leur prix Cardmarket</span>
            </li>
            <li>
              <div className="acc-preuve-illu acc-preuve-illu--forum">
                <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9 text-amber-400">
                  <path d="M12 28L8 32V12C8 9.8 9.8 8 12 8H28C30.2 8 32 9.8 32 12V24C32 26.2 30.2 28 28 28H12Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 18H24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="14" cy="18" r="1" fill="currentColor"/>
                  <circle cx="20" cy="18" r="1" fill="currentColor"/>
                  <circle cx="26" cy="18" r="1" fill="currentColor"/>
                </svg>
              </div>
              <b>18 522</b>
              <span>messages sur le forum des passionnés</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: MARKET MOVERS (HAUSSES ET BAISSES RELEVÉES DU JOUR)           */}
      {/* ========================================================================= */}
      <section className="acc-section acc-section--ciel acc-mv-section" id="mouvements" aria-labelledby="acc-mv-titre">
        <div className="acc-fond-ciel acc-fond-ciel--1" aria-hidden="true">
          <i className="acc-fond-ciel-c acc-fond-ciel-c--loin"></i>
          <i className="acc-fond-ciel-c acc-fond-ciel-c--milieu"></i>
          <i className="acc-fond-ciel-c acc-fond-ciel-c--pres"></i>
        </div>

        <div className="acc-wrap">
          <div className="acc-mv-tete">
            <p className="acc-direct">
              <span className="acc-point" aria-hidden="true"></span>
              Relevé du samedi 17 octobre
            </p>
            <h2 className="acc-h2" id="acc-mv-titre">
              Depuis hier,<br /><em>ces cartes ont bougé.</em>
            </h2>
            <p className="acc-p">
              Comparé au relevé du 16 octobre. Une carte peut prendre ou perdre des centaines d'euros en une nuit : ici, tu le vois.
            </p>
          </div>

          <div className="acc-mv">
            {/* Left Column: Plus fortes baisses */}
            <div className="acc-mv-col">
              <h3>
                <span className="acc-mv-ic acc-bas" aria-hidden="true">▼</span>
                Les plus fortes baisses
              </h3>
              <ol>
                <li>
                  <div className="acc-mv-ligne">
                    <img src="/media/cartes/op05-p147-luffy.webp" alt="Lucy" />
                    <div className="acc-mv-txt">
                      <b>Lucy</b>
                      <small>
                        <img className="acc-drapeau" src="/media/flag-fr.png" alt="" />
                        OP15-002
                      </small>
                    </div>
                    <div className="acc-mv-chiffres">
                      <b>30 000 €</b>
                      <span className="acc-mv-delta text-rose-400 font-bold text-xs block">
                        −20 000 € · −40 %
                      </span>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="acc-mv-ligne">
                    <img src="/media/cartes/op05-p147-luffy.webp" alt="Monkey D. Luffy" />
                    <div className="acc-mv-txt">
                      <b>Monkey.D.Luffy</b>
                      <small>
                        <img className="acc-drapeau" src="/media/flag-fr.png" alt="" />
                        OP05-119 · Parallèle
                      </small>
                    </div>
                    <div className="acc-mv-chiffres">
                      <b>10 000 €</b>
                      <span className="acc-mv-delta text-rose-400 font-bold text-xs block">
                        −905 € · −8,3 %
                      </span>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="acc-mv-ligne">
                    <img src="/media/cartes/op06-p142-zoro.webp" alt="Tony Tony.Chopper" />
                    <div className="acc-mv-txt">
                      <b>Tony Tony.Chopper</b>
                      <small>
                        <img className="acc-drapeau" src="/media/flag-jp.png" alt="" />
                        EB01-006 · Manga
                      </small>
                    </div>
                    <div className="acc-mv-chiffres">
                      <b>3 500 €</b>
                      <span className="acc-mv-delta text-rose-400 font-bold text-xs block">
                        −350 € · −9,1 %
                      </span>
                    </div>
                  </div>
                </li>
              </ol>
            </div>

            {/* Right Column: Plus fortes hausses */}
            <div className="acc-mv-col">
              <h3>
                <span className="acc-mv-ic acc-haut" aria-hidden="true">▲</span>
                Les plus fortes hausses
              </h3>
              <ol>
                <li>
                  <div className="acc-mv-ligne">
                    <img src="/media/cartes/op09-p009-shanks.webp" alt="Shirahoshi" />
                    <div className="acc-mv-txt">
                      <b>Shirahoshi</b>
                      <small>
                        <img className="acc-drapeau" src="/media/flag-en.png" alt="" />
                        OP03-116
                      </small>
                    </div>
                    <div className="acc-mv-chiffres">
                      <b>900 €</b>
                      <span className="acc-mv-delta text-emerald-400 font-bold text-xs block">
                        +61 € · +7,3 %
                      </span>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="acc-mv-ligne">
                    <img src="/media/cartes/op13-p160-sabo.webp" alt="Portgas.D.Ace" />
                    <div className="acc-mv-txt">
                      <b>Portgas.D.Ace (Error)</b>
                      <small>
                        <img className="acc-drapeau" src="/media/flag-en.png" alt="" />
                        OP13-119 · Parallèle
                      </small>
                    </div>
                    <div className="acc-mv-chiffres">
                      <b>370 €</b>
                      <span className="acc-mv-delta text-emerald-400 font-bold text-xs block">
                        +45 € · +13,8 %
                      </span>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="acc-mv-ligne">
                    <img src="/media/cartes/op06-p142-zoro.webp" alt="DON!! Card Rosinante" />
                    <div className="acc-mv-txt">
                      <b>DON!! Card Rosinante</b>
                      <small>
                        <img className="acc-drapeau" src="/media/flag-jp.png" alt="" />
                        Parallèle
                      </small>
                    </div>
                    <div className="acc-mv-chiffres">
                      <b>140 €</b>
                      <span className="acc-mv-delta text-emerald-400 font-bold text-xs block">
                        +16 € · +12,9 %
                      </span>
                    </div>
                  </div>
                </li>
              </ol>
            </div>
          </div>

          <p className="acc-note-source">
            Prix Cardmarket : la moins chère en Near Mint, dans la langue de la carte. Seulement les cartes à 20 € et plus, avec au moins 3 offres.
          </p>

          <div className="acc-ctas acc-ctas--centre mt-6">
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
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: TRIO COMPARATIF (MÊME CARTE, 3 LANGUES, 3 PRIX)               */}
      {/* ========================================================================= */}
      <section className="acc-section acc-trio-section" id="langues" aria-labelledby="acc-trio-titre">
        <div className="acc-wrap">
          <div className="acc-trio-grille">
            {/* Left: Heading, Details & Language Catalog Buttons */}
            <div className="acc-trio-texte">
              <p className="acc-sur">Une carte, trois prix</p>
              <h2 className="acc-h2 acc-h2--deux" id="acc-trio-titre">
                Même carte,<br />même illustration.<br /><em>Pas le même prix.</em>
              </h2>
              <p className="acc-p">
                Gol.D.Roger, version manga (OP09-118) : <b>4 500 €</b> en japonais, <b>7 999 €</b> en français, <b>7 999 €</b> en anglais, le 17 octobre. Ta collection est estimée dans la langue de <b>chaque</b> carte, jamais au prix d'une autre.
              </p>

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

            {/* Right: 3 Side-by-side Holographic Roger Cards */}
            <div className="flex flex-col items-center">
              <div className="acc-trio acc-r" aria-label="La même carte en trois langues">
                {/* JP */}
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
                    <b>4 500 €</b>
                  </span>
                </div>

                {/* FR */}
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
                    <b>7 999 €</b>
                  </span>
                </div>

                {/* EN */}
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
                    <b>7 999 €</b>
                  </span>
                </div>
              </div>

              <p className="acc-legende mt-4 text-slate-400">
                Jusqu'à <strong className="text-white font-bold">x1,8</strong> d'écart, pour la même carte
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: EN 3 GESTES (CARROUSEL 3D INTERACTIF DES 3 SMARTPHONES)        */}
      {/* ========================================================================= */}
      <section className="acc-section acc-section--ciel acc-gestes" id="collection" aria-labelledby="acc-plan-titre">
        <div className="acc-fond-ciel acc-fond-ciel--2" aria-hidden="true">
          <i className="acc-fond-ciel-c acc-fond-ciel-c--loin"></i>
          <i className="acc-fond-ciel-c acc-fond-ciel-c--milieu"></i>
          <i className="acc-fond-ciel-c acc-fond-ciel-c--pres"></i>
        </div>

        <div className="acc-wrap">
          <div className="acc-gestes-tete">
            <h2 className="acc-h2" id="acc-plan-titre">
              Ta collection estimée <em>en 3 gestes.</em>
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

              {/* Phone 3: Lock Screen with Notification Toasts */}
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
                          <small>Samedi 17 octobre</small>
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
                  <i>3</i><b>Organise ton classeur</b><small>Au prix du jour</small>
                </span>
              </button>
            </div>

            <p className="acc-geste">
              <span>{gestureStep + 1}</span>
              <b>{gestureStep === 0 ? 'Ajoute ta carte' : gestureStep === 1 ? 'Suis sa valeur' : 'Organise ton classeur'}</b>
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
            <button 
              type="button" 
              onClick={handleAddCardClick} 
              className="acc-btn cursor-pointer"
            >
              Ajouter une carte (Scanner IA)
            </button>
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
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: BENTO GRID - TOUT LE RESTE, GRATUIT                           */}
      {/* ========================================================================= */}
      <section className="acc-section acc-section--ciel" id="options">
        <div className="acc-fond-ciel acc-fond-ciel--3" aria-hidden="true">
          <i className="acc-fond-ciel-c acc-fond-ciel-c--loin"></i>
          <i className="acc-fond-ciel-c acc-fond-ciel-c--milieu"></i>
          <i className="acc-fond-ciel-c acc-fond-ciel-c--pres"></i>
        </div>

        <div className="acc-wrap">
          <div className="acc-centre">
            <h2 className="acc-h2">
              Tout le reste<span className="acc-ponct">,</span> <em>gratuit<span className="acc-ponct">.</span></em>
            </h2>
          </div>

          <div className="acc-bento">
            {/* Tile 1: Quotas des Displays avec VRAIES photos de displays */}
            <div 
              className="acc-tuile acc-tuile--scene acc-tuile--lien acc-opt acc-opt--quotas acc-declic cursor-pointer"
              onClick={() => onNavigateTab('quotas')}
            >
              <div className="acc-scene acc-scene--quotas" aria-hidden="true">
                <img className="acc-s1" src="/images/sealed/op-05-display.jpg" alt="Display OP-05" style={{ objectFit: 'contain' }} />
                <img className="acc-s2" src="/images/sealed/op-09-display.jpg" alt="Display OP-09" style={{ objectFit: 'contain' }} />
                <img className="acc-s3" src="/images/sealed/op-13-display.jpg" alt="Display OP-13" style={{ objectFit: 'contain' }} />
                <span className="acc-scene-puce">SEC · SP · Manga</span>
                <span className="acc-scene-eclat"></span>
              </div>
              <h3>Les quotas des displays</h3>
              <p className="acc-opt-chiffre">SEC · SP · Manga</p>
              <p>Combien de SEC, de SP et de Manga par display avant d'acheter vos boîtes scellées. Estimations vérifiées.</p>
              <div className="acc-ctas">
                <span className="acc-lien">
                  Voir les quotas
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 6 6 6-6 6"></path>
                  </svg>
                </span>
              </div>
            </div>

            {/* Tile 2: Toutes les collections avec de VRAIES cartes */}
            <div 
              className="acc-tuile acc-tuile--scene acc-tuile--lien acc-opt acc-opt--collections acc-declic cursor-pointer"
              onClick={() => onNavigateTab('database')}
            >
              <div className="acc-scene acc-scene--collections" aria-hidden="true">
                <img className="acc-k acc-k1" src="/media/cartes/op06-p142-zoro.webp" alt="Zoro" />
                <img className="acc-k acc-k2" src="/media/cartes/op05-p147-luffy.webp" alt="Luffy" />
                <img className="acc-k acc-k3" src="/media/cartes/op09-p148-jp.webp" alt="Roger" />
                <img className="acc-k acc-k4" src="/media/cartes/op09-p009-shanks.webp" alt="Shanks" />
                <img className="acc-k acc-k5" src="/media/cartes/op13-p160-sabo.webp" alt="Sabo" />
                <span className="acc-scene-puce">17 600 cartes</span>
              </div>
              <h3>Toutes les collections, triées</h3>
              <p className="acc-opt-chiffre">17 600 cartes</p>
              <p>Extensions OP01 à OP17, promos, Championship, decks : en japonais, français et anglais avec scans haute résolution.</p>
              <div className="acc-ctas">
                <span className="acc-lien">
                  Voir le catalogue
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 6 6 6-6 6"></path>
                  </svg>
                </span>
              </div>
            </div>

            {/* Tile 3: Méta Decks & Tournois Mondiaux */}
            <div 
              className="acc-tuile acc-tuile--scene acc-tuile--lien acc-opt acc-opt--forum acc-declic cursor-pointer"
              onClick={() => onNavigateTab('meta')}
            >
              <div className="acc-scene acc-scene--forum" aria-hidden="true">
                <span className="acc-f-cadre">
                  <img className="acc-f1" src="/media/accueil/forum-une.webp" alt="Méta & Tournois" />
                </span>
              </div>
              <h3>Méta Decks & Tier List</h3>
              <p>Analyses en direct des meilleurs decks de tournois compétitifs (10 000+ tournois) et compositions gagnantes.</p>
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
              className="acc-tuile acc-tuile--scene acc-tuile--lien acc-opt acc-opt--jeux acc-declic cursor-pointer"
              onClick={() => onNavigateTab('deckbuilder')}
            >
              <div className="acc-scene acc-scene--jeux" aria-hidden="true">
                <img className="acc-j1" src="/media/cartes/op05-p147-luffy.webp" alt="" />
                <img className="acc-j2" src="/media/cartes/op09-p009-shanks.webp" alt="" />
                <img className="acc-j3" src="/media/cartes/op06-p142-zoro.webp" alt="" />
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
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: FAQ ACCORDÉON INTERACTIF                                       */}
      {/* ========================================================================= */}
      <section className="acc-section acc-section--ciel" aria-labelledby="acc-faq-titre">
        <div className="acc-fond-ciel acc-fond-ciel--4" aria-hidden="true">
          <i className="acc-fond-ciel-c acc-fond-ciel-c--loin"></i>
          <i className="acc-fond-ciel-c acc-fond-ciel-c--milieu"></i>
          <i className="acc-fond-ciel-c acc-fond-ciel-c--pres"></i>
        </div>

        <div className="acc-wrap">
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
                Il n'y en a pas : tout le site est gratuit, sans carte bancaire et sans abonnement. Rien ne s'achète : tout est accessible librement à l'ensemble des joueurs et collectionneurs.
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
                De Cardmarket : la carte la moins chère en Near Mint, dans la langue de ta carte. Toutes les cartes à 1 € ou plus sont relues chaque jour. Les fiches anglaises ajoutent TCGplayer, les japonaises Yuyu-tei, et les fiches renvoient aussi vers PriceCharting et eBay.
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
                Cardmarket te montre le prix d'une carte, une à la fois. Ici, tu vois la valeur de toute ta collection, dans la langue de chaque carte, son évolution jour après jour, avec deckbuilder et quotas de displays intégrés.
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
                Non. Tout marche dans ton navigateur, sur téléphone comme sur ordinateur. Pour l'avoir à portée de main sur mobile, ajoute le site à ton écran d'accueil (bouton Partager, puis « Sur l'écran d'accueil »).
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
                OPTCG Master réunit en un seul endroit tout le savoir et les outils pour One Piece Card Game : les cotes du jour en direct dans les trois langues, le deckbuilder compétitif, l'encyclopédie HD de toutes les cartes, les probabilités de tirage des boîtes scellées et le scanner par caméra/IA, 100% gratuit et sans publicité intrusive.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 8: CALL TO ACTION FINAL AVEC ÉVENTAIL DE CARTES HOLOGRAPHIQUES    */}
      {/* ========================================================================= */}
      <section className="acc-final">
        <div className="acc-wrap">
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
            <li>Quotas des displays</li>
            <li>Tier List & Méta</li>
            <li>Deckbuilder</li>
            <li>Scanner IA</li>
          </ul>

          <div className="acc-ctas acc-ctas--centre">
            <button 
              type="button" 
              onClick={handleAddCardClick} 
              className="acc-btn cursor-pointer"
            >
              Ajouter une carte (Scanner IA)
            </button>
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
        </div>
      </section>
    </div>
  );
};
