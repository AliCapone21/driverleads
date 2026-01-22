"use client"

import React, { useEffect, useMemo, useState } from "react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { AnimatePresence, motion } from "framer-motion"
import { supabase } from "@/lib/supabaseClient"
import { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

/* --- Animation Settings --- */
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]
const fadeUp = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease } },
}
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
}

export default function HomeClient() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isDriver, setIsDriver] = useState(false) 
  const [menuOpen, setMenuOpen] = useState(false)
  const [navigating, setNavigating] = useState(false) 
   
  // Controls visibility of buttons
  const [authReady, setAuthReady] = useState(false)

  // 1. Check Login Status on Mount
  useEffect(() => {
    let mounted = true

    const checkUser = async () => {
      try {
        // ⚡️ FIX: Race Supabase against a 3-second timeout
        // If Supabase hangs (due to adblockers/network), we give up and show the page.
        const { data } = await Promise.race([
          supabase.auth.getUser(),
          new Promise((_, reject) => setTimeout(() => reject("Timeout"), 3000))
        ]) as any
        
        if (!mounted) return

        if (data?.user) {
          setUser(data.user)
          // Check if user is a driver
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

    // Listen for auth changes (sign in/out)
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
  }, [])

  const handleSignOut = async () => {
    setNavigating(true)
    await supabase.auth.signOut()
    setMenuOpen(false)
    setUser(null)
    setIsDriver(false)
    router.refresh()
    setNavigating(false)
  }

  const handleNav = (url: string) => {
    setNavigating(true)
    router.push(url)
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
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      {/* GLOBAL BACKGROUND MESH */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] dark:bg-indigo-500/20" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] dark:bg-emerald-500/20" />
        <div className="absolute inset-0 opacity-[0.09] [background-image:linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] dark:opacity-[0.05] [background-size:44px_44px]" />
      </div>

      {/* HEADER */}
      <header className="fixed top-0 w-full z-50">
        <motion.div
          animate={{ y: 0, opacity: 1 }}
          initial={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.8, ease }}
          className={`transition-all duration-300 ${
            isScrolled
              ? "bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)]/50 shadow-sm py-3"
              : "bg-transparent border-b border-transparent py-5"
          }`}
        >
          <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
            
            {/* Logo */}
            <a href="/" className="flex items-center gap-3 group">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-gradient-to-br from-[var(--foreground)] to-[var(--muted-foreground)] flex items-center justify-center group-hover:scale-[1.06] transition-transform duration-500 text-[var(--background)] shadow-lg">
                <span className="font-extrabold text-lg">DL</span>
              </div>
              <div className="leading-tight">
                <div className="font-extrabold tracking-tight text-xl text-[var(--foreground)]">Driver Leads</div>
              </div>
            </a>

            {/* Center Nav */}
            <nav className="hidden md:flex items-center bg-[var(--foreground)]/5 rounded-full px-6 py-2 border border-[var(--border)]/50 backdrop-blur-md">
              <div className="flex items-center gap-8">
                {navItems.map(({ label, id }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={(e) => handleScroll(e, id)}
                    className="cursor-pointer text-sm font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors duration-200"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </nav>

            {/* Right Side: Auth & Theme */}
            <div className="flex items-center gap-4">
              <ThemeToggle />

              {/* Show Profile if Logged In */}
              {authReady && user && (
                <div className="relative">
                  <button 
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-500 p-0.5 shadow-lg hover:scale-105 transition-transform"
                  >
                    <div className="h-full w-full rounded-full bg-[var(--background)] flex items-center justify-center">
                      <span className="font-bold text-sm text-[var(--foreground)]">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-64 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl z-50"
                      >
                        <div className="mb-4 pb-4 border-b border-[var(--border)]">
                          <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase">Signed in as</p>
                          <p className="text-sm font-semibold truncate text-[var(--foreground)]">{user.email}</p>
                          {isDriver && <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold uppercase mt-1 inline-block">Driver Account</span>}
                          {!isDriver && <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full font-bold uppercase mt-1 inline-block">Recruiter Account</span>}
                        </div>
                        
                        <div className="space-y-2">
                          {isDriver ? (
                            <button
                              onClick={() => handleNav("/drivers/dashboard")}
                              disabled={navigating}
                              className="w-full text-center py-2.5 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-sm font-bold hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
                            >
                              {navigating ? <span className="h-4 w-4 border-2 border-[var(--background)] border-t-transparent rounded-full animate-spin"/> : "Go to Dashboard"}
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleNav("/recruiter/settings")}
                              disabled={navigating}
                              className="w-full text-center py-2.5 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-sm font-bold hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
                            >
                              {navigating ? <span className="h-4 w-4 border-2 border-[var(--background)] border-t-transparent rounded-full animate-spin"/> : "Edit Info"}
                            </button>
                          )}
                          <button 
                            onClick={handleSignOut}
                            disabled={navigating}
                            className="w-full text-center py-2.5 rounded-xl border border-[var(--border)] text-[var(--foreground)] text-sm font-bold hover:bg-[var(--muted)] transition-colors flex justify-center items-center gap-2"
                          >
                            {navigating ? <span className="h-4 w-4 border-2 border-[var(--foreground)] border-t-transparent rounded-full animate-spin"/> : "Sign Out"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Show Buttons if Logged Out */}
              {authReady && !user && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleNav("/login")}
                    disabled={navigating}
                    className="hidden sm:inline-flex px-5 py-2.5 rounded-xl text-[var(--foreground)] font-bold hover:bg-[var(--muted)] transition-all text-sm border border-transparent hover:border-[var(--border)]"
                  >
                    Log In
                  </button>
                  <ActionBtn 
                     onClick={() => handleNav("/join")} 
                     loading={navigating} 
                     variant="primary"
                     size="sm"
                  >
                    Driver Sign Up
                  </ActionBtn>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-32 sm:pt-48 sm:pb-40">
        <div className="mx-auto max-w-6xl px-4 relative">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="max-w-4xl mx-auto text-center"
          >
            {/* Pill Badge */}
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--background)]/50 backdrop-blur-md shadow-sm text-xs font-medium text-[var(--muted-foreground)] mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Over 500+ carriers looking for drivers right now
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-7xl font-extrabold tracking-tight text-[var(--foreground)] leading-[1.1] mb-6"
            >
              Stop searching for loads. <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-indigo-500">
                Let the offers find you.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-xl sm:text-2xl text-[var(--muted-foreground)] leading-relaxed max-w-2xl mx-auto font-medium"
            >
              Want a higher salary as a driver in the US? Just fill up the form. 
              Big companies will find you and send you offers instantly.
            </motion.p>

            {/* --- LOADING SPINNER --- */}
            {!authReady && (
              <div className="mt-12 flex justify-center opacity-50">
                <div className="h-8 w-8 border-2 border-[var(--foreground)] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* --- BUTTONS: LOGGED OUT --- */}
            {authReady && !user && ( 
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease }}
                className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
              >
                {/* Primary: For Drivers */}
                <ActionBtn 
                  onClick={() => handleNav("/join")}
                  loading={navigating}
                  variant="primary"
                  size="lg"
                  badge="Free"
                >
                  Join as Driver
                </ActionBtn>

                {/* Secondary: For Recruiters */}
                <ActionBtn 
                  onClick={() => handleNav("/drivers")}
                  loading={navigating}
                  variant="outline"
                  size="lg"
                >
                  I'm a Recruiter
                </ActionBtn>
              </motion.div>
            )}

            {/* --- BUTTONS: LOGGED IN --- */}
            {authReady && user && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease }}
                className="mt-12 flex flex-col items-center gap-6"
              >
                {isDriver ? (
                  <ActionBtn
                    onClick={() => handleNav("/drivers/dashboard")}
                    loading={navigating}
                    variant="secondary"
                    size="lg"
                  >
                    Go to Dashboard
                  </ActionBtn>
                ) : (
                  <>
                    <ActionBtn
                      onClick={() => handleNav("/drivers")}
                      loading={navigating}
                      variant="secondary"
                      size="lg"
                    >
                      Browse Drivers
                    </ActionBtn>

                    <button
                      onClick={() => handleNav("/recruiter/settings")}
                      disabled={navigating}
                      className="text-sm font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                      Edit recruiter profile →
                    </button>
                  </>
                )}
              </motion.div>
            )}

            {/* Social Proof */}
            <motion.div
              variants={fadeUp}
              className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-4 opacity-50 grayscale mix-blend-luminosity text-sm font-bold uppercase tracking-widest"
            >
               <span>FedEx Custom Critical</span>
               <span>•</span>
               <span>Landstar</span>
               <span>•</span>
               <span>JB Hunt</span>
               <span>•</span>
               <span>Schneider</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="benefits" className="py-24 border-t border-[var(--border)] bg-[var(--background)]/50 relative">
        <div className="mx-auto max-w-6xl px-4">
           <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-10">
              <ValueCard 
                icon="💰"
                title="Higher Salary"
                desc="Drivers on our platform earn 20% more on average because carriers are competing for YOU."
              />
              <ValueCard 
                icon="🔒"
                title="Private & Secure"
                desc="Your contact info is hidden. Recruiters only see it if you accept their connection request."
              />
              <ValueCard 
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
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10% 0px" }}>
            <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--foreground)]">
                Get hired in 3 steps
              </h2>
              <p className="mt-4 text-xl text-[var(--muted-foreground)]">
                We made it easier than applying for a loan.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent z-0" />
              <StepCard n="1" title="Create Profile" desc="Fill out a simple form about your experience and truck type." />
              <StepCard n="2" title="Wait for Offers" desc="We show your profile to 500+ top rated US carriers." />
              <StepCard n="3" title="Accept & Drive" desc="Choose the offer with the highest pay per mile. No fees." />
            </div>

            {/* Bottom CTA (Only for logged out) */}
            {authReady && !user && (
              <motion.div variants={fadeUp} className="mt-20 flex justify-center">
                <ActionBtn 
                  onClick={() => handleNav("/join")}
                  loading={navigating}
                  variant="primary"
                  size="lg"
                  arrow
                >
                  Start Your Profile
                </ActionBtn>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* RECRUITER PRICING */}
      <section id="recruiters" className="py-32 relative border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10% 0px" }}>
            <motion.div variants={fadeUp} className="text-center max-w-3xl mx-auto mb-20">
              <div className="inline-block px-3 py-1 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] text-xs font-bold uppercase tracking-widest mb-4">
                For Companies
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--foreground)]">
                Recruiter Access
              </h2>
              <p className="mt-4 text-xl text-[var(--muted-foreground)]">
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
              <p className="text-sm text-[var(--muted-foreground)]">
                <span className="font-bold text-emerald-500">Drivers:</span> You never pay. Joining is 100% free for you.
              </p>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* UPDATED FOOTER */}
      <footer className="relative z-10 border-t border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl pt-20 pb-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                 <div className="h-8 w-8 rounded-lg bg-[var(--foreground)] flex items-center justify-center text-[var(--background)] font-bold">DL</div>
                 <span className="font-bold text-lg">Driver Leads</span>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Connecting professional drivers with the best carriers in the USA.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-[var(--muted-foreground)]">
                <li><a href="#benefits" className="hover:text-[var(--foreground)] transition-colors">Benefits</a></li>
                <li><a href="#how-it-works" className="hover:text-[var(--foreground)] transition-colors">How it Works</a></li>
                <li><a href="/drivers" className="hover:text-[var(--foreground)] transition-colors">Browse Drivers</a></li>
                <li><a href="/join" className="hover:text-[var(--foreground)] transition-colors">Sign Up</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-[var(--muted-foreground)]">
                <li><a href="#" className="hover:text-[var(--foreground)] transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-[var(--foreground)] transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-[var(--foreground)] transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-[var(--foreground)] transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-[var(--muted-foreground)]">
                <li><a href="#" className="hover:text-[var(--foreground)] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[var(--foreground)] transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[var(--foreground)] transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)] flex flex-col md:flex-row justify-between items-center gap-4">
            <span>© {new Date().getFullYear()} Driver Leads Inc. All rights reserved.</span>
            <div className="flex gap-4">
               {/* Add social icons here if needed */}
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

