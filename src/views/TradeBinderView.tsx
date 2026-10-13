import React, { useState, useMemo, useEffect } from 'react';
import { 
  FolderSync, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Search, 
  Filter, 
  Sparkles, 
  Layers, 
  Coins, 
  TrendingUp, 
  Download, 
  SlidersHorizontal, 
  MessageSquare, 
  Plus, 
  Minus, 
  Eye, 
  ShieldCheck, 
  Euro, 
  Info,
  CheckCircle2,
  X,
  ShoppingCart,
  Send,
  QrCode,
  Maximize2
} from 'lucide-react';
import QRCode from 'qrcode';
import { Card, TradeBinderItem, TradeBinderShareData } from '../types';
import { allCards, allSetsList, getCardByCode } from '../data/dataProvider';
import { getCardImageUrl, getColorClass, matchesCardSearch } from '../utils/cardUtils';
import { useCollection } from '../context/CollectionContext';
import { useAuth } from '../context/AuthContext';
import { 
  computeDuplicatesFromCollection, 
  encodeTradeBinderToUrl, 
  decodeTradeBinderFromUrl, 
  generateDiscordTradePost, 
  generateTradeCsv 
} from '../utils/tradeBinderUtils';

interface TradeBinderViewProps {
  onSelectCard: (card: Card) => void;
  publicBinderData?: TradeBinderShareData | null;
}

