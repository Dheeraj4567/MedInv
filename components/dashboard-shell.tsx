"use client";

import type React from "react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({
  children,
  className,
  ...props
}: DashboardShellProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "flex flex-col w-full h-full",
        isMobile ? "gap-4" : "gap-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
