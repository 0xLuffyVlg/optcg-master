import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Card } from '../types';
import { allCards, getCardByCode, getVariantsByCode } from '../data/dataProvider';
import { getCardPriceForArtwork } from '../services/cardmarketPriceService';
import { 
  getSupabase, 
  isSupabaseConfigured, 
  syncCollectionToCloud, 
  fetchCollectionFromCloud 
} from '../services/supabaseClient';

export interface SetCompletionStat {
  setCode: string;
  ownedUnique: number;
  totalUnique: number;
  percentage: number;
  totalCopies: number;
  estimatedValue: number;
  estimatedCardmarketValue: number;
}

export interface CollectionStats {
  totalCardsOwned: number;
  uniqueCardsOwned: number;
  totalMarketValue: number;
  totalCardmarketValue: number;
  setCompletions: Record<string, SetCompletionStat>;
}

interface CollectionContextType {
  collection: Record<string, number>; // card_code or card_code__artworkKey -> count
  addCardToCollection: (cardCode: string, count?: number, artworkKey?: string) => void;
  removeCardFromCollection: (cardCode: string, count?: number, artworkKey?: string) => void;
  deleteCardCompletely: (cardCode: string) => void;
  setCollectionCount: (cardCode: string, count: number, artworkKey?: string) => void;
  getCardCountInCollection: (cardCode: string, artworkKey?: string) => number;
  getTotalCardCopies: (cardCode: string) => number;
  stats: CollectionStats;
  exportCollectionJson: () => string;
  importCollectionJson: (jsonStr: string) => boolean;
  clearCollection: () => void;
}

