"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-white/5" />

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative h-10 w-10 flex items-center justify-center rounded-xl
                 bg-zinc-100 dark:bg-white/5
                 border border-zinc-200 dark:border-white/10
                 hover:border-emerald-500/50 transition-all duration-300"
      aria-label="Toggle Theme"
    >
      <div className="relative h-5 w-5">
        <motion.span
          animate={{ scale: isDark ? 0 : 1, rotate: isDark ? 90 : 0, opacity: isDark ? 0 : 1 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 flex items-center justify-center text-amber-500"
        >
          <Sun size={20} strokeWidth={2.5} />
        </motion.span>

        <motion.span
          animate={{ scale: isDark ? 1 : 0, rotate: isDark ? 0 : -90, opacity: isDark ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 flex items-center justify-center text-emerald-500"
        >
          <Moon size={18} strokeWidth={2.5} />
        </motion.span>
      </div>
    </button>
  )
}
