// src/app/not-found.tsx

import Link from "next/link"
import { Metadata } from "next"

// ⚠️ Keeps the build safe if your RootLayout relies on request-time data (cookies/headers)
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "404: Page Not Found - Driver Leads",
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)] text-[var(--foreground)] p-4 text-center relative overflow-hidden font-sans">
      
      {/* Background Ambience (Matches Home/Join pages) */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] dark:bg-indigo-500/20" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] dark:bg-emerald-500/20" />
        <div className="absolute inset-0 opacity-[0.09] [background-image:linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] dark:opacity-[0.05] [background-size:44px_44px]" />
      </div>

      <div className="relative z-10">
        <h1 className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-indigo-500 mb-2">
          404
        </h1>
        <h2 className="text-2xl font-bold mt-4">Page Not Found</h2>
        <p className="mt-4 text-[var(--muted-foreground)] max-w-md mx-auto leading-relaxed">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 mt-8 px-8 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-xl font-bold hover:opacity-90 hover:scale-105 transition-all shadow-xl shadow-black/10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return Home
        </Link>
      </div>
    </div>
  )
}