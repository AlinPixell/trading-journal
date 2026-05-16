/** User-defined strategy reference (e.g. head & shoulders) */
export type StrategyPlaybookItem = {
  id: string;
  name: string;
  /** Data URL or empty */
  image: string;
  /** Mechanics, rules, what to look for */
  howItWorks: string;
  /** Context, session, conditions when it tends to work */
  whenToUse: string;
};

/** Candle shapes / chart concepts for quick reference */
export type CandlePlaybookItem = {
  id: string;
  name: string;
  image: string;
  definition: string;
};
