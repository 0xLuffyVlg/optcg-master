import { ActiveTab } from '../components/Navbar';

export interface RouteState {
  tab: ActiveTab;
  cardCode?: string;
  deckId?: string;
}

const TAB_ROUTES: Record<string, ActiveTab> = {
  '': 'meta',
  '/': 'meta',
  '/meta': 'meta',
  '/deckbuilder': 'deckbuilder',
  '/tournaments': 'tournaments',
  '/tournois': 'tournaments',
  '/market': 'database',
  '/bourse': 'database',
  '/tendances': 'database',
  '/collection': 'collection',
  '/database': 'database',
  '/cartes': 'database',
  '/quotas': 'quotas',
  '/news': 'news',
  '/reveals': 'news',
  '/matchups': 'matchups'
};

const TAB_PATHS: Record<ActiveTab, string> = {
  meta: '/meta',
  deckbuilder: '/deckbuilder',
  tournaments: '/tournois',
  collection: '/collection',
  database: '/cartes',
  quotas: '/quotas',
  news: '/news',
  matchups: '/matchups'
};

const TAB_TITLES: Record<ActiveTab, string> = {
  meta: 'Tier List & Méta Decks One Piece TCG — OPTCG Master',
  deckbuilder: 'Deckbuilder Compétitif One Piece TCG — OPTCG Master',
  tournaments: 'Résultats des Tournois Mondiaux One Piece TCG — OPTCG Master',
  collection: 'Ma Collection & Suivi Cartes One Piece TCG — OPTCG Master',
  database: 'Base de Données Cartes HD One Piece TCG — OPTCG Master',
  quotas: 'Calculateur Quotas & Pull Rates Displays — OPTCG Master',
  news: 'News & Reveals OP18 / EB05 One Piece TCG — OPTCG Master',
  matchups: 'Statistiques & Matchups Compétitifs — OPTCG Master'
};

/**
 * Update the HTML <link rel="canonical"> dynamically on route changes
 */
export function updateCanonicalUrl(path: string) {
  try {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const canonicalUrl = `https://www.optcg-master.fr${cleanPath === '/' ? '/' : cleanPath}`;
    let link: HTMLLinkElement | null = document.querySelector("link[rel='canonical']");
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);
  } catch (e) {
    // Fallback for sandboxed or test environments
  }
}

/**
 * Dynamically manage the <meta name="robots"> tag for SEO & 404 indexing protection
 */
export function updateRobotsMeta(content: 'index, follow' | 'noindex, nofollow' = 'index, follow') {
  try {
    let meta: HTMLMetaElement | null = document.querySelector("meta[name='robots']");
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  } catch (e) {
    // Fallback for sandboxed environments
  }
}

/**
 * Strict validator for One Piece Card Game code format
 */
export function isValidCardCode(code?: string): boolean {
  if (!code || typeof code !== 'string') return false;
  const clean = code.trim();
  if (!clean) return false;

  if (/https?:/i.test(clean)) return false;
  if (/[\/\\ \s%]/i.test(clean)) return false;
  if (/\.(webp|png|jpg|jpeg|svg|gif|avif)$/i.test(clean)) return false;
  if (clean.includes(':') || clean.includes('?') || clean.includes('#')) return false;

  const cardCodeRegex = /^(OP|ST|EB|PRB|P|DON)[A-Z0-9]*(-[A-Z0-9]+)?(_[A-Z0-9]+|-R)?$/i;
  return cardCodeRegex.test(clean);
}

/**
 * Parse the current window.location into a structured RouteState
 */
export function parseCurrentLocation(): RouteState {
  try {
    const pathname = window.location.pathname.replace(/\/$/, '') || '/';
    const searchParams = new URLSearchParams(window.location.search);

    // Keep canonical tag in sync on parse
    updateCanonicalUrl(pathname);

    // 1. Support legacy query parameters (?tab=... or ?carte=... or ?card=...)
    const queryTab = searchParams.get('tab') as ActiveTab;
    const queryCard = searchParams.get('carte') || searchParams.get('card') || searchParams.get('c');
    const queryDeck = searchParams.get('deck') || searchParams.get('d');

    // 2. Parse /carte/:cardCode
    const cardMatch = pathname.match(/^\/carte\/([A-Za-z0-9_-]+)/i);
    if (cardMatch) {
      return {
        tab: 'database',
        cardCode: cardMatch[1].toUpperCase()
      };
    }

    // 3. Parse /deck/:deckId
    const deckMatch = pathname.match(/^\/deck\/([A-Za-z0-9_-]+)/i);
    if (deckMatch) {
      return {
        tab: 'meta',
        deckId: deckMatch[1]
      };
    }

    // 4. Parse known tabs
    if (TAB_ROUTES[pathname]) {
      return {
        tab: TAB_ROUTES[pathname],
        cardCode: queryCard || undefined,
        deckId: queryDeck || undefined
      };
    }

    if (queryTab && TAB_PATHS[queryTab]) {
      return {
        tab: queryTab,
        cardCode: queryCard || undefined,
        deckId: queryDeck || undefined
      };
    }

    return { tab: 'meta' };
  } catch (e) {
    return { tab: 'meta' };
  }
}

/**
 * Push or replace URL when switching tabs
 */
export function navigateToTab(tab: ActiveTab, replace = false) {
  const path = TAB_PATHS[tab] || '/';
  updateBrowserUrl(path, replace);
  updateDocumentTitle(tab);
}

/**
 * Push or replace URL when opening a card - Guarantees clean canonical card code URL
 */
export function navigateToCard(cardCode: string, replace = false) {
  let safeCode = (cardCode || '').trim().toUpperCase();
  // Absolute protection: If an external image URL or path was passed by mistake, extract strictly the canonical card code
  if (/https?:/i.test(safeCode) || safeCode.includes('/') || safeCode.includes('\\')) {
    const match = safeCode.match(/([A-Z0-9]+-[A-Z0-9]+)/i);
    safeCode = match ? match[1].toUpperCase() : 'CARTE';
  }
  const path = `/carte/${encodeURIComponent(safeCode)}`;
  updateBrowserUrl(path, replace);
}

/**
 * Push or replace URL when opening a deck
 */
export function navigateToDeck(deckId: string, replace = false) {
  const path = `/deck/${encodeURIComponent(deckId)}`;
  updateBrowserUrl(path, replace);
}

/**
 * Revert URL back to active tab when closing modal
 */
export function closeModalToRoute(currentTab: ActiveTab) {
  const path = TAB_PATHS[currentTab] || '/';
  updateBrowserUrl(path, false);
  updateDocumentTitle(currentTab);
}

/**
 * Safely push or replace browser state
 */
function updateBrowserUrl(path: string, replace: boolean) {
  try {
    updateCanonicalUrl(path);
    if (window.location.pathname !== path) {
      if (replace) {
        window.history.replaceState({ path }, '', path);
      } else {
        window.history.pushState({ path }, '', path);
      }
    }
  } catch (e) {
    // Fallback for sandboxed environments
  }
}

/**
 * Update document title dynamically for SEO & browser tabs - Guarantees clean tab title
 */
export function updateDocumentTitle(tab: ActiveTab, customTitle?: string) {
  if (customTitle) {
    // Clean any external URLs, file extensions or third party references
    const cleanTitle = customTitle
      .replace(/https?:\/\/[^\s\)]+/gi, '')
      .replace(/scalpeurs\.com/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    document.title = `${cleanTitle} | OPTCG Master`;
  } else {
    document.title = TAB_TITLES[tab] || 'OPTCG Master (www.optcg-master.fr) — One Piece Card Game';
  }
}
