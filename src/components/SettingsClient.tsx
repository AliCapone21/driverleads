"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

const ease = [0.22, 1, 0.36, 1] as const

export default function SettingsClient() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!mounted) return

        if (user) {
          setEmail(user.email ?? "")
        } else {
          router.push("/login")
        }
      } catch (err) {
        console.error("Auth check failed", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    
    load()
    return () => { mounted = false }
  }, [supabase, router])

  const handleUpdate = async () => {
    if (!password || password !== confirmPassword) return

    setSaving(true)
    setMessage(null)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setMessage("Error: " + error.message)
    } else {
      setMessage("Success! Credentials updated.")
      setPassword("")
      setConfirmPassword("")
      router.refresh()
    }
    
    setSaving(false)
  }

  // Button is disabled if passwords don't match or fields are empty
  const canSubmit = password.length >= 6 && password === confirmPassword

  if (loading && !email) return (
    <div className="min-h-screen bg-[#070A12] text-white flex flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Authorizing Access...</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-[#070A12] text-white font-sans selection:bg-emerald-500/30 relative overflow-hidden flex items-center justify-center p-4">
      
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
        <div className="text-center mb-10">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-white text-black items-center justify-center font-black text-xl mb-4 shadow-2xl">DL</div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Protocol Settings</h1>
          <p className="text-zinc-500 font-medium tracking-tight italic">Carrier Credentials Management</p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl">
          <div className="space-y-6">
            
            {/* Email Field (Read Only) */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Identity uplink (Locked)</label>
              <div className="relative">
                <input 
                  disabled 
                  value={email} 
                  className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white/30 cursor-not-allowed"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-600"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
              </div>
            </div>

            {/* Password Update Field */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">New Password</label>
              <div className="relative group">
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all placeholder:text-zinc-800"
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

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Confirm Password</label>
              <div className="relative group">
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all placeholder:text-zinc-800"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight ml-1 italic">Passwords do not match</p>
              )}
            </div>

            {/* Feedback Message */}
            <AnimatePresence mode="wait">
              {message && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-wider text-center ${
                    message.includes("Error") 
                      ? "bg-red-500/10 text-red-400 border-red-500/20" 
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-4 pt-4">
              <button 
                onClick={handleUpdate}
                disabled={saving || !canSubmit}
                className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-20 shadow-xl shadow-white/5"
              >
                {saving ? "Syncing Credentials..." : "Commit Changes"}
              </button>
              
              <button 
                onClick={() => router.push("/drivers")} 
                className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 text-white font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all"
              >
                Abort and Return
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
            <Link href="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 hover:text-white transition-colors">
              Return to Hub
            </Link>
        </div>
      </motion.div>
    </main>
  )
}

/* --- Icons --- */

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