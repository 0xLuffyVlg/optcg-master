import React from 'react';
import { AnimatedCounter, DynamicBadge } from './DynamicHeroBanner';
import { Sparkles, Flame, Layers } from 'lucide-react';

export interface ScalpeursHeroBannerProps {
  title: string;
  code?: string;
  totalCards?: number;
  totalLabel?: string;
  selectedLanguage?: 'ALL' | 'FR' | 'EN' | 'JP';
  onSelectLanguage?: (lang: 'ALL' | 'FR' | 'EN' | 'JP') => void;
  breadcrumb?: React.ReactNode;
  viewMode?: 'grouped' | 'allPrints';
  onToggleViewMode?: (mode: 'grouped' | 'allPrints') => void;
  filteredCount?: number;
  totalUniqueCount?: number;
  totalPrintsCount?: number;
  subBadges?: React.ReactNode;
  headerRight?: React.ReactNode;
  children?: React.ReactNode;
}

// 25 HD popular card thumbnails for the 3 conveyor belt ranks (r1, r2, r3)
const ROW1_CARDS = [
  'https://scalpeurs.com/img/cards-jp/op17-p168-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p162-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p167-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p084-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p163-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p164-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p161-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p160-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p049-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p177-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p156-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p165-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p008-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p029-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p106-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p085-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p147-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p169-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p166-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p159-vt.webp'
];

const ROW2_CARDS = [
  'https://scalpeurs.com/img/cards-jp/op05-p073.webp',
  'https://scalpeurs.com/img/cards-jp/op01-p151.webp',
  'https://scalpeurs.com/img/cards-jp/op02-p018.webp',
  'https://scalpeurs.com/img/cards-jp/op03-p147.webp',
  'https://scalpeurs.com/img/cards-jp/op04-p101.webp',
  'https://scalpeurs.com/img/cards-jp/op06-p141.webp',
  'https://scalpeurs.com/img/cards-jp/op07-p144.webp',
  'https://scalpeurs.com/img/cards-jp/op08-p141.webp',
  'https://scalpeurs.com/img/cards-jp/op09-p150.webp',
  'https://scalpeurs.com/img/cards-jp/op01-p022.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p177-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p049-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p160-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p161-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p164-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p163-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p084-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p167-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p162-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p168-vt.webp'
];

const ROW3_CARDS = [
  'https://scalpeurs.com/img/cards-jp/op17-p156-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p165-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p008-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p029-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p106-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p085-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p147-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p169-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p166-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op17-p159-vt.webp',
  'https://scalpeurs.com/img/cards-jp/op05-p073.webp',
  'https://scalpeurs.com/img/cards-jp/op01-p151.webp',
  'https://scalpeurs.com/img/cards-jp/op02-p018.webp',
  'https://scalpeurs.com/img/cards-jp/op03-p147.webp',
  'https://scalpeurs.com/img/cards-jp/op04-p101.webp',
  'https://scalpeurs.com/img/cards-jp/op06-p141.webp',
  'https://scalpeurs.com/img/cards-jp/op07-p144.webp',
  'https://scalpeurs.com/img/cards-jp/op08-p141.webp',
  'https://scalpeurs.com/img/cards-jp/op09-p150.webp',
  'https://scalpeurs.com/img/cards-jp/op01-p022.webp'
];

