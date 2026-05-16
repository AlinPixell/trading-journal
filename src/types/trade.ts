/** Legacy — maps to BUY / SELL */
export type TradeSide = "long" | "short";

export type TradeDirection = "BUY" | "SELL";

export type TradeStatus = "win" | "loss" | "breakeven";

export type Trade = {
  id: string;
  pair: string;
  title: string;
  direction: TradeDirection;
  /** @deprecated use direction */
  side?: TradeSide;
  status: TradeStatus;
  entryPrice: number;
  stopPrice: number;
  takeProfitPrice: number;
  /** Actual price where take profit was filled */
  takeProfitHitPrice: number;
  /** Actual price where stop loss was filled (optional; 0 if unknown) */
  stopLossHitPrice: number;
  /** Account-currency P/L */
  pnl: number;
  /** Percentage return; may be derived when auto-calculations are on */
  netROI: number;
  notes: string;
  personalInfo: string;
  confidence: number;
  rating: number;
  tags: string[];
  /** Strategy labels (e.g. presets from the detailed trade form) */
  strategies: string[];
  checklist: string[];
  screenshots: string[];
  /** Trade open time — ISO-8601 */
  createdAt: string;
  /** Trade close time — ISO-8601 (optional) */
  tradeEndedAt?: string;
};
