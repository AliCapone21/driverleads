import { Suspense } from 'react'
import DriversClient from './DriversClient'

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