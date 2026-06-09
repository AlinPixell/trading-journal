"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Edit3, Trash2, X } from "lucide-react";
import { useTradeStore } from "@/store/useTradeStore";
import { cn } from "@/lib/cn";
import type { CandlePlaybookItem, StrategyPlaybookItem } from "@/types/playbook";
import { ScreenshotGallery } from "@/components/ui/ScreenshotGallery";

const panelClass = cn(
  "fixed z-50 overflow-y-auto bg-[color-mix(in_srgb,var(--bg-raised)_82%,transparent)] shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl focus:outline-none",
  "bottom-0 left-0 right-0 top-auto max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-16px))] w-full translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none border-x-0 border-b-0 border-t border-[var(--border)] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]",
  "sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[min(92vh,720px)] sm:w-[min(96vw,560px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-md sm:border sm:border-[var(--border)] sm:p-6 sm:pb-6",
);

type StrategyDetailModalProps = {
  item: StrategyPlaybookItem | null;
  open: boolean;
  onClose: () => void;
  onEdit: (item: StrategyPlaybookItem) => void;
  onDelete: (id: string) => void;
};

export function StrategyPlaybookDetailModal({
  item,
  open,
  onClose,
  onEdit,
  onDelete,
}: StrategyDetailModalProps) {
  const animations = useTradeStore((s) => s.appSettings.animationsEnabled);
  const isOpen = open && Boolean(item);
  const s = item;

  const handleDelete = () => {
    if (!s) return;
    if (!window.confirm(`Remove “${s.name}” from your playbook?`)) return;
    onDelete(s.id);
    onClose();
  };

  const handleEdit = () => {
    if (!s) return;
    onEdit(s);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(v) => !v && onClose()}>
      {s ? (
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-[var(--overlay-scrim)] backdrop-blur-md" />
          <Dialog.Content asChild>
            <motion.div
              className={panelClass}
              initial={animations ? { opacity: 0, scale: 0.96, y: 12 } : false}
              animate={animations ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Dialog.Title className="text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl">
                    {s.name}
                  </Dialog.Title>
                  <Dialog.Description className="mt-1 text-xs text-[var(--text-muted)]">
                    Strategy playbook entry
                  </Dialog.Description>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border-soft)] bg-[var(--fx-05)] text-[var(--text-primary)] transition hover:bg-[var(--fx-09)] sm:min-h-0 sm:min-w-0 sm:p-2.5"
                    aria-label="Edit strategy"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-red-400/25 bg-red-500/10 text-red-200 transition hover:bg-red-500/18 sm:min-h-0 sm:min-w-0 sm:p-2.5"
                    aria-label="Delete strategy"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border-soft)] bg-[var(--fx-05)] text-[var(--text-primary)] transition hover:bg-[var(--fx-09)] sm:min-h-0 sm:min-w-0 sm:p-2.5"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Dialog.Close>
                </div>
              </div>

              {s.image ? (
                <ScreenshotGallery
                  images={[s.image]}
                  title={s.name}
                  containerClassName="overflow-hidden rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)]"
                  imgClassName="max-h-[50vh] object-contain sm:max-h-[360px]"
                />
              ) : (
                <div className="flex min-h-[160px] items-center justify-center rounded-md border border-dashed border-[var(--border-soft)] bg-[var(--fx-04)] text-sm text-[var(--text-muted)]">
                  No image
                </div>
              )}

              {s.howItWorks.trim() ? (
                <div className="mt-5 border-t border-[var(--border-soft)] pt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    How it works
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]">
                    {s.howItWorks}
                  </p>
                </div>
              ) : null}

              {s.whenToUse.trim() ? (
                <div className="mt-5 border-t border-[var(--border-soft)] pt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    When to use it
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]">
                    {s.whenToUse}
                  </p>
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--border-soft)] pt-5">
                <button
                  type="button"
                  onClick={handleEdit}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border-soft)] bg-[var(--fx-06)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--fx-10)]"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit strategy
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-red-400/25 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/18"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
}

type CandleDetailModalProps = {
  item: CandlePlaybookItem | null;
  open: boolean;
  onClose: () => void;
  onEdit: (item: CandlePlaybookItem) => void;
  onDelete: (id: string) => void;
};

export function CandlePlaybookDetailModal({
  item,
  open,
  onClose,
  onEdit,
  onDelete,
}: CandleDetailModalProps) {
  const animations = useTradeStore((s) => s.appSettings.animationsEnabled);
  const isOpen = open && Boolean(item);
  const c = item;

  const handleDelete = () => {
    if (!c) return;
    if (!window.confirm(`Remove “${c.name}”?`)) return;
    onDelete(c.id);
    onClose();
  };

  const handleEdit = () => {
    if (!c) return;
    onEdit(c);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(v) => !v && onClose()}>
      {c ? (
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-[var(--overlay-scrim)] backdrop-blur-md" />
          <Dialog.Content asChild>
            <motion.div
              className={panelClass}
              initial={animations ? { opacity: 0, scale: 0.96, y: 12 } : false}
              animate={animations ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Dialog.Title className="text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl">
                    {c.name}
                  </Dialog.Title>
                  <Dialog.Description className="mt-1 text-xs text-[var(--text-muted)]">
                    Candle or chart concept
                  </Dialog.Description>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border-soft)] bg-[var(--fx-05)] text-[var(--text-primary)] transition hover:bg-[var(--fx-09)] sm:min-h-0 sm:min-w-0 sm:p-2.5"
                    aria-label="Edit entry"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-red-400/25 bg-red-500/10 text-red-200 transition hover:bg-red-500/18 sm:min-h-0 sm:min-w-0 sm:p-2.5"
                    aria-label="Delete entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border-soft)] bg-[var(--fx-05)] text-[var(--text-primary)] transition hover:bg-[var(--fx-09)] sm:min-h-0 sm:min-w-0 sm:p-2.5"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Dialog.Close>
                </div>
              </div>

              {c.image ? (
                <ScreenshotGallery
                  images={[c.image]}
                  title={c.name}
                  containerClassName="overflow-hidden rounded-md border border-[var(--border-soft)] bg-[var(--bg-base)]"
                  imgClassName="max-h-[50vh] object-contain sm:max-h-[360px]"
                />
              ) : (
                <div className="flex min-h-[160px] items-center justify-center rounded-md border border-dashed border-[var(--border-soft)] bg-[var(--fx-04)] text-sm text-[var(--text-muted)]">
                  No image
                </div>
              )}

              {c.definition.trim() ? (
                <div className="mt-5 border-t border-[var(--border-soft)] pt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Definition
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]">
                    {c.definition}
                  </p>
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--border-soft)] pt-5">
                <button
                  type="button"
                  onClick={handleEdit}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border-soft)] bg-[var(--fx-06)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--fx-10)]"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit entry
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-red-400/25 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/18"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
}
