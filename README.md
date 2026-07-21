# GTO 翻前训练器 — 项目规格书

> 交给 Claude Code 的完整开发说明。目标：为 Poker Dream 锦标赛备赛，搭一个离线可用、模块化、可持续扩展的 GTO 翻前训练 SPA。

---

## 0. 一句话目标

一个纯前端训练应用：随机发牌 + 随机场景，玩家做决策，即时判定是否符合 GTO 策略，并显示完整范围表。核心价值是**模块化**——新增训练场景只需加一份数据 + 一份配置，不改 UI 代码。

**验收总标准：** 加一个全新训练模块（例如"大盲防守"）应当只涉及新增 `data/` 和 `modules/` 下的文件，`components/` 与 `lib/` 零改动。如果搭出来的架构做不到这点，就是没搭对。

---

## 1. 技术栈

| 层 | 选型 | 理由 |
|---|---|---|
| 构建 | Vite | 快，零配置 |
| 框架 | React 18 + TypeScript | TS 对牌型/范围逻辑是硬需求，不可省 |
| 样式 | Tailwind CSS | 快速出牌桌 UI |
| 状态 | Zustand | 管训练统计，比 Context 轻 |
| 持久化 | localStorage | 存准确率历史、错题本；离线可用 |
| 测试 | Vitest | 记号展开、判分、组合数必须有单测 |

**约束：** 全静态数据打包，无后端，无网络依赖。比赛前酒店没网也能练。

---

## 2. 目录结构

```
src/
  data/
    types.ts            // 全局类型定义（先建这个）
    ranges/
      rfi.ts            // 各位置开局范围
      vs3bet.ts         // 面对 3-bet 应对
      // 后续: vsRFI.ts, bbDefend.ts, pushfold.ts
  lib/
    handNotation.ts     // 展开 "A5s-A2s" / "66+" 等记号
    combos.ts           // 组合数计算
    dealer.ts           // 按组合数加权发牌
    grader.ts           // 判分（含混合频率）
  components/
    Card.tsx            // 单张扑克牌
    RangeGrid.tsx       // 13x13 网格，吃一个 colorMap 函数
    Trainer.tsx         // 通用训练容器（模块无关）
    StatsBar.tsx        // 计分条
    PositionStats.tsx   // 分场景准确率
  modules/
    index.ts            // 模块注册表
    rfiModule.ts
    vs3betModule.ts
  store/
    useStats.ts         // Zustand store + localStorage
  App.tsx
  main.tsx
```

---

## 3. 核心类型（`data/types.ts`）

**这是地基，先建，其他一切依赖它。**

```typescript
export type Rank = 'A'|'K'|'Q'|'J'|'T'|'9'|'8'|'7'|'6'|'5'|'4'|'3'|'2';
export type Suit = 's'|'h'|'d'|'c';
export type Position = 'UTG'|'MP'|'HJ'|'CO'|'BTN'|'SB'|'BB';
export type Action = 'fold'|'call'|'raise'|'jam';

/** 手牌类记号，如 "AKs" | "TT" | "A5o"（169 种之一） */
export type HandClass = string;

/** 具体两张牌（含花色），用于发牌显示 */
export interface DealtHand {
  cards: [{ rank: Rank; suit: Suit }, { rank: Rank; suit: Suit }];
  notation: HandClass;
}

/** 一手牌在某场景下的 GTO 频率分布，各动作频率之和 = 1 */
export type Strategy = Partial<Record<Action, number>>;
// 纯加注: { raise: 1 }
// 混合:   { raise: 0.6, fold: 0.4 }

export interface Scenario {
  id: string;
  heroPos: Position;
  villainPos?: Position;
  prompt: string;                          // "你在 BTN，SB 3-bet 到 7.5bb"
  subPrompt?: string;                      // "~40bb · 你的 4-bet 即全下"
  actions: Action[];                       // 该场景允许的按钮，按显示顺序
  ranges: Record<HandClass, Strategy>;     // 完整策略表（缺省手牌 = 纯 fold）
  tip: string;                             // 答后显示的策略讲解
}

export interface TrainingModule {
  id: string;
  name: string;                            // Tab 显示名
  scenarios: Scenario[];
  /** 决定发牌来自哪些手牌类（如面对 3-bet 只发英雄开局范围内的牌） */
  dealPool: (scenario: Scenario) => HandClass[];
}
```

**设计决策（重要）：**
- 用 `Strategy` 频率分布，**不要**用"混合牌名单"打补丁。纯策略是频率为 1 的特例。这样以后灌 solver 导出数据可无缝对接。
- `ranges` 里不出现的手牌类**默认为纯 fold**，减少数据量。

---

## 4. 记号展开（`lib/handNotation.ts`）

把扑克范围记号展开成 `HandClass[]`。**必须写单元测试**，是最容易错又影响全局的一环。

### 需支持的记号

