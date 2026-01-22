import { Suspense } from 'react'
import DriversClient from '../../components/DriversClient'
import { createClient } from "@/utils/supabase/server"

// Force dynamic because we check cookies
export const dynamic = "force-dynamic"

export default async function DriversPage({ searchParams }: { searchParams: { tab?: string } }) {
  // 1. Fetch User on Server (Instant Auth)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-[#070A12] flex items-center justify-center text-white/50">
          Loading...
        </div>
      }
    >
      {/* 2. Pass the user to the client component */}
      <DriversClient initialUser={user} />
    </Suspense>
  )
}