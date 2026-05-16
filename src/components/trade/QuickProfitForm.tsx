"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  selectActiveTrades,
  selectActiveTradingSettings,
  useTradeStore,
} from "@/store/useTradeStore";
import {
  createTradeFromProfitOnly,
  isoFromLocalDatePreservingNowTime,
  tradesForDateKey,
} from "@/lib/tradeHelpers";
import { formatDollar } from "@/lib/utils";
import { cn } from "@/lib/cn";
import type { TradeDirection } from "@/types/trade";
import { Plus } from "lucide-react";

/** Quick log on full `/new` page — many fills in one save. */
const MAX_QUICK_BATCH_PAGE = 10;
/** Log trade modal — up to 3 quick rows; use + for full editor. */
const MAX_QUICK_BATCH_MODAL = 3;

function newId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
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
  existingOnDay: number;
  batchCountOptions: number[];
  tradeCount: number;
  setTradeCount: (n: number) => void;
  rows: Row[];
  setRows: Dispatch<SetStateAction<Row[]>>;
  previewRoi: number | null;
  accountBalance: number;
  showFullTradeEditor?: boolean;
  onOpenFullTradeEditor?: () => void;
};

function QuickProfitCardFields({
  tradeDate,
  setTradeDate,
  existingOnDay,
  batchCountOptions,
  tradeCount,
  setTradeCount,
  rows,
  setRows,
  previewRoi,
  accountBalance,
  showFullTradeEditor,
  onOpenFullTradeEditor,
}: QuickProfitCardFieldsProps) {
  return (
    <>
      <label className="block text-sm font-medium text-[var(--text-secondary)]">
        Trade date
      </label>
      <input
        type="date"
        value={tradeDate}
        onChange={(e) => setTradeDate(e.target.value)}
        className="mt-2 w-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-4 py-2.5 text-base text-[var(--text-primary)] outline-none focus:border-[color-mix(in_srgb,var(--accent)_45%,transparent)] sm:text-sm"
      />
      <p className="mt-4 text-xs text-[var(--text-muted)]">
        {existingOnDay} already logged on this date
      </p>

      <p className="mt-4 text-sm font-medium text-[var(--text-secondary)]">
        Number of trades
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {batchCountOptions.map((n) => (
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
                : "border-[var(--border-soft)] bg-[var(--fx-04)] text-[var(--text-secondary)]",
            )}
          >
            {n}
          </button>
        ))}
        {showFullTradeEditor && onOpenFullTradeEditor ? (
          <button
            type="button"
            onClick={onOpenFullTradeEditor}
            className="flex min-h-[42px] min-w-[42px] items-center justify-center rounded-md border border-dashed border-[var(--border-soft)] bg-[var(--fx-04)] text-[var(--text-secondary)] transition hover:border-[color-mix(in_srgb,var(--accent)_45%,transparent)] hover:text-[var(--text-primary)]"
            aria-label="Open full trade form with more fields"
            title="Full trade form"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </button>
        ) : null}
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
            <p className="mt-3 text-sm font-medium text-[var(--text-secondary)]">
              Side
            </p>
            <div className="mt-2 flex gap-2">
              {(["BUY", "SELL"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() =>
                    setRows((r) =>
                      r.map((x, j) =>
                        j === index ? { ...x, direction: d } : x,
                      ),
                    )
                  }
                  className={cn(
                    "flex-1 rounded-md border py-2.5 text-sm font-semibold transition",
                    row.direction === d
                      ? d === "BUY"
                        ? "border-profit/40 bg-profit/15 text-profit"
                        : "border-red-400/35 bg-red-500/12 text-red-300"
                      : "border-[var(--border-soft)] bg-[var(--fx-04)] text-[var(--text-muted)]",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
            <label className="mt-4 block text-sm font-medium text-[var(--text-secondary)]">
              P/L ($)
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="e.g. 420 or -185"
              value={row.profit}
              onChange={(e) =>
                setRows((r) =>
                  r.map((x, j) =>
                    j === index ? { ...x, profit: e.target.value } : x,
                  ),
                )
              }
              className="mt-2 w-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-4 py-3 text-base font-semibold tabular-nums text-[var(--text-primary)] outline-none focus:border-[color-mix(in_srgb,var(--accent)_45%,transparent)]"
            />
          </div>
        ))}
      </div>

      {previewRoi != null ? (
        <p className="mt-4 text-sm text-[var(--text-muted)]">
          Combined ≈{" "}
          <span
            className={cn(
              "font-medium tabular-nums",
              previewRoi > 0
                ? "text-profit"
                : previewRoi < 0
                  ? "text-red-300/90"
                  : "text-[var(--text-secondary)]",
            )}
          >
            {Math.abs(previewRoi).toFixed(2)}%
          </span>{" "}
          on balance ({formatDollar(accountBalance)})
        </p>
      ) : null}
    </>
  );
}

