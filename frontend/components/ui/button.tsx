import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md border border-transparent",
        emerald:
          "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-md dark:bg-emerald-500 dark:hover:bg-emerald-600 border border-transparent",
        navy:
          "bg-slate-900 text-white shadow-sm hover:bg-slate-800 hover:shadow-md dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 border border-transparent",
        secondary:
          "bg-secondary text-secondary-foreground border border-border/50 shadow-sm hover:bg-secondary/80",
        outline:
          "border border-border bg-background shadow-sm hover:bg-muted hover:text-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 border border-transparent",
        link: 
          "text-primary underline-offset-4 hover:underline",
        destructive:
          "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 shadow-sm",
        premium:
          "bg-gradient-to-r from-primary to-emerald-600 text-primary-foreground shadow-md hover:shadow-lg hover:brightness-110 active:scale-[0.97] border-none",
      },
      size: {
        default: "h-10 px-5 rounded-xl",
        sm: "h-9 px-4 rounded-lg text-xs",
        lg: "h-11 px-6 rounded-xl text-base",
        xs: "h-8 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider",
        icon: "size-10 rounded-xl",
        "icon-sm": "size-9 rounded-lg",
        "icon-xs": "size-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
