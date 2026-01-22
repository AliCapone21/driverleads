"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client" // <--- NEW IMPORT
import { ThemeToggle } from "@/components/ThemeToggle"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation" // <--- NEW IMPORT

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

export default function LoginClient() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Initialize the client strictly for the browser
  const supabase = createClient() 

  async function signUp() {
    setLoading(true)
    setMsg(null)
    const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
            emailRedirectTo: `${location.origin}/auth/callback` // Best practice for verification
        }
    })
    setLoading(false)
    if (error) setMsg(error.message)
    else setMsg("Account created! Please check your email.")
  }

  async function signIn() {
    setLoading(true)
    setMsg(null)
    
    const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
    })

    if (error) {
      setLoading(false)
      setMsg(error.message)
    } else {
      // 1. Refresh allows Server Components (like Layout) to see the new cookie
      router.refresh() 
      // 2. Then we navigate to the drivers page
      router.push("/drivers") 
    }
  }

  const isSuccess =
    !!msg && (msg.includes("Account created") || msg.includes("Signed up") || msg.includes("check your email"))

  return (
    <main className="min-h-screen relative flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4 overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background mesh (matches home) */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] dark:bg-indigo-500/20" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] dark:bg-emerald-500/20" />
        <div className="absolute inset-0 opacity-[0.09] [background-image:linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] dark:opacity-[0.05] [background-size:44px_44px]" />
      </div>

      {/* Top-right theme toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease }}
        className="w-full max-w-md"
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center justify-center gap-3 group">
            <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-[var(--foreground)] to-[var(--muted-foreground)] text-[var(--background)] flex items-center justify-center font-extrabold shadow-lg shadow-black/20 group-hover:scale-[1.06] transition-transform duration-500">
              DL
              <span className="absolute -inset-1 rounded-2xl bg-emerald-500/15 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">Driver Leads</span>
          </a>

          <p className="mt-3 text-sm text-[var(--muted-foreground)]">Sign in to unlock driver contacts and downloads.</p>
        </div>

        {/* Card */}
        <div className="relative rounded-3xl border border-[var(--border)] bg-[var(--card)]/55 backdrop-blur-xl shadow-2xl shadow-black/10 overflow-hidden">
          {/* subtle top glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-[520px] bg-gradient-to-r from-indigo-500/15 via-emerald-500/15 to-indigo-500/15 blur-3xl" />

          <div className="relative p-8 sm:p-10">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">SignUp / Login</h1>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Carrier access only • Secure Supabase authentication
              </p>
            </div>

            <div className="space-y-5">
              <Field
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={setEmail}
                disabled={loading}
              />

              {/* Password with Eye Toggle */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
                  Password
                </label>

                <div className="relative">
                  <input
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)]/40 backdrop-blur
                               px-4 pr-12 py-3.5 text-sm outline-none transition-all
                               focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30
                               placeholder:text-[var(--muted-foreground)]/70"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl
                               border border-[var(--border)] bg-[var(--card)]/60 hover:bg-[var(--muted)]
                               transition-all flex items-center justify-center"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* Message */}
              {msg ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease }}
                  className={[
                    "rounded-2xl border p-3 text-sm font-medium",
                    isSuccess
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                      : "bg-red-500/10 text-red-300 border-red-500/20",
                  ].join(" ")}
                >
                  {msg}
                </motion.div>
              ) : null}

              {/* Buttons */}
              <div className="pt-2 space-y-3">
                <motion.button
                  onClick={signIn}
                  disabled={loading}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.7, ease }}
                  className="w-full group relative flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl font-extrabold
                             bg-[var(--foreground)] text-[var(--background)] shadow-xl shadow-[var(--foreground)]/15
                             disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  <span className="absolute -inset-1 rounded-[18px] bg-emerald-500/15 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {loading ? (
                    <span className="relative inline-flex items-center gap-3">
                      <span className="h-5 w-5 rounded-full border-2 border-[var(--background)]/40 border-t-[var(--background)] animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    <span className="relative inline-flex items-center gap-3">
                      Sign In
                      <span className="h-9 w-9 rounded-2xl bg-[var(--background)]/12 border border-[var(--background)]/15 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-500">
                        →
                      </span>
                    </span>
                  )}
                </motion.button>

                <motion.button
                  onClick={signUp}
                  disabled={loading}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.7, ease }}
                  className="w-full flex items-center justify-center py-3.5 px-4 rounded-2xl font-extrabold
                             border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)]
                             disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  Create Account
                </motion.button>

                <div className="pt-2 text-center text-xs text-[var(--muted-foreground)]">
                  By continuing, you agree to our{" "}
                  <a className="underline underline-offset-4 hover:text-[var(--foreground)]" href="#">
                    Terms
                  </a>{" "}
                  &{" "}
                  <a className="underline underline-offset-4 hover:text-[var(--foreground)]" href="#">
                    Privacy
                  </a>
                  .
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-[var(--muted-foreground)]">
          Protected by Supabase Authentication.
          <div className="mt-2">
            <a href="/" className="underline underline-offset-4 hover:text-[var(--foreground)]">
              Back to Home
            </a>
          </div>
        </div>
      </motion.div>
    </main>
  )
}

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
  disabled?: boolean
}) {
  return (
    <div>
      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
        {label}
      </label>
      <input
        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)]/40 backdrop-blur
                   px-4 py-3.5 text-sm outline-none transition-all
                   focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30
                   placeholder:text-[var(--muted-foreground)]/70"
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  )
}

function EyeIcon() {
  return (
    <svg
      className="h-4 w-4 text-[var(--muted-foreground)]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg
      className="h-4 w-4 text-[var(--muted-foreground)]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a3 3 0 004.2 4.2" />
      <path d="M9.5 5.2A10.6 10.6 0 0112 5c6.5 0 10 7 10 7a18.3 18.3 0 01-4.3 5.2" />
      <path d="M6.3 6.3A18.3 18.3 0 002 12s3.5 7 10 7c1 0 2-.2 3-.5" />
    </svg>
  )
}