import React, { useState, useMemo } from 'react';
import { 
  X, Check, Crown, Sparkles, Heart, FolderHeart, Shield, Trophy, 
  Flame, LogOut, ExternalLink, Save, Layers, ArrowRight, Smartphone, Monitor,
  Download, Coffee
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCollection } from '../context/CollectionContext';
import { useDeck } from '../context/DeckContext';
import { ONE_PIECE_AVATARS, AVATAR_CATEGORIES, OnePieceAvatar, getAvatarById } from '../data/onePieceAvatars';
import { handleCardImageError } from '../utils/cardUtils';
import { SupportSection } from './SupportSection';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCollection?: () => void;
  onNavigateToDecks?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onNavigateToCollection,
  onNavigateToDecks
}) => {
  const { user, updateProfile, loginWithGoogle, logout, favoritesCount } = useAuth();
  const { stats } = useCollection();
  const { savedDecks } = useDeck();

  const [pseudo, setPseudo] = useState(user.pseudo || 'Pirate');
  const [selectedAvatarId, setSelectedAvatarId] = useState(user.avatarId || 'luffy-nika');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const currentSelectedAvatar = useMemo(() => {
    return ONE_PIECE_AVATARS.find(a => a.id === selectedAvatarId) || ONE_PIECE_AVATARS[0];
  }, [selectedAvatarId]);

  const filteredAvatars = useMemo(() => {
    if (selectedCategory === 'all') return ONE_PIECE_AVATARS;
    return ONE_PIECE_AVATARS.filter(a => a.category === selectedCategory);
  }, [selectedCategory]);

  if (!isOpen) return null;

  // Calculate Pirate Rank according to collection size
  const totalCards = stats.totalCardsOwned;
  let pirateRank = 'Mousse Débutant ⛵';
  let rankColor = 'text-slate-400 bg-slate-800/80 border-slate-700';
  let nextRankLabel = 'Supernova des Mers (25 cartes)';
  let progressPercent = Math.min(100, Math.round((totalCards / 25) * 100));

  if (totalCards >= 500 || stats.totalCardmarketValue >= 1000) {
    pirateRank = 'Roi des Pirates 👑';
    rankColor = 'text-amber-300 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-400/60 shadow-lg shadow-amber-500/20';
    nextRankLabel = 'Rang Maximum Atteint ! 🏆';
    progressPercent = 100;
  } else if (totalCards >= 250 || stats.totalCardmarketValue >= 500) {
    pirateRank = 'Empereur des Mers (Yonko) ⭐';
    rankColor = 'text-rose-300 bg-rose-950/50 border-rose-500/50';
    nextRankLabel = 'Prochain : Roi des Pirates (500 cartes)';
    progressPercent = Math.min(100, Math.round(((totalCards - 250) / 250) * 100));
  } else if (totalCards >= 100 || stats.totalCardmarketValue >= 150) {
    pirateRank = 'Grand Corsaire ⚓';
    rankColor = 'text-purple-300 bg-purple-950/50 border-purple-500/50';
    nextRankLabel = 'Prochain : Empereur des Mers (250 cartes)';
    progressPercent = Math.min(100, Math.round(((totalCards - 100) / 150) * 100));
  } else if (totalCards >= 25) {
    pirateRank = 'Supernova des Mers ⚔️';
    rankColor = 'text-blue-300 bg-blue-950/50 border-blue-500/50';
    nextRankLabel = 'Prochain : Grand Corsaire (100 cartes)';
    progressPercent = Math.min(100, Math.round(((totalCards - 25) / 75) * 100));
  }

  const handleSave = () => {
    setIsSaving(true);
    updateProfile(pseudo.trim() || 'Pirate', selectedAvatarId);
    setSavedSuccess(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-[#0B0F17] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 cursor-default flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="relative px-5 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-slate-900 via-[#111827] to-[#0B0F17] border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/40 text-amber-400 flex-shrink-0 shadow-lg shadow-amber-500/10">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2 truncate">
                <span>Profil de Capitaine</span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Cloud Synchronisé
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Gérez votre identité pirate et choisissez votre avatar parmi {ONE_PIECE_AVATARS.length} cartes officielles
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors flex-shrink-0"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - 2 Columns on Desktop */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
          
          {/* LEFT COLUMN: Hero Character Card & Cloud Status (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4 flex flex-col">
            
            {/* Main Holographic Avatar Card */}
            <div className="relative rounded-2xl p-5 bg-gradient-to-b from-slate-900/90 via-[#0F172A] to-[#0B0F17] border border-slate-700/80 shadow-2xl flex flex-col items-center text-center overflow-hidden">
              
              {/* Background ambient character glow */}
              <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${currentSelectedAvatar.color} opacity-20 blur-2xl pointer-events-none`} />

              {/* Large Avatar Card Frame */}
              <div className="relative group mb-3">
                <div className="w-28 h-36 sm:w-32 sm:h-40 rounded-2xl overflow-hidden border-2 border-amber-400/90 shadow-2xl shadow-amber-500/30 bg-slate-950 transition-all duration-300 group-hover:scale-105">
                  <img
                    src={currentSelectedAvatar.imageUrl}
                    alt={currentSelectedAvatar.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = 'https://scalpeurs.com/img/cards-fr/eb02-p083.webp';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                  <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[10px] font-black shadow-lg">
                    {currentSelectedAvatar.badge}
                  </span>
                </div>
              </div>

              {/* Character Details */}
              <h3 className="text-lg font-black text-white mt-1">
                {currentSelectedAvatar.name}
              </h3>
              <p className="text-xs text-amber-400 font-semibold mb-3">
                {currentSelectedAvatar.title}
              </p>

              {/* Pseudo Input */}
              <div className="w-full text-left space-y-1 pt-1 border-t border-slate-800">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Pseudo du Capitaine :
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    placeholder="Votre Nom Pirate..."
                    maxLength={25}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-black text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">
                    ✏️
                  </div>
                </div>
              </div>

              {/* Pirate Rank & Bounty Progress */}
              <div className="w-full text-left space-y-1.5 pt-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">Rang Pirate :</span>
                  <div className="flex items-center gap-1.5">
                    {user.isDonor && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-sm border border-amber-300 flex items-center gap-1" title="Donateur & Mécène OPTCG Master">
                        <span>⭐</span>
                        <span>Mécène</span>
                      </span>
                    )}
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${rankColor}`}>
                      {pirateRank}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>{totalCards} cartes possédées</span>
                  <span className="text-amber-400 font-bold">{nextRankLabel}</span>
                </div>
              </div>

            </div>

            {/* Cloud Supabase & Google Sync Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0B0F17] to-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                  <span>Synchronisation Multi-Appareils</span>
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cloud Actif
                </span>
              </div>

              {user.isLoggedIn && user.email ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-300 font-bold">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">Connecté : <strong className="text-white">{user.email}</strong></span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Vos cartes, vos favoris et vos decks sont synchronisés en temps réel entre votre PC et votre téléphone.
                  </p>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Se déconnecter de Google</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={googleLoading}
                    onClick={async () => {
                      setGoogleLoading(true);
                      try {
                        await loginWithGoogle();
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setGoogleLoading(false);
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    {googleLoading ? (
                      <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>Se connecter avec Google</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center leading-tight">
                    🔒 Connexion officielle et sécurisée pour sauvegarder votre collection sur tous vos écrans.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Stats & Avatar Gallery (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-4 flex flex-col min-h-0">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-shrink-0">
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Cartes Totales</span>
                <span className="text-base sm:text-lg font-black text-white">{stats.totalCardsOwned} ex.</span>
                <span className="text-[10px] text-slate-500 block">{stats.uniqueCardsOwned} uniques</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Cardmarket</span>
                <span className="text-base sm:text-lg font-black text-emerald-400">{stats.totalCardmarketValue.toFixed(2)} €</span>
                <span className="text-[10px] text-slate-500 block">Valeur estimée</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Favoris</span>
                <span className="text-base sm:text-lg font-black text-rose-400">{favoritesCount} ❤️</span>
                <span className="text-[10px] text-slate-500 block">Cartes fétiches</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Mes Decks</span>
                <span className="text-base sm:text-lg font-black text-blue-400">{savedDecks.length}</span>
                <span className="text-[10px] text-slate-500 block">Créations</span>
              </div>
            </div>

            {/* Gallery Header with Category Filter Chips */}
            <div className="space-y-2.5 flex-shrink-0">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Galerie d'Avatars One Piece</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-amber-400 font-black">
                    {filteredAvatars.length}
                  </span>
                </label>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Cliquez sur un personnage pour l'équiper
                </span>
              </div>

              {/* Category Filter Horizontal Scroll */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {AVATAR_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 ${
                        isActive
                          ? 'bg-amber-400 text-black shadow-md shadow-amber-500/20 scale-105'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Avatar Grid Gallery */}
            <div className="flex-1 min-h-[220px] max-h-[340px] overflow-y-auto p-2.5 bg-[#070B12] rounded-2xl border border-slate-800/90 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {filteredAvatars.map((avatar) => {
                const isSelected = selectedAvatarId === avatar.id;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatarId(avatar.id)}
                    className={`group relative rounded-2xl overflow-hidden border-2 text-left transition-all aspect-[4/5] flex flex-col justify-end bg-slate-950 cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/60 scale-105 shadow-xl shadow-amber-500/30 z-10'
                        : 'border-slate-800 hover:border-slate-600 opacity-75 hover:opacity-100 hover:scale-[1.03]'
                    }`}
                  >
                    <img
                      src={avatar.imageUrl}
                      alt={avatar.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = 'https://scalpeurs.com/img/cards-fr/eb02-p083.webp';
                      }}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    {/* Selected Checkmark Badge */}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-amber-400 text-black shadow-lg">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}

                    {/* Character Name & Badge */}
                    <div className="relative z-10 p-1.5 text-center">
                      <span className="text-[10px] sm:text-[11px] font-black text-white truncate block leading-tight drop-shadow-md">
                        {avatar.name.split(' ')[0]}
                      </span>
                      <span className="text-[8px] text-amber-300 font-extrabold truncate block">
                        {avatar.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Navigation Action Shortcuts */}
            <div className="grid grid-cols-2 gap-2 pt-1 flex-shrink-0">
              {onNavigateToCollection && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToCollection();
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/40 text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">Ma Collection</span>
                      <span className="text-[10px] text-slate-400 block">{stats.totalCardsOwned} cartes classées</span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              )}

              {onNavigateToDecks && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToDecks();
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-400/40 text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <FolderHeart className="w-4 h-4 text-blue-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">Mes Decks</span>
                      <span className="text-[10px] text-slate-400 block">{savedDecks.length} decks créés</span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              )}
            </div>

            {/* APPLICATION & SOUTIEN SECTION */}
            <div className="space-y-3 pt-2 flex-shrink-0">
              
              {/* 1. Installer l'application (PWA) */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#0B0F17] to-slate-900 border border-blue-500/30 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 truncate">
                      <span>Installer l'application OPTCG Master</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        App Mobile
                      </span>
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                      Accès instantané 1 tap et mode plein écran sur votre téléphone
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-pwa-install'));
                  }}
                  className="py-2 px-3 sm:px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Installer</span>
                </button>
              </div>

              {/* 2. Bloc Soutien : Directement après "Installer l'app" */}
              <SupportSection variant="card" showDonorBadgeToggle={true} />

            </div>

          </div>

        </div>

        {/* Modal Footer Bar */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-gradient-to-r from-[#0B0F17] via-slate-900 to-[#0B0F17] border-t border-slate-800 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Avatar sélectionné : <strong className="text-white">{currentSelectedAvatar.name}</strong></span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-colors"
            >
              Fermer
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 py-2.5 px-6 rounded-xl font-black text-xs text-black shadow-lg transition-all active:scale-95 cursor-pointer ${
                savedSuccess
                  ? 'bg-emerald-400 text-black shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-amber-500/20'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Enregistré !</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Enregistrer le Profil</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
