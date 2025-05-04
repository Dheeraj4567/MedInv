'use client';

import { useContext } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface DashboardHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
  hideTitleOnCollapsed?: boolean;
}

export function DashboardHeader({
  heading,
  text,
  children,
  hideTitleOnCollapsed = false,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  
  // Determine if we should show the heading based on the current page
  const showHeading = !hideTitleOnCollapsed || pathname !== '/';
  
  return (
    <div className="flex items-center justify-between px-0">
      {showHeading && (
        <div className="grid gap-0">
          <h1 className="text-2xl font-bold tracking-tight warm-text mb-1"> {/* Added mb-1 */}
            {heading}
          </h1>
          {text && (
            <p className="text-muted-foreground mb-0"> {/* Removed bottom margin */}
              {text}
            </p>
          )}
        </div>
      )}
      <div className={cn(!showHeading && "ml-auto")}>
        {children}
      </div>
    </div>
  );
}

