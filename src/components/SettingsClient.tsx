"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client" // <--- CHANGED
import { useRouter } from "next/navigation"

export default function SettingsClient() {
  const router = useRouter()
  // Initialize the browser-safe client
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(true) 
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        // With middleware in place, getUser() is now fast and reliable
        const { data: { user }, error } = await supabase.auth.getUser()

        if (!mounted) return

        if (user) {
          setEmail(user.email ?? "")
        } else {
          // If the server/middleware missed it, the client catches it here
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
    setLoading(true)
    setMessage(null)

    const updates: any = {}
    if (password) updates.password = password
    
    if (Object.keys(updates).length === 0) {
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser(updates)

    if (error) {
      setMessage("Error: " + error.message)
    } else {
      setMessage("Success! Credentials updated.")
      setPassword("") // Clear password field on success
      router.refresh() // Sync server state
    }
    
    setLoading(false)
  }

  // Show a loading spinner while we fetch the email
  if (loading && !email) return (
    <div className="min-h-screen bg-[#070A12] text-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
           <div className="h-10 w-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
           <p className="text-white/50 text-xs">Verifying Access...</p>
        </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-[#070A12] text-white p-6 md:p-12 font-sans flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">Recruiter Settings</h1>
          <p className="text-white/50 mt-2">Update your login credentials.</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-white/40 uppercase mb-1">Email</label>
            <input 
              disabled 
              value={email} 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/50 cursor-not-allowed"
            />
            <p className="text-[10px] text-white/30 mt-1">Email cannot be changed directly for security.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/40 uppercase mb-1">New Password</label>
            <input 
              type="password"
              placeholder="Leave empty to keep current"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-emerald-500/50 outline-none transition-all"
            />
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-sm text-center ${message.includes("Error") ? "bg-red-500/10 text-red-200" : "bg-emerald-500/10 text-emerald-200"}`}>
              {message}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleUpdate}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition-colors"
            >
              {loading ? "Updating..." : "Save Changes"}
            </button>
            <button 
              onClick={() => router.push("/drivers")} 
              className="w-full py-3 rounded-xl bg-transparent border border-white/10 text-white font-bold hover:bg-white/5 transition-colors"
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}