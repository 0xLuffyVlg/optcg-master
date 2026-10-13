import React from 'react';
import { X, Heart, Coffee } from 'lucide-react';
import { SupportSection } from './SupportSection';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[75] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto cursor-pointer animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-[#0B0F17] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto cursor-default animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="relative px-4 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-r from-slate-900 via-[#111827] to-[#0B0F17] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white">
                Soutenir le Projet OPTCG Master
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                Participation bénévole aux coûts de serveur et maintenance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          <SupportSection variant="card" showDonorBadgeToggle={true} />
        </div>
      </div>
    </div>
  );
};
