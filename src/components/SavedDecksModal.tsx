import React from 'react';
import { X, Bookmark, Play, Copy, Trash2, Plus, Calendar, ShieldCheck, Printer } from 'lucide-react';
import { useDeck } from '../context/DeckContext';
import { getCardImageUrl } from '../utils/cardUtils';
import { generateProxyPdf } from '../utils/proxyGenerator';

interface SavedDecksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDeckbuilder: () => void;
}

export const SavedDecksModal: React.FC<SavedDecksModalProps> = ({
  isOpen,
  onClose,
  onNavigateToDeckbuilder
}) => {
  const { 
    savedDecks, 
    currentDeck, 
    loadDeck, 
    deleteSavedDeck, 
    duplicateSavedDeck, 
    saveCurrentDeck 
  } = useDeck();

  if (!isOpen) return null;

  const handleLoadDeck = (deck: any) => {
    loadDeck(deck);
    onClose();
    onNavigateToDeckbuilder();
  };

  const handleSaveActive = () => {
    saveCurrentDeck();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F17]">
          <div className="flex items-center space-x-2.5">
            <Bookmark className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Mes Decks Sauvegardés ({savedDecks.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top actions bar */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-300">
            Deck en cours : <strong className="text-white">{currentDeck.name}</strong> ({currentDeck.cards.reduce((a, b) => a + b.count, 0)}/50)
          </div>
          <button
            onClick={handleSaveActive}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Sauvegarder le Deck Actuel</span>
          </button>
        </div>

        {/* Decks List */}
        <div className="p-6 overflow-y-auto space-y-3.5">
          {savedDecks.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-30 text-amber-400" />
              <p className="text-sm font-semibold text-slate-400">Aucun deck sauvegardé pour le moment.</p>
              <p className="text-xs text-slate-500 mt-1">
                Créez votre deck dans le Deckbuilder puis cliquez sur "Sauvegarder".
              </p>
            </div>
          ) : (
            savedDecks.map((deck) => {
              const mainCount = deck.cards.reduce((a, b) => a + b.count, 0);
              const leaderUrl = getCardImageUrl(deck.leader);

              return (
                <div
                  key={deck.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl bg-[#0B0F17] border border-slate-800 hover:border-slate-700 transition-all gap-3"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    {/* Leader preview */}
                    <div className="w-12 h-16 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700 shadow-md">
                      {deck.leader ? (
                        <img
                          src={leaderUrl}
                          alt={deck.leader.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-500 text-center font-bold">
                          Pas de Leader
                        </div>
                      )}
                    </div>

                    {/* Deck info */}
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                        {deck.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-medium text-amber-400">
                          {deck.leader ? deck.leader.name : 'Sans Leader'}
                        </span>
                        <span>•</span>
                        <span className={mainCount === 50 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                          {mainCount}/50 cartes
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(deck.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <button
                      onClick={() => handleLoadDeck(deck)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-md transition-all active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Charger</span>
                    </button>

                    <button
                      onClick={() => generateProxyPdf(deck)}
                      title="Imprimer Proxies PDF"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    >
                      <Printer className="w-4 h-4 text-rose-400" />
                    </button>

                    <button
                      onClick={() => duplicateSavedDeck(deck.id)}
                      title="Dupliquer"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteSavedDeck(deck.id)}
                      title="Supprimer"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
