"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  History,
  LayoutDashboard,
  LineChart,
  PenTool,
  Plus,
  Settings2,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { FloatingSubmenu } from "@/components/layout/FloatingSubmenu";
import { useNewTradeModal } from "@/components/layout/NewTradeModal";
import { cn } from "@/lib/cn";
import { useTradeStore } from "@/store/useTradeStore";

export type MobileActiveMenu = null | "analysis" | "profiles";

const analysisSubmenuItems = [
  { href: "/backtesting", label: "Backtesting", icon: History },
  { href: "/analysis", label: "Analysis", icon: PenTool },
  { href: "/strategies", label: "Strategies", icon: BookOpen },
];

const profilesSubmenuItems = [
  { href: "/profiles", label: "Profiles", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

const directNavItems = [
  { href: "/dashboard", label: "Analytics", icon: LayoutDashboard },
  { href: "/", label: "Calendar", icon: CalendarDays },
] as const;

const tradesHref = "/trades";

function isPathActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isAnalysisSectionActive(pathname: string) {
  return analysisSubmenuItems.some((item) => isPathActive(pathname, item.href));
}

function isProfilesSectionActive(pathname: string) {
  return profilesSubmenuItems.some((item) => isPathActive(pathname, item.href));
}

type NavIconButtonProps = {
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  onClick?: () => void;
  href?: string;
  animations: boolean;
  menuOpen?: boolean;
};

function NavIconButton({
  label,
  icon: Icon,
  active,
  onClick,
  href,
  animations,
  menuOpen,
}: NavIconButtonProps) {
  const highlighted = active || menuOpen;

  const inner = (
    <>
      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-md transition-all duration-200",
          highlighted && "bg-[var(--fx-08)]",
        )}
      >
        <Icon
          className={cn(
            "h-[18px] w-[18px] transition-colors duration-200",
            highlighted ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]",
          )}
          strokeWidth={highlighted ? 2.25 : 1.75}
        />
      </span>
      <span
        className={cn(
          "max-w-full truncate text-[9px] font-medium leading-tight transition-colors duration-200",
          highlighted ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]",
        )}
      >
        {label}
      </span>
    </>
  );

  const className = cn(
    "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-1.5",
    "transition-transform duration-200 select-none",
    "active:scale-[0.92]",
  );

  if (href) {
    return (
      <Link
        href={href}
        className={className}
        aria-current={active ? "page" : undefined}
      >
        <motion.span className="flex flex-col items-center" whileTap={animations ? { scale: 0.92 } : undefined}>
          {inner}
        </motion.span>
      </Link>
    );
  }

  return (
    <motion.button
      type="button"
      className={className}
      onClick={onClick}
      aria-expanded={menuOpen}
      aria-haspopup="menu"
      whileTap={animations ? { scale: 0.92 } : undefined}
    >
      {inner}
    </motion.button>
  );
}

function TradesNavSlot({
  tradesActive,
  animations,
  onNewTrade,
}: {
  tradesActive: boolean;
  animations: boolean;
  onNewTrade: () => void;
}) {
  return (
    <div className="relative flex min-w-0 flex-col items-center">
      <AnimatePresence mode="wait" initial={false}>
        {tradesActive ? (
          <motion.button
            key="new-trade"
            type="button"
            aria-label="New trade"
            onClick={onNewTrade}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-1.5",
              "transition-transform duration-200 select-none",
            )}
            initial={animations ? { opacity: 0, scale: 0.88 } : false}
            animate={animations ? { opacity: 1, scale: 1 } : {}}
            exit={animations ? { opacity: 0, scale: 0.88 } : {}}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            whileTap={animations ? { scale: 0.92 } : undefined}
          >
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-md",
                "bg-[var(--cta-bg)] text-[var(--cta-fg)] shadow-[0_-1px_15px_var(--cta-glow)]",
              )}
            >
              <Plus className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="trades"
            className="flex w-full min-w-0 flex-1"
            initial={animations ? { opacity: 0, scale: 0.88 } : false}
            animate={animations ? { opacity: 1, scale: 1 } : {}}
            exit={animations ? { opacity: 0, scale: 0.88 } : {}}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <NavIconButton
              href={tradesHref}
              label="Trades"
              icon={LineChart}
              active={false}
              animations={animations}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { openNewTrade } = useNewTradeModal();
  const animations = useTradeStore((s) => s.appSettings.animationsEnabled);
  const [activeMenu, setActiveMenu] = useState<MobileActiveMenu>(null);

  useEffect(() => {
    setActiveMenu(null);
  }, [pathname]);

  const closeMenu = () => setActiveMenu(null);

  const toggleMenu = (menu: MobileActiveMenu) => {
    setActiveMenu((prev) => (prev === menu ? null : menu));
  };

  const tradesActive = isPathActive(pathname, tradesHref);
  const analysisActive = isAnalysisSectionActive(pathname);
  const profilesActive = isProfilesSectionActive(pathname);

  return (
    <>
      {activeMenu && (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default lg:hidden"
          aria-label="Close navigation menu"
          onClick={closeMenu}
        />
      )}

      <nav
        className={cn(
          "fixed left-5 right-5 z-50 sm:left-8 sm:right-8 lg:hidden",
          "bottom-[calc(10px+env(safe-area-inset-bottom,0px))]",
          "rounded-md border border-[var(--border)]",
          "bg-[color-mix(in_srgb,var(--bg-raised)_94%,transparent)]",
          "backdrop-blur-2xl",
        )}
        aria-label="Main navigation"
      >
        <div className="grid w-full grid-cols-5 items-stretch px-0.5 pt-1 pb-0.5">
          {directNavItems.map(({ href, label, icon }) => (
            <NavIconButton
              key={href}
              href={href}
              label={label}
              icon={icon}
              active={isPathActive(pathname, href)}
              animations={animations}
            />
          ))}

          <TradesNavSlot
            tradesActive={tradesActive}
            animations={animations}
            onNewTrade={openNewTrade}
          />

          <div className="relative flex min-w-0 flex-col items-center">
            <FloatingSubmenu
              isOpen={activeMenu === "analysis"}
              onClose={closeMenu}
              items={analysisSubmenuItems}
              align="center"
              animationsEnabled={animations}
            />
            <NavIconButton
              label="Analysis"
              icon={PenTool}
              active={analysisActive}
              menuOpen={activeMenu === "analysis"}
              animations={animations}
              onClick={() => toggleMenu("analysis")}
            />
          </div>

          <div className="relative flex min-w-0 flex-col items-center">
            <FloatingSubmenu
              isOpen={activeMenu === "profiles"}
              onClose={closeMenu}
              items={profilesSubmenuItems}
              align="end"
              animationsEnabled={animations}
            />
            <NavIconButton
              label="Profiles"
              icon={Users}
              active={profilesActive}
              menuOpen={activeMenu === "profiles"}
              animations={animations}
              onClick={() => toggleMenu("profiles")}
            />
          </div>
        </div>
      </nav>
    </>
  );
}
