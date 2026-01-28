// src/app/drivers/page.tsx

import { Suspense } from 'react'
import DriversClient from '@/components/DriversClient'
import { createClient } from "@/utils/supabase/server"

// Force dynamic because we need access to session cookies for Auth
export const dynamic = "force-dynamic"

// In Next.js 15, searchParams is a Promise
type PageProps = {
  searchParams: Promise<{ tab?: string }>
}

export default async function DriversPage({ searchParams }: PageProps) {
  // 1. Await params and fetch User on Server for instant Auth verification
  const [{ data: { user } }] = await Promise.all([
    (await createClient()).auth.getUser(),
    searchParams // Future-proofing even if not used immediately in server logic
  ])

  return (
    <main className="min-h-screen bg-[#070A12] selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background Decor (Server-side for zero layout shift) */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[1000px] h-[1000px] bg-indigo-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-emerald-600/5 rounded-full blur-[120px]" />
      </div>

      <Suspense fallback={<MarketplaceSkeleton />}>
        {/* 2. Hand off session to the Client Component */}
        <DriversClient initialUser={user} />
      </Suspense>
    </main>
  )
}

function MarketplaceSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Skeleton */}
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div className="space-y-3">
          <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-white/5 rounded-xl animate-pulse" />
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Filters Sidebar Skeleton */}
        <div className="lg:col-span-3 space-y-4 hidden lg:block">
          <div className="h-64 bg-white/5 rounded-3xl border border-white/10 animate-pulse" />
        </div>

        {/* Results Grid Skeleton */}
        <div className="lg:col-span-9 grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 bg-white/5 rounded-[32px] border border-white/10 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}