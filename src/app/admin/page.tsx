// src/app/admin/page.tsx

import { Suspense } from "react"
import AdminDashboard from "@/components/AdminDashboard"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Image from "next/image"
import { ThemeToggle } from "@/components/ThemeToggle" // ✅ add theme toggle in topbar

// Force dynamic server rendering to ensure auth is checked on every request
export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const supabase = await createClient()

  // 1. Get current session user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // 🔒 Security: Redirect if not logged in
  if (authError || !user) {
    redirect("/login")
  }

  // 2. Fetch User Profile to verify 'admin' role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single()

  // 🔒 Security: Check role OR fallback to your specific email
  const isAdminEmail = user.email === "alifarhodov21@gmail.com"
  const isAdminRole = profile?.role === "admin"

  if (!isAdminEmail && !isAdminRole) {
    console.warn(`Blocked unauthorized admin access attempt: ${user.email}`)
    redirect("/")
  }

  return (
    <main className="min-h-screen bg-[#070A12] text-zinc-100 relative font-sans selection:bg-emerald-500/30 selection:text-emerald-200 pb-20">
      {/* Dark Ambient Background Layers */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      {/* Admin Header - Dark Glass */}
      <header className="sticky top-0 z-40 bg-zinc-950/50 backdrop-blur-xl border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-3">
          {/* ✅ LEFT: Logo + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <a href="/admin" className="flex items-center gap-3 min-w-0">
              {/* Logo */}
              <div className="relative h-25 w-40 scale-150 transition-transform duration-300 group-hover:scale-[1.7]">
                <Image
                  src="/logo3.png"
                  alt="Driver Leads"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
              <span className="sr-only">Driver Leads</span>

              {/* Title */}
              <div className="min-w-0">
                <h1 className="font-bold text-base leading-none text-white tracking-tight truncate">
                  Admin Console
                </h1>
                <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase tracking-[0.15em] truncate">
                  Internal Management
                </p>
              </div>
            </a>
          </div>

          {/* ✅ RIGHT: user info + theme toggle + exit */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold text-zinc-200">
                {user.email?.split("@")[0]}
              </span>
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wider">
                Access Granted
              </span>
            </div>

            {/* Theme toggle */}
            <ThemeToggle />

            <a
              href="/drivers"
              className="text-[11px] sm:text-sm font-black text-zinc-300 hover:text-white transition-all flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10"
            >
              Exit to App <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </a>
          </div>
        </div>
      </header>

      {/* Dashboard Content with proper dark loading boundaries */}
      <div className="relative z-10">
        <Suspense fallback={<AdminLoadingState />}>
          <AdminDashboard />
        </Suspense>
      </div>
    </main>
  )
}

function AdminLoadingState() {
  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center gap-4 bg-[#070A12]">
      <div className="relative">
        <div className="h-10 w-10 border-2 border-white/5 rounded-full" />
        <div className="absolute inset-0 h-10 w-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-sm font-black text-white uppercase tracking-widest">
          Hydrating Dashboard
        </p>
        <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase tracking-tighter">
          Establishing Secure Connection...
        </p>
      </div>
    </div>
  )
}
