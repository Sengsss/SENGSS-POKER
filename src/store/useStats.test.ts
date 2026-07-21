import { beforeEach, describe, expect, it } from 'vitest';
import { useStats } from './useStats';

beforeEach(() => {
  localStorage.clear();
  useStats.getState().resetStats();
});

describe('useStats', () => {
  it('记录正确答案：手数、正确数、连对都增加', () => {
    useStats.getState().recordResult({
      scenarioId: 's1',
      hand: 'AA',
      chosen: 'raise',
      correct: true,
      chosenFreq: 1,
      strategy: { raise: 1 },
    });
    const state = useStats.getState();
    expect(state.totalHands).toBe(1);
    expect(state.totalCorrect).toBe(1);
    expect(state.currentStreak).toBe(1);
    expect(state.bestStreak).toBe(1);
  });

  it('答错时连对清零并写入错题本', () => {
    useStats.getState().recordResult({
      scenarioId: 's1', hand: 'AA', chosen: 'raise', correct: true, chosenFreq: 1, strategy: { raise: 1 },
    });
    useStats.getState().recordResult({
      scenarioId: 's1', hand: '72o', chosen: 'raise', correct: false, chosenFreq: 0, strategy: { fold: 1 },
    });
    const state = useStats.getState();
    expect(state.currentStreak).toBe(0);
    expect(state.bestStreak).toBe(1);
    expect(state.missedHands).toHaveLength(1);
    expect(state.missedHands[0].hand).toBe('72o');
  });

  it('分场景统计按 scenarioId 累加', () => {
    useStats.getState().recordResult({
      scenarioId: 's1', hand: 'AA', chosen: 'raise', correct: true, chosenFreq: 1, strategy: { raise: 1 },
    });
    useStats.getState().recordResult({
      scenarioId: 's1', hand: 'KK', chosen: 'fold', correct: false, chosenFreq: 0, strategy: { raise: 1 },
    });
    useStats.getState().recordResult({
      scenarioId: 's2', hand: 'QQ', chosen: 'raise', correct: true, chosenFreq: 1, strategy: { raise: 1 },
    });
    const state = useStats.getState();
    expect(state.byScenario.s1).toEqual({ correct: 1, total: 2 });
    expect(state.byScenario.s2).toEqual({ correct: 1, total: 1 });
  });

  it('之前答错的手牌后来答对会从错题本移除', () => {
    useStats.getState().recordResult({
      scenarioId: 's1', hand: '72o', chosen: 'raise', correct: false, chosenFreq: 0, strategy: { fold: 1 },
    });
    expect(useStats.getState().missedHands).toHaveLength(1);
    useStats.getState().recordResult({
      scenarioId: 's1', hand: '72o', chosen: 'fold', correct: true, chosenFreq: 1, strategy: { fold: 1 },
    });
    expect(useStats.getState().missedHands).toHaveLength(0);
  });

  it('handFreqStats 累积同一手牌的平均选择频率', () => {
    useStats.getState().recordResult({
      scenarioId: 's1', hand: 'AJo', chosen: 'raise', correct: true, chosenFreq: 0.4, strategy: { raise: 0.4, fold: 0.6 },
    });
    useStats.getState().recordResult({
      scenarioId: 's1', hand: 'AJo', chosen: 'raise', correct: true, chosenFreq: 0.4, strategy: { raise: 0.4, fold: 0.6 },
    });
    const stat = useStats.getState().handFreqStats.AJo;
    expect(stat.count).toBe(2);
    expect(stat.totalChosenFreq).toBeCloseTo(0.8);
  });

  it('resetStats 清空所有统计', () => {
    useStats.getState().recordResult({
      scenarioId: 's1', hand: 'AA', chosen: 'raise', correct: true, chosenFreq: 1, strategy: { raise: 1 },
    });
    useStats.getState().resetStats();
    const state = useStats.getState();
    expect(state.totalHands).toBe(0);
    expect(state.missedHands).toHaveLength(0);
  });
});
