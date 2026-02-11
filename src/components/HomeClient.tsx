"use client"

import React, { useEffect, useMemo, useState } from "react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { AnimatePresence, motion } from "framer-motion"
import { createClient } from "@/utils/supabase/client"
import { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import Image from "next/image"
import {
  CheckCircle2,
  Gauge,
  Lock,
  ShieldCheck,
  Mail,
  Phone,
  Award,
  Clock3,
  Coins,
  Target,
  Route,
  Briefcase,
  Menu,
  X,
} from "lucide-react"

/* --- High Performance Motion (Optimized for Speed) --- */
const fastEase: [number, number, number, number] = [0.23, 1, 0.32, 1]

const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: fastEase } },
}

const rise = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: fastEase } },
}

const flow = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
}

const slowPanel = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: fastEase } },
}

export default function HomeClient() {
  const supabase = createClient()
  const router = useRouter()

  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isDriver, setIsDriver] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false) // account dropdown (desktop)
  const [mobileNavOpen, setMobileNavOpen] = useState(false) // ✅ burger menu (mobile)
  const [navigating, setNavigating] = useState(false)
  const [authReady, setAuthReady] = useState(false)

  // ✅ active nav highlight
  const [activeSection, setActiveSection] = useState<string>("benefits")

  useEffect(() => {
    let mounted = true

    const checkUser = async () => {
      try {
        const { data } = (await Promise.race([
          supabase.auth.getUser(),
          new Promise((_, reject) => setTimeout(() => reject("Timeout"), 3000)),
        ])) as any

        if (!mounted) return

        if (data?.user) {
          setUser(data.user)
          const { data: driver } = await supabase
            .from("drivers")
            .select("id")
            .eq("user_id", data.user.id)
            .maybeSingle()
          setIsDriver(!!driver)
        } else {
          setUser(null)
          setIsDriver(false)
        }
      } catch (error) {
        console.warn("Auth check failed", error)
      } finally {
        if (mounted) setAuthReady(true)
      }
    }

    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return

      setUser(session?.user ?? null)

      if (session?.user) {
        const { data: driver } = await supabase
          .from("drivers")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle()
        setIsDriver(!!driver)
      } else {
        setIsDriver(false)
      }

      setAuthReady(true)
    })

    const handleWindowScroll = () => setIsScrolled(window.scrollY > 14)
    window.addEventListener("scroll", handleWindowScroll)

    return () => {
      mounted = false
      window.removeEventListener("scroll", handleWindowScroll)
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  // ✅ lock body scroll when mobile menu open
  useEffect(() => {
    if (!mobileNavOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileNavOpen])

  const handleSignOut = async () => {
    if (navigating) return
    setNavigating(true)
    await supabase.auth.signOut()
    // Instant refresh to clear session properly
    window.location.href = "/"
  }

  const getHeaderOffset = () => {
    const header = document.querySelector("header") as HTMLElement | null
    const h = header?.getBoundingClientRect().height ?? 0
    return Math.round(h + 16)
  }

  const smoothScrollToId = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const offset = getHeaderOffset()
    const y = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top: y, behavior: "smooth" })
  }

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    setMenuOpen(false)
    setMobileNavOpen(false) // ✅ close burger menu
    setActiveSection(id)
    requestAnimationFrame(() => smoothScrollToId(id))
  }

  const navItems = useMemo(
    () => [
      { label: "Benefits", id: "benefits" },
      { label: "How it works", id: "how-it-works" },
      { label: "Recruiters", id: "recruiters" },
    ],
    []
  )

  const navClass = (id: string) => {
    const base =
      "text-[9px] lg:text-[11px] font-bold tracking-[0.14em] uppercase transition-colors relative px-0.5 lg:px-1 py-2 select-none"
    const active = "text-zinc-950 dark:text-zinc-50"
    const inactive = "text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50"
    return `${base} ${activeSection === id ? active : inactive}`
  }

  return (
    <main className="min-h-screen relative bg-white text-zinc-950 dark:bg-[#060607] dark:text-zinc-50 transition-colors duration-500 selection:bg-emerald-500/25 antialiased">
      {/* Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-white dark:bg-[#060607]" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[560px] w-[1100px] rounded-full bg-gradient-to-b from-emerald-100/70 via-white/30 to-transparent blur-[70px] dark:from-emerald-950/35 dark:via-black/0 dark:to-transparent opacity-70" />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 h-[520px] w-[980px] rounded-full bg-gradient-to-t from-zinc-200/50 via-white/10 to-transparent blur-[70px] dark:from-zinc-900/50 dark:via-black/0 dark:to-transparent opacity-70" />
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(16,185,129,0.10)_1px,transparent_0)] [background-size:28px_28px] opacity-[0.22] dark:opacity-[0.12]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/40 dark:to-black/30" />
      </div>

      {/* Header */}
      <header
        className={[
          "fixed top-0 w-full z-50 transition-all duration-500",
          isScrolled
            ? "bg-white/70 dark:bg-black/45 backdrop-blur-xl border-b border-zinc-200/60 dark:border-zinc-800/60 shadow-sm"
            : "bg-transparent",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          <div className="h-[84px] flex items-center justify-between">
            <div className="flex items-center gap-5">
              <a href="/" className="flex items-center gap-4 group">
               <div className="relative h-30 w-44 scale-110 sm:scale-125 lg:scale-180 transition-transform">

                  <Image
                    src="/logo3.png"
                    alt="Driver Leads"
                    fill
                    priority
                    className="object-contain opacity-95 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <span className="sr-only">Driver Leads</span>
              </a>

              {/* Desktop nav */}
              <div className="hidden lg:flex items-center gap-7 pl-60">
                {navItems.map(({ label, id }) => (
                  <a key={id} href={`#${id}`} onClick={(e) => handleScroll(e, id)} className={navClass(id)}>
                    <span className="relative">
                      {label}
                      {activeSection === id && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute left-0 -bottom-1.5 h-[1.5px] w-full bg-emerald-500 rounded-full"
                          transition={{ type: "spring", stiffness: 520, damping: 44, mass: 0.6 }}
                        />
                      )}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />

              {/* ✅ Mobile burger (shows on <lg) */}
              <button
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden h-10 w-10 rounded-full border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-white/[0.04] backdrop-blur-md flex items-center justify-center shadow-sm"
                aria-label="Open menu"
              >
                <Menu className="h-4.5 w-4.5 text-zinc-900 dark:text-zinc-100" />
              </button>

              {/* Desktop account dropdown */}
              {authReady && user && (
                <div className="relative hidden lg:block">
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="h-10 w-10 rounded-full border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-white/[0.04] backdrop-blur-md flex items-center justify-center shadow-sm"
                  >
                    <span className="text-xs font-bold text-zinc-950 dark:text-zinc-50">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </button>

                  <AnimatePresence>
                    {menuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.3, ease: fastEase }}
                          className="absolute right-0 mt-4 w-[290px] z-50"
                        >
                          <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/75 dark:bg-black/55 backdrop-blur-xl shadow-2xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
                              <p className="text-[10px] tracking-[0.22em] uppercase font-black text-zinc-500 dark:text-zinc-400 mb-1">
                                Account
                              </p>
                              <p className="text-sm font-bold truncate text-zinc-950 dark:text-zinc-50">
                                {user.email}
                              </p>
                            </div>

                            <div className="p-2">
                              <a href={isDriver ? "/drivers/dashboard" : "/recruiter/settings"} className="block">
                                <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black px-4 py-3 text-center text-[11px] font-black tracking-[0.18em] uppercase hover:opacity-95 transition-opacity">
                                  Account Settings
                                </div>
                              </a>

                              <button
                                onClick={handleSignOut}
                                disabled={navigating}
                                className="mt-2 w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-950/25 transition-colors"
                              >
                                Sign Out
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Desktop auth buttons (when logged out) */}
              {authReady && !user && (
                <div className="hidden lg:flex items-center gap-3">
                  <a
                    href="/login"
                    className="text-[11px] font-bold tracking-[0.16em] uppercase text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
                  >
                    Log In
                  </a>
                  <a href="/signup">
                    <ActionBtn variant="primary" size="sm">
                      Sign Up
                    </ActionBtn>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ✅ Mobile Burger Drawer */}
        <AnimatePresence>
          {mobileNavOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: fastEase }}
                className="fixed inset-0 z-[60] bg-black/35 backdrop-blur-sm"
                onClick={() => setMobileNavOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: fastEase }}
                className="fixed left-0 right-0 top-0 z-[70] lg:hidden"
              >
                <div className="mx-auto max-w-7xl px-6 pt-4">
                  <div className="rounded-[28px] border border-zinc-200/70 dark:border-zinc-800/70 bg-white/85 dark:bg-black/70 backdrop-blur-xl shadow-2xl overflow-hidden">
                    <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/60">
                      <div className="text-[10px] font-black tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
                        Menu
                      </div>
                      <button
                        onClick={() => setMobileNavOpen(false)}
                        className="h-10 w-10 rounded-full border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-white/[0.04] flex items-center justify-center"
                        aria-label="Close menu"
                      >
                        <X className="h-4.5 w-4.5 text-zinc-900 dark:text-zinc-100" />
                      </button>
                    </div>

                    <div className="p-3">
                      <div className="grid gap-1">
                        {navItems.map(({ label, id }) => (
                          <a
                            key={id}
                            href={`#${id}`}
                            onClick={(e) => handleScroll(e, id)}
                            className={[
                              "rounded-2xl px-4 py-4 border transition-colors",
                              activeSection === id
                                ? "border-emerald-500/30 bg-emerald-500/10"
                                : "border-zinc-200/60 dark:border-zinc-800/60 hover:bg-zinc-50/60 dark:hover:bg-white/[0.04]",
                            ].join(" ")}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-50">
                                {label}
                              </span>
                              {activeSection === id && (
                                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.55)]" />
                              )}
                            </div>
                          </a>
                        ))}
                      </div>

                      <div className="mt-3 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/70 dark:bg-white/[0.03] p-3">
                        {authReady ? (
                          user ? (
                            <>
                              <div className="px-2 py-2">
                                <div className="text-[10px] tracking-[0.22em] uppercase font-black text-zinc-500 dark:text-zinc-400">
                                  Signed in
                                </div>
                                <div className="mt-1 text-sm font-black tracking-tight truncate text-zinc-950 dark:text-zinc-50">
                                  {user.email}
                                </div>
                              </div>

                              <div className="mt-2 grid gap-2">
                                <a href={isDriver ? "/drivers/dashboard" : "/recruiter/settings"} className="block">
                                  <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black px-4 py-4 text-center text-[11px] font-black tracking-[0.18em] uppercase hover:opacity-95 transition-opacity">
                                    Account Settings
                                  </div>
                                </a>

                                <button
                                  onClick={() => {
                                    setMobileNavOpen(false)
                                    handleSignOut()
                                  }}
                                  disabled={navigating}
                                  className="w-full rounded-2xl px-4 py-4 text-left text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-950/25 transition-colors"
                                >
                                  Sign Out
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="grid gap-2">
                              <a
                                href="/login"
                                onClick={() => setMobileNavOpen(false)}
                                className="rounded-2xl px-4 py-4 border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-white/[0.03] text-center text-[11px] font-black tracking-[0.18em] uppercase text-zinc-800 dark:text-zinc-100"
                              >
                                Log In
                              </a>
                              <a href="/join" onClick={() => setMobileNavOpen(false)} className="block">
                                <ActionBtn variant="primary" size="lg" badge="Free">
                                  Join
                                </ActionBtn>
                              </a>
                            </div>
                          )
                        ) : (
                          <div className="h-12 flex items-center justify-center">
                            <div className="h-5 w-5 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-800 dark:border-t-zinc-200 animate-spin rounded-full" />
                          </div>
                        )}
                      </div>

                      <div className="mt-3 text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 px-2 pb-1">
                        © 2026 Driver Leads
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative pt-[160px] pb-[96px]">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial="hidden" animate="show" variants={flow} className="relative">
            <motion.div variants={rise} className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-white/[0.03] backdrop-blur-md px-4 py-2 shadow-sm">
                {/* 🟢 Live Pulsing Signal */}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                </span>
                <span className="text-[10px] font-black tracking-[0.24em] uppercase text-zinc-700 dark:text-zinc-300">
                  Expectation-first matching
                </span>
              </div>
            </motion.div>

            <motion.div variants={rise} className="mt-12 text-center">
              <h1 className="mx-auto max-w-[1200px] text-balance text-[44px] leading-[1.03] md:text-[68px] lg:text-[84px] tracking-tighter font-black">
                Drivers set the pay. Recruiters choose who to contact.
              </h1>
              <p className="mx-auto mt-8 max-w-[780px] text-[18px] md:text-[21px] leading-relaxed text-zinc-600 dark:text-zinc-300 font-medium tracking-tight">
                Drivers list their pay expectations up front. Recruiters search, filter, and unlock drivers only when the
                numbers match.
                <span className="block mt-1 opacity-80">No spam. No guessing. Just clear offers.</span>
              </p>
            </motion.div>

            <motion.div variants={rise} className="mt-12 flex flex-col items-center justify-center gap-4">
              {authReady ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                  <a href="/join" className="w-full sm:w-auto">
                    <ActionBtn variant="primary" size="lg" badge="Free">
                      Join as Driver
                    </ActionBtn>
                  </a>
                  <a href="/drivers" className="w-full sm:w-auto">
                    <ActionBtn variant="outline" size="lg">
                      I’m a Recruiter
                    </ActionBtn>
                  </a>
                  {user && isDriver && (
                    <a href="/drivers/dashboard" className="w-full sm:w-auto">
                      <ActionBtn variant="secondary" size="lg">
                        My Dashboard
                      </ActionBtn>
                    </a>
                  )}
                </div>
              ) : (
                <div className="h-12 flex items-center">
                  <div className="h-5 w-5 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-800 dark:border-t-zinc-200 animate-spin rounded-full" />
                </div>
              )}

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-5xl">
                <TrustPill icon={<Coins className="h-4.5 w-4.5" />} title="Pay-first signal" desc="Expectations visible before unlock." />
                <TrustPill icon={<Lock className="h-4.5 w-4.5" />} title="Privacy by design" desc="Contact info stays locked until paid." />
                <TrustPill icon={<Route className="h-4.5 w-4.5" />} title="Built for lanes" desc="Filter by type, exp, and targets." />
              </div>
            </motion.div>

            {/* Preview Panel Section */}
            <motion.div variants={slowPanel} className="mt-14">
              <div className="relative">
                <div className="absolute inset-0 rounded-[28px] bg-gradient-to-b from-white/70 to-white/25 dark:from-white/[0.06] dark:to-white/[0.02]" />
                <div className="relative rounded-[28px] border border-zinc-200/70 dark:border-zinc-800/70 bg-white/65 dark:bg-black/35 backdrop-blur-xl shadow-2xl overflow-hidden">
                  <div className="px-6 py-5 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 w-2.5 rounded-full bg-zinc-300/70 dark:bg-zinc-700/70" />
                      <div className="h-2.5 w-2.5 rounded-full bg-zinc-300/70 dark:bg-zinc-700/70" />
                      <div className="h-2.5 w-2.5 rounded-full bg-zinc-300/70 dark:bg-zinc-700/70" />
                      <span className="ml-3 text-[10px] font-bold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
                        Profile preview
                      </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600/90 dark:text-emerald-400/90" />
                      Verified marketplace
                    </div>
                  </div>

                  <div className="p-6 md:p-8">
                    <div className="grid lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-5">
                        <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-white/[0.03] p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
                                JD
                              </div>
                              <div>
                                <div className="text-base font-black tracking-tight">John Driver</div>
                                <div className="mt-1 text-[10px] font-bold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
                                  Verified Class A
                                </div>
                              </div>
                            </div>
                            <div className="h-10 w-10 rounded-full border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-white/[0.03] flex items-center justify-center">
                              <Lock className="h-4 w-4 text-zinc-400" />
                            </div>
                          </div>

                          <div className="mt-6 rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-5">
                            <div className="flex items-center justify-between mb-4">
                              <div className="text-[10px] font-black tracking-[0.22em] uppercase text-emerald-700 dark:text-emerald-300">
                                Expectations
                              </div>
                              <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
                                <Briefcase className="h-3.5 w-3.5" />
                                Owner Operator
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <Metric label="Expected Gross" value="$7,500/wk" />
                              <Metric label="Min RPM" value="$2.10/mi" />
                            </div>
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-3">
                            <KeyField icon={<Clock3 className="h-4 w-4" />} label="Experience" value="8 Years" />
                            <KeyField icon={<Mail className="h-4 w-4" />} label="Email" value="Locked" />
                            <KeyField icon={<Phone className="h-4 w-4" />} label="Phone" value="Locked" />
                            <KeyField icon={<Award className="h-4 w-4" />} label="Rating" value="4.9/5" />
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-7 flex flex-col justify-between">
                        <div className="space-y-3">
                          <SignalRow title="Expectation-first filtering" desc="Recruiters shortlist before unlocking." />
                          <SignalRow title="Verified contact + CDL access" desc="Unlocked profiles include the essentials." />
                          <SignalRow title="Less noise, more intent" desc="Shorter time-to-seat for serious hiring." />
                        </div>

                        {/* ✅ Restore Partners Section with Roadmap Text */}
                        <div className="mt-7 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/70 dark:bg-white/[0.03] p-6 shadow-inner">
                          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500 mb-6">
                            Trusted by teams that move freight — <span className="text-emerald-600">Partnering Soon</span>
                          </p>
                          <div className="flex flex-wrap items-center gap-x-12 gap-y-6 opacity-30 grayscale pointer-events-none select-none antialiased">
                            <span className="font-black italic tracking-tighter text-2xl text-zinc-700 dark:text-zinc-200">FEDEX</span>
                            <span className="font-black italic tracking-tighter text-2xl text-zinc-700 dark:text-zinc-200">LANDSTAR</span>
                            <span className="font-black italic tracking-tighter text-2xl text-zinc-700 dark:text-zinc-200">JB HUNT</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition */}
      <section id="benefits" className="scroll-mt-28 py-[100px] border-t border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-12 gap-16 items-end">
            <div className="lg:col-span-5">
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }} variants={flow}>
                <motion.p
                  variants={rise}
                  className="text-[11px] font-black tracking-[0.26em] uppercase text-emerald-700 dark:text-emerald-300"
                >
                  Product clarity
                </motion.p>
                <motion.h2 variants={rise} className="mt-6 text-[36px] md:text-[48px] leading-none tracking-tighter font-black">
                  Not a job board. <br />
                  <span className="text-zinc-400">A controlled market for intent.</span>
                </motion.h2>
                <motion.p
                  variants={rise}
                  className="mt-8 text-[17px] md:text-[19px] leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium"
                >
                  Driver Leads reduces noise by making compensation expectations the first-class signal. Recruiters pay
                  only when they choose to connect—keeping outreach intentional and privacy intact.
                </motion.p>
              </motion.div>
            </div>

            <div className="lg:col-span-7">
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={flow}
                className="grid md:grid-cols-3 gap-4"
              >
                <ValueBlock Icon={Coins} title="Expectations as data" desc="CPM, miles, gross, RPM—structured, searchable, comparable." />
                <ValueBlock Icon={ShieldCheck} title="Privacy stays locked" desc="Contact details remain protected until an unlock occurs." />
                <ValueBlock Icon={Gauge} title="Decisions move faster" desc="Filter with precision. Reduce back-and-forth. Hire with intent." />
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={slowPanel}
                className="mt-6"
              >
                <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/65 dark:bg-white/[0.03] backdrop-blur-xl p-6 shadow-xl">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                      <div className="text-[10px] font-black tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
                        Designed for enterprise workflows
                      </div>
                      <div className="mt-2 text-base font-black tracking-tight">Minimal surface area. Maximum signal.</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge>Private by default</Badge>
                      <Badge>Unlock on intent</Badge>
                      <Badge>Expectation filtering</Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="scroll-mt-28 py-[100px]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-5">
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }} variants={flow}>
                <motion.p variants={rise} className="text-[11px] font-black tracking-[0.26em] uppercase text-zinc-500">
                  The workflow
                </motion.p>
                <motion.h2 variants={rise} className="mt-6 text-[36px] md:text-[48px] leading-tight tracking-tighter font-black">
                  A deliberate flow—from expectations to connection.
                </motion.h2>
                <motion.p
                  variants={rise}
                  className="mt-8 text-[17px] md:text-[19px] leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium"
                >
                  Three steps, designed to reduce low-intent outreach and keep both sides focused on qualified matches.
                </motion.p>
              </motion.div>
            </div>

            <div className="lg:col-span-7">
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.28 }} variants={flow}>
                <div className="relative">
                  <div className="absolute left-[17px] top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-zinc-200 to-transparent dark:via-zinc-800" />
                  <div className="space-y-4">
                    <TimelineStep
                      number="01"
                      title="Drivers set expectations"
                      desc="Company drivers add CPM + desired miles. Owner operators add gross + RPM."
                      icon={<Target size={24} />}
                    />
                    <TimelineStep
                      number="02"
                      title="Recruiters filter & shortlist"
                      desc="Search by location, experience, endorsements—and expectations."
                      icon={<Gauge size={24} />}
                    />
                    <TimelineStep
                      number="03"
                      title="Unlock to connect"
                      desc="When it’s a match, unlock to get verified contact + CDL."
                      icon={<Lock size={24} />}
                    />
                  </div>
                </div>

                <motion.div variants={rise} className="mt-10">
                  <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black px-8 py-7 shadow-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                      <div>
                        <div className="text-[10px] font-black tracking-[0.22em] uppercase opacity-70">Conversion-focused</div>
                        <div className="mt-1 text-base font-black tracking-tight">Browse freely. Pay only when you decide to connect.</div>
                      </div>
                      <a href="/drivers" className="w-full sm:w-auto">
                        <ActionBtn variant="inverse" size="md">
                          Browse Drivers
                        </ActionBtn>
                      </a>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="recruiters" className="scroll-mt-28 py-[110px]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-[40px] bg-zinc-950 text-white shadow-2xl overflow-hidden relative p-10 md:p-16">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-emerald-500/12 blur-[90px]" />
              <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:26px_26px] opacity-[0.35]" />
            </div>

            <div className="relative">
              <div className="grid lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-5">
                  <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }} variants={flow}>
                    <motion.p variants={rise} className="text-[11px] font-black tracking-[0.26em] uppercase text-white/60">
                      Recruiter pricing
                    </motion.p>
                    <motion.h2 variants={rise} className="mt-6 text-[42px] md:text-[54px] leading-none tracking-tighter font-black">
                      Pay for intent, <br />
                      not volume.
                    </motion.h2>
                    <motion.p variants={rise} className="mt-8 text-lg leading-relaxed text-white/70 font-medium">
                      A B2B model designed for teams. Browse profiles freely, filter by expectations, and unlock only when
                      you’re ready to contact.
                    </motion.p>

                    <motion.div variants={rise} className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <DarkStat label="Unlock includes" value="Verified contact + CDL" />
                      <DarkStat label="Access model" value="Per unlock (Pay-as-you-go)" />
                    </motion.div>
                  </motion.div>
                </div>

                <div className="lg:col-span-7">
                  <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} variants={flow}>
                    <div className="grid lg:grid-cols-2 gap-6">
                      <B2BPricingCard
                        title="Single Unlock"
                        price="$10"
                        sub="per driver"
                        bullets={["Verified phone + email", "CDL download access", "Expectation-first filtering", "Full carrier history"]}
                        ctaText="Browse Drivers"
                        ctaHref="/drivers"
                        highlight
                      />
                      <B2BPricingCard
                        title="Starter"
                        price="$49"
                        sub="/mo"
                        bullets={["10 unlock credits", "Team dashboard", "Priority support", "Candidate shortlisting"]}
                        ctaText="Coming Soon"
                        disabled
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (Full Restore) */}
      <footer className="py-14 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-black/20 antialiased">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-[32px] border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl shadow-lg">
            <div className="px-8 md:px-12 py-14 flex flex-col md:flex-row items-center md:justify-between gap-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative h-12 w-40 scale-300">
                  <Image src="/logo3.png" alt="Driver Leads" fill className="object-contain" />
                </div>
                <div className="h-10 w-px bg-zinc-200 dark:bg-zinc-800 hidden md:block" />
                <div className="text-sm font-black tracking-tighter text-zinc-900 dark:text-zinc-50">Driver Leads</div>
              </div>
              <div className="flex flex-col items-center md:items-end gap-6">
                <div className="flex flex-wrap justify-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  <a href="/about" className="hover:text-emerald-600 transition-colors">
                    About Us
                  </a>
                  <a href="/privacy" className="hover:text-emerald-600 transition-colors">
                    Privacy
                  </a>
                  <a href="/privacy/terms" className="hover:text-emerald-600 transition-colors">
                    Terms
                  </a>
                  <a href="/contact" className="hover:text-emerald-600 transition-colors">
                    Contact Us
                  </a>
                </div>
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                  © 2026 Driver Leads. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

