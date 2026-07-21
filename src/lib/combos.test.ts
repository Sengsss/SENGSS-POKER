import { describe, expect, it } from 'vitest';
import { combos, allHandClasses } from './combos';

describe('combos', () => {
  it('对子 = 6', () => {
    expect(combos('AA')).toBe(6);
    expect(combos('22')).toBe(6);
  });

  it('同花 = 4', () => {
    expect(combos('AKs')).toBe(4);
  });

  it('非同花 = 12', () => {
    expect(combos('AKo')).toBe(12);
  });

  it('全 169 类加总 = 1326', () => {
    const all = allHandClasses();
    expect(all).toHaveLength(169);
    const total = all.reduce((sum, h) => sum + combos(h), 0);
    expect(total).toBe(1326);
  });
});
