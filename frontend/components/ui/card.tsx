import * as React from "react";

import { cn } from "@/lib/utils";

function Card({
  className,
  size = "default",
  hover = true,
  glass = false,
  elevated = false,
  ...props
}: React.ComponentProps<"div"> & {
  size?: "default" | "sm";
  hover?: boolean;
  glass?: boolean;
  elevated?: boolean;
}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card relative flex flex-col bg-card shadow-card border border-border rounded-[var(--crm-card-radius)] overflow-hidden text-card-foreground transition-all duration-300",
        hover &&
          "hover:-translate-y-1 hover:shadow-md hover:border-primary/20",
        glass && "glass dark:glass-dark backdrop-blur-premium",
        elevated && "shadow-elevated hover:shadow-glow",
        size === "sm" ? "p-0 gap-2" : "p-0 gap-3",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col space-y-1 px-5 lg:px-6 py-4 lg:py-5",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-bold text-foreground text-xl leading-tight tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("font-medium text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-5 lg:px-6 pt-0 pb-4 lg:pb-5", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center p-5 lg:p-6 pt-0", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
