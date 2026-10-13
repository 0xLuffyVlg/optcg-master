import React, { useState } from 'react';
import { X, Copy, Check, FileText, Image as ImageIcon, Printer, Download, Upload, Share2, Sparkles } from 'lucide-react';
import { useDeck } from '../context/DeckContext';
import { generateOptcSimString, generateDeckUrlParam } from '../utils/cardUtils';
import { generateProxyPdf } from '../utils/proxyGenerator';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({ isOpen, onClose }) => {
  const { currentDeck, importDecklist } = useDeck();
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copiedOptcSim, setCopiedOptcSim] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfProgress, setPdfProgress] = useState({ current: 0, total: 0 });

  if (!isOpen) return null;

  const optcSimCode = generateOptcSimString(currentDeck);
  const urlParam = generateDeckUrlParam(currentDeck);
  const fullShareUrl = `${window.location.origin}/?deck=${urlParam}`;

  const handleCopyOptcSim = () => {
    navigator.clipboard.writeText(optcSimCode);
    setCopiedOptcSim(true);
    setTimeout(() => setCopiedOptcSim(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(fullShareUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!currentDeck.leader && currentDeck.cards.length === 0) {
      alert('Le deck est vide.');
      return;
    }

    try {
      setIsPdfGenerating(true);
      await generateProxyPdf(currentDeck, (current, total) => {
        setPdfProgress({ current, total });
      });
    } catch (e: any) {
      alert(e.message || 'Erreur lors de la génération du PDF');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleDoImport = () => {
    if (!importText.trim()) {
      setImportError('Veuillez coller un code OPTCSim ou une URL de deck.');
      return;
    }

    const success = importDecklist(importText);
    if (success) {
      setImportError('');
      onClose();
    } else {
      setImportError('Format non reconnu ou cartes introuvables. Vérifiez le format.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header with tabs */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F17]">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('export')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                activeTab === 'export'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Exporter & Partager
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                activeTab === 'import'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Importer un Deck
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-5">
          
          {activeTab === 'export' ? (
            <>
              {/* Quick Summary */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">{currentDeck.name}</h3>
                  <p className="text-xs text-slate-400">
                    Leader : {currentDeck.leader ? currentDeck.leader.name : 'Aucun'} • {currentDeck.cards.reduce((a, b) => a + b.count, 0)}/50 cartes
                  </p>
                </div>
                <button
                  onClick={handleDownloadPdf}
                  disabled={isPdfGenerating}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isPdfGenerating ? `PDF (${pdfProgress.current}/${pdfProgress.total})...` : 'Générer Proxies PDF'}</span>
                </button>
              </div>

              {/* Format OPTCSim */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-400" />
                    Format Simulateur (OPTCSim)
                  </label>
                  <button
                    onClick={handleCopyOptcSim}
                    className="flex items-center space-x-1 text-xs font-bold text-amber-400 hover:text-amber-300"
                  >
                    {copiedOptcSim ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedOptcSim ? 'Copié !' : 'Copier le code'}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  value={optcSimCode || 'Deck vide'}
                  rows={5}
                  className="w-full p-3 rounded-xl bg-[#0B0F17] border border-slate-800 font-mono text-xs text-slate-300 focus:outline-none focus:border-slate-700 resize-none select-all"
                />
              </div>

              {/* Share URL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-emerald-400" />
                    Lien de Partage / URL
                  </label>
                  <button
                    onClick={handleCopyUrl}
                    className="flex items-center space-x-1 text-xs font-bold text-amber-400 hover:text-amber-300"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Lien copié !' : 'Copier le lien'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value={fullShareUrl}
                  className="w-full p-2.5 rounded-xl bg-[#0B0F17] border border-slate-800 font-mono text-xs text-slate-300 focus:outline-none focus:border-slate-700 select-all"
                />
              </div>
            </>
          ) : (
            <>
              {/* Import Section */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 block">
                  Collez votre decklist (Texte OPTCSim ou Lien Egman / URL) :
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`Exemple :\n1xOP01-001\n4xOP01-004\n4xOP01-016\n...\nou collez une URL de deck`}
                  rows={8}
                  className="w-full p-3 rounded-xl bg-[#0B0F17] border border-slate-800 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 resize-none"
                />

                {importError && (
                  <p className="text-xs text-rose-400 font-medium">
                    {importError}
                  </p>
                )}

                <button
                  onClick={handleDoImport}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  <span>Charger ce Deck dans le Deckbuilder</span>
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
