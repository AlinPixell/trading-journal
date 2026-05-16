import type { TradeDirection } from "@/types/trade";

/**
 * Pick which exit price to use for realized P/L when both SL and TP fills are present.
 * Prefers the fill that deviates from the planned level; otherwise uses the larger price excursion from entry.
 */
export function resolveExitPrice(
  direction: TradeDirection,
  entry: number,
  stopPlanned: number,
  tpPlanned: number,
  slHit: number,
  tpHit: number,
): number | null {
  if (!Number.isFinite(entry)) return null;
  const tpFinite = Number.isFinite(tpHit);
  const slFinite = Number.isFinite(slHit);
  if (!tpFinite && !slFinite) return null;

  const tpMeaningful = tpFinite && Math.abs(tpHit) > 1e-12;
  const slMeaningful = slFinite && Math.abs(slHit) > 1e-12;
  if (!tpMeaningful && !slMeaningful) return null;

  const tpDeviates = tpMeaningful && Math.abs(tpHit - tpPlanned) > 1e-9;
  const slDeviates = slMeaningful && Math.abs(slHit - stopPlanned) > 1e-9;

  if (tpDeviates && !slDeviates) return tpHit;
  if (slDeviates && !tpDeviates) return slHit;
  if (tpDeviates && slDeviates) {
    if (direction === "BUY") return slHit < entry - 1e-12 ? slHit : tpHit;
    return slHit > entry + 1e-12 ? slHit : tpHit;
  }
  if (tpMeaningful && slMeaningful) {
    return Math.abs(tpHit - entry) >= Math.abs(slHit - entry) ? tpHit : slHit;
  }
  return tpMeaningful ? tpHit : slMeaningful ? slHit : null;
}

function contractDollarsPerPriceUnitPerLot(pair: string): number {
  const p = pair.toUpperCase();
  if (p.includes("XAU")) return 100;
  if (p.includes("XAG")) return 50;
  return 10;
}

/**
 * Stylized closed-trade P/L in account currency from entry vs resolved exit.
 * Scales with lot size, leverage, account balance, and a coarse contract factor from the symbol.
 * Intended as a journal estimate — not broker-exact fills.
 */
export function estimateClosedTradePnlUsd(params: {
  pair: string;
  direction: TradeDirection;
  entry: number;
  stopPlanned: number;
  takeProfitPlanned: number;
  slHit: number;
  tpHit: number;
  lotSize: number;
  leverage: number;
  accountBalance: number;
}): number | null {
  const exit = resolveExitPrice(
    params.direction,
    params.entry,
    params.stopPlanned,
    params.takeProfitPlanned,
    params.slHit,
    params.tpHit,
  );
  if (exit == null || !Number.isFinite(params.entry)) return null;

  const dir = params.direction === "BUY" ? 1 : -1;
  const priceMove = (exit - params.entry) * dir;
  if (!Number.isFinite(priceMove)) return null;

  const lot = params.lotSize > 0 ? params.lotSize : 0.01;
  const lev = params.leverage > 0 ? params.leverage / 100 : 1;
  /** Linear in account size (vs 100k baseline) so balance edits in settings reflect in the estimate. */
  const acct = params.accountBalance > 0 ? params.accountBalance / 100_000 : 1;

  const contract = contractDollarsPerPriceUnitPerLot(params.pair);
  return priceMove * lot * contract * lev * Math.max(acct, 0.1);
}
