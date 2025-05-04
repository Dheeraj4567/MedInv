"use client"

import PageLoader from "@/components/page-loader"

export default function Loading() {
  return (
    <div className="relative min-h-screen">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute -inset-x-40 inset-y-0">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/5 to-transparent animate-shimmer" />
        </div>
      </div>
      
      {/* Loading spinner */}
      <div className="relative z-10">
        <PageLoader />
      </div>
    </div>
  )
}