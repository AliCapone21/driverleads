// src/components/DashboardContent.tsx

"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/ThemeToggle"

/* --- Types --- */
interface DriverProfile {
  id: string
  user_id: string
  first_name: string
  status: "active" | "passive" | string
  driver_type: "company" | "owner_operator"
  expected_gross?: number | null
  expected_rpm?: number | null
  expected_cpm?: number | null
  expected_miles?: number | null
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
  const [saving, setSaving] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)

  const loadProfile = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      // 1) Load public driver profile by user_id
      const publicRes = await supabase.from("drivers").select("*").eq("user_id", user.id).single()

      if (publicRes.error || !publicRes.data) {
        console.error("Profile not found:", publicRes.error)
        setLoading(false)
        return
      }

      // 2) Load private data by driver_id (NOT by email)
      const privateRes = await supabase
        .from("driver_private")
        .select("phone, email")
        .eq("driver_id", publicRes.data.id)
        .maybeSingle()

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

  const updateProfile = async (updates: Partial<DriverProfile>) => {
    if (!profile) return
    setSaving("profile")

    const { error } = await supabase.from("drivers").update(updates).eq("id", profile.id)

    if (error) {
      alert("Update failed: " + error.message)
    } else {
      setProfile({ ...profile, ...updates })
      router.refresh()
    }
    setSaving(null)
  }

  const updatePrivateInfo = async () => {
    if (!profile || !privateData) return
    setSaving("private")

    const { error } = await supabase
      .from("driver_private")
      .update({
        phone: privateData.phone,
        email: privateData.email,
      })
      .eq("driver_id", profile.id)

    if (error) {
      alert("Update failed: " + error.message)
    } else {
      setEditMode(false)
      router.refresh()
    }
    setSaving(null)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push("/")
  }

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
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-25%] right-[-12%] w-[900px] h-[900px] bg-indigo-600/15 rounded-full blur-[140px] dark:hidden" />
        <div className="absolute bottom-[-25%] left-[-12%] w-[900px] h-[900px] bg-emerald-600/15 rounded-full blur-[140px] dark:hidden" />
        <div className="absolute top-[-25%] right-[-12%] w-[900px] h-[900px] bg-indigo-600/10 rounded-full blur-[140px] hidden dark:block" />
        <div className="absolute bottom-[-25%] left-[-12%] w-[900px] h-[900px] bg-emerald-600/10 rounded-full blur-[140px] hidden dark:block" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-15 w-30 scale-200">
              <Image src="/logo3.png" alt="Driver Leads" fill priority className="object-contain" />
            </div>
            <span className="sr-only">Driver Leads</span>
          </Link>
          <div className="flex items-center gap-3">
            {mounted && <ThemeToggle />}
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-red-500/10 text-red-700 border border-red-500/20 dark:text-red-300 hover:bg-red-500 hover:text-white transition-all"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 pb-20">
        {/* HERO SECTION */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px w-10 bg-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-700 dark:text-emerald-400">
                Verified Driver
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-900 dark:text-white">
              {profile?.first_name}
              <span className="text-emerald-600 dark:text-emerald-400">.</span>
            </h1>
          </motion.div>

          {/* DRIVER TYPE TOGGLE */}
          <div className="flex p-1 bg-zinc-100 dark:bg-white/5 rounded-2xl border border-zinc-200 dark:border-white/10">
            <button
              onClick={() => updateProfile({ driver_type: "company" })}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                profile?.driver_type === "company"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg"
                  : "text-zinc-500"
              }`}
            >
              Company Driver
            </button>
            <button
              onClick={() => updateProfile({ driver_type: "owner_operator" })}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                profile?.driver_type === "owner_operator"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg"
                  : "text-zinc-500"
              }`}
            >
              Owner Operator
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {/* WORK STATUS CARD */}
            <div className="rounded-[28px] bg-white/80 dark:bg-zinc-900/55 backdrop-blur-xl border border-zinc-200/70 dark:border-white/10 shadow-2xl overflow-hidden">
              <div className="px-8 py-6 border-b border-zinc-200/60 dark:border-white/10 flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500 dark:text-white/45">
                  Availability Status
                </h2>
              </div>
              <div className="p-8 grid sm:grid-cols-2 gap-6">
                <StatusCard
                  active={profile?.status === "active"}
                  accent="emerald"
                  title="Ready to work now"
                  desc="Recruiters will see you as available immediately."
                  loading={saving === "active"}
                  onClick={() => updateProfile({ status: "active" })}
                />
                <StatusCard
                  active={profile?.status === "passive"}
                  accent="indigo"
                  title="Open to offers"
                  desc="Available for the right opportunity, but not in a rush."
                  loading={saving === "passive"}
                  onClick={() => updateProfile({ status: "passive" })}
                />
              </div>
            </div>

            {/* FINANCIAL EXPECTATIONS CARD */}
            <div className="rounded-[28px] bg-white/80 dark:bg-zinc-900/55 backdrop-blur-xl border border-zinc-200/70 dark:border-white/10 shadow-2xl p-8">
              <h2 className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500 dark:text-white/45 mb-8">
                Financial Expectations
              </h2>
              <div className="grid sm:grid-cols-2 gap-8">
                {profile?.driver_type === "owner_operator" ? (
                  <>
                    <DashboardInput
                      label="Expected Gross / Week"
                      value={profile.expected_gross || ""}
                      onChange={(v: string) => profile && setProfile({ ...profile, expected_gross: Number(v) })}
                      placeholder="$7,000"
                      type="number"
                    />
                    <DashboardInput
                      label="Min Rate Per Mile (RPM)"
                      value={profile.expected_rpm || ""}
                      onChange={(v: string) => profile && setProfile({ ...profile, expected_rpm: Number(v) })}
                      placeholder="$2.50"
                      type="number"
                    />
                  </>
                ) : (
                  <>
                    <DashboardInput
                      label="Expected Cent Per Mile (CPM)"
                      value={profile?.expected_cpm || ""}
                      onChange={(v: string) => profile && setProfile({ ...profile, expected_cpm: Number(v) })}
                      placeholder="65¢"
                      type="number"
                    />
                    <DashboardInput
                      label="Desired Miles / Week"
                      value={profile?.expected_miles || ""}
                      onChange={(v: string) => profile && setProfile({ ...profile, expected_miles: Number(v) })}
                      placeholder="3,000"
                      type="number"
                    />
                  </>
                )}
              </div>
              <button
                onClick={() =>
                  updateProfile({
                    expected_gross: profile?.expected_gross,
                    expected_rpm: profile?.expected_rpm,
                    expected_cpm: profile?.expected_cpm,
                    expected_miles: profile?.expected_miles,
                  })
                }
                disabled={saving === "profile"}
                className="mt-8 w-full py-4 rounded-2xl bg-emerald-500 text-black font-black uppercase text-xs tracking-widest hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/10"
              >
                {saving === "profile" ? "Syncing Logic..." : "Update Expectations"}
              </button>
            </div>

            {/* PRIVATE DATA VAULT CARD */}
            <div className="rounded-[28px] bg-white/80 dark:bg-zinc-900/55 backdrop-blur-xl border border-zinc-200/70 dark:border-white/10 shadow-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500 dark:text-white/45">
                  Private Data Vault
                </h2>
                <button
                  onClick={() => (editMode ? updatePrivateInfo() : setEditMode(true))}
                  className="text-[10px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-500/20 px-4 py-1.5 rounded-xl hover:bg-emerald-500/10 transition-colors"
                >
                  {editMode ? saving === "private" ? "Updating..." : "Commit Changes" : "Edit Credentials"}
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                {editMode ? (
                  <>
                    <DashboardInput
                      label="Mobile Phone"
                      value={privateData?.phone || ""}
                      onChange={(v: string) =>
                        setPrivateData((p) => ({
                          ...(p ?? { phone: "", email: "" }),
                          phone: v,
                        }))
                      }
                      placeholder="+1..."
                    />
                    <DashboardInput
                      label="Email Address"
                      value={privateData?.email || ""}
                      onChange={(v: string) =>
                        setPrivateData((p) => ({
                          ...(p ?? { phone: "", email: "" }),
                          email: v,
                        }))
                      }
                      placeholder="driver@email.com"
                    />
                  </>
                ) : (
                  <>
                    <VaultTile label="Mobile Phone" value={privateData?.phone || "NOT_SET"} icon={<PhoneIcon />} />
                    <VaultTile
                      label="Email Address"
                      value={privateData?.email || "NOT_SET"}
                      icon={<EmailIcon />}
                      truncate
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* SIDEBAR ANALYTICS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-[28px] bg-emerald-500 text-black p-7 relative overflow-hidden shadow-2xl">
              <div className="absolute top-[-20%] right-[-20%] w-52 h-52 bg-white/20 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-8">
                  <AnalyticsIcon />
                  <h4 className="font-black uppercase text-[10px] tracking-[0.22em]">Market Insight</h4>
                </div>
                <div className="text-6xl font-black tracking-tighter tabular-nums">0</div>
                <div className="mt-2 text-[10px] font-black uppercase tracking-[0.22em]">Profile Unlocks</div>
              </div>
            </div>
            <div className="rounded-[28px] bg-white/80 dark:bg-zinc-900/55 backdrop-blur-xl border border-zinc-200/70 dark:border-white/10 p-7 shadow-2xl">
              <h4 className="text-zinc-500 dark:text-white/45 font-black uppercase text-[10px] tracking-[0.22em] mb-4">
                Pro Tip
              </h4>
              <p className="text-sm font-semibold text-zinc-700 dark:text-white/70 leading-relaxed">
                Carriers search specifically for RPM and CPM targets. Drivers who list clear financial expectations get 4x more
                interest.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

/* --- UI SUB-COMPONENTS --- */

function DashboardInput({ label, value, onChange, placeholder, type = "text" }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-white/40 ml-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder:text-zinc-300 dark:placeholder:text-white/10"
      />
    </div>
  )
}

function StatusCard({ active, accent, title, desc, loading, onClick }: any) {
  const accentBg =
    accent === "emerald"
      ? "bg-emerald-500 text-black border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.18)]"
      : "bg-indigo-500 text-black border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.18)]"
  const inactive =
    "bg-zinc-50/70 dark:bg-white/[0.04] border-zinc-200/70 dark:border-white/10 text-zinc-900 dark:text-white hover:border-zinc-300 dark:hover:border-white/20"

  return (
    <button onClick={onClick} className={`relative p-7 rounded-[24px] border-2 transition-all text-left ${active ? accentBg : inactive}`}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-black">{title}</h3>
        {loading && <span className="h-4 w-4 border-2 border-black/25 border-t-black rounded-full animate-spin" />}
      </div>
      <p className="mt-2 text-xs leading-relaxed font-semibold opacity-70">{desc}</p>
    </button>
  )
}

function VaultTile({ label, value, icon, truncate }: any) {
  return (
    <div className="rounded-[24px] bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-6 flex items-center gap-5">
      <div className="h-12 w-12 rounded-2xl bg-white dark:bg-white/5 border border-zinc-200/70 dark:border-white/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-black text-zinc-500 dark:text-white/45 uppercase tracking-widest mb-1">{label}</div>
        <div className={`font-mono text-sm font-bold ${truncate ? "truncate" : ""}`}>{value}</div>
      </div>
    </div>
  )
}

const PhoneIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const EmailIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const AnalyticsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)
