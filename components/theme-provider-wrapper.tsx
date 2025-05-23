'use client'

import React from 'react'
import { ThemeProvider } from './theme-provider'

export function ThemeProviderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <ThemeProvider>{children}</ThemeProvider>
}