"use client";

import React from "react";
import { YellowGlowEffect } from "./yellow-glow-effect";
import { DataVisualization } from "./data-visualization";

interface FuturisticLayoutProps {
  children: React.ReactNode;
}

export function FuturisticLayout({ children }: FuturisticLayoutProps) {
  return (
    <div className="relative min-h-screen">
      {/* Background effects */}
      <YellowGlowEffect />
      <DataVisualization />

      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-5" />

       {/* Content */}
       <div className="relative z-10">
         {/* Removed mx-auto max-w-7xl to allow full width */}
         <div>
           <div className="relative">
             {/* Gradient overlay */}
             <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/50 to-background/80 backdrop-blur-sm" />

            {/* Main content */}
            <div className="relative">{children}</div>
          </div>
        </div>
       </div>

       {/* Corner accents - Temporarily commented out for debugging login page interaction */}
       {/* <div className="pointer-events-none fixed inset-0 z-20">
         <div className="absolute left-0 top-0 h-32 w-32">
           <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-yellow-500/5 to-transparent transform rotate-45" />
        </div>
        <div className="absolute right-0 top-0 h-32 w-32">
          <div className="absolute inset-0 bg-gradient-to-bl from-yellow-500/20 via-yellow-500/5 to-transparent transform -rotate-45" />
        </div>
        <div className="absolute left-0 bottom-0 h-32 w-32">
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/20 via-yellow-500/5 to-transparent transform -rotate-45" />
        </div>
         <div className="absolute right-0 bottom-0 h-32 w-32">
           <div className="absolute inset-0 bg-gradient-to-tl from-yellow-500/20 via-yellow-500/5 to-transparent transform rotate-45" />
         </div>
       </div> */}
     </div>
  );
}
