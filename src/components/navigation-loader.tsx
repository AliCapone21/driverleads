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

  // When the URL changes, stop the loader
  useEffect(() => {
    setIsNavigating(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.toString()])

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
          className="fixed inset-0 z-[9999] pointer-events-none"
        >
          {/* top progress bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] overflow-hidden">
            <motion.div
              className="h-full bg-[var(--foreground)]/80"
              initial={{ x: "-40%", width: "40%" }}
              animate={{ x: "140%" }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* subtle blur overlay */}
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />

          {/* center spinner */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full border-2 border-white/25 border-t-white/80 animate-spin" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
