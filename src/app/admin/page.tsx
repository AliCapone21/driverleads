import { Suspense } from "react"
import AdminDashboard from "@/components/AdminDashboard"
import { createClient } from "@/utils/supabase/server" // <--- NEW
import { redirect } from "next/navigation" // <--- NEW

// Force dynamic server rendering
export const dynamic = "force-dynamic"

export default async function AdminPage() {
    // 🔒 SECURITY STEP: Check if user is logged in on the server
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect("/login")
    }

    // 🔒 OPTIONAL: Restrict to specific email only (Uncomment to enable)
    // if (user.email !== "your-email@example.com") {
    //   redirect("/") // Kick non-admins back to home
    // }

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-gray-900 relative font-sans selection:bg-black selection:text-white pb-20">
            {/* Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-[120px] opacity-60" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[100px] opacity-60" />
            </div>

            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gray-950 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-gray-200">DL</div>
                        <h1 className="font-bold text-lg tracking-tight text-gray-900">Admin Console</h1>
                    </div>
                    <a href="/drivers" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 group">
                        Exit to App 
                        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </a>
                </div>
            </header>

            <Suspense fallback={
                <div className="min-h-[500px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-medium text-gray-500">Loading Dashboard...</p>
                    </div>
                </div>
            }>
                <AdminDashboard />
            </Suspense>
        </main>
    )
}