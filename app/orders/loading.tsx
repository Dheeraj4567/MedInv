"use client";
import React from 'react';
export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <div className="relative">
        <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--hover-glow)', borderRadius: '50%', borderTopColor: 'var(--hover-glow-strong)', animation: 'spinner-rotate 1s linear infinite' }} />
        <div className="mt-4 text-center"><p className="text-sm text-muted-foreground animate-pulse">Loading Orders...</p></div>
      </div>
    </div>
  );
}
