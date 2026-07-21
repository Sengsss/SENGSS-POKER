import type { HandClass, Position, Scenario, Strategy } from '../types';
import { expand } from '../../lib/handNotation';

/**
 * 示例开局范围，按 ~40bb MTT 深度粗略估计，用于打通训练链路。
 * 非 solver 精解 —— 正式训练前应替换为第 10 节所述来源导出的数据。
 */
function pureRange(tokens: string[]): Record<HandClass, Strategy> {
  const ranges: Record<HandClass, Strategy> = {};
  for (const hand of expand(tokens)) ranges[hand] = { raise: 1 };
  return ranges;
}

function withMixed(
  base: Record<HandClass, Strategy>,
  mixed: Record<HandClass, number>,
): Record<HandClass, Strategy> {
  const ranges = { ...base };
  for (const [hand, freq] of Object.entries(mixed)) {
    ranges[hand] = { raise: freq, fold: 1 - freq };
  }
  return ranges;
}

interface RfiConfig {
  pos: Position;
  pure: string[];
  mixed: Record<HandClass, number>;
}

const CONFIGS: RfiConfig[] = [
  { pos: 'UTG', pure: ['77+', 'AJs+', 'KQs', 'AQo+'], mixed: { '66': 0.4, ATs: 0.4, KJs: 0.4, AJo: 0.4 } },
  { pos: 'MP', pure: ['66+', 'ATs+', 'KJs+', 'QJs', 'AJo+', 'KQo'], mixed: { '55': 0.5, A9s: 0.5, KTs: 0.5, ATo: 0.5 } },
  { pos: 'HJ', pure: ['44+', 'A9s+', 'KTs+', 'QTs+', 'JTs', 'ATo+', 'KJo'], mixed: { '33': 0.5, A8s: 0.5, K9s: 0.5, QJo: 0.5 } },
  { pos: 'CO', pure: ['22+', 'A2s+', 'K9s+', 'Q9s+', 'J9s+', 'T9s', '98s', 'A9o+', 'KTo+', 'QJo'], mixed: { A7o: 0.5, K9o: 0.5 } },
  { pos: 'BTN', pure: ['22+', 'A2s+', 'K5s+', 'Q7s+', 'J7s+', 'T7s+', '97s+', '86s+', '75s+', 'A2o+', 'K8o+', 'Q9o+', 'J9o+', 'T8o'], mixed: { '64s': 0.5, K7o: 0.5, Q8o: 0.5 } },
  { pos: 'SB', pure: ['22+', 'A2s+', 'K6s+', 'Q8s+', 'J8s+', 'T8s+', '97s+', '86s', 'A5o+', 'K9o+', 'QTo+', 'JTo'], mixed: { '75s': 0.5, K8o: 0.5 } },
];

const POSITION_LABEL: Record<Position, string> = {
  UTG: 'UTG', MP: 'MP', HJ: 'HJ', CO: 'CO', BTN: 'BTN', SB: 'SB', BB: 'BB',
};

export const rfiScenarios: Scenario[] = CONFIGS.map(({ pos, pure, mixed }) => ({
  id: `rfi-${pos.toLowerCase()}`,
  heroPos: pos,
  prompt: `你在 ${POSITION_LABEL[pos]}，轮到你率先行动`,
  subPrompt: '~40bb · 是否开局加注',
  actions: ['fold', 'raise'],
  ranges: withMixed(pureRange(pure), mixed),
  tip: `${POSITION_LABEL[pos]} 位置的示例开局范围（非 solver 精解，替换为实际数据源以获得准确训练）。`,
}));
