import type { Strategy, Action } from '../data/types';

export interface GradeResult {
  correct: boolean;      // 选中的动作 GTO 频率 > 0
  isMixed: boolean;      // 该手牌有 >1 个非零动作
  chosenFreq: number;    // 玩家所选动作的 GTO 频率
  bestAction: Action;    // 频率最高的动作
  strategy: Strategy;    // 原始分布，供 UI 显示
}

export function grade(strategy: Strategy, choice: Action): GradeResult {
  const chosenFreq = strategy[choice] ?? 0;
  const entries = Object.entries(strategy) as [Action, number][];
  const nonZero = entries.filter(([, f]) => f > 0);
  const bestAction = [...entries].sort((a, b) => b[1] - a[1])[0][0];
  return {
    correct: chosenFreq > 0,
    isMixed: nonZero.length > 1,
    chosenFreq,
    bestAction,
    strategy,
  };
}
