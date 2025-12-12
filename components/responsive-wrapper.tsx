"use client";

import { cn } from "@/lib/utils";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Responsive wrapper component that adapts layout based on screen size
 */
export function ResponsiveWrapper({ children, className }: ResponsiveWrapperProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  return (
    <div
      className={cn(
        "w-full",
        isMobile && "px-0",
        isTablet && !isMobile && "px-4",
        !isTablet && "px-6",
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

/**
 * Responsive grid component with customizable columns per breakpoint
 */
export function ResponsiveGrid({ 
  children, 
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 }
}: ResponsiveGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4 w-full",
        `grid-cols-${cols.mobile}`,
        `md:grid-cols-${cols.tablet}`,
        `lg:grid-cols-${cols.desktop}`,
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${cols.mobile}, minmax(0, 1fr))`,
      }}
    >
      {children}
    </div>
  );
}

interface ResponsiveTableWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Responsive table wrapper with horizontal scroll on mobile
 */
export function ResponsiveTableWrapper({ children, className }: ResponsiveTableWrapperProps) {
  return (
    <div className={cn("table-responsive", className)}>
      {children}
    </div>
  );
}

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Responsive card component with adaptive padding
 */
export function ResponsiveCard({ children, className }: ResponsiveCardProps) {
  return (
    <div className={cn("card-responsive", className)}>
      {children}
    </div>
  );
}

interface ResponsiveStackProps {
  children: React.ReactNode;
  className?: string;
  direction?: "vertical" | "horizontal";
}

/**
 * Responsive stack component that switches between vertical and horizontal layout
 */
export function ResponsiveStack({ 
  children, 
  className,
  direction = "vertical"
}: ResponsiveStackProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "flex gap-4",
        direction === "vertical" || isMobile ? "flex-col" : "flex-row",
        className
      )}
    >
      {children}
    </div>
  );
}