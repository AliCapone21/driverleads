// src/components/HomeClient.tsx

"use client"

import React, { useEffect, useMemo, useState } from "react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { AnimatePresence, motion } from "framer-motion"
import { createClient } from "@/utils/supabase/client"
import { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

/* --- Animation Settings --- */
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]
const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease } },
}
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

export default function HomeClient() {
  const router = useRouter()
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
        const { data } = await Promise.race([
          supabase.auth.getUser(),
          new Promise((_, reject) => setTimeout(() => reject("Timeout"), 3000)),
        ]) as any

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

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
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

    const handleWindowScroll = () => setIsScrolled(window.scrollY > 20)
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
    <main className="min-h-screen relative font-sans text-zinc-900 dark:text-zinc-100 selection:bg-emerald-500 selection:text-white transition-colors duration-300">
      
      {/* --- GLASS BACKGROUND LAYER --- */}
      <div className="fixed inset-0 -z-50 h-full w-full bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-300/30 rounded-full blur-[120px] mix-blend-multiply dark:hidden animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-300/30 rounded-full blur-[120px] mix-blend-multiply dark:hidden animate-pulse-slow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] hidden dark:block" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-600/20 rounded-full blur-[120px] hidden dark:block" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 dark:opacity-10 mix-blend-overlay pointer-events-none"></div>
      </div>

      {/* HEADER */}
      <header className="fixed top-0 w-full z-50">
        <motion.div
          animate={{ y: 0, opacity: 1 }}
          initial={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.6, ease }}
          className={`transition-all duration-300 border-b ${
            isScrolled
              ? "bg-white/60 dark:bg-zinc-950/60 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-sm py-3"
              : "bg-transparent border-transparent py-5"
          }`}
        >
          <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2.5 group z-50">
              <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-300 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105">
                <span className="font-black text-sm text-white dark:text-zinc-950">DL</span>
              </div>
              <span className="font-bold tracking-tight text-lg text-zinc-900 dark:text-white">
                Driver Leads
              </span>
            </a>

            <nav className="hidden md:flex items-center bg-white/40 dark:bg-black/40 rounded-full px-8 py-2 border border-white/40 dark:border-white/10 backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-8">
                {navItems.map(({ label, id }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={(e) => handleScroll(e, id)}
                    className="text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />

              {authReady && user && (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-500 p-[2px] shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
                  >
                    <div className="h-full w-full rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center">
                      <span className="font-bold text-sm text-zinc-800 dark:text-white">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {menuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-3 w-72 rounded-2xl border border-white/50 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl p-2 shadow-2xl z-50 overflow-hidden"
                        >
                          <div className="px-4 py-3">
                            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Signed in as</p>
                            <p className="text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100">{user.email}</p>
                            {isDriver ? (
                              <span className="inline-flex mt-2 items-center rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20">
                                Driver Account
                              </span>
                            ) : (
                              <span className="inline-flex mt-2 items-center rounded-md bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-400 ring-1 ring-inset ring-indigo-600/20">
                                Recruiter Account
                              </span>
                            )}
                          </div>

                          <div className="border-t border-zinc-200/50 dark:border-white/10 py-1">
                             <button
                              onClick={handleSignOut}
                              disabled={navigating}
                              className="w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-white/5 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-2"
                            >
                              {navigating ? <span className="h-3 w-3 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin"/> : null}
                              Sign Out
                            </button>
                          </div>

                          <div className="border-t border-zinc-200/50 dark:border-white/10 p-2 mt-1">
                            <a 
                              href={isDriver ? "/drivers/dashboard" : "/recruiter/settings"} 
                              className="block w-full text-center py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold hover:opacity-90 transition-opacity shadow-lg"
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
                    className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-white/50 dark:hover:bg-white/10 transition-all"
                  >
                    Log In
                  </a>
                  <a href="/join">
                    <ActionBtn variant="primary" size="sm">
                      Driver Sign Up
                    </ActionBtn>
                  </a>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 sm:pt-48 sm:pb-32 overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 relative z-10">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-900/10 dark:border-white/10 bg-white/40 dark:bg-zinc-800/40 backdrop-blur-md shadow-sm text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-8 hover:scale-105 transition-transform cursor-default"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Over 500+ carriers recruiting now
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-7xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1] mb-8 drop-shadow-sm"
            >
              Stop searching for loads. <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-indigo-500">
                Let the offers find you.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-xl sm:text-2xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto font-medium"
            >
              Higher salary. Better routes. No subscription fees.
              Create your profile once and get offers sent directly to your phone.
            </motion.p>

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
                className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
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
                  <a href="/drivers/dashboard" className="w-full sm:w-auto">
                    <ActionBtn variant="secondary" size="lg">
                      Go to Dashboard
                    </ActionBtn>
                  </a>
                )}
              </motion.div>
            )}

            <motion.div
              variants={fadeUp}
              className="mt-16 pt-8 border-t border-zinc-900/5 dark:border-white/5 flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600"
            >
              <span>Trusted by drivers from</span>
              <span className="text-zinc-900 dark:text-zinc-300">FedEx Custom Critical</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-zinc-900 dark:text-zinc-300">Landstar</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-zinc-900 dark:text-zinc-300">JB Hunt</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="benefits" className="py-24 relative">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-8">
            <GlassCard
              icon="💰"
              title="Higher Salary"
              desc="Drivers on our platform earn 20% more on average because carriers compete for YOU."
            />
            <GlassCard
              icon="🔒"
              title="Private & Secure"
              desc="Your contact info is hidden. Recruiters only see it if you accept their connection request."
            />
            <GlassCard
              icon="⚡"
              title="Instant Offers"
              desc="Stop calling dispatchers. Get job offers sent directly to your phone via SMS."
            />
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-32 relative">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}>
            <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Get hired in 3 steps
              </h2>
              <p className="mt-4 text-xl text-zinc-500 dark:text-zinc-400">
                We made it easier than applying for a loan.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent z-0" />
              <StepCard n="1" title="Create Profile" desc="Fill out a simple form about your experience and truck type." />
              <StepCard n="2" title="Wait for Offers" desc="We show your profile to 500+ top rated US carriers." />
              <StepCard n="3" title="Accept & Drive" desc="Choose the offer with the highest pay per mile. No fees." />
            </div>

            {authReady && !user && (
              <motion.div variants={fadeUp} className="mt-20 flex justify-center">
                <a href="/join">
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
      <section id="recruiters" className="py-32 relative">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}>
            <motion.div variants={fadeUp} className="text-center max-w-3xl mx-auto mb-20">
              <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4 border border-indigo-100 dark:border-indigo-500/20">
                For Companies
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Recruiter Access
              </h2>
              <p className="mt-4 text-xl text-zinc-500 dark:text-zinc-400">
                Are you a carrier? Stop paying subscription fees.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 items-start relative z-10">
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
            </div>

            <motion.div variants={fadeUp} className="mt-12 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Drivers:</span> You never pay. Joining is 100% free for you.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-zinc-200 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl pt-20 pb-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 font-bold">DL</div>
                <span className="font-bold text-lg text-zinc-900 dark:text-white">Driver Leads</span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Connecting professional drivers with the best carriers in the USA.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-zinc-900 dark:text-white mb-6">Platform</h4>
              <ul className="space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
                <li><a href="#benefits" className="hover:text-emerald-500 transition-colors">Benefits</a></li>
                <li><a href="#how-it-works" className="hover:text-emerald-500 transition-colors">How it Works</a></li>
                <li><a href="/drivers" className="hover:text-emerald-500 transition-colors">Browse Drivers</a></li>
                <li><a href="/join" className="hover:text-emerald-500 transition-colors">Sign Up</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-zinc-900 dark:text-white mb-6">Company</h4>
              <ul className="space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
                <li><a href="#" className="hover:text-emerald-500 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-zinc-900 dark:text-white mb-6">Legal</h4>
              <ul className="space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-200 dark:border-white/10 text-xs text-zinc-400 flex flex-col md:flex-row justify-between items-center gap-4">
            <span>© {new Date().getFullYear()} Driver Leads Inc. All rights reserved.</span>
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
  arrow
}: any) {

  const variants: any = {
    primary: "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 border-transparent",
    secondary: "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl hover:opacity-90 border-transparent",
    outline: "bg-white/50 dark:bg-white/5 border-zinc-200 dark:border-white/20 text-zinc-900 dark:text-white hover:bg-white dark:hover:bg-white/10 backdrop-blur-sm",
    ghost: "bg-transparent text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border-transparent"
  }

  const sizes: any = {
    sm: "px-5 py-2 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg w-full sm:w-auto"
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`
        relative rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 border
        ${variants[variant]} ${sizes[size]}
        ${loading ? "opacity-70 cursor-not-allowed" : ""}
      `}
    >
      {loading ? (
        <span className={`h-5 w-5 border-2 rounded-full animate-spin border-t-transparent ${variant === 'outline' ? 'border-zinc-900 dark:border-white' : 'border-white dark:border-zinc-900'}`} />
      ) : (
        <>
          {children}
          {arrow && <span className="text-xl leading-none mb-0.5 ml-1">→</span>}
          {badge && (
            <span className="absolute -top-3 -right-3 bg-white text-emerald-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm border border-emerald-100 transform rotate-12">
              {badge}
            </span>
          )}
        </>
      )}
    </motion.button>
  )
}

function GlassCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <motion.div 
      variants={fadeUp} 
      className="text-center p-8 rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/50 dark:border-white/10 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5"
    >
      <div className="text-5xl mb-6 filter drop-shadow-sm">{icon}</div>
      <h3 className="text-lg font-bold mb-3 text-zinc-900 dark:text-white">{title}</h3>
      <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm">{desc}</p>
    </motion.div>
  )
}

function StepCard({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-8 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500 group z-10 border border-white/50 dark:border-white/10"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="h-10 w-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-500">
          {n}
        </div>
        <div className="text-lg font-bold text-zinc-900 dark:text-white">{title}</div>
      </div>
      <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-base">{desc}</p>
    </motion.div>
  )
}

function PricingCard({ title, price, sub, bullets, ctaText, ctaHref, highlight, disabled }: any) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={disabled ? {} : { y: -6 }}
      transition={{ duration: 0.3 }}
      className={[
        "rounded-3xl p-8 transition-all duration-500 flex flex-col h-full relative overflow-hidden backdrop-blur-xl",
        highlight
          ? "bg-zinc-900/95 dark:bg-white/95 text-white dark:text-zinc-900 shadow-2xl shadow-zinc-900/20 md:scale-105 z-10 ring-1 ring-zinc-900/10"
          : "bg-white/60 dark:bg-zinc-900/60 border border-white/50 dark:border-white/10 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl",
        disabled ? "opacity-60 grayscale-[0.5]" : "",
      ].join(" ")}
    >
      {highlight && (
        <div className="absolute top-0 right-0 p-3 bg-gradient-to-bl from-emerald-500/20 to-transparent rounded-bl-3xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 dark:text-emerald-600">Best Value</span>
        </div>
      )}

      <div className="text-lg font-bold opacity-90">{title}</div>
      <div className="mt-4 flex items-baseline">
        <span className="text-5xl font-extrabold tracking-tight">{price}</span>
        <span className={`ml-2 text-sm ${highlight ? "opacity-70" : "text-zinc-500 dark:text-zinc-400"}`}>{sub}</span>
      </div>

      <ul className="mt-8 space-y-4 text-sm flex-1">
        {bullets.map((b: string) => (
          <li key={b} className="flex gap-3 items-start">
            <svg
              className={`w-5 h-5 flex-shrink-0 ${highlight ? "text-emerald-400 dark:text-emerald-600" : "text-emerald-500"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className={highlight ? "opacity-90" : "text-zinc-600 dark:text-zinc-400"}>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        {disabled ? (
          <span className="block w-full py-3 rounded-xl text-center text-sm font-bold bg-zinc-100/50 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-transparent">
            {ctaText}
          </span>
        ) : (
          <motion.a
            href={ctaHref}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={[
              "block w-full py-3 rounded-xl text-center text-sm font-bold transition-all duration-300",
              highlight
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 shadow-lg",
            ].join(" ")}
          >
            {ctaText}
          </motion.a>
        )}
      </div>
    </motion.div>
  )
}