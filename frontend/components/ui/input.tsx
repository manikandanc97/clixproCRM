import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:inline-flex flex h-10 w-full min-w-0 rounded-lg border border-input bg-background px-4 py-2 text-base font-medium shadow-sm outline-none transition-all file:h-6 file:border-0 file:bg-transparent file:font-medium file:text-sm file:text-foreground placeholder:text-muted-foreground/60 hover:border-border focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/10 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/20 md:text-sm",
        className,
        "rounded-lg",
      )}
      {...props}
    />
  );
}

export { Input };
