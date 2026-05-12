"use client";

import { useState, useEffect, useMemo, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  selectActiveTrades,
  selectActiveTradingSettings,
  useTradeStore,
} from "@/store/useTradeStore";
import { createTradeFromProfitOnly, isoFromLocalDatePreservingNowTime, tradesForDateKey } from "@/lib/tradeHelpers";
import { formatDollar } from "@/lib/utils";
import { cn } from "@/lib/cn";
import type { TradeDirection } from "@/types/trade";

function newId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type Row = { direction: TradeDirection; profit: string };

export type QuickProfitFormProps = {
  presentation?: "page" | "modal";
  onRequestClose?: () => void;
  onSaved?: () => void;
};

type QuickProfitCardFieldsProps = {
  tradeDate: string;
  setTradeDate: (v: string) => void;
  maxNew: number;
  existingOnDay: number;
  allowedCounts: number[];
  tradeCount: number;
  setTradeCount: (n: number) => void;
  rows: Row[];
  setRows: Dispatch<SetStateAction<Row[]>>;
  previewRoi: number | null;
  totalPnl: number;
  accountBalance: number;
};

function QuickProfitCardFields({
  tradeDate,
  setTradeDate,
  maxNew,
  existingOnDay,
  allowedCounts,
  tradeCount,
  setTradeCount,
  rows,
  setRows,
  previewRoi,
  totalPnl,
  accountBalance,
}: QuickProfitCardFieldsProps) {
  return (
    <>
      <label className="block text-sm font-medium text-[var(--text-secondary)]">Trade date</label>
      <input
        type="date"
        value={tradeDate}
        onChange={(e) => setTradeDate(e.target.value)}
        className="mt-2 w-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-4 py-2.5 text-base text-[var(--text-primary)] outline-none focus:border-[color-mix(in_srgb,var(--accent)_45%,transparent)] sm:text-sm"
      />
      {maxNew === 0 ? (
        <p className="mt-4 text-sm text-amber-200/90">
          This day already has 3 trades. Choose another date or edit an existing trade.
        </p>
      ) : (
        <>
          <p className="mt-4 text-xs text-[var(--text-muted)]">
            {existingOnDay} on this day · {maxNew} slot{maxNew === 1 ? "" : "s"} left
          </p>

          <p className="mt-4 text-sm font-medium text-[var(--text-secondary)]">Number of trades</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {allowedCounts.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setTradeCount(n);
                }}
                className={cn(
                  "rounded-md border px-4 py-2 text-sm font-semibold transition",
                  tradeCount === n
                    ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-[var(--text-primary)]"
                    : "border-[var(--border-soft)] bg-[var(--fx-04)] text-[var(--text-secondary)]"
                )}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-5">
            {rows.map((row, index) => (
              <div
                key={index}
                className="rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)]/80 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Trade {index + 1}
                </p>
                <p className="mt-3 text-sm font-medium text-[var(--text-secondary)]">Side</p>
                <div className="mt-2 flex gap-2">
                  {(["BUY", "SELL"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setRows((r) => r.map((x, j) => (j === index ? { ...x, direction: d } : x)))}
                      className={cn(
                        "flex-1 rounded-md border py-2.5 text-sm font-semibold transition",
                        row.direction === d
                          ? d === "BUY"
                            ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                            : "border-red-400/35 bg-red-500/12 text-red-300"
                          : "border-[var(--border-soft)] bg-[var(--fx-04)] text-[var(--text-muted)]"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <label className="mt-4 block text-sm font-medium text-[var(--text-secondary)]">P/L ($)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 420 or -185"
                  value={row.profit}
                  onChange={(e) =>
                    setRows((r) => r.map((x, j) => (j === index ? { ...x, profit: e.target.value } : x)))
                  }
                  className="mt-2 w-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-4 py-3 text-base font-semibold tabular-nums text-[var(--text-primary)] outline-none focus:border-[color-mix(in_srgb,var(--accent)_45%,transparent)]"
                />
              </div>
            ))}
          </div>

          {previewRoi != null ? (
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              Combined ≈ {totalPnl >= 0 ? "+" : ""}
              {previewRoi.toFixed(2)}% on balance ({formatDollar(accountBalance)})
            </p>
          ) : null}
        </>
      )}
    </>
  );
}

export function QuickProfitForm({
  presentation = "page",
  onRequestClose,
  onSaved,
}: QuickProfitFormProps) {
  const router = useRouter();
  const isModal = presentation === "modal";
  const addTrade = useTradeStore((s) => s.addTrade);
  const trades = useTradeStore(selectActiveTrades);
  const defaultPair = useTradeStore((s) => selectActiveTradingSettings(s).defaultPair);
  const accountBalance = useTradeStore((s) => selectActiveTradingSettings(s).accountBalance);
  const autoCalculations = useTradeStore((s) => s.appSettings.autoCalculations);
  const [tradeDate, setTradeDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [tradeCount, setTradeCount] = useState(1);
  const [rows, setRows] = useState<Row[]>([{ direction: "BUY", profit: "" }]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const existingOnDay = useMemo(() => tradesForDateKey(trades, tradeDate).length, [trades, tradeDate]);
  const maxNew = useMemo(() => Math.max(0, 3 - existingOnDay), [existingOnDay]);

  useEffect(() => {
    setTradeCount((c) => Math.min(Math.max(1, c), Math.max(1, maxNew || 1)));
  }, [maxNew]);

  useEffect(() => {
    setRows((r) => {
      const cap = Math.max(1, maxNew || 1);
      const target = Math.min(tradeCount, cap);
      const next = r.slice(0, target);
      while (next.length < target) {
        next.push({ direction: "BUY", profit: "" });
      }
      return next;
    });
  }, [tradeCount, maxNew]);

  const totalPnl = useMemo(() => {
    return rows.reduce((s, row) => {
      const n = Number.parseFloat(row.profit);
      return s + (Number.isFinite(n) ? n : 0);
    }, 0);
  }, [rows]);

  const valid =
    maxNew > 0 &&
    rows.length > 0 &&
    rows.every((row) => row.profit.trim() !== "" && Number.isFinite(Number.parseFloat(row.profit)));

  const previewRoi =
    autoCalculations && accountBalance > 0 && valid
      ? (rows.reduce((s, row) => s + Number.parseFloat(row.profit), 0) / accountBalance) * 100
      : null;

  const handleSave = () => {
    if (!valid || rows.length > maxNew) return;
    const baseMs = new Date(isoFromLocalDatePreservingNowTime(tradeDate)).getTime();
    for (let i = 0; i < rows.length; i++) {
      const pnlNum = Number.parseFloat(rows[i].profit);
      const trade = createTradeFromProfitOnly({
        id: newId(),
        pnl: pnlNum,
        direction: rows[i].direction,
        defaultPair,
        accountBalance,
        autoCalculations,
        createdAt: new Date(baseMs + i * 1000).toISOString(),
      });
      const res = addTrade(trade);
      if (!res.ok) {
        alert(res.error ?? "Could not add trade.");
        return;
      }
    }
    if (onSaved) {
      onSaved();
    } else {
      router.push("/");
    }
  };

  const handleCancel = () => {
    if (onRequestClose) {
      onRequestClose();
    } else {
      router.push("/");
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-[40vh] px-5 py-12">
        <div className="mx-auto max-w-md animate-pulse space-y-4">
          <div className="h-8 w-36 rounded-md bg-[var(--fx-06)]" />
          <div className="h-24 rounded-md bg-[var(--fx-04)]" />
        </div>
      </div>
    );
  }

  const allowedCounts = [1, 2, 3].filter((n) => n <= maxNew);

  return (
    <div
      className={
        isModal
          ? "flex h-full min-h-0 flex-1 flex-col px-0 pb-0 pt-1"
          : "min-h-screen px-5 pb-[calc(8rem+env(safe-area-inset-bottom,0px))] pt-10 sm:px-10"
      }
    >
      <div
        className={cn(
          "mx-auto max-w-md",
          isModal ? "flex h-full min-h-0 min-w-0 flex-1 flex-col gap-5 pr-8 sm:pr-0" : "space-y-6"
        )}
      >
        <header className={cn(isModal && "shrink-0")}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">New trade</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Log results</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Pick the date, how many fills you are logging (up to {maxNew || 0} left on this day), and BUY or SELL plus P/L
            for each.
          </p>
        </header>

        {isModal ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-y-contain rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-6 [scrollbar-gutter:stable] backdrop-blur-xl"
              )}
            >
              <QuickProfitCardFields
                tradeDate={tradeDate}
                setTradeDate={setTradeDate}
                maxNew={maxNew}
                existingOnDay={existingOnDay}
                allowedCounts={allowedCounts}
                tradeCount={tradeCount}
                setTradeCount={setTradeCount}
                rows={rows}
                setRows={setRows}
                previewRoi={previewRoi}
                totalPnl={totalPnl}
                accountBalance={accountBalance}
              />
            </div>
            <p className="shrink-0 text-xs text-[var(--text-muted)]">
              Add levels, notes, or screenshots later from the calendar → trade → Edit.
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-6 backdrop-blur-xl">
            <QuickProfitCardFields
              tradeDate={tradeDate}
              setTradeDate={setTradeDate}
              maxNew={maxNew}
              existingOnDay={existingOnDay}
              allowedCounts={allowedCounts}
              tradeCount={tradeCount}
              setTradeCount={setTradeCount}
              rows={rows}
              setRows={setRows}
              previewRoi={previewRoi}
              totalPnl={totalPnl}
              accountBalance={accountBalance}
            />
          </div>
        )}

        {!isModal ? (
          <p className="text-xs text-[var(--text-muted)]">
            Add levels, notes, or screenshots later from the calendar → trade → Edit.
          </p>
        ) : null}
      </div>

      {isModal ? (
        <div className="mx-auto flex w-full max-w-md shrink-0 flex-col-reverse gap-3 border-t border-[var(--border-soft)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleCancel}
            className="w-full rounded-md border border-[var(--border-soft)] bg-[var(--fx-05)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)] sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!valid}
            onClick={handleSave}
            className={cn(
              "w-full rounded-md px-6 py-3 text-sm font-semibold transition sm:w-auto",
              valid
                ? "bg-[var(--accent)] text-[var(--accent-on-accent)] shadow-[0_8px_28px_var(--accent-glow)] hover:brightness-110"
                : "cursor-not-allowed bg-[var(--fx-08)] text-[var(--text-muted)]"
            )}
          >
            Save {rows.length === 1 ? "trade" : `${rows.length} trades`}
          </button>
        </div>
      ) : (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--bg-raised)_92%,transparent)] px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] backdrop-blur-xl">
          <div className="mx-auto flex max-w-md flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full rounded-md border border-[var(--border-soft)] bg-[var(--fx-05)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)] sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!valid}
              onClick={handleSave}
              className={cn(
                "w-full rounded-md px-6 py-3 text-sm font-semibold transition sm:w-auto",
                valid
                  ? "bg-[var(--accent)] text-[var(--accent-on-accent)] shadow-[0_8px_28px_var(--accent-glow)] hover:brightness-110"
                  : "cursor-not-allowed bg-[var(--fx-08)] text-[var(--text-muted)]"
              )}
            >
              Save {rows.length === 1 ? "trade" : `${rows.length} trades`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
