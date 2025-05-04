'use client';

import React from 'react';
// Removed ldrs import and registration logic

interface PageLoaderProps {
  text?: string;
}

export default function PageLoader({ text = "Loading..." }: PageLoaderProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="relative">
        <div className="loading-spinner" />
        <div className="absolute inset-0 animate-pulse opacity-75">
          <div className="loading-pulse" />
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
        </div>
        <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-yellow-100/10 to-transparent animate-shimmer" />
      </div>
    </div>
  )
}
