import type { HandClass, Position, Scenario, Strategy } from '../types';
import { expand } from '../../lib/handNotation';
import { allHandClasses } from '../../lib/combos';

/**
 * 示例 Push/Fold 全下表（15bb 以下，粗略估计，非 solver 精解）。
 * 筹码越浅、位置越晚，全下范围越宽 —— 这是本模块要练的核心直觉。
 * 正式训练前应替换为第 10 节所述来源导出的 Nash 表。
 */

interface RangeEntry {
  tokens: string[];
  strategy: Strategy;
}

function buildRanges(entries: RangeEntry[]): Record<HandClass, Strategy> {
  const ranges: Record<HandClass, Strategy> = {};
  for (const { tokens, strategy } of entries) {
    const hands = tokens.includes('ALL') ? allHandClasses() : expand(tokens);
    for (const hand of hands) ranges[hand] = strategy;
  }
  return ranges;
}

interface PushFoldConfig {
  stackBB: number;
  pos: Position;
  jam: string[];
  mixedJamFold: Record<HandClass, number>; // jam 频率，其余 fold
}

const CONFIGS: PushFoldConfig[] = [
  // 15bb —— 仍有一定弃牌股权，范围偏紧
  { stackBB: 15, pos: 'UTG', jam: ['55+', 'A8s+', 'ATo+', 'KJs+', 'KQo', 'QJs'], mixedJamFold: { '44': 0.4, A7s: 0.4 } },
  { stackBB: 15, pos: 'MP', jam: ['44+', 'A6s+', 'A9o+', 'KTs+', 'KQo', 'QJs', 'JTs'], mixedJamFold: { '33': 0.4, A5s: 0.4 } },
  { stackBB: 15, pos: 'HJ', jam: ['33+', 'A4s+', 'A8o+', 'K9s+', 'KQo', 'QTs+', 'JTs', 'T9s'], mixedJamFold: { '22': 0.5, A3s: 0.5 } },
  { stackBB: 15, pos: 'CO', jam: ['22+', 'A2s+', 'A6o+', 'K7s+', 'KTo+', 'Q8s+', 'J8s+', 'T8s+', '98s'], mixedJamFold: { A5o: 0.5, K6s: 0.5 } },
  { stackBB: 15, pos: 'BTN', jam: ['22+', 'A2s+', 'A2o+', 'K2s+', 'K7o+', 'Q6s+', 'J7s+', 'T7s+', '97s+', '87s'], mixedJamFold: { K6o: 0.5, Q5s: 0.5 } },
  { stackBB: 15, pos: 'SB', jam: ['22+', 'A2s+', 'A2o+', 'K2s+', 'K5o+', 'Q4s+', 'J6s+', 'T6s+', '96s+', '86s+', '75s'], mixedJamFold: { K4o: 0.5, Q3s: 0.5 } },

  // 8bb —— 接近纯全下博弈，范围明显更宽
  { stackBB: 8, pos: 'UTG', jam: ['22+', 'A2s+', 'A7o+', 'K9s+', 'KTo+', 'QTs+', 'JTs', 'T9s'], mixedJamFold: { A6o: 0.5, K8s: 0.5 } },
  { stackBB: 8, pos: 'MP', jam: ['22+', 'A2s+', 'A5o+', 'K7s+', 'K9o+', 'Q8s+', 'J9s+', 'T8s+', '98s'], mixedJamFold: { A4o: 0.5, K6s: 0.5 } },
  { stackBB: 8, pos: 'HJ', jam: ['22+', 'A2s+', 'A2o+', 'K4s+', 'K7o+', 'Q6s+', 'J7s+', 'T7s+', '97s+', '87s'], mixedJamFold: { K6o: 0.5, Q5s: 0.5 } },
  { stackBB: 8, pos: 'CO', jam: ['22+', 'A2s+', 'A2o+', 'K2s+', 'K3o+', 'Q3s+', 'J5s+', 'T5s+', '95s+', '85s+', '74s'], mixedJamFold: { K2o: 0.5, Q2s: 0.5 } },
  { stackBB: 8, pos: 'BTN', jam: ['22+', 'A2s+', 'A2o+', 'K2s+', 'K2o+', 'Q2s+', 'J2s+', 'T3s+', '93s+', '83s+', '73s+', '63s', '52s'], mixedJamFold: { J8o: 0.5, '42s': 0.5 } },
  { stackBB: 8, pos: 'SB', jam: ['ALL'], mixedJamFold: {} },
];

function buildScenario(config: PushFoldConfig): Scenario {
  const { stackBB, pos, jam, mixedJamFold } = config;
  const ranges = buildRanges([{ tokens: jam, strategy: { jam: 1 } }]);
  for (const [hand, freq] of Object.entries(mixedJamFold)) {
    ranges[hand] = { jam: freq, fold: 1 - freq };
  }

  return {
    id: `pushfold-${stackBB}bb-${pos.toLowerCase()}`,
    heroPos: pos,
    prompt: `你在 ${pos}，筹码 ${stackBB}bb，轮到你率先行动`,
    subPrompt: 'Push/Fold · 是否全下',
    actions: ['fold', 'jam'],
    ranges,
    tip: `${stackBB}bb 深度、${pos} 位置的示例全下范围（非 solver 精解，替换为实际 Nash 表以获得准确训练）。`,
  };
}

export const pushFoldScenarios: Scenario[] = CONFIGS.map(buildScenario);