const COLLECTION_STORAGE_KEY = 'optcg_user_collection_v1';

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export const CollectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      const savedUser = localStorage.getItem('optcg_user_profile_v1');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        return u.isLoggedIn && u.id && u.id !== 'guest' ? u.id : null;
      }
    } catch (e) {}
    return null;
  });

  const [collection, setCollection] = useState<Record<string, number>>(() => {
    try {
      const savedUser = localStorage.getItem('optcg_user_profile_v1');
      let uid: string | null = null;
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u.isLoggedIn && u.id && u.id !== 'guest') uid = u.id;
      }
      const storageKey = uid ? `optcg_collection_${uid}` : COLLECTION_STORAGE_KEY;
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  // Listen to Supabase session to fetch cloud collection per user (strictly isolated per account)
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const uid = session.user.id;
        setCurrentUserId(uid);
        const cloudData = await fetchCollectionFromCloud(uid);
        if (cloudData && typeof cloudData === 'object') {
          setCollection(cloudData);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const uid = session.user.id;
        setCurrentUserId(uid);
        const cloudData = await fetchCollectionFromCloud(uid);
        if (cloudData && typeof cloudData === 'object') {
          setCollection(cloudData);
        } else {
          const userLocal = localStorage.getItem(`optcg_collection_${uid}`);
          if (userLocal) {
            try {
              setCollection(JSON.parse(userLocal));
            } catch (e) {
              setCollection({});
            }
          } else {
            setCollection({});
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUserId(null);
        const guestLocal = localStorage.getItem(COLLECTION_STORAGE_KEY);
        try {
          setCollection(guestLocal ? JSON.parse(guestLocal) : {});
        } catch (e) {
          setCollection({});
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Save to LocalStorage & Real-time Cloud Sync (Isolated by User ID)
  useEffect(() => {
    try {
      const key = currentUserId ? `optcg_collection_${currentUserId}` : COLLECTION_STORAGE_KEY;
      localStorage.setItem(key, JSON.stringify(collection));

      const supabase = getSupabase();
      if (supabase && isSupabaseConfigured() && currentUserId) {
        syncCollectionToCloud(currentUserId, collection);
      }
    } catch (e) {}
  }, [collection, currentUserId]);

  const addCardToCollection = (cardCode: string, count = 1, artworkKey?: string) => {
    const cleanCode = cardCode.trim().toUpperCase();
    const card = getCardByCode(cleanCode);
    const isBase = !artworkKey || artworkKey === card?._defaultImagePath || artworkKey === `${cleanCode}.webp` || (card?._imagePaths && artworkKey === card._imagePaths[0]);
    const storageKey = isBase ? cleanCode : `${cleanCode}__${artworkKey}`;

    setCollection(prev => {
      const current = prev[storageKey] || 0;
      return {
        ...prev,
        [storageKey]: current + count
      };
    });
  };

  const removeCardFromCollection = (cardCode: string, count = 1, artworkKey?: string) => {
    const cleanCode = cardCode.trim().toUpperCase();
    const card = getCardByCode(cleanCode);
    const isBase = artworkKey ? (!artworkKey || artworkKey === card?._defaultImagePath || artworkKey === `${cleanCode}.webp` || (card?._imagePaths && artworkKey === card._imagePaths[0])) : false;

    setCollection(prev => {
      const updated = { ...prev };

      // 1. If explicit artworkKey was provided:
      if (artworkKey) {
        const storageKey = isBase ? cleanCode : `${cleanCode}__${artworkKey}`;
        const current = updated[storageKey] || 0;
        if (current <= count) {
          delete updated[storageKey];
        } else {
          updated[storageKey] = current - count;
        }
        return updated;
      }

      // 2. If NO artworkKey provided:
      // Priority 1: Decrement base copies if any exist
      if (updated[cleanCode] && updated[cleanCode] > 0) {
        if (updated[cleanCode] <= count) {
          delete updated[cleanCode];
        } else {
          updated[cleanCode] -= count;
        }
        return updated;
      }

      // Priority 2: If no base copies exist, find any alt art copy of this card and decrement it
      const matchingAltKeys = Object.keys(updated).filter(k => k.startsWith(`${cleanCode}__`) && updated[k] > 0);
      if (matchingAltKeys.length > 0) {
        const targetKey = matchingAltKeys[0];
        if (updated[targetKey] <= count) {
          delete updated[targetKey];
        } else {
          updated[targetKey] -= count;
        }
        return updated;
      }

      return updated;
    });
  };

  const deleteCardCompletely = (cardCode: string) => {
    const cleanCode = cardCode.trim().toUpperCase();
    setCollection(prev => {
      const updated = { ...prev };
      delete updated[cleanCode];
      for (const k of Object.keys(updated)) {
        if (k.toUpperCase() === cleanCode || k.toUpperCase().startsWith(`${cleanCode}__`)) {
          delete updated[k];
        }
      }
      return updated;
    });
  };

  const setCollectionCount = (cardCode: string, count: number, artworkKey?: string) => {
    const cleanCode = cardCode.trim().toUpperCase();
    const card = getCardByCode(cleanCode);
    const isBase = !artworkKey || artworkKey === card?._defaultImagePath || artworkKey === `${cleanCode}.webp` || (card?._imagePaths && artworkKey === card._imagePaths[0]);
    const storageKey = isBase ? cleanCode : `${cleanCode}__${artworkKey}`;

    setCollection(prev => {
      if (count <= 0) {
        const updated = { ...prev };
        delete updated[storageKey];
        return updated;
      }
      return {
        ...prev,
        [storageKey]: count
      };
    });
  };

  const getCardCountInCollection = (cardCode: string, artworkKey?: string): number => {
    const cleanCode = cardCode.trim().toUpperCase();
    const card = getCardByCode(cleanCode);
    const isBase = !artworkKey || artworkKey === card?._defaultImagePath || artworkKey === `${cleanCode}.webp` || (card?._imagePaths && artworkKey === card._imagePaths[0]);
    
    if (isBase) {
      return collection[cleanCode] || 0;
    }
    const storageKey = `${cleanCode}__${artworkKey}`;
    return collection[storageKey] || 0;
  };

  const getTotalCardCopies = (cardCode: string): number => {
    const cleanCode = cardCode.trim().toUpperCase();
    let total = collection[cleanCode] || 0;

    for (const [key, count] of Object.entries(collection)) {
      if (key.startsWith(`${cleanCode}__`)) {
        total += (typeof count === 'number' ? count : 0);
      }
    }
    return total;
  };

  const clearCollection = () => {
    setCollection({});
    try {
      localStorage.removeItem(COLLECTION_STORAGE_KEY);
      if (currentUserId) {
        localStorage.removeItem(`optcg_collection_${currentUserId}`);
        const supabase = getSupabase();
        if (supabase && isSupabaseConfigured()) {
          syncCollectionToCloud(currentUserId, {});
        }
      }
    } catch (e) {}
  };

  const exportCollectionJson = (): string => {
    return JSON.stringify(collection, null, 2);
  };

  const importCollectionJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (typeof parsed === 'object' && parsed !== null) {
        setCollection(parsed);
        return true;
      }
    } catch (e) {}
    return false;
  };

  // Compute portfolio stats & set completions with Alt Art price recognition
  const stats: CollectionStats = useMemo(() => {
    let totalCardsOwned = 0;
    let uniqueCardsOwned = 0;
    let totalMarketValue = 0;

    // Group all cards by set_code
    const setTotals: Record<string, { totalUnique: number; ownedUnique: number; totalCopies: number; estimatedValue: number }> = {};

    for (const card of allCards) {
      const setCode = card.set_code || 'OTHER';
      if (!setTotals[setCode]) {
        setTotals[setCode] = { totalUnique: 0, ownedUnique: 0, totalCopies: 0, estimatedValue: 0 };
      }
      setTotals[setCode].totalUnique++;
    }

    const countedUniqueBaseCodes = new Set<string>();

    for (const [key, count] of Object.entries(collection)) {
      if (count > 0) {
        totalCardsOwned += count;

        const isAlt = key.includes('__');
        const cardCode = isAlt ? key.split('__')[0] : key;
        const artworkFile = isAlt ? key.split('__')[1] : '';

        if (!countedUniqueBaseCodes.has(cardCode)) {
          countedUniqueBaseCodes.add(cardCode);
          uniqueCardsOwned++;
        }

        const card = getCardByCode(cardCode);
        const artPriceObj = card ? getCardPriceForArtwork(card, artworkFile) : { priceEur: 0.25 };
        const unitPrice = artPriceObj.priceEur;

        const cardValue = unitPrice * count;
        totalMarketValue += cardValue;

        if (card && card.set_code) {
          const s = card.set_code;
          if (setTotals[s]) {
            if (!setTotals[s].ownedUnique) setTotals[s].ownedUnique = 0;
            setTotals[s].totalCopies += count;
            setTotals[s].estimatedValue += cardValue;
          }
        }
      }
    }

    // Assign unique owned count per set
    for (const code of countedUniqueBaseCodes) {
      const card = getCardByCode(code);
      if (card && card.set_code && setTotals[card.set_code]) {
        setTotals[card.set_code].ownedUnique++;
      }
    }

    const setCompletions: Record<string, SetCompletionStat> = {};
    for (const [s, data] of Object.entries(setTotals)) {
      setCompletions[s] = {
        setCode: s,
        ownedUnique: data.ownedUnique || 0,
        totalUnique: data.totalUnique,
        percentage: data.totalUnique > 0 ? Math.round(((data.ownedUnique || 0) / data.totalUnique) * 100) : 0,
        totalCopies: data.totalCopies,
        estimatedValue: Math.round(data.estimatedValue * 100) / 100,
        estimatedCardmarketValue: Math.round(data.estimatedValue * 100) / 100
      };
    }

    return {
      totalCardsOwned,
      uniqueCardsOwned,
      totalMarketValue: Math.round(totalMarketValue * 100) / 100,
      totalCardmarketValue: Math.round(totalMarketValue * 100) / 100,
      setCompletions
    };
  }, [collection]);

  return (
    <CollectionContext.Provider
      value={{
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
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollection = () => {
  const context = useContext(CollectionContext);
  if (!context) throw new Error('useCollection must be used within a CollectionProvider');
  return context;
};
