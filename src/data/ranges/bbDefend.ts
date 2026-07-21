import type { HandClass, Position, Scenario, Strategy } from '../types';
import { expand } from '../../lib/handNotation';

/**
 * 示例大盲防守范围（~40bb MTT，粗略估计，非 solver 精解）。
 * 大盲是最容易被高手剥削的位置：越晚位置开局，防守范围应越宽。
 * 正式训练前应替换为第 10 节所述来源导出的数据。
 */

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

interface BbDefendConfig {
  villainPos: Position;
  raise: string[];
  call: string[];
  mixedRaiseCall: Record<HandClass, number>; // 3-bet 频率，其余 call
  mixedCallFold: Record<HandClass, number>; // call 频率，其余 fold
}

const CONFIGS: BbDefendConfig[] = [
  {
    villainPos: 'UTG',
    raise: ['QQ+', 'AKs', 'AKo'],
    call: ['77-JJ', 'ATs+', 'KQs', 'AQo'],
    mixedRaiseCall: { JJ: 0.3 },
    mixedCallFold: { A9s: 0.5, KJo: 0.4 },
  },
  {
    villainPos: 'MP',
    raise: ['JJ+', 'AKs', 'AKo', 'AQs'],
    call: ['66+', 'A9s+', 'KTs+', 'QJs', 'ATo+', 'KQo'],
    mixedRaiseCall: { TT: 0.3 },
    mixedCallFold: { A8s: 0.5, K9s: 0.5 },
  },
  {
    villainPos: 'HJ',
    raise: ['TT+', 'AQs+', 'AKo'],
    call: ['44+', 'A2s+', 'K9s+', 'Q9s+', 'J9s+', 'T9s', '98s', '87s', 'ATo+', 'KJo+'],
    mixedRaiseCall: { '99': 0.3 },
    mixedCallFold: { A9o: 0.5, K8s: 0.5 },
  },
  {
    villainPos: 'CO',
    raise: ['99+', 'AJs+', 'KQs', 'AQo+'],
    call: ['22+', 'A2s+', 'K5s+', 'Q7s+', 'J7s+', 'T7s+', '97s+', '86s+', '75s+', '64s', 'A9o+', 'KTo+', 'QJo'],
    mixedRaiseCall: { '88': 0.3 },
    mixedCallFold: { A8o: 0.5, K9o: 0.5 },
  },
  {
    villainPos: 'BTN',
    raise: ['88+', 'ATs+', 'KJs+', 'AQo+'],
    call: [
      '22+', 'A2s+', 'K2s+', 'Q4s+', 'J6s+', 'T6s+', '96s+', '85s+', '74s+', '64s+', '53s+',
      'A2o+', 'K7o+', 'Q9o+', 'J9o+', 'T9o',
    ],
    mixedRaiseCall: { '77': 0.3 },
    mixedCallFold: { K6o: 0.5, Q8o: 0.5 },
  },
  {
    villainPos: 'SB',
    raise: ['77+', 'A9s+', 'KTs+', 'AJo+'],
    call: [
      '22+', 'A2s+', 'K2s+', 'Q6s+', 'J7s+', 'T7s+', '97s+', '86s+', '75s+', '64s+', '53s+',
      'A5o+', 'K8o+', 'QTo+', 'JTo',
    ],
    mixedRaiseCall: { '66': 0.3 },
    mixedCallFold: { K7o: 0.5, Q9o: 0.5 },
  },
];

function buildScenario(config: BbDefendConfig): Scenario {
  const { villainPos, raise, call, mixedRaiseCall, mixedCallFold } = config;
  const ranges = buildRanges([
    { tokens: raise, strategy: { raise: 1 } },
    { tokens: call, strategy: { call: 1 } },
  ]);
  for (const [hand, freq] of Object.entries(mixedRaiseCall)) {
    ranges[hand] = { raise: freq, call: 1 - freq };
  }
  for (const [hand, freq] of Object.entries(mixedCallFold)) {
    ranges[hand] = { call: freq, fold: 1 - freq };
  }

  return {
    id: `bbdefend-vs-${villainPos.toLowerCase()}`,
    heroPos: 'BB',
    villainPos,
    prompt: `你在 BB，${villainPos} 开局加注`,
    subPrompt: '~40bb · 是否防守',
    actions: ['fold', 'call', 'raise'],
    ranges,
    tip: `大盲面对 ${villainPos} 开局的示例防守范围（非 solver 精解，替换为实际数据源以获得准确训练）。`,
  };
}

export const bbDefendScenarios: Scenario[] = CONFIGS.map(buildScenario);
