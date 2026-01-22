import { Suspense } from "react"
import HomeClient from "@/components/HomeClient"

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