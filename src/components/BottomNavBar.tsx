import React from 'react';
import { ActiveTab } from './Navbar';

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
  return (
    <nav 
      aria-label="Navigation mobile principale"
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#0A0D14]/98 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-4px_25px_rgba(0,0,0,0.8)] px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom,0.6rem))]"
    >
      <div className="grid grid-cols-6 items-center max-w-lg mx-auto relative">
        {/* 1. Cartes (database) */}
        <button
          type="button"
          onClick={() => onSelectTab('database')}
          className={`flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-90 cursor-pointer ${
            activeTab === 'database' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="4" width="13" height="17" rx="2" />
            <circle cx="15.5" cy="15.5" r="4.5" />
            <path d="M18.7 18.7L22 22" strokeLinecap="round" />
          </svg>
          <span className={`text-[10px] tracking-tight mt-1 ${
            activeTab === 'database' ? 'font-black text-amber-400' : 'font-medium text-slate-400'
          }`}>
            Cartes
          </span>
        </button>

        {/* 2. Scanner (Scanner IA Modal) */}
        <button
          type="button"
          onClick={onOpenScanner}
          className="flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-90 cursor-pointer group"
          aria-label="Scanner une carte One Piece"
        >
          <div className="p-1 rounded-xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-pink-500/60 shadow-[0_0_12px_rgba(236,72,153,0.4)] group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <span className="text-[10px] font-bold text-pink-400 tracking-tight mt-0.5">
            Scanner
          </span>
        </button>

        {/* 3. Collection (collection) */}
        <button
          type="button"
          onClick={() => onSelectTab('collection')}
          className={`flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-90 cursor-pointer ${
            activeTab === 'collection' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 10V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4M3 10v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10M3 10h18" />
            <circle cx="12" cy="15" r="1.5" fill="currentColor" />
          </svg>
          <span className={`text-[10px] tracking-tight mt-1 ${
            activeTab === 'collection' ? 'font-black text-amber-400' : 'font-medium text-slate-400'
          }`}>
            Collection
          </span>
        </button>

        {/* 4. Booster (quotas) */}
        <button
          type="button"
          onClick={() => onSelectTab('quotas')}
          className={`flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-90 cursor-pointer ${
            activeTab === 'quotas' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="6" y="2" width="12" height="20" rx="2.5" />
            <path d="M10 6h4M9 10h6M9 14h6M11 18h2" strokeLinecap="round" />
          </svg>
          <span className={`text-[10px] tracking-tight mt-1 ${
            activeTab === 'quotas' ? 'font-black text-amber-400' : 'font-medium text-slate-400'
          }`}>
            Booster
          </span>
        </button>

        {/* 5. Forum / Méta (meta) with notification badge */}
        <button
          type="button"
          onClick={() => onSelectTab('meta')}
          className={`flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-90 cursor-pointer ${
            activeTab === 'meta' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white font-extrabold text-[9px] px-1 py-0.1 rounded-full leading-tight shadow">
              14
            </span>
          </div>
          <span className={`text-[10px] tracking-tight mt-1 ${
            activeTab === 'meta' ? 'font-black text-amber-400' : 'font-medium text-slate-400'
          }`}>
            Forum
          </span>
        </button>

        {/* 6. Menu (Barre de gouvernail pirate) */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-90 cursor-pointer text-slate-400 hover:text-slate-200"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="2.5" />
            <line x1="12" y1="1" x2="12" y2="23" />
            <line x1="1" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="4.22" x2="19.78" y2="19.78" />
            <line x1="19.78" y1="4.22" x2="4.22" y2="19.78" />
          </svg>
          <span className="text-[10px] font-medium tracking-tight mt-1 text-slate-400">
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNavBar;
