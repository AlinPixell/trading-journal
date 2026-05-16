import type { CandlePlaybookItem, StrategyPlaybookItem } from "@/types/playbook";

function newPlaybookId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `pb-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function normalizeStrategyPlaybookItem(raw: unknown): StrategyPlaybookItem {
  const r = raw as Record<string, unknown>;
  return {
    id: typeof r.id === "string" && r.id.length > 0 ? r.id : newPlaybookId(),
    name: typeof r.name === "string" ? r.name : "Untitled",
    image: typeof r.image === "string" ? r.image : "",
    howItWorks: typeof r.howItWorks === "string" ? r.howItWorks : "",
    whenToUse: typeof r.whenToUse === "string" ? r.whenToUse : "",
  };
}

export function normalizeCandlePlaybookItem(raw: unknown): CandlePlaybookItem {
  const r = raw as Record<string, unknown>;
  return {
    id: typeof r.id === "string" && r.id.length > 0 ? r.id : newPlaybookId(),
    name: typeof r.name === "string" ? r.name : "Untitled",
    image: typeof r.image === "string" ? r.image : "",
    definition: typeof r.definition === "string" ? r.definition : "",
  };
}
