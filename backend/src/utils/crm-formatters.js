const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CUSTOMER_STATUS_LABELS = {
  PREMIUM: "Premium",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

const LEAD_STATUS_LABELS = {
  NEW: "New",
  CONTACTED: "Contacted",
  PROPOSAL_SENT: "Proposal Sent",
  WON: "Won",
  LOST: "Lost",
};

const PIPELINE_STAGE_LABELS = {
  NEW: "New Lead",
  CONTACTED: "Contacted",
  PROPOSAL_SENT: "Proposal Sent",
  WON: "Won",
  LOST: "Lost",
};

const TASK_PRIORITY_LABELS = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

const TASK_STATUS_LABELS = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

const QUOTATION_STATUS_LABELS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};

const CURRENCY_FORMATS = {
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

function toNumber(value) {
  return Number(value || 0);
}

function getSupportedCurrency(value) {
  const currency = String(value || "USD").toUpperCase();

  return CURRENCY_FORMATS[currency] ? currency : "USD";
}

function formatCurrency(value, currency = "USD") {
  const selectedCurrency = getSupportedCurrency(currency);
  const format = CURRENCY_FORMATS[selectedCurrency];

  return new Intl.NumberFormat(format.locale, {
    style: "currency",
    currency: selectedCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

function formatPercentage(value, digits = 0) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${safeValue.toFixed(digits)}%`;
}

function calculateTrend(currentValue, previousValue) {
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

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function isWithinRange(date, rangeStart, rangeEnd) {
  if (!date) {
    return false;
  }

  const time = new Date(date).getTime();
  return time >= rangeStart.getTime() && time < rangeEnd.getTime();
}

function getMonthBuckets(monthCount) {
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

function getDayBuckets(dayCount) {
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

function countInRange(items, getDate, rangeStart, rangeEnd) {
  return items.filter((item) => isWithinRange(getDate(item), rangeStart, rangeEnd)).length;
}

function sumInRange(items, getDate, getValue, rangeStart, rangeEnd) {
  return items.reduce((total, item) => {
    if (!isWithinRange(getDate(item), rangeStart, rangeEnd)) {
      return total;
    }

    return total + toNumber(getValue(item));
  }, 0);
}

function formatRelativeDate(date, options = {}) {
  const { fallback = "Not available" } = options;

  if (!date) {
    return fallback;
  }

  const now = new Date();
  const input = new Date(date);
  const currentDayStart = startOfDay(now);
  const inputDayStart = startOfDay(input);
  const dayDifference = Math.round(
    (inputDayStart.getTime() - currentDayStart.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (dayDifference === 0) {
    return "Today";
  }

  if (dayDifference === 1) {
    return "Tomorrow";
  }

  if (dayDifference === -1) {
    return "Yesterday";
  }

  if (dayDifference > 1 && dayDifference <= 6) {
    return `In ${dayDifference} days`;
  }

  if (dayDifference < -1 && dayDifference >= -6) {
    return `${Math.abs(dayDifference)} days ago`;
  }

  return longDateFormatter.format(input);
}

function formatDate(date, fallback = "Not available") {
  if (!date) {
    return fallback;
  }

  return longDateFormatter.format(new Date(date));
}

function getStatusLabel(labels, value) {
  return labels[value] || value;
}

module.exports = {
  CUSTOMER_STATUS_LABELS,
  CURRENCY_FORMATS,
  LEAD_STATUS_LABELS,
  PIPELINE_STAGE_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  QUOTATION_STATUS_LABELS,
  addDays,
  addMonths,
  calculateTrend,
  countInRange,
  formatCurrency,
  formatDate,
  formatPercentage,
  formatRelativeDate,
  getDayBuckets,
  getMonthBuckets,
  getStatusLabel,
  getSupportedCurrency,
  startOfDay,
  startOfMonth,
  sumInRange,
  toNumber,
};
