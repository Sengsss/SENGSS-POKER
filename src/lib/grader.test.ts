import { describe, expect, it } from 'vitest';
import { grade } from './grader';

describe('grade', () => {
  it('纯策略选对', () => {
    const r = grade({ raise: 1 }, 'raise');
    expect(r.correct).toBe(true);
    expect(r.isMixed).toBe(false);
  });

  it('纯策略选错', () => {
    const r = grade({ raise: 1 }, 'fold');
    expect(r.correct).toBe(false);
  });

  it('混合策略里选中非零动作算对', () => {
    const r = grade({ raise: 0.6, fold: 0.4 }, 'fold');
    expect(r.correct).toBe(true);
    expect(r.isMixed).toBe(true);
  });

  it('bestAction 取频率最高的动作', () => {
    const r = grade({ call: 1 }, 'jam');
    expect(r.correct).toBe(false);
    expect(r.bestAction).toBe('call');
  });

  it('chosenFreq 反映玩家所选动作的频率', () => {
    const r = grade({ raise: 0.6, fold: 0.4 }, 'raise');
    expect(r.chosenFreq).toBe(0.6);
  });

  it('未出现在策略里的动作频率为 0', () => {
    const r = grade({ raise: 1 }, 'call');
    expect(r.chosenFreq).toBe(0);
    expect(r.correct).toBe(false);
  });
});
