// One Piece TCG Booster Box Quotas & Case Hits Data (Based on optcgquotas.com)

export interface QuotaCombo {
  id: string;
  hits: string[]; // ["AA", "SEC"], ["PL", "AA", "AA"], ["SP", "AA", "SEC"], ["HQ", "AA", "SEC"]...
  label: string;
}

export interface SetQuotaConfig {
  code: string;
  name: string;
  series: string;
  releaseStatus: 'disponible' | 'a_venir';
  combos: QuotaCombo[];
  note?: string;
  totalPacksPerBox?: number; // default 24
  totalBoxesPerCase?: number; // default 12
  srPerBox?: number; // default 7-8
}

export interface HitTypeDefinition {
  code: string;
  name: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  isHighValue?: boolean;
}

export const HIT_TYPES: Record<string, HitTypeDefinition> = {
  'AA': {
    code: 'AA',
    name: 'Alternate Art (Personnage / Event / Stage)',
    shortLabel: 'AA',
    color: 'text-purple-300',
    bgColor: 'bg-purple-950/70',
    borderColor: 'border-purple-500/50',
    description: 'Illustration alternative pleine carte d\'un personnage ou événement.'
  },
  'PL': {
    code: 'PL',
    name: 'Parallel Leader (Leader Alt Art)',
    shortLabel: 'Leader Alt',
    color: 'text-rose-300',
    bgColor: 'bg-rose-950/70',
    borderColor: 'border-rose-500/50',
    description: 'Leader en version Alternate Art (très recherché).',
    isHighValue: true
  },
  'SEC': {
    code: 'SEC',
    name: 'Secret Rare',
    shortLabel: 'SEC',
    color: 'text-amber-300',
    bgColor: 'bg-amber-950/70',
    borderColor: 'border-amber-500/50',
    description: 'Carte Secrète du booster (2 SECs par extension en général).'
  },
  'SP': {
    code: 'SP',
    name: 'Special Card (SP Rare)',
    shortLabel: 'SP',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-950/70',
    borderColor: 'border-emerald-500/50',
    description: 'Carte spéciale dorée ou argentée rééditée avec traitement foil.',
    isHighValue: true
  },
  'TR': {
    code: 'TR',
    name: 'Treasure Rare',
    shortLabel: 'TR',
    color: 'text-cyan-300',
    bgColor: 'bg-cyan-950/70',
    borderColor: 'border-cyan-500/50',
    description: 'Carte Treasure Rare ultra exclusive (1 par plusieurs cases).'
  },
  'HQ': {
    code: 'HQ',
    name: 'Oda Signature / High Quality Rare',
    shortLabel: 'Oda Sign',
    color: 'text-yellow-200',
    bgColor: 'bg-yellow-950/80',
    borderColor: 'border-yellow-400/60',
    description: 'Carte dédicacée par Eiichiro Oda.',
    isHighValue: true
  },
  'MANGA': {
    code: 'MANGA',
    name: 'Manga Rare (Super Parallel)',
    shortLabel: 'MANGA',
    color: 'text-rose-200',
    bgColor: 'bg-gradient-to-r from-rose-950 to-amber-950',
    borderColor: 'border-rose-400',
    description: 'Le hit ultime ! Planches de manga en arrière-plan (1 par 3 à 4 cases).',
    isHighValue: true
  },
  'GOLD': {
    code: 'GOLD',
    name: 'Gold Rare / 1st Anniversary Gold',
    shortLabel: 'GOLD',
    color: 'text-amber-200',
    bgColor: 'bg-amber-950/90',
    borderColor: 'border-amber-400',
    description: 'Carte dorée anniversaire ultra collector.',
    isHighValue: true
  }
};

