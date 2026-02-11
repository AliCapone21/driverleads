"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/ThemeToggle"

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

export default function SignUpClient() {
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  async function signUp() {
    if (password !== confirmPassword) {
      setMsg("Passwords do not match.")
      return
    }

    setLoading(true)
    setMsg(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)
    setMsg(error ? error.message : "Check your email to confirm your account.")
  }

  const isSuccess = !!msg && msg.toLowerCase().includes("check")

  return (
    <main className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-white text-zinc-900 dark:bg-[#070A12] dark:text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-22%] right-[-12%] w-[820px] h-[820px] bg-emerald-600/15 rounded-full blur-[120px] dark:hidden" />
        <div className="absolute bottom-[-22%] left-[-12%] w-[820px] h-[820px] bg-indigo-600/15 rounded-full blur-[120px] dark:hidden" />
        <div className="absolute top-[-22%] right-[-12%] w-[820px] h-[820px] bg-emerald-600/10 rounded-full blur-[120px] hidden dark:block" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:48px_48px] hidden dark:block" />
      </div>

      <div className="fixed top-4 right-4 z-20">
        {mounted && <ThemeToggle />}
      </div>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }} className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center justify-center">
            <div className="relative h-15 w-30 scale-300">
              <Image src="/logo3.png" alt="Driver Leads" fill priority className="object-contain" />
            </div>
          </Link>
          <h1 className="mt-1 text-3xl font-black tracking-tight leading-none">Create an Account</h1>
          <p className="text-xs font-semibold text-zinc-500 dark:text-white/55 mt-2">Join the network of top-tier logistics professionals.</p>
        </div>

        <div className="rounded-[28px] bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/70 dark:border-white/10 p-7 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-zinc-700 dark:text-white/80">Registration</h2>
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400/70">Secure Setup</span>
          </div>

          <div className="space-y-5">
            <Field 
              label="Work Email" 
              type="email" 
              value={email} 
              onChange={setEmail} 
              placeholder="name@company.com" 
              disabled={loading} 
            />

            <PasswordField 
              label="Password" 
              value={password} 
              onChange={setPassword} 
              show={showPassword} 
              setShow={setShowPassword} 
              disabled={loading} 
            />

            <PasswordField 
              label="Confirm Password" 
              value={confirmPassword} 
              onChange={setConfirmPassword} 
              show={showConfirmPassword} 
              setShow={setShowConfirmPassword} 
              disabled={loading} 
            />

            <AnimatePresence mode="wait">
              {msg && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`rounded-xl px-4 py-3 text-[11px] font-semibold text-center border ${isSuccess ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-red-500/10 text-red-700 border-red-500/20"}`}>
                  {msg}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-1 space-y-4">
              <button onClick={signUp} disabled={loading} className="w-full rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-black py-4 font-black uppercase text-xs tracking-[0.2em] hover:opacity-90 active:scale-[0.99] disabled:opacity-50">
                {loading ? "Creating..." : "Register Now"}
              </button>

              <p className="text-center text-[11px] font-bold text-zinc-500 dark:text-white/45 uppercase tracking-wider">
                Already have an account?{" "}
                <Link href="/login" className="text-emerald-700 dark:text-emerald-400 hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="group flex items-center gap-3 px-7 py-3.5 rounded-2xl bg-zinc-100/70 dark:bg-white/5 border border-zinc-200/70 dark:border-white/10 text-zinc-600 dark:text-white/70 hover:text-zinc-900 dark:hover:text-white transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Home</span>
          </Link>
        </div>
      </motion.div>
    </main>
  )
}

function Field({ label, type, placeholder, value, onChange, disabled }: any) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 ml-1">{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder} 
        disabled={disabled} 
        className="w-full rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/70 dark:border-white/10 px-4 py-4 text-zinc-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/35 transition-all" 
      />
    </div>
  )
}

function PasswordField({ label, value, onChange, show, setShow, disabled }: any) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 ml-1">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          disabled={disabled}
          className="w-full rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/70 dark:border-white/10 px-4 py-4 pr-12 text-zinc-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/35 transition-all"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  )
}

/* Icons */
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