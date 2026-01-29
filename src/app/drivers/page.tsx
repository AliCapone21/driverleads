// src/app/drivers/page.tsx

import { Suspense } from "react"
import DriversClient from "@/components/DriversClient"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

// In Next.js 15, searchParams is a Promise
type PageProps = {
  searchParams: Promise<{ tab?: string }>
}

export default async function DriversPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // ✅ Await both so Next "uses" the promise and you stay future-proof
  const [{ data: { user } }, _params] = await Promise.all([
    supabase.auth.getUser(),
    searchParams,
  ])

  return (
    // ✅ IMPORTANT: allow ThemeToggle (dark class on <html>) to actually change visuals
    // - remove hard-coded dark-only colors here
    // - use dark: variants instead
    <main className="min-h-screen bg-white dark:bg-[#070A12] text-zinc-900 dark:text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background Decor (Server-side for zero layout shift) */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Light mode blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[1000px] h-[1000px] bg-indigo-600/10 rounded-full blur-[120px] dark:hidden" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[120px] dark:hidden" />

        {/* Dark mode blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[1000px] h-[1000px] bg-indigo-600/5 rounded-full blur-[120px] hidden dark:block" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-emerald-600/5 rounded-full blur-[120px] hidden dark:block" />

        {/* Subtle grid (nice in both modes) */}
        <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08] [background-image:linear-gradient(to_right,rgba(0,0,0,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.10)_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:42px_42px]" />
      </div>

      <Suspense fallback={<MarketplaceSkeleton />}>
        {/* Hand off session to the Client Component */}
        <DriversClient initialUser={user} />
      </Suspense>
    </main>
  )
}

function MarketplaceSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Skeleton */}
      <div className="flex justify-between items-end border-b border-zinc-200/60 dark:border-white/5 pb-8">
        <div className="space-y-3">
          <div className="h-8 w-48 bg-zinc-200/60 dark:bg-white/5 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-zinc-200/60 dark:bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-zinc-200/60 dark:bg-white/5 rounded-xl animate-pulse" />
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Filters Sidebar Skeleton */}
        <div className="lg:col-span-3 space-y-4 hidden lg:block">
          <div className="h-64 bg-zinc-200/60 dark:bg-white/5 rounded-3xl border border-zinc-200/60 dark:border-white/10 animate-pulse" />
        </div>

        {/* Results Grid Skeleton */}
        <div className="lg:col-span-9 grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-72 bg-zinc-200/60 dark:bg-white/5 rounded-[32px] border border-zinc-200/60 dark:border-white/10 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
