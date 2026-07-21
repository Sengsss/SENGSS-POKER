import { useEffect, useMemo, useState } from 'react';
import type { Action, DealtHand, Scenario, Strategy, TrainingModule } from '../data/types';
import { weightedDeal, assignSuits } from '../lib/dealer';
import { grade, type GradeResult } from '../lib/grader';
import { Card } from './Card';
import { RangeGrid } from './RangeGrid';

const ACTION_LABEL: Record<Action, string> = { fold: 'Fold (F)', call: 'Call (C)', raise: 'Raise (R)', jam: 'Jam (J)' };
const ACTION_KEY: Record<string, Action> = { f: 'fold', c: 'call', r: 'raise', j: 'jam' };
const ACTION_COLOR: Record<Action, string> = { fold: '#4b5563', call: '#2563eb', raise: '#dc2626', jam: '#7c3aed' };

function pickScenario(module: TrainingModule): Scenario {
  return module.scenarios[Math.floor(Math.random() * module.scenarios.length)];
}

function dealForScenario(scenario: Scenario, module: TrainingModule): DealtHand {
  const pool = module.dealPool(scenario);
  const notation = weightedDeal(pool);
  return { cards: assignSuits(notation), notation };
}

function strategyFor(scenario: Scenario, hand: string): Strategy {
  return scenario.ranges[hand] ?? { fold: 1 };
}

function dominantAction(strategy: Strategy): Action {
  const entries = Object.entries(strategy) as [Action, number][];
  return entries.sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'fold';
}

export interface TrainerProps {
  module: TrainingModule;
  strictMode: boolean;
  onResult?: (info: { scenario: Scenario; hand: string; action: Action; result: GradeResult }) => void;
}

export function Trainer({ module, strictMode, onResult }: TrainerProps) {
  const [scenario, setScenario] = useState<Scenario>(() => pickScenario(module));
  const [dealt, setDealt] = useState<DealtHand>(() => dealForScenario(scenario, module));
  const [result, setResult] = useState<GradeResult | null>(null);

  function answer(action: Action) {
    if (result || !scenario.actions.includes(action)) return;
    const strategy = strategyFor(scenario, dealt.notation);
    const g = grade(strategy, action);
    setResult(g);
    onResult?.({ scenario, hand: dealt.notation, action, result: g });
  }

  function next() {
    const s = pickScenario(module);
    setScenario(s);
    setDealt(dealForScenario(s, module));
    setResult(null);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!result && (e.key === 'f' || e.key === 'c' || e.key === 'r' || e.key === 'j')) {
        answer(ACTION_KEY[e.key]);
      } else if (result && e.key === ' ') {
        e.preventDefault();
        next();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const colorMap = useMemo(() => {
    return (hand: string) => {
      const strategy = strategyFor(scenario, hand);
      const action = dominantAction(strategy);
      return { bg: ACTION_COLOR[action], fg: '#fff' };
    };
  }, [scenario]);

  const legend = scenario.actions.map((a) => ({ color: ACTION_COLOR[a], label: ACTION_LABEL[a] }));
  if (!scenario.actions.includes('fold')) {
    legend.push({ color: ACTION_COLOR.fold, label: ACTION_LABEL.fold });
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-center">
        <p className="text-lg font-medium">{scenario.prompt}</p>
        {scenario.subPrompt && <p className="text-sm text-gray-400">{scenario.subPrompt}</p>}
      </div>

      <div className="flex gap-2">
        {dealt.cards.map((c, i) => (
          <Card key={i} rank={c.rank} suit={c.suit} />
        ))}
      </div>

      {!result && (
        <div className="flex gap-2 flex-wrap justify-center">
          {scenario.actions.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => answer(a)}
              className="px-4 py-2 min-h-11 rounded-md text-white font-medium"
              style={{ backgroundColor: ACTION_COLOR[a] }}
            >
              {ACTION_LABEL[a]}
            </button>
          ))}
        </div>
      )}

      {result && (
        <div className="flex flex-col items-center gap-3 w-full">
          <p className={result.correct ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>
            {result.correct ? '✓ 正确' : '✗ 错误'}
            {result.isMixed && '（混合策略）'}
          </p>
          {strictMode && (
            <p className="text-sm text-gray-400">
              你的选择 GTO 频率：{(result.chosenFreq * 100).toFixed(0)}% · 最优动作：{ACTION_LABEL[result.bestAction]}
            </p>
          )}
          <p className="text-sm max-w-md text-center text-gray-400">{scenario.tip}</p>
          <RangeGrid colorMap={colorMap} highlight={dealt.notation} legend={legend} />
          <button
            type="button"
            onClick={next}
            className="px-4 py-2 min-h-11 rounded-md bg-gray-700 text-white font-medium"
          >
            下一手 (Space)
          </button>
        </div>
      )}
    </div>
  );
}
