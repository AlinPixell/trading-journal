export type TradeSide = "long" | "short";

export type TradeStatus = "win" | "loss" | "breakeven";

export type Profile = {
  name: string;
  tradingStyle: string;
  riskFocus: string;
  bio: string;
};

export type Trade = {
  id: string;
  pair: string;
  title: string;
  side: TradeSide;
  status: TradeStatus;
  entryPrice: number;
  stopPrice: number;
  takeProfitPrice: number;
  netROI: number;
  notes: string;
  personalInfo: string;
  confidence: number;
  rating: number;
  tags: string[];
  checklist: string[];
  screenshots: string[];
  createdAt: string;
};
