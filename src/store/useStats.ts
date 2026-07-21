import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Action, HandClass, Strategy } from '../data/types';

export interface MissedHand {
  scenarioId: string;
  hand: HandClass;
  chosen: Action;
  strategy: Strategy;
  timestamp: number;
}

interface ScenarioStat {
  correct: number;
  total: number;
}

interface HandFreqStat {
  totalChosenFreq: number;
  count: number;
}

interface RecordResultInput {
  scenarioId: string;
  hand: HandClass;
  chosen: Action;
  correct: boolean;
  chosenFreq: number;
  strategy: Strategy;
}

interface StatsState {
  totalHands: number;
  totalCorrect: number;
  currentStreak: number;
  bestStreak: number;
  byScenario: Record<string, ScenarioStat>;
  missedHands: MissedHand[];
  handFreqStats: Record<HandClass, HandFreqStat>;

  recordResult: (input: RecordResultInput) => void;
  clearMissedHands: () => void;
  resetStats: () => void;
}

const INITIAL_STATS = {
  totalHands: 0,
  totalCorrect: 0,
  currentStreak: 0,
  bestStreak: 0,
  byScenario: {} as Record<string, ScenarioStat>,
  missedHands: [] as MissedHand[],
  handFreqStats: {} as Record<HandClass, HandFreqStat>,
};

export const useStats = create<StatsState>()(
  persist(
    (set) => ({
      ...INITIAL_STATS,

      recordResult: ({ scenarioId, hand, chosen, correct, chosenFreq, strategy }) =>
        set((state) => {
          const prevScenario = state.byScenario[scenarioId] ?? { correct: 0, total: 0 };
          const prevFreq = state.handFreqStats[hand] ?? { totalChosenFreq: 0, count: 0 };
          const newStreak = correct ? state.currentStreak + 1 : 0;

          const missedHands = correct
            ? state.missedHands.filter((m) => !(m.scenarioId === scenarioId && m.hand === hand))
            : [...state.missedHands, { scenarioId, hand, chosen, strategy, timestamp: Date.now() }];

          return {
            totalHands: state.totalHands + 1,
            totalCorrect: state.totalCorrect + (correct ? 1 : 0),
            currentStreak: newStreak,
            bestStreak: Math.max(state.bestStreak, newStreak),
            byScenario: {
              ...state.byScenario,
              [scenarioId]: {
                correct: prevScenario.correct + (correct ? 1 : 0),
                total: prevScenario.total + 1,
              },
            },
            handFreqStats: {
              ...state.handFreqStats,
              [hand]: {
                totalChosenFreq: prevFreq.totalChosenFreq + chosenFreq,
                count: prevFreq.count + 1,
              },
            },
            missedHands,
          };
        }),

      clearMissedHands: () => set({ missedHands: [] }),

      resetStats: () => set({ ...INITIAL_STATS }),
    }),
    { name: 'gto-trainer-stats' },
  ),
);
