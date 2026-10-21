import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Plus, 
  Crown, 
  Swords, 
  Shield, 
  Zap, 
  Layers, 
  Flame,
  ArrowUpDown,
  SlidersHorizontal,
  PackageOpen,
  Boxes,
  ExternalLink,
  Globe,
  Menu,
  X,
  ChevronDown,
  Check,
  RotateCcw
} from 'lucide-react';
import { Card } from '../types';
import { allCards, allVariants, allRawCards, cardsByCode, allPrintsAsCards } from '../data/dataProvider';
import { getCardImageUrl, getColorClass, handleCardImageError, matchesCardSearch, getCardmarketUrl, resolveCardmarketUrlForLanguage, getTcgplayerUrl, isAltArtworkCard, fixVariantCardmarketUrl } from '../utils/cardUtils';
import { useDeck } from '../context/DeckContext';
import { useCollection } from '../context/CollectionContext';
import { getCardmarketPriceInfo, getCardPriceForArtwork, formatEur } from '../services/cardmarketPriceService';
import { CardmarketLogo, TCGplayerLogo, CardtraderLogo } from '../components/MarketLogos';
import { MobileFilterDrawer } from '../components/MobileFilterDrawer';
import { ScalpeursHeroBanner } from '../components/ScalpeursHeroBanner';
import CARDS_BANNER_IMG from '../assets/cards-banner.webp';
import CARDS_BANNER_IMG_2X from '../assets/cards-banner-2x.webp';

interface DatabaseViewProps {
  onSelectCard: (card: Card) => void;
}

export interface SetCollectionMeta {
  code: string;
  name: string;
  nameFr?: string;
  releaseDate?: string;
  group: 'OP' | 'ST' | 'EB' | 'PRB' | 'P';
  cover: string;
}

export const ALL_COLLECTIONS: SetCollectionMeta[] = [
  // OP Sets (Boosters)
  { code: 'OP18', name: 'The Dominance of God', nameFr: 'La Domination de Dieu', releaseDate: '28 MARS 2026', group: 'OP', cover: 'https://scalpeurs.com/collection-covers/op18-mini.webp' },
  { code: 'OP17', name: "The World's Strongest Warrior", nameFr: "Les Guerriers les Plus Puissants au Monde", releaseDate: '28 AOÛT 2026', group: 'OP', cover: '/images/sealed/op-17-display.png' },
  { code: 'OP16', name: 'The Time of Battle', nameFr: "L'Heure du Combat", releaseDate: '24 MAI 2026', group: 'OP', cover: '/images/sealed/op-16-display.png' },
  { code: 'OP15', name: "Adventure on KAMI's Island", nameFr: "Aventure sur l'Île de KAMI", releaseDate: '28 FÉVRIER 2026', group: 'OP', cover: '/images/sealed/op-15-display.jpg' },
  { code: 'OP14', name: "The Azure Sea's Seven", nameFr: "Les Sept Mers d'Azur", releaseDate: '29 NOVEMBRE 2025', group: 'OP', cover: '/images/sealed/op-14-display.jpg' },
  { code: 'OP13', name: 'Carrying on His Will', nameFr: "Héritage de la Volonté", releaseDate: '30 AOÛT 2025', group: 'OP', cover: '/images/sealed/op-13-display.jpg' },
  { code: 'OP12', name: 'Legacy of the Master', nameFr: "L'Héritage du Maître", releaseDate: '31 MAI 2025', group: 'OP', cover: '/images/sealed/op-12-display.jpg' },
  { code: 'OP11', name: 'A Fist of Divine Speed', nameFr: "Un Poing à Vitesse Divine", releaseDate: '22 FÉVRIER 2025', group: 'OP', cover: '/images/sealed/op-11-display.jpg' },
  { code: 'OP10', name: 'Royal Blood', nameFr: "Sang Royal", releaseDate: '30 NOVEMBRE 2024', group: 'OP', cover: '/images/sealed/op-10-display.jpg' },
  { code: 'OP09', name: 'Emperors in the New World', nameFr: "Les Empereurs du Nouveau Monde", releaseDate: '31 AOÛT 2024', group: 'OP', cover: '/images/sealed/op-09-display.jpg' },
  { code: 'OP08', name: 'Two Legends', nameFr: "Deux Légendes", releaseDate: '25 MAI 2024', group: 'OP', cover: '/images/sealed/op-08-display.jpg' },
  { code: 'OP07', name: '500 Years in the Future', nameFr: "500 Ans dans le Futur", releaseDate: '24 FÉVRIER 2024', group: 'OP', cover: '/images/sealed/op-07-display.jpg' },
  { code: 'OP06', name: 'Wings of the Captain', nameFr: "Les Ailes du Capitaine", releaseDate: '25 NOVEMBRE 2023', group: 'OP', cover: '/images/sealed/op-06-display.jpg' },
  { code: 'OP05', name: 'Awakening of the New Era', nameFr: "L'Éveil de la Nouvelle Ère", releaseDate: '26 AOÛT 2023', group: 'OP', cover: '/images/sealed/op-05-display.jpg' },
  { code: 'OP04', name: 'Kingdoms of Intrigue', nameFr: "Complots du Royaume", releaseDate: '27 MAI 2023', group: 'OP', cover: '/images/sealed/op-04-display.jpg' },
  { code: 'OP03', name: 'Pillars of Strength', nameFr: "Les Piliers de la Force", releaseDate: '11 FÉVRIER 2023', group: 'OP', cover: '/images/sealed/op-03-display.jpg' },
  { code: 'OP02', name: 'Paramount War', nameFr: "Guerre au Sommet", releaseDate: '4 NOVEMBRE 2022', group: 'OP', cover: '/images/sealed/op-02-display.jpg' },
  { code: 'OP01', name: 'Romance Dawn', nameFr: "Romance Dawn", releaseDate: '22 JUILLET 2022', group: 'OP', cover: '/images/sealed/op-01-display.jpg' },

  // Extra Boosters (EB)
  { code: 'EB05', name: 'Heroines Edition Vol. 2', nameFr: 'Édition Héroïnes Vol. 2', releaseDate: 'JUILLET 2026', group: 'EB', cover: 'https://scalpeurs.com/collection-covers/eb05-mini.webp' },
  { code: 'EB04', name: 'Egghead Crisis', nameFr: 'Crise sur Egghead', releaseDate: 'AVRIL 2026', group: 'EB', cover: 'https://scalpeurs.com/collection-covers/eb04-mini.webp' },
  { code: 'EB03', name: 'Heroines Edition', nameFr: 'Édition Héroïnes Vol. 1', releaseDate: 'JANVIER 2026', group: 'EB', cover: '/images/sealed/eb-03-display.jpg' },
  { code: 'EB02', name: 'Anime 25th Collection', nameFr: 'Collection 25e Anniversaire Anime', releaseDate: 'SEPTEMBRE 2025', group: 'EB', cover: '/images/sealed/eb-02-display.jpg' },
  { code: 'EB01', name: 'Memorial Collection', nameFr: 'Memorial Collection', releaseDate: '27 JANVIER 2024', group: 'EB', cover: '/images/sealed/eb-01-display.jpg' },

  // Premium Boosters (PRB)
  { code: 'PRB02', name: 'The Best Vol. 2', nameFr: 'The Best Vol. 2', releaseDate: 'JUILLET 2026', group: 'PRB', cover: '/images/sealed/prb-02-display.jpg' },
  { code: 'PRB01', name: 'The Best', nameFr: 'The Best Vol. 1', releaseDate: '27 JUILLET 2024', group: 'PRB', cover: '/images/sealed/prb-01-display.jpg' },

  // Starter Decks (ST01 to ST36)
  { code: 'ST36', name: 'Eustass Captain Kid', group: 'ST', cover: '/images/sealed/st-36.png' },
  { code: 'ST35', name: 'Starter Deck 35', group: 'ST', cover: '/images/sealed/st-35.png' },
  { code: 'ST34', name: 'Starter Deck 34', group: 'ST', cover: '/images/sealed/st-34.png' },
  { code: 'ST33', name: 'Starter Deck 33', group: 'ST', cover: '/images/sealed/st-33.png' },
  { code: 'ST32', name: 'Starter Deck 32', group: 'ST', cover: '/images/sealed/st-32.png' },
  { code: 'ST31', name: 'Starter Deck 31', group: 'ST', cover: '/images/sealed/st-31.png' },
  { code: 'ST30', name: 'Starter Deck 30', group: 'ST', cover: '/images/sealed/st-30.png' },
  { code: 'ST29', name: 'Starter Deck 29', group: 'ST', cover: '/images/sealed/st-29.png' },
  { code: 'ST28', name: 'Green Doflamingo', group: 'ST', cover: '/images/sealed/st-28.png' },
  { code: 'ST27', name: 'Purple Luffy', group: 'ST', cover: '/images/sealed/st-27.png' },
  { code: 'ST26', name: 'Black Smoker', group: 'ST', cover: '/images/sealed/st-26.png' },
  { code: 'ST25', name: 'Blue Buggy', group: 'ST', cover: '/images/sealed/st-25.png' },
  { code: 'ST24', name: 'Yellow Linlin', group: 'ST', cover: '/images/sealed/st-24.png' },
  { code: 'ST23', name: 'Red Shanks', group: 'ST', cover: '/images/sealed/st-23.png' },
  { code: 'ST22', name: 'Ace & Newgate', group: 'ST', cover: '/images/sealed/st-22.jpg' },
  { code: 'ST21', name: 'EX Gear 5', group: 'ST', cover: '/images/sealed/st-21.jpg' },
  { code: 'ST20', name: 'Yellow Katakuri', group: 'ST', cover: '/images/sealed/st-20.png' },
  { code: 'ST19', name: 'Black Smoker', group: 'ST', cover: '/images/sealed/st-19.png' },
  { code: 'ST18', name: 'Purple Luffy', group: 'ST', cover: '/images/sealed/st-18.png' },
  { code: 'ST17', name: 'Blue Doflamingo', group: 'ST', cover: '/images/sealed/st-17.png' },
  { code: 'ST16', name: 'Green Uta', group: 'ST', cover: '/images/sealed/st-16.png' },
  { code: 'ST15', name: 'Red Edward Newgate', group: 'ST', cover: '/images/sealed/st-15.png' },
  { code: 'ST14', name: '3D2Y', group: 'ST', cover: '/images/sealed/st-14.jpg' },
  { code: 'ST13', name: 'Three Brothers Bond', group: 'ST', cover: '/images/sealed/st-13.jpg' },
  { code: 'ST12', name: 'Zoro & Sanji', group: 'ST', cover: '/images/sealed/st-12.jpg' },
  { code: 'ST11', name: 'Side Uta', group: 'ST', cover: '/images/sealed/st-11.jpg' },
  { code: 'ST10', name: 'Three Captains', group: 'ST', cover: '/images/sealed/st-10.jpg' },
  { code: 'ST09', name: 'Side Yamato', group: 'ST', cover: '/images/sealed/st-09.jpg' },
  { code: 'ST08', name: 'Side Monkey D. Luffy', group: 'ST', cover: '/images/sealed/st-08.jpg' },
  { code: 'ST07', name: 'Big Mom Pirates', group: 'ST', cover: '/images/sealed/st-07.jpg' },
  { code: 'ST06', name: 'The Navy', group: 'ST', cover: '/images/sealed/st-06.jpg' },
  { code: 'ST05', name: 'FILM edition', group: 'ST', cover: '/images/sealed/st-05.jpg' },
  { code: 'ST04', name: 'Animal Kingdom Pirates', group: 'ST', cover: '/images/sealed/st-04.png' },
  { code: 'ST03', name: 'The Seven Warlords', group: 'ST', cover: '/images/sealed/st-03.png' },
  { code: 'ST02', name: 'Worst Generation', group: 'ST', cover: '/images/sealed/st-02.png' },
  { code: 'ST01', name: 'Straw Hat Crew', group: 'ST', cover: '/images/sealed/st-01.png' },

  // Promos & Winner
  { code: 'P', name: 'Promos Officielles & Championship', group: 'P', cover: '/images/sealed/pcc-25th.jpg' },
  { code: 'DON', name: 'DON!! Cards Spéciales', group: 'P', cover: '/images/sealed/devil-fruit-01.png' },
];

