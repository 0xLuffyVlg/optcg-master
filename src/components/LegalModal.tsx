import React, { useState } from 'react';
import { X, Shield, FileText, Lock, Scale, ExternalLink } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'mentions' | 'privacy' | 'disclaimer';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'mentions'
}) => {
  const [activeTab, setActiveTab] = useState<'mentions' | 'privacy' | 'disclaimer'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[75] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto cursor-pointer animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#0B0F17] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh] cursor-default"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-[#111827] to-[#0B0F17] border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Informations Légales & Confidentialité
              </h2>
              <p className="text-[11px] text-slate-400">
                Transparence, mentions légales et protection des données (optcg-master.fr)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-5 pt-2 gap-2 text-xs font-bold flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('mentions')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'mentions'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Mentions Légales</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('disclaimer')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'disclaimer'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Non-Affiliation Bandai</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'privacy'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Confidentialité & RGPD</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          {activeTab === 'mentions' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <h3 className="font-bold text-white text-sm">1. Éditeur de la Plateforme</h3>
                <p>
                  <strong>Site Web :</strong> <a href="https://optcg-master.fr" className="text-amber-400 hover:underline">https://optcg-master.fr</a><br />
                  <strong>Nature du projet :</strong> Projet communautaire bénévole à but non lucratif développé pour la communauté francophone des joueurs de One Piece Card Game.<br />
                  <strong>Contact :</strong> contact@optcg-master.fr
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <h3 className="font-bold text-white text-sm">2. Hébergement & Infrastructure</h3>
                <p>
                  <strong>Hébergeur Cloud :</strong> Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.<br />
                  <strong>Gestionnaire de Nom de Domaine :</strong> IONOS SE, Elgendorfer Str. 57, 56410 Montabaur, Allemagne.<br />
                  <strong>Base de données Cloud :</strong> Supabase Inc., San Francisco, CA, USA.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <h3 className="font-bold text-white text-sm">3. Propriété Intellectuelle</h3>
                <p>
                  Le code source, l'interface utilisateur, les algorithmes de calcul de quotas, les simulations de decks et les graphismes originaux de l'application sont la propriété exclusive d'OPTCG Master.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'disclaimer' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
                <h3 className="font-black text-amber-400 text-sm flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>Clause de Non-Affiliation Officielle</span>
                </h3>
                <p className="leading-relaxed">
                  <strong>OPTCG Master n’est pas affilié à Bandai, Shueisha ou One Piece.</strong>
                </p>
                <p className="text-slate-300">
                  OPTCG Master est une plateforme communautaire et éducative indépendante dédiée aux passionnés du jeu de cartes à collectionner <em>One Piece Card Game (OPTCG)</em>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <h3 className="font-bold text-white text-sm">Détenteurs des Droits d'Auteur</h3>
                <p>
                  Toutes les marques, logos, illustrations de cartes, textes de règles et noms de personnages One Piece sont la propriété exclusive de leurs ayants droit légaux :
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-400 pt-1">
                  <li><strong>© Eiichiro Oda / Shueisha</strong></li>
                  <li><strong>© Toei Animation Co., Ltd.</strong></li>
                  <li><strong>© Bandai Co., Ltd. / Bandai Namco</strong></li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <h3 className="font-bold text-white text-sm">Données & Cotes de Marché</h3>
                <p>
                  Les résultats de tournois et méta decks sont indexés à des fins statistiques à partir de données publiques (OnePieceTopDecks, Limitless TCG, OPTCGSim). Les prix de cartes sont indicatifs et proviennent d'estimations de marché (Cardmarket / TCGPlayer).
                </p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <h3 className="font-bold text-white text-sm">1. Collecte et Usage des Données</h3>
                <p>
                  OPTCG Master respecte votre vie privée et applique le principe de minimisation des données (conformité RGPD) :
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-400 pt-1">
                  <li><strong>Mode Invité :</strong> Vos cartes, decks et favoris sont stockés exclusivement dans la mémoire locale de votre navigateur (<code className="text-amber-400">localStorage</code>). Aucune donnée n'est envoyée à des serveurs tiers.</li>
                  <li><strong>Connexion Google / Supabase :</strong> Si vous choisissez de synchroniser vos données entre vos appareils (PC et mobile), seule votre adresse e-mail Google et votre identifiant unique sont utilisés pour sécuriser l'accès à votre collection cloud privée.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <h3 className="font-bold text-white text-sm">2. Absence de Traceurs Publicitaires</h3>
                <p>
                  OPTCG Master n'intègre aucun cookie publicitaire intrusif, aucun réseau de revente de données personnelles et aucun profilage commercial.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <h3 className="font-bold text-white text-sm">3. Suppression et Droit d'Accès</h3>
                <p>
                  Conformément au RGPD, vous disposez d'un droit d'accès et de suppression complète de votre compte et de vos données. Une simple déconnexion ou vidage de votre cache supprime vos données locales. Pour toute demande de purge de votre profil Cloud : <span className="text-amber-400">support@optcg-master.fr</span>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#0B0F17] via-slate-900 to-[#0B0F17] border-t border-slate-800 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-slate-500">
            Dernière mise à jour : 02 Septembre 2026
          </span>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow transition-all"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
