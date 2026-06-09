"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/cn";
import { loadTrades, saveTrades, XAUUSD_TRADES_KEY } from "@/lib/xauusdTradeStorage";
import type { XauUsdTrade } from "@/types/xauusd";
import { ScreenshotThumb, useScreenshotLightbox } from "@/components/ui/ScreenshotGallery";

export function TradeList({ trades, onChange }: { trades: XauUsdTrade[]; onChange: () => void }) {
  const { open: openLightbox, lightbox } = useScreenshotLightbox();
  const sorted = useMemo(
    () =>
      [...trades].sort((a, b) => new Date(a.tradedAt).getTime() - new Date(b.tradedAt).getTime()),
    [trades],
  );

  const remove = (id: string) => {
    const next = loadTrades(XAUUSD_TRADES_KEY).filter((t) => t.id !== id);
    saveTrades(XAUUSD_TRADES_KEY, next);
    onChange();
  };

  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-5 backdrop-blur-xl sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Trade log
          </p>
          <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Chronological</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Stored locally under{" "}
            <span className="font-mono text-[11px] text-[var(--text-muted)]">xauusd-trades</span>.
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {sorted.length === 0 ? (
          <li className="rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] px-4 py-6 text-center text-sm text-[var(--text-muted)]">
            No trades yet.
          </li>
        ) : (
          sorted.map((t) => {
            const closed = t.exitPrice != null && Number.isFinite(t.exitPrice);
            return (
              <li
                key={t.id}
                className="rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] p-4 transition-colors hover:bg-[var(--fx-05)]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
                          t.direction === "BUY"
                            ? "border border-[color-mix(in_lab,var(--accent)_40%,transparent)] bg-[var(--fx-07)] text-[var(--text-primary)]"
                            : "border border-[var(--border-soft)] bg-[var(--fx-05)] text-[var(--text-muted)]",
                        )}
                      >
                        {t.direction}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {format(new Date(t.tradedAt), "yyyy-MM-dd HH:mm")}
                      </span>
                    </div>
                    <dl className="grid gap-2 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                          Entry
                        </dt>
                        <dd className="font-semibold tabular-nums text-[var(--text-primary)]">
                          {Math.round(t.entryPrice)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                          Exit
                        </dt>
                        <dd className="font-semibold tabular-nums text-[var(--text-secondary)]">
                          {closed ? Math.round(t.exitPrice!) : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                          Lot size
                        </dt>
                        <dd className="font-semibold tabular-nums text-[var(--text-primary)]">{Math.round(t.lots)}</dd>
                      </div>
                    </dl>
                    {t.notes.trim() ? (
                      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{t.notes}</p>
                    ) : null}
                  </div>
                  {t.screenshot ? (
                    <div className="shrink-0 sm:max-w-[200px]">
                      <ScreenshotThumb
                        src={t.screenshot}
                        onClick={() => openLightbox([t.screenshot!], 0, `${t.direction} · ${format(new Date(t.tradedAt), "yyyy-MM-dd")}`)}
                        imgClassName="max-h-40 object-contain"
                      />
                    </div>
                  ) : null}
                </div>
                <div className="mt-3 flex justify-end border-t border-[var(--border-soft)] pt-3">
                  <button
                    type="button"
                    onClick={() => remove(t.id)}
                    className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>
      {lightbox}
    </div>
  );
}
