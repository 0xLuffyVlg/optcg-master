import React from 'react';
import SITE_LOGO from '../assets/logoBase64';
import { 
  Flame, 
  Layers, 
  Trophy, 
  TrendingUp, 
  BarChart3, 
  Search, 
  FolderHeart, 
  Boxes, 
  Bookmark, 
  Camera, 
  Zap, 
  Coffee
} from 'lucide-react';
import { useDeck } from '../context/DeckContext';
import { useCollection } from '../context/CollectionContext';
import { useAuth } from '../context/AuthContext';

export type ActiveTab = 'home' | 'meta' | 'deckbuilder' | 'tournaments' | 'matchups' | 'database' | 'collection' | 'quotas' | 'news';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSavedDecks: () => void;
  onOpenImportExport: () => void;
  onOpenScanner: () => void;
  onOpenProfile: () => void;
  onOpenSupport?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSavedDecks,
  onOpenScanner,
  onOpenProfile,
  onOpenSupport
}) => {
  const { savedDecks, validation } = useDeck();
  const { stats } = useCollection();
  const { user, getAvatar } = useAuth();

  const navItems: { 
    id: ActiveTab; 
    label: string; 
    icon: React.ReactNode; 
    badge?: string;
    badgeColor?: string;
  }[] = [
    { 
      id: 'home', 
      label: 'Argus', 
      icon: <TrendingUp className="w-4 h-4 text-amber-400" />, 
      badge: 'Argus',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    { 
      id: 'meta', 
      label: 'Meta Decks', 
      icon: <Flame className="w-4 h-4 text-amber-400" />, 
      badge: 'Tier List',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    { 
      id: 'deckbuilder', 
      label: 'Deckbuilder', 
      icon: <Layers className="w-4 h-4 text-blue-400" /> 
    },
    { 
      id: 'tournaments', 
      label: 'Tournois', 
      icon: <Trophy className="w-4 h-4 text-yellow-400" /> 
    },
    { 
      id: 'collection', 
      label: 'Ma Collection', 
      icon: <FolderHeart className="w-4 h-4 text-pink-400" />, 
      badge: stats.uniqueCardsOwned > 0 ? `${stats.uniqueCardsOwned}` : undefined,
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40'
    },
    { 
      id: 'matchups', 
      label: 'Stats', 
      icon: <BarChart3 className="w-4 h-4 text-purple-400" /> 
    },
    { 
      id: 'database', 
      label: 'Cartes HD', 
      icon: <Search className="w-4 h-4 text-teal-400" /> 
    },
    { 
      id: 'quotas', 
      label: 'Quotas', 
      icon: <Boxes className="w-4 h-4 text-indigo-400" /> 
    },
    { 
      id: 'news', 
      label: 'News & Reveals', 
      icon: <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />, 
      badge: 'OP18',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#070B14]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      
      {/* Golden Lighting Accent Line on Top Viewport */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />

      <div className="max-w-[1800px] mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Main Row: Brand on Left, Quick Actions & Profile on Right */}
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Brand Logo & Title with Live Aura */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-3 cursor-pointer group select-none py-1 flex-shrink-0"
            title="Accueil / Argus OPTCG Master"
          >
            {/* Logo container with ambient glow */}
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-950 p-0.5 border border-amber-500/40 group-hover:border-amber-400 flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:shadow-[0_0_22px_rgba(245,158,11,0.6)] group-hover:scale-105">
              <img
                src="/logo.png"
                alt="Logo OPTCG Master"
                className="w-full h-full object-contain rounded-full"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = SITE_LOGO;
                }}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-base sm:text-lg font-black text-white tracking-wider group-hover:text-amber-400 transition-colors">
                  OPTCG<span className="text-amber-400">.FR</span>
                </span>
                <span className="hidden xl:inline-block px-1.5 py-0.2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-black">
                  LIVE
                </span>
              </div>
              <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">
                Master Database
              </span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            
            {/* Scanner Button (Camera & AI Vision) */}
            <button
              onClick={onOpenScanner}
              type="button"
              className="flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 hover:from-amber-500/25 hover:via-yellow-500/20 hover:to-amber-500/25 border border-amber-400/40 hover:border-amber-400 text-xs font-black text-amber-300 transition-all shadow-[0_0_12px_rgba(245,158,11,0.15)] hover:shadow-[0_0_18px_rgba(245,158,11,0.3)] active:scale-95 cursor-pointer group"
              title="Scanner une carte avec la caméra ou l'IA"
            >
              <Camera className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-200" />
              <span className="hidden sm:inline">Scanner (IA)</span>
            </button>

            {/* Active Deck Quick Pill (Desktop) */}
            <button
              onClick={() => setActiveTab('deckbuilder')}
              type="button"
              className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 text-xs text-slate-300 transition-all shadow-sm active:scale-95 cursor-pointer group"
              title="Aller au Deckbuilder"
            >
              <div className={`w-2.5 h-2.5 rounded-full flex items-center justify-center transition-all ${
                validation.isValid 
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' 
                  : 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
              }`} />
              <span className="font-black text-slate-200 group-hover:text-white">
                {validation.mainDeckCount}/50
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Cartes</span>
            </button>

            {/* Mes Decks Sauvegardés */}
            <button
              onClick={onOpenSavedDecks}
              type="button"
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 text-xs font-bold text-slate-200 transition-all shadow-sm active:scale-95 cursor-pointer group"
              title="Mes Decks Sauvegardés"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">Mes Decks</span>
              <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded-md text-[10px] font-black border border-amber-500/30">
                {savedDecks.length}
              </span>
            </button>

            {/* Bouton Soutenir (PayPal / Ko-fi) */}
            {onOpenSupport && (
              <button
                onClick={onOpenSupport}
                type="button"
                className="hidden sm:flex items-center space-x-1.5 h-7 px-2.5 rounded-lg bg-slate-900/60 hover:bg-amber-500/10 border border-slate-700/60 hover:border-amber-400/40 text-[11px] font-medium text-slate-300 hover:text-amber-300 transition-all active:scale-95 cursor-pointer group"
                title="Soutenir OPTCG Master (Serveur & MAJ méta)"
              >
                <Coffee className="w-3 h-3 text-amber-400/80 group-hover:text-amber-400 transition-colors" />
                <span className="hidden md:inline">Soutenir</span>
              </button>
            )}

            {/* User Pirate Profile Button */}
            <button
              onClick={onOpenProfile}
              type="button"
              className={`flex items-center space-x-2.5 p-1 sm:px-2.5 sm:py-1 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0B0F17] hover:from-slate-800 hover:to-slate-900 border text-xs font-bold transition-all shadow-md group active:scale-95 flex-shrink-0 cursor-pointer ${
                user.isDonor 
                  ? 'border-amber-400 shadow-amber-500/20 ring-1 ring-amber-400/50' 
                  : 'border-slate-700/80 hover:border-amber-400/80'
              }`}
              title="Mon Profil Pirate & Cloud"
            >
              <div className="relative w-8 h-8 rounded-xl overflow-hidden border-2 border-amber-400/90 shadow-[0_0_10px_rgba(245,158,11,0.3)] bg-slate-950 flex-shrink-0">
                <img
                  src={getAvatar().imageUrl}
                  alt={user.pseudo}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = 'https://scalpeurs.com/img/cards-fr/eb02-p083.webp';
                  }}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {user.isDonor && (
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-400 rounded-bl-sm" title="Mécène du projet" />
                )}
              </div>
              <div className="hidden lg:flex flex-col text-left min-w-0 pr-1">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-black text-white truncate max-w-[85px] leading-tight">
                    {user.pseudo}
                  </span>
                  {user.isDonor && <span title="Mécène du projet" className="text-[10px]">⭐</span>}
                </div>
                <span className="text-[9px] text-amber-400 font-bold leading-tight">
                  {user.isDonor ? '⭐ Mécène' : (user.isLoggedIn ? '☁️ Connecté' : 'Profil Pirate')}
                </span>
              </div>
            </button>

          </div>

        </div>

        {/* Desktop Floating Command Dock — 9 Tab Links */}
        <nav className="hidden lg:flex items-center justify-center py-2 border-t border-slate-800/80">
          <div className="flex items-center space-x-1 p-1 rounded-2xl bg-[#05080F]/80 border border-slate-800/90 shadow-inner backdrop-blur-md">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  type="button"
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 relative flex-shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/25 via-amber-400/20 to-yellow-500/20 text-white font-black border border-amber-400/60 shadow-[0_0_16px_rgba(245,158,11,0.25)] scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-transparent'
                  }`}
                >
                  <span className={`transition-transform duration-200 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_currentColor]' : ''}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 text-[9px] font-black rounded-full border tracking-wide uppercase ${
                      isActive 
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm' 
                        : item.badgeColor || 'bg-slate-800 text-amber-300 border-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute -bottom-1 left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

      </div>
    </header>
  );
};
