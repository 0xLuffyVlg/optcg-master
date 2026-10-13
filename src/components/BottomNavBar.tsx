import React from 'react';
import { 
  Flame, 
  Layers, 
  Search,
  Menu,
  ScanLine
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { useDeck } from '../context/DeckContext';
import { useCollection } from '../context/CollectionContext';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenScanner?: () => void;
  onOpenMenu?: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenScanner,
  onOpenMenu
}) => {
  const { validation } = useDeck();
  const { stats } = useCollection();

  // Primary navigation items (Left 2, Center Scan, Right 2)
  const isMenuSection = activeTab === 'collection' || activeTab === 'tournaments' || activeTab === 'quotas' || activeTab === 'news';

  return (
    <nav 
      aria-label="Navigation mobile principale"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#0A0E17]/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-4px_25px_rgba(0,0,0,0.7)] px-1 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom,0.6rem))]"
    >
      {/* ─── Curved Center Arch Socket behind Embedded Scan Button ─── */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-[23px] pointer-events-none flex flex-col items-center">
        <svg 
          className="w-[92px] h-[24px] overflow-visible" 
          viewBox="0 0 92 24" 
          fill="none"
        >
          {/* Smooth curved background matching navbar */}
          <path 
            d="M 0 24 C 14 24 18 2 46 2 C 74 2 78 24 92 24 Z" 
            fill="#0A0E17" 
          />
          {/* Top border continuing the navbar line */}
          <path 
            d="M 0 24 C 14 24 18 2 46 2 C 74 2 78 24 92 24" 
            stroke="rgba(51, 65, 85, 0.9)" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
          />
        </svg>
      </div>

      <div className="grid grid-cols-5 items-center max-w-md mx-auto relative">
        {/* 1. Cartes */}
        <button
          type="button"
          onClick={() => onSelectTab('database')}
          className={`relative flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-150 active:scale-90 cursor-pointer ${
            activeTab === 'database' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'database' && (
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
          )}
          <Search className={`w-5 h-5 transition-transform ${
            activeTab === 'database' ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'text-slate-400'
          }`} />
          <span className={`text-[10px] tracking-tight mt-1 truncate max-w-[62px] ${
            activeTab === 'database' ? 'font-black text-amber-300' : 'font-medium text-slate-400'
          }`}>
            Cartes
          </span>
        </button>

        {/* 2. Méta */}
        <button
          type="button"
          onClick={() => onSelectTab('meta')}
          className={`relative flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-150 active:scale-90 cursor-pointer ${
            activeTab === 'meta' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'meta' && (
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
          )}
          <Flame className={`w-5 h-5 transition-transform ${
            activeTab === 'meta' ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'text-slate-400'
          }`} />
          <span className={`text-[10px] tracking-tight mt-1 truncate max-w-[62px] ${
            activeTab === 'meta' ? 'font-black text-amber-300' : 'font-medium text-slate-400'
          }`}>
            Méta
          </span>
        </button>

        {/* 3. CENTER: Incrusted Floating Scanner Button */}
        <div className="relative flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={onOpenScanner}
            className="absolute -top-[22px] w-[52px] h-[52px] rounded-full bg-[#F6707B] hover:bg-[#F43F5E] active:scale-90 transition-all shadow-[0_4px_16px_rgba(246,112,123,0.45)] flex items-center justify-center group cursor-pointer border-[2.5px] border-[#0A0E17] z-20"
            aria-label="Scanner une carte One Piece"
          >
            <ScanLine className="w-6 h-6 text-slate-950 stroke-[2.5] transition-transform group-hover:scale-110" />
          </button>
          
          <span className="text-[10px] font-bold text-slate-400 mt-6 select-none">
            Scan
          </span>
        </div>

        {/* 4. Deck */}
        <button
          type="button"
          onClick={() => onSelectTab('deckbuilder')}
          className={`relative flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-150 active:scale-90 cursor-pointer ${
            activeTab === 'deckbuilder' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {activeTab === 'deckbuilder' && (
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
          )}
          <div className="relative">
            <Layers className={`w-5 h-5 transition-transform ${
              activeTab === 'deckbuilder' ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'text-slate-400'
            }`} />
            {validation.mainDeckCount > 0 && (
              <span className={`absolute -top-1 -right-2.5 px-1.5 py-0.2 rounded-full text-[9px] font-black shadow-md ${
                validation.mainDeckCount === 50 ? 'bg-emerald-500 text-black' : 'bg-amber-500 text-black'
              }`}>
                {validation.mainDeckCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] tracking-tight mt-1 truncate max-w-[62px] ${
            activeTab === 'deckbuilder' ? 'font-black text-amber-300' : 'font-medium text-slate-400'
          }`}>
            Deck
          </span>
        </button>

        {/* 5. Menu / Profil */}
        <button
          type="button"
          onClick={onOpenMenu}
          className={`relative flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-150 active:scale-90 cursor-pointer ${
            isMenuSection ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isMenuSection && (
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-pink-500 to-amber-300 shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
          )}
          <div className="relative">
            <Menu className={`w-5 h-5 transition-transform ${
              isMenuSection ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'text-slate-400'
            }`} />
            {stats.uniqueCardsOwned > 0 && (
              <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-pink-500 ring-2 ring-[#0A0E17]" />
            )}
          </div>
          <span className={`text-[10px] tracking-tight mt-1 truncate max-w-[62px] ${
            isMenuSection ? 'font-black text-amber-300' : 'font-medium text-slate-400'
          }`}>
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
};
export default BottomNavBar;
