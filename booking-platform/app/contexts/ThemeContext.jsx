"use client";

import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

const STORAGE_KEY = 'haat_theme'

function resolveTheme(pref) {
  return 'dark'
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
  }, [])

  function setTheme(pref) {
    setThemeState('dark')
  }

  const resolvedTheme = 'dark'

  return (
    <ThemeContext.Provider value={{ theme: 'dark', resolvedTheme: 'dark', setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
