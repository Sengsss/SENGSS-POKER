import { describe, expect, it } from 'vitest';
import { bbDefendScenarios } from './bbDefend';

describe('bbDefend 场景数据', () => {
  it('每个场景都有 fold/call/raise 三个动作，heroPos 恒为 BB', () => {
    for (const scenario of bbDefendScenarios) {
      expect(scenario.actions).toEqual(['fold', 'call', 'raise']);
      expect(scenario.heroPos).toBe('BB');
    }
  });

  it('覆盖全部 6 个开局位置', () => {
    const villains = bbDefendScenarios.map((s) => s.villainPos).sort();
    expect(villains).toEqual(['BTN', 'CO', 'HJ', 'MP', 'SB', 'UTG'].sort());
  });

  it('策略频率之和不超过 1', () => {
    for (const scenario of bbDefendScenarios) {
      for (const strategy of Object.values(scenario.ranges)) {
        const sum = Object.values(strategy).reduce((a, b) => a + (b ?? 0), 0);
        expect(sum).toBeLessThanOrEqual(1.0001);
      }
    }
  });

  it('越晚位置开局，大盲防守（非纯弃牌）的手牌类越多', () => {
    const countDefendHands = (villainPos: string) =>
      Object.keys(bbDefendScenarios.find((s) => s.villainPos === villainPos)!.ranges).length;
    expect(countDefendHands('BTN')).toBeGreaterThan(countDefendHands('UTG'));
  });
});
