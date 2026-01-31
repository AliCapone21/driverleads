// src/components/DashboardContent.tsx

"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/ThemeToggle"

/* --- Types --- */
interface DriverProfile {
  id: string
  user_id: string
  first_name: string
  status: "active" | "passive" | string
}

interface PrivateData {
  phone: string | null
  email: string | null
}

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

export default function DashboardContent() {
  const router = useRouter()
  const supabase = createClient()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [profile, setProfile] = useState<DriverProfile | null>(null)
  const [privateData, setPrivateData] = useState<PrivateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<"active" | "passive" | null>(null)

  const loadProfile = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const [publicRes, privateRes] = await Promise.all([
        supabase.from("drivers").select("id, user_id, first_name, status").eq("user_id", user.id).single(),
        // Prefer linking by driver_id, but keeping your email match for backwards-compat:
        supabase.from("driver_private").select("phone, email").eq("email", user.email).maybeSingle(),
      ])

      if (publicRes.error || !publicRes.data) {
        console.error("Profile not found:", publicRes.error)
        setLoading(false)
        return
      }

      setProfile(publicRes.data)
      setPrivateData(privateRes.data || null)
    } catch (err) {
      console.error("Unexpected dashboard error:", err)
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const updateStatus = async (newStatus: "active" | "passive") => {
    if (!profile) return
    if (profile.status === newStatus) return

    const previousStatus = profile.status
    setProfile({ ...profile, status: newStatus })
    setSaving(newStatus)

    const { error } = await supabase.from("drivers").update({ status: newStatus }).eq("id", profile.id)

    if (error) {
      setProfile({ ...profile, status: previousStatus })
      alert("Update failed. Please try again.")
    } else {
      router.refresh()
    }
    setSaving(null)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push("/")
  }

  const statusLabel =
    profile?.status === "active"
      ? "Ready to work now"
      : profile?.status === "passive"
        ? "Open to offers"
        : "Status not set"

  const statusHelp =
    profile?.status === "active"
      ? "Recruiters will see you as available right now."
      : profile?.status === "passive"
        ? "Recruiters can still find you, but you’re not in a hurry."
        : "Choose one option below."

  if (loading)
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-2 border-emerald-500/20" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400 animate-pulse text-center">
            Loading dashboard
            <br />
            <span className="text-zinc-500 dark:text-white/20">Secure link established</span>
          </p>
        </div>
      </div>
    )

  return (
    <main className="relative">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* light */}
        <div className="absolute top-[-25%] right-[-12%] w-[900px] h-[900px] bg-indigo-600/15 rounded-full blur-[140px] dark:hidden" />
        <div className="absolute bottom-[-25%] left-[-12%] w-[900px] h-[900px] bg-emerald-600/15 rounded-full blur-[140px] dark:hidden" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.08)_1px,transparent_1px)] [background-size:48px_48px] dark:hidden" />

        {/* dark */}
        <div className="absolute top-[-25%] right-[-12%] w-[900px] h-[900px] bg-indigo-600/10 rounded-full blur-[140px] hidden dark:block" />
        <div className="absolute bottom-[-25%] left-[-12%] w-[900px] h-[900px] bg-emerald-600/10 rounded-full blur-[140px] hidden dark:block" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:48px_48px] hidden dark:block" />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-3 min-w-0">
              <div className="relative h-15 w-30 scale-200">
                <Image src="/logo3.png" alt="Driver Leads" fill priority className="object-contain" />
              </div>
              <span className="sr-only">Driver Leads</span>
              <div className="hidden sm:block h-6 w-px bg-zinc-200 dark:bg-white/10" />
              <span className="hidden sm:block text-xs font-semibold text-zinc-500 dark:text-white/50 truncate">
                Driver Dashboard
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {mounted && <ThemeToggle />}

            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest
                         bg-red-500/10 text-red-700 border border-red-500/20
                         dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20
                         hover:bg-red-500 hover:text-white transition-all"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 pb-20">
        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px w-10 bg-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-700 dark:text-emerald-400">
              Verified
            </span>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-900 dark:text-white">
              {profile?.first_name || "Driver"}
              <span className="text-emerald-600 dark:text-emerald-400">.</span>
            </h1>

            <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:gap-3">
              <span className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold border
                               border-zinc-200/70 bg-white/70 text-zinc-800
                               dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {statusLabel}
              </span>
              <p className="mt-2 sm:mt-0 text-sm text-zinc-600 dark:text-white/55">{statusHelp}</p>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-8">
            {/* STATUS CARD */}
            <div className="rounded-[28px] bg-white/80 dark:bg-zinc-900/55 backdrop-blur-xl border border-zinc-200/70 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden">
              <div className="px-6 sm:px-8 py-6 border-b border-zinc-200/60 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.35)]" />
                  <h2 className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500 dark:text-white/45">
                    Your work status
                  </h2>
                </div>

                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-400 dark:text-white/35">
                  Tap to change
                </span>
              </div>

              <div className="p-6 sm:p-8">
                <div className="grid sm:grid-cols-2 gap-6">
                  <StatusCard
                    active={profile?.status === "active"}
                    accent="emerald"
                    title="Ready to work now"
                    desc="Choose this if you want calls and job offers right away."
                    loading={saving === "active"}
                    onClick={() => updateStatus("active")}
                  />

                  <StatusCard
                    active={profile?.status === "passive"}
                    accent="indigo"
                    title="Open to offers"
                    desc="Choose this if you’re not in a hurry, but still want offers."
                    loading={saving === "passive"}
                    onClick={() => updateStatus("passive")}
                  />
                </div>

                <div className="mt-6 rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-zinc-50/70 dark:bg-white/5 p-4">
                  <p className="text-xs text-zinc-600 dark:text-white/60 font-semibold leading-relaxed">
                    You can change this anytime. It helps recruiters understand if you’re available now or just browsing.
                  </p>
                </div>
              </div>
            </div>

            {/* VAULT */}
            <div className="grid sm:grid-cols-2 gap-6">
              <VaultTile
                label="Phone"
                value={privateData?.phone || "PENDING_UPLINK"}
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                }
              />
              <VaultTile
                label="Email"
                value={privateData?.email || "PENDING_UPLINK"}
                truncate
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4 space-y-6">
            {/* Metric card */}
            <div className="rounded-[28px] bg-emerald-500 text-black shadow-2xl shadow-emerald-500/10 overflow-hidden relative">
              <div className="absolute top-[-20%] right-[-20%] w-52 h-52 bg-white/20 rounded-full blur-3xl" />
              <div className="p-7 relative">
                <div className="flex items-center gap-2 mb-8">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <h4 className="font-black uppercase text-[10px] tracking-[0.22em]">Analytics</h4>
                </div>

                <div className="text-6xl font-black tracking-tighter tabular-nums">0</div>
                <div className="mt-2 text-[10px] font-black uppercase tracking-[0.22em]">Profile views</div>

                <div className="mt-8 text-[10px] font-black uppercase tracking-[0.18em] text-black/50">
                  Refresh: every 60 seconds
                </div>
              </div>
            </div>

            {/* Guidance card */}
            <div className="rounded-[28px] bg-white/80 dark:bg-zinc-900/55 backdrop-blur-xl border border-zinc-200/70 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/40 p-7">
              <div className="flex items-center gap-2 mb-5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                </svg>
                <h4 className="text-zinc-500 dark:text-white/45 font-black uppercase text-[10px] tracking-[0.22em]">
                  Helpful note
                </h4>
              </div>

              <p className="text-sm font-semibold text-zinc-700 dark:text-white/70 leading-relaxed">
                Recruiters can contact you only after they unlock your profile. Keep your phone and email correct.
              </p>

              <AnimatePresence>
                {!privateData?.email && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-[12px] font-semibold text-amber-800 dark:text-amber-200"
                  >
                    Your private details are not linked yet. If this persists, re-login or contact support.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

/* ---------- UI bits ---------- */

function StatusCard({
  active,
  accent,
  title,
  desc,
  loading,
  onClick,
}: {
  active: boolean
  accent: "emerald" | "indigo"
  title: string
  desc: string
  loading: boolean
  onClick: () => void
}) {
  const accentBg =
    accent === "emerald"
      ? "bg-emerald-500 text-black border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.18)]"
      : "bg-indigo-500 text-black border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.18)]"

  const inactive =
    "bg-zinc-50/70 dark:bg-white/[0.04] border-zinc-200/70 dark:border-white/10 text-zinc-900 dark:text-white hover:border-zinc-300 dark:hover:border-white/20"

  const titleColor = active ? "text-black" : "text-zinc-900 dark:text-white"
  const descColor = active ? "text-black/70" : "text-zinc-600 dark:text-white/55"

  return (
    <button onClick={onClick} className={`relative p-7 rounded-[24px] border-2 transition-all text-left ${active ? accentBg : inactive}`}>
      <div className="flex items-center justify-between gap-4">
        <h3 className={`text-base sm:text-lg font-black ${titleColor}`}>{title}</h3>
        {loading && (
          <span className="inline-block h-4 w-4 border-2 border-black/25 border-t-black rounded-full animate-spin" />
        )}
      </div>
      <p className={`mt-2 text-xs leading-relaxed font-semibold ${descColor}`}>{desc}</p>

      {/* subtle helper */}
      <p className={`mt-3 text-[11px] font-bold ${active ? "text-black/60" : "text-zinc-500 dark:text-white/45"}`}>
        {active ? "Selected" : "Tap to select"}
      </p>
    </button>
  )
}

function VaultTile({
  label,
  value,
  icon,
  truncate,
}: {
  label: string
  value: string
  icon: React.ReactNode
  truncate?: boolean
}) {
  return (
    <div className="rounded-[24px] bg-white/80 dark:bg-zinc-900/55 backdrop-blur-xl border border-zinc-200/70 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/40 p-6 flex items-center gap-5">
      <div className="h-12 w-12 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/70 dark:border-white/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-black text-zinc-500 dark:text-white/45 uppercase tracking-widest mb-1">{label}</div>
        <div className={`font-mono text-sm font-bold text-zinc-900 dark:text-white ${truncate ? "truncate" : ""}`}>{value}</div>
      </div>
    </div>
  )
}
