export const crmRadius = {
  card: "rounded-xl",
  modal: "rounded-xl",
  control: "rounded-lg",
  item: "rounded-md",
  pill: "rounded-full",
} as const;

export const crmSurface = {
  card:
    "rounded-xl border border-[var(--crm-border-subtle)] bg-card text-card-foreground shadow-[var(--crm-card-shadow)]",
  interactive:
    "transition-all duration-300 hover:border-primary/20 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 active:scale-[0.99]",
  mutedPanel: "rounded-lg border border-border bg-muted/40",
} as const;

export const crmControl = {
  base:
    "h-10 rounded-lg border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors",
  iconBox:
    "flex size-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground shadow-sm",
} as const;
