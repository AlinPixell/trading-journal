import { format, getHours, getMinutes } from "date-fns";

export const getDateKey = (value: string | Date) => format(new Date(value), "yyyy-MM-dd");
export const formatDollar = (
  value: number,
  opts?: { maximumFractionDigits?: number; unsigned?: boolean },
) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: opts?.maximumFractionDigits ?? 2,
  }).format(opts?.unsigned ? Math.abs(value) : value);

export const formatDollarWhole = (
  value: number,
  opts?: { unsigned?: boolean },
) => formatDollar(value, { maximumFractionDigits: 0, unsigned: opts?.unsigned });

export const formatTradeCreatedAt = (createdAt: string) => {
  const date = new Date(createdAt);
  return `${format(date, "MMM d")}, ${format(date, "HH:mm")}`;
};

export const getTradeTimeLabel = (createdAt: string) => {
  const date = new Date(createdAt);
  const hours = getHours(date);
  const minutes = getMinutes(date);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

export const getDateLabel = (createdAt: string) => {
  return format(new Date(createdAt), "MMM d, yyyy");
};
