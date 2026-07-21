import { useState } from 'react';
import { Trainer } from './components/Trainer';
import { StatsBar } from './components/StatsBar';
import { PositionStats } from './components/PositionStats';
import { modules } from './modules';
import { useStats } from './store/useStats';
import { buildReviewModule } from './lib/reviewModule';

function App() {
  const [moduleId, setModuleId] = useState(modules[0].id);
  const [strictMode, setStrictMode] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  const missedHands = useStats((s) => s.missedHands);
  const recordResult = useStats((s) => s.recordResult);

  const baseModule = modules.find((m) => m.id === moduleId) ?? modules[0];
  const scenarioIds = new Set(baseModule.scenarios.map((s) => s.id));
  const moduleMissedHands = missedHands.filter((m) => scenarioIds.has(m.scenarioId));
  const canReview = moduleMissedHands.length > 0;
  const activeModule = reviewMode ? buildReviewModule(baseModule, moduleMissedHands) : baseModule;

  function selectModule(id: string) {
    setModuleId(id);
    setReviewMode(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center gap-4 py-6">
      <nav className="flex gap-1 w-full overflow-x-auto px-4 pb-1">
        {modules.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => selectModule(m.id)}
            className={`shrink-0 whitespace-nowrap px-3 py-1.5 min-h-11 rounded-md text-sm font-medium ${
              m.id === moduleId ? 'bg-gray-700 text-white' : 'text-gray-400'
            }`}
          >
            {m.name}
          </button>
        ))}
      </nav>

      <header className="flex flex-col items-center gap-2 px-4 text-center">
        <h1 className="text-lg sm:text-xl font-semibold">GTO 翻前训练器 · {activeModule.name}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={strictMode}
              onChange={(e) => setStrictMode(e.target.checked)}
            />
            严格模式
          </label>
          <label className={`flex items-center gap-1.5 ${canReview ? '' : 'opacity-50'}`}>
            <input
              type="checkbox"
              checked={reviewMode}
              disabled={!canReview}
              onChange={(e) => setReviewMode(e.target.checked)}
            />
            只复习错题（{moduleMissedHands.length}）
          </label>
        </div>
        <StatsBar />
      </header>

      {activeModule.scenarios.length === 0 ? (
        <p className="text-gray-400">暂无可复习的错题</p>
      ) : (
        <Trainer
          key={activeModule.id}
          module={activeModule}
          strictMode={strictMode}
          onResult={({ scenario, hand, action, result }) =>
            recordResult({
              scenarioId: scenario.id,
              hand,
              chosen: action,
              correct: result.correct,
              chosenFreq: result.chosenFreq,
              strategy: result.strategy,
            })
          }
        />
      )}

      <PositionStats scenarios={baseModule.scenarios} strictMode={strictMode} />
    </div>
  );
}

export default App;
