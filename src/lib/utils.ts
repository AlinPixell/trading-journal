import { format, getDate, getHours, getMinutes } from "date-fns";
import { Trade, TradeSide, TradeStatus } from "@/types/trade";

const pairs = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CHF", "NZD/USD", "EUR/JPY", "GBP/JPY", "GBP/CHF", "EUR/GBP"];
const tagsPool = ["Momentum", "Swing", "Scalping", "Breakout", "Trend", "Risk Managed"];
const checklistPool = ["Entry Validated", "Risk < 1%", "Setup Reviewed", "News Checked", "Price Action Confirmed"];
const titles = [
  "Reversal fade on daily resistance",
  "Breakout continuation on 4H",
  "Pullback long from support",
  "Short into upper range",
  "Late session momentum trade",
  "Countertrend scalp after rejection",
  "Trend-following breakout",
  "Range fade with tight stop",
  "Breakout retest entry",
  "Mean reversion setup"
];

const getRandomItem = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const getDateKey = (value: string | Date) => format(new Date(value), "yyyy-MM-dd");
export const formatDollar = (value: number) => `$${value.toFixed(2)}`;

export const createMockTrades = (year: number, month: number): Trade[] => {
  const trades: Trade[] = [];
  const now = new Date();
  const dayCount = 10;

  for (let i = 0; i < dayCount; i += 1) {
    const day = 2 + i;
    const hour = 8 + (i % 8);
    const minute = 10 * (i % 6);
    const date = new Date(year, month, day, hour, minute);
    const side = getRandomItem<TradeSide>(["long", "short"]);
    const status = getRandomItem<TradeStatus>(["win", "loss", "breakeven"]);
    const entryPrice = clamp(1.0 + Math.random() * 1.5, 1.01, 2.55);
    const stopDistance = parseFloat((0.02 + Math.random() * 0.02).toFixed(4));
    const takeProfitDistance = parseFloat((0.03 + Math.random() * 0.05).toFixed(4));
    const stopPrice = parseFloat(
      (side === "long" ? entryPrice - stopDistance : entryPrice + stopDistance).toFixed(4)
    );
    const takeProfitPrice = parseFloat(
      (side === "long" ? entryPrice + takeProfitDistance : entryPrice - takeProfitDistance).toFixed(4)
    );
    const netROI = status === "win" ? parseFloat((Math.random() * 2 + 0.8).toFixed(2)) : status === "loss" ? parseFloat((-Math.random() * 2 - 0.6).toFixed(2)) : 0;

    trades.push({
      id: `${year}-${month + 1}-${i}-${Math.random().toString(36).slice(2, 8)}`,
      pair: getRandomItem(pairs),
      title: titles[i % titles.length],
      side,
      status,
      entryPrice,
      stopPrice,
      takeProfitPrice,
      netROI,
      notes:
        "Detailed notes are kept here for post-trade review. I logged the trade thesis, risk management, and exit reasoning in a concise format.",
      personalInfo: "Post-trade reflection: trade selection and discipline review for my personal journal.",
      confidence: Math.floor(Math.random() * 41 + 60),
      rating: Math.ceil(Math.random() * 5),
      tags: [getRandomItem(tagsPool), getRandomItem(tagsPool)].filter((tag, index, self) => self.indexOf(tag) === index),
      checklist: [getRandomItem(checklistPool), getRandomItem(checklistPool)].filter((item, index, self) => self.indexOf(item) === index),
      screenshots: [],
      createdAt: date.toISOString(),
    });
  }

  return trades;
};

export const formatTradeCreatedAt = (createdAt: string) => {
  const date = new Date(createdAt);
  return `${format(date, "MMM d")}, ${format(date, "HH:mm")}`;
};

export const getTradeTimeLabel = (createdAt: string) => {
  const date = new Date(createdAt);
  const hours = getHours(date);
  const minutes = getMinutes(date);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

export const getDateLabel = (createdAt: string) => {
  return format(new Date(createdAt), "MMM d, yyyy");
};
