"use client"

// ⚠️ FIX: Force this page to render on the server/client dynamically, not statically.
export const dynamic = "force-dynamic"

import { useEffect, useState, Suspense } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

/* --- 1. Internal Component for Logic --- */
function DashboardContent() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [privateData, setPrivateData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      // 1. Get Current User
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      // 2. Fetch Public Profile
      const { data: publicData, error } = await supabase
        .from("drivers")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (error || !publicData) {
        // If they have an account but no profile, send them to join
        console.error("Profile load error:", error)
        setLoading(false)
        return
      }

      // 3. Fetch Private Data
      const { data: priv } = await supabase
        .from("driver_private")
        .select("*")
        .eq("driver_id", publicData.id)
        .single()
      
      setPrivateData(priv)
      setProfile(publicData)
      setLoading(false)
    }
    loadProfile()
  }, [router])

  const updateStatus = async (newStatus: string) => {
    if (!profile) return

    // 1. Optimistic UI update
    setProfile({ ...profile, status: newStatus })
    
    // 2. Update Database
    const { error } = await supabase
      .from("drivers")
      .update({ status: newStatus })
      .eq("id", profile.id)

    if (error) {
      console.error("Error updating status:", error)
      alert("Failed to update status")
    }
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
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{profile?.first_name}</span>
            </h1>
            <p className="text-white/50 mt-1">Manage your availability and view offers.</p>
          </div>
          <button 
            onClick={() => supabase.auth.signOut().then(() => router.push("/"))} 
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-bold transition-colors"
          >
            Sign Out
          </button>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Main Column: Status & Stats */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Status Card */}
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

            {/* Private Data Preview */}
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

          {/* Sidebar: Stats */}
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

/* --- 2. Default Export (Wrapper) --- */
export default function DriverDashboard() {
  return (
    <main className="min-h-screen bg-[#070A12] text-white p-6 md:p-12 font-sans selection:bg-emerald-500/30">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
             <div className="h-12 w-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          </div>
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </main>
  )
}