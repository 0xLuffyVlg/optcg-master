import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Plus,
  Minus,
  Crown,
  ExternalLink,
  Sparkles,
  Tag,
  Shield,
  Zap,
  Swords,
  ZoomIn,
  Check,
  TrendingUp,
  Euro,
  Star,
  Share2,
  BookOpen,
  Info,
  ChevronDown
} from 'lucide-react';
import { Card } from '../types';
import { allPrintsAsCards } from '../data/dataProvider';
import { fetchCardDetail, CardDetailData, CardDetailVariant } from '../services/cardDetailsService';
import { fetchLiveCardPriceHistory } from '../services/priceHistoryService';
import {
  getCardImageUrl,
  getColorClass,
  handleCardImageError,
  getCardmarketUrl,
  resolveCardmarketUrlForLanguage,
  getTcgplayerUrl,
  formatCardPrice,
  detectCardLanguage,
  isAltArtworkCard,
  fixVariantCardmarketUrl
} from '../utils/cardUtils';
import { getCardtraderUrl, getCardPriceForArtwork } from '../services/cardmarketPriceService';
import { CardmarketLogo, TCGplayerLogo } from './MarketLogos';
import { useDeck } from '../context/DeckContext';
import { useCollection } from '../context/CollectionContext';
import { useAuth } from '../context/AuthContext';
import {
  getDeviceLanguage,
  setDeviceLanguage,
  translateCardEffect,
  translateCategory,
  translateAttribute,
  translateColor,
  AppLanguage
} from '../utils/cardTranslator';
import { navigateToCard, navigateToTab, updateDocumentTitle } from '../utils/router';
import { CardPriceChart } from './CardPriceChart';

interface CardDetailModalProps {
  card: Card | null;
  onClose: () => void;
}

interface ArtworkVersion {
  type: 'BASE' | 'ALT';
  label: string;
  subLabel: string;
  img: string;
  artKey: string;
  index: number;
}

// Comprehensive Set Names mapping for official breadcrumbs & cyber header
const getSetDetails = (setCode?: string, cardCode?: string): { code: string; name: string } => {
  const code = (setCode || (cardCode ? cardCode.split('-')[0] : '')).toUpperCase().trim();
  const SET_NAMES: Record<string, string> = {
    'OP01': 'Romance Dawn',
    'OP02': 'Paramount War',
    'OP03': 'Pillars of Strength',
    'OP04': 'Kingdoms of Intrigue',
    'OP05': 'Awakening of the New Era',
    'OP06': 'Wings of the Captain',
    'OP07': '500 Years in the Future',
    'OP08': 'Two Legends',
    'OP09': 'Les Nouveaux Empereurs (The New Four Emperors)',
    'OP10': 'Royal Blood',
    'OP11': 'A Fist of Divine Speed',
    'OP12': 'Legacy of the Master',
    'OP13': 'Across the New World',
    'OP14': 'Great Pirate Era',
    'OP15': "Adventure on Kami's Island",
    'OP16': 'Decisive Battle',
    'OP17': 'Inherited Will',
    'OP18': 'Revolutionary Army',
    'EB01': 'Memorial Collection',
    'EB02': 'One Piece Film Edition',
    'EB03': 'Extra Booster Vol. 3',
    'EB04': 'Extra Booster Vol. 4',
    'EB05': 'Extra Booster Vol. 5',
    'PRB01': 'Premium Booster -THE BEST-',
    'PRB02': 'Premium Booster -THE BEST- Vol. 2',
    'ST01': 'Straw Hat Crew',
    'ST02': 'Worst Generation',
    'ST03': 'The Seven Warlords of the Sea',
    'ST04': 'Animal Kingdom Pirates',
    'ST05': 'ONE PIECE FILM edition',
    'ST06': 'Absolute Justice',
    'ST07': 'Big Mom Pirates',
    'ST08': 'Monkey D. Luffy',
    'ST09': 'Yamato',
    'ST10': 'The Three Captains',
    'ST11': 'Uta',
    'ST12': 'Zoro & Sanji',
    'ST13': 'The Three Brothers',
    'ST14': '3D2Y',
    'ST15': 'Red Edward Newgate',
    'ST16': 'Green Uta',
    'ST17': 'Blue Donquixote Doflamingo',
    'ST18': 'Purple Monkey D. Luffy',
    'ST19': 'Black Smoker',
    'ST20': 'Yellow Charlotte Katakuri',
    'ST21': 'Gear 5',
    'P': 'Cartes Promotionnelles (Promo)',
  };

  const name = SET_NAMES[code] || (code.startsWith('ST') ? `Starter Deck [${code}]` : `Booster [${code}]`);
  return { code, name };
};

