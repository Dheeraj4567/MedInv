import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 relative transition-all",
          "hover:border-yellow-500/30 focus:border-yellow-500/50",
          "before:absolute before:inset-0 before:rounded-md before:bg-gradient-to-r before:from-yellow-500/5 before:via-transparent before:to-yellow-500/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity",
          "after:absolute after:inset-0 after:rounded-md after:shadow-[0_0_10px_rgba(234,179,8,0.1)] after:opacity-0 focus:after:opacity-100 after:transition-opacity",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
