import { ChevronDown, ChevronUp } from "lucide-react";

interface CRMSortIndicatorProps {
  active: boolean;
  direction?: "asc" | "desc";
}

export function CRMSortIndicator({ active, direction }: CRMSortIndicatorProps) {
  if (!active) {
    return <ChevronDown className="h-3 w-3 opacity-20 group-hover:opacity-50" />;
  }

  return direction === "asc" ? (
    <ChevronUp className="h-3 w-3 text-primary" />
  ) : (
    <ChevronDown className="h-3 w-3 text-primary" />
  );
}











