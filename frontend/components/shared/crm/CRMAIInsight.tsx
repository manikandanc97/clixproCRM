"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import { CRMCard } from "./CRMCard";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CRMAIInsightProps {
  title: string;
  description: string;
  recommendation?: string;
  probability?: number;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
  delay?: number;
}

export const CRMAIInsight = ({
  title,
  description,
  recommendation,
  probability,
  onAction,
  actionLabel = "Take Action",
  className,
  delay = 0,
}: CRMAIInsightProps) => {
  return (
    <CRMCard 
      delay={delay} 
      className={cn(
        "relative bg-gradient-to-br from-primary/5 via-transparent to-primary/5 border-primary/20",
        className
      )}
    >
      <div className="absolute top-0 right-0 p-4">
        <div className="flex items-center gap-2 px-2 py-1 bg-primary/10 text-primary rounded-full border border-primary/20 shadow-sm animate-pulse">
          <Sparkles className="w-3 h-3" />
          <span className="text-[10px] font-black uppercase tracking-wider">AI Insight</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="pr-20">
          <h4 className="text-lg font-bold tracking-tight mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {probability !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-semibold">Confidence Level</span>
              <span className="text-primary font-bold">{probability}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000" 
                style={{ width: `${probability}%` }}
              />
            </div>
          </div>
        )}

        {recommendation && (
          <div className="p-3 rounded-xl bg-background/50 border border-primary/10 text-sm italic text-muted-foreground">
            &quot;{recommendation}&quot;
          </div>
        )}

        {onAction && (
          <Button 
            onClick={onAction}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold group shadow-lg shadow-primary/10"
          >
            {actionLabel}
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </div>
    </CRMCard>
  );
};
