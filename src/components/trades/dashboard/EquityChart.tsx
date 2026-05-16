"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EquityPoint } from "@/lib/tradesDashboardModel";
import { cn } from "@/lib/cn";
import { formatDollar } from "@/lib/utils";

type EquityChartProps = {
  data: EquityPoint[];
  usesMock?: boolean;
  className?: string;
};

export function EquityChart({ data, usesMock, className }: EquityChartProps) {
  const chartData = data.map((row) => ({
    ...row,
    lossMarker: row.dayPnl < 0 ? row.equity : null,
  }));

  const minEq = Math.min(...data.map((d) => d.equity));
  const maxEq = Math.max(...data.map((d) => d.equity));
  const pad = Math.max(80, (maxEq - minEq) * 0.12);
  const yLow = minEq - pad;
  const yHigh = maxEq + pad;

  return (
    <div
      className={cn(
        "relative flex h-full w-full min-h-[280px] flex-col rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] p-4 sm:min-h-[300px] sm:p-5",
        className,
      )}
    >
      {usesMock ? (
        <span className="absolute right-3 top-3 z-10 rounded-md border border-[var(--border-soft)] bg-[var(--fx-05)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Demo curve
        </span>
      ) : null}
      <div className="mb-4 shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
          Last 30 days
        </p>
        <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Equity curve</p>
      </div>
      <div className="relative min-h-[220px] w-full min-w-0 flex-1">
        <div className="absolute inset-0 min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="tradesEquityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 6" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="var(--chart-axis)"
              tick={{ fill: "var(--text-muted)", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border-soft)" }}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis
              domain={[yLow, yHigh]}
              stroke="var(--chart-axis)"
              tick={{ fill: "var(--text-muted)", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border-soft)" }}
              tickFormatter={(v) =>
                new Intl.NumberFormat(undefined, {
                  notation: "compact",
                  maximumFractionDigits: 0,
                }).format(v as number)
              }
              width={44}
            />
            <Tooltip
              cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
              contentStyle={{
                background: "var(--chart-tooltip-bg)",
                border: "1px solid var(--chart-tooltip-border)",
                borderRadius: 10,
                fontSize: 12,
                color: "var(--text-primary)",
              }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0]?.payload as EquityPoint & { lossMarker?: number | null };
                return (
                  <div className="px-0.5 py-0.5">
                    <p className="text-[11px] text-[var(--text-muted)]">{p.label}</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {formatDollar(p.equity)}
                    </p>
                    <p
                      className={
                        p.dayPnl >= 0 ? "text-[11px] text-profit" : "text-[11px] text-red-300"
                      }
                    >
                      Day {p.dayPnl >= 0 ? "+" : ""}
                      {formatDollar(p.dayPnl)}
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="transparent"
              fill="url(#tradesEquityFill)"
              fillOpacity={1}
              isAnimationActive
              animationDuration={900}
            />
            <Line
              type="monotone"
              dataKey="equity"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: "var(--accent)",
                stroke: "var(--bg-base)",
                strokeWidth: 1,
              }}
              isAnimationActive
              animationDuration={900}
            />
            <Scatter
              dataKey="lossMarker"
              fill="var(--loss)"
              fillOpacity={0.85}
              shape="circle"
              isAnimationActive={false}
            />
          </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
