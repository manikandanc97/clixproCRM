import { useCRMStore } from "@/shared/store/useCRMStore";

const CURRENCY_FORMATS: Record<string, { locale: string; currency: string }> = {
  USD: { locale: "en-US", currency: "USD" },
  INR: { locale: "en-IN", currency: "INR" },
  EUR: { locale: "en-IE", currency: "EUR" },
  GBP: { locale: "en-GB", currency: "GBP" },
  AED: { locale: "en-AE", currency: "AED" },
  SGD: { locale: "en-SG", currency: "SGD" },
  AUD: { locale: "en-AU", currency: "AUD" },
};

function getSupportedCurrency(value?: string | null): string {
  const currency = String(value || "USD").toUpperCase();
  return CURRENCY_FORMATS[currency] ? currency : "USD";
}

export function useCurrency() {
  const currency = useCRMStore((state) => state.currency) || "USD";

  const formatCurrency = (value: number | string | undefined | null) => {
    const numValue = Number(value || 0);
    const selectedCurrency = getSupportedCurrency(currency);
    const format = CURRENCY_FORMATS[selectedCurrency];

    return new Intl.NumberFormat(format.locale, {
      style: "currency",
      currency: selectedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  return { currency, formatCurrency };
}