/* --- Components --- */

/* NEW REUSABLE ACTION BUTTON */
function ActionBtn({ 
  children, 
  onClick, 
  loading, 
  variant = "primary", 
  size = "md", 
  badge,
  arrow 
}: any) {
  
  // Styles based on variant
  const variants: any = {
    primary: "bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 border-transparent",
    secondary: "bg-[var(--foreground)] text-[var(--background)] shadow-xl hover:bg-[var(--foreground)]/90 border-transparent",
    outline: "bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] hover:border-[var(--foreground)]/20",
    ghost: "bg-transparent text-[var(--foreground)] hover:bg-[var(--muted)] border-transparent"
  }

  // Styles based on size
  const sizes: any = {
    sm: "px-5 py-2.5 text-sm",
    md: "px-8 py-3 text-base",
    lg: "px-10 py-4 text-lg w-full sm:w-auto"
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`
        relative rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-3 border
        ${variants[variant]} ${sizes[size]}
        ${loading ? "opacity-80 cursor-not-allowed" : ""}
      `}
    >
      {loading ? (
        <span className={`h-5 w-5 border-2 rounded-full animate-spin border-t-transparent ${variant === 'outline' ? 'border-[var(--foreground)]' : 'border-[var(--background)]'}`} />
      ) : (
        <>
          {children}
          {arrow && <span className="text-xl leading-none mb-0.5">→</span>}
          {badge && (
            <span className="absolute -top-3 -right-3 bg-white text-emerald-600 text-[10px] font-black uppercase px-2 py-1 rounded-full shadow-sm border border-emerald-100 transform rotate-12">
              {badge}
            </span>
          )}
        </>
      )}
    </motion.button>
  )
}

