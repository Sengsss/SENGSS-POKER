import type { Scenario } from '../data/types';
import { useStats } from '../store/useStats';

export interface PositionStatsProps {
  scenarios: Scenario[];
  /** 严格模式下额外展示手牌类频率偏差，帮助找出系统性打错的牌 */
  strictMode?: boolean;
}

export function PositionStats({ scenarios, strictMode }: PositionStatsProps) {
  const byScenario = useStats((s) => s.byScenario);
  const handFreqStats = useStats((s) => s.handFreqStats);

  const worstHands = Object.entries(handFreqStats)
    .map(([hand, { totalChosenFreq, count }]) => ({
      hand,
      count,
      avgFreq: totalChosenFreq / count,
    }))
    .filter((h) => h.count >= 3)
    .sort((a, b) => a.avgFreq - b.avgFreq)
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-4 text-sm">
      <table className="border-collapse">
        <caption className="text-left text-gray-400 mb-1">分场景准确率</caption>
        <thead>
          <tr className="text-gray-400">
            <th className="text-left pr-4">场景</th>
            <th className="text-right pr-4">正确</th>
            <th className="text-right pr-4">总数</th>
            <th className="text-right">准确率</th>
          </tr>
        </thead>
        <tbody>
          {scenarios.map((s) => {
            const stat = byScenario[s.id];
            const acc = stat && stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : null;
            return (
              <tr key={s.id}>
                <td className="text-left pr-4">{s.heroPos}</td>
                <td className="text-right pr-4">{stat?.correct ?? 0}</td>
                <td className="text-right pr-4">{stat?.total ?? 0}</td>
                <td className="text-right">{acc === null ? '-' : `${acc}%`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {strictMode && worstHands.length > 0 && (
        <table className="border-collapse">
          <caption className="text-left text-gray-400 mb-1">
            手牌频率偏差（你的选择频率长期低于 GTO，样本 ≥3 次）
          </caption>
          <thead>
            <tr className="text-gray-400">
              <th className="text-left pr-4">手牌</th>
              <th className="text-right pr-4">样本</th>
              <th className="text-right">平均选择频率</th>
            </tr>
          </thead>
          <tbody>
            {worstHands.map((h) => (
              <tr key={h.hand}>
                <td className="text-left pr-4">{h.hand}</td>
                <td className="text-right pr-4">{h.count}</td>
                <td className="text-right">{(h.avgFreq * 100).toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
