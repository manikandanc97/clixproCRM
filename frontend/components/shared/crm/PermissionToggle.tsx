"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PermissionToggleProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  description?: string;
  className?: string;
}

export const PermissionToggle = ({
  id,
  label,
  checked,
  onCheckedChange,
  description,
  className,
}: PermissionToggleProps) => {
  return (
    <div className={cn("flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors", className)}>
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-bold tracking-tight cursor-pointer">
          {label}
        </Label>
        {description && (
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            {description}
          </p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-emerald-500"
      />
    </div>
  );
};