type SetGroupType = 'ALL' | 'OP' | 'ST' | 'EB' | 'PRB' | 'P' | 'JP';
export type SortOption = 'price-desc' | 'price-asc' | 'lang-fr-en-jp' | 'lang-en-fr-jp' | 'lang-jp-en-fr' | 'alpha-asc' | 'alpha-desc' | 'code-desc' | 'code-asc' | 'variants-desc' | 'cost-asc' | 'cost-desc' | 'power-desc' | 'rarity-desc';

const OP_SETS = ['OP18', 'OP17', 'OP16', 'OP15', 'OP14', 'OP13', 'OP12', 'OP11', 'OP10', 'OP09', 'OP08', 'OP07', 'OP06', 'OP05', 'OP04', 'OP03', 'OP02', 'OP01'];
const ST_SETS = [
  'ST36', 'ST35', 'ST34', 'ST33', 'ST32', 'ST31', 'ST30', 'ST29', 'ST28', 'ST27',
  'ST26', 'ST25', 'ST24', 'ST23', 'ST22', 'ST21', 'ST20', 'ST19', 'ST18', 'ST17',
  'ST16', 'ST15', 'ST14', 'ST13', 'ST12', 'ST11', 'ST10', 'ST09', 'ST08', 'ST07',
  'ST06', 'ST05', 'ST04', 'ST03', 'ST02', 'ST01'
];
const EB_SETS = ['EB05', 'EB04', 'EB03', 'EB02', 'EB01'];
const PRB_SETS = ['PRB02', 'PRB01'];
const P_SETS = ['P', 'DON', 'DP07', 'DP08', 'DP09', 'DP10', 'DP11', 'DP12', 'DF03', 'TS01'];
const JP_SETS = ['OP18', 'EB05', 'PRB02', 'P'];

const EFFECT_KEYWORDS = [
  { key: 'ALL', label: 'Tous les Effets' },
  { key: 'blocker', label: '🛡️ Blocker (Bloqueur)' },
  { key: 'rush', label: '⚡ Rush (Célérité)' },
  { key: 'trigger', label: '🎯 Trigger (Déclencheur)' },
  { key: 'on play', label: '⚔️ On Play (Entrée en jeu)' },
  { key: 'when attacking', label: '💥 When Attacking (À l\'attaque)' },
  { key: 'activate: main', label: '🔄 Activate: Main' },
  { key: 'don!!', label: '🔥 DON!! x1 / x2' },
  { key: 'banish', label: '⛔ Banish (Bannissement)' },
  { key: 'double attack', label: '⚔️ Double Attack' },
  { key: 'counter', label: '🛡️ Counter (Contre)' },
  { key: 'on k.o.', label: '💀 On K.O.' },
  { key: 'end of your turn', label: '⌛ End of Turn' }
];

export { isAltArtworkCard } from '../utils/cardUtils';

export const renderCircularFlag = (lang: 'ALL' | 'JP' | 'EN' | 'FR', sizeClass = 'w-7 h-7') => {
  if (lang === 'JP') {
    return (
      <svg viewBox="0 0 32 32" className={`${sizeClass} rounded-full flex-shrink-0 shadow-sm`}>
        <circle cx="16" cy="16" r="16" fill="#FFFFFF" />
        <circle cx="16" cy="16" r="6.2" fill="#BC002D" />
      </svg>
    );
  }
  if (lang === 'FR') {
    return (
      <svg viewBox="0 0 32 32" className={`${sizeClass} rounded-full flex-shrink-0 shadow-sm`}>
        <defs>
          <clipPath id="circle-clip-fr">
            <circle cx="16" cy="16" r="16" />
          </clipPath>
        </defs>
        <g clipPath="url(#circle-clip-fr)">
          <rect width="10.66" height="32" x="0" fill="#002654" />
          <rect width="10.66" height="32" x="10.66" fill="#FFFFFF" />
          <rect width="10.68" height="32" x="21.32" fill="#ED2939" />
        </g>
      </svg>
    );
  }
  if (lang === 'EN') {
    return (
      <svg viewBox="0 0 32 32" className={`${sizeClass} rounded-full flex-shrink-0 shadow-sm`}>
        <defs>
          <clipPath id="circle-clip-en">
            <circle cx="16" cy="16" r="16" />
          </clipPath>
        </defs>
        <g clipPath="url(#circle-clip-en)">
          <rect width="32" height="32" fill="#012169" />
          <path d="M0 0 L32 32 M32 0 L0 32" stroke="#FFFFFF" strokeWidth="4.5" />
          <path d="M0 0 L32 32 M32 0 L0 32" stroke="#C8102E" strokeWidth="2.2" />
          <path d="M16 0 V32 M0 16 H32" stroke="#FFFFFF" strokeWidth="6" />
          <path d="M16 0 V32 M0 16 H32" stroke="#C8102E" strokeWidth="3.6" />
        </g>
      </svg>
    );
  }
  return (
    <div className={`${sizeClass} rounded-full flex-shrink-0 bg-slate-800 border border-slate-600 flex items-center justify-center text-xs shadow-sm`}>
      🌍
    </div>
  );
};

const SORT_DROPDOWN_OPTIONS: { value: SortOption; label: string; short: string }[] = [
  { value: 'price-desc', label: '💰 Les plus chères', short: '💰 Les plus chères' },
  { value: 'price-asc', label: '🪙 Les moins chères', short: '🪙 Les moins chères' },
  { value: 'lang-fr-en-jp', label: '🇫🇷 Français en premier', short: '🇫🇷 Français' },
  { value: 'lang-en-fr-jp', label: '🇬🇧 Anglais en premier', short: '🇬🇧 Anglais' },
  { value: 'lang-jp-en-fr', label: '🇯🇵 Japonais en premier', short: '🇯🇵 Japonais' },
  { value: 'alpha-asc', label: '🔤 Alphabétique (A → Z)', short: '🔤 Nom (A-Z)' },
  { value: 'alpha-desc', label: '🔤 Alphabétique (Z → A)', short: '🔤 Nom (Z-A)' },
  { value: 'code-desc', label: '🔢 Plus récentes d\'abord', short: '🔢 Récentes' },
  { value: 'code-asc', label: '🔢 Plus anciennes d\'abord', short: '🔢 Anciennes' },
  { value: 'variants-desc', label: '✨ Max Variantes HD', short: '✨ Variantes' },
  { value: 'power-desc', label: '💥 Puissance max', short: '💥 Puissance' },
  { value: 'cost-asc', label: '⚡ Coût croissant', short: '⚡ Coût (0-10)' },
  { value: 'cost-desc', label: '⚡ Coût décroissant', short: '⚡ Coût (10-0)' },
  { value: 'rarity-desc', label: '👑 Rareté max', short: '👑 Rareté' },
];

const LANGUAGE_DROPDOWN_OPTIONS = [
  { value: 'FR', label: '🇫🇷 Français (FR)', short: '🇫🇷 Français' },
  { value: 'EN', label: '🇬🇧 Anglais (EN)', short: '🇬🇧 Anglais' },
  { value: 'JP', label: '🇯🇵 Japonais (JP)', short: '🇯🇵 Japonais' },
];

const VARIANT_DROPDOWN_OPTIONS = [
  { value: 'ALL', label: '★ Toutes les versions', short: '★ Toutes versions' },
  { value: 'ALT', label: '★ Alternatifs (Alt-Arts)', short: '★ Alternatifs' },
  { value: 'BASE', label: '🎴 Cartes de base', short: 'Cartes base' },
];

const PRICE_DROPDOWN_OPTIONS = [
  { value: 'ALL', label: '💶 Tous les prix', short: '💶 Tous les prix' },
  { value: '0-1', label: 'Moins de 1 € (< 1€)', short: '< 1 €' },
  { value: '1-5', label: '1 € à 5 €', short: '1 - 5 €' },
  { value: '5-20', label: '5 € à 20 €', short: '5 - 20 €' },
  { value: '20-50', label: '20 € à 50 €', short: '20 - 50 €' },
  { value: '50-100', label: '50 € à 100 €', short: '50 - 100 €' },
  { value: '100-500', label: '100 € à 500 €', short: '100 - 500 €' },
  { value: '500+', label: 'Plus de 500 € (> 500€)', short: '> 500 €' },
];

