import type { TrainingModule } from '../data/types';
import { rfiModule } from './rfiModule';
import { vs3betModule } from './vs3betModule';
import { bbDefendModule } from './bbDefendModule';
import { pushfoldModule } from './pushfoldModule';

export const modules: TrainingModule[] = [rfiModule, vs3betModule, bbDefendModule, pushfoldModule];
