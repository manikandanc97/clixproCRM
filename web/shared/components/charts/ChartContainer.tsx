"use client";

import React, { useEffect, useState, useRef } from "react";
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

import { ChartSkeleton } from "@/shared/components/skeletons";

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
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateDimensions = () => {
      if (!node) return;
      const { clientWidth, clientHeight } = node;
      setDimensions({ width: clientWidth, height: clientHeight });
    };

    const observer = new ResizeObserver(() => {
      // Use requestAnimationFrame to avoid ResizeObserver loop limit exceeded error
      window.requestAnimationFrame(updateDimensions);
    });

    observer.observe(node);
    updateDimensions();

    return () => {
      observer.disconnect();
    };
  }, []);

  const containerStyle = {
    height: typeof height === 'number' ? `${height}px` : height,
    minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
  };

  const isReady = dimensions.width > 0 && dimensions.height > 0;

  return (
    <div 
      ref={containerRef}
      className={cn("w-full h-full min-w-0 relative", className)} 
      style={containerStyle}
    >
      {(!isReady || loading) ? (
        <div className="absolute inset-0 z-10 w-full h-full bg-card rounded-xl">
          <ChartSkeleton height="100%" />
        </div>
      ) : !hasData ? (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-muted/5 rounded-xl border border-dashed border-border/50">
          <p className="text-sm font-medium italic">{emptyMessage}</p>
        </div>
      ) : (
        <div className="absolute inset-0">
          {React.isValidElement(children) && React.cloneElement(children as React.ReactElement<{ width?: number; height?: number }>, {
            width: dimensions.width,
            height: dimensions.height
          })}
        </div>
      )}
    </div>
  );
};











