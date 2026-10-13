import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Flame, 
  Calendar, 
  Zap, 
  ShieldCheck, 
  Crown, 
  Search, 
  Newspaper, 
  Tag,
  ExternalLink,
  Info,
  Layers,
  Sparkle,
  Radio,
  Tv,
  CheckCircle2,
  Maximize2,
  X,
  ZoomIn,
  Repeat,
  Star
} from 'lucide-react';
import { 
  REVEALED_CARDS, 
  NEWS_ARTICLES, 
  UPCOMING_SETS, 
  RevealedCard, 
  NewsArticle 
} from '../data/newsRevealsData';
import { getColorClass } from '../utils/cardUtils';
import { getDeviceLanguage, setDeviceLanguage, AppLanguage } from '../utils/cardTranslator';
import { ScalpeursHeroBanner } from '../components/ScalpeursHeroBanner';

export const NewsRevealsView: React.FC = () => {
  const [selectedSetFilter, setSelectedSetFilter] = useState<string>('ALL');
  const [languageMode, setLanguageMode] = useState<AppLanguage>(getDeviceLanguage());

  // Listen to global language changes
  useEffect(() => {
    const handleLangChange = (e: any) => {
      if (e.detail) setLanguageMode(e.detail);
    };
    window.addEventListener('optcg-language-changed', handleLangChange);
    return () => window.removeEventListener('optcg-language-changed', handleLangChange);
  }, []);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'cards' | 'articles'>('cards');
  const [onlyAltArt, setOnlyAltArt] = useState<boolean>(false);
  const [zoomCard, setZoomCard] = useState<{ card: RevealedCard; imgUrl: string } | null>(null);
  
  // Track alternate artwork selections per card
  const [selectedArtMap, setSelectedArtMap] = useState<Record<string, 'regular' | 'alt'>>({});

  const toggleArtwork = (cardId: string) => {
    setSelectedArtMap(prev => ({
      ...prev,
      [cardId]: prev[cardId] === 'alt' ? 'regular' : 'alt'
    }));
  };

  // Filtered revealed cards
  const filteredCards = useMemo(() => {
    let list = REVEALED_CARDS;

    if (selectedSetFilter !== 'ALL') {
      list = list.filter(c => c.set.toUpperCase() === selectedSetFilter.toUpperCase());
    }

    if (onlyAltArt) {
      list = list.filter(c => c.isAlternateArt || c.rarity === 'MANGA' || c.rarity === 'SP');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.jpName && c.jpName.toLowerCase().includes(q)) ||
        c.setName.toLowerCase().includes(q) ||
        c.effect.toLowerCase().includes(q) ||
        c.effectFr.toLowerCase().includes(q) ||
        c.type.some(t => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [selectedSetFilter, onlyAltArt, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Scalpeurs 3D Conveyor Belt Living Hero Banner */}
      <ScalpeursHeroBanner
        title="News & Révélations Officielles"
        code="OP18 & EB05"
        breadcrumb="News & Révélations › Direct officiel, leaks & spoilers"
        totalCards={REVEALED_CARDS.length}
        totalLabel="cartes révélées"
        subBadges={
          <>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-bold">{NEWS_ARTICLES.length} Articles & Leaks</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400 font-bold">OP-18, EB-05 & PRB-02</span>
          </>
        }
      >
        {/* Main Filter Arena (À cheval sur la bordure de la bannière : à moitié dedans, à moitié dehors 50/50) */}
        <div className="p-3 sm:p-4 rounded-2xl bg-[#090D15]/98 backdrop-blur-2xl border border-slate-700/80 shadow-[0_16px_50px_rgba(0,0,0,0.95)] ring-1 ring-white/10 space-y-3 relative z-50">
          
          {/* Main View Mode Selector (Cartes Révélées vs Articles de News) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('cards')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'cards'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/25 scale-105'
                    : 'bg-[#141824] border border-slate-700/80 text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Cartes Révélées ({REVEALED_CARDS.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('articles')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'articles'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/25 scale-105'
                    : 'bg-[#141824] border border-slate-700/80 text-slate-400 hover:text-white'
                }`}
              >
                <Newspaper className="w-3.5 h-3.5" />
                <span>Articles & Leaks ({NEWS_ARTICLES.length})</span>
              </button>
            </div>

            {/* Translation Toggle */}
            <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-[#141824] border border-slate-700/80">
              <span className="text-[11px] font-bold text-slate-400 px-2">Langue des effets :</span>
              <button
                onClick={() => {
                  setLanguageMode('FR');
                  setDeviceLanguage('FR');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  languageMode === 'FR' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                🇫🇷 Français
              </button>
              <button
                onClick={() => {
                  setLanguageMode('EN');
                  setDeviceLanguage('EN');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  languageMode === 'EN' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          {/* Set Specific Filter Chips & Alt Art Toggle */}
          {activeTab === 'cards' && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
                <button
                  onClick={() => setSelectedSetFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSetFilter === 'ALL'
                      ? 'bg-white text-black font-black'
                      : 'bg-[#141824] border border-slate-700/80 text-slate-400 hover:text-white'
                  }`}
                >
                  Toutes ({REVEALED_CARDS.length})
                </button>

                <button
                  onClick={() => setSelectedSetFilter('OP18')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSetFilter === 'OP18'
                      ? 'bg-amber-400 text-black font-black scale-105 shadow'
                      : 'bg-[#141824] border border-slate-700/80 text-slate-300 hover:text-white'
                  }`}
                >
                  OP-18 (Dominance of God)
                </button>

                <button
                  onClick={() => setSelectedSetFilter('EB05')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSetFilter === 'EB05'
                      ? 'bg-pink-500 text-white font-black scale-105 shadow'
                      : 'bg-[#141824] border border-slate-700/80 text-slate-300 hover:text-white'
                  }`}
                >
                  EB-05 (Heroines Vol.2)
                </button>

                <button
                  onClick={() => setSelectedSetFilter('PRB02')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSetFilter === 'PRB02'
                      ? 'bg-purple-500 text-white font-black scale-105 shadow'
                      : 'bg-[#141824] border border-slate-700/80 text-slate-300 hover:text-white'
                  }`}
                >
                  PRB-02 (The Best Vol.2)
                </button>

                <button
                  onClick={() => setOnlyAltArt(prev => !prev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-all flex items-center gap-1 border cursor-pointer ${
                    onlyAltArt
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white border-amber-400 shadow-md shadow-amber-500/30 scale-105'
                      : 'bg-[#141824] border-slate-700/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>⭐ Alternate Art Uniquement</span>
                </button>
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Chercher (Loki, Franky, Gunko...)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0B0F17] border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

        </div>
      </ScalpeursHeroBanner>

      {/* Spacer so the roadmap starts cleanly below the 50% overlapping filter bar */}
      <div className="pt-20 sm:pt-24" />

      {/* Upcoming Sets Roadmap Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {UPCOMING_SETS.map(set => (
          <div 
            key={set.code}
            className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-cyan-500/50 transition-all shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center gap-4"
          >
            {set.bannerUrl && (
              <div className="w-full sm:w-32 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-black/60 border border-slate-700/60 shadow-md">
                <img 
                  src={set.bannerUrl} 
                  alt={set.name} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
            )}

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-black">
                  {set.code} • {set.type}
                </span>
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-400" />
                  Sortie JP : {set.japanReleaseDate}
                </span>
              </div>

              <h3 className="text-base font-black text-white">
                {set.frenchName}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {set.description}
              </p>

              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-amber-400 font-bold">
                  Occident : {set.globalReleaseDate}
                </span>
                <span className="text-slate-500 font-mono">
                  ~{set.cardCount} cartes
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Section: Cards with Real Images */}
      {activeTab === 'cards' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredCards.map(card => {
            const colorBadges = card.color.map(c => getColorClass(c));
            const isAltSelected = selectedArtMap[card.id] === 'alt' && !!card.altImageUrl;
            const currentImg = isAltSelected ? card.altImageUrl! : card.imageUrl;

            return (
              <div 
                key={card.id}
                className={`rounded-2xl overflow-hidden bg-[#0F172A] border transition-all shadow-xl flex flex-col justify-between group ${
                  card.isAlternateArt
                    ? 'border-amber-500/60 hover:border-amber-400 shadow-amber-500/10'
                    : 'border-slate-800 hover:border-cyan-500/60'
                }`}
              >
                {/* Header Tag */}
                <div className="p-3 bg-gradient-to-r from-slate-900 via-[#141C33] to-[#0F172A] border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-black text-amber-400 text-xs tracking-wider">
                      {card.code}
                    </span>
                    {card.jpName && (
                      <span className="text-[10px] text-slate-400 font-sans">
                        ({card.jpName})
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1.5">
                    {card.isAlternateArt && (
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/30 to-rose-500/30 border border-amber-400/60 text-amber-300 font-black text-[10px] flex items-center gap-1 shadow-sm">
                        <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                        <span>ALT ART ⭐</span>
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-black text-[10px]">
                      {card.setName}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                      card.rarity === 'MANGA'
                        ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white border-amber-400 animate-pulse'
                        : card.rarity === 'SEC'
                        ? 'bg-amber-500 text-black border-amber-300 font-black'
                        : card.rarity === 'SP'
                        ? 'bg-purple-600 text-white border-purple-400'
                        : 'bg-black/80 text-amber-400 border-amber-500/30'
                    }`}>
                      {card.rarity}
                    </span>
                  </div>
                </div>

                {/* Body with Side-by-Side Card Visual & Specs */}
                <div className="p-4 flex flex-col sm:flex-row gap-4 items-start">
                  
                  {/* High-Res Real Visual Preview */}
                  <div className="w-full sm:w-48 flex-shrink-0 flex flex-col items-center gap-2">
                    <div 
                      onClick={() => setZoomCard({ card, imgUrl: currentImg })}
                      className="w-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl relative bg-slate-950 border border-slate-700/80 cursor-pointer group/img hover:scale-[1.03] transition-transform"
                      title="Cliquez pour agrandir en HD"
                    >
                      <img 
                        src={currentImg} 
                        alt={card.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/logo.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-2.5 py-1 rounded-md bg-black/80 text-white text-[10px] font-black flex items-center gap-1 border border-white/20">
                          <ZoomIn className="w-3.5 h-3.5" /> Agrandir HD
                        </span>
                      </div>
                    </div>

                    {/* Alternate Art Switcher if card has AA */}
                    {card.altImageUrl && (
                      <button
                        onClick={() => toggleArtwork(card.id)}
                        className="w-full py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] font-bold text-amber-400 flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <Repeat className="w-3 h-3" />
                        <span>{isAltSelected ? 'Voir Version Principale' : 'Basculer Version Alt/Base'}</span>
                      </button>
                    )}
                  </div>

                  {/* Card Specs & Effects */}
                  <div className="flex-1 space-y-2.5 w-full">
                    
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                          {card.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-black text-slate-300">
                          {card.category}
                        </span>
                      </div>

                      {card.artist && (
                        <div className="mt-1 p-1.5 rounded-lg bg-purple-950/40 border border-purple-500/40 text-[10px] text-purple-200 flex items-center gap-1 font-bold">
                          <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />
                          <span>Artiste : {card.artist}</span>
                        </div>
                      )}
                    </div>

                    {/* Color Badges & Specs */}
                    <div className="flex flex-wrap items-center gap-1 text-[11px]">
                      {card.color.map((col, idx) => (
                        <span 
                          key={col} 
                          className={`px-2 py-0.5 rounded font-black ${colorBadges[idx]?.bg || 'bg-slate-800'} text-white shadow-sm`}
                        >
                          {col}
                        </span>
                      ))}

                      {card.life !== undefined && (
                        <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 font-black text-rose-300">
                          Vie : {card.life}
                        </span>
                      )}

                      {card.cost !== null && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 font-black text-slate-200">
                          Coût : {card.cost}
                        </span>
                      )}

                      {card.power !== null && (
                        <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 font-black text-amber-300">
                          Puissance : {card.power.toLocaleString()}
                        </span>
                      )}

                      {card.counter > 0 && (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 font-bold text-emerald-300">
                          Contre : +{card.counter}
                        </span>
                      )}
                    </div>

                    {/* Archetypes */}
                    {card.type.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap text-[10px] text-slate-400">
                        <Tag className="w-3 h-3 text-slate-500" />
                        <span>{card.type.join(' / ')}</span>
                      </div>
                    )}

                    {/* Card Effect Box */}
                    <div className="p-2.5 rounded-xl bg-[#0B0F17] border border-slate-800/80 space-y-1">
                      <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">
                        {languageMode === 'FR' ? 'Effet Officiel (Scan Vérifié)' : 'Official Card Effect'}
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                        {languageMode === 'FR' ? card.effectFr : card.effect}
                      </p>
                    </div>

                    {/* Meta Synergy Note */}
                    {card.metaAnalysis && (
                      <div className="p-2 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[10px] text-amber-200/90 leading-snug space-y-0.5">
                        <span className="font-bold flex items-center gap-1 text-amber-300">
                          <Flame className="w-3 h-3 text-amber-400" /> Analyse Compétitive :
                        </span>
                        <p>{card.metaAnalysis}</p>
                      </div>
                    )}

                  </div>

                </div>

                {/* Footer Source */}
                <div className="p-2.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 px-4">
                  <span className="truncate max-w-[240px]">Source : {card.source}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Officiel Spoilers & Bandai
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* News Articles Section */
        <div className="space-y-4">
          {NEWS_ARTICLES.map(article => (
            <div
              key={article.id}
              className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-cyan-500/40 transition-all shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                    {article.category}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {article.date}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-slate-400">
                    🇯🇵 Japon : <strong className="text-white">{article.releaseDates.japan}</strong>
                  </span>
                  <span className="text-slate-400">
                    🌍 Monde : <strong className="text-amber-400">{article.releaseDates.global}</strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-start">
                {article.imageUrl && (
                  <div className="w-full md:w-48 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-black/60 border border-slate-700 shadow-md">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}

                <div className="space-y-2 flex-1">
                  <h3 className="text-lg font-black text-white">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {article.content}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  {article.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 text-[10px] font-bold border border-slate-800">
                      #{tag}
                    </span>
                  ))}
                </div>

                {article.sourceUrl && (
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-bold text-xs"
                  >
                    <span>Voir l'article original sur OnePieceTopDecks</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full-Screen HD Zoom Modal */}
      {zoomCard && (
        <div 
          onClick={() => setZoomCard(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full bg-[#0F172A] rounded-2xl border border-cyan-500/50 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200"
          >
            <button
              onClick={() => setZoomCard(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between pr-8">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400">{zoomCard.card.code}</span>
                <h3 className="text-lg font-black text-white">{zoomCard.card.name}</h3>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 font-black text-xs border border-cyan-500/30">
                {zoomCard.card.rarity}
              </span>
            </div>

            <div className="max-h-[60vh] flex items-center justify-center rounded-xl overflow-hidden bg-black/80 border border-slate-800 p-2">
              <img 
                src={zoomCard.imgUrl} 
                alt={zoomCard.card.name} 
                className="max-h-[55vh] w-auto object-contain rounded-lg shadow-2xl" 
              />
            </div>

            <div className="p-3 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Effet Officiel :</span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {languageMode === 'FR' ? zoomCard.card.effectFr : zoomCard.card.effect}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