| 记号 | 展开为 |
|---|---|
| `"22"` | `["22"]` |
| `"66+"` | `["66","77","88","99","TT","JJ","QQ","KK","AA"]` |
| `"AKs"` | `["AKs"]` |
| `"ATs+"` | `["ATs","AJs","AQs","AKs"]` |
| `"A5s-A2s"` | `["A5s","A4s","A3s","A2s"]` |
| `"KJo+"` | `["KJo","KQo"]` |

### 验收测试用例（Vitest）

```typescript
expect(expand(["66+"])).toHaveLength(9);
expect(expand(["A5s-A2s"])).toEqual(
  expect.arrayContaining(["A5s","A4s","A3s","A2s"])
);
expect(expand(["A5s-A2s"])).toHaveLength(4);
expect(expand(["ATs+"])).toEqual(
  expect.arrayContaining(["ATs","AJs","AQs","AKs"])
);
expect(expand(["22"])).toEqual(["22"]);
// 边界：+ 号的 kicker 不能越过 top 牌
expect(expand(["AKo+"])).toEqual(["AKo"]);
```

**边界坑：**
- `+` 用于对子时向上展开到 AA；用于非对子时 kicker 向 top 牌方向展开，不越过 top。
- 排序统一用固定 rank 序 `AKQJT98765432`，大牌 index 小。

---

## 5. 组合数（`lib/combos.ts`）

```typescript
export function combos(h: HandClass): number {
  if (h.length === 2) return 6;        // 对子
  return h.endsWith('s') ? 4 : 12;     // 同花 / 非同花
}
```

**单测：** 对子 6、同花 4、非同花 12；全 169 类加总 = 1326。

---

## 6. 加权发牌（`lib/dealer.ts`）

### 为什么要加权

均匀随机抽 169 种手牌类会**严重高估对子**（真实牌桌对子仅 6/1326 ≈ 0.45% 每类）。必须按组合数加权，否则训练分布失真。

```typescript
import { combos } from './combos';
import type { HandClass, DealtHand, Rank, Suit } from '../data/types';

/** 从手牌类池中按组合数加权抽一手 */
export function weightedDeal(pool: HandClass[]): HandClass {
  const bag: HandClass[] = [];
  for (const h of pool) for (let i = 0; i < combos(h); i++) bag.push(h);
  return bag[Math.floor(Math.random() * bag.length)];
}

/** 给手牌类补上合法花色，用于渲染真实扑克牌 */
export function assignSuits(notation: HandClass): DealtHand['cards'] {
  // 对子: 两个不同花色
  // 同花 (s): 两张同花色
  // 非同花 (o): 两张不同花色
  // 实现时确保不发出同一张牌
}
```

**关键约束：** 面对 3-bet / 面对开局这类"被动"场景，`dealPool` 必须返回**英雄开局范围内的手牌**——因为只有开了局（或进了范围）才会遇到这个决策。均匀发全部 169 类是逻辑错误。

**单测：** 抽样 10000 次，对子占比应接近 `9类×6 / 加权总数`，而非 `9/169`。

---

## 7. 判分（`lib/grader.ts`）

```typescript
import type { Strategy, Action } from '../data/types';

export interface GradeResult {
  correct: boolean;      // 选中的动作 GTO 频率 > 0
  isMixed: boolean;      // 该手牌有 >1 个非零动作
  chosenFreq: number;    // 玩家所选动作的 GTO 频率
  bestAction: Action;    // 频率最高的动作
  strategy: Strategy;    // 原始分布，供 UI 显示
}

export function grade(strategy: Strategy, choice: Action): GradeResult {
  const chosenFreq = strategy[choice] ?? 0;
  const entries = Object.entries(strategy) as [Action, number][];
  const nonZero = entries.filter(([, f]) => f > 0);
  const bestAction = [...entries].sort((a, b) => b[1] - a[1])[0][0];
  return {
    correct: chosenFreq > 0,
    isMixed: nonZero.length > 1,
    chosenFreq,
    bestAction,
    strategy,
  };
}
```

### 两种计分模式（做成开关）

1. **宽松模式（默认）：** 选中任意非零频率动作即算对。适合入门、背范围。
2. **严格模式（频率加权）：** 混合牌按 GTO 频率随机判定期望——例如 `{raise:0.6, fold:0.4}` 这手，长期看你该有 60% 选加注。可显示"你的选择频率 vs GTO 频率"的偏差统计。**比赛训练建议开这个**，因为剥削与被剥削的差距就藏在混合牌的频率里。

**单测：**
```typescript
grade({ raise: 1 }, 'raise')          // correct: true, isMixed: false
grade({ raise: 1 }, 'fold')           // correct: false
grade({ raise: 0.6, fold: 0.4 }, 'fold')  // correct: true, isMixed: true
grade({ call: 1 }, 'jam')             // correct: false, bestAction: 'call'
```

