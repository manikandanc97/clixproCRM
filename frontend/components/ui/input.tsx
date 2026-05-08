import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:inline-flex flex bg-transparent disabled:bg-muted/50 dark:bg-input/30 dark:disabled:bg-input/80 file:bg-transparent disabled:opacity-50 px-4 py-2 border border-input aria-invalid:border-destructive hover:border-border/80 focus-visible:border-primary dark:aria-invalid:border-destructive/50 file:border-0 rounded-lg outline-none aria-invalid:ring-2 aria-invalid:ring-destructive/10 focus-visible:ring-2 focus-visible:ring-primary/10 dark:aria-invalid:ring-destructive/20 w-full min-w-0 h-10 file:h-6 file:font-medium placeholder:text-muted-foreground/60 file:text-foreground md:text-sm file:text-sm text-base transition-all disabled:cursor-not-allowed disabled:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
