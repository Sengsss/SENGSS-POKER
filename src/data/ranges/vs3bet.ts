import type { HandClass, Position, Scenario, Strategy } from '../types';
import { expand } from '../../lib/handNotation';
import { rfiScenarios } from './rfi';

/**
 * 示例应对 3-bet 范围，同样是粗略估计（非 solver 精解），用于打通"第二个模块"的架构验证。
 * 正式训练前应替换为第 10 节所述来源导出的数据。
 */

/** 英雄在该位置的开局范围（供 dealPool 使用：只有开了局才会遇到被 3-bet 的决策） */
function openingRange(pos: Position): HandClass[] {
  const scenario = rfiScenarios.find((s) => s.heroPos === pos);
  if (!scenario) return [];
  return Object.entries(scenario.ranges)
    .filter(([, strategy]) => (strategy.raise ?? 0) > 0)
    .map(([hand]) => hand);
}

interface RangeEntry {
  tokens: string[];
  strategy: Strategy;
}

function buildRanges(entries: RangeEntry[]): Record<HandClass, Strategy> {
  const ranges: Record<HandClass, Strategy> = {};
  for (const { tokens, strategy } of entries) {
    for (const hand of expand(tokens)) ranges[hand] = strategy;
  }
  return ranges;
}

interface Vs3betConfig {
  heroPos: Position;
  villainPos: Position;
  jam: string[];
  call: string[];
  mixedJamCall: Record<HandClass, number>; // jam 频率，其余为 call
  mixedCallFold: Record<HandClass, number>; // call 频率，其余为 fold
}

const CONFIGS: Vs3betConfig[] = [
  {
    heroPos: 'BTN',
    villainPos: 'SB',
    jam: ['QQ+', 'AKs', 'AKo'],
    call: ['TT', 'JJ', 'AQs', 'AJs', 'KQs', 'A5s-A2s'],
    mixedJamCall: { '99': 0.3 },
    mixedCallFold: { ATs: 0.6, KJs: 0.5 },
  },
  {
    heroPos: 'BTN',
    villainPos: 'BB',
    jam: ['QQ+', 'AKs', 'AKo'],
    call: ['TT', 'JJ', 'AQs', 'AJs', 'KQs', 'A5s-A2s', 'KQo'],
    mixedJamCall: { '99': 0.25 },
    mixedCallFold: { AQo: 0.6, KJs: 0.6 },
  },
  {
    heroPos: 'CO',
    villainPos: 'BTN',
    jam: ['KK+', 'AKs'],
    call: ['QQ', 'JJ', 'TT', 'AQs+', 'AKo'],
    mixedJamCall: { QQ: 0.3 },
    mixedCallFold: { '99': 0.5, AJs: 0.5 },
  },
  {
    heroPos: 'UTG',
    villainPos: 'BB',
    jam: ['KK+', 'AKs'],
    call: ['QQ', 'JJ', 'AQs', 'AKo'],
    mixedJamCall: { QQ: 0.4 },
    mixedCallFold: { TT: 0.5, AJs: 0.4 },
  },
];

function buildScenario(config: Vs3betConfig): Scenario {
  const { heroPos, villainPos, jam, call, mixedJamCall, mixedCallFold } = config;
  const ranges = buildRanges([
    { tokens: jam, strategy: { jam: 1 } },
    { tokens: call, strategy: { call: 1 } },
  ]);
  for (const [hand, freq] of Object.entries(mixedJamCall)) {
    ranges[hand] = { jam: freq, call: 1 - freq };
  }
  for (const [hand, freq] of Object.entries(mixedCallFold)) {
    ranges[hand] = { call: freq, fold: 1 - freq };
  }

  return {
    id: `vs3bet-${heroPos.toLowerCase()}-vs-${villainPos.toLowerCase()}`,
    heroPos,
    villainPos,
    prompt: `你在 ${heroPos} 开局，${villainPos} 3-bet`,
    subPrompt: '~40bb · 你的 4-bet 即全下',
    actions: ['fold', 'call', 'jam'],
    ranges,
    tip: `${heroPos} 开局遭遇 ${villainPos} 3-bet 的示例应对范围（非 solver 精解，替换为实际数据源以获得准确训练）。`,
  };
}

export const vs3betScenarios: Scenario[] = CONFIGS.map(buildScenario);

/** 面对 3-bet 是被动场景：只有英雄开局范围内的手牌才可能走到这一步 */
export function vs3betDealPool(scenario: Scenario): HandClass[] {
  return openingRange(scenario.heroPos);
}