---

## 8. 通用组件

### `RangeGrid.tsx`

13×13 手牌网格，标准布局：对子在对角线，同花在右上三角，非同花在左下三角。

```typescript
interface RangeGridProps {
  colorMap: (hand: HandClass) => { bg: string; fg: string };
  highlight?: HandClass;   // 当前手牌，加高亮描边
  legend: Array<{ color: string; label: string }>;
}
```

**关键：** 组件本身不知道任何策略含义，只吃一个 `colorMap` 函数。RFI 模块传"加注/混合/弃牌"配色，vs-3bet 模块传"全下/跟注/弃牌"配色——同一组件复用。这是整个架构可扩展的支点。

### `Trainer.tsx`

通用训练容器，接收一个 `TrainingModule`，内部完成：发牌 → 显示场景+牌 → 收集玩家动作 → 判分 → 显示结果+范围表 → 下一手。**任何模块都用它，不为特定模块写 UI。**

```typescript
interface TrainerProps {
  module: TrainingModule;
  strictMode: boolean;
}
```

---

## 9. 统计与持久化（`store/useStats.ts`）

Zustand store，localStorage 持久化：

- 总手数、总正确数、当前连对
- 分场景准确率（`Record<scenarioId, {correct, total}>`）
- **错题本：** 记录答错的 `{scenarioId, hand, chosen, strategy}`，支持"只复习错题"模式
- 严格模式下：分手牌类的频率偏差（找出你系统性打错的牌）

---

## 10. 范围数据来源（决定训练质量）

**不要手敲范围。** 手敲的表既不准也难维护。

### 推荐来源
- **GTO Wizard** — 有 MTT 预解范围，可导出。免费档也有基础预设。
- **PioSOLVER / 其它 solver** — 自己解，导出 CSV/JSON。
- **PokerCoaching / Upswing** 的公开图表 — 作为交叉验证。

### 数据格式对接
solver 导出通常是 `手牌 → 各动作频率`，直接映射到 `Strategy` 类型。写一个 `scripts/importSolver.ts` 把 CSV 转成 `data/ranges/*.ts`。

### 匹配你的赛制（重要）
Poker Dream 的**起始筹码、盲注结构、前注类型、平均筹码深度**都会改变范围。查清楚具体赛制，用**对应深度**的解（例如 Day 1 多为 40-60bb，后期进入 15-25bb 短码），别用现金桌 100bb 的表来练锦标赛。

---

## 11. 开发顺序（建议提交节奏）

按这个顺序做，每步可独立验证：

1. **`types.ts` + `handNotation.ts` + 单测** — 地基，记号展开测试必须全绿。
2. **`combos.ts` + `dealer.ts` + 单测** — 验证加权分布正确。
3. **`grader.ts` + 单测** — 判分逻辑（含混合）。
4. **`RangeGrid.tsx`** — 喂死数据先跑通渲染。
5. **`data/ranges/rfi.ts` + `rfiModule.ts` + `Trainer.tsx`** — 打通整条链路（发牌→答题→判分→显示）。这是第一个能玩的版本。
6. **`store/useStats.ts` + `StatsBar` + `PositionStats`** — 统计与持久化。
7. **`data/ranges/vs3bet.ts` + `vs3betModule.ts`** — 加第二个模块，**验证架构可扩展性**（应该几乎不碰前面的代码）。
8. 之后每个新模块 = 新数据文件 + 新配置 + 在 `modules/index.ts` 注册。

---

## 12. 后续可扩展模块（数据备齐即可加）

- **面对开局** — 3-bet / 跟注 / 弃牌（有位置 vs 无位置）
- **大盲防守** — 面对不同位置开局的防守范围（最容易被高手剥削的位置）
- **面对 4-bet** — 你 3-bet 被反打的应对
- **Push/Fold 短码** — 15bb 以下 Nash 全下表
- **ICM 泡沫期** — 引入 ICM 压力对范围的收紧
- **翻后 MDF 训练** — 最低防守频率的心算练习

每个模块只要备好 `Strategy` 数据表，套用现有 `Trainer` 即可。

---

## 13. 质量底线

- 记号展开、组合数、判分：**单测覆盖，全绿才继续**
- 响应式，手机可用（比赛现场用手机练）
- 键盘可操作（F/C/R/J 快捷键切动作），`prefers-reduced-motion` 尊重
- 错题本可导出，方便赛前针对性复盘

---

## 附：第一个可玩版本的最小验收清单

- [ ] `handNotation` 单测全绿
- [ ] 发牌分布加权正确（对子不过量）
- [ ] RFI 模块：随机位置+手牌，答题即时判分
- [ ] 答后显示该位置完整范围表，当前手牌高亮
- [ ] 准确率统计持久化到 localStorage
- [ ] 加 vs-3bet 模块时未修改 `components/` 与 `lib/`
