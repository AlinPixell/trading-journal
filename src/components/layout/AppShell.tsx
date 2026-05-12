"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, Plus, Settings2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTradeStore } from "@/store/useTradeStore";
import { cn } from "@/lib/cn";

const links = [
  { href: "/", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const animations = useTradeStore((s) => s.appSettings.animationsEnabled);

  return (
    <div className="flex min-h-[100dvh] flex-col lg:flex-row">
      <aside className="sticky top-0 z-40 flex shrink-0 flex-col border-b border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--glass)_88%,transparent)] pt-[env(safe-area-inset-top,0px)] backdrop-blur-2xl lg:h-[100dvh] lg:w-[260px] lg:border-b-0 lg:border-r lg:border-[var(--border-soft)] lg:pt-0">
        <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5 sm:py-5 lg:flex-col lg:items-stretch">
          <div className="min-w-0 lg:mb-2">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Trade Journal
            </p>
            <p className="mt-1 truncate text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              Local-first
            </p>
          </div>
          <Link
            href="/new"
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-[var(--accent-on-accent)] transition sm:min-h-0",
              "bg-[var(--accent)] shadow-[0_8px_32px_var(--accent-glow)] hover:brightness-110"
            )}
          >
            <Plus className="h-4 w-4 shrink-0" strokeWidth={2.2} />
            <span className="hidden sm:inline">New trade</span>
          </Link>
        </div>
        <nav className="-mx-1 flex gap-1 overflow-x-auto px-2 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-3 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-4 lg:pb-6 [&::-webkit-scrollbar]:hidden">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            const Inner = (
              <Link
                href={href}
                className={cn(
                  "flex min-h-11 shrink-0 items-center gap-3 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium transition-colors lg:min-h-0 lg:w-full lg:whitespace-normal",
                  active
                    ? "bg-[var(--fx-07)] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_var(--border)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--fx-05)] hover:text-[var(--text-primary)]"
                )}
              >
                <Icon className="h-[18px] w-[18px] opacity-80" strokeWidth={1.75} />
                {label}
              </Link>
            );
            return animations ? (
              <motion.div key={href} whileTap={{ scale: 0.98 }} className="lg:w-full">
                {Inner}
              </motion.div>
            ) : (
              <div key={href} className="lg:w-full">
                {Inner}
              </div>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