export const ScalpeursHeroBanner: React.FC<ScalpeursHeroBannerProps> = ({
  title,
  code,
  totalCards,
  totalLabel = 'cartes',
  selectedLanguage,
  onSelectLanguage,
  breadcrumb = 'Cartes One Piece › toutes',
  viewMode,
  onToggleViewMode,
  filteredCount,
  totalUniqueCount,
  totalPrintsCount,
  subBadges,
  headerRight,
  children
}) => {
  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen border-b border-[#d4af37]/25 pb-0 pt-5 sm:pt-7 jp-hero-large shadow-2xl">
      {/* ─── 3D Perspective Conveyor Belt Background (jp-defile) ─── */}
      <div aria-hidden="true" className="jp-defile overflow-hidden">
        <div className="scene">
          <div className="tapis">
            {/* Row 1 (slow, background) */}
            <div className="rang r1">
              {[...ROW1_CARDS, ...ROW1_CARDS].map((url, i) => (
                <img
                  key={`r1-${i}`}
                  alt=""
                  decoding="async"
                  loading="lazy"
                  fetchPriority="low"
                  draggable={false}
                  src={url}
                />
              ))}
            </div>

            {/* Row 2 (medium speed, reverse) */}
            <div className="rang r2">
              {[...ROW2_CARDS, ...ROW2_CARDS].map((url, i) => (
                <img
                  key={`r2-${i}`}
                  alt=""
                  decoding="async"
                  loading="lazy"
                  fetchPriority="low"
                  draggable={false}
                  src={url}
                />
              ))}
            </div>

            {/* Row 3 (fastest, foreground) */}
            <div className="rang r3">
              {[...ROW3_CARDS, ...ROW3_CARDS].map((url, i) => (
                <img
                  key={`r3-${i}`}
                  alt=""
                  decoding="async"
                  loading="lazy"
                  fetchPriority="low"
                  draggable={false}
                  src={url}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Gradient dark veil for crystal clear text readability */}
        <span className="voile" />
      </div>

      {/* ─── Banner Foreground Content ─── */}
      <div className="relative max-w-[1800px] mx-auto px-3 sm:px-6 lg:px-8 space-y-3 sm:space-y-4">
        {/* Top Header Row: Fil d'Ariane + Language Capsule + Actions / Toggle Buttons */}
        <div className="flex items-center justify-between gap-2 w-full">
          {/* Fil d'Ariane (gauche) */}
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 sm:gap-2 text-[11px] sm:text-xs font-semibold text-white/70 min-w-0">
            {onSelectLanguage && selectedLanguage ? (
              <div className="flex items-center gap-1 truncate">
                <button 
                  type="button" 
                  onClick={() => onSelectLanguage('FR')}
                  className="hover:text-amber-300 text-white/70 transition-colors cursor-pointer truncate"
                >
                  Cartes One Piece
                </button>
                <span className="text-white/40">›</span>
                <span className="text-white/90 font-bold truncate">
                  {selectedLanguage === 'JP' ? 'japonaises' : selectedLanguage === 'FR' ? 'françaises' : selectedLanguage === 'EN' ? 'anglaises' : 'anglaises'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-md shadow-md text-amber-300 font-bold truncate">
                <span>{breadcrumb}</span>
              </div>
            )}
          </nav>

          {/* Droite: Language Capsule + Toggle ViewMode */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Desktop-only: ViewMode Toggles (Toutes les Variantes / Cartes Uniques) */}
            {onToggleViewMode && viewMode ? (
              <div className="hidden sm:flex items-center gap-2 sm:gap-3">
                {/* Toutes les Variantes */}
                <button
                  type="button"
                  onClick={() => onToggleViewMode('allPrints')}
                  className={`relative flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border backdrop-blur-md transition-all text-xs font-bold cursor-pointer ${
                    viewMode === 'allPrints'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black border-amber-300 shadow-lg shadow-amber-500/30 scale-105'
                      : 'bg-black/60 hover:bg-black/80 text-white/80 hover:text-white border-white/20'
                  }`}
                >
                  <Flame className={`w-3.5 h-3.5 ${viewMode === 'allPrints' ? 'text-black fill-black' : 'text-amber-400'}`} />
                  <span className="font-extrabold">Toutes les Variantes</span>
                  <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-black ${
                    viewMode === 'allPrints' ? 'bg-black/20 text-black' : 'bg-black/80 text-amber-300 border border-white/10'
                  }`}>
                    <AnimatedCounter value={totalPrintsCount || 17330} />
                  </span>
                </button>

                {/* Cartes Uniques */}
                <button
                  type="button"
                  onClick={() => onToggleViewMode('grouped')}
                  className={`relative flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border backdrop-blur-md transition-all text-xs font-bold cursor-pointer ${
                    viewMode === 'grouped'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black border-amber-300 shadow-lg shadow-amber-500/30 scale-105'
                      : 'bg-black/60 hover:bg-black/80 text-white/80 hover:text-white border-white/20'
                  }`}
                >
                  <Layers className={`w-3.5 h-3.5 ${viewMode === 'grouped' ? 'text-black fill-black' : 'text-blue-400'}`} />
                  <span className="font-extrabold">Cartes Uniques</span>
                  <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-black ${
                    viewMode === 'grouped' ? 'bg-black/20 text-black' : 'bg-black/80 text-amber-300 border border-white/10'
                  }`}>
                    <AnimatedCounter value={totalUniqueCount || 2885} />
                  </span>
                </button>
              </div>
            ) : headerRight ? (
              <div className="flex items-center gap-2">
                {headerRight}
              </div>
            ) : null}
          </div>
        </div>

        {/* Title & Set Subtitle */}
        <div>
          <h1 className="text-xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md flex items-center gap-2 flex-wrap">
            {code && (
              <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-base sm:text-2xl font-mono">
                {code}
              </span>
            )}
            <span>{title}</span>
          </h1>

          <div className="mt-1 sm:mt-2 flex items-center gap-1.5 sm:gap-2.5 text-[10.5px] sm:text-xs font-bold uppercase tracking-wider text-white/70 flex-nowrap overflow-x-auto no-scrollbar">
            {totalCards !== undefined && (
              <span className="flex items-center gap-1 text-white font-black whitespace-nowrap">
                <b className="text-xs sm:text-base tabular-nums font-mono text-white">
                  <AnimatedCounter value={totalCards} />
                </b>
                <span className="text-white/70 uppercase">{totalLabel}</span>
              </span>
            )}
            {subBadges ? (
              subBadges
            ) : totalCards !== undefined ? (
              <div className="flex items-center gap-1.5 whitespace-nowrap text-white/60">
                <span className="text-slate-600">·</span>
                <span className="font-bold">116 COLLECTIONS</span>
                <span className="text-slate-600">·</span>
                <span className="font-bold">OP01 → OP18</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Embedded Filter Arena (À cheval sur le bord inférieur de la bannière : 50% dedans, 50% dehors) */}
        {children && (
          <div className="relative translate-y-1/2 z-40 px-2 sm:px-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScalpeursHeroBanner;
