"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { AnimatePresence, motion } from "framer-motion"

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
  status: string | null // <--- NEW FIELD
}

type DriverPrivateRow = {
  driver_id: string
  phone: string | null
  email: string | null
  cdl_number: string | null
}

/* --- Helper Functions --- */
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

/** ✅ TS-friendly cubic-bezier tuple */
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

export default function DriverProfilePage() {
  const params = useParams<{ id: string }>()
  const id = Array.isArray(params.id) ? params.id[0] : params.id

  const [driver, setDriver] = useState<DriverRow | null>(null)
  const [priv, setPriv] = useState<DriverPrivateRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [unlocking, setUnlocking] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!id) return

    async function load() {
      setLoading(true)
      setError(null)

      const { data: sessionData } = await supabase.auth.getSession()
      setSessionEmail(sessionData.session?.user.email ?? null)

      const { data: driverData, error: driverErr } = await supabase
        .from("drivers")
        .select("id, first_name, last_initial, city, state, living_city, living_state, dob, driver_type, experience_years, endorsements, status")
        .eq("id", id)
        .single()

      if (driverErr) {
        setError(driverErr.message)
        setLoading(false)
        return
      }

      setDriver(driverData as any)

      const { data: privateData } = await supabase
        .from("driver_private")
        .select("driver_id, phone, email, cdl_number")
        .eq("driver_id", id)
        .maybeSingle()

      setPriv(privateData ?? null)

      if (new URLSearchParams(window.location.search).get("paid") === "1") {
        setTimeout(async () => {
          const { data: privateAgain } = await supabase
            .from("driver_private")
            .select("driver_id, phone, email, cdl_number")
            .eq("driver_id", id)
            .maybeSingle()
          setPriv(privateAgain ?? null)
        }, 1500)
      }

      setLoading(false)
    }

    load()
  }, [id])

  const unlocked = !!priv

  async function startCheckout() {
    if (unlocking) return
    setError(null)
    setUnlocking(true)

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token

    if (!token) {
      setUnlocking(false)
      window.location.href = "/login"
      return
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: id, accessToken: token }),
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
    setError(null)
    setDownloading(true)

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token

    if (!token) {
      setDownloading(false)
      window.location.href = "/login"
      return
    }

    try {
      const res = await fetch("/api/cdl-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: id, accessToken: token }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json?.error ?? "Download failed")
        setDownloading(false)
        return
      }
      window.open(json.url, "_blank")
    } catch {
      setError("Network error while downloading.")
    } finally {
      setDownloading(false)
    }
  }

  if (!id) return null

  return (
    <main className="min-h-screen bg-[#070A12] text-slate-100 relative font-sans selection:bg-white selection:text-black">
      {/* Cinematic Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[820px] h-[820px] rounded-full blur-[140px] opacity-40 bg-indigo-500/20" />
        <div className="absolute -bottom-44 -left-44 w-[720px] h-[720px] rounded-full blur-[140px] opacity-40 bg-cyan-500/15" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_45%),radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.04),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:42px_42px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <a href="/drivers" className="flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white transition-colors group">
            <div className="p-1 rounded-md group-hover:bg-white/5 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </div>
            Back to List
          </a>

          <div className="text-xs font-semibold text-white/70 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            {sessionEmail ? <span>{sessionEmail}</span> : <a href="/login" className="underline hover:text-white">Login to unlock</a>}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease }}>
              <SkeletonProfile />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5, ease }}
              className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center text-red-200 mb-8"
            >
              <p className="font-semibold">Error loading profile</p>
              <p className="text-sm mt-1 text-red-200/80">{error}</p>
            </motion.div>
          ) : !driver ? (
            <motion.div
              key="notfound"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5, ease }}
              className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center text-white/70 shadow-sm"
            >
              Driver not found.
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.65, ease }}
              className="grid lg:grid-cols-12 gap-8 items-start"
            >
              {/* LEFT COLUMN */}
              <div className="lg:col-span-8 space-y-6">
                {/* Main Profile Header */}
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.7, ease }}
                  className="bg-white/5 rounded-3xl p-8 border border-white/10 shadow-sm shadow-black/30 relative overflow-hidden backdrop-blur-xl"
                >
                  {/* Decorative blur */}
                  <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-gradient-to-br from-indigo-500/15 to-cyan-500/10 rounded-full blur-3xl opacity-70 pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                      {/* Left Side */}
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-200 text-[10px] font-extrabold uppercase tracking-wide border border-emerald-400/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" /> Verified
                          </div>

                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider border ${
                              driver.driver_type === "owner_operator"
                                ? "bg-indigo-400/10 border-indigo-400/20 text-indigo-200"
                                : "bg-white/5 border-white/10 text-white/70"
                            }`}
                          >
                            {typeLabel(driver.driver_type)}
                          </span>

                          {/* STATUS BADGES */}
                          {driver.status === 'active' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500 text-black text-[10px] font-extrabold uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                              Ready to Hire
                            </span>
                          )}
                          {driver.status === 'passive' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider border border-indigo-500/30">
                              Open to Offers
                            </span>
                          )}
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                          {driver.first_name} {driver.last_initial}.
                        </h1>

                        <p className="text-sm text-white/45 mt-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Original CDL Issue: {driver.city}, {driver.state}
                        </p>
                      </div>

                      {/* Right Side: Icon */}
                      <motion.div
                        whileHover={{ rotateY: 18, rotateX: -6, y: -2 }}
                        transition={{ duration: 0.8, ease }}
                        style={{ transformStyle: "preserve-3d" }}
                        className="flex-shrink-0"
                      >
                        <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-white/10 via-black/60 to-white/5 border border-white/10 shadow-2xl shadow-black/50 flex items-center justify-center backdrop-blur-xl">
                          <svg className="w-10 h-10 text-emerald-200" fill="currentColor" viewBox="0 0 24 24">
                            <path
                              fillRule="evenodd"
                              d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </motion.div>
                    </div>

                    <hr className="border-white/10 mb-6" />

                    {/* Stats Grid */}
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        }
                      />
                    </div>
                  </div>
                </motion.div>
                {/* Endorsements */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, ease, delay: 0.05 }}
                  className="bg-white/5 rounded-3xl p-8 border border-white/10 shadow-sm shadow-black/30 backdrop-blur-xl"
                >
                  <h3 className="text-sm font-extrabold text-white/50 uppercase tracking-wider mb-4">Endorsements & Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {(driver.endorsements ?? []).length > 0 ? (
                      driver.endorsements.map((e) => (
                        <motion.span
                          key={e}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.45, ease }}
                          className="inline-flex items-center px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white/80"
                        >
                          {e}
                        </motion.span>
                      ))
                    ) : (
                      <span className="text-white/45 italic text-sm">No specific endorsements listed.</span>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="lg:col-span-4">
                <AnimatePresence mode="wait">
                  {unlocked ? (
                    <motion.div
                      key="unlocked"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      transition={{ duration: 0.6, ease }}
                      className="bg-white/5 rounded-3xl border border-emerald-400/20 shadow-2xl shadow-black/40 overflow-hidden relative backdrop-blur-xl"
                    >
                      <div className="bg-emerald-400/10 p-6 border-b border-emerald-400/15 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                        <span className="text-sm font-extrabold text-emerald-200 uppercase tracking-wide">Contact Unlocked</span>
                      </div>

                      <div className="p-6 space-y-6">
                        <div className="space-y-4">
                          <InfoRowDark label="Mobile Phone" value={priv?.phone} />
                          <InfoRowDark label="Email Address" value={priv?.email} breakAll />
                          <InfoRowDark label="CDL Number" value={priv?.cdl_number} />
                        </div>

                        <hr className="border-white/10" />

                        <motion.button
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.6, ease }}
                          onClick={downloadCdl}
                          disabled={downloading}
                          className="w-full group relative flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-black/40 transition-colors text-left"
                        >
                          <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                            {downloading ? (
                              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                              <svg className="w-5 h-5 text-rose-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-extrabold text-white">
                              {downloading ? "Preparing File..." : "Download CDL"}
                            </div>
                            <div className="text-xs text-white/45">PDF Document • Verified</div>
                          </div>
                          <div className="text-white/35 group-hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </div>
                        </motion.button>

                        <div className="text-center">
                          <p className="text-[10px] text-white/40">
                            Unlocked on {new Date().toLocaleDateString()} by {sessionEmail}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="locked"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      transition={{ duration: 0.6, ease }}
                      className="rounded-3xl border border-white/10 bg-black/50 shadow-2xl shadow-black/60 overflow-hidden relative text-white h-full flex flex-col backdrop-blur-xl"
                    >
                      <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(circle,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:24px_24px]" />

                      <div className="p-8 relative z-10 flex flex-col flex-1">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="h-12 w-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-extrabold text-xl">Contact Vault</h3>
                            <p className="text-xs text-white/45">Secure RLS Access</p>
                          </div>
                        </div>

                        <div className="space-y-6 flex-1 opacity-35 select-none pointer-events-none grayscale">
                          <div>
                            <div className="h-3 w-24 bg-white/10 rounded mb-2" />
                            <div className="h-10 w-full bg-white/10 rounded-lg blur-[2px] border border-white/10" />
                          </div>
                          <div>
                            <div className="h-3 w-24 bg-white/10 rounded mb-2" />
                            <div className="h-10 w-full bg-white/10 rounded-lg blur-[2px] border border-white/10" />
                          </div>
                          <div>
                            <div className="h-3 w-16 bg-white/10 rounded mb-2" />
                            <div className="h-20 w-3/4 bg-white/10 rounded-lg blur-[2px] border border-white/10" />
                          </div>
                        </div>

                        <div className="mt-8 space-y-4">
                          <motion.button
                            onClick={startCheckout}
                            disabled={unlocking}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.6, ease }}
                            className="w-full py-4 rounded-xl bg-white text-black font-extrabold text-lg hover:bg-white/90 shadow-lg shadow-black/40 flex items-center justify-center gap-3"
                          >
                            {unlocking ? (
                              <span className="inline-block h-5 w-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            ) : (
                              <>
                                <span>Unlock Profile</span>
                                <span className="bg-black text-white text-xs py-1 px-2 rounded-lg font-mono">$10</span>
                              </>
                            )}
                          </motion.button>
                          <p className="text-center text-xs text-white/45">Instant access via Stripe • Secure</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}

/* --- Sub Components --- */

function StatPill({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.6, ease }}
      className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 shadow-sm shadow-black/30"
    >
      <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
        {icon}
      </div>
      <div>
        <div className="text-[10px] uppercase font-extrabold text-white/45">{title}</div>
        <div className="font-extrabold text-white leading-tight">{value}</div>
      </div>
    </motion.div>
  )
}

function InfoRowDark({ label, value, breakAll }: { label: string; value: string | null | undefined; breakAll?: boolean }) {
  return (
    <div>
      <label className="block text-[10px] font-extrabold text-white/45 uppercase tracking-wider mb-1">{label}</label>
      <div className={`text-base font-semibold text-white select-all ${breakAll ? "break-all" : ""}`}>
        {value || <span className="text-white/35 italic">Not provided</span>}
      </div>
    </div>
  )
}

function SkeletonProfile() {
  return (
    <div className="grid md:grid-cols-3 gap-8 animate-pulse">
      <div className="md:col-span-2 space-y-6">
        <div className="h-64 bg-white/5 rounded-3xl border border-white/10" />
        <div className="h-32 bg-white/5 rounded-3xl border border-white/10" />
      </div>
      <div className="md:col-span-1">
        <div className="h-96 bg-white/5 rounded-3xl border border-white/10" />
      </div>
    </div>
  )
}