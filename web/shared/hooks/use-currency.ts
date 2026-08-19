import { useCRMStore } from "@/shared/store/useCRMStore";
import { IndianRupee } from "lucide-react";

const CURRENCY_FORMATS: Record<string, { locale: string; currency: string }> = {
  INR: { locale: "en-IN", currency: "INR" },
};

function getSupportedCurrency(value?: string | null): string {
  return "INR";
}

export function useCurrency() {
  const currency = "INR";

  const formatCurrency = (value: number | string | undefined | null) => {
    const numValue = Number(value || 0);

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const CurrencyIcon = IndianRupee;
  const currencySymbol = "₹";
  const currencyCode = "INR";

  return { currency, formatCurrency, currencySymbol, currencyCode, CurrencyIcon };
}

