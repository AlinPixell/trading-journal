"use client";

import { useEffect, useRef, useState } from "react";
import type { ISeriesApi, SeriesMarker, UTCTimestamp } from "lightweight-charts";
import { cn } from "@/lib/cn";
import { createTradesSessionChart } from "@/lib/xauusdChartTheme";
import {
  fetchXauUsdTimeSeries,
  XAUUSD_TIMEFRAMES,
  type TwelveIntervalParam,
} from "@/lib/xauusdTwelveData";
import type { XauUsdTrade } from "@/types/xauusd";

const BUY_MARKER = "#ffffff";
const SELL_MARKER = "rgba(255,255,255,0.42)";

function tradeEntryTime(trade: XauUsdTrade): UTCTimestamp {
  const ms = Date.parse(trade.tradedAt);
  const sec = Math.floor(ms / 1000);
  return sec as UTCTimestamp;
}

type FxChartProps = {
  trades: XauUsdTrade[];
  className?: string;
};

export function Chart({ trades, className }: FxChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const [interval, setIntervalState] = useState<TwelveIntervalParam>("1h");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /** Chart create + candle fetch must share one effect so Strict Mode remounts always reload data. */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    let cancelled = false;

    const { chart, series, dispose } = createTradesSessionChart(el);
    seriesRef.current = series;

    setLoading(true);
    setError(null);

    fetchXauUsdTimeSeries(interval, 500)
      .then((rows) => {
        if (cancelled) return;
        series.setData(rows);
        chart.timeScale().fitContent();
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "Failed to load candles";
        setError(msg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      seriesRef.current = null;
      dispose();
    };
  }, [interval]);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    const markers: SeriesMarker<UTCTimestamp>[] = trades.map((t) => ({
      time: tradeEntryTime(t),
      position: t.direction === "BUY" ? "belowBar" : "aboveBar",
      shape: t.direction === "BUY" ? "arrowUp" : "arrowDown",
      color: t.direction === "BUY" ? BUY_MARKER : SELL_MARKER,
      text: "",
      id: t.id,
    }));
    series.setMarkers(markers);
  }, [trades, interval]);

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-3", className)}>
      <div className="shrink-0 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="inline-flex shrink-0 rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] p-1">
          {XAUUSD_TIMEFRAMES.map((tf) => (
            <button
              key={tf.interval}
              type="button"
              onClick={() => setIntervalState(tf.interval)}
              className={cn(
                "min-h-10 rounded px-3 py-2 text-xs font-semibold transition sm:min-h-0",
                interval === tf.interval
                  ? "bg-[var(--fx-11)] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_var(--border-soft)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>
      <div className="relative min-h-[220px] w-full min-w-0 flex-1 overflow-hidden rounded-md border border-[var(--border)] bg-black">
        {loading ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/55">
            <p className="text-xs font-medium text-[var(--text-muted)]">Loading chart…</p>
          </div>
        ) : null}
        {error ? (
          <div className="absolute inset-x-0 top-2 z-10 px-3">
            <p className="rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-2 py-1 text-xs text-red-300">
              {error}
            </p>
          </div>
        ) : null}
        <div ref={wrapRef} className="absolute inset-0 h-full w-full min-h-[200px]" />
      </div>
    </div>
  );
}
