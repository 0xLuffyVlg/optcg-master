import React, { useState, useMemo } from 'react';
import { 
  FolderPlus, 
  Camera, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus, 
  Minus, 
  DollarSign, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Download, 
  Upload, 
  Zap,
  Tag,
  Share2,
  RotateCcw,
  ShieldCheck,
  Euro,
  Heart,
  Activity,
  Award,
  FolderSync,
  Boxes,
  Package,
  ChevronDown,
  SlidersHorizontal,
  Check,
  PackageOpen,
  X
} from 'lucide-react';
import { Card, TradeBinderShareData } from '../types';
import { allCards, allSetsList, getVariantsByCode, getMarketTrendByCode, getCardByCode, allPrintsAsCards } from '../data/dataProvider';
import { getCardImageUrl, getColorClass, handleCardImageError, matchesCardSearch } from '../utils/cardUtils';
import { getCardPriceForArtwork, formatEur } from '../services/cardmarketPriceService';
import { useCollection } from '../context/CollectionContext';
import { useAuth } from '../context/AuthContext';
import { SealedProductsView } from './SealedProductsView';
import { TradeBinderView } from './TradeBinderView';
import { ALL_COLLECTIONS, SetCollectionMeta, SortOption, renderCircularFlag, isAltArtworkCard } from './DatabaseView';
import { MobileFilterDrawer } from '../components/MobileFilterDrawer';

interface CollectionViewProps {
  onSelectCard: (card: Card) => void;
  onOpenScanner: () => void;
  initialSubTab?: 'cards' | 'sealed' | 'trades';
  publicBinderData?: TradeBinderShareData | null;
}

export type CollectionStatusFilter = 'ALL' | 'OWNED' | 'GAINS' | 'LOSSES' | 'ALT_ARTS' | 'FAVORITES' | 'MISSING' | 'DUPLICATES';

export type SetGroupId = 'ALL' | 'OP' | 'ST' | 'EB' | 'PRB' | 'P';

export const SET_GROUPS: { id: SetGroupId; label: string }[] = [
  { id: 'ALL', label: 'Tout le Catalogue' },
  { id: 'OP', label: 'Boosters (OP01-18)' },
  { id: 'ST', label: 'Starters (ST01-36)' },
  { id: 'EB', label: 'Extra Boosters (EB01-05)' },
  { id: 'PRB', label: 'Premium (PRB01-02)' },
  { id: 'P', label: 'Promos & Winner (P)' },
];

export const OP_SETS = ['OP18', 'OP17', 'OP16', 'OP15', 'OP14', 'OP13', 'OP12', 'OP11', 'OP10', 'OP09', 'OP08', 'OP07', 'OP06', 'OP05', 'OP04', 'OP03', 'OP02', 'OP01'];
export const ST_SETS = [
  'ST36', 'ST35', 'ST34', 'ST33', 'ST32', 'ST31', 'ST30', 'ST29', 'ST28', 'ST27',
  'ST26', 'ST25', 'ST24', 'ST23', 'ST22', 'ST21', 'ST20', 'ST19', 'ST18', 'ST17',
  'ST16', 'ST15', 'ST14', 'ST13', 'ST12', 'ST11', 'ST10', 'ST09', 'ST08', 'ST07',
  'ST06', 'ST05', 'ST04', 'ST03', 'ST02', 'ST01'
];
export const EB_SETS = ['EB05', 'EB04', 'EB03', 'EB02', 'EB01'];
export const PRB_SETS = ['PRB02', 'PRB01'];
export const P_SETS = ['P'];

export const SET_NAMES_MAP: Record<string, { en: string; fr: string }> = {
  OP18: { en: 'The Dominance of God', fr: 'La Domination de Dieu' },
  OP17: { en: "The World's Strongest Warrior", fr: 'Les Guerriers les plus Puissants au Monde' },
  OP16: { en: 'The Time of Battle', fr: "L'Heure du Combat" },
  OP15: { en: "Adventure on KAMI's Island", fr: "Aventure sur l'Île de Dieu" },
  OP14: { en: "The Azure Sea's Seven", fr: 'Les Sept de la Mer Azur' },
  OP13: { en: 'Carrying on His Will', fr: 'Héritiers de sa Volonté' },
  OP12: { en: 'Legacy of the Master', fr: "L'Héritage du Maître" },
  OP11: { en: 'A Fist of Divine Speed', fr: 'Le Poing de Vitesse Divine' },
  OP10: { en: 'Royal Blood', fr: 'Sang Royal' },
  OP09: { en: 'Emperors in the New World', fr: 'Les Nouveaux Empereurs' },
  OP08: { en: 'Two Legends', fr: 'Deux Légendes' },
  OP07: { en: '500 Years in the Future', fr: '500 Ans dans le Futur' },
  OP06: { en: 'Wings of the Captain', fr: 'Les Ailes du Capitaine' },
  OP05: { en: 'Awakening of the New Era', fr: "L'Éveil de la Nouvelle Ère" },
  OP04: { en: 'Kingdoms of Intrigue', fr: "Complots d'un Royaume" },
  OP03: { en: 'Pillars of Strength', fr: 'Les Piliers de la Force' },
  OP02: { en: 'Paramount War', fr: 'Guerre Sommitale' },
  OP01: { en: 'Romance Dawn', fr: 'Romance Dawn' },
  EB05: { en: 'Heroines Edition Vol. 2', fr: 'Édition Héroïnes Vol. 2' },
  EB04: { en: 'Egghead Crisis', fr: "Crise sur l'Île d'Egghead" },
  EB03: { en: 'Heroines Edition', fr: 'Édition Héroïnes' },
  EB02: { en: 'Anime 25th Collection', fr: 'Collection 25e Anniversaire' },
  EB01: { en: 'Memorial Collection', fr: 'Collection Mémoriale' },
  PRB02: { en: 'The Best Vol. 2', fr: 'Le Meilleur Vol. 2' },
  PRB01: { en: 'The Best', fr: 'Le Meilleur (The Best)' },
  P: { en: 'Official Promos & Championship Winners', fr: 'Promos Officielles & Winners Tournois' },
  ST36: { en: 'Eustass Captain Kid', fr: 'Eustass Captain Kid' },
  ST35: { en: 'Starter Deck 35', fr: 'Deck de Démarrage 35' },
  ST34: { en: 'Starter Deck 34', fr: 'Deck de Démarrage 34' },
  ST33: { en: 'Starter Deck 33', fr: 'Deck de Démarrage 33' },
  ST32: { en: 'Starter Deck 32', fr: 'Deck de Démarrage 32' },
  ST31: { en: 'Starter Deck 31', fr: 'Deck de Démarrage 31' },
  ST30: { en: 'Starter Deck 30', fr: 'Deck de Démarrage 30' },
  ST29: { en: 'Starter Deck 29', fr: 'Deck de Démarrage 29' },
  ST28: { en: 'Green Doflamingo', fr: 'Doflamingo Vert' },
  ST27: { en: 'Purple Luffy', fr: 'Luffy Violet' },
  ST26: { en: 'Black Smoker', fr: 'Smoker Noir' },
  ST25: { en: 'Blue Buggy', fr: 'Baggy Bleu' },
  ST24: { en: 'Yellow Linlin', fr: 'Big Mom Jaune' },
  ST23: { en: 'Red Shanks', fr: 'Shanks Rouge' },
  ST22: { en: 'Ace & Newgate', fr: 'Ace & Barbe Blanche' },
  ST21: { en: 'EX Gear 5', fr: 'EX Gear 5' },
  ST20: { en: 'Yellow Katakuri', fr: 'Katakuri Jaune' },
  ST19: { en: 'Black Smoker', fr: 'Smoker Noir' },
  ST18: { en: 'Purple Luffy', fr: 'Luffy Violet' },
  ST17: { en: 'Blue Doflamingo', fr: 'Doflamingo Bleu' },
  ST16: { en: 'Green Uta', fr: 'Uta Verte' },
  ST15: { en: 'Red Edward Newgate', fr: 'Barbe Blanche Rouge' },
  ST14: { en: '3D2Y', fr: '3D2Y' },
  ST13: { en: 'Three Brothers Bond', fr: 'Le Lien des Trois Frères' },
  ST12: { en: 'Zoro & Sanji', fr: 'Zoro & Sanji' },
  ST11: { en: 'Side Uta', fr: 'Side Uta' },
  ST10: { en: 'Three Captains', fr: 'Les Trois Capitaines' },
  ST09: { en: 'Side Yamato', fr: 'Side Yamato' },
  ST08: { en: 'Side Monkey D. Luffy', fr: 'Side Monkey D. Luffy' },
  ST07: { en: 'Big Mom Pirates', fr: "L'Équipage de Big Mom" },
  ST06: { en: 'The Navy', fr: 'La Marine' },
  ST05: { en: 'FILM edition', fr: 'Édition FILM' },
  ST04: { en: 'Animal Kingdom Pirates', fr: 'Les Pirates aux Cent Bêtes' },
  ST03: { en: 'The Seven Warlords', fr: 'Les Sept Grands Corsaires' },
  ST02: { en: 'Worst Generation', fr: 'La Pire Génération' },
  ST01: { en: 'Straw Hat Crew', fr: "L'Équipage du Chapeau de Paille" },
};


