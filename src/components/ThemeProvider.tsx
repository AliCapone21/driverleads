// src/components/ThemeProvider.tsx

"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"     // puts "dark" class on <html>
      defaultTheme="dark"   // you can change to "light" if you want
      enableSystem={false}  // keep it controlled by your toggle
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
