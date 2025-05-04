'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type FrontendView = 'default' | 'futuristic';

interface FrontendContextType {
  currentView: FrontendView;
  setCurrentView: (view: FrontendView) => void;
}

const FrontendContext = createContext<FrontendContextType | undefined>(undefined);

export function FrontendProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<FrontendView>('default');

  return (
    <FrontendContext.Provider value={{ currentView, setCurrentView }}>
      {children}
    </FrontendContext.Provider>
  );
}

export function useFrontend() {
  const context = useContext(FrontendContext);
  if (context === undefined) {
    throw new Error('useFrontend must be used within a FrontendProvider');
  }
  return context;
}
