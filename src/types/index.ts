export type CardCategory = 'Leader' | 'Character' | 'Event' | 'Stage';

export type CardColor = 'Red' | 'Green' | 'Blue' | 'Purple' | 'Black' | 'Yellow';

export interface Card {
  id: string;
  card_code: string;
  set_code: string;
  name: string;
  name_fr?: string;
  jp_name?: string;
  language?: 'jp' | 'en' | 'fr' | string;
  category: CardCategory;
  rarity: string;
  variant?: number;
  variant_type?: string;
  variant_label?: string;
  created_at?: string;
  color: string[];
  cost: number | null;
  power: number | null;
  counter: number;
  type: string[];
  attribute: string;
  trigger: string;
  effect: string;
  effect_fr?: string;
  block?: string;
  is_japanese?: boolean;
  _imagePaths: string[];
  _defaultImagePath: string;
  price_eur?: number | null;
  price_min_eur?: number | null;
  price_avg7_eur?: number | null;
  price_avg30_eur?: number | null;
  listings_count?: number | null;
  scalpeurs_image_url?: string;
  image_fr?: string | null;
  image_en?: string | null;
  image_jp?: string | null;
  cardmarket_url?: string;
  cardmarket_url_jp?: string;
  tcgplayer_url?: string;
  detail_file?: string;
}

export interface RawCardPrint {
  id: string;
  card_code?: string;
  name: string;
  name_fr?: string;
  name_jp?: string;
  language?: string;
  rarity: string;
  type: string;
  cost: string | null;
  power: string | null;
  counter: string | null;
  color: string[];
  attribute: string | null;
  types: string[];
  effect: string;
  trigger: string | null;
  set: string;
  image_url: string;
  image_fr?: string | null;
  image_en?: string | null;
  image_jp?: string | null;
  price_eur?: number | null;
  price_min_eur?: number | null;
  price_avg7_eur?: number | null;
  price_avg30_eur?: number | null;
  listings_count?: number | null;
  cardmarket_url?: string;
  cardmarket_url_jp?: string;
  tcgplayer_url?: string;
  detail_file?: string;
}

export interface CardVariant {
  id?: string;
  card_code: string;
  variant?: number;
  variant_type?: string;
  variant_label: string;
  detail_file?: string;
  name?: string;
  name_fr?: string;
  name_jp?: string;
  language?: string;
  image_path?: string;
  image_url?: string;
  image_fr?: string | null;
  image_en?: string | null;
  image_jp?: string | null;
  scalpeurs_image_url?: string;
  product_id?: number;
  cardmarket_product_id?: number | null;
  market_price?: number | null;
  low_price?: number | null;
  avg_price?: number | null;
  trend_price?: number | null;
  cardmarket_trend?: number | null;
  cardmarket_low?: number | null;
  cardmarket_avg?: number | null;
  cardtrader_price?: number | null;
  price_eur?: number | null;
  price_min_eur?: number | null;
  price_avg7_eur?: number | null;
  price_avg30_eur?: number | null;
  listings_count?: number | null;
  price_currency?: string;
  updated_at?: string;
  tcgplayer_url?: string;
  cardmarket_url?: string;
  cardmarket_url_jp?: string;
  cardtrader_url?: string;
  cardtrader_blueprint_id?: number | null;
  tcgplayer_image?: string;
  market_price_1d?: number;
  market_price_7d?: number;
  market_price_30d?: number;
}

export interface TournamentResult {
  id?: string;
  ties?: number | null;
  wins?: number | null;
  losses?: number | null;
  deck_type: string; // Leader card code (e.g. OP01-001)
  placement: number; // 1 = 1st, 2 = 2nd, 3 = 3rd-4th, 8 = Top 8, 16 = Top 16, etc.
  social_url?: string | null;
  deck_colors?: string[];
  player_name: string;
  result_order?: number;
  deck_list_url: string[];
  deck_type_secondary?: string | null;
  country?: string;
  host?: string;
  placement_str?: string;
  score?: {
    wins: number;
    losses: number;
    matches: number;
    winRate: number;
  };
}

