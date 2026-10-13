import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { UserSealedItem, SealedProduct, SealedCategory, SealedItemCondition } from '../types';
import { allSealedProducts, getSealedProductById, getProductPriceForLanguage } from '../data/sealedProductsData';
import { getSupabase, isSupabaseConfigured } from '../services/supabaseClient';

export interface SealedPortfolioStats {
  totalItemsCount: number;
  totalDisplaysCount: number;
  totalStartersCount: number;
  totalBoostersCount: number;
  totalCollectorsCount: number;
  totalInvestedEur: number;
  totalMarketValueEur: number;
  totalDeltaEur: number;
  totalDeltaPct: number;
}

interface SealedContextType {
  sealedItems: UserSealedItem[];
  addSealedItem: (item: Omit<UserSealedItem, 'id' | 'addedAt'>) => void;
  updateSealedItem: (id: string, updates: Partial<UserSealedItem>) => void;
  removeSealedItem: (id: string) => void;
  stats: SealedPortfolioStats;
  exportSealedJson: () => string;
  importSealedJson: (jsonStr: string) => boolean;
  clearSealedItems: () => void;
}

const STORAGE_KEY = 'optcg_user_sealed_v1';

const SealedContext = createContext<SealedContextType | undefined>(undefined);

export const SealedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const [sealedItems, setSealedItems] = useState<UserSealedItem[]>(() => {
    try {
      const savedUser = localStorage.getItem('optcg_user_profile_v1');
      let uid: string | null = null;
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u.isLoggedIn && u.id && u.id !== 'guest') uid = u.id;
      }
      const key = uid ? `optcg_sealed_${uid}` : STORAGE_KEY;
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Listen to Supabase session to fetch cloud sealed items
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const uid = session.user.id;
        setCurrentUserId(uid);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const uid = session.user.id;
        setCurrentUserId(uid);
        const userLocal = localStorage.getItem(`optcg_sealed_${uid}`);
        if (userLocal) {
          try {
            setSealedItems(JSON.parse(userLocal));
          } catch (e) {
            setSealedItems([]);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUserId(null);
        const guestLocal = localStorage.getItem(STORAGE_KEY);
        try {
          setSealedItems(guestLocal ? JSON.parse(guestLocal) : []);
        } catch (e) {
          setSealedItems([]);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    try {
      const key = currentUserId ? `optcg_sealed_${currentUserId}` : STORAGE_KEY;
      localStorage.setItem(key, JSON.stringify(sealedItems));
    } catch (e) {}
  }, [sealedItems, currentUserId]);

  const addSealedItem = (item: Omit<UserSealedItem, 'id' | 'addedAt'>) => {
    const newItem: UserSealedItem = {
      ...item,
      id: `sealed_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      addedAt: new Date().toISOString()
    };
    setSealedItems(prev => [newItem, ...prev]);
  };

  const updateSealedItem = (id: string, updates: Partial<UserSealedItem>) => {
    setSealedItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeSealedItem = (id: string) => {
    setSealedItems(prev => prev.filter(item => item.id !== id));
  };

  const clearSealedItems = () => {
    setSealedItems([]);
  };

  const exportSealedJson = () => {
    return JSON.stringify(sealedItems, null, 2);
  };

  const importSealedJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        setSealedItems(parsed);
        return true;
      }
    } catch (e) {}
    return false;
  };

  // Compute portfolio stats
  const stats: SealedPortfolioStats = useMemo(() => {
    let totalItemsCount = 0;
    let totalDisplaysCount = 0;
    let totalStartersCount = 0;
    let totalBoostersCount = 0;
    let totalCollectorsCount = 0;
    let totalInvestedEur = 0;
    let totalMarketValueEur = 0;

    for (const item of sealedItems) {
      const qty = item.quantity || 1;
      totalItemsCount += qty;

      const product = getSealedProductById(item.productId);
      const cat = item.customCategory || product?.category || 'other';

      if (cat === 'display') totalDisplaysCount += qty;
      else if (cat === 'starter_deck') totalStartersCount += qty;
      else if (cat === 'booster') totalBoostersCount += qty;
      else if (cat === 'collector_box' || cat === 'double_pack') totalCollectorsCount += qty;

      const purchase = (item.purchasePriceEur || 0) * qty;
      const unitLive = product ? getProductPriceForLanguage(product, item.language) : (item.currentPriceEur || 0);
      const current = (unitLive > 0 ? unitLive : (item.currentPriceEur || 0)) * qty;

      totalInvestedEur += purchase;
      totalMarketValueEur += current;
    }

    const totalDeltaEur = totalMarketValueEur - totalInvestedEur;
    const totalDeltaPct = totalInvestedEur > 0 ? (totalDeltaEur / totalInvestedEur) * 100 : 0;

    return {
      totalItemsCount,
      totalDisplaysCount,
      totalStartersCount,
      totalBoostersCount,
      totalCollectorsCount,
      totalInvestedEur,
      totalMarketValueEur,
      totalDeltaEur,
      totalDeltaPct
    };
  }, [sealedItems]);

  return (
    <SealedContext.Provider
      value={{
        sealedItems,
        addSealedItem,
        updateSealedItem,
        removeSealedItem,
        stats,
        exportSealedJson,
        importSealedJson,
        clearSealedItems
      }}
    >
      {children}
    </SealedContext.Provider>
  );
};

export const useSealed = () => {
  const context = useContext(SealedContext);
  if (!context) throw new Error('useSealed must be used within a SealedProvider');
  return context;
};
