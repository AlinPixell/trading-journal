export type XauUsdTradeDirection = "BUY" | "SELL";

export type XauUsdTrade = {
  id: string;
  direction: XauUsdTradeDirection;
  entryPrice: number;
  exitPrice?: number | null;
  lots: number;
  stopLoss?: number | null;
  takeProfit?: number | null;
  tradedAt: string;
  notes: string;
  backtest?: boolean;
  /** Data URL from local screenshot */
  screenshot?: string | null;
};

export type XauUsdAnalysisEntry = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  screenshot: string;
  createdAt: string;
};
