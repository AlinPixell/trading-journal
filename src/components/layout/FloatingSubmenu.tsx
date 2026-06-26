"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";

export type FloatingSubmenuItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type FloatingSubmenuProps = {
  isOpen: boolean;
  onClose: () => void;
  items: FloatingSubmenuItem[];
  align: "center" | "end";
  animationsEnabled: boolean;
};

function isItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function FloatingSubmenu({
  isOpen,
  onClose,
  items,
  align,
  animationsEnabled,
}: FloatingSubmenuProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="menu"
          className={cn(
            "absolute bottom-full z-50 mb-2 w-[min(200px,calc(100vw-2rem))]",
            align === "center" && "left-1/2 -translate-x-1/2",
            align === "end" && "right-0",
            "rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-raised)] py-1.5",
            "shadow-[0_8px_32px_rgba(0,0,0,0.24)] backdrop-blur-2xl",
          )}
          initial={animationsEnabled ? { opacity: 0, y: 10, scale: 0.96 } : false}
          animate={animationsEnabled ? { opacity: 1, y: 0, scale: 1 } : {}}
          exit={animationsEnabled ? { opacity: 0, y: 10, scale: 0.96 } : {}}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          {items.map(({ href, label, icon: Icon }) => {
            const active = isItemActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={onClose}
                className={cn(
                  "flex min-h-11 items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-colors duration-200",
                  "active:bg-[var(--fx-06)]",
                  active
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                )}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0",
                    active ? "text-[var(--text-primary)] opacity-100" : "opacity-75",
                  )}
                  strokeWidth={active ? 2.1 : 1.75}
                />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
