export interface OnePieceAvatar {
  id: string;
  name: string;
  title: string;
  badge: string;
  category: 'all' | 'mugiwaras' | 'yonko' | 'marine' | 'legendes' | 'corsaires' | 'waifus';
  imageUrl: string;
  color: string;
}

export const AVATAR_CATEGORIES = [
  { id: 'all', label: 'Tous', icon: '🏴‍☠️' },
  { id: 'mugiwaras', label: 'Mugiwaras', icon: '👒' },
  { id: 'yonko', label: 'Yonko & Empereurs', icon: '⭐' },
  { id: 'marine', label: 'Marine & Gouv', icon: '⚓' },
  { id: 'legendes', label: 'Légendes', icon: '👑' },
  { id: 'corsaires', label: 'Corsaires & Supernovas', icon: '⚔️' },
  { id: 'waifus', label: 'Héroïnes', icon: '🌸' }
] as const;

export const ONE_PIECE_AVATARS: OnePieceAvatar[] = [
  // --- MUGIWARAS ---
  {
    id: 'luffy-nika',
    name: 'Monkey D. Luffy',
    title: 'Dieu du Soleil Nika (Gear 5)',
    badge: 'Yonko ⭐',
    category: 'mugiwaras',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/eb02-p083.webp',
    color: 'from-amber-500 to-yellow-400'
  },
  {
    id: 'luffy-classic',
    name: 'Monkey D. Luffy',
    title: 'Capitaine des Chapeaux de Paille',
    badge: 'Capitaine',
    category: 'mugiwaras',
    imageUrl: 'https://scalpeurs.com/img/cards-jp/op01-p001.webp',
    color: 'from-red-600 to-amber-500'
  },
  {
    id: 'luffy-manga',
    name: 'Monkey D. Luffy',
    title: 'L\'Éveil du Guerrier Libérateur',
    badge: 'Manga Rare 🔥',
    category: 'mugiwaras',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/op09-p156.webp',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'zoro',
    name: 'Roronoa Zoro',
    title: 'Roi de l\'Enfer (Enma)',
    badge: 'Bras Droit ⚔️',
    category: 'mugiwaras',
    imageUrl: 'https://scalpeurs.com/img/cards-jp/op01-p032.webp',
    color: 'from-emerald-600 to-teal-500'
  },
  {
    id: 'zoro-enma',
    name: 'Roronoa Zoro',
    title: 'Tranchant Suprême',
    badge: 'Grand Épéiste',
    category: 'mugiwaras',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/op11-p156.webp',
    color: 'from-green-600 to-emerald-700'
  },
  {
    id: 'sanji',
    name: 'Sanji Vinsmoke',
    title: 'Ifrit Jambe / Flammes Célestes',
    badge: 'Cuisinier d\'Élite',
    category: 'mugiwaras',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/op09-p152.webp',
    color: 'from-blue-600 to-indigo-500'
  },
  {
    id: 'nami',
    name: 'Nami',
    title: 'La Chatte Voleuse & Zeus',
    badge: 'Navigatrice ⚡',
    category: 'mugiwaras',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/prb01-p006.webp',
    color: 'from-amber-400 to-orange-500'
  },
  {
    id: 'robin',
    name: 'Nico Robin',
    title: 'L\'Enfant du Démon / Fleur Fleur',
    badge: 'Archéologue 📖',
    category: 'mugiwaras',
    imageUrl: 'https://scalpeurs.com/img/cards-jp/op01-p023.webp',
    color: 'from-purple-600 to-pink-500'
  },
  {
    id: 'chopper',
    name: 'Tony Tony Chopper',
    title: 'Monster Point & Soins Miracles',
    badge: 'Docteur 🌸',
    category: 'mugiwaras',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/prb01-p001.webp',
    color: 'from-pink-500 to-rose-400'
  },
  {
    id: 'usopp-sogeking',
    name: 'Sogeking / God Usopp',
    title: 'Le Roi des Tireurs d\'Élite',
    badge: 'Sniper King 🎯',
    category: 'mugiwaras',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/prb01-p106.webp',
    color: 'from-amber-600 to-yellow-600'
  },
  {
    id: 'brook',
    name: 'Brook',
    title: 'Soul King / Le Musicien d\'Os',
    badge: 'Musicien 🎻',
    category: 'mugiwaras',
    imageUrl: 'https://scalpeurs.com/img/cards-jp/op06-p110.webp',
    color: 'from-purple-700 to-violet-900'
  },
  {
    id: 'jinbe',
    name: 'Jinbe',
    title: 'Paladin des Mers / Karaté Homme-Poisson',
    badge: 'Timonier 🌊',
    category: 'mugiwaras',
    imageUrl: 'https://scalpeurs.com/img/cards-jp/op02-p083.webp',
    color: 'from-blue-700 to-cyan-600'
  },

  // --- YONKO & EMPEREURS ---
  {
    id: 'shanks',
    name: 'Shanks le Roux',
    title: 'Capitaine de l\'Équipage du Roux',
    badge: 'Yonko 👑',
    category: 'yonko',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/prb01-p031.webp',
    color: 'from-red-700 to-rose-600'
  },
  {
    id: 'whitebeard',
    name: 'Edward Newgate',
    title: 'Barbe Blanche / L\'Homme le plus Fort',
    badge: 'Légende ⚓',
    category: 'yonko',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/st15-p001.webp',
    color: 'from-red-600 to-slate-700'
  },
  {
    id: 'kaido',
    name: 'Kaido aux Cent Bêtes',
    title: 'La Créature la plus Puissante',
    badge: 'Gouverneur Général 🐉',
    category: 'yonko',
    imageUrl: 'https://scalpeurs.com/img/cards-jp/op01-p119.webp',
    color: 'from-purple-900 to-indigo-900'
  },
  {
    id: 'big-mom',
    name: 'Charlotte Linlin',
    title: 'Big Mom / Reine de Totto Land',
    badge: 'Impératrice 🎂',
    category: 'yonko',
    imageUrl: 'https://scalpeurs.com/img/cards-jp/op03-p137.webp',
    color: 'from-pink-600 to-yellow-500'
  },
  {
    id: 'blackbeard',
    name: 'Marshall D. Teach',
    title: 'Barbe Noire / Double Pouvoir Suprême',
    badge: 'Amiral Ténébreux 🌑',
    category: 'yonko',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/op09-p116.webp',
    color: 'from-slate-900 to-purple-950'
  },
  {
    id: 'buggy',
    name: 'Buggy le Clown',
    title: 'Le Génie Bouffon / Cross Guild Leader',
    badge: 'Yonko 😂',
    category: 'yonko',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/op09-p065.webp',
    color: 'from-blue-500 to-red-500'
  },

  // --- MARINE & GOUVERNEMENT MONDIAL ---
  {
    id: 'garp',
    name: 'Monkey D. Garp',
    title: 'Le Héros de la Marine / Galaxy Impact',
    badge: 'Vice-Amiral Légendaire 👊',
    category: 'marine',
    imageUrl: 'https://scalpeurs.com/img/cards-jp/op02-p003.webp',
    color: 'from-slate-700 to-blue-900'
  },
  {
    id: 'akainu',
    name: 'Sakazuki (Akainu)',
    title: 'Amiral en Chef / Justice Absolue',
    badge: 'Amiral Suprême 🌋',
    category: 'marine',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/prb01-p052.webp',
    color: 'from-red-800 to-rose-900'
  },
  {
    id: 'aokiji',
    name: 'Kuzan (Aokiji)',
    title: 'L\'Ère Glaciaire / Justice Paresseuse',
    badge: 'Ice Age ❄️',
    category: 'marine',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/prb01-p062.webp',
    color: 'from-cyan-600 to-blue-800'
  },
  {
    id: 'kizaru',
    name: 'Borsalino (Kizaru)',
    title: 'Vitesse de la Lumière / Pika Pika',
    badge: 'Amiral Lumineux ⚡',
    category: 'marine',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/prb01-p057.webp',
    color: 'from-yellow-500 to-amber-600'
  },
  {
    id: 'fujitora',
    name: 'Issho (Fujitora)',
    title: 'Contrôleur de Gravité / Justice Morale',
    badge: 'Amiral Aveugle 🌌',
    category: 'marine',
    imageUrl: 'https://scalpeurs.com/img/cards-jp/op04-p023.webp',
    color: 'from-purple-800 to-indigo-900'
  },
  {
    id: 'rob-lucci',
    name: 'Rob Lucci (CP0)',
    title: 'Guépard de Sang Froid / Justice Sombre',
    badge: 'Maître du Rokushiki 🐆',
    category: 'marine',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/eb02-p095.webp',
    color: 'from-slate-900 to-zinc-700'
  },

  // --- LÉGENDES & FIGURES HISTORIQUES ---
  {
    id: 'roger',
    name: 'Gol D. Roger',
    title: 'Le Roi des Pirates / Kamusari',
    badge: 'Seigneur des Pirates 👑',
    category: 'legendes',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/op09-p149.webp',
    color: 'from-amber-400 to-red-600'
  },
  {
    id: 'rayleigh',
    name: 'Silvers Rayleigh',
    title: 'Le Roi Sombre / Maître du Haki',
    badge: 'Légende Vivante ⚡',
    category: 'legendes',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/prb02-p120.webp',
    color: 'from-slate-600 to-amber-700'
  },
  {
    id: 'xebec',
    name: 'Rocks D. Xebec',
    title: 'Le Fléau du Siècle / God Valley',
    badge: 'Légende Oubliée ☠️',
    category: 'legendes',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/op17-p154.webp',
    color: 'from-slate-900 to-purple-950'
  },
  {
    id: 'ace',
    name: 'Portgas D. Ace',
    title: 'Aux Poings Ardents / Dai Enkai',
    badge: 'Commandant Feu 🔥',
    category: 'legendes',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/prb01-p038.webp',
    color: 'from-orange-600 to-amber-500'
  },
  {
    id: 'sabo',
    name: 'Sabo',
    title: 'Chef d\'État-Major / Flammes Royales',
    badge: 'Empereur Révolutionnaire 🔥',
    category: 'legendes',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/prb01-p126.webp',
    color: 'from-yellow-500 to-orange-600'
  },
  {
    id: 'dragon',
    name: 'Monkey D. Dragon',
    title: 'Le Révolutionnaire le plus Recherché',
    badge: 'Commandant Suprême 🌪️',
    category: 'legendes',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/eb02-p091.webp',
    color: 'from-emerald-800 to-slate-900'
  },
  {
    id: 'oden',
    name: 'Kozuki Oden',
    title: 'Seigneur de Kuri / Togen Totsuka',
    badge: 'Héros de Wano 🗡️',
    category: 'legendes',
    imageUrl: 'https://scalpeurs.com/img/cards-jp/op01-p039.webp',
    color: 'from-red-600 to-yellow-600'
  },

  // --- CORSAIRES & SUPERNOVAS ---
  {
    id: 'law',
    name: 'Trafalgar D. Water Law',
    title: 'Chirurgien de la Mort / K-ROOM',
    badge: 'Supernova 🩺',
    category: 'corsaires',
    imageUrl: 'https://scalpeurs.com/img/cards-jp/op01-p003.webp',
    color: 'from-cyan-600 to-blue-700'
  },
  {
    id: 'kid',
    name: 'Eustass "Captain" Kid',
    title: 'Punk Rotten / Damned Punk',
    badge: 'Supernova Magnétique 🧲',
    category: 'corsaires',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/prb01-p022.webp',
    color: 'from-rose-700 to-red-800'
  },
  {
    id: 'mihawk',
    name: 'Dracule Mihawk',
    title: 'Oeil de Faucon / Plus Grand Épéiste',
    badge: 'Grand Corsaire 🦅',
    category: 'corsaires',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/prb01-p027.webp',
    color: 'from-slate-800 to-purple-900'
  },
  {
    id: 'doflamingo',
    name: 'Donquixote Doflamingo',
    title: 'Le Démon Céleste / Fils Divin',
    badge: 'Joker 🦩',
    category: 'corsaires',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/st17-p001.webp',
    color: 'from-pink-500 to-rose-600'
  },
  {
    id: 'crocodile',
    name: 'Sir Crocodile',
    title: 'Roi du Désert / Sable Desséchant',
    badge: 'Cross Guild 🐊',
    category: 'corsaires',
    imageUrl: 'https://scalpeurs.com/img/cards-jp/op01-p078.webp',
    color: 'from-amber-700 to-yellow-600'
  },
  {
    id: 'katakuri',
    name: 'Charlotte Katakuri',
    title: 'Général Sucré Invincible / Vision du Futur',
    badge: 'Mochi Mochi 🍩',
    category: 'corsaires',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/st20-p001.webp',
    color: 'from-fuchsia-700 to-pink-600'
  },
  {
    id: 'moria',
    name: 'Gecko Moria',
    title: 'Seigneur de Thriller Bark / Kage Kage',
    badge: 'Ombres Nocturnes 🦇',
    category: 'corsaires',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/prb01-p243.webp',
    color: 'from-purple-900 to-slate-900'
  },

  // --- HÉROÏNES / WAIFUS ---
  {
    id: 'boa-hancock',
    name: 'Boa Hancock',
    title: 'Princesse Serpent / Impératrice Pirate',
    badge: 'Reine d\'Amazon Lily 🐍',
    category: 'waifus',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/eb02-p093.webp',
    color: 'from-purple-500 to-rose-500'
  },
  {
    id: 'yamato',
    name: 'Yamato',
    title: 'Héritier d\'Oden / Gardien Divin',
    badge: 'Guerrier Céleste 🐺',
    category: 'waifus',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/prb01-p034.webp',
    color: 'from-teal-400 to-emerald-600'
  },
  {
    id: 'bonney',
    name: 'Jewelry Bonney',
    title: 'La Gloutonne / Âge Distorsion',
    badge: 'Supernova Libre 🍕',
    category: 'waifus',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/eb02-p092.webp',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'uta',
    name: 'Uta',
    title: 'La Diva Suprême / Uta Uta no Mi',
    badge: 'Voix du Monde 🎵',
    category: 'waifus',
    imageUrl: 'https://scalpeurs.com/img/cards-jp/op02-p151.webp',
    color: 'from-red-500 to-pink-500'
  },
  {
    id: 'pudding',
    name: 'Charlotte Pudding',
    title: 'Trois Yeux / Mémoire Douce',
    badge: 'Chocolatière 🍫',
    category: 'waifus',
    imageUrl: 'https://scalpeurs.com/img/cards-jp/op08-p070.webp',
    color: 'from-amber-400 to-rose-400'
  },
  {
    id: 'perona',
    name: 'Perona',
    title: 'Princesse Fantôme / Negative Hollow',
    badge: 'Reine des Esprits 👻',
    category: 'waifus',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/op14-p150.webp',
    color: 'from-pink-600 to-purple-600'
  },
  {
    id: 'reiju',
    name: 'Vinsmoke Reiju',
    title: 'Poison Pink / Germa 66',
    badge: 'Princesse Germa 🧪',
    category: 'waifus',
    imageUrl: 'https://scalpeurs.com/img/cards-fr/eb02-p089.webp',
    color: 'from-pink-500 to-indigo-600'
  }
];

export function getAvatarById(id?: string): OnePieceAvatar {
  return ONE_PIECE_AVATARS.find(a => a.id === id) || ONE_PIECE_AVATARS[0];
}
