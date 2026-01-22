"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client" // <--- CHANGED
import { useRouter } from "next/navigation"

export default function DashboardContent() {
  const router = useRouter()
  // Initialize the specific browser client
  const supabase = createClient()

  const [profile, setProfile] = useState<any>(null)
  const [privateData, setPrivateData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadProfile() {
      try {
        // 1. Get User
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          if (mounted) router.push("/login")
          return
        }

        // 2. Get Public Driver Data
        const { data: publicData, error } = await supabase
          .from("drivers")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (error || !publicData) {
          console.error("Profile load error:", error)
          if (mounted) setLoading(false)
          return
        }

        // 3. Get Private Data
        // (Note: Ideally this table should also be queried by user_id for security, 
        // but we keep your current logic of querying by driver_id)
        const { data: priv } = await supabase
          .from("driver_private")
          .select("*")
          .eq("driver_id", publicData.id)
          .single()
        
        if (mounted) {
          setPrivateData(priv)
          setProfile(publicData)
          setLoading(false)
        }
      } catch (err) {
        console.error("Unexpected error:", err)
        if (mounted) setLoading(false)
      }
    }

    loadProfile()
    
    return () => { mounted = false }
  }, [supabase, router])

  const updateStatus = async (newStatus: string) => {
    if (!profile) return
    
    // Optimistic Update (update UI instantly)
    setProfile({ ...profile, status: newStatus })
    
    const { error } = await supabase
      .from("drivers")
      .update({ status: newStatus })
      .eq("id", profile.id)

    if (error) {
      console.error("Error updating status:", error)
      // Revert if failed
      alert("Failed to update status")
    } else {
        router.refresh() // Keep server data in sync
    }
  }

  const handleSignOut = async () => {
      await supabase.auth.signOut()
      router.refresh()
      router.push("/")
  }

  if (loading) return (
    <div className="min-h-screen bg-[#070A12] text-white flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-white/50 text-sm font-medium">Loading Dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{profile?.first_name}</span>
            </h1>
            <p className="text-white/50 mt-1">Manage your availability and view offers.</p>
          </div>
          <button 
            onClick={handleSignOut} 
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-bold transition-colors"
          >
            Sign Out
          </button>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-6">Current Status</h2>
                
                <div className="flex flex-col sm:flex-row gap-4">
                   <button 
                     onClick={() => updateStatus("active")}
                     className={`flex-1 p-4 rounded-2xl border-2 text-left transition-all group relative overflow-hidden ${profile?.status === "active" ? "bg-emerald-500/20 border-emerald-500" : "bg-transparent border-white/10 hover:border-white/20"}`}
                   >
                     <div className="flex items-center gap-3 mb-1">
                       <div className={`w-3 h-3 rounded-full ${profile?.status === "active" ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" : "bg-white/20"}`} />
                       <span className={`font-bold ${profile?.status === "active" ? "text-emerald-400" : "text-white"}`}>Urgently Looking</span>
                     </div>
                     <p className="text-xs text-white/50 pl-6">I need a job ASAP.</p>
                   </button>

                   <button 
                     onClick={() => updateStatus("passive")}
                     className={`flex-1 p-4 rounded-2xl border-2 text-left transition-all group relative overflow-hidden ${profile?.status === "passive" ? "bg-indigo-500/20 border-indigo-500" : "bg-transparent border-white/10 hover:border-white/20"}`}
                   >
                     <div className="flex items-center gap-3 mb-1">
                       <div className={`w-3 h-3 rounded-full ${profile?.status === "passive" ? "bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]" : "bg-white/20"}`} />
                       <span className={`font-bold ${profile?.status === "passive" ? "text-indigo-400" : "text-white"}`}>Open to Offers</span>
                     </div>
                     <p className="text-xs text-white/50 pl-6">I have a job, but I'm listening.</p>
                   </button>
                </div>
              </div>
            </div>

            <div className="bg-[#0A0D16] border border-white/10 rounded-3xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Your Private Info</h2>
                <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase border border-emerald-500/20">
                  Encrypted
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">📞</div>
                    <div>
                      <div className="text-xs text-white/40 font-bold uppercase">Phone</div>
                      <div className="font-mono text-sm">{privateData?.phone || "N/A"}</div>
                    </div>
                  </div>
                  <div className="text-xs text-white/30 italic">Visible to unlocked recruiters</div>
                </div>

                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">✉️</div>
                    <div>
                      <div className="text-xs text-white/40 font-bold uppercase">Email</div>
                      <div className="font-mono text-sm">{privateData?.email || "N/A"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
             <div className="bg-gradient-to-b from-emerald-500 to-emerald-700 rounded-3xl p-1">
               <div className="bg-[#070A12] rounded-[22px] p-6 h-full text-center">
                 <div className="text-5xl font-extrabold text-white mb-2">0</div>
                 <div className="text-xs font-bold text-white/40 uppercase tracking-widest">Profile Views</div>
                 <div className="mt-4 pt-4 border-t border-white/10 text-[10px] text-white/30">
                   You appear in 45 searches today
                 </div>
               </div>
             </div>
             <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center">
                 <div className="text-3xl font-extrabold text-white mb-2">0</div>
                 <div className="text-xs font-bold text-white/40 uppercase tracking-widest">Offers Received</div>
             </div>
             <div className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20">
               <h3 className="font-bold text-indigo-300 mb-2">Pro Tip</h3>
               <p className="text-sm text-indigo-200/60 leading-relaxed">
                 Drivers with the "Urgently Looking" status get 3x more calls on weekends.
               </p>
             </div>
          </div>

        </div>
    </div>
  )
}