"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTradeStore } from "@/store/useTradeStore";
import { cn } from "@/lib/cn";

type ScreenshotLightboxProps = {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
  title?: string;
};

export function ScreenshotLightbox({
  images,
  initialIndex = 0,
  open,
  onClose,
  title,
}: ScreenshotLightboxProps) {
  const animations = useTradeStore((s) => s.appSettings.animationsEnabled);
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  const count = images.length;
  const hasPrev = index > 0;
  const hasNext = index < count - 1;

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(count - 1, i + 1));
  }, [count]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, goPrev, goNext]);

  const current = images[index];

  return (
    <Dialog.Root open={open && count > 0} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm" />
        <Dialog.Content asChild>
          <motion.div
            className="fixed inset-0 z-[70] flex flex-col focus:outline-none"
            initial={animations ? { opacity: 0 } : false}
            animate={animations ? { opacity: 1 } : {}}
            transition={{ duration: 0.2 }}
          >
            <Dialog.Title className="sr-only">
              {title ? `${title} — screenshot ${index + 1} of ${count}` : `Screenshot ${index + 1} of ${count}`}
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              Use the arrow buttons or keyboard arrows to browse screenshots. Press escape to close.
            </Dialog.Description>

            <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top,0px))] sm:px-6">
              <p className="min-w-0 truncate text-sm font-medium text-white/80">
                {title ? <span className="text-white/60">{title} · </span> : null}
                <span className="tabular-nums text-white">
                  {index + 1} / {count}
                </span>
              </p>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center px-14 pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:px-20">
              {hasPrev ? (
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-2 top-1/2 z-10 flex min-h-12 min-w-12 -translate-y-1/2 items-center justify-center rounded-md border border-white/15 bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 sm:left-4 sm:min-h-14 sm:min-w-14"
                  aria-label="Previous screenshot"
                >
                  <ChevronLeft className="h-7 w-7" strokeWidth={1.5} />
                </button>
              ) : null}

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current}
                  className="flex h-full w-full max-w-[min(100%,1400px)] items-center justify-center"
                  initial={animations ? { opacity: 0, x: 12 } : false}
                  animate={animations ? { opacity: 1, x: 0 } : {}}
                  exit={animations ? { opacity: 0, x: -12 } : {}}
                  transition={{ duration: 0.18 }}
                >
                  <img
                    src={current}
                    alt={`Screenshot ${index + 1} of ${count}`}
                    className="max-h-[calc(100dvh-7rem)] max-w-full object-contain"
                  />
                </motion.div>
              </AnimatePresence>

              {hasNext ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-2 top-1/2 z-10 flex min-h-12 min-w-12 -translate-y-1/2 items-center justify-center rounded-md border border-white/15 bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 sm:right-4 sm:min-h-14 sm:min-w-14"
                  aria-label="Next screenshot"
                >
                  <ChevronRight className="h-7 w-7" strokeWidth={1.5} />
                </button>
              ) : null}
            </div>

            {count > 1 ? (
              <div className="flex shrink-0 justify-center gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={cn(
                      "h-2 w-2 rounded-full transition",
                      i === index ? "bg-white" : "bg-white/35 hover:bg-white/55",
                    )}
                    aria-label={`Go to screenshot ${i + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
