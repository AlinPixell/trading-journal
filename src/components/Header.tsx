"use client";

import { CalendarDays } from "lucide-react";

interface HeaderProps {
  selectedDate: string;
}

export default function Header({ selectedDate }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 text-sm text-slate-300">
        <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-100 transition hover:bg-white/10">
          <CalendarDays className="h-4 w-4" />
          My Notes
        </button>
        <div className="text-center text-xs uppercase tracking-[0.25em] text-slate-500 sm:text-sm">Trade Journal</div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-100">{selectedDate}</div>
      </div>
    </header>
  );
}
