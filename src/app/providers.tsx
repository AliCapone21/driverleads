// src/app/providers.tsx
"use client"

import { ThemeProvider } from "@/components/ThemeProvider"
import { NavigationProvider, RouteLoader } from "@/components/navigation-loader"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <RouteLoader />
        {children}
      </NavigationProvider>
    </ThemeProvider>
  )
}
