import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  Sparkles, 
  Calculator, 
  HelpCircle, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw,
  Flame,
  Info,
  Crown,
  Trophy,
  ArrowRight,
  PackageCheck,
  Check,
  X,
  Plus,
  Minus,
  Layers,
  Sparkle
} from 'lucide-react';
import { 
  SET_QUOTA_CONFIGS, 
  HIT_TYPES, 
  SetQuotaConfig, 
  QuotaCombo, 
  HitTypeDefinition 
} from '../data/quotasData';
import { ScalpeursHeroBanner } from '../components/ScalpeursHeroBanner';

export const QuotasView: React.FC = () => {
  const [selectedSetCode, setSelectedSetCode] = useState<string>('OP17');
  const [pulledHits, setPulledHits] = useState<string[]>([]);
  const [openedPacksCount, setOpenedPacksCount] = useState<number>(0);
  
  // Case Tracker (12 boxes)
  const [caseBoxesOpened, setCaseBoxesOpened] = useState<number>(0);
  const [caseSecPulled, setCaseSecPulled] = useState<number>(0);
  const [casePlPulled, setCasePlPulled] = useState<number>(0);
  const [caseSpPulled, setCaseSpPulled] = useState<number>(0);
  const [caseMangaPulled, setCaseMangaPulled] = useState<number>(0);

  // Current active set configuration
  const currentSet = useMemo(() => {
    return SET_QUOTA_CONFIGS.find(s => s.code.toUpperCase() === selectedSetCode.toUpperCase()) || SET_QUOTA_CONFIGS[0];
  }, [selectedSetCode]);

  // Handle adding a hit
  const handleAddHit = (hitCode: string) => {
    setPulledHits(prev => [...prev, hitCode]);
    setOpenedPacksCount(prev => Math.min(24, Math.max(prev + 1, prev)));
  };

  // Handle removing a hit
  const handleRemoveHit = (indexToRemove: number) => {
    setPulledHits(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Reset Box
  const handleResetBox = () => {
    setPulledHits([]);
    setOpenedPacksCount(0);
  };

  // Reset Case Tracker
  const handleResetCase = () => {
    setCaseBoxesOpened(0);
    setCaseSecPulled(0);
    setCasePlPulled(0);
    setCaseSpPulled(0);
    setCaseMangaPulled(0);
  };

  // Count pulled hits by code
  const pulledCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const h of pulledHits) {
      counts[h] = (counts[h] || 0) + 1;
    }
    return counts;
  }, [pulledHits]);

  // Evaluate each combo from currentSet against pulled hits
  const evaluatedCombos = useMemo(() => {
    return currentSet.combos.map(combo => {
      // Count required hits in this combo
      const requiredCounts: Record<string, number> = {};
      for (const h of combo.hits) {
        requiredCounts[h] = (requiredCounts[h] || 0) + 1;
      }

      // Check if pulledHits exceed required counts for any hit type
      let isEliminated = false;
      for (const [hitType, count] of Object.entries(pulledCounts)) {
        if (hitType === 'SR') continue; // SRs don't eliminate main hit combos
        const allowed = requiredCounts[hitType] || 0;
        if (count > allowed) {
          isEliminated = true;
          break;
        }
      }

      // Check if this combo is fully completed
      let isCompleted = true;
      for (const [hitType, reqCount] of Object.entries(requiredCounts)) {
        const pulled = pulledCounts[hitType] || 0;
        if (pulled < reqCount) {
          isCompleted = false;
          break;
        }
      }

      // Status: 'completed' | 'possible' | 'eliminated'
      const status: 'completed' | 'possible' | 'eliminated' = isCompleted
        ? 'completed'
        : isEliminated
        ? 'eliminated'
        : 'possible';

      return {
        ...combo,
        requiredCounts,
        status
      };
    });
  }, [currentSet, pulledCounts]);

  // Remaining possible combos count
  const possibleCombosCount = evaluatedCombos.filter(c => c.status === 'possible' || c.status === 'completed').length;

  // Analysis Advice & Next Hit Forecast
  const forecast = useMemo(() => {
    const mainHitsCount = pulledHits.filter(h => h !== 'SR').length;

    if (mainHitsCount === 0) {
      return {
        title: 'Boîte Neuve (2 à 3 Hits Garantis)',
        message: 'Vous n\'avez encore tiré aucun hit majeur. La boîte contient 2 Hits garantis (AA, SEC ou Leader Parallèle) et une chance d\'un 3ème Hit (SP ou Manga Rare) !',
        color: 'border-blue-500/50 bg-blue-500/10 text-blue-300'
      };
    }

    if (mainHitsCount === 1) {
      return {
        title: '1 Hit Tiré — Au moins 1 Hit Restant Garanti !',
        message: 'Il reste au minimum 1 Hit garanti dans les boosters restants (Forte chance de SEC ou deuxième AA, et possibilité de 3ème Hit bonus).',
        color: 'border-amber-500/50 bg-amber-500/10 text-amber-300'
      };
    }

    if (mainHitsCount === 2) {
      const hasSpOrManga = pulledHits.includes('SP') || pulledHits.includes('MANGA') || pulledHits.includes('HQ');
      if (hasSpOrManga) {
        return {
          title: '2 Hits Tirés dont SP/Manga — Boîte Potentiellement à 3 Hits !',
          message: 'Une boîte contenant une SP ou une Manga est très souvent une boîte à 3 Hits (Possibilité d\'un 3ème Hit dans les boosters restants).',
          color: 'border-purple-500/50 bg-purple-500/10 text-purple-300'
        };
      }
      return {
        title: '2 Hits Tirés — Quota Standard Atteint',
        message: 'Le quota standard de 2 Hits est atteint. Si la boîte est une « 3-Hit Box », le 3ème Hit peut être une SP, un Leader Alt ou une Manga !',
        color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
      };
    }

    return {
      title: '3 Hits Tirés — Boîte Complète (God Box / 3-Hit Box) !',
      message: 'Félicitations ! Vous avez ouvert une boîte à 3 Hits. Tous les hits majeurs de cette display ont été tirés.',
      color: 'border-rose-500/50 bg-rose-500/10 text-rose-300'
    };
  }, [pulledHits]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Scalpeurs 3D Conveyor Belt Living Hero Banner */}
      <ScalpeursHeroBanner
        title="Quotas de Boîtes & Estimation des Hits"
        code={selectedSetCode}
        breadcrumb="Quotas & Probabilités › Displays & Cases One Piece TCG"
        totalCards={SET_QUOTA_CONFIGS.length}
        totalLabel="extensions"
        subBadges={
          <>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-bold">{currentSet.name}</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-bold">Estimation temps réel des hits restants</span>
          </>
        }
      >
        {/* Main Filter Arena (À cheval sur la bordure de la bannière : à moitié dedans, à moitié dehors 50/50) */}
        <div className="p-3 sm:p-4 rounded-2xl bg-[#090D15]/98 backdrop-blur-2xl border border-slate-700/80 shadow-[0_16px_50px_rgba(0,0,0,0.95)] ring-1 ring-white/10 space-y-2.5 relative z-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-amber-400" />
              Sélectionner l'Extension ({selectedSetCode} — {currentSet.name})
            </span>
            <span className="text-[11px] text-emerald-400 font-bold">
              {currentSet.releaseStatus === 'disponible' ? '✓ Disponible' : '⌛ À venir'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
            {SET_QUOTA_CONFIGS.map((set) => {
              const isSelected = selectedSetCode.toUpperCase() === set.code.toUpperCase();
              return (
                <button
                  key={set.code}
                  onClick={() => {
                    setSelectedSetCode(set.code);
                    handleResetBox();
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap flex-shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/30 scale-105'
                      : 'bg-[#141824] border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {set.code}
                </button>
              );
            })}
          </div>

          {currentSet.note && (
            <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800">
              ℹ️ {currentSet.note}
            </p>
          )}
        </div>
      </ScalpeursHeroBanner>

      {/* Spacer so the quotas arena starts cleanly below the 50% overlapping filter bar */}
      <div className="pt-16 sm:pt-20" />

      {/* Main Quotas Arena (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Box Opener & Pulled Hits (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Hit Selector Pad */}
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Cliquer pour ajouter un Hit tiré dans la Boîte
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Appuyez sur le type de carte tirée pour recalculer les quotas restants.
                </p>
              </div>

              <button
                onClick={handleResetBox}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700 active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser</span>
              </button>
            </div>

            {/* Hit Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.values(HIT_TYPES).map(hit => (
                <button
                  key={hit.code}
                  onClick={() => handleAddHit(hit.code)}
                  className={`p-3 rounded-xl border ${hit.borderColor} ${hit.bgColor} hover:scale-[1.03] active:scale-95 transition-all text-left flex flex-col justify-between space-y-1 shadow-md`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-black ${hit.color}`}>{hit.code}</span>
                    <Plus className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="text-[11px] font-bold text-white leading-tight truncate">
                    {hit.shortLabel}
                  </span>
                </button>
              ))}
            </div>

            {/* Pulled Hits Tray */}
            <div className="pt-3 border-t border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">
                  Hits Tirés dans cette Boîte ({pulledHits.length}) :
                </span>
                <span className="text-slate-500 text-[11px]">
                  Cliquez sur un hit pour le retirer
                </span>
              </div>

              {pulledHits.length === 0 ? (
                <div className="py-6 text-center rounded-xl bg-[#0B0F17] border border-dashed border-slate-800 text-xs text-slate-500">
                  Aucun hit tiré pour le moment. Cliquez sur les boutons ci-dessus pour commencer !
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {pulledHits.map((hitCode, idx) => {
                    const hitDef = HIT_TYPES[hitCode] || {
                      code: hitCode,
                      name: hitCode,
                      color: 'text-white',
                      bgColor: 'bg-slate-800',
                      borderColor: 'border-slate-700'
                    };
                    return (
                      <button
                        key={`${hitCode}-${idx}`}
                        onClick={() => handleRemoveHit(idx)}
                        className={`group px-3 py-1.5 rounded-xl border ${hitDef.borderColor} ${hitDef.bgColor} flex items-center space-x-2 transition-all hover:border-rose-500 shadow-md`}
                        title="Cliquez pour retirer ce hit"
                      >
                        <span className={`text-xs font-black ${hitDef.color}`}>{hitCode}</span>
                        <span className="text-[11px] font-bold text-slate-300">{hitDef.name}</span>
                        <X className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Real-Time Advice & Forecast Card */}
          <div className={`p-4 rounded-2xl border ${forecast.color} shadow-lg space-y-1.5`}>
            <div className="flex items-center space-x-2">
              <Sparkle className="w-4 h-4 animate-pulse" />
              <h4 className="text-xs font-black tracking-wide uppercase">{forecast.title}</h4>
            </div>
            <p className="text-xs leading-relaxed">{forecast.message}</p>
          </div>

        </div>

        {/* Right Column: Evaluated Combos List (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Combos Possibles de la Boîte
              </h3>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                {possibleCombosCount} / {evaluatedCombos.length} possibles
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Chaque boîte de {selectedSetCode} correspond à l'un des patterns officiels suivants :
            </p>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {evaluatedCombos.map(combo => {
                const isPossible = combo.status === 'possible';
                const isCompleted = combo.status === 'completed';
                const isEliminated = combo.status === 'eliminated';

                return (
                  <div
                    key={combo.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isCompleted
                        ? 'border-emerald-500/80 bg-emerald-950/30 shadow-md shadow-emerald-950/20'
                        : isPossible
                        ? 'border-slate-700 bg-slate-900/80 hover:border-amber-500/50'
                        : 'border-slate-800/40 bg-slate-950/40 opacity-40 grayscale'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {combo.hits.map((h, i) => {
                          const def = HIT_TYPES[h];
                          return (
                            <span
                              key={i}
                              className={`px-2 py-0.5 rounded text-[11px] font-black border ${
                                def ? `${def.bgColor} ${def.borderColor} ${def.color}` : 'bg-slate-800 text-white'
                              }`}
                            >
                              {h}
                            </span>
                          );
                        })}
                      </div>
                      <span className="text-xs font-bold text-slate-300 block">
                        {combo.label}
                      </span>
                    </div>

                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black">
                          <Check className="w-3 h-3" /> Validé
                        </span>
                      ) : isPossible ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-bold">
                          Possible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold">
                          <X className="w-3 h-3" /> Éliminé
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

      {/* Case Tracker (12 Displays) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-amber-400" />
              Suivi de Case Scellée (12 Boîtes)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Suivez l'ouverture d'un carton scellé (Case de 12 boîtes) pour savoir quelles raretés restent à sortir.
            </p>
          </div>

          <button
            onClick={handleResetCase}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser la Case</span>
          </button>
        </div>

        {/* Case Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          
          {/* Boîtes ouvertes */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400">Boîtes Ouvertes</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-white">{caseBoxesOpened} / 12</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCaseBoxesOpened(p => Math.max(0, p - 1))}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center"
                >
                  -
                </button>
                <button
                  onClick={() => setCaseBoxesOpened(p => Math.min(12, p + 1))}
                  className="w-6 h-6 rounded bg-amber-500 text-black font-black text-xs flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* SECs */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-amber-400">Secret Rares (SEC)</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-amber-300">{caseSecPulled} / 4</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCaseSecPulled(p => Math.max(0, p - 1))}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center"
                >
                  -
                </button>
                <button
                  onClick={() => setCaseSecPulled(p => Math.min(4, p + 1))}
                  className="w-6 h-6 rounded bg-amber-500 text-black font-black text-xs flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Parallel Leaders */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-rose-400">Leaders Alt (PL)</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-rose-300">{casePlPulled} / 2</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCasePlPulled(p => Math.max(0, p - 1))}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center"
                >
                  -
                </button>
                <button
                  onClick={() => setCasePlPulled(p => Math.min(2, p + 1))}
                  className="w-6 h-6 rounded bg-amber-500 text-black font-black text-xs flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* SP Cards */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-emerald-400">Special Cards (SP)</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-emerald-300">{caseSpPulled} / 2</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCaseSpPulled(p => Math.max(0, p - 1))}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center"
                >
                  -
                </button>
                <button
                  onClick={() => setCaseSpPulled(p => Math.min(2, p + 1))}
                  className="w-6 h-6 rounded bg-amber-500 text-black font-black text-xs flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Manga Rare */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-rose-300">Manga Rare (1 / 3-4 cases)</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-rose-400">{caseMangaPulled}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCaseMangaPulled(p => Math.max(0, p - 1))}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center"
                >
                  -
                </button>
                <button
                  onClick={() => setCaseMangaPulled(p => p + 1)}
                  className="w-6 h-6 rounded bg-rose-500 text-white font-black text-xs flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
