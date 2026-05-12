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
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="sticky top-0 z-40 flex shrink-0 flex-col border-b border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--glass)_88%,transparent)] backdrop-blur-2xl lg:h-screen lg:w-[260px] lg:border-b-0 lg:border-r lg:border-[var(--border-soft)]">
        <div className="flex items-center justify-between gap-3 px-5 py-5 lg:flex-col lg:items-stretch">
          <div className="lg:mb-2">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Trade Journal
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              Desktop
            </p>
          </div>
          <Link
            href="/new"
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-[var(--bg-base)] transition",
              "bg-[var(--accent)] shadow-[0_8px_32px_var(--accent-glow)] hover:brightness-110"
            )}
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} />
            <span className="hidden sm:inline">New trade</span>
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-4 lg:pb-6">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            const Inner = (
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/[0.07] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_var(--border)]"
                    : "text-[var(--text-secondary)] hover:bg-white/[0.05] hover:text-[var(--text-primary)]"
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
