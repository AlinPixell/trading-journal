"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { loadTrades, saveTrades, XAUUSD_BACKTEST_TRADES_KEY } from "@/lib/xauusdTradeStorage";
import type { XauUsdTrade, XauUsdTradeDirection } from "@/types/xauusd";

function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result ?? ""));
    r.onerror = () => reject(new Error("read failed"));
    r.readAsDataURL(file);
  });
}

type BacktestTradeFormProps = {
  onLogged: () => void;
};

export function BacktestTradeForm({ onLogged }: BacktestTradeFormProps) {
  const [direction, setDirection] = useState<XauUsdTradeDirection>("BUY");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [lots, setLots] = useState("0.10");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [tradeDate, setTradeDate] = useState(todayIsoDate);
  const [notes, setNotes] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);

  const statusPreview = useMemo(() => {
    const ex = exitPrice.trim();
    return ex === "" ? "OPEN" : "CLOSED";
  }, [exitPrice]);

  const onPickScreenshot = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const url = await readFileAsDataUrl(file);
      setScreenshot(url);
      setScreenshotName(file.name);
    } catch {
      setScreenshot(null);
      setScreenshotName(null);
    }
  };

  const submit = () => {
    const entry = Number.parseFloat(entryPrice);
    if (!Number.isFinite(entry)) return;

    const exitRaw = exitPrice.trim();
    const exitParsed =
      exitRaw === "" ? null : Number.parseFloat(exitRaw);
    if (exitRaw !== "" && !Number.isFinite(exitParsed)) return;

    const lotN = Number.parseFloat(lots);
    const lotsFinal = Number.isFinite(lotN) ? lotN : 0.1;

    const slRaw = stopLoss.trim();
    const tpRaw = takeProfit.trim();
    const sl = slRaw === "" ? null : Number.parseFloat(slRaw);
    const tp = tpRaw === "" ? null : Number.parseFloat(tpRaw);

    const tradedAt = new Date(`${tradeDate}T12:00:00`).toISOString();

    const trade: XauUsdTrade = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      direction,
      entryPrice: entry,
      exitPrice: exitParsed != null && Number.isFinite(exitParsed) ? exitParsed : null,
      lots: lotsFinal,
      stopLoss: sl != null && Number.isFinite(sl) ? sl : null,
      takeProfit: tp != null && Number.isFinite(tp) ? tp : null,
      tradedAt,
      notes: notes.trim(),
      backtest: true,
      screenshot,
    };

    const prev = loadTrades(XAUUSD_BACKTEST_TRADES_KEY);
    saveTrades(XAUUSD_BACKTEST_TRADES_KEY, [trade, ...prev]);
    onLogged();

    setEntryPrice("");
    setExitPrice("");
    setLots("0.10");
    setStopLoss("");
    setTakeProfit("");
    setNotes("");
    setScreenshot(null);
    setScreenshotName(null);
  };

  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-5 backdrop-blur-xl sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Backtest trade
          </p>
          <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
            Log from FXReplay (or any session)
          </p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Stored under{" "}
            <span className="font-mono text-[11px] text-[var(--text-muted)]">xauusd-backtest-trades</span>.
          </p>
        </div>
        <span className="rounded-md border border-[color-mix(in_lab,var(--accent)_28%,transparent)] bg-[var(--fx-06)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)]">
          Backtest
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div className="inline-flex rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] p-1">
          {(["BUY", "SELL"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDirection(d)}
              className={cn(
                "min-h-10 rounded px-3 py-2 text-xs font-semibold transition sm:min-h-0",
                direction === d
                  ? "bg-[var(--fx-11)] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_var(--border-soft)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
              )}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Entry price</span>
            <input
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              inputMode="decimal"
              className="min-h-11 w-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Exit price <span className="text-[var(--text-muted)]">(optional)</span>
            </span>
            <input
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
              inputMode="decimal"
              placeholder="Blank keeps OPEN"
              className="min-h-11 w-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Stop loss</span>
            <input
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              inputMode="decimal"
              placeholder="Optional"
              className="min-h-11 w-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Take profit</span>
            <input
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              inputMode="decimal"
              placeholder="Optional"
              className="min-h-11 w-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Lot size</span>
            <input
              value={lots}
              onChange={(e) => setLots(e.target.value)}
              inputMode="decimal"
              className="min-h-11 w-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Date</span>
            <input
              type="date"
              value={tradeDate}
              onChange={(e) => setTradeDate(e.target.value)}
              className="min-h-11 w-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-[var(--text-secondary)]">Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full resize-y rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)]"
          />
        </label>

        <div className="space-y-2">
          <span className="text-xs font-medium text-[var(--text-secondary)]">Screenshot</span>
          <label className="flex cursor-pointer flex-col gap-2 rounded-md border border-dashed border-[var(--border-soft)] bg-[var(--bg-cell)] px-3 py-3 text-xs text-[var(--text-muted)] transition hover:bg-[var(--fx-05)]">
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => void onPickScreenshot(e.target.files)}
            />
            <span>
              {screenshotName ? (
                <span className="font-medium text-[var(--text-secondary)]">{screenshotName}</span>
              ) : (
                "Tap to upload image — stored locally in this browser"
              )}
            </span>
            {screenshot ? (
              <img
                src={screenshot}
                alt=""
                className="max-h-36 w-full rounded-md border border-[var(--border-soft)] object-contain"
              />
            ) : null}
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-md border border-[var(--border-soft)] bg-[var(--fx-05)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            {statusPreview}
          </span>
          <button
            type="button"
            onClick={submit}
            className={cn(
              "inline-flex min-h-11 flex-1 items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-[var(--accent-on-accent)] transition-transform duration-200 ease-out sm:flex-none",
              "bg-[var(--accent)] shadow-[0_-1px_15px_var(--accent-glow)] hover:scale-[1.02] active:scale-[1.01]",
            )}
          >
            Save backtest trade
          </button>
        </div>
      </div>
    </div>
  );
}
