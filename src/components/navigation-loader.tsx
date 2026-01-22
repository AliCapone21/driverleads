"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

type NavLoaderCtx = {
  isNavigating: boolean
  start: () => void
  stop: () => void
}

const Ctx = createContext<NavLoaderCtx | null>(null)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isNavigating, setIsNavigating] = useState(false)

  const value = useMemo(
    () => ({
      isNavigating,
      start: () => setIsNavigating(true),
      stop: () => setIsNavigating(false),
    }),
    [isNavigating]
  )

  // Auto-stop loader when URL changes (navigation complete)
  useEffect(() => {
    setIsNavigating(false)
  }, [pathname, searchParams])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useNavigationLoader() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useNavigationLoader must be used inside <NavigationProvider />")
  return ctx
}

export function RouteLoader() {
  const { isNavigating } = useNavigationLoader()

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] pointer-events-none"
        >
          {/* Top Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] overflow-hidden bg-transparent">
            <motion.div
              className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Optional: Spinner (Removed for cleaner look, progress bar is enough usually) */}
          {/* If you really want the spinner, uncomment below */}
          {/* <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          </div> 
          */}
        </motion.div>
      )}
    </AnimatePresence>
  )
}