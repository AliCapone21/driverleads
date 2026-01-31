// src/components/LoginClient.tsx

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/ThemeToggle"

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

export default function LoginClient() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // avoid hydration mismatch for theme UI pieces if needed
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  async function signUp() {
    setLoading(true)
    setMsg(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    setLoading(false)
    setMsg(error ? error.message : "Check your email to confirm your account.")
  }

  async function signIn() {
    setLoading(true)
    setMsg(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setLoading(false)
      setMsg(error.message)
    } else {
      router.refresh()
      router.push("/drivers")
    }
  }

  const isSuccess = !!msg && msg.toLowerCase().includes("check")

  return (
    <main className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden selection:bg-emerald-500/30 bg-white text-zinc-900 dark:bg-[#070A12] dark:text-white">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* light */}
        <div className="absolute top-[-22%] right-[-12%] w-[820px] h-[820px] bg-indigo-600/15 rounded-full blur-[120px] dark:hidden" />
        <div className="absolute bottom-[-22%] left-[-12%] w-[820px] h-[820px] bg-emerald-600/15 rounded-full blur-[120px] dark:hidden" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.08)_1px,transparent_1px)] [background-size:48px_48px] dark:hidden" />

        {/* dark */}
        <div className="absolute top-[-22%] right-[-12%] w-[820px] h-[820px] bg-indigo-600/10 rounded-full blur-[120px] hidden dark:block" />
        <div className="absolute bottom-[-22%] left-[-12%] w-[820px] h-[820px] bg-emerald-600/10 rounded-full blur-[120px] hidden dark:block" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:48px_48px] hidden dark:block" />
      </div>

      {/* Top right controls */}
      <div className="fixed top-4 right-4 z-20 flex items-center gap-3">
        {mounted && <ThemeToggle />}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center justify-center">
            {/* Prefer your real logo; fallback to DL badge if missing */}
            <div className="relative h-15 w-30 scale-300 transition-transform duration-300 group-hover:scale-[3.7]">
              <Image src="/logo3.png" alt="Driver Leads" fill priority className="object-contain" />
            </div>
            <span className="sr-only">Driver Leads</span>
          </Link>

          <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-900 dark:text-white leading-none">
            Sign in to Driver Leads
          </h1>
          <p className="text-xs font-semibold text-zinc-500 dark:text-white/55 mt-2">
            Secure access for carriers, recruiters, and dispatch teams.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[28px] bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/70 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/40 p-7 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-zinc-700 dark:text-white/80">
              Account Access
            </h2>
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400/70">
              Secure Terminal
            </span>
          </div>

          <div className="space-y-5">
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="name@company.com"
              disabled={loading}
            />

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/70 dark:border-white/10 px-4 py-4 pr-12
                             text-zinc-900 dark:text-white font-semibold placeholder:text-zinc-400 dark:placeholder:text-zinc-600
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/35 focus:border-emerald-500/30
                             transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 dark:text-white/45">
                  Use your company credentials.
                </span>
                <Link
                  href="/"
                  className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
                >
                  Need help?
                </Link>
              </div>
            </div>

            {/* Message */}
            <AnimatePresence mode="wait">
              {msg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={`rounded-xl px-4 py-3 text-[11px] font-semibold text-center border ${
                    isSuccess
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                      : "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20"
                  }`}
                >
                  {msg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="pt-1 space-y-3">
              <button
                onClick={signIn}
                disabled={loading}
                className="w-full rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-black py-4
                           font-black uppercase text-xs tracking-[0.2em]
                           hover:opacity-90 transition-all active:scale-[0.99]
                           shadow-lg shadow-black/10 disabled:opacity-50"
              >
                {loading ? "Authorizing..." : "Sign In"}
              </button>

              <button
                onClick={signUp}
                disabled={loading}
                className="w-full rounded-2xl border border-zinc-200/70 dark:border-white/10 py-4
                           font-black uppercase text-xs tracking-[0.2em] text-zinc-900 dark:text-white
                           hover:bg-zinc-100/70 dark:hover:bg-white/5 transition-all active:scale-[0.99]
                           disabled:opacity-50"
              >
                Create Account
              </button>

              <div className="pt-2 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-white/35">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500/70" />
                Encrypted • Secure • GDPR-ready
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Back Home */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="group flex items-center gap-3 px-7 py-3.5 rounded-2xl bg-zinc-100/70 dark:bg-white/5 border border-zinc-200/70 dark:border-white/10
                       text-zinc-600 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-all"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:-translate-x-1 transition-transform"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Home</span>
          </Link>
        </div>
      </motion.div>
    </main>
  )
}

/* ---------- Helpers ---------- */

function Field({
  label,
  type,
  placeholder,
  value,
  onChange,
  disabled,
}: {
  label: string
  type: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  disabled: boolean
}) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 ml-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/70 dark:border-white/10 px-4 py-4
                   text-zinc-900 dark:text-white font-semibold placeholder:text-zinc-400 dark:placeholder:text-zinc-600
                   focus:outline-none focus:ring-2 focus:ring-emerald-500/35 focus:border-emerald-500/30
                   transition-all"
      />
    </div>
  )
}

/* ---------- Icons ---------- */

function EyeIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a3 3 0 004.2 4.2" />
      <path d="M9.5 5.2A10.6 10.6 0 0112 5c6.5 0 10 7 10 7a18.3 18.3 0 01-4.3 5.2" />
      <path d="M6.3 6.3A18.3 18.3 0 002 12s3.5 7 10 7c1 0 2-.2 3-.5" />
    </svg>
  )
}