export interface Tournament {
  id: string;
  game_id?: string;
  tournament_name: string;
  format: string;
  set_group: string; // e.g. "OP17", "OP16", "OP09"
  start_date: string;
  source?: any;
  player_count?: number;
  country?: string;
  host?: string;
  player_name?: string;
  deck_name?: string;
  deck_type?: string;
  deck_color?: string;
  deck_colors?: string[];
  deck_composition_raw?: string;
  placement_str?: string;
  placement?: number;
  source_name?: string;
  score?: {
    wins: number;
    losses: number;
    matches: number;
    winRate: number;
  };
  rounds?: number;
  pie_chart_urls?: string[];
  video_url?: string | string[] | null;
  video_label?: string | null;
  leader_breakdown?: Record<string, number>;
  top_cut_breakdown?: Record<string, number>;
  event_type?: string;
  created_at?: string;
  tournament_results: TournamentResult[];
}

export interface DeckItem {
  card: Card;
  count: number;
  selectedArtwork?: string;
}

export interface Deck {
  id: string;
  name: string;
  leader: Card | null;
  cards: DeckItem[];
  createdAt: string;
  updatedAt: string;
  format?: string;
  description?: string;
}

export interface ParsedDecklist {
  leaderCode: string | null;
  items: { cardCode: string; count: number }[];
}

export type MetaTier = 'Tier 0' | 'Tier 1' | 'Tier 1.5' | 'Tier 2' | 'Tier 3' | 'Rogue';

export interface MetaLeaderSummary {
  leaderCard: Card;
  tier: MetaTier;
  metaShare: number; // percentage, e.g. 18.5
  topCutConversion: number; // percentage
  tournamentWins: number;
  totalTops: number;
  totalCombats?: number;
  winRate?: number;
  countries?: string[];
  hosts?: string[];
  sampleDecklists: {
    tournamentName: string;
    playerName: string;
    placement: number;
    decklistUrl: string;
    parsedDeck: ParsedDecklist;
    score?: {
      wins: number;
      losses: number;
      matches: number;
      winRate: number;
    };
  }[];
  keyCards: {
    card: Card;
    inclusionRate: number; // percentage, e.g. 95%
    avgCopies: number; // e.g. 3.8
  }[];
}

export interface MarketTrendItem {
  card_code: string;
  name: string;
  rarity: string;
  category: CardCategory;
  color: string[];
  set_code: string;
  current_price_eur: number;
  price_7d_ago: number;
  price_30d_ago: number;
  change_7d_eur: number;
  change_7d_percent: number;
  change_30d_eur: number;
  change_30d_percent: number;
  sparkline_7d: number[];
  sparkline_30d: number[];
  volume_score: number;
  cardtrader_url: string;
  cardmarket_url: string;
}

export type SealedCategory = 'display' | 'booster' | 'starter_deck' | 'collector_box' | 'double_pack' | 'other';
export type SealedLanguage = 'FR' | 'EN' | 'JP';

export interface SealedProduct {
  id: string;
  name: string;
  code: string;
  category: SealedCategory;
  releaseDate?: string;
  msrpEur: number;
  estimatedMarketEur: number;
  estimatedMarketJapEur?: number;
  estimatedMarketFrEur?: number;
  imageUrl: string;
  fallbackCardCode?: string;
  cardtraderUrl?: string;
  cardmarketUrl?: string;
  description: string;
  setGroup: string;
  packCount?: number;
  languagesAvailable?: SealedLanguage[];
  language?: SealedLanguage | 'ALL';
}

export type SealedItemCondition = 'sealed' | 'case' | 'opened' | 'damaged';

export interface UserSealedItem {
  id: string; // Unique instance id (UUID / timestamp)
  productId: string; // References SealedProduct.id or 'custom'
  customName?: string;
  customCategory?: SealedCategory;
  customImageUrl?: string;
  quantity: number;
  purchasePriceEur: number;
  currentPriceEur: number;
  condition: SealedItemCondition;
  language: SealedLanguage;
  notes?: string;
  addedAt: string;
}

export interface TradeBinderItem {
  cardCode: string;
  artworkKey?: string;
  card: Card;
  totalOwned: number;
  tradeQuantity: number;
  priceEur: number;
  condition: 'Near Mint' | 'Excellent' | 'Good' | 'Played';
  language: 'FR' | 'EN' | 'JP';
  forTrade: boolean;
  notes?: string;
}

export interface TradeBinderShareData {
  ownerName: string;
  updatedAt: string;
  contactDiscord?: string;
  contactEmail?: string;
  notes?: string;
  items: {
    cardCode: string;
    artworkKey?: string;
    qty: number;
    priceEur: number;
    cond?: string;
    lang?: string;
  }[];
}


