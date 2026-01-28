import { Suspense } from "react"
import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import DriverProfileClient from "@/components/DriverProfileClient"

// Force dynamic because we fetch based on URL ID and check user session/cookies
export const dynamic = "force-dynamic"

// In Next.js 15, params is a Promise that must be awaited
type PageProps = {
  params: Promise<{ id: string }>
}

export default async function DriverProfilePage({ params }: PageProps) {
  // 1. Await the params for Next.js 15 compatibility
  const { id } = await params

  if (!id) return notFound()

  const supabase = await createClient()

  // 2. Fetch Public Driver Data on the Server
  // We fetch only what is visible to everyone; private data is handled by the client + RLS
  const { data: driver, error } = await supabase
    .from("drivers")
    .select(`
      id, 
      first_name, 
      last_initial, 
      city, 
      state, 
      living_city, 
      living_state, 
      dob, 
      driver_type, 
      experience_years, 
      endorsements, 
      status
    `)
    .eq("id", id)
    .single()

  // Trigger 404 if driver doesn't exist
  if (error || !driver) {
    return notFound()
  }

  return (
    <main className="min-h-screen bg-[#070A12] text-slate-100 relative font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Ambient Background (Server-side)
          Kept here to ensure instant visual load without hydration flickering 
      */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[820px] h-[820px] rounded-full blur-[140px] opacity-40 bg-indigo-500/20" />
        <div className="absolute -bottom-44 -left-44 w-[720px] h-[720px] rounded-full blur-[140px] opacity-40 bg-cyan-500/15" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_45%),radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.04),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:42px_42px]" />
      </div>

      <Suspense fallback={<SkeletonProfile />}>
        {/* 3. Hand off to the client component for Purchase/Download logic */}
        <DriverProfileClient initialDriver={driver} id={id} />
      </Suspense>
    </main>
  )
}

function SkeletonProfile() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="h-16 mb-8 border-b border-white/5" />
      <div className="animate-pulse space-y-8">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {/* Header Block */}
            <div className="h-64 bg-white/5 rounded-3xl border border-white/10" />
            {/* Endorsements Block */}
            <div className="h-32 bg-white/5 rounded-3xl border border-white/10" />
          </div>
          {/* Action/Checkout Block */}
          <div className="lg:col-span-4">
            <div className="h-[500px] bg-white/5 rounded-3xl border border-white/10" />
          </div>
        </div>
      </div>
    </div>
  )
}