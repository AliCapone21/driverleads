"use client"

import React, { useEffect, useMemo, useState } from "react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { AnimatePresence, motion } from "framer-motion"

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
}

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleWindowScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleWindowScroll)
    return () => window.removeEventListener("scroll", handleWindowScroll)
  }, [])

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) element.scrollIntoView({ behavior: "smooth" })
  }

  const navItems = useMemo(
    () =>
      ["Features", "Pricing", "How it works"].map((item) => ({
        label: item,
        id: item.toLowerCase().replace(/\s+/g, "-"),
      })),
    []
  )

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-indigo-500 selection:text-white relative overflow-hidden">
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
          <div className="mx-auto max-w-6xl px-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-gradient-to-br from-[var(--foreground)] to-[var(--muted-foreground)] flex items-center justify-center group-hover:scale-[1.06] transition-transform duration-500 text-[var(--background)] shadow-lg">
                <span className="font-extrabold text-lg">DL</span>
              </div>

              <div className="leading-tight">
                <div className="font-extrabold tracking-tight text-lg text-[var(--foreground)]">Driver Leads</div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-bold">
                  For US carriers
                </div>
              </div>
            </a>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--muted-foreground)]">
              {navItems.map(({ label, id }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => handleScroll(e, id)}
                  className="cursor-pointer hover:text-[var(--foreground)] transition-colors duration-200"
                >
                  {label}
                </a>
              ))}
              <a className="hover:text-[var(--foreground)] transition-colors duration-200" href="/drivers">
                Drivers
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <a
                href="/login"
                className="inline-flex px-4 py-2 rounded-xl text-[var(--foreground)] hover:bg-[var(--muted)] transition-all duration-300 text-sm font-bold"
              >
                SignUp / Login
              </a>
            </div>
          </div>
        </motion.div>
      </header>

      {/* HERO */}
      <section className="relative pt-32 pb-32 sm:pt-40 sm:pb-40">
        <div className="mx-auto max-w-6xl px-4 relative">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="max-w-3xl mx-auto text-center sm:text-left"
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
              Verified driver leads • Pay-per-unlock
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-7xl font-extrabold tracking-tight text-[var(--foreground)] leading-[1.1] mb-6"
            >
              Find drivers <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-500">
                faster than ever.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-xl sm:text-2xl text-[var(--muted-foreground)] leading-relaxed max-w-2xl mx-auto sm:mx-0 font-medium"
            >
              The modern marketplace for US carriers. Browse verified profiles for free, unlock contact details for{" "}
              <DealPrice price="$10" note="limited offer" />.
            </motion.p>

            {/* SINGLE MAIN CTA */}
            <motion.div
              variants={fadeUp}
              className="mt-12 flex justify-center sm:justify-start"
            >
              <motion.a
                href="/drivers"
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.8, ease }}
                className="group relative inline-flex items-center justify-center px-10 py-5 rounded-3xl font-extrabold text-lg sm:text-xl
                           bg-[var(--foreground)] text-[var(--background)] shadow-2xl shadow-[var(--foreground)]/20
                           hover:shadow-[var(--foreground)]/30 active:scale-95 transition-all duration-300"
              >
                {/* glow */}
                <span className="absolute -inset-1 rounded-[28px] bg-emerald-500/20 blur-xl opacity-70 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-3">
                  Find Drivers Now!
                  <span className="h-9 w-9 rounded-2xl bg-[var(--background)]/12 border border-[var(--background)]/15 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-500">
                    →
                  </span>
                </span>
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              className="mt-16 p-1 rounded-2xl bg-gradient-to-r from-[var(--border)] via-transparent to-[var(--border)] opacity-80"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 bg-[var(--background)]/80 backdrop-blur-xl rounded-xl p-6 border border-[var(--border)]/50">
                <Stat label="Unlock price" value="$10" />
                <Stat label="Secure access" value="RLS" />
                <Stat label="Payments" value="Stripe" />
                <Stat label="Database" value="Postgres" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-32 relative">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10% 0px" }}>
            <motion.div variants={fadeUp} className="max-w-2xl mb-16">
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--foreground)]">
                Everything carriers need
              </h2>
              <p className="mt-4 text-xl text-[var(--muted-foreground)]">
                We stripped away the subscriptions and complexity.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard
                title="Preview-first"
                desc="Only safe fields are shown publicly. Phone numbers stay locked until you decide."
                icon="eye"
              />
              <FeatureCard
                title="Unlock forever"
                desc="Pay $10 once. The driver's details belong to your account permanently."
                icon="lock"
              />
              <FeatureCard
                title="Instant verify"
                desc="We validate CDL status and endorsements before listing drivers."
                icon="shield"
              />
              <FeatureCard
                title="Stripe payments"
                desc="Secure, one-click checkouts. Automated receipts for your expenses."
                icon="card"
              />
              <FeatureCard
                title="Audit trail"
                desc="Track every unlock with timestamps. Perfect for team accountability."
                icon="clock"
              />
              <FeatureCard
                title="Scale ready"
                desc="Built to handle 1 driver or 10,000. Start small and grow at your pace."
                icon="chart"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-32 relative">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10% 0px" }}>
            <motion.div variants={fadeUp} className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--foreground)]">
                How it works
              </h2>
              <p className="mt-4 text-xl text-[var(--muted-foreground)]">
                Get connected in three simple steps.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent z-0" />
              <StepCard n="1" title="Browse drivers" desc="Filter by state, city, and endorsements to find your perfect match." />
              <StepCard n="2" title="Open profile" desc="View experience years, living location, and age range." />
              <StepCard n="3" title="Pay & unlock" desc="One click to unlock phone, email, and full CDL history." />
            </div>

            <motion.div variants={fadeUp} className="mt-20 flex justify-center">
              <motion.a
                href="/drivers"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.8, ease }}
                className="group flex items-center gap-3 text-lg font-bold text-[var(--foreground)] transition-all"
              >
                Start Browsing Now
                <div className="w-8 h-8 rounded-full bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center group-hover:translate-x-2 transition-transform duration-500">
                  →
                </div>
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-32 relative">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10% 0px" }}>
            <motion.div variants={fadeUp} className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--foreground)]">
                Simple Pricing
              </h2>
              <p className="mt-4 text-xl text-[var(--muted-foreground)]">
                No hidden fees. No subscriptions. Just results.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 items-start relative z-10">
              <PricingCard
                title="Pay as you go"
                price="$10"
                sub="per driver"
                bullets={["Unlock contacts instantly", "Lifetime access to profile", "Direct PDF Downloads", "No monthly commitment"]}
                ctaText="Browse Drivers"
                ctaHref="/drivers"
                highlight
              />
              <PricingCard
                title="Starter (soon)"
                price="$49"
                sub="per month"
                bullets={["Includes 10 unlock credits", "Team usage tracking", "Priority support", "Rollover credits"]}
                ctaText="Join Waitlist"
                ctaHref="#"
                disabled
              />
              <PricingCard
                title="Pro (soon)"
                price="$199"
                sub="per month"
                bullets={["Includes 50 unlock credits", "Admin dashboard + exports", "Dedicated account manager", "API Access"]}
                ctaText="Join Waitlist"
                ctaHref="#"
                disabled
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border)] bg-[var(--background)]/50 backdrop-blur-md pt-20 pb-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-lg bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center font-bold text-xs">
                  DL
                </div>
                <div className="font-bold tracking-tight text-[var(--foreground)] text-lg">Driver Leads</div>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                The most secure driver lead marketplace for US carriers. Verified profiles, pay-per-unlock access.
              </p>
            </div>

            <div>
              <div className="font-bold text-[var(--foreground)] mb-6">Product</div>
              <ul className="space-y-4 text-sm text-[var(--muted-foreground)]">
                <li>
                  <a className="hover:text-[var(--primary)] transition-colors" href="/drivers">
                    Browse Drivers
                  </a>
                </li>
                <li>
                  <a className="hover:text-[var(--primary)] transition-colors" href="#features">
                    Features
                  </a>
                </li>
                <li>
                  <a className="hover:text-[var(--primary)] transition-colors" href="#pricing">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-[var(--foreground)] mb-6">Company</div>
              <ul className="space-y-4 text-sm text-[var(--muted-foreground)]">
                <li>
                  <a className="hover:text-[var(--primary)] transition-colors" href="#">
                    About Us
                  </a>
                </li>
                <li>
                  <a className="hover:text-[var(--primary)] transition-colors" href="#">
                    Contact Support
                  </a>
                </li>
                <li>
                  <a className="hover:text-[var(--primary)] transition-colors" href="#">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-[var(--foreground)] mb-6">Legal</div>
              <ul className="space-y-4 text-sm text-[var(--muted-foreground)]">
                <li>
                  <a className="hover:text-[var(--primary)] transition-colors" href="#">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a className="hover:text-[var(--primary)] transition-colors" href="#">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a className="hover:text-[var(--primary)] transition-colors" href="#">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)] flex justify-between items-center">
            <span>© {new Date().getFullYear()} Driver Leads Inc. All rights reserved.</span>
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-[var(--muted)] hover:bg-[var(--foreground)] transition-colors cursor-pointer" />
              <div className="h-8 w-8 rounded-full bg-[var(--muted)] hover:bg-[var(--foreground)] transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

