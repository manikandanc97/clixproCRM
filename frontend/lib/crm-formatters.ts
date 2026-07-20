export const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const CUSTOMER_STATUS_LABELS: Record<string, string> = {
  PREMIUM: "Premium",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

export const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  PROPOSAL_SENT: "Proposal Sent",
  WON: "Won",
  LOST: "Lost",
};

export const PIPELINE_STAGE_LABELS: Record<string, string> = {
  NEW: "New Lead",
  CONTACTED: "Contacted",
  PROPOSAL_SENT: "Proposal Sent",
  WON: "Won",
  LOST: "Lost",
};

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

export const QUOTATION_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};

export const CURRENCY_FORMATS: Record<string, { locale: string; currency: string }> = {
  USD: { locale: "en-US", currency: "USD" },
  INR: { locale: "en-IN", currency: "INR" },
  EUR: { locale: "en-IE", currency: "EUR" },
  GBP: { locale: "en-GB", currency: "GBP" },
  AED: { locale: "en-AE", currency: "AED" },
};

const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function toNumber(value: any): number {
  return Number(value || 0);
}

export function getSupportedCurrency(value?: string | null): string {
  const currency = String(value || "USD").toUpperCase();
  return CURRENCY_FORMATS[currency] ? currency : "USD";
}

export function formatCurrency(value: any, currency = "USD"): string {
  const selectedCurrency = getSupportedCurrency(currency);
  const format = CURRENCY_FORMATS[selectedCurrency];

  return new Intl.NumberFormat(format.locale, {
    style: "currency",
    currency: selectedCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

export function formatPercentage(value: any, digits = 0): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${safeValue.toFixed(digits)}%`;
}

export function calculateTrend(currentValue: number, previousValue: number) {
  if (!previousValue) {
    if (!currentValue) {
      return { change: "0.0%", positive: true };
    }
    return { change: "+100.0%", positive: true };
  }

  const delta = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
  const rounded = Number(delta.toFixed(1));

  return {
    change: `${rounded >= 0 ? "+" : ""}${rounded.toFixed(1)}%`,
    positive: rounded >= 0,
  };
}

export function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function isWithinRange(date: any, rangeStart: Date, rangeEnd: Date) {
  if (!date) return false;
  const time = new Date(date).getTime();
  return time >= rangeStart.getTime() && time < rangeEnd.getTime();
}

export function getMonthBuckets(monthCount: number) {
  const currentMonthStart = startOfMonth(new Date());

  return Array.from({ length: monthCount }, (_, index) => {
    const bucketStart = addMonths(currentMonthStart, index - (monthCount - 1));
    const bucketEnd = addMonths(bucketStart, 1);

    return {
      key: `${bucketStart.getFullYear()}-${bucketStart.getMonth()}`,
      label: MONTH_LABELS[bucketStart.getMonth()],
      start: bucketStart,
      end: bucketEnd,
    };
  });
}

export function getDayBuckets(dayCount: number) {
  const todayStart = startOfDay(new Date());

  return Array.from({ length: dayCount }, (_, index) => {
    const bucketStart = addDays(todayStart, index - (dayCount - 1));
    const bucketEnd = addDays(bucketStart, 1);

    return {
      key: bucketStart.toISOString().slice(0, 10),
      label: WEEKDAY_LABELS[bucketStart.getDay()],
      start: bucketStart,
      end: bucketEnd,
    };
  });
}

export function countInRange<T>(items: T[], getDate: (item: T) => Date, rangeStart: Date, rangeEnd: Date) {
  return items.filter((item) => isWithinRange(getDate(item), rangeStart, rangeEnd)).length;
}

export function sumInRange<T>(items: T[], getDate: (item: T) => Date, getValue: (item: T) => number, rangeStart: Date, rangeEnd: Date) {
  return items.reduce((total, item) => {
    if (!isWithinRange(getDate(item), rangeStart, rangeEnd)) {
      return total;
    }
    return total + toNumber(getValue(item));
  }, 0);
}

export function formatRelativeDate(date: any, options: { fallback?: string } = {}) {
  const { fallback = "Not available" } = options;

  if (!date) return fallback;

  const now = new Date();
  const input = new Date(date);
  
  if (isNaN(input.getTime())) return fallback;

  const currentDayStart = startOfDay(now);
  const inputDayStart = startOfDay(input);
  const dayDifference = Math.round(
    (inputDayStart.getTime() - currentDayStart.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (dayDifference === 0) return "Today";
  if (dayDifference === 1) return "Tomorrow";
  if (dayDifference === -1) return "Yesterday";
  if (dayDifference > 1 && dayDifference <= 6) return `In ${dayDifference} days`;
  if (dayDifference < -1 && dayDifference >= -6) return `${Math.abs(dayDifference)} days ago`;

  return longDateFormatter.format(input);
}

export function formatDate(date: any, fallback = "Not available") {
  if (!date) return fallback;
  const input = new Date(date);
  if (isNaN(input.getTime())) return fallback;
  return longDateFormatter.format(input);
}

export function getStatusLabel(labels: Record<string, string>, value: string) {
  return labels[value] || value;
}

export function getMonthRanges() {
  const currentMonthStart = startOfMonth(new Date());
  const nextMonthStart = addMonths(currentMonthStart, 1);
  const previousMonthStart = addMonths(currentMonthStart, -1);

  return {
    currentMonthStart,
    nextMonthStart,
    previousMonthStart,
  };
}