export const CollectionView: React.FC<CollectionViewProps> = ({
  onSelectCard,
  onOpenScanner,
  initialSubTab = 'cards',
  publicBinderData = null
}) => {
  const [activeCollectionTab, setActiveCollectionTab] = useState<'cards' | 'sealed' | 'trades'>(
    publicBinderData ? 'trades' : initialSubTab
  );

  React.useEffect(() => {
    if (publicBinderData) {
      setActiveCollectionTab('trades');
    } else if (initialSubTab) {
      setActiveCollectionTab(initialSubTab);
    }
  }, [publicBinderData, initialSubTab]);
  const {
    collection,
    addCardToCollection,
    removeCardFromCollection,
    deleteCardCompletely,
    setCollectionCount,
    getCardCountInCollection,
    getTotalCardCopies,
    stats,
    exportCollectionJson,
    importCollectionJson,
    clearCollection
  } = useCollection();
  const { isFavorite, toggleFavorite, favoritesCount } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSetGroup, setSelectedSetGroup] = useState<SetGroupId>('OP');
  const [selectedSet, setSelectedSet] = useState('OP17');
  const [selectedStatus, setSelectedStatus] = useState<CollectionStatusFilter>('ALL');
  const [selectedColor, setSelectedColor] = useState('ALL');
  const [selectedRarity, setSelectedRarity] = useState('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState<'ALL' | 'JP' | 'EN' | 'FR'>('ALL');
  const [activeDropdown, setActiveDropdown] = useState<'collection' | 'language' | null>(null);
  const [collectionFilterGroup, setCollectionFilterGroup] = useState<'ALL' | 'OP' | 'ST' | 'EB' | 'PRB' | 'P'>('ALL');
  const [collectionSearch, setCollectionSearch] = useState('');
  const [isMobilePortfolioOpen, setIsMobilePortfolioOpen] = useState(false);
  const [isMobileFilterDrawerOpen, setIsMobileFilterDrawerOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortOption>('code-asc');
  const [minPrice, setMinPrice] = useState(0);
  const [variantTab, setVariantTab] = useState<'ALL' | 'BASE' | 'ALT'>('ALL');
  const [isMangaOnly, setIsMangaOnly] = useState(false);
  const [isCrewMangaOnly, setIsCrewMangaOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedIllustrator, setSelectedIllustrator] = useState('ALL');
  const filterBarRef = React.useRef<HTMLDivElement>(null);

  // Click outside listener for downward dropdowns
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const [portfolioTimeframe, setPortfolioTimeframe] = useState<'7d' | '30d'>('7d');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [photoAnalysisMessage, setPhotoAnalysisMessage] = useState<string>('');
  const [photoDetectedCard, setPhotoDetectedCard] = useState<Card | null>(null);
  const [photoSuggestedCards, setPhotoSuggestedCards] = useState<Card[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = selectedSet !== 'ALL' ? 200 : 60;

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Portfolio P&L (Profits & Pertes) Calculation
  const portfolioPnL = useMemo(() => {
    let totalCurrentEur = 0;
    let totalDeltaEur = 0;
    let gainersCount = 0;
    let losersCount = 0;
    let neutralCount = 0;
    let topGainer: { card: Card; changeEur: number; changePct: number; currentPrice: number; copies: number } | null = null;
    let topLoser: { card: Card; changeEur: number; changePct: number; currentPrice: number; copies: number } | null = null;

    for (const [key, count] of Object.entries(collection)) {
      if (typeof count !== 'number' || count <= 0) continue;

      const isAlt = key.includes('__');
      const cardCode = isAlt ? key.split('__')[0] : key;
      const artworkFile = isAlt ? key.split('__')[1] : '';

      const card = getCardByCode(cardCode);
      if (!card) continue;

      const artPriceObj = getCardPriceForArtwork(card, artworkFile);
      const currentPrice = artPriceObj.priceEur;

      const trend = getMarketTrendByCode(artworkFile || card.card_code);
      const changePct = trend 
        ? (portfolioTimeframe === '7d' ? trend.change_7d_percent : trend.change_30d_percent) 
        : 0;
      const changeEur = trend && trend.current_price_eur > 0
        ? (currentPrice * (changePct / 100))
        : 0;

      totalCurrentEur += currentPrice * count;
      totalDeltaEur += changeEur * count;

      if (changePct > 0.05) {
        gainersCount++;
        if (!topGainer || (changeEur * count) > (topGainer.changeEur * topGainer.copies)) {
          topGainer = { card, changeEur, changePct, currentPrice, copies: count };
        }
      } else if (changePct < -0.05) {
        losersCount++;
        if (!topLoser || (changeEur * count) < (topLoser.changeEur * topLoser.copies)) {
          topLoser = { card, changeEur, changePct, currentPrice, copies: count };
        }
      } else {
        neutralCount++;
      }
    }

    const previousEur = Math.max(0.01, totalCurrentEur - totalDeltaEur);
    const totalDeltaPct = ((totalCurrentEur - previousEur) / previousEur) * 100;

    return {
      totalCurrentEur,
      totalDeltaEur,
      totalDeltaPct,
      gainersCount,
      losersCount,
      neutralCount,
      topGainer,
      topLoser
    };
  }, [collection, portfolioTimeframe]);

  const handleInlinePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        setPhotoPreview(dataUrl);
        setIsAnalyzingPhoto(true);
        setPhotoAnalysisMessage('🤖 Analyse de la photo de votre carte par IA...');
        setPhotoDetectedCard(null);
        setPhotoSuggestedCards([]);

        try {
          const { identifyCardWithAiVision } = await import('../utils/aiVisionScanner');
          const result = await identifyCardWithAiVision(dataUrl);

          if (result.success && result.card) {
            setPhotoDetectedCard(result.card);
            if (result.suggestedCards && result.suggestedCards.length > 1) {
              setPhotoSuggestedCards(result.suggestedCards);
            }
            setPhotoAnalysisMessage(`✨ Carte reconnue sur la photo : ${result.card.card_code} — ${result.card.name}`);
          } else {
            setPhotoAnalysisMessage(result.errorMessage || 'Carte non reconnue automatiquement. Utilisez la recherche ci-dessous.');
          }
        } catch (err: any) {
          setPhotoAnalysisMessage('Erreur lors de l\'analyse. Tapez le code ou nom ci-dessous.');
        } finally {
          setIsAnalyzingPhoto(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCard = (card: Card) => {
    addCardToCollection(card.card_code, 1);
    setRecentlyAdded(card.card_code);
    setTimeout(() => setRecentlyAdded(null), 2000);
  };

  // Get sets list for currently active group
  const availableSetsForGroup = useMemo(() => {
    switch (selectedSetGroup) {
      case 'OP': return OP_SETS;
      case 'ST': return ST_SETS;
      case 'EB': return EB_SETS;
      case 'PRB': return PRB_SETS;
      case 'P': return P_SETS;
      case 'ALL': return allSetsList;
      default: return allSetsList;
    }
  }, [selectedSetGroup]);

  // Current active set title with French and English naming
  const currentSetTitle = useMemo(() => {
    if (selectedSet !== 'ALL') {
      const meta = SET_NAMES_MAP[selectedSet];
      if (meta) {
        return `${selectedSet} — ${meta.fr.toUpperCase()} (${meta.en})`;
      }
      return `EXTENSION ${selectedSet}`;
    }
    if (selectedSetGroup === 'OP') return 'TOUS LES BOOSTERS (OP-01 À OP-18)';
    if (selectedSetGroup === 'ST') return 'TOUS LES STARTER DECKS (ST-01 À ST-36)';
    if (selectedSetGroup === 'EB') return 'TOUS LES EXTRA BOOSTERS (EB-01 À EB-05)';
    if (selectedSetGroup === 'PRB') return 'TOUS LES PREMIUM BOOSTERS (PRB-01 & PRB-02)';
    if (selectedSetGroup === 'P') return 'PROMOS OFFICIELLES & WINNERS TOURNOIS (P)';
    return 'CATALOGUE COMPLET ONE PIECE TCG';
  }, [selectedSet, selectedSetGroup]);

  // Cards belonging to current set or set group for stats
  const currentSetCards = useMemo(() => {
    let list = allCards;
    if (selectedSet !== 'ALL') {
      if (selectedSet === 'P') {
        list = list.filter(c => c.set_code === 'P' || c.set_code === 'DON' || c.rarity === 'P' || c.rarity === 'WINNER' || (c.name && c.name.toLowerCase().includes('winner')));
      } else {
        list = list.filter(c => c.set_code === selectedSet);
      }
    } else if (selectedSetGroup !== 'ALL') {
      if (selectedSetGroup === 'OP') list = list.filter(c => c.set_code.startsWith('OP'));
      else if (selectedSetGroup === 'ST') list = list.filter(c => c.set_code.startsWith('ST'));
      else if (selectedSetGroup === 'EB') list = list.filter(c => c.set_code.startsWith('EB'));
      else if (selectedSetGroup === 'PRB') list = list.filter(c => c.set_code.startsWith('PRB'));
      else if (selectedSetGroup === 'P') list = list.filter(c => c.set_code === 'P' || c.set_code === 'DON' || c.rarity === 'P' || c.rarity === 'WINNER' || (c.name && c.name.toLowerCase().includes('winner')));
    }
    return list;
  }, [allCards, selectedSet, selectedSetGroup]);

  // Compute set progression and rarity breakdown (matching Scalpeurs album progression)
  const setRarityStats = useMemo(() => {
    const totalByRarity: Record<string, number> = {};
    const ownedByRarity: Record<string, number> = {};
    let totalCount = currentSetCards.length;
    let ownedCount = 0;
    let missingCount = 0;
    let duplicateCount = 0;
    let setEstimatedEur = 0;

    for (const c of currentSetCards) {
      const copies = getTotalCardCopies(c.card_code);
      if (copies > 0) {
        ownedCount++;
        if (copies > 1) duplicateCount += (copies - 1);
        const artPrice = getCardPriceForArtwork(c);
        setEstimatedEur += (artPrice.priceEur * copies);
      } else {
        missingCount++;
      }

      const r = c.rarity || 'C';
      totalByRarity[r] = (totalByRarity[r] || 0) + 1;
      if (copies > 0) {
        ownedByRarity[r] = (ownedByRarity[r] || 0) + 1;
      }
    }

    const percentage = totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0;

    return {
      totalCount,
      ownedCount,
      missingCount,
      duplicateCount,
      totalByRarity,
      ownedByRarity,
      percentage,
      setEstimatedEur
    };
  }, [currentSetCards, collection]);

  // Filter cards based on collection status & criteria
  const filteredCards = useMemo(() => {
    const hasSearch = Boolean(searchQuery.trim());
    let list = (hasSearch || selectedStatus === 'ALT_ARTS') ? allPrintsAsCards : allCards;

    // Set group & Set filter
    if (!hasSearch) {
      if (selectedSet !== 'ALL') {
        if (selectedSet === 'P') {
          list = list.filter(c => c.set_code === 'P' || c.set_code === 'DON' || c.rarity === 'P' || c.rarity === 'WINNER' || (c.name && c.name.toLowerCase().includes('winner')));
        } else {
          list = list.filter(c => c.set_code === selectedSet);
        }
      } else if (selectedSetGroup !== 'ALL') {
        if (selectedSetGroup === 'OP') list = list.filter(c => c.set_code.startsWith('OP'));
        else if (selectedSetGroup === 'ST') list = list.filter(c => c.set_code.startsWith('ST'));
        else if (selectedSetGroup === 'EB') list = list.filter(c => c.set_code.startsWith('EB'));
        else if (selectedSetGroup === 'PRB') list = list.filter(c => c.set_code.startsWith('PRB'));
        else if (selectedSetGroup === 'P') list = list.filter(c => c.set_code === 'P' || c.set_code === 'DON' || c.rarity === 'P' || c.rarity === 'WINNER' || (c.name && c.name.toLowerCase().includes('winner')));
      }
    }

    // Status filter
    if (selectedStatus === 'OWNED') {
      list = list.filter(c => getTotalCardCopies(c.card_code) > 0);
    } else if (selectedStatus === 'MISSING') {
      list = list.filter(c => getTotalCardCopies(c.card_code) === 0);
    } else if (selectedStatus === 'DUPLICATES') {
      list = list.filter(c => getTotalCardCopies(c.card_code) > 1);
    } else if (selectedStatus === 'GAINS') {
      list = list.filter(c => {
        if (getTotalCardCopies(c.card_code) <= 0) return false;
        const trend = getMarketTrendByCode(c.card_code);
        const change = portfolioTimeframe === '7d' ? (trend?.change_7d_percent || 0) : (trend?.change_30d_percent || 0);
        return change > 0.05;
      });
    } else if (selectedStatus === 'LOSSES') {
      list = list.filter(c => {
        if (getTotalCardCopies(c.card_code) <= 0) return false;
        const trend = getMarketTrendByCode(c.card_code);
        const change = portfolioTimeframe === '7d' ? (trend?.change_7d_percent || 0) : (trend?.change_30d_percent || 0);
        return change < -0.05;
      });
    } else if (selectedStatus === 'ALT_ARTS') {
      list = list.filter(c => {
        const isAlt = (c.id && c.id.includes('_')) || (c.rarity === 'ALT' || c.rarity === 'MANGA' || c.rarity === 'SP' || c.rarity === 'WINNER');
        return isAlt;
      });
    } else if (selectedStatus === 'FAVORITES') {
      list = list.filter(c => isFavorite(c.card_code));
    }

    // Color filter
    if (selectedColor !== 'ALL') {
      list = list.filter(c => (c.color || []).some(col => col.toLowerCase() === selectedColor.toLowerCase()));
    }

    // Rarity filter
    if (selectedRarity !== 'ALL') {
      list = list.filter(c => c.rarity === selectedRarity);
    }

    // Search query
    if (hasSearch) {
      list = list.filter(c => matchesCardSearch(c, searchQuery));
    }

    // Language filter
    if (selectedLanguage !== 'ALL') {
      const lTarget = selectedLanguage.toLowerCase();
      list = list.filter(c => {
        const cLang = (c.language || (c.id?.startsWith('fr-') ? 'fr' : (c.id?.startsWith('jp-') ? 'jp' : (c.is_japanese || c.set_code === 'OP18' || c.set_code === 'EB05' || c.set_code === 'PRB02' ? 'jp' : 'en')))).toLowerCase();
        return cLang === lTarget;
      });
    }

    // Variant tab filter
    if (variantTab === 'BASE') {
      list = list.filter(c => !isAltArtworkCard(c));
    } else if (variantTab === 'ALT') {
      list = list.filter(c => isAltArtworkCard(c));
    }

    // Special variant filters
    if (isMangaOnly) {
      list = list.filter(c => c.rarity === 'MANGA' || c.variant_type === 'MANGA' || (c.id && c.id.toLowerCase().includes('manga')));
    }
    if (isCrewMangaOnly) {
      list = list.filter(c => (c.name && c.name.toLowerCase().includes('crew')) || c.card_code === 'OP09-118' || c.card_code === 'OP11-118');
    }

    // Min price filter
    if (minPrice > 0) {
      list = list.filter(c => {
        const p = getCardPriceForArtwork(c).priceEur || 0;
        return p >= minPrice;
      });
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      list = list.filter(c => c.category === selectedCategory);
    }

    // Illustrator filter
    if (selectedIllustrator !== 'ALL') {
      list = list.filter(c => ((c as any).illustrator === selectedIllustrator || (c as any).artist === selectedIllustrator));
    }

    // Secondary sorting: If in GAINS sort highest gains first; if in LOSSES sort biggest drops first
    if (selectedStatus === 'GAINS') {
      list = [...list].sort((a, b) => {
        const ta = getMarketTrendByCode(a.card_code);
        const tb = getMarketTrendByCode(b.card_code);
        const ca = portfolioTimeframe === '7d' ? (ta?.change_7d_eur || 0) : (ta?.change_30d_eur || 0);
        const cb = portfolioTimeframe === '7d' ? (tb?.change_7d_eur || 0) : (tb?.change_30d_eur || 0);
        return cb - ca;
      });
    } else if (selectedStatus === 'LOSSES') {
      list = [...list].sort((a, b) => {
        const ta = getMarketTrendByCode(a.card_code);
        const tb = getMarketTrendByCode(b.card_code);
        const ca = portfolioTimeframe === '7d' ? (ta?.change_7d_eur || 0) : (ta?.change_30d_eur || 0);
        const cb = portfolioTimeframe === '7d' ? (tb?.change_7d_eur || 0) : (tb?.change_30d_eur || 0);
        return ca - cb;
      });
    } else {
      list = [...list].sort((a, b) => {
        const pa = getCardPriceForArtwork(a).priceEur || 0;
        const pb = getCardPriceForArtwork(b).priceEur || 0;
        switch (selectedSort) {
          case 'price-desc':
            return pb - pa;
          case 'price-asc':
            return pa - pb;
          case 'alpha-asc':
            return (a.name_fr || a.name).localeCompare(b.name_fr || b.name);
          case 'alpha-desc':
            return (b.name_fr || b.name).localeCompare(a.name_fr || a.name);
          case 'code-desc':
            return b.card_code.localeCompare(a.card_code);
          case 'code-asc':
          default:
            return a.card_code.localeCompare(b.card_code);
        }
      });
    }

    return list;
  }, [allCards, collection, selectedStatus, selectedSet, selectedSetGroup, selectedColor, selectedRarity, searchQuery, portfolioTimeframe, selectedLanguage, variantTab, isMangaOnly, isCrewMangaOnly, minPrice, selectedCategory, selectedIllustrator, selectedSort]);

  // Selected collection metadata
  const selectedCollectionMeta: SetCollectionMeta = useMemo(() => {
    if (selectedSet !== 'ALL') {
      const found = ALL_COLLECTIONS.find(c => c.code.toUpperCase() === selectedSet.toUpperCase());
      if (found) return found;
      return {
        code: selectedSet,
        name: SET_NAMES_MAP[selectedSet]?.en || `Extension ${selectedSet}`,
        nameFr: SET_NAMES_MAP[selectedSet]?.fr || `Extension ${selectedSet}`,
        group: (selectedSet.startsWith('OP') ? 'OP' : selectedSet.startsWith('ST') ? 'ST' : selectedSet.startsWith('EB') ? 'EB' : selectedSet.startsWith('PRB') ? 'PRB' : 'P') as any,
        cover: `/images/sealed/${selectedSet.toLowerCase()}-display.jpg`
      };
    }
    return {
      code: 'ALL',
      name: 'Toutes les Collections',
      nameFr: 'Toutes les Collections',
      group: 'OP' as const,
      cover: '/images/sealed/op-09-display.jpg'
    };
  }, [selectedSet]);

  // Filtered collections for dropdown popover
  const filteredCollections = useMemo(() => {
    let list = ALL_COLLECTIONS;
    if (collectionFilterGroup !== 'ALL') {
      list = list.filter(c => c.group === collectionFilterGroup);
    }
    if (collectionSearch.trim()) {
      const q = collectionSearch.toLowerCase().trim();
      list = list.filter(c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || (c.nameFr && c.nameFr.toLowerCase().includes(q)));
    }
    return list;
  }, [collectionFilterGroup, collectionSearch]);

  // Available illustrators
  const availableIllustrators = useMemo(() => {
    const set = new Set<string>();
    for (const card of allCards) {
      const artist = (card as any).illustrator || (card as any).artist;
      if (artist && typeof artist === 'string' && artist.trim().length > 1) {
        set.add(artist.trim());
      }
    }
    return Array.from(set).sort();
  }, [allCards]);

  // Price histogram & max limit
  const { priceHistogram, maxPriceLimit } = useMemo(() => {
    const bucketsCount = 24;
    let maxP = 100;
    const prices: number[] = [];

    for (let i = 0; i < filteredCards.length; i++) {
      const p = getCardPriceForArtwork(filteredCards[i]).priceEur || 0;
      if (p > 0) {
        prices.push(p);
        if (p > maxP && p <= 1500) maxP = p;
      }
    }

    const histogram = new Array(bucketsCount).fill(0);
    if (prices.length === 0) return { priceHistogram: histogram, maxPriceLimit: 100 };

    for (const price of prices) {
      const ratio = Math.min(1, price / maxP);
      const bIndex = Math.min(bucketsCount - 1, Math.floor(ratio * bucketsCount));
      histogram[bIndex]++;
    }

    return { priceHistogram: histogram, maxPriceLimit: maxP };
  }, [filteredCards]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedSort !== 'code-asc') count++;
    if (selectedRarity !== 'ALL') count++;
    if (selectedColor !== 'ALL') count++;
    if (selectedCategory !== 'ALL') count++;
    if (selectedIllustrator !== 'ALL') count++;
    if (minPrice > 0) count++;
    if (variantTab !== 'ALL') count++;
    if (isMangaOnly) count++;
    if (isCrewMangaOnly) count++;
    return count;
  }, [selectedSort, selectedRarity, selectedColor, selectedCategory, selectedIllustrator, minPrice, variantTab, isMangaOnly, isCrewMangaOnly]);

  const handleResetFilters = () => {
    setSelectedSort('code-asc');
    setSelectedRarity('ALL');
    setVariantTab('ALL');
    setIsMangaOnly(false);
    setIsCrewMangaOnly(false);
    setMinPrice(0);
    setSelectedColor('ALL');
    setSelectedCategory('ALL');
    setSelectedIllustrator('ALL');
    setSelectedStatus('ALL');
    setSearchQuery('');
    setPage(1);
  };

  const displayedCards = useMemo(() => {
    return filteredCards.slice(0, page * PAGE_SIZE);
  }, [filteredCards, page, PAGE_SIZE]);

  const handleExport = () => {
    const json = exportCollectionJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optcg_collection_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;
    const ok = importCollectionJson(importJsonText);
    if (ok) {
      setIsImportModalOpen(false);
      setImportJsonText('');
    } else {
      alert('Format JSON invalide.');
    }
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Top 3-Way Sub-Navigation Bar — Responsive & Sleek */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg">
        <button
          onClick={() => setActiveCollectionTab('cards')}
          className={`flex items-center justify-center space-x-1.5 px-2 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeCollectionTab === 'cards'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Layers className="w-4 h-4 flex-shrink-0" />
          <span className="truncate hidden sm:inline">Mes Cartes & Classeur</span>
          <span className="truncate sm:hidden">Classeur</span>
          {stats.uniqueCardsOwned > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold flex-shrink-0">
              {stats.uniqueCardsOwned}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveCollectionTab('sealed')}
          className={`flex items-center justify-center space-x-1.5 px-2 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeCollectionTab === 'sealed'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/30 font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Package className="w-4 h-4 flex-shrink-0" />
          <span className="truncate hidden sm:inline">Produits Scellés</span>
          <span className="truncate sm:hidden">Scellé</span>
        </button>

        <button
          onClick={() => setActiveCollectionTab('trades')}
          className={`flex items-center justify-center space-x-1.5 px-2 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeCollectionTab === 'trades'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <FolderSync className="w-4 h-4 flex-shrink-0" />
          <span className="truncate hidden sm:inline">Mes Doubles & Échanges</span>
          <span className="truncate sm:hidden">Doubles</span>
        </button>
      </div>

      {activeCollectionTab === 'sealed' && (
        <SealedProductsView />
      )}

      {activeCollectionTab === 'trades' && (
        <TradeBinderView onSelectCard={onSelectCard} publicBinderData={publicBinderData} />
      )}

      {activeCollectionTab === 'cards' && (
        <>
          {/* Mobile Compact Portfolio Overview Pill (< sm) */}
          <div className="sm:hidden p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0B0F17] to-slate-950 border border-slate-800 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Valeur Collection (Cardmarket)</span>
                <span className="text-xl font-black text-emerald-400">
                  {stats.totalCardmarketValue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">{stats.uniqueCardsOwned} / {allCards.length} uniques</span>
                <span className="text-xs font-bold text-amber-400">{Math.round((stats.uniqueCardsOwned / Math.max(1, allCards.length)) * 100)}% complété</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setIsMobilePortfolioOpen(!isMobilePortfolioOpen)}
                className="text-xs font-bold text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>{isMobilePortfolioOpen ? 'Masquer détails' : '📊 Détails & graphiques'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMobilePortfolioOpen ? 'rotate-180 text-amber-400' : ''}`} />
              </button>
              <button
                type="button"
                onClick={onOpenScanner}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Scanner</span>
              </button>
            </div>
          </div>

          {/* Portfolio Value & Overview Hero Banner (>= sm or when expanded on mobile) */}
          <div className={`${isMobilePortfolioOpen ? 'block' : 'hidden sm:block'} relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/95 to-[#0B0F17] border border-slate-800 p-6 sm:p-8 shadow-2xl`}>
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>GESTIONNAIRE DE COLLECTION & PORTFOLIO</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  Ma Collection One Piece TCG
                </h1>
                <p className="text-sm text-slate-300">
                  Gérez votre classeur virtuel, suivez l'avancement de vos sets et visualisez la valeur totale de vos cartes en temps réel.
                </p>
              </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            <button
              onClick={onOpenScanner}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-lg shadow-amber-500/25 transition-all active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Scanner des Cartes</span>
            </button>

            <button
              onClick={handleExport}
              className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
              title="Exporter ma collection en fichier JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sauvegarder</span>
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
              title="Restaurer une collection"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Restaurer</span>
            </button>

            {stats.uniqueCardsOwned > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Voulez-vous vraiment vider tout votre classeur ? Toutes les cartes enregistrées sur votre compte seront supprimées.')) {
                    clearCollection();
                  }
                }}
                className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold text-xs border border-rose-500/30 transition-colors cursor-pointer"
                title="Vider entièrement mon classeur"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Vider</span>
              </button>
            )}
          </div>

        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-6 mt-6 border-t border-slate-800/80">
          
          <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Valeur Totale Estimée</span>
              <span className="text-[9px] font-extrabold text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20">Cardmarket €</span>
            </div>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <p className="text-xl sm:text-2xl font-black text-emerald-400">
                {stats.totalCardmarketValue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </p>
              <span className="text-xs font-bold text-slate-500">
                (${stats.totalMarketValue.toFixed(2)})
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Cartes Possédées</span>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {stats.totalCardsOwned.toLocaleString()} <span className="text-xs text-slate-500 font-normal">exemplaires</span>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Cartes Uniques</span>
            <p className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">
              {stats.uniqueCardsOwned} <span className="text-xs text-slate-500 font-normal">/ {allCards.length}</span>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Complétion Globale</span>
            <p className="text-xl sm:text-2xl font-black text-blue-400 mt-0.5">
              {Math.round((stats.uniqueCardsOwned / Math.max(1, allCards.length)) * 100)}%
            </p>
          </div>

        </div>

      </div>

      {/* Financial Portfolio Performance & P&L Module */}
      {stats.uniqueCardsOwned > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  Performance & Plus-Values du Classeur (P&L)
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Bourse OPTCG
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Suivi des gains et pertes de votre collection selon les cours réels CardTrader & Cardmarket
                </p>
              </div>
            </div>

            {/* Timeframe Pill (7j vs 30j) */}
            <div className="flex items-center p-1 rounded-xl bg-[#0B0F17] border border-slate-800 self-start sm:self-auto">
              <button
                onClick={() => setPortfolioTimeframe('7d')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  portfolioTimeframe === '7d'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                7 Jours
              </button>
              <button
                onClick={() => setPortfolioTimeframe('30d')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  portfolioTimeframe === '30d'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                30 Jours
              </button>
            </div>
          </div>

          {/* 3 Metric Cards for P&L */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Total P&L Variation */}
            <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800/90 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400">
                  Variation Nette ({portfolioTimeframe === '7d' ? '7 Jours' : '30 Jours'})
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  portfolioPnL.totalDeltaEur >= 0 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {portfolioPnL.totalDeltaEur >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{portfolioPnL.totalDeltaEur >= 0 ? `+${portfolioPnL.totalDeltaPct.toFixed(2)}%` : `${portfolioPnL.totalDeltaPct.toFixed(2)}%`}</span>
                </span>
              </div>

              <div className="my-2">
                <p className={`text-2xl font-black ${
                  portfolioPnL.totalDeltaEur >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {portfolioPnL.totalDeltaEur >= 0 ? `+${portfolioPnL.totalDeltaEur.toFixed(2)} €` : `${portfolioPnL.totalDeltaEur.toFixed(2)} €`}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  <strong className="text-emerald-400">{portfolioPnL.gainersCount}</strong> en hausse
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                  <strong className="text-rose-400">{portfolioPnL.losersCount}</strong> en baisse
                </span>
              </div>
            </div>

            {/* Top Gainer Card */}
            <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800/90 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400">
                <span>Top Plus-Value Personnelle</span>
                <span className="text-emerald-400 font-extrabold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> +Profit
                </span>
              </div>

              {portfolioPnL.topGainer ? (
                <div 
                  onClick={() => onSelectCard(portfolioPnL.topGainer!.card)}
                  className="flex items-center gap-3 my-1.5 cursor-pointer group hover:bg-slate-800/40 p-1.5 rounded-lg transition-colors"
                >
                  <div className="w-10 h-14 rounded-md overflow-hidden bg-slate-900 border border-slate-700 flex-shrink-0">
                    <img 
                      src={getCardImageUrl(portfolioPnL.topGainer.card)} 
                      alt={portfolioPnL.topGainer.card.name}
                      onError={(e) => handleCardImageError(e, portfolioPnL.topGainer!.card)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-amber-400 font-bold block">
                      {portfolioPnL.topGainer.card.card_code} • {portfolioPnL.topGainer.copies}x
                    </span>
                    <h4 className="text-xs font-black text-white truncate group-hover:text-amber-400 transition-colors">
                      {portfolioPnL.topGainer.card.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-black text-emerald-400">
                        +{(portfolioPnL.topGainer.changeEur * portfolioPnL.topGainer.copies).toFixed(2)} €
                      </span>
                      <span className="text-[10px] text-emerald-400/80 font-bold">
                        (+{portfolioPnL.topGainer.changePct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="my-3 text-xs text-slate-500 italic">
                  Aucune hausse enregistrée
                </div>
              )}

              <button
                onClick={() => { setSelectedStatus('GAINS'); setPage(1); }}
                className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center justify-between pt-2 border-t border-slate-800/80"
              >
                <span>Filtrer toutes mes cartes en hausse</span>
                <span>→</span>
              </button>
            </div>

            {/* Top Loser Card */}
            <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800/90 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400">
                <span>Top Moins-Value Personnelle</span>
                <span className="text-rose-400 font-extrabold flex items-center gap-0.5">
                  <ArrowDownRight className="w-3 h-3" /> -Baisse
                </span>
              </div>

              {portfolioPnL.topLoser ? (
                <div 
                  onClick={() => onSelectCard(portfolioPnL.topLoser!.card)}
                  className="flex items-center gap-3 my-1.5 cursor-pointer group hover:bg-slate-800/40 p-1.5 rounded-lg transition-colors"
                >
                  <div className="w-10 h-14 rounded-md overflow-hidden bg-slate-900 border border-slate-700 flex-shrink-0">
                    <img 
                      src={getCardImageUrl(portfolioPnL.topLoser.card)} 
                      alt={portfolioPnL.topLoser.card.name}
                      onError={(e) => handleCardImageError(e, portfolioPnL.topLoser!.card)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-amber-400 font-bold block">
                      {portfolioPnL.topLoser.card.card_code} • {portfolioPnL.topLoser.copies}x
                    </span>
                    <h4 className="text-xs font-black text-white truncate group-hover:text-amber-400 transition-colors">
                      {portfolioPnL.topLoser.card.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-black text-rose-400">
                        {(portfolioPnL.topLoser.changeEur * portfolioPnL.topLoser.copies).toFixed(2)} €
                      </span>
                      <span className="text-[10px] text-rose-400/80 font-bold">
                        ({portfolioPnL.topLoser.changePct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="my-3 text-xs text-slate-500 italic">
                  Aucune baisse enregistrée
                </div>
              )}

              <button
                onClick={() => { setSelectedStatus('LOSSES'); setPage(1); }}
                className="text-[10px] font-bold text-rose-400 hover:text-rose-300 flex items-center justify-between pt-2 border-t border-slate-800/80"
              >
                <span>Filtrer toutes mes cartes en baisse</span>
                <span>→</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Top Banner (Scalpeurs Style from Screenshot 2) */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-[#0B0F17] to-slate-950 border border-slate-800 p-4 sm:p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Row 1: Breadcrumb (Left) + Language Switcher Pills (Right) */}
        <div className="flex items-center justify-between gap-2 pb-2">
          <div className="text-[11px] sm:text-xs text-slate-400 font-medium truncate flex items-center gap-1">
            <span>Ma Collection One Piece</span>
            <span className="text-slate-600">›</span>
            <span className="text-slate-300 font-bold capitalize">
              {selectedLanguage === 'FR' ? 'françaises' : selectedLanguage === 'JP' ? 'japonaises' : selectedLanguage === 'EN' ? 'anglaises' : 'toutes'}
            </span>
          </div>

          {/* Language Flag Switcher Pills */}
          <div className="flex items-center bg-[#141824] border border-slate-700/80 rounded-full p-0.5 shadow-sm flex-shrink-0">
            {[
              { id: 'JP', label: 'JP', flag: '🇯🇵' },
              { id: 'FR', label: 'FR', flag: '🇫🇷' },
              { id: 'EN', label: 'EN', flag: '🇬🇧' },
            ].map((l) => {
              const isSel = selectedLanguage === l.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => {
                    setSelectedLanguage(selectedLanguage === l.id ? 'ALL' : (l.id as any));
                    setPage(1);
                  }}
                  className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                    isSel
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs">{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Big Set Title & Date */}
        <div className="space-y-1">
          <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-tight flex items-center flex-wrap gap-x-2">
            <span className="text-amber-400 font-mono">{selectedCollectionMeta.code}</span>
            <span className="text-slate-500">·</span>
            <span className="truncate">{selectedCollectionMeta.nameFr || selectedCollectionMeta.name}</span>
          </h1>
          <p className="text-[9.5px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span className="text-white font-black">{setRarityStats.totalCount} CARTES</span>
            <span className="mx-1.5 text-slate-600">·</span>
            <span className="text-emerald-400 font-bold">{setRarityStats.ownedCount} POSSÉDÉES ({setRarityStats.percentage}%)</span>
            <span className="mx-1.5 text-slate-600">·</span>
            <span>SORTIE : {selectedCollectionMeta.releaseDate || '2024-2026'}</span>
          </p>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full max-w-xl bg-slate-800/90 h-2 rounded-full overflow-hidden mt-3 p-0.5 shadow-inner">
          <div
            className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${setRarityStats.percentage}%` }}
          />
        </div>
      </div>

      {/* Main Filter Arena (Scalpeurs Style - Unified & Sleek) */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-[#0D111A] border border-slate-800 shadow-2xl space-y-2.5 relative z-30">
        
        {/* Row 1: Collection Capsule with Cover Image + Flag & Chevron */}
        <div 
          ref={filterBarRef}
          className="flex items-center gap-1.5 sm:gap-2 flex-nowrap py-0.5 relative z-30"
        >
          <div className={`relative flex-shrink-0 ${activeDropdown === 'collection' || activeDropdown === 'language' ? 'z-50' : 'z-20'}`}>
            <div 
              onClick={() => setActiveDropdown(activeDropdown === 'collection' ? null : 'collection')}
              className="h-8 sm:h-8.5 px-2 sm:px-2.5 rounded-xl bg-[#141824] border border-slate-700/80 hover:border-slate-500 transition-all flex items-center gap-2 cursor-pointer shadow-sm select-none"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="relative w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {selectedSet !== 'ALL' ? (
                    <img
                      src={selectedCollectionMeta.cover}
                      alt={selectedCollectionMeta.name}
                      onError={(e) => { e.currentTarget.src = '/images/sealed/op-01-display.jpg'; }}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Zap className="w-3 h-3 text-amber-400 fill-amber-400/20" />
                  )}
                  <span className="absolute -top-0.5 -right-0.5 text-amber-300 text-[8px] font-black pointer-events-none">✦</span>
                </div>

                <div className="flex flex-col leading-none text-left">
                  <span className="text-xs font-bold text-white truncate max-w-[130px] sm:max-w-[170px]">
                    {selectedSet !== 'ALL' ? (selectedCollectionMeta.nameFr || selectedCollectionMeta.name) : 'Toutes les collections'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                    <span className="text-amber-400 font-bold">{setRarityStats.ownedCount}/{setRarityStats.totalCount} ({setRarityStats.percentage}%)</span> · <span className="text-slate-400">{selectedCollectionMeta.code}</span>
                  </span>
                </div>
              </div>

              {/* Language Flag & Chevron Triggers */}
              <div className="flex items-center gap-1 pl-1.5 border-l border-slate-800 flex-shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === 'language' ? null : 'language');
                  }}
                  className="w-5 h-5 rounded-full border border-slate-600 hover:border-amber-400 p-0 flex items-center justify-center bg-black/40 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                  title="Changer de langue (FR, EN, JP, Toutes)"
                >
                  {renderCircularFlag(selectedLanguage, 'w-4 h-4')}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === 'collection' ? null : 'collection');
                  }}
                  className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                  title="Dérouler la liste des collections"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${activeDropdown === 'collection' ? 'rotate-180 text-amber-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Language Selection Dropdown Menu */}
            {activeDropdown === 'language' && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 w-52 bg-[#0E131F]/98 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800">
                  <span>Choisir la langue</span>
                  <span className="text-amber-400 font-mono">Filtre</span>
                </div>
                {[
                  { id: 'FR', label: 'Français (FR)' },
                  { id: 'EN', label: 'Anglais (EN)' },
                  { id: 'JP', label: 'Japonais (JP)' },
                  { id: 'ALL', label: 'Toutes les langues' },
                ].map(item => {
                  const isSelected = selectedLanguage === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedLanguage(item.id as any);
                        setActiveDropdown(null);
                        setPage(1);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {renderCircularFlag(item.id as any, 'w-5 h-5')}
                        <span>{item.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Set Selection Dropdown Popover */}
            {activeDropdown === 'collection' && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-full mt-1.5 w-[310px] sm:w-[500px] bg-[#0E131F]/98 backdrop-blur-2xl border border-amber-500/40 rounded-2xl shadow-2xl p-3 z-50 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <PackageOpen className="w-4 h-4 text-amber-400" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white">Changer de Collection</h4>
                      <p className="text-[10px] text-slate-400">Boosters OP, Starters ST, Extra EB, Premium PRB & Promos</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(null)}
                    className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Fermer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Search input inside popover */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrer une extension (ex: OP09, ST36, Luffy...)"
                    value={collectionSearch}
                    onChange={(e) => setCollectionSearch(e.target.value)}
                    className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  {collectionSearch && (
                    <button
                      type="button"
                      onClick={() => setCollectionSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs bg-slate-800 px-1 rounded cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Category Filter Pills inside popover */}
                <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
                  {[
                    { id: 'ALL', label: 'Toutes' },
                    { id: 'OP', label: '📦 Boosters' },
                    { id: 'ST', label: '⚔️ Starters' },
                    { id: 'EB', label: '⚡ Extra' },
                    { id: 'PRB', label: '👑 Premium' },
                    { id: 'P', label: '🛡️ Promos' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCollectionFilterGroup(cat.id as any)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                        collectionFilterGroup === cat.id
                          ? 'bg-amber-400 text-black font-black shadow-md'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Quick option: "Toutes les collections (Catalogue complet)" */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSetGroup('ALL');
                    setSelectedSet('ALL');
                    setActiveDropdown(null);
                    setPage(1);
                  }}
                  className={`w-full p-2 rounded-xl border flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                    selectedSet === 'ALL'
                      ? 'border-amber-400 bg-amber-500/15 shadow-md shadow-amber-500/10 ring-1 ring-amber-400'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-black text-xs flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-left">
                      <h5 className="text-xs font-black text-white">Toutes les Collections (Catalogue complet)</h5>
                      <p className="text-[10px] text-slate-400">Afficher l'intégralité du jeu ({allCards.length} cartes)</p>
                    </div>
                  </div>
                  {selectedSet === 'ALL' && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black">
                      <Check className="w-3 h-3" />
                      <span>Actif</span>
                    </div>
                  )}
                </button>

                {/* Grid of collections with display images */}
                <div className="max-h-72 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-1.5 no-scrollbar">
                  {filteredCollections.map((col) => {
                    const isSelected = selectedSet.toUpperCase() === col.code.toUpperCase();
                    const stat = stats.setCompletions[col.code] || { ownedUnique: 0, totalUnique: 0, percentage: 0 };
                    return (
                      <button
                        key={col.code}
                        type="button"
                        onClick={() => {
                          setSelectedSetGroup(col.group as any);
                          setSelectedSet(col.code);
                          setActiveDropdown(null);
                          setPage(1);
                        }}
                        className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer group ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/15 shadow-md shadow-amber-500/10 ring-1 ring-amber-400'
                            : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="w-9 h-11 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0 relative">
                          <img
                            src={col.cover}
                            alt={col.name}
                            onError={(e) => { e.currentTarget.src = '/images/sealed/op-01-display.jpg'; }}
                            className="w-full h-full object-contain p-0.5 group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-[10px] font-black text-amber-400">
                              {col.code}
                            </span>
                            {stat.percentage > 0 && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                                {stat.percentage}%
                              </span>
                            )}
                            {isSelected && (
                              <Check className="w-3 h-3 text-amber-400 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] font-bold text-white truncate mt-0.5 group-hover:text-amber-300 transition-colors">
                            {col.nameFr || col.name}
                          </p>
                          <p className="text-[9px] text-slate-400">
                            {stat.ownedUnique}/{stat.totalUnique} possédées
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Segmented Tabs (Toutes / Possédées / Manquantes / Doublons - Screenshot 2) */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-[#090D15] border border-slate-800/80 shadow-md">
          <button
            type="button"
            onClick={() => { setSelectedStatus('ALL'); setPage(1); }}
            className={`py-2 px-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectedStatus === 'ALL'
                ? 'bg-[#151C2C] text-amber-300 border border-amber-400/80 shadow-sm'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            <span>Toutes</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              {setRarityStats.totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedStatus('OWNED'); setPage(1); }}
            className={`py-2 px-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectedStatus === 'OWNED'
                ? 'bg-[#151C2C] text-emerald-300 border border-emerald-400/80 shadow-sm'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            <span>Possédées</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              {setRarityStats.ownedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setSelectedStatus('MISSING'); setPage(1); }}
            className={`py-2 px-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectedStatus === 'MISSING'
                ? 'bg-[#151C2C] text-rose-300 border border-rose-400/80 shadow-sm'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            <span>Manquantes</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
              {setRarityStats.missingCount}
            </span>
          </button>

          {setRarityStats.duplicateCount > 0 && (
            <button
              type="button"
              onClick={() => { setSelectedStatus('DUPLICATES'); setPage(1); }}
              className={`py-2 px-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                selectedStatus === 'DUPLICATES'
                  ? 'bg-[#151C2C] text-purple-300 border border-purple-400/80 shadow-sm'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <span>Doublons</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                {setRarityStats.duplicateCount}
              </span>
            </button>
          )}
        </div>

        {/* Row 3: Search Bar with Instant Clear + Filter Button (Screenshot 2) */}
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Code ou nom de carte..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#090D15] border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold bg-slate-800 px-1.5 py-0.5 rounded-md cursor-pointer"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Filter Button (Opens Mobile Filter Drawer) */}
          <button
            type="button"
            onClick={() => setIsMobileFilterDrawerOpen(true)}
            className={`h-10 px-3 sm:px-3.5 rounded-xl border flex items-center gap-1.5 text-xs font-black transition-all cursor-pointer shadow-sm flex-shrink-0 ${
              activeFiltersCount > 0
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20'
                : 'bg-[#141824] hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-slate-500'
            }`}
            title="Ouvrir les filtres avancés (Rareté, Prix, Couleurs, Types)"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden xs:inline">Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Desktop Quick Horizontal Set Switcher Chips (>= sm) */}
      <div className="hidden sm:block p-3 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-lg space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Sélection rapide d'extension ({availableSetsForGroup.length} disponibles)</span>
          </span>
          <div className="flex items-center gap-1 bg-[#0B0F17] p-0.5 rounded-lg border border-slate-800">
            {SET_GROUPS.map((grp) => (
              <button
                key={grp.id}
                onClick={() => {
                  setSelectedSetGroup(grp.id);
                  if (grp.id === 'ALL') setSelectedSet('ALL');
                  else if (grp.id === 'OP') setSelectedSet('OP17');
                  else if (grp.id === 'ST') setSelectedSet('ST01');
                  else if (grp.id === 'EB') setSelectedSet('EB01');
                  else if (grp.id === 'PRB') setSelectedSet('PRB01');
                  else if (grp.id === 'P') setSelectedSet('P');
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  selectedSetGroup === grp.id
                    ? 'bg-amber-500 text-black font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {grp.label.split('(')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => { setSelectedSet('ALL'); setPage(1); }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              selectedSet === 'ALL'
                ? 'bg-amber-500 text-black border-amber-400 shadow-md font-black'
                : 'bg-[#0B0F17] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            Tous
          </button>
          {availableSetsForGroup.map((set) => {
            const stat = stats.setCompletions[set] || { ownedUnique: 0, totalUnique: 0, percentage: 0 };
            const isSelected = selectedSet === set;
            return (
              <button
                key={set}
                onClick={() => { setSelectedSet(isSelected ? 'ALL' : set); setPage(1); }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md font-black'
                    : 'bg-[#0B0F17] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>{set}</span>
                {stat.percentage > 0 && (
                  <span className="text-[10px] px-1 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                    {stat.percentage}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hidden File Input for Native Smartphone Photo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInlinePhoto}
        className="hidden"
      />

      {/* Photo Preview & Recognition Feedback */}
      {photoPreview && (
        <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-28 rounded-lg overflow-hidden border border-slate-700 bg-black flex-shrink-0 shadow-md">
              <img src={photoPreview} alt="Photo" className="w-full h-full object-cover" />
              <button
                onClick={() => {
                  setPhotoPreview(null);
                  setPhotoDetectedCard(null);
                  setPhotoSuggestedCards([]);
                  setPhotoAnalysisMessage('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-rose-400 hover:text-rose-300"
                title="Supprimer la photo"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-1 space-y-1.5 min-w-0">
              {isAnalyzingPhoto ? (
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
                  <span className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin flex-shrink-0" />
                  <span>L'IA analyse votre photo...</span>
                </div>
              ) : photoDetectedCard ? (
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Carte Reconnue !
                  </span>
                  <h4 className="text-sm font-black text-white truncate">{photoDetectedCard.name}</h4>
                  <p className="text-xs text-slate-400 font-mono">{photoDetectedCard.card_code} • {photoDetectedCard.rarity}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-300">
                  {photoAnalysisMessage || 'Tapez le nom ou le code dans la barre ci-dessous pour ajouter la carte :'}
                </p>
              )}
            </div>

            {photoDetectedCard && (
              <button
                onClick={() => handleAddCard(photoDetectedCard)}
                className={`px-4 py-2.5 rounded-xl font-black text-xs shadow-lg transition-all active:scale-95 flex-shrink-0 ${
                  recentlyAdded === photoDetectedCard.card_code
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-amber-500/20'
                }`}
              >
                {recentlyAdded === photoDetectedCard.card_code ? '✓ Ajouté !' : '+1 Ajouter'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Visual Binder Gallery Grid */}
      {displayedCards.length === 0 ? (
        <div className="py-20 text-center text-slate-400 space-y-4 max-w-md mx-auto">
          <Layers className="w-16 h-16 mx-auto opacity-30 text-amber-400" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              {selectedStatus === 'OWNED' ? 'Votre collection est encore vide' : 'Aucune carte trouvée'}
            </h3>
            <p className="text-xs text-slate-400">
              {selectedStatus === 'OWNED' 
                ? 'Scannez vos cartes avec votre téléphone pour les voir apparaître directement dans votre collection !' 
                : 'Aucune carte ne correspond aux filtres sélectionnés.'}
            </p>
          </div>
          {selectedStatus === 'OWNED' && (
            <button
              onClick={onOpenScanner}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Ouvrir le Scanner</span>
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
            {displayedCards.map((card) => {
              const allImages = card._imagePaths && card._imagePaths.length > 0 ? card._imagePaths : [card._defaultImagePath || `${card.card_code}.webp`];
              const hasMultipleArtworks = allImages.length > 1;
              const baseCopies = getCardCountInCollection(card.card_code);
              const altCopiesOwned = allImages.slice(1).reduce((sum, img) => sum + getCardCountInCollection(card.card_code, img), 0);
              const totalCopies = getTotalCardCopies(card.card_code);
              const isOwned = totalCopies > 0;

              // Find which artwork to showcase: if user is in Alt Arts tab or only owns Alt Arts, show the Alt Art image
              const ownedAltImg = allImages.slice(1).find(img => getCardCountInCollection(card.card_code, img) > 0);
              const isAltTab = selectedStatus === 'ALT_ARTS';
              const isShowingAlt = (isAltTab && (ownedAltImg || allImages[1])) || (baseCopies === 0 && altCopiesOwned > 0 && ownedAltImg);
              const activeArtwork = isShowingAlt ? (ownedAltImg || allImages[1]) : allImages[0];
              const cardImg = getCardImageUrl(card, activeArtwork);

              const artworkPriceObj = getCardPriceForArtwork(card, activeArtwork);
              const activePrice = artworkPriceObj.priceEur;

              const trend = getMarketTrendByCode(card.card_code);
              const trendPct = portfolioTimeframe === '7d' ? trend?.change_7d_percent : trend?.change_30d_percent;
              const trendEur = portfolioTimeframe === '7d' ? trend?.change_7d_eur : trend?.change_30d_eur;

              return (
                <div
                  key={card.card_code}
                  className={`group relative rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col justify-between ${
                    isOwned
                      ? 'bg-[#111827] border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40 hover:border-amber-400'
                      : 'bg-[#0B0F17]/90 border-slate-800/80 hover:border-slate-700 shadow-md'
                  }`}
                >
                  {/* Card Visual Thumbnail */}
                  <div
                    onClick={() => onSelectCard(card)}
                    className="relative aspect-[5/7] w-full overflow-hidden cursor-pointer bg-slate-950"
                  >
                    <img
                      src={cardImg}
                      alt={card.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => handleCardImageError(e, card)}
                      className={`w-full h-full object-cover transition-all duration-300 ${
                        isOwned
                          ? 'grayscale-0 opacity-100 brightness-100 group-hover:scale-105'
                          : 'grayscale contrast-85 brightness-75 opacity-40 group-hover:opacity-75 group-hover:scale-102'
                      }`}
                      loading="lazy"
                    />

                    {/* Grayscale subtle veil for unowned */}
                    {!isOwned && (
                      <div className="absolute inset-0 bg-slate-950/25 pointer-events-none group-hover:bg-transparent transition-colors" />
                    )}

                    {/* Top-Left Rarity & Alt Badge */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10 pointer-events-none">
                      <div className={`px-2 py-0.5 rounded font-black text-[10px] tracking-wider shadow-md backdrop-blur-sm ${
                        isOwned
                          ? 'bg-black/90 text-amber-400 border border-amber-500/40'
                          : 'bg-black/80 text-slate-400 border border-slate-700'
                      }`}>
                        {card.rarity || 'C'}
                      </div>
                      {isShowingAlt && (
                        <div className="px-1.5 py-0.5 rounded bg-purple-950/90 text-purple-300 font-extrabold text-[9px] border border-purple-700 shadow-md flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5 text-purple-300" />
                          <span>Alt</span>
                        </div>
                      )}
                      {altCopiesOwned > 0 && !isShowingAlt && (
                        <div className="px-1.5 py-0.2 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 text-black text-[9px] font-black shadow-md flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{altCopiesOwned} Alt</span>
                        </div>
                      )}
                    </div>

                    {/* Top-Right Stepper (+ / -) */}
                    <div 
                      className="absolute top-2 right-2 z-20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isOwned ? (
                        <div className="flex items-center bg-black/95 backdrop-blur-md border border-amber-500/80 rounded-full p-0.5 shadow-2xl shadow-black ring-1 ring-amber-400/40">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isShowingAlt && ownedAltImg) {
                                removeCardFromCollection(card.card_code, 1, ownedAltImg);
                              } else {
                                removeCardFromCollection(card.card_code, 1);
                              }
                            }}
                            className="w-6 h-6 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer"
                            title="Diminuer (retirer 1 exemplaire)"
                          >
                            <Minus className="w-3 h-3 stroke-[3]" />
                          </button>

                          <span className="px-2 font-black text-xs text-amber-400 min-w-[22px] text-center select-none tracking-tight">
                            {totalCopies}x
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isShowingAlt && activeArtwork) {
                                addCardToCollection(card.card_code, 1, activeArtwork);
                              } else {
                                addCardToCollection(card.card_code, 1);
                              }
                            }}
                            className="w-6 h-6 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center transition-all duration-150 active:scale-90 font-black shadow-md shadow-amber-500/30 cursor-pointer"
                            title="Augmenter (ajouter 1 exemplaire)"
                          >
                            <Plus className="w-3 h-3 stroke-[3]" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isShowingAlt && activeArtwork) {
                              addCardToCollection(card.card_code, 1, activeArtwork);
                            } else {
                              addCardToCollection(card.card_code, 1);
                            }
                          }}
                          className="flex items-center justify-center w-7 h-7 rounded-full bg-black/85 hover:bg-emerald-500 text-slate-300 hover:text-black border border-slate-700 hover:border-emerald-400 shadow-xl transition-all duration-150 active:scale-90 cursor-pointer group/btn"
                          title="Ajouter à ma collection (+1)"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      )}
                    </div>

                    {/* Quick Favorite Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(card.card_code);
                      }}
                      className={`absolute bottom-2 right-2 p-1.5 rounded-full transition-all active:scale-90 shadow-md z-10 ${
                        isFavorite(card.card_code)
                          ? 'bg-black/90 text-pink-400 border border-pink-500/50'
                          : 'bg-black/70 text-slate-400 hover:text-pink-400 border border-slate-700/80 opacity-0 group-hover:opacity-100'
                      }`}
                      title={isFavorite(card.card_code) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFavorite(card.card_code) ? 'fill-pink-500 text-pink-400' : ''}`} />
                    </button>
                  </div>

                  {/* Card Info Panel */}
                  <div className="p-3 bg-[#0F172A] border-t border-slate-800 space-y-2">
                    <div className="min-w-0">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono font-bold text-amber-400">
                          {card.card_code}
                          {isShowingAlt && <span className="text-purple-400 ml-1 font-normal">(Alt)</span>}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {trendPct !== undefined && Math.abs(trendPct) >= 0.1 && (
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-black flex items-center gap-0.5 ${
                              trendPct >= 0
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                            title={`Variation sur ${portfolioTimeframe === '7d' ? '7j' : '30j'} : ${trendEur && trendEur >= 0 ? '+' : ''}${trendEur?.toFixed(2)} €`}
                            >
                              {trendPct >= 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                              <span>{trendPct >= 0 ? `+${trendPct.toFixed(1)}%` : `${trendPct.toFixed(1)}%`}</span>
                            </span>
                          )}
                          <span className="text-emerald-400 font-bold">{formatEur(activePrice)}</span>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-white truncate mt-0.5" title={card.name_fr || card.name}>
                        {card.name_fr || card.name}
                      </h4>

                      {/* Alternate Artworks Indicator Button */}
                      {hasMultipleArtworks && (
                        <button
                          onClick={() => onSelectCard(card)}
                          className="w-full mt-1.5 py-1 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Gérer {allImages.length} versions (Alts)</span>
                        </button>
                      )}
                    </div>

                    {/* Bottom Ownership Status */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                      {isOwned ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{totalCopies} en collection</span>
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCardCompletely(card.card_code);
                            }}
                            className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                            title="Supprimer tous les exemplaires de cette carte"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full text-slate-500">
                          <span>Non possédée</span>
                          <span className="text-[10px] text-slate-600">0 ex.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {displayedCards.length < filteredCards.length && (
            <div className="text-center pt-6">
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 shadow-md transition-colors"
              >
                Afficher plus de cartes ({displayedCards.length}/{filteredCards.length})
              </button>
            </div>
          )}
        </>
      )}
        </>
      )}

      {/* Restore / Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#111827] border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Restaurer une Collection (Format JSON)</h3>
            <textarea
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder={`Collez votre code JSON exporté ici...`}
              rows={8}
              className="w-full p-3 rounded-xl bg-[#0B0F17] border border-slate-700 text-xs font-mono text-white resize-none"
            />
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Annuler
              </button>
              <button
                onClick={handleImportSubmit}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold"
              >
                Restaurer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileFilterDrawerOpen}
        onClose={() => setIsMobileFilterDrawerOpen(false)}
        selectedSort={selectedSort}
        setSelectedSort={(s) => { setSelectedSort(s); setPage(1); }}
        selectedRarity={selectedRarity}
        setSelectedRarity={(r) => { setSelectedRarity(r); setPage(1); }}
        variantTab={variantTab}
        setVariantTab={(t) => { setVariantTab(t); setPage(1); }}
        isMangaOnly={isMangaOnly}
        setIsMangaOnly={(m) => { setIsMangaOnly(m); setPage(1); }}
        isCrewMangaOnly={isCrewMangaOnly}
        setIsCrewMangaOnly={(c) => { setIsCrewMangaOnly(c); setPage(1); }}
        minPrice={minPrice}
        setMinPrice={(p) => { setMinPrice(p); setPage(1); }}
        maxPriceLimit={maxPriceLimit}
        priceHistogram={priceHistogram}
        selectedColor={selectedColor}
        setSelectedColor={(c) => { setSelectedColor(c); setPage(1); }}
        selectedCategory={selectedCategory}
        setSelectedCategory={(c) => { setSelectedCategory(c); setPage(1); }}
        selectedIllustrator={selectedIllustrator}
        setSelectedIllustrator={(i) => { setSelectedIllustrator(i); setPage(1); }}
        availableIllustrators={availableIllustrators}
        matchingCount={filteredCards.length}
        activeFiltersCount={activeFiltersCount}
        onResetAll={handleResetFilters}
      />

    </div>
  );
};
