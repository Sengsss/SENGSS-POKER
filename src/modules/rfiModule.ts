import type { TrainingModule } from '../data/types';
import { allHandClasses } from '../lib/combos';
import { rfiScenarios } from '../data/ranges/rfi';

export const rfiModule: TrainingModule = {
  id: 'rfi',
  name: 'RFI 开局',
  scenarios: rfiScenarios,
  // RFI 是主动开局决策，任何手牌都可能遇到，发牌池 = 全部 169 类
  dealPool: () => allHandClasses(),
};