const RARITY_DROPDOWN_OPTIONS = [
  { value: 'ALL', label: 'Toutes les raretés', short: 'Toutes les raretés' },
  { value: 'MANGA', label: 'Manga Rare', short: 'Manga Rare' },
  { value: 'SP', label: 'Special Card (SP)', short: 'Special (SP)' },
  { value: 'SEC', label: 'Secret Rare (SEC)', short: 'Secret (SEC)' },
  { value: 'L', label: 'Leader (L)', short: 'Leader (L)' },
  { value: 'SR', label: 'Super Rare (SR)', short: 'Super Rare (SR)' },
  { value: 'R', label: 'Rare (R)', short: 'Rare (R)' },
  { value: 'UC', label: 'Uncommon (UC)', short: 'Uncommon (UC)' },
  { value: 'C', label: 'Common (C)', short: 'Common (C)' },
  { value: 'P', label: 'Promo / Winner (P)', short: 'Promo (P)' },
  { value: 'TR', label: 'Treasure Rare (TR)', short: 'Treasure (TR)' },
  { value: 'DON!!', label: 'DON!!', short: 'DON!!' },
];

const COLOR_DROPDOWN_OPTIONS = [
  { value: 'ALL', label: 'Toutes les couleurs', short: 'Toutes les couleurs' },
  { value: 'Red', label: '🔴 Rouge', short: '🔴 Rouge' },
  { value: 'Green', label: '🟢 Vert', short: '🟢 Vert' },
  { value: 'Blue', label: '🔵 Bleu', short: '🔵 Bleu' },
  { value: 'Purple', label: '🟣 Violet', short: '🟣 Violet' },
  { value: 'Black', label: '⚫ Noir', short: '⚫ Noir' },
  { value: 'Yellow', label: '🟡 Jaune', short: '🟡 Jaune' },
  { value: 'BICOLOR', label: '🌈 Bicolore (2 Couleurs)', short: '🌈 Bicolore' },
];

const CATEGORY_DROPDOWN_OPTIONS = [
  { value: 'ALL', label: 'Tous les types', short: 'Tous les types' },
  { value: 'Leader', label: 'Leader', short: 'Leader' },
  { value: 'Character', label: 'Personnage', short: 'Personnage' },
  { value: 'Event', label: 'Événement', short: 'Événement' },
  { value: 'Stage', label: 'Terrain (Stage)', short: 'Terrain' },
  { value: 'DON!!', label: 'DON!!', short: 'DON!!' },
];

const ROLE_DROPDOWN_OPTIONS = [
  { value: 'ALL', label: 'Tous les rôles', short: 'Tous les rôles' },
  ...EFFECT_KEYWORDS.filter(k => k.key !== 'ALL').map(k => ({
    value: k.key,
    label: k.label,
    short: k.label.split('(')[0].trim(),
  })),
];

