// src/components/HomeClient.tsx
"use client"

import React, { useEffect, useMemo, useState } from "react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { AnimatePresence, motion } from "framer-motion"
import { createClient } from "@/utils/supabase/client"
import { User } from "@supabase/supabase-js"
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Gauge,
  Lock,
  ShieldCheck,
  Sparkles,
  Truck,
  Zap,
  Mail,
  Phone,
  User as UserIcon,
  Award,
  Clock3,
} from "lucide-react"

/* --- Animation Settings --- */
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]
const fadeUp = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease } },
}
const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease } },
}
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

export default function HomeClient() {
  const supabase = createClient()

  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isDriver, setIsDriver] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [navigating, setNavigating] = useState(false)
  const [authReady, setAuthReady] = useState(false)

  // Check Login Status on Mount
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
        console.warn("Auth check timed out or failed", error)
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

    const handleWindowScroll = () => setIsScrolled(window.scrollY > 12)
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

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) element.scrollIntoView({ behavior: "smooth" })
  }

  const navItems = useMemo(
    () =>
      ["Benefits", "How it works", "Recruiters"].map((item) => ({
        label: item,
        id: item.toLowerCase().replace(/\s+/g, "-"),
      })),
    []
  )

  return (
    <main className="min-h-screen relative font-sans text-zinc-950 dark:text-zinc-50 selection:bg-emerald-500 selection:text-white">
      {/* --- PREMIUM DASHBOARD BACKDROP --- */}
      <div className="fixed inset-0 -z-50">
        <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500" />
        <div className="absolute -top-24 -right-20 h-[560px] w-[560px] rounded-full bg-emerald-400/20 blur-[120px] dark:bg-emerald-400/12" />
        <div className="absolute -bottom-28 -left-24 h-[620px] w-[620px] rounded-full bg-indigo-400/20 blur-[130px] dark:bg-indigo-400/12" />
        <div className="absolute inset-0 opacity-[0.55] dark:opacity-[0.35]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:44px_44px]" />
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-20 dark:opacity-10 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* HEADER */}
      <header className="fixed top-0 w-full z-50">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55, ease }}
          className={[
            "transition-all duration-300",
            "border-b",
            isScrolled
              ? "bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-zinc-200/60 dark:border-white/10 shadow-sm"
              : "bg-transparent border-transparent",
          ].join(" ")}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
            <a href="/" className="flex items-center gap-3 group">
              <div className="relative h-10 w-10 overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-950 to-zinc-700 dark:from-white dark:to-zinc-200 flex items-center justify-center shadow-sm ring-1 ring-black/5 dark:ring-white/10 transition-transform duration-300 group-hover:scale-[1.03]">
                <span className="font-black text-sm text-white dark:text-zinc-950">DL</span>
                <div className="absolute -right-3 -top-3 h-10 w-10 rounded-full bg-emerald-500/30 blur-xl" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-extrabold tracking-tight text-base sm:text-lg text-zinc-950 dark:text-white">
                  Driver Leads
                </span>
                <span className="hidden sm:block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Offers-first recruiting
                </span>
              </div>
            </a>

            <nav className="hidden md:flex items-center">
              <div className="flex items-center gap-1.5 rounded-full border border-zinc-200/70 dark:border-white/10 bg-white/60 dark:bg-zinc-900/50 backdrop-blur-xl px-2 py-1 shadow-sm">
                {navItems.map(({ label, id }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={(e) => handleScroll(e, id)}
                    className="px-4 py-2 rounded-full text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-white/5 transition-colors"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </nav>

            <div className="flex items-center gap-2.5">
              <ThemeToggle />

              {authReady && user && (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-500 p-[2px] shadow-sm hover:shadow-emerald-500/20 transition-all duration-300"
                    aria-label="Account menu"
                  >
                    <div className="h-full w-full rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center ring-1 ring-black/5 dark:ring-white/10">
                      <span className="font-extrabold text-sm text-zinc-800 dark:text-white">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {menuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.97 }}
                          transition={{ duration: 0.18, ease }}
                          className="absolute right-0 mt-3 w-[320px] rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/85 dark:bg-zinc-900/80 backdrop-blur-2xl p-2 shadow-2xl z-50 overflow-hidden"
                        >
                          <div className="px-4 py-3">
                            <p className="text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                              Signed in as
                            </p>
                            <p className="text-sm font-semibold truncate text-zinc-950 dark:text-zinc-100">
                              {user.email}
                            </p>

                            <div className="mt-2 flex items-center gap-2">
                              <span
                                className={[
                                  "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold ring-1 ring-inset",
                                  isDriver
                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-600/20"
                                    : "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 ring-indigo-600/20",
                                ].join(" ")}
                              >
                                {isDriver ? (
                                  <>
                                    <Truck className="h-3.5 w-3.5" />
                                    Driver Account
                                  </>
                                ) : (
                                  <>
                                    <Building2 className="h-3.5 w-3.5" />
                                    Recruiter Account
                                  </>
                                )}
                              </span>

                              <span className="ml-auto inline-flex items-center gap-1 rounded-xl bg-zinc-100/70 dark:bg-white/5 px-2 py-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 ring-1 ring-black/5 dark:ring-white/10">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Secure
                              </span>
                            </div>
                          </div>

                          <div className="border-t border-zinc-200/70 dark:border-white/10 py-1">
                            <button
                              onClick={handleSignOut}
                              disabled={navigating}
                              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-white/5 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-2 rounded-xl"
                            >
                              {navigating ? (
                                <span className="h-3.5 w-3.5 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" />
                              ) : null}
                              Sign Out
                            </button>
                          </div>

                          <div className="border-t border-zinc-200/70 dark:border-white/10 p-2 mt-1">
                            <a
                              href={isDriver ? "/drivers/dashboard" : "/recruiter/settings"}
                              className="block w-full text-center py-2.5 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-sm font-extrabold hover:opacity-95 transition-opacity shadow-sm"
                            >
                              {isDriver ? "My Dashboard" : "Edit Settings"}
                            </a>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {authReady && !user && (
                <div className="flex items-center gap-2">
                  <a
                    href="/login"
                    className="hidden sm:inline-flex px-4 py-2 rounded-2xl text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-white/60 dark:hover:bg-white/5 border border-transparent hover:border-zinc-200/70 dark:hover:border-white/10 transition-all"
                  >
                    Log In
                  </a>
                  <a href="/join">
                    <ActionBtn variant="primary" size="sm" iconRight={<ArrowRight className="h-4 w-4" />}>
                      Driver Sign Up
                    </ActionBtn>
                  </a>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </header>

      {/* HERO */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left: copy */}
            <motion.div variants={stagger} initial="hidden" animate="show" className="lg:col-span-6">
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 dark:border-white/10 bg-white/60 dark:bg-zinc-900/50 backdrop-blur-xl px-3 py-1.5 shadow-sm"
              >
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                  Over <span className="text-zinc-950 dark:text-white">500+</span> carriers recruiting now
                </span>
                <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-950 dark:text-white leading-[1.05]"
              >
                Stop searching for loads.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-indigo-500">
                  Let the offers find you.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-5 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl"
              >
                Higher salary. Better routes. No subscription fees.
                Create your profile once and recruiters will reach out directly.
              </motion.p>

              {/* ✅ KEEP YOUR ORIGINAL CTA LOGIC EXACTLY */}
              {!authReady && (
                <div className="mt-12 flex justify-center opacity-50">
                  <div className="h-6 w-6 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

     {authReady && (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    /* Changed flex-col to flex-wrap to allow children to break to new lines */
    className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6"
  >
    <a href="/join" className="w-full sm:w-auto">
      <ActionBtn variant="primary" size="lg" badge="Free">
        Join as Driver
      </ActionBtn>
    </a>

    <a href="/drivers" className="w-full sm:w-auto">
      <ActionBtn variant="outline" size="lg">
        I'm a Recruiter
      </ActionBtn>
    </a>

    {user && isDriver && (
      /* w-full forces this container to take up the whole row, pushing it down */
      /* lg:justify-start ensures it aligns left on desktop to match your parent class */
      <div className="w-full flex justify-center lg:justify-start">
        <a href="/drivers/dashboard" className="w-full sm:w-auto">
          <ActionBtn variant="secondary" size="lg">
            Go to Dashboard
          </ActionBtn>
        </a>
      </div>
    )}
  </motion.div>
)}

              <motion.div
                variants={fadeUp}
                className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600"
              >
                <span className="inline-flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4" />
                  Trusted by drivers from
                </span>
                <span className="text-zinc-950 dark:text-zinc-200">FedEx Custom Critical</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-zinc-950 dark:text-zinc-200">Landstar</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-zinc-950 dark:text-zinc-200">JB Hunt</span>
              </motion.div>
            </motion.div>

            {/* Right: MVP profile preview */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="lg:col-span-6">
              <div className="rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/60 dark:bg-zinc-900/50 backdrop-blur-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200/70 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shadow-sm">
                      <Sparkles className="h-4.5 w-4.5" />
                    </div>
                    <div className="leading-tight">
                      <div className="text-sm font-extrabold text-zinc-950 dark:text-white">Driver profile preview</div>
                      <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Current fields (MVP)</div>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-3 py-1 text-xs font-bold ring-1 ring-inset ring-emerald-600/20">
                    <CheckCircle2 className="h-4 w-4" />
                    Clean & simple
                  </div>
                </div>

                <div className="p-5">
                  <div className="rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-zinc-950/20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-zinc-200/70 dark:border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-500 p-[2px] shadow-sm">
                          <div className="h-full w-full rounded-2xl bg-white dark:bg-zinc-950 flex items-center justify-center text-xs font-black text-zinc-900 dark:text-white">
                            JD
                          </div>
                        </div>
                        <div className="leading-tight">
                          <div className="text-sm font-extrabold text-zinc-950 dark:text-white">John Driver</div>
                          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                            Public info (before contact unlock)
                          </div>
                        </div>
                      </div>

                      <span className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-zinc-100/70 dark:bg-white/5 px-2 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-200 ring-1 ring-black/5 dark:ring-white/10">
                        <Lock className="h-3.5 w-3.5" />
                        Contact gated
                      </span>
                    </div>

                    <div className="p-4">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <FieldCard icon={<UserIcon className="h-4.5 w-4.5" />} label="Age" value="—" hint="from driver form" />
                        <FieldCard icon={<Clock3 className="h-4.5 w-4.5" />} label="Experience" value="—" hint="years" />
                        <FieldCard icon={<Award className="h-4.5 w-4.5" />} label="Endorsements" value="—" hint="Hazmat / TWIC / etc" />
                        <FieldCard icon={<Mail className="h-4.5 w-4.5" />} label="Email" value="Hidden" hint="unlock to view" />
                        <FieldCard icon={<Phone className="h-4.5 w-4.5" />} label="Phone" value="Hidden" hint="unlock to view" />
                        <FieldCard icon={<ShieldCheck className="h-4.5 w-4.5" />} label="Contact access" value="Approval-based" hint="driver control" />
                      </div>

                      <div className="mt-4 rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4">
                        <div className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          MVP flow
                        </div>
                        <div className="mt-3 grid gap-2">
                          <PreviewLine text="Drivers join for free and publish a clean profile." />
                          <PreviewLine text="Recruiters browse and request contact access." />
                          <PreviewLine text="After unlock, recruiters contact drivers directly." />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid sm:grid-cols-2 gap-3">
                    <MiniCard
                      icon={<ShieldCheck className="h-4.5 w-4.5" />}
                      title="No spam recruiting"
                      desc="Recruiters unlock contact info only after approval."
                    />
                    <MiniCard
                      icon={<Gauge className="h-4.5 w-4.5" />}
                      title="Simple, readable UX"
                      desc="Clean profile, clean offers, clean decision."
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="benefits" className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            kicker="Benefits"
            title="Designed like a modern marketplace"
            subtitle="A clean experience that keeps drivers in control — while giving recruiters what they need."
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid md:grid-cols-3 gap-4 sm:gap-6"
          >
            <FeatureCard
              icon={<Zap className="h-5 w-5" />}
              title="Instant Offers"
              desc="Stop calling dispatchers. Recruiters reach out after contact unlock."
            />
            <FeatureCard
              icon={<Lock className="h-5 w-5" />}
              title="Privacy-first"
              desc="Your email and phone stay hidden until you approve access."
            />
            <FeatureCard
              icon={<BadgeCheck className="h-5 w-5" />}
              title="Quality Profiles"
              desc="Standardized driver fields reduce noise and speed up hiring."
            />
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            kicker="How it works"
            title="Get hired in 3 clear steps"
            subtitle="Fast onboarding, premium UI, and no clutter — like a real SaaS dashboard."
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="relative"
          >
            <div className="hidden md:block absolute left-0 right-0 top-10 h-px bg-gradient-to-r from-transparent via-zinc-300/70 dark:via-zinc-700/70 to-transparent" />

            <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
              <StepCard n="1" icon={<Truck className="h-5 w-5" />} title="Create Profile" desc="Add contact, age, experience, and endorsements." />
              <StepCard n="2" icon={<Building2 className="h-5 w-5" />} title="Get Discovered" desc="Recruiters browse and request contact access." />
              <StepCard n="3" icon={<Zap className="h-5 w-5" />} title="Talk & Hire" desc="After unlock, recruiters contact you directly." />
            </div>

            {authReady && !user && (
              <motion.div variants={fadeUp} className="mt-8 sm:mt-10 flex justify-center">
                <a href="/join" className="w-full sm:w-auto">
                  <ActionBtn variant="primary" size="lg" arrow>
                    Start Your Profile
                  </ActionBtn>
                </a>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* RECRUITER PRICING */}
      <section id="recruiters" className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            kicker="For companies"
            title="Recruiter access, simplified"
            subtitle="Unlock qualified drivers without subscriptions. Clean billing, clean workflows."
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid md:grid-cols-3 gap-4 sm:gap-6 items-stretch"
          >
            <PricingCard
              title="Pay as you go"
              price="$10"
              sub="per unlock"
              bullets={["Unlock contacts instantly", "Lifetime access to profile", "Direct PDF Downloads", "No monthly commitment"]}
              ctaText="Browse Drivers"
              ctaHref="/drivers"
              highlight
            />
            <PricingCard
              title="Starter"
              price="$49"
              sub="per month"
              bullets={["Includes 10 unlock credits", "Team usage tracking", "Priority support", "Rollover credits"]}
              ctaText="Coming Soon"
              ctaHref="#"
              disabled
            />
            <PricingCard
              title="Pro"
              price="$199"
              sub="per month"
              bullets={["Includes 50 unlock credits", "Admin dashboard + exports", "Dedicated account manager", "API Access"]}
              ctaText="Coming Soon"
              ctaHref="#"
              disabled
            />
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-8">
            <div className="rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/60 dark:bg-zinc-900/50 backdrop-blur-xl shadow-sm px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">Drivers:</span> you never pay.
                Joining is 100% free.
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                <ShieldCheck className="h-4 w-4" />
                Secure payments & access controls
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-zinc-200/70 dark:border-white/10 bg-white/55 dark:bg-zinc-950/40 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-2xl bg-zinc-950 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 font-extrabold shadow-sm">
                  DL
                </div>
                <div className="leading-tight">
                  <div className="font-extrabold text-lg text-zinc-950 dark:text-white">Driver Leads</div>
                  <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">SaaS-grade recruiting</div>
                </div>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Connecting professional drivers with top carriers — with privacy-first, dashboard-style UX.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-zinc-950 dark:text-white mb-5">Platform</h4>
              <ul className="space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
                <li><a href="#benefits" className="hover:text-emerald-500 transition-colors">Benefits</a></li>
                <li><a href="#how-it-works" className="hover:text-emerald-500 transition-colors">How it Works</a></li>
                <li><a href="/drivers" className="hover:text-emerald-500 transition-colors">Browse Drivers</a></li>
                <li><a href="/join" className="hover:text-emerald-500 transition-colors">Sign Up</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-zinc-950 dark:text-white mb-5">Company</h4>
              <ul className="space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
                <li><a href="#" className="hover:text-emerald-500 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-zinc-950 dark:text-white mb-5">Legal</h4>
              <ul className="space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-200/70 dark:border-white/10 text-xs text-zinc-500 dark:text-zinc-400 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span>© {new Date().getFullYear()} Driver Leads Inc. All rights reserved.</span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Built with privacy-first design
            </span>
          </div>
        </div>
      </footer>
    </main>
  )
}

/* --- REUSABLE COMPONENTS --- */

function ActionBtn({
  children,
  onClick,
  loading,
  variant = "primary",
  size = "md",
  badge,
  arrow,
  iconLeft,
  iconRight,
}: any) {
  const variants: any = {
    primary:
      "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-sm hover:shadow-emerald-500/20 border-transparent",
    secondary:
      "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-sm hover:opacity-95 border-transparent",
    outline:
      "bg-white/70 dark:bg-white/5 border-zinc-200/70 dark:border-white/10 text-zinc-950 dark:text-white hover:bg-white dark:hover:bg-white/10 backdrop-blur-xl shadow-sm",
    ghost:
      "bg-transparent text-zinc-950 dark:text-white hover:bg-zinc-100/70 dark:hover:bg-white/5 border-transparent",
  }

  const sizes: any = {
    sm: "px-5 py-2 text-sm rounded-2xl",
    md: "px-6 py-2.5 text-base rounded-2xl",
    lg: "px-8 py-3.5 text-lg rounded-2xl w-full sm:w-auto",
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={[
        "relative font-extrabold transition-all duration-250 flex items-center justify-center gap-2 border",
        sizes[size],
        variants[variant],
        loading ? "opacity-70 cursor-not-allowed" : "",
      ].join(" ")}
    >
      {loading ? (
        <span
          className={[
            "h-5 w-5 border-2 rounded-full animate-spin border-t-transparent",
            variant === "outline" ? "border-zinc-950 dark:border-white" : "border-white dark:border-zinc-950",
          ].join(" ")}
        />
      ) : (
        <>
          {iconLeft ? <span className="shrink-0">{iconLeft}</span> : null}
          <span className="whitespace-nowrap">{children}</span>
          {arrow && <span className="text-xl leading-none mb-0.5 ml-1">→</span>}
          {iconRight ? <span className="shrink-0">{iconRight}</span> : null}

          {badge && (
            <span className="absolute -top-3 -right-3 bg-white text-emerald-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm border border-emerald-100 transform rotate-12">
              {badge}
            </span>
          )}
        </>
      )}
    </motion.button>
  )
}

function SectionHeader({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-8 sm:mb-10">
      <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 dark:border-white/10 bg-white/60 dark:bg-zinc-900/50 backdrop-blur-xl px-3 py-1.5 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-600 dark:text-zinc-300">
          {kicker}
        </span>
      </div>
      <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white">{title}</h2>
      <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">{subtitle}</p>
    </motion.div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl bg-white/60 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/70 dark:border-white/10 shadow-sm hover:shadow-md hover:border-emerald-500/30 dark:hover:border-emerald-500/25 transition-all p-6"
    >
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-zinc-950 dark:text-white">{title}</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{desc}</p>
        </div>
      </div>
    </motion.div>
  )
}

function StepCard({ n, icon, title, desc }: { n: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="relative rounded-2xl bg-white/60 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/70 dark:border-white/10 shadow-sm hover:shadow-md transition-all p-6"
    >
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <div className="h-10 w-10 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shadow-sm">
            {icon}
          </div>
          <div className="text-sm font-extrabold text-zinc-950 dark:text-white">{title}</div>
        </div>

        <div className="h-9 w-9 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-600/20 flex items-center justify-center font-black">
          {n}
        </div>
      </div>

      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{desc}</p>
    </motion.div>
  )
}

function MiniCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/60 dark:bg-zinc-900/50 backdrop-blur-xl shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <div>
          <div className="text-sm font-extrabold text-zinc-950 dark:text-white">{title}</div>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{desc}</div>
        </div>
      </div>
    </div>
  )
}

function FieldCard({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-sm font-extrabold text-zinc-950 dark:text-white">
          <span className="h-8 w-8 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shadow-sm">
            {icon}
          </span>
          {label}
        </div>
        <div className="text-right">
          <div className="text-sm font-extrabold text-zinc-950 dark:text-white">{value}</div>
          {hint ? <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{hint}</div> : null}
        </div>
      </div>
    </div>
  )
}

function PreviewLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-600/20">
        <CheckCircle2 className="h-3.5 w-3.5" />
      </span>
      <span className="leading-relaxed">{text}</span>
    </div>
  )
}

function PricingCard({ title, price, sub, bullets, ctaText, ctaHref, highlight, disabled }: any) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={disabled ? {} : { y: -4 }}
      transition={{ duration: 0.25 }}
      className={[
        "rounded-2xl p-6 flex flex-col h-full relative overflow-hidden backdrop-blur-xl border shadow-sm transition-all",
        highlight
          ? "bg-zinc-950/95 dark:bg-white/95 text-white dark:text-zinc-950 border-zinc-950/10 dark:border-white/10 shadow-lg"
          : "bg-white/60 dark:bg-zinc-900/50 border-zinc-200/70 dark:border-white/10 hover:shadow-md",
        disabled ? "opacity-60 grayscale-[0.45]" : "",
      ].join(" ")}
    >
      {highlight && (
        <div className="absolute top-0 right-0 p-3 bg-gradient-to-bl from-emerald-500/25 to-transparent rounded-bl-2xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 dark:text-emerald-700">
            Best Value
          </span>
        </div>
      )}

      <div className="text-base font-extrabold opacity-95">{title}</div>

      <div className="mt-4 flex items-baseline">
        <span className="text-4xl font-black tracking-tight">{price}</span>
        <span className={`ml-2 text-sm font-semibold ${highlight ? "opacity-70" : "text-zinc-500 dark:text-zinc-400"}`}>
          {sub}
        </span>
      </div>

      <ul className="mt-6 space-y-3 text-sm flex-1">
        {bullets.map((b: string) => (
          <li key={b} className="flex gap-3 items-start">
            <span
              className={[
                "mt-0.5 h-5 w-5 rounded-xl flex items-center justify-center ring-1 ring-inset",
                highlight
                  ? "bg-emerald-500/15 text-emerald-300 dark:text-emerald-700 ring-emerald-500/20"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-600/20",
              ].join(" ")}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span className={highlight ? "opacity-90" : "text-zinc-700 dark:text-zinc-300"}>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7">
        {disabled ? (
          <span className="block w-full py-3 rounded-2xl text-center text-sm font-extrabold bg-zinc-100/70 dark:bg-zinc-800/40 text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-transparent">
            {ctaText}
          </span>
        ) : (
          <motion.a
            href={ctaHref}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={[
              "block w-full py-3 rounded-2xl text-center text-sm font-extrabold transition-all duration-200",
              highlight
                ? "bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                : "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:opacity-95",
            ].join(" ")}
          >
            {ctaText}
          </motion.a>
        )}
      </div>
    </motion.div>
  )
}
