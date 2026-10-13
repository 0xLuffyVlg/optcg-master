import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Minus, 
  Trash2, 
  Edit3, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Boxes, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Download, 
  Upload, 
  DollarSign, 
  Info, 
  X, 
  Check, 
  ExternalLink, 
  ChevronRight, 
  AlertCircle,
  Globe,
  Coins
} from 'lucide-react';
import { SealedProduct, SealedCategory, SealedItemCondition, UserSealedItem, SealedLanguage } from '../types';
import { allSealedProducts, getSealedProductById, getProductPriceForLanguage, getSealedProductImage, getCardtraderUrl, getCardmarketUrl, SealedProductWithImages } from '../data/sealedProductsData';
import { useSealed } from '../context/SealedContext';

interface SealedProductsViewProps {
  onSelectCategory?: (category: SealedCategory) => void;
}

const sealedCategories: { id: SealedCategory | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'Tout le Scellé' },
  { id: 'display', label: 'Displays & Boîtes' },
  { id: 'starter_deck', label: 'Starter Decks (ST)' },
  { id: 'collector_box', label: 'Coffrets Collectors' },
  { id: 'booster', label: 'Boosters Individuels' },
  { id: 'double_pack', label: 'Double Packs' },
  { id: 'other', label: 'Autres' },
];

export const SealedProductImage: React.FC<{
  product?: SealedProductWithImages | SealedProduct | null;
  customImageUrl?: string;
  className?: string;
  alt?: string;
}> = ({ product, customImageUrl, className = 'w-full h-full object-contain', alt = 'Produit Scellé' }) => {
  const [imgErrorStep, setImgErrorStep] = useState(0);

  const initialSrc = useMemo(() => {
    if (customImageUrl) return customImageUrl;
    if (!product) return 'https://placehold.co/400x300/1e293b/94a3b8?text=Produit+Scell%C3%A9';
    return product.imageUrl || (product as any).boosterImageUrl || '';
  }, [product, customImageUrl]);

  const [currentSrc, setCurrentSrc] = useState(initialSrc);

  React.useEffect(() => {
    setImgErrorStep(0);
    setCurrentSrc(initialSrc);
  }, [initialSrc]);

  const handleError = () => {
    const p = product as any;
    if (imgErrorStep === 0 && p?.boosterImageUrl && p.boosterImageUrl !== currentSrc) {
      // Step 1: Try booster pack visual if display box visual had an issue
      setImgErrorStep(1);
      setCurrentSrc(p.boosterImageUrl);
    } else {
      // Step 2: Show stylish branded sealed box placeholder
      setImgErrorStep(2);
    }
  };

  if (imgErrorStep >= 2 || !currentSrc) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center p-2 text-center rounded-lg border border-slate-700/50">
        <Package className="w-6 h-6 text-amber-400 mb-1" />
        <span className="text-[10px] font-black text-white leading-tight line-clamp-1">
          {product?.code || 'SCELLÉ'}
        </span>
        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
          {product?.category || 'PRODUIT'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleError}
      className={className}
      loading="lazy"
    />
  );
};

