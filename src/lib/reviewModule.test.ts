import { describe, expect, it } from 'vitest';
import { buildReviewModule } from './reviewModule';
import type { TrainingModule } from '../data/types';
import type { MissedHand } from '../store/useStats';

const baseModule: TrainingModule = {
  id: 'demo',
  name: 'Demo',
  scenarios: [
    { id: 's1', heroPos: 'UTG', prompt: 'p1', actions: ['fold', 'raise'], ranges: {}, tip: 't1' },
    { id: 's2', heroPos: 'BTN', prompt: 'p2', actions: ['fold', 'raise'], ranges: {}, tip: 't2' },
  ],
  dealPool: () => ['AA', 'KK'],
};

function missed(scenarioId: string, hand: string): MissedHand {
  return { scenarioId, hand, chosen: 'fold', strategy: { raise: 1 }, timestamp: Date.now() };
}

describe('buildReviewModule', () => {
  it('只保留有错题的场景', () => {
    const review = buildReviewModule(baseModule, [missed('s1', 'AA')]);
    expect(review.scenarios).toHaveLength(1);
    expect(review.scenarios[0].id).toBe('s1');
  });

  it('dealPool 只发该场景的错题手牌', () => {
    const review = buildReviewModule(baseModule, [missed('s1', 'AA'), missed('s1', 'KK'), missed('s2', 'QQ')]);
    const pool = review.dealPool(review.scenarios.find((s) => s.id === 's1')!);
    expect(pool.sort()).toEqual(['AA', 'KK']);
  });

  it('忽略不属于该模块的错题记录', () => {
    const review = buildReviewModule(baseModule, [missed('other-scenario', 'AA')]);
    expect(review.scenarios).toHaveLength(0);
  });

  it('没有错题时场景列表为空', () => {
    const review = buildReviewModule(baseModule, []);
    expect(review.scenarios).toHaveLength(0);
  });
});
