// src/app/privacy/legal.tsx
"use client"

import React, { Suspense } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/ThemeToggle"

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

function LegalContent() {
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
      <header className="fixed top-0 w-full z-50 bg-white/70 dark:bg-black/45 backdrop-blur-xl border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="mx-auto max-w-7xl px-6">
          <div className="h-[84px] flex items-center justify-between">
            <div className="flex items-center gap-6">
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
            </div>

            {/* Middle Breadcrumb Navigation */}
            <nav className="hidden md:flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase">
                <a href="/" className="text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors">
                    Homepage
                </a>
                <span className="text-zinc-300 dark:text-zinc-700">/</span>
                <span className="text-zinc-950 dark:text-zinc-50">Legal</span>
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <a
                href="/login"
                className="hidden sm:inline text-[11px] font-semibold tracking-[0.16em] uppercase text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
              >
                Log In
              </a>
              <a
                href="/join"
                className="hidden sm:inline-flex rounded-full px-5 py-2.5 text-[10px] font-semibold tracking-[0.18em] uppercase bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black border border-zinc-950/10 dark:border-white/10 shadow-[0_18px_50px_-36px_rgba(0,0,0,0.55)] hover:shadow-[0_28px_70px_-52px_rgba(0,0,0,0.6)] transition-shadow"
              >
                Join Free
              </a>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-4">
            <nav className="flex items-center justify-center gap-3 text-[10px] font-semibold tracking-[0.14em] uppercase">
                <a href="/" className="text-zinc-500 dark:text-zinc-400">Homepage</a>
                <span className="text-zinc-300 dark:text-zinc-700">/</span>
                <span className="text-zinc-950 dark:text-zinc-50">Legal</span>
                <span className="mx-2 text-zinc-300 dark:text-zinc-700">|</span>
                <a href="/login" className="text-zinc-600 dark:text-zinc-400">Log In</a>
                <a href="/join" className="text-emerald-600 dark:text-emerald-400">Join</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="relative pt-[180px] pb-[72px]">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease }}
            className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start"
          >
            <div className="lg:col-span-5">
              <p className="text-[10px] font-semibold tracking-[0.26em] uppercase text-emerald-700 dark:text-emerald-300">
                Legal
              </p>
              <h1 className="mt-4 text-[34px] md:text-[44px] leading-[1.06] tracking-[-0.03em] font-semibold">
                Important legal information.
              </h1>
              <p className="mt-5 text-[15px] md:text-[16px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                This page explains the basic legal terms for using Driver Leads. It’s written in plain language, but it’s
                not a substitute for professional legal advice.
              </p>

              <div className="mt-7 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-white/[0.02] p-6">
                <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
                  Last updated
                </div>
                <div className="mt-2 text-sm font-semibold tracking-tight">February 9, 2026</div>
                <div className="mt-3 text-[12px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                  If we change something important, we’ll update this date.
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-[28px] border border-zinc-200/70 dark:border-zinc-800/70 bg-white/65 dark:bg-white/[0.03] backdrop-blur-xl shadow-[0_60px_120px_-95px_rgba(0,0,0,0.55)] overflow-hidden">
                <div className="px-6 md:px-8 py-7 border-b border-zinc-200/60 dark:border-zinc-800/60">
                  <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
                    Legal notes
                  </div>
                  <div className="mt-2 text-base font-semibold tracking-tight">
                    Please read these before using the platform.
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-5">
                  <Card
                    title="1) No legal relationship with drivers or recruiters"
                    body="Driver Leads is a marketplace. We are not a carrier, broker, employer, staffing agency, or recruiter. Any agreement is only between the driver and the recruiter/company."
                  />

                  <Card
                    title="2) No guarantees"
                    body="We don’t guarantee that you will find a job, hire a driver, make a placement, or receive responses. Results depend on market demand and user behavior."
                  />

                  <Card
                    title="3) User responsibility"
                    body="You are responsible for what you post and how you use the information you unlock. Always verify identity, licenses, experience, and eligibility before making any hiring decision."
                  />

                  <Card
                    title="4) Payments and refunds"
                    body="Recruiters may pay to unlock contact details. Pricing and plan options may change. Refunds (if any) will depend on our Terms and the payment processor rules (we plan to use Lemon Squeezy)."
                  />

                  <Card
                    title="5) Prohibited use"
                    body="Do not use Driver Leads for spam, harassment, discrimination, scraping, or any illegal activity. We may suspend or remove access if we detect abuse."
                  />

                  <Card
                    title="6) Limitation of liability"
                    body="To the maximum extent allowed by law, Driver Leads is not liable for losses, damages, or disputes arising from matches, communications, or hiring decisions."
                  />

                  <div className="rounded-2xl border border-emerald-500/15 bg-gradient-to-b from-emerald-500/[0.06] to-transparent dark:from-emerald-500/[0.06] p-6">
                    <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-emerald-700/80 dark:text-emerald-300/70">
                      Questions?
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-200">
                      Contact us at{" "}
                      <a href="mailto:support@driverleads.com" className="underline underline-offset-4 hover:opacity-90">
                        support@driverleads.com
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl shadow-[0_40px_90px_-70px_rgba(0,0,0,0.45)]">
            <div className="px-6 md:px-8 py-10 flex flex-col md:flex-row items-center md:justify-between gap-10 md:gap-6">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative h-12 w-40 scale-300 transition-transform">
                  <Image src="/logo3.png" alt="Driver Leads" fill className="object-contain" />
                </div>
                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden md:block" />
                <div className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Driver Leads</div>
              </div>

              <div className="flex flex-col items-center md:items-end gap-4">
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

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-white/[0.02] p-6">
      <div className="text-sm font-semibold tracking-tight">{title}</div>
      <p className="mt-2 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-300">{body}</p>
    </div>
  )
}

export default function LegalPage() {
  return (
    <Suspense fallback={null}>
      <LegalContent />
    </Suspense>
  )
}