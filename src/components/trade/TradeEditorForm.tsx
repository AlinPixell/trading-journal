"use client";

import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Trade, TradeDirection } from "@/types/trade";
import { syncDerivedFields, canAddTradeForDate } from "@/lib/tradeHelpers";
import { getDateKey } from "@/lib/utils";
import { useTradeStore } from "@/store/useTradeStore";
import { cn } from "@/lib/cn";

const allTags = ["Momentum", "Swing", "Scalping", "Breakout", "Trend", "Risk Managed"];
const allChecklist = ["Entry Validated", "Risk < 1%", "Setup Reviewed", "News Checked", "Price Action Confirmed"];

function isoFromParts(dateStr: string, timeStr: string) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [hh, mm, ss] = timeStr.split(":").map(Number);
  const dt = new Date(y, mo - 1, d, hh ?? 0, mm ?? 0, ss ?? 0, 0);
  return dt.toISOString();
}

function partsFromIso(iso: string) {
  const dt = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const dateStr = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
  const timeStr = `${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
  return { dateStr, timeStr };
}

export function TradeEditorForm({
  trade,
  onSave,
  onCancel,
  isNew,
}: {
  trade: Trade;
  onSave: (trade: Trade) => void;
  onCancel: () => void;
  isNew: boolean;
}) {
  const router = useRouter();
  const trades = useTradeStore((s) => s.trades);
  const tradingSettings = useTradeStore((s) => s.tradingSettings);
  const autoCalculations = useTradeStore((s) => s.appSettings.autoCalculations);

  const { dateStr: d0, timeStr: t0 } = useMemo(() => partsFromIso(trade.createdAt), [trade.createdAt]);

  const [pair, setPair] = useState(trade.pair);
  const [title, setTitle] = useState(trade.title);
  const [direction, setDirection] = useState<TradeDirection>(trade.direction);
  const [pnl, setPnl] = useState(String(trade.pnl));
  const [entryPrice, setEntryPrice] = useState(String(trade.entryPrice));
  const [stopPrice, setStopPrice] = useState(String(trade.stopPrice));
  const [takeProfitPrice, setTakeProfitPrice] = useState(String(trade.takeProfitPrice));
  const [takeProfitHitPrice, setTakeProfitHitPrice] = useState(String(trade.takeProfitHitPrice));
  const [dateStr, setDateStr] = useState(d0);
  const [timeStr, setTimeStr] = useState(t0);
  const [notes, setNotes] = useState(trade.notes);
  const [personalInfo, setPersonalInfo] = useState(trade.personalInfo);
  const [confidence, setConfidence] = useState(trade.confidence);
  const [rating, setRating] = useState(trade.rating);
  const [tags, setTags] = useState<string[]>(trade.tags);
  const [checklist, setChecklist] = useState<string[]>(trade.checklist);
  const [screenshots, setScreenshots] = useState<string[]>(trade.screenshots);

  useEffect(() => {
    const { dateStr: d, timeStr: t } = partsFromIso(trade.createdAt);
    setPair(trade.pair);
    setTitle(trade.title);
    setDirection(trade.direction);
    setPnl(String(trade.pnl));
    setEntryPrice(String(trade.entryPrice));
    setStopPrice(String(trade.stopPrice));
    setTakeProfitPrice(String(trade.takeProfitPrice));
    setTakeProfitHitPrice(String(trade.takeProfitHitPrice));
    setDateStr(d);
    setTimeStr(t);
    setNotes(trade.notes);
    setPersonalInfo(trade.personalInfo);
    setConfidence(trade.confidence);
    setRating(trade.rating);
    setTags(trade.tags);
    setChecklist(trade.checklist);
    setScreenshots(trade.screenshots);
  }, [trade]);

  const builtTrade = useMemo((): Trade | null => {
    const pnlNum = Number.parseFloat(pnl);
    if (Number.isNaN(pnlNum)) return null;
    const createdAt = isoFromParts(dateStr, timeStr);
    const base: Trade = {
      ...trade,
      pair: pair.trim() || tradingSettings.defaultPair,
      title: title.trim() || `${pair} session`,
      direction,
      pnl: pnlNum,
      entryPrice: Number.parseFloat(entryPrice) || 0,
      stopPrice: Number.parseFloat(stopPrice) || 0,
      takeProfitPrice: Number.parseFloat(takeProfitPrice) || 0,
      takeProfitHitPrice: Number.parseFloat(takeProfitHitPrice) || 0,
      netROI: trade.netROI,
      notes,
      personalInfo,
      confidence,
      rating,
      tags,
      checklist,
      screenshots,
      createdAt,
    };
    return syncDerivedFields(base, tradingSettings.accountBalance, autoCalculations);
  }, [
    trade,
    pair,
    title,
    direction,
    pnl,
    entryPrice,
    stopPrice,
    takeProfitPrice,
    takeProfitHitPrice,
    dateStr,
    timeStr,
    notes,
    personalInfo,
    confidence,
    rating,
    tags,
    checklist,
    screenshots,
    tradingSettings.accountBalance,
    tradingSettings.defaultPair,
    autoCalculations,
  ]);

  const slotFree = useMemo(() => {
    if (!builtTrade) return false;
    if (!isNew && getDateKey(builtTrade.createdAt) === getDateKey(trade.createdAt)) return true;
    return canAddTradeForDate(trades, builtTrade.createdAt);
  }, [builtTrade, isNew, trades, trade.createdAt]);

  const handleSubmit = () => {
    if (!builtTrade || !slotFree) return;
    onSave(builtTrade);
    router.push(isNew ? "/" : "/");
  };

  const inputClass =
    "w-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[color-mix(in_srgb,var(--accent)_45%,transparent)]";

  return (
    <div className="min-h-screen px-5 pb-32 pt-8 text-[var(--text-primary)] sm:px-10 lg:px-14">
      <div className="mx-auto max-w-4xl space-y-8">
        <header>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            {isNew ? "New trade" : "Edit trade"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{pair || "Instrument"}</h1>
        </header>

        <section className="grid gap-6 rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/80 p-6 backdrop-blur-xl sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-[var(--text-secondary)]">
              Pair / symbol
              <input className={cn(inputClass, "mt-2")} value={pair} onChange={(e) => setPair(e.target.value)} placeholder="XAUUSD" />
            </label>
            <label className="block text-sm text-[var(--text-secondary)]">
              Title
              <input className={cn(inputClass, "mt-2")} value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="block text-sm text-[var(--text-secondary)]">
              Direction
              <select
                className={cn(inputClass, "mt-2")}
                value={direction}
                onChange={(e) => setDirection(e.target.value as TradeDirection)}
              >
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </label>
            <label className="block text-sm text-[var(--text-secondary)]">
              P/L (account currency)
              <input className={cn(inputClass, "mt-2")} value={pnl} onChange={(e) => setPnl(e.target.value)} inputMode="decimal" />
            </label>
            <label className="block text-sm text-[var(--text-secondary)]">
              Entry price
              <input className={cn(inputClass, "mt-2")} value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} />
            </label>
            <label className="block text-sm text-[var(--text-secondary)]">
              Stop loss
              <input className={cn(inputClass, "mt-2")} value={stopPrice} onChange={(e) => setStopPrice(e.target.value)} />
            </label>
            <label className="block text-sm text-[var(--text-secondary)]">
              Take profit
              <input className={cn(inputClass, "mt-2")} value={takeProfitPrice} onChange={(e) => setTakeProfitPrice(e.target.value)} />
            </label>
            <label className="block text-sm text-[var(--text-secondary)]">
              TP hit price
              <input
                className={cn(inputClass, "mt-2")}
                value={takeProfitHitPrice}
                onChange={(e) => setTakeProfitHitPrice(e.target.value)}
              />
            </label>
            <label className="block text-sm text-[var(--text-secondary)]">
              Date
              <input className={cn(inputClass, "mt-2")} type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} />
            </label>
            <label className="block text-sm text-[var(--text-secondary)]">
              Time (HH:MM:SS)
              <input
                className={cn(inputClass, "mt-2")}
                type="text"
                inputMode="numeric"
                placeholder="14:32:08"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
              />
            </label>
          </div>

          {!slotFree ? (
            <p className="rounded-md border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              This day already has the maximum of 3 trades.
            </p>
          ) : null}

          <label className="block text-sm text-[var(--text-secondary)]">
            Notes
            <textarea className={cn(inputClass, "mt-2 min-h-[120px]")} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>

          <div>
            <p className="text-sm text-[var(--text-secondary)]">Screenshot</p>
            <input
              type="file"
              accept="image/*"
              className="mt-2 text-sm text-[var(--text-muted)]"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === "string") {
                    setScreenshots((c) => [reader.result as string, ...c].slice(0, 4));
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
            {screenshots.length > 0 ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {screenshots.map((src, i) => (
                  <div key={i} className="relative overflow-hidden rounded-md border border-[var(--border-soft)]">
                    <img src={src} alt="" className="h-40 w-full object-cover" />
                    <button
                      type="button"
                      className="absolute right-2 top-2 rounded-sm bg-black/70 px-2 py-1 text-xs text-white"
                      onClick={() => setScreenshots((c) => c.filter((_, j) => j !== i))}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm text-[var(--text-secondary)]">Tags</p>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setTags((cur) => (cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag]))
                    }
                    className={cn(
                      "rounded-sm border px-3 py-1.5 text-xs font-medium transition",
                      tags.includes(tag)
                        ? "border-[color-mix(in_srgb,var(--accent)_50%,transparent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]"
                        : "border-[var(--border-soft)] bg-white/[0.04] text-[var(--text-secondary)]"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm text-[var(--text-secondary)]">Checklist</p>
              <div className="space-y-2">
                {allChecklist.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setChecklist((cur) => (cur.includes(item) ? cur.filter((x) => x !== item) : [...cur, item]))
                    }
                    className={cn(
                      "flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition",
                      checklist.includes(item)
                        ? "border-[color-mix(in_srgb,var(--accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]"
                        : "border-[var(--border-soft)] bg-white/[0.04] text-[var(--text-secondary)]"
                    )}
                  >
                    <span>{item}</span>
                    <span>{checklist.includes(item) ? "✓" : ""}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label className="block text-sm text-[var(--text-secondary)]">
            Personal reflection
            <textarea className={cn(inputClass, "mt-2 min-h-[100px]")} value={personalInfo} onChange={(e) => setPersonalInfo(e.target.value)} />
          </label>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--bg-raised)_92%,transparent)] px-5 py-4 backdrop-blur-2xl sm:px-10">
        <div className="mx-auto flex max-w-4xl items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-[var(--border-soft)] bg-white/[0.05] px-6 py-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-white/[0.09]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!builtTrade || !slotFree}
            onClick={handleSubmit}
            className="rounded-md bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#111] shadow-[0_8px_28px_var(--accent-glow)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isNew ? "Save trade" : "Update trade"}
          </button>
        </div>
      </div>
    </div>
  );
}
