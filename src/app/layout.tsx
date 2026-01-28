// src/app/layout.tsx

import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { NavigationProvider, RouteLoader } from "@/components/navigation-loader"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Driver Leads - The Premium Driver Marketplace",
  description: "Unlock verified CDL driver contact details instantly. No subscription fees for recruiters.",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // suppressHydrationWarning is required for next-themes to work without errors
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Providers wrap the entire app */}
        <ThemeProvider>
          <NavigationProvider>
            <RouteLoader />
            {children}
          </NavigationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}