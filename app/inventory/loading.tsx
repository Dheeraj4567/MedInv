"use client";

import React from 'react';

// Directly include the loading UI structure here
export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center"> {/* Adjusted height */}
      <div className="relative">
        {/* Replicated spinner styles from page-loader.tsx */}
        <div className="loading-spinner" style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--hover-glow)',
            borderRadius: '50%',
            borderTopColor: 'var(--hover-glow-strong)',
            animation: 'spinner-rotate 1s linear infinite'
        }} />
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground animate-pulse">Loading Inventory...</p>
        </div>
      </div>
      {/* Keyframes need to be defined globally in globals.css, which they already are */}
      {/* <style jsx global>{`
        @keyframes spinner-rotate {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style> */}
    </div>
  );
}
