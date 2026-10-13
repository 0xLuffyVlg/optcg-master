import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone, CheckCircle } from 'lucide-react';
import SITE_LOGO from '../assets/logoBase64';

export const PWAInstallModal: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(!!isRunningStandalone);

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Capture Android / Chrome PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install banner on mobile if not already standalone
      if (!isRunningStandalone) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if we should show iOS prompt
    if (isIosDevice && !isRunningStandalone) {
      const dismissed = localStorage.getItem('optcg_pwa_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    }

    const handleTriggerInstall = () => {
      handleInstallClick();
    };

    window.addEventListener('open-pwa-install', handleTriggerInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open-pwa-install', handleTriggerInstall);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
        setShowModal(false);
      }
      setDeferredPrompt(null);
    } else {
      // Show instructions modal for iOS or manual browsers
      setShowModal(true);
    }
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('optcg_pwa_dismissed', 'true');
  };

  // If already installed or not on mobile, don't show intrusive banner
  if (isStandalone) return null;

  return (
    <>
      {/* Floating Mobile Install Pill / Banner */}
      {showBanner && (
        <div className="fixed bottom-16 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-4 z-50 max-w-sm mx-auto bg-[#111827]/95 backdrop-blur-md border border-amber-500/40 p-3.5 rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 p-1 flex-shrink-0 flex items-center justify-center shadow">
                <img src={SITE_LOGO} alt="OPTCG Master" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-white truncate">Installer l'application</h4>
                <p className="text-[10px] text-slate-300 truncate">Accès rapide sur l'écran d'accueil</p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 flex-shrink-0">
              <button
                onClick={handleInstallClick}
                className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Installer</span>
              </button>
              <button
                onClick={handleDismissBanner}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS & Manual Install Step-by-Step Modal */}
      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 p-1 flex items-center justify-center">
                  <img src={SITE_LOGO} alt="OPTCG Master" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Installer OPTCG Master</h3>
                  <p className="text-[11px] text-amber-400 font-bold">Application Mobile One Piece TCG</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              /* iOS Safari Instructions */
              <div className="space-y-3.5 text-xs text-slate-300">
                <p className="font-semibold text-white">
                  Pour installer l'application sur votre iPhone / iPad avec Safari :
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-[#0B0F17] border border-slate-800">
                    <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 font-black text-xs flex-shrink-0">
                      1
                    </div>
                    <p className="leading-relaxed">
                      Appuyez sur le bouton <strong>Partager</strong> <Share className="inline w-3.5 h-3.5 text-blue-400 mx-1" /> en bas de votre écran dans Safari.
                    </p>
                  </div>

                  <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-[#0B0F17] border border-slate-800">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 font-black text-xs flex-shrink-0">
                      2
                    </div>
                    <p className="leading-relaxed">
                      Faites défiler vers le bas et sélectionnez <strong>« Sur l'écran d'accueil »</strong> <PlusSquare className="inline w-3.5 h-3.5 text-amber-400 mx-1" />.
                    </p>
                  </div>

                  <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-[#0B0F17] border border-slate-800">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs flex-shrink-0">
                      3
                    </div>
                    <p className="leading-relaxed">
                      Touchez <strong>« Ajouter »</strong> en haut à droite. L'icône OPTCG Master apparaîtra sur votre écran d'accueil !
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Android / Desktop Instructions */
              <div className="space-y-3 text-xs text-slate-300">
                <p className="leading-relaxed">
                  Sur Android (Chrome), appuyez sur les <strong>trois points verticaux (⋮)</strong> en haut à droite du navigateur, puis sélectionnez <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.
                </p>
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              Compris !
            </button>
          </div>
        </div>
      )}
    </>
  );
};
