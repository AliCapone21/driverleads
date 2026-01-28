"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="dark" // Defaulting to dark fits your industrial aesthetic better
      enableSystem={false}
    >
      {children}
    </NextThemesProvider>
  )
}