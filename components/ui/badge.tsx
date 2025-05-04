import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:ring-offset-2 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 before:absolute before:inset-0 before:bg-gradient-to-r before:from-yellow-500/20 before:via-transparent before:to-yellow-500/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 before:absolute before:inset-0 before:bg-gradient-to-r before:from-yellow-500/10 before:via-transparent before:to-yellow-500/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground before:absolute before:inset-0 before:bg-gradient-to-r before:from-yellow-500/5 before:via-transparent before:to-yellow-500/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        glow: "border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 via-transparent to-yellow-500/20 text-foreground hover:from-yellow-500/30 hover:to-yellow-500/30 hover:border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)] hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]",
        warning:
          "border-transparent bg-amber-500 text-black hover:bg-amber-600 before:absolute before:inset-0 before:bg-gradient-to-r before:from-yellow-500/20 before:via-transparent before:to-yellow-500/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        success:
          "border-transparent bg-emerald-500 text-white hover:bg-emerald-600 before:absolute before:inset-0 before:bg-gradient-to-r before:from-yellow-500/10 before:via-transparent before:to-yellow-500/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        info:
          "border-transparent bg-sky-500 text-white hover:bg-sky-600 before:absolute before:inset-0 before:bg-gradient-to-r before:from-yellow-500/10 before:via-transparent before:to-yellow-500/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
