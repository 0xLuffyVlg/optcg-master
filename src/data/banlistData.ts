export interface BanlistEntry {
  cardCode: string;
  name: string;
  status: 'BANNED' | 'RESTRICTED_TO_1';
  format: 'GLOBAL' | 'JP' | 'BOTH';
  effectiveDate: string;
  reason: string;
}

export const BANLIST_DATA: BanlistEntry[] = [
  {
    cardCode: 'OP02-099',
    name: 'Sakazuki (Leader)',
    status: 'BANNED',
    format: 'BOTH',
    effectiveDate: '2024-03-01',
    reason: 'Ultra-dominant avec réduction de coût et pioche trop consistante.'
  },
  {
    cardCode: 'ST10-001',
    name: 'Trafalgar Law (Leader)',
    status: 'BANNED',
    format: 'BOTH',
    effectiveDate: '2024-09-01',
    reason: 'Effet de retrait continu et tempo excessif en format compétitif.'
  },
  {
    cardCode: 'OP05-041',
    name: 'Sakazuki (Leader)',
    status: 'BANNED',
    format: 'BOTH',
    effectiveDate: '2024-03-01',
    reason: 'Banni sous toutes ses versions officielles.'
  },
  {
    cardCode: 'OP06-116',
    name: 'Reject',
    status: 'BANNED',
    format: 'BOTH',
    effectiveDate: '2024-04-01',
    reason: 'Finition de partie impossible à contrer pour l’adversaire.'
  },
  {
    cardCode: 'OP02-052',
    name: 'Cabaji',
    status: 'BANNED',
    format: 'BOTH',
    effectiveDate: '2023-04-01',
    reason: 'Boucle infinie de meule dans Nami Leader.'
  },
  {
    cardCode: 'ST06-015',
    name: 'Great Eruption',
    status: 'BANNED',
    format: 'BOTH',
    effectiveDate: '2024-04-01',
    reason: 'Réduction de coût à 0 et pioche abusive.'
  },
  {
    cardCode: 'OP03-098',
    name: 'Enies Lobby',
    status: 'BANNED',
    format: 'BOTH',
    effectiveDate: '2024-09-01',
    reason: 'Réduction continue de coût sans ressource.'
  },
  {
    cardCode: 'OP01-016',
    name: 'Nami (Character)',
    status: 'RESTRICTED_TO_1',
    format: 'BOTH',
    effectiveDate: '2023-09-01',
    reason: 'Tutoriel Rouge trop rapide et consistant.'
  },
  {
    cardCode: 'OP02-004',
    name: 'Edward.Newgate (Leader)',
    status: 'RESTRICTED_TO_1',
    format: 'BOTH',
    effectiveDate: '2023-09-01',
    reason: 'Points de vie et puissance de base excessifs.'
  }
];

// Cards with special Bandai rule allowing any number of copies in the deck (up to 50)
export const UNLIMITED_COPIES_CODES = new Set<string>([
  'ST01-012', // Pacifista
  'OP02-107', // Pacifista
  'OP07-064'  // Pacifista
]);

export function isCardBanned(cardCode?: string): BanlistEntry | undefined {
  if (!cardCode) return undefined;
  const clean = cardCode.trim().toUpperCase().split('_')[0].split('-R')[0];
  return BANLIST_DATA.find(e => e.cardCode === clean && e.status === 'BANNED');
}

export function isCardRestricted(cardCode?: string): BanlistEntry | undefined {
  if (!cardCode) return undefined;
  const clean = cardCode.trim().toUpperCase().split('_')[0].split('-R')[0];
  return BANLIST_DATA.find(e => e.cardCode === clean && e.status === 'RESTRICTED_TO_1');
}

export function isCardUnlimited(cardCode?: string): boolean {
  if (!cardCode) return false;
  const clean = cardCode.trim().toUpperCase().split('_')[0].split('-R')[0];
  return UNLIMITED_COPIES_CODES.has(clean);
}
