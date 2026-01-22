import { Suspense } from 'react'
import DriversClient from '../../components/DriversClient' 

// Force dynamic rendering ensures the client component always mounts fresh
export const dynamic = "force-dynamic" 

export default function DriversPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-[#070A12] flex items-center justify-center text-white/50">
          Loading...
        </div>
      }
    >
      <DriversClient />
    </Suspense>
  )
}