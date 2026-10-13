import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Database, Home, X } from 'lucide-react';

interface CardNotFoundModalProps {
  cardCode: string;
  onClose: () => void;
  onNavigateToDatabase: () => void;
}

export const CardNotFoundModal: React.FC<CardNotFoundModalProps> = ({
  cardCode,
  onClose,
  onNavigateToDatabase
}) => {
  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full bg-[#0F172A] border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 text-center space-y-5 cursor-default animate-in zoom-in-95 duration-150"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 404 Warning Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/10">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Title & Badge */}
        <div className="space-y-1.5">
          <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono font-black text-xs border border-red-500/30">
            Erreur 404 • Noindex
          </span>
          <h2 className="text-xl font-black text-white">
            Carte Introuvable
          </h2>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-300 leading-relaxed">
          Le code de carte <span className="font-mono font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded">{cardCode || 'inconnu'}</span> n'existe pas ou n'est pas reconnu dans le catalogue officiel One Piece Card Game.
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onNavigateToDatabase();
            }}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <Database className="w-4 h-4" />
            <span>Explorer la Base de Données</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
