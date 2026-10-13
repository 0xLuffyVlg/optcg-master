import React, { useState } from 'react';
import { X, ShieldCheck, Sparkles, Check, Crown, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ONE_PIECE_AVATARS } from '../data/onePieceAvatars';
import { handleCardImageError } from '../utils/cardUtils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginWithGoogle, updateProfile } = useAuth();
  const [step, setStep] = useState<'login' | 'setup'>('login');
  const [pseudo, setPseudo] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState('luffy-nika');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleClick = async () => {
    setIsLoading(true);
    await loginWithGoogle();
    setIsLoading(false);
    setStep('setup');
  };

  const handleFinishSetup = () => {
    if (pseudo.trim()) {
      updateProfile(pseudo.trim(), selectedAvatarId);
    }
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#0F172A] border border-slate-700/90 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 cursor-default"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-[#111827] to-[#0B0F17] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {step === 'login' ? 'Connexion Sécurisée' : 'Personnalisez votre Profil'}
              </h3>
              <p className="text-xs text-slate-400">Sauvegarde Cloud de vos Cartes & Favoris</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {step === 'login' ? (
            <>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-white">Sauvegardez votre Collection</h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                  Connectez-vous en 1 clic pour synchroniser vos cartes, decks et favoris sur tous vos appareils en toute sécurité.
                </p>
              </div>

              {/* Google Button */}
              <button
                onClick={handleGoogleClick}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm shadow-xl transition-all active:scale-95 disabled:opacity-75"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continuer avec Google</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Chiffrement SSL & Confidentialité garantie</span>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Choose Pseudo & Avatar */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Votre Pseudo Pirate :</label>
                  <input
                    type="text"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    placeholder="Ex: Luffy, Zoro, Shanks..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F17] border border-slate-700 text-sm text-white placeholder:text-slate-500 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Choisissez votre Avatar One Piece :</label>
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 bg-[#0B0F17] rounded-xl border border-slate-800">
                    {ONE_PIECE_AVATARS.map((avatar) => (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setSelectedAvatarId(avatar.id)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          selectedAvatarId === avatar.id
                            ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105'
                            : 'border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={avatar.imageUrl}
                          alt={avatar.name}
                          onError={(e) => handleCardImageError(e, null)}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFinishSetup}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  Accéder à ma Collection ⚓
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