/* --- REUSABLE COMPONENTS --- */

function ActionBtn({ children, onClick, variant = "primary", size = "md", badge }: any) {
  const styles: any = {
    primary: "bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black shadow-xl ring-1 ring-zinc-950/10",
    secondary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20",
    outline:
      "border-2 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-white/[0.04] text-zinc-900 dark:text-white",
    inverse: "bg-white text-black hover:bg-zinc-50 shadow-xl",
  }
  const sizes: any = {
    sm: "px-6 py-3 text-[10px]",
    lg: "px-12 py-5 text-[12px] w-full sm:w-auto",
    md: "px-9 py-4 text-[11px]",
  }
  return (
    <button
      onClick={onClick}
      className={`${styles[variant]} ${sizes[size]} rounded-full font-black tracking-[0.22em] uppercase transition-all active:scale-[0.97] relative flex items-center justify-center gap-3`}
    >
      {children}
      {badge && (
        <span className="absolute -top-3 -right-2 bg-emerald-500 text-white text-[9px] px-2.5 py-1 rounded-full font-black shadow-lg ring-4 ring-white dark:ring-[#060607]">
          {badge}
        </span>
      )}
    </button>
  )
}

function TrustPill({ icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-[#0c0c0d] shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-4">
        {icon} <span>{title}</span>
      </div>
      <p className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{desc}</p>
    </div>
  )
}

function Metric({ label, value }: any) {
  return (
    <div className="px-5 py-4 rounded-xl bg-white dark:bg-black/40 border border-zinc-100 dark:border-zinc-800">
      <p className="text-[10px] font-black text-zinc-400 uppercase mb-2 tracking-widest">{label}</p>
      <p className="text-[16px] font-black tracking-tight text-zinc-950 dark:text-white">{value}</p>
    </div>
  )
}

function KeyField({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 rounded-xl border border-zinc-100 dark:border-zinc-800 text-[13px] font-bold text-zinc-500 bg-white dark:bg-white/[0.01]">
      <span className="text-zinc-400">{icon}</span> <span>{label}: {value}</span>
    </div>
  )
}

function SignalRow({ title, desc }: any) {
  return (
    <div className="flex gap-5 p-6 rounded-[24px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-white/[0.01] hover:bg-zinc-50/50 dark:hover:bg-white/[0.03] transition-colors">
      <CheckCircle2 className="mt-1 flex-shrink-0 text-emerald-500" size={20} />
      <div>
        <p className="text-[16px] font-black tracking-tight mb-1">{title}</p>
        <p className="text-sm font-bold text-zinc-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function ValueBlock({ Icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-[32px] border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-[#0c0c0d] hover:border-emerald-500/40 transition-all group shadow-sm">
      <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
        <Icon size={24} />
      </div>
      <h3 className="font-black text-[18px] mb-3 tracking-tighter">{title}</h3>
      <p className="text-sm font-bold text-zinc-500 leading-relaxed">{desc}</p>
    </div>
  )
}

function TimelineStep({ number, title, desc, icon }: any) {
  return (
    <div className="flex gap-8 p-8 rounded-[40px] border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-[#0c0c0d] shadow-sm">
      <div className="h-14 w-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-lg font-black flex-shrink-0 text-zinc-400 border border-zinc-100 dark:border-zinc-800">
        {number}
      </div>
      <div className="flex-grow">
        <h3 className="text-[20px] font-black tracking-tighter mb-2">{title}</h3>
        <p className="text-[15px] font-bold text-zinc-500 leading-relaxed">{desc}</p>
      </div>
      <div className="opacity-10 text-emerald-600 self-center hidden sm:block">{icon}</div>
    </div>
  )
}

function B2BPricingCard({ title, price, sub, bullets, ctaText, ctaHref, highlight, disabled }: any) {
  return (
    <div
      className={`p-10 rounded-[48px] border-2 transition-all ${
        highlight
          ? "bg-white text-black border-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] scale-105"
          : "bg-zinc-900 border-zinc-800 text-white opacity-90"
      }`}
    >
      <p className="text-[11px] font-black uppercase tracking-[0.25em] opacity-40 mb-8">{title}</p>
      <div className="flex items-baseline gap-2 mb-10">
        <span className="text-7xl font-black tracking-tighter">{price}</span>
        <span className="text-sm font-black opacity-40 uppercase">{sub}</span>
      </div>
      <ul className="space-y-5 mb-12">
        {bullets.map((b: string) => (
          <li key={b} className="flex items-center gap-4 text-sm font-bold leading-tight">
            <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" /> {b}
          </li>
        ))}
      </ul>
      {disabled ? (
        <div className="w-full py-5 text-center text-[12px] font-black uppercase bg-zinc-800 text-zinc-500 rounded-3xl">
          {ctaText}
        </div>
      ) : (
        <a
          href={ctaHref}
          className="block w-full py-5 text-center text-[12px] font-black uppercase bg-zinc-950 text-white rounded-3xl hover:scale-[1.03] transition-transform shadow-lg shadow-black/20"
        >
          {ctaText}
        </a>
      )}
    </div>
  )
}

function DarkStat({ label, value }: any) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-7 min-w-[160px]">
      <p className="text-[10px] font-black text-zinc-500 uppercase mb-2 tracking-widest">{label}</p>
      <p className="text-[20px] font-black text-zinc-100 tracking-tight">{value}</p>
    </div>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-white/[0.02] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
      {children}
    </div>
  )
}
