// src/app/privacy/legal.tsx
"use client"

import React, { Suspense } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/ThemeToggle"
import { ShieldCheck, Scale, Zap } from "lucide-react"

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

function LegalContent() {
  // Function to handle Dodo Payments checkout for support
  const handleSupportClick = async () => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productId: process.env.NEXT_PUBLIC_DODO_DONATION_PRODUCT_ID 
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Support checkout failed:", error);
    }
  };

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

            <nav className="hidden md:flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase">
                <a href="/" className="text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors">
                    Homepage
                </a>
                <span className="text-zinc-300 dark:text-zinc-700">/</span>
                <span className="text-zinc-950 dark:text-zinc-50">Legal</span>
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <a href="/login" className="hidden sm:inline text-[11px] font-semibold tracking-[0.16em] uppercase text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors">
                Log In
              </a>
              <a href="/join" className="hidden sm:inline-flex rounded-full px-5 py-2.5 text-[10px] font-semibold tracking-[0.18em] uppercase bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black border border-zinc-950/10 dark:border-white/10 shadow-[0_18px_50px_-36px_rgba(0,0,0,0.55)] hover:shadow-[0_28px_70px_-52px_rgba(0,0,0,0.6)] transition-shadow">
                Join Free
              </a>
            </div>
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
              <p className="text-[10px] font-bold tracking-[0.26em] uppercase text-emerald-700 dark:text-emerald-400">
                DriverLeads Startup
              </p>
              <h1 className="mt-4 text-[34px] md:text-[44px] leading-[1.06] tracking-[-0.03em] font-semibold">
                Important legal information.
              </h1>
              <p className="mt-5 text-[15px] md:text-[16px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                This project was created 3 months ago by the DriverLeads team. This page explains the legal terms for using our platform and our partnership with Dodo Payments.
              </p>

              <div className="mt-7 space-y-4">
                <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-white/[0.02] p-6">
                  <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
                    Last updated
                  </div>
                  <div className="mt-2 text-sm font-semibold tracking-tight">February 11, 2026</div>
                </div>

                {/* Dodo Payments Support Card */}
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mb-4">
                    <Zap size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Startup Fuel</span>
                  </div>
                  <p className="text-[12px] text-zinc-600 dark:text-zinc-300 mb-5 leading-relaxed">
                    Support our 3-month startup project. Your contribution helps us keep the data verified and the platform running.
                  </p>
                  <button 
                    onClick={handleSupportClick}
                    className="w-full flex justify-center items-center rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-3 text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Support Our Project
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-[28px] border border-zinc-200/70 dark:border-zinc-800/70 bg-white/65 dark:bg-white/[0.03] backdrop-blur-xl shadow-[0_60px_120px_-95px_rgba(0,0,0,0.55)] overflow-hidden">
                <div className="px-6 md:px-8 py-7 border-b border-zinc-200/60 dark:border-zinc-800/60">
                  <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
                    Terms & Notes
                  </div>
                  <div className="mt-2 text-base font-semibold tracking-tight">
                    Transparency and Responsibility
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-5">
                  <Card
                    icon={<Scale className="text-emerald-500" size={18} />}
                    title="1) Marketplace Relationship"
                    body="Driver Leads is a marketplace startup. We are not a carrier, broker, or employer. Agreements are formed strictly between the driver and the recruiter."
                  />

                  <Card
                    icon={<ShieldCheck className="text-emerald-500" size={18} />}
                    title="2) Data Accuracy"
                    body="The DriverLeads team verifies profile data to ensure pay transparency. However, matches depend on market demand and user responses."
                  />

                  <Card
                    title="3) User Responsibility"
                    body="You are responsible for verifying identity, licenses, and eligibility before making hiring decisions based on unlocked information."
                  />

                  <Card
                    title="4) Merchant of Record (Dodo Payments)"
                    body="Our payments are processed by Dodo Payments, our Merchant of Record. They handle all secure transaction processing and global tax compliance."
                  />

                  <Card
                    title="5) Prohibited Activity"
                    body="Scraping, harassment, or misuse of unlocked contact data is strictly prohibited and will lead to immediate account suspension."
                  />

                  <div className="rounded-2xl border border-emerald-500/15 bg-gradient-to-b from-emerald-500/[0.06] to-transparent dark:from-emerald-500/[0.06] p-6">
                    <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-emerald-700/80 dark:text-emerald-300/70">
                      Legal Support
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-200">
                      Direct inquiries:{" "}
                      <a href="mailto:support@driverleads.live" className="underline underline-offset-4 hover:opacity-90 font-medium">
                        support@driverleads.live
                      </a>
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
                <div className="relative h-12 w-40 scale-[3] transition-transform origin-left md:origin-center">
                  <Image src="/logo3.png" alt="Driver Leads" fill className="object-contain" />
                </div>
                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden md:block" />
                <div className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Driver Leads</div>
              </div>
              <div className="flex flex-col items-center md:items-end gap-4">
                <div className="flex items-center gap-5 text-[9px] lg:text-[11px] font-semibold tracking-[0.16em] uppercase text-zinc-500 dark:text-zinc-400">
                  <a href="/about" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">About Us</a>
                  <a href="/privacy" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">Privacy</a>
                  <a href="/privacy/terms" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">Terms</a>
                  <a href="/privacy/legal" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">Legal</a>
                  <a href="/contact" className="hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">Contact Us</a>
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">© 2026 Driver Leads. All rights reserved.</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

function Card({ title, body, icon }: { title: string; body: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-white/[0.02] p-6 transition-all hover:border-emerald-500/30">
      <div className="flex items-center gap-3">
        {icon}
        <div className="text-sm font-semibold tracking-tight">{title}</div>
      </div>
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