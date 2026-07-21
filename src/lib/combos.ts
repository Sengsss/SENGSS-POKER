import type { HandClass } from '../data/types';

export function combos(h: HandClass): number {
  if (h.length === 2) return 6;        // 对子
  return h.endsWith('s') ? 4 : 12;     // 同花 / 非同花
}

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;

/** 全部 169 种手牌类，供需要从整个范围空间发牌的场景使用（如 RFI） */
export function allHandClasses(): HandClass[] {
  const result: HandClass[] = [];
  for (let i = 0; i < RANKS.length; i++) {
    result.push(RANKS[i] + RANKS[i]);
    for (let j = i + 1; j < RANKS.length; j++) {
      result.push(RANKS[i] + RANKS[j] + 's');
      result.push(RANKS[i] + RANKS[j] + 'o');
    }
  }
  return result;
}
