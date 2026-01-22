import { Suspense } from "react"
import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import DriverProfileClient from "@/components/DriverProfileClient"

// Force dynamic because we are fetching data based on the ID in the URL
export const dynamic = "force-dynamic"

export default async function DriverProfilePage({ params }: { params: { id: string } }) {
  // Await params because in Next.js 15+ params are async (future-proofing)
  // But for now we treat them as sync or await them if using latest Next.js types
  const id = params.id 

  const supabase = await createClient()

  // 1. Fetch Public Driver Data on the Server
  const { data: driver, error } = await supabase
    .from("drivers")
    .select("id, first_name, last_initial, city, state, living_city, living_state, dob, driver_type, experience_years, endorsements, status")
    .eq("id", id)
    .single()

  if (error || !driver) {
    return notFound()
  }

  // 2. Pass data to the Client Component
  return (
    <main className="min-h-screen bg-[#070A12] text-slate-100 relative font-sans selection:bg-white selection:text-black">
      {/* Background stays on server to avoid re-renders */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[820px] h-[820px] rounded-full blur-[140px] opacity-40 bg-indigo-500/20" />
        <div className="absolute -bottom-44 -left-44 w-[720px] h-[720px] rounded-full blur-[140px] opacity-40 bg-cyan-500/15" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_45%),radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.04),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:42px_42px]" />
      </div>

      <Suspense fallback={<SkeletonProfile />}>
        <DriverProfileClient initialDriver={driver} id={id} />
      </Suspense>
    </main>
  )
}

function SkeletonProfile() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 animate-pulse">
       <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="h-64 bg-white/5 rounded-3xl border border-white/10" />
          <div className="h-32 bg-white/5 rounded-3xl border border-white/10" />
        </div>
        <div className="md:col-span-1">
          <div className="h-96 bg-white/5 rounded-3xl border border-white/10" />
        </div>
      </div>
    </div>
  )
}