// Character lore and background context helper (Scalpeurs Style)
const getCardLore = (card: Card, lang: AppLanguage): string => {
  const name = (card.name || '').toLowerCase();
  
  if (name.includes('shanks')) {
    return lang === 'FR'
      ? "L'un des Quatre Empereurs régnant sur le Nouveau Monde, chef de l'Équipage du Roux et mentor spirituel de Luffy. Réputé pour son Haki des Rois dévastateur capable d'ébranler les plus puissants amiraux."
      : "One of the Four Emperors ruling the New World, Chief of the Red Hair Pirates and Luffy's mentor. Renowned for his overwhelming Conqueror's Haki.";
  }
  if (name.includes('luffy')) {
    return lang === 'FR'
      ? "Capitaine téméraire de l'Équipage du Chapeau de Paille, aspirant au titre de Roi des Pirates. Porteur de la volonté du D. et de la liberté absolue à travers les mers."
      : "Daring Captain of the Straw Hat Pirates, striving to become the King of the Pirates and bringing freedom across the seas.";
  }
  if (name.includes('zoro')) {
    return lang === 'FR'
      ? "Combattant légendaire aux trois sabres (Santoryu) de l'Équipage du Chapeau de Paille, voué à terrasser Mihawk pour devenir le plus grand bretteur du monde."
      : "Master of the three-sword style (Santoryu), devoted to defeating Mihawk and becoming the world's greatest swordsman.";
  }
  if (name.includes('nami')) {
    return lang === 'FR'
      ? "Navigatrice prodige de l'Équipage du Chapeau de Paille capable d'anticiper les tempêtes les plus féroces de Grand Line et de cartographier la planète entière."
      : "Genius navigator of the Straw Hat Pirates, able to read Grand Line's fiercest storms and draw a map of the entire world.";
  }
  if (name.includes('law')) {
    return lang === 'FR'
      ? "Le Chirurgien de la Mort, capitaine des Pirates du Heart et détenteur du redoutable Ope Ope no Mi créant des sphères d'opération chirurgicale absolue."
      : "The Surgeon of Death, captain of the Heart Pirates and wielder of the versatile Op-Op Fruit.";
  }
  if (name.includes('doflamingo')) {
    return lang === 'FR'
      ? "Ancien Grand Corsaire et monarque déchu de Dressrosa, courtier machiavélique de la pègre sous le pseudonyme de Joker et maître du Ito Ito no Mi."
      : "Former Warlord and ruler of Dressrosa, shadowy underworld broker known as Joker.";
  }
  if (name.includes('whitebeard') || name.includes('barbe blanche') || name.includes('newgate')) {
    return lang === 'FR'
      ? "L'Homme le plus fort du monde, capitaine de la plus redoutable armada de pirates et protecteur paternel de son immense équipage sur le Moby Dick."
      : "The Strongest Man in the World, Captain of the Whitebeard Pirates and sovereign of the seas.";
  }
  if (name.includes('kaido')) {
    return lang === 'FR'
      ? "La Créature la plus puissante du monde, Gouverneur Général des Cent Bêtes régnant sans pitié sur le pays fermé de Wano."
      : "The Strongest Creature Alive, Governor-General of the Beasts Pirates who conquered Wano.";
  }
  if (name.includes('katakuri')) {
    return lang === 'FR'
      ? "Le plus redouté des trois Sweet Commanders de Big Mom, invaincu au combat grâce à un Haki de l'observation lui révélant un aperçu direct du futur."
      : "The strongest of Big Mom's Sweet Commanders, wielding Future Sight Observation Haki.";
  }
  if (name.includes('hancock')) {
    return lang === 'FR'
      ? "Impératrice Pirate d'Amazon Lily et capitaine des Pirates Kuja, reine guerrière à la beauté envoûtante capable de pétrifier quiconque succombe à son charme."
      : "Snake Princess of Amazon Lily and Captain of the Kuja Pirates, petrifying all who succumb to her beauty.";
  }
  if (name.includes('yamato')) {
    return lang === 'FR'
      ? "Fils de Kaido autoproclamé Kozuki Oden, portant haut les idéaux de liberté pour libérer Wano et naviguer sur l'océan."
      : "Self-proclaimed Kozuki Oden, defying Kaido to liberate Wano and sail the seas.";
  }
  if (name.includes('teach') || name.includes('barbe noire') || name.includes('blackbeard')) {
    return lang === 'FR'
      ? "Amiral des Pirates de Barbe Noire, calculateur impitoyable et seul homme de l'histoire à maîtriser simultanément deux Pouvoirs de Fruits du Démon."
      : "Admiral of the Blackbeard Pirates, ruthless schemer wielding two Devil Fruit abilities.";
  }
  if (name.includes('ace')) {
    return lang === 'FR'
      ? "Commandant de la seconde flotte de Barbe Blanche, surnommé Ace aux Poings Ardents, frère d'armes indéfectible de Monkey D. Luffy et Sabo."
      : "Commander of Whitebeard's 2nd Division, Fire Fist Ace and sworn brother of Luffy and Sabo.";
  }
  
  const categoryLabel = translateCategory(card.category, lang);
  const typesLabel = (card.type || []).join(' / ');
  return lang === 'FR'
    ? `Carte ${categoryLabel} One Piece TCG officielle affiliée à l'archétype ${typesLabel || 'Pirates'}. Issue de l'extension ${card.set_code || card.card_code.split('-')[0]}.`
    : `Official One Piece TCG ${categoryLabel} card affiliated with ${typesLabel || 'Pirates'}. Released in expansion ${card.set_code || card.card_code.split('-')[0]}.`;
};

// Hex color getter for dynamic ambient lighting
const getCardColorHex = (colors?: string[]): string => {
  if (!colors || colors.length === 0) return '#f59e0b';
  const c = colors[0].toLowerCase();
  if (c.includes('red') || c.includes('rouge')) return '#ef4444';
  if (c.includes('blue') || c.includes('bleu')) return '#3b82f6';
  if (c.includes('green') || c.includes('vert')) return '#10b981';
  if (c.includes('purple') || c.includes('violet')) return '#a855f7';
  if (c.includes('black') || c.includes('noir')) return '#64748b';
  if (c.includes('yellow') || c.includes('jaune')) return '#eab308';
  return '#f59e0b';
};

