"use client";

import { ThemeProvider } from '@/app/contexts/ThemeContext';

export function Providers({ children }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
