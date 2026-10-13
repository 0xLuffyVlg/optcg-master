import fs from 'fs';
import { Card } from '../src/types';
import { allCards, allTournaments, getCardByCode } from '../src/data/dataProvider';
import { computeLeaderVariants } from '../src/services/leaderVariantsService';

const rocksLeader = allCards.find(c => c.card_code === 'OP17-039');
if (rocksLeader) {
  const variants = computeLeaderVariants(rocksLeader, 'OP17');
  console.log(`Computed ${variants.length} variants for ${rocksLeader.name}:`);
  variants.slice(0, 5).forEach((v, idx) => {
    console.log(`\n--- Variant #${idx + 1}: ${v.name} ---`);
    console.log(`TotalCardsCount: ${v.totalCardsCount}`);
    console.log(`AllCards length: ${v.allCards.length}`);
    console.log(`Characters: ${v.characters.length}, Events: ${v.events.length}, Stages: ${v.stages.length}`);
    console.log('Sample cards:', v.allCards.slice(0, 3).map(c => `${c.count}x ${c.card.name}`));
  });
} else {
  console.log('Leader not found');
}
