import type { HandClass } from '../data/types';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;

function handAt(row: number, col: number): HandClass {
  if (row === col) return RANKS[row] + RANKS[row];
  const top = RANKS[Math.min(row, col)];
  const kicker = RANKS[Math.max(row, col)];
  return row < col ? `${top}${kicker}s` : `${top}${kicker}o`;
}

export interface RangeGridProps {
  /** 组件本身不知道任何策略含义，只吃一个 colorMap 函数 */
  colorMap: (hand: HandClass) => { bg: string; fg: string };
  highlight?: HandClass;   // 当前手牌，加高亮描边
  legend: Array<{ color: string; label: string }>;
}

export function RangeGrid({ colorMap, highlight, legend }: RangeGridProps) {
  return (
    <div className="inline-flex flex-col gap-3">
      <div
        className="grid gap-px bg-gray-700 p-px rounded"
        style={{ gridTemplateColumns: `repeat(${RANKS.length}, minmax(0, 1fr))` }}
      >
        {RANKS.map((_, row) =>
          RANKS.map((__, col) => {
            const hand = handAt(row, col);
            const { bg, fg } = colorMap(hand);
            const isHighlighted = hand === highlight;
            return (
              <div
                key={hand}
                data-hand={hand}
                aria-label={hand}
                className={`aspect-square flex items-center justify-center text-[10px] sm:text-xs font-medium ${
                  isHighlighted ? 'ring-2 ring-yellow-400 z-10' : ''
                }`}
                style={{ backgroundColor: bg, color: fg }}
              >
                {hand}
              </div>
            );
          }),
        )}
      </div>
      <div className="flex flex-wrap gap-3 text-xs">
        {legend.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
