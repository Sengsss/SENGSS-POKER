import { describe, expect, it } from 'vitest';
import { expand } from './handNotation';

describe('expand', () => {
  it('展开对子 +', () => {
    expect(expand(['66+'])).toHaveLength(9);
    expect(expand(['66+'])).toEqual(
      expect.arrayContaining(['66', '77', '88', '99', 'TT', 'JJ', 'QQ', 'KK', 'AA']),
    );
  });

  it('展开对子区间', () => {
    expect(expand(['77-JJ'])).toEqual(
      expect.arrayContaining(['77', '88', '99', 'TT', 'JJ']),
    );
    expect(expand(['77-JJ'])).toHaveLength(5);
    // 顺序反过来写也应得到相同结果
    expect(expand(['JJ-77'])).toHaveLength(5);
  });

  it('展开同花牌区间', () => {
    expect(expand(['A5s-A2s'])).toEqual(
      expect.arrayContaining(['A5s', 'A4s', 'A3s', 'A2s']),
    );
    expect(expand(['A5s-A2s'])).toHaveLength(4);
  });

  it('展开同花 +', () => {
    expect(expand(['ATs+'])).toEqual(
      expect.arrayContaining(['ATs', 'AJs', 'AQs', 'AKs']),
    );
    expect(expand(['ATs+'])).toHaveLength(4);
  });

  it('单个对子不展开', () => {
    expect(expand(['22'])).toEqual(['22']);
  });

  it('单个同花手牌不展开', () => {
    expect(expand(['AKs'])).toEqual(['AKs']);
  });

  it('边界：+ 号的 kicker 不能越过 top 牌', () => {
    expect(expand(['AKo+'])).toEqual(['AKo']);
  });

  it('展开非同花 +', () => {
    expect(expand(['KJo+'])).toEqual(
      expect.arrayContaining(['KJo', 'KQo']),
    );
    expect(expand(['KJo+'])).toHaveLength(2);
  });

  it('多个记号合并去重', () => {
    const result = expand(['AA', 'AA', 'KK']);
    expect(result).toHaveLength(2);
    expect(result).toEqual(expect.arrayContaining(['AA', 'KK']));
  });
});
