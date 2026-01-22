import { Suspense } from "react"
import DashboardContent from "@/components/DashboardContent"

export const dynamic = "force-dynamic"

export default function DriverDashboardPage() {
  return (
    <main className="min-h-screen bg-[#070A12] text-white p-6 md:p-12 font-sans selection:bg-emerald-500/30">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
             <div className="h-12 w-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
             <p className="text-white/50 text-sm font-medium">Loading...</p>
          </div>
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </main>
  )
}