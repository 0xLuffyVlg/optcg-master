import fs from 'fs';
import { computeMetaForSet, availableSetGroups, getCardByCode } from '../src/data/dataProvider.js';
import { computeLeaderVariants } from '../src/services/leaderVariantsService.js';

console.log('Available sets:', availableSetGroups);
