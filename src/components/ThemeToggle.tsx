"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5" />

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 group"
      aria-label="Toggle System Protocol"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 rounded-xl bg-emerald-500/0 group-hover:bg-emerald-500/5 blur-md transition-all" />

      <div className="relative overflow-hidden h-5 w-5">
        {/* Sun Icon */}
        <motion.span
          initial={false}
          animate={{ y: isDark ? 20 : 0, opacity: isDark ? 0 : 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center text-amber-500"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
          </svg>
        </motion.span>

        {/* Moon Icon */}
        <motion.span
          initial={false}
          animate={{ y: isDark ? 0 : -20, opacity: isDark ? 1 : 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center text-emerald-500"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
          </svg>
        </motion.span>
      </div>

      {/* Industrial Dot Indicator */}
      <div className={`absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full border border-[#070A12] transition-colors duration-500 ${isDark ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-amber-500'}`} />
    </button>
  )
}