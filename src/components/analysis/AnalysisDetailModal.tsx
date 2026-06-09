"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useTradeStore } from "@/store/useTradeStore";
import { cn } from "@/lib/cn";
import type { XauUsdAnalysisEntry } from "@/types/xauusd";
import { ScreenshotGallery } from "@/components/ui/ScreenshotGallery";

type AnalysisDetailModalProps = {
  entry: XauUsdAnalysisEntry | null;
  open: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
};

export function AnalysisDetailModal({ entry, open, onClose, onDelete }: AnalysisDetailModalProps) {
  const animations = useTradeStore((s) => s.appSettings.animationsEnabled);
  const isOpen = open && Boolean(entry);
  const e = entry;

  const handleDelete = () => {
    if (!e) return;
    onDelete?.(e.id);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(v) => !v && onClose()}>
      {e ? (
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-[var(--overlay-scrim)] backdrop-blur-md" />
          <Dialog.Content asChild>
            <motion.div
              className={cn(
                "fixed z-50 overflow-y-auto bg-[color-mix(in_srgb,var(--bg-raised)_82%,transparent)] shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl focus:outline-none",
                "bottom-0 left-0 right-0 top-auto max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-16px))] w-full translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none border-x-0 border-b-0 border-t border-[var(--border)] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]",
                "sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[min(92vh,720px)] sm:w-[min(96vw,560px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-md sm:border sm:border-[var(--border)] sm:p-6 sm:pb-6",
              )}
              initial={animations ? { opacity: 0, scale: 0.96, y: 12 } : false}
              animate={animations ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Dialog.Title className="text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl">
                    {e.title}
                  </Dialog.Title>
                  <Dialog.Description className="mt-1 text-xs text-[var(--text-muted)]">
                    {format(new Date(e.createdAt), "yyyy-MM-dd HH:mm")}
                  </Dialog.Description>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-red-400/25 bg-red-500/10 text-red-200 transition hover:bg-red-500/18 sm:min-h-0 sm:min-w-0 sm:p-2.5"
                    aria-label="Delete analysis"
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

              {e.tags.length > 0 ? (
                <div className="mb-5 flex flex-wrap gap-1.5">
                  {e.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-[var(--border-soft)] bg-[var(--fx-05)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              {e.description.trim() ? (
                <div className="border-t border-[var(--border-soft)] pt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Description
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]">
                    {e.description}
                  </p>
                </div>
              ) : null}

              {e.screenshots.length > 0 ? (
                <div
                  className={cn(
                    "border-t border-[var(--border-soft)] pt-5",
                    e.description.trim() ? "mt-5" : "",
                  )}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Screenshots
                  </p>
                  <ScreenshotGallery
                    images={e.screenshots}
                    title={e.title}
                    containerClassName="mt-3 space-y-3"
                    imgClassName="max-h-[50vh] object-center sm:max-h-[360px]"
                  />
                </div>
              ) : null}

              <p className="mt-6 text-center text-[11px] text-[var(--text-muted)]">
                Tap outside or close to dismiss ·{" "}
                <button
                  type="button"
                  onClick={handleDelete}
                  className="font-semibold text-red-300 underline-offset-2 hover:underline"
                >
                  Delete analysis
                </button>
              </p>
            </motion.div>
          </Dialog.Content>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
}
