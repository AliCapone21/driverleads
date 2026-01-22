import { Suspense } from "react"
import SettingsClient from "../../../components/SettingsClient"

// ⚠️ FIX: Force dynamic rendering to prevent build errors
export const dynamic = "force-dynamic"

export default function RecruiterSettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070A12] flex items-center justify-center">
        <div className="h-10 w-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SettingsClient />
    </Suspense>
  )
}