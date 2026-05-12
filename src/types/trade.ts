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
  /** Account-currency P/L */
  pnl: number;
  /** Percentage return; may be derived when auto-calculations are on */
  netROI: number;
  notes: string;
  personalInfo: string;
  confidence: number;
  rating: number;
  tags: string[];
  checklist: string[];
  screenshots: string[];
  /** ISO-8601 including seconds */
  createdAt: string;
};