export const TradeBinderView: React.FC<TradeBinderViewProps> = ({
  onSelectCard,
  publicBinderData
}) => {
  const { collection } = useCollection();
  const { user } = useAuth();

  // Mode: Owner (managing duplicates) vs Public Viewer (viewing shared link)
  const isPublicView = Boolean(publicBinderData);

  const [thresholdMode, setThresholdMode] = useState<1 | 4>(1); // 1 = spare (>1x), 4 = excess playset (>4x)
  const [tradeItems, setTradeItems] = useState<TradeBinderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSet, setSelectedSet] = useState('ALL');
  const [selectedRarity, setSelectedRarity] = useState('ALL');
  const [selectedColor, setSelectedColor] = useState('ALL');
  const [minPrice, setMinPrice] = useState<number>(0);

  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [discordContact, setDiscordContact] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDiscord, setCopiedDiscord] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isQrZoomed, setIsQrZoomed] = useState<boolean>(false);

  // Trade Cart (for picking cards during a trade proposal)
  const [tradeCart, setTradeCart] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tradeProposalMessage, setTradeProposalMessage] = useState('');
  const [copiedProposal, setCopiedProposal] = useState(false);

  // Populate trade items from user collection if owner
  useEffect(() => {
    if (!isPublicView) {
      const detected = computeDuplicatesFromCollection(collection, thresholdMode);
      setTradeItems(detected);
    } else if (publicBinderData) {
      const converted: TradeBinderItem[] = publicBinderData.items.map(i => {
        const card = getCardByCode(i.cardCode);
        return {
          cardCode: i.cardCode,
          artworkKey: i.artworkKey,
          card: card || {
            id: i.cardCode,
            card_code: i.cardCode,
            set_code: i.cardCode.split('-')[0] || 'OP01',
            name: i.cardCode,
            category: 'Character',
            rarity: 'SR',
            color: ['Red'],
            cost: 4,
            power: 5000,
            counter: 1000,
            type: ['Mugiwara'],
            attribute: 'Strike',
            trigger: '',
            effect: '',
            _imagePaths: [],
            _defaultImagePath: ''
          },
          totalOwned: i.qty,
          tradeQuantity: i.qty,
          priceEur: i.priceEur,
          condition: (i.cond as any) || 'Near Mint',
          language: (i.lang as any) || 'EN',
          forTrade: true
        };
      });
      setTradeItems(converted);
    }
  }, [collection, thresholdMode, isPublicView, publicBinderData]);

  // Adjust item trade quantity
  const handleUpdateQuantity = (cardCode: string, artworkKey: string | undefined, delta: number) => {
    setTradeItems(prev => prev.map(item => {
      if (item.cardCode === cardCode && item.artworkKey === artworkKey) {
        const newQty = Math.max(0, item.tradeQuantity + delta);
        return { ...item, tradeQuantity: newQty, forTrade: newQty > 0 };
      }
      return item;
    }));
  };

  // Toggle forTrade
  const handleToggleForTrade = (cardCode: string, artworkKey: string | undefined) => {
    setTradeItems(prev => prev.map(item => {
      if (item.cardCode === cardCode && item.artworkKey === artworkKey) {
        return { ...item, forTrade: !item.forTrade };
      }
      return item;
    }));
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return tradeItems.filter(item => {
      if (!item.forTrade) return false;
      if (item.priceEur < minPrice) return false;
      if (selectedSet !== 'ALL' && item.card.set_code !== selectedSet) return false;
      if (selectedRarity !== 'ALL' && item.card.rarity !== selectedRarity) return false;
      if (selectedColor !== 'ALL' && !(item.card.color || []).some(c => c.toLowerCase() === selectedColor.toLowerCase())) return false;
      if (searchQuery.trim() && !matchesCardSearch(item.card, searchQuery)) return false;
      return true;
    });
  }, [tradeItems, minPrice, selectedSet, selectedRarity, selectedColor, searchQuery]);

  // Summary metrics
  const tradeStats = useMemo(() => {
    let totalCards = 0;
    let totalValueEur = 0;
    let highValueCount = 0; // >= 5€

    for (const item of tradeItems) {
      if (!item.forTrade || item.tradeQuantity <= 0) continue;
      totalCards += item.tradeQuantity;
      totalValueEur += item.priceEur * item.tradeQuantity;
      if (item.priceEur >= 5) highValueCount += item.tradeQuantity;
    }

    return {
      totalCards,
      totalReferences: tradeItems.filter(i => i.forTrade && i.tradeQuantity > 0).length,
      totalValueEur,
      highValueCount
    };
  }, [tradeItems]);

  // Public Share URL generation
  const shareUrl = useMemo(() => {
    const shareData: TradeBinderShareData = {
      ownerName: user?.pseudo || 'Joueur OPTCG',
      updatedAt: new Date().toISOString(),
      contactDiscord: discordContact.trim() || undefined,
      notes: customNote.trim() || undefined,
      items: tradeItems.filter(i => i.forTrade && i.tradeQuantity > 0).map(i => ({
        cardCode: i.cardCode,
        artworkKey: i.artworkKey,
        qty: i.tradeQuantity,
        priceEur: i.priceEur,
        cond: i.condition,
        lang: i.language
      }))
    };

    const encoded = encodeTradeBinderToUrl(shareData);
    if (!encoded) return '';
    const baseUrl = window.location.origin || 'https://www.optcg-master.fr';
    return `${baseUrl}/?trade=${encoded}`;
  }, [tradeItems, user, discordContact, customNote]);

  // Generate high-resolution QR Code data URL whenever shareUrl changes
  useEffect(() => {
    if (shareUrl) {
      QRCode.toDataURL(shareUrl, {
        width: 360,
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF'
        }
      })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error('Error generating Trade Binder QR code:', err));
    } else {
      setQrCodeDataUrl('');
    }
  }, [shareUrl]);

  // Cart total value calculation
  const cartStats = useMemo(() => {
    let count = 0;
    let totalEur = 0;
    const itemsList: { item: TradeBinderItem; qty: number }[] = [];

    for (const [key, qty] of Object.entries(tradeCart)) {
      if (qty <= 0) continue;
      const found = tradeItems.find(i => (i.artworkKey ? `${i.cardCode}__${i.artworkKey}` : i.cardCode) === key);
      if (found) {
        count += qty;
        totalEur += found.priceEur * qty;
        itemsList.push({ item: found, qty });
      }
    }

    return { count, totalEur, itemsList };
  }, [tradeCart, tradeItems]);

  // Add/Remove from Trade Cart
  const handleCartAdd = (itemKey: string, maxQty: number) => {
    setTradeCart(prev => {
      const cur = prev[itemKey] || 0;
      if (cur >= maxQty) return prev;
      return { ...prev, [itemKey]: cur + 1 };
    });
  };

  const handleCartRemove = (itemKey: string) => {
    setTradeCart(prev => {
      const cur = prev[itemKey] || 0;
      if (cur <= 1) {
        const next = { ...prev };
        delete next[itemKey];
        return next;
      }
      return { ...prev, [itemKey]: cur - 1 };
    });
  };

  // Generate Trade Proposal Message
  const generateProposalMessage = () => {
    const owner = publicBinderData?.ownerName || 'Joueur';
    let text = `Bonjour ${owner} ! Je suis intéressé par les cartes suivantes de ton classeur d'échanges OPTCG Master :\n\n`;
    for (const { item, qty } of cartStats.itemsList) {
      text += `• ${qty}x ${item.card.name} (${item.cardCode}${item.artworkKey ? ' Alt' : ''}) [${item.card.rarity}] ~ ${(item.priceEur * qty).toFixed(2)} €\n`;
    }
    text += `\n📦 Total : ${cartStats.count} cartes pour une valeur estimée de ~ ${cartStats.totalEur.toFixed(2)} €.\n`;
    text += `Es-tu disponible pour un échange ? Voici ce que j'ai de mon côté / mon classeur !`;
    return text;
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner (Trade Binder Style) */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/95 to-[#0B0F17] border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold">
              <FolderSync className="w-3.5 h-3.5" />
              <span>
                {isPublicView 
                  ? `CLASSEUR D'ÉCHANGES DE ${publicBinderData?.ownerName?.toUpperCase()}` 
                  : 'GESTIONNAIRE DE DOUBLES & LISTE D\'ÉCHANGES'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {isPublicView 
                ? `Cartes à l'Échange de ${publicBinderData?.ownerName}` 
                : 'Mon Classeur d\'Échanges (Trade Binder)'}
            </h1>
            <p className="text-sm text-slate-300">
              {isPublicView
                ? 'Consultez les cartes disponibles à l\'échange, sélectionnez celles qui vous intéressent et préparez votre proposition d\'échange en 1 clic.'
                : 'Détectez automatiquement vos doubles, ajustez vos disponibilités et générez un lien public partageable sur Discord, Facebook et tournois.'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            {!isPublicView ? (
              <>
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Partager mon Classeur</span>
                </button>

                <button
                  onClick={() => {
                    const csv = generateTradeCsv(tradeItems.filter(i => i.forTrade));
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `optcg_trade_binder_${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                  }}
                  className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors cursor-pointer"
                  title="Exporter la liste d'échanges en CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black text-xs shadow-lg shadow-emerald-500/25 transition-all active:scale-95 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Mon Panier d'Échange ({cartStats.count})</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-6 mt-6 border-t border-slate-800/80">
          
          <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Valeur Totale d'Échange</span>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
              {tradeStats.totalValueEur.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Cartes Disponibles</span>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {tradeStats.totalCards} <span className="text-xs text-slate-500 font-normal">exemplaires</span>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Références Uniques</span>
            <p className="text-xl sm:text-2xl font-black text-blue-400 mt-0.5">
              {tradeStats.totalReferences} <span className="text-xs text-slate-500 font-normal">cartes</span>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Cartes de Valeur (&ge; 5€)</span>
            <p className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">
              {tradeStats.highValueCount} <span className="text-xs text-slate-500 font-normal">pépites</span>
            </p>
          </div>

        </div>

      </div>

      {/* Threshold Mode & Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
        
        {/* Mode Selector for Owner */}
        {!isPublicView && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-black text-white">Règle de Détection des Doubles :</span>
            </div>

            <div className="flex items-center p-1 rounded-xl bg-[#0B0F17] border border-slate-800 text-xs">
              <button
                onClick={() => setThresholdMode(1)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  thresholdMode === 1 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tout surplus (&ge; 2 exemplaires)
              </button>
              <button
                onClick={() => setThresholdMode(4)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  thresholdMode === 4 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Garder 1 Playset complet (&gt; 4 exemplaires)
              </button>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une carte, code ou nom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Set */}
          <div>
            <select
              value={selectedSet}
              onChange={(e) => setSelectedSet(e.target.value)}
              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Toutes les extensions</option>
              {allSetsList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Rarity */}
          <div>
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Toutes les raretés</option>
              {['SEC', 'SR', 'L', 'R', 'UC', 'C', 'P'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Min Price */}
          <div>
            <select
              value={minPrice}
              onChange={(e) => setMinPrice(parseFloat(e.target.value))}
              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
            >
              <option value={0}>Tous les prix</option>
              <option value={1}>&ge; 1.00 €</option>
              <option value={5}>&ge; 5.00 € (Pépites)</option>
              <option value={10}>&ge; 10.00 €</option>
              <option value={25}>&ge; 25.00 € (Ultra Rares)</option>
            </select>
          </div>

        </div>

      </div>

      {/* Trade Binder Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3">
          <FolderSync className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Aucune carte trouvée pour l'échange</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {isPublicView 
              ? 'Ce classeur ne contient aucune carte correspondant à vos critères de recherche.' 
              : 'Ajoutez des cartes en plusieurs exemplaires dans votre collection pour remplir automatiquement votre classeur d\'échanges.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
          {filteredItems.map(item => {
            const isAlt = Boolean(item.artworkKey);
            const itemKey = isAlt ? `${item.cardCode}__${item.artworkKey}` : item.cardCode;
            const inCartQty = tradeCart[itemKey] || 0;

            return (
              <div
                key={itemKey}
                className="p-2.5 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 transition-all space-y-2 flex flex-col justify-between group"
              >
                <div className="space-y-1.5">
                  
                  {/* Top Badge: Rarity & Alt */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {item.card.rarity}
                    </span>

                    {isAlt && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        ALT ART
                      </span>
                    )}
                  </div>

                  {/* Card Visual */}
                  <div 
                    onClick={() => onSelectCard(item.card)}
                    className="aspect-[5/7] rounded-lg overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer group-hover:scale-[1.02] transition-transform shadow-md relative"
                  >
                    <img
                      src={getCardImageUrl(item.card, item.artworkKey)}
                      alt={item.card.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Available Trade Quantity Overlay */}
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm border border-slate-700 text-[10px] font-black text-blue-400">
                      {item.tradeQuantity}x dispo
                    </div>
                  </div>

                  {/* Name & Code */}
                  <div>
                    <h4 className="text-xs font-black text-white truncate" title={item.card.name}>
                      {item.card.name}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-400">
                      {item.cardCode}
                    </p>
                  </div>
                </div>

                {/* Price & Quantity / Cart Actions */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-400">
                      {item.priceEur.toFixed(2)} €
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {item.condition}
                    </span>
                  </div>

                  {!isPublicView ? (
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                        <button
                          onClick={() => handleUpdateQuantity(item.cardCode, item.artworkKey, -1)}
                          className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-white px-1.5">{item.tradeQuantity}x</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.cardCode, item.artworkKey, 1)}
                          className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-500 font-bold">
                        {(item.priceEur * item.tradeQuantity).toFixed(2)} €
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCartAdd(itemKey, item.tradeQuantity)}
                      disabled={inCartQty >= item.tradeQuantity}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                        inCartQty > 0
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{inCartQty > 0 ? `Ajouté (${inCartQty}x)` : 'Sélectionner'}</span>
                    </button>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Public Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 relative">
            
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold">
                <Share2 className="w-3.5 h-3.5" />
                <span>PARTAGER MON CLASSEUR D'ÉCHANGES</span>
              </div>
              <h3 className="text-xl font-black text-white">Lien Public & Annonce d'Échanges</h3>
              <p className="text-xs text-slate-400">
                Partagez ce lien avec d'autres joueurs pour qu'ils puissent explorer vos doubles et vous proposer des échanges en direct.
              </p>
            </div>

            {/* QR Code Section for Local Tournaments */}
            <div className="p-4 rounded-2xl bg-[#0B0F17] border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
              {qrCodeDataUrl ? (
                <div 
                  onClick={() => setIsQrZoomed(true)}
                  className="p-2.5 bg-white rounded-2xl shadow-xl cursor-pointer hover:scale-105 transition-transform flex-shrink-0 group relative"
                  title="Cliquer pour afficher en plein écran"
                >
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code Trade Binder" 
                    className="w-28 h-28 sm:w-32 sm:h-32 object-contain rounded-lg" 
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Maximize2 className="w-6 h-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-slate-800 animate-pulse flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-8 h-8 text-slate-600" />
                </div>
              )}

              <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-black text-amber-400">
                  <QrCode className="w-4 h-4" />
                  <span>Scan Instantané Tournoi Local</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Montrez ce QR Code à votre adversaire : il le scanne directement avec son smartphone pour explorer vos cartes disponibles et proposer un échange.
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    onClick={() => setIsQrZoomed(true)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Agrandir</span>
                  </button>

                  {qrCodeDataUrl && (
                    <a
                      href={qrCodeDataUrl}
                      download="optcg-trade-binder-qrcode.png"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      <span>Télécharger PNG</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* URL Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Lien Public Partageable :</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-blue-300 font-mono focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2500);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors flex-shrink-0 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
            </div>

            {/* Optional Discord Contact */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Pseudo Discord (optionnel) :</label>
                <input
                  type="text"
                  placeholder="Ex: Luffy_OP#1234"
                  value={discordContact}
                  onChange={(e) => setDiscordContact(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Note / Ville (optionnel) :</label>
                <input
                  type="text"
                  placeholder="Ex: Paris / Envois Mondial Relay"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Discord Format Preview */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Format d'Annonce Discord Prêt à Poster :</span>
                <button
                  onClick={() => {
                    const post = generateDiscordTradePost(
                      user?.pseudo || 'Joueur',
                      tradeItems.filter(i => i.forTrade),
                      tradeStats.totalValueEur,
                      shareUrl,
                      discordContact
                    );
                    navigator.clipboard.writeText(post);
                    setCopiedDiscord(true);
                    setTimeout(() => setCopiedDiscord(false), 2500);
                  }}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1 cursor-pointer"
                >
                  {copiedDiscord ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDiscord ? 'Annonce Copiée !' : 'Copier pour Discord'}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#0B0F17] border border-slate-800 text-[11px] text-slate-400 font-mono max-h-36 overflow-y-auto whitespace-pre-wrap">
                {generateDiscordTradePost(
                  user?.pseudo || 'Joueur',
                  tradeItems.filter(i => i.forTrade),
                  tradeStats.totalValueEur,
                  shareUrl,
                  discordContact
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Trade Cart / Proposal Modal (for visitors) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 relative">
            
            <button
              onClick={() => setIsCartOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>PROPOSITION D'ÉCHANGE</span>
              </div>
              <h3 className="text-xl font-black text-white">
                Cartes sélectionnées ({cartStats.count})
              </h3>
              <p className="text-xs text-slate-400">
                Valeur totale de votre sélection : <strong className="text-emerald-400">{cartStats.totalEur.toFixed(2)} €</strong>
              </p>
            </div>

            {/* Items List */}
            {cartStats.itemsList.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                Aucune carte sélectionnée. Cliquez sur "Sélectionner" sur les cartes du classeur.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {cartStats.itemsList.map(({ item, qty }) => (
                  <div 
                    key={item.artworkKey ? `${item.cardCode}__${item.artworkKey}` : item.cardCode}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white truncate">{item.card.name}</p>
                      <p className="text-[10px] text-slate-400">{item.cardCode} • {item.priceEur.toFixed(2)}€ /u</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 bg-slate-800 p-0.5 rounded-lg">
                        <button
                          onClick={() => handleCartRemove(item.artworkKey ? `${item.cardCode}__${item.artworkKey}` : item.cardCode)}
                          className="w-5 h-5 rounded bg-slate-700 text-white flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="font-black text-white px-1.5">{qty}x</span>
                        <button
                          onClick={() => handleCartAdd(item.artworkKey ? `${item.cardCode}__${item.artworkKey}` : item.cardCode, item.tradeQuantity)}
                          disabled={qty >= item.tradeQuantity}
                          className="w-5 h-5 rounded bg-slate-700 text-white flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-black text-emerald-400 w-16 text-right">
                        {(item.priceEur * qty).toFixed(2)} €
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Generated Proposal Message */}
            {cartStats.itemsList.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-300">Message de proposition d'échange à envoyer :</span>
                <div className="p-3 rounded-xl bg-[#0B0F17] border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {generateProposalMessage()}
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateProposalMessage());
                    setCopiedProposal(true);
                    setTimeout(() => setCopiedProposal(false), 2500);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-lg shadow-emerald-500/25"
                >
                  {copiedProposal ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                  <span>{copiedProposal ? 'Message Copié !' : 'Copier le Message de Proposition'}</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Zoomed QR Code Modal for Local Tournament Tables */}
      {isQrZoomed && qrCodeDataUrl && (
        <div 
          onClick={() => setIsQrZoomed(false)}
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0F172A] border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95 cursor-default"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                <QrCode className="w-4 h-4" />
                Scan Tournoi Local
              </span>
              <button
                onClick={() => setIsQrZoomed(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl mx-auto">
              <img 
                src={qrCodeDataUrl} 
                alt="QR Code Agrandit" 
                className="w-64 h-64 sm:w-72 sm:h-72 object-contain"
              />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-black text-white">Classeur de {user?.pseudo || 'Joueur'}</h4>
              <p className="text-xs text-slate-400">
                Pointez l'appareil photo du smartphone pour ouvrir instantanément ce classeur
              </p>
            </div>

            <button
              onClick={() => setIsQrZoomed(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
