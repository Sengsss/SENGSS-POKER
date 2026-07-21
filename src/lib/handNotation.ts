import type { HandClass } from '../data/types';

/** 固定 rank 序，index 0 = 最大牌 */
const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;

function rankIndex(r: string): number {
  const idx = RANKS.indexOf(r as (typeof RANKS)[number]);
  if (idx === -1) throw new Error(`未知牌面: ${r}`);
  return idx;
}

const PAIR_PLUS = /^([2-9TJQKA])\1\+$/;
const PAIR_RANGE = /^([2-9TJQKA])\1-([2-9TJQKA])\2$/;
const PAIR = /^([2-9TJQKA])\1$/;
const SUITED_PLUS = /^([2-9TJQKA])([2-9TJQKA])([so])\+$/;
const SUITED_RANGE = /^([2-9TJQKA])([2-9TJQKA])([so])-([2-9TJQKA])([2-9TJQKA])([so])$/;
const SUITED = /^([2-9TJQKA])([2-9TJQKA])([so])$/;

/** 展开单条范围记号为具体 HandClass 列表 */
function expandOne(token: string): HandClass[] {
  let m: RegExpMatchArray | null;

  if ((m = token.match(PAIR_PLUS))) {
    const [, rank] = m;
    const idx = rankIndex(rank);
    const result: HandClass[] = [];
    for (let i = idx; i >= 0; i--) result.push(RANKS[i] + RANKS[i]);
    return result;
  }

  if ((m = token.match(PAIR_RANGE))) {
    const [, hi, lo] = m;
    const hiIdx = rankIndex(hi);
    const loIdx = rankIndex(lo);
    const [start, end] = hiIdx <= loIdx ? [hiIdx, loIdx] : [loIdx, hiIdx];
    const result: HandClass[] = [];
    for (let i = start; i <= end; i++) result.push(RANKS[i] + RANKS[i]);
    return result;
  }

  if ((m = token.match(PAIR))) {
    const [, rank] = m;
    return [rank + rank];
  }

  if ((m = token.match(SUITED_PLUS))) {
    const [, top, kicker, suffix] = m;
    const topIdx = rankIndex(top);
    const kickerIdx = rankIndex(kicker);
    const result: HandClass[] = [];
    for (let i = topIdx + 1; i <= kickerIdx; i++) {
      result.push(top + RANKS[i] + suffix);
    }
    return result;
  }

  if ((m = token.match(SUITED_RANGE))) {
    const [, top1, kicker1, suffix1, top2, kicker2, suffix2] = m;
    if (top1 !== top2 || suffix1 !== suffix2) {
      throw new Error(`范围记号两端不一致: ${token}`);
    }
    const kIdx1 = rankIndex(kicker1);
    const kIdx2 = rankIndex(kicker2);
    const [start, end] = kIdx1 <= kIdx2 ? [kIdx1, kIdx2] : [kIdx2, kIdx1];
    const result: HandClass[] = [];
    for (let i = start; i <= end; i++) {
      result.push(top1 + RANKS[i] + suffix1);
    }
    return result;
  }

  if ((m = token.match(SUITED))) {
    const [, top, kicker, suffix] = m;
    return [top + kicker + suffix];
  }

  throw new Error(`无法识别的手牌记号: ${token}`);
}

/** 把一组范围记号展开为去重后的 HandClass 列表 */
export function expand(tokens: HandClass[]): HandClass[] {
  const seen = new Set<HandClass>();
  for (const token of tokens) {
    for (const hand of expandOne(token)) seen.add(hand);
  }
  return [...seen];
}