export const DatabaseView: React.FC<DatabaseViewProps> = ({ onSelectCard }) => {
  const { addCard, setLeader } = useDeck();
  const { addCardToCollection, removeCardFromCollection, getCardCountInCollection, getTotalCardCopies } = useCollection();
  const [searchQuery, setSearchQuery] = useState('');
  const [variantTab, setVariantTab] = useState<'ALL' | 'BASE' | 'ALT'>('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState<'FR' | 'EN' | 'JP'>('FR');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [viewMode, setViewMode] = useState<'grouped' | 'allPrints'>('allPrints');
  const [selectedSetGroup, setSelectedSetGroup] = useState<SetGroupType>('ALL');
  const [selectedSpecificSet, setSelectedSpecificSet] = useState<string>('ALL');
  const [isMobileExtensionsOpen, setIsMobileExtensionsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'collection' | 'language' | 'sort' | 'price' | 'variant' | 'rarity' | 'color' | 'category' | 'role' | null>(null);
  const [collectionFilterGroup, setCollectionFilterGroup] = useState<'ALL' | 'OP' | 'ST' | 'EB' | 'PRB' | 'P'>('ALL');
  const [collectionSearch, setCollectionSearch] = useState('');
  const filterBarRef = useRef<HTMLDivElement>(null);

  // Click outside listener for downward dropdowns
  useEffect(() => {
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
  const [selectedColor, setSelectedColor] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCost, setSelectedCost] = useState('ALL');
  const [selectedPowerRange, setSelectedPowerRange] = useState('ALL');
  const [selectedRarity, setSelectedRarity] = useState('ALL');
  const [selectedKeyword, setSelectedKeyword] = useState('ALL');
  const [selectedPriceRange, setSelectedPriceRange] = useState('ALL');
  const [selectedSort, setSelectedSort] = useState<SortOption>('price-desc');
  const [possessionFilter, setPossessionFilter] = useState<'ALL' | 'OWNED' | 'MISSING'>('ALL');
  const [isMobileFilterDrawerOpen, setIsMobileFilterDrawerOpen] = useState(false);
  const [isMangaOnly, setIsMangaOnly] = useState(false);
  const [isCrewMangaOnly, setIsCrewMangaOnly] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [selectedIllustrator, setSelectedIllustrator] = useState('ALL');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 48;

  // Change Set Group handler
  const handleSelectSetGroup = (group: SetGroupType) => {
    setSelectedSetGroup(group);
    setSelectedSpecificSet('ALL');
    setPage(1);
  };

  // Filter cards with 0ms real-time latency
  const filteredCards = useMemo(() => {
    const hasSearch = Boolean(searchQuery.trim());
    // When a search query is typed or in allPrints mode, always use all individual prints
    let list = (viewMode === 'allPrints' || hasSearch) ? allPrintsAsCards : allCards;

    // Search query (0ms latency with multi-field search)
    if (hasSearch) {
      list = list.filter(card => matchesCardSearch(card, searchQuery));
    }

    // Language filter (FR, EN, JP)
    {
      const targetLang = selectedLanguage.toLowerCase();
      list = list.filter(card => {
        if (viewMode === 'allPrints' || hasSearch) {
          const l = (card.language || (card.id.startsWith('fr-') ? 'fr' : (card.id.startsWith('jp-') ? 'jp' : 'en'))).toLowerCase();
          return l === targetLang;
        } else {
          if (targetLang === 'fr') return Boolean(card.image_fr || card.name_fr || card.language === 'fr');
          if (targetLang === 'en') return Boolean(card.image_en || card.language === 'en');
          if (targetLang === 'jp') return Boolean(card.image_jp || card.jp_name || card.is_japanese || card.language === 'jp');
          return true;
        }
      });
    }

    // Variant dissociation filter (Proposer les 3 vs Base vs Alt-Arts)
    if (variantTab === 'BASE') {
      list = list.filter(card => !isAltArtworkCard(card));
    } else if (variantTab === 'ALT') {
      list = list.filter(card => isAltArtworkCard(card));
    }

    // Set Group Filter (OP, ST, EB, PRB, P, JP) - only apply when not doing a global text search
    if (!hasSearch) {
      if (selectedSetGroup !== 'ALL') {
        if (selectedSpecificSet !== 'ALL') {
          const target = selectedSpecificSet.toUpperCase().trim();
          const targetClean = target.replace(/[^A-Z0-9]/g, '');
          list = list.filter(card => {
            const sc = (card.set_code || '').toUpperCase().trim();
            const scClean = sc.replace(/[^A-Z0-9]/g, '');
            const cc = (card.card_code || '').toUpperCase().trim();
            const ccClean = cc.replace(/[^A-Z0-9]/g, '');
            return sc === target || 
                   scClean === targetClean || 
                   cc.startsWith(`${target}-`) || 
                   cc.startsWith(`${target}_`) ||
                   ccClean.startsWith(targetClean);
          });
        } else {
          if (selectedSetGroup === 'OP') {
            list = list.filter(card => {
              const sc = (card.set_code || '').toUpperCase();
              const cc = (card.card_code || '').toUpperCase();
              return sc.startsWith('OP') || cc.startsWith('OP');
            });
          } else if (selectedSetGroup === 'ST') {
            list = list.filter(card => {
              const sc = (card.set_code || '').toUpperCase();
              const cc = (card.card_code || '').toUpperCase();
              return sc.startsWith('ST') || cc.startsWith('ST');
            });
          } else if (selectedSetGroup === 'EB') {
            list = list.filter(card => {
              const sc = (card.set_code || '').toUpperCase();
              const cc = (card.card_code || '').toUpperCase();
              return sc.startsWith('EB') || cc.startsWith('EB');
            });
          } else if (selectedSetGroup === 'PRB') {
            list = list.filter(card => {
              const sc = (card.set_code || '').toUpperCase();
              const cc = (card.card_code || '').toUpperCase();
              return sc.startsWith('PRB') || cc.startsWith('PRB');
            });
          } else if (selectedSetGroup === 'P') {
            list = list.filter(card => {
              const sc = (card.set_code || '').toUpperCase();
              const cc = (card.card_code || '').toUpperCase();
              return sc === 'P' || sc === 'DON' || cc.startsWith('P-') || cc.startsWith('DON') || sc.startsWith('DP') || sc.startsWith('DF') || sc.startsWith('TS');
            });
          } else if (selectedSetGroup === 'JP') {
            list = list.filter(card => {
              const sc = (card.set_code || '').toUpperCase();
              const cc = (card.card_code || '').toUpperCase();
              return card.is_japanese || sc === 'OP18' || sc === 'EB05' || sc === 'PRB02' || cc.startsWith('OP18') || cc.startsWith('EB05') || (Boolean(card.jp_name) && sc.startsWith('P'));
            });
          }
        }
      } else if (selectedSpecificSet !== 'ALL') {
        const target = selectedSpecificSet.toUpperCase().trim();
        const targetClean = target.replace(/[^A-Z0-9]/g, '');
        list = list.filter(card => {
          const sc = (card.set_code || '').toUpperCase().trim();
          const scClean = sc.replace(/[^A-Z0-9]/g, '');
          const cc = (card.card_code || '').toUpperCase().trim();
          const ccClean = cc.replace(/[^A-Z0-9]/g, '');
          return sc === target || 
                 scClean === targetClean || 
                 cc.startsWith(`${target}-`) || 
                 cc.startsWith(`${target}_`) ||
                 ccClean.startsWith(targetClean);
        });
      }
    }

    // Color filter (with BICOLOR support)
    if (selectedColor === 'BICOLOR') {
      list = list.filter(card => (card.color || []).length >= 2);
    } else if (selectedColor !== 'ALL') {
      list = list.filter(card =>
        (card.color || []).some(c => c.toLowerCase() === selectedColor.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      list = list.filter(card => card.category === selectedCategory);
    }

    // Cost filter
    if (selectedCost !== 'ALL') {
      const cost = parseInt(selectedCost, 10);
      list = list.filter(card => card.cost === cost);
    }

    // Power Range filter
    if (selectedPowerRange !== 'ALL') {
      list = list.filter(card => {
        if (card.power === null || card.power === undefined) return false;
        if (selectedPowerRange === '0-2000') return card.power <= 2000;
        if (selectedPowerRange === '3000-4000') return card.power >= 3000 && card.power <= 4000;
        if (selectedPowerRange === '5000-6000') return card.power >= 5000 && card.power <= 6000;
        if (selectedPowerRange === '7000-8000') return card.power >= 7000 && card.power <= 8000;
        if (selectedPowerRange === '9000-10000') return card.power >= 9000 && card.power <= 10000;
        if (selectedPowerRange === '11000+') return card.power >= 11000;
        return true;
      });
    }

    // Rarity filter
    if (selectedRarity !== 'ALL') {
      if (selectedRarity === 'MANGA') {
        list = list.filter(card => 
          (card.rarity || '').toUpperCase() === 'MANGA' || 
          card.variant_type === 'MANGA' ||
          (card.variant_label || '').toLowerCase().includes('manga') ||
          (card.card_code || '').toLowerCase().includes('manga') ||
          (card.id || '').toLowerCase().includes('manga') ||
          (card._imagePaths || []).some(p => p.toLowerCase().includes('manga'))
        );
      } else if (selectedRarity === 'SP') {
        list = list.filter(card => 
          (card.rarity || '').toUpperCase().includes('SP') || 
          card.variant_type === 'SP' ||
          (card.variant_label || '').toLowerCase().includes('(sp)') ||
          (card.variant_label || '').toLowerCase().includes('wanted') ||
          (card.card_code || '').toLowerCase().includes('sp') ||
          (card.id || '').toLowerCase().includes('_sp') ||
          (card._imagePaths || []).some(p => p.toLowerCase().includes('_sp'))
        );
      } else if (selectedRarity === 'P') {
        list = list.filter(card => 
          (card.rarity || '').toUpperCase() === 'P' || 
          (card.set_code || '').toUpperCase() === 'P' ||
          card.variant_type === 'WINNER'
        );
      } else {
        list = list.filter(card => (card.rarity || '').toUpperCase() === selectedRarity.toUpperCase());
      }
    }

    // Effect Keywords filter
    if (selectedKeyword !== 'ALL') {
      const kwLow = selectedKeyword.toLowerCase();
      list = list.filter(card => {
        const eff = (card.effect || '').toLowerCase();
        const effFr = (card.effect_fr || '').toLowerCase();
        const trg = (card.trigger || '').toLowerCase();
        return eff.includes(kwLow) || effFr.includes(kwLow) || trg.includes(kwLow);
      });
    }

    // Price range filter
    if (selectedPriceRange !== 'ALL') {
      list = list.filter(card => {
        const p = card.price_min_eur || card.price_eur || 0;
        if (selectedPriceRange === '0-1') return p > 0 && p < 1;
        if (selectedPriceRange === '1-5') return p >= 1 && p <= 5;
        if (selectedPriceRange === '5-20') return p >= 5 && p <= 20;
        if (selectedPriceRange === '20-50') return p >= 20 && p <= 50;
        if (selectedPriceRange === '50-100') return p >= 50 && p <= 100;
        if (selectedPriceRange === '100-500') return p >= 100 && p <= 500;
        if (selectedPriceRange === '500+') return p >= 500;
        return true;
      });
    }

    // Manga only filter
    if (isMangaOnly) {
      list = list.filter(card => 
        (card.rarity || '').toUpperCase() === 'MANGA' || 
        card.variant_type === 'MANGA' ||
        (card.card_code || '').toLowerCase().includes('manga') ||
        (card.id || '').toLowerCase().includes('manga') ||
        (card._imagePaths || []).some(p => p.toLowerCase().includes('manga'))
      );
    }

    // Crew manga only filter
    if (isCrewMangaOnly) {
      list = list.filter(card => 
        card.id.toLowerCase().includes('crew') || 
        (card.name && card.name.toLowerCase().includes('crew')) ||
        (card.card_code || '').toLowerCase().includes('crew')
      );
    }

    // Min price slider filter
    if (minPrice > 0) {
      list = list.filter(card => {
        const p = card.price_min_eur || card.price_eur || 0;
        return p >= minPrice;
      });
    }

    // Illustrator filter
    if (selectedIllustrator !== 'ALL') {
      list = list.filter(card => 
        (card as any).illustrator === selectedIllustrator || 
        (card as any).artist === selectedIllustrator
      );
    }

    // Possession filter (Toutes / Possédées / Manquantes)
    if (possessionFilter === 'OWNED') {
      list = list.filter(card => {
        const isAltCard = isAltArtworkCard(card);
        const cardArtKey = isAltCard ? (card._defaultImagePath || card.id) : undefined;
        const specificCopies = getCardCountInCollection(card.card_code, cardArtKey);
        const totalCopies = getTotalCardCopies(card.card_code);
        return isAltCard ? (specificCopies > 0) : (totalCopies > 0 || specificCopies > 0);
      });
    } else if (possessionFilter === 'MISSING') {
      list = list.filter(card => {
        const isAltCard = isAltArtworkCard(card);
        const cardArtKey = isAltCard ? (card._defaultImagePath || card.id) : undefined;
        const specificCopies = getCardCountInCollection(card.card_code, cardArtKey);
        const totalCopies = getTotalCardCopies(card.card_code);
        return isAltCard ? (specificCopies === 0) : (totalCopies === 0 && specificCopies === 0);
      });
    }

    // Sort list
    const rarityRank: Record<string, number> = {
      'MANGA': 10, 'SP': 9, 'SP CARD': 9, 'L': 8, 'SEC': 7, 'SR': 6, 'R': 5, 'UC': 4, 'C': 3, 'P': 2, 'TR': 2, 'DON!!': 1
    };

    return [...list].sort((a, b) => {
      switch (selectedSort) {
        case 'price-desc': {
          const pA = a.price_min_eur || a.price_eur || 0;
          const pB = b.price_min_eur || b.price_eur || 0;
          if (pB !== pA) return pB - pA;
          return a.card_code !== b.card_code ? (b.card_code > a.card_code ? 1 : -1) : 0;
        }
        case 'price-asc': {
          const pA = a.price_min_eur || a.price_eur || 0;
          const pB = b.price_min_eur || b.price_eur || 0;
          const effA = pA > 0 ? pA : 999999;
          const effB = pB > 0 ? pB : 999999;
          if (effA !== effB) return effA - effB;
          return a.card_code !== b.card_code ? (a.card_code > b.card_code ? 1 : -1) : 0;
        }
        case 'alpha-asc': {
          const nameA = a.name_fr || a.name || '';
          const nameB = b.name_fr || b.name || '';
          return nameA > nameB ? 1 : (nameA < nameB ? -1 : 0);
        }
        case 'alpha-desc': {
          const nameA = a.name_fr || a.name || '';
          const nameB = b.name_fr || b.name || '';
          return nameB > nameA ? 1 : (nameB < nameA ? -1 : 0);
        }
        case 'code-asc': {
          if (a.card_code !== b.card_code) return a.card_code > b.card_code ? 1 : -1;
          const isBaseA = !isAltArtworkCard(a);
          const isBaseB = !isAltArtworkCard(b);
          if (isBaseA && !isBaseB) return -1;
          if (!isBaseA && isBaseB) return 1;
          return a.id > b.id ? 1 : (a.id < b.id ? -1 : 0);
        }
        case 'code-desc': {
          if (a.card_code !== b.card_code) return b.card_code > a.card_code ? 1 : -1;
          const isBaseA = !isAltArtworkCard(a);
          const isBaseB = !isAltArtworkCard(b);
          if (isBaseA && !isBaseB) return -1;
          if (!isBaseA && isBaseB) return 1;
          return a.id > b.id ? 1 : (a.id < b.id ? -1 : 0);
        }
        case 'lang-jp-en-fr': {
          const getLangRank = (c: Card) => {
            const l = (c.language || (c.id?.startsWith('fr-') ? 'fr' : (c.id?.startsWith('jp-') ? 'jp' : (c.is_japanese || c.set_code === 'OP18' || c.set_code === 'EB05' || c.set_code === 'PRB02' ? 'jp' : 'en')))).toLowerCase();
            if (l === 'jp') return 1;
            if (l === 'en') return 2;
            return 3;
          };
          const rA = getLangRank(a);
          const rB = getLangRank(b);
          if (rA !== rB) return rA - rB;
          const cComp = b.card_code.localeCompare(a.card_code, undefined, { numeric: true });
          if (cComp !== 0) return cComp;
          return a.id.localeCompare(b.id, undefined, { numeric: true });
        }
        case 'lang-en-fr-jp': {
          const getLangRank = (c: Card) => {
            const l = (c.language || (c.id?.startsWith('fr-') ? 'fr' : (c.id?.startsWith('jp-') ? 'jp' : (c.is_japanese || c.set_code === 'OP18' || c.set_code === 'EB05' || c.set_code === 'PRB02' ? 'jp' : 'en')))).toLowerCase();
            if (l === 'en') return 1;
            if (l === 'fr') return 2;
            return 3;
          };
          const rA = getLangRank(a);
          const rB = getLangRank(b);
          if (rA !== rB) return rA - rB;
          const cComp = b.card_code.localeCompare(a.card_code, undefined, { numeric: true });
          if (cComp !== 0) return cComp;
          return a.id.localeCompare(b.id, undefined, { numeric: true });
        }
        case 'lang-fr-en-jp': {
          const getLangRank = (c: Card) => {
            const l = (c.language || (c.id?.startsWith('fr-') ? 'fr' : (c.id?.startsWith('jp-') ? 'jp' : (c.is_japanese || c.set_code === 'OP18' || c.set_code === 'EB05' || c.set_code === 'PRB02' ? 'jp' : 'en')))).toLowerCase();
            if (l === 'fr') return 1;
            if (l === 'en') return 2;
            return 3;
          };
          const rA = getLangRank(a);
          const rB = getLangRank(b);
          if (rA !== rB) return rA - rB;
          const cComp = b.card_code.localeCompare(a.card_code, undefined, { numeric: true });
          if (cComp !== 0) return cComp;
          return a.id.localeCompare(b.id, undefined, { numeric: true });
        }
        case 'variants-desc': {
          const varA = a._imagePaths ? a._imagePaths.length : 1;
          const varB = b._imagePaths ? b._imagePaths.length : 1;
          return varB - varA;
        }
        case 'cost-asc':
          return (a.cost ?? 99) - (b.cost ?? 99);
        case 'cost-desc':
          return (b.cost ?? -1) - (a.cost ?? -1);
        case 'power-desc':
          return (b.power ?? -1) - (a.power ?? -1);
        case 'rarity-desc':
          return (rarityRank[b.rarity] || 0) - (rarityRank[a.rarity] || 0);
        default:
          return 0;
      }
    });
  }, [allCards, allPrintsAsCards, viewMode, searchQuery, selectedLanguage, variantTab, selectedSetGroup, selectedSpecificSet, selectedColor, selectedCategory, selectedCost, selectedPowerRange, selectedRarity, selectedKeyword, selectedPriceRange, selectedSort, isMangaOnly, isCrewMangaOnly, minPrice, selectedIllustrator, possessionFilter, getCardCountInCollection, getTotalCardCopies]);

  // Single-pass counts computation for instant performance
  const { allSearchMatching, totalBaseCount, totalAltCount, langCounts } = useMemo(() => {
    const q = searchQuery.trim();
    const list = q ? allPrintsAsCards.filter(card => matchesCardSearch(card, q)) : allPrintsAsCards;

    let base = 0;
    let alt = 0;
    let jp = 0;
    let en = 0;
    let fr = 0;

    for (let i = 0; i < list.length; i++) {
      const c = list[i];
      if (isAltArtworkCard(c)) alt++;
      else base++;

      const l = (c.language || (c.id?.startsWith('fr-') ? 'fr' : (c.id?.startsWith('jp-') ? 'jp' : (c.is_japanese || c.set_code === 'OP18' || c.set_code === 'EB05' || c.set_code === 'PRB02' ? 'jp' : 'en')))).toLowerCase();
      if (l === 'jp') jp++;
      else if (l === 'fr') fr++;
      else en++;
    }

    return {
      allSearchMatching: list,
      totalBaseCount: base,
      totalAltCount: alt,
      langCounts: { jp, en, fr, total: list.length }
    };
  }, [searchQuery, allPrintsAsCards]);

  // Live suggestions for the autocomplete popover
  const searchSuggestions = useMemo(() => {
    const q = searchQuery.trim();
    if (q.length < 2) return [];
    return allPrintsAsCards.filter(c => matchesCardSearch(c, q)).slice(0, 8);
  }, [searchQuery, allPrintsAsCards]);

  // Paginated cards
  const displayedCards = useMemo(() => {
    return filteredCards.slice(0, page * PAGE_SIZE);
  }, [filteredCards, page]);

  // Split displayed cards into Base and Alt sections when in ALL mode with active search
  const displayedBaseCards = useMemo(() => {
    return displayedCards.filter(c => !isAltArtworkCard(c));
  }, [displayedCards]);

  const displayedAltCards = useMemo(() => {
    return displayedCards.filter(c => isAltArtworkCard(c));
  }, [displayedCards]);

  // Card counts per collection
  const setCardCounts = useMemo(() => {
    const rawCounts: Record<string, number> = {};
    for (const card of (viewMode === 'allPrints' ? allPrintsAsCards : allCards)) {
      const sc = (card.set_code || '').toUpperCase().trim();
      const scClean = sc.replace(/[^A-Z0-9]/g, '');
      const cc = (card.card_code || '').split('-')[0].toUpperCase().trim();
      const ccClean = cc.replace(/[^A-Z0-9]/g, '');
      const key = scClean || ccClean;
      if (key) {
        rawCounts[key] = (rawCounts[key] || 0) + 1;
      }
    }
    const counts: Record<string, number> = { ...rawCounts };
    for (const col of ALL_COLLECTIONS) {
      const clean = col.code.replace(/[^A-Z0-9]/g, '');
      if (rawCounts[clean]) {
        counts[col.code] = rawCounts[clean];
      }
    }
    return counts;
  }, [allCards, allPrintsAsCards, viewMode]);

  // Filtered collections inside dropdown
  const filteredCollections = useMemo(() => {
    let list = ALL_COLLECTIONS;
    if (collectionFilterGroup !== 'ALL') {
      list = list.filter(c => c.group === collectionFilterGroup);
    }
    if (collectionSearch.trim()) {
      const q = collectionSearch.toLowerCase().trim();
      list = list.filter(c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
    }
    return list;
  }, [collectionFilterGroup, collectionSearch]);

  // Active selected collection meta
  const selectedCollectionMeta: SetCollectionMeta = useMemo(() => {
    if (selectedSpecificSet !== 'ALL') {
      const found = ALL_COLLECTIONS.find(c => c.code.toUpperCase() === selectedSpecificSet.toUpperCase());
      if (found) return found;
      return {
        code: selectedSpecificSet,
        name: `Extension ${selectedSpecificSet}`,
        nameFr: `Extension ${selectedSpecificSet}`,
        releaseDate: '2024-2026',
        group: 'OP' as const,
        cover: '/images/sealed/op-01-display.jpg'
      };
    }
    if (selectedSetGroup !== 'ALL') {
      const groupMap: Record<string, { name: string; nameFr: string; cover: string }> = {
        'OP': { name: 'Tous les Boosters (OP01-18)', nameFr: 'Tous les Boosters (OP01-18)', cover: '/images/sealed/op-09-display.jpg' },
        'ST': { name: 'Tous les Starters (ST01-36)', nameFr: 'Tous les Starters (ST01-36)', cover: '/images/sealed/st-36.png' },
        'EB': { name: 'Tous les Extra Boosters (EB01-05)', nameFr: 'Tous les Extra Boosters (EB01-05)', cover: '/images/sealed/eb-03-display.jpg' },
        'PRB': { name: 'Tous les Premium Boosters (PRB01-02)', nameFr: 'Tous les Premium Boosters (PRB01-02)', cover: '/images/sealed/prb-02-display.jpg' },
        'P': { name: 'Toutes les Promos & Winner', nameFr: 'Toutes les Promos & Winner', cover: '/images/sealed/pcc-25th.jpg' },
        'JP': { name: 'Catalogue Exclusif Japon (JP)', nameFr: 'Catalogue Exclusif Japon (JP)', cover: '/images/sealed/op-17-display.png' },
      };
      const info = groupMap[selectedSetGroup] || { name: `Toutes les ${selectedSetGroup}`, nameFr: `Toutes les ${selectedSetGroup}`, cover: '/images/sealed/op-01-display.jpg' };
      return {
        code: selectedSetGroup,
        name: info.name,
        nameFr: info.nameFr,
        releaseDate: '2022-2026',
        group: selectedSetGroup as any,
        cover: info.cover
      };
    }
    return {
      code: 'ALL',
      name: 'Toutes les Collections (Catalogue complet)',
      nameFr: 'Toutes les Collections (Catalogue complet)',
      releaseDate: 'Catalogue Complet 2022-2026',
      group: 'OP' as const,
      cover: '/images/sealed/op-09-display.jpg'
    };
  }, [selectedSpecificSet, selectedSetGroup]);

  // Specific sets available in current group
  const currentSubSets = useMemo(() => {
    switch (selectedSetGroup) {
      case 'OP': return OP_SETS;
      case 'ST': return ST_SETS;
      case 'EB': return EB_SETS;
      case 'PRB': return PRB_SETS;
      case 'P': return P_SETS;
      case 'JP': return JP_SETS;
      default: return [];
    }
  }, [selectedSetGroup]);

  // Set possession stats (Total, Owned, Missing) for active collection
  const { setTotalCount, setOwnedCount, setMissingCount } = useMemo(() => {
    let baseList = (viewMode === 'allPrints' ? allPrintsAsCards : allCards);
    if (selectedSpecificSet !== 'ALL') {
      const target = selectedSpecificSet.toUpperCase().trim();
      const targetClean = target.replace(/[^A-Z0-9]/g, '');
      baseList = baseList.filter(card => {
        const sc = (card.set_code || '').toUpperCase().trim();
        const scClean = sc.replace(/[^A-Z0-9]/g, '');
        const cc = (card.card_code || '').toUpperCase().trim();
        const ccClean = cc.replace(/[^A-Z0-9]/g, '');
        return sc === target || scClean === targetClean || cc.startsWith(`${target}-`) || cc.startsWith(`${target}_`) || ccClean.startsWith(targetClean);
      });
    } else if (selectedSetGroup !== 'ALL') {
      if (selectedSetGroup === 'OP') baseList = baseList.filter(c => OP_SETS.some(s => (c.set_code || '').toUpperCase().includes(s)));
      else if (selectedSetGroup === 'ST') baseList = baseList.filter(c => ST_SETS.some(s => (c.set_code || '').toUpperCase().includes(s)));
      else if (selectedSetGroup === 'EB') baseList = baseList.filter(c => EB_SETS.some(s => (c.set_code || '').toUpperCase().includes(s)));
      else if (selectedSetGroup === 'PRB') baseList = baseList.filter(c => PRB_SETS.some(s => (c.set_code || '').toUpperCase().includes(s)));
      else if (selectedSetGroup === 'P') baseList = baseList.filter(c => (c.set_code || '').toUpperCase() === 'P');
      else if (selectedSetGroup === 'JP') baseList = baseList.filter(c => JP_SETS.some(s => (c.set_code || '').toUpperCase().includes(s)));
    }

    let owned = 0;
    for (let i = 0; i < baseList.length; i++) {
      const c = baseList[i];
      const isAlt = isAltArtworkCard(c);
      const cardArtKey = isAlt ? (c._defaultImagePath || c.id) : undefined;
      const spec = getCardCountInCollection(c.card_code, cardArtKey);
      const tot = getTotalCardCopies(c.card_code);
      if (isAlt ? spec > 0 : (tot > 0 || spec > 0)) {
        owned++;
      }
    }

    return {
      setTotalCount: baseList.length,
      setOwnedCount: owned,
      setMissingCount: Math.max(0, baseList.length - owned)
    };
  }, [viewMode, selectedSpecificSet, selectedSetGroup, allPrintsAsCards, allCards, getCardCountInCollection, getTotalCardCopies]);

  // Price histogram & max limit
  const { priceHistogram, maxPriceLimit } = useMemo(() => {
    const bucketsCount = 24;
    let maxP = 100;
    const prices: number[] = [];

    for (let i = 0; i < filteredCards.length; i++) {
      const p = filteredCards[i].price_min_eur || filteredCards[i].price_eur || 0;
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

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedLanguage !== 'FR') count++;
    if (selectedSort !== 'price-desc' && selectedSort !== 'code-asc') count++;
    if (selectedRarity !== 'ALL') count++;
    if (isMangaOnly) count++;
    if (isCrewMangaOnly) count++;
    if (variantTab === 'ALT') count++;
    if (minPrice > 0) count++;
    if (selectedColor !== 'ALL') count++;
    if (selectedCategory !== 'ALL') count++;
    if (selectedIllustrator !== 'ALL') count++;
    if (selectedPriceRange !== 'ALL') count++;
    return count;
  }, [selectedLanguage, selectedSort, selectedRarity, isMangaOnly, isCrewMangaOnly, variantTab, minPrice, selectedColor, selectedCategory, selectedIllustrator, selectedPriceRange]);

  const handleResetAllFilters = () => {
    setSelectedLanguage('FR');
    setSelectedSort('code-asc');
    setSelectedRarity('ALL');
    setIsMangaOnly(false);
    setIsCrewMangaOnly(false);
    setVariantTab('ALL');
    setMinPrice(0);
    setSelectedColor('ALL');
    setSelectedCategory('ALL');
    setSelectedIllustrator('ALL');
    setSelectedPriceRange('ALL');
    setSelectedCost('ALL');
    setSelectedPowerRange('ALL');
    setSelectedKeyword('ALL');
    setPossessionFilter('ALL');
    setSearchQuery('');
    setPage(1);
  };

  // Helper to render sleek, unified downward dropdowns
  const renderDownwardDropdown = (
    id: 'sort' | 'price' | 'variant' | 'rarity' | 'color' | 'category' | 'role' | 'language',
    currentValue: string,
    options: { value: string; label: string; short: string }[],
    onSelect: (val: any) => void
  ) => {
    const isOpen = activeDropdown === id;
    const isFiltered = id === 'sort' 
      ? (currentValue.startsWith('price') || currentValue.startsWith('alpha') || currentValue.startsWith('lang'))
      : (id === 'language' ? currentValue !== 'FR' : currentValue !== 'ALL');
    const currentOption = options.find(o => o.value === currentValue);
    const displayLabel = currentOption ? currentOption.short : options[0]?.short;

    return (
      <div key={id} className={`relative flex-shrink-0 ${isOpen ? 'z-50' : 'z-20'}`}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveDropdown(isOpen ? null : id);
          }}
          className={`h-8 sm:h-8.5 px-2.5 rounded-xl bg-[#141824] border text-xs font-semibold flex items-center justify-between gap-1.5 cursor-pointer shadow-sm select-none transition-colors ${
            isOpen || isFiltered
              ? 'border-amber-400/80 text-amber-300'
              : 'border-slate-700/80 text-slate-200 hover:border-slate-500 hover:text-white'
          }`}
        >
          <span className="truncate max-w-[120px] sm:max-w-[145px]">{displayLabel}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 flex-shrink-0 ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
        </button>

        {isOpen && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`absolute top-full mt-1.5 min-w-[180px] max-h-64 overflow-y-auto bg-[#0E131F] border border-slate-700 rounded-xl shadow-2xl p-1 z-50 space-y-0.5 no-scrollbar animate-in fade-in slide-in-from-top-1 duration-150 ${
              id === 'role' || id === 'category' ? 'right-0' : 'left-0'
            }`}
          >
            {options.map((opt) => {
              const isSelected = opt.value === currentValue;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(opt.value);
                    setActiveDropdown(null);
                    setPage(1);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Scalpeurs-style card item renderer matching user design (100% card aspect ratio with overlaid badge, button and prices)
  const renderCardItem = (card: Card, keyPrefix: string, idx: number) => {
    const cardImg = getCardImageUrl(card, card._defaultImagePath, selectedLanguage);
    const priceInfo = getCardPriceForArtwork(card, card._defaultImagePath || card.id);
    const cLang = (card.language || (card.id?.startsWith('fr-') ? 'fr' : (card.id?.startsWith('jp-') ? 'jp' : (card.is_japanese || card.set_code === 'OP18' || card.set_code === 'EB05' || card.set_code === 'PRB02' ? 'jp' : 'en')))).toLowerCase();
    const localizedCardName = selectedLanguage === 'FR' && card.name_fr 
      ? card.name_fr 
      : (selectedLanguage === 'JP' && card.jp_name ? card.jp_name : card.name);

    // Possession state (owned in user's collection)
    const isAltCard = isAltArtworkCard(card);
    const cardArtKey = isAltCard ? (card._defaultImagePath || card.id) : undefined;
    const specificCopies = getCardCountInCollection(card.card_code, cardArtKey);
    const totalCopies = getTotalCardCopies(card.card_code);
    const isOwned = isAltCard ? (specificCopies > 0) : (totalCopies > 0 || specificCopies > 0);

    const handleTogglePossession = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isOwned) {
        removeCardFromCollection(card.card_code, 1, cardArtKey);
      } else {
        addCardToCollection(card.card_code, 1, cardArtKey);
      }
    };

    // Scalpeurs Top-Left Variant Badge (★ v3, ★ v2, etc. - caché pour les cartes de base v1)
    const getBadgeInfo = () => {
      const id = (card.id || '').toLowerCase();
      const artKey = (card._defaultImagePath || '').toLowerCase();
      const vLabel = (priceInfo.variantLabel || '').toLowerCase();

      if (card.rarity === 'MANGA' || card.variant_type === 'MANGA' || vLabel.includes('manga') || id.includes('manga')) {
        return { label: 'vManga', color: 'text-amber-300 border-amber-400/60 bg-black/85' };
      }
      if (card.rarity === 'SP' || card.variant_type === 'SP' || vLabel.includes('sp') || id.includes('_sp')) {
        return { label: 'vSP', color: 'text-pink-300 border-pink-400/60 bg-black/85' };
      }
      if (card.rarity === 'WINNER' || card.variant_type === 'WINNER' || vLabel.includes('winner')) {
        return { label: 'vWin', color: 'text-amber-300 border-amber-400/60 bg-black/85' };
      }

      const cardAny = card as any;
      if (cardAny.variant && cardAny.variant > 1) {
        return { label: `v${cardAny.variant}`, color: 'text-white border-white/20 bg-black/80' };
      }
      const matchP = id.match(/_p0?(\d+)/) || artKey.match(/_p0?(\d+)/);
      if (matchP) {
        const num = parseInt(matchP[1], 10);
        return { label: `v${num + 1}`, color: 'text-white border-white/20 bg-black/80' };
      }
      if (priceInfo.isAlt || isAltArtworkCard(card)) {
        return { label: 'v2', color: 'text-white border-white/20 bg-black/80' };
      }
      return null;
    };
    const badgeInfo = getBadgeInfo();

    // Prices calculation (100% cohérent entre la grille et la modale CardDetailModal)
    const rawCmPrice = (card as any).price_eur !== undefined && (card as any).price_eur !== null && (card as any).price_eur > 0
      ? (card as any).price_eur
      : (priceInfo.priceEur || priceInfo.priceMinEur || 0);
    const formatCardPrice = (val: number) => {
      if (!val || isNaN(val) || val <= 0) return '—';
      if (val >= 100) {
        return `${Math.round(val).toLocaleString('fr-FR')} €`;
      }
      return `${val.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
    };

    const formatTcgPrice = (usd: number | null | undefined, eurRef: number) => {
      if (usd !== undefined && usd !== null && usd > 0) {
        if (usd >= 100) {
          return `$${Math.round(usd).toLocaleString('en-US')}`;
        }
        return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      if (eurRef > 0) {
        const estUsd = eurRef * 1.08;
        if (estUsd >= 100) {
          return `$${Math.round(estUsd).toLocaleString('en-US')}`;
        }
        return `$${estUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      return '—';
    };

    const cmPriceText = formatCardPrice(rawCmPrice);
    const rawCtPrice = priceInfo.cardtraderPriceEur || 0;
    const rawTcgUsd = (card as any).price_usd;
    const rightPriceText = rawCtPrice > 0 
      ? formatCardPrice(rawCtPrice) 
      : formatTcgPrice(rawTcgUsd, rawCmPrice);

    // Trend % calculation
    let trendPercent: number | null = null;
    if (priceInfo.priceAvg7Eur && rawCmPrice > 0 && priceInfo.priceAvg7Eur > 0) {
      const diff = ((rawCmPrice - priceInfo.priceAvg7Eur) / priceInfo.priceAvg7Eur) * 100;
      trendPercent = Math.round(diff * 10) / 10;
    }

    const rawCmUrl = (cLang === 'jp' && (card.cardmarket_url_jp || (card.cardmarket_url && (card.cardmarket_url.includes('-Japanese') || card.cardmarket_url.includes('Non-English')))))
      ? (card.cardmarket_url_jp || card.cardmarket_url)
      : (card.cardmarket_url || priceInfo.cardmarketUrl || getCardmarketUrl(card.card_code, card._defaultImagePath || card.id, card));

    const cmUrl = resolveCardmarketUrlForLanguage(rawCmUrl, cLang === 'jp' ? 'JP' : (cLang === 'fr' ? 'FR' : 'EN'));

    const tcgUrl = cLang === 'jp'
      ? `https://jp.mercari.com/search?keyword=one%20piece%20${encodeURIComponent(card.card_code)}`
      : ((card as any).tcgplayer_url || priceInfo.tcgplayerUrl || getTcgplayerUrl(card.card_code, card._defaultImagePath || card.id, card));

    const rightUrl = rawCtPrice > 0 ? (priceInfo.cardtraderUrl || tcgUrl) : tcgUrl;

    return (
      <div
        key={`${keyPrefix}-${card.id || card.card_code}-${idx}`}
        onClick={() => onSelectCard(card)}
        className={`group relative isolate overflow-hidden rounded-xl sm:rounded-2xl border bg-[#0A0E17] transition-all duration-200 select-none cursor-pointer hover:scale-[1.03] hover:z-20 hover:shadow-2xl hover:shadow-black/90 ${
          isOwned
            ? 'border-2 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
            : 'border-slate-800/80 hover:border-amber-400/80'
        }`}
      >
        <div className="relative aspect-[5/7] w-full">
          {/* Top-Left: Scalpeurs-style Variant Badge + Language Flag */}
          <div className="pointer-events-none absolute left-1 top-1 sm:left-1.5 sm:top-1.5 z-20 flex items-center gap-1 flex-wrap">
            {badgeInfo && (
              <span className={`rounded-full px-1.5 py-0.5 text-[8.5px] sm:text-[10.5px] font-bold backdrop-blur-sm border shadow-md ${badgeInfo.color}`}>
                ★ {badgeInfo.label}
              </span>
            )}
            <span className="rounded-full px-1.5 py-0.5 text-[8px] sm:text-[9.5px] font-bold backdrop-blur-sm border border-slate-700/80 bg-black/85 text-slate-200 shadow-md">
              {cLang === 'fr' ? '🇫🇷 FR' : cLang === 'jp' ? '🇯🇵 JP' : '🇬🇧 EN'}
            </span>
          </div>

          {/* Top-Right: Scalpeurs-style Collection button (+) or checkmark (✓) */}
          <button
            type="button"
            onClick={handleTogglePossession}
            className={`absolute right-1 top-1 sm:right-1.5 sm:top-1.5 z-20 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 group-hover:scale-110 ${
              isOwned
                ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-500/40 hover:bg-emerald-300'
                : 'bg-black/60 hover:bg-black/90 text-white ring-1 ring-white/20 hover:ring-amber-400/80 backdrop-blur-md shadow-md'
            }`}
            title={
              isOwned
                ? (specificCopies > 1 || totalCopies > 1)
                  ? `Possédée (${specificCopies || totalCopies}x) - Cliquez pour retirer`
                  : 'Possédée dans votre collection (Cliquez pour retirer)'
                : 'Ajouter à ma collection (+1)'
            }
          >
            {isOwned ? (
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
            ) : (
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
            )}
          </button>

          {/* Card Artwork Image - 100% of aspect-[5/7] */}
          <img
            src={cardImg}
            alt={localizedCardName}
            width={252}
            height={352}
            referrerPolicy="no-referrer"
            onError={(e) => handleCardImageError(e, card)}
            className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Bottom Overlay with smooth black gradient */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/85 via-[60%] to-transparent px-1.5 pb-1.5 sm:px-2 sm:pb-2 pt-6 sm:pt-10 z-10 flex flex-col justify-end text-center sm:text-left">
            {/* Mobile Clean Centered Layout (100% Identique au Screenshot) */}
            <div className="sm:hidden flex flex-col items-center justify-center w-full">
              <div className="flex items-center justify-center gap-1">
                <span className="text-[10.5px] font-black text-white tracking-tight drop-shadow">
                  {cmPriceText}
                </span>
                <span className="text-[8px] font-black text-amber-400 uppercase tracking-wider">
                  {cLang.toUpperCase()}
                </span>
              </div>
              <span className="font-mono text-[8.5px] font-bold text-slate-300/90 tracking-wider mt-0.5">
                {card.card_code}
              </span>
            </div>

            {/* Desktop Dual Market Layout */}
            <div className="hidden sm:block w-full">
              <div className="flex items-center justify-between gap-1 w-full">
                {/* Left: Cardmarket Logo + Price */}
                <a
                  href={cmUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 min-w-0 hover:opacity-85 transition-opacity group/cm pointer-events-auto"
                  title={`Acheter sur Cardmarket : ${cmPriceText}`}
                >
                  <CardmarketLogo className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="text-[11px] sm:text-xs font-bold text-white tracking-tight truncate drop-shadow">
                    {cmPriceText}
                  </span>
                </a>

                {/* Right: CardTrader / TCG Logo + Price */}
                <a
                  href={rightUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 min-w-0 hover:opacity-85 transition-opacity group/ct pointer-events-auto"
                  title={`Acheter sur ${rawCtPrice > 0 ? 'CardTrader' : 'TCGplayer'} : ${rightPriceText}`}
                >
                  <span className="text-[10.5px] sm:text-xs font-bold text-slate-200 tracking-tight truncate drop-shadow">
                    {rightPriceText}
                  </span>
                  {rawCtPrice > 0 ? (
                    <CardtraderLogo className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  ) : (
                    <TCGplayerLogo className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  )}
                </a>
              </div>

              {/* Bottom Bar: Card Code (OP05-060) + Card Name */}
              <div className="flex items-center justify-between gap-1.5 w-full mt-1 pt-0.5 border-t border-white/15 text-[9.5px] sm:text-[11px] min-w-0">
                <span className="font-mono font-black text-amber-400 tracking-wider flex-shrink-0">
                  {card.card_code}
                </span>
                <span className="font-bold text-white/90 truncate text-[9.5px] sm:text-[11px] text-right drop-shadow" title={card.name_fr || card.name}>
                  {card.name_fr || card.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Scalpeurs 3D Conveyor Belt Living Hero Banner with Conveyor Belt Carousel Cards */}
      <ScalpeursHeroBanner
        title={
          selectedSpecificSet !== 'ALL'
            ? (selectedCollectionMeta.nameFr || selectedCollectionMeta.name)
            : selectedLanguage === 'FR'
            ? 'Toutes les cartes françaises'
            : selectedLanguage === 'JP'
            ? 'Toutes les cartes japonaises'
            : selectedLanguage === 'EN'
            ? 'Toutes les cartes anglaises'
            : 'Toutes les cartes françaises'
        }
        code={selectedSpecificSet !== 'ALL' ? selectedCollectionMeta.code : undefined}
        totalCards={filteredCards.length}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={(lang) => {
          setSelectedLanguage(lang === 'ALL' ? 'FR' : lang);
          setPage(1);
        }}
        breadcrumb={
          selectedLanguage === 'JP'
            ? 'Cartes One Piece › japonaises'
            : selectedLanguage === 'FR'
            ? 'Cartes One Piece › françaises'
            : selectedLanguage === 'EN'
            ? 'Cartes One Piece › anglaises'
            : 'Cartes One Piece › françaises'
        }
        viewMode={viewMode}
        onToggleViewMode={(mode) => {
          setViewMode(mode);
          setPage(1);
        }}
        filteredCount={filteredCards.length}
        totalUniqueCount={allCards.length}
        totalPrintsCount={allPrintsAsCards.length}
      >
        {/* Main Filter Arena (À cheval sur la bordure de la bannière : à moitié dedans, à moitié dehors) */}
        <div className="p-2 sm:p-3 rounded-2xl bg-[#090D15]/98 backdrop-blur-2xl border border-slate-700/80 shadow-[0_16px_50px_rgba(0,0,0,0.95)] space-y-2 relative z-50 ring-1 ring-white/10">
        
        {/* Row 1: Scalpeurs Filter Bar (Collection Capsule pleine largeur sur mobile, dropdowns sur desktop) */}
        <div 
          ref={filterBarRef}
          className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap py-0.5 relative z-30"
        >
          {/* Scalpeurs-style Collection Capsule with Golden Lightning, Yellow stats, Circular Flag & Chevron */}
          <div className={`relative w-full sm:w-auto sm:flex-1 ${activeDropdown === 'collection' || activeDropdown === 'language' ? 'z-50' : 'z-20'}`}>
            <div 
              onClick={() => setActiveDropdown(activeDropdown === 'collection' ? null : 'collection')}
              className="h-10 sm:h-9 px-3 rounded-xl bg-[#141824] border border-slate-700/80 hover:border-slate-500 transition-all flex items-center justify-between w-full cursor-pointer shadow-sm select-none"
            >
              
              {/* Collection Toggle Trigger (Icon + Name + Subtext) */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
                  {selectedSpecificSet !== 'ALL' ? (
                    <img
                      src={selectedCollectionMeta.cover}
                      alt={selectedCollectionMeta.name}
                      onError={(e) => { e.currentTarget.src = '/images/sealed/op-01-display.jpg'; }}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  )}
                  <span className="absolute -top-0.5 -right-0.5 text-amber-300 text-[8px] font-black pointer-events-none">✦</span>
                </div>

                <div className="flex flex-col leading-tight text-left min-w-0">
                  <span className="text-xs font-bold text-white truncate max-w-[170px] sm:max-w-[200px]">
                    {selectedSpecificSet !== 'ALL' ? (selectedCollectionMeta.nameFr || selectedCollectionMeta.name) : 'Changer de collection'}
                  </span>
                  <span className="text-[10px] text-amber-400 font-semibold mt-0.5 flex items-center gap-1">
                    <span>{ALL_COLLECTIONS.length} collections</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-amber-300">{allCards.length.toLocaleString('fr-FR')} cartes</span>
                  </span>
                </div>
              </div>

              {/* Language Flag & Chevron Triggers */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Circular Flag Trigger */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === 'language' ? null : 'language');
                  }}
                  className="w-6 h-6 rounded-full border border-slate-600 hover:border-amber-400 p-0 flex items-center justify-center bg-black/40 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                  title="Changer de langue (FR, EN, JP)"
                >
                  {renderCircularFlag(selectedLanguage, 'w-4 h-4')}
                </button>

                {/* Chevron for Collection */}
                <div
                  className="w-6 h-6 rounded-full border border-slate-700/80 bg-slate-800/80 flex items-center justify-center text-slate-300"
                  title="Dérouler la liste des collections"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${activeDropdown === 'collection' ? 'rotate-180 text-amber-400' : ''}`} />
                </div>
              </div>
            </div>

            {/* Language Selection Dropdown Menu - Opens downwards */}
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
                  { id: 'FR', label: 'Français (FR)', count: langCounts.fr },
                  { id: 'EN', label: 'Anglais (EN)', count: langCounts.en },
                  { id: 'JP', label: 'Japonais (JP)', count: langCounts.jp },
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
                      className={`w-full px-2 py-1.5 rounded-lg flex items-center justify-between transition-all cursor-pointer text-left ${
                        isSelected 
                          ? 'bg-amber-500/20 text-white font-bold' 
                          : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {renderCircularFlag(item.id as any, 'w-5 h-5')}
                        <div>
                          <p className="text-xs font-bold leading-tight">{item.label}</p>
                          <p className="text-[10px] text-slate-400">{item.count.toLocaleString('fr-FR')} cartes</p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 ml-1.5" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Collection Selection Dropdown Popover - Opens downwards */}
            {activeDropdown === 'collection' && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute top-full left-0 mt-1.5 z-50 w-[330px] sm:w-[500px] max-w-[95vw] bg-[#0E131F]/98 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-3 sm:p-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                {/* Header inside popover */}
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
                    setSelectedSpecificSet('ALL');
                    setActiveDropdown(null);
                    setPage(1);
                  }}
                  className={`w-full p-2 rounded-xl border flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                    selectedSetGroup === 'ALL' && selectedSpecificSet === 'ALL'
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
                      <p className="text-[10px] text-slate-400">Afficher l'intégralité du jeu ({viewMode === 'allPrints' ? allRawCards.length : allCards.length} cartes)</p>
                    </div>
                  </div>
                  {selectedSetGroup === 'ALL' && selectedSpecificSet === 'ALL' && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black">
                      <Check className="w-3 h-3" />
                      <span>Actif</span>
                    </div>
                  )}
                </button>

                {/* Grid of collections with display images */}
                <div className="max-h-72 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-1.5 no-scrollbar">
                  {filteredCollections.map((col) => {
                    const isSelected = selectedSpecificSet === col.code;
                    const count = setCardCounts[col.code] || 0;
                    return (
                      <button
                        key={col.code}
                        type="button"
                        onClick={() => {
                          setSelectedSetGroup(col.group);
                          setSelectedSpecificSet(col.code);
                          setActiveDropdown(null);
                          setPage(1);
                        }}
                        className={`p-1.5 rounded-xl border flex items-center gap-2 transition-all text-left cursor-pointer group ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/15 shadow-md ring-1 ring-amber-400'
                            : 'border-slate-800/90 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-black/60 p-0.5 border border-slate-700/80 flex items-center justify-center overflow-hidden">
                          <img
                            src={col.cover}
                            alt={col.name}
                            onError={(e) => { e.currentTarget.src = '/images/sealed/op-01-display.jpg'; }}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-[9px] font-black px-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              {col.code}
                            </span>
                            {isSelected && (
                              <Check className="w-3 h-3 text-amber-400 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] font-bold text-white truncate mt-0.5 group-hover:text-amber-300 transition-colors">
                            {col.name}
                          </p>
                          <p className="text-[9px] text-slate-400">
                            {count > 0 ? `${count} cartes` : 'Collection officielle'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Scalpeurs Dropdown Filter Pills (Row 1): Tri, Langue, Prix, Alternatifs, Couleurs, Types - Cachés sur mobile car dans Filtres */}
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* 1. Tri (💰 Les plus chères / 🇫🇷 Français en premier, etc.) */}
            {renderDownwardDropdown('sort', selectedSort, SORT_DROPDOWN_OPTIONS, setSelectedSort)}
            {/* 2. Langue (🌍 Toutes / 🇫🇷 Français / 🇬🇧 Anglais / 🇯🇵 Japonais) */}
            {renderDownwardDropdown('language', selectedLanguage, LANGUAGE_DROPDOWN_OPTIONS, setSelectedLanguage)}
            {/* 3. Prix (💶 Tous les prix) */}
            {renderDownwardDropdown('price', selectedPriceRange, PRICE_DROPDOWN_OPTIONS, setSelectedPriceRange)}
            {/* 3. Alternatifs (★ Alternatifs / Base / Manga) */}
            {renderDownwardDropdown('variant', variantTab, VARIANT_DROPDOWN_OPTIONS, (val) => setVariantTab(val))}
            {/* 4. Couleurs (Toutes les couleurs) */}
            {renderDownwardDropdown('color', selectedColor, COLOR_DROPDOWN_OPTIONS, setSelectedColor)}
            {/* 5. Catégories / Types (Leader, Personnage...) */}
            {renderDownwardDropdown('category', selectedCategory, CATEGORY_DROPDOWN_OPTIONS, setSelectedCategory)}

            {/* Réinitialiser Pill */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetAllFilters}
                className="h-9 px-2.5 rounded-xl bg-[#141824] hover:bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:border-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm flex-shrink-0"
                title="Réinitialiser tous les filtres"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Réinitialiser</span>
              </button>
            )}

            {/* Filtered Cards Count Pill */}
            <div className="h-9 px-3 rounded-xl bg-[#141824] border border-slate-700/80 text-xs font-bold text-slate-300 flex items-center gap-1.5 flex-shrink-0 select-none shadow-sm">
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-white font-extrabold">{filteredCards.length.toLocaleString('fr-FR')}</span>
              <span className="text-slate-400 text-[11px]">filtrés</span>
            </div>
          </div>
        </div>

        {/* Row 2: Search Bar + Filtres Button (Côte à côte sur mobile) */}
        <div className="flex items-center gap-2 w-full pt-0.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Code ou nom de carte..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#070A11] border border-slate-800/90 hover:border-slate-700 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold bg-slate-800 px-1.5 py-0.5 rounded-md cursor-pointer"
              >
                Effacer
              </button>
            )}

          {/* Instant Auto-complete Suggestion Dropdown proposing Base and Alt-Arts */}
          {isSearchFocused && searchSuggestions.length > 0 && searchQuery.trim().length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0B0F17]/95 backdrop-blur-md border border-amber-500/50 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800">
              <div className="p-2.5 bg-slate-900/90 flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span className="flex items-center gap-1 text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  Suggestions instantanées ({searchSuggestions.length} cartes / versions)
                </span>
                <span className="text-[10px] text-slate-500">Cliquez pour voir la carte HD</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 no-scrollbar">
                {searchSuggestions.map((card, sIdx) => {
                  const isAlt = isAltArtworkCard(card);
                  const cardImg = getCardImageUrl(card, card._defaultImagePath);
                  const priceInfo = getCardPriceForArtwork(card, card._defaultImagePath || card.id);
                  return (
                    <div
                      key={`sug-${card.id}-${sIdx}`}
                      onMouseDown={() => {
                        onSelectCard(card);
                        setIsSearchFocused(false);
                      }}
                      className="p-2.5 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <img
                          src={cardImg}
                          alt={card.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => handleCardImageError(e, card)}
                          className="w-8 h-11 object-cover rounded shadow-md flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-amber-400 text-xs">{card.id || card.card_code}</span>
                            {isAlt ? (
                              <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-[9px] font-black text-purple-300 border border-purple-500/30">
                                ✨ {priceInfo.variantLabel.replace(/[✨🌟💎⭐👑🏆]/g, '').trim() || 'Alt-Art'}
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-[9px] font-black text-blue-300 border border-blue-500/30">
                                🎴 Base
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-white truncate">{card.name_fr || card.name}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-black text-emerald-400">
                          {formatEur(priceInfo.priceMinEur || priceInfo.priceEur)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
          <span>Filtres</span>
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

    </div>
    </ScalpeursHeroBanner>

    {/* Spacer so the cards grid starts cleanly below the 50% overlapping filter bar */}
    <div className="pt-14 sm:pt-16" />

      {/* Cards Gallery Grid */}
      {displayedCards.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          <Search className="w-12 h-12 mx-auto mb-2 opacity-30 text-amber-400" />
          <p className="text-sm font-bold text-slate-300">Aucune carte ne correspond à ces critères.</p>
          <button
            onClick={() => {
              setSelectedSetGroup('ALL');
              setSelectedSpecificSet('ALL');
              setSelectedColor('ALL');
              setSelectedCategory('ALL');
              setSelectedCost('ALL');
              setSelectedPowerRange('ALL');
              setSelectedRarity('ALL');
              setSelectedKeyword('ALL');
              setSearchQuery('');
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-black"
          >
            Réinitialiser tous les filtres
          </button>
        </div>
      ) : (
        <>
          {Boolean(searchQuery.trim()) && variantTab === 'ALL' && displayedBaseCards.length > 0 && displayedAltCards.length > 0 ? (
            <div className="space-y-8">
              {/* Section 1: Base Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      <PackageOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">
                        🎴 Cartes de Base ({displayedBaseCards.length})
                      </h3>
                      <p className="text-[11px] text-slate-400">Illustration standard originale Bandai</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setVariantTab('BASE'); setPage(1); }}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Voir uniquement la base →
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-1.5 sm:gap-3.5">
                  {displayedBaseCards.map((card, idx) => renderCardItem(card, 'base', idx))}
                </div>
              </div>

              {/* Section 2: Alt-Arts */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-purple-900/50">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-purple-200 uppercase tracking-wider">
                        ✨ Variantes &amp; Alt-Arts ({displayedAltCards.length})
                      </h3>
                      <p className="text-[11px] text-slate-400">Illustrations alternatives (Parallel, SP, Manga, Winners)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setVariantTab('ALT'); setPage(1); }}
                    className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Voir uniquement les alt-arts →
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-1.5 sm:gap-3.5">
                  {displayedAltCards.map((card, idx) => renderCardItem(card, 'alt', idx))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-1.5 sm:gap-3.5">
              {displayedCards.map((card, idx) => renderCardItem(card, 'all', idx))}
            </div>
          )}

          {/* Load More Button */}
          {displayedCards.length < filteredCards.length && (
            <div className="text-center pt-8">
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
              >
                Afficher plus de cartes ({displayedCards.length} / {filteredCards.length})
              </button>
            </div>
          )}
        </>
      )}

      {/* Mobile Filter Drawer (Scalpeurs Style from Image 1) */}
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
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={(l) => { setSelectedLanguage(l === 'ALL' ? 'FR' : l); setPage(1); }}
        selectedIllustrator={selectedIllustrator}
        setSelectedIllustrator={(i) => { setSelectedIllustrator(i); setPage(1); }}
        availableIllustrators={availableIllustrators}
        matchingCount={filteredCards.length}
        activeFiltersCount={activeFiltersCount}
        onResetAll={handleResetAllFilters}
      />

    </div>
  );
};
