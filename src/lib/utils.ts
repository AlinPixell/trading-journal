import { format, getHours, getMinutes } from "date-fns";

export const getDateKey = (value: string | Date) => format(new Date(value), "yyyy-MM-dd");
/** Dollar amounts with `$` — whole dollars only (no cents). */
export const formatDollar = (value: number, opts?: { unsigned?: boolean }) => {
  const v = opts?.unsigned ? Math.abs(value) : value;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(v));
};

export const formatDollarWhole = (value: number, opts?: { unsigned?: boolean }) =>
  formatDollar(value, opts);

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
