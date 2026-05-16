"use client";

import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Trade, TradeDirection } from "@/types/trade";
import { syncDerivedFields } from "@/lib/tradeHelpers";
import { TRADE_STRATEGY_PRESETS, TRADE_TAG_PRESETS } from "@/lib/tradeTaxonomy";
import { selectActiveTradingSettings, useTradeStore } from "@/store/useTradeStore";
import { cn } from "@/lib/cn";
import { datetimeLocalInputToIso, formatDurationBetween, isoToDatetimeLocalValue } from "@/lib/datetimeLocal";
import { estimateClosedTradePnlUsd } from "@/lib/estimatedTradePnl";
import { formatDollar } from "@/lib/utils";

const allTags = [...TRADE_TAG_PRESETS];
const allStrategies = [...TRADE_STRATEGY_PRESETS];
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
  variant = "default",
}: {
  trade: Trade;
  /** Return `false` to stay on the page (e.g. add rejected). */
  onSave: (trade: Trade) => void | boolean;
  onCancel: () => void;
  isNew: boolean;
  variant?: "default" | "detailed";
}) {
  const router = useRouter();
  const autoCalculations = useTradeStore((s) => s.appSettings.autoCalculations);
  const accountBalanceLive = useTradeStore((s) => selectActiveTradingSettings(s).accountBalance);
  const leverageLive = useTradeStore((s) => selectActiveTradingSettings(s).leverage);
  const defaultPairLive = useTradeStore((s) => selectActiveTradingSettings(s).defaultPair);
  const preferredLotLive = useTradeStore((s) => selectActiveTradingSettings(s).preferredLotSize);
  const defaultLotLive = useTradeStore((s) => selectActiveTradingSettings(s).defaultLotSize);

  const { dateStr: d0, timeStr: t0 } = useMemo(() => partsFromIso(trade.createdAt), [trade.createdAt]);

  const [pair, setPair] = useState(trade.pair);
  const [title, setTitle] = useState(trade.title);
  const [direction, setDirection] = useState<TradeDirection>(trade.direction);
  const [pnl, setPnl] = useState(String(trade.pnl));
  const [entryPrice, setEntryPrice] = useState(String(trade.entryPrice));
  const [stopPrice, setStopPrice] = useState(String(trade.stopPrice));
  const [takeProfitPrice, setTakeProfitPrice] = useState(String(trade.takeProfitPrice));
  const [takeProfitHitPrice, setTakeProfitHitPrice] = useState(String(trade.takeProfitHitPrice));
  const [stopLossHitStr, setStopLossHitStr] = useState(String(trade.stopLossHitPrice ?? 0));
  const [dateStr, setDateStr] = useState(d0);
  const [timeStr, setTimeStr] = useState(t0);
  const [startLocal, setStartLocal] = useState(() => isoToDatetimeLocalValue(trade.createdAt));
  const [endLocal, setEndLocal] = useState(() =>
    isoToDatetimeLocalValue(trade.tradeEndedAt ?? trade.createdAt),
  );
  const [notes, setNotes] = useState(trade.notes);
  const [personalInfo, setPersonalInfo] = useState(trade.personalInfo);
  const [confidence, setConfidence] = useState(trade.confidence);
  const [rating, setRating] = useState(trade.rating);
  const [tags, setTags] = useState<string[]>(trade.tags);
  const [strategies, setStrategies] = useState<string[]>(trade.strategies ?? []);
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
    setStopLossHitStr(String(trade.stopLossHitPrice ?? 0));
    setDateStr(d);
    setTimeStr(t);
    setStartLocal(isoToDatetimeLocalValue(trade.createdAt));
    setEndLocal(isoToDatetimeLocalValue(trade.tradeEndedAt ?? trade.createdAt));
    setNotes(trade.notes);
    setPersonalInfo(trade.personalInfo);
    setConfidence(trade.confidence);
    setRating(trade.rating);
    setTags(trade.tags);
    setStrategies(trade.strategies ?? []);
    setChecklist(trade.checklist);
    setScreenshots(trade.screenshots);
  }, [trade]);

  const lotForCalc = preferredLotLive > 0 ? preferredLotLive : defaultLotLive;

  const detailedPnlEstimate = useMemo(() => {
    if (variant !== "detailed") return null;
    const ep = Number.parseFloat(entryPrice);
    const sp = Number.parseFloat(stopPrice);
    const tp = Number.parseFloat(takeProfitPrice);
    const slHitN = Number.parseFloat(stopLossHitStr);
    const tpHitN = Number.parseFloat(takeProfitHitPrice);
    if (![ep, sp, tp, slHitN, tpHitN].every(Number.isFinite)) return null;
    return estimateClosedTradePnlUsd({
      pair: pair.trim() || defaultPairLive,
      direction,
      entry: ep,
      stopPlanned: sp,
      takeProfitPlanned: tp,
      slHit: slHitN,
      tpHit: tpHitN,
      lotSize: lotForCalc,
      leverage: leverageLive,
      accountBalance: accountBalanceLive,
    });
  }, [
    variant,
    entryPrice,
    stopPrice,
    takeProfitPrice,
    stopLossHitStr,
    takeProfitHitPrice,
    pair,
    direction,
    lotForCalc,
    leverageLive,
    accountBalanceLive,
    defaultPairLive,
  ]);

  const tradeDurationLabel = useMemo(() => {
    if (variant !== "detailed") return "";
    const a = datetimeLocalInputToIso(startLocal);
    const b = datetimeLocalInputToIso(endLocal);
    if (!a || !b) return "—";
    return formatDurationBetween(a, b);
  }, [variant, startLocal, endLocal]);

  const builtTrade = useMemo((): Trade | null => {
    if (variant === "detailed") {
      const startIso = datetimeLocalInputToIso(startLocal);
      const endIso = datetimeLocalInputToIso(endLocal);
      if (!startIso || !endIso) return null;
      const ep = Number.parseFloat(entryPrice);
      const sp = Number.parseFloat(stopPrice);
      const tp = Number.parseFloat(takeProfitPrice);
      const slHitN = Number.parseFloat(stopLossHitStr);
      const tpHitN = Number.parseFloat(takeProfitHitPrice);
      if (![ep, sp, tp, slHitN, tpHitN].every(Number.isFinite)) return null;
      const pnlEst = estimateClosedTradePnlUsd({
        pair: pair.trim() || defaultPairLive,
        direction,
        entry: ep,
        stopPlanned: sp,
        takeProfitPlanned: tp,
        slHit: slHitN,
        tpHit: tpHitN,
        lotSize: lotForCalc,
        leverage: leverageLive,
        accountBalance: accountBalanceLive,
      });
      if (pnlEst == null || !Number.isFinite(pnlEst)) return null;
      const base: Trade = {
        ...trade,
        pair: pair.trim() || defaultPairLive,
        title: title.trim() || `${pair} session`,
        direction,
        pnl: pnlEst,
        entryPrice: ep,
        stopPrice: sp,
        takeProfitPrice: tp,
        takeProfitHitPrice: tpHitN,
        stopLossHitPrice: slHitN,
        netROI: trade.netROI,
        notes,
        personalInfo,
        confidence,
        rating,
        tags,
        strategies,
        checklist,
        screenshots,
        createdAt: startIso,
        tradeEndedAt: endIso,
      };
      return syncDerivedFields(base, accountBalanceLive, autoCalculations);
    }

    const pnlNum = Number.parseFloat(pnl);
    if (Number.isNaN(pnlNum)) return null;
    const createdAt = isoFromParts(dateStr, timeStr);
    const slHitN = Number.parseFloat(stopLossHitStr);
    const base: Trade = {
      ...trade,
      pair: pair.trim() || defaultPairLive,
      title: title.trim() || `${pair} session`,
      direction,
      pnl: pnlNum,
      entryPrice: Number.parseFloat(entryPrice) || 0,
      stopPrice: Number.parseFloat(stopPrice) || 0,
      takeProfitPrice: Number.parseFloat(takeProfitPrice) || 0,
      takeProfitHitPrice: Number.parseFloat(takeProfitHitPrice) || 0,
      stopLossHitPrice: Number.isFinite(slHitN) ? slHitN : trade.stopLossHitPrice ?? 0,
      netROI: trade.netROI,
      notes,
      personalInfo,
      confidence,
      rating,
      tags,
      strategies,
      checklist,
      screenshots,
      createdAt,
      tradeEndedAt: trade.tradeEndedAt,
    };
    return syncDerivedFields(base, accountBalanceLive, autoCalculations);
  }, [
    variant,
    trade,
    pair,
    title,
    direction,
    pnl,
    entryPrice,
    stopPrice,
    takeProfitPrice,
    takeProfitHitPrice,
    stopLossHitStr,
    dateStr,
    timeStr,
    startLocal,
    endLocal,
    notes,
    personalInfo,
    confidence,
    rating,
    tags,
    strategies,
    checklist,
    screenshots,
    accountBalanceLive,
    defaultPairLive,
    leverageLive,
    preferredLotLive,
    defaultLotLive,
    autoCalculations,
  ]);

  const handleSubmit = () => {
    if (!builtTrade) return;
    const proceed = onSave(builtTrade);
    if (proceed === false) return;
    router.push(isNew ? "/" : "/");
  };

  const inputClass =
    "w-full rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)] px-4 py-3 text-base text-[var(--text-primary)] outline-none transition focus:border-[color-mix(in_srgb,var(--accent)_45%,transparent)] sm:text-sm";

  return (
    <div className="min-h-screen px-5 pb-[calc(9rem+env(safe-area-inset-bottom,0px))] pt-8 text-[var(--text-primary)] sm:px-10 lg:px-14">
      <div className="mx-auto max-w-4xl space-y-8">
        <header>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            {isNew ? "New trade" : "Edit trade"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{pair || "Instrument"}</h1>
        </header>

        <section className="grid gap-6 rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/80 p-6 backdrop-blur-xl sm:p-8">
          {variant === "detailed" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm text-[var(--text-secondary)]">
                  Pair / symbol
                  <input
                    className={cn(inputClass, "mt-2")}
                    value={pair}
                    onChange={(e) => setPair(e.target.value)}
                    placeholder="XAUUSD"
                  />
                </label>
                <label className="block text-sm text-[var(--text-secondary)]">
                  Title
                  <input className={cn(inputClass, "mt-2")} value={title} onChange={(e) => setTitle(e.target.value)} />
                </label>
                <label className="block text-sm text-[var(--text-secondary)] sm:col-span-2">
                  Direction
                  <select
                    className={cn(inputClass, "mt-2 max-w-md")}
                    value={direction}
                    onChange={(e) => setDirection(e.target.value as TradeDirection)}
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </label>
              </div>

              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">Planned levels</p>
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <label className="block text-sm text-[var(--text-secondary)]">
                    Stop loss
                    <input
                      className={cn(inputClass, "mt-2")}
                      value={stopPrice}
                      onChange={(e) => setStopPrice(e.target.value)}
                      inputMode="decimal"
                    />
                  </label>
                  <label className="block text-sm text-[var(--text-secondary)]">
                    Entry price
                    <input
                      className={cn(inputClass, "mt-2")}
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                      inputMode="decimal"
                    />
                  </label>
                  <label className="block text-sm text-[var(--text-secondary)]">
                    Take profit
                    <input
                      className={cn(inputClass, "mt-2")}
                      value={takeProfitPrice}
                      onChange={(e) => setTakeProfitPrice(e.target.value)}
                      inputMode="decimal"
                    />
                  </label>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm text-[var(--text-secondary)]">
                  SL hit price
                  <input
                    className={cn(inputClass, "mt-2")}
                    value={stopLossHitStr}
                    onChange={(e) => setStopLossHitStr(e.target.value)}
                    inputMode="decimal"
                  />
                </label>
                <label className="block text-sm text-[var(--text-secondary)]">
                  TP hit price
                  <input
                    className={cn(inputClass, "mt-2")}
                    value={takeProfitHitPrice}
                    onChange={(e) => setTakeProfitHitPrice(e.target.value)}
                    inputMode="decimal"
                  />
                </label>
              </div>

              <div className="rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)]/60 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Estimated P/L (account currency)
                </p>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
                  {detailedPnlEstimate != null && Number.isFinite(detailedPnlEstimate) ? (
                    <span
                      className={cn(
                        detailedPnlEstimate > 0
                          ? "text-profit"
                          : detailedPnlEstimate < 0
                            ? "text-red-300/90"
                            : "text-[var(--text-primary)]",
                      )}
                    >
                      {formatDollar(detailedPnlEstimate, { unsigned: true })}
                    </span>
                  ) : (
                    "—"
                  )}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
                  Uses profile trading settings: balance {formatDollar(accountBalanceLive)}, lot{" "}
                  {Math.round(lotForCalc)}, leverage 1:{Math.round(leverageLive)}. Model is approximate (contract factor
                  from symbol), not a broker statement.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm text-[var(--text-secondary)]">
                  Start time
                  <input
                    className={cn(inputClass, "mt-2")}
                    type="datetime-local"
                    value={startLocal}
                    onChange={(e) => setStartLocal(e.target.value)}
                  />
                </label>
                <label className="block text-sm text-[var(--text-secondary)]">
                  End time
                  <input
                    className={cn(inputClass, "mt-2")}
                    type="datetime-local"
                    value={endLocal}
                    onChange={(e) => setEndLocal(e.target.value)}
                  />
                </label>
              </div>
              <div className="rounded-md border border-[var(--border-soft)] bg-[var(--fx-04)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Total trade time
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--text-primary)]">{tradeDurationLabel}</p>
              </div>
            </>
          ) : (
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
          )}

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
                        : "border-[var(--border-soft)] bg-[var(--fx-04)] text-[var(--text-secondary)]",
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
                        : "border-[var(--border-soft)] bg-[var(--fx-04)] text-[var(--text-secondary)]",
                    )}
                  >
                    <span>{item}</span>
                    <span>{checklist.includes(item) ? "✓" : ""}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {variant === "detailed" ? (
            <div>
              <p className="mb-2 text-sm text-[var(--text-secondary)]">Strategies</p>
              <div className="flex flex-wrap gap-2">
                {allStrategies.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() =>
                      setStrategies((cur) => (cur.includes(st) ? cur.filter((x) => x !== st) : [...cur, st]))
                    }
                    className={cn(
                      "rounded-sm border px-3 py-1.5 text-xs font-medium transition",
                      strategies.includes(st)
                        ? "border-[color-mix(in_srgb,var(--accent)_50%,transparent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]"
                        : "border-[var(--border-soft)] bg-[var(--fx-04)] text-[var(--text-secondary)]",
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <label className="block text-sm text-[var(--text-secondary)]">
            Personal reflection
            <textarea className={cn(inputClass, "mt-2 min-h-[100px]")} value={personalInfo} onChange={(e) => setPersonalInfo(e.target.value)} />
          </label>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--bg-raised)_92%,transparent)] px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] backdrop-blur-2xl sm:px-10">
        <div className="mx-auto flex max-w-4xl flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-md border border-[var(--border-soft)] bg-[var(--fx-05)] px-6 py-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--fx-09)] sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!builtTrade}
            onClick={handleSubmit}
            className="w-full rounded-md bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-on-accent)] shadow-[0_8px_28px_var(--accent-glow)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
          >
            {isNew ? "Save trade" : "Update trade"}
          </button>
        </div>
      </div>
    </div>
  );
}
