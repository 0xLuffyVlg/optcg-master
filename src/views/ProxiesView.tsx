import React, { useState } from 'react';
import { Printer, Download, Sparkles, AlertCircle, Layers, CheckCircle2, Bookmark } from 'lucide-react';
import { useDeck } from '../context/DeckContext';
import { generateProxyPdf } from '../utils/proxyGenerator';
import { getCardImageUrl } from '../utils/cardUtils';

interface ProxiesViewProps {
  onOpenSavedDecks: () => void;
  onNavigateToDeckbuilder: () => void;
}

export const ProxiesView: React.FC<ProxiesViewProps> = ({
  onOpenSavedDecks,
  onNavigateToDeckbuilder
}) => {
  const { currentDeck } = useDeck();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const totalCards = (currentDeck.leader ? 1 : 0) + currentDeck.cards.reduce((acc, item) => acc + item.count, 0);
  const totalPages = Math.ceil(totalCards / 9);

  const handleDownload = async () => {
    if (totalCards === 0) {
      alert('Veuillez ajouter des cartes à votre deck avant de générer un PDF de proxies.');
      return;
    }

    try {
      setIsGenerating(true);
      await generateProxyPdf(currentDeck, (current, total) => {
        setProgress({ current, total });
      });
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la génération du PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/90 to-[#0B0F17] border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
            <Printer className="w-3.5 h-3.5" />
            <span>GÉNÉRATEUR DE PROXIES HD PRÊTES À IMPRIMER</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Imprimez vos Decks One Piece TCG en Format Réel (A4)
          </h1>
          <p className="text-sm text-slate-300">
            Générez des planches PDF de haute qualité (9 cartes par page au format standard 63mm × 88mm) avec des traits de découpe millimétrés pour vos sessions d'entraînement.
          </p>
        </div>
      </div>

      {/* Control Card & Actions */}
      <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-5">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-400" />
              Deck Sélectionné : <span className="text-amber-400">{currentDeck.name}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Leader : {currentDeck.leader ? currentDeck.leader.name : 'Aucun'} • {totalCards} cartes au total ({totalPages} {totalPages > 1 ? 'pages A4' : 'page A4'})
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenSavedDecks}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Changer de Deck</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isGenerating || totalCards === 0}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>
                {isGenerating 
                  ? `Création en cours (${progress.current}/${progress.total} cartes)...` 
                  : `Télécharger le PDF (${totalPages} pages)`}
              </span>
            </button>
          </div>
        </div>

        {/* Print Settings Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#0B0F17] border border-slate-800 text-xs text-slate-300">
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Format Papier</span>
            <strong className="text-white">A4 Portrait (210 × 297 mm)</strong>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Disposition</span>
            <strong className="text-white">Grille 3 × 3 (9 cartes par page)</strong>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Taille Carte Standard</span>
            <strong className="text-white">63 mm × 88 mm (100% échelle)</strong>
          </div>
        </div>

      </div>

      {/* Visual Preview Grid of Cards */}
      <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white">Aperçu des cartes qui seront incluses :</h3>

        {totalCards === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <p className="text-xs">Aucune carte dans le deck actuel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
            {/* Leader */}
            {currentDeck.leader && (
              <div className="space-y-1 text-center">
                <div className="aspect-[5/7] rounded-lg overflow-hidden border-2 border-amber-400 shadow-md bg-slate-900">
                  <img
                    src={getCardImageUrl(currentDeck.leader)}
                    alt={currentDeck.leader.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[9px] font-bold text-amber-400 block truncate">
                  1x Leader
                </span>
              </div>
            )}

            {/* Cards */}
            {currentDeck.cards.map((item) => (
              <div key={item.card.card_code} className="space-y-1 text-center">
                <div className="aspect-[5/7] rounded-lg overflow-hidden border border-slate-700 shadow-md bg-slate-900">
                  <img
                    src={getCardImageUrl(item.card, item.selectedArtwork)}
                    alt={item.card.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[9px] font-bold text-slate-300 block truncate">
                  {item.count}x {item.card.card_code}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
