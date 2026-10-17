import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import SITE_LOGO from './assets/logoBase64';
import { DeckProvider, useDeck } from './context/DeckContext';
import { CollectionProvider } from './context/CollectionContext';
import { SealedProvider } from './context/SealedContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { BottomNavBar } from './components/BottomNavBar';
import { MobileNavDrawer } from './components/MobileNavDrawer';
import { CardDetailModal } from './components/CardDetailModal';
import { DeckDetailModal, DeckDetailViewData } from './components/DeckDetailModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { CardNotFoundModal } from './components/CardNotFoundModal';
import { Card, TradeBinderShareData } from './types';
import { allCards, allVariants } from './data/dataProvider';
import { decodeTradeBinderFromUrl } from './utils/tradeBinderUtils';
import { Analytics } from '@vercel/analytics/react';
import { 
  parseCurrentLocation, 
  navigateToTab, 
  navigateToCard, 
  navigateToDeck, 
  closeModalToRoute, 
  updateDocumentTitle,
  updateRobotsMeta,
  isValidCardCode
} from './utils/router';

// Code-splitting / Lazy loading for maximum performance
const HomeView = lazy(() => import('./views/HomeView').then(m => ({ default: m.HomeView })));
const MetaDecksView = lazy(() => import('./views/MetaDecksView').then(m => ({ default: m.MetaDecksView })));
const DeckbuilderView = lazy(() => import('./views/DeckbuilderView').then(m => ({ default: m.DeckbuilderView })));
const TournamentsView = lazy(() => import('./views/TournamentsView').then(m => ({ default: m.TournamentsView })));
const MatchupsView = lazy(() => import('./views/MatchupsView').then(m => ({ default: m.MatchupsView })));
const DatabaseView = lazy(() => import('./views/DatabaseView').then(m => ({ default: m.DatabaseView })));
const CollectionView = lazy(() => import('./views/CollectionView').then(m => ({ default: m.CollectionView })));
const QuotasView = lazy(() => import('./views/QuotasView').then(m => ({ default: m.QuotasView })));
const NewsRevealsView = lazy(() => import('./views/NewsRevealsView').then(m => ({ default: m.NewsRevealsView })));

