import type { Rank, Suit } from '../data/types';

const SUIT_SYMBOL: Record<Suit, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const RED_SUITS: Suit[] = ['h', 'd'];

export interface CardProps {
  rank: Rank;
  suit: Suit;
}

export function Card({ rank, suit }: CardProps) {
  const isRed = RED_SUITS.includes(suit);
  return (
    <div
      className={`w-14 h-20 sm:w-16 sm:h-24 rounded-lg bg-white border border-gray-300 shadow flex flex-col items-center justify-center text-2xl sm:text-3xl font-semibold ${
        isRed ? 'text-red-600' : 'text-gray-900'
      }`}
    >
      <span>{rank}</span>
      <span>{SUIT_SYMBOL[suit]}</span>
    </div>
  );
}
