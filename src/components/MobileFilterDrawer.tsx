import React, { useMemo } from 'react';
import { 
  X, 
  RotateCcw, 
  Sparkles, 
  Star, 
  Feather, 
  SlidersHorizontal,
  ChevronDown,
  Check
} from 'lucide-react';
import { SortOption } from '../views/DatabaseView';

export interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // Sort
  selectedSort: SortOption;
  setSelectedSort: (s: SortOption) => void;
  // Rarity
  selectedRarity: string;
  setSelectedRarity: (r: string) => void;
  // Variant Tab (Crew manga, Manga, Alternatifs)
  variantTab: 'ALL' | 'BASE' | 'ALT';
  setVariantTab: (t: 'ALL' | 'BASE' | 'ALT') => void;
  isMangaOnly: boolean;
  setIsMangaOnly: (m: boolean) => void;
  isCrewMangaOnly: boolean;
  setIsCrewMangaOnly: (c: boolean) => void;
  // Price
  minPrice: number;
  setMinPrice: (p: number) => void;
  maxPriceLimit: number;
  priceHistogram: number[];
  // Color
  selectedColor: string;
  setSelectedColor: (c: string) => void;
  // Category / Type
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  // Language
  selectedLanguage?: 'ALL' | 'FR' | 'EN' | 'JP';
  setSelectedLanguage?: (lang: 'ALL' | 'FR' | 'EN' | 'JP') => void;
  // Illustrator
  selectedIllustrator: string;
  setSelectedIllustrator: (i: string) => void;
  availableIllustrators: string[];
  // Actions & Stats
  matchingCount: number;
  activeFiltersCount: number;
  onResetAll: () => void;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  selectedSort,
  setSelectedSort,
  selectedLanguage,
  setSelectedLanguage,
  selectedRarity,
  setSelectedRarity,
  variantTab,
  setVariantTab,
  isMangaOnly,
  setIsMangaOnly,
  isCrewMangaOnly,
  setIsCrewMangaOnly,
  minPrice,
  setMinPrice,
  maxPriceLimit,
  priceHistogram,
  selectedColor,
  setSelectedColor,
  selectedCategory,
  setSelectedCategory,
  selectedIllustrator,
  setSelectedIllustrator,
  availableIllustrators,
  matchingCount,
  activeFiltersCount,
  onResetAll
}) => {
  if (!isOpen) return null;

  const sortButtons: { id: SortOption; label: string }[] = [
    { id: 'code-asc', label: 'Officiel' },
    { id: 'price-desc', label: 'Prix' },
    { id: 'lang-fr-en-jp', label: '🇫🇷 Français' },
    { id: 'lang-en-fr-jp', label: '🇬🇧 Anglais' },
    { id: 'lang-jp-en-fr', label: '🇯🇵 Japonais' },
    { id: 'rarity-desc', label: 'Rareté' },
    { id: 'code-desc', label: 'Numéro' },
    { id: 'alpha-asc', label: 'Nom' }
  ];

  const standardRarities = ['SP', 'L', 'SEC', 'TR', 'SR', 'R', 'UC', 'C', 'DON!!'];

  const colorButtons = [
    { id: 'Red', label: 'Rouge', bg: 'bg-[#E11D48] ring-rose-500' },
    { id: 'Green', label: 'Vert', bg: 'bg-[#10B981] ring-emerald-500' },
    { id: 'Blue', label: 'Bleu', bg: 'bg-[#2563EB] ring-blue-500' },
    { id: 'Purple', label: 'Violet', bg: 'bg-[#8B5CF6] ring-purple-500' },
    { id: 'Black', label: 'Noir', bg: 'bg-[#1E293B] ring-slate-400 border border-slate-600' },
    { id: 'Yellow', label: 'Jaune', bg: 'bg-[#F59E0B] ring-amber-400' }
  ];

  const categoryButtons = [
    { id: 'Leader', label: 'Leader' },
    { id: 'Character', label: 'Personnage' },
    { id: 'Event', label: 'Événement' },
    { id: 'Stage', label: 'Terrain' }
  ];

  // Max bucket height for histogram normalization
  const maxBucket = Math.max(...priceHistogram, 1);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Dark backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in"
      />

      {/* Slide-up Bottom Sheet */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-lg max-h-[92vh] flex flex-col rounded-t-[28px] bg-[#0B0F17] border-t border-x border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom duration-250 select-none overflow-hidden"
      >
        {/* Drag handle pill */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-slate-600/80" />
        </div>

        {/* Header: Title + Active filter badge + Reset button */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white tracking-wide">
              Filtres
            </h2>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] flex items-center justify-center shadow-md">
                {activeFiltersCount}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onResetAll}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-400 active:scale-95 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tout effacer</span>
          </button>
        </div>

        {/* Scrollable Filter Form Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 no-scrollbar pb-24">
          
          {/* 1. TRIER PAR */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              TRIER PAR
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {sortButtons.map((item) => {
                const isActive = selectedSort === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedSort(item.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-[#131826] text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. LANGUE */}
          {setSelectedLanguage && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  LANGUE DES CARTES
                </h3>
                {selectedLanguage && selectedLanguage !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setSelectedLanguage('ALL')}
                    className="text-[10px] text-amber-400 font-bold hover:underline"
                  >
                    Toutes
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'ALL', label: '🌍 Toutes' },
                  { id: 'FR', label: '🇫🇷 FR' },
                  { id: 'EN', label: '🇬🇧 EN' },
                  { id: 'JP', label: '🇯🇵 JP' },
                ].map((item) => {
                  const isActive = (selectedLanguage || 'ALL') === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedLanguage(item.id as any)}
                      className={`py-2 px-1.5 rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-[#131826] text-slate-300 hover:text-white border border-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. RARETÉ */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                RARETÉ
              </h3>
              {(selectedRarity !== 'ALL' || isMangaOnly || isCrewMangaOnly || variantTab === 'ALT') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRarity('ALL');
                    setIsMangaOnly(false);
                    setIsCrewMangaOnly(false);
                    setVariantTab('ALL');
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/40"
                >
                  <span>{isMangaOnly ? 'Manga' : isCrewMangaOnly ? 'Crew manga' : variantTab === 'ALT' ? 'Alternatifs' : selectedRarity}</span>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Special row: Crew manga, Manga, Alternatifs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsCrewMangaOnly(!isCrewMangaOnly);
                  if (!isCrewMangaOnly) {
                    setIsMangaOnly(false);
                    setSelectedRarity('ALL');
                  }
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  isCrewMangaOnly
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                    : 'bg-[#131826] text-slate-300 border-slate-800 hover:text-white'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="truncate">Crew manga</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMangaOnly(!isMangaOnly);
                  if (!isMangaOnly) {
                    setIsCrewMangaOnly(false);
                    setSelectedRarity('ALL');
                  }
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  isMangaOnly
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                    : 'bg-[#131826] text-slate-300 border-slate-800 hover:text-white'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="truncate">Manga</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setVariantTab(variantTab === 'ALT' ? 'ALL' : 'ALT');
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  variantTab === 'ALT'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                    : 'bg-[#131826] text-slate-300 border-slate-800 hover:text-white'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="truncate">Alternatifs</span>
              </button>
            </div>

            {/* Standard rarities row: SP, L, SEC, TR, SR, R, UC, C, DON!! */}
            <div className="grid grid-cols-5 gap-1.5">
              {standardRarities.map((r) => {
                const isActive = selectedRarity === r && !isMangaOnly && !isCrewMangaOnly;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setSelectedRarity(isActive ? 'ALL' : r);
                      setIsMangaOnly(false);
                      setIsCrewMangaOnly(false);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-black transition-all text-center cursor-pointer border ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-105'
                        : 'bg-[#131826] text-slate-300 border-slate-800 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. À PARTIR DE (Price Histogram & Range Slider) */}
          <div className="space-y-2.5 p-3 rounded-2xl bg-[#0D121F] border border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                À PARTIR DE
              </h3>
              <span className="text-sm font-black text-amber-400">
                {minPrice > 0 ? `${minPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € et +` : '0,00 € et +'}
              </span>
            </div>

            {/* Visual Bar Chart / Histogram */}
            <div className="h-12 flex items-end gap-[3px] pt-2 px-1">
              {priceHistogram.map((count, bIdx) => {
                const heightPercent = Math.max(12, Math.round((count / maxBucket) * 100));
                const bucketMinPrice = (bIdx / priceHistogram.length) * maxPriceLimit;
                const isLit = bucketMinPrice >= minPrice;

                return (
                  <div
                    key={bIdx}
                    style={{ height: `${heightPercent}%` }}
                    className={`flex-1 rounded-t-sm transition-all duration-200 ${
                      isLit
                        ? 'bg-amber-400/90 shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                        : 'bg-slate-700/60'
                    }`}
                  />
                );
              })}
            </div>

            {/* Slider */}
            <div className="relative pt-1">
              <input
                type="range"
                min="0"
                max={Math.min(500, maxPriceLimit || 500)}
                step="0.5"
                value={minPrice}
                onChange={(e) => setMinPrice(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Subtitle count & range */}
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-emerald-400 font-black">
                {matchingCount} cartes
              </span>
              <span className="text-slate-500 font-mono text-[10px]">
                0,02 € → {Math.round(maxPriceLimit || 1000).toLocaleString('fr-FR')} €+
              </span>
            </div>
          </div>

          {/* 4. COULEUR */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                COULEUR
              </h3>
              {selectedColor !== 'ALL' ? (
                <button
                  type="button"
                  onClick={() => setSelectedColor('ALL')}
                  className="text-xs font-bold text-amber-400 hover:underline cursor-pointer"
                >
                  Toutes
                </button>
              ) : (
                <span className="text-xs text-slate-500 font-medium">Toutes</span>
              )}
            </div>

            <div className="grid grid-cols-6 gap-2">
              {colorButtons.map((btn) => {
                const isSelected = selectedColor.toLowerCase() === btn.id.toLowerCase();
                return (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => setSelectedColor(isSelected ? 'ALL' : btn.id)}
                    className={`h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative ${btn.bg} ${
                      isSelected
                        ? 'ring-4 ring-offset-2 ring-offset-[#0B0F17] scale-110 shadow-lg'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                    title={btn.label}
                  >
                    {isSelected && (
                      <Check className="w-5 h-5 text-white stroke-[3] drop-shadow-md" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. TYPE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                TYPE
              </h3>
              {selectedCategory !== 'ALL' ? (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className="text-xs font-bold text-amber-400 hover:underline cursor-pointer"
                >
                  Tous
                </button>
              ) : (
                <span className="text-xs text-slate-500 font-medium">Tous</span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {categoryButtons.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-black transition-all text-center cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                        : 'bg-[#131826] text-slate-300 border-slate-800 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. ILLUSTRATEUR */}
          {availableIllustrators.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  ILLUSTRATEUR
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {availableIllustrators.length} artistes
                </span>
              </div>

              <div className="relative">
                <Feather className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={selectedIllustrator}
                  onChange={(e) => setSelectedIllustrator(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-[#131826] border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-amber-400 appearance-none cursor-pointer"
                >
                  <option value="ALL">Tous les artistes</option>
                  {availableIllustrators.map((artist) => (
                    <option key={artist} value={artist}>
                      {artist}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}

        </div>

        {/* Sticky Bottom Action Button */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-[#0B0F17]/95 backdrop-blur-md border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition-all shadow-[0_4px_20px_rgba(245,158,11,0.4)] active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Voir {matchingCount.toLocaleString('fr-FR')} cartes</span>
          </button>
        </div>

      </div>
    </div>
  );
};
