import type { TrainingModule } from '../data/types';
import { vs3betScenarios, vs3betDealPool } from '../data/ranges/vs3bet';

export const vs3betModule: TrainingModule = {
  id: 'vs3bet',
  name: '面对 3-bet',
  scenarios: vs3betScenarios,
  dealPool: vs3betDealPool,
};
