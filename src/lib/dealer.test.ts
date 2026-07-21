import { describe, expect, it } from 'vitest';
import { weightedDeal, assignSuits } from './dealer';
import { combos, allHandClasses } from './combos';

describe('weightedDeal', () => {
  it('按组合数加权抽样，对子占比接近加权比例而非类别均匀比例', () => {
    const pool = allHandClasses();
    const pairClasses = pool.filter((h) => h.length === 2);
    const totalWeight = pool.reduce((s, h) => s + combos(h), 0);
    const pairWeight = pairClasses.reduce((s, h) => s + combos(h), 0);

    const weightedExpected = pairWeight / totalWeight; // 78/1326 ≈ 0.0588
    const naiveExpected = pairClasses.length / pool.length; // 13/169 ≈ 0.0769

    const N = 20000;
    let pairCount = 0;
    for (let i = 0; i < N; i++) {
      if (weightedDeal(pool).length === 2) pairCount++;
    }
    const sampled = pairCount / N;

    expect(Math.abs(sampled - weightedExpected)).toBeLessThan(0.015);
    expect(Math.abs(sampled - naiveExpected)).toBeGreaterThan(0.008);
  });

  it('只从给定池子中发牌', () => {
    const pool = ['AA', 'KK'];
    for (let i = 0; i < 200; i++) {
      expect(pool).toContain(weightedDeal(pool));
    }
  });
});

describe('assignSuits', () => {
  it('对子发出两张不同花色', () => {
    const [c1, c2] = assignSuits('AA');
    expect(c1.rank).toBe('A');
    expect(c2.rank).toBe('A');
    expect(c1.suit).not.toBe(c2.suit);
  });

  it('同花发出同一花色', () => {
    const [c1, c2] = assignSuits('AKs');
    expect(c1.rank).toBe('A');
    expect(c2.rank).toBe('K');
    expect(c1.suit).toBe(c2.suit);
  });

  it('非同花发出不同花色', () => {
    const [c1, c2] = assignSuits('AKo');
    expect(c1.rank).toBe('A');
    expect(c2.rank).toBe('K');
    expect(c1.suit).not.toBe(c2.suit);
  });
});
