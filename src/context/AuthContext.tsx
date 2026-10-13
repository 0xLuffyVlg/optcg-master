import React, { createContext, useContext, useState, useEffect } from 'react';
import { ONE_PIECE_AVATARS, OnePieceAvatar, getAvatarById } from '../data/onePieceAvatars';
import { 
  getSupabase, 
  isSupabaseConfigured, 
  signInWithGoogleOAuth, 
  syncFavoritesToCloud, 
  fetchFavoritesFromCloud,
  syncProfileToCloud,
  fetchProfileFromCloud
} from '../services/supabaseClient';

export interface UserProfile {
  id: string;
  email: string;
  pseudo: string;
  avatarId: string;
  title: string;
  isLoggedIn: boolean;
  createdAt: string;
  favorites: string[];
  isDonor?: boolean;
}

interface AuthContextType {
  user: UserProfile;
  loginWithGoogle: (customEmail?: string, customName?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (pseudo: string, avatarId: string) => void;
  toggleFavorite: (cardCode: string) => void;
  isFavorite: (cardCode: string) => boolean;
  getAvatar: () => OnePieceAvatar;
  favoritesCount: number;
  isCloudConnected: boolean;
  setDonorStatus: (isDonor: boolean) => void;
  toggleDonorStatus: () => void;
}

const AUTH_STORAGE_KEY = 'optcg_user_profile_v1';
const FAVORITES_STORAGE_KEY = 'optcg_user_favorites_v1';

const DEFAULT_USER: UserProfile = {
  id: 'guest',
  email: '',
  pseudo: 'Mousse Pirate',
  avatarId: 'luffy-classic',
  title: 'Mousse Débutant',
  isLoggedIn: false,
  createdAt: new Date().toISOString(),
  favorites: []
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      const favorites = savedFavorites ? JSON.parse(savedFavorites) : [];

      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        return {
          ...parsed,
          favorites: Array.isArray(favorites) ? favorites : []
        };
      }
    } catch (e) {}
    return DEFAULT_USER;
  });

  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(isSupabaseConfigured());

  // Listen to Real Supabase OAuth session changes & Auto-init
  useEffect(() => {
    let activeSub: any = null;

    const setupAuth = async () => {
      const supabase = getSupabase();
      if (!supabase) return;

      setIsCloudConnected(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const email = session.user.email || '';
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0];
        
        // Fetch cloud profile & favorites
        const cloudProf = await fetchProfileFromCloud(session.user.id);
        const cloudFavs = await fetchFavoritesFromCloud(session.user.id);

        setUser(prev => ({
          ...prev,
          id: session.user.id,
          email,
          pseudo: cloudProf?.pseudo || (prev.pseudo !== 'Mousse Pirate' ? prev.pseudo : name),
          avatarId: cloudProf?.avatar_id || prev.avatarId || 'luffy-nika',
          isLoggedIn: true,
          favorites: cloudFavs || prev.favorites
        }));
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const email = session.user.email || '';
          const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0];
          const cloudProf = await fetchProfileFromCloud(session.user.id);
          const cloudFavs = await fetchFavoritesFromCloud(session.user.id);

          setUser(prev => ({
            ...prev,
            id: session.user.id,
            email,
            pseudo: cloudProf?.pseudo || (prev.pseudo !== 'Mousse Pirate' ? prev.pseudo : name),
            avatarId: cloudProf?.avatar_id || prev.avatarId || 'luffy-nika',
            isLoggedIn: true,
            favorites: cloudFavs || prev.favorites
          }));
        } else if (_event === 'SIGNED_OUT') {
          setUser(DEFAULT_USER);
        }
      });
      activeSub = subscription;
    };

    setupAuth();

    return () => {
      if (activeSub) activeSub.unsubscribe();
    };
  }, []);

  // Save profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(user.favorites));
    } catch (e) {}
  }, [user]);

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      await signInWithGoogleOAuth();
      return true;
    } catch (oauthErr: any) {
      console.error('Erreur Google OAuth:', oauthErr);
      throw oauthErr;
    }
  };

  const logout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    setUser({
      ...DEFAULT_USER,
      favorites: user.favorites // keep favorites locally
    });
  };

  const updateProfile = (newPseudo: string, newAvatarId: string) => {
    const cleanPseudo = newPseudo.trim() || 'Pirate Sans Nom';
    setUser(prev => {
      const updated = {
        ...prev,
        pseudo: cleanPseudo,
        avatarId: newAvatarId,
        isLoggedIn: true
      };
      if (prev.isLoggedIn && isSupabaseConfigured()) {
        syncProfileToCloud(prev.id, cleanPseudo, newAvatarId);
      }
      return updated;
    });
  };

  const toggleFavorite = (cardCode: string) => {
    const cleanCode = cardCode.trim().toUpperCase();
    setUser(prev => {
      const exists = prev.favorites.includes(cleanCode);
      const updated = exists 
        ? prev.favorites.filter(c => c !== cleanCode)
        : [...prev.favorites, cleanCode];
      
      if (prev.isLoggedIn && isSupabaseConfigured()) {
        syncFavoritesToCloud(prev.id, updated);
      }
      return { ...prev, favorites: updated };
    });
  };

  const isFavorite = (cardCode: string): boolean => {
    if (!cardCode) return false;
    return user.favorites.includes(cardCode.trim().toUpperCase());
  };

  const getAvatar = (): OnePieceAvatar => {
    return getAvatarById(user.avatarId);
  };

  const setDonorStatus = (isDonor: boolean) => {
    setUser(prev => ({
      ...prev,
      isDonor
    }));
  };

  const toggleDonorStatus = () => {
    setUser(prev => ({
      ...prev,
      isDonor: !prev.isDonor
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginWithGoogle,
        logout,
        updateProfile,
        toggleFavorite,
        isFavorite,
        getAvatar,
        favoritesCount: user.favorites.length,
        isCloudConnected,
        setDonorStatus,
        toggleDonorStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
