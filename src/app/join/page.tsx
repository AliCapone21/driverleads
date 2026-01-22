import { Suspense } from "react"
import JoinClient from "../../components/JoinClient"

// ⚠️ FIX: Force dynamic rendering to prevent build errors
export const dynamic = "force-dynamic"

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070A12] flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    }>
      <JoinClient />
    </Suspense>
  )
}