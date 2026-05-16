"use client";

import { AppShell } from "@/components/layout/AppShell";
import { AnalysisWorkspace } from "@/components/analysis/AnalysisWorkspace";

export default function AnalysisPage() {
  return (
    <AppShell>
      <div className="min-h-screen px-5 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] pt-6 sm:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-6">
          <AnalysisWorkspace />
        </div>
      </div>
    </AppShell>
  );
}
