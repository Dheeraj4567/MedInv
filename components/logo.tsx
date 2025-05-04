import { Pill } from "lucide-react"

export function Logo() {
  // Removed dynamic state and effects for hue/glow

  return (
    <div className="flex items-center gap-2"> {/* Removed relative positioning */}
      {/* Removed absolute positioned glow div */}
      <Pill
        className="h-6 w-6 text-primary" // Simplified: uses theme primary color
        // Removed dynamic filter style
      />
      <span
        className="text-xl font-bold tracking-tight text-foreground" // Simplified: uses theme foreground
        // Removed dynamic textShadow style
      >
        {/* Apply secondary color to "Medi" */}
        <span className="text-secondary">Medi</span> 
        <span className="text-primary">Track</span>
      </span>
    </div>
  )
}
