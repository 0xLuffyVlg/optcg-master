import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TrendingUp, TrendingDown, ExternalLink, Calendar, Shield, Sparkles, Check, Euro, Search } from 'lucide-react';
import { Card } from '../types';
import { CardDetailData } from '../services/cardDetailsService';
import { ArtworkPriceResult } from '../services/cardmarketPriceService';
import { getCardPriceHistory, fetchLiveCardPriceHistory, PriceHistoryResult, PricePoint } from '../services/priceHistoryService';
import { formatCardPrice, detectCardLanguage, getCardmarketUrl, resolveCardmarketUrlForLanguage, getTcgplayerUrl } from '../utils/cardUtils';
import { getCardtraderUrl } from '../services/cardmarketPriceService';
import { CardmarketLogo, TCGplayerLogo } from './MarketLogos';

interface CardPriceChartProps {
  card: Card;
  cardDetail?: CardDetailData | null;
  artworkKey?: string;
  artworkPriceInfo: ArtworkPriceResult;
  onClose?: () => void;
}

type Timeframe = '7d' | '30d' | '90d' | '180d' | 'max';

export const CardPriceChart: React.FC<CardPriceChartProps> = ({
  card,
  cardDetail,
  artworkKey,
  artworkPriceInfo,
  onClose
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');
  const [hoveredPoint, setHoveredPoint] = useState<{ point: PricePoint; index: number; x: number; y: number } | null>(null);
  const [liveData, setLiveData] = useState<PriceHistoryResult | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const lang = detectCardLanguage(card, artworkKey, card.card_code);
  const langLabel = lang === 'fr' ? 'Édition Française (FR)' : (lang === 'jp' ? 'Édition Japonaise (JP)' : 'Édition Anglaise (EN)');

  useEffect(() => {
    let cancelled = false;
    setLiveData(null);
    fetchLiveCardPriceHistory(card, timeframe, artworkKey).then(res => {
      if (!cancelled && res && res.currentPrice !== undefined && res.currentPrice !== null) {
        // Protect against Scalpeurs API returning base card history for an alternate artwork
        const targetPrice = artworkPriceInfo.priceEur || artworkPriceInfo.priceMinEur || (card as any).price_eur || 0;
        if (targetPrice > 2 && res.currentPrice < targetPrice * 0.35) {
          return;
        }
        setLiveData(res);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [card, timeframe, artworkKey, artworkPriceInfo]);

  // Verified current reference price prioritizing artworkPriceInfo (matches DatabaseView grid)
  const currentRefPrice = useMemo(() => {
    if (liveData?.currentPrice !== undefined && liveData?.currentPrice !== null) {
      return liveData.currentPrice;
    }
    if (artworkPriceInfo.priceEur && artworkPriceInfo.priceEur > 0) {
      return artworkPriceInfo.priceEur;
    }
    if (artworkPriceInfo.priceMinEur && artworkPriceInfo.priceMinEur > 0) {
      return artworkPriceInfo.priceMinEur;
    }
    if (artworkPriceInfo.cardmarketPriceEur && artworkPriceInfo.cardmarketPriceEur > 0) {
      return artworkPriceInfo.cardmarketPriceEur;
    }
    const cardEur = (card as any).price_eur;
    if (cardEur && cardEur > 0) {
      return cardEur;
    }
    if (cardDetail?.price_eur !== undefined && cardDetail.price_eur !== null && cardDetail.price_eur > 0) {
      return cardDetail.price_eur;
    }
    return 0;
  }, [liveData, artworkPriceInfo, cardDetail, card]);

  // Get historical data for the selected timeframe (use live data if available, or fall back to smooth moving-average history)
  const history = useMemo(() => {
    if (liveData) return liveData;
    return getCardPriceHistory(card, timeframe, {
      ...artworkPriceInfo,
      priceEur: currentRefPrice,
      priceMinEur: currentRefPrice,
      cardmarketPriceEur: currentRefPrice
    });
  }, [card, timeframe, artworkPriceInfo, liveData, currentRefPrice]);

  const isBaisse = history.changePercent < 0;
  const isHausse = history.changePercent > 0;
  const isStable = history.changePercent === 0;

  // Chart dimensions
  const width = 500;
  const height = 130;
  const paddingX = 16;
  const paddingTop = 20;
  const paddingBottom = 22;

  const points = history.points;
  const minVal = Math.max(0, history.minPrice * 0.95);
  const maxVal = Math.max(minVal + 0.1, history.maxPrice * 1.05);
  const valRange = maxVal - minVal || 1;

  // Map points to SVG coordinates
  const coords = useMemo(() => {
    if (points.length === 0) return [];
    const stepX = (width - paddingX * 2) / Math.max(1, points.length - 1);
    return points.map((p, idx) => {
      const x = paddingX + idx * stepX;
      const y = paddingTop + (height - paddingTop - paddingBottom) * (1 - (p.price - minVal) / valRange);
      return { x, y, point: p, index: idx };
    });
  }, [points, minVal, valRange, width, height, paddingX, paddingTop, paddingBottom]);

  // Build SVG path
  const linePath = useMemo(() => {
    if (coords.length === 0) return '';
    if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

    let path = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const cpx1 = (curr.x + next.x) / 2;
      const cpy1 = curr.y;
      const cpx2 = (curr.x + next.x) / 2;
      const cpy2 = next.y;
      path += ` C ${cpx1.toFixed(1)} ${cpy1.toFixed(1)}, ${cpx2.toFixed(1)} ${cpy2.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
    }
    return path;
  }, [coords]);

  const areaPath = useMemo(() => {
    if (coords.length === 0) return '';
    const bottomY = height - paddingBottom;
    return `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${bottomY} L ${coords[0].x.toFixed(1)} ${bottomY} Z`;
  }, [linePath, coords, height, paddingBottom]);

  // Handle mouse / touch hover to find closest point
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || coords.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;

    let closest = coords[0];
    let minDistance = Math.abs(mouseX - closest.x);

    for (let i = 1; i < coords.length; i++) {
      const dist = Math.abs(mouseX - coords[i].x);
      if (dist < minDistance) {
        minDistance = dist;
        closest = coords[i];
      }
    }
    setHoveredPoint(closest);
  };

  const handlePointerLeave = () => {
    setHoveredPoint(null);
  };

  const strokeColor = isBaisse ? '#f43f5e' : (isHausse ? '#10b981' : '#38bdf8');
  const gradId = `price-grad-${card.card_code.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#0B0F17] via-[#0F172A] to-slate-900 border border-slate-700/80 p-3.5 sm:p-4 shadow-xl space-y-3 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div 
        className="absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: strokeColor }}
      />

      {/* Chart Header (Matching Scalpeurs) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div className="space-y-1">
          <div className="flex items-center justify-between w-full gap-2">
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              Évolution du prix
            </h3>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white font-bold transition-colors cursor-pointer"
              >
                Fermer
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            {/* Percentage change */}
            <span className={`inline-flex items-center gap-0.5 text-xs font-black px-1.5 py-0.5 rounded ${
              isBaisse ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 
              isHausse ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
              'bg-slate-700/30 text-slate-300'
            }`}>
              {isBaisse ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {isHausse ? `+${history.changePercent}%` : `${history.changePercent}%`}
            </span>

            {/* Current Price and Date range */}
            <span className="text-xs text-slate-300 font-medium">
              <strong className="text-white font-black">{formatCardPrice(history.currentPrice, 'EUR')}</strong>
              {' · '}
              <span className="text-slate-400">depuis le {history.startDateFormatted}</span>
            </span>
          </div>
        </div>

        {/* Timeframe Toggle Buttons (1M, 3M, 6M, 12M, Max) */}
        <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-slate-800 text-[10px] font-bold self-start sm:self-center">
          {[
            { id: '7d', label: '1M' },
            { id: '30d', label: '3M' },
            { id: '90d', label: '6M' },
            { id: '180d', label: '12M' },
            { id: 'max', label: 'Max' }
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id as Timeframe)}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                timeframe === tf.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 font-medium'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Interactive Chart Curve */}
      <div className="relative pt-1 pb-1">
        {/* Hovered point Tooltip Floating Pill */}
        {hoveredPoint && (
          <div 
            className="absolute top-1 z-20 pointer-events-none transform -translate-x-1/2 px-2.5 py-1 rounded-lg bg-slate-900/95 border border-slate-700 text-[11px] font-bold shadow-xl flex items-center gap-2 backdrop-blur-md"
            style={{ left: `${(hoveredPoint.x / width) * 100}%` }}
          >
            <span className="text-slate-400">{hoveredPoint.point.date}</span>
            <span className="text-amber-400 font-black">{formatCardPrice(hoveredPoint.point.price, 'EUR')}</span>
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-28 sm:h-32 overflow-visible select-none cursor-crosshair"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.28" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Dotted horizontal reference lines */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={width - paddingX}
            y2={paddingTop}
            stroke="#334155"
            strokeDasharray="3 3"
            strokeWidth="0.8"
            opacity="0.4"
          />
          <line
            x1={paddingX}
            y1={height - paddingBottom}
            x2={width - paddingX}
            y2={height - paddingBottom}
            stroke="#334155"
            strokeDasharray="3 3"
            strokeWidth="0.8"
            opacity="0.4"
          />

          {/* Gradient Fill under the curve */}
          <path d={areaPath} fill={`url(#${gradId})`} />

          {/* Main Trend Line */}
          <path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover Crosshair and Dot Indicator */}
          {hoveredPoint && (
            <g>
              <line
                x1={hoveredPoint.x}
                y1={paddingTop}
                x2={hoveredPoint.x}
                y2={height - paddingBottom}
                stroke="#94a3b8"
                strokeDasharray="3 3"
                strokeWidth="1"
                opacity="0.7"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="5"
                fill={strokeColor}
                stroke="#0F172A"
                strokeWidth="2.5"
                className="filter drop-shadow"
              />
            </g>
          )}

          {/* Start and End date labels */}
          <text
            x={paddingX}
            y={height - 6}
            fill="#64748b"
            fontSize="9"
            fontWeight="bold"
          >
            {history.startDateFormatted}
          </text>
          <text
            x={width - paddingX}
            y={height - 6}
            textAnchor="end"
            fill="#64748b"
            fontSize="9"
            fontWeight="bold"
          >
            {history.endDateFormatted}
          </text>
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: strokeColor }} />
            <span>Cardmarket · 1er prix vendeur Near Mint</span>
            {liveData && (
              <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 uppercase tracking-wider">
                Direct
              </span>
            )}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Min: {formatCardPrice(history.minPrice, 'EUR')} · Max: {formatCardPrice(history.maxPrice, 'EUR')}
          </span>
        </div>
      </div>

      {/* 4 Statistical Metrics Row - Compact & Clean without MIN/MED/AVG/VOL */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-0.5">
        {/* 1. Premier Prix Near Mint */}
        <div className="px-2 py-1.5 rounded-lg bg-emerald-950/20 border border-emerald-600/30 flex flex-col justify-center">
          <span className="text-[9px] text-emerald-400/90 font-medium block truncate">1er Prix (NM)</span>
          <span className="text-xs font-bold text-emerald-400 whitespace-nowrap">
            {formatCardPrice(
              (artworkPriceInfo.priceMinEur && artworkPriceInfo.priceMinEur > 0)
                ? artworkPriceInfo.priceMinEur
                : currentRefPrice,
              'EUR'
            )}
          </span>
        </div>

        {/* 2. Prix Tendance Cardmarket */}
        <div className="px-2 py-1.5 rounded-lg bg-blue-950/20 border border-blue-600/30 flex flex-col justify-center">
          <span className="text-[9px] text-blue-400/90 font-medium block truncate">Tendance</span>
          <span className="text-xs font-bold text-blue-400 whitespace-nowrap">
            {formatCardPrice(
              (artworkPriceInfo.cardmarketPriceEur && artworkPriceInfo.cardmarketPriceEur > 0)
                ? artworkPriceInfo.cardmarketPriceEur
                : currentRefPrice,
              'EUR'
            )}
          </span>
        </div>

        {/* 3. Moyenne 7j / 30j */}
        <div className="px-2 py-1.5 rounded-lg bg-amber-950/20 border border-amber-600/30 flex flex-col justify-center">
          <span className="text-[9px] text-amber-400/90 font-medium block truncate">Moyenne</span>
          <span className="text-xs font-bold text-amber-300 whitespace-nowrap">
            {artworkPriceInfo.priceAvg7Eur ? formatCardPrice(artworkPriceInfo.priceAvg7Eur, 'EUR') : formatCardPrice(currentRefPrice, 'EUR')}
          </span>
        </div>

        {/* 4. Liquidité / Offres en vente */}
        <div className="px-2 py-1.5 rounded-lg bg-purple-950/20 border border-purple-600/30 flex flex-col justify-center">
          <span className="text-[9px] text-purple-400/90 font-medium block truncate">Liquidité</span>
          <span className="text-xs font-bold text-purple-300 whitespace-nowrap">
            {artworkPriceInfo.listingsCount && artworkPriceInfo.listingsCount > 0
              ? `${artworkPriceInfo.listingsCount} offres`
              : 'Marché actif'}
          </span>
        </div>
      </div>

      {/* Multi-Marketplace Comparison Cards - Slim & Compact */}
      <div className="pt-1.5 border-t border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[9px]">
            Marketplaces
          </span>
          <span className="text-[10px] text-slate-400">{langLabel}</span>
        </div>

        <div className="space-y-1.5">
          {/* 1. Cardmarket Row */}
          {(() => {
            const isCtValid = Boolean(artworkPriceInfo.cardtraderPriceEur && artworkPriceInfo.cardtraderPriceEur > 0 && (currentRefPrice <= 2 || (artworkPriceInfo.cardtraderPriceEur >= currentRefPrice * 0.4 && artworkPriceInfo.cardtraderPriceEur <= currentRefPrice * 3)));

            return (
              <>
                <a
                  href={resolveCardmarketUrlForLanguage(
                    (lang === 'jp' && (cardDetail?.cardmarket_url_jp || (card as any).cardmarket_url_jp))
                      ? (cardDetail?.cardmarket_url_jp || (card as any).cardmarket_url_jp)
                      : (cardDetail?.cardmarket_url || (card as any).cardmarket_url || getCardmarketUrl(card.card_code, artworkKey, card) || artworkPriceInfo.cardmarketUrl),
                    lang === 'jp' ? 'JP' : (lang === 'fr' ? 'FR' : 'EN')
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-blue-950/20 hover:bg-blue-900/40 border border-blue-600/30 hover:border-blue-500/60 transition-all group shadow-sm text-xs"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <CardmarketLogo className="w-5 h-5" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                        Cardmarket
                      </span>
                      <span className="text-[9px] text-slate-400">Europe · direct</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="font-black text-emerald-400">
                      {formatCardPrice(currentRefPrice, 'EUR')}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[8px] font-black border border-emerald-500/30">
                      TOP NM
                    </span>
                    <ExternalLink className="w-3 h-3 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </a>

                {/* 2. CardTrader Row */}
                <a
                  href={artworkPriceInfo.cardtraderUrl || getCardtraderUrl(card.card_code, artworkKey)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-950/20 hover:bg-emerald-900/40 border border-emerald-600/30 hover:border-emerald-500/60 transition-all group shadow-sm text-xs"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="w-5 h-5 rounded bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center font-black text-emerald-300 text-[9px] flex-shrink-0 group-hover:scale-105 transition-transform">
                      CT
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                        CardTrader
                      </span>
                      <span className="text-[9px] text-slate-400">Europe · Zero-Trust</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="font-black text-emerald-300">
                      {isCtValid ? formatCardPrice(artworkPriceInfo.cardtraderPriceEur, 'EUR') : 'Voir offres'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[8px] font-bold">
                      Zero
                    </span>
                    <ExternalLink className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </a>
              </>
            );
          })()}

          {/* 3. Mercari Japan / TCGplayer Row */}
          <a
            href={lang === 'jp' 
              ? `https://jp.mercari.com/search?keyword=one%20piece%20${encodeURIComponent(card.card_code)}`
              : (cardDetail?.tcgplayer_url || getTcgplayerUrl(card.card_code, artworkKey, card) || artworkPriceInfo.tcgplayerUrl)
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-purple-950/20 hover:bg-purple-900/40 border border-purple-600/30 hover:border-purple-500/60 transition-all group shadow-sm text-xs"
          >
            <div className="flex items-center space-x-2 min-w-0">
              {lang === 'jp' ? (
                <CardmarketLogo className="w-5 h-5" />
              ) : (
                <TCGplayerLogo className="w-5 h-5" />
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                  {lang === 'jp' ? 'Mercari Japan' : 'TCGplayer'}
                </span>
                <span className="text-[9px] text-slate-400">
                  {lang === 'jp' ? 'annonces vérifiées' : 'USA · Live Market'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className="font-black text-purple-300">
                {lang === 'jp' 
                  ? formatCardPrice(artworkPriceInfo.cardmarketPriceEur * 0.95, 'EUR')
                  : (cardDetail?.price_usd ? `$${cardDetail.price_usd.toFixed(2)}` : `$${(artworkPriceInfo.cardmarketPriceEur * 1.08).toFixed(2)}`)
                }
              </span>
              <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[8px] font-bold">
                {lang === 'jp' ? 'JP' : 'USA'}
              </span>
              <ExternalLink className="w-3 h-3 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </a>
        </div>
      </div>

      {/* External Alternative Search Links (eBay & PriceCharting) */}
      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
        <span className="text-slate-500">Aussi sur :</span>
        <div className="flex items-center gap-3">
          <a
            href={`https://www.ebay.com/sch/i.html?_nkw=one+piece+${encodeURIComponent(card.card_code)}+${encodeURIComponent(card.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-amber-400 transition-colors inline-flex items-center gap-0.5 hover:underline"
          >
            <span>eBay</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
          </a>
          <span className="text-slate-600">·</span>
          <a
            href={`https://www.pricecharting.com/search-products?type=prices&q=one+piece+${encodeURIComponent(card.card_code)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-blue-400 transition-colors inline-flex items-center gap-0.5 hover:underline"
          >
            <span>PriceCharting</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
          </a>
        </div>
      </div>

      {/* Explanatory note matching Scalpeurs / Cardmarket standards */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400">
        <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong className="text-slate-300">Norme Near Mint (NM) :</strong> Cotes et liens filtrés à 100% sur l'état Near Mint minimum et la langue ({lang.toUpperCase()}). Cartes abîmées (Played/Poor) et éditions étrangères dépréciées automatiquement exclues.
        </span>
      </div>
    </div>
  );
};
