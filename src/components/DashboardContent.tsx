"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"

/* --- Types --- */
interface DriverProfile {
  id: string
  user_id: string
  first_name: string
  status: 'active' | 'passive' | string
}

interface PrivateData {
  phone: string | null
  email: string | null
}

export default function DashboardContent() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<DriverProfile | null>(null)
  const [privateData, setPrivateData] = useState<PrivateData | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/login")
        return
      }

      const [publicRes, privateRes] = await Promise.all([
        supabase.from("drivers").select("id, user_id, first_name, status").eq("user_id", user.id).single(),
        supabase.from("driver_private").select("phone, email").eq("email", user.email).maybeSingle()
      ])

      if (publicRes.error || !publicRes.data) {
        console.error("Profile not found:", publicRes.error)
        setLoading(false)
        return
      }

      setProfile(publicRes.data)
      setPrivateData(privateRes.data || null)
    } catch (err) {
      console.error("Unexpected dashboard error:", err)
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const updateStatus = async (newStatus: string) => {
    if (!profile) return
    const previousStatus = profile.status
    setProfile({ ...profile, status: newStatus })
    
    const { error } = await supabase
      .from("drivers")
      .update({ status: newStatus })
      .eq("id", profile.id)

    if (error) {
      setProfile({ ...profile, status: previousStatus })
      alert("Protocol update failed.")
    } else {
      router.refresh()
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push("/")
  }

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
            <div className="h-16 w-16 rounded-full border-2 border-emerald-500/20" />
            <div className="absolute inset-0 h-16 w-16 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 animate-pulse text-center">Decrypting Identity<br/><span className="text-white/20">Secure Link Established</span></p>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* TOP NAV BAR */}
        <div className="flex items-center justify-between mb-12">
            <Link href="/" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">
                <div className="h-10 w-10 rounded-2xl border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:bg-white/5 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </div>
                Return to Hub
            </Link>
            
            <button 
                onClick={handleSignOut} 
                className="px-6 py-2.5 rounded-full bg-red-500/5 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)]"
            >
                Disconnect
            </button>
        </div>

        {/* HERO SECTION */}
        <div className="relative mb-16">
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative z-10"
            >
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-px w-12 bg-emerald-500" />
                    <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em]">Driver Authorization Verified</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase">
                    {profile?.first_name || 'Driver'}<span className="text-emerald-500">.</span>
                </h1>
            </motion.div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            
            {/* STATUS PROTOCOL CARD */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-[40px] p-10 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                    <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-10">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Marketplace Protocol</h2>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-6">
                        <button 
                            onClick={() => updateStatus("active")}
                            className={`group relative p-8 rounded-[32px] border-2 transition-all text-left ${profile?.status === "active" ? "bg-emerald-500 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)]" : "bg-white/[0.03] border-white/5 hover:border-white/10"}`}
                        >
                            <span className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${profile?.status === "active" ? "text-black/60" : "text-emerald-500"}`}>Level 01</span>
                            <h3 className={`text-xl font-black uppercase mb-3 ${profile?.status === "active" ? "text-black" : "text-white"}`}>Urgently Looking</h3>
                            <p className={`text-xs leading-relaxed font-bold ${profile?.status === "active" ? "text-black/70" : "text-white/30"}`}>
                                Activates immediate recruitment priority. Your profile will be flagged "URGENT" to all carrier fleets.
                            </p>
                        </button>

                        <button 
                            onClick={() => updateStatus("passive")}
                            className={`group relative p-8 rounded-[32px] border-2 transition-all text-left ${profile?.status === "passive" ? "bg-indigo-500 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.2)]" : "bg-white/[0.03] border-white/5 hover:border-white/10"}`}
                        >
                            <span className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${profile?.status === "passive" ? "text-black/60" : "text-indigo-400"}`}>Level 02</span>
                            <h3 className={`text-xl font-black uppercase mb-3 ${profile?.status === "passive" ? "text-black" : "text-white"}`}>Open to Offers</h3>
                            <p className={`text-xs leading-relaxed font-bold ${profile?.status === "passive" ? "text-black/70" : "text-white/30"}`}>
                                Maintain visibility but remove urgency flags. Ideal for drivers looking for a specific high-pay upgrade.
                            </p>
                        </button>
                    </div>
                </div>
            </div>

            {/* VAULT SECTION */}
            <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-zinc-900/80 border border-white/5 p-8 rounded-[32px] flex items-center gap-6 group hover:border-white/20 transition-all">
                    <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-emerald-500 shadow-inner">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Secure Phone</div>
                        <div className="font-mono text-sm text-white font-bold">{privateData?.phone || "PENDING_UPLINK"}</div>
                    </div>
                </div>
                <div className="bg-zinc-900/80 border border-white/5 p-8 rounded-[32px] flex items-center gap-6 group hover:border-white/20 transition-all">
                    <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-emerald-500 shadow-inner">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Encrypted Email</div>
                        <div className="font-mono text-sm text-white font-bold truncate max-w-[140px]">{privateData?.email || "PENDING_UPLINK"}</div>
                    </div>
                </div>
            </div>
          </div>

          {/* SIDEBAR ANALYTICS */}
          <div className="lg:col-span-4 space-y-6">
              <div className="bg-emerald-500 p-8 rounded-[40px] shadow-2xl shadow-emerald-500/10 flex flex-col justify-between h-[280px] relative overflow-hidden group">
                <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-white/20 rounded-full blur-3xl" />
                <div>
                    <div className="flex items-center gap-2 mb-8">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        <h4 className="text-black font-black uppercase text-[10px] tracking-[0.2em]">Intelligence Data</h4>
                    </div>
                    <div className="text-7xl font-black text-black tracking-tighter">0</div>
                    <div className="text-black font-bold uppercase text-[10px] tracking-widest mt-2">Marketplace Impressions</div>
                </div>
                <div className="text-[9px] font-black uppercase text-black/40 tracking-tighter">Data refreshes every 60 seconds</div>
              </div>

              <div className="bg-zinc-900 border border-white/5 p-8 rounded-[40px]">
                 <div className="flex items-center gap-2 mb-6">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>
                    <h4 className="text-white/30 font-black uppercase text-[10px] tracking-[0.2em]">Security Tip</h4>
                 </div>
                 <p className="text-xs font-bold text-white/70 leading-relaxed italic">
                    "Switching your status to <span className="text-emerald-500 underline uppercase">Urgently Looking</span> increases your profile visibility score by 350%."
                 </p>
              </div>
          </div>
        </div>
    </div>
  )
}