const SavedDecksModal = lazy(() => import('./components/SavedDecksModal').then(m => ({ default: m.SavedDecksModal })));
const ImportExportModal = lazy(() => import('./components/ImportExportModal').then(m => ({ default: m.ImportExportModal })));
const CardScannerModal = lazy(() => import('./components/CardScannerModal').then(m => ({ default: m.CardScannerModal })));
const UserProfileModal = lazy(() => import('./components/UserProfileModal').then(m => ({ default: m.UserProfileModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const LegalModal = lazy(() => import('./components/LegalModal').then(m => ({ default: m.LegalModal })));
const SupportModal = lazy(() => import('./components/SupportModal').then(m => ({ default: m.SupportModal })));
import { SupportSection } from './components/SupportSection';

function ViewLoadingFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
      <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-bold text-slate-400 tracking-wider uppercase animate-pulse">
        Chargement OPTCG Master...
      </span>
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [notFoundCardCode, setNotFoundCardCode] = useState<string | null>(null);
  const [selectedDeckDetail, setSelectedDeckDetail] = useState<DeckDetailViewData | null>(null);
  const [isSavedDecksOpen, setIsSavedDecksOpen] = useState<boolean>(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isLegalOpen, setIsLegalOpen] = useState<boolean>(false);
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [legalTab, setLegalTab] = useState<'mentions' | 'privacy' | 'disclaimer'>('mentions');
  const [publicTradeData, setPublicTradeData] = useState<TradeBinderShareData | null>(null);

  const { importDecklist } = useDeck();

  // Handle URL change from Router / Popstate
  useEffect(() => {
    const handleLocationChange = () => {
      const state = parseCurrentLocation();
      setActiveTab(state.tab);

      if (state.cardCode) {
        const cleanCode = state.cardCode.toUpperCase();
        const baseCode = cleanCode.split('_')[0].split('-R')[0];
        
        if (!isValidCardCode(cleanCode)) {
          updateRobotsMeta('noindex, nofollow');
          updateDocumentTitle('database', 'Carte Introuvable (404)');
          setSelectedCard(null);
          setNotFoundCardCode(cleanCode);
          return;
        }

        let found = allCards.find(c => c.card_code.toUpperCase() === cleanCode);
        if (!found) {
          found = allCards.find(c => c.card_code.toUpperCase() === baseCode);
        }

        if (found) {
          updateRobotsMeta('index, follow');
          setNotFoundCardCode(null);
          setSelectedCard(prev => {
            // Only keep previous card if BOTH card_code AND detail_file match.
            // This prevents a promo/alt variant from staying when the user
            // navigates to the base card URL (e.g. /carte/ST01-013).
            const prevDetailFile = (prev as any)?.detail_file;
            const foundDetailFile = (found as any)?.detail_file;
            if (
              prev &&
              (prev.card_code.toUpperCase() === cleanCode || prev.card_code.toUpperCase() === baseCode) &&
              prevDetailFile && foundDetailFile && prevDetailFile === foundDetailFile
            ) {
              return prev;
            }
            if (cleanCode !== found!.card_code.toUpperCase()) {
              const matchingImg = (found!._imagePaths || []).find(img => 
                img.toLowerCase().replace(/\.(webp|png|jpg|jpeg)$/i, '') === cleanCode.toLowerCase()
              ) || `${cleanCode.toLowerCase()}.png`;

              return {
                ...found!,
                _defaultImagePath: matchingImg
              };
            }
            return found!;
          });
          updateDocumentTitle(state.tab, `${found.name} (${found.card_code})`);
        } else {
          // Card code format is valid but does not exist in dataset -> 404 + noindex
          updateRobotsMeta('noindex, nofollow');
          updateDocumentTitle('database', `Carte Introuvable (${cleanCode})`);
          setSelectedCard(null);
          setNotFoundCardCode(cleanCode);
        }
      } else {
        updateRobotsMeta('index, follow');
        setSelectedCard(null);
        setNotFoundCardCode(null);
      }

      if (state.deckId) {
        import('./data/tournamentProvider').then(({ getTournamentById }) => {
          const foundTournament = getTournamentById(state.deckId!);
          if (foundTournament) {
            const topResult = foundTournament.tournament_results && foundTournament.tournament_results[0];
            const leaderCode = topResult ? topResult.deck_type : undefined;
            const leader = leaderCode ? allCards.find(c => c.card_code === leaderCode) || null : null;
            setSelectedDeckDetail({
              name: `${foundTournament.tournament_name}${topResult ? ` - ${topResult.player_name}` : ''}`,
              leader,
              cards: []
            });
            updateDocumentTitle(state.tab, `${foundTournament.tournament_name} — Deck One Piece TCG`);
          }
        });
      } else {
        setSelectedDeckDetail(null);
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Auto-import from URL parameter on initial load if present
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const deckParam = urlParams.get('deck');
      if (deckParam && !deckParam.startsWith('OP') && !deckParam.startsWith('ST')) {
        importDecklist(deckParam, 'Deck Partagé');
        handleTabChange('deckbuilder');
      }
      
      const tradeParam = urlParams.get('trade') || urlParams.get('binder');
      if (tradeParam) {
        const decoded = decodeTradeBinderFromUrl(tradeParam);
        if (decoded && decoded.items && decoded.items.length > 0) {
          setPublicTradeData(decoded);
          setActiveTab('collection');
        }
      }
    } catch (e) {}
  }, []);

  // Automatic Background Sync of OP17 Tournaments from the 2 official pages
  useEffect(() => {
    const autoSyncTournaments = async () => {
      try {
        const lastSync = localStorage.getItem('optcg_op17_last_auto_sync');
        const now = Date.now();
        if (!lastSync || now - parseInt(lastSync, 10) > 20 * 60 * 1000) {
          const res = await fetch('/api/sync-tournaments');
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.tournaments) {
              const { mergeLiveTournaments } = await import('./data/tournamentProvider');
              mergeLiveTournaments(data.tournaments);
              localStorage.setItem('optcg_op17_last_auto_sync', now.toString());
            }
          }
        }
      } catch (e) {
        // Silent background sync
      }
    };
    autoSyncTournaments();
  }, []);

  const handleTabChange = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
    navigateToTab(tab);
  }, []);

  const handleSelectCard = useCallback((card: Card | null) => {
    setSelectedCard(card);
    if (card) {
      // Toujours utiliser le card_code canonique propre (ex: EB01-046), jamais d'URL externe ni de chemin d'image
      const code = card.card_code ? card.card_code.trim().toUpperCase() : 'CARTE';
      navigateToCard(code);
      updateDocumentTitle(activeTab, `${card.name} (${code})`);
    } else {
      closeModalToRoute(activeTab);
    }
  }, [activeTab]);

  const handleSelectDeckDetail = useCallback((deckData: DeckDetailViewData | null) => {
    setSelectedDeckDetail(deckData);
    if (deckData) {
      const slug = (deckData.id || deckData.name || 'deck').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      navigateToDeck(slug);
      updateDocumentTitle(activeTab, `${deckData.name} — Deck One Piece TCG`);
    } else {
      closeModalToRoute(activeTab);
    }
  }, [activeTab]);

  const handleOpenDeckInDeckbuilder = (deckData: DeckDetailViewData) => {
    const optcSimLines: string[] = [];
    if (deckData.leader) optcSimLines.push(`1x${deckData.leader.card_code}`);
    for (const item of deckData.cards) {
      optcSimLines.push(`${item.count}x${item.card.card_code}`);
    }
    importDecklist(optcSimLines.join('\n'), deckData.name);
    handleTabChange('deckbuilder');
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenSavedDecks={() => setIsSavedDecksOpen(true)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
      />

      {/* Main Content Area with Code-Splitting Suspense */}
      <main className={`flex-1 w-full mx-auto pb-24 lg:pb-8 ${activeTab === 'home' ? 'p-0 max-w-none' : 'max-w-[1800px] px-2 sm:px-4 lg:px-6 pt-2 sm:pt-4'}`}>
        <Suspense fallback={<ViewLoadingFallback />}>
          {activeTab === 'home' && (
            <HomeView
              onSelectCard={handleSelectCard}
              onNavigateTab={handleTabChange}
              onOpenScanner={() => setIsScannerOpen(true)}
            />
          )}

          {activeTab === 'meta' && (
            <MetaDecksView
              onSelectCard={handleSelectCard}
              onViewDeckDetail={handleSelectDeckDetail}
              onNavigateToDeckbuilder={() => handleTabChange('deckbuilder')}
            />
          )}

          {activeTab === 'deckbuilder' && (
            <DeckbuilderView
              onSelectCard={handleSelectCard}
              onOpenImportExport={() => setIsImportExportOpen(true)}
            />
          )}

          {activeTab === 'tournaments' && (
            <TournamentsView
              onSelectCard={handleSelectCard}
              onViewDeckDetail={handleSelectDeckDetail}
              onNavigateToDeckbuilder={() => handleTabChange('deckbuilder')}
            />
          )}

          {activeTab === 'collection' && (
            <CollectionView
              onSelectCard={handleSelectCard}
              onOpenScanner={() => setIsScannerOpen(true)}
              initialSubTab={publicTradeData ? 'trades' : 'cards'}
              publicBinderData={publicTradeData}
            />
          )}

          {activeTab === 'matchups' && (
            <MatchupsView
              onSelectCard={handleSelectCard}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseView
              onSelectCard={handleSelectCard}
            />
          )}

          {activeTab === 'quotas' && (
            <QuotasView />
          )}

          {activeTab === 'news' && (
            <NewsRevealsView />
          )}
        </Suspense>
      </main>

      {/* Footer & Disclaimer Légal */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#0F172A] py-8 pb-24 sm:pb-8">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          {/* Bloc Soutien Communautaire (Transparent & 4 Boutons) */}
          <SupportSection variant="footer" showDonorBadgeToggle={true} />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                <img src={SITE_LOGO} alt="OPTCG Master Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5 font-black text-slate-200">
                  <span>OPTCG Master</span>
                  <a 
                    href="https://optcg-master.fr" 
                    className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                  >
                    optcg-master.fr
                  </a>
                </div>
                <p className="text-[11px] text-slate-500">Plateforme Compétitive, Deckbuilder & Collection One Piece TCG</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-[11px] text-slate-400 flex-wrap justify-center">
              <span>{allCards.length} Cartes Référencées</span>
              <span>•</span>
              <span>{allVariants.length}+ Variantes HD</span>
              <span>•</span>
              <span>10 000+ Tournois Compétitifs</span>
            </div>
          </div>

          {/* Legal Disclaimer & Data Sources */}
          <div className="pt-3 border-t border-slate-800/60 text-[10px] text-slate-500 leading-relaxed text-center sm:text-left space-y-2">
            <p className="text-slate-400">
              <strong className="text-slate-300">Avertissement Légal :</strong> OPTCG Master n’est pas affilié à Bandai, Shueisha ou One Piece. Tous les visuels, cartes et marques One Piece restent la propriété exclusive de leurs détenteurs respectifs.
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-slate-400">
              <button
                type="button"
                onClick={() => {
                  setLegalTab('disclaimer');
                  setIsLegalOpen(true);
                }}
                className="hover:text-amber-400 underline transition-colors cursor-pointer"
              >
                Clause de non-affiliation
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  setLegalTab('mentions');
                  setIsLegalOpen(true);
                }}
                className="hover:text-amber-400 underline transition-colors cursor-pointer"
              >
                Mentions légales
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  setLegalTab('privacy');
                  setIsLegalOpen(true);
                }}
                className="hover:text-amber-400 underline transition-colors cursor-pointer"
              >
                Politique de confidentialité (RGPD)
              </button>
              <span>•</span>
              <span>Données : OnePieceTopDecks, Limitless TCG, OPTCGSim & Bandai Card Game</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Global Modals */}
      {selectedCard && (
        <CardDetailModal
          key={`${selectedCard.card_code}-${selectedCard.id || ''}-${(selectedCard as any).detail_file || ''}-${selectedCard._defaultImagePath || ''}`}
          card={selectedCard}
          onClose={() => handleSelectCard(null)}
        />
      )}

      {notFoundCardCode && (
        <CardNotFoundModal
          cardCode={notFoundCardCode}
          onClose={() => {
            setNotFoundCardCode(null);
            closeModalToRoute(activeTab);
          }}
          onNavigateToDatabase={() => {
            setNotFoundCardCode(null);
            handleTabChange('database');
          }}
        />
      )}

      <DeckDetailModal
        deckData={selectedDeckDetail}
        onClose={() => handleSelectDeckDetail(null)}
        onOpenInDeckbuilder={handleOpenDeckInDeckbuilder}
        onSelectCard={handleSelectCard}
      />

      <Suspense fallback={null}>
        {isSavedDecksOpen && (
          <SavedDecksModal
            isOpen={isSavedDecksOpen}
            onClose={() => setIsSavedDecksOpen(false)}
            onNavigateToDeckbuilder={() => handleTabChange('deckbuilder')}
          />
        )}

        {isImportExportOpen && (
          <ImportExportModal
            isOpen={isImportExportOpen}
            onClose={() => setIsImportExportOpen(false)}
          />
        )}

        {isScannerOpen && (
          <CardScannerModal
            isOpen={isScannerOpen}
            onClose={() => setIsScannerOpen(false)}
            onSelectCard={handleSelectCard}
          />
        )}

        {isProfileOpen && (
          <UserProfileModal
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            onNavigateToCollection={() => handleTabChange('collection')}
            onNavigateToDecks={() => handleTabChange('deckbuilder')}
          />
        )}

        {isAuthOpen && (
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
          />
        )}

        {isLegalOpen && (
          <LegalModal
            isOpen={isLegalOpen}
            onClose={() => setIsLegalOpen(false)}
            defaultTab={legalTab}
          />
        )}

        {isSupportOpen && (
          <SupportModal
            isOpen={isSupportOpen}
            onClose={() => setIsSupportOpen(false)}
          />
        )}
      </Suspense>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <BottomNavBar 
        activeTab={activeTab} 
        onSelectTab={handleTabChange} 
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Mobile Navigation Drawer / Menu Sheet */}
      <MobileNavDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSavedDecks={() => setIsSavedDecksOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenLegal={() => {
          setLegalTab('mentions');
          setIsLegalOpen(true);
        }}
      />

      <PWAInstallModal />

      <Analytics />

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <CollectionProvider>
        <SealedProvider>
          <DeckProvider>
            <AppContent />
          </DeckProvider>
        </SealedProvider>
      </CollectionProvider>
    </AuthProvider>
  );
}

export default App;
