"use client";

import React, { useEffect, useState, useRef } from "react";
import { ResponsiveContainer } from "recharts";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

interface ChartContainerProps {
  children: React.ReactNode;
  /** Height of the container, default is 300 */
  height?: string | number;
  /** Loading state */
  loading?: boolean;
  /** Whether there is data to display */
  hasData?: boolean;
  /** Message to show when there is no data */
  emptyMessage?: string;
  /** Additional class names for the container */
  className?: string;
  /** Minimum height of the container */
  minHeight?: string | number;
}

/**
 * A standardized wrapper for Recharts that ensures proper rendering dimensions.
 * Fixes "The width(-1) and height(-1) of chart should be greater than 0" warnings.
 */
export const ChartContainer = ({
  children,
  height = 300,
  loading = false,
  hasData = true,
  emptyMessage = "No data available",
  className,
  minHeight
}: ChartContainerProps) => {
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if the container has valid dimensions before rendering the chart
    const checkDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        // Recharts needs dimensions > 0 to render without warnings
        if (clientWidth > 0 && clientHeight > 0) {
          setIsReady(true);
          return true;
        }
      }
      return false;
    };

    // Initial check
    if (!checkDimensions()) {
      // If dimensions are not ready (e.g. hidden tab), poll until they are
      const interval = setInterval(() => {
        if (checkDimensions()) {
          clearInterval(interval);
        }
      }, 100);
      
      // Also listen for window resize which might fix dimensions
      window.addEventListener('resize', checkDimensions);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('resize', checkDimensions);
      };
    }
  }, []);

  const containerStyle = {
    height: typeof height === 'number' ? `${height}px` : height,
    minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
  };

  return (
    <div 
      ref={containerRef}
      className={cn("w-full min-w-0 relative", className)} 
      style={containerStyle}
    >
      {(!isReady || loading) ? (
        <div className="absolute inset-0 flex flex-col gap-4 p-4 bg-card/50 rounded-xl animate-pulse">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="flex-1 w-full rounded-xl" />
        </div>
      ) : !hasData ? (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-muted/5 rounded-xl border border-dashed border-border/50">
          <p className="text-sm font-medium italic">{emptyMessage}</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      )}
    </div>
  );
};











