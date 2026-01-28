"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

export default function LoginClient() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
    <main className="min-h-screen relative flex items-center justify-center bg-[#070A12] px-4 overflow-hidden selection:bg-emerald-500/30">
      
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:42px_42px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="mb-10 text-center">
          <Link href="/" className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black font-black text-xl shadow-2xl hover:scale-105 transition-transform">
            DL
          </Link>
          <h1 className="mt-6 text-3xl font-black tracking-tighter text-white uppercase leading-none">
            Driver Leads
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/60 mt-2">
            Secure Carrier Terminal
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[32px] bg-zinc-900/50 backdrop-blur-xl border border-white/5 shadow-2xl p-8 sm:p-10">
          <h2 className="text-xl font-black tracking-tight text-white uppercase mb-6">
            Login / Sign Up
          </h2>

          <div className="space-y-5">
            <Field
              label="Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="name@company.com"
              disabled={loading}
            />

            {/* Password */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full rounded-2xl bg-white/5 border border-white/5 px-4 py-4 pr-12
                             text-white font-bold placeholder:text-zinc-700
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white/10
                             transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Message Messaging */}
            <AnimatePresence mode="wait">
              {msg && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-wider text-center border ${
                    isSuccess
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}
                >
                  {msg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="pt-2 space-y-4">
              <button
                onClick={signIn}
                disabled={loading}
                className="w-full rounded-2xl bg-emerald-500 py-4 font-black uppercase text-xs tracking-[0.2em] text-black
                           hover:bg-emerald-400 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {loading ? "Authorizing..." : "Sign In"}
              </button>

              <button
                onClick={signUp}
                disabled={loading}
                className="w-full rounded-2xl border border-white/10 py-4 font-black uppercase text-xs tracking-[0.2em] text-white
                           hover:bg-white/5 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Create Account
              </button>
            </div>

            <p className="pt-4 text-center text-[9px] font-bold uppercase tracking-widest text-zinc-600">
              Encryption active • GDPR compliant
            </p>
          </div>
        </div>

        {/* Footer / Back Home */}
        <div className="mt-10 flex justify-center">
          <Link 
            href="/" 
            className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/5 
                       text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Abort and Return to Hub</span>
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
}: any) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-2xl bg-white/5 border border-white/5 px-4 py-4
                   text-white font-bold placeholder:text-zinc-700
                   focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white/10
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