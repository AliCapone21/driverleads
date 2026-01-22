import { Suspense } from "react"
import LoginClient from "../../components/LoginClient"

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="h-10 w-10 rounded-full border-2 border-[var(--foreground)] border-t-transparent animate-spin" />
      </div>
    }>
      <LoginClient />
    </Suspense>
  )
}