/* --- Components --- */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">{value}</div>
      <div className="text-xs text-[var(--muted-foreground)] font-medium uppercase tracking-wide mt-1">{label}</div>
    </div>
  )
}

function DealPrice({ price, note }: { price: string; note?: string }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2 align-middle">
      <span className="relative inline-flex items-center">
        {/* premium glow */}
        <span className="absolute -inset-2 rounded-[22px] bg-emerald-500/20 blur-xl opacity-70 animate-pulse" />

        {/* gradient border */}
        <span className="absolute -inset-[2px] rounded-[20px] bg-gradient-to-r from-emerald-400/40 via-indigo-400/25 to-emerald-400/40 opacity-80" />

        {/* shine sweep */}
        <span className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none">
          <span className="absolute -left-1/2 top-0 h-full w-1/2 rotate-12 bg-white/20 blur-sm animate-[shine_2.8s_ease-in-out_infinite]" />
        </span>

        <span className="relative inline-flex items-center gap-3 px-4 py-2 rounded-[20px] bg-[var(--foreground)] text-[var(--background)] font-extrabold tracking-tight shadow-lg shadow-[var(--foreground)]/20 border border-[var(--foreground)]/10">
          <span className="text-lg sm:text-xl">{price}</span>
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-[var(--background)]/14 px-2.5 py-1 rounded-full">
            Deal
          </span>
        </span>
      </span>

      <span className="inline-flex items-center gap-2 text-sm sm:text-base text-[var(--muted-foreground)]">
        <span className="line-through opacity-60">$29</span>
        <span className="opacity-85">today</span>
        {note ? (
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--card)]">
            {note}
          </span>
        ) : null}
      </span>

      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-120%) rotate(12deg);
            opacity: 0;
          }
          25% {
            opacity: 1;
          }
          55% {
            opacity: 0.85;
          }
          100% {
            transform: translateX(220%) rotate(12deg);
            opacity: 0;
          }
        }
      `}</style>
    </span>
  )
}

function FeatureCard({ title, desc, icon }: { title: string; desc: string; icon: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.9, ease }}
      className="group rounded-3xl bg-[var(--card)]/50 backdrop-blur-sm border border-[var(--border)] p-8 shadow-sm hover:shadow-xl hover:shadow-[var(--foreground)]/5 transition-all duration-500"
    >
      <div className="h-12 w-12 rounded-2xl bg-[var(--muted)] flex items-center justify-center mb-6 group-hover:bg-[var(--foreground)] group-hover:text-[var(--background)] transition-colors duration-500">
        {icon === "eye" && (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
        {icon === "lock" && (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        )}
        {icon === "shield" && (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
        )}
        {icon === "card" && (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        )}
        {icon === "clock" && (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {icon === "chart" && (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
          </svg>
        )}
      </div>
      <div className="text-xl font-bold text-[var(--foreground)] tracking-tight">{title}</div>
      <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">{desc}</p>
    </motion.div>
  )
}

function StepCard({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.9, ease }}
      className="relative rounded-3xl bg-[var(--background)] p-8 shadow-sm hover:shadow-2xl hover:shadow-[var(--foreground)]/5 transition-all duration-700 group z-10 border border-[var(--border)]"
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

function PricingCard({
  title,
  price,
  sub,
  bullets,
  ctaText,
  ctaHref,
  highlight,
  disabled,
}: {
  title: string
  price: string
  sub: string
  bullets: string[]
  ctaText: string
  ctaHref: string
  highlight?: boolean
  disabled?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      whileHover={disabled ? {} : { y: -6 }}
      transition={{ duration: 0.9, ease }}
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
        {bullets.map((b) => (
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
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.9, ease }}
            className={[
              "block w-full py-4 rounded-xl text-center text-sm font-bold transition-all duration-300 active:scale-95",
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
