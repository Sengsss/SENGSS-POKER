import type { TrainingModule } from '../data/types';
import { allHandClasses } from '../lib/combos';
import { pushFoldScenarios } from '../data/ranges/pushfold';

export const pushfoldModule: TrainingModule = {
  id: 'pushfold',
  name: 'Push/Fold 短码',
  scenarios: pushFoldScenarios,
  // 全下决策是主动开局，任何手牌都可能遇到，发牌池 = 全部 169 类
  dealPool: () => allHandClasses(),
};
