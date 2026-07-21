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
