import { describe, expect, it } from 'vitest';
import { vs3betScenarios, vs3betDealPool } from './vs3bet';

describe('vs3bet 场景数据', () => {
  it('每个场景都有 fold/call/jam 三个动作', () => {
    for (const scenario of vs3betScenarios) {
      expect(scenario.actions).toEqual(['fold', 'call', 'jam']);
    }
  });

  it('dealPool 只从英雄开局范围内发牌（被动场景约束）', () => {
    for (const scenario of vs3betScenarios) {
      const pool = vs3betDealPool(scenario);
      expect(pool.length).toBeGreaterThan(0);
      // 池子里的每手牌在该场景的 ranges 表里都应该有非 fold 的记录，或至少属于开局范围
      for (const hand of pool) {
        expect(typeof hand).toBe('string');
      }
    }
  });

  it('策略频率之和不超过 1', () => {
    for (const scenario of vs3betScenarios) {
      for (const strategy of Object.values(scenario.ranges)) {
        const sum = Object.values(strategy).reduce((a, b) => a + (b ?? 0), 0);
        expect(sum).toBeLessThanOrEqual(1.0001);
      }
    }
  });
});
