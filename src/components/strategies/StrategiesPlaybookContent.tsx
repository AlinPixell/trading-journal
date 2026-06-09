"use client";

import { useMemo, useState } from "react";
import type { CandlePlaybookItem, StrategyPlaybookItem } from "@/types/playbook";
import { useTradeStore } from "@/store/useTradeStore";
import { CandlePlaybookDialog, StrategyPlaybookDialog } from "@/components/strategies/PlaybookEditorDialogs";
import {
  CandlePlaybookDetailModal,
  StrategyPlaybookDetailModal,
} from "@/components/strategies/PlaybookDetailModals";
import { ScreenshotThumb, useScreenshotLightbox } from "@/components/ui/ScreenshotGallery";

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
  const [strategyDetailId, setStrategyDetailId] = useState<string | null>(null);

  const [candleDialogOpen, setCandleDialogOpen] = useState(false);
  const [candleEdit, setCandleEdit] = useState<CandlePlaybookItem | null>(null);
  const [candleDetailId, setCandleDetailId] = useState<string | null>(null);
  const { open: openLightbox, lightbox } = useScreenshotLightbox();

  const strategyDetail = useMemo(
    () => (strategyDetailId ? (strategyPlaybook.find((s) => s.id === strategyDetailId) ?? null) : null),
    [strategyDetailId, strategyPlaybook],
  );

  const candleDetail = useMemo(
    () => (candleDetailId ? (candlePlaybook.find((c) => c.id === candleDetailId) ?? null) : null),
    [candleDetailId, candlePlaybook],
  );

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
      <StrategyPlaybookDetailModal
        item={strategyDetail}
        open={strategyDetailId != null && strategyDetail != null}
        onClose={() => setStrategyDetailId(null)}
        onEdit={openEditStrategy}
        onDelete={removeStrategy}
      />
      <CandlePlaybookDetailModal
        item={candleDetail}
        open={candleDetailId != null && candleDetail != null}
        onClose={() => setCandleDetailId(null)}
        onEdit={openEditCandle}
        onDelete={removeCandle}
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
                  onOpen={() => setStrategyDetailId(item.id)}
                  onOpenImage={() => openLightbox([item.image], 0, item.name)}
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
                  onOpen={() => setCandleDetailId(item.id)}
                  onOpenImage={() => openLightbox([item.image], 0, item.name)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
      {lightbox}
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
  onOpen,
  onOpenImage,
}: {
  item: StrategyPlaybookItem;
  onOpen: () => void;
  onOpenImage: () => void;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 shadow-[inset_0_0_0_1px_var(--border-soft)] backdrop-blur-xl">
      <div className="aspect-[16/10] w-full bg-[var(--fx-04)]">
        {item.image ? (
          <ScreenshotThumb
            src={item.image}
            onClick={onOpenImage}
            className="h-full rounded-none border-0 hover:border-0"
            imgClassName="h-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--text-muted)]">No image</div>
        )}
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="flex flex-1 flex-col gap-2 p-4 text-left transition hover:bg-[var(--fx-05)]"
      >
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
        <span className="mt-auto text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
          View details
        </span>
      </button>
    </article>
  );
}

function PlaybookCandleCard({
  item,
  onOpen,
  onOpenImage,
}: {
  item: CandlePlaybookItem;
  onOpen: () => void;
  onOpenImage: () => void;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-[var(--border)] bg-[var(--bg-raised)]/85 shadow-[inset_0_0_0_1px_var(--border-soft)] backdrop-blur-xl">
      <div className="aspect-[16/10] w-full bg-[var(--fx-04)]">
        {item.image ? (
          <ScreenshotThumb
            src={item.image}
            onClick={onOpenImage}
            className="h-full rounded-none border-0 hover:border-0"
            imgClassName="h-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--text-muted)]">No image</div>
        )}
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="flex flex-1 flex-col gap-2 p-4 text-left transition hover:bg-[var(--fx-05)]"
      >
        <h3 className="font-semibold text-[var(--text-primary)]">{item.name}</h3>
        {item.definition ? (
          <p className="line-clamp-4 text-xs text-[var(--text-secondary)]">{item.definition}</p>
        ) : null}
        <span className="mt-auto text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
          View details
        </span>
      </button>
    </article>
  );
}
