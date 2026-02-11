"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Mail, Phone, MapPin, ShieldCheck, Rocket, Zap, FileText, Lock } from "lucide-react"

/* --- Types --- */
type DriverRow = {
  id: string
  first_name: string
  last_initial: string
  city: string
  state: string
  living_city: string | null
  living_state: string | null
  dob: string | null
  driver_type: "company" | "owner_operator"
  experience_years: number
  endorsements: string[]
  status: string | null
  expected_gross: number | null
  expected_rpm: number | null
  expected_cpm: number | null
  expected_miles: number | null
}

type DriverPrivateRow = {
  driver_id: string
  phone: string | null
  email: string | null
  cdl_number: string | null
}

/* --- Helpers --- */
function calcAge(dob: string | null) {
  if (!dob) return null
  const birth = new Date(dob)
  if (Number.isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function typeLabel(t: "company" | "owner_operator") {
  return t === "owner_operator" ? "Owner Operator" : "Company Driver"
}

function hasNum(v: number | null | undefined): v is number {
  return v !== null && v !== undefined && Number.isFinite(v)
}

function formatInt(n: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n)
}
function formatMoneyInt(n: number) {
  return `$${formatInt(n)}`
}
function formatRate(n: number) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

export default function DriverProfileClient({ initialDriver, id }: { initialDriver: DriverRow; id: string }) {
  const supabase = createClient()

  const [driver] = useState<DriverRow>(initialDriver)
  const [priv, setPriv] = useState<DriverPrivateRow | null>(null)
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [unlocking, setUnlocking] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pollRef = useRef<number | null>(null)

  const fetchPrivate = useCallback(async () => {
    const { data } = await supabase
      .from("driver_private")
      .select("driver_id, phone, email, cdl_number")
      .eq("driver_id", id)
      .maybeSingle()

    if (data) setPriv(data)
  }, [id, supabase])

  useEffect(() => {
    let mounted = true

    async function load() {
      const { data } = await supabase.auth.getSession()
      if (mounted) setSessionEmail(data.session?.user.email ?? null)

      await fetchPrivate()

      // Dodo Payments success check (status=success)
      if (new URLSearchParams(window.location.search).get("status") === "success") {
        if (pollRef.current) window.clearInterval(pollRef.current)

        pollRef.current = window.setInterval(async () => {
          const { data: check } = await supabase
            .from("driver_private")
            .select("driver_id")
            .eq("driver_id", id)
            .maybeSingle()

          if (check) {
            await fetchPrivate()
            if (pollRef.current) window.clearInterval(pollRef.current)
            pollRef.current = null
          }
        }, 2000)
      }
    }

    load()

    return () => {
      mounted = false
      if (pollRef.current) window.clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [id, supabase, fetchPrivate])

  const unlocked = !!priv

  async function startCheckout() {
    if (unlocking) return
    setError(null)
    setUnlocking(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? "Checkout failed")
      window.location.href = json.url
    } catch (err: any) {
      setError(err.message)
      setUnlocking(false)
    }
  }

  async function downloadCdl() {
    if (downloading) return
    setError(null)
    setDownloading(true)
    try {
      const res = await fetch("/api/cdl-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? "Download failed")
      window.open(json.url, "_blank")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#070A12] text-zinc-900 dark:text-slate-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/60 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-3">
          <Link
            href="/drivers"
            className="flex items-center gap-3 text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-white/70 dark:hover:text-white transition-colors group"
          >
            <div className="p-1 rounded-md group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </div>
            Back to List
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/" className="hidden sm:flex items-center group">
              <div className="relative h-20 w-40 scale-150 transition-transform duration-300 group-hover:scale-[1.7]">
                <Image src="/logo3.png" alt="Driver Leads" fill priority className="object-contain" />
              </div>
            </Link>
            <ThemeToggle />
            <div className="text-xs font-semibold text-zinc-600 dark:text-white/70 bg-zinc-100/70 dark:bg-white/5 px-3 py-1.5 rounded-full border border-zinc-200/70 dark:border-white/10">
              {sessionEmail ? <span>{sessionEmail}</span> : <Link href="/login" className="underline">Login to unlock</Link>}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center text-red-700 dark:text-red-200 mb-8">
              <p className="font-semibold text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease }} className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT CONTENT */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Main Header Card */}
            <div className="bg-white/70 dark:bg-white/5 rounded-3xl p-8 border border-zinc-200/70 dark:border-white/10 shadow-sm shadow-black/5 dark:shadow-black/30 relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-gradient-to-br from-indigo-500/15 to-emerald-500/10 rounded-full blur-3xl opacity-70 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                  <div>
                    <div className="flex items-center flex-wrap gap-2 mb-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 text-[10px] font-extrabold uppercase tracking-wide border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Verified
                      </div>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider border ${driver.driver_type === "owner_operator" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-700 dark:text-indigo-200" : "bg-zinc-100 text-zinc-600 dark:bg-white/5 dark:text-white/70"}`}>
                        {typeLabel(driver.driver_type)}
                      </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
                      {driver.first_name} {driver.last_initial}.
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-white/45 mt-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Original CDL: {driver.city}, {driver.state}
                    </p>
                  </div>
                  <motion.div whileHover={{ scale: 1.05, rotate: 2 }} className="h-24 w-24 rounded-2xl bg-zinc-150/80 dark:bg-gradient-to-br dark:from-white/10 dark:via-black/60 dark:to-white/5 border border-zinc-200/70 dark:border-white/10 shadow-2xl flex items-center justify-center">
                    <Lock className="w-10 h-10 text-emerald-700 dark:text-emerald-200" />
                  </motion.div>
                </div>
                <hr className="border-zinc-200/70 dark:border-white/10 mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatPill title="Current Base" value={`${driver.living_city ?? driver.city}, ${driver.living_state ?? driver.state}`} icon={<MapPin className="h-4 w-4" />} />
                  <StatPill title="Experience" value={`${driver.experience_years} Years`} icon={<ShieldCheck className="h-4 w-4" />} />
                  <StatPill title="Age" value={calcAge(driver.dob) !== null ? `${calcAge(driver.dob)} Years` : "N/A"} icon={<Rocket className="h-4 w-4" />} />
                </div>
              </div>
            </div>

            {/* 2. Financial Expectations */}
            <div className="bg-white/70 dark:bg-white/5 rounded-3xl p-8 border border-zinc-200/70 dark:border-white/10 shadow-sm backdrop-blur-xl">
              <h3 className="text-sm font-extrabold text-zinc-500 dark:text-white/50 uppercase tracking-wider mb-6">Financial Expectations</h3>
              <div className="grid grid-cols-2 gap-6">
                {driver.driver_type === "owner_operator" ? (
                  <>
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                      <div className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest mb-1">Expected Gross</div>
                      <div className="text-xl font-bold">{hasNum(driver.expected_gross) ? `${formatMoneyInt(driver.expected_gross)}/wk` : "Flexible"}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                      <div className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest mb-1">Min RPM</div>
                      <div className="text-xl font-bold">{hasNum(driver.expected_rpm) ? `$${formatRate(driver.expected_rpm)}/mi` : "Flexible"}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                      <div className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest mb-1">Expected CPM</div>
                      <div className="text-xl font-bold">{hasNum(driver.expected_cpm) ? `${formatInt(driver.expected_cpm)}¢/mi` : "Flexible"}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                      <div className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest mb-1">Desired Miles</div>
                      <div className="text-xl font-bold">{hasNum(driver.expected_miles) ? `${formatInt(driver.expected_miles)}/wk` : "Flexible"}</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 3. Endorsements bo'limi (Qaytarildi!) */}
            <div className="bg-white/70 dark:bg-white/5 rounded-3xl p-8 border border-zinc-200/70 dark:border-white/10 shadow-sm backdrop-blur-xl">
              <h3 className="text-sm font-extrabold text-zinc-500 dark:text-white/50 uppercase tracking-wider mb-4">
                Endorsements & Certifications
              </h3>
              <div className="flex flex-wrap gap-2">
                {(driver.endorsements ?? []).length > 0 ? (
                  driver.endorsements.map((e) => (
                    <span key={e} className="inline-flex items-center px-4 py-2 rounded-xl bg-zinc-100/80 dark:bg-white/5 border border-zinc-200/70 dark:border-white/10 text-sm font-semibold text-zinc-700 dark:text-white/80 transition-colors hover:bg-zinc-100 dark:hover:bg-white/10">
                      {e}
                    </span>
                  ))
                ) : (
                  <span className="text-zinc-500 dark:text-white/45 italic text-sm">No specific endorsements listed.</span>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT ACTION COLUMN */}
          <div className="lg:col-span-4">
            <AnimatePresence mode="wait">
              {unlocked ? (
                <motion.div key="unlocked" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 dark:bg-white/5 rounded-3xl border border-emerald-500/25 p-6 shadow-2xl backdrop-blur-xl space-y-6">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-200">
                    <Zap size={18} className="animate-pulse" />
                    <span className="text-sm font-extrabold uppercase tracking-wide">Contact Unlocked</span>
                  </div>
                  <div className="space-y-4">
                    <InfoRow label="Mobile Phone" value={priv?.phone} />
                    <InfoRow label="Email Address" value={priv?.email} breakAll />
                    <InfoRow label="CDL Number" value={priv?.cdl_number} />
                  </div>
                  <hr className="border-zinc-200 dark:border-white/10" />
                  <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={downloadCdl} disabled={downloading} className="w-full flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 transition-all">
                    <div className="h-10 w-10 rounded-lg bg-white dark:bg-white/5 flex items-center justify-center">
                      {downloading ? <div className="h-5 w-5 border-2 border-t-emerald-500 rounded-full animate-spin" /> : <FileText size={20} className="text-rose-600" />}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-extrabold text-zinc-900 dark:text-white">Download CDL</div>
                      <div className="text-xs text-zinc-500">PDF • Verified</div>
                    </div>
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div key="locked" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-zinc-200/70 dark:border-white/10 bg-white/80 dark:bg-black/50 p-8 shadow-2xl backdrop-blur-xl relative">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xl uppercase tracking-tighter">Contact Vault</h3>
                      <p className="text-xs text-zinc-500 font-bold uppercase">Unlock Access</p>
                    </div>
                  </div>
                  <div className="space-y-4 opacity-20 select-none grayscale mb-8">
                    <div className="h-10 w-full bg-zinc-200 dark:bg-white/10 rounded-lg blur-[2px]" />
                    <div className="h-10 w-full bg-zinc-200 dark:bg-white/10 rounded-lg blur-[2px]" />
                  </div>
                  <motion.button onClick={startCheckout} disabled={unlocking} whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-4 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-black font-black text-lg shadow-xl flex items-center justify-center gap-4">
                    {unlocking ? <span className="h-5 w-5 border-2 border-t-emerald-500 rounded-full animate-spin" /> : <span>Unlock Profile</span>}
                    <div className="flex items-center gap-2">
                      <span className="text-sm line-through opacity-40">$50</span>
                      <span className="bg-emerald-500 text-white px-2 py-1 rounded text-sm">$10</span>
                    </div>
                  </motion.button>
                  <p className="text-center text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-4 italic">
                    Verified by Dodo Payments • Secure
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function StatPill({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 shadow-sm transition-colors hover:bg-zinc-100 dark:hover:bg-white/[0.07]">
      <div className="h-10 w-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-zinc-700 dark:text-white/70">{icon}</div>
      <div>
        <div className="text-[10px] uppercase font-extrabold text-zinc-500 dark:text-white/45 tracking-widest">{title}</div>
        <div className="font-extrabold text-zinc-900 dark:text-white leading-tight uppercase text-xs">{value}</div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, breakAll }: { label: string; value: string | null | undefined; breakAll?: boolean }) {
  return (
    <div>
      <label className="block text-[10px] font-extrabold text-zinc-500 dark:text-white/45 uppercase tracking-wider mb-1">{label}</label>
      <div className={`text-base font-semibold text-zinc-900 dark:text-white select-all ${breakAll ? "break-all" : ""}`}>
        {value || <span className="text-zinc-500 dark:text-white/35 italic">Not provided</span>}
      </div>
    </div>
  )
}