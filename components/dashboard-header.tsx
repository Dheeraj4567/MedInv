'use client';

import { useContext } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { DeploymentModeIndicator } from "./deployment-mode-indicator";

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
    <div className="flex items-center justify-between pb-6 border-b border-border/40 mb-6">
      {showHeading && (
        <div className="grid gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {heading}
          </h1>
          {text && (
            <p className="text-muted-foreground text-sm">
              {text}
            </p>
          )}
        </div>
      )}
      <div className={cn("flex items-center gap-4", !showHeading && "ml-auto")}>
        <DeploymentModeIndicator />
        {children}
      </div>
    </div>
  );
}

