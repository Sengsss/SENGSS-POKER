import type { TrainingModule } from '../data/types';
import { allHandClasses } from '../lib/combos';
import { bbDefendScenarios } from '../data/ranges/bbDefend';

export const bbDefendModule: TrainingModule = {
  id: 'bbDefend',
  name: '大盲防守',
  scenarios: bbDefendScenarios,
  // BB 未开局，任何手牌都可能遇到防守决策，发牌池 = 全部 169 类
  dealPool: () => allHandClasses(),
};
