import React, { useState } from 'react';
import { Coffee, Server, Sparkles, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SupportSectionProps {
  variant?: 'card' | 'footer' | 'modal';
  className?: string;
  showDonorBadgeToggle?: boolean;
}

export const PAYPAL_PRESETS = [
  { label: '☕ 2 €', amount: 2, url: 'https://paypal.me/OptcgMaster/2' },
  { label: '⭐ 5 €', amount: 5, url: 'https://paypal.me/OptcgMaster/5' },
  { label: '👑 10 €', amount: 10, url: 'https://paypal.me/OptcgMaster/10' },
  { label: '✏️ Libre', amount: null, url: 'https://paypal.me/OptcgMaster' },
];

export const DONATION_LINKS = [
  {
    name: 'Ko-fi (@optcgmaster)',
    subtext: 'Carte Bancaire ou PayPal · 0% frais',
    url: 'https://ko-fi.com/optcgmaster',
    bgColor: 'bg-gradient-to-r from-[#FF5E5B] to-[#D93D3A] hover:from-[#ff6e6b] hover:to-[#e64744] text-white shadow-md shadow-[#FF5E5B]/20 ring-1 ring-rose-400/40',
    badge: '0% frais · CB',
    type: 'kofi'
  },
  {
    name: 'PayPal (@OptcgMaster)',
    subtext: 'Paiement direct sécurisé',
    url: 'https://paypal.me/OptcgMaster',
    bgColor: 'bg-gradient-to-r from-[#0079C1] to-[#00457C] hover:from-[#0089db] hover:to-[#005294] text-white shadow-md shadow-[#0079C1]/20 ring-1 ring-blue-400/40',
    badge: 'PayPal Direct',
    type: 'paypal'
  }
];

export const SupportSection: React.FC<SupportSectionProps> = ({
  variant = 'card',
  className = '',
  showDonorBadgeToggle = true
}) => {
  const { user, toggleDonorStatus } = useAuth();
  const [badgeSavedFeedback, setBadgeSavedFeedback] = useState(false);

  // Live Server goal metrics
  const [targetMonthly, setTargetMonthly] = useState<number>(15);
  const [currentFunded, setCurrentFunded] = useState<number>(0);

  // Fetch live server goal from /api/server-goal
  React.useEffect(() => {
    fetch('/api/server-goal')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setTargetMonthly(data.data.goal || 15);
          setCurrentFunded(data.data.current || 0);
        }
      })
      .catch(() => {
        // Fallback default
      });
  }, []);
  const progressPercent = Math.min(100, Math.round((currentFunded / targetMonthly) * 100));

  const handleToggleBadge = () => {
    toggleDonorStatus();
    setBadgeSavedFeedback(true);
    setTimeout(() => setBadgeSavedFeedback(false), 2200);
  };

  const isFooter = variant === 'footer';

  return (
    <div
      className={`relative rounded-xl border border-slate-800/80 bg-slate-900/60 p-2.5 sm:p-3 text-slate-300 transition-all ${
        isFooter ? 'max-w-5xl mx-auto' : ''
      } ${className}`}
    >
      {/* Ligne 1 : Header léger & Objectif serveur compact */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-400">
            <Coffee className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-white whitespace-nowrap">
            Soutenir OPTCG Master
          </span>
          <span className="hidden md:inline text-[11px] text-slate-400">
            • 100% gratuit & sans pub, un café aide pour le serveur
          </span>
        </div>

        {/* Objectif serveur mini */}
        <div className="flex items-center gap-2 text-[11px] bg-slate-950/70 px-2 py-1 rounded-md border border-slate-800/80">
          <Server className="w-3 h-3 text-blue-400 flex-shrink-0" />
          <span className="text-slate-400 text-[10.5px]">Serveur :</span>
          <span className="font-bold text-amber-400 text-[10.5px]">
            {currentFunded}€ / {targetMonthly}€
          </span>
          <div className="w-12 sm:w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400">({progressPercent}%)</span>
        </div>
      </div>

      {/* Ligne 2 : Actions légères (Ko-fi, PayPal, Presets, Badge Mécène) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
        {/* Liens et boutons de don */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Bouton Ko-fi */}
          <a
            href="https://ko-fi.com/optcgmaster"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-[#FF5E5B]/15 hover:bg-[#FF5E5B]/25 border border-[#FF5E5B]/30 text-[#ff7875] hover:text-white text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
            title="Ko-fi (Carte Bancaire ou PayPal - 0% frais)"
          >
            <span>Ko-fi</span>
            <span className="text-[9px] opacity-75 hidden sm:inline">(0% frais)</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
          </a>

          {/* Bouton PayPal Direct */}
          <a
            href="https://paypal.me/OptcgMaster"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-[#0079C1]/15 hover:bg-[#0079C1]/25 border border-[#0079C1]/30 text-[#38bdf8] hover:text-white text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
            title="Paiement direct sécurisé PayPal"
          >
            <span>PayPal</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
          </a>

          {/* Séparateur */}
          <span className="text-slate-700 text-xs hidden sm:inline">|</span>

          {/* Presets PayPal */}
          <div className="flex items-center gap-1">
            {PAYPAL_PRESETS.map((preset) => (
              <a
                key={preset.label}
                href={preset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="h-7 px-2 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[10.5px] font-medium text-slate-300 hover:text-amber-300 transition-all flex items-center justify-center active:scale-95 cursor-pointer"
              >
                {preset.label}
              </a>
            ))}
          </div>
        </div>

        {/* Bouton Badge mécène discret */}
        {showDonorBadgeToggle && (
          <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
            <button
              type="button"
              onClick={handleToggleBadge}
              className={`h-7 px-2 sm:px-2.5 rounded-lg text-[10.5px] font-semibold transition-all active:scale-95 cursor-pointer flex items-center gap-1 border ${
                user.isDonor
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
              title={
                user.isDonor
                  ? 'Masquer le badge mécène sur mon profil'
                  : 'Afficher le badge mécène sur mon profil'
              }
            >
              {badgeSavedFeedback ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                  <span className="text-emerald-400">Enregistré</span>
                </>
              ) : user.isDonor ? (
                <>
                  <span className="text-amber-400">⭐</span>
                  <span>Mécène actif</span>
                  <span className="text-[9px] text-slate-500 hidden sm:inline">(clic pour masquer)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-slate-400" />
                  <span>Activer badge</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
