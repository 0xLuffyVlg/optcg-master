import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Search,
  Filter,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Plus,
  Check,
  FolderHeart,
  Euro,
  Calendar,
  Layers,
  Crown,
  Zap,
  Activity,
  Award
} from 'lucide-react';
import { Card, MarketTrendItem } from '../types';
import { allMarketTrends, getCardByCode } from '../data/dataProvider';
import { getCardImageUrl, getColorClass, handleCardImageError, getCardmarketUrl, detectCardLanguage } from '../utils/cardUtils';
import { formatEur } from '../services/cardmarketPriceService';
import { useCollection } from '../context/CollectionContext';

interface MarketTrendsViewProps {
  onSelectCard: (card: Card) => void;
  onOpenScanner?: () => void;
}

type Timeframe = '7d' | '30d';
type SortMode = 'GAINERS' | 'LOSERS' | 'VOLUME' | 'HIGHEST_PRICE';
type RarityFilter = 'ALL' | 'MANGA' | 'SEC' | 'PARALLEL' | 'SR' | 'LEADER' | 'PROMO';

export const MarketTrendsView: React.FC<MarketTrendsViewProps> = ({
  onSelectCard
}) => {
  const { getTotalCardCopies, addCardToCollection } = useCollection();
  const [timeframe, setTimeframe] = useState<Timeframe>('7d');
  const [sortMode, setSortMode] = useState<SortMode>('GAINERS');
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('ALL');
  const [selectedSet, setSelectedSet] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyMyCollection, setOnlyMyCollection] = useState<boolean>(false);
  const [justAddedCode, setJustAddedCode] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 36;

  // Distinct sets in trends
  const availableSets = useMemo(() => {
    const s = new Set<string>();
    allMarketTrends.forEach(t => {
      if (t.set_code) s.add(t.set_code);
    });
    return Array.from(s).sort();
  }, []);

  // Filtered & Sorted Trends
  const filteredTrends = useMemo(() => {
    let list = [...allMarketTrends];

    // Filter: My Collection Only
    if (onlyMyCollection) {
      list = list.filter(item => getTotalCardCopies(item.card_code) > 0);
    }

    // Filter: Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(item =>
        item.card_code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q)
      );
    }

    // Filter: Set
    if (selectedSet !== 'ALL') {
      list = list.filter(item => item.set_code.toUpperCase() === selectedSet.toUpperCase());
    }

    // Filter: Rarity
    if (rarityFilter !== 'ALL') {
      if (rarityFilter === 'MANGA') {
        list = list.filter(item => item.rarity === 'Manga Rare' || item.name.toLowerCase().includes('manga'));
      } else if (rarityFilter === 'SEC') {
        list = list.filter(item => item.rarity === 'SEC' || item.rarity.includes('Secret'));
      } else if (rarityFilter === 'PARALLEL') {
        list = list.filter(item => item.rarity === 'Alternate Art' || item.rarity === 'SP Card' || item.name.includes('Alternate') || item.name.includes('Parallel') || item.name.includes('SP') || item.rarity.includes('Parallel'));
      } else if (rarityFilter === 'SR') {
        list = list.filter(item => item.rarity === 'SR' || item.rarity.includes('Super Rare'));
      } else if (rarityFilter === 'LEADER') {
        list = list.filter(item => item.category === 'Leader' || item.rarity === 'L' || item.rarity === 'Leader');
      } else if (rarityFilter === 'PROMO') {
        list = list.filter(item => item.rarity === 'Promo' || item.rarity === 'P' || item.rarity.includes('Promo') || item.name.includes('Winner') || item.set_code.startsWith('P'));
      }
    }

    // Sorting
    if (sortMode === 'GAINERS') {
      list.sort((a, b) => timeframe === '7d'
        ? b.change_7d_percent - a.change_7d_percent
        : b.change_30d_percent - a.change_30d_percent
      );
    } else if (sortMode === 'LOSERS') {
      list.sort((a, b) => timeframe === '7d'
        ? a.change_7d_percent - b.change_7d_percent
        : a.change_30d_percent - b.change_30d_percent
      );
    } else if (sortMode === 'VOLUME') {
      list.sort((a, b) => b.volume_score - a.volume_score);
    } else if (sortMode === 'HIGHEST_PRICE') {
      list.sort((a, b) => b.current_price_eur - a.current_price_eur);
    }

    return list;
  }, [allMarketTrends, onlyMyCollection, searchQuery, selectedSet, rarityFilter, sortMode, timeframe]);

  // Pagination
  const displayedTrends = useMemo(() => {
    return filteredTrends.slice(0, page * PAGE_SIZE);
  }, [filteredTrends, page]);

  // Top Highlights
  const topGainer = useMemo(() => {
    return [...allMarketTrends].sort((a, b) => timeframe === '7d'
      ? b.change_7d_percent - a.change_7d_percent
      : b.change_30d_percent - a.change_30d_percent
    )[0];
  }, [allMarketTrends, timeframe]);

  const topManga = useMemo(() => {
    return [...allMarketTrends]
      .filter(t => t.current_price_eur > 80 || t.name.toLowerCase().includes('manga'))
      .sort((a, b) => b.current_price_eur - a.current_price_eur)[0];
  }, [allMarketTrends]);

  const handleQuickAdd = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    addCardToCollection(code, 1);
    setJustAddedCode(code);
    setTimeout(() => setJustAddedCode(null), 1500);
  };

  // Render SVG Sparkline
  const renderSparkline = (points: number[], isPositive: boolean) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 100;
    const height = 32;

    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 8) - 4;
      return x + ',' + y;
    }).join(' ');

    const strokeColor = isPositive ? '#10b981' : '#ef4444';

    return (
      <svg className="w-full h-8 overflow-visible" viewBox={'0 0 ' + width + ' ' + height}>
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords}
        />
      </svg>
    );
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Hero Header & Market Overview Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/95 to-[#0B0F17] border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/30 text-amber-300 text-xs font-black">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>BOURSE & TENDANCES DU MARCHÉ OPTCG</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Top Profits & Évolution des Cotes
            </h1>
            <p className="text-sm text-slate-300">
              Analysez les cartes qui prennent le plus de valeur sur 7 jours et 30 jours, détectez les opportunités d'achat et suivez les variations CardTrader & Cardmarket en direct.
            </p>
          </div>

          {/* Timeframe Toggle Buttons */}
          <div className="flex items-center bg-[#0B0F17] p-1.5 rounded-2xl border border-slate-700/80 shadow-lg flex-shrink-0">
            <button
              onClick={() => { setTimeframe('7d'); setPage(1); }}
              className={'flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all ' + (timeframe === '7d' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black shadow-md shadow-emerald-500/25 scale-105' : 'text-slate-400 hover:text-white')}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>7 Jours (Hebdo)</span>
            </button>
            <button
              onClick={() => { setTimeframe('30d'); setPage(1); }}
              className={'flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all ' + (timeframe === '30d' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/25 scale-105' : 'text-slate-400 hover:text-white')}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>30 Jours (Mensuel)</span>
            </button>
          </div>
        </div>

        {/* 3 Quick Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          
          {/* Highlight 1: Top Gainer */}
          {topGainer && (() => {
            const c = getCardByCode(topGainer.card_code);
            const imgUrl = c ? getCardImageUrl(c) : ('https://images.limitlesstcg.com/one-piece/' + topGainer.set_code + '/' + topGainer.card_code + '.webp');
            return (
              <div 
                onClick={() => {
                  if (c) onSelectCard(c);
                }}
                className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-slate-900 border border-emerald-500/30 shadow-lg hover:border-emerald-400 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between text-xs text-emerald-400 font-extrabold uppercase">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    Top Plus-Value ({timeframe === '7d' ? '7j' : '30j'})
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-black text-[11px] border border-emerald-500/40">
                    +{timeframe === '7d' ? topGainer.change_7d_percent : topGainer.change_30d_percent}%
                  </span>
                </div>
                <div className="flex items-center space-x-3 mt-3">
                  <div className="w-10 h-14 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700">
                    <img
                      src={imgUrl}
                      alt={topGainer.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      onError={(e) => { if (c) handleCardImageError(e, c); else (e.currentTarget as HTMLImageElement).src = '/logo.png'; }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-white truncate">{topGainer.name}</p>
                    <p className="text-[11px] font-mono text-amber-400">{topGainer.card_code} • {topGainer.set_code}</p>
                    <p className="text-sm font-black text-emerald-400 mt-0.5">
                      {formatEur(topGainer.current_price_eur)}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">
                        (+{formatEur(timeframe === '7d' ? topGainer.change_7d_eur : topGainer.change_30d_eur)})
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Highlight 2: Graal / Top Manga */}
          {topManga && (() => {
            const c = getCardByCode(topManga.card_code);
            const imgUrl = c ? getCardImageUrl(c) : ('https://images.limitlesstcg.com/one-piece/' + topManga.set_code + '/' + topManga.card_code + '.webp');
            return (
              <div 
                onClick={() => {
                  if (c) onSelectCard(c);
                }}
                className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/30 to-slate-900 border border-purple-500/30 shadow-lg hover:border-purple-400 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between text-xs text-purple-400 font-extrabold uppercase">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Pièce Maîtresse / Graal
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-black text-[11px] border border-purple-500/40">
                    Manga Rare
                  </span>
                </div>
                <div className="flex items-center space-x-3 mt-3">
                  <div className="w-10 h-14 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 border border-purple-500/40">
                    <img
                      src={imgUrl}
                      alt={topManga.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      onError={(e) => { if (c) handleCardImageError(e, c); else (e.currentTarget as HTMLImageElement).src = '/logo.png'; }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-white truncate">{topManga.name}</p>
                    <p className="text-[11px] font-mono text-purple-300">{topManga.card_code} • {topManga.set_code}</p>
                    <p className="text-sm font-black text-amber-400 mt-0.5">
                      {formatEur(topManga.current_price_eur)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Highlight 3: Personal Portfolio Quick Filter Toggle */}
          <div 
            onClick={() => { setOnlyMyCollection(!onlyMyCollection); setPage(1); }}
            className={'p-4 rounded-2xl border shadow-lg cursor-pointer transition-all flex flex-col justify-between ' + (onlyMyCollection ? 'bg-gradient-to-br from-pink-950/40 to-slate-900 border-pink-500 shadow-pink-500/20 scale-[1.02]' : 'bg-gradient-to-br from-slate-900 to-[#0B0F17] border-slate-800 hover:border-slate-700')}
          >
            <div className="flex items-center justify-between text-xs font-extrabold uppercase">
              <span className="flex items-center gap-1.5 text-pink-400">
                <FolderHeart className="w-4 h-4 text-pink-400" />
                Mon Portefeuille
              </span>
              <span className={'px-2 py-0.5 rounded-md text-[10px] font-black border ' + (onlyMyCollection ? 'bg-pink-500 text-black border-pink-400' : 'bg-slate-800 text-slate-400 border-slate-700')}
              >
                {onlyMyCollection ? 'ACTIF' : 'TOUTES LES CARTES'}
              </span>
            </div>
            <div className="mt-2">
              <p className="text-xs font-bold text-white">
                {onlyMyCollection ? 'Affichage limité à vos cartes possédées' : 'Filtrer mes cartes possédées'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Cliquez pour voir vos plus-values et pertes personnelles sur votre propre collection.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Filter & Sorting Controls Bar */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
        
        {/* Top Controls: Search Bar + Sort Mode Tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une carte (Zoro, OP01-001...)"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0F17] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Sort Mode Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar w-full md:w-auto p-1 bg-[#0B0F17] rounded-xl border border-slate-800">
            <button
              onClick={() => { setSortMode('GAINERS'); setPage(1); }}
              className={'px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 whitespace-nowrap ' + (sortMode === 'GAINERS' ? 'bg-emerald-500 text-black shadow-md' : 'text-slate-400 hover:text-white')}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>🚀 Top Profits (+%)</span>
            </button>

            <button
              onClick={() => { setSortMode('LOSERS'); setPage(1); }}
              className={'px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 whitespace-nowrap ' + (sortMode === 'LOSERS' ? 'bg-red-500 text-white shadow-md' : 'text-slate-400 hover:text-white')}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>📉 Top Baisses (-%)</span>
            </button>

            <button
              onClick={() => { setSortMode('VOLUME'); setPage(1); }}
              className={'px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 whitespace-nowrap ' + (sortMode === 'VOLUME' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white')}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>🔥 Plus Échangées</span>
            </button>

            <button
              onClick={() => { setSortMode('HIGHEST_PRICE'); setPage(1); }}
              className={'px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 whitespace-nowrap ' + (sortMode === 'HIGHEST_PRICE' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white')}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>💎 Plus Chères (€)</span>
            </button>
          </div>

        </div>

        {/* Secondary Filters: Rarity Pills + Set Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          
          {/* Rarity Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'ALL', label: 'Toutes les Raretés' },
              { id: 'MANGA', label: 'Manga Rares ⭐' },
              { id: 'SEC', label: 'Secret Rare (SEC)' },
              { id: 'PARALLEL', label: 'Alternate Art / SP' },
              { id: 'SR', label: 'Super Rare (SR)' },
              { id: 'LEADER', label: 'Leaders' },
              { id: 'PROMO', label: 'Promos & Winner' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => { setRarityFilter(r.id as RarityFilter); setPage(1); }}
                className={'px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ' + (rarityFilter === r.id ? 'bg-amber-400 text-black font-black scale-105 shadow-md' : 'bg-[#0B0F17] border border-slate-700/80 text-slate-300 hover:text-white')}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Set Selector Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-400">Extension :</span>
            <select
              value={selectedSet}
              onChange={(e) => { setSelectedSet(e.target.value); setPage(1); }}
              className="p-1.5 rounded-xl bg-[#0B0F17] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Toutes les Extensions</option>
              {availableSets.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Market Cards Grid */}
      {displayedTrends.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          <Activity className="w-12 h-12 mx-auto mb-2 opacity-30 text-amber-400" />
          <p className="text-sm font-bold text-slate-300">Aucune carte ne correspond à ces filtres de marché.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setRarityFilter('ALL');
              setSelectedSet('ALL');
              setOnlyMyCollection(false);
              setSortMode('GAINERS');
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-black"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedTrends.map((trend) => {
            const card = getCardByCode(trend.card_code);
            const isAltPrint = trend.card_code.includes('_') || trend.card_code.includes('-r');
            const cardImg = card ? getCardImageUrl(card, trend.card_code) : ('https://images.limitlesstcg.com/one-piece/' + trend.set_code + '/' + trend.card_code + '.webp');
            const isPositive = timeframe === '7d' ? trend.change_7d_percent >= 0 : trend.change_30d_percent >= 0;
            const pctChange = timeframe === '7d' ? trend.change_7d_percent : trend.change_30d_percent;
            const eurChange = timeframe === '7d' ? trend.change_7d_eur : trend.change_30d_eur;
            const oldPrice = timeframe === '7d' ? trend.price_7d_ago : trend.price_30d_ago;
            const sparklineData = timeframe === '7d' ? trend.sparkline_7d : trend.sparkline_30d;
            const ownedCount = getTotalCardCopies(trend.card_code);

            return (
              <div
                key={trend.card_code}
                onClick={() => {
                  if (card) {
                    if (isAltPrint) {
                      const imgName = trend.card_code.endsWith('.png') ? trend.card_code : `${trend.card_code}.png`;
                      onSelectCard({ ...card, _defaultImagePath: imgName });
                    } else {
                      onSelectCard(card);
                    }
                  }
                }}
                className="group rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-amber-400/80 shadow-lg hover:shadow-amber-500/10 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                
                {/* Card Top Section: Image + Details + Percent Badge */}
                <div className="p-3.5 space-y-3">
                  
                  <div className="flex items-start space-x-3">
                    
                    {/* Visual Thumbnail */}
                    <div className="relative w-16 h-22 rounded-xl bg-slate-950 overflow-hidden flex-shrink-0 border border-slate-700 shadow-md">
                      <img
                        src={cardImg}
                        alt={trend.name}
                        onError={(e) => { if (card) handleCardImageError(e, card); }}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                        loading="lazy"
                      />
                      <div className="absolute top-1 right-1 px-1 rounded bg-black/80 text-[8px] font-black text-amber-400">
                        {trend.rarity}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-black text-amber-400">{trend.card_code}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{trend.set_code}</span>
                      </div>
                      <h3 className="text-xs font-extrabold text-white truncate group-hover:text-amber-300 transition-colors" title={trend.name}>
                        {trend.name}
                      </h3>

                      {/* Percentage Variation Badge */}
                      <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg text-xs font-black mt-1"
                        style={{
                          backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isPositive ? '#34d399' : '#f87171',
                          border: '1px solid ' + (isPositive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)')
                        }}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        <span>{isPositive ? '+' : ''}{pctChange}%</span>
                        <span className="text-[10px] opacity-75">({timeframe === '7d' ? '7j' : '30j'})</span>
                      </div>
                    </div>

                  </div>

                  {/* Pricing Comparison (Old vs Current) */}
                  <div className="p-2 rounded-xl bg-[#0B0F17] border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Prix {timeframe === '7d' ? 'il y a 7j' : 'il y a 30j'}</span>
                      <span className="text-slate-300 font-bold line-through">{formatEur(oldPrice)}</span>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400 font-bold block">Cote Actuelle (CT)</span>
                      <span className="text-sm font-black text-white">{formatEur(trend.current_price_eur)}</span>
                    </div>
                  </div>

                  {/* Sparkline Visual Graph */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-medium mb-1">
                      <span>Courbe {timeframe === '7d' ? '7 jours' : '30 jours'}</span>
                      <span className={isPositive ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                        {isPositive ? '+' : ''}{formatEur(eurChange)}
                      </span>
                    </div>
                    {renderSparkline(sparklineData, isPositive)}
                  </div>

                </div>

                {/* Footer Action Links: CardTrader Direct + Cardmarket + Quick Add */}
                <div className="p-2.5 bg-[#0B0F17] border-t border-slate-800 flex items-center justify-between gap-1.5">
                  
                  {/* Direct CardTrader Link */}
                  <a
                    href={trend.cardtrader_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-black transition-all"
                    title="Acheter sur CardTrader (Lien officiel vérifié)"
                  >
                    <span>CardTrader</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-75" />
                  </a>

                  {/* Direct Cardmarket Link */}
                  <a
                    href={getCardmarketUrl(trend.card_code, undefined, card || trend.card_code)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[10px] font-black transition-all"
                    title={`Voir la version ${detectCardLanguage(card || trend.card_code).toUpperCase()} sur Cardmarket`}
                  >
                    <span>Cardmarket {detectCardLanguage(card || trend.card_code).toUpperCase()}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-75" />
                  </a>

                  {/* Quick Add to Collection Button */}
                  <button
                    onClick={(e) => handleQuickAdd(trend.card_code, e)}
                    className={'p-1.5 rounded-lg border transition-all ' + (justAddedCode === trend.card_code ? 'bg-emerald-500 text-black border-emerald-400' : (ownedCount > 0 ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 hover:bg-pink-500/30' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'))}
                    title={ownedCount > 0 ? (ownedCount + 'x dans votre collection (+1)') : 'Ajouter à ma collection (+1)'}
                  >
                    {justAddedCode === trend.card_code ? (
                      <Check className="w-3.5 h-3.5 text-black" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {displayedTrends.length < filteredTrends.length && (
        <div className="text-center pt-4">
          <button
            onClick={() => setPage(prev => prev + 1)}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors shadow-lg"
          >
            Afficher plus de cartes ({displayedTrends.length} / {filteredTrends.length})
          </button>
        </div>
      )}

    </div>
  );
};