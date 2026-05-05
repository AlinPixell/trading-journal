"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, Edit3, Trash2, X } from "lucide-react";
import type { Trade } from "@/types/trade";
import StatusBadge from "./StatusBadge";
import ConfidenceSlider from "./ConfidenceSlider";
import StarRating from "./StarRating";

interface TradeDrawerProps {
  trade: Trade | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TradeDrawer({ trade, open, onClose, onEdit, onDelete }: TradeDrawerProps) {
  if (!trade) {
    return null;
  }

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-black/95 px-6 py-6 shadow-2xl sm:w-[680px]">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Trade detail</p>
              <Dialog.Title className="mt-2 text-2xl font-semibold text-white">{trade.title}</Dialog.Title>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span>{trade.pair}</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-300">{trade.side}</span>
                <StatusBadge status={trade.status} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onEdit} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">
                <Edit3 className="h-4 w-4" /> Edit
              </button>
              <button onClick={onClose} className="rounded-full border border-white/10 bg-white/5 p-3 text-slate-200 transition hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-6 grid gap-4 rounded-[2rem] border border-white/10 bg-black/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <div className="aspect-video overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
              <div className="flex h-full flex-col justify-between p-5 text-slate-300">
                <div className="text-sm uppercase tracking-[0.3em] text-slate-500">Preview</div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold">{trade.pair} chart</p>
                    <p className="text-xs text-slate-500">Snapshot of trade setup and risk zone</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 grid gap-4 xl:grid-cols-2">
            <div className="space-y-3 rounded-[1.75rem] border border-white/10 bg-black/90 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Details</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-black/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Entry</p>
                  <p className="mt-2 text-lg font-semibold text-white">{trade.entryPrice.toFixed(4)}</p>
                </div>
                <div className="rounded-3xl bg-black/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Stop</p>
                  <p className="mt-2 text-lg font-semibold text-white">{trade.stopPrice.toFixed(4)}</p>
                </div>
                <div className="rounded-3xl bg-black/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Take profit</p>
                  <p className="mt-2 text-lg font-semibold text-white">{trade.takeProfitPrice.toFixed(4)}</p>
                </div>
                <div className="rounded-3xl bg-black/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Net ROI</p>
                  <p className="mt-2 text-lg font-semibold text-white">{trade.netROI > 0 ? "+" : ""}{trade.netROI.toFixed(2)}%</p>
                </div>
              </div>
            </div>
            <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-black/90 p-5">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Notes</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">{trade.notes}</p>
              </div>
              <div className="space-y-4">
                <ConfidenceSlider value={trade.confidence} onChange={() => undefined} />
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Rating</p>
                  <div className="mt-3">
                    <StarRating value={trade.rating} onChange={() => undefined} />
                  </div>
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-black/90 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Personal info</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">{trade.personalInfo}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_0.6fr]">
            <div className="rounded-[2rem] border border-white/10 bg-black/90 p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Checklist</p>
                <button onClick={onDelete} className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200 transition hover:bg-rose-500/20">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                {trade.checklist.map((item) => (
                  <li key={item} className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
                    <span className="inline-flex h-3 w-3 rounded-full bg-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-black/90 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Tags</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {trade.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-6">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Gallery</p>
                <div className="mt-4 grid gap-3">
                  {trade.screenshots.length > 0 ? (
                    trade.screenshots.map((src, index) => (
                      <img key={index} src={src} alt="Trade screenshot" className="h-40 w-full rounded-3xl object-cover" />
                    ))
                  ) : (
                    <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-slate-500">No screenshots attached.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
