import React from 'react';
import { 
  X, 
  Flame, 
  Layers, 
  Trophy, 
  FolderHeart, 
  Search, 
  BarChart3, 
  Boxes, 
  Zap, 
  Camera, 
  Bookmark, 
  Coffee, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  User,
  Sparkles
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { useAuth } from '../context/AuthContext';
import { useDeck } from '../context/DeckContext';
import { useCollection } from '../context/CollectionContext';

export interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenScanner: () => void;
  onOpenProfile: () => void;
  onOpenSavedDecks: () => void;
  onOpenSupport: () => void;
  onOpenLegal: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onOpenScanner,
  onOpenProfile,
  onOpenSavedDecks,
  onOpenSupport,
  onOpenLegal
}) => {
  const { user, getAvatar } = useAuth();
  const { savedDecks, validation } = useDeck();
  const { stats } = useCollection();

  if (!isOpen) return null;

  const mainPages: {
    id: ActiveTab;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: 'database',
      label: 'Cartes HD & Variantes',
      sublabel: 'Catalogue complet, prix et filtres avancés',
      icon: <Search className="w-5 h-5 text-teal-400" />,
      badge: 'Encyclopédie',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40'
    },
    {
      id: 'meta',
      label: 'Meta Decks & Tier List',
      sublabel: 'Les meilleurs decks compétitifs du moment',
      icon: <Flame className="w-5 h-5 text-amber-400" />,
      badge: 'Tier List',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    },
    {
      id: 'tournaments',
      label: 'Tournois & Decklists',
      sublabel: 'Résultats officiels, tournois et compositions',
      icon: <Trophy className="w-5 h-5 text-yellow-400" />,
      badge: 'Officiel',
      badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
    },
    {
      id: 'deckbuilder',
      label: 'Deckbuilder',
      sublabel: `${validation.mainDeckCount}/50 cartes · Simulateur de mains`,
      icon: <Layers className="w-5 h-5 text-blue-400" />,
      badge: validation.mainDeckCount > 0 ? `${validation.mainDeckCount}/50` : undefined,
      badgeColor: validation.mainDeckCount === 50 ? 'bg-emerald-500 text-black' : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
    },
    {
      id: 'collection',
      label: 'Ma Collection One Piece',
      sublabel: `${stats.uniqueCardsOwned} uniques · Suivi des cotes & classeur`,
      icon: <FolderHeart className="w-5 h-5 text-pink-400" />,
      badge: stats.uniqueCardsOwned > 0 ? `${stats.uniqueCardsOwned}` : undefined,
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40'
    },
    {
      id: 'matchups',
      label: 'Stats & Matchups',
      sublabel: 'Matrices de winrate et match-ups de la méta',
      icon: <BarChart3 className="w-5 h-5 text-cyan-400" />
    },
    {
      id: 'quotas',
      label: 'Quotas des Boosters',
      sublabel: 'Ratios officiels et probabilités de drop',
      icon: <Boxes className="w-5 h-5 text-indigo-400" />
    },
    {
      id: 'news',
      label: 'News & Reveals OP18',
      sublabel: 'Dernières révélations de cartes et spoilers',
      icon: <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />,
      badge: 'OP18',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-[100] w-full h-full flex flex-col bg-[#0A0E17] lg:hidden select-none animate-in fade-in duration-200 overflow-hidden"
    >
      {/* User Profile Bar (Full-Width Header with Safe Area Top Padding) */}
      <div 
        className="flex items-center justify-between px-5 pb-3.5 border-b border-slate-800/80 bg-[#0A0E17] flex-shrink-0"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))' }}
      >
        <div 
          onClick={() => {
            onClose();
            onOpenProfile();
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-2xl overflow-hidden border-2 border-amber-400/90 shadow-[0_0_12px_rgba(245,158,11,0.3)] bg-slate-950 flex-shrink-0">
            <img
              src={getAvatar().imageUrl}
              alt={user.pseudo}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = 'https://scalpeurs.com/img/cards-fr/eb02-p083.webp';
              }}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                {user.pseudo}
              </span>
              {user.isDonor && <span className="text-xs">⭐</span>}
            </div>
            <span className="text-[10px] text-amber-400 font-bold block">
              {user.isDonor ? '⭐ Mécène du Projet' : user.isLoggedIn ? '☁️ Compte Pirate Synchronisé' : 'Profil & Paramètres'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          aria-label="Fermer le menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Action Shortcuts (Scanner, Decks, Soutien) */}
      <div className="grid grid-cols-3 gap-2 px-5 py-3 bg-[#070B13] border-b border-slate-800/60 flex-shrink-0">
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenScanner();
          }}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-400/40 text-amber-300 active:scale-95 transition-all cursor-pointer shadow-sm"
        >
          <Camera className="w-5 h-5 text-amber-400 mb-1" />
          <span className="text-[10px] font-black">Scanner IA</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenSavedDecks();
          }}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 active:scale-95 hover:border-slate-700 transition-all cursor-pointer"
        >
          <Bookmark className="w-5 h-5 text-amber-400 mb-1" />
          <span className="text-[10px] font-bold">Mes Decks ({savedDecks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenSupport();
          }}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300 active:scale-95 transition-all cursor-pointer"
        >
          <Coffee className="w-4 h-4 text-amber-400/80 mb-0.5" />
          <span className="text-[10px] font-medium">Soutenir</span>
        </button>
      </div>

      {/* Navigation Links List */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5 no-scrollbar"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}
      >
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 block mb-1">
          Navigation Principale
        </span>

        {mainPages.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectTab(item.id);
                onClose();
              }}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-400/60 shadow-md'
                  : 'bg-[#0E131F]/60 hover:bg-[#131929] border border-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isActive ? 'bg-amber-400/20' : 'bg-slate-800/80'
                }`}>
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black truncate ${
                      isActive ? 'text-amber-300' : 'text-white'
                    }`}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black border ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {item.sublabel}
                  </p>
                </div>
              </div>

              <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${
                isActive ? 'text-amber-400 translate-x-0.5' : 'text-slate-600'
              }`} />
            </button>
          );
        })}

        {/* Legal / CGU Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenLegal();
            }}
            className="w-full p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-between text-xs font-medium cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Mentions légales & Confidentialité</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