export function QuickProfitForm({
  presentation = "page",
  onRequestClose,
  onSaved,
}: QuickProfitFormProps) {
  const isModal = presentation === "modal";
  const maxBatch = isModal ? MAX_QUICK_BATCH_MODAL : MAX_QUICK_BATCH_PAGE;
  const batchCountOptions = useMemo(
    () => Array.from({ length: maxBatch }, (_, i) => i + 1),
    [maxBatch],
  );

  const router = useRouter();
  const addTrade = useTradeStore((s) => s.addTrade);
  const trades = useTradeStore(selectActiveTrades);
  const defaultPair = useTradeStore(
    (s) => selectActiveTradingSettings(s).defaultPair,
  );
  const accountBalance = useTradeStore(
    (s) => selectActiveTradingSettings(s).accountBalance,
  );
  const autoCalculations = useTradeStore((s) => s.appSettings.autoCalculations);
  const [tradeDate, setTradeDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [tradeCount, setTradeCount] = useState(1);
  const [rows, setRows] = useState<Row[]>([{ direction: "BUY", profit: "" }]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const existingOnDay = useMemo(
    () => tradesForDateKey(trades, tradeDate).length,
    [trades, tradeDate],
  );

  useEffect(() => {
    setRows((r) => {
      const target = Math.min(tradeCount, maxBatch);
      const next = r.slice(0, target);
      while (next.length < target) {
        next.push({ direction: "BUY", profit: "" });
      }
      return next;
    });
  }, [tradeCount, maxBatch]);

  const valid =
    rows.length > 0 &&
    rows.every(
      (row) =>
        row.profit.trim() !== "" &&
        Number.isFinite(Number.parseFloat(row.profit)),
    );

  const previewRoi =
    autoCalculations && accountBalance > 0 && valid
      ? (rows.reduce((s, row) => s + Number.parseFloat(row.profit), 0) /
          accountBalance) *
        100
      : null;

  const handleSave = () => {
    if (!valid) return;
    const baseMs = new Date(
      isoFromLocalDatePreservingNowTime(tradeDate),
    ).getTime();
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

  const handleOpenFullTradeEditor = useCallback(() => {
    router.push(`/new/detail?date=${encodeURIComponent(tradeDate)}`);
    onRequestClose?.();
  }, [router, tradeDate, onRequestClose]);

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
          isModal
            ? "flex h-full min-h-0 min-w-0 flex-1 flex-col gap-5 pr-8 sm:pr-0"
            : "space-y-6",
        )}
      >
        <header className={cn(isModal && "shrink-0")}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            New trade
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Log results
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {isModal ? (
              <>
                Log up to {maxBatch} quick fills (side + P/L), or tap{" "}
                <span className="font-medium text-[var(--text-primary)]">
                  +
                </span>{" "}
                for the full form (prices, notes, screenshots) on the date you
                picked.
              </>
            ) : (
              <>
                Pick the date, how many fills you are logging in one go (up to{" "}
                {maxBatch}; save again for more), and BUY or SELL plus P/L for
                each.
              </>
            )}
          </p>
        </header>

        {isModal ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-y-contain rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-6 [scrollbar-gutter:stable] backdrop-blur-xl",
              )}
            >
              <QuickProfitCardFields
                tradeDate={tradeDate}
                setTradeDate={setTradeDate}
                existingOnDay={existingOnDay}
                batchCountOptions={batchCountOptions}
                tradeCount={tradeCount}
                setTradeCount={setTradeCount}
                rows={rows}
                setRows={setRows}
                previewRoi={previewRoi}
                accountBalance={accountBalance}
                showFullTradeEditor
                onOpenFullTradeEditor={handleOpenFullTradeEditor}
              />
            </div>
            <p className="shrink-0 text-xs text-[var(--text-muted)]">
              Need more rows? Use + for the full trade form, or save and open
              this log again.
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-6 backdrop-blur-xl">
            <QuickProfitCardFields
              tradeDate={tradeDate}
              setTradeDate={setTradeDate}
              existingOnDay={existingOnDay}
              batchCountOptions={batchCountOptions}
              tradeCount={tradeCount}
              setTradeCount={setTradeCount}
              rows={rows}
              setRows={setRows}
              previewRoi={previewRoi}
              accountBalance={accountBalance}
            />
          </div>
        )}

        {!isModal ? (
          <p className="text-xs text-[var(--text-muted)]">
            Add levels, notes, or screenshots later from the calendar → trade →
            Edit.
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
                : "cursor-not-allowed bg-[var(--fx-08)] text-[var(--text-muted)]",
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
                  : "cursor-not-allowed bg-[var(--fx-08)] text-[var(--text-muted)]",
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
