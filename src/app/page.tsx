// src/app/page.tsx

import { Suspense } from "react"
import HomeClient from "@/components/HomeClient"

// ✅ FIX: Restore this line. 
// It prevents the build error by telling Next.js "Don't try to build this as static HTML."
export const dynamic = "force-dynamic"

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[var(--foreground)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <HomeClient />
    </Suspense>
  )
}