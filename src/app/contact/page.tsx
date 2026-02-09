// src/app/contact/page.tsx
"use client"

import React, { useState, Suspense } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react"

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

function ContactContent() {
  const [submitted, setSubmitted] = useState(false)

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
                <span className="text-zinc-950 dark:text-zinc-50">Contact Us</span>
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
                <span className="text-zinc-950 dark:text-zinc-50">Contact Us</span>
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
                Contact
              </p>
              <h1 className="mt-4 text-[34px] md:text-[44px] leading-[1.06] tracking-[-0.03em] font-semibold">
                Let’s talk—support, partnerships, or early access.
              </h1>
              <p className="mt-5 text-[15px] md:text-[16px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                Send us a message and we’ll get back to you. If you’re a recruiter, tell us what lanes you hire for. If
                you’re a driver, tell us your role (company / owner-operator) and your target pay.
              </p>

              <div className="mt-8 space-y-3">
                <InfoLine icon={<Mail className="h-4 w-4" />} label="Email" value="support@driverleads.com" />
                <InfoLine icon={<Phone className="h-4 w-4" />} label="Phone" value="(000) 000-0000" />
                <InfoLine icon={<MapPin className="h-4 w-4" />} label="Location" value="United States (Remote)" />
              </div>

              <div className="mt-7 rounded-2xl border border-emerald-500/15 bg-gradient-to-b from-emerald-500/[0.06] to-transparent dark:from-emerald-500/[0.06] p-6">
                <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-emerald-700/80 dark:text-emerald-300/70">
                  Faster answers
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-200">
                  Include your role (driver or recruiter) + what you’re trying to do. We’ll route it correctly.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-[28px] border border-zinc-200/70 dark:border-zinc-800/70 bg-white/65 dark:bg-white/[0.03] backdrop-blur-xl shadow-[0_60px_120px_-95px_rgba(0,0,0,0.55)] overflow-hidden">
                <div className="px-6 md:px-8 py-7 border-b border-zinc-200/60 dark:border-zinc-800/60">
                  <div className="text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
                    Send a message
                  </div>
                  <div className="mt-2 text-base font-semibold tracking-tight">We read every message.</div>
                </div>

                <div className="p-6 md:p-8">
                  {submitted ? (
                    <div className="rounded-2xl border border-emerald-500/15 bg-gradient-to-b from-emerald-500/[0.08] to-transparent p-6">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        <div>
                          <div className="text-sm font-semibold tracking-tight">Message ready.</div>
                          <p className="mt-1 text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-200">
                            Replace the email/phone above with your real contact. If you want this form to actually send,
                            tell me whether you want Supabase (table + edge function), Resend, or a simple mailto.
                          </p>
                          <button
                            onClick={() => setSubmitted(false)}
                            className="mt-4 inline-flex rounded-full px-6 py-2.5 text-[10px] font-semibold tracking-[0.18em] uppercase border border-zinc-200/80 dark:border-zinc-800/80 bg-white/55 dark:bg-white/[0.03] text-zinc-950 dark:text-white backdrop-blur-md hover:bg-white/75 dark:hover:bg-white/[0.05] transition-colors"
                          >
                            Send another
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        setSubmitted(true)
                      }}
                      className="space-y-4"
                    >
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Name" placeholder="Your name" />
                        <Field label="Email" placeholder="you@example.com" type="email" />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Role" placeholder="Driver / Recruiter" />
                        <Field label="Company (optional)" placeholder="Company name" />
                      </div>

                      <Field label="Subject" placeholder="How can we help?" />
                      <Field label="Message" placeholder="Write your message..." textarea rows={6} />

                      <div className="pt-2 flex flex-col sm:flex-row gap-3">
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-[11px] font-semibold tracking-[0.18em] uppercase bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black border border-zinc-950/10 dark:border-white/10 shadow-[0_18px_50px_-36px_rgba(0,0,0,0.55)] hover:shadow-[0_28px_70px_-52px_rgba(0,0,0,0.6)] transition-shadow"
                        >
                          <Send className="h-4 w-4" />
                          Send
                        </button>

                        <a
                          href="mailto:support@driverleads.com"
                          className="inline-flex items-center justify-center rounded-full px-7 py-3 text-[11px] font-semibold tracking-[0.18em] uppercase border border-zinc-200/80 dark:border-zinc-800/80 bg-white/55 dark:bg-white/[0.03] text-zinc-950 dark:text-white backdrop-blur-md hover:bg-white/75 dark:hover:bg-white/[0.05] transition-colors"
                        >
                          Email instead
                        </a>
                      </div>
                    </form>
                  )}
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
                 <div className="flex items-center gap-5 text-[9px] lg:text-[11px] font-semibold tracking-[0.16em] uppercase text-zinc-500 dark:text-zinc-400">
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

export default function ContactPage() {
    return (
      <Suspense fallback={null}>
        <ContactContent />
      </Suspense>
    )
}

/* -------------------------------
   Small UI helpers
-------------------------------- */

function InfoLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-white/[0.02] px-4 py-3">
      <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
        <span className="text-emerald-600 dark:text-emerald-400">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="mt-1 text-sm font-semibold tracking-tight">{value}</div>
    </div>
  )
}

function Field({
  label,
  placeholder,
  type = "text",
  textarea,
  rows = 4,
}: {
  label: string
  placeholder: string
  type?: string
  textarea?: boolean
  rows?: number
}) {
  return (
    <label className="block">
      <div className="mb-2 text-[10px] font-semibold tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-400">
        {label}
      </div>

      {textarea ? (
        <textarea
          rows={rows}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-white/[0.02] px-4 py-3 text-sm font-semibold tracking-tight placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30 transition"
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-white/[0.02] px-4 py-3 text-sm font-semibold tracking-tight placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30 transition"
        />
      )}
    </label>
  )
}