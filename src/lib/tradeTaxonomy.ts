/** Preset tags offered in the trade editor — also used for trades directory filters */
export const TRADE_TAG_PRESETS = [
  "Momentum",
  "Swing",
  "Scalping",
  "Breakout",
  "Trend",
  "Risk Managed",
] as const;

/** Strategy presets on the detailed new-trade form */
export const TRADE_STRATEGY_PRESETS = [
  "London open",
  "NY session",
  "Asian range",
  "Liquidity sweep",
  "FVG / imbalance",
  "Order block",
  "Breaker",
  "Trend continuation",
  "Mean reversion",
  "News fade",
] as const;
