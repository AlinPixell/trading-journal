import { addDays, endOfMonth, endOfWeek, format, formatISO, getMonth, getYear, isSameMonth, startOfMonth, startOfWeek } from "date-fns";

export const formatMonthYear = (date: Date) => format(date, "MMMM yyyy");
export const formatSelectedDate = (date: Date) => format(date, "MMM d, yyyy");
export const formatTradeTime = (isoDate: string) => format(new Date(isoDate), "HH:mm");
export const formatDateKey = (date: Date | string) => format(new Date(date), "yyyy-MM-dd");
export const parseISODate = (value: string) => new Date(value);
export const buildMonthDate = (year: number, month: number) => new Date(year, month, 1);
export const isSameCalendarMonth = (date: Date, month: number, year: number) => getMonth(date) === month && getYear(date) === year;
export const getCalendarDays = (year: number, month: number) => {
  const monthDate = new Date(year, month, 1);
  const calendarStart = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
  const days: Date[] = [];

  let current = calendarStart;
  while (current <= calendarEnd) {
    days.push(current);
    current = addDays(current, 1);
  }

  return days;
};

export const isDateInMonth = (date: Date, month: number, year: number) => {
  return isSameMonth(date, new Date(year, month, 1));
};
