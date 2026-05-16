"use client";

import { useState } from "react";
import type { CandlePlaybookItem, StrategyPlaybookItem } from "@/types/playbook";
import { useTradeStore } from "@/store/useTradeStore";
import { CandlePlaybookDialog, StrategyPlaybookDialog } from "@/components/strategies/PlaybookEditorDialogs";

export function StrategiesPlaybookContent() {
  const strategyPlaybook = useTradeStore((s) => s.strategyPlaybook);
  const candlePlaybook = useTradeStore((s) => s.candlePlaybook);
  const addStrategy = useTradeStore((s) => s.addStrategyPlaybookItem);
  const updateStrategy = useTradeStore((s) => s.updateStrategyPlaybookItem);
  const removeStrategy = useTradeStore((s) => s.removeStrategyPlaybookItem);
  const addCandle = useTradeStore((s) => s.addCandlePlaybookItem);
  const updateCandle = useTradeStore((s) => s.updateCandlePlaybookItem);
  const removeCandle = useTradeStore((s) => s.removeCandlePlaybookItem);

  const [strategyDialogOpen, setStrategyDialogOpen] = useState(false);
  const [strategyEdit, setStrategyEdit] = useState<StrategyPlaybookItem | null>(null);
  const [candleDialogOpen, setCandleDialogOpen] = useState(false);
  const [candleEdit, setCandleEdit] = useState<CandlePlaybookItem | null>(null);

  const openNewStrategy = () => {
    setStrategyEdit(null);
    setStrategyDialogOpen(true);
  };
  const openEditStrategy = (item: StrategyPlaybookItem) => {
    setStrategyEdit(item);
    setStrategyDialogOpen(true);
  };

  const openNewCandle = () => {
    setCandleEdit(null);
    setCandleDialogOpen(true);
  };
  const openEditCandle = (item: CandlePlaybookItem) => {
    setCandleEdit(item);
    setCandleDialogOpen(true);
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-12">
      <StrategyPlaybookDialog
        open={strategyDialogOpen}
        onOpenChange={setStrategyDialogOpen}
        initial={strategyEdit}
        onCreate={addStrategy}
        onUpdate={updateStrategy}
      />
      <CandlePlaybookDialog
        open={candleDialogOpen}
        onOpenChange={setCandleDialogOpen}
        initial={candleEdit}
        onCreate={addCandle}
        onUpdate={updateCandle}
      />

      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Strategies</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          Playbook
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
          Build a personal library of setups and chart references. Everything is stored locally with your journal.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Strategies</h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Named setups with an image plus how they work and when you use them.
            </p>
          </div>
          <button
            type="button"
            onClick={openNewStrategy}
            className="rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-on-accent)] shadow-[0_-1px_12px_var(--accent-glow)] transition hover:opacity-95"
          >
            Add strategy
          </button>
        </div>
        {strategyPlaybook.length === 0 ? (
          <EmptyPlaybookCard message="No strategies yet. Add your first head and shoulders, breakout model, or any setup you trade." />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {strategyPlaybook.map((item) => (
              <li key={item.id}>
                <PlaybookStrategyCard
                  item={item}
                  onEdit={() => openEditStrategy(item)}
                  onDelete={() => {
                    if (window.confirm(`Remove “${item.name}” from your playbook?`)) removeStrategy(item.id);
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Candles and chart concepts</h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Candle types, bar patterns, liquidity ideas — quick visual reference while reviewing trades.
            </p>
          </div>
          <button
            type="button"
            onClick={openNewCandle}
            className="rounded-md border border-[var(--border-soft)] bg-[var(--fx-06)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--fx-10)]"
          >
            Add entry
          </button>
        </div>
        {candlePlaybook.length === 0 ? (
          <EmptyPlaybookCard message="No candle or concept cards yet. Add doji, hammer, FVG, or whatever you annotate with." />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {candlePlaybook.map((item) => (
              <li key={item.id}>
                <PlaybookCandleCard
                  item={item}
                  onEdit={() => openEditCandle(item)}
                  onDelete={() => {
                    if (window.confirm(`Remove “${item.name}”?`)) removeCandle(item.id);
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function EmptyPlaybookCard({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-[var(--border-soft)] bg-[var(--fx-04)]/40 px-6 py-12 text-center">
      <p className="text-sm text-[var(--text-secondary)]">{message}</p>
    </div>
  );
}

function PlaybookStrategyCard({
  item,
  onEdit,
  onDelete,
}: {
  item: StrategyPlaybookItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 shadow-[inset_0_0_0_1px_var(--border-soft)] backdrop-blur-xl">
      <div className="aspect-[16/10] w-full bg-[var(--fx-04)]">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--text-muted)]">No image</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold text-[var(--text-primary)]">{item.name}</h3>
        {item.howItWorks ? (
          <p className="line-clamp-3 text-xs text-[var(--text-secondary)]">{item.howItWorks}</p>
        ) : null}
        {item.whenToUse ? (
          <p className="line-clamp-2 text-[10px] text-[var(--text-muted)]">
            <span className="font-semibold uppercase tracking-wide">When: </span>
            {item.whenToUse}
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md border border-[var(--border-soft)] bg-[var(--fx-06)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-[var(--fx-10)]"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md border border-red-400/25 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/18"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function PlaybookCandleCard({
  item,
  onEdit,
  onDelete,
}: {
  item: CandlePlaybookItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 shadow-[inset_0_0_0_1px_var(--border-soft)] backdrop-blur-xl">
      <div className="aspect-[16/10] w-full bg-[var(--fx-04)]">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--text-muted)]">No image</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold text-[var(--text-primary)]">{item.name}</h3>
        {item.definition ? (
          <p className="line-clamp-4 text-xs text-[var(--text-secondary)]">{item.definition}</p>
        ) : null}
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md border border-[var(--border-soft)] bg-[var(--fx-06)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-[var(--fx-10)]"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md border border-red-400/25 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/18"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
