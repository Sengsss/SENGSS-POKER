import { useStats } from '../store/useStats';

export function StatsBar() {
  const totalHands = useStats((s) => s.totalHands);
  const totalCorrect = useStats((s) => s.totalCorrect);
  const currentStreak = useStats((s) => s.currentStreak);
  const bestStreak = useStats((s) => s.bestStreak);

  const accuracy = totalHands === 0 ? null : Math.round((totalCorrect / totalHands) * 100);

  return (
    <div className="flex gap-4 text-sm text-gray-400" data-testid="stats-bar">
      <span>手数 {totalHands}</span>
      <span>正确率 {accuracy === null ? '-' : `${accuracy}%`}</span>
      <span>当前连对 {currentStreak}</span>
      <span>最佳连对 {bestStreak}</span>
    </div>
  );
}
