'use client';

import * as React from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useTheme() {
  return {
    theme: 'light' as const,
    setTheme: () => {},
  };
}