function ValueCard({icon, title, desc}: {icon: string, title: string, desc: string}) {
  return (
    <motion.div variants={fadeUp} className="text-center p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] hover:border-emerald-500/30 transition-colors">
       <div className="text-5xl mb-6">{icon}</div>
       <h3 className="text-xl font-bold mb-3 text-[var(--foreground)]">{title}</h3>
       <p className="text-[var(--muted-foreground)] leading-relaxed">{desc}</p>
    </motion.div>
  )
}

function StepCard({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-3xl bg-[var(--background)] p-8 shadow-sm hover:shadow-2xl hover:shadow-[var(--foreground)]/5 transition-all duration-500 group z-10 border border-[var(--border)]"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="h-12 w-12 rounded-2xl bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-500">
          {n}
        </div>
        <div className="text-xl font-bold text-[var(--foreground)]">{title}</div>
      </div>
      <p className="text-[var(--muted-foreground)] leading-relaxed text-lg">{desc}</p>
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
        "rounded-3xl p-8 transition-all duration-500 flex flex-col h-full relative overflow-hidden",
        highlight
          ? "bg-[var(--foreground)] text-[var(--background)] shadow-2xl shadow-[var(--foreground)]/20 md:scale-105 z-10"
          : "bg-[var(--card)] border border-[var(--border)] hover:border-[var(--foreground)]/20 hover:shadow-xl",
        disabled ? "opacity-70 grayscale-[0.8]" : "",
      ].join(" ")}
    >
      {highlight && (
        <div className="absolute top-0 right-0 p-3 bg-gradient-to-bl from-white/20 to-transparent rounded-bl-3xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--background)]">Best Value</span>
        </div>
      )}

      <div className="text-lg font-bold opacity-90">{title}</div>
      <div className="mt-4 flex items-baseline">
        <span className="text-5xl font-extrabold tracking-tight">{price}</span>
        <span className={`ml-2 ${highlight ? "opacity-70" : "text-[var(--muted-foreground)]"}`}>{sub}</span>
      </div>

      <ul className="mt-8 space-y-4 text-sm flex-1">
        {bullets.map((b: string) => (
          <li key={b} className="flex gap-3 items-start">
            <svg
              className={`w-5 h-5 flex-shrink-0 ${highlight ? "text-emerald-400" : "text-[var(--foreground)]"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className={highlight ? "opacity-90" : "text-[var(--muted-foreground)]"}>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        {disabled ? (
          <span className="block w-full py-4 rounded-xl text-center text-sm font-bold bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed">
            {ctaText}
          </span>
        ) : (
          <motion.a
            href={ctaHref}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={[
              "block w-full py-4 rounded-xl text-center text-sm font-bold transition-all duration-300",
              highlight
                ? "bg-[var(--background)] text-[var(--foreground)] hover:bg-white"
                : "bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 shadow-lg",
            ].join(" ")}
          >
            {ctaText}
          </motion.a>
        )}
      </div>
    </motion.div>
  )
}