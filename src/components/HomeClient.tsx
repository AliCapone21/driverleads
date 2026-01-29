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
  Sparkles,
  Zap,
  Mail,
  Phone,
  Award,
  Clock3,
} from "lucide-react"

/* --- Motion --- */
const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease } },
}

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
}

export default function HomeClient() {
  const supabase = createClient()

  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isDriver, setIsDriver] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [navigating, setNavigating] = useState(false)
  const [authReady, setAuthReady] = useState(false)

  // ✅ NEW: active nav highlight
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

  // ✅ NEW: highlight active section while scrolling
  useEffect(() => {
    const ids = ["benefits", "how-it-works", "recruiters"]
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]

    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        // pick the most visible intersecting section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0]

        if (visible?.target?.id) setActiveSection(visible.target.id)
      },
      {
        // this makes it switch a bit earlier, feels nicer
        root: null,
        threshold: [0.2, 0.35, 0.5, 0.65],
      }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleSignOut = async () => {
    setNavigating(true)
    await supabase.auth.signOut()
    window.location.reload()
  }

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const navItems = useMemo(
    () =>
      ["Benefits", "How it works", "Recruiters"].map((label) => ({
        label,
        id: label.toLowerCase().replace(/\s+/g, "-"),
      })),
    []
  )

  const navClass = (id: string) => {
    const base =
      "text-[10px] font-black uppercase tracking-widest transition-colors relative"
    const active =
      "text-zinc-950 dark:text-white"
    const inactive =
      "text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"

    return `${base} ${activeSection === id ? active : inactive}`
  }

  return (
    <main className="min-h-screen relative bg-white dark:bg-[#050505] text-zinc-900 dark:text-zinc-50 transition-colors duration-500 selection:bg-emerald-500/40">
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-white dark:bg-[#050505]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[900px] bg-gradient-to-b from-emerald-50/70 dark:from-emerald-950/25 to-transparent opacity-70" />
        <div className="absolute inset-0 hero-dots" />
      </div>

      {/* HEADER */}
      <header
        className={[
          "fixed top-0 w-full z-50 transition-all duration-500",
          isScrolled
            ? "bg-white/75 dark:bg-black/70 backdrop-blur-lg border-b border-zinc-200/70 dark:border-zinc-800/70 py-3"
            : "bg-transparent py-6",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 group">
 <div className="relative h-18 w-40 scale-250 transition-transform duration-300 group-hover:scale-[2.7]">
    <Image
      src="/logo3.png"
      alt="Driver Leads"
      fill
      priority
      className="object-contain"
    />
  </div>

  {/* Optional: keep text for accessibility/SEO but hidden visually */}
  <span className="sr-only">Driver Leads</span>
</a>


          <nav className="hidden md:flex items-center gap-8">
            {navItems.map(({ label, id }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => handleScroll(e, id)}
                className={navClass(id)}
              >
                {label}

                {/* ✅ little underline for active link */}
                {activeSection === id && (
                  <span className="absolute left-0 -bottom-2 h-[2px] w-full bg-emerald-500 rounded-full" />
                )}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            {authReady && user && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700"
                >
                  <span className="text-xs font-black text-zinc-900 dark:text-white">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-4 w-64 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-2"
                      >
                        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                            Account
                          </p>
                          <p className="text-sm font-bold truncate text-zinc-900 dark:text-white">
                            {user.email}
                          </p>
                        </div>

                        <a
                          href={isDriver ? "/drivers/dashboard" : "/recruiter/settings"}
                          className="block w-full text-center py-3 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-black text-xs font-black uppercase tracking-widest rounded-xl mt-2 hover:opacity-95"
                        >
                          Dashboard
                        </a>

                        <button
                          onClick={handleSignOut}
                          disabled={navigating}
                          className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors mt-1"
                        >
                          Sign Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            {authReady && !user && (
              <div className="flex items-center gap-4">
                <a
                  href="/login"
                  className="text-xs font-black uppercase tracking-widest hover:opacity-70 transition-opacity"
                >
                  Log In
                </a>
                <a href="/join">
                  <ActionBtn variant="primary" size="sm">
                    Get Started
                  </ActionBtn>
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-44 pb-28 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-14 items-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
            >
              <Sparkles className="h-3 w-3" />
              <span>Verified drivers. Direct offers.</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95] mb-7 uppercase"
            >
              Get hired faster —
              <br />
              without the job boards.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-zinc-600 dark:text-zinc-300 max-w-xl leading-relaxed mb-10"
            >
              Driver Leads is a marketplace where carriers send real offers to CDL drivers.
              You stay private until you approve the match.
            </motion.p>

            {authReady ? (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.25, ease }}
                className="flex flex-wrap gap-4 items-center"
              >
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
              </motion.div>
            ) : (
              <div className="h-12 flex items-center">
                <div className="h-5 w-5 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-800 dark:border-t-zinc-200 animate-spin rounded-full" />
              </div>
            )}

            <motion.div
              variants={fadeUp}
              className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-4 opacity-50 grayscale dark:invert"
            >
              <span className="font-black italic tracking-tighter text-xl">FEDEX</span>
              <span className="font-black italic tracking-tighter text-xl">LANDSTAR</span>
              <span className="font-black italic tracking-tighter text-xl">JB HUNT</span>
            </motion.div>
          </motion.div>

          {/* RIGHT PREVIEW */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="relative lg:block hidden">
            <div className="relative z-10 bg-white dark:bg-[#0f0f0f] rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden p-8">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                    JD
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">John Driver</h3>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      Verified Class A
                    </p>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full border border-zinc-100 dark:border-zinc-800 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
                  <Lock className="h-4 w-4 text-zinc-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <FieldCard icon={<Clock3 className="h-4 w-4" />} label="Experience" value="8 Years" />
                <FieldCard icon={<Award className="h-4 w-4" />} label="Age" value="33" />
                <FieldCard icon={<Mail className="h-4 w-4" />} label="Email" value="Locked" />
                <FieldCard icon={<Phone className="h-4 w-4" />} label="Phone" value="Locked" />
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">
                  Live Status
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm font-bold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Open to Regional
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Hazmat Endorsed
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -inset-6 bg-emerald-500/10 blur-[120px] -z-10 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="benefits" className="py-28 border-t border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            kicker="Why it feels better"
            title="Built for speed and privacy"
            subtitle="Recruiting is messy. We built a clean flow where drivers stay private and recruiters reach the right people faster."
          />

          <div className="grid md:grid-cols-3 gap-14 mt-16">
            <FeatureCard
              Icon={Zap}
              title="Direct offers"
              desc="No cold calling. Recruiters send you real offers with routes and pay details."
            />
            <FeatureCard
              Icon={ShieldCheck}
              title="Privacy by default"
              desc="Your contact info stays locked until you approve the unlock."
            />
            <FeatureCard
              Icon={Gauge}
              title="Faster onboarding"
              desc="Standard profiles reduce paperwork and shorten time-to-seat."
            />
          </div>
        </div>
      </section>

      {/* ✅ HOW IT WORKS (this fixes your broken nav link) */}
      <section id="how-it-works" className="py-28 border-t border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            kicker="How it works"
            title="Three steps. That’s it."
            subtitle="Drivers stay private. Recruiters unlock only when they’re ready to move forward."
          />

          <div className="grid md:grid-cols-3 gap-10 mt-16">
            <StepCard number="01" title="Build your profile" desc="Add experience, endorsements, and what kind of lanes you want." />
            <StepCard number="02" title="Receive real offers" desc="Carriers reach out with routes and pay—no spam job boards." />
            <StepCard number="03" title="Approve the unlock" desc="Your phone and email stay locked until you approve the match." />
          </div>
        </div>
      </section>

      {/* RECRUITERS / PRICING */}
      <section id="recruiters" className="py-28 bg-zinc-950 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase mb-5">
              Simple Pricing
            </h2>
            <p className="text-zinc-400 text-lg">
              No subscription trap. Pay only when you want to meet a driver.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <PricingCard
              title="Single Unlock"
              price="$10"
              sub="per driver"
              bullets={["Instant contact access", "Lifetime profile updates", "Direct messaging"]}
              ctaText="Browse Drivers"
              ctaHref="/drivers"
              highlight
            />
            <PricingCard
              title="Starter"
              price="$49"
              sub="/mo"
              bullets={["10 unlock credits", "Team dashboard", "Priority support"]}
              ctaText="Coming Soon"
              disabled
            />
            <PricingCard
              title="Enterprise"
              price="$199"
              sub="/mo"
              bullets={["Unlimited potential", "Custom API access", "Account manager"]}
              ctaText="Coming Soon"
              disabled
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 border-t border-zinc-100 dark:border-zinc-900">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-zinc-950 dark:bg-white rounded flex items-center justify-center font-black text-[10px] text-white dark:text-black">
              DL
            </div>
            <span className="font-black uppercase tracking-tight text-sm">Driver Leads © 2026</span>
          </div>

          <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              Legal
            </a>
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
      "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-black hover:scale-[1.02] shadow-lg",
    secondary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg",
    outline:
      "border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors",
  }

  const sizes: any = {
    sm: "px-6 py-2 text-[10px]",
    md: "px-8 py-3 text-xs",
    lg: "px-10 py-5 text-sm w-full sm:w-auto",
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${styles[variant]} ${sizes[size]} rounded-full font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all duration-300 relative`}
    >
      {children}
      {badge && (
        <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[8px] px-2 py-0.5 rounded-full ring-2 ring-white dark:ring-black font-black shadow-sm">
          {badge}
        </span>
      )}
    </motion.button>
  )
}

function SectionHeader({ kicker, title, subtitle }: any) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400 mb-5">
        {kicker}
      </p>
      <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight uppercase mb-6">
        {title}
      </h2>
      <p className="text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
        {subtitle}
      </p>
    </div>
  )
}

type FeatureCardProps = {
  Icon: LucideIcon
  title: string
  desc: string
}

function FeatureCard({ Icon, title, desc }: FeatureCardProps) {
  return (
    <div className="group">
      <div className="mb-6 text-emerald-500 group-hover:scale-110 transition-all duration-500">
        <Icon size={36} strokeWidth={1.6} />
      </div>
      <h3 className="text-lg font-black mb-3 uppercase tracking-tight">{title}</h3>
      <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{desc}</p>
    </div>
  )
}

function FieldCard({ icon, label, value }: any) {
  return (
    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
      <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
        {icon} {label}
      </div>
      <div className="font-black text-sm">{value}</div>
    </div>
  )
}

function StepCard({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="rounded-[2rem] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8">
      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
        Step {number}
      </div>
      <div className="mt-4 text-xl font-black tracking-tight">{title}</div>
      <p className="mt-3 text-zinc-600 dark:text-zinc-300 leading-relaxed">{desc}</p>
    </div>
  )
}

function PricingCard({ title, price, sub, bullets, ctaText, ctaHref, highlight, disabled }: any) {
  return (
    <div
      className={[
        "relative p-12 rounded-[2.5rem] border transition-all duration-500",
        highlight
          ? "bg-white text-black border-transparent shadow-2xl"
          : "border-zinc-800 bg-transparent text-white/90",
      ].join(" ")}
    >
      <h3
        className={`text-xs font-black uppercase tracking-[0.3em] mb-7 ${
          highlight ? "text-zinc-500" : "text-white/60"
        }`}
      >
        {title}
      </h3>

      <div className="flex items-baseline gap-2 mb-9">
        <span className="text-6xl font-black tracking-tight">{price}</span>
        <span className={`text-sm font-bold uppercase ${highlight ? "text-zinc-500" : "text-white/40"}`}>
          {sub}
        </span>
      </div>

      <ul className="space-y-4 mb-10">
        {bullets.map((b: string) => (
          <li key={b} className="flex items-center gap-3 text-sm font-bold">
            <CheckCircle2 size={18} className={highlight ? "text-emerald-600" : "text-emerald-500"} />
            {b}
          </li>
        ))}
      </ul>

      {disabled ? (
        <div className="w-full py-5 rounded-2xl bg-zinc-800 text-zinc-400 text-center text-xs font-black uppercase tracking-widest">
          {ctaText}
        </div>
      ) : (
        <a
          href={ctaHref}
          className={[
            "block w-full py-5 rounded-2xl text-center text-xs font-black uppercase tracking-widest transition-transform hover:scale-[1.02] shadow-lg",
            highlight ? "bg-zinc-900 text-white" : "bg-white text-black",
          ].join(" ")}
        >
          {ctaText}
        </a>
      )}
    </div>
  )
}
