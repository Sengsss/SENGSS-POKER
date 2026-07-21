import type { HandClass, TrainingModule } from '../data/types';
import type { MissedHand } from '../store/useStats';

/** 把任意训练模块包装成"只发错题"的版本，供错题复习模式使用 */
export function buildReviewModule(base: TrainingModule, missed: MissedHand[]): TrainingModule {
  const scenarioIds = new Set(base.scenarios.map((s) => s.id));
  const missedByScenario = new Map<string, Set<HandClass>>();
  for (const m of missed) {
    if (!scenarioIds.has(m.scenarioId)) continue;
    if (!missedByScenario.has(m.scenarioId)) missedByScenario.set(m.scenarioId, new Set());
    missedByScenario.get(m.scenarioId)!.add(m.hand);
  }

  const scenarios = base.scenarios.filter((s) => missedByScenario.has(s.id));

  return {
    id: `${base.id}-review`,
    name: `${base.name}（错题复习）`,
    scenarios,
    dealPool: (scenario) => [...(missedByScenario.get(scenario.id) ?? [])],
  };
}