const resolveInitialVariantFile = (c: Card): string => {
  const anyC = c as any;
  if (anyC.detail_file && typeof anyC.detail_file === 'string' && anyC.detail_file.endsWith('.json')) {
    return anyC.detail_file;
  }
  if (anyC.variant && anyC.variant > 1) {
    return `${c.card_code}-v${anyC.variant}.json`;
  }
  const idMatch = (c.id || '').match(/-([2-9])-(\d+)$/);
  if (idMatch) {
    return `${c.card_code}-v${idMatch[1]}.json`;
  }
  const vMatch = (c.id || '').match(/[-_]v([0-9]+)/i);
  if (vMatch) {
    return `${c.card_code}-v${vMatch[1]}.json`;
  }
  return `${c.card_code}-v1.json`;
};

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, onClose }) => {
  // Active card state to enable in-modal Prev / Next card browsing seamlessly
  const [activeCard, setActiveCard] = useState<Card | null>(card);
  const [cardDetail, setCardDetail] = useState<CardDetailData | null>(null);
  const [currentVariantFile, setCurrentVariantFile] = useState<string>('');
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  const { addCard, setLeader } = useDeck();
  const { addCardToCollection, getCardCountInCollection } = useCollection();
  const { toggleFavorite, isFavorite } = useAuth();
  const [isZoomedFullscreen, setIsZoomedFullscreen] = useState<boolean>(false);
  const [justAddedToCollection, setJustAddedToCollection] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [cardLang, setCardLang] = useState<AppLanguage>(getDeviceLanguage());
  const [editionLang, setEditionLang] = useState<'JP' | 'FR' | 'EN'>('FR');
  const [livePriceEur, setLivePriceEur] = useState<number | null>(null);

  // Live price synchronization directly from Scalpeurs / Cardmarket
  useEffect(() => {
    if (!activeCard) return;
    setLivePriceEur(null);
    let cancelled = false;
    fetchLiveCardPriceHistory(activeCard, '7d', currentVariantFile || activeCard._defaultImagePath)
      .then((res) => {
        if (!cancelled && res && res.currentPrice !== undefined && res.currentPrice !== null) {
          setLivePriceEur(res.currentPrice);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [activeCard, currentVariantFile]);

  // Interactive 3D Card Tilt & Holographic Sway on Hover (Scalpeurs Style)
  const [cardTilt, setCardTilt] = useState<{
    rotateX: number;
    rotateY: number;
    translateX: number;
    glareX: number;
    glareY: number;
    isHovered: boolean;
  }>({
    rotateX: 0,
    rotateY: 0,
    translateX: 0,
    glareX: 50,
    glareY: 50,
    isHovered: false,
  });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 2 - 1;
    const yPercent = (y / rect.height) * 2 - 1;

    setCardTilt({
      rotateX: -yPercent * 14,
      rotateY: xPercent * 18,
      translateX: xPercent * 8,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
      isHovered: true,
    });
  };

  const handleCardMouseLeave = () => {
    setCardTilt({
      rotateX: 0,
      rotateY: 0,
      translateX: 0,
      glareX: 50,
      glareY: 50,
      isHovered: false,
    });
  };

  // Sync activeCard and fetch dedicated micro-fiche JSON when card changes
  useEffect(() => {
    if (card) {
      setActiveCard(card);
      setIsZoomedFullscreen(false);
      setJustAddedToCollection(false);
      setCopiedLink(false);
      const isJp = (card.language || '').toLowerCase() === 'jp'
        || (card.id || '').toLowerCase().startsWith('jp-')
        || (card._defaultImagePath || '').toLowerCase().includes('/cards-jp/')
        || Boolean(card.is_japanese)
        || card.set_code === 'OP18'
        || card.set_code === 'EB05'
        || card.set_code === 'PRB02';
      setEditionLang(isJp ? 'JP' : (cardLang === 'FR' ? 'FR' : 'EN'));

      const initialFile = resolveInitialVariantFile(card);
      setCurrentVariantFile(initialFile);
      setIsLoadingDetail(true);

      fetchCardDetail(initialFile)
        .then((detail) => {
          setIsLoadingDetail(false);
          if (detail) {
            setCardDetail(detail);
            if (detail.all_variants && detail.all_variants.length > 0) {
              const match = detail.all_variants.find(
                (v) => v.file.toLowerCase() === initialFile.toLowerCase()
              );
              if (match) {
                setCurrentVariantFile(match.file);
              }
            }
          }
        })
        .catch(() => {
          setIsLoadingDetail(false);
        });
    }
  }, [card]);

  // Handle switching variants if needed
  const handleVariantChange = async (targetFile: string) => {
    setCurrentVariantFile(targetFile);
    setIsLoadingDetail(true);
    try {
      const detail = await fetchCardDetail(targetFile);
      if (detail) {
        setCardDetail(detail);
        // Synchronize activeCard with the matching print if present
        const cleanTarget = targetFile.replace(/\.json$/i, '').toLowerCase();
        const vNumMatch = targetFile.match(/-v(\d+)\.json$/i);
        const targetV = vNumMatch ? parseInt(vNumMatch[1], 10) : undefined;

        const matchingPrint = allPrintsAsCards.find(c =>
          c.card_code.toUpperCase() === detail.code.toUpperCase() &&
          (
            ((c as any).detail_file && (c as any).detail_file.toLowerCase() === targetFile.toLowerCase()) ||
            (targetV !== undefined && (c as any).variant === targetV) ||
            c.id.toLowerCase().includes(cleanTarget)
          )
        );
        if (matchingPrint) {
          setActiveCard(matchingPrint);
        } else {
          setActiveCard(prev => prev ? {
            ...prev,
            detail_file: targetFile,
            variant: targetV,
            scalpeurs_image_url: detail.image_path ? (detail.image_path.startsWith('http') ? detail.image_path : `https://scalpeurs.com${detail.image_path}`) : prev.scalpeurs_image_url,
            _defaultImagePath: detail.image_path ? (detail.image_path.startsWith('http') ? detail.image_path : `https://scalpeurs.com${detail.image_path}`) : prev._defaultImagePath,
            cardmarket_url: detail.cardmarket_url || prev.cardmarket_url,
            price_eur: detail.price_eur ?? prev.price_eur
          } : null);
        }
      }
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Image URL resolution: PRIORITIZE authentic image for variants, and official Bandai HD art for base
  const fullImageUrl = useMemo(() => {
    // 1. If activeCard is an Alt-Art or variant with an authentic image from Scalpeurs, use it!
    if (activeCard && isAltArtworkCard(activeCard)) {
      if (activeCard.scalpeurs_image_url && activeCard.scalpeurs_image_url.startsWith('http')) {
        return activeCard.scalpeurs_image_url;
      }
      if (activeCard._defaultImagePath && activeCard._defaultImagePath.startsWith('http')) {
        return activeCard._defaultImagePath;
      }
      if (cardDetail?.image_url && cardDetail.image_url.startsWith('http')) {
        return cardDetail.image_url;
      }
      if (cardDetail?.image_path && cardDetail.image_path.startsWith('/')) {
        return `https://scalpeurs.com${cardDetail.image_path}`;
      }
      if (cardDetail?.image_url && cardDetail.image_url.startsWith('/')) {
        return `https://scalpeurs.com${cardDetail.image_url.replace('-sm.webp', '.webp')}`;
      }
    }

    // 2. If activeCard has an explicit valid URL
    if (activeCard?._defaultImagePath && activeCard._defaultImagePath.startsWith('http')) {
      return activeCard._defaultImagePath;
    }
    if (activeCard?.scalpeurs_image_url && activeCard.scalpeurs_image_url.startsWith('http')) {
      return activeCard.scalpeurs_image_url;
    }

    // 3. Official Bandai clean code URL (Egman CDN)
    return getCardImageUrl(activeCard, activeCard?._defaultImagePath);
  }, [activeCard, cardDetail]);

  const isLeader = (cardDetail?.category || activeCard.category) === 'Leader';
  const ownedCopiesOfThisArtwork = getCardCountInCollection(activeCard.card_code, currentVariantFile || activeCard._defaultImagePath);

  // Exact price baseline from the clicked card object (matches DatabaseView 100%)
  const gridVerifiedPrice = useMemo(() => {
    if (!activeCard) return 0;
    const directEur = (activeCard as any).price_eur;
    if (directEur !== undefined && directEur !== null && directEur > 0) {
      return directEur;
    }
    const directMin = activeCard.price_min_eur;
    if (directMin !== undefined && directMin !== null && directMin > 0) {
      return directMin;
    }
    const artPrice = getCardPriceForArtwork(activeCard, activeCard._defaultImagePath || activeCard.id || currentVariantFile);
    return artPrice.priceEur || artPrice.priceMinEur || 0;
  }, [activeCard, currentVariantFile]);

  // Exact price baseline from verified artwork dataset
  const artworkBasePrice = useMemo(() => {
    return getCardPriceForArtwork(activeCard, activeCard._defaultImagePath || activeCard.id || currentVariantFile);
  }, [activeCard, currentVariantFile]);

  // Exact 1:1 Cardmarket URLs strictly matching the current variant and language edition
  const activeCardmarketUrl = useMemo(() => {
    if (!activeCard) return 'https://www.cardmarket.com/fr/OnePiece';

    let rawUrl = '';

    // 1. Direct from cardDetail if it matches the active variant file
    if (cardDetail && currentVariantFile && (
      (cardDetail as any).file?.toLowerCase() === currentVariantFile.toLowerCase() ||
      currentVariantFile.toLowerCase().includes((cardDetail.variant_version || '').toLowerCase())
    )) {
      if (editionLang === 'JP' && cardDetail.cardmarket_url_jp) {
        rawUrl = cardDetail.cardmarket_url_jp;
      } else if (cardDetail.cardmarket_url) {
        rawUrl = cardDetail.cardmarket_url;
      }
    }

    // 2. Direct from activeCard (the exact print object the user clicked in the grid)
    if (!rawUrl && activeCard) {
      if (editionLang === 'JP') {
        rawUrl = activeCard.cardmarket_url_jp
          || (activeCard.cardmarket_url && (activeCard.cardmarket_url.includes('-Japanese') || activeCard.cardmarket_url.includes('Non-English')) ? activeCard.cardmarket_url : '')
          || activeCard.cardmarket_url
          || '';
      } else {
        rawUrl = activeCard.cardmarket_url || '';
      }
    }

    // 3. Direct from cardDetail if not already tried
    if (!rawUrl && cardDetail) {
      if (editionLang === 'JP' && cardDetail.cardmarket_url_jp) {
        rawUrl = cardDetail.cardmarket_url_jp;
      } else if (cardDetail.cardmarket_url) {
        rawUrl = cardDetail.cardmarket_url;
      }
    }

    // 4. Check all_variants in cardDetail for a matching file
    if (!rawUrl && cardDetail?.all_variants && currentVariantFile) {
      const vMatch = cardDetail.all_variants.find(
        (v) => v.file && v.file.toLowerCase() === currentVariantFile.toLowerCase()
      );
      if (vMatch?.cardmarket_url) {
        rawUrl = vMatch.cardmarket_url;
      }
    }

    // 5. Fallback to cardLinks by id or path or code
    if (!rawUrl && activeCard) {
      rawUrl = getCardmarketUrl(activeCard.card_code, activeCard._defaultImagePath || activeCard.id || currentVariantFile, activeCard)
        || artworkBasePrice.cardmarketUrl
        || '';
    }

    return resolveCardmarketUrlForLanguage(rawUrl, editionLang);
  }, [editionLang, activeCard, cardDetail, artworkBasePrice, currentVariantFile]);

  const activeTcgplayerUrl = cardDetail?.tcgplayer_url || artworkBasePrice.tcgplayerUrl || getTcgplayerUrl(activeCard.card_code, currentVariantFile || activeCard._defaultImagePath || activeCard.id, activeCard);

  // Active price: accurately reflects the active variant's real price
  const activePriceEur = useMemo(() => {
    // 1. Grid verified price from activeCard (exact price displayed on the card in the grid)
    if (gridVerifiedPrice > 0) {
      return gridVerifiedPrice;
    }

    // 2. Dedicated micro-fiche price for currentVariantFile
    if (cardDetail?.price_eur !== undefined && cardDetail.price_eur !== null && cardDetail.price_eur > 0) {
      return cardDetail.price_eur;
    }

    // 3. Matching variant in all_variants
    if (cardDetail?.all_variants && currentVariantFile) {
      const vMatch = cardDetail.all_variants.find(
        (v) => v.file && v.file.toLowerCase() === currentVariantFile.toLowerCase()
      );
      if (vMatch?.price_eur && vMatch.price_eur > 0) {
        return vMatch.price_eur;
      }
    }

    if (artworkBasePrice.priceEur && artworkBasePrice.priceEur > 0) {
      return artworkBasePrice.priceEur;
    }
    if (artworkBasePrice.priceMinEur && artworkBasePrice.priceMinEur > 0) {
      return artworkBasePrice.priceMinEur;
    }
    return 0;
  }, [gridVerifiedPrice, cardDetail, currentVariantFile, artworkBasePrice]);

  const artworkPriceInfo = useMemo(() => {
    const finalPrice = activePriceEur > 0 ? activePriceEur : (artworkBasePrice.priceMinEur || artworkBasePrice.priceEur || 0);
    return {
      ...artworkBasePrice,
      priceEur: finalPrice,
      priceMinEur: finalPrice,
      cardmarketPriceEur: finalPrice,
      cardmarketUrl: activeCardmarketUrl,
      tcgplayerUrl: activeTcgplayerUrl
    };
  }, [artworkBasePrice, activePriceEur, activeCardmarketUrl, activeTcgplayerUrl]);

  const setInfo = getSetDetails(activeCard.set_code, activeCard.card_code);
  const cardColorHex = getCardColorHex(activeCard.color);
  const isCardJapanese = (activeCard.language || '').toLowerCase() === 'jp'
    || (activeCard.id || '').toLowerCase().startsWith('jp-')
    || Boolean(activeCard.is_japanese)
    || activeCard.set_code === 'OP18'
    || activeCard.set_code === 'EB05'
    || activeCard.set_code === 'PRB02';
  const cardLoreText = getCardLore(activeCard, cardLang);

  // Determine if card is winner or promo
  const isWinnerOrSpecial = isAltArtworkCard(activeCard) && (
    (cardDetail?.variant_name || '').includes('Winner') || 
    (cardDetail?.variant_name || '').includes('Manga') || 
    (cardDetail?.variant_name || '').includes('SP') || 
    (cardDetail?.variant_name || '').includes('1st Place') ||
    (cardDetail?.variant_name || '').includes('CS') ||
    (cardDetail?.variant_name || '').includes('Serial Number') ||
    (activeCard.variant_label || '').includes('Winner') ||
    (activeCard.variant_label || '').includes('1st Place') ||
    (activeCard.variant_label || '').includes('CS') ||
    activeCard.variant_type === 'WINNER' ||
    (activeCard.id || '').toLowerCase().includes('champ') ||
    (activeCard.card_code || '').includes('CHAMP')
  );

  const handleCopyLink = () => {
    const url = `https://www.optcg-master.fr/carte/${activeCard.card_code}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleAddToCollection = () => {
    addCardToCollection(activeCard.card_code, 1, currentVariantFile || activeCard._defaultImagePath);
    setJustAddedToCollection(true);
    setTimeout(() => setJustAddedToCollection(false), 2000);
  };

  const handleAddToDeck = () => {
    if (isLeader) {
      setLeader(activeCard);
    } else {
      addCard(activeCard, 1);
    }
  };

  // Helper to format card effect keywords with badges
  const renderFormattedEffect = (text?: string) => {
    if (!text) return null;
    const parts = text.split(/(\[[^\]]+\])/g);

    return (
      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-medium">
        {parts.map((part, i) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            const keyword = part.slice(1, -1);
            let badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
            
            if (keyword.toLowerCase().includes('trigger')) {
              badgeClass = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 font-black';
            } else if (keyword.toLowerCase().includes('rush') || keyword.toLowerCase().includes('blocker')) {
              badgeClass = 'bg-red-500/20 text-red-300 border-red-500/40 font-black';
            } else if (keyword.toLowerCase().includes('don')) {
              badgeClass = 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-black';
            } else if (keyword.toLowerCase().includes('on play') || keyword.toLowerCase().includes('when attacking')) {
              badgeClass = 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-black';
            }

            return (
              <span
                key={i}
                className={`inline-block px-1.5 py-0.2 mx-0.5 my-0.5 rounded text-[11px] font-black border ${badgeClass}`}
              >
                {part}
              </span>
            );
          }
          return part;
        })}
      </p>
    );
  };

  // Listen to global language changes
  useEffect(() => {
    const handleLangChange = (e: any) => {
      if (e.detail) setCardLang(e.detail);
    };
    window.addEventListener('optcg-language-changed', handleLangChange);
    return () => window.removeEventListener('optcg-language-changed', handleLangChange);
  }, []);

  // Keyboard support: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!activeCard) return null;

  return createPortal(
    <>
      {/* Modal Backdrop */}
      <div 
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto cursor-pointer"
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl xl:max-w-7xl bg-[#0C101A] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 cursor-default max-h-[95vh] flex flex-col"
        >
          
          {/* TOP BAR: Breadcrumbs + Language Switcher + Close Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-slate-800/90 bg-[#080B12] flex-shrink-0">
            
            {/* Breadcrumb Navigation (Scalpeurs Style) */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium truncate max-w-full sm:max-w-xl">
              <span className="text-slate-400">
                {isCardJapanese ? 'Cartes japonaises' : (cardLang === 'FR' ? 'Cartes françaises' : 'Cartes anglaises')}
              </span>
              <span className="text-slate-600">›</span>
              <span className="text-slate-300 font-semibold truncate hover:text-amber-400 transition-colors">
                [{setInfo.code}] {setInfo.name}
              </span>
              <span className="text-slate-600">›</span>
              <span className="text-amber-400 font-bold truncate">
                {activeCard.name_fr || activeCard.name} ({activeCard.card_code})
              </span>
            </div>

            {/* Language Switcher Pills & Close Button */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
              <div className="flex items-center bg-slate-900/90 p-0.5 rounded-xl border border-slate-700 text-xs font-black shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setEditionLang('JP');
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    editionLang === 'JP'
                      ? 'bg-amber-500 text-black shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Édition Japonaise"
                >
                  🇯🇵 JP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditionLang('FR');
                    setCardLang('FR');
                    setDeviceLanguage('FR');
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    editionLang === 'FR'
                      ? 'bg-amber-500 text-black shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Édition Française"
                >
                  🇫🇷 FR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditionLang('EN');
                    setCardLang('EN');
                    setDeviceLanguage('EN');
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    editionLang === 'EN'
                      ? 'bg-amber-500 text-black shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Édition Anglaise"
                >
                  🇬🇧 EN
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* MAIN MODAL BODY: 3-Panel Layout (Left: Card Visual | Center: Cyber Identity & Lore | Right: Price Evolution) */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* PANEL 1 (LEFT): Card Visual + Ambient Glow + Artworks + Prev/Next Navigation */}
              <div className="lg:col-span-4 xl:col-span-3 flex flex-col items-center justify-start [perspective:1000px] space-y-3">
                
                {/* 3D Tilt Card Container with dynamic ambient glow matching card color */}
                <div className="relative w-full max-w-[280px] sm:max-w-[300px] flex items-center justify-center">
                  
                  {/* Ambient Halo Behind Card */}
                  <div 
                    className="absolute inset-0 w-full h-full rounded-3xl blur-3xl opacity-35 pointer-events-none transition-all duration-300"
                    style={{ backgroundColor: cardColorHex }}
                  />

                  {/* 3D Interactive Card Frame */}
                  <div 
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                    onClick={() => setIsZoomedFullscreen(true)}
                    style={{
                      transform: `perspective(1000px) rotateX(${cardTilt.rotateX}deg) rotateY(${cardTilt.rotateY}deg) translateX(${cardTilt.translateX}px) ${cardTilt.isHovered ? 'scale3d(1.03, 1.03, 1.03)' : 'scale3d(1, 1, 1)'}`,
                      transition: cardTilt.isHovered ? 'transform 0.08s ease-out' : 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      transformStyle: 'preserve-3d',
                      willChange: 'transform',
                    }}
                    className="relative group rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/80 hover:border-amber-400 w-full bg-slate-900 cursor-zoom-in flex items-center justify-center select-none"
                    title="Cliquez pour agrandir en plein écran HD"
                  >
                    <img
                      key={fullImageUrl}
                      src={fullImageUrl}
                      alt={activeCard.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => handleCardImageError(e, activeCard)}
                      className="w-full h-auto object-contain rounded-2xl pointer-events-none"
                      loading="eager"
                    />
                    
                    {/* Holographic dynamic glare overlay following cursor */}
                    {cardTilt.isHovered && (
                      <div 
                        className="absolute inset-0 pointer-events-none rounded-2xl z-10 mix-blend-overlay transition-opacity duration-200"
                        style={{
                          background: `radial-gradient(circle at ${cardTilt.glareX}% ${cardTilt.glareY}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.12) 40%, transparent 80%)`,
                        }}
                      />
                    )}
                    
                    {/* Top-Left Rarity Badge */}
                    <div className="absolute top-2.5 left-2.5 z-20 px-2 py-0.5 rounded-lg bg-black/85 backdrop-blur-md text-[11px] font-black text-amber-400 border border-amber-500/40 shadow-md">
                      {activeCard.rarity || 'C'}
                    </div>

                    {/* Top-Right Collection '+' or '✓' Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCollection();
                      }}
                      className={`absolute top-2.5 right-2.5 z-30 p-2 rounded-full transition-all active:scale-90 shadow-2xl border flex items-center justify-center cursor-pointer ${
                        justAddedToCollection
                          ? 'bg-emerald-500 text-black border-emerald-400 scale-110 shadow-emerald-500/40 ring-2 ring-emerald-300'
                          : ownedCopiesOfThisArtwork > 0
                            ? 'bg-emerald-500 text-black border-emerald-400 hover:bg-emerald-400 hover:scale-105 shadow-emerald-500/30'
                            : 'bg-black/85 backdrop-blur-md text-white border-white/30 hover:border-amber-400 hover:bg-amber-500 hover:text-black hover:scale-105'
                      }`}
                      title={
                        ownedCopiesOfThisArtwork > 0
                          ? `Dans votre collection : ${ownedCopiesOfThisArtwork}x (Cliquez pour ajouter +1)`
                          : 'Ajouter cette carte à votre collection (+1)'
                      }
                    >
                      {justAddedToCollection ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <div className="flex items-center gap-0.5">
                          {ownedCopiesOfThisArtwork > 0 ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span className="text-[10px] font-black">{ownedCopiesOfThisArtwork}</span>
                            </>
                          ) : (
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          )}
                        </div>
                      )}
                    </button>

                    {/* Click to zoom overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-20">
                      <div className="px-3 py-1.5 rounded-xl bg-black/80 text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 shadow-lg">
                        <ZoomIn className="w-4 h-4 text-amber-400" />
                        <span>Agrandir</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* PANEL 2 (CENTER): Cyber Identity Widget + Attribute Capsules + Lore & Effects */}
              <div className="lg:col-span-4 xl:col-span-5 space-y-4">
                
                {/* CYBER IDENTITY HEADER WIDGET (Scalpeurs Style) */}
                <div className="relative">
                  
                  {/* Top Trapezoid Rarity / Tier Badge */}
                  <div className="flex justify-center -mb-2.5 z-10 relative">
                    <div className="px-5 py-1 rounded-t-xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 font-black text-xs tracking-widest uppercase shadow-lg shadow-amber-500/20 border-t border-x border-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>{cardDetail?.rarity || activeCard.rarity || 'SR'}</span>
                    </div>
                  </div>

                  {/* Main Cyber Identity Box */}
                  <div className="relative rounded-2xl bg-gradient-to-b from-[#131B2E] via-[#0E1524] to-[#0A0E17] border border-cyan-500/30 p-4 sm:p-5 shadow-2xl space-y-3">
                    
                    {/* Cyber Neon Corner Accents */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg pointer-events-none" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 rounded-br-lg pointer-events-none" />

                    {/* Top Row inside Widget: Star Favorite (Left) & Share (Right) */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => toggleFavorite(activeCard.card_code)}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all active:scale-95 shadow-md cursor-pointer ${
                          isFavorite(activeCard.card_code)
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                            : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-amber-400 hover:border-amber-500/30'
                        }`}
                        title="Ajouter aux Favoris"
                      >
                        <Star className={`w-3.5 h-3.5 ${isFavorite(activeCard.card_code) ? 'fill-amber-400 text-amber-400' : ''}`} />
                        <span>{isFavorite(activeCard.card_code) ? 'Favori' : 'Favoris'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all active:scale-95 shadow-md cursor-pointer ${
                          copiedLink
                            ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                            : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40'
                        }`}
                        title="Partager cette carte"
                      >
                        {copiedLink ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Lien Copié !</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Partager</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Set Subtitle & Bold Card Name */}
                    <div className="text-center space-y-1">
                      <div className="text-[11px] font-bold text-cyan-400 tracking-wider uppercase">
                        {setInfo.code} · {setInfo.name}
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
                        {(() => {
                          if (!isAltArtworkCard(activeCard)) {
                            return activeCard.name_fr || activeCard.name;
                          }
                          const vName = activeCard.variant_label || cardDetail?.variant_name;
                          if (!vName || vName === 'Base') {
                            return activeCard.name_fr || activeCard.name;
                          }
                          const baseName = activeCard.name_fr || activeCard.name;
                          if (vName.toLowerCase().startsWith(baseName.toLowerCase())) {
                            return vName;
                          }
                          return `${baseName} (${vName})`;
                        })()}
                      </h1>
                      {activeCard.jp_name && (
                        <div className="text-xs text-slate-400 font-medium font-mono">
                          {activeCard.jp_name}
                        </div>
                      )}
                    </div>

                    {/* Badges Row (Winner, Category, Traits) */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                      {isWinnerOrSpecial && (
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black flex items-center gap-1 shadow-sm">
                          <Crown className="w-3 h-3 text-amber-400" />
                          <span>Vainqueur</span>
                        </span>
                      )}
                      
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black border ${
                        isLeader 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      }`}>
                        {isLeader ? '👑 Leader' : `⚔️ ${translateCategory(activeCard.category, cardLang)}`}
                      </span>

                      {(activeCard.type || []).map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800/80 text-slate-300 border border-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Bottom Row Inside Widget: Card Code + Live Glow Dot + Price Capsule */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs sm:text-sm text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-800/50">
                          {activeCard.card_code}
                        </span>
                        <span 
                          className="w-2.5 h-2.5 rounded-full animate-pulse shadow-md"
                          style={{ backgroundColor: cardColorHex, boxShadow: `0 0 10px ${cardColorHex}` }}
                          title="Statut marché actif"
                        />
                      </div>

                      {/* Glowing Price Capsule: [CM] 150 000,00 € [NM] */}
                      <a
                        href={activeCardmarketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/50 hover:border-emerald-400 text-xs font-black shadow-md hover:scale-105 transition-all group"
                        title="Voir la cote sur Cardmarket"
                      >
                        <CardmarketLogo className="w-4 h-4" />
                        <span className="text-emerald-400 font-black text-xs sm:text-sm">
                          {formatCardPrice(activePriceEur, 'EUR')}
                        </span>
                        <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[8px] font-black border border-emerald-500/30">
                          NM
                        </span>
                        <ExternalLink className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    </div>

                  </div>
                </div>

                {/* ATTRIBUTE CAPSULES ROW */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                    isLeader 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}>
                    {translateCategory(activeCard.category, cardLang)}
                  </span>

                  {(activeCard.color || []).map((col) => {
                    const style = getColorClass(col);
                    return (
                      <span key={col} className={`px-2.5 py-1 rounded-lg text-xs font-bold ${style.bg} text-white shadow-sm`}>
                        {translateColor(col, cardLang)}
                      </span>
                    );
                  })}

                  {activeCard.attribute && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700">
                      {translateAttribute(activeCard.attribute, cardLang)}
                    </span>
                  )}
                  {activeCard.power !== undefined && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-amber-400 border border-slate-700 flex items-center gap-1">
                      <Swords className="w-3.5 h-3.5" />
                      {activeCard.power}
                    </span>
                  )}
                  {activeCard.cost !== undefined && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-blue-400 border border-slate-700">
                      {cardLang === 'FR' ? 'Coût' : 'Cost'} {activeCard.cost}
                    </span>
                  )}
                  {activeCard.counter !== undefined && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-emerald-400 border border-slate-700 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" />
                      +{activeCard.counter} {cardLang === 'FR' ? 'Contre' : 'Counter'}
                    </span>
                  )}
                </div>

                {/* LORE & BACKSTORY BOX (Scalpeurs Style) */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-400 uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Lore & Présentation</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    « {cardLoreText} »
                  </p>
                </div>

                {/* OFFICIAL TEXT & EFFECTS BOX */}
                {activeCard.effect && (
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                        {cardLang === 'FR' ? 'Effets Officiels (Traduit)' : 'Official Card Text & Effects'}
                      </span>
                      
                      <span className="text-[10px] text-slate-500 uppercase font-mono">
                        Règles Officielles
                      </span>
                    </div>

                    {renderFormattedEffect(translateCardEffect(activeCard.effect, cardLang))}
                  </div>
                )}

                {/* TRIGGER BOX */}
                {activeCard.trigger && (
                  <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/40 space-y-1">
                    <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      {cardLang === 'FR' ? 'Déclencheur (Trigger)' : 'Trigger'}
                    </span>
                    <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed font-medium">
                      {translateCardEffect(activeCard.trigger, cardLang)}
                    </p>
                  </div>
                )}

                {/* ADD TO DECK / LEADER BUTTON */}
                <button
                  type="button"
                  onClick={handleAddToDeck}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-black text-sm shadow-xl transition-all active:scale-95 cursor-pointer ${
                    isLeader
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/20'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-blue-600/20'
                  }`}
                >
                  {isLeader ? (
                    <>
                      <Crown className="w-4 h-4" />
                      <span>Définir comme Leader</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Ajouter au Deck (+1)</span>
                    </>
                  )}
                </button>

              </div>

              {/* PANEL 3 (RIGHT): Price Evolution Chart & Live Sources */}
              <div className="lg:col-span-4 xl:col-span-4 flex flex-col justify-start">
                <CardPriceChart
                  card={activeCard}
                  cardDetail={cardDetail}
                  artworkKey={currentVariantFile || activeCard._defaultImagePath}
                  artworkPriceInfo={artworkPriceInfo}
                />
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Fullscreen HD Zoom Modal */}
      {isZoomedFullscreen && (
        <div 
          onClick={() => setIsZoomedFullscreen(false)}
          className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-lg w-full flex flex-col items-center">
            <img
              key={fullImageUrl}
              src={fullImageUrl}
              alt={activeCard.name}
              referrerPolicy="no-referrer"
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl border-2 border-amber-400/80"
            />
            <p className="text-xs text-slate-400 mt-3 font-semibold text-center">
              {activeCard.name} ({activeCard.card_code}) • Cliquez n'importe où pour fermer
            </p>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};
