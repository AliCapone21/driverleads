"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/ThemeToggle"

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

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

export default function DriverProfileClient({ initialDriver, id }: { initialDriver: DriverRow; id: string }) {
  const supabase = createClient()

  const [driver] = useState<DriverRow>(initialDriver)
  const [priv, setPriv] = useState<DriverPrivateRow | null>(null)
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [unlocking, setUnlocking] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // prevent multiple intervals if component re-renders
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

      // poll after returning from Stripe (paid=1)
      if (new URLSearchParams(window.location.search).get("paid") === "1") {
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
    <>
      {/* ✅ IMPORTANT: page must not be hard-coded dark-only */}
      <div className="min-h-screen bg-white dark:bg-[#070A12] text-zinc-900 dark:text-slate-100">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-zinc-200/60 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-3">
            <Link href="/drivers" className="flex items-center gap-3 text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-white/70 dark:hover:text-white transition-colors group">
              <div className="p-1 rounded-md group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </div>
              Back to List
            </Link>

            <div className="flex items-center gap-3">
              {/* Logo (optional, matches your marketplace header) */}
              <Link href="/" className="hidden sm:flex items-center">
                <div className="relative h-20 w-40 scale-150 transition-transform duration-300 group-hover:scale-[1.7]">
                  <Image src="/logo3.png" alt="Driver Leads" fill priority className="object-contain" />
                </div>
                <span className="sr-only">Driver Leads</span>
              </Link>

              {/* Theme Toggle */}
              <ThemeToggle />

              <div className="text-xs font-semibold text-zinc-600 dark:text-white/70 bg-zinc-100/70 dark:bg-white/5 px-3 py-1.5 rounded-full border border-zinc-200/70 dark:border-white/10">
                {sessionEmail ? (
                  <span>{sessionEmail}</span>
                ) : (
                  <Link href="/login" className="underline hover:text-zinc-900 dark:hover:text-white">
                    Login to unlock
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-10">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center text-red-700 dark:text-red-200 mb-8"
              >
                <p className="font-semibold">Error</p>
                <p className="text-sm mt-1 opacity-80">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease }}
            className="grid lg:grid-cols-12 gap-8 items-start"
          >
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white/70 dark:bg-white/5 rounded-3xl p-8 border border-zinc-200/70 dark:border-white/10 shadow-sm shadow-black/5 dark:shadow-black/30 relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-gradient-to-br from-indigo-500/15 to-emerald-500/10 rounded-full blur-3xl opacity-70 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                    <div>
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 text-[10px] font-extrabold uppercase tracking-wide border border-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-300 animate-pulse" /> Verified
                        </div>

                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider border ${
                            driver.driver_type === "owner_operator"
                              ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-700 dark:text-indigo-200"
                              : "bg-zinc-100/80 border-zinc-200/70 text-zinc-600 dark:bg-white/5 dark:border-white/10 dark:text-white/70"
                          }`}
                        >
                          {typeLabel(driver.driver_type)}
                        </span>

                        {driver.status === "active" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500 text-black text-[10px] font-extrabold uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                            Ready to Hire
                          </span>
                        )}
                      </div>

                      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
                        {driver.first_name} {driver.last_initial}.
                      </h1>

                      <p className="text-sm text-zinc-500 dark:text-white/45 mt-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Original CDL Issue: {driver.city}, {driver.state}
                      </p>
                    </div>

                    <motion.div whileHover={{ scale: 1.05, rotate: 2 }} className="flex-shrink-0 cursor-default">
                      <div className="h-24 w-24 rounded-2xl bg-zinc-150/80 dark:bg-gradient-to-br dark:from-white/10 dark:via-black/60 dark:to-white/5 border border-zinc-200/70 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/50 flex items-center justify-center backdrop-blur-xl">
                        <svg className="w-10 h-10 text-emerald-700 dark:text-emerald-200" fill="currentColor" viewBox="0 0 24 24">
                          <path
                            fillRule="evenodd"
                            d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </motion.div>
                  </div>

                  <hr className="border-zinc-200/70 dark:border-white/10 mb-6" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatPill
                      title="Current Base"
                      value={`${driver.living_city ?? driver.city}, ${driver.living_state ?? driver.state}`}
                      icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      }
                    />
                    <StatPill
                      title="Experience"
                      value={`${driver.experience_years} Years`}
                      icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      }
                    />
                    <StatPill
                      title="Age"
                      value={calcAge(driver.dob) !== null ? `${calcAge(driver.dob)} Years` : "N/A"}
                      icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4.5 4.5 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/70 dark:bg-white/5 rounded-3xl p-8 border border-zinc-200/70 dark:border-white/10 shadow-sm shadow-black/5 dark:shadow-black/30 backdrop-blur-xl">
                <h3 className="text-sm font-extrabold text-zinc-500 dark:text-white/50 uppercase tracking-wider mb-4">
                  Endorsements & Certifications
                </h3>

                <div className="flex flex-wrap gap-2">
                  {(driver.endorsements ?? []).length > 0 ? (
                    driver.endorsements.map((e) => (
                      <span
                        key={e}
                        className="inline-flex items-center px-4 py-2 rounded-xl bg-zinc-100/80 dark:bg-white/5 border border-zinc-200/70 dark:border-white/10 text-sm font-semibold text-zinc-700 dark:text-white/80 transition-colors hover:bg-zinc-100 dark:hover:bg-white/10"
                      >
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
                  <motion.div
                    key="unlocked"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.6, ease }}
                    className="bg-white/70 dark:bg-white/5 rounded-3xl border border-emerald-500/25 shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden relative backdrop-blur-xl"
                  >
                    <div className="bg-emerald-500/10 p-6 border-b border-emerald-500/15 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-300 animate-pulse" />
                      <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-200 uppercase tracking-wide">
                        Contact Unlocked
                      </span>
                    </div>

                    <div className="p-6 space-y-6">
                      <div className="space-y-4">
                        <InfoRow label="Mobile Phone" value={priv?.phone} />
                        <InfoRow label="Email Address" value={priv?.email} breakAll />
                        <InfoRow label="CDL Number" value={priv?.cdl_number} />
                      </div>

                      <hr className="border-zinc-200/70 dark:border-white/10" />

                      <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={downloadCdl}
                        disabled={downloading}
                        className="w-full group relative flex items-center gap-4 p-4 rounded-xl border border-zinc-200/70 dark:border-white/10 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors text-left"
                      >
                        <div className="h-10 w-10 rounded-lg bg-white dark:bg-white/5 border border-zinc-200/70 dark:border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                          {downloading ? (
                            <div className="w-5 h-5 border-2 border-zinc-300 dark:border-white/20 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
                          ) : (
                            <svg className="w-5 h-5 text-rose-600 dark:text-rose-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-extrabold text-zinc-900 dark:text-white">{downloading ? "Preparing..." : "Download CDL"}</div>
                          <div className="text-xs text-zinc-500 dark:text-white/45">PDF Document • Verified</div>
                        </div>
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="locked"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.6, ease }}
                    className="rounded-3xl border border-zinc-200/70 dark:border-white/10 bg-white/80 dark:bg-black/50 shadow-2xl shadow-black/10 dark:shadow-black/60 overflow-hidden relative h-full flex flex-col backdrop-blur-xl"
                  >
                    <div className="absolute inset-0 opacity-10 dark:opacity-15 [background-image:radial-gradient(circle,rgba(0,0,0,0.22)_1px,transparent_1px)] dark:[background-image:radial-gradient(circle,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:24px_24px]" />

                    <div className="p-8 relative z-10 flex flex-col flex-1">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-white/10 border border-zinc-200/70 dark:border-white/10 flex items-center justify-center backdrop-blur-sm">
                          <svg className="w-6 h-6 text-zinc-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-extrabold text-xl uppercase tracking-tighter text-zinc-900 dark:text-white">Contact Vault</h3>
                          <p className="text-xs text-zinc-500 dark:text-white/45 font-bold uppercase">Purchase Profile Access</p>
                        </div>
                      </div>

                      <div className="space-y-6 flex-1 opacity-35 select-none pointer-events-none grayscale">
                        <div>
                          <div className="h-3 w-24 bg-zinc-200/70 dark:bg-white/10 rounded mb-2" />
                          <div className="h-10 w-full bg-zinc-200/70 dark:bg-white/10 rounded-lg blur-[2px] border border-zinc-200/70 dark:border-white/10" />
                        </div>
                        <div>
                          <div className="h-3 w-24 bg-zinc-200/70 dark:bg-white/10 rounded mb-2" />
                          <div className="h-10 w-full bg-zinc-200/70 dark:bg-white/10 rounded-lg blur-[2px] border border-zinc-200/70 dark:border-white/10" />
                        </div>
                      </div>

                      <div className="mt-8 space-y-4">
                        <motion.button
                          onClick={startCheckout}
                          disabled={unlocking}
                          whileHover={{ y: -2, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-4 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-black font-black text-lg hover:opacity-90 shadow-xl flex items-center justify-center gap-4 transition-all"
                        >
                          {unlocking ? (
                            <span className="inline-block h-5 w-5 border-2 border-white/30 dark:border-black/20 border-t-white dark:border-t-black rounded-full animate-spin" />
                          ) : (
                            <>
                              <span>Unlock Profile</span>

                              <div className="flex items-center gap-3">
                                <div className="relative flex items-center justify-center">
                                  <span className="text-xl font-bold text-white/60 dark:text-black/50 tracking-tighter tabular-nums">$50</span>
                                  <div className="absolute w-full h-[2px] bg-red-500 -rotate-12" />
                                </div>

                                <motion.div
                                  animate={{
                                    boxShadow: [
                                      "0 0 10px rgba(16,185,129,0.2)",
                                      "0 0 20px rgba(16,185,129,0.5)",
                                      "0 0 10px rgba(16,185,129,0.2)",
                                    ],
                                  }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                  className="bg-emerald-500 text-white text-xl py-2 px-3 rounded-lg font-mono font-black flex items-center gap-2 shadow-lg relative overflow-hidden"
                                >
                                  <span>$10</span>
                                  <motion.div
                                    animate={{ x: ["-100%", "200%"] }}
                                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3, ease: "linear" }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                                  />
                                </motion.div>
                              </div>
                            </>
                          )}
                        </motion.button>

                        <p className="text-center text-[10px] text-zinc-500 dark:text-white/30 font-bold uppercase tracking-widest italic">
                          80% Discount Applied • Secure Stripe Payment
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

function StatPill({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/70 dark:border-white/10 shadow-sm shadow-black/5 dark:shadow-black/30 transition-colors hover:bg-zinc-100 dark:hover:bg-white/[0.07]">
      <div className="h-10 w-10 rounded-xl bg-white dark:bg-white/5 border border-zinc-200/70 dark:border-white/10 flex items-center justify-center text-zinc-700 dark:text-white/70">
        {icon}
      </div>
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
