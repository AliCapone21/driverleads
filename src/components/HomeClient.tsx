// src/components/HomeClient.tsx

"use client"

import React, { useEffect, useMemo, useState } from "react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { AnimatePresence, motion } from "framer-motion"
import { createClient } from "@/utils/supabase/client"
import { User } from "@supabase/supabase-js"
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
} from "lucide-react"

/* --- Motion --- */
const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9, ease } },
}

const rise = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
}

const flow = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
}

const slowPanel = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.05, ease } },
}

export default function HomeClient() {
  const supabase = createClient()

  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isDriver, setIsDriver] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
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
          const { data: driver } = await supabase.from("drivers").select("id").eq("user_id", data.user.id).maybeSingle()
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
        const { data: driver } = await supabase.from("drivers").select("id").eq("user_id", session.user.id).maybeSingle()
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

  const handleSignOut = async () => {
    setNavigating(true)
    await supabase.auth.signOut()
    window.location.reload()
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
    "text-[9px] lg:text-[11px] font-semibold tracking-[0.10em] lg:tracking-[0.14em] uppercase transition-colors relative px-0.5 lg:px-1 py-2 select-none"
  const active = "text-zinc-950 dark:text-zinc-50"
  const inactive = "text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50"
  return `${base} ${activeSection === id ? active : inactive}`
}

  return (
    <main className="min-h-screen relative bg-white text-zinc-950 dark:bg-[#060607] dark:text-zinc-50 transition-colors duration-500 selection:bg-emerald-500/25">
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
            ? "bg-white/70 dark:bg-black/45 backdrop-blur-xl border-b border-zinc-200/60 dark:border-zinc-800/60"
            : "bg-transparent",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="h-[84px] flex items-center justify-between">
            <div className="flex items-center gap-5">
              <a href="/" className="flex items-center gap-4 group">
                <div className="relative h-30 w-44 scale-125 lg:scale-180 transition-transform">
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

              <div className="hidden lg:flex items-center gap-7 pl-60">
                {navItems.map(({ label, id }) => (
                  <a key={id} href={`#${id}`} onClick={(e) => handleScroll(e, id)} className={navClass(id)}>
                    <span className="relative">
                      {label}
                      {activeSection === id && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute left-0 -bottom-1.5 h-[1.5px] w-full bg-zinc-950/90 dark:bg-zinc-50/90 rounded-full"
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

              {authReady && user && (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="h-10 w-10 rounded-full border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-white/[0.04] backdrop-blur-md flex items-center justify-center shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)]"
                  >
                    <span className="text-xs font-semibold text-zinc-950 dark:text-zinc-50">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </button>

                  <AnimatePresence>
                    {menuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                          transition={{ duration: 0.4, ease }}
                          className="absolute right-0 mt-4 w-[290px] z-50"
                        >
                          <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/75 dark:bg-black/55 backdrop-blur-xl shadow-[0_40px_80px_-55px_rgba(0,0,0,0.7)] overflow-hidden">
                            <div className="px-5 py-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
                              <p className="text-[10px] tracking-[0.22em] uppercase font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                                Account
                              </p>
                              <p className="text-sm font-semibold truncate text-zinc-950 dark:text-zinc-50">
                                {user.email}
                              </p>
                            </div>

                            <div className="p-2">
                              <a href={isDriver ? "/drivers/dashboard" : "/recruiter/settings"} className="block">
                                <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black px-4 py-3 text-center text-[11px] font-semibold tracking-[0.18em] uppercase hover:opacity-95 transition-opacity">
                                  Account Settings
                                </div>
                              </a>

                              <button
                                onClick={handleSignOut}
                                disabled={navigating}
                                className="mt-2 w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-950/25 transition-colors"
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

              {authReady && !user && (
                <div className="hidden sm:flex items-center gap-3">
                  <a
                    href="/login"
                    className="text-[11px] font-semibold tracking-[0.16em] uppercase text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
                  >
                    Log In
                  </a>
                  <a href="/join">
                    <ActionBtn variant="primary" size="sm" badge="Free">
                      Get Started
                    </ActionBtn>
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="lg:hidden pb-4">
            <div className="flex items-center justify-between gap-2">
              <nav className="flex items-center gap-6">
                {navItems.map(({ label, id }) => (
                  <a key={id} href={`#${id}`} onClick={(e) => handleScroll(e, id)} className={navClass(id)}>
                    <span className="relative">
                      {label}
                      {activeSection === id && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute left-0 -bottom-1.5 h-[1.5px] w-full bg-zinc-950/90 dark:bg-zinc-50/90 rounded-full"
                          transition={{ type: "spring", stiffness: 520, damping: 44, mass: 0.6 }}
                        />
                      )}
                    </span>
                  </a>
                ))}
              </nav>

              {authReady && !user && (
              <div className="flex items-center gap-2 lg:gap-3">
  <a
    href="/login"
    className="text-[10px] lg:text-[11px] font-semibold tracking-[0.1em] lg:tracking-[0.16em] uppercase text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
  >
    Log In
  </a>
  <a href="/join">
    <ActionBtn variant="primary" size="sm" badge="Free">
      Join
    </ActionBtn>
  </a>
</div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-[160px] pb-[96px]">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial="hidden" animate="show" variants={flow} className="relative">
            <motion.div variants={rise} className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-white/[0.03] backdrop-blur-md px-4 py-2 shadow-[0_18px_60px_-45px_rgba(0,0,0,0.45)]">
                <Target className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-zinc-700 dark:text-zinc-300">
                  Expectation-first matching
                </span>
              </div>
            </motion.div>

            <motion.div variants={rise} className="mt-10 text-center">
              <h1 className="mx-auto max-w-[980px] text-balance text-[44px] leading-[1.03] md:text-[64px] lg:text-[74px] tracking-[-0.035em] font-semibold">
                Drivers set the pay. Recruiters choose who to contact.
              </h1>
              <p className="mx-auto mt-6 max-w-[760px] text-[16px] md:text-[18px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                Drivers list their pay expectations up front. Recruiters search, filter, and unlock drivers only when the numbers match.
                No spam. No guessing. Just clear offers.
              </p>
            </motion.div>

            <motion.div variants={rise} className="mt-10 flex flex-col items-center justify-center gap-4">
              {authReady ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
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

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-4xl">
                <TrustPill icon={<Coins className="h-4 w-4" />} title="Pay-first signal" desc="Expectations visible before unlock." />
                <TrustPill icon={<Lock className="h-4 w-4" />} title="Privacy by design" desc="Contact info stays locked until paid." />
                <TrustPill icon={<Route className="h-4 w-4" />} title="Built for lanes" desc="Filter by type, exp, and targets." />
              </div>
            </motion.div>

            <motion.div variants={slowPanel} className="mt-14">
              <div className="relative">
                <div className="absolute inset-0 rounded-[28px] bg-gradient-to-b from-white/70 to-white/25 dark:from-white/[0.06] dark:to-white/[0.02] blur-0" />
                <div className="relative rounded-[28px] border border-zinc-200/70 dark:border-zinc-800/70 bg-white/65 dark:bg-black/35 backdrop-blur-xl shadow-[0_60px_120px_-95px_rgba(0,0,0,0.85)] overflow-hidden">
                  <div className="px-6 py-5 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 w-2.5 rounded-full bg-zinc-300/70 dark:bg-zinc-700/70" />
                      <div className="h-2.5 w-2.5 rounded-full bg-zinc-300/70 dark:bg-zinc-700/70" />
                      <div className="h-2.5 w-2.5 rounded-full bg-zinc-300/70 dark:bg-zinc-700/70" />
                      <span className="ml-3 text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
                        Profile preview
                      </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600/90 dark:text-emerald-400/90" />
                      Verified marketplace
                    </div>
                  </div>

                  <div className="p-6 md:p-8">
                    <div className="grid lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-5">
                        <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-white/[0.03] p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-semibold tracking-tight shadow-[0_22px_50px_-35px_rgba(16,185,129,0.65)]">
                                JD
                              </div>
                              <div>
                                <div className="text-base font-semibold tracking-tight">John Driver</div>
                                <div className="mt-1 text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
                                  Verified Class A
                                </div>
                              </div>
                            </div>
                            <div className="h-10 w-10 rounded-full border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-white/[0.03] flex items-center justify-center">
                              <Lock className="h-4 w-4 text-zinc-400" />
                            </div>
                          </div>

                          <div className="mt-6 rounded-2xl border border-emerald-500/15 bg-gradient-to-b from-emerald-500/[0.06] to-transparent dark:from-emerald-500/[0.06] p-5">
                            <div className="flex items-center justify-between">
                              <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-emerald-700/80 dark:text-emerald-300/70">
                                Expectations
                              </div>
                              <div className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
                                <Briefcase className="h-3.5 w-3.5" />
                                Owner Operator
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                              <Metric label="Expected Gross" value="$7,500/wk" />
                              <Metric label="Min RPM" value="$2.10/mi" />
                            </div>
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-3">
                            <KeyField icon={<Clock3 className="h-4 w-4" />} label="Experience" value="8 Years" />
                            <KeyField icon={<Award className="h-4 w-4" />} label="Age" value="33" />
                            <KeyField icon={<Mail className="h-4 w-4" />} label="Email" value="Locked" />
                            <KeyField icon={<Phone className="h-4 w-4" />} label="Phone" value="Locked" />
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-7">
                        <div className="h-full rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-white/[0.02] p-6 md:p-7 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
                                Matching signals
                              </div>
                              <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
                                Updated live
                              </div>
                            </div>

                            <div className="mt-5 space-y-3">
                              <SignalRow title="Expectation-first filtering" desc="Recruiters shortlist before unlocking." />
                              <SignalRow title="Verified contact + CDL access" desc="Unlocked profiles include the essentials." />
                              <SignalRow title="Less noise, more intent" desc="Shorter time-to-seat for serious hiring." />
                            </div>
                          </div>

                          <div className="mt-7">
                            <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/70 dark:bg-white/[0.03] p-5">
                              <div className="flex items-center justify-between">
                                <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
                                  Trusted by teams that move freight
                                </div>
                                <div className="hidden sm:block text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
                                  Enterprise-ready
                                </div>
                              </div>

                              <div className="mt-4 flex flex-wrap items-center gap-x-10 gap-y-3 opacity-70">
                                <span className="font-semibold italic tracking-tight text-lg text-zinc-700 dark:text-zinc-200">
                                  FEDEX
                                </span>
                                <span className="font-semibold italic tracking-tight text-lg text-zinc-700 dark:text-zinc-200">
                                  LANDSTAR
                                </span>
                                <span className="font-semibold italic tracking-tight text-lg text-zinc-700 dark:text-zinc-200">
                                  JB HUNT
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 h-[220px] w-[620px] rounded-full bg-emerald-500/10 blur-[80px] dark:bg-emerald-500/10" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition (Benefits anchor preserved) */}
      <section id="benefits" className="scroll-mt-28 py-[96px]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-end">
            <div className="lg:col-span-5">
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }} variants={flow}>
                <motion.p
                  variants={rise}
                  className="text-[10px] font-semibold tracking-[0.26em] uppercase text-emerald-700 dark:text-emerald-300"
                >
                  Product clarity
                </motion.p>
                <motion.h2
                  variants={rise}
                  className="mt-4 text-[30px] md:text-[42px] leading-[1.08] tracking-[-0.03em] font-semibold"
                >
                  Not a job board. A controlled market for intent.
                </motion.h2>
                <motion.p variants={rise} className="mt-5 text-[15px] md:text-[16px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                  Driver Leads reduces noise by making compensation expectations the first-class signal. Recruiters pay only
                  when they choose to connect—keeping outreach intentional and privacy intact.
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
                <ValueBlock
                  Icon={Coins}
                  title="Expectations as data"
                  desc="CPM, miles, gross, RPM—structured, searchable, comparable."
                />
                <ValueBlock
                  Icon={ShieldCheck}
                  title="Privacy stays locked"
                  desc="Contact details remain protected until an unlock occurs."
                />
                <ValueBlock
                  Icon={Gauge}
                  title="Decisions move faster"
                  desc="Filter with precision. Reduce back-and-forth. Hire with intent."
                />
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={slowPanel}
                className="mt-6"
              >
                <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/65 dark:bg-white/[0.03] backdrop-blur-xl p-6 shadow-[0_40px_90px_-70px_rgba(0,0,0,0.65)]">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
                        Designed for enterprise workflows
                      </div>
                      <div className="mt-2 text-base font-semibold tracking-tight">
                        Minimal surface area. Maximum signal.
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge>Private by default</Badge>
                      <Badge>Unlock on intent</Badge>
                      <Badge>Expectation-first filtering</Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="scroll-mt-28 py-[96px]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-5">
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }} variants={flow}>
                <motion.p
                  variants={rise}
                  className="text-[10px] font-semibold tracking-[0.26em] uppercase text-zinc-500 dark:text-zinc-400"
                >
                  How it works
                </motion.p>
                <motion.h2
                  variants={rise}
                  className="mt-4 text-[30px] md:text-[42px] leading-[1.08] tracking-[-0.03em] font-semibold"
                >
                  A deliberate flow-from expectations to connection.
                </motion.h2>
                <motion.p variants={rise} className="mt-5 text-[15px] md:text-[16px] leading-relaxed text-zinc-600 dark:text-zinc-300">
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
                      icon={<Target className="h-4.5 w-4.5" />}
                    />
                    <TimelineStep
                      number="02"
                      title="Recruiters filter & shortlist"
                      desc="Search by location, experience, endorsements—and expectations."
                      icon={<Gauge className="h-4.5 w-4.5" />}
                    />
                    <TimelineStep
                      number="03"
                      title="Unlock to connect"
                      desc="When it’s a match, unlock to get verified contact + CDL."
                      icon={<Lock className="h-4.5 w-4.5" />}
                    />
                  </div>
                </div>

                <motion.div variants={rise} className="mt-8">
                  <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black px-6 py-5 shadow-[0_40px_90px_-70px_rgba(0,0,0,0.75)]">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div className="text-[10px] font-semibold tracking-[0.22em] uppercase opacity-70">
                          Conversion-focused
                        </div>
                        <div className="mt-1 text-base font-semibold tracking-tight">
                          Browse freely. Pay only when you decide to connect.
                        </div>
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

      {/* Recruiters / Pricing */}
      <section id="recruiters" className="scroll-mt-28 py-[108px]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-[32px] border border-zinc-200/70 dark:border-zinc-800/70 bg-gradient-to-b from-zinc-950 to-black text-white shadow-[0_80px_160px_-140px_rgba(0,0,0,0.95)] overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-emerald-500/12 blur-[90px]" />
              <div className="absolute -bottom-52 left-[-160px] h-[560px] w-[560px] rounded-full bg-zinc-400/10 blur-[110px]" />
              <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:26px_26px] opacity-[0.35]" />
            </div>

            <div className="relative p-7 md:p-10 lg:p-12">
              <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                <div className="lg:col-span-5">
                  <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }} variants={flow}>
                    <motion.p
                      variants={rise}
                      className="text-[10px] font-semibold tracking-[0.26em] uppercase text-white/60"
                    >
                      Recruiter pricing
                    </motion.p>
                    <motion.h2
                      variants={rise}
                      className="mt-4 text-[32px] md:text-[44px] leading-[1.06] tracking-[-0.03em] font-semibold"
                    >
                      Pay for intent, not volume.
                    </motion.h2>
                    <motion.p variants={rise} className="mt-5 text-[15px] md:text-[16px] leading-relaxed text-white/70">
                      A B2B model designed for teams. Browse profiles freely, filter by expectations, and unlock only when
                      you’re ready to contact.
                    </motion.p>

                    <motion.div variants={rise} className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <DarkStat label="Unlock includes" value="Verified contact + CDL" />
                      <DarkStat label="Access model" value="Per unlock (now)" />
                    </motion.div>
                  </motion.div>
                </div>

                <div className="lg:col-span-7">
                  <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} variants={flow}>
                    <div className="grid lg:grid-cols-2 gap-4">
                      <B2BPricingCard
                        title="Single Unlock"
                        price="$10"
                        sub="per driver"
                        bullets={["Verified phone + email", "CDL download access", "Expectation-first filtering"]}
                        ctaText="Browse Drivers"
                        ctaHref="/drivers"
                        highlight
                      />
                      <B2BPricingCard
                        title="Starter"
                        price="$49"
                        sub="/mo"
                        bullets={["10 unlock credits", "Team dashboard", "Priority support"]}
                        ctaText="Coming Soon"
                        disabled
                      />
                      <B2BPricingCard
                        title="Enterprise"
                        price="$199"
                        sub="/mo"
                        bullets={["Unlimited potential", "Custom API access", "Account manager"]}
                        ctaText="Coming Soon"
                        disabled
                      />
                    </div>

                    <motion.div variants={rise} className="mt-6">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl px-6 py-5">
                        <div className="flex flex-col   md:justify-between gap-4">
                          <div>
                            <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-white/60">
                              Security & trust
                            </div>
                            <div className="mt-1 text-sm font-semibold text-white/85">
                              Unlocks are explicit. Contacts remain protected until purchased.
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <DarkBadge icon={<ShieldCheck className="h-3.5 w-3.5" />}>Privacy-first</DarkBadge>
                            <DarkBadge icon={<Lock className="h-3.5 w-3.5" />}>Controlled access</DarkBadge>
                            <DarkBadge icon={<CheckCircle2 className="h-3.5 w-3.5" />}>Verified profiles</DarkBadge>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="relative border-t border-white/10 px-7 md:px-10 lg:px-12 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-white/70">
                <div className="text-[11px] font-semibold tracking-[0.18em] uppercase">
                  Enterprise-grade UX. Designed for calm conversion.
                </div>
                <div className="text-[11px] font-semibold tracking-[0.18em] uppercase">
                  Browse freely → Unlock intentionally
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

{/* Footer */}
<footer className="py-14">
  <div className="mx-auto max-w-7xl px-6">
    <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl shadow-[0_40px_90px_-70px_rgba(0,0,0,0.45)]">
      {/* 1. Changed items-start to items-center for mobile centering
          2. Kept md:justify-between for the desktop split 
      */}
      <div className="px-6 md:px-8 py-10 flex flex-col md:flex-row items-center md:justify-between gap-10 md:gap-6">
        
        {/* Logo Group: Stays at the top/left */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative h-12 w-40 scale-300 transition-transform">
            <Image src="/logo3.png" alt="Driver Leads" fill className="object-contain" />
          </div>
          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden md:block" />
          <div className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Driver Leads
          </div>
        </div>

        {/* Links and Copyright Group */}
        <div className="flex flex-col items-center md:items-end gap-4">
          {/* Privacy/Terms/Legal: Now on top for mobile */}
           <div className="flex items-center gap-5 text-[7px] lg:text-[11px] font-semibold tracking-[0.16em] uppercase text-zinc-500 dark:text-zinc-400">
            <a href="/about" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">
              About Us
            </a>
            <a href="/privacy" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">
              Privacy
            </a>
            <a href="/privacy/terms" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">
              Terms
            </a>
            <a href="/privacy/legal" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">
              Legal
            </a>
            <a href="/contact" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">
              Contact Us
            </a>
          </div>

          {/* Copyright: Now forced to the bottom of the links via flex-col order */}
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
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

/* -------------------------------
   Reusable UI
-------------------------------- */

function ActionBtn({ children, onClick, variant = "primary", size = "md", badge }: any) {
  const styles: any = {
    primary:
      "bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black border border-zinc-950/10 dark:border-white/10 shadow-[0_18px_50px_-36px_rgba(0,0,0,0.55)] hover:shadow-[0_28px_70px_-52px_rgba(0,0,0,0.6)]",
    secondary:
      "bg-emerald-600 text-white border border-emerald-600/40 shadow-[0_18px_50px_-36px_rgba(16,185,129,0.45)] hover:bg-emerald-700",
    outline:
      "border border-zinc-200/80 dark:border-zinc-800/80 bg-white/55 dark:bg-white/[0.03] text-zinc-950 dark:text-white backdrop-blur-md hover:bg-white/75 dark:hover:bg-white/[0.05]",
    inverse:
      "bg-white text-black border border-white/10 hover:bg-white/95 shadow-[0_18px_50px_-36px_rgba(255,255,255,0.12)]",
  }

  const sizes: any = {
    sm: "px-5 py-2.5 text-[10px]",
    md: "px-7 py-3 text-[11px]",
    lg: "px-9 py-4 text-[11px] w-full sm:w-auto",
  }

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.32, ease }}
      onClick={onClick}
      className={`${styles[variant]} ${sizes[size]} rounded-full font-semibold tracking-[0.18em] uppercase inline-flex items-center justify-center gap-2 transition-colors duration-300 relative`}
    >
      {children}
      {badge && (
        <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[8px] px-2 py-0.5 rounded-full ring-2 ring-white/90 dark:ring-black/80 font-semibold shadow-sm">
          {badge}
        </span>
      )}
    </motion.button>
  )
}

function TrustPill({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl p-5 shadow-[0_35px_80px_-70px_rgba(0,0,0,0.55)]">
      <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
        <span className="text-emerald-600 dark:text-emerald-400">{icon}</span>
        <span>{title}</span>
      </div>
      <div className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{desc}</div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-emerald-500/15 bg-white/70 dark:bg-white/[0.03] px-4 py-3">
      <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{value}</div>
    </div>
  )
}

function KeyField({ icon, label, value }: any) {
  return (
    <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/70 dark:bg-white/[0.02] px-4 py-3">
      <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
        <span className="text-zinc-500 dark:text-zinc-400">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="mt-1 text-sm font-semibold tracking-tight">{value}</div>
    </div>
  )
}

function SignalRow({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-white/[0.02] px-5 py-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
        <div>
          <div className="text-sm font-semibold tracking-tight">{title}</div>
          <div className="mt-1 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-300">{desc}</div>
        </div>
      </div>
    </div>
  )
}

function ValueBlock({ Icon, title, desc }: { Icon: LucideIcon; title: string; desc: string }) {
  return (
    <motion.div variants={rise} className="group">
      <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl p-6 shadow-[0_35px_80px_-70px_rgba(0,0,0,0.55)] transition-transform duration-500 group-hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-white/[0.02] flex items-center justify-center">
            <Icon size={18} className="text-emerald-600 dark:text-emerald-400" strokeWidth={1.8} />
          </div>
          <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
            Signal
          </div>
        </div>
        <div className="mt-4 text-base font-semibold tracking-tight">{title}</div>
        <div className="mt-2 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-300">{desc}</div>
      </div>
    </motion.div>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-full border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-white/[0.02] px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase text-zinc-600 dark:text-zinc-300">
      {children}
    </div>
  )
}

function TimelineStep({
  number,
  title,
  desc,
  icon,
}: {
  number: string
  title: string
  desc: string
  icon?: React.ReactNode
}) {
  return (
    <motion.div variants={rise} className="relative pl-12">
      <div className="absolute left-0 top-4 h-9 w-9 rounded-full border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-white/[0.03] backdrop-blur-md flex items-center justify-center shadow-[0_20px_50px_-40px_rgba(0,0,0,0.55)]">
        <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-600 dark:text-zinc-300">
          {number}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl p-6 shadow-[0_35px_80px_-70px_rgba(0,0,0,0.55)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-semibold tracking-tight">{title}</div>
            <div className="mt-2 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-300">{desc}</div>
          </div>
          {icon && (
            <div className="h-10 w-10 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-white/[0.02] flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              {icon}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function DarkStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl px-5 py-4">
      <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-white/60">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white/90">{value}</div>
    </div>
  )
}

function DarkBadge({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase text-white/70">
      {icon}
      <span>{children}</span>
    </div>
  )
}

function B2BPricingCard({ title, price, sub, bullets, ctaText, ctaHref, highlight, disabled }: any) {
  return (
    <motion.div
      variants={rise}
      className={[
        "relative rounded-[22px] border backdrop-blur-xl overflow-hidden",
        highlight
          ? "border-emerald-500/25 bg-white text-black shadow-[0_70px_140px_-130px_rgba(255,255,255,0.35)]"
          : "border-white/10 bg-white/[0.04] text-white",
      ].join(" ")}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className={`text-[10px] font-semibold tracking-[0.26em] uppercase ${highlight ? "text-zinc-500" : "text-white/60"}`}>
            {title}
          </div>
          {highlight && (
            <div className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase text-emerald-700">
              Recommended
            </div>
          )}
        </div>

        <div className="mt-6 flex items-end gap-2">
          <div className={`text-[44px] leading-none tracking-[-0.03em] font-semibold ${highlight ? "text-zinc-950" : "text-white"}`}>
            {price}
          </div>
          <div className={`pb-1 text-[11px] font-semibold tracking-[0.18em] uppercase ${highlight ? "text-zinc-500" : "text-white/60"}`}>
            {sub}
          </div>
        </div>

        <div className={`mt-6 h-px ${highlight ? "bg-zinc-200" : "bg-white/10"}`} />

        <ul className="mt-6 space-y-3">
          {bullets.map((b: string) => (
            <li key={b} className={`flex items-start gap-3 text-[13px] leading-relaxed font-semibold ${highlight ? "text-zinc-800" : "text-white/80"}`}>
              <CheckCircle2 size={18} className={highlight ? "text-emerald-600" : "text-emerald-400"} />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7">
          {disabled ? (
            <div className={`w-full rounded-xl px-4 py-3 text-center text-[11px] font-semibold tracking-[0.18em] uppercase ${highlight ? "bg-zinc-100 text-zinc-400" : "bg-white/10 text-white/40"}`}>
              {ctaText}
            </div>
          ) : (
            <a
              href={ctaHref}
              className={[
                "block w-full rounded-xl px-4 py-3 text-center text-[11px] font-semibold tracking-[0.18em] uppercase transition-transform duration-300 hover:-translate-y-0.5",
                highlight
                  ? "bg-zinc-950 text-white shadow-[0_26px_70px_-55px_rgba(0,0,0,0.65)]"
                  : "bg-white text-black shadow-[0_26px_70px_-55px_rgba(255,255,255,0.10)]",
              ].join(" ")}
            >
              {ctaText}
            </a>
          )}
        </div>
      </div>

      {!highlight && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 h-52 w-52 rounded-full bg-emerald-500/10 blur-[70px]" />
        </div>
      )}
    </motion.div>
  )
}
