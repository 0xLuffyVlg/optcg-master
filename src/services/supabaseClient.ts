import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://hzvczuqamfxqerlalwhj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_JWVKR9dqEVmtkTGbE-0B8Q_028V8iVT';

export const getSupabaseConfig = () => {
  return {
    url: (import.meta.env.VITE_SUPABASE_URL as string) || localStorage.getItem('optcg_supabase_url') || DEFAULT_SUPABASE_URL,
    key: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || localStorage.getItem('optcg_supabase_key') || DEFAULT_SUPABASE_ANON_KEY
  };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key && url.startsWith('https://'));
};

let clientInstance: SupabaseClient | null = null;

export const saveSupabaseConfig = (url: string, anonKey: string): boolean => {
  if (url && anonKey && url.trim().startsWith('https://')) {
    localStorage.setItem('optcg_supabase_url', url.trim());
    localStorage.setItem('optcg_supabase_key', anonKey.trim());
    clientInstance = null; // reset client instance
    return true;
  }
  return false;
};

export const getSupabase = (): SupabaseClient => {
  const { url, key } = getSupabaseConfig();
  if (!clientInstance) {
    clientInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }
  return clientInstance;
};

/**
 * Trigger Real Google OAuth 2.0 Sign In
 */
export const signInWithGoogleOAuth = async () => {
  const supabase = getSupabase();
  const redirectUrl = window.location.origin;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  });

  if (error) throw error;
  return data;
};

/**
 * Real Database Sync Functions
 */

// 1. Profile Sync
export const syncProfileToCloud = async (userId: string, pseudo: string, avatarId: string) => {
  const supabase = getSupabase();
  if (!supabase || !userId) return;

  try {
    await supabase.from('profiles').upsert({
      id: userId,
      pseudo,
      avatar_id: avatarId,
      updated_at: new Date().toISOString()
    });
  } catch (e) {
    console.error('Cloud profile sync error:', e);
  }
};

export const fetchProfileFromCloud = async (userId: string) => {
  const supabase = getSupabase();
  if (!supabase || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data;
  } catch (e) {
    return null;
  }
};

// 2. Collection Sync (Full Database Table)
export const syncCollectionToCloud = async (userId: string, collection: Record<string, number>) => {
  const supabase = getSupabase();
  if (!supabase || !userId) return;

  try {
    // Save as structured snapshot
    await supabase.from('user_collections').upsert({
      user_id: userId,
      collection_data: collection,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  } catch (e) {
    console.error('Cloud collection sync error:', e);
  }
};

export const fetchCollectionFromCloud = async (userId: string) => {
  const supabase = getSupabase();
  if (!supabase || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('user_collections')
      .select('collection_data')
      .eq('user_id', userId)
      .single();
    if (error || !data) return null;
    return data.collection_data as Record<string, number>;
  } catch (e) {
    return null;
  }
};

// 3. Favorites Sync
export const syncFavoritesToCloud = async (userId: string, favorites: string[]) => {
  const supabase = getSupabase();
  if (!supabase || !userId) return;

  try {
    await supabase.from('user_favorites').upsert({
      user_id: userId,
      favorites_data: favorites,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  } catch (e) {
    console.error('Cloud favorites sync error:', e);
  }
};

export const fetchFavoritesFromCloud = async (userId: string) => {
  const supabase = getSupabase();
  if (!supabase || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('favorites_data')
      .eq('user_id', userId)
      .single();
    if (error || !data) return null;
    return data.favorites_data as string[];
  } catch (e) {
    return null;
  }
};
