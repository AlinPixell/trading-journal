"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { Trade } from "@/types/trade";
import { formatTradeTime } from "@/lib/date";

interface TradeTableProps {
  trades: Trade[];
  onView: (trade: Trade) => void;
  onEdit: (trade: Trade) => void;
  onDelete: (trade: Trade) => void;
}

export default function TradeTable({ trades, onView, onEdit, onDelete }: TradeTableProps) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/90 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm text-slate-300">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
            <tr>
              <th className="px-6 py-4">Pair</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Open Time</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Side</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trades.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                  No trades logged for this date.
                </td>
              </tr>
            ) : (
              trades.map((trade) => (
                <tr key={trade.id} className="border-t border-white/10">
                  <td className="px-6 py-4 text-white">{trade.pair}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={trade.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-400">{formatTradeTime(trade.createdAt)}</td>
                  <td className="px-6 py-4 text-slate-200">{trade.title}</td>
                  <td className="px-6 py-4 text-slate-300">{trade.side}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => onView(trade)} className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => onEdit(trade)} className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => onDelete(trade)} className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
