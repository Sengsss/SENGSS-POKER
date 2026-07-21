import { combos } from './combos';
import type { HandClass, DealtHand, Rank, Suit } from '../data/types';

const SUITS: Suit[] = ['s', 'h', 'd', 'c'];

/** 从手牌类池中按组合数加权抽一手 */
export function weightedDeal(pool: HandClass[]): HandClass {
  const bag: HandClass[] = [];
  for (const h of pool) for (let i = 0; i < combos(h); i++) bag.push(h);
  return bag[Math.floor(Math.random() * bag.length)];
}

function pickDistinctSuits(n: number): Suit[] {
  const shuffled = [...SUITS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

/** 给手牌类补上合法花色，用于渲染真实扑克牌 */
export function assignSuits(notation: HandClass): DealtHand['cards'] {
  if (notation.length === 2) {
    // 对子: 两个不同花色
    const rank = notation[0] as Rank;
    const [suit1, suit2] = pickDistinctSuits(2);
    return [
      { rank, suit: suit1 },
      { rank, suit: suit2 },
    ];
  }

  const rank1 = notation[0] as Rank;
  const rank2 = notation[1] as Rank;
  const suffix = notation[2];

  if (suffix === 's') {
    // 同花: 两张同花色
    const [suit] = pickDistinctSuits(1);
    return [
      { rank: rank1, suit },
      { rank: rank2, suit },
    ];
  }

  // 非同花: 两张不同花色
  const [suit1, suit2] = pickDistinctSuits(2);
  return [
    { rank: rank1, suit: suit1 },
    { rank: rank2, suit: suit2 },
  ];
}
