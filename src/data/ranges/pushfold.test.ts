import { describe, expect, it } from 'vitest';
import { pushFoldScenarios } from './pushfold';

describe('pushfold 场景数据', () => {
  it('每个场景只有 fold/jam 两个动作', () => {
    for (const scenario of pushFoldScenarios) {
      expect(scenario.actions).toEqual(['fold', 'jam']);
    }
  });

  it('覆盖 15bb 和 8bb 两个筹码深度，各 6 个位置', () => {
    expect(pushFoldScenarios).toHaveLength(12);
    const depths15 = pushFoldScenarios.filter((s) => s.subPrompt?.includes('全下') && s.prompt.includes('15bb'));
    const depths8 = pushFoldScenarios.filter((s) => s.prompt.includes('8bb'));
    expect(depths15).toHaveLength(6);
    expect(depths8).toHaveLength(6);
  });

  it('同一位置下，筹码越浅全下范围越宽', () => {
    const at15 = pushFoldScenarios.find((s) => s.id === 'pushfold-15bb-utg')!;
    const at8 = pushFoldScenarios.find((s) => s.id === 'pushfold-8bb-utg')!;
    expect(Object.keys(at8.ranges).length).toBeGreaterThan(Object.keys(at15.ranges).length);
  });

  it('8bb SB 全下范围覆盖全部 169 类', () => {
    const sb8 = pushFoldScenarios.find((s) => s.id === 'pushfold-8bb-sb')!;
    expect(Object.keys(sb8.ranges)).toHaveLength(169);
  });

  it('策略频率之和不超过 1', () => {
    for (const scenario of pushFoldScenarios) {
      for (const strategy of Object.values(scenario.ranges)) {
        const sum = Object.values(strategy).reduce((a, b) => a + (b ?? 0), 0);
        expect(sum).toBeLessThanOrEqual(1.0001);
      }
    }
  });
});
