"use client";

import { format } from "date-fns";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Trade } from "@/types/trade";
import { TRADE_TAG_PRESETS } from "@/lib/tradeTaxonomy";
import { selectActiveTrades, useTradeStore } from "@/store/useTradeStore";
import { formatDollar } from "@/lib/utils";
import { cn } from "@/lib/cn";

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((x) => x !== value)
    : [...list, value];
}

function collectTagUniverse(trades: Trade[]): string[] {
  const set = new Set<string>();
  for (const t of TRADE_TAG_PRESETS) set.add(t);
  for (const tr of trades) {
    for (const tag of tr.tags) {
      if (tag.trim()) set.add(tag.trim());
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

function collectStrategies(trades: Trade[]): { key: string; label: string }[] {
  const map = new Map<string, string>();
  for (const tr of trades) {
    const raw = tr.title?.trim();
    if (raw) map.set(raw, raw);
    else if (!map.has("")) map.set("", "(No title)");
  }
  return [...map.entries()]
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function tradeMatchesStrategyFilters(
  trade: Trade,
  selectedKeys: string[],
): boolean {
  if (selectedKeys.length === 0) return true;
  const raw = trade.title?.trim() ?? "";
  return selectedKeys.some((k) => (k === "" ? raw === "" : raw === k));
}

function tradeMatchesTagFilters(trade: Trade, selectedTags: string[]): boolean {
  if (selectedTags.length === 0) return true;
  return selectedTags.some((tag) => trade.tags.includes(tag));
}

export function TradesDirectory() {
  const trades = useTradeStore(selectActiveTrades);
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [strategyFilters, setStrategyFilters] = useState<string[]>([]);

  const tagOptions = useMemo(() => collectTagUniverse(trades), [trades]);
  const strategyOptions = useMemo(() => collectStrategies(trades), [trades]);

  const filtered = useMemo(() => {
    return [...trades]
      .filter(
        (t) =>
          tradeMatchesTagFilters(t, tagFilters) &&
          tradeMatchesStrategyFilters(t, strategyFilters),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [trades, tagFilters, strategyFilters]);

  const hasFilters = tagFilters.length > 0 || strategyFilters.length > 0;

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
          Trades
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          All trades
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Filter by tags or by strategy (trade title). Open a row to edit
          details.
        </p>
      </header>

      <section className="rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 p-6 backdrop-blur-xl sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Filters
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Match any selected tag · Match any selected strategy
            </p>
          </div>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => {
                setTagFilters([]);
                setStrategyFilters([]);
              }}
              className="rounded-md border border-[var(--border-soft)] bg-[var(--fx-06)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--fx-10)]"
            >
              Clear filters
            </button>
          ) : null}
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Tags
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {tagOptions.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">
                  No tags yet — add tags when editing a trade.
                </p>
              ) : (
                tagOptions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setTagFilters((cur) => toggleInList(cur, tag))
                    }
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-xs font-semibold transition",
                      tagFilters.includes(tag)
                        ? "border-[color-mix(in_srgb,var(--accent)_55%,transparent)] bg-[var(--fx-07)] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_var(--border)]"
                        : "border-[var(--border-soft)] bg-[var(--fx-05)] text-[var(--text-secondary)] hover:bg-[var(--fx-08)]",
                    )}
                  >
                    {tag}
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Strategy
            </p>
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">
              Uses each trade&apos;s title as the strategy name.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {strategyOptions.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">
                  No trades in this profile yet.
                </p>
              ) : (
                strategyOptions.map(({ key, label }) => (
                  <button
                    key={key === "" ? "__empty__" : key}
                    type="button"
                    onClick={() =>
                      setStrategyFilters((cur) => toggleInList(cur, key))
                    }
                    className={cn(
                      "max-w-full truncate rounded-md border px-3 py-1.5 text-left text-xs font-semibold transition",
                      strategyFilters.includes(key)
                        ? "border-[color-mix(in_srgb,var(--accent)_55%,transparent)] bg-[var(--fx-07)] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_var(--border)]"
                        : "border-[var(--border-soft)] bg-[var(--fx-05)] text-[var(--text-secondary)] hover:bg-[var(--fx-08)]",
                    )}
                  >
                    {label}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <p className="text-sm text-[var(--text-secondary)]">
        Showing{" "}
        <span className="font-semibold text-[var(--text-primary)]">
          {filtered.length}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-[var(--text-primary)]">
          {trades.length}
        </span>{" "}
        trades
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-[var(--border-soft)] bg-[var(--fx-04)]/40 px-6 py-16 text-center">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            No trades match these filters
          </p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Adjust filters or log a new trade from the sidebar.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((t) => (
            <TradeRow key={t.id} trade={t} />
          ))}
        </ul>
      )}
    </div>
  );
}

function TradeRow({ trade }: { trade: Trade }) {
  const title = trade.title?.trim() || `${trade.pair} session`;
  const when = format(new Date(trade.createdAt), "MMM d, yyyy · HH:mm");
  const pnlClass =
    trade.pnl > 0
      ? "text-profit/95"
      : trade.pnl < 0
        ? "text-red-300/90"
        : "text-[var(--text-secondary)]";

  return (
    <li>
      <Link
        href={`/edit/${encodeURIComponent(trade.id)}`}
        className="flex flex-col gap-3 rounded-md border border-[var(--border-soft)] bg-[var(--bg-raised)]/60 px-4 py-4 transition hover:border-[var(--border)] hover:bg-[var(--fx-07)]/80 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-semibold text-[var(--text-primary)]">
              {trade.pair}
            </span>
            <span className="text-xs font-medium text-[var(--text-muted)]">
              {trade.direction}
            </span>
            <span className="text-xs text-[var(--text-muted)]">{when}</span>
          </div>
          <p className="mt-1 truncate text-sm text-[var(--text-secondary)]">
            {title}
          </p>
          {trade.tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {trade.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-[var(--border-soft)] bg-[var(--bg-cell)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
          <p
            className={cn(
              "font-mono text-sm font-semibold tabular-nums",
              pnlClass,
            )}
          >
            {formatDollar(trade.pnl)}
          </p>
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Edit
          </span>
        </div>
      </Link>
    </li>
  );
}
