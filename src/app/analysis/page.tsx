"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { AnalysisWorkspace } from "@/components/analysis/AnalysisWorkspace";

export default function AnalysisPage() {
  return (
    <AppShell>
      <div className="min-h-screen px-5 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] pt-6 sm:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-6">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border-soft)] bg-[var(--bg-cell)] px-3 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--fx-05)] hover:text-[var(--text-primary)] sm:min-h-0"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              Back
            </Link>
          </div>

          <AnalysisWorkspace />
        </div>
      </div>
    </AppShell>
  );
}
