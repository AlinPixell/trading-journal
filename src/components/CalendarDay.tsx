import { format } from "date-fns";
import { ArrowRight } from "lucide-react";

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isSelected: boolean;
  summary?: {
    count: number;
    totalROI: number;
  };
  onSelect: (date: Date) => void;
}

export default function CalendarDay({ date, isCurrentMonth, isSelected, summary, onSelect }: CalendarDayProps) {
  const dateLabel = format(date, "d");
  const hasTrades = summary?.count && summary.count > 0;
  const pnlClass = summary
    ? summary.totalROI > 0
      ? "bg-emerald-500/10 text-emerald-300"
      : summary.totalROI < 0
      ? "bg-rose-500/10 text-rose-300"
      : "bg-slate-700/70 text-slate-200"
    : "bg-white/5 text-slate-500";

  return (
    <button
      type="button"
      onClick={() => onSelect(date)}
      className={`group flex h-28 w-full flex-col justify-between rounded-3xl border px-3 py-3 text-left transition ${
        isSelected ? "border-emerald-400/40 bg-white/5 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]" : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10"
      } ${!isCurrentMonth ? "opacity-70" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`text-sm font-semibold ${isCurrentMonth ? "text-white" : "text-slate-500"}`}>{dateLabel}</span>
        {hasTrades ? (
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] ${pnlClass}`}>
            {summary?.count} trade{summary?.count === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>
      {hasTrades ? (
        <div className={`inline-flex items-center gap-1 rounded-2xl px-2 py-1 text-xs font-medium ${pnlClass}`}>
          <ArrowRight className="h-3 w-3" />
          {summary?.totalROI > 0 ? "+" : ""}
          {summary?.totalROI.toFixed(1)}% P/L
        </div>
      ) : (
        <div className="text-xs text-slate-600">No trades</div>
      )}
    </button>
  );
}
