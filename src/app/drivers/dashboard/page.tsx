// src/app/drivers/dashboard/page.tsx

import { Suspense } from "react"
import DashboardContent from "@/components/DashboardContent"

export const dynamic = "force-dynamic"

export default function DriverDashboardPage() {
  return (
    // ✅ IMPORTANT: do NOT hardcode dark-only styles here.
    // Let ThemeProvider + <html class="dark"> control the theme.
    <main className="min-h-screen bg-white text-zinc-900 dark:bg-[#070A12] dark:text-white font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center px-6">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-2 border-emerald-500/20" />
                <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              </div>
              <p className="text-zinc-600 dark:text-white/60 text-sm font-semibold">Loading dashboard…</p>
            </div>
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </main>
  )
}