export const SET_QUOTA_CONFIGS: SetQuotaConfig[] = [{code:"OP03",name:"Pillars of Strength",series:"OP",releaseStatus:"disponible",combos:[{id:"op03-1",hits:["AA","SEC"],label:"AA + SEC"},{id:"op03-2",hits:["PL","AA","AA"],label:"PL + AA + AA"},{id:"op03-3",hits:["AA","AA","SEC"],label:"AA + AA + SEC"},{id:"op03-4",hits:["PL","SP"],label:"PL + SP"}],note:"*Ancien format"},{code:"OP06",name:"Wings of the Captain",series:"OP",releaseStatus:"disponible",combos:[{id:"op06-1",hits:["AA","AA"],label:"AA + AA"},{id:"op06-2",hits:["AA","SEC"],label:"AA + SEC"},{id:"op06-3",hits:["PL","AA","AA"],label:"PL + AA + AA"},{id:"op06-4",hits:["PL","AA","SEC"],label:"PL + AA + SEC"},{id:"op06-5",hits:["SP","AA","SEC"],label:"SP + AA + SEC"}],note:"*Structure estimée (basée sur OP08) — AA peut être remplacé par TR ou Alt Event"},{code:"OP07",name:"500 Years in the Future",series:"OP",releaseStatus:"disponible",combos:[{id:"op07-1",hits:["AA","AA"],label:"AA + AA"},{id:"op07-2",hits:["AA","SEC"],label:"AA + SEC"},{id:"op07-3",hits:["PL","AA","AA"],label:"PL + AA + AA"},{id:"op07-4",hits:["PL","AA","SEC"],label:"PL + AA + SEC"},{id:"op07-5",hits:["SP","AA","SEC"],label:"SP + AA + SEC"}],note:"*Structure estimée (basée sur OP08) — AA peut être remplacé par TR ou Alt Event"},{code:"OP08",name:"Two Legends",series:"OP",releaseStatus:"disponible",combos:[{id:"op08-1",hits:["AA","AA"],label:"AA + AA"},{id:"op08-2",hits:["AA","SEC"],label:"AA + SEC"},{id:"op08-3",hits:["PL","AA","AA"],label:"PL + AA + AA"},{id:"op08-4",hits:["PL","AA","SEC"],label:"PL + AA + SEC"},{id:"op08-5",hits:["SP","AA","SEC"],label:"SP + AA + SEC"}],note:"*AA peut être remplacé par TR ou Alt Event"},{code:"OP09",name:"Four Emperors",series:"OP",releaseStatus:"disponible",combos:[{id:"op09-1",hits:["SP","AA","SEC"],label:"SP + AA + SEC"},{id:"op09-2",hits:["PL","AA","SEC"],label:"PL + AA + SEC"},{id:"op09-3",hits:["HQ","AA","SEC"],label:"HQ + AA + SEC"},{id:"op09-4",hits:["AA","AA"],label:"AA + AA"},{id:"op09-5",hits:["AA","SEC"],label:"AA + SEC"}],note:"*AA peut être remplacé par TR"},{code:"OP10",name:"Three Captains",series:"OP",releaseStatus:"disponible",combos:[{id:"op10-1",hits:["SP","AA","SEC"],label:"SP + AA + SEC"},{id:"op10-2",hits:["PL","AA","SEC"],label:"PL + AA + SEC"},{id:"op10-3",hits:["PL","AA","AA"],label:"PL + AA + AA"},{id:"op10-4",hits:["HQ","AA","SEC"],label:"HQ + AA + SEC"},{id:"op10-5",hits:["AA","AA"],label:"AA + AA"},{id:"op10-6",hits:["AA","SEC"],label:"AA + SEC"}],note:"*AA peut être remplacé par TR ou Alt Event"},{code:"OP11",name:"A Fist of Divine Speed",series:"OP",releaseStatus:"disponible",combos:[{id:"op11-1",hits:["SP","AA","SEC"],label:"SP + AA + SEC"},{id:"op11-2",hits:["PL","AA","SEC"],label:"PL + AA + SEC"},{id:"op11-3",hits:["PL","AA","AA"],label:"PL + AA + AA"},{id:"op11-4",hits:["HQ","AA","SEC"],label:"HQ + AA + SEC"},{id:"op11-5",hits:["AA","AA"],label:"AA + AA"},{id:"op11-6",hits:["AA","SEC"],label:"AA + SEC"}],note:"*AA peut être remplacé par TR ou Alt Event"},{code:"OP12",name:"Legacy of the Master",series:"OP",releaseStatus:"disponible",combos:[{id:"op12-1",hits:["SP","AA","SEC"],label:"SP + AA + SEC"},{id:"op12-2",hits:["PL","AA","SEC"],label:"PL + AA + SEC"},{id:"op12-3",hits:["PL","AA","AA"],label:"PL + AA + AA"},{id:"op12-4",hits:["HQ","AA","SEC"],label:"HQ + AA + SEC"},{id:"op12-5",hits:["AA","AA"],label:"AA + AA"},{id:"op12-6",hits:["AA","SEC"],label:"AA + SEC"}],note:"*AA peut être remplacé par TR ou Alt Event"},{code:"OP13",name:"The Three Brothers",series:"OP",releaseStatus:"disponible",combos:[{id:"op13-1",hits:["SP","AA","SEC"],label:"SP + AA + SEC"},{id:"op13-2",hits:["PL","AA","SEC"],label:"PL + AA + SEC"},{id:"op13-3",hits:["HQ","AA","SEC"],label:"HQ + AA + SEC"},{id:"op13-4",hits:["Don Gold","AA","AA"],label:"Don Gold + AA + AA"},{id:"op13-5",hits:["AA","AA"],label:"AA + AA"},{id:"op13-6",hits:["AA","SEC"],label:"AA + SEC"}],note:"*AA peut être remplacé par TR ou Alt Event"},{code:"OP14",name:"Elbaf",series:"OP",releaseStatus:"disponible",combos:[{id:"op14-1",hits:["SEC","AA"],label:"SEC + AA"},{id:"op14-2",hits:["SEC","AA","AA"],label:"SEC + AA + AA"},{id:"op14-3",hits:["AA","Don Gold","PL"],label:"AA + Don Gold + PL"},{id:"op14-4",hits:["SEC","AA","PL"],label:"SEC + AA + PL"},{id:"op14-5",hits:["AA","SP"],label:"AA + SP"},{id:"op14-6",hits:["SEC","AA","HQ"],label:"SEC + AA + HQ"}],note:"*AA peut être remplacé par TR ou Alt Event"},{code:"OP15",name:"Aventure sur l'Île de Kami",series:"OP",releaseStatus:"disponible",combos:[{id:"op15-1",hits:["AA","SEC"],label:"AA + SEC"},{id:"op15-2",hits:["AA","SP"],label:"AA + SP"},{id:"op15-3",hits:["AA","PL"],label:"AA + PL"},{id:"op15-4",hits:["AA","PL","SEC"],label:"AA + PL + SEC"},{id:"op15-5",hits:["AA","AA","SEC"],label:"AA + AA + SEC"},{id:"op15-6",hits:["AA","AA","Don Gold","SEC"],label:"AA + AA + DG + SEC"}],note:"*AA peut être remplacé par TR ou Alt Event"},{code:"OP16",name:"L'Heure de la Bataille Décisive",series:"OP",releaseStatus:"disponible",combos:[{id:"op16-1",hits:["AA","SEC"],label:"AA + SEC"},{id:"op16-2",hits:["AA","SP"],label:"AA + SP"},{id:"op16-3",hits:["AA","AA","SEC","Don Gold"],label:"AA + AA + SEC + DG"},{id:"op16-4",hits:["AA","AA","SEC"],label:"AA + AA + SEC"},{id:"op16-5",hits:["AA","SEC","PL"],label:"AA + SEC + PL"},{id:"op16-6",hits:["AA","PL"],label:"AA + PL"}],note:"*AA peut être remplacé par TR ou Alt Event. HQ non garanti."},{code:"EB02",name:"One Piece Film Edition",series:"EB",releaseStatus:"disponible",combos:[{id:"eb02-1",hits:["SEC","AA"],label:"SEC + AA"},{id:"eb02-2",hits:["AA","AA","SP"],label:"AA + AA + SP"},{id:"eb02-3",hits:["AA","AA","PL"],label:"AA + AA + PL"},{id:"eb02-4",hits:["AA","AA","HQ"],label:"AA + AA + HQ"},{id:"eb02-5",hits:["AA","AA"],label:"AA + AA"}],note:"*Pas de TR"},{code:"EB03",name:"Extra Booster Vol.3",series:"EB",releaseStatus:"disponible",combos:[{id:"eb03-1",hits:["AA","SEC"],label:"AA + SEC"},{id:"eb03-2",hits:["AA","AA","Don Gold"],label:"AA + AA + Don Gold"},{id:"eb03-3",hits:["PL","AA","SEC"],label:"PL + AA + SEC"},{id:"eb03-4",hits:["SP","PL","AA","AA"],label:"SP + PL + AA + AA"},{id:"eb03-5",hits:["AA","AA","SEC"],label:"AA + AA + SEC"},{id:"eb03-6",hits:["HQ","AA","SEC"],label:"HQ + AA + SEC"}],note:"*Pas de TR"},{code:"PRB01",name:"Premium Booster -THE BEST-",series:"PRB",releaseStatus:"disponible",combos:[{id:"prb01-1",hits:["AA","AA","Don Foil","Don Foil","SEC","SEC","FA","FA"],label:"2 AA + 2 Don Foil + 2 SEC + 2 FA"},{id:"prb01-2",hits:["AA","AA","Don Foil","Don Gold","SEC","SEC","FA","FA"],label:"2 AA + 1 Don Foil + 1 Don Gold + 2 SEC + 2 FA"},{id:"prb01-3",hits:["AA","Don Foil","Don Foil","SEC","SEC","PL","FA","FA"],label:"1 AA + 2 Don Foil + 2 SEC + 1 PL + 2 FA"},{id:"prb01-4",hits:["AA","Don Foil","Don Gold","SEC","SEC","FA","FA"],label:"1 AA + 1 Don Foil + 1 Don Gold + 2 SEC + 2 FA"},{id:"prb01-5",hits:["AA","Don Foil","Don Foil","SEC","SEC","HQ","FA","FA"],label:"1 AA + 2 Don Foil + 2 SEC + 1 HQ + 2 FA"},{id:"prb01-6",hits:["AA","Don Foil","God Pack","SEC","SEC","FA","FA"],label:"1 AA + 1 Don Foil + 1 God Pack + 2 SEC + 2 FA"}],note:"*Pas de TR"},{code:"PRB02",name:"Premium Booster -THE BEST- Vol.2",series:"PRB",releaseStatus:"disponible",combos:[{id:"prb02-1",hits:["AA","AA","Don Foil","Don Foil","SEC","SEC"],label:"2 AA + 2 Don Foil + 2 SEC"},{id:"prb02-2",hits:["AA","AA","Don Foil","Don Gold","SEC","SEC"],label:"2 AA + 1 Don Foil + 1 Don Gold + 2 SEC"},{id:"prb02-3",hits:["AA","AA","Don Foil","Don Foil","SEC","SEC","SP"],label:"2 AA + 2 Don Foil + 2 SEC + 1 SP"},{id:"prb02-4",hits:["AA","AA","Don Foil","Don Foil","SEC","SEC","HQ"],label:"2 AA + 2 Don Foil + 2 SEC + 1 HQ"},{id:"prb02-5",hits:["AA","AA","Don Foil","God Pack","SEC","SEC"],label:"2 AA + 1 Don Foil + 1 God Pack + 2 SEC"}],note:"*Pas de TR, Event remplace SP"}];