export const SealedProductsView: React.FC<SealedProductsViewProps> = () => {
  const { 
    sealedItems, 
    addSealedItem, 
    updateSealedItem, 
    removeSealedItem, 
    stats, 
    exportSealedJson, 
    importSealedJson, 
    clearSealedItems 
  } = useSealed();

  const [selectedCategory, setSelectedCategory] = useState<SealedCategory | 'ALL'>('ALL');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<SealedLanguage | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserSealedItem | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [catalogLanguageFilter, setCatalogLanguageFilter] = useState<SealedLanguage | 'ALL'>('ALL');

  // Streamlined Form State (Only what user needs to provide)
  const [formProductId, setFormProductId] = useState<string>('');
  const [formCustomName, setFormCustomName] = useState<string>('');
  const [formCustomCategory, setFormCustomCategory] = useState<SealedCategory>('display');
  const [formQuantity, setFormQuantity] = useState<number>(1);
  const [formPurchasePrice, setFormPurchasePrice] = useState<number>(119.99);
  const [formCondition, setFormCondition] = useState<SealedItemCondition>('sealed');
  const [formLanguage, setFormLanguage] = useState<SealedLanguage>('EN');
  const [formNotes, setFormNotes] = useState<string>('');

  // Selected product object for price calculations
  const selectedProduct = useMemo(() => {
    return getSealedProductById(formProductId) || null;
  }, [formProductId]);

  // Current CardTrader market price based on language
  const currentCardtraderMarketPrice = useMemo(() => {
    if (!selectedProduct) return 120.0;
    return getProductPriceForLanguage(selectedProduct, formLanguage);
  }, [selectedProduct, formLanguage]);

  // Handle changing language in the form
  const handleFormLanguageChange = (newLang: SealedLanguage) => {
    setFormLanguage(newLang);
    if (!editingItem && selectedProduct) {
      const suggestedPurchase = newLang === 'JP' ? Math.round(selectedProduct.msrpEur * 0.4) : selectedProduct.msrpEur;
      setFormPurchasePrice(suggestedPurchase);
    }
  };

  // Open modal for an official catalog item
  const handleOpenAddCatalogItem = (product: SealedProductWithImages, defaultLang: SealedLanguage = 'EN') => {
    setFormProductId(product.id);
    setFormCustomName('');
    setFormCustomCategory(product.category);
    setFormQuantity(1);
    const msrp = defaultLang === 'JP' ? Math.round(product.msrpEur * 0.4) : product.msrpEur;
    setFormPurchasePrice(msrp);
    setFormCondition('sealed');
    setFormLanguage(defaultLang);
    setFormNotes('');
    setEditingItem(null);
    setIsAddModalOpen(true);
    setIsCatalogOpen(false);
  };

  // Open modal for custom item
  const handleOpenAddCustom = () => {
    setFormProductId('custom');
    setFormCustomName('');
    setFormCustomCategory('display');
    setFormQuantity(1);
    setFormPurchasePrice(100);
    setFormCondition('sealed');
    setFormLanguage('EN');
    setFormNotes('');
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  // Open modal to edit existing user item
  const handleOpenEditItem = (item: UserSealedItem) => {
    setEditingItem(item);
    setFormProductId(item.productId);
    setFormCustomName(item.customName || '');
    setFormCustomCategory(item.customCategory || 'display');
    setFormQuantity(item.quantity);
    setFormPurchasePrice(item.purchasePriceEur);
    setFormCondition(item.condition);
    setFormLanguage(item.language);
    setFormNotes(item.notes || '');
    setIsAddModalOpen(true);
  };

  // Save Add / Edit
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    const currentMarket = currentCardtraderMarketPrice;

    if (editingItem) {
      updateSealedItem(editingItem.id, {
        productId: formProductId,
        customName: formProductId === 'custom' ? formCustomName : undefined,
        customCategory: formProductId === 'custom' ? formCustomCategory : undefined,
        quantity: Math.max(1, formQuantity),
        purchasePriceEur: Math.max(0, formPurchasePrice),
        currentPriceEur: currentMarket,
        condition: formCondition,
        language: formLanguage,
        notes: formNotes
      });
    } else {
      addSealedItem({
        productId: formProductId,
        customName: formProductId === 'custom' ? formCustomName : undefined,
        customCategory: formProductId === 'custom' ? formCustomCategory : undefined,
        quantity: Math.max(1, formQuantity),
        purchasePriceEur: Math.max(0, formPurchasePrice),
        currentPriceEur: currentMarket,
        condition: formCondition,
        language: formLanguage,
        notes: formNotes
      });
    }
    setIsAddModalOpen(false);
    setEditingItem(null);
  };

  // Filtered user-owned items
  const filteredUserItems = useMemo(() => {
    return sealedItems.filter(item => {
      const product = getSealedProductById(item.productId);
      const cat = item.customCategory || product?.category || 'other';
      const name = item.customName || product?.name || '';
      const code = product?.code || '';

      if (selectedCategory !== 'ALL' && cat !== selectedCategory) return false;
      if (selectedLanguageFilter !== 'ALL' && item.language !== selectedLanguageFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return name.toLowerCase().includes(q) || code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [sealedItems, selectedCategory, selectedLanguageFilter, searchQuery]);

  // Catalog filtered list
  const filteredCatalog = useMemo(() => {
    return allSealedProducts.filter(prod => {
      if (selectedCategory !== 'ALL' && prod.category !== selectedCategory) return false;
      if (catalogLanguageFilter !== 'ALL') {
        const available = prod.languagesAvailable || ['EN', 'JP'];
        if (!available.includes(catalogLanguageFilter)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return prod.name.toLowerCase().includes(q) || prod.code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedCategory, catalogLanguageFilter, searchQuery]);

  const conditionLabels: Record<SealedItemCondition, { label: string; desc: string; color: string }> = {
    sealed: { label: "Scellé d'origine (Mint)", desc: "Scellage usine intact sans accroc", color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40' },
    case: { label: 'Case Scellée (Carton)', desc: "Carton maître scellé d'origine", color: 'text-purple-400 bg-purple-950/60 border-purple-800/40' },
    damaged: { label: 'Léger Défaut', desc: "Boîte légèrement enfoncée ou pliée", color: 'text-amber-400 bg-amber-950/60 border-amber-800/40' },
    opened: { label: 'Boîte Déballée', desc: "Boîte ouverte / scellé rompu", color: 'text-rose-400 bg-rose-950/60 border-rose-800/40' },
  };

  const languageBadges: Record<SealedLanguage, { label: string; flag: string; badgeClass: string }> = {
    FR: { label: 'Français', flag: '🇫🇷', badgeClass: 'bg-blue-900/60 text-blue-300 border-blue-600/40' },
    EN: { label: 'Anglais', flag: '🇬🇧', badgeClass: 'bg-indigo-900/60 text-indigo-300 border-indigo-600/40' },
    JP: { label: 'Japonais', flag: '🇯🇵', badgeClass: 'bg-red-900/60 text-red-300 border-red-600/40' }
  };

  return (
    <div className="space-y-6">

      {/* Hero Header & Portfolio P&L Summary */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/95 to-[#0B0F17] border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Boxes className="w-3.5 h-3.5" />
              <span>PORTFOLIO PRODUITS SCELLÉS ONE PIECE TCG</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Gestionnaire de Displays, ST & Coffrets
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Visuels officiels des <strong>Displays (Boîtes de 24 Boosters)</strong>, <strong>Boosters individuels</strong>, <strong>Starter Decks</strong> et <strong>Coffrets Collectors</strong> avec cotes en temps réel <strong>CardTrader</strong>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsCatalogOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Ajouter depuis le Catalogue ({allSealedProducts.length})</span>
            </button>

            <button
              onClick={handleOpenAddCustom}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              <span>+ Item Personnalisé</span>
            </button>
          </div>

        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Total Investi</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg sm:text-xl font-black text-slate-200">
                {stats.totalInvestedEur.toFixed(2)} €
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Cote Marché CardTrader</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg sm:text-xl font-black text-amber-400">
                {stats.totalMarketValueEur.toFixed(2)} €
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Plus-Value Nette (P&L)</span>
            <div className="flex items-baseline space-x-1.5">
              <span className={`text-lg sm:text-xl font-black ${stats.totalDeltaEur >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stats.totalDeltaEur >= 0 ? `+${stats.totalDeltaEur.toFixed(2)} €` : `${stats.totalDeltaEur.toFixed(2)} €`}
              </span>
              <span className={`text-xs font-bold ${stats.totalDeltaPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({stats.totalDeltaPct >= 0 ? `+${stats.totalDeltaPct.toFixed(1)}%` : `${stats.totalDeltaPct.toFixed(1)}%`})
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Stock Scellé</span>
            <div className="text-xs text-slate-300 font-bold flex items-center space-x-2 pt-1 flex-wrap">
              <span>{stats.totalDisplaysCount} Boîtes</span>
              <span>•</span>
              <span>{stats.totalStartersCount} Decks</span>
              <span>•</span>
              <span>{stats.totalCollectorsCount} Coffrets</span>
            </div>
          </div>

        </div>

      </div>

      {/* Filter Tabs & Language Switcher & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-[#0F172A] border border-slate-800">
        
        {/* Category Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {sealedCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Right side: Language filter chips + Search */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          
          {/* Language filter */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 p-0.5 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setSelectedLanguageFilter('ALL')}
              className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                selectedLanguageFilter === 'ALL'
                  ? 'bg-amber-500 text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Toutes Langues
            </button>
            <button
              onClick={() => setSelectedLanguageFilter('FR')}
              className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                selectedLanguageFilter === 'FR'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🇫🇷 FR
            </button>
            <button
              onClick={() => setSelectedLanguageFilter('EN')}
              className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                selectedLanguageFilter === 'EN'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🇬🇧 ENG
            </button>
            <button
              onClick={() => setSelectedLanguageFilter('JP')}
              className={`flex-1 sm:flex-initial px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                selectedLanguageFilter === 'JP'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🇯🇵 JAP
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

        </div>

      </div>

      {/* User Sealed Items Grid */}
      {filteredUserItems.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-[#0F172A] border border-slate-800 space-y-4">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Aucun produit scellé dans cette sélection</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Ajoutez vos Displays scellées, Starter Decks ou Coffrets (versions 🇫🇷 FR, 🇬🇧 ENG ou 🇯🇵 JAP) pour suivre votre collection et calculer votre plus-value automatiquement.
            </p>
          </div>
          <button
            onClick={() => setIsCatalogOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Parcourir le Catalogue ({allSealedProducts.length} Produits)</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUserItems.map(item => {
            const product = getSealedProductById(item.productId);
            const name = item.customName || product?.name || 'Produit Scellé';
            const condInfo = conditionLabels[item.condition] || conditionLabels.sealed;
            const langBadge = languageBadges[item.language] || languageBadges.EN;

            const unitPurchase = item.purchasePriceEur;
            const livePrice = product ? getProductPriceForLanguage(product, item.language) : 0;
            const unitCurrent = livePrice > 0 ? livePrice : (item.currentPriceEur || 0);
            const totalPurchase = unitPurchase * item.quantity;
            const totalCurrent = unitCurrent * item.quantity;
            const deltaEur = totalCurrent - totalPurchase;
            const deltaPct = totalPurchase > 0 ? (deltaEur / totalPurchase) * 100 : 0;

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 transition-all space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top tags & Action buttons */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${condInfo.color}`}>
                        {condInfo.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${langBadge.badgeClass}`}>
                        {langBadge.flag} {item.language}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <a
                        href={getCardtraderUrl(product, item.language)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title={`Voir les offres ${item.language || 'EN'} sur CardTrader`}
                      >
                        <span>CardTrader</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      <button
                        onClick={() => handleOpenEditItem(item)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Modifier ce produit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Supprimer ${name} de votre stock scellé ?`)) {
                            removeSealedItem(item.id);
                          }
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Visual & Product Info */}
                  <div className="flex items-start space-x-3">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 flex-shrink-0 flex items-center justify-center p-1">
                      <SealedProductImage
                        product={product}
                        customImageUrl={item.customImageUrl}
                        alt={name}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-black text-white line-clamp-2 leading-tight" title={name}>
                        {name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-mono font-bold text-amber-400">
                          {product?.code || 'CUSTOM'}
                        </span>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-[10px] text-slate-400">
                          {product?.category || 'Scellé'}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-[10px] text-slate-400 italic mt-1 truncate">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price Metrics & Quantity Controller */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-[9px] text-slate-400 uppercase block font-bold">Prix Achat</span>
                      <span className="text-xs font-bold text-slate-300">{unitPurchase.toFixed(2)} €</span>
                    </div>

                    <a
                      href={getCardtraderUrl(product, item.language)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 hover:bg-emerald-900/40 hover:border-emerald-400 transition-colors group cursor-pointer block"
                      title="Ouvrir la page CardTrader pour ce produit"
                    >
                      <span className="text-[9px] text-emerald-400 uppercase flex items-center justify-between font-bold">
                        <span>CardTrader ({item.language})</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                      <span className="text-xs font-black text-emerald-300 group-hover:text-emerald-200 transition-colors">{unitCurrent.toFixed(2)} €</span>
                    </a>
                  </div>


                  {/* Quantity & P&L row */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateSealedItem(item.id, { quantity: item.quantity - 1 });
                          } else {
                            removeSealedItem(item.id);
                          }
                        }}
                        className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-black text-white px-1.5">{item.quantity}x</span>
                      <button
                        onClick={() => updateSealedItem(item.id, { quantity: item.quantity + 1 })}
                        className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-black ${deltaEur >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {deltaEur >= 0 ? `+${deltaEur.toFixed(2)} €` : `${deltaEur.toFixed(2)} €`}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        ({deltaPct >= 0 ? `+${deltaPct.toFixed(1)}%` : `${deltaPct.toFixed(1)}%`})
                      </span>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Official Catalog Drawer / Modal */}
      {isCatalogOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 relative">
            
            <button
              onClick={() => setIsCatalogOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <Boxes className="w-3.5 h-3.5" />
                <span>CATALOGUE OFFICIEL CARDTRADER ({allSealedProducts.length} PRODUITS)</span>
              </div>
              <h3 className="text-xl font-black text-white">Sélectionnez le produit scellé à ajouter</h3>
              <p className="text-xs text-slate-400">
                Displays, Boosters individuels, Decks ST et Coffrets Collectors avec visuels réels et cotes <strong>CardTrader</strong>.
              </p>
            </div>

            {/* Catalog Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                {sealedCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-amber-500 text-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-1.5 justify-end">
                <span className="text-[11px] font-bold text-slate-400">Édition :</span>
                <button
                  onClick={() => setCatalogLanguageFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    catalogLanguageFilter === 'ALL'
                      ? 'bg-amber-500 text-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setCatalogLanguageFilter('FR')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    catalogLanguageFilter === 'FR'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇫🇷 FR
                </button>
                <button
                  onClick={() => setCatalogLanguageFilter('EN')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    catalogLanguageFilter === 'EN'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇬🇧 ENG
                </button>
                <button
                  onClick={() => setCatalogLanguageFilter('JP')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    catalogLanguageFilter === 'JP'
                      ? 'bg-red-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🇯🇵 JAP
                </button>
              </div>
            </div>

            {/* Custom Add Trigger */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-amber-300">Votre produit n'est pas dans le catalogue ?</h4>
                <p className="text-[11px] text-slate-300">Ajoutez une case spéciale, un lot scellé ou un item customisé.</p>
              </div>
              <button
                onClick={handleOpenAddCustom}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-colors cursor-pointer"
              >
                + Ajouter Custom
              </button>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[55vh] overflow-y-auto pr-1">
              {filteredCatalog.map(prod => {
                const availableLangs = prod.languagesAvailable || ['EN', 'JP'];
                return (
                  <div
                    key={prod.id}
                    onClick={() => handleOpenAddCatalogItem(prod, availableLangs.includes('FR') ? 'FR' : 'EN')}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/60 cursor-pointer flex items-center space-x-3 transition-all group"
                  >
                    <div className="w-16 h-18 rounded-lg bg-slate-950 border border-slate-800 p-1 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                      <SealedProductImage
                        product={prod}
                        alt={prod.name}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-black text-white line-clamp-2 group-hover:text-amber-400 transition-colors">
                        {prod.name}
                      </h5>
                      <div className="flex items-center space-x-1.5 mt-1">
                        {availableLangs.map(l => (
                          <span
                            key={l}
                            className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${
                              l === 'FR' ? 'bg-blue-950 text-blue-300 border-blue-600/40' :
                              l === 'EN' ? 'bg-indigo-950 text-indigo-300 border-indigo-600/40' :
                              'bg-red-950 text-red-300 border-red-600/40'
                            }`}
                          >
                            {l}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Cote CardTrader : <strong className="text-emerald-400">{prod.estimatedMarketEur}€</strong>
                        {prod.estimatedMarketJapEur && (
                          <span className="text-red-300 ml-1">(JAP: {prod.estimatedMarketJapEur}€)</span>
                        )}
                      </p>
                      <div className="flex items-center space-x-2 mt-1.5">
                        <a
                          href={getCardtraderUrl(prod)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[9px] font-bold transition-colors"
                          title="Voir sur CardTrader"
                        >
                          <span>CardTrader</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        <a
                          href={getCardmarketUrl(prod)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-950/80 hover:bg-blue-900 border border-blue-500/40 text-blue-300 text-[9px] font-bold transition-colors"
                          title="Voir sur Cardmarket"
                        >
                          <span>Cardmarket</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <span className="text-[9px] font-mono text-amber-400/80 font-bold block mt-1">
                        {prod.code}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* Streamlined Add / Edit Form Modal (Only asks for Langue, Quantité, État, Prix d'Achat) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 relative">
            
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header: Product Preview with CardTrader live price badge */}
            {selectedProduct ? (
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3.5">
                <div className="w-16 h-18 rounded-lg bg-slate-950 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-800">
                  <SealedProductImage
                    product={selectedProduct}
                    alt={selectedProduct.name}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-amber-400 font-mono font-bold block">
                    {selectedProduct.code}
                  </span>
                  <h3 className="text-sm font-black text-white truncate">
                    {selectedProduct.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1.5 flex-wrap gap-y-1">
                    <a
                      href={getCardtraderUrl(selectedProduct, formLanguage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 hover:bg-emerald-900/60 hover:border-emerald-400 text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
                      title="Ouvrir la page CardTrader pour ce produit"
                    >
                      <span>Cote CardTrader ({formLanguage}) :</span>
                      <span className="font-black text-emerald-400">{currentCardtraderMarketPrice.toFixed(2)} €</span>
                      <ExternalLink className="w-3 h-3 text-emerald-400 ml-0.5" />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <label className="text-xs font-bold text-slate-300 block mb-1">Nom du Produit Custom :</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Case Scellée OP-05 (12 Displays)"
                  value={formCustomName}
                  onChange={(e) => setFormCustomName(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            <form onSubmit={handleSaveItem} className="space-y-4">
              
              {/* 1. Langue */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center justify-between">
                  <span>1. Langue / Édition :</span>
                  <span className="text-[10px] text-slate-400 font-normal">Adapte la cote CardTrader</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleFormLanguageChange('FR')}
                    className={`py-2 px-3 rounded-xl text-xs font-black border flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      formLanguage === 'FR'
                        ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/30'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <span>🇫🇷</span>
                    <span>Français (FR)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFormLanguageChange('EN')}
                    className={`py-2 px-3 rounded-xl text-xs font-black border flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      formLanguage === 'EN'
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <span>🇬🇧</span>
                    <span>Anglais (ENG)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFormLanguageChange('JP')}
                    className={`py-2 px-3 rounded-xl text-xs font-black border flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      formLanguage === 'JP'
                        ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/30'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <span>🇯🇵</span>
                    <span>Japonais (JAP)</span>
                  </button>
                </div>
              </div>

              {/* 2. Quantité */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  2. Quantité en Stock :
                </label>
                <div className="flex items-center space-x-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setFormQuantity(prev => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center cursor-pointer transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="flex-1 text-center bg-transparent text-sm font-black text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setFormQuantity(prev => prev + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black text-sm flex items-center justify-center cursor-pointer transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 3. État du Scellé */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  3. État du Scellé :
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(conditionLabels) as SealedItemCondition[]).map(condKey => {
                    const info = conditionLabels[condKey];
                    const isSelected = formCondition === condKey;
                    return (
                      <button
                        key={condKey}
                        type="button"
                        onClick={() => setFormCondition(condKey)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-black ${isSelected ? 'text-amber-400' : 'text-slate-300'}`}>
                            {info.label}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {info.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Prix d'Achat Payé */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center justify-between">
                  <span>4. Prix d'Achat Payé (€) :</span>
                  <span className="text-[10px] text-slate-400 font-normal">Ce que vous avez payé par unité</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formPurchasePrice}
                    onChange={(e) => setFormPurchasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full pl-3 pr-8 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-black text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    €
                  </span>
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Notes (Optionnel) :</label>
                <input
                  type="text"
                  placeholder="Ex: Achat boutique locale, Armoire vitrée..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-colors cursor-pointer shadow-lg shadow-amber-500/25 flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? 'Enregistrer les Modifications' : 'Ajouter à mon Stock